"use client";

import {
  Activity,
  MapPin,
  Navigation,
} from "lucide-react";

import dynamic from "next/dynamic";

import type { OceanArea } from "@/components/map/OceanMap";
import type { SelectionMode } from "@/hooks/useOceanExplorer";

const OceanMap = dynamic(
  () => import("@/components/map/OceanMap"),
  {
    ssr: false,
  },
);

function formatLatitude(value: number) {
  return `${Math.abs(value).toFixed(2)}° ${
    value >= 0 ? "N" : "S"
  }`;
}

function formatLongitude(value: number) {
  return `${Math.abs(value).toFixed(2)}° ${
    value >= 0 ? "E" : "W"
  }`;
}

interface MapWorkspaceProps {
  mode: SelectionMode;
  selectedArea: OceanArea;
  onAreaChange: (area: OceanArea) => void;
  onPointChange: (lat: number, lon: number) => void;
  searchLocation: {
    lat: number;
    lon: number;
  } | null;
}

export default function MapWorkspace({
  mode,
  selectedArea,
  onAreaChange,
  onPointChange,
  searchLocation,
}: MapWorkspaceProps) {
  return (
    <div className="map-shell relative min-h-0 overflow-hidden rounded-[22px] border border-white/90 bg-[#C9E4E9] shadow-[0_18px_60px_rgba(7,91,115,0.08)]">

<OceanMap
  mode={mode}
  selectedArea={selectedArea}
  onAreaChange={onAreaChange}
  onPointChange={onPointChange}
  searchLocation={searchLocation}
/>

      {/* WATER COLOR TINT */}

      <div className="ocean-color-tint" />

      {/* TOP LEFT HUD */}

      <div className="map-hud absolute left-4 top-4 z-[1000]">

        <div className="flex items-center gap-2">

          <div className="flex h-7 w-7 items-center justify-center rounded-[9px] bg-[#06313F] text-white shadow-md">
            <Navigation size={13} />
          </div>

          <div>

            <p className="text-[8px] font-bold uppercase tracking-[0.18em] text-[#67909C]">
              Explorer
            </p>

            <p className="mt-0.5 text-[11px] font-bold text-[#06313F]">
              {mode === "area"
                ? "Area Selection"
                : mode === "point"
                  ? "Point Selection"
                  : "Global Ocean"}
            </p>

          </div>

        </div>

        <div className="mt-3 h-px bg-[#D8E6E9]" />

        <div className="mt-2.5 flex items-center gap-2">

          <div className="map-mode-indicator" />

          <p className="text-[9px] font-medium text-[#517684]">
            {mode === "area"
              ? "Drag anywhere to define an area"
              : mode === "point"
                ? "Click anywhere to place a point"
                : "Pan and zoom to explore the world"}
          </p>

        </div>

      </div>

      {/* BOTTOM LEFT COORDINATE HUD */}

      <div className="map-coordinate-hud absolute bottom-4 left-4 z-[1000]">

        <div className="flex items-center gap-2">

          <MapPin
            size={13}
            className="text-[#0E7C92]"
          />

          <div>

            <p className="text-[7px] font-bold uppercase tracking-[0.18em] text-[#67909C]">
              Representative Point
            </p>

            <p className="mt-0.5 text-[11px] font-bold tabular-nums text-[#06313F]">

              {formatLatitude(
                selectedArea.centerLat,
              )}

              <span className="mx-1.5 text-[#8AA7B0]">
                ·
              </span>

              {formatLongitude(
                selectedArea.centerLon,
              )}

            </p>

          </div>

        </div>

      </div>

      {/* TOP RIGHT MODEL STATUS */}

      <div className="absolute right-4 top-4 z-[1000] hidden rounded-[12px] border border-white/80 bg-white/80 px-3 py-2 shadow-lg shadow-[#06313F]/5 backdrop-blur-xl sm:block">

        <div className="flex items-center gap-2">

          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#E4F1F3] text-[#0E7C92]">
            <Activity size={12} />
          </div>

          <div>

            <p className="text-[7px] font-bold uppercase tracking-[0.16em] text-[#67909C]">
              Model
            </p>

            <p className="text-[9px] font-bold text-[#06313F]">
              Ready for inference
            </p>

          </div>

          <span className="ml-1 h-1.5 w-1.5 rounded-full bg-[#29B88B] shadow-[0_0_0_4px_rgba(41,184,139,0.1)]" />

        </div>

      </div>

      {/* TEMPERATURE SCALE */}

      <div className="map-hud absolute bottom-4 right-4 z-[1000] hidden min-w-[190px] sm:block">

        <p className="text-[7px] font-bold uppercase tracking-[0.18em] text-[#67909C]">
          Temperature Scale
        </p>

        <div className="mt-2 h-1.5 w-full rounded-full bg-gradient-to-r from-[#2A5CAE] via-[#3FAE8A] via-[#E8C34A] to-[#C24B3A]" />

        <div className="mt-1.5 flex items-center justify-between text-[8px] font-bold tabular-nums text-[#06313F]">

          <span>10°C</span>
          <span>15°C</span>
          <span>20°C</span>
          <span>25°C</span>
          <span>30°C</span>

        </div>

      </div>

    </div>
  );
}