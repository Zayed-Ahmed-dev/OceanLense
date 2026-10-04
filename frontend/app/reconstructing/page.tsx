"use client";

import {
  Activity,
  Layers3,
  Waves,
} from "lucide-react";

const stages = [
  "Surface observations",
  "Ocean data",
  "Depth reconstruction",
  "Temperature profile",
];

export default function ReconstructingPage() {
  return (
    <main className="relative flex h-screen w-full items-center justify-center overflow-hidden bg-[#07516D] font-sans text-white">

      {/* =====================================================
          OCEAN BACKGROUND
      ====================================================== */}

      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage:
            "linear-gradient(180deg, rgba(4,55,76,0.28) 0%, rgba(2,117,151,0.38) 48%, rgba(2,58,94,0.72) 100%), url('/background.png')",
        }}
      />

      {/* Atmospheric blue wash */}

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_38%,rgba(7,196,223,0.18),transparent_32%),linear-gradient(180deg,rgba(255,255,255,0.06),transparent_35%,rgba(0,43,70,0.32))]" />

      {/* Soft animated glow */}

      <div className="absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#02ABD5]/10 blur-[100px] animate-[glow_5s_ease-in-out_infinite]" />

      {/* =====================================================
          MAIN CONTENT
      ====================================================== */}

      <section className="relative z-10 flex w-full max-w-[780px] flex-col items-center px-5">

        {/* =================================================
            EYEBROW
        ================================================== */}

        <div className="mb-3 flex items-center gap-2">

          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#07C4DF] shadow-[0_0_14px_rgba(7,196,223,0.95)]" />

          <p className="text-[9px] font-bold uppercase tracking-[0.28em] text-white/75">
            Ocean Lense · Reconstruction
          </p>

        </div>

        {/* =================================================
            ANIMATED SCRIPT
        ================================================== */}

        <p className="animate-[fadeUp_0.8s_ease-out_both] font-[Caveat] text-[25px] text-[#9DECF7] md:text-[29px]">
          Hidden layers, being revealed.
        </p>

        {/* =================================================
            MAIN TITLE
        ================================================== */}

        <h1 className="mt-1 text-center font-[Manrope] text-[39px] font-medium leading-[0.98] tracking-[-0.065em] text-white animate-[fadeUp_1s_ease-out_0.15s_both] md:text-[54px]">

          Reconstructing the

          <br />

          <span className="bg-gradient-to-r from-white via-[#B8F4FA] to-[#68DDEA] bg-clip-text text-transparent">
            ocean beneath you.
          </span>

        </h1>

        {/* =================================================
            DESCRIPTION
        ================================================== */}

        <p className="mt-4 max-w-[480px] text-center text-[11px] leading-[1.6] text-white/70 animate-[fadeUp_1s_ease-out_0.3s_both] md:text-[12px]">
          Ocean Lense is transforming surface observations
          into a depth-wise view of the hidden ocean.
        </p>

        {/* =================================================
            CENTRAL OCEAN VISUAL
        ================================================== */}

        <div className="relative mt-7 h-[190px] w-full max-w-[620px] overflow-hidden rounded-[28px] border border-white/20 bg-[#063E59]/30 shadow-[0_30px_80px_rgba(0,30,50,0.28)] backdrop-blur-[8px] animate-[fadeUp_1s_ease-out_0.45s_both]">

          {/* glass highlight */}

          <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-white/10 to-transparent" />

          {/* Surface glow */}

          <div className="absolute left-[-10%] right-[-10%] top-[22%] h-[45px]">

            <div className="absolute inset-0 rounded-[50%] bg-gradient-to-b from-[#07C4DF]/70 via-[#02ABD5]/45 to-transparent blur-[1px] animate-[wave_4s_ease-in-out_infinite]" />

            <div className="absolute left-[18%] right-[18%] top-3 h-px bg-white/60 shadow-[0_0_10px_rgba(255,255,255,0.7)]" />

          </div>

          {/* =================================================
              DEPTH FIELD
          ================================================== */}

          <div className="absolute bottom-0 left-[11%] right-[7%] top-[36%]">

            {/* Depth layers */}

            <div className="absolute inset-x-0 top-0 h-[30px] rounded-[50%] bg-[#FFB13B]/25 blur-[12px]" />

            <div className="absolute inset-x-[3%] top-[19%] h-[32px] rounded-[50%] bg-[#DCE83D]/22 blur-[12px]" />

            <div className="absolute inset-x-[6%] top-[38%] h-[34px] rounded-[50%] bg-[#1FD37F]/22 blur-[13px]" />

            <div className="absolute inset-x-[9%] top-[57%] h-[36px] rounded-[50%] bg-[#07C4DF]/25 blur-[14px]" />

            <div className="absolute inset-x-[12%] top-[76%] h-[38px] rounded-[50%] bg-[#017FBD]/25 blur-[15px]" />

            {/* depth lines */}

            <div className="absolute inset-x-0 top-[18%] border-t border-white/10" />

            <div className="absolute inset-x-0 top-[38%] border-t border-white/10" />

            <div className="absolute inset-x-0 top-[58%] border-t border-white/10" />

            <div className="absolute inset-x-0 top-[78%] border-t border-white/10" />

            {/* =================================================
                SCANNING SONAR
            ================================================== */}

            <div className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#7CEBF4] to-transparent shadow-[0_0_14px_rgba(7,196,223,0.95)] animate-[scan_3s_ease-in-out_infinite]" />

          </div>

          {/* =================================================
              DEPTH LABELS
          ================================================== */}

          <div className="absolute left-4 top-[39%] flex flex-col gap-[22px] text-[7px] font-medium tracking-[0.08em] text-white/45">

            <span>0 m</span>
            <span>50 m</span>
            <span>100 m</span>
            <span>150 m</span>
            <span>200 m</span>

          </div>

          {/* =================================================
              CENTER SONAR
          ================================================== */}

          <div className="absolute left-1/2 top-[60%] -translate-x-1/2 -translate-y-1/2">

            <div className="absolute -inset-12 rounded-full border border-[#07C4DF]/20 animate-[sonar_3s_ease-out_infinite]" />

            <div
              className="absolute -inset-7 rounded-full border border-[#07C4DF]/25 animate-[sonar_3s_ease-out_1.5s_infinite]"
            />

            <div className="relative flex h-10 w-10 items-center justify-center rounded-full border border-[#7CEBF4]/40 bg-[#07516D]/70 text-[#8CEEF7] shadow-[0_0_30px_rgba(2,171,213,0.35)] backdrop-blur-md">

              <Waves
                size={17}
                strokeWidth={1.7}
              />

            </div>

          </div>

          {/* =================================================
              MODEL BADGE
          ================================================== */}

          <div className="absolute right-4 top-4 flex items-center gap-2 rounded-full border border-white/15 bg-[#063E59]/45 px-3 py-1.5 backdrop-blur-md">

            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#07C4DF] shadow-[0_0_8px_rgba(7,196,223,0.9)]" />

            <span className="text-[7px] font-bold uppercase tracking-[0.14em] text-white/70">
              Model processing
            </span>

          </div>

        </div>

        {/* =================================================
            WAITING TEXT
        ================================================== */}

        <div className="mt-5 flex items-center gap-2.5 animate-[fadeIn_1s_ease-out_0.8s_both]">

          <Activity
            size={13}
            className="animate-pulse text-[#7CEBF4]"
          />

          <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-white/70">
            Reconstructing hidden temperature layers
          </p>

          <div className="flex gap-1">

            <span className="h-1 w-1 animate-bounce rounded-full bg-[#07C4DF]" />

            <span
              className="h-1 w-1 animate-bounce rounded-full bg-[#02ABD5]"
              style={{ animationDelay: "150ms" }}
            />

            <span
              className="h-1 w-1 animate-bounce rounded-full bg-[#017FBD]"
              style={{ animationDelay: "300ms" }}
            />

          </div>

        </div>

        {/* =================================================
            PROCESS INDICATOR
        ================================================== */}

        <div className="mt-5 flex w-full max-w-[610px] items-center justify-center">

          {stages.map((stage, index) => (
            <div
              key={stage}
              className="flex flex-1 items-center"
            >

              {/* node */}

              <div className="flex items-center gap-1.5">

                <div
                  className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                    index === 0
                      ? "border-[#7CEBF4]/50 bg-[#02ABD5]/30 text-[#B9F7FC]"
                      : "border-white/15 bg-white/5 text-white/35"
                  }`}
                >
                  {index === 0 ? (
                    <Waves size={9} />
                  ) : (
                    <Layers3 size={8} />
                  )}
                </div>

                <span
                  className={`hidden text-[7px] font-semibold sm:block ${
                    index === 0
                      ? "text-white/75"
                      : "text-white/35"
                  }`}
                >
                  {stage}
                </span>

              </div>

              {/* connector */}

              {index < stages.length - 1 && (
                <div className="mx-2 h-px flex-1 bg-gradient-to-r from-white/20 to-white/5" />
              )}

            </div>
          ))}

        </div>

        {/* =================================================
            FOOTNOTE
        ================================================== */}

        <p className="mt-4 text-[8px] tracking-[0.04em] text-white/40">
          Please wait while Ocean Lense prepares your subsurface profile.
        </p>

      </section>

      {/* =====================================================
          ANIMATIONS
      ====================================================== */}

      <style jsx>{`
        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(14px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }

          to {
            opacity: 1;
          }
        }

        @keyframes glow {
          0%,
          100% {
            transform: translate(-50%, -50%) scale(0.9);
            opacity: 0.45;
          }

          50% {
            transform: translate(-50%, -50%) scale(1.08);
            opacity: 0.8;
          }
        }

        @keyframes wave {
          0%,
          100% {
            transform: translateX(-2%) scaleY(1);
          }

          50% {
            transform: translateX(2%) scaleY(0.82);
          }
        }

        @keyframes scan {
          0% {
            top: 0%;
            opacity: 0;
          }

          12% {
            opacity: 1;
          }

          50% {
            opacity: 1;
          }

          88% {
            opacity: 1;
          }

          100% {
            top: 100%;
            opacity: 0;
          }
        }

        @keyframes sonar {
          0% {
            transform: scale(0.55);
            opacity: 0.8;
          }

          70% {
            transform: scale(1.15);
            opacity: 0;
          }

          100% {
            transform: scale(1.15);
            opacity: 0;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          *,
          *::before,
          *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
          }
        }
      `}</style>
    </main>
  );
}