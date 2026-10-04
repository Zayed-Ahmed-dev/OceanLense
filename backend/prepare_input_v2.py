"""
Pipeline to prepare the input of the AI model that reconstructs ocean
vertical temperature profiles from (lat, lon, timestamp), with optional
extraction of the GLORYS12V1 reference profile and of the closest
observed Argo profile.

Output: pickle containing
  - temporal:        np.ndarray (25, 25)  float32   ERA5 features (always)
  - static:          np.ndarray (5,)       float32   static features (always)
  - glorys_profile:  np.ndarray (40,)      float32   if include_glorys
  - argo_profile:    np.ndarray (40,) | None        if include_argo
  - argo_meta:       dict | None                    Argo profile metadata
  + traceability metadata.

NOTE ON THE ERA5 SOURCE:
Two paths available, selected via `source` (default 'gcs'):
  - 'gcs': Analysis-Ready ARCO-ERA5 Zarr store at 0.25 deg
       gs://gcp-public-data-arco-era5/ar/full_37-1h-0p25deg-chunk-1.zarr-v3
       Pros: no authentication. Cons: global chunks, so to extract one
       profile many useless GB are downloaded.
  - 'cds': Climate Data Store API (requires ~/.cdsapirc).
       Downloads only a ~0.5 x 0.5 deg box around the point and only the
       needed hours -> file of a few MB. Tradeoff: CDS queue (30-180 s).
The Zarr store exposes LONG names; the ERA5_NAME_MAP dict maps them to
the short names used in the pipeline.

NOTE ON GLORYS12V1:
Uses the `copernicusmarine` toolbox (requires CMEMS credentials:
run `copernicusmarine login` once). Dataset:
   cmems_mod_glo_phy_my_0.083deg_P1D-m
Variable: thetao (potential temperature). Daily mean for the day of t0,
nearest grid point at 1/12 deg, linearly interpolated on DEPTH_GRID.

NOTE ON ARGO:
Uses `argopy` (Ifremer ERDDAP, anonymous access) to search a box around
(lat, lon, t0) for the closest profile. Prefers delayed-mode fields
(*_ADJUSTED) when available. Applies a QC threshold of <20% NaN in the
first 200 m. Returns None if no profile passes the criteria.

NOTE ON STANDARDIZATION:
The model expects standardized inputs (mean/std computed at training
time). This script returns raw arrays: apply the scalers before calling
model.predict().

Dependencies: numpy, scipy, xarray, zarr, gcsfs, copernicusmarine, argopy,
cdsapi, netCDF4 (to read the NetCDF returned by CDS).
"""

from __future__ import annotations

import argparse
import pickle
import tempfile
import threading
from datetime import datetime, timedelta
from pathlib import Path

import numpy as np
import xarray as xr

try:
    import gsw  # type: ignore
    _HAS_GSW = True
except ImportError:
    _HAS_GSW = False


# ----------------------------------------------------------------------
# Configurazione
# ----------------------------------------------------------------------

ZARR_PATH = (
    "gs://gcp-public-data-arco-era5/ar/full_37-1h-0p25deg-chunk-1.zarr-v3"
)

GLORYS_DATASET_ID = "cmems_mod_glo_phy_my_0.083deg_P1D-m"
GLORYS_VAR = "thetao"

# Common vertical grid: 5, 10, ..., 200 m -> 40 levels
DEPTH_GRID = np.arange(5.0, 205.0, 5.0, dtype=np.float64)

# User-defined variable order: 25 ERA5 + 5 static = 30.
#
# CRITICAL INVARIANT: this order MUST match the order assumed by the
# scalers (mean/std computed at training time). Reordering here without
# also re-aligning the scalers produces semantically corrupted inputs
# (sst standardized with the mean of another feature, etc.) without any
# visible error. If this order needs to change, regenerate the scalers.
VARIABLE_ORDER = [
    'v10', 'str', 'msl', 't2m', 'tcc', 'mntss', 'msdwlwrf', 'i10fg',
    'msdwswrf', 'cp', 'mer', 'lsp', 'sshf', 'msnswrf', 'msnlwrf', 'u10',
    'msshf', 'mslhf', 'metss', 'strd', 'sst', 'd2m', 'ssr', 'slhf',
    'latitude', 'e', 'cosm', 'sinm', 'cos_lon', 'sin_lon',
]

STATIC_NAMES = {'latitude', 'sin_lon', 'cos_lon', 'sinm', 'cosm'}
ERA5_VARS = [v for v in VARIABLE_ORDER if v not in STATIC_NAMES]
STATIC_VARS = [v for v in VARIABLE_ORDER if v in STATIC_NAMES]

# Map short name (user) -> long name (ARCO-ERA5 Zarr store).
ERA5_NAME_MAP = {
    'sst':      'sea_surface_temperature',
    'lsp':      'large_scale_precipitation',
    'cp':       'convective_precipitation',
    'ssr':      'surface_net_solar_radiation',
    'msnswrf':  'mean_surface_net_short_wave_radiation_flux',
    'mntss':    'mean_northward_turbulent_surface_stress',
    'msdwswrf': 'mean_surface_downward_short_wave_radiation_flux',
    'mslhf':    'mean_surface_latent_heat_flux',
    'tcc':      'total_cloud_cover',
    'e':        'evaporation',
    'metss':    'mean_eastward_turbulent_surface_stress',
    'slhf':     'surface_latent_heat_flux',
    'mer':      'mean_evaporation_rate',
    'msnlwrf':  'mean_surface_net_long_wave_radiation_flux',
    'sshf':     'surface_sensible_heat_flux',
    'msshf':    'mean_surface_sensible_heat_flux',
    'i10fg':    'instantaneous_10m_wind_gust',
    'u10':      '10m_u_component_of_wind',
    'v10':      '10m_v_component_of_wind',
    'str':      'surface_net_thermal_radiation',
    'msl':      'mean_sea_level_pressure',
    'd2m':      '2m_dewpoint_temperature',
    't2m':      '2m_temperature',
    'strd':     'surface_thermal_radiation_downwards',
    'msdwlwrf': 'mean_surface_downward_long_wave_radiation_flux',
}

N_TIMESTEPS = 25
STEP_HOURS = 6
INITIAL_OFFSET_H = 0  # the most recent timestep coincides with t0


def to_era5_lon(lon: float) -> float:
    """Normalize an arbitrary longitude to the ERA5 range [0, 360).

    ERA5 (both ARCO Zarr and reference convention) uses [0, 360).
    User input can be in [-180, 180]: -180 -> 180, -90 -> 270,
    0 -> 0, 90 -> 90, 180 -> 180. Out-of-range values are also wrapped
    correctly thanks to the modulo.
    """
    return float(lon) % 360.0


# ----------------------------------------------------------------------
# Utility: vertical interpolation
# ----------------------------------------------------------------------

def interpolate_to_depth_grid(depth: np.ndarray, temp: np.ndarray) -> np.ndarray:
    """Linear interpolation of temp(depth) on DEPTH_GRID. NaN outside range."""
    from scipy.interpolate import interp1d
    depth = np.asarray(depth, dtype=np.float64).ravel()
    temp = np.asarray(temp, dtype=np.float64).ravel()
    valid = np.isfinite(depth) & np.isfinite(temp)
    if valid.sum() < 2:
        return np.full(len(DEPTH_GRID), np.nan, dtype=np.float32)
    order = np.argsort(depth[valid])
    f = interp1d(
        depth[valid][order], temp[valid][order],
        bounds_error=False, fill_value=np.nan, assume_sorted=True,
    )
    return f(DEPTH_GRID).astype(np.float32)


# ----------------------------------------------------------------------
# ERA5 (Zarr store)
# ----------------------------------------------------------------------

_DS_CACHE: xr.Dataset | None = None
_DS_CACHE_LOCK = threading.Lock()


def open_era5() -> xr.Dataset:
    """Open (once) the ARCO-ERA5 Zarr store in anonymous read mode.

    With `chunks={}` xarray uses the native store chunking and builds
    dask arrays: at .load() time the chunks are downloaded in parallel
    (gcsfs opens multiple HTTP connections), much faster than the
    sequential download that would occur with chunks=None.

    Thread-safe: double-checked locking prevents concurrent open of the
    Zarr from multiple threads (e.g. WSGI/FastAPI multi-worker servers).
    """
    global _DS_CACHE
    if _DS_CACHE is None:
        with _DS_CACHE_LOCK:
            if _DS_CACHE is None:
                _DS_CACHE = xr.open_zarr(
                    ZARR_PATH,
                    chunks={},
                    storage_options={'token': 'anon'},
                )
    return _DS_CACHE


def verify_variable_names(ds: xr.Dataset) -> list[str]:
    """Return the short names whose mapping is missing from the dataset."""
    missing = []
    for short in ERA5_VARS:
        long = ERA5_NAME_MAP.get(short)
        if long is None or long not in ds.data_vars:
            missing.append(short)
    return missing


def build_timestamps(t0: datetime) -> list[datetime]:
    """25 timestamps: t0, t0-6h, t0-12h, ..., t0-144h (~6 days).

    The first element is exactly t0 (the "present" timestep), the other
    24 go backwards at constant STEP_HOURS pace.
    """
    return [
        t0 - timedelta(hours=INITIAL_OFFSET_H + i * STEP_HOURS)
        for i in range(N_TIMESTEPS)
    ]


def extract_temporal(ds: xr.Dataset, lat: float, lon: float,
                     timestamps: list[datetime]
                     ) -> tuple[np.ndarray, float, float]:
    """Extract the 25 ERA5 variables at the 25 timestamps at the nearest
    grid point.

    Performance strategy:
      1) first reduce the time dimension to a contiguous SLICE
         [t_min - pad, t_max + pad] and the spatial one to the nearest
         point: this restricts the Zarr chunks to read to the requested
         interval only (~6 days) instead of 25 point-wise reads.
      2) call .load() only once on the full-variable sub-dataset: dask
         downloads chunks in parallel via gcsfs.
      3) the final nearest-selection on the 25 timestamps happens IN MEMORY.

    Returns (arr, lat_era5, lon_era5):
      - arr: float32 (N_TIMESTEPS, len(ERA5_VARS))
      - lat_era5, lon_era5: coordinates of the grid point actually
        selected (lon in ERA5 convention [0, 360)).
    """
    lon_q = to_era5_lon(lon)
    long_names = [ERA5_NAME_MAP[v] for v in ERA5_VARS]

    t_arr = np.array(timestamps, dtype='datetime64[ns]')
    pad = np.timedelta64(1, 'h')
    t_min, t_max = t_arr.min() - pad, t_arr.max() + pad

    sub = (
        ds[long_names]
        .sel(time=slice(t_min, t_max))
        .sel(latitude=lat, longitude=lon_q, method='nearest')
        .load()
    )

    lat_era5 = float(sub['latitude'].values)
    lon_era5 = to_era5_lon(float(sub['longitude'].values))

    times_da = xr.DataArray(t_arr, dims='step')
    picked = sub.sel(time=times_da, method='nearest')

    out = np.empty((N_TIMESTEPS, len(ERA5_VARS)), dtype=np.float32)
    for j, long in enumerate(long_names):
        out[:, j] = picked[long].values.astype(np.float32)
    return out, lat_era5, lon_era5


# ----------------------------------------------------------------------
# ERA5 (CDS API)
# ----------------------------------------------------------------------

CDS_DATASET = "reanalysis-era5-single-levels"
CDS_HALO_DEG = 0.25  # ~0.5 x 0.5 deg box around the point

# CDS-Beta renames the "mean rate" fields in the NetCDF with the avg_*
# prefix. Fallback map short-GRIB -> CDS-Beta-NetCDF.
CDS_BETA_NETCDF_NAMES = {
    'mntss':    'avg_inss',
    'metss':    'avg_iews',
    'msdwlwrf': 'avg_sdlwrf',
    'msdwswrf': 'avg_sdswrf',
    'mer':      'avg_ie',
    'msnswrf':  'avg_snswrf',
    'msnlwrf':  'avg_snlwrf',
    'msshf':    'avg_ishf',
    'mslhf':    'avg_slhtf',
}


def extract_temporal_cds(lat: float, lon: float,
                         timestamps: list[datetime]
                         ) -> tuple[np.ndarray, float, float]:
    """Download via CDS API only the needed box and hours and return the
    25 ERA5 variables at the 25 timestamps at the nearest grid point.

    Requires:
      - package `cdsapi`
      - credentials in ~/.cdsapirc (register on cds.climate.copernicus.eu
        and copy url+key from your user page).

    CDS queue: typically 30-180 s. Downloaded file: a few MB.
    Returns (arr, lat_era5, lon_era5):
      - arr: float32 (N_TIMESTEPS, len(ERA5_VARS))
      - lat_era5, lon_era5: coordinates of the selected grid point
        (lon normalized to ERA5 convention [0, 360)).
    """
    import cdsapi

    long_names = [ERA5_NAME_MAP[v] for v in ERA5_VARS]

    years = sorted({str(t.year) for t in timestamps})
    months = sorted({f"{t.month:02d}" for t in timestamps})
    days = sorted({f"{t.day:02d}" for t in timestamps})
    times_list = sorted({f"{t.hour:02d}:00" for t in timestamps})

    # area = [North, West, South, East]
    # Clamp to geographic bounds: near the poles the halo exceeds
    # [-90, 90] and CDS refuses or silently returns malformed boxes.
    # At the antimeridian the box is shortened on the side that exceeds
    # +/-180: CDS does not accept boxes crossing meridian 180 in one
    # request, and with halo=0.25 deg the loss is negligible.
    north = min(90.0, lat + CDS_HALO_DEG)
    south = max(-90.0, lat - CDS_HALO_DEG)
    west = max(-180.0, lon - CDS_HALO_DEG)
    east = min(180.0, lon + CDS_HALO_DEG)
    area = [north, west, south, east]

    import zipfile

    with tempfile.TemporaryDirectory(prefix='era5_cds_') as tmpdir:
        download_path = Path(tmpdir) / 'download.bin'

        client = cdsapi.Client()
        client.retrieve(
            CDS_DATASET,
            {
                'product_type': 'reanalysis',
                'variable': long_names,
                'year': years,
                'month': months,
                'day': days,
                'time': times_list,
                'area': area,
                'data_format': 'netcdf',
                'download_format': 'unarchived',
            },
            str(download_path),
        )

        # CDS-Beta may return a ZIP with multiple NetCDFs (streams
        # 'instant' vs 'accum') even with download_format='unarchived'.
        if zipfile.is_zipfile(download_path):
            with zipfile.ZipFile(download_path) as zf:
                zf.extractall(tmpdir)
            nc_files = sorted(Path(tmpdir).rglob('*.nc'))
            if not nc_files:
                raise FileNotFoundError(
                    "The zip returned by CDS contains no .nc file. "
                    f"Contents: {[p.name for p in Path(tmpdir).rglob('*')]}"
                )
            loaded = []
            for f in nc_files:
                with xr.open_dataset(f) as d:
                    loaded.append(d.load())
            ds = xr.merge(loaded, compat='override')
        else:
            with xr.open_dataset(download_path) as d:
                ds = d.load()

        # CDS-Beta uses 'valid_time'; CDS-legacy uses 'time'
        time_coord = 'valid_time' if 'valid_time' in ds.coords else 'time'
        lat_coord = 'latitude' if 'latitude' in ds.coords else 'lat'
        lon_coord = 'longitude' if 'longitude' in ds.coords else 'lon'

        times_da = xr.DataArray(
            np.array(timestamps, dtype='datetime64[ns]'), dims='step'
        )
        sub = (
            ds.sel({time_coord: times_da}, method='nearest')
            .sel({lat_coord: lat, lon_coord: lon}, method='nearest')
        )

        lat_era5 = float(sub[lat_coord].values)
        lon_era5 = to_era5_lon(float(sub[lon_coord].values))

        out = np.empty((N_TIMESTEPS, len(ERA5_VARS)), dtype=np.float32)
        for j, short in enumerate(ERA5_VARS):
            long = ERA5_NAME_MAP[short]
            cds_beta = CDS_BETA_NETCDF_NAMES.get(short)
            if short in sub.data_vars:
                var = sub[short]
            elif cds_beta and cds_beta in sub.data_vars:
                var = sub[cds_beta]
            elif long in sub.data_vars:
                var = sub[long]
            else:
                raise KeyError(
                    f"Variable {short!r} (long {long!r}, "
                    f"cds-beta {cds_beta!r}) not found in CDS download. "
                    f"Available: {list(sub.data_vars)}"
                )
            out[:, j] = var.values.astype(np.float32)
    return out, lat_era5, lon_era5


# ----------------------------------------------------------------------
# Static features
# ----------------------------------------------------------------------

def compute_static(lat: float, lon: float, t0: datetime) -> dict:
    lon_rad = 2.0*(lon+180)*np.pi/360 
    m_angle = 2.0 * np.pi * (t0.month) / 12.0
    return {
        'latitude': float(lat),
        'sin_lon': float(np.sin(lon_rad)),
        'cos_lon': float(np.cos(lon_rad)),
        'sinm': float(np.sin(m_angle)),
        'cosm': float(np.cos(m_angle)),
    }


# ----------------------------------------------------------------------
# GLORYS12V1
# ----------------------------------------------------------------------

def extract_glorys_profile(lat: float, lon: float, t0: datetime,
                           dataset_id: str = GLORYS_DATASET_ID,
                           variable: str = GLORYS_VAR,
                           halo_deg: float = 0.2,
                           ) -> tuple[np.ndarray | None, dict | None]:
    """GLORYS daily-mean profile at the day of t0, interpolated on
    DEPTH_GRID.

    Requires `copernicusmarine` configured (`copernicusmarine login`).
    Returns (profile, meta) consistent with extract_argo_profile:
    - (np.ndarray (40,) float32, meta_dict) on success
    - (None, meta_with_reason) if the box is empty (e.g. point on land)
      or if the profile is all NaN. The pipeline does not stop.
    """
    import copernicusmarine as cm
    cm.login(
    username = '',  # Insert here yuor username for copernicus marine store
    password  = '', # Insert here yuor password for copernicus marine store
    #overwrite_configuration_file = True
    )
    date = t0.strftime('%Y-%m-%d')
    try:
        ds = cm.open_dataset(
            dataset_id=dataset_id,
            variables=[variable],
            start_datetime=f"{date}T00:00:00",
            end_datetime=f"{date}T00:00:00",
            minimum_longitude=lon, maximum_longitude=lon,
            minimum_latitude=lat,  maximum_latitude=lat,
            # GLORYS has the first level at ~0.494 m: 0.0 is rejected
            # as out of range. 0.5 is above the first real level and
            # well below the first point of DEPTH_GRID (5 m), so we
            # do not lose useful information for the interpolation.
            minimum_depth=2., maximum_depth=400,
        )
        
    except Exception as e:
        return None, {'rejected': True, 'reason': 'open_dataset_failed',
                      'error': f"{type(e).__name__}: {e}"}

    da = ds[variable]
    if any(da.sizes.get(d, 0) == 0 for d in ('latitude', 'longitude', 'time')):
        return None, {'rejected': True, 'reason': 'empty_box',
                      'hint': 'point on land or outside GLORYS domain'}

    profile = (
        da
        .sel(latitude=lat, longitude=lon, method='nearest')
        .isel(time=0)
    )
    depth = profile['depth'].values
    temp = profile.values

    if not np.any(np.isfinite(temp)):
        return None, {'rejected': True, 'reason': 'all_nan',
                      'hint': 'nearest grid point on land'}

    grid = interpolate_to_depth_grid(depth, temp)
    nan_frac = float(np.isnan(grid).sum() / len(grid))
    meta = {
        'rejected': False,
        'nan_fraction': nan_frac,
        'profile_lat': float(profile['latitude'].values),
        'profile_lon': float(profile['longitude'].values),
        'profile_time': str(profile['time'].values),
    }
    return grid, meta


# ----------------------------------------------------------------------
# Argo
# ----------------------------------------------------------------------

def extract_argo_profile(lat: float, lon: float, t0: datetime,
                         lat_box: float = 0.5, lon_box: float = 0.5,
                         time_window_days: float = 1.0,
                         max_nan_fraction: float = 0.20,
                         src: str | None = None,
                         api_timeout: int = 120,
                         box_scales: tuple = (0.1, 1.0, 4.0),
                         ) -> tuple[np.ndarray | None, dict | None]:
    """Search the closest Argo profile to (lat, lon, t0) in a box and
    interpolate it on DEPTH_GRID. Prefers *_ADJUSTED fields.
    QC: discard if NaN > max_nan_fraction in the first 200 m.

    Parameters:
      src: argopy backend. Default None -> try in sequence
           ['argovis', 'erddap', 'gdac']. Specify a single name to
           disable the backend fallback.
      api_timeout: HTTP call timeout in seconds.
      box_scales: multiplicative scales tried in sequence. Default
           (0.1, 1.0, 4.0): tight (~0.05 deg / ~2.4 h) -> default
           (lat_box, lon_box, time_window_days) -> extended (4x) for
           open-ocean points with low Argo density. For conservative
           behaviour, pass (0.1, 1.0).

    Returns (profile_array, metadata) or (None, metadata_with_reason).
    """
    import argopy
    from argopy import DataFetcher

    argopy.set_options(api_timeout=api_timeout)

    sources = [src] if src is not None else ['argovis', 'erddap', 'gdac']
    ds = None
    used_src = None
    used_scale = None
    errors: list[str] = []
    box: list = []

    for scale in box_scales:
        box = [
            lon - lon_box * scale, lon + lon_box * scale,
            lat - lat_box * scale, lat + lat_box * scale,
            0.0, 210.0,
            (t0 - timedelta(days=time_window_days * scale)).isoformat(),
            (t0 + timedelta(days=time_window_days * scale)).isoformat(),
        ]
        for s in sources:
            try:
                loader = DataFetcher(src=s, mode='standard')
                ds = loader.region(box).to_xarray()
                if ds.sizes.get('N_POINTS', 0) == 0:
                    ds = None
                    raise RuntimeError("empty_response")
                used_src = s
                used_scale = scale
                break
            except Exception as e:
                msg = f"scale={scale}:{s}:{type(e).__name__}:{e}"
                errors.append(msg)
                ds = None
                continue
        if ds is not None:
            tag = 'tight' if scale < 1.0 else f'{scale}x'
            print(f"[argo] profile found with backend={used_src!r} "
                  f"at box scale={tag}")
            break
        else:
            tag = 'tight' if scale < 1.0 else f'{scale}x'
            print(f"[argo] no profile at box scale={tag}, "
                  f"trying next scale...")

    if ds is None:
        print(
            "\n" + "=" * 70 + "\n"
            f"[argo] >>> NO ARGO PROFILE FOUND <<<\n"
            f"        query        : lat={lat}, lon={lon}, t0={t0.isoformat()}\n"
            f"        scales tried : {list(box_scales)}\n"
            f"        last box     : {box}\n"
            + "=" * 70 + "\n"
        )
        return None, {
            'rejected': True,
            'reason': 'no_profile_found',
            'box_scales_tried': list(box_scales),
            'errors': errors,
            'last_box': box,
        }
    if ds.sizes.get('N_POINTS', 0) == 0:
        return None, None

    # argopy point2profile() has a compatibility issue with
    # timezone-aware TIME values under the current NumPy/pandas versions.
    if 'TIME' in ds:
        try:
            time_values = ds['TIME'].values

            # Convert timezone-aware pandas timestamps to timezone-naive
            if hasattr(time_values, 'tz'):
                ds['TIME'] = (
                    'N_POINTS',
                    time_values.tz_localize(None).to_numpy()
                )
        except Exception:
            pass

    ds_prof = ds.argo.point2profile()
    times = ds_prof['TIME'].values
    lats = ds_prof['LATITUDE'].values.astype(np.float64)
    lons = ds_prof['LONGITUDE'].values.astype(np.float64)

    t0_np = np.datetime64(t0)
    dt_days = (times - t0_np) / np.timedelta64(1, 'D')
    dist_deg = np.sqrt((lats - lat) ** 2 + (lons - lon) ** 2)
    score = np.abs(dt_days.astype(np.float64)) + dist_deg
    idx = int(np.argmin(score))
    prof = ds_prof.isel(N_PROF=idx)

    has_adj = (
        'TEMP_ADJUSTED' in prof.data_vars
        and not np.all(np.isnan(prof['TEMP_ADJUSTED'].values))
    )
    if has_adj:
        temp = prof['TEMP_ADJUSTED'].values
        pres = (
            prof['PRES_ADJUSTED'].values
            if 'PRES_ADJUSTED' in prof.data_vars
            else prof['PRES'].values
        )
        mode = 'adjusted'
    else:
        temp = prof['TEMP'].values
        pres = prof['PRES'].values
        mode = 'raw'

    # Pressure -> depth conversion.
    # If gsw is installed, use the TEOS-10 formula (z is negative =
    # depth, so we negate). Otherwise fall back to the first-order
    # approximation 1 dbar ~ 1 m, valid in the first 200 m with typical
    # error < 1%.
    pres_arr = np.asarray(pres, dtype=np.float64)
    #if _HAS_GSW:
    #    depth = -gsw.z_from_p(pres_arr, lat)
    #    depth_method = 'gsw_z_from_p'
    #else:
    depth = pres_arr
    depth_method = 'pressure_eq_depth'
    profile_grid = interpolate_to_depth_grid(depth, temp)

    nan_frac = float(np.isnan(profile_grid).sum() / len(profile_grid))
    if nan_frac > max_nan_fraction:
        return None, {
            'rejected': True, 'reason': 'qc_nan_threshold',
            'nan_fraction': nan_frac,
        }

    meta = {
        'rejected': False,
        'mode': mode,
        'depth_method': depth_method,
        'source_backend': used_src,
        'box_scale_used': used_scale,
        'nan_fraction': nan_frac,
        'profile_lat': float(lats[idx]),
        'profile_lon': float(lons[idx]),
        'profile_time': str(times[idx]),
        'spacetime_score': float(score[idx]),
        'platform_number': (
            str(prof['PLATFORM_NUMBER'].values)
            if 'PLATFORM_NUMBER' in prof.data_vars else None
        ),
        'cycle_number': (
            int(prof['CYCLE_NUMBER'].values)
            if 'CYCLE_NUMBER' in prof.data_vars else None
        ),
    }
    return profile_grid, meta


# ----------------------------------------------------------------------
# Pipeline
# ----------------------------------------------------------------------

def prepare_input(lat: float, lon: float, timestamp,
                  output_path: str | Path,
                  include_glorys: bool = False,
                  include_argo: bool = False,
                  source: str = 'gcs') -> dict:
    if isinstance(timestamp, str):
        t0 = datetime.fromisoformat(timestamp)
    elif isinstance(timestamp, datetime):
        t0 = timestamp
    else:
        raise TypeError("timestamp must be an ISO 8601 string or datetime")
    if not -90.0 <= lat <= 90.0:
        raise ValueError(f"lat out of range: {lat}")
    if not -180.0 <= lon <= 180.0:
        raise ValueError(f"lon out of range: {lon}")
    if source not in ('gcs', 'cds'):
        raise ValueError(f"invalid source: {source!r} (use 'gcs' or 'cds')")

    timestamps = build_timestamps(t0)

    if source == 'gcs':
        ds = open_era5()
        missing = verify_variable_names(ds)
        if missing:
            raise KeyError(
                f"Variables not found in Zarr store: {missing}. "
                "Update ERA5_NAME_MAP."
            )
        temporal, lat_era5, lon_era5 = extract_temporal(ds, lat, lon, timestamps)
        era5_source_label = ZARR_PATH
    else:  # 'cds'
        temporal, lat_era5, lon_era5 = extract_temporal_cds(lat, lon, timestamps)
        era5_source_label = f"CDS:{CDS_DATASET}"

    # The static features (lat, sin_lon, cos_lon) feed the model: we
    # use the coordinates of the actual ERA5 nearest grid point, NOT
    # those of the query. This way the lat/lon in the features match the
    # extracted ERA5 fields, avoiding a small spatial misalignment.
    static_d = compute_static(lat_era5, lon_era5, t0)
    static = np.array([static_d[v] for v in STATIC_VARS], dtype=np.float32)

    payload: dict = {
        'temporal': temporal,
        'static': static,
        'era5_feature_order': ERA5_VARS,
        'static_feature_order': STATIC_VARS,
        'depth_grid': DEPTH_GRID.astype(np.float32),
        'timestamps_utc': [ts.isoformat() for ts in timestamps],
        # ERA5 grid point coordinates (what the model "sees"):
        'query_lat': float(lat_era5),
        'query_lon': float(lon_era5),  # ERA5 convention: [0, 360)
        # Coordinates requested by the user, kept for traceability:
        'query_lat_input': float(lat),
        'query_lon_input': float(lon),
        'query_t0': t0.isoformat(),
        'data_source_era5': era5_source_label,
    }

    if include_glorys:
        try:
            glorys_profile, glorys_meta = extract_glorys_profile(lat, lon, t0)
        except Exception as e:
            # GLORYS isolated like Argo: errors do not break the pipeline.
            # The other extractions (ERA5, optional Argo) remain valid.
            print(f"[glorys] extraction failed: {type(e).__name__}: {e}")
            glorys_profile, glorys_meta = None, {
                'rejected': True, 'reason': 'unhandled_exception',
                'error': f"{type(e).__name__}: {e}",
            }
        if glorys_profile is None:
            print(f"[glorys] >>> NO GLORYS PROFILE AVAILABLE <<< "
                  f"reason={glorys_meta.get('reason') if glorys_meta else None}")
        payload['glorys_profile'] = glorys_profile
        payload['glorys_meta'] = glorys_meta
        payload['data_source_glorys'] = GLORYS_DATASET_ID

    if include_argo:
        argo_profile, argo_meta = extract_argo_profile(lat, lon, t0)
        payload['argo_profile'] = argo_profile
        payload['argo_meta'] = argo_meta

    with open(output_path, 'wb') as f:
        pickle.dump(payload, f)

    return payload


# ----------------------------------------------------------------------
# CLI
# ----------------------------------------------------------------------

if __name__ == '__main__':
    p = argparse.ArgumentParser(description="Prepare input for the AI model.")
    p.add_argument('--lat', type=float, required=True)
    p.add_argument('--lon', type=float, required=True, help='in [-180, 180]')
    p.add_argument('--timestamp', type=str, required=True,
                   help='ISO 8601, e.g. 2022-06-15T12:00:00')
    p.add_argument('--out', type=str, default='model_input.pkl')
    p.add_argument('--source', choices=['gcs', 'cds'], default='gcs',
                   help='ERA5 source: gcs (ARCO Zarr) or cds (Climate Data '
                        'Store, faster for sparse profiles)')
    p.add_argument('--glorys', action='store_true',
                   help='Also extract the GLORYS12V1 profile')
    p.add_argument('--argo', action='store_true',
                   help='Also extract the closest Argo profile')
    args = p.parse_args()

    payload = prepare_input(
        args.lat, args.lon, args.timestamp, args.out,
        include_glorys=args.glorys, include_argo=args.argo,
        source=args.source,
    )
    print(f"temporal shape: {payload['temporal'].shape}")
    print(f"static   shape: {payload['static'].shape}")
    print(f"timestamps:     {payload['timestamps_utc'][0]}  ...  "
          f"{payload['timestamps_utc'][-1]}")
    if 'glorys_profile' in payload:
        if payload['glorys_profile'] is None:
            print(f"glorys:         no profile (see glorys_meta)")
        else:
            print(f"glorys shape:   {payload['glorys_profile'].shape}")
    if 'argo_profile' in payload:
        if payload['argo_profile'] is None:
            print(f"argo:           no valid profile in box")
        else:
            m = payload['argo_meta']
            print(f"argo shape:     {payload['argo_profile'].shape}  "
                  f"(mode={m['mode']}, score={m['spacetime_score']:.3f})")
    print(f"saved:          {args.out}")
