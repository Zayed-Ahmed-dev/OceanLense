"use client";

import { CalendarDays, ChevronDown } from "lucide-react";

interface DateSelectorProps {
  date: string;
  onChange: (date: string) => void;
}

function formatDisplayDate(value: string) {
  if (!value) return "Select observation date";

  const parsed = new Date(`${value}T00:00:00`);

  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(parsed);
}

export default function DateSelector({
  date,
  onChange,
}: DateSelectorProps) {
  return (
    <div>
      {/* LABEL */}

      <div className="mb-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarDays
            size={13}
            strokeWidth={2.2}
            className="text-[#02ABD5]"
          />

          <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#4F7E95]">
            Observation Date
          </p>
        </div>

        <span className="text-[8px] font-semibold uppercase tracking-[0.12em] text-[#8BAFBC]">
          UTC
        </span>
      </div>

      {/* DATE FIELD */}

      <div className="group relative">
        {/* calendar icon */}

        <div className="pointer-events-none absolute left-3 top-1/2 z-10 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-[8px] bg-[#E3F7FA] text-[#02ABD5] transition-all duration-200 group-focus-within:bg-[#02ABD5] group-focus-within:text-white">
          <CalendarDays
            size={14}
            strokeWidth={2}
          />
        </div>

        {/* visible date */}

        <div className="pointer-events-none absolute inset-y-0 left-[48px] right-10 flex items-center">
          <span className="text-[11px] font-bold tracking-[-0.01em] text-[#07516D]">
            {formatDisplayDate(date)}
          </span>
        </div>

        {/* dropdown icon */}

        <div className="pointer-events-none absolute right-3 top-1/2 flex -translate-y-1/2 items-center justify-center text-[#6C98AA] transition-transform duration-200 group-focus-within:rotate-180 group-focus-within:text-[#02ABD5]">
          <ChevronDown size={14} />
        </div>

        {/* actual input */}

        <input
          type="date"
          value={date}
          onChange={(event) => onChange(event.target.value)}
          aria-label="Observation date"
          className="date-input h-[48px] w-full cursor-pointer rounded-[14px] border border-[#CFE7EC] bg-gradient-to-br from-white to-[#F3FBFD] pl-[48px] pr-10 text-transparent outline-none transition-all duration-200 hover:border-[#9FD9E8] hover:shadow-[0_8px_24px_rgba(2,171,213,0.08)] focus:border-[#02ABD5] focus:bg-white focus:ring-[3px] focus:ring-[#02ABD5]/10"
        />
      </div>

      {/* small supporting text */}

      <div className="mt-2 flex items-center gap-1.5">
        <span className="h-1 w-1 rounded-full bg-[#02ABD5]" />

        <p className="text-[8px] font-medium text-[#789AA7]">
          Select the satellite observation date
        </p>
      </div>
    </div>
  );
}