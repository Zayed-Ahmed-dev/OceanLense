"use client";

import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  Gauge,
  Info,
  MapPin,
  Waves,
} from "lucide-react";

import {OceanDataLayout} from "@/components/data/OceanDataLayout";
import {DataChart} from "@/components/data/DataChart";
import { DEMO_OCEAN_DATA } from "@/lib/demoOceanData";

const sshTrend = [0.18, 0.25, 0.31, 0.37, 0.42, 0.51, 0.67, 0.59];

const slaTrend = [-0.07, -0.02, 0.01, 0.04, 0.08, 0.11, 0.16, 0.12];

function formatDate(value: string) {
  return new Date(value).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function SSHPage() {
  const data = DEMO_OCEAN_DATA.ssh;

  return (
    <OceanDataLayout
      eyebrow="SURFACE OBSERVATION · SSH / SLA"
      title="Sea Surface Height"
      description="Inspect sea surface height and sea-level anomaly signals that describe the dynamic state of the ocean surface."
    >
      <div className="space-y-6">
        {/* Metrics */}
        <section className="grid gap-4 md:grid-cols-4">
          <div className="rounded-[24px] border border-white/70 bg-white/60 p-5 backdrop-blur-xl">
            <div className="mb-4 flex items-center gap-3">
              <Gauge size={18} className="text-[#02ABD5]" />
              <span className="text-[10px] font-black uppercase tracking-[0.16em] text-[#6A97A8]">
                SSH
              </span>
            </div>
            <p className="text-4xl font-black text-[#063B4D]">
              {data.value}
              <span className="ml-2 text-sm text-[#0798B5]">m</span>
            </p>
          </div>

          <div className="rounded-[24px] border border-white/70 bg-white/60 p-5 backdrop-blur-xl">
            <div className="mb-4 flex items-center gap-3">
              <Activity size={18} className="text-[#0173BE]" />
              <span className="text-[10px] font-black uppercase tracking-[0.16em] text-[#6A97A8]">
                SLA
              </span>
            </div>
            <p className="text-4xl font-black text-[#063B4D]">
              {data.sla}
              <span className="ml-2 text-sm text-[#0798B5]">m</span>
            </p>
          </div>

          <div className="rounded-[24px] border border-white/70 bg-white/60 p-5 backdrop-blur-xl">
            <div className="mb-4 flex items-center gap-3">
              <ArrowDownRight size={18} className="text-[#017FBD]" />
              <span className="text-[10px] font-black uppercase tracking-[0.16em] text-[#6A97A8]">
                Minimum
              </span>
            </div>
            <p className="text-4xl font-black text-[#063B4D]">
              {data.min}
              <span className="ml-2 text-sm text-[#0798B5]">m</span>
            </p>
          </div>

          <div className="rounded-[24px] border border-white/70 bg-white/60 p-5 backdrop-blur-xl">
            <div className="mb-4 flex items-center gap-3">
              <ArrowUpRight size={18} className="text-[#02ABD5]" />
              <span className="text-[10px] font-black uppercase tracking-[0.16em] text-[#6A97A8]">
                Maximum
              </span>
            </div>
            <p className="text-4xl font-black text-[#063B4D]">
              {data.max}
              <span className="ml-2 text-sm text-[#0798B5]">m</span>
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

        {/* Charts */}
        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-[28px] border border-white/70 bg-white/60 p-6 backdrop-blur-xl">
            <div className="mb-5">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#02ABD5]">
                Height signal
              </p>
              <h2 className="mt-1 text-xl font-black text-[#063B4D]">
                Sea surface height
              </h2>
            </div>

            <DataChart
              title="SSH"
              subtitle="Surface height"
              values={sshTrend}
              labels={["T−7", "T−6", "T−5", "T−4", "T−3", "T−2", "T−1", "Now"]}
              unit="m"
            />
          </div>

          <div className="rounded-[28px] border border-white/70 bg-white/60 p-6 backdrop-blur-xl">
            <div className="mb-5">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0173BE]">
                Anomaly signal
              </p>
              <h2 className="mt-1 text-xl font-black text-[#063B4D]">
                Sea-level anomaly
              </h2>
            </div>

            <DataChart
              title="SLA"
              subtitle="Deviation from reference state"
              values={slaTrend.map((v) => v + 0.1)}
              labels={["T−7", "T−6", "T−5", "T−4", "T−3", "T−2", "T−1", "Now"]}
              unit="m"
            />
          </div>
        </section>

        {/* Visual */}
        <section className="overflow-hidden rounded-[28px] border border-white/70 bg-[#063B4D]/95 p-6 text-white shadow-[0_20px_55px_rgba(7,76,101,0.16)]">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
              <Waves size={18} className="text-[#07C4DF]" />
            </div>
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#7BDFF0]">
                Surface geometry
              </p>
              <h2 className="text-lg font-black">SSH spatial structure</h2>
            </div>
          </div>

          <div className="relative h-52 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-[#0173BE]/50 via-[#017FBD]/30 to-[#02ABD5]/10">
            <div className="absolute inset-x-[-5%] top-[25%] h-16 rotate-[-3deg] rounded-[50%] border border-[#07C4DF]/30 bg-[#02ABD5]/10" />
            <div className="absolute inset-x-[-5%] top-[48%] h-20 rotate-[2deg] rounded-[50%] border border-[#07C4DF]/25 bg-[#0173BE]/10" />
            <div className="absolute inset-x-[-5%] top-[72%] h-16 rotate-[-2deg] rounded-[50%] border border-[#02ABD5]/20 bg-[#017FBD]/10" />

            <div className="absolute left-[30%] top-[35%] h-4 w-4 rounded-full bg-[#07C4DF] shadow-[0_0_25px_rgba(7,196,223,0.8)]" />
            <div className="absolute left-[55%] top-[55%] h-3 w-3 rounded-full bg-[#02ABD5] shadow-[0_0_20px_rgba(2,171,213,0.8)]" />
            <div className="absolute left-[72%] top-[30%] h-5 w-5 rounded-full bg-[#017FBD] shadow-[0_0_25px_rgba(1,127,189,0.7)]" />
          </div>
        </section>

        {/* Explanation */}
        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-[24px] border border-[#02ABD5]/15 bg-white/60 p-6 backdrop-blur-xl">
            <div className="mb-4 flex items-center gap-3">
              <Info size={18} className="text-[#02ABD5]" />
              <h2 className="text-lg font-black text-[#063B4D]">
                What SSH / SLA represents
              </h2>
            </div>

            <p className="text-sm leading-7 text-[#456F80]">
              Sea surface height describes the elevation of the ocean surface,
              while sea-level anomaly represents a deviation relative to a
              reference state. These fields contain information about ocean
              dynamics and surface circulation.
            </p>
          </div>

          <div className="rounded-[24px] border border-[#02ABD5]/15 bg-white/60 p-6 backdrop-blur-xl">
            <div className="mb-4 flex items-center gap-3">
              <Activity size={18} className="text-[#0173BE]" />
              <h2 className="text-lg font-black text-[#063B4D]">
                Role in Ocean Lens
              </h2>
            </div>

            <p className="text-sm leading-7 text-[#456F80]">
              SSH/SLA provides dynamic surface information that can complement
              SST, salinity, currents, and winds when reconstructing the
              subsurface temperature profile.
            </p>
          </div>
        </section>
      </div>
    </OceanDataLayout>
  );
}