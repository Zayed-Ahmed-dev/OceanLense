# Training pipeline — pseudocode

End-to-end description of how the model is trained, from raw Argo
profiles to a saved checkpoint. Two phases:

1. **Dataset creation** — pair atmospheric drivers (ERA5) with observed
   temperature profiles (Argo, target) and producing a pickle file '_.pkl'.
2. **Training** — load the dataset, standardize features, fit the model
   on CRPS loss, save scalers and best weights.

The runnable training script must be in `utils/train.py`. The dataset
creation script is not in this repo — the pseudocode below documents
the procedure followed to generate `Matrix_withStories.pkl`.

```
======================================================================
PHASE 1 — Dataset creation (build Pickle file .pkl)
======================================================================
Goal: pair atmospheric drivers (ERA5) with observed temperature
profiles (Argo, target) to create a supervised dataset.

inputs:
    ARGO_DATABASE          # Argo profiles in [start_year, end_year]
    ERA5_SOURCE            # ARCO Zarr or CDS API
    DEPTH_GRID = [5, 10, ..., 200]                  # 40 levels
    VARIABLE_ORDER = [25 ERA5 vars] + [5 static]    # 30 features
    STEP_HOURS = 6
    N_TIMESTEPS = 25

X_all, Y_all, Info_all = [], [], []

for profile in iterate_argo_profiles(ARGO_DATABASE):
    lat, lon, t0 = profile.lat, profile.lon, profile.time

    # --- atmospheric drivers (25 timesteps x 25 ERA5 vars) ----------
    timestamps = [t0 - i * STEP_HOURS  for i in range(N_TIMESTEPS)]
    temporal, lat_era5, lon_era5 = extract_era5_at_nearest_grid_point(
        ERA5_SOURCE, lat, lon, timestamps, vars=ERA5_VARS)

    # --- static features (5) using ERA5 grid-point coords -----------
    static = {
        "latitude": lat_era5,
        "sin_lon":  sin(2π · (lon_era5 + 180) / 360),    # +180 shift!
        "cos_lon":  cos(2π · (lon_era5 + 180) / 360),
        "sinm":     sin(2π · month / 12),
        "cosm":     cos(2π · month / 12),
    }

    # --- replicate static across timesteps -> matrix (25, 30) -------
    X_sample = concat_per_timestep(temporal, static, order=VARIABLE_ORDER)

    # --- ground truth: interpolate Argo profile on DEPTH_GRID -------
    pres, temp = profile.adjusted_or_raw()
    Y_sample = linear_interp(pres, temp, DEPTH_GRID)
    if nan_fraction(Y_sample) > 0.20:                  # QC
        continue

    info = (profile.id, profile.cycle, lat, lon, t0)

    X_all.append(X_sample)        # (25, 30)
    Y_all.append(Y_sample)        # (40,)
    Info_all.append(info)

save_pickle("Matrix_withStories.pkl", {
    "X":    stack(X_all),              # (N, 25, 30)
    "Y":    stack(Y_all)[..., None],   # (N, 40, 1)
    "Info": Info_all,
})


======================================================================
PHASE 2 — Training (utils/train.py)
======================================================================

# --- load ---------------------------------------------------------------
m = load_pickle("Matrix_withStories.pkl")
X, Y, Info = m["X"], m["Y"][..., 0:1], m["Info"]

# --- QC: drop samples with NaN in Y, then in X --------------------------
keep_mask = ~has_nan_per_sample(Y)
X, Y, Info = filter(X, Y, Info, keep_mask)
keep_mask = ~has_nan_per_sample(X)
X, Y, Info = filter(X, Y, Info, keep_mask)

# --- temporal split (no shuffle) -----------------------------------------
times  = parse_times(Info[:, -1])
idx_tr = where(times <= "2020-12-31 23:59")
idx_ts = where(times >  "2020-12-31 23:59")

X_tr, Y_tr = X[idx_tr], Y[idx_tr]
X_ts, Y_ts = X[idx_ts], Y[idx_ts]


# --- standardize: 30 independent scalers fit on training set -----------
scaler_X = []
for f in range(30):
    s = StandardScaler()
    X_tr[:, :, f] = s.fit_transform(X_tr[:, :, f])
    X_ts[:, :, f] = s.transform(X_ts[:, :, f])
    scaler_X.append(s)

scaler_Y = StandardScaler().fit(Y_tr.reshape(-1, 1))
Y_tr     = scaler_Y.transform(Y_tr.reshape(-1, 1)).reshape(Y_tr.shape)
# NB: Y_ts is left in physical scale (used only for evaluation)

save_pickle("saved_model/scalers.pkl",
            {"X": scaler_X, "Y": scaler_Y})

# --- split static from temporal channels --------------------------------
STATIC_IDX   = [24, 26, 27, 28, 29]    # latitude, cosm, sinm, cos_lon, sin_lon
TEMPORAL_IDX = [i for i in range(30) if i not in STATIC_IDX]

X_tr_static = X_tr[:, 0, STATIC_IDX]            # (N, 5)
X_ts_static = X_ts[:, 0, STATIC_IDX]
X_tr        = X_tr[:, :, TEMPORAL_IDX]          # (N, 25, 25)
X_ts        = X_ts[:, :, TEMPORAL_IDX]

# --- model --------------------------------------------------------------
model = create_temperature_profile_model(
    time_series_shape     = (25, 25),
    static_features_shape = (5,),
    n_levels              = 40,
    n_members             = 100,    # ensemble outputs
)
# arch: BiLSTM(128) -> MultiHeadAttention(8 heads, residual)
#       -> GlobalAvgPool -> Dense(128)
#       (+) Dense(256->128) on static
#       -> Dense(40 * 64) -> reshape (40, 64)
#       -> Conv1D(64, k=5) -> Conv1DTranspose(32, k=7)
#       -> Conv1D(100, k=1)        # output (batch, 40, 100)

model.compile(
    optimizer = AdamW(lr=1e-4),
    loss      = CRPSLoss(parametric=False),     # energy-score form
    metrics   = [CRPS, MAE, MSE],
)

# --- train --------------------------------------------------------------
callbacks = [
    EarlyStopping(monitor="val_loss", patience=20),
    ReduceLROnPlateau(monitor="val_loss", patience=15, factor=0.9)
]

model.fit(
    [X_tr, X_tr_static], Y_tr,
    batch_size       = 128,
    epochs           = 500,
    validation_split = 0.1,
    callbacks        = callbacks,
)

# --- evaluation on test set --------------------------------------------
model.save_weights("saved_model/model.weights.h5")

pred_ens  = model.predict([X_ts, X_ts_static])      # (N_ts, 40, 100)
pred_mean = mean(pred_ens, axis=-1, keepdims=True)  # (N_ts, 40, 1)
pred      = scaler_Y.inverse_transform(
                pred_mean.reshape(-1, 1)
            ).reshape(pred_mean.shape)

save_pickle("results.pkl", {
    "Pred_test": pred,        # AI prediction (degC)
    "True":      Y_ts,        # Argo ground truth (degC)
    "Info":      Info[idx_ts],
})
```

## Key invariants

The two phases must agree on:

- **`VARIABLE_ORDER`** — the per-feature scaler index uses this exact
  order. 
- **Static feature positions** Must match `STATIC_VARS` of `prepare_input_v2.py`.
- **Lon encoding** — `sin/cos` use `(lon + 180)°`. Both phases must
  apply the shift.
- **Timestep convention** — `[t0, t0-6h, ..., t0-144h]`. Phase 1 must
  produce `X` with this temporal ordering for the model to interpret
  `X[:, 0, :]` as the present.
- **Ground-truth grid** — `DEPTH_GRID = [5, 10, ..., 200]` m. The model
  output dim `n_levels=40` is bound to this.

## Notes

- The training script writes to paths relative to the current working
  directory (`saved_model/`, `./`), so run it from
  `utils/`:
  ```bash
  cd utils
  python train.py
  ```
  This places the artifacts at `utils/saved_model/...`, which matches
  the defaults of `infer.py`.
- `Y_ts` is left in physical scale on purpose: the AI prediction is
  inverse-transformed back to physical scale before being compared to
  it, so the saved pickle is directly usable for downstream metrics.
- The 100 "ensemble members" are 100 deterministic Conv1D output
  channels. CRPS implicitly encourages spread; if you observe
  `std(pred, axis=-1) -> 0` everywhere on the test set, the ensemble
  has collapsed.
