import { ShieldAlert } from "lucide-react";

import type { TemperaturePoint } from "@/lib/temperature";

export function UncertaintyPanel({
  points,
}: {
  points: TemperaturePoint[];
}) {
  const meanStd =
    points.reduce(
      (sum, point) => sum + point.std,
      0,
    ) / points.length;

  const maxStd = Math.max(
    ...points.map((point) => point.std),
  );

  const maxPoint =
    points.find(
      (point) => point.std === maxStd,
    ) ?? points[0];

  const percentage = Math.min(
    100,
    (meanStd /
      Math.max(maxStd, 0.01)) *
      100,
  );

  return (
    <section className="rounded-[20px] border border-white/65 bg-white/60 p-4 font-['Manrope'] shadow-[0_14px_40px_rgba(7,76,101,0.09),inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur-2xl">

      {/* HEADER */}
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-[#02ABD5]/10 text-[#078EAF]">
          <ShieldAlert size={17} />
        </div>

        <div>
          <p className="text-[8px] font-bold uppercase tracking-[0.16em] text-[#0785A7]">
            Model confidence
          </p>

          <span className="text-[11px] font-bold text-[#07516D]">
            Prediction uncertainty
          </span>
        </div>
      </div>

      {/* VALUE */}
      <div className="mt-4">
        <div className="font-mono text-[25px] font-bold tracking-tight text-[#07516D]">
          {meanStd.toFixed(2)}°C
        </div>

        <p className="mt-1.5 text-[9px] leading-[1.5] text-[#527F94]">
          Mean model standard deviation across
          the reconstructed profile.
        </p>
      </div>

      {/* PROGRESS */}
      <div className="mt-4">
        <div className="h-1.5 overflow-hidden rounded-full bg-[#07516D]/8">
          <span
            className="block h-full rounded-full bg-gradient-to-r from-[#017FBD] via-[#02ABD5] to-[#07C4DF] shadow-[0_0_12px_rgba(2,171,213,0.35)] transition-all duration-700"
            style={{
              width: `${percentage}%`,
            }}
          />
        </div>
      </div>

      {/* FOOTER */}
      <div className="mt-2 flex items-center justify-between gap-3">
        <span className="text-[7px] font-semibold uppercase tracking-[0.1em] text-[#0785A7]">
          Relative uncertainty
        </span>

        <small className="text-right text-[8px] font-medium text-[#527F94]">
          Highest: {maxStd.toFixed(2)}°C
          {" · "}
          {maxPoint.depth} m
        </small>
      </div>
    </section>
  );
}