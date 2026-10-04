import type {
  PredictionRequest,
  PredictionResponse,
} from "@/types/ocean";

export async function getTemperaturePrediction(
  request: PredictionRequest,
): Promise<PredictionResponse> {
  const response = await fetch("/api/predict", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  let data: unknown;

  try {
    data = await response.json();
  } catch {
    throw new Error("Invalid response from prediction server");
  }

  if (!response.ok) {
    const errorMessage =
      typeof data === "object" &&
      data !== null &&
      "error" in data &&
      typeof data.error === "string"
        ? data.error
        : "Prediction failed";

    throw new Error(errorMessage);
  }

  return data as PredictionResponse;
}