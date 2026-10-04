interface Props {
  min: number;
  max: number;
}

export function TemperatureScale({
  min,
  max,
}: Props) {
  const mid = (min + max) / 2;

  return (
    <div className="rounded-[16px] border border-white/65 bg-white/60 p-3.5 shadow-[0_10px_30px_rgba(7,76,101,0.10),inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur-2xl">
      <div className="mb-2.5 flex items-center justify-between">
        <span className="font-['Manrope'] text-[8px] font-bold uppercase tracking-[0.16em] text-[#0785A7]">
          Temperature scale
        </span>

        <span className="font-['Manrope'] text-[8px] font-semibold text-[#527F94]">
          °C
        </span>
      </div>

      <div className="relative h-3 overflow-hidden rounded-full border border-white/70 shadow-[inset_0_1px_2px_rgba(7,76,101,0.08)]">
        <div className="absolute inset-0 bg-[linear-gradient(90deg,#061633_0%,#0A2F68_15%,#075AA6_30%,#08A8C7_45%,#12C98B_60%,#D5E52C_75%,#FFB21A_88%,#EF4B16_100%)]" />
      </div>

      <div className="mt-2 flex items-center justify-between">
        <span className="font-mono text-[8px] font-semibold text-[#24728A]">
          {min.toFixed(1)}°
        </span>

        <span className="font-mono text-[8px] font-semibold text-[#24728A]">
          {mid.toFixed(1)}°
        </span>

        <span className="font-mono text-[8px] font-semibold text-[#24728A]">
          {max.toFixed(1)}°
        </span>
      </div>

      <small className="mt-2 block font-['Manrope'] text-[7px] font-medium uppercase tracking-[0.12em] text-[#6C99AA]">
        Temperature · Celsius
      </small>
    </div>
  );
}