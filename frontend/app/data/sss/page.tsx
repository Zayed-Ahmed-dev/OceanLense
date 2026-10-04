"use client";

import {
  ArrowDownRight,
  ArrowUpRight,
  Droplets,
  Info,
  Layers3,
  MapPin,
  Waves,
} from "lucide-react";

import {OceanDataLayout} from "@/components/data/OceanDataLayout";
import {DataChart} from "@/components/data/DataChart";
import { DEMO_OCEAN_DATA } from "@/lib/demoOceanData";

const salinityTrend = [34.31, 34.48, 34.57, 34.64, 34.72, 34.81, 34.94, 35.08];

const spatialValues = [
  [34.42, 34.51, 34.63, 34.72, 34.81],
  [34.36, 34.48, 34.59, 34.69, 34.77],
  [34.31, 34.43, 34.55, 34.66, 34.74],
  [34.39, 34.51, 34.62, 34.73, 34.84],
  [34.48, 34.57, 34.69, 34.81, 34.92],
];

function formatDate(value: string) {
  return new Date(value).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function SSSPage() {
  const data = DEMO_OCEAN_DATA.sss;

  return (
    <OceanDataLayout
      eyebrow="SURFACE OBSERVATION · SSS"
      title="Sea Surface Salinity"
      description="Explore the salinity state of the ocean surface and how its spatial and temporal variation contributes to the Ocean Lens reconstruction."
    >
      <div className="space-y-6">
        {/* Context */}
        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-[24px] border border-white/70 bg-white/60 p-5 shadow-[0_18px_45px_rgba(7,76,101,0.10)] backdrop-blur-xl">
            <div className="mb-4 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#02ABD5]/10 text-[#0173BE]">
                <Droplets size={19} />
              </span>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#6A97A8]">
                  Current SSS
                </p>
                <p className="text-xs text-[#075B78]">Surface salinity</p>
              </div>
            </div>

            <div className="flex items-end gap-2">
              <span className="text-4xl font-black tracking-tight text-[#063B4D]">
                {data.value}
              </span>
              <span className="mb-1 text-sm font-bold text-[#0798B5]">
                {data.unit}
              </span>
            </div>
          </div>

          <div className="rounded-[24px] border border-white/70 bg-white/60 p-5 shadow-[0_18px_45px_rgba(7,76,101,0.10)] backdrop-blur-xl">
            <div className="mb-4 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#017FBD]/10 text-[#017FBD]">
                <ArrowDownRight size={19} />
              </span>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#6A97A8]">
                  Lower bound
                </p>
                <p className="text-xs text-[#075B78]">Observed range</p>
              </div>
            </div>

            <div className="text-4xl font-black tracking-tight text-[#063B4D]">
              {data.min}
              <span className="ml-2 text-sm font-bold text-[#0798B5]">
                {data.unit}
              </span>
            </div>
          </div>

          <div className="rounded-[24px] border border-white/70 bg-white/60 p-5 shadow-[0_18px_45px_rgba(7,76,101,0.10)] backdrop-blur-xl">
            <div className="mb-4 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#07C4DF]/10 text-[#0173BE]">
                <ArrowUpRight size={19} />
              </span>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#6A97A8]">
                  Upper bound
                </p>
                <p className="text-xs text-[#075B78]">Observed range</p>
              </div>
            </div>

            <div className="text-4xl font-black tracking-tight text-[#063B4D]">
              {data.max}
              <span className="ml-2 text-sm font-bold text-[#0798B5]">
                {data.unit}
              </span>
            </div>
          </div>
        </section>

        {/* Location */}
        <section className="rounded-[24px] border border-white/70 bg-white/60 p-5 shadow-[0_18px_45px_rgba(7,76,101,0.10)] backdrop-blur-xl">
          <div className="flex flex-wrap items-center gap-5">
            <div className="flex items-center gap-3">
              <MapPin size={17} className="text-[#02ABD5]" />
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#6A97A8]">
                  Observation location
                </p>
                <p className="text-sm font-bold text-[#07516D]">
                  {DEMO_OCEAN_DATA.location.lat.toFixed(2)}°N ·{" "}
                  {DEMO_OCEAN_DATA.location.lon.toFixed(2)}°E
                </p>
              </div>
            </div>

            <div className="hidden h-8 w-px bg-[#07516D]/10 md:block" />

            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#6A97A8]">
                Timestamp
              </p>
              <p className="text-sm font-bold text-[#07516D]">
              {formatDate(new Date().toISOString())}
              </p>
            </div>
          </div>
        </section>

        {/* Main analysis */}
        <section className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
          <div className="rounded-[28px] border border-white/70 bg-white/65 p-6 shadow-[0_20px_55px_rgba(7,76,101,0.11)] backdrop-blur-xl">
            <div className="mb-6">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#02ABD5]">
                Temporal signal
              </p>
              <h2 className="mt-1 text-xl font-black text-[#063B4D]">
                Salinity variation
              </h2>
              <p className="mt-1 text-xs text-[#5F8C9D]">
                Demonstration values across the observation window.
              </p>
            </div>

            <DataChart
              title="SSS trend"
              subtitle="Surface salinity"
              values={salinityTrend}
              labels={["T−7", "T−6", "T−5", "T−4", "T−3", "T−2", "T−1", "Now"]}
              unit="PSU"
            />
          </div>

          <div className="rounded-[28px] border border-white/70 bg-[#063B4D]/95 p-6 text-white shadow-[0_20px_55px_rgba(7,76,101,0.16)]">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                <Layers3 size={18} className="text-[#07C4DF]" />
              </div>
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#7BDFF0]">
                  Spatial field
                </p>
                <h3 className="text-sm font-bold">Salinity distribution</h3>
              </div>
            </div>

            <div className="grid grid-cols-5 gap-1.5">
              {spatialValues.flat().map((value, index) => {
                const normalized = (value - data.min) / (data.max - data.min);

                return (
                  <div
                    key={index}
                    className="flex aspect-square items-center justify-center rounded-lg border border-white/10 bg-gradient-to-br from-[#017FBD] to-[#02ABD5] text-[8px] font-bold text-white"
                    style={{
                      opacity: 0.45 + normalized * 0.55,
                    }}
                  >
                    {value.toFixed(2)}
                  </div>
                );
              })}
            </div>

            <div className="mt-5 flex justify-between text-[8px] font-bold uppercase tracking-[0.15em] text-white/45">
              <span>Lower salinity</span>
              <span>Higher salinity</span>
            </div>
          </div>
        </section>

        {/* Interpretation */}
        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-[24px] border border-[#02ABD5]/15 bg-white/60 p-6 backdrop-blur-xl">
            <div className="mb-4 flex items-center gap-3">
              <Info size={18} className="text-[#02ABD5]" />
              <h2 className="text-lg font-black text-[#063B4D]">
                What this variable tells us
              </h2>
            </div>

            <p className="text-sm leading-7 text-[#456F80]">
              Sea surface salinity describes the concentration of dissolved
              salts near the ocean surface. Changes in salinity can accompany
              freshwater input, evaporation, mixing, and surface circulation.
            </p>
          </div>

          <div className="rounded-[24px] border border-[#02ABD5]/15 bg-white/60 p-6 backdrop-blur-xl">
            <div className="mb-4 flex items-center gap-3">
              <Waves size={18} className="text-[#0173BE]" />
              <h2 className="text-lg font-black text-[#063B4D]">
                Role in Ocean Lens
              </h2>
            </div>

            <p className="text-sm leading-7 text-[#456F80]">
              SSS is one of the surface-state variables supplied alongside
              temperature, height, currents, and winds. Together these
              observations provide surface context for reconstructing the
              subsurface temperature structure.
            </p>
          </div>
        </section>

        {/* Pipeline */}
        <section className="rounded-[28px] border border-white/70 bg-white/60 p-6 shadow-[0_18px_45px_rgba(7,76,101,0.10)] backdrop-blur-xl">
          <div className="mb-6">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#02ABD5]">
              Data pipeline
            </p>
            <h2 className="mt-1 text-xl font-black text-[#063B4D]">
              From surface salinity to subsurface structure
            </h2>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            {[
              ["01", "SSS observation", "Surface salinity field"],
              ["02", "Ocean Lens model", "Surface variables combined"],
              ["03", "3D temperature", "Depth-wise reconstruction"],
            ].map(([number, title, description]) => (
              <div
                key={number}
                className="rounded-2xl border border-[#02ABD5]/10 bg-white/55 p-5"
              >
                <span className="text-[10px] font-black text-[#02ABD5]">
                  {number}
                </span>
                <h3 className="mt-2 text-sm font-black text-[#063B4D]">
                  {title}
                </h3>
                <p className="mt-1 text-xs leading-5 text-[#648B9A]">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </OceanDataLayout>
  );
}