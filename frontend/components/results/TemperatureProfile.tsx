"use client";

import { useMemo, useState } from "react";

import type { TemperaturePoint } from "@/lib/temperature";

interface Props {
  points: TemperaturePoint[];
  showUncertainty?: boolean;
}

export function TemperatureProfile({
  points,
  showUncertainty = false,
}: Props) {
  const [active, setActive] =
    useState<TemperaturePoint | null>(null);

  const range = useMemo(() => {
    if (!points.length) {
      return {
        min: 0,
        max: 1,
      };
    }

    const values = points.flatMap((p) => [
      p.p05,
      p.p95,
      p.temperature,
    ]);

    const min = Math.min(...values);
    const max = Math.max(...values);

    return {
      min: min - 0.5,
      max: max + 0.5,
    };
  }, [points]);

  const maxDepth = points.length
    ? Math.max(...points.map((p) => p.depth))
    : 1;

  if (!points.length) {
    return (
      <div className="flex min-h-[380px] items-center justify-center rounded-[20px] border border-white/10 bg-[#061C30]/70 shadow-[0_18px_55px_rgba(0,35,50,0.18)]">
        <span className="text-sm font-medium text-[#83AFC0]">
          No temperature data available.
        </span>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-[20px] border border-white/10 bg-[#061C30]/70 p-5 shadow-[0_18px_55px_rgba(0,35,50,0.18)] backdrop-blur-2xl sm:p-6">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute -left-[10%] top-[10%] h-[55%] w-[35%] rounded-full bg-[#02ABD5]/[0.045] blur-[70px]" />

      <div className="pointer-events-none absolute -right-[10%] bottom-[-10%] h-[45%] w-[35%] rounded-full bg-[#0173BE]/[0.05] blur-[75px]" />

      {/* Header */}
      <div className="relative z-10 mb-6 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#65AFC2]">
            Vertical profile
          </p>

          <p className="mt-1.5 text-[15px] font-semibold text-[#DDF8FF]">
            Subsurface temperature
          </p>

          <p className="mt-1 text-[11px] text-[#83AFC0]">
            Temperature variation with depth
          </p>
        </div>

        <div className="rounded-full border border-[#02ABD5]/20 bg-[#02ABD5]/[0.08] px-3 py-1.5 text-[11px] font-bold text-[#07C4DF]">
          °C
        </div>
      </div>

      {/* Chart */}
      <div className="relative z-10 flex">
        {/* Depth label */}
        <div className="relative w-12 shrink-0">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 -rotate-90 whitespace-nowrap text-[10px] font-bold uppercase tracking-[0.16em] text-[#65AFC2]">
            Depth
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <div className="relative h-[330px]">
            {/* Horizontal depth grid */}
            <div className="pointer-events-none absolute inset-0">
              {[0, 0.25, 0.5, 0.75, 1].map(
                (fraction) => (
                  <div
                    key={fraction}
                    className="absolute left-0 right-0 border-t border-white/[0.09]"
                    style={{
                      top: `${fraction * 100}%`,
                    }}
                  >
                    <span className="absolute -left-12 -translate-y-1/2 whitespace-nowrap text-[10px] font-medium text-[#6BAFC6]">
                      {Math.round(
                        maxDepth * fraction,
                      )}{" "}
                      m
                    </span>
                  </div>
                ),
              )}
            </div>

            {/* Vertical temperature guides */}
            <div className="pointer-events-none absolute inset-0 flex justify-between">
              {[0, 1, 2, 3, 4].map((index) => (
                <div
                  key={index}
                  className="h-full border-l border-white/[0.035]"
                />
              ))}
            </div>

            {/* SVG */}
            <svg
              className="absolute inset-0 h-full w-full overflow-visible"
              viewBox="0 0 1000 360"
              preserveAspectRatio="none"
              role="img"
              aria-label="Subsurface temperature profile"
            >
              <defs>
                {/* Main line gradient */}
                <linearGradient
                  id="temperatureProfileGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="0%"
                    stopColor="#07C4DF"
                  />

                  <stop
                    offset="55%"
                    stopColor="#02ABD5"
                  />

                  <stop
                    offset="100%"
                    stopColor="#0173BE"
                  />
                </linearGradient>

                {/* Uncertainty */}
                <linearGradient
                  id="uncertaintyGradient"
                  x1="0"
                  y1="0"
                  x2="1"
                  y2="0"
                >
                  <stop
                    offset="0%"
                    stopColor="#07C4DF"
                    stopOpacity="0.03"
                  />

                  <stop
                    offset="50%"
                    stopColor="#02ABD5"
                    stopOpacity="0.10"
                  />

                  <stop
                    offset="100%"
                    stopColor="#0173BE"
                    stopOpacity="0.04"
                  />
                </linearGradient>

                {/* Line glow */}
                <filter
                  id="temperatureGlow"
                  x="-50%"
                  y="-50%"
                  width="200%"
                  height="200%"
                >
                  <feGaussianBlur
                    stdDeviation="3"
                    result="blur"
                  />

                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Uncertainty band */}
              {showUncertainty && (
                <path
                  d={buildAreaPath(
                    points,
                    maxDepth,
                    range.min,
                    range.max,
                  )}
                  fill="url(#uncertaintyGradient)"
                  stroke="#07C4DF"
                  strokeOpacity="0.10"
                  strokeWidth="1"
                />
              )}

              {/* Subtle glow */}
              <path
                d={buildLinePath(
                  points,
                  maxDepth,
                  range.min,
                  range.max,
                )}
                fill="none"
                stroke="#02ABD5"
                strokeOpacity="0.18"
                strokeWidth="9"
                strokeLinecap="round"
                strokeLinejoin="round"
                filter="url(#temperatureGlow)"
              />

              {/* Main temperature line */}
              <path
                d={buildLinePath(
                  points,
                  maxDepth,
                  range.min,
                  range.max,
                )}
                fill="none"
                stroke="url(#temperatureProfileGradient)"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Surface marker */}
              {points[0] && (
                <>
                  <circle
                    cx={x(
                      points[0].temperature,
                      range.min,
                      range.max,
                    )}
                    cy={y(
                      points[0].depth,
                      maxDepth,
                    )}
                    r="6"
                    fill="none"
                    stroke="#07C4DF"
                    strokeOpacity="0.25"
                    strokeWidth="1.5"
                  />

                  <circle
                    cx={x(
                      points[0].temperature,
                      range.min,
                      range.max,
                    )}
                    cy={y(
                      points[0].depth,
                      maxDepth,
                    )}
                    r="3"
                    fill="#DDF8FF"
                    stroke="#02ABD5"
                    strokeWidth="1.5"
                  />
                </>
              )}

              {/* Deepest marker */}
              {points.length > 1 && (
                <circle
                  cx={x(
                    points[points.length - 1]
                      .temperature,
                    range.min,
                    range.max,
                  )}
                  cy={y(
                    points[points.length - 1].depth,
                    maxDepth,
                  )}
                  r="2.5"
                  fill="#0173BE"
                  stroke="#83AFC0"
                  strokeOpacity="0.4"
                  strokeWidth="1"
                />
              )}
            </svg>

            {/* Small interactive points */}
            {points.map((point) => {
              const top = `${
                (point.depth / maxDepth) * 100
              }%`;

              const left = `${
                ((point.temperature -
                  range.min) /
                  Math.max(
                    range.max - range.min,
                    0.001,
                  )) *
                100
              }%`;

              const isActive =
                active?.depth === point.depth;

              return (
                <button
                  key={point.depth}
                  className={`absolute h-[7px] w-[7px] -translate-x-1/2 -translate-y-1/2 rounded-full border transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#02ABD5]/40 ${
                    isActive
                      ? "z-10 h-[10px] w-[10px] border-[#DDF8FF] bg-[#07C4DF] shadow-[0_0_10px_rgba(7,196,223,0.8)]"
                      : "border-[#061C30] bg-[#07C4DF] shadow-[0_0_6px_rgba(7,196,223,0.5)] hover:h-[10px] hover:w-[10px] hover:bg-[#B8EFFF]"
                  }`}
                  style={{
                    top,
                    left,
                  }}
                  onMouseEnter={() =>
                    setActive(point)
                  }
                  onFocus={() =>
                    setActive(point)
                  }
                  onMouseLeave={() =>
                    setActive(null)
                  }
                  onBlur={() =>
                    setActive(null)
                  }
                  aria-label={`${point.depth} meters, ${point.temperature.toFixed(
                    2,
                  )} degrees Celsius`}
                />
              );
            })}

            {/* Tooltip */}
            {active && (
              <div
                className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-[115%] rounded-[12px] border border-[#07C4DF]/25 bg-[#061C30]/[0.97] px-4 py-3 shadow-[0_16px_45px_rgba(0,0,0,0.45)] backdrop-blur-xl"
                style={{
                  top: `${
                    (active.depth / maxDepth) *
                    100
                  }%`,
                  left: `${
                    ((active.temperature -
                      range.min) /
                      Math.max(
                        range.max - range.min,
                        0.001,
                      )) *
                    100
                  }%`,
                }}
              >
                <strong className="block whitespace-nowrap text-[15px] font-bold text-[#E8FBFF]">
                  {active.temperature.toFixed(2)}°C
                </strong>

                <span className="mt-1 block whitespace-nowrap text-[10px] font-medium text-[#83AFC0]">
                  {active.depth} m depth
                </span>

                {showUncertainty && (
                  <span className="mt-1.5 block whitespace-nowrap text-[9px] text-[#65AFC2]">
                    ±{" "}
                    {(
                      (active.p95 -
                        active.p05) /
                      2
                    ).toFixed(2)}
                    °C uncertainty
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Temperature axis */}
          <div className="mt-4 border-t border-white/[0.09] pt-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-medium text-[#6BAFC6]">
                {range.min.toFixed(1)}°C
              </span>

              <span className="text-[10px] font-medium text-[#6BAFC6]">
                {(
                  (range.min + range.max) /
                  2
                ).toFixed(1)}
                °C
              </span>

              <span className="text-[10px] font-medium text-[#6BAFC6]">
                {range.max.toFixed(1)}°C
              </span>
            </div>

            <p className="mt-2 text-center text-[10px] font-bold uppercase tracking-[0.14em] text-[#65AFC2]">
              Temperature
            </p>
          </div>

          {/* Legend */}
          <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-white/[0.06] pt-4">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-3 w-7 items-center">
                <span className="absolute h-[3px] w-7 rounded-full bg-gradient-to-r from-[#07C4DF] to-[#0173BE] shadow-[0_0_7px_rgba(2,171,213,0.4)]" />
              </span>

              <span className="text-[10px] font-medium text-[#83AFC0]">
                Predicted temperature
              </span>
            </div>

            {showUncertainty && (
              <div className="flex items-center gap-2.5">
                <span className="h-3 w-6 rounded-[3px] border border-[#07C4DF]/20 bg-[#02ABD5]/10" />

                <span className="text-[10px] font-medium text-[#83AFC0]">
                  Uncertainty range
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function x(
  value: number,
  min: number,
  max: number,
) {
  return (
    ((value - min) /
      Math.max(max - min, 0.001)) *
    1000
  );
}

function y(
  depth: number,
  maxDepth: number,
) {
  return (
    (depth /
      Math.max(maxDepth, 1)) *
    360
  );
}

function buildLinePath(
  points: TemperaturePoint[],
  maxDepth: number,
  min: number,
  max: number,
) {
  return points
    .map((point, index) => {
      const command =
        index === 0 ? "M" : "L";

      return `${command} ${x(
        point.temperature,
        min,
        max,
      )} ${y(
        point.depth,
        maxDepth,
      )}`;
    })
    .join(" ");
}

function buildAreaPath(
  points: TemperaturePoint[],
  maxDepth: number,
  min: number,
  max: number,
) {
  const upper = points
    .map((point, index) => {
      const command =
        index === 0 ? "M" : "L";

      return `${command} ${x(
        point.p95,
        min,
        max,
      )} ${y(
        point.depth,
        maxDepth,
      )}`;
    })
    .join(" ");

  const lower = [...points]
    .reverse()
    .map(
      (point) =>
        `L ${x(
          point.p05,
          min,
          max,
        )} ${y(
          point.depth,
          maxDepth,
        )}`,
    )
    .join(" ");

  return `${upper} ${lower} Z`;
}