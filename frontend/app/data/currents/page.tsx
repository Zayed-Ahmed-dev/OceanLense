"use client";

import {
  ArrowDown,
  ArrowRight,
  Compass,
  Info,
  MapPin,
  Navigation,
  Waves,
} from "lucide-react";

import {OceanDataLayout} from "@/components/data/OceanDataLayout";
import {DataChart} from "@/components/data/DataChart";
import { DEMO_OCEAN_DATA } from "@/lib/demoOceanData";

const uTrend = [-0.12, 0.04, 0.15, 0.22, 0.31, 0.38, 0.34, 0.31];
const vTrend = [-0.31, -0.27, -0.22, -0.18, -0.14, -0.09, -0.11, -0.14];

function formatDate(value: string) {
  return new Date(value).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function directionFromUV(u: number, v: number) {
  let angle = (Math.atan2(v, u) * 180) / Math.PI;
  if (angle < 0) angle += 360;
  return angle;
}

export default function CurrentsPage() {
  const data = DEMO_OCEAN_DATA.currents;
  const direction = directionFromUV(data.u, data.v);

  return (
    <OceanDataLayout
      eyebrow="SURFACE OBSERVATION · CURRENTS"
      title="Surface Ocean Currents"
      description="Inspect the east–west and north–south components of surface current velocity and their combined flow structure."
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

            <p className="mt-2 text-xs text-[#6A97A8]">
              East–west velocity
            </p>
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

            <p className="mt-2 text-xs text-[#6A97A8]">
              North–south velocity
            </p>
          </div>

          <div className="rounded-[24px] border border-white/70 bg-white/60 p-5 backdrop-blur-xl">
            <div className="mb-4 flex items-center gap-3">
              <Navigation size={18} className="text-[#017FBD]" />
              <span className="text-[10px] font-black uppercase tracking-[0.16em] text-[#6A97A8]">
                Speed
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

        {/* Vector visual */}
        <section className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
          <div className="rounded-[28px] border border-white/70 bg-white/60 p-6 shadow-[0_20px_55px_rgba(7,76,101,0.10)] backdrop-blur-xl">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#02ABD5]/10">
                <Navigation size={18} className="text-[#0173BE]" />
              </div>
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#6A97A8]">
                  Velocity vector
                </p>
                <h2 className="text-lg font-black text-[#063B4D]">
                  Current direction
                </h2>
              </div>
            </div>

            <div className="relative flex h-64 items-center justify-center overflow-hidden rounded-2xl border border-[#02ABD5]/10 bg-[#063B4D]/[0.03]">
              <div className="absolute inset-0 opacity-30">
                <div className="h-full w-full bg-[linear-gradient(rgba(2,171,213,0.15)_1px,transparent_1px),linear-gradient(90deg,rgba(2,171,213,0.15)_1px,transparent_1px)] bg-[size:40px_40px]" />
              </div>

              <div
                className="relative h-36 w-1 rounded-full bg-gradient-to-b from-[#0173BE] to-[#07C4DF] shadow-[0_0_25px_rgba(2,171,213,0.3)]"
                style={{
                  transform: `rotate(${direction}deg)`,
                }}
              >
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 border-x-[8px] border-b-[14px] border-x-transparent border-b-[#07C4DF]" />
              </div>

              <div className="absolute bottom-4 left-4 text-[8px] font-black uppercase tracking-[0.15em] text-[#6A97A8]">
                Vector derived from U / V
              </div>
            </div>
          </div>

          <div className="rounded-[28px] border border-white/70 bg-[#063B4D]/95 p-6 text-white shadow-[0_20px_55px_rgba(7,76,101,0.16)]">
            <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#7BDFF0]">
              Current state
            </p>

            <h2 className="mt-2 text-2xl font-black">
              {data.speed} {data.unit}
            </h2>

            <p className="mt-3 text-sm leading-6 text-white/65">
              The combined U and V components describe the horizontal surface
              velocity at the selected observation point.
            </p>

            <div className="mt-7 space-y-4">
              <div>
                <div className="mb-2 flex justify-between text-[9px] font-bold uppercase tracking-[0.15em] text-white/50">
                  <span>U</span>
                  <span>{data.u} m/s</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-[#02ABD5]"
                    style={{ width: `${Math.min(Math.abs(data.u) / 0.5, 1) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="mb-2 flex justify-between text-[9px] font-bold uppercase tracking-[0.15em] text-white/50">
                  <span>V</span>
                  <span>{data.v} m/s</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-[#07C4DF]"
                    style={{ width: `${Math.min(Math.abs(data.v) / 0.5, 1) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Trends */}
        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-[28px] border border-white/70 bg-white/60 p-6 backdrop-blur-xl">
            <h2 className="mb-5 text-lg font-black text-[#063B4D]">
              U component trend
            </h2>

            <DataChart
              title="U"
              subtitle="East–west velocity"
              values={uTrend.map((value) => value + 0.4)}
              labels={["T−7", "T−6", "T−5", "T−4", "T−3", "T−2", "T−1", "Now"]}
              unit="m/s"
            />
          </div>

          <div className="rounded-[28px] border border-white/70 bg-white/60 p-6 backdrop-blur-xl">
            <h2 className="mb-5 text-lg font-black text-[#063B4D]">
              V component trend
            </h2>

            <DataChart
              title="V"
              subtitle="North–south velocity"
              values={vTrend.map((value) => value + 0.4)}
              labels={["T−7", "T−6", "T−5", "T−4", "T−3", "T−2", "T−1", "Now"]}
              unit="m/s"
            />
          </div>
        </section>

        {/* Explanation */}
        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-[24px] border border-[#02ABD5]/15 bg-white/60 p-6 backdrop-blur-xl">
            <div className="mb-4 flex items-center gap-3">
              <Info size={18} className="text-[#02ABD5]" />
              <h2 className="text-lg font-black text-[#063B4D]">
                Reading U and V
              </h2>
            </div>

            <p className="text-sm leading-7 text-[#456F80]">
              U represents the east–west component of surface velocity and V
              represents the north–south component. Their combination gives the
              horizontal current vector and speed.
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
              Surface current vectors provide dynamic information about water
              movement and help describe the surface state used alongside the
              other Ocean Lens input variables.
            </p>
          </div>
        </section>
      </div>
    </OceanDataLayout>
  );
}