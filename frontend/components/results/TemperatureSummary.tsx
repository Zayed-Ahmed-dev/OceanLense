import {
  Thermometer,
  ArrowDown,
  Sun,
} from "lucide-react";

import type { TemperaturePoint } from "@/lib/temperature";

interface Props {
  surface: TemperaturePoint;
  deepest: TemperaturePoint;
  warmest: TemperaturePoint;
  coldest: TemperaturePoint;
}

export function TemperatureSummary({
  surface,
  deepest,
  warmest,
  coldest,
}: Props) {
  return (
    <div className="space-y-2.5 font-['Manrope']">

      {/* SURFACE */}
      <article className="group relative overflow-hidden rounded-[18px] border border-[#02ABD5]/20 bg-white/65 p-4 shadow-[0_14px_40px_rgba(7,76,101,0.10),inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur-2xl transition-all duration-200 hover:border-[#02ABD5]/35 hover:bg-white/75">

        <div className="pointer-events-none absolute -right-4 -top-5 h-24 w-24 rounded-full bg-[#02ABD5]/10 blur-2xl transition-all duration-300 group-hover:bg-[#02ABD5]/15" />

        <div className="relative">
          <div className="flex items-center justify-between">
            <div className="flex h-9 w-9 items-center justify-center rounded-[11px] bg-[#02ABD5]/10 text-[#079BB9]">
              <Thermometer size={19} />
            </div>

            <span className="rounded-full border border-[#02ABD5]/15 bg-[#02ABD5]/5 px-2 py-1 text-[7px] font-bold uppercase tracking-[0.12em] text-[#0785A7]">
              Surface
            </span>
          </div>

          <div className="mt-3 text-[8px] font-bold uppercase tracking-[0.16em] text-[#0785A7]">
            Surface temperature
          </div>

          <strong className="mt-1 block font-mono text-[25px] font-bold tracking-tight text-[#07516D]">
            {surface.temperature.toFixed(1)}°C
          </strong>

          <span className="mt-1 block text-[8px] font-medium text-[#527F94]">
            {surface.depth} m · warmest layer{" "}
            {warmest.temperature.toFixed(1)}°C
          </span>
        </div>
      </article>

      {/* DEEPEST */}
      <article className="group relative overflow-hidden rounded-[18px] border border-white/65 bg-white/60 p-4 shadow-[0_12px_35px_rgba(7,76,101,0.08),inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur-2xl transition-all duration-200 hover:border-[#017FBD]/20 hover:bg-white/70">

        <div className="pointer-events-none absolute -bottom-6 -right-5 h-24 w-24 rounded-full bg-[#017FBD]/8 blur-2xl" />

        <div className="relative">
          <div className="flex h-9 w-9 items-center justify-center rounded-[11px] bg-[#017FBD]/10 text-[#017FBD]">
            <ArrowDown size={19} />
          </div>

          <div className="mt-3 text-[8px] font-bold uppercase tracking-[0.16em] text-[#0785A7]">
            Deepest reconstructed
          </div>

          <strong className="mt-1 block font-mono text-[25px] font-bold tracking-tight text-[#07516D]">
            {deepest.temperature.toFixed(1)}°C
          </strong>

          <span className="mt-1 block text-[8px] font-medium text-[#527F94]">
            {deepest.depth} m · coldest layer{" "}
            {coldest.temperature.toFixed(1)}°C
          </span>
        </div>
      </article>

      {/* RANGE */}
      <article className="flex items-center gap-3 rounded-[16px] border border-white/65 bg-white/55 p-3.5 shadow-[0_10px_30px_rgba(7,76,101,0.07),inset_0_1px_0_rgba(255,255,255,0.85)] backdrop-blur-xl">

        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-[#07C4DF]/10 text-[#079BB9]">
          <Sun size={17} />
        </div>

        <div className="min-w-0">
          <span className="block text-[8px] font-bold uppercase tracking-[0.14em] text-[#0785A7]">
            Temperature range
          </span>

          <strong className="mt-0.5 block font-mono text-[16px] font-bold text-[#07516D]">
            {(
              warmest.temperature -
              coldest.temperature
            ).toFixed(1)}
            °C
          </strong>
        </div>
      </article>
    </div>
  );
}