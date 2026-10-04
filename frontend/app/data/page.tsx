"use client";

import {
  Droplets,
  Gauge,
  Thermometer,
  Waves,
  Wind,
} from "lucide-react";

import { OceanDataLayout } from "@/components/data/OceanDataLayout";
import { DataMetricCard } from "@/components/data/DataMetricCard";
import { DataChart } from "@/components/data/DataChart";
import { DEMO_OCEAN_DATA } from "@/lib/demoOceanData";
import { Activity } from "lucide-react";

export default function OceanDataPage() {
  const data = DEMO_OCEAN_DATA;

  return (
    <OceanDataLayout
      title="Ocean observations, revealed."
      description="Explore the surface variables surrounding the Ocean Lens reconstruction. These observations provide the environmental context used to understand the ocean above the hidden temperature structure."
    >

      {/* ===================================================
          LOCATION CONTEXT
      ==================================================== */}

      <div className="mb-5 flex flex-col gap-3 rounded-[18px] border border-white/60 bg-white/50 px-4 py-3 shadow-[0_10px_30px_rgba(7,76,101,0.06)] backdrop-blur-2xl sm:flex-row sm:items-center sm:justify-between sm:px-5">

        <div>
          <span className="text-[8px] font-bold uppercase tracking-[0.14em] text-[#0785A7]">
            Observation point
          </span>

          <div className="mt-1 flex items-center gap-2">
            <span className="font-['Manrope'] text-[13px] font-extrabold text-[#07516D]">
              {Math.abs(data.location.lat).toFixed(2)}°{" "}
              {data.location.lat >= 0 ? "N" : "S"}
            </span>

            <span className="text-[#8AAEBB]">•</span>

            <span className="font-['Manrope'] text-[13px] font-extrabold text-[#07516D]">
              {Math.abs(data.location.lon).toFixed(2)}°{" "}
              {data.location.lon >= 0 ? "E" : "W"}
            </span>
          </div>
        </div>

        <div className="text-left sm:text-right">
          <span className="text-[8px] font-bold uppercase tracking-[0.14em] text-[#0785A7]">
            Observation time
          </span>

          <p className="mt-1 text-[10px] font-semibold text-[#527F94]">
            15 Jun 2022 · 12:00 UTC 
          </p>
        </div>

      </div>

      {/* ===================================================
          VARIABLE CARDS
      ==================================================== */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">

        <DataMetricCard
          label={data.sst.label}
          shortLabel={data.sst.shortLabel}
          value={data.sst.value.toFixed(2)}
          unit={data.sst.unit}
          description={data.sst.description}
          icon={<Thermometer size={18} />}
          href="/data/sst"
        />

        <DataMetricCard
          label={data.sss.label}
          shortLabel={data.sss.shortLabel}
          value={data.sss.value.toFixed(2)}
          unit={data.sss.unit}
          description={data.sss.description}
          icon={<Droplets size={18} />}
          href="/data/sss"
          accent="blue"
        />

        <DataMetricCard
          label={data.ssh.label}
          shortLabel={data.ssh.shortLabel}
          value={data.ssh.value.toFixed(2)}
          unit={data.ssh.unit}
          description={data.ssh.description}
          icon={<Gauge size={18} />}
          href="/data/ssh"
        />

        <DataMetricCard
          label={data.currents.label}
          shortLabel={data.currents.shortLabel}
          value={data.currents.speed.toFixed(2)}
          unit={data.currents.unit}
          description={data.currents.description}
          icon={<Waves size={18} />}
          href="/data/currents"
          accent="blue"
        />

        <DataMetricCard
          label={data.winds.label}
          shortLabel={data.winds.shortLabel}
          value={data.winds.speed.toFixed(2)}
          unit={data.winds.unit}
          description={data.winds.description}
          icon={<Wind size={18} />}
          href="/data/winds"
        />

      </div>

      {/* ===================================================
          ANALYSIS AREA
      ==================================================== */}

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(280px,0.7fr)]">

        {/* CHART */}

        <DataChart
          title="Surface temperature variation"
          subtitle="Demonstration SST observations across nearby reference points"
          unit="°C"
          values={[
            27.91,
            28.05,
            28.18,
            28.31,
            28.42,
            28.57,
            28.76,
            28.63,
          ]}
          labels={[
            "−3°",
            "−2°",
            "−1°",
            "−0.5°",
            "Point",
            "+0.5°",
            "+1°",
            "+2°",
          ]}
        />

        {/* DATA SUMMARY */}

        <div className="rounded-[22px] border border-white/60 bg-white/60 p-5 shadow-[0_14px_40px_rgba(7,76,101,0.08)] backdrop-blur-2xl sm:p-6">

          <span className="text-[8px] font-bold uppercase tracking-[0.14em] text-[#0785A7]">
            Surface state
          </span>

          <h2 className="mt-1 font-['Manrope'] text-[18px] font-extrabold tracking-[-0.04em] text-[#07516D]">
            What surrounds the point?
          </h2>

          <p className="mt-2 text-[9px] leading-[1.65] text-[#6A97A8]">
            A compact view of the physical conditions represented by
            the demonstration observations.
          </p>

          <div className="mt-5 space-y-2.5">

            <div className="rounded-[13px] border border-[#0785A7]/10 bg-white/45 p-3">
              <div className="flex items-center justify-between">
                <span className="text-[8px] font-semibold text-[#628DA0]">
                  SST
                </span>

                <span className="text-[10px] font-extrabold text-[#075B78]">
                  {data.sst.value.toFixed(2)} °C
                </span>
              </div>
            </div>

            <div className="rounded-[13px] border border-[#0785A7]/10 bg-white/45 p-3">
              <div className="flex items-center justify-between">
                <span className="text-[8px] font-semibold text-[#628DA0]">
                  SSS
                </span>

                <span className="text-[10px] font-extrabold text-[#075B78]">
                  {data.sss.value.toFixed(2)} PSU
                </span>
              </div>
            </div>

            <div className="rounded-[13px] border border-[#0785A7]/10 bg-white/45 p-3">
              <div className="flex items-center justify-between">
                <span className="text-[8px] font-semibold text-[#628DA0]">
                  SLA
                </span>

                <span className="text-[10px] font-extrabold text-[#075B78]">
                  +{data.ssh.sla.toFixed(2)} m
                </span>
              </div>
            </div>

            <div className="rounded-[13px] border border-[#0785A7]/10 bg-white/45 p-3">
              <div className="flex items-center justify-between">
                <span className="text-[8px] font-semibold text-[#628DA0]">
                  Current
                </span>

                <span className="text-[10px] font-extrabold text-[#075B78]">
                  {data.currents.speed.toFixed(2)} m/s
                </span>
              </div>
            </div>

            <div className="rounded-[13px] border border-[#0785A7]/10 bg-white/45 p-3">
              <div className="flex items-center justify-between">
                <span className="text-[8px] font-semibold text-[#628DA0]">
                  Wind
                </span>

                <span className="text-[10px] font-extrabold text-[#075B78]">
                  {data.winds.speed.toFixed(2)} m/s
                </span>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ===================================================
          MODEL CONNECTION
      ==================================================== */}

      <div className="mt-5 overflow-hidden rounded-[24px] border border-white/60 bg-white/55 p-5 shadow-[0_16px_45px_rgba(7,76,101,0.08)] backdrop-blur-2xl sm:p-7">

        <div className="max-w-[650px]">

          <span className="text-[8px] font-bold uppercase tracking-[0.14em] text-[#0785A7]">
            Ocean Lens pipeline
          </span>

          <h2 className="mt-2 font-['Manrope'] text-[21px] font-extrabold tracking-[-0.045em] text-[#07516D] sm:text-[24px]">
            Surface observations → hidden ocean structure
          </h2>

          <p className="mt-2 text-[10px] leading-[1.7] text-[#628DA0]">
            Ocean Lens uses surface observations as environmental
            signals for reconstructing temperature through the water
            column.
          </p>

        </div>

        {/* PIPELINE */}

        <div className="mt-7 grid grid-cols-1 gap-3 md:grid-cols-3">

          {/* SURFACE */}

          <div className="rounded-[18px] border border-[#02ABD5]/10 bg-gradient-to-br from-white/70 to-[#D6F4F9]/50 p-4">

            <span className="text-[8px] font-bold uppercase tracking-[0.12em] text-[#0785A7]">
              01 · Surface
            </span>

            <div className="mt-3 grid grid-cols-2 gap-2">

              {["SST", "SSS", "SSH / SLA", "U / V Currents", "U / V Winds"].map(
                (item) => (
                  <span
                    key={item}
                    className="rounded-[9px] border border-white/70 bg-white/60 px-2 py-2 text-center text-[8px] font-bold text-[#397B90]"
                  >
                    {item}
                  </span>
                ),
              )}

            </div>
          </div>

          {/* MODEL */}

          <div className="relative flex flex-col justify-center rounded-[18px] border border-[#02ABD5]/20 bg-gradient-to-br from-[#02ABD5]/10 to-[#017FBD]/10 p-5 text-center">

            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-[13px] border border-white/70 bg-white/65 text-[#02ABD5] shadow-[0_8px_22px_rgba(2,132,166,0.1)]">
              <Activity size={19} />
            </div>

            <strong className="mt-3 font-['Manrope'] text-[13px] font-extrabold text-[#07516D]">
              Ocean Lens Model
            </strong>

            <span className="mt-1 text-[8px] leading-[1.5] text-[#628DA0]">
              Satellite-informed reconstruction
            </span>

          </div>

          {/* OUTPUT */}

          <div className="rounded-[18px] border border-[#02ABD5]/10 bg-gradient-to-br from-white/70 to-[#D6F4F9]/50 p-4">

            <span className="text-[8px] font-bold uppercase tracking-[0.12em] text-[#0785A7]">
              03 · Reconstruction
            </span>

            <div className="mt-3 rounded-[13px] border border-white/70 bg-white/60 p-4">

              <span className="block text-[8px] font-semibold uppercase tracking-[0.1em] text-[#6A97A8]">
                Output
              </span>

              <strong className="mt-1 block font-['Manrope'] text-[15px] font-extrabold text-[#07516D]">
                3D temperature profile
              </strong>

              <span className="mt-1 block text-[8px] leading-[1.5] text-[#628DA0]">
                Depth-wise temperature structure below the surface.
              </span>

            </div>

          </div>

        </div>
      </div>

    </OceanDataLayout>
  );
}