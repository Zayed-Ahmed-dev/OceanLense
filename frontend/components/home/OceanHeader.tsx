"use client";

import {
  Globe2,
  Waves,
} from "lucide-react";

export default function OceanHeader() {
  return (
    <header className="ocean-header shrink-0 border-b border-[#CFEEF5] bg-white/85 backdrop-blur-2xl">
      <div className="mx-auto flex h-[66px] w-full max-w-[1600px] items-center justify-between px-5 lg:px-7">

        {/* BRAND */}

        <div className="flex items-center gap-3">

          <div className="brand-mark relative flex h-10 w-10 items-center justify-center rounded-[13px] bg-[#07516D] text-white shadow-lg shadow-[#07516D]/20">
            <Waves
              size={21}
              strokeWidth={2.2}
            />

            <span className="brand-pulse absolute inset-0 rounded-[13px] border border-[#02ABD5]/50" />
          </div>

          <div>
            <div className="flex items-center gap-2">

              <h1 className="text-[17px] font-bold tracking-[-0.025em] text-[#07516D]">
                Ocean Lens
              </h1>

              <span className="hidden rounded-full border border-[#9FD9E8] bg-[#E3F7FA] px-2 py-0.5 text-[8px] font-bold uppercase tracking-[0.12em] text-[#0798B5] sm:inline-flex">
                Research
              </span>

            </div>

            <p className="mt-0.5 text-[10px] font-medium tracking-[0.01em] text-[#4F7E95]">
              Subsurface Temperature Intelligence
            </p>
          </div>

        </div>

        {/* STATUS */}

        <div className="hidden items-center gap-5 md:flex">

          <div className="flex items-center gap-2">

            <span className="status-dot" />

            <span className="text-[10px] font-semibold uppercase tracking-[0.13em] text-[#4F7E95]">
              Reconstruction Engine
            </span>

          </div>

          <div className="h-4 w-px bg-[#CFEEF5]" />

          <div className="flex items-center gap-2 text-[#07516D]">

            <Globe2 size={14} />

            <span className="text-[11px] font-semibold">
              Global Ocean
            </span>

          </div>

        </div>

      </div>
    </header>
  );
}