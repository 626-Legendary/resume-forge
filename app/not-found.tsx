"use client";

import Link from "next/link";
import { FaArrowLeft, FaGithub, FaHammer } from "react-icons/fa";
import { JetBrains_Mono, Orbitron } from "next/font/google";

const orbitron = Orbitron({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-orbitron",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-mono",
});

export default function NotFound() {
  return (
    <main
      className={`${orbitron.variable} ${jetbrainsMono.variable} min-h-screen overflow-hidden bg-[#07090c] font-[var(--font-mono)] text-white`}
    >
      <style jsx global>{`
        :root {
          --rf-orange: #f97316;
          --rf-muted: #8b949e;
        }

        @keyframes rf-scan {
          0% {
            transform: translateY(-120%);
            opacity: 0;
          }
          18% {
            opacity: 0.42;
          }
          100% {
            transform: translateY(120vh);
            opacity: 0;
          }
        }

        @keyframes rf-rise {
          from {
            opacity: 0;
            transform: translateY(22px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .rf-brand-font {
          font-family: var(--font-orbitron), sans-serif;
        }

        .rf-error-bg {
          background:
            radial-gradient(
              circle at 18% 14%,
              rgba(249, 115, 22, 0.2),
              transparent 30%
            ),
            radial-gradient(
              circle at 82% 22%,
              rgba(255, 180, 84, 0.08),
              transparent 28%
            ),
            linear-gradient(
              135deg,
              rgba(255, 255, 255, 0.04) 0%,
              transparent 34%
            ),
            #07090c;
        }

        .rf-error-bg::before {
          content: "";
          position: fixed;
          inset: 0;
          pointer-events: none;
          background-image:
            linear-gradient(rgba(249, 115, 22, 0.055) 1px, transparent 1px),
            linear-gradient(
              90deg,
              rgba(249, 115, 22, 0.055) 1px,
              transparent 1px
            );
          background-size: 56px 56px;
          mask-image: linear-gradient(to bottom, black, transparent 88%);
          z-index: 0;
        }

        .rf-error-bg::after {
          content: "";
          position: fixed;
          left: 0;
          right: 0;
          top: 0;
          height: 180px;
          pointer-events: none;
          background: linear-gradient(
            to bottom,
            transparent,
            rgba(249, 115, 22, 0.12),
            transparent
          );
          animation: rf-scan 8s ease-in-out infinite;
          z-index: 0;
        }

        .rf-rise {
          animation: rf-rise 680ms ease both;
        }
      `}</style>

      <div className="rf-error-bg relative flex min-h-screen flex-col">
        <section className="relative z-10 flex flex-1 items-center px-4 py-16 sm:px-5 md:px-8">
          <div className="mx-auto w-full max-w-5xl">
            <div className="rf-rise max-w-3xl">
              <p className="rf-brand-font text-[11px] font-bold uppercase tracking-[0.32em] text-orange-400 sm:text-xs sm:tracking-[0.35em]">
                Page not found
              </p>

              <h1 className="rf-brand-font mt-5 text-7xl font-extrabold uppercase tracking-[0.04em] text-zinc-100 sm:text-8xl md:text-9xl">
                404
              </h1>

              <p className="mt-6 max-w-2xl text-base font-medium leading-7 text-zinc-300 sm:text-lg md:text-xl">
                This route was not forged correctly. The page may have moved,
                been removed, or never existed.
              </p>

              <p className="mt-5 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500 sm:text-sm sm:tracking-[0.22em]">
                Apply faster. Tailor smarter. Land sooner.
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Link
                  href="/"
                  className="rf-brand-font inline-flex items-center justify-center gap-2 border border-orange-300 bg-orange-500 px-5 py-4 text-xs font-extrabold uppercase tracking-[0.16em] text-black transition hover:bg-orange-400 sm:px-6 sm:text-sm sm:tracking-[0.18em]"
                >
                  <FaArrowLeft />
                  Back Home
                </Link>

                <Link
                  href="/dashboard"
                  className="rf-brand-font inline-flex items-center justify-center gap-2 border border-zinc-700 bg-[#0b1016] px-5 py-4 text-xs font-bold uppercase tracking-[0.14em] text-zinc-300 transition hover:border-orange-400 hover:text-orange-400 sm:px-6 sm:text-sm sm:tracking-[0.16em]"
                >
                  <FaHammer />
                  Open Forge
                </Link>

                <Link
                  href="https://github.com/626-Legendary"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rf-brand-font inline-flex items-center justify-center gap-2 border border-zinc-700 bg-[#0b1016] px-5 py-4 text-xs font-bold uppercase tracking-[0.14em] text-zinc-300 transition hover:border-orange-400 hover:text-orange-400 sm:px-6 sm:text-sm sm:tracking-[0.16em]"
                >
                  <FaGithub />
                  GitHub
                </Link>
              </div>
            </div>

            <div className="mt-14 h-px w-full max-w-3xl bg-gradient-to-r from-orange-500/50 via-zinc-800 to-transparent" />
          </div>
        </section>
      </div>
    </main>
  );
}