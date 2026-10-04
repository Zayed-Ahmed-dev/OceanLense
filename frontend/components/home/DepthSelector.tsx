"use client";

import { ArrowDown } from "lucide-react";

interface DepthSelectorProps {
  depth: number;
  depthDifference: number;
  onDepthChange: (depth: number) => void;
  onDepthDifferenceChange: (difference: number) => void;
}

export default function DepthSelector({
  depth,
  depthDifference,
  onDepthChange,
  onDepthDifferenceChange,
}: DepthSelectorProps) {
  return (
    <div className="panel-section">

      {/* HEADER */}

      <div className="mb-3 flex items-center gap-2">

        <ArrowDown
          size={13}
          className="text-[#02ABD5]"
        />

        <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#4F7E95]">
          Depth
        </p>

      </div>

      {/* MAXIMUM DEPTH */}

      <div className="rounded-[13px] border border-[#CFEEF5] bg-gradient-to-br from-[#F4FCFE] to-[#E7F8FB] p-3">

        <div className="flex items-center justify-between">

          <div>

            <p className="text-[10px] font-semibold text-[#527F94]">
              Maximum depth
            </p>

            <div className="mt-1 flex items-baseline gap-1">

              <span className="text-[22px] font-bold tracking-[-0.03em] text-[#07516D]">
                {depth}
              </span>

              <span className="text-[10px] font-semibold text-[#4F7E95]">
                m
              </span>

            </div>

          </div>

          {/* +/- CONTROLS */}

          <div className="flex items-center gap-1.5">

            <button
              type="button"
              onClick={() =>
                onDepthChange(Math.max(depth - 100, 0))
              }
              disabled={depth <= 0}
              className="flex h-7 w-7 items-center justify-center rounded-[8px] border border-[#CBEAF0] bg-white text-[#07516D] transition hover:bg-[#E8F8FB] disabled:cursor-not-allowed disabled:opacity-40"
            >
              −
            </button>

            <button
              type="button"
              onClick={() =>
                onDepthChange(Math.min(depth + 100, 1000))
              }
              disabled={depth >= 1000}
              className="flex h-7 w-7 items-center justify-center rounded-[8px] border border-[#CBEAF0] bg-white text-[#07516D] transition hover:bg-[#E8F8FB] disabled:cursor-not-allowed disabled:opacity-40"
            >
              +
            </button>

          </div>

        </div>

        {/* DEPTH SLIDER */}

        <input
          type="range"
          min="0"
          max="1000"
          step="100"
          value={depth}
          onChange={(event) =>
            onDepthChange(Number(event.target.value))
          }
          className="mt-3 w-full accent-[#02ABD5]"
        />

        <div className="mt-1 flex justify-between text-[8px] font-medium text-[#6A92A3]">
          <span>0 m</span>
          <span>500 m</span>
          <span>1000 m</span>
        </div>

      </div>

      {/* DEPTH INTERVAL */}

      <div className="mt-3">

        <p className="mb-2 text-[10px] font-semibold text-[#527F94]">
          Depth interval
        </p>

        <div className="grid grid-cols-3 gap-2">

          {[5, 10, 100].map((value) => (

            <button
              key={value}
              type="button"
              onClick={() =>
                onDepthDifferenceChange(value)
              }
              className={`rounded-[10px] border px-2 py-2 text-[10px] font-bold transition ${
                depthDifference === value
                  ? "border-[#02ABD5] bg-[#E3F7FA] text-[#0173BE] shadow-sm"
                  : "border-[#D5ECF1] bg-white text-[#527F94] hover:border-[#A9DDE7] hover:bg-[#F4FCFE]"
              }`}
            >
              {value} m
            </button>

          ))}

        </div>

        <p className="mt-2 text-[8px] leading-[1.4] text-[#7195A4]">
          Select the vertical spacing between reconstructed
          temperature levels.
        </p>

      </div>

    </div>
  );
}