export interface PredictionRequest {
  lat: number;
  lon: number;
  timestamp: string;
  source?: "gcs" | "cds";
  include_glorys?: boolean;
  include_argo?: boolean;
}

export interface PredictionResponse {
  query: {
    lat: number;
    lon: number;
    timestamp: string;
  };

  depth_grid_m: number[];

  temperature_c: number[];

  uncertainty_std_c: number[];

  p05_c: number[];

  p50_c: number[];

  p95_c: number[];

  glorys_profile_c?: number[] | null;

  argo_profile_c?: number[] | null;

  argo_meta?: Record<string, unknown> | null;

  glorys_meta?: Record<string, unknown> | null;
}