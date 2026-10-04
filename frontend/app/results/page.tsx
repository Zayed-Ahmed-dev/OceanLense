"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import {
  Activity,
  ArrowLeft,
  CalendarDays,
  ChevronDown,
  Compass,
  Database,
  Droplets,
  Gauge,
  Layers3,
  Rotate3D,
  Thermometer,
  Waves,
  Wind,
} from "lucide-react";

import type { PredictionResponse } from "@/types/ocean";

import {
  buildTemperaturePoints,
  type TemperaturePoint,
} from "@/lib/temperature";

import { TemperatureCubeScene } from "@/components/results/TemperatureCubeScene";
import { TemperatureProfile } from "@/components/results/TemperatureProfile";
import { TemperatureScale } from "@/components/results/TemperatureScale";
import { TemperatureSummary } from "@/components/results/TemperatureSummary";
import { KeyInsights } from "@/components/results/KeyInsights";
import { UncertaintyPanel } from "@/components/results/UncertaintyPanel";
import { ReconstructionLoading } from "@/components/results/ReconstructionLoading";
import { ReconstructionError } from "@/components/results/ReconstructionError";

interface StoredSelection {
  mode?: string;
  date?: string;
  selectedArea?: {
    north: number;
    south: number;
    east: number;
    west: number;
    centerLat: number;
    centerLon: number;
  } | null;
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatCoord(
  value: number,
  positive: string,
  negative: string,
) {
  const normalized =
    positive === "E" || negative === "W"
      ? ((value + 180) % 360 + 360) % 360 - 180
      : value;

  return `${Math.abs(normalized).toFixed(2)}° ${
    normalized >= 0 ? positive : negative
  }`;
}

function readStoredPrediction(): PredictionResponse | null {
  try {
    const raw =
      sessionStorage.getItem("oceanPrediction") ??
      sessionStorage.getItem("ocean-lens-prediction");

    if (!raw) {
      return null;
    }

    return JSON.parse(raw) as PredictionResponse;
  } catch {
    return null;
  }
}

function readStoredSelection(): StoredSelection {
  try {
    const raw =
      sessionStorage.getItem("oceanSelection") ??
      sessionStorage.getItem("ocean-lens-selection");

    if (!raw) {
      return {};
    }

    return JSON.parse(raw) as StoredSelection;
  } catch {
    return {};
  }
}

export default function ResultsPage() {
  const router = useRouter();

  const [prediction, setPrediction] =
    useState<PredictionResponse | null>(null);

  const [selection, setSelection] =
    useState<StoredSelection>({});

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  const [showUncertainty, setShowUncertainty] =
    useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const data = readStoredPrediction();

      if (!data) {
        setError(
          "No reconstruction was found. Generate a temperature profile from the explorer first.",
        );
      } else {
        setPrediction(data);
        setSelection(readStoredSelection());
      }

      setLoading(false);
    }, 250);

    return () => window.clearTimeout(timer);
  }, []);

  const points = useMemo<TemperaturePoint[]>(
    () =>
      prediction
        ? buildTemperaturePoints(prediction)
        : [],
    [prediction],
  );

  const stats = useMemo(() => {
    if (!points.length) {
      return null;
    }

    const surface = points[0];
    const deepest = points[points.length - 1];

    const warmest = points.reduce((a, b) =>
      b.temperature > a.temperature ? b : a,
    );

    const coldest = points.reduce((a, b) =>
      b.temperature < a.temperature ? b : a,
    );

    let maxDrop = 0;
    let maxDropDepth = surface.depth;

    for (let i = 1; i < points.length; i += 1) {
      const drop =
        points[i - 1].temperature -
        points[i].temperature;

      const interval =
        points[i].depth -
        points[i - 1].depth;

      if (
        interval > 0 &&
        drop / interval > maxDrop
      ) {
        maxDrop = drop / interval;
        maxDropDepth = points[i].depth;
      }
    }

    return {
      surface,
      deepest,
      warmest,
      coldest,
      maxDrop,
      maxDropDepth,
    };
  }, [points]);

  if (loading) {
    return <ReconstructionLoading />;
  }

  if (error || !prediction || !stats) {
    return (
      <ReconstructionError
        message={
          error ??
          "The reconstruction could not be displayed."
        }
        onBack={() => router.push("/")}
      />
    );
  }

  const queryLat = prediction.query.lat;
  const queryLon = prediction.query.lon;

  const displayDate =
    selection.date ?? prediction.query.timestamp;

  const minTemperature = Math.min(
    ...points.map(
      (point) => point.temperature,
    ),
  );

  const maxTemperature = Math.max(
    ...points.map(
      (point) => point.temperature,
    ),
  );

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[#063B4D]">

      {/* =====================================================
          FIXED BACKGROUND
      ====================================================== */}

      <div className="pointer-events-none fixed inset-0 z-0">
        {/* Actual background image */}
        <div className="absolute inset-0 bg-[url('/background.png')] bg-cover bg-center bg-no-repeat" />

        {/* Ocean tint */}
        <div className="absolute inset-0 bg-[#063B4D]/20" />

        {/* Vertical ocean gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#E8F8FB]/40 via-[#02ABD5]/10 to-[#07516D]/35" />

        {/* Soft atmospheric highlights */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_12%_45%,rgba(255,255,255,0.48),transparent_30%),radial-gradient(ellipse_at_85%_34%,rgba(255,255,255,0.42),transparent_26%),radial-gradient(ellipse_at_50%_90%,rgba(2,171,213,0.22),transparent_35%)]" />
      </div>

      {/* =====================================================
          PAGE CONTENT
      ====================================================== */}

      <div className="relative z-10">

        {/* ===================================================
            HEADER
        ==================================================== */}

        <header className="sticky top-0 z-30 flex h-[68px] items-center justify-between border-b border-white/40 bg-[#EFFBFD]/55 px-4 shadow-[0_5px_25px_rgba(4,88,113,0.08)] backdrop-blur-2xl sm:px-6 lg:px-7">

          {/* BRAND */}

          <button
            onClick={() => router.push("/")}
            aria-label="Back to Ocean Lens"
            className="group flex items-center gap-3 text-left"
          >
            <span className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-[13px] border border-white/60 bg-white/55 text-[#02ABD5] shadow-[0_8px_22px_rgba(2,132,166,0.12)] backdrop-blur-xl transition-all duration-200 group-hover:-translate-y-0.5 group-hover:bg-white/70">
              <Waves
                size={22}
                strokeWidth={2.2}
              />

              <span className="absolute inset-0 rounded-[13px] border border-[#02ABD5]/20" />
            </span>

            <span>
              <strong className="block font-['Manrope'] text-[18px] font-extrabold leading-none tracking-[-0.04em] text-[#07516D]">
                Ocean Lens
              </strong>

              <small className="mt-1 block text-[9px] font-medium tracking-[0.02em] text-[#4F7E95]">
                Subsurface Temperature Tracking
              </small>
            </span>
          </button>

          {/* HEADER META */}

          <div className="flex items-center gap-2 sm:gap-3 lg:gap-5">

            <div className="hidden items-center gap-2 text-[11px] font-medium text-[#356D84] sm:flex">
              <CalendarDays
                size={14}
                className="text-[#02ABD5]"
              />

              <span>
                {formatDate(displayDate)}
              </span>
            </div>

            <div className="hidden items-center gap-2 text-[11px] font-medium text-[#356D84] md:flex">
              <Compass
                size={14}
                className="text-[#02ABD5]"
              />

              <span>
                {formatCoord(
                  queryLat,
                  "N",
                  "S",
                )}
                ,{" "}
                {formatCoord(
                  queryLon,
                  "E",
                  "W",
                )}
              </span>
            </div>

            {/* OCEAN DATA NAVIGATION */}

            <div className="hidden lg:block">
              <div className="group relative">

                <button
                  className="flex h-9 items-center gap-2 rounded-full border border-[#02ABD5]/15 bg-white/45 px-3.5 text-[10px] font-bold text-[#075B78] shadow-[0_5px_18px_rgba(8,102,128,0.05)] backdrop-blur-xl transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/70"
                >
                  <Activity
                    size={14}
                    className="text-[#02ABD5]"
                  />

                  <span>
                    Ocean Data
                  </span>

                  <ChevronDown
                    size={13}
                    className="transition-transform duration-200 group-hover:rotate-180"
                  />
                </button>

                {/* DROPDOWN */}

                <div className="pointer-events-none absolute left-0 top-full z-50 mt-2 w-[275px] translate-y-1 rounded-[18px] border border-white/70 bg-[#EFFBFD]/90 p-2 opacity-0 shadow-[0_18px_50px_rgba(7,76,101,0.18)] backdrop-blur-2xl transition-all duration-200 group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100">

                  {/* HEADER */}

                  <div className="px-3 pb-2 pt-2">
                    <span className="text-[8px] font-bold uppercase tracking-[0.15em] text-[#0785A7]">
                      Surface observations
                    </span>

                    <p className="mt-1 text-[9px] leading-[1.5] text-[#628DA0]">
                      Explore the satellite-derived variables used by Ocean Lens.
                    </p>
                  </div>

                  {/* OVERVIEW */}

                  <button
                    onClick={() => router.push("/data")}
                    className="mb-1 flex w-full items-center gap-3 rounded-[12px] p-2.5 text-left transition-all duration-150 hover:bg-white/75"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-[#063B4D]/10 text-[#07516D]">
                      <Database size={16} />
                    </span>

                    <span className="min-w-0">
                      <strong className="block text-[10px] font-bold text-[#075B78]">
                        Ocean Data Overview
                      </strong>

                      <span className="text-[8px] text-[#6A97A8]">
                        All surface observations
                      </span>
                    </span>
                  </button>

                  {/* SST */}

                  <button
                    onClick={() => router.push("/data/sst")}
                    className="flex w-full items-center gap-3 rounded-[12px] p-2.5 text-left transition-all duration-150 hover:bg-white/75"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-[#02ABD5]/10 text-[#02ABD5]">
                      <Thermometer size={16} />
                    </span>

                    <span className="min-w-0">
                      <strong className="block text-[10px] font-bold text-[#075B78]">
                        Sea Surface Temperature
                      </strong>

                      <span className="text-[8px] text-[#6A97A8]">
                        SST · °C
                      </span>
                    </span>
                  </button>

                  {/* SSS */}

                  <button
                    onClick={() => router.push("/data/sss")}
                    className="flex w-full items-center gap-3 rounded-[12px] p-2.5 text-left transition-all duration-150 hover:bg-white/75"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-[#017FBD]/10 text-[#017FBD]">
                      <Droplets size={16} />
                    </span>

                    <span className="min-w-0">
                      <strong className="block text-[10px] font-bold text-[#075B78]">
                        Sea Surface Salinity
                      </strong>

                      <span className="text-[8px] text-[#6A97A8]">
                        SSS · PSU
                      </span>
                    </span>
                  </button>

                  {/* SSH / SLA */}

                  <button
                    onClick={() => router.push("/data/ssh")}
                    className="flex w-full items-center gap-3 rounded-[12px] p-2.5 text-left transition-all duration-150 hover:bg-white/75"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-[#0798B5]/10 text-[#0798B5]">
                      <Gauge size={16} />
                    </span>

                    <span className="min-w-0">
                      <strong className="block text-[10px] font-bold text-[#075B78]">
                        Sea Surface Height / SLA
                      </strong>

                      <span className="text-[8px] text-[#6A97A8]">
                        SSH · SLA · m
                      </span>
                    </span>
                  </button>

                  {/* CURRENTS */}

                  <button
                    onClick={() => router.push("/data/currents")}
                    className="flex w-full items-center gap-3 rounded-[12px] p-2.5 text-left transition-all duration-150 hover:bg-white/75"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-[#02ABD5]/10 text-[#02ABD5]">
                      <Waves size={16} />
                    </span>

                    <span className="min-w-0">
                      <strong className="block text-[10px] font-bold text-[#075B78]">
                        Surface Ocean Currents
                      </strong>

                      <span className="text-[8px] text-[#6A97A8]">
                        U / V · m/s
                      </span>
                    </span>
                  </button>

                  {/* WINDS */}

                  <button
                    onClick={() => router.push("/data/winds")}
                    className="flex w-full items-center gap-3 rounded-[12px] p-2.5 text-left transition-all duration-150 hover:bg-white/75"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-[#017FBD]/10 text-[#017FBD]">
                      <Wind size={16} />
                    </span>

                    <span className="min-w-0">
                      <strong className="block text-[10px] font-bold text-[#075B78]">
                        Surface Winds
                      </strong>

                      <span className="text-[8px] text-[#6A97A8]">
                        U / V · m/s
                      </span>
                    </span>
                  </button>

                </div>
              </div>
            </div>

            <button
              onClick={() => router.push("/")}
              className="group flex h-9 items-center gap-2 rounded-full border border-[#02ABD5]/25 bg-gradient-to-br from-[#0798B5] to-[#017FBD] px-3.5 text-[10px] font-bold text-white shadow-[0_8px_22px_rgba(2,132,166,0.22)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_11px_28px_rgba(2,132,166,0.3)] sm:px-4"
            >
              <ArrowLeft
                size={14}
                className="transition-transform duration-200 group-hover:-translate-x-0.5"
              />

              <span>
                Explorer
              </span>
            </button>

          </div>
        </header>

        {/* ===================================================
            MAIN LAYOUT
        ==================================================== */}

        <section className="mx-auto grid w-full max-w-[1700px] grid-cols-1 gap-4 px-3 py-4 sm:px-5 lg:grid-cols-[250px_minmax(0,1fr)_275px] lg:gap-5 lg:px-7 lg:py-6 xl:grid-cols-[265px_minmax(560px,1fr)_285px]">

          {/* =================================================
              LEFT SIDEBAR
          ================================================== */}

          <aside className="hidden self-start rounded-[22px] border border-white/60 bg-white/55 p-5 shadow-[0_18px_55px_rgba(7,76,101,0.12)] backdrop-blur-2xl lg:block">

            {/* EYEBROW */}

            <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.15em] text-[#0785A7]">
              <Layers3 size={14} />

              Reconstruction
            </div>

            <h1 className="mt-3 font-['Manrope'] text-[26px] font-extrabold leading-[1.08] tracking-[-0.055em] text-[#07516D]">
              Explore beneath
              <br />
              the surface.
            </h1>

            <p className="mt-3 text-[11px] leading-[1.65] text-[#527F94]">
              A depth-wise temperature
              reconstruction generated
              from the Ocean Lens model.
            </p>

            {/* LOCATION */}

            <div className="mt-5 rounded-[15px] border border-[#02ABD5]/10 bg-gradient-to-br from-white/70 to-[#D6F4F9]/60 p-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_7px_20px_rgba(8,105,130,0.05)]">

              <span className="mb-2 block text-[8px] font-semibold uppercase tracking-[0.12em] text-[#6C99AA]">
                Selected point
              </span>

              <strong className="block text-[13px] font-bold leading-[1.6] text-[#075B78]">
                {formatCoord(
                  queryLat,
                  "N",
                  "S",
                )}
              </strong>

              <strong className="block text-[13px] font-bold leading-[1.6] text-[#075B78]">
                {formatCoord(
                  queryLon,
                  "E",
                  "W",
                )}
              </strong>
            </div>

            {/* VISUALIZATION CONTROL */}

            <div className="mt-5 border-t border-[#086E89]/10 pt-4">

              <div className="mb-2.5 flex items-center justify-between text-[11px] font-bold text-[#075B78]">
                <span>
                  Visualization
                </span>

                <Rotate3D
                  size={15}
                  className="text-[#079BB9]"
                />
              </div>

              <button
                onClick={() =>
                  setShowUncertainty(
                    (value) => !value,
                  )
                }
                className={`flex w-full items-center gap-2 rounded-[12px] border px-2.5 py-2.5 text-left text-[10px] transition-all duration-200 ${
                  showUncertainty
                    ? "border-[#02ABD5]/30 bg-[#02ABD5]/10 text-[#075B78]"
                    : "border-[#077B96]/10 bg-white/45 text-[#628DA0] hover:bg-white/70"
                }`}
              >
                <span
                  className={`h-2 w-2 shrink-0 rounded-full transition-all ${
                    showUncertainty
                      ? "bg-[#02ABD5] shadow-[0_0_0_4px_rgba(2,171,213,0.09),0_0_12px_rgba(2,171,213,0.6)]"
                      : "bg-[#9AB9C5]"
                  }`}
                />

                <span>
                  Show uncertainty band
                </span>

                <span className="ml-auto text-[8px] font-bold uppercase tracking-[0.08em] text-[#5E8B9D]">
                  {showUncertainty
                    ? "ON"
                    : "OFF"}
                </span>
              </button>
            </div>

            {/* HINT */}

            <div className="mt-6 flex gap-2.5 text-[9px] leading-[1.55] text-[#6A97A8]">
              <Rotate3D
                size={16}
                className="shrink-0 text-[#078EAF]"
              />

              <span>
                Drag to rotate
                <br />
                Scroll to zoom
              </span>
            </div>
          </aside>

          {/* =================================================
              CENTER
          ================================================== */}

          <section className="min-w-0">

            {/* HERO */}

            <div className="flex flex-col gap-3 px-1 pb-4 sm:px-2 lg:flex-row lg:items-end lg:justify-between">

              <div>
                <span className="block font-['Caveat'] text-[21px] font-semibold text-[#08A2C2] sm:text-[23px]">
                  Hidden layers, revealed.
                </span>

                <h2 className="font-['Manrope'] text-[30px] font-extrabold leading-none tracking-[-0.065em] text-[#07516D] sm:text-[36px] lg:text-[43px]">
                  Subsurface temperature
                  profile
                </h2>

                <p className="mt-2 text-[10px] font-medium text-[#4D7F94] sm:text-[12px]">
                  {points.length} reconstructed
                  depth levels from{" "}
                  {points[0].depth} m to{" "}
                  {points[points.length - 1].depth}{" "}
                  m.
                </p>
              </div>

              <div className="flex w-fit items-center rounded-full border border-[#048BA9]/15 bg-white/55 px-3 py-2 text-[9px] font-semibold text-[#24728A] shadow-[0_5px_16px_rgba(8,102,128,0.05)] backdrop-blur-xl">
                <span className="mr-2 h-1.5 w-1.5 rounded-full bg-[#02ABD5] shadow-[0_0_0_4px_rgba(2,171,213,0.09),0_0_10px_rgba(2,171,213,0.55)]" />

                Model reconstruction
              </div>
            </div>

            {/* =================================================
                3D VISUALIZATION
            ================================================== */}

            <div className="relative h-[58vh] min-h-[430px] overflow-hidden rounded-[24px] border border-white/65 bg-gradient-to-b from-[#DFF7FA]/90 via-[#A9DFE9]/80 to-[#58BFD5]/80 shadow-[0_22px_65px_rgba(7,82,106,0.14),inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur-xl sm:h-[610px] sm:min-h-[480px] sm:rounded-[28px]">

              {/* ATMOSPHERIC GLOW */}

              <div className="pointer-events-none absolute left-[17%] top-[-12%] z-[1] h-[35%] w-[65%] rounded-full bg-white/40 blur-[35px]" />

              <div className="absolute inset-0 z-[2]">
                <TemperatureCubeScene
                  points={points}
                  showUncertainty={
                    showUncertainty
                  }
                />
              </div>

              {/* DEPTH LABELS */}

              <div className="pointer-events-none absolute bottom-[17%] left-3 top-[22%] z-[6] flex flex-col justify-between text-[8px] text-[#397B90] sm:left-[18px] sm:text-[9px]">

                {points.length > 0 && (
                  <>
                    <span>
                      {points[0].depth}m
                    </span>

                    <span>
                      {
                        points[
                          Math.floor(
                            points.length / 3,
                          )
                        ]?.depth ?? ""
                      }
                      m
                    </span>

                    <span>
                      {
                        points[
                          Math.floor(
                            (points.length * 2) /
                              3,
                          )
                        ]?.depth ?? ""
                      }
                      m
                    </span>

                    <span>
                      {
                        points[
                          points.length - 1
                        ].depth
                      }
                      m
                    </span>
                  </>
                )}
              </div>

              {/* TEMPERATURE SCALE */}

              <div className="absolute bottom-4 right-4 z-[7] w-[125px] sm:right-5 sm:w-[175px]">
                <TemperatureScale
                  min={minTemperature}
                  max={maxTemperature}
                />
              </div>
            </div>

            {/* =================================================
                PROFILE
            ================================================== */}

            <div className="mt-4 rounded-[22px] border border-white/60 bg-white/65 p-4 shadow-[0_10px_35px_rgba(7,76,101,0.08)] backdrop-blur-2xl sm:mt-[18px] sm:p-[22px]">

              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">

                <div>
                  <span className="text-[9px] font-bold uppercase tracking-[0.13em] text-[#0785A7]">
                    Depth response
                  </span>

                  <h3 className="mt-1 font-['Manrope'] text-[17px] font-extrabold tracking-[-0.04em] text-[#07516D] sm:text-[19px]">
                    Temperature through the
                    water column
                  </h3>
                </div>

                <span className="w-fit rounded-full border border-[#067995]/10 bg-white/50 px-2.5 py-1.5 text-[8px] font-semibold text-[#4F8194]">
                  {points[0].depth}–
                  {
                    points[
                      points.length - 1
                    ].depth
                  }{" "}
                  m
                </span>
              </div>

              <TemperatureProfile
                points={points}
                showUncertainty={
                  showUncertainty
                }
              />
            </div>
          </section>

          {/* =================================================
              RIGHT INSIGHTS
          ================================================== */}

          <aside className="flex min-w-0 flex-col gap-3">

            <TemperatureSummary
              surface={stats.surface}
              deepest={stats.deepest}
              warmest={stats.warmest}
              coldest={stats.coldest}
            />

            <KeyInsights
              points={points}
            />

            <UncertaintyPanel
              points={points}
            />
          </aside>
        </section>

        {/* ===================================================
            FOOTER
        ==================================================== */}

        <footer className="flex flex-col gap-1.5 border-t border-white/35 bg-white/15 px-5 py-4 text-[8px] text-[#568598] backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between sm:px-7">

          <span className="font-bold text-[#0786A7]">
            Ocean Lens
          </span>

          <span>
            Satellite-informed subsurface
            reconstruction
          </span>

          <span>
            {prediction.query.timestamp}
          </span>
        </footer>
      </div>
    </main>
  );
}