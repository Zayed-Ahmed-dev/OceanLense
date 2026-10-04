import os

# Must be set before importing TensorFlow
os.environ.setdefault("TF_USE_LEGACY_KERAS", "1")
os.environ.setdefault("TF_CPP_MIN_LOG_LEVEL", "2")

from datetime import datetime, timezone
from pathlib import Path
from threading import Lock
from typing import Literal

import numpy as np
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from prepare_input_v2 import prepare_input
from infer import infer


# ---------------------------------------------------------
# PATHS
# ---------------------------------------------------------

BASE_DIR = Path(__file__).resolve().parent

SCALERS_PATH = BASE_DIR / "utils" / "saved_model" / "scalers.pkl"
WEIGHTS_PATH = BASE_DIR / "utils" / "saved_model" / "model.weights.h5"
SCRIPTS_DIR = BASE_DIR / "utils"


# ---------------------------------------------------------
# APP
# ---------------------------------------------------------

app = FastAPI(
    title="OceanPulse API",
    description="AI Sea Temperature Profile Reconstruction API",
    version="1.0.0",
)


# ---------------------------------------------------------
# CORS
# ---------------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------
# PREDICTION LOCK
# ---------------------------------------------------------

# Keep the first version single-prediction at a time.
# This avoids multiple TensorFlow inference requests
# trying to use the cached model simultaneously.
prediction_lock = Lock()


# ---------------------------------------------------------
# REQUEST MODEL
# ---------------------------------------------------------

class PredictRequest(BaseModel):
    lat: float = Field(..., ge=-90, le=90)
    lon: float = Field(..., ge=-180, le=180)

    timestamp: datetime

    source: Literal["gcs", "cds"] = "cds"

    include_glorys: bool = False
    include_argo: bool = False


# ---------------------------------------------------------
# HELPERS
# ---------------------------------------------------------

def numpy_to_list(value):
    """
    Convert numpy arrays into JSON serializable lists.
    """
    if value is None:
        return None

    if isinstance(value, np.ndarray):
        return value.astype(float).tolist()

    return value


def normalize_timestamp(timestamp: datetime) -> datetime:
    """
    Convert timezone-aware timestamps to naive UTC timestamps.
    The existing preparation pipeline works with normal datetime values.
    """
    if timestamp.tzinfo is not None:
        timestamp = timestamp.astimezone(timezone.utc)
        timestamp = timestamp.replace(tzinfo=None)

    return timestamp


# ---------------------------------------------------------
# HEALTH CHECK
# ---------------------------------------------------------

@app.get("/health")
def health():
    """
    Basic API and model-file health check.
    """

    files = {
        "scalers": SCALERS_PATH,
        "weights": WEIGHTS_PATH,
        "model": SCRIPTS_DIR / "model.py",
    }

    return {
        "status": "ok",
        "model_files": {
            name: path.exists()
            for name, path in files.items()
        },
    }


# ---------------------------------------------------------
# PREDICTION
# ---------------------------------------------------------

@app.post("/predict")
def predict(request: PredictRequest):
    """
    Prepare ERA5 input and run the existing ML model.
    """

    # -----------------------------------------------------
    # Check model files
    # -----------------------------------------------------

    if not SCALERS_PATH.exists():
        raise HTTPException(
            status_code=500,
            detail=f"Scalers not found: {SCALERS_PATH}",
        )

    if not WEIGHTS_PATH.exists():
        raise HTTPException(
            status_code=500,
            detail=f"Model weights not found: {WEIGHTS_PATH}",
        )

    model_file = SCRIPTS_DIR / "model.py"

    if not model_file.exists():
        raise HTTPException(
            status_code=500,
            detail=f"Model architecture not found: {model_file}",
        )

    # -----------------------------------------------------
    # Normalize timestamp
    # -----------------------------------------------------

    timestamp = normalize_timestamp(request.timestamp)

    # -----------------------------------------------------
    # Use one request at a time
    # -----------------------------------------------------

    with prediction_lock:

        try:

            # ---------------------------------------------
            # STEP 1
            # Prepare model input
            # ---------------------------------------------

            input_path = BASE_DIR / "model_input.pkl"

            prepare_input(
                lat=request.lat,
                lon=request.lon,
                timestamp=timestamp,
                output_path=input_path,
                include_glorys=request.include_glorys,
                include_argo=request.include_argo,
                source=request.source,
            )

            # ---------------------------------------------
            # STEP 2
            # Run inference
            # ---------------------------------------------

            result = infer(
                input_path=input_path,
                scalers_path=SCALERS_PATH,
                weights_path=WEIGHTS_PATH,
                output_path=None,
                scripts_dir=SCRIPTS_DIR,
            )

            # ---------------------------------------------
            # STEP 3
            # Convert result to JSON
            # ---------------------------------------------

            response = {
                "query": {
                    "lat": float(result["query_lat"]),
                    "lon": float(result["query_lon"]),
                    "timestamp": result["query_t0"],
                },

                "depth_grid_m": numpy_to_list(
                    result["depth_grid"]
                ),

                "temperature_c": numpy_to_list(
                    result["profile_mean"]
                ),

                "uncertainty_std_c": numpy_to_list(
                    result["profile_std"]
                ),

                "p05_c": numpy_to_list(
                    result["profile_p05"]
                ),

                "p50_c": numpy_to_list(
                    result["profile_p50"]
                ),

                "p95_c": numpy_to_list(
                    result["profile_p95"]
                ),

                "glorys_profile_c": numpy_to_list(
                    result.get("glorys_profile")
                ),

                "argo_profile_c": numpy_to_list(
                    result.get("argo_profile")
                ),

                "argo_meta": result.get("argo_meta"),

                "glorys_meta": result.get("glorys_meta"),
            }

            return response

        except Exception as e:

            print("\n========== PREDICTION ERROR ==========")
            print(type(e).__name__, str(e))
            print("======================================\n")

            raise HTTPException(
                status_code=500,
                detail=str(e),
            )