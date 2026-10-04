"""
Inference pipeline for the AI model that reconstructs ocean vertical
temperature profiles.

Consumes the pickle produced by `prepare_input_v2.py` (keys: temporal,
static, depth_grid, ...), applies the scalers saved at training time,
rebuilds the model, loads the best weights and produces a predicted
profile on the grid [5, 10, ..., 200] m together with ensemble
quantiles.

CLI usage:
    python infer.py --input model_input.pkl \
                    --scalers saved_model/scalers.pkl \
                    --weights saved_model/model_best.weights.h5 \
                    --out inference_output.pkl

Output (pickle):
    {
      'profile_mean':   np.ndarray (40,)  float32,    # mean across 100 members
      'profile_std':    np.ndarray (40,)  float32,    # ensemble uncertainty
      'profile_p05':    np.ndarray (40,)  float32,
      'profile_p50':    np.ndarray (40,)  float32,
      'profile_p95':    np.ndarray (40,)  float32,
      'ensemble':       np.ndarray (40, 100) float32, # all members
      'depth_grid':     np.ndarray (40,)  float32,
      'glorys_profile': np.ndarray (40,) | None,
      'argo_profile':   np.ndarray (40,) | None,
      'argo_meta':      dict | None,
      'glorys_meta':    dict | None,
      'query_lat', 'query_lon', 'query_t0',
    }
"""

from __future__ import annotations

import argparse
import os
import pickle
import sys
from pathlib import Path

import numpy as np

# IMPORTANT: must be set before importing tensorflow to align the Keras

os.environ.setdefault('TF_USE_LEGACY_KERAS', '1')
os.environ.setdefault('TF_CPP_MIN_LOG_LEVEL', '2')   # silence TF INFO/WARNING

# VARIABLE_ORDER is the backbone of the scaler<->feature alignment.
# Import it from the preparation pipeline so any change to the feature
# order stays synchronized between training and inference.
from prepare_input_v2 import VARIABLE_ORDER


# ----------------------------------------------------------------------
# Module-level defaults: used both by function signatures and by the
# CLI. Editing them here updates the whole package coherently.
# ----------------------------------------------------------------------

DEFAULT_INPUT = 'model_input.pkl'
DEFAULT_SCALERS = 'utils/saved_model/scalers.pkl'
DEFAULT_WEIGHTS = 'utils/saved_model/model.weights.h5'
DEFAULT_SCRIPTS_DIR = 'utils'
DEFAULT_OUTPUT = 'inference_output.pkl'


# ----------------------------------------------------------------------
# Data loading
# ----------------------------------------------------------------------

def load_payload(path: str | Path) -> dict:
    with open(path, 'rb') as f:
        return pickle.load(f)


def load_scalers(path: str | Path) -> dict:
    """Load `{'X': [30 StandardScaler], 'Y': StandardScaler}` saved
    by train_new.py."""
    with open(path, 'rb') as f:
        scalers = pickle.load(f)
    if 'X' not in scalers or 'Y' not in scalers:
        raise KeyError(f"scalers.pkl must contain 'X' and 'Y'; found: "
                       f"{list(scalers.keys())}")
    if len(scalers['X']) != len(VARIABLE_ORDER):
        raise ValueError(
            f"scaler_X has {len(scalers['X'])} elements but VARIABLE_ORDER "
            f"has {len(VARIABLE_ORDER)}: training and prepare_input are "
            "not aligned."
        )
    return scalers


# ----------------------------------------------------------------------
# Standardization: scaler_X[i] corresponds to VARIABLE_ORDER[i].
# Both temporal and static must be mapped to their original index before
# applying the transform.
# ----------------------------------------------------------------------

def standardize_features(payload: dict, scalers: dict
                         ) -> tuple[np.ndarray, np.ndarray]:
    """Return (temporal_std (25,25), static_std (5,)) standardized."""
    temporal = np.asarray(payload['temporal'], dtype=np.float32).copy()
    static = np.asarray(payload['static'], dtype=np.float32).copy()
    if temporal.shape != (25, 25):
        raise ValueError(f"temporal shape expected (25,25), got {temporal.shape}")
    if static.shape != (5,):
        raise ValueError(f"static shape expected (5,), got {static.shape}")

    era5_order = payload['era5_feature_order']     # 25 short names
    static_order = payload['static_feature_order']  # 5 names
    scaler_X = scalers['X']

    # Index of each feature in VARIABLE_ORDER (== index in scaler_X).
    era5_idx = [VARIABLE_ORDER.index(v) for v in era5_order]
    static_idx = [VARIABLE_ORDER.index(v) for v in static_order]

    for j, idx in enumerate(era5_idx):
        col = temporal[:, j].reshape(-1, 1)
        temporal[:, j] = scaler_X[idx].transform(col).ravel()

    for k, idx in enumerate(static_idx):
        static[k] = float(scaler_X[idx].transform([[static[k]]])[0, 0])

    if not np.all(np.isfinite(temporal)):
        raise ValueError("temporal contains NaN/Inf after scaling: "
                         "check the ERA5 extraction.")
    if not np.all(np.isfinite(static)):
        raise ValueError("static contains NaN/Inf after scaling.")

    return temporal, static


# ----------------------------------------------------------------------
# Model: import from the training package without interfering with CWD
# ----------------------------------------------------------------------

_MODEL_CACHE = None


def build_model(weights_path: str | Path = DEFAULT_WEIGHTS,
                scripts_dir: str | Path = DEFAULT_SCRIPTS_DIR):
    """Rebuild the architecture and load the best weights.

    Singleton cache: useful when infer() is called in batch from the
    same process (avoids rebuilding and reloading the weights).
    """
    global _MODEL_CACHE
    if _MODEL_CACHE is not None:
        return _MODEL_CACHE

    scripts_dir = str(Path(scripts_dir).resolve())
    if scripts_dir not in sys.path:
        sys.path.insert(0, scripts_dir)

    # NB: model.py runs `model.summary()` at the top level on
    # every import. We accept it to avoid touching the training file.
    import model as net  # type: ignore

    model = net.create_temperature_profile_model(
        time_series_shape=(25, 25),
        static_features_shape=(5,),
        n_levels=40,
        n_members=100,
    )
    model.load_weights(str(weights_path))
    _MODEL_CACHE = model
    return model


# ----------------------------------------------------------------------
# Inference
# ----------------------------------------------------------------------

def predict_profile(model, temporal_std: np.ndarray, static_std: np.ndarray,
                    scaler_Y) -> dict:
    """Return a dict with ensemble statistics in physical scale (degC)."""
    # batch dim
    X = temporal_std[None, ...]      # (1, 25, 25)
    S = static_std[None, ...]        # (1, 5)

    # (1, 40, 100) in standardized scale
    pred_std = model.predict([X, S], verbose=0)

    # Inverse-transform applied to ALL members (linear):
    # x_orig = mean_ + scale_ * x_std. The ensemble spread stays
    # correctly proportional to the original scale.
    flat = pred_std.reshape(-1, 1)
    pred_orig = scaler_Y.inverse_transform(flat).reshape(pred_std.shape)
    ens = pred_orig[0].astype(np.float32)   # (40, 100)


    return {
        'ensemble':     ens,
        'profile_mean': ens.mean(axis=-1).astype(np.float32),
        'profile_std':  ens.std(axis=-1).astype(np.float32),
        'profile_p05':  np.quantile(ens, 0.05, axis=-1).astype(np.float32),
        'profile_p50':  np.quantile(ens, 0.50, axis=-1).astype(np.float32),
        'profile_p95':  np.quantile(ens, 0.95, axis=-1).astype(np.float32),
    }


# ----------------------------------------------------------------------
# End-to-end pipeline
# ----------------------------------------------------------------------

def infer(input_path: str | Path = DEFAULT_INPUT,
          scalers_path: str | Path = DEFAULT_SCALERS,
          weights_path: str | Path = DEFAULT_WEIGHTS,
          output_path: str | Path | None = DEFAULT_OUTPUT,
          scripts_dir: str | Path = DEFAULT_SCRIPTS_DIR) -> dict:
    payload = load_payload(input_path)
    scalers = load_scalers(scalers_path)

    temporal_std, static_std = standardize_features(payload, scalers)

    model = build_model(weights_path, scripts_dir=scripts_dir)
    pred = predict_profile(model, temporal_std, static_std, scalers['Y'])

    out = {
        **pred,
        'depth_grid':    payload['depth_grid'],
        'query_lat':     payload.get('query_lat'),
        'query_lon':     payload.get('query_lon'),
        'query_t0':      payload.get('query_t0'),
        # passthrough of the ground truth if present (useful for evaluation)
        'glorys_profile': payload.get('glorys_profile'),
        'glorys_meta':    payload.get('glorys_meta'),
        'argo_profile':   payload.get('argo_profile'),
        'argo_meta':      payload.get('argo_meta'),
        # traceability
        'source_input':   str(input_path),
        'source_scalers': str(scalers_path),
        'source_weights': str(weights_path),
    }

    if output_path is not None:
        with open(output_path, 'wb') as f:
            pickle.dump(out, f)

    return out


# ----------------------------------------------------------------------
# CLI
# ----------------------------------------------------------------------

if __name__ == '__main__':
    p = argparse.ArgumentParser(
        description="Run inference of the ocean-profile model on the "
                    "pickle produced by prepare_input_v2.py.",
        formatter_class=argparse.ArgumentDefaultsHelpFormatter)
    p.add_argument('--input', default=DEFAULT_INPUT,
                   help='pickle produced by prepare_input_v2.py')
    p.add_argument('--scalers', default=DEFAULT_SCALERS,
                   help='pickle with {X: [StandardScaler]*30, Y: StandardScaler}')
    p.add_argument('--weights', default=DEFAULT_WEIGHTS,
                   help='best model weights (.h5)')
    p.add_argument('--scripts-dir', default=DEFAULT_SCRIPTS_DIR,
                   help='folder containing model_VED_LSTM.py')
    p.add_argument('--out', default=DEFAULT_OUTPUT,
                   help='output pickle with the predicted profile')
    args = p.parse_args()

    res = infer(args.input, args.scalers, args.weights, args.out,
                scripts_dir=args.scripts_dir)

    depths = res['depth_grid']
    mean = res['profile_mean']
    std = res['profile_std']
    print(f"\n=== Predicted profile at "
          f"(lat={res['query_lat']}, lon={res['query_lon']}, "
          f"t={res['query_t0']}) ===")
    print(f"{'depth (m)':>10} {'mean (C)':>10} {'std (C)':>9} "
          f"{'p10':>8} {'p90':>8}")
    print(res['argo_profile'])
    print(res['glorys_profile'])
    for d, m_, s_, p05, p95 in zip(
            depths, mean, std, res['profile_p05'], res['profile_p95']):
        print(f"{d:10.1f} {m_:10.3f} {s_:9.3f} {p05:8.3f} {p95:8.3f}")

    if res.get('argo_profile') is not None:
        nmse = float(np.nanmean(
            (res['profile_mean'] - res['argo_profile']) ** 2)/np.nanmean(res['argo_profile']**2))
        nmse = round(100*nmse,2)
        print(f"\nNMSE AI vs Argo: {nmse:.3f} %")
    if res.get('glorys_profile') is not None:
        nmse = float(np.nanmean(
            (res['glorys_profile'] - res['argo_profile']) ** 2)/np.nanmean(res['argo_profile']**2))
        nmse = round(100*nmse,2)
        print(f"NMSE GLORYS vs Argo:   {nmse:.3f} %")

    print(f"\nSaved: {args.out}")
    
    import matplotlib.pyplot as plt
    payload = load_payload(args.input)
    plt.figure()
    if res.get('glorys_profile') is not None:
       plt.plot(res['glorys_profile'],-depths,color = 'blue',marker= None, label = 'GLORYS12V1',ms=2.5)
    
    if res.get('profile_mean') is not None:
       p05 = res['profile_p05']
       p95 = res['profile_p95']
       plt.plot(res['profile_mean'],-depths,color = 'red',marker= None, label = 'AI', ms = 2.5)
       plt.fill_betweenx(-depths, p05, p95, where=p95 >= p05, facecolor='red',alpha = 0.35)
       plt.fill_betweenx(-depths, p05, p95, where= p95 <= p05, facecolor='red',alpha = 0.35)
    if res.get('argo_profile') is not None:
       plt.plot(res['argo_profile'],-depths,color = 'black',marker= None, label = 'Argo Obeservation', linestyle = '--',ms = 2.5)

    plt.title("Predicted Subsurface Temperature Profile")
    plt.ylim(-200.5,0.5)
    plt.ylabel('Depth [m]')
    plt.xlabel('Temperature [°C]')
    plt.legend()
    plt.show()


