"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { getTemperaturePrediction } from "@/lib/api";

import type { OceanArea } from "@/components/map/OceanMap";

export type SelectionMode = "entire" | "area" | "point";

export const ENTIRE_OCEAN: OceanArea = {
  north: 90,
  south: -90,
  east: 180,
  west: -180,
  centerLat: 17.5,
  centerLon: 75,
};

export function useOceanExplorer() {
  const router = useRouter();

  const [mode, setMode] =
    useState<SelectionMode>("entire");

  const [selectedArea, setSelectedArea] =
    useState<OceanArea>(ENTIRE_OCEAN);

  const [date, setDate] =
    useState("2026-09-12");

  const [isGenerating, setIsGenerating] =
    useState(false);

  const [generationError, setGenerationError] =
    useState<string | null>(null);

  /*
   * Location that the map should move to.
   */
  const [searchLocation, setSearchLocation] =
    useState<{
      lat: number;
      lon: number;
    } | null>(null);

  function selectEntireOcean() {
    setMode("entire");
    setSelectedArea(ENTIRE_OCEAN);
  }

  function selectCustomArea() {
    setMode("area");
  }

  function selectPoint() {
    setMode("point");
  }

  /*
   * Called when the user clicks on the map.
   */
function handlePointChange(
  lat: number,
  lon: number,
) {
  setMode("point");

  setSelectedArea({
    north: lat,
    south: lat,
    east: lon,
    west: lon,
    centerLat: lat,
    centerLon: lon,
  });
}

  /*
   * Called when the user:
   * - searches for a location
   * - manually enters latitude/longitude
   */
function handleLocationChange(
  lat: number,
  lon: number,
) {
  setMode("point");

  setSelectedArea({
    north: lat,
    south: lat,
    east: lon,
    west: lon,
    centerLat: lat,
    centerLon: lon,
  });

  setSearchLocation({
    lat,
    lon,
  });
}

  async function handleGenerateTemperature() {
    if (isGenerating) {
      return;
    }

    setIsGenerating(true);
    setGenerationError(null);

    router.push("/reconstructing");

    try {
      const prediction =
        await getTemperaturePrediction({
          lat: selectedArea.centerLat,
          lon: selectedArea.centerLon,
          timestamp: `${date}T12:00:00`,
          source: "cds",
        });

      sessionStorage.setItem(
        "ocean-lens-prediction",
        JSON.stringify(prediction),
      );

      sessionStorage.setItem(
        "ocean-lens-selection",
        JSON.stringify({
          mode,
          latitude: selectedArea.centerLat,
          longitude: selectedArea.centerLon,
          date,
          area:
            mode === "area"
              ? {
                  north: selectedArea.north,
                  south: selectedArea.south,
                  east: selectedArea.east,
                  west: selectedArea.west,
                }
              : null,
        }),
      );

      router.push("/results");
    } catch (error) {
      console.error(
        "Temperature generation failed:",
        error,
      );

      const message =
        error instanceof Error
          ? error.message
          : "Unable to generate temperature reconstruction.";

      sessionStorage.setItem(
        "ocean-lens-generation-error",
        message,
      );

      router.push("/");
    } finally {
      setIsGenerating(false);
    }
  }

  return {
    mode,
    selectedArea,
    date,
    isGenerating,
    generationError,

    searchLocation,

    setDate,
    setSelectedArea,

    selectEntireOcean,
    selectCustomArea,
    selectPoint,

    handlePointChange,
    handleLocationChange,

    handleGenerateTemperature,
  };
}