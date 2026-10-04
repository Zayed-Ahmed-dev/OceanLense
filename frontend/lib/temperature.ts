import type { PredictionResponse } from "@/types/ocean";

export interface TemperaturePoint {
  depth: number;
  temperature: number;
  std: number;
  p05: number;
  p50: number;
  p95: number;
}

export function buildTemperaturePoints(
  prediction: PredictionResponse,
): TemperaturePoint[] {
  return prediction.depth_grid_m.map(
    (depth, index) => ({
      depth,
      temperature:
        prediction.temperature_c[index] ?? 0,
      std:
        prediction.uncertainty_std_c[index] ?? 0,
      p05:
        prediction.p05_c[index] ?? 0,
      p50:
        prediction.p50_c[index] ?? 0,
      p95:
        prediction.p95_c[index] ?? 0,
    }),
  );
}

export function getTemperatureAtDepth(
  profile: TemperaturePoint[],
  targetDepth: number,
): TemperaturePoint | null {
  if (profile.length === 0) {
    return null;
  }

  return profile.reduce((closest, point) => {
    return Math.abs(point.depth - targetDepth) <
      Math.abs(closest.depth - targetDepth)
      ? point
      : closest;
  });
}

export function getSurfaceTemperature(
  profile: TemperaturePoint[],
): TemperaturePoint | null {
  return profile[0] ?? null;
}

export function getDeepestTemperature(
  profile: TemperaturePoint[],
): TemperaturePoint | null {
  return profile.length > 0
    ? profile[profile.length - 1]
    : null;
}

export function getMinimumTemperature(
  profile: TemperaturePoint[],
): number | null {
  if (profile.length === 0) {
    return null;
  }

  return Math.min(
    ...profile.map((point) => point.temperature),
  );
}

export function getMaximumTemperature(
  profile: TemperaturePoint[],
): number | null {
  if (profile.length === 0) {
    return null;
  }

  return Math.max(
    ...profile.map((point) => point.temperature),
  );
}

export function getTemperatureDifference(
  profile: TemperaturePoint[],
  shallowDepth: number,
  deepDepth: number,
): number | null {
  const shallow = getTemperatureAtDepth(
    profile,
    shallowDepth,
  );

  const deep = getTemperatureAtDepth(
    profile,
    deepDepth,
  );

  if (!shallow || !deep) {
    return null;
  }

  return shallow.temperature - deep.temperature;
}

export function normalizeTemperature(
  temperature: number,
  minTemperature: number,
  maxTemperature: number,
): number {
  if (maxTemperature === minTemperature) {
    return 0.5;
  }

  return Math.max(
    0,
    Math.min(
      1,
      (temperature - minTemperature) /
        (maxTemperature - minTemperature),
    ),
  );
}