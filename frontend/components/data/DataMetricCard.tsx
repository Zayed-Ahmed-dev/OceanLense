"use client";

import type { ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";

interface DataMetricCardProps {
  label: string;
  shortLabel: string;
  value: string;
  unit: string;
  description: string;
  icon: ReactNode;
  href: string;
  accent?: "cyan" | "blue";
}

export function DataMetricCard({
  label,
  shortLabel,
  value,
  unit,
  description,
  icon,
  href,
  accent = "cyan",
}: DataMetricCardProps) {
  const accentClasses =
    accent === "blue"
      ? "bg-[#017FBD]/10 text-[#017FBD]"
      : "bg-[#02ABD5]/10 text-[#02ABD5]";

  return (
    <a
      href={href}
      className="group relative overflow-hidden rounded-[22px] border border-white/65 bg-white/60 p-5 shadow-[0_14px_40px_rgba(7,76,101,0.09)] backdrop-blur-2xl transition-all duration-300 hover:-translate-y-1 hover:bg-white/72 hover:shadow-[0_20px_50px_rgba(7,76,101,0.14)]"
    >
      {/* Background glow */}

      <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-[#02ABD5]/10 blur-3xl transition-all duration-500 group-hover:scale-150" />

      {/* Top */}

      <div className="relative flex items-start justify-between">
        <span
          className={`flex h-10 w-10 items-center justify-center rounded-[12px] ${accentClasses}`}
        >
          {icon}
        </span>

        <span className="flex h-7 w-7 items-center justify-center rounded-full border border-[#0785A7]/10 bg-white/45 text-[#5E8B9D] transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:bg-white/75 group-hover:text-[#02ABD5]">
          <ArrowUpRight size={14} />
        </span>
      </div>

      {/* Label */}

      <div className="relative mt-5">
        <span className="text-[8px] font-bold uppercase tracking-[0.14em] text-[#0785A7]">
          {shortLabel}
        </span>

        <h3 className="mt-1 font-['Manrope'] text-[15px] font-extrabold tracking-[-0.035em] text-[#07516D]">
          {label}
        </h3>
      </div>

      {/* Value */}

      <div className="relative mt-5 flex items-end gap-1.5">
        <span className="font-['Manrope'] text-[29px] font-extrabold leading-none tracking-[-0.06em] text-[#07516D]">
          {value}
        </span>

        <span className="mb-0.5 text-[10px] font-bold text-[#4F7E95]">
          {unit}
        </span>
      </div>

      {/* Description */}

      <p className="relative mt-3 text-[9px] leading-[1.55] text-[#6A97A8]">
        {description}
      </p>

      {/* Bottom line */}

      <div className="relative mt-5 h-px w-full overflow-hidden bg-[#0785A7]/10">
        <div className="h-full w-0 bg-gradient-to-r from-[#02ABD5] to-[#017FBD] transition-all duration-500 group-hover:w-full" />
      </div>

      <span className="relative mt-3 block text-[8px] font-bold text-[#397B90]">
        View detailed analysis →
      </span>
    </a>
  );
}