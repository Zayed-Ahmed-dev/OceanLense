# Ocean temperature profile reconstruction — pipeline

End-to-end pipeline that, given `(lat, lon, timestamp)`, reconstructs
the ocean vertical temperature profile (5–200 m, 40 levels) using a
trained neural network (BiLSTM + MultiHeadAttention + Conv1D head with
100 ensemble members trained on CRPS loss).

The pipeline is split in two stages:

1. **`prepare_input_v2.py`** — downloads ERA5 atmospheric drivers and
   optional ground-truth profiles (GLORYS12V1 reanalysis, closest Argo
   float) for the target point/time. Produces a pickle.
2. **`infer.py`** — loads the pickle, applies the saved scalers, runs
   the trained model and produces the predicted profile with ensemble
   uncertainty.

```
(lat, lon, time) ─► prepare_input_v2.py ─► model_input.pkl ─► infer.py ─► inference_output.pkl
                       │                                            │
                       ├─ ERA5 (CDS or GCS)                         ├─ scalers (utils/saved_model/)
                       ├─ GLORYS12V1 (CMEMS, optional)              ├─ best weights (utils/saved_model/)
                       └─ Argo (argopy, optional)                   └─ model arch (utils/model.py)
```

For the training procedure (how `Matrici_withStories.pkl` is built and
how `utils/train_new.py` consumes it), see [TRAINING.md](TRAINING.md).

## Repository layout

```
prepare_input_v2.py        input pipeline (ERA5 + GLORYS + Argo)
infer.py                   inference pipeline (scalers + model + predict)
prepare_input.py           legacy v1 — kept as reference, do not use
utils/
  ├─ model.py     model architecture
  ├─ loss.py               CRPS loss (training only)
  ├─ train_new.py          training script (consumes Matrici_withStories.pkl)
  └─ saved_model/
       ├─ scalers.pkl
       └─ model.weights.h5
```

## Installation

```bash
pip install numpy scipy xarray zarr gcsfs cdsapi netCDF4 \
            copernicusmarine argopy tensorflow scikit-learn matplotlib
```

On HPC/clusters conda-forge is more reliable for `argopy` and
`netCDF4`:

```bash
conda install -c conda-forge argopy netCDF4
```

### One-time configuration

| Service | Needed for | Setup |
|---|---|---|
| **Climate Data Store** | `--source cds` (ERA5) | Register on [cds.climate.copernicus.eu](https://cds.climate.copernicus.eu), accept the *ERA5-single-levels* Terms of Use, write `~/.cdsapirc` with `url:` and `key:` |
| **Copernicus Marine** | `--glorys` | `copernicusmarine login` once (saves credentials), or pass username/password to `cm.login(...)` |
| **Argo** | `--argo` | None — anonymous access via `argopy` |

## Stage 1 — prepare the input

### CLI

```bash
python prepare_input_v2.py \
    --lat 16.35 --lon -65.46 \
    --timestamp 2023-03-22T23:00:00 \
    --source cds \
    --glorys --argo \
    --out model_input.pkl
```

| Flag | Default | Description |
|---|---|---|
| `--lat` | required | degrees, range `[-90, 90]` |
| `--lon` | required | degrees, range `[-180, 180]` |
| `--timestamp` | required | ISO 8601, e.g. `2022-06-15T12:00:00` |
| `--out` | `model_input.pkl` | output pickle path |
| `--source` | `gcs` | ERA5 source: `gcs` (ARCO Zarr) or `cds` (CDS API) |
| `--glorys` | off | also extract the GLORYS12V1 profile |
| `--argo` | off | also search for the closest Argo profile |

### Python

```python
from prepare_input_v2 import prepare_input

payload = prepare_input(
    lat=16.35, lon=-65.46,
    timestamp="2023-03-22T23:00:00",
    output_path="model_input.pkl",
    source="cds",
    include_glorys=True,
    include_argo=True,
)
```

### Output pickle

```python
{
  'temporal':            np.ndarray (25, 25)  float32,    # ERA5 time-series
  'static':              np.ndarray (5,)       float32,    # static features
  'depth_grid':          np.ndarray (40,)      float32,    # 5..200 m, step 5 m
  'glorys_profile':      np.ndarray (40,) | None,
  'glorys_meta':         dict | None,
  'argo_profile':        np.ndarray (40,) | None,
  'argo_meta':           dict | None,
  'era5_feature_order':  list[str],            # 25 short names
  'static_feature_order':list[str],            # 5 names
  'timestamps_utc':      list[str],            # 25 ISO timestamps
  'query_lat', 'query_lon',                    # ERA5 grid-point coords
  'query_lat_input', 'query_lon_input',        # raw user request
  'query_t0',
  'data_source_era5':    str,
}
```

- **`temporal`** `(25, 25)` — 25 timesteps `[t0, t0-6h, ..., t0-144h]`
  by 25 ERA5 features (order in `era5_feature_order`).
- **`static`** `(5,)` — `[latitude, cosm, sinm, cos_lon, sin_lon]`. The
  lat/lon used here are those of the **ERA5 nearest grid point**, not
  the user request.
- **`*_profile`** — temperature linearly interpolated on the common
  grid `[5, 10, …, 200]` m (40 levels). `None` if extraction fails.

### ERA5 source — `gcs` vs `cds`

| Source | Volume | Typical time | When to use |
|---|---|---|---|
| `gcs` (Zarr) | ~10–20 GB | minutes | many profiles in the same area/period |
| `cds` | a few MB | 30–180 s (CDS queue) | sparse profiles in space/time |

For a single profile, `cds` is almost always faster. The pipeline:
1. asks CDS for a ±0.25° box only,
2. requests only the days/hours strictly needed,
3. auto-renames CDS-Beta `avg_*` fields to GRIB short names,
4. handles both single NetCDF and ZIP-of-NetCDFs.

### Argo — search strategy

Argopy is called in cascade across backends (`argovis` → `erddap` →
`gdac`) to mitigate single-server timeouts. The search box is expanded
in stages:

| Attempt | Scale | Box (default `lat_box=lon_box=0.5°, time_window=1d`) |
|---|---|---|
| 1 (tight) | 0.1× | ±0.05°, ±2.4 h — "exact" profile at the query point |
| 2 (default) | 1.0× | ±0.5°, ±1 day |
| 3 (extended) | 4.0× | ±2°, ±4 days — open ocean / low Argo density |

Inside the chosen box, the profile is selected minimizing the
space-time score `score = |Δdays| + Δdegrees`. Prefers `*_ADJUSTED`
fields (delayed-mode). QC: rejected if >20% NaN in 5–200 m.

If no profile is found, the pipeline saves the pickle with
`argo_profile=None` and `argo_meta['reason']`. **It does not raise.**
GLORYS extraction is isolated the same way (so a point on land is OK).

## Stage 2 — inference

### CLI

```bash
python infer.py \
    --input model_input.pkl \
    --scalers utils/saved_model/scalers.pkl \
    --weights utils/saved_model/model.weights.h5 \
    --out inference_output.pkl
```

All arguments are optional. With the layout shipped in this repo, you
can simply run:

```bash
python infer.py
```

| Flag | Default | Description |
|---|---|---|
| `--input` | `model_input.pkl` | pickle from `prepare_input_v2.py` |
| `--scalers` | `utils/saved_model/scalers.pkl` | trained `{X: [30 StandardScaler], Y: StandardScaler}` |
| `--weights` | `utils/saved_model/model.weights.h5` | best-weights checkpoint |
| `--scripts-dir` | `utils` | folder containing `model_VED_LSTM.py` |
| `--out` | `inference_output.pkl` | output pickle |

The CLI prints the depth-by-depth predicted profile (`mean ± std`,
`p05`, `p95`), and if `argo_profile` / `glorys_profile` are present in
the input pickle, the NMSE of the AI prediction vs Argo and of GLORYS
vs Argo. It also opens a matplotlib window comparing AI / GLORYS /
Argo.

### Python

```python
from infer import infer

res = infer(
    input_path="model_input.pkl",
    scalers_path="utils/saved_model/scalers.pkl",
    weights_path="utils/saved_model/model.weights.h5",
    output_path="inference_output.pkl",
)
print(res['profile_mean'].shape)   # (40,)
print(res['ensemble'].shape)       # (40, 100)
```

### Output pickle

```python
{
  'profile_mean':   np.ndarray (40,)    float32,    # ensemble mean (degC)
  'profile_std':    np.ndarray (40,)    float32,    # ensemble std (degC)
  'profile_p05':    np.ndarray (40,)    float32,
  'profile_p50':    np.ndarray (40,)    float32,
  'profile_p95':    np.ndarray (40,)    float32,
  'ensemble':       np.ndarray (40,100) float32,    # all members
  'depth_grid':     np.ndarray (40,)    float32,
  'glorys_profile': np.ndarray (40,) | None,
  'argo_profile':   np.ndarray (40,) | None,
  'glorys_meta', 'argo_meta',
  'query_lat', 'query_lon', 'query_t0',
  'source_input', 'source_scalers', 'source_weights',
}
```

## End-to-end example

Test point with reliable Argo coverage in 2022 (central North
Atlantic):

```bash
# 1. prepare input
python prepare_input_v2.py \
    --lat 35.0 --lon -40.0 \
    --timestamp 2022-06-15T12:00:00 \
    --source cds --glorys --argo

# 2. run inference
python infer.py
```

Other reliable test points:

| Region | lat | lon | timestamp |
|---|---|---|---|
| North Atlantic (central) | 35.0 | -40.0 | 2022-06-15T12:00:00 |
| North Atlantic (east) | 47.0 | -25.0 | 2022-06-15T12:00:00 |
| North Pacific subtropical gyre | 20.0 | -150.0 | 2022-06-15T12:00:00 |

## Known caveats

1. **`VARIABLE_ORDER` is a critical invariant** — the order of the 30
   features in `prepare_input_v2.VARIABLE_ORDER` MUST match the order
   used to fit the scalers. `infer.py` checks it via length but not
   identity: changing names in the order list silently corrupts
   inference.
2. **Lon encoding** — `compute_static` shifts `lon` by +180° before
   `sin/cos`. This compensates a double transformation applied when
   the training dataset was built (`((lon+180) % 360) - 180` then
   `lon - 180`). Removing the shift inverts the sign of `sin_lon` /
   `cos_lon` and the model goes off-target. Do not change unless the
   training dataset is regenerated.
3. **Timestep convention** — `build_timestamps(t0)` returns
   `[t0, t0-6h, t0-12h, ..., t0-144h]`. Earlier paper drafts and the
   v1 README describe this as `[t-1h, t-7h, ...]` — that is a
   transcription error: the codebase and the trained model use the
   `t0`-anchored version.
4. **Pressure → depth for Argo** — uses `depth ≈ pres` (1 dbar ≈ 1 m).
   For higher accuracy install `gsw` and re-enable the
   `gsw.z_from_p(pres, lat)` branch in `extract_argo_profile`.
5. **`gcs` source is slow for single profiles** — the ARCO-ERA5 Zarr
   has global chunks; downloading one point still pulls many GB. Use
   `--source cds` for sparse profiles.
6. **CDS-Beta vs CDS-legacy** — the code uses CDS-Beta syntax
   (`data_format`, `download_format`). Older `cdsapi` versions may
   require `format` instead of `data_format`.
7. **Ensemble collapse risk** — the 100 "members" are 100 deterministic
   output channels. CRPS implicitly encourages diversity, but if you
   notice `profile_std → 0` everywhere, the ensemble has collapsed and
   the predictive distribution is degenerate.

## Programmatic helpers (advanced)

The three input extractions are independent and can be called
directly:

```python
from datetime import datetime
from prepare_input_v2 import (
    open_era5, build_timestamps,
    extract_temporal, extract_temporal_cds,
    extract_glorys_profile, extract_argo_profile,
)

t0 = datetime(2022, 6, 15, 12, 0)
timestamps = build_timestamps(t0)

# ERA5 via CDS — returns (arr, lat_era5, lon_era5)
arr, lat_e, lon_e = extract_temporal_cds(35.0, -40.0, timestamps)

# GLORYS — returns (profile, meta) or (None, meta_with_reason)
glorys, glorys_meta = extract_glorys_profile(35.0, -40.0, t0)

# Argo — returns (profile, meta) or (None, meta_with_reason)
argo, argo_meta = extract_argo_profile(35.0, -40.0, t0)
```

The inference helpers are also exposed:

```python
from infer import (
    load_payload, load_scalers,
    standardize_features, build_model, predict_profile,
)
```
