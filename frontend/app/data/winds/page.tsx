"use client";

import {
  ArrowDown,
  ArrowRight,
  Compass,
  Gauge,
  Info,
  MapPin,
  Navigation,
  Wind,
  Waves
} from "lucide-react";

import {OceanDataLayout} from "@/components/data/OceanDataLayout";
import {DataChart} from "@/components/data/DataChart";
import { DEMO_OCEAN_DATA } from "@/lib/demoOceanData";

const uTrend = [2.1, 2.8, 3.4, 4.0, 4.82, 5.1, 4.7, 4.82];
const vTrend = [-1.1, -1.4, -1.7, -1.9, -2.17, -2.5, -2.3, -2.17];

function formatDate(value: string) {
  return new Date(value).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function directionFromUV(u: number, v: number) {
  let angle = (Math.atan2(v, u) * 180) / Math.PI;

  if (angle < 0) {
    angle += 360;
  }

  return angle;
}

export default function WindsPage() {
  const data = DEMO_OCEAN_DATA.winds;
  const direction = directionFromUV(data.u, data.v);

  return (
    <OceanDataLayout
      eyebrow="SURFACE OBSERVATION · WINDS"
      title="Surface Winds"
      description="Explore the horizontal wind field above the ocean surface, including its U and V components, speed, and direction."
    >
      <div className="space-y-6">
        {/* Metrics */}
        <section className="grid gap-4 md:grid-cols-4">
          <div className="rounded-[24px] border border-white/70 bg-white/60 p-5 backdrop-blur-xl">
            <div className="mb-4 flex items-center gap-3">
              <ArrowRight size={18} className="text-[#02ABD5]" />
              <span className="text-[10px] font-black uppercase tracking-[0.16em] text-[#6A97A8]">
                U component
              </span>
            </div>

            <p className="text-4xl font-black text-[#063B4D]">
              {data.u}
              <span className="ml-2 text-sm text-[#0798B5]">{data.unit}</span>
            </p>

            <p className="mt-2 text-xs text-[#6A97A8]">East–west wind</p>
          </div>

          <div className="rounded-[24px] border border-white/70 bg-white/60 p-5 backdrop-blur-xl">
            <div className="mb-4 flex items-center gap-3">
              <ArrowDown size={18} className="text-[#0173BE]" />
              <span className="text-[10px] font-black uppercase tracking-[0.16em] text-[#6A97A8]">
                V component
              </span>
            </div>

            <p className="text-4xl font-black text-[#063B4D]">
              {data.v}
              <span className="ml-2 text-sm text-[#0798B5]">{data.unit}</span>
            </p>

            <p className="mt-2 text-xs text-[#6A97A8]">North–south wind</p>
          </div>

          <div className="rounded-[24px] border border-white/70 bg-white/60 p-5 backdrop-blur-xl">
            <div className="mb-4 flex items-center gap-3">
              <Gauge size={18} className="text-[#017FBD]" />
              <span className="text-[10px] font-black uppercase tracking-[0.16em] text-[#6A97A8]">
                Wind speed
              </span>
            </div>

            <p className="text-4xl font-black text-[#063B4D]">
              {data.speed}
              <span className="ml-2 text-sm text-[#0798B5]">{data.unit}</span>
            </p>
          </div>

          <div className="rounded-[24px] border border-white/70 bg-white/60 p-5 backdrop-blur-xl">
            <div className="mb-4 flex items-center gap-3">
              <Compass size={18} className="text-[#02ABD5]" />
              <span className="text-[10px] font-black uppercase tracking-[0.16em] text-[#6A97A8]">
                Direction
              </span>
            </div>

            <p className="text-4xl font-black text-[#063B4D]">
              {Math.round(direction)}
              <span className="ml-1 text-sm text-[#0798B5]">°</span>
            </p>
          </div>
        </section>

        {/* Context */}
        <section className="rounded-[24px] border border-white/70 bg-white/60 p-5 backdrop-blur-xl">
          <div className="flex flex-wrap items-center gap-5">
            <div className="flex items-center gap-3">
              <MapPin size={17} className="text-[#02ABD5]" />
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#6A97A8]">
                  Observation
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

        {/* Wind visualization */}
{/* Wind visualization */}
<section className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
  {/* Compass */}
  <div className="rounded-[28px] border border-white/70 bg-white/60 p-6 shadow-[0_20px_55px_rgba(7,76,101,0.10)] backdrop-blur-xl">
    <div className="mb-6 flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#02ABD5]/10">
        <Compass size={19} className="text-[#0173BE]" />
      </div>

      <div>
        <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#6A97A8]">
          Live vector
        </p>

        <h2 className="text-lg font-black text-[#063B4D]">
          Surface wind direction
        </h2>
      </div>
    </div>

    <div className="relative flex h-[390px] items-center justify-center overflow-hidden rounded-[24px] border border-[#02ABD5]/10 bg-[#063B4D]/[0.035]">
      {/* Background grid */}
      <div className="absolute inset-0 opacity-30">
        <div className="h-full w-full bg-[linear-gradient(rgba(2,171,213,0.13)_1px,transparent_1px),linear-gradient(90deg,rgba(2,171,213,0.13)_1px,transparent_1px)] bg-[size:42px_42px]" />
      </div>

      {/* Atmospheric glow */}
      <div className="absolute h-[280px] w-[280px] rounded-full bg-[#02ABD5]/[0.07] blur-3xl" />

      {/* Outer compass ring */}
      <div className="relative flex h-[290px] w-[290px] items-center justify-center rounded-full border border-[#02ABD5]/20">
        {/* Inner rings */}
        <div className="absolute h-[225px] w-[225px] rounded-full border border-[#02ABD5]/15" />

        <div className="absolute h-[155px] w-[155px] rounded-full border border-[#02ABD5]/10" />

        {/* Crosshair */}
        <div className="absolute left-1/2 top-4 h-[calc(100%-32px)] w-px -translate-x-1/2 bg-[#02ABD5]/10" />

        <div className="absolute left-4 top-1/2 h-px w-[calc(100%-32px)] -translate-y-1/2 bg-[#02ABD5]/10" />

        {/* Compass labels */}
        <span className="absolute top-[-3px] left-1/2 -translate-x-1/2 text-[11px] font-black text-[#063B4D]">
          N
        </span>

        <span className="absolute right-[-5px] top-1/2 -translate-y-1/2 text-[11px] font-black text-[#063B4D]">
          E
        </span>

        <span className="absolute bottom-[-3px] left-1/2 -translate-x-1/2 text-[11px] font-black text-[#063B4D]">
          S
        </span>

        <span className="absolute left-[-5px] top-1/2 -translate-y-1/2 text-[11px] font-black text-[#063B4D]">
          W
        </span>

        {/* Degree markers */}
        <span className="absolute top-[43px] left-1/2 -translate-x-1/2 text-[7px] font-bold text-[#6A97A8]">
          0°
        </span>

        <span className="absolute right-[43px] top-1/2 -translate-y-1/2 text-[7px] font-bold text-[#6A97A8]">
          90°
        </span>

        <span className="absolute bottom-[43px] left-1/2 -translate-x-1/2 text-[7px] font-bold text-[#6A97A8]">
          180°
        </span>

        <span className="absolute left-[43px] top-1/2 -translate-y-1/2 text-[7px] font-bold text-[#6A97A8]">
          270°
        </span>

        {/* Animated wind field */}
        <div
          className="absolute inset-0 overflow-hidden rounded-full"
          style={{
            transform: `rotate(${direction}deg)`,
          }}
        >
          {/* Flow trails */}
          <div className="absolute left-[8%] top-[20%] h-px w-[35%] animate-[windFlow_2.8s_linear_infinite] bg-gradient-to-r from-transparent via-[#07C4DF]/50 to-transparent" />

          <div className="absolute left-[20%] top-[38%] h-px w-[45%] animate-[windFlow_2.2s_linear_infinite] bg-gradient-to-r from-transparent via-[#02ABD5]/70 to-transparent" />

          <div className="absolute left-[5%] top-[58%] h-px w-[42%] animate-[windFlow_3.1s_linear_infinite] bg-gradient-to-r from-transparent via-[#07C4DF]/45 to-transparent" />

          <div className="absolute left-[28%] top-[72%] h-px w-[38%] animate-[windFlow_2.5s_linear_infinite] bg-gradient-to-r from-transparent via-[#02ABD5]/55 to-transparent" />

          {/* Small particles */}
          <div className="absolute left-[18%] top-[28%] h-1.5 w-1.5 animate-[windParticle_2s_linear_infinite] rounded-full bg-[#07C4DF]" />

          <div className="absolute left-[42%] top-[45%] h-1.5 w-1.5 animate-[windParticle_2.7s_linear_infinite] rounded-full bg-[#02ABD5]" />

          <div className="absolute left-[28%] top-[65%] h-1 w-1 animate-[windParticle_2.3s_linear_infinite] rounded-full bg-[#07C4DF]" />

          <div className="absolute left-[62%] top-[30%] h-1 w-1 animate-[windParticle_3s_linear_infinite] rounded-full bg-[#02ABD5]" />
        </div>

        {/* Wind direction arrow */}
        <div
          className="absolute inset-0 flex items-center justify-center transition-transform duration-700 ease-out"
          style={{
            transform: `rotate(${direction}deg)`,
          }}
        >
          <div className="relative h-[108px] w-[7px] rounded-full bg-gradient-to-t from-[#0173BE] via-[#02ABD5] to-[#07C4DF] shadow-[0_0_28px_rgba(2,171,213,0.55)]">
            {/* Arrow head */}
            <div className="absolute -top-[12px] left-1/2 -translate-x-1/2 border-x-[11px] border-b-[20px] border-x-transparent border-b-[#07C4DF]" />

            {/* Arrow glow */}
            <div className="absolute inset-0 rounded-full bg-[#07C4DF] blur-md opacity-40" />
          </div>
        </div>

        {/* Center */}
        <div className="relative z-10 flex h-[92px] w-[92px] flex-col items-center justify-center rounded-full border border-white/80 bg-white/85 shadow-[0_10px_35px_rgba(7,76,101,0.16)] backdrop-blur-xl">
          <span className="text-[8px] font-black uppercase tracking-[0.16em] text-[#6A97A8]">
            Wind speed
          </span>

          <span className="mt-1 text-2xl font-black tracking-tight text-[#063B4D]">
            {data.speed}
          </span>

          <span className="text-[9px] font-bold text-[#0798B5]">
            {data.unit}
          </span>
        </div>
      </div>

      {/* Direction readout */}
      <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 items-center gap-3 rounded-full border border-white/80 bg-white/75 px-4 py-2 shadow-[0_8px_25px_rgba(7,76,101,0.10)] backdrop-blur-xl">
        <Navigation size={12} className="text-[#02ABD5]" />

        <span className="text-[9px] font-black uppercase tracking-[0.15em] text-[#6A97A8]">
          Direction
        </span>

        <span className="text-xs font-black text-[#063B4D]">
          {Math.round(direction)}°
        </span>
      </div>

      {/* Animation legend */}
      <div className="absolute right-5 top-5 flex items-center gap-2 rounded-full border border-white/70 bg-white/65 px-3 py-1.5 backdrop-blur-xl">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#02ABD5] opacity-60" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-[#02ABD5]" />
        </span>

        <span className="text-[8px] font-black uppercase tracking-[0.12em] text-[#07516D]">
          Flow active
        </span>
      </div>
    </div>
  </div>

  {/* Wind breakdown */}
  <div className="rounded-[28px] border border-white/70 bg-[#063B4D]/95 p-6 text-white shadow-[0_20px_55px_rgba(7,76,101,0.16)]">
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
        <Wind size={18} className="text-[#07C4DF]" />
      </div>

      <div>
        <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#7BDFF0]">
          Wind vector
        </p>

        <h2 className="text-lg font-black">
          Atmospheric flow
        </h2>
      </div>
    </div>

    <div className="mt-8">
      <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-white/40">
        Resultant speed
      </p>

      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-5xl font-black tracking-tight">
          {data.speed}
        </span>

        <span className="text-sm font-bold text-[#07C4DF]">
          {data.unit}
        </span>
      </div>
    </div>

    {/* U */}
    <div className="mt-9">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#02ABD5]/15 text-[9px] font-black text-[#07C4DF]">
            U
          </span>

          <span className="text-[9px] font-bold uppercase tracking-[0.13em] text-white/55">
            East–West
          </span>
        </div>

        <span className="text-xs font-black">
          {data.u} m/s
        </span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#0173BE] to-[#02ABD5] transition-all duration-700"
          style={{
            width: `${Math.min(Math.abs(data.u) / 8, 1) * 100}%`,
          }}
        />
      </div>
    </div>

    {/* V */}
    <div className="mt-6">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#07C4DF]/15 text-[9px] font-black text-[#07C4DF]">
            V
          </span>

          <span className="text-[9px] font-bold uppercase tracking-[0.13em] text-white/55">
            North–South
          </span>
        </div>

        <span className="text-xs font-black">
          {data.v} m/s
        </span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#017FBD] to-[#07C4DF] transition-all duration-700"
          style={{
            width: `${Math.min(Math.abs(data.v) / 8, 1) * 100}%`,
          }}
        />
      </div>
    </div>

    {/* Direction */}
    <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[8px] font-bold uppercase tracking-[0.15em] text-white/40">
            Vector direction
          </p>

          <p className="mt-1 text-lg font-black">
            {Math.round(direction)}°
          </p>
        </div>

        <div
          className="flex h-12 w-12 items-center justify-center rounded-full border border-[#02ABD5]/30 bg-[#02ABD5]/10"
          style={{
            transform: `rotate(${direction}deg)`,
          }}
        >
          <Navigation
            size={18}
            className="text-[#07C4DF]"
          />
        </div>
      </div>
    </div>

    <div className="mt-6 flex items-start gap-3">
      <Info size={14} className="mt-0.5 shrink-0 text-[#07C4DF]" />

      <p className="text-[10px] leading-5 text-white/45">
        The animated vector combines the U and V wind components to show
        the resulting horizontal flow direction at the selected location.
      </p>
    </div>
  </div>
</section>

        {/* Trends */}
        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-[28px] border border-white/70 bg-white/60 p-6 backdrop-blur-xl">
            <h2 className="mb-5 text-lg font-black text-[#063B4D]">
              U wind component
            </h2>

            <DataChart
              title="U"
              subtitle="East–west wind velocity"
              values={uTrend}
              labels={["T−7", "T−6", "T−5", "T−4", "T−3", "T−2", "T−1", "Now"]}
              unit="m/s"
            />
          </div>

          <div className="rounded-[28px] border border-white/70 bg-white/60 p-6 backdrop-blur-xl">
            <h2 className="mb-5 text-lg font-black text-[#063B4D]">
              V wind component
            </h2>

            <DataChart
              title="V"
              subtitle="North–south wind velocity"
              values={vTrend.map((value) => value + 3)}
              labels={["T−7", "T−6", "T−5", "T−4", "T−3", "T−2", "T−1", "Now"]}
              unit="m/s"
            />
          </div>
        </section>

        {/* Interpretation */}
        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-[24px] border border-[#02ABD5]/15 bg-white/60 p-6 backdrop-blur-xl">
            <div className="mb-4 flex items-center gap-3">
              <Info size={18} className="text-[#02ABD5]" />
              <h2 className="text-lg font-black text-[#063B4D]">
                Reading the wind field
              </h2>
            </div>

            <p className="text-sm leading-7 text-[#456F80]">
              Wind U and V describe the horizontal components of atmospheric
              motion above the ocean. Their combination gives the wind speed
              and vector direction.
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
              Surface winds provide atmospheric forcing information that
              complements the ocean variables used by the reconstruction
              pipeline to infer subsurface temperature structure.
            </p>
          </div>
        </section>

        {/* Pipeline */}
        <section className="rounded-[28px] border border-white/70 bg-white/60 p-6 backdrop-blur-xl">
          <div className="mb-6">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#02ABD5]">
              Ocean Lens inputs
            </p>

            <h2 className="mt-1 text-xl font-black text-[#063B4D]">
              Surface observations working together
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {[
              "SST",
              "SSS",
              "SSH / SLA",
              "U / V Currents",
              "U / V Winds",
            ].map((item, index) => (
              <div key={item} className="flex items-center gap-2">
                <span className="rounded-xl border border-[#02ABD5]/15 bg-white/65 px-4 py-3 text-xs font-black text-[#07516D]">
                  {item}
                </span>

                {index < 4 && (
                  <span className="text-[#02ABD5]">→</span>
                )}
              </div>
            ))}

            <span className="mx-1 text-[#02ABD5]">→</span>

            <span className="rounded-xl bg-[#063B4D] px-4 py-3 text-xs font-black text-white">
              3D Temperature Profile
            </span>
          </div>
        </section>
      </div>
    </OceanDataLayout>
  );
}