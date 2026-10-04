"use client";

import {
  Activity,
  ArrowDownRight,
  ArrowLeft,
  ArrowUpRight,
  CalendarDays,
  ChevronRight,
  Droplets,
  MapPin,
  Thermometer,
  Waves,
} from "lucide-react";

import { OceanDataLayout } from "@/components/data/OceanDataLayout";
import { DataChart } from "@/components/data/DataChart";
import { DEMO_OCEAN_DATA } from "@/lib/demoOceanData";

const sstHistory = [
  27.91,
  28.05,
  28.18,
  28.31,
  28.42,
  28.57,
  28.76,
  28.63,
];

function formatShortDate(date: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
  }).format(date);
}

function formatCurrentDateTime(date: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

function getRecentDates(days: number) {
  const today = new Date();

  return Array.from({ length: days }, (_, index) => {
    const date = new Date(today);

    date.setDate(today.getDate() - (days - 1 - index));

    return formatShortDate(date);
  });
}

const timeLabels = getRecentDates(8);

const spatialCells = [
  [27.91, 28.04, 28.18, 28.27, 28.34],
  [28.02, 28.15, 28.27, 28.39, 28.51],
  [28.11, 28.23, 28.42, 28.55, 28.63],
  [28.04, 28.18, 28.36, 28.57, 28.76],
  [27.98, 28.11, 28.25, 28.43, 28.61],
];

function formatCoordinate(value: number, positive: string, negative: string) {
  return `${Math.abs(value).toFixed(2)}° ${value >= 0 ? positive : negative}`;
}

function getSstCellStyle(value: number) {
  const min = DEMO_OCEAN_DATA.sst.min;
  const max = DEMO_OCEAN_DATA.sst.max;

  const normalized = Math.max(
    0,
    Math.min(1, (value - min) / (max - min)),
  );

  const hue = 195 - normalized * 175;
  const saturation = 72;
  const lightness = 49 + normalized * 4;

  return {
    background: `hsl(${hue} ${saturation}% ${lightness}%)`,
  };
}

export default function SstDataPage() {
  const sst = DEMO_OCEAN_DATA.sst;
  const currentDateTime = new Date();

  const range = sst.max - sst.min;
  const midpoint = (sst.max + sst.min) / 2;

  return (
    <OceanDataLayout
      eyebrow="Ocean Data / SST"
      title="Sea surface temperature."
      description="Explore the thermal state of the ocean surface surrounding the selected location and understand how SST contributes to the Ocean Lens reconstruction."
    >
      <div className="mx-auto max-w-[1440px] px-4 pb-16 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="mb-6 flex flex-wrap items-center gap-2 text-[12px] font-bold text-[#07516D]/60">
          <a
            href="/data"
            className="transition hover:text-[#017FBD]"
          >
            Ocean Data
          </a>

          <ChevronRight size={14} />

          <span className="text-[#07516D]">SST</span>
        </div>

        {/* Demo notice */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#02ABD5]/20 bg-white/55 px-5 py-3 shadow-[0_12px_40px_rgba(7,81,109,0.06)] backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#02ABD5]/10 text-[#017FBD]">
              <Activity size={17} />
            </div>

            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#017FBD]">
                Demonstration dataset
              </p>

              <p className="mt-0.5 text-[12px] font-medium text-[#07516D]/65">
                Values are currently hardcoded and will later be replaced by
                live ocean observations.
              </p>
            </div>
          </div>

          <a
            href="/data"
            className="inline-flex items-center gap-2 rounded-xl border border-[#07516D]/10 bg-white/65 px-3.5 py-2 text-[12px] font-extrabold text-[#07516D] transition hover:-translate-y-0.5 hover:border-[#02ABD5]/30 hover:text-[#017FBD]"
          >
            <ArrowLeft size={14} />
            All ocean data
          </a>
        </div>

        {/* Location strip */}
        <section className="mb-6 overflow-hidden rounded-[28px] border border-white/60 bg-white/55 shadow-[0_24px_80px_rgba(7,81,109,0.10)] backdrop-blur-2xl">
          <div className="flex flex-col gap-5 px-6 py-5 lg:flex-row lg:items-center lg:justify-between lg:px-8">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#017FBD]">
                Observation context
              </p>

              <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-2">
                <div className="flex items-center gap-2 text-[#07516D]">
                  <MapPin size={16} className="text-[#02ABD5]" />

                  <span className="text-[14px] font-extrabold">
                    {formatCoordinate(
                      DEMO_OCEAN_DATA.location.lat,
                      "N",
                      "S",
                    )}
                    {" · "}
                    {formatCoordinate(
                      DEMO_OCEAN_DATA.location.lon,
                      "E",
                      "W",
                    )}
                  </span>
                </div>

                <div className="hidden h-4 w-px bg-[#07516D]/15 sm:block" />

                <div className="flex items-center gap-2 text-[#07516D]/70">
                  <CalendarDays size={15} className="text-[#017FBD]" />

                  <span className="text-[12px] font-bold">
                    {formatCurrentDateTime(currentDateTime)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-[#02ABD5]/15 bg-[#02ABD5]/5 px-4 py-3">
              <Thermometer size={19} className="text-[#017FBD]" />

              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#07516D]/50">
                  Variable
                </p>

                <p className="text-[13px] font-extrabold text-[#07516D]">
                  Sea Surface Temperature
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Main metrics */}
        <section className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {/* Current */}
          <div className="group rounded-[25px] border border-white/65 bg-white/65 p-5 shadow-[0_20px_60px_rgba(7,81,109,0.08)] backdrop-blur-2xl transition duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#02ABD5]/10 text-[#017FBD]">
                <Thermometer size={20} />
              </div>

              <span className="rounded-full bg-[#02ABD5]/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-[#017FBD]">
                Current
              </span>
            </div>

            <p className="mt-5 text-[11px] font-black uppercase tracking-[0.16em] text-[#07516D]/45">
              Surface temperature
            </p>

            <div className="mt-1 flex items-end gap-2">
              <strong className="font-['Manrope'] text-[34px] font-black tracking-[-0.04em] text-[#063B4D]">
                {sst.value.toFixed(2)}
              </strong>

              <span className="mb-1.5 text-[13px] font-extrabold text-[#07516D]/55">
                {sst.unit}
              </span>
            </div>
          </div>

          {/* Minimum */}
          <div className="group rounded-[25px] border border-white/65 bg-white/65 p-5 shadow-[0_20px_60px_rgba(7,81,109,0.08)] backdrop-blur-2xl transition duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#017FBD]/10 text-[#017FBD]">
                <ArrowDownRight size={20} />
              </div>

              <span className="rounded-full bg-[#017FBD]/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-[#017FBD]">
                Minimum
              </span>
            </div>

            <p className="mt-5 text-[11px] font-black uppercase tracking-[0.16em] text-[#07516D]/45">
              Observed range
            </p>

            <div className="mt-1 flex items-end gap-2">
              <strong className="font-['Manrope'] text-[34px] font-black tracking-[-0.04em] text-[#063B4D]">
                {sst.min.toFixed(2)}
              </strong>

              <span className="mb-1.5 text-[13px] font-extrabold text-[#07516D]/55">
                {sst.unit}
              </span>
            </div>
          </div>

          {/* Maximum */}
          <div className="group rounded-[25px] border border-white/65 bg-white/65 p-5 shadow-[0_20px_60px_rgba(7,81,109,0.08)] backdrop-blur-2xl transition duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#07C4DF]/10 text-[#017FBD]">
                <ArrowUpRight size={20} />
              </div>

              <span className="rounded-full bg-[#07C4DF]/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-[#017FBD]">
                Maximum
              </span>
            </div>

            <p className="mt-5 text-[11px] font-black uppercase tracking-[0.16em] text-[#07516D]/45">
              Observed range
            </p>

            <div className="mt-1 flex items-end gap-2">
              <strong className="font-['Manrope'] text-[34px] font-black tracking-[-0.04em] text-[#063B4D]">
                {sst.max.toFixed(2)}
              </strong>

              <span className="mb-1.5 text-[13px] font-extrabold text-[#07516D]/55">
                {sst.unit}
              </span>
            </div>
          </div>

          {/* Range */}
          <div className="group rounded-[25px] border border-white/65 bg-white/65 p-5 shadow-[0_20px_60px_rgba(7,81,109,0.08)] backdrop-blur-2xl transition duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#029CD2]/10 text-[#017FBD]">
                <Waves size={20} />
              </div>

              <span className="rounded-full bg-[#029CD2]/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-[#017FBD]">
                Spread
              </span>
            </div>

            <p className="mt-5 text-[11px] font-black uppercase tracking-[0.16em] text-[#07516D]/45">
              Temperature range
            </p>

            <div className="mt-1 flex items-end gap-2">
              <strong className="font-['Manrope'] text-[34px] font-black tracking-[-0.04em] text-[#063B4D]">
                {range.toFixed(2)}
              </strong>

              <span className="mb-1.5 text-[13px] font-extrabold text-[#07516D]/55">
                {sst.unit}
              </span>
            </div>
          </div>
        </section>

        {/* Visualization row */}
        <section className="grid gap-6 xl:grid-cols-[1.5fr_0.85fr]">
          {/* Spatial visualization */}
          <div className="overflow-hidden rounded-[30px] border border-white/65 bg-white/60 shadow-[0_24px_80px_rgba(7,81,109,0.10)] backdrop-blur-2xl">
            <div className="flex flex-col gap-3 border-b border-[#07516D]/10 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#017FBD]">
                  Spatial field
                </p>

                <h2 className="mt-1 font-['Manrope'] text-[20px] font-black tracking-[-0.025em] text-[#063B4D]">
                  Surface temperature distribution
                </h2>
              </div>

              <div className="flex items-center gap-2 text-[11px] font-bold text-[#07516D]/55">
                <span>{sst.min.toFixed(2)}°C</span>

                <div className="h-2 w-24 rounded-full bg-gradient-to-r from-[#017FBD] via-[#02ABD5] to-[#07C4DF]" />

                <span>{sst.max.toFixed(2)}°C</span>
              </div>
            </div>

            <div className="p-5 sm:p-7">
              <div className="relative overflow-hidden rounded-[24px] border border-white/60 bg-[#063B4D] p-3 shadow-[inset_0_0_50px_rgba(2,171,213,0.12)]">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(7,196,223,0.15),transparent_35%),radial-gradient(circle_at_75%_80%,rgba(2,171,213,0.16),transparent_40%)]" />

                <div className="relative grid grid-cols-5 gap-1.5 sm:gap-2">
                  {spatialCells.flatMap((row, rowIndex) =>
                    row.map((value, columnIndex) => (
                      <div
                        key={`${rowIndex}-${columnIndex}`}
                        className="group relative aspect-square overflow-hidden rounded-xl transition duration-300 hover:z-10 hover:scale-[1.05]"
                        style={getSstCellStyle(value)}
                      >
                        <div className="absolute inset-0 bg-white/5 opacity-0 transition group-hover:opacity-100" />

                        <div className="absolute inset-x-1 bottom-1 rounded-md bg-black/15 px-1 py-1 text-center text-[8px] font-black text-white opacity-0 backdrop-blur-sm transition group-hover:opacity-100 sm:text-[9px]">
                          {value.toFixed(2)}°
                        </div>
                      </div>
                    )),
                  )}
                </div>

                {/* Selected location */}
                <div
                  className="pointer-events-none absolute"
                  style={{
                    left: "51%",
                    top: "58%",
                  }}
                >
                  <div className="relative flex h-5 w-5 items-center justify-center">
                    <div className="absolute h-5 w-5 animate-ping rounded-full bg-white/50" />

                    <div className="relative h-2.5 w-2.5 rounded-full border-2 border-white bg-[#063B4D] shadow-lg" />
                  </div>
                </div>
              </div>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-[#063B4D]" />

                  <span className="text-[11px] font-extrabold text-[#07516D]/65">
                    Selected location
                  </span>
                </div>

                <p className="text-[11px] font-medium text-[#07516D]/45">
                  Demonstration spatial field · not a live satellite layer
                </p>
              </div>
            </div>
          </div>

          {/* Interpretation */}
          <div className="flex flex-col rounded-[30px] border border-white/65 bg-white/60 p-6 shadow-[0_24px_80px_rgba(7,81,109,0.10)] backdrop-blur-2xl sm:p-7">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#02ABD5]/10 text-[#017FBD]">
              <Droplets size={21} />
            </div>

            <p className="mt-6 text-[10px] font-black uppercase tracking-[0.2em] text-[#017FBD]">
              Observation profile
            </p>

            <h2 className="mt-2 font-['Manrope'] text-[24px] font-black leading-tight tracking-[-0.035em] text-[#063B4D]">
              A warm surface state
            </h2>

            <p className="mt-4 text-[13px] font-medium leading-6 text-[#07516D]/65">
              The demonstration field places the selected point at{" "}
              <strong className="font-extrabold text-[#07516D]">
                {sst.value.toFixed(2)}°C
              </strong>
              , within an observed range of{" "}
              <strong className="font-extrabold text-[#07516D]">
                {sst.min.toFixed(2)}–{sst.max.toFixed(2)}°C
              </strong>
              .
            </p>

            <div className="mt-7 space-y-3">
              <div className="rounded-2xl border border-[#07516D]/8 bg-white/55 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-extrabold text-[#07516D]/55">
                    Current vs. midpoint
                  </span>

                  <span className="text-[12px] font-black text-[#017FBD]">
                    {sst.value >= midpoint ? "Above" : "Below"}
                  </span>
                </div>

                <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#07516D]/8">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#017FBD] to-[#02ABD5]"
                    style={{
                      width: `${Math.max(
                        8,
                        Math.min(
                          100,
                          ((sst.value - sst.min) / range) * 100,
                        ),
                      )}%`,
                    }}
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-[#07516D]/8 bg-white/55 p-4">
                <p className="text-[11px] font-extrabold text-[#07516D]/55">
                  Dataset description
                </p>

                <p className="mt-2 text-[12px] font-medium leading-5 text-[#07516D]/65">
                  {sst.description}. This page is currently using a small
                  demonstration dataset designed around the Ocean Lens
                  workflow.
                </p>
              </div>
            </div>

            <div className="mt-auto pt-7">
              <div className="rounded-2xl bg-gradient-to-br from-[#063B4D] to-[#07516D] p-5 text-white shadow-[0_18px_50px_rgba(6,59,77,0.18)]">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#07C4DF]">
                  Ocean Lens connection
                </p>

                <p className="mt-2 text-[13px] font-bold leading-5 text-white/85">
                  SST is one of the surface observations used to provide
                  environmental context for the subsurface temperature
                  reconstruction.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Trend */}
        <section className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
          <div className="rounded-[30px] border border-white/65 bg-white/60 p-6 shadow-[0_24px_80px_rgba(7,81,109,0.10)] backdrop-blur-2xl sm:p-7">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#017FBD]">
                  Temporal signal
                </p>

                <h2 className="mt-1 font-['Manrope'] text-[21px] font-black tracking-[-0.03em] text-[#063B4D]">
                  Recent SST evolution
                </h2>
              </div>

              <span className="text-[11px] font-bold text-[#07516D]/45">
                8-day demonstration series
              </span>
            </div>

            <div className="mt-6">
              <DataChart
                title=""
                subtitle=""
                values={sstHistory}
                labels={timeLabels}
                unit="°C"
              />
            </div>
          </div>

          <div className="rounded-[30px] border border-white/65 bg-white/60 p-6 shadow-[0_24px_80px_rgba(7,81,109,0.10)] backdrop-blur-2xl sm:p-7">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#017FBD]">
              Signal summary
            </p>

            <h2 className="mt-1 font-['Manrope'] text-[21px] font-black tracking-[-0.03em] text-[#063B4D]">
              What the series shows
            </h2>

            <div className="mt-6 space-y-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#07516D]/40">
                  Start
                </p>

                <p className="mt-1 text-[23px] font-black text-[#063B4D]">
                  {sstHistory[0].toFixed(2)}°C
                </p>
              </div>

              <div className="h-px bg-[#07516D]/10" />

              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#07516D]/40">
                  Latest
                </p>

                <p className="mt-1 text-[23px] font-black text-[#063B4D]">
                  {sstHistory[sstHistory.length - 1].toFixed(2)}°C
                </p>
              </div>

              <div className="h-px bg-[#07516D]/10" />

              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#07516D]/40">
                  Change
                </p>

                <p className="mt-1 flex items-center gap-2 text-[23px] font-black text-[#017FBD]">
                  +
                  {(
                    sstHistory[sstHistory.length - 1] - sstHistory[0]
                  ).toFixed(2)}
                  °C
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Model pipeline */}
        <section className="mt-6 overflow-hidden rounded-[30px] border border-white/65 bg-white/60 shadow-[0_24px_80px_rgba(7,81,109,0.10)] backdrop-blur-2xl">
          <div className="px-6 py-6 sm:px-8">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#017FBD]">
              Ocean Lens pipeline
            </p>

            <h2 className="mt-1 font-['Manrope'] text-[21px] font-black tracking-[-0.03em] text-[#063B4D]">
              From surface observation to subsurface reconstruction
            </h2>

            <div className="mt-7 grid gap-3 md:grid-cols-[1fr_auto_1fr_auto_1fr] md:items-center">
              <div className="rounded-2xl border border-[#02ABD5]/15 bg-[#02ABD5]/5 p-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#017FBD] shadow-sm">
                  <Thermometer size={18} />
                </div>

                <p className="mt-4 text-[10px] font-black uppercase tracking-[0.14em] text-[#017FBD]">
                  Surface input
                </p>

                <p className="mt-1 text-[14px] font-black text-[#063B4D]">
                  SST
                </p>

                <p className="mt-2 text-[11px] font-medium leading-5 text-[#07516D]/55">
                  Sea surface temperature observation.
                </p>
              </div>

              <ChevronRight
                className="mx-auto hidden text-[#02ABD5] md:block"
                size={22}
              />

              <div className="rounded-2xl border border-[#017FBD]/15 bg-[#017FBD]/5 p-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#017FBD] shadow-sm">
                  <Activity size={18} />
                </div>

                <p className="mt-4 text-[10px] font-black uppercase tracking-[0.14em] text-[#017FBD]">
                  Reconstruction
                </p>

                <p className="mt-1 text-[14px] font-black text-[#063B4D]">
                  Ocean Lens Model
                </p>

                <p className="mt-2 text-[11px] font-medium leading-5 text-[#07516D]/55">
                  Combines surface observations to reconstruct the ocean
                  interior.
                </p>
              </div>

              <ChevronRight
                className="mx-auto hidden text-[#02ABD5] md:block"
                size={22}
              />

              <div className="rounded-2xl border border-[#07C4DF]/15 bg-[#07C4DF]/5 p-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#017FBD] shadow-sm">
                  <Waves size={18} />
                </div>

                <p className="mt-4 text-[10px] font-black uppercase tracking-[0.14em] text-[#017FBD]">
                  Model output
                </p>

                <p className="mt-1 text-[14px] font-black text-[#063B4D]">
                  3D Temperature Profile
                </p>

                <p className="mt-2 text-[11px] font-medium leading-5 text-[#07516D]/55">
                  Estimated temperature through the water column.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Bottom navigation */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <a
            href="/data"
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/70 bg-white/60 px-5 py-3 text-[12px] font-extrabold text-[#07516D] shadow-sm backdrop-blur-xl transition hover:-translate-y-0.5 hover:text-[#017FBD]"
          >
            <ArrowLeft size={15} />
            Back to Ocean Data
          </a>

          <a
            href="/data/sss"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#063B4D] px-5 py-3 text-[12px] font-extrabold text-white shadow-[0_12px_35px_rgba(6,59,77,0.18)] transition hover:-translate-y-0.5 hover:bg-[#07516D]"
          >
            Explore SSS
            <ChevronRight size={15} />
          </a>
        </div>
      </div>
    </OceanDataLayout>
  );
}