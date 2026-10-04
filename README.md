# OceanLense 🌊

OceanLense is an AI-powered ocean exploration and subsurface temperature reconstruction platform.

It combines satellite and oceanographic data with a deep learning model to reconstruct temperature profiles below the ocean surface. The platform provides an interactive way to select ocean locations, dates, and depths and explore the resulting temperature data through maps, charts, and 3D visualizations.

## Features

* 🌍 Interactive ocean map for location selection
* 📍 Point, area, and ocean-wide exploration modes
* 📅 Date-based ocean data exploration
* 🌡️ AI-based subsurface temperature profile reconstruction
* 📊 Temperature profiles and data visualizations
* 🧊 3D visualization of reconstructed temperature data
* 🌊 Ocean data exploration for SST, SSS, SSH, currents, and winds
* ⚡ FastAPI backend for model inference
* 💻 Next.js frontend with an interactive UI

## Project Structure

```text
OceanLense/
│
├── backend/
│   ├── api.py
│   ├── infer.py
│   ├── prepare_input_v2.py
│   ├── requirements.txt
│   └── utils/
│       └── saved_model/
│
├── frontend/
│   ├── app/
│   ├── components/
│   ├── hooks/
│   ├── lib/
│   ├── public/
│   ├── package.json
│   └── ...
│
└── README.md
```

## Tech Stack

### Frontend

* Next.js
* React
* TypeScript
* Tailwind CSS
* React Leaflet
* React Three Fiber
* Drei
* Lucide Icons

### Backend

* Python
* FastAPI
* TensorFlow / Keras
* NumPy
* scikit-learn
* xarray
* Zarr

## How It Works

The application follows a simple workflow:

```text
User selects location
        ↓
User selects date / depth
        ↓
Frontend sends request to backend
        ↓
Backend prepares required ocean and atmospheric inputs
        ↓
AI model reconstructs subsurface temperature
        ↓
Results are returned to the frontend
        ↓
Temperature profile + visualizations are displayed
```

The model uses surface and oceanographic information such as:

* Sea Surface Temperature (SST)
* Sea Surface Salinity (SSS)
* Sea Surface Height / Anomaly (SSH/SLA)
* Ocean currents (U/V)
* Wind components (U/V)
* Available sparse ocean observations

The resulting model output provides a temperature profile through the water column.

## Running the Backend

Go into the backend directory:

```bash
cd backend
```

Create and activate a virtual environment:

```bash
python3 -m venv myvenv
source myvenv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Start the API:

```bash
uvicorn api:app --reload
```

The backend will normally be available at:

```text
http://127.0.0.1:8000
```

## Running the Frontend

Open another terminal and go to the frontend:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The frontend will normally be available at:

```text
http://localhost:3000
```

## Backend API

The frontend communicates with the FastAPI backend to request temperature reconstruction results.

Example request:

```json
{
  "latitude": 20.0,
  "longitude": 75.0,
  "timestamp": "2026-09-12T12:00:00"
}
```

The backend processes the requested location and date, runs the reconstruction model, and returns the generated temperature profile and associated information.

## Model

The backend contains the trained model and supporting preprocessing components required for inference.

The main inference flow is handled by:

```text
infer.py
prepare_input_v2.py
utils/model.py
```

The saved model and preprocessing information are stored under:

```text
backend/utils/saved_model/
```

## Ocean Data

OceanLense works with multiple oceanographic and atmospheric data sources during input preparation, including satellite-derived variables and observational datasets.

The backend supports different data retrieval paths depending on the configured input source.

## Current Scope

The current application focuses on exploring ocean conditions and reconstructing subsurface temperature profiles from available surface and oceanographic observations.

The platform is designed so that additional ocean variables, locations, datasets, and model capabilities can be integrated in the future.

## Future Improvements

* Worldwide ocean coverage
* More detailed depth-wise analysis
* Improved uncertainty estimation
* Additional oceanographic datasets
* Faster inference and data loading
* More advanced 3D ocean visualization
* Historical and time-series comparison
* Deployment of the complete platform

## Team

**OceanLense**

Built as an AI-powered platform for exploring and understanding subsurface ocean conditions.
