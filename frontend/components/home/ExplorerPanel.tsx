"use client";

import { useState } from "react";

import {
  ChevronRight,
  Globe2,
  Layers3,
  ScanSearch,
} from "lucide-react";

import type { OceanArea } from "@/components/map/OceanMap";
import type { SelectionMode } from "@/hooks/useOceanExplorer";

import SelectionModePanel from "./SelectionMode";
import LocationPanel from "./LocationPanel";
import DateSelector from "./DateSelector";
import GenerateButton from "./GenerateButton";
import DepthSelector from "./DepthSelector";

interface ExplorerPanelProps {
  mode: SelectionMode;
  selectedArea: OceanArea;
  date: string;
  isGenerating: boolean;
  generationError: string | null;
  onEntireOcean: () => void;
  onArea: () => void;
  onPoint: () => void;
  onDateChange: (date: string) => void;
  onGenerate: () => void;
  onLocationChange: (lat: number, lon: number) => void;
}

export default function ExplorerPanel({
  mode,
  selectedArea,
  date,
  isGenerating,
  generationError,
  onEntireOcean,
  onArea,
  onPoint,
  onDateChange,
  onGenerate,
  onLocationChange,
}: ExplorerPanelProps) {
  const [depth, setDepth] = useState(200);
  const [depthDifference, setDepthDifference] = useState(10);

  return (
    <aside className="control-panel flex min-h-0 flex-col overflow-hidden rounded-[22px] border border-white/90 bg-white/85 shadow-[0_18px_60px_rgba(7,81,109,0.07)] backdrop-blur-2xl">

      <div className="min-h-0 flex-1 overflow-y-auto p-4">

        {/* PANEL HEADER */}

        <div className="mb-5 flex items-center justify-between">

          <div>

            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#4F7E95]">
              Workspace
            </p>

            <h2 className="mt-1 text-[15px] font-bold tracking-[-0.02em] text-[#07516D]">
              Ocean Explorer
            </h2>

          </div>

          <div className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-[#E3F7FA] text-[#02ABD5]">
            <ScanSearch size={16} />
          </div>

        </div>

        {/* COVERAGE */}

        <div className="panel-section">

          <div className="mb-2 flex items-center gap-2">

            <Globe2
              size={13}
              className="text-[#02ABD5]"
            />

            <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#4F7E95]">
              Coverage
            </p>

          </div>

          <div className="rounded-[13px] border border-[#CFEEF5] bg-gradient-to-br from-[#F4FCFE] to-[#E7F8FB] p-3">

            <div className="flex items-start justify-between">

              <div>

                <p className="text-[12px] font-bold text-[#07516D]">
                  Global Ocean
                </p>

                <p className="mt-1 max-w-[210px] text-[10px] leading-[1.45] text-[#527F94]">
                  Explore and reconstruct subsurface
                  temperatures worldwide.
                </p>

              </div>

              <div className="flex items-center gap-1.5 text-[#02ABD5]">

                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white shadow-sm">
                  <Layers3 size={14} />
                </div>

                <ChevronRight
                  size={13}
                  strokeWidth={2.4}
                  className="opacity-70"
                />

              </div>

            </div>

          </div>

        </div>

        <div className="my-5 h-px bg-[#DDF0F3]" />

        {/* SELECTION */}

        <SelectionModePanel
          mode={mode}
          onEntireOcean={onEntireOcean}
          onArea={onArea}
          onPoint={onPoint}
        />

        <div className="my-5 h-px bg-[#DDF0F3]" />

        {/* LOCATION */}

        <LocationPanel
          mode={mode}
          selectedArea={selectedArea}
          onLocationChange={onLocationChange}
        />

        <div className="my-5 h-px bg-[#DDF0F3]" />

        {/* DATE */}

        <DateSelector
          date={date}
          onChange={onDateChange}
        />

        <div className="my-5 h-px bg-[#DDF0F3]" />

        {/* DEPTH */}

        <DepthSelector
          depth={depth}
          depthDifference={depthDifference}
          onDepthChange={setDepth}
          onDepthDifferenceChange={setDepthDifference}
        />

      </div>

      {/* GENERATE */}

      <GenerateButton
        isGenerating={isGenerating}
        error={generationError}
        onGenerate={onGenerate}
      />

    </aside>
  );
}