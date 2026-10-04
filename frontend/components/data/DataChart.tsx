"use client";

interface DataChartProps {
  title: string;
  subtitle: string;
  values: number[];
  labels: string[];
  unit: string;
}

export function DataChart({
  title,
  subtitle,
  values,
  labels,
  unit,
}: DataChartProps) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  return (
    <div className="rounded-[22px] border border-white/60 bg-white/60 p-5 shadow-[0_14px_40px_rgba(7,76,101,0.08)] backdrop-blur-2xl sm:p-6">

      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="text-[8px] font-bold uppercase tracking-[0.14em] text-[#0785A7]">
            Observation trend
          </span>

          <h2 className="mt-1 font-['Manrope'] text-[17px] font-extrabold tracking-[-0.04em] text-[#07516D]">
            {title}
          </h2>

          <p className="mt-1 text-[9px] text-[#6A97A8]">
            {subtitle}
          </p>
        </div>

        <span className="w-fit rounded-full border border-[#067995]/10 bg-white/50 px-2.5 py-1.5 text-[8px] font-semibold text-[#4F8194]">
          {unit}
        </span>
      </div>

      <div className="mt-7 flex h-[190px] items-end gap-2 sm:h-[230px] sm:gap-3">
        {values.map((value, index) => {
          const height = 25 + ((value - min) / range) * 75;

          return (
            <div
              key={`${labels[index]}-${index}`}
              className="group flex h-full flex-1 flex-col justify-end"
            >
              <div className="relative flex flex-1 items-end">
                <div
                  className="w-full rounded-t-[8px] bg-gradient-to-t from-[#017FBD] to-[#02ABD5] opacity-75 transition-all duration-300 group-hover:opacity-100"
                  style={{
                    height: `${height}%`,
                  }}
                >
                  <span className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-md bg-[#07516D] px-1.5 py-1 text-[7px] font-bold text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                    {value.toFixed(2)}
                  </span>
                </div>
              </div>

              <span className="mt-2 text-center text-[7px] font-medium text-[#6A97A8]">
                {labels[index]}
              </span>
            </div>
          );
        })}
      </div>

    </div>
  );
}