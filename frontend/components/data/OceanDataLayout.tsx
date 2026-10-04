"use client";

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
  Thermometer,
  Waves,
  Wind,
} from "lucide-react";

import { DEMO_OCEAN_DATA } from "@/lib/demoOceanData";

interface OceanDataLayoutProps {
  eyebrow?: string;
  title: string;
  description: string;
  children: React.ReactNode;
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

export function OceanDataLayout({
  eyebrow = "Ocean observations",
  title,
  description,
  children,
}: OceanDataLayoutProps) {
  const router = useRouter();

  const { location, timestamp } = DEMO_OCEAN_DATA;

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

        {/* Very subtle readability layer */}

        <div className="absolute inset-0 bg-white/[0.03]" />
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
              <Waves size={22} strokeWidth={2.2} />

              <span className="absolute inset-0 rounded-[13px] border border-[#02ABD5]/20" />
            </span>

            <span>
              <strong className="block font-['Manrope'] text-[18px] font-extrabold leading-none tracking-[-0.04em] text-[#07516D]">
                Ocean Lens
              </strong>

              <small className="mt-1 block text-[9px] font-medium tracking-[0.02em] text-[#4F7E95]">
                Ocean Data Analysis
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

              <span>{formatDate(timestamp)}</span>
            </div>

            <div className="hidden items-center gap-2 text-[11px] font-medium text-[#356D84] md:flex">
              <Compass
                size={14}
                className="text-[#02ABD5]"
              />

              <span>
                {formatCoord(location.lat, "N", "S")}
                {", "}
                {formatCoord(location.lon, "E", "W")}
              </span>
            </div>

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

              <span>Explorer</span>
            </button>
          </div>
        </header>

        {/* ===================================================
            MAIN
        ==================================================== */}

        <section className="mx-auto w-full max-w-[1500px] px-4 py-8 sm:px-6 lg:px-8 lg:py-10">

          {/* PAGE HERO */}

          <div className="mx-auto max-w-[900px] text-center">

            <div className="inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/45 px-3 py-1.5 text-[8px] font-bold uppercase tracking-[0.15em] text-[#0785A7] shadow-[0_5px_18px_rgba(8,102,128,0.05)] backdrop-blur-xl">
              <Activity size={12} />

              {eyebrow}
            </div>

            <h1 className="mt-5 font-['Manrope'] text-[34px] font-extrabold leading-[1.02] tracking-[-0.065em] text-[#07516D] sm:text-[45px] lg:text-[54px]">
              {title}
            </h1>

            <p className="mx-auto mt-4 max-w-[650px] text-[11px] leading-[1.7] text-[#4D7F94] sm:text-[12px]">
              {description}
            </p>

            {/* DEMO INDICATOR */}

            <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-[#02ABD5]/15 bg-white/45 px-3 py-1.5 text-[8px] font-semibold text-[#4F8194] backdrop-blur-xl">
              <span className="h-1.5 w-1.5 rounded-full bg-[#02ABD5] shadow-[0_0_0_4px_rgba(2,171,213,0.08)]" />

              Demonstration dataset
            </div>
          </div>

          {/* PAGE CONTENT */}

          <div className="mt-8 lg:mt-10">
            {children}
          </div>

        </section>

        {/* ===================================================
            FOOTER
        ==================================================== */}

        <footer className="flex flex-col gap-1.5 border-t border-white/35 bg-white/15 px-5 py-4 text-[8px] text-[#568598] backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between sm:px-7">

          <span className="font-bold text-[#0786A7]">
            Ocean Lens
          </span>

          <span>
            Satellite-informed ocean observations
          </span>

          <span>
            {timestamp}
          </span>
        </footer>
      </div>
    </main>
  );
}