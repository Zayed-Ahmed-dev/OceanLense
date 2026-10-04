"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import {
  ArrowRight,
  ChevronDown,
  Database,
  Waves,
  Activity,
  Layers3,
} from "lucide-react";

// Tiny tiled wave-line SVG used beneath the hero heading. Kept as a data URI
// so it costs nothing extra to load and tiles seamlessly when animated.
const WAVE_SVG =
  "%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='16' viewBox='0 0 120 16'%3E%3Cpath d='M0 8 Q15 0 30 8 T60 8 T90 8 T120 8' fill='none' stroke='%2302ABD5' stroke-opacity='0.45' stroke-width='2' stroke-linecap='round'/%3E%3C/svg%3E";

export default function LandingPage() {
  const heroAtmosphereRef = useRef<HTMLDivElement>(null);
  const currentLayerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reducedMotion) return;

    const revealElements = document.querySelectorAll(".ocean-reveal");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("ocean-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -60px 0px",
      }
    );

    revealElements.forEach((element) => observer.observe(element));

    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollY = window.scrollY;

          if (heroAtmosphereRef.current) {
            heroAtmosphereRef.current.style.transform = `translate3d(0, ${
              scrollY * 0.08
            }px, 0)`;
          }

          if (currentLayerRef.current) {
            currentLayerRef.current.style.transform = `translate3d(0, ${
              scrollY * -0.035
            }px, 0)`;
          }

          ticking = false;
        });

        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[#F4FAFB] font-[Manrope] text-[#063B4D]">

      {/* =========================================================
          GLOBAL OCEAN BACKGROUND
      ========================================================== */}

      <div
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/background.png')",
        }}
        aria-hidden="true"
      />

      {/* Main readability overlay */}
      <div
        className="fixed inset-0 z-0 bg-gradient-to-b from-white/45 via-white/30 to-[#F4FAFB]/60"
        aria-hidden="true"
      />

      {/* =========================================================
          OCEAN ATMOSPHERE
      ========================================================== */}

      <div
        ref={heroAtmosphereRef}
        className="pointer-events-none fixed inset-0 z-[1] overflow-hidden"
        aria-hidden="true"
      >
        {/* Cyan atmospheric glow */}
        <div className="absolute left-1/2 top-[18%] h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-[#07C4DF]/10 blur-[120px] ocean-breathe" />

        {/* Secondary blue glow */}
        <div className="absolute -right-[180px] top-[35%] h-[500px] w-[500px] rounded-full bg-[#0173BE]/10 blur-[130px] ocean-drift" />

        {/* Soft underwater glow */}
        <div className="absolute -left-[220px] top-[55%] h-[500px] w-[500px] rounded-full bg-[#02ABD5]/10 blur-[130px] ocean-drift-reverse" />

        {/* Floating particles */}
        <OceanParticles />

        {/* Rising bubbles */}
        <OceanBubbles />

        {/* Current lines */}
        <OceanCurrents />
      </div>

      {/* =========================================================
          CONTENT
      ========================================================== */}

      <div className="relative z-10">

        {/* =========================================================
            NAVBAR
        ========================================================== */}

        <header className="sticky top-0 z-40 border-b border-[#063B4D]/[0.06] bg-white/65 backdrop-blur-xl">

          <div className="mx-auto flex h-[76px] w-full max-w-[1400px] items-center justify-between px-6 lg:px-10">

            {/* Logo */}
            <div className="flex items-center gap-3">

              <div className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-[#063B4D]/10 bg-white/85 shadow-[0_2px_12px_rgba(7,76,101,0.08)]">

                <Waves
                  size={16}
                  strokeWidth={1.8}
                  className="text-[#0173BE]"
                />

                <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-[#07C4DF] ocean-pulse" />

              </div>

              <div>
                <p className="text-[12px] font-bold tracking-[0.14em] text-[#063B4D]">
                  OCEAN LENSE
                </p>

                <p className="mt-0.5 text-[9px] font-medium tracking-[0.1em] text-[#6A97A8]">
                  Subsurface intelligence
                </p>
              </div>

            </div>

            {/* Navigation */}
            <nav className="hidden items-center gap-8 md:flex">

              <a
                href="#about"
                className="nav-link text-[12px] font-semibold text-[#456F80]"
              >
                About
              </a>

              <a
                href="#technology"
                className="nav-link text-[12px] font-semibold text-[#456F80]"
              >
                Technology
              </a>

              <Link
                href="/"
                className="group flex items-center gap-2 rounded-full bg-[#063B4D] px-5 py-2.5 text-[11px] font-bold text-white shadow-[0_8px_24px_rgba(6,59,77,0.22)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#0173BE] hover:shadow-[0_12px_30px_rgba(1,115,190,0.3)]"
              >
                Open explorer

                <ArrowRight
                  size={13}
                  className="transition-transform duration-300 group-hover:translate-x-0.5"
                />
              </Link>

            </nav>

          </div>

        </header>

        {/* =========================================================
            HERO
        ========================================================== */}

        <section
          id="about"
          className="relative flex min-h-[calc(100vh-76px)] items-center justify-center px-6 py-20 lg:px-10"
        >

          {/* Hero content */}
          <div className="mx-auto flex w-full max-w-[950px] flex-col items-center text-center">

            {/* Eyebrow */}
            <div className="hero-enter hero-delay-1 flex items-center gap-3">

              <span className="h-px w-8 bg-[#02ABD5]/50" />

              <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#0173BE]">
                AI-reconstructed ocean temperature
              </p>

              <span className="h-px w-8 bg-[#02ABD5]/50" />

            </div>

            {/* Heading */}
            <h1 className="hero-enter hero-delay-2 relative mt-5 max-w-[850px] font-[Fraunces] text-[50px] font-medium leading-[1.03] tracking-[-0.025em] text-[#063B4D] sm:text-[64px] lg:text-[82px]">

              See what the surface

              <br />

              <span className="wave-text-flow inline-block">
                won't show you.
              </span>

              {/* Flowing wave line beneath the full heading — the ocean motion cue */}
              <span
                aria-hidden="true"
                className="heading-wave-line pointer-events-none absolute -bottom-4 left-1/2 h-[14px] w-[84%] max-w-[520px] -translate-x-1/2 sm:-bottom-5 sm:h-[16px]"
                style={{
                  backgroundImage: `url("data:image/svg+xml,${WAVE_SVG}")`,
                }}
              />

            </h1>

            {/* Description */}
            <p className="hero-enter hero-delay-3 mt-10 max-w-[650px] text-[15px] leading-[1.8] text-[#0a1419] sm:text-[16px] sm:mt-8">

              Ocean Lense turns sparse surface observations into a
              full depth-wise reconstruction of subsurface temperature —
              built for researchers who need to see below the line.
            </p>

            {/* CTA */}
            <div className="hero-enter hero-delay-4 mt-9 flex flex-wrap items-center justify-center gap-5">

              <Link
                href="/"
                className="group relative flex items-center gap-3 overflow-hidden rounded-full bg-[#063B4D] px-7 py-4 text-[12px] font-bold text-white shadow-[0_14px_34px_rgba(6,59,77,0.24)] transition-all duration-300 hover:-translate-y-1 hover:bg-[#0173BE] hover:shadow-[0_20px_45px_rgba(6,59,77,0.28)]"
              >

                {/* Water-like shine */}
                <span className="absolute inset-y-0 -left-[100%] w-[70%] skew-x-[-20deg] bg-white/15 transition-all duration-700 group-hover:left-[130%]" />

                <span className="relative">
                  Explore the ocean
                </span>

                <span className="relative flex h-6 w-6 items-center justify-center rounded-full bg-white/15">

                  <ArrowRight
                    size={13}
                    className="transition-transform duration-300 group-hover:translate-x-1"
                  />

                </span>

              </Link>

              <a
                href="#technology"
                className="group text-[12px] font-semibold text-[#456F80] underline decoration-[#02ABD5]/40 underline-offset-4 transition-colors duration-300 hover:text-[#063B4D]"
              >
                How the model works

                <span className="ml-1 inline-block transition-transform duration-300 group-hover:translate-y-0.5">
                  ↓
                </span>
              </a>

            </div>

            {/* Stats */}
            <div className="hero-enter hero-delay-5 mt-16 grid w-full max-w-[620px] grid-cols-3 border-t border-[#063B4D]/10 pt-7">

              <MiniStat
                icon={<Waves size={14} />}
                value="3D"
                label="Subsurface view"
              />

              <MiniStat
                icon={<Activity size={14} />}
                value="AI"
                label="Depth reconstruction"
                bordered
              />

              <MiniStat
                icon={<Layers3 size={14} />}
                value="200m+"
                label="Depth layers"
                bordered
              />

            </div>

            {/* Discover */}
            <a
              href="#technology"
              className="hero-enter hero-delay-6 mt-20 flex flex-col items-center gap-2 text-[#6A97A8] transition-colors duration-300 hover:text-[#063B4D]"
            >

              <span className="text-[10px] font-bold uppercase tracking-[0.12em]">
                Discover
              </span>

              <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[#063B4D]/10 bg-white/50">
                <ChevronDown size={14} className="ocean-scroll-arrow" />
              </span>

            </a>

          </div>

          {/* Depth marker */}
          <div className="absolute bottom-8 left-8 hidden items-center gap-3 lg:flex">

            <div className="flex flex-col items-center gap-1">

              <span className="h-1 w-1 rounded-full bg-[#0173BE]" />

              <span className="h-10 w-px bg-gradient-to-b from-[#0173BE]/50 to-transparent" />

            </div>

            <div>
              <p className="text-[8px] font-bold uppercase tracking-[0.15em] text-[#6A97A8]">
                Surface
              </p>

              <p className="mt-0.5 text-[8px] text-[#6A97A8]/70">
                Observation → Depth
              </p>
            </div>

          </div>

        </section>

        {/* =========================================================
            TECHNOLOGY
        ========================================================== */}

        <section
          id="technology"
          className="relative overflow-hidden border-t border-[#063B4D]/[0.06] bg-white/82 px-6 py-24 backdrop-blur-md lg:px-10"
        >

          {/* Moving ocean layer */}
          <div
            ref={currentLayerRef}
            className="pointer-events-none absolute inset-0 opacity-40"
            aria-hidden="true"
          >

            <div className="absolute -top-20 left-[-10%] h-[180px] w-[120%] rounded-[50%] border-t border-[#02ABD5]/15 ocean-current-long" />

            <div className="absolute -top-8 left-[-15%] h-[150px] w-[120%] rounded-[50%] border-t border-[#0173BE]/10 ocean-current-long-reverse" />

          </div>

          <div className="relative mx-auto max-w-[1100px]">

            {/* Heading */}
            <div className="ocean-reveal mx-auto max-w-[620px] text-center">

              <div className="mb-4 flex items-center justify-center gap-3">

                <span className="h-px w-6 bg-[#02ABD5]/40" />

                <span className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#0173BE]">
                  From surface to depth
                </span>

                <span className="h-px w-6 bg-[#02ABD5]/40" />

              </div>

              <h2 className="font-[Fraunces] text-[34px] font-medium leading-[1.1] tracking-[-0.01em] text-[#063B4D] md:text-[44px]">
                Making the hidden ocean visible.
              </h2>

              <p className="mt-4 text-[14px] leading-[1.75] text-[#456F80]">
                Ocean Lense combines live observations with an AI
                reconstruction model to produce an interactive view
                of temperature beneath the surface, layer by layer.
              </p>

            </div>

            {/* =====================================================
                FEATURE CARDS
            ====================================================== */}

            <div className="mt-14 grid gap-5 md:grid-cols-3">

              <div className="ocean-reveal reveal-delay-1">
                <FeatureCard
                  number="01"
                  icon={<Database size={17} />}
                  title="Observe"
                  description="Start from surface observations and available ocean sensor data."
                />
              </div>

              <div className="ocean-reveal reveal-delay-2">
                <FeatureCard
                  number="02"
                  icon={<Activity size={17} />}
                  title="Reconstruct"
                  description="An AI model infers the hidden temperature structure beneath it."
                />
              </div>

              <div className="ocean-reveal reveal-delay-3">
                <FeatureCard
                  number="03"
                  icon={<Waves size={17} />}
                  title="Explore"
                  description="Interact with the resulting subsurface temperature profile."
                />
              </div>

            </div>

            {/* =====================================================
                DEPTH STRIP
            ====================================================== */}

            <div className="ocean-reveal reveal-delay-4 mt-20">

              <DepthJourney />

            </div>

          </div>

        </section>

        {/* =========================================================
            FOOTER
        ========================================================== */}

        <footer className="relative border-t border-[#063B4D]/[0.06] bg-[#F4FAFB]/90 px-6 py-7 backdrop-blur-md lg:px-10">

          <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-4">

            <span className="text-[10px] font-semibold tracking-[0.06em] text-[#6A97A8]">
              Ocean Lense · Subsurface temperature intelligence
            </span>

            <Link
              href="/"
              className="group flex items-center gap-2 text-[11px] font-bold text-[#0173BE]"
            >
              Open explorer

              <ArrowRight
                size={12}
                className="transition-transform group-hover:translate-x-0.5"
              />

            </Link>

          </div>

        </footer>

      </div>

      {/* =========================================================
          FONTS + ANIMATIONS
      ========================================================== */}

      <style jsx global>{`

        @import url("https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Manrope:wght@400;500;600;700;800&display=swap");

        html {
          scroll-behavior: smooth;
        }

        /* =====================================================
           HERO ENTRANCE
        ====================================================== */

        .hero-enter {
          opacity: 0;
          transform: translateY(22px);
          animation: heroEnter 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .hero-delay-1 {
          animation-delay: 0.05s;
        }

        .hero-delay-2 {
          animation-delay: 0.16s;
        }

        .hero-delay-3 {
          animation-delay: 0.28s;
        }

        .hero-delay-4 {
          animation-delay: 0.4s;
        }

        .hero-delay-5 {
          animation-delay: 0.52s;
        }

        .hero-delay-6 {
          animation-delay: 0.68s;
        }

        @keyframes heroEnter {
          from {
            opacity: 0;
            transform: translateY(22px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* =====================================================
           HEADING WAVE TEXT — flowing gradient, like light
           moving across water. Applied to "won't show you."
        ====================================================== */

        .wave-text-flow {
          background-image: linear-gradient(
            90deg,
            #0173be 0%,
            #02abd5 25%,
            #07c4df 50%,
            #02abd5 75%,
            #0173be 100%
          );
          background-size: 200% 100%;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          animation: waveTextFlow 7s ease-in-out infinite;
        }

        @keyframes waveTextFlow {
          0%,
          100% {
            background-position: 0% 50%;
          }

          50% {
            background-position: 100% 50%;
          }
        }

        /* Flowing wave line tiled beneath the whole heading */

        .heading-wave-line {
          background-repeat: repeat-x;
          background-size: 120px 100%;
          opacity: 0.55;
          animation: headingWaveFlow 3.2s linear infinite;
        }

        @keyframes headingWaveFlow {
          from {
            background-position-x: 0;
          }

          to {
            background-position-x: -120px;
          }
        }

        /* =====================================================
           OCEAN ATMOSPHERE
        ====================================================== */

        .ocean-breathe {
          animation: oceanBreathe 9s ease-in-out infinite;
        }

        @keyframes oceanBreathe {
          0%,
          100% {
            transform: translateX(-50%) scale(1);
            opacity: 0.55;
          }

          50% {
            transform: translateX(-50%) scale(1.12);
            opacity: 0.8;
          }
        }

        .ocean-drift {
          animation: oceanDrift 14s ease-in-out infinite;
        }

        .ocean-drift-reverse {
          animation: oceanDriftReverse 17s ease-in-out infinite;
        }

        @keyframes oceanDrift {
          0%,
          100% {
            transform: translate3d(0, 0, 0);
          }

          50% {
            transform: translate3d(-45px, 25px, 0);
          }
        }

        @keyframes oceanDriftReverse {
          0%,
          100% {
            transform: translate3d(0, 0, 0);
          }

          50% {
            transform: translate3d(50px, -30px, 0);
          }
        }

        /* =====================================================
           PARTICLES
        ====================================================== */

        .ocean-particle {
          position: absolute;
          border-radius: 999px;
          background: rgba(7, 196, 223, 0.32);
          box-shadow: 0 0 12px rgba(7, 196, 223, 0.16);
          animation: particleFloat linear infinite;
        }

        @keyframes particleFloat {
          0% {
            transform: translate3d(0, 20px, 0);
            opacity: 0;
          }

          15% {
            opacity: 0.5;
          }

          50% {
            transform: translate3d(18px, -35px, 0);
            opacity: 0.7;
          }

          85% {
            opacity: 0.35;
          }

          100% {
            transform: translate3d(-12px, -90px, 0);
            opacity: 0;
          }
        }

        /* =====================================================
           BUBBLES
        ====================================================== */

        .ocean-bubble {
          position: absolute;
          bottom: -30px;
          border: 1px solid rgba(7, 196, 223, 0.24);
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.08);
          animation: bubbleRise linear infinite;
        }

        @keyframes bubbleRise {
          0% {
            transform: translate3d(0, 0, 0) scale(0.7);
            opacity: 0;
          }

          12% {
            opacity: 0.45;
          }

          50% {
            transform: translate3d(18px, -45vh, 0) scale(1);
          }

          75% {
            transform: translate3d(-12px, -70vh, 0) scale(0.9);
          }

          100% {
            transform: translate3d(14px, -105vh, 0) scale(1.1);
            opacity: 0;
          }
        }

        /* =====================================================
           OCEAN CURRENTS
        ====================================================== */

        .ocean-current {
          position: absolute;
          height: 100px;
          width: 75%;
          border-top: 1px solid rgba(1, 115, 190, 0.13);
          border-radius: 50%;
          transform: rotate(-6deg);
          animation: currentFlow 13s linear infinite;
        }

        .ocean-current:nth-child(2) {
          width: 85%;
          top: 35%;
          left: -10%;
          animation-duration: 18s;
          animation-delay: -5s;
          opacity: 0.7;
        }

        .ocean-current:nth-child(3) {
          width: 70%;
          top: 62%;
          right: -8%;
          transform: rotate(5deg);
          animation-duration: 15s;
          animation-delay: -9s;
          opacity: 0.5;
        }

        @keyframes currentFlow {
          0% {
            transform: translateX(-10%) rotate(-6deg);
          }

          50% {
            transform: translateX(8%) rotate(-3deg);
          }

          100% {
            transform: translateX(-10%) rotate(-6deg);
          }
        }

        /* =====================================================
           PULSE
        ====================================================== */

        .ocean-pulse {
          animation: oceanPulse 2.8s ease-in-out infinite;
        }

        @keyframes oceanPulse {
          0%,
          100% {
            transform: scale(1);
            opacity: 0.7;
          }

          50% {
            transform: scale(1.6);
            opacity: 1;
          }
        }

        /* =====================================================
           SCROLL ARROW
        ====================================================== */

        .ocean-scroll-arrow {
          animation: scrollArrow 2s ease-in-out infinite;
        }

        @keyframes scrollArrow {
          0%,
          100% {
            transform: translateY(-2px);
            opacity: 0.55;
          }

          50% {
            transform: translateY(3px);
            opacity: 1;
          }
        }

        /* =====================================================
           SCROLL REVEAL
        ====================================================== */

        .ocean-reveal {
          opacity: 0;
          transform: translateY(45px);
          transition:
            opacity 0.9s cubic-bezier(0.16, 1, 0.3, 1),
            transform 0.9s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .ocean-visible {
          opacity: 1;
          transform: translateY(0);
        }

        .reveal-delay-1 {
          transition-delay: 0.08s;
        }

        .reveal-delay-2 {
          transition-delay: 0.18s;
        }

        .reveal-delay-3 {
          transition-delay: 0.28s;
        }

        .reveal-delay-4 {
          transition-delay: 0.38s;
        }

        /* =====================================================
           NAVIGATION
        ====================================================== */

        .nav-link {
          position: relative;
          transition:
            color 0.3s ease,
            transform 0.3s ease;
        }

        .nav-link::after {
          content: "";
          position: absolute;
          left: 0;
          right: 0;
          bottom: -7px;
          height: 1px;
          background: #02abd5;
          transform: scaleX(0);
          transform-origin: center;
          transition: transform 0.3s ease;
        }

        .nav-link:hover {
          color: #063b4d;
          transform: translateY(-1px);
        }

        .nav-link:hover::after {
          transform: scaleX(1);
        }

        /* =====================================================
           TECHNOLOGY CURRENT LAYERS
        ====================================================== */

        .ocean-current-long {
          animation: currentLong 18s ease-in-out infinite;
        }

        .ocean-current-long-reverse {
          animation: currentLongReverse 23s ease-in-out infinite;
        }

        @keyframes currentLong {
          0%,
          100% {
            transform: translateX(-2%);
          }

          50% {
            transform: translateX(7%);
          }
        }

        @keyframes currentLongReverse {
          0%,
          100% {
            transform: translateX(6%);
          }

          50% {
            transform: translateX(-5%);
          }
        }

        /* =====================================================
           REDUCED MOTION
        ====================================================== */

        @media (prefers-reduced-motion: reduce) {

          html {
            scroll-behavior: auto;
          }

          *,
          *::before,
          *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }

          .hero-enter {
            opacity: 1;
            transform: none;
          }

          .ocean-reveal {
            opacity: 1;
            transform: none;
          }

          .wave-text-flow {
            background-position: 0% 50%;
          }

          .heading-wave-line {
            opacity: 0.35;
          }
        }

        /* =====================================================
           MOBILE
        ====================================================== */

        @media (max-width: 640px) {

          .ocean-current {
            width: 120%;
          }

          .ocean-particle {
            opacity: 0.25;
          }

        }

      `}</style>

    </main>
  );
}

/* =============================================================
   OCEAN PARTICLES
============================================================= */

function OceanParticles() {
  const particles = [
    { left: "8%", top: "25%", size: 3, duration: 9, delay: -2 },
    { left: "17%", top: "48%", size: 2, duration: 12, delay: -5 },
    { left: "27%", top: "34%", size: 4, duration: 11, delay: -7 },
    { left: "39%", top: "65%", size: 2, duration: 10, delay: -3 },
    { left: "51%", top: "28%", size: 3, duration: 13, delay: -9 },
    { left: "62%", top: "54%", size: 2, duration: 8, delay: -1 },
    { left: "73%", top: "33%", size: 4, duration: 12, delay: -6 },
    { left: "82%", top: "67%", size: 2, duration: 10, delay: -4 },
    { left: "91%", top: "42%", size: 3, duration: 14, delay: -8 },
    { left: "46%", top: "78%", size: 2, duration: 9, delay: -2 },
  ];

  return (
    <>
      {particles.map((particle, index) => (
        <span
          key={index}
          className="ocean-particle"
          style={{
            left: particle.left,
            top: particle.top,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            animationDuration: `${particle.duration}s`,
            animationDelay: `${particle.delay}s`,
          }}
        />
      ))}
    </>
  );
}

/* =============================================================
   OCEAN BUBBLES
============================================================= */

function OceanBubbles() {
  const bubbles = [
    { left: "12%", size: 8, duration: 15, delay: -3 },
    { left: "24%", size: 5, duration: 12, delay: -8 },
    { left: "42%", size: 10, duration: 18, delay: -12 },
    { left: "58%", size: 6, duration: 14, delay: -5 },
    { left: "74%", size: 8, duration: 17, delay: -10 },
    { left: "88%", size: 5, duration: 13, delay: -7 },
  ];

  return (
    <>
      {bubbles.map((bubble, index) => (
        <span
          key={index}
          className="ocean-bubble"
          style={{
            left: bubble.left,
            width: `${bubble.size}px`,
            height: `${bubble.size}px`,
            animationDuration: `${bubble.duration}s`,
            animationDelay: `${bubble.delay}s`,
          }}
        />
      ))}
    </>
  );
}

/* =============================================================
   OCEAN CURRENTS
============================================================= */

function OceanCurrents() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        className="ocean-current"
        style={{
          top: "20%",
          left: "-10%",
        }}
      />

      <div
        className="ocean-current"
        style={{
          top: "43%",
          left: "-5%",
        }}
      />

      <div
        className="ocean-current"
        style={{
          top: "68%",
          right: "-8%",
        }}
      />
    </div>
  );
}

/* =============================================================
   MINI STAT
============================================================= */

function MiniStat({
  icon,
  value,
  label,
  bordered = false,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
  bordered?: boolean;
}) {
  return (
    <div
      className={`flex flex-col items-center gap-1.5 ${
        bordered ? "border-l border-[#063B4D]/10" : ""
      }`}
    >
      <div className="flex items-center gap-2">

        <span className="text-[#0173BE]">
          {icon}
        </span>

        <span className="text-[17px] font-bold tracking-[-0.02em] text-[#063B4D]">
          {value}
        </span>

      </div>

      <span className="text-[9px] font-semibold text-[#6A97A8]">
        {label}
      </span>

    </div>
  );
}

/* =============================================================
   FEATURE CARD
============================================================= */

function FeatureCard({
  number,
  icon,
  title,
  description,
}: {
  number: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-[24px] border border-white/70 bg-[#F4FAFB]/70 p-7 backdrop-blur-xl transition-all duration-500 hover:-translate-y-2 hover:border-[#02ABD5]/25 hover:bg-white hover:shadow-[0_24px_55px_rgba(6,59,77,0.12)]">

      {/* Water reflection */}
      <div className="pointer-events-none absolute -right-20 -top-20 h-40 w-40 rounded-full bg-[#07C4DF]/8 blur-3xl transition-transform duration-700 group-hover:translate-x-5 group-hover:translate-y-5" />

      <div className="relative">

        <div className="flex items-center justify-between">

          <span className="text-[11px] font-bold text-[#0173BE]">
            {number}
          </span>

          <span className="text-[#6A97A8] transition-colors duration-300 group-hover:text-[#0173BE]">
            {icon}
          </span>

        </div>

        <h3 className="mt-10 text-[18px] font-bold text-[#063B4D]">
          {title}
        </h3>

        <p className="mt-2 text-[13px] leading-[1.7] text-[#456F80]">
          {description}
        </p>

        {/* Tiny current line */}
        <div className="mt-6 h-px w-full overflow-hidden bg-[#063B4D]/5">

          <div className="h-full w-1/4 bg-gradient-to-r from-transparent via-[#02ABD5]/50 to-transparent transition-transform duration-700 group-hover:translate-x-[300%]" />

        </div>

      </div>

    </div>
  );
}

/* =============================================================
   DEPTH JOURNEY
============================================================= */

function DepthJourney() {
  const depths = [
    {
      depth: "0 m",
      label: "Surface",
      description: "Observed conditions",
    },
    {
      depth: "50 m",
      label: "Upper ocean",
      description: "Temperature transition",
    },
    {
      depth: "100 m",
      label: "Thermocline",
      description: "Rapid change",
    },
    {
      depth: "150 m",
      label: "Subsurface",
      description: "Hidden structure",
    },
    {
      depth: "200 m+",
      label: "Deep view",
      description: "AI reconstruction",
    },
  ];

  return (
    <div className="relative overflow-hidden rounded-[28px] border border-white/70 bg-white/55 px-6 py-8 backdrop-blur-xl">

      <div className="relative">

        <div className="mb-8 text-center">

          <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#0173BE]">
            A journey beneath the surface
          </p>

          <p className="mt-2 text-[12px] text-[#6A97A8]">
            From what satellites can observe to what AI can reconstruct.
          </p>

        </div>

        <div className="relative">

          {/* Connecting line */}
          <div className="absolute left-[10%] right-[10%] top-[17px] hidden h-px bg-gradient-to-r from-[#0173BE]/20 via-[#02ABD5]/40 to-[#0173BE]/20 md:block" />

          <div className="grid gap-7 md:grid-cols-5">

            {depths.map((item, index) => (
              <div
                key={item.depth}
                className="group relative text-center"
              >

                {/* Node */}
                <div className="relative mx-auto flex h-[34px] w-[34px] items-center justify-center rounded-full border border-[#02ABD5]/30 bg-white shadow-[0_5px_18px_rgba(1,115,190,0.08)]">

                  <span className="h-2 w-2 rounded-full bg-[#0173BE] transition-all duration-300 group-hover:h-3 group-hover:w-3 group-hover:bg-[#07C4DF]" />

                </div>

                <p className="mt-4 text-[11px] font-bold text-[#063B4D]">
                  {item.depth}
                </p>

                <p className="mt-1 text-[10px] font-semibold text-[#0173BE]">
                  {item.label}
                </p>

                <p className="mt-1 text-[9px] leading-5 text-[#6A97A8]">
                  {item.description}
                </p>

              </div>
            ))}

          </div>

        </div>

      </div>

    </div>
  );
}