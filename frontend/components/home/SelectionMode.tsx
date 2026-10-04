"use client";

import {
  Crosshair,
  Globe2,
  MousePointer2,
  MoveDiagonal,
} from "lucide-react";

import type { SelectionMode } from "@/hooks/useOceanExplorer";

interface SelectionModeProps {
  mode: SelectionMode;
  onEntireOcean: () => void;
  onArea: () => void;
  onPoint: () => void;
}

export default function SelectionMode({
  mode,
  onEntireOcean,
  onArea,
  onPoint,
}: SelectionModeProps) {
  const options = [
    {
      mode: "entire" as const,
      title: "Entire Ocean",
      description: "Global ocean overview",
      icon: Globe2,
      onClick: onEntireOcean,
    },
    {
      mode: "area" as const,
      title: "Select an Area",
      description: "Drag to define a region",
      icon: MoveDiagonal,
      onClick: onArea,
    },
    {
      mode: "point" as const,
      title: "Select a Point",
      description: "Click any ocean location",
      icon: MousePointer2,
      onClick: onPoint,
    },
  ];

  return (
    <div className="panel-section">
      <div className="mb-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Crosshair
            size={13}
            strokeWidth={2.2}
            className="text-[#02ABD5]"
          />

          <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#4F7E95]">
            Selection Mode
          </p>
        </div>

        <span className="text-[9px] font-semibold text-[#7CA7B6]">
          01
        </span>
      </div>

      <div className="space-y-2">
        {options.map((option) => {
          const Icon = option.icon;
          const active = mode === option.mode;

          return (
            <button
              key={option.mode}
              type="button"
              onClick={option.onClick}
              className={`group flex w-full items-center gap-2.5 rounded-[13px] border p-2.5 text-left transition-all duration-200 ${
                active
                  ? "border-[#8FD8E7] bg-gradient-to-r from-[#E5F9FC] to-[#F4FCFE] shadow-[0_6px_20px_rgba(2,171,213,0.09)]"
                  : "border-transparent bg-[#F7FBFC] hover:border-[#CFE7EC] hover:bg-white"
              }`}
            >
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px] transition-all duration-200 ${
                  active
                    ? "bg-[#07516D] text-white shadow-[0_5px_14px_rgba(7,81,109,0.18)]"
                    : "bg-[#E8F6F8] text-[#43899B] group-hover:bg-[#DDF3F7] group-hover:text-[#02ABD5]"
                }`}
              >
                <Icon size={15} strokeWidth={2} />
              </div>

              <div className="min-w-0 flex-1">
                <p
                  className={`text-[11px] font-bold ${
                    active ? "text-[#07516D]" : "text-[#315E6D]"
                  }`}
                >
                  {option.title}
                </p>

                <p
                  className={`mt-0.5 text-[9px] ${
                    active ? "text-[#527F94]" : "text-[#789AA7]"
                  }`}
                >
                  {option.description}
                </p>
              </div>

              <div
                className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-all duration-200 ${
                  active
                    ? "border-[#02ABD5] bg-[#02ABD5]"
                    : "border-[#BFD8DF] bg-white"
                }`}
              >
                {active && (
                  <span className="h-1.5 w-1.5 rounded-full bg-white" />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}