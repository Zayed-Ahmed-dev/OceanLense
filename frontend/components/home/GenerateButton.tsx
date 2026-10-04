"use client";

import {
  Play,
  Zap,
} from "lucide-react";

interface GenerateButtonProps {
  isGenerating: boolean;
  error: string | null;
  onGenerate: () => void;
}

export default function GenerateButton({
  isGenerating,
  error,
  onGenerate,
}: GenerateButtonProps) {
  return (
    <div className="border-t border-[#DDF0F3] bg-white/80 p-4 backdrop-blur-xl">
      {error && (
        <div className="mb-2.5 rounded-[11px] border border-red-200 bg-red-50 px-3 py-2.5">
          <p className="text-[9px] leading-[1.4] text-red-600">
            {error}
          </p>
        </div>
      )}

      <button
        type="button"
        onClick={onGenerate}
        disabled={isGenerating}
        className={`group relative flex h-[52px] w-full items-center gap-3 overflow-hidden rounded-[14px] border border-[#07516D] bg-gradient-to-r from-[#07516D] via-[#017FBD] to-[#02ABD5] px-3 text-white shadow-[0_10px_28px_rgba(7,81,109,0.20)] transition-all duration-300 ${
          isGenerating
            ? "cursor-wait opacity-80"
            : "hover:-translate-y-0.5 hover:shadow-[0_14px_34px_rgba(2,171,213,0.28)] active:translate-y-0"
        }`}
      >
        {/* subtle shine */}

        <span className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

        <span className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px] bg-white/15">
          {isGenerating ? (
            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          ) : (
            <Play
              size={14}
              fill="currentColor"
            />
          )}
        </span>

        <span className="relative flex-1 text-left">
          <span className="block text-[11px] font-bold">
            {isGenerating
              ? "Reconstructing..."
              : "Generate Temperature"}
          </span>

          <span className="mt-0.5 block text-[8px] font-medium text-white/65">
            {isGenerating
              ? "Running ocean model"
              : "Run subsurface reconstruction"}
          </span>
        </span>

        <Zap
          size={15}
          className="relative opacity-65 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12"
        />
      </button>
    </div>
  );
}