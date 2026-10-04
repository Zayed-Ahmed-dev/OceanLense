"use client";

import ExplorerPanel from "@/components/home/ExplorerPanel";
import MapWorkspace from "@/components/home/MapWorkspace";
import OceanHeader from "@/components/home/OceanHeader";

import { useOceanExplorer } from "@/hooks/useOceanExplorer";

export default function Home() {
  const explorer = useOceanExplorer();

  return (
    <main className="relative flex h-screen flex-col overflow-hidden bg-[#063B4D]">
      {/* =========================================================
          OCEAN BACKGROUND
          ========================================================= */}

      <div
        className="absolute inset-0 bg-[url('/background.png')] bg-cover bg-center bg-no-repeat"
        aria-hidden="true"
      />

      {/* Dark ocean tint */}
      <div
        className="absolute inset-0 bg-[#063B4D]/25"
        aria-hidden="true"
      />

      {/* Soft cyan atmospheric layer */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-[#02ABD5]/10 via-transparent to-[#07516D]/30"
        aria-hidden="true"
      />

      {/* =========================================================
          CONTENT
          ========================================================= */}

      <div className="relative z-10 flex min-h-0 flex-1 flex-col">
        {/* HEADER */}
        <OceanHeader />

        {/* WORKSPACE */}
        <section className="mx-auto flex min-h-0 w-full max-w-[1600px] flex-1 px-4 py-4 lg:px-6">
          <div className="grid h-full min-h-0 w-full gap-4 lg:grid-cols-[310px_minmax(0,1fr)]">
            {/* CONTROL PANEL */}
            <ExplorerPanel
              mode={explorer.mode}
              selectedArea={explorer.selectedArea}
              date={explorer.date}
              isGenerating={explorer.isGenerating}
              generationError={explorer.generationError}
              onEntireOcean={explorer.selectEntireOcean}
              onArea={explorer.selectCustomArea}
              onPoint={explorer.selectPoint}
              onDateChange={explorer.setDate}
              onGenerate={explorer.handleGenerateTemperature}
              onLocationChange={explorer.handleLocationChange}
            />

            {/* MAP */}
            <MapWorkspace
              mode={explorer.mode}
              selectedArea={explorer.selectedArea}
              onAreaChange={explorer.setSelectedArea}
              onPointChange={explorer.handlePointChange}
              searchLocation={explorer.searchLocation}
            />
          </div>
        </section>

        {/* MOBILE FOOTER */}
        <div className="flex h-6 shrink-0 items-center justify-center text-[7px] font-medium tracking-[0.08em] text-white/60 lg:hidden">
          OCEAN LENS · SUBSURFACE TEMPERATURE INTELLIGENCE
        </div>
      </div>
    </main>
  );
}