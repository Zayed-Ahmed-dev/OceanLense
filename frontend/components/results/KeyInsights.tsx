import { Lightbulb } from "lucide-react";

import type { TemperaturePoint } from "@/lib/temperature";

export function KeyInsights({
  points,
}: {
  points: TemperaturePoint[];
}) {
  const surface = points[0];

  const deepest = points[points.length - 1];

  const changes = points.slice(1).map((point, index) => ({
    point,
    drop:
      points[index].temperature -
      point.temperature,
  }));

  const strongest = changes.reduce(
    (best, current) =>
      current.drop > best.drop
        ? current
        : best,
    changes[0] ?? {
      point: deepest,
      drop: 0,
    },
  );

  const totalDrop =
    surface.temperature -
    deepest.temperature;

  return (
    <section className="rounded-[20px] border border-white/65 bg-white/60 p-4 font-['Manrope'] shadow-[0_14px_40px_rgba(7,76,101,0.09),inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur-2xl">

      {/* HEADER */}
      <div className="mb-4 flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-[#02ABD5]/10 text-[#078EAF]">
          <Lightbulb size={17} />
        </div>

        <div>
          <p className="text-[8px] font-bold uppercase tracking-[0.18em] text-[#0785A7]">
            Analysis
          </p>

          <strong className="text-[12px] font-bold text-[#07516D]">
            Key insights
          </strong>
        </div>
      </div>

      {/* INSIGHTS */}
      <ul className="space-y-2.5">

        {/* TOTAL TEMPERATURE CHANGE */}
        <li className="rounded-[12px] border border-[#02ABD5]/10 bg-white/55 px-3 py-2.5 text-[9px] leading-[1.55] text-[#527F94] shadow-[inset_0_1px_0_rgba(255,255,255,0.75)] transition-all duration-200 hover:border-[#02ABD5]/20 hover:bg-white/70">

          The reconstructed column changes by{" "}

          <strong className="font-bold text-[#07516D]">
            {totalDrop.toFixed(1)}°C
          </strong>{" "}

          between the surface and{" "}

          <strong className="font-semibold text-[#0785A7]">
            {deepest.depth} m
          </strong>.
        </li>

        {/* STRONGEST DROP */}
        <li className="rounded-[12px] border border-[#017FBD]/10 bg-white/55 px-3 py-2.5 text-[9px] leading-[1.55] text-[#527F94] shadow-[inset_0_1px_0_rgba(255,255,255,0.75)] transition-all duration-200 hover:border-[#017FBD]/20 hover:bg-white/70">

          The strongest adjacent-layer drop occurs
          around{" "}

          <strong className="font-bold text-[#0785A7]">
            {strongest.point.depth} m
          </strong>.
        </li>

        {/* UNCERTAINTY */}
        <li className="rounded-[12px] border border-[#07C4DF]/10 bg-white/55 px-3 py-2.5 text-[9px] leading-[1.55] text-[#527F94] shadow-[inset_0_1px_0_rgba(255,255,255,0.75)] transition-all duration-200 hover:border-[#07C4DF]/20 hover:bg-white/70">

          Uncertainty is shown directly from the
          model&apos;s predicted standard deviation
          and quantile outputs.
        </li>

      </ul>
    </section>
  );
}