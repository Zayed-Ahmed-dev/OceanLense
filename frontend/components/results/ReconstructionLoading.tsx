export function ReconstructionLoading() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#04131F]">
      {/* Ambient ocean glow */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(2,171,213,0.14),transparent_34%)]" />

      <div className="relative z-10 flex flex-col items-center text-center">
        {/* Animated orbit */}
        <div className="relative flex h-20 w-20 items-center justify-center">
          <span className="absolute h-20 w-20 animate-ping rounded-full border border-[#02ABD5]/20" />

          <span className="absolute h-14 w-14 animate-spin rounded-full border border-[#07C4DF]/15 border-t-[#07C4DF] duration-[2.5s]" />

          <span className="absolute h-9 w-9 rounded-full bg-[#02ABD5]/10 shadow-[0_0_35px_rgba(2,171,213,0.25)]" />

          <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-[#07C4DF] shadow-[0_0_18px_rgba(7,196,223,0.8)]" />
        </div>

        <div className="mt-7">
          <p className="text-[8px] font-bold uppercase tracking-[0.22em] text-[#4F7E95]">
            Ocean Lens
          </p>

          <h1 className="mt-2 text-[17px] font-bold tracking-[-0.02em] text-[#E8FBFF]">
            Preparing reconstruction
          </h1>

          <p className="mt-2 text-[10px] text-[#6F9EAF]">
            Building the depth-wise temperature field
            <span className="ml-0.5 animate-pulse">
              …
            </span>
          </p>
        </div>

        {/* Processing indicator */}
        <div className="mt-6 flex items-center gap-1.5">
          <span className="h-1 w-1 animate-pulse rounded-full bg-[#02ABD5]" />
          <span className="h-1 w-1 animate-pulse rounded-full bg-[#02ABD5] [animation-delay:150ms]" />
          <span className="h-1 w-1 animate-pulse rounded-full bg-[#02ABD5] [animation-delay:300ms]" />
          <span className="ml-2 text-[7px] font-semibold uppercase tracking-[0.15em] text-[#4F7E95]">
            Processing
          </span>
        </div>
      </div>
    </main>
  );
}