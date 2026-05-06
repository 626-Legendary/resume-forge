"use client";

import Link from "next/link";
import Image from "next/image";
import { FaCode, FaFilePdf, FaGithub, FaHammer } from "react-icons/fa";
import { JetBrains_Mono, Orbitron } from "next/font/google";

import AppFooter from "@/components/AppFooter";
import logoText from "@/public/logo-text.png";

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

export default function Home() {
  return (
    <main
      className={`${orbitron.variable} ${jetbrainsMono.variable} min-h-screen overflow-hidden bg-[#07090c] font-[var(--font-mono)] text-white`}
    >
      <style jsx global>{`
        :root {
          --rf-bg: #07090c;
          --rf-panel: #10151b;
          --rf-orange: #f97316;
          --rf-orange-soft: rgba(249, 115, 22, 0.16);
          --rf-amber: #ffb454;
          --rf-line: rgba(249, 115, 22, 0.24);
          --rf-muted: #8b949e;
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

        @keyframes rf-glow {
          0%,
          100% {
            box-shadow: 0 0 0 rgba(249, 115, 22, 0);
          }
          50% {
            box-shadow: 0 0 38px rgba(249, 115, 22, 0.24);
          }
        }

        .rf-brand-font {
          font-family: var(--font-orbitron), sans-serif;
        }

        .rf-code-font {
          font-family: var(--font-mono), monospace;
        }

        .rf-rise {
          animation: rf-rise 680ms ease both;
        }

        .rf-glow {
          animation: rf-glow 3.8s ease-in-out infinite;
        }

        .rf-home-bg {
          background:
            radial-gradient(
              circle at 18% 14%,
              rgba(249, 115, 22, 0.22),
              transparent 30%
            ),
            radial-gradient(
              circle at 82% 22%,
              rgba(255, 180, 84, 0.1),
              transparent 28%
            ),
            linear-gradient(
              135deg,
              rgba(255, 255, 255, 0.04) 0%,
              transparent 34%
            ),
            #07090c;
        }

        .rf-home-bg::before {
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

        .rf-home-bg::after {
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
      `}</style>

      <div className="rf-home-bg relative min-h-screen">
        {/* Header */}
        <header className="relative z-10 border-b border-orange-500/20 bg-[#090d12]/75 backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-5 md:px-8">
            <Link
              href="/"
              aria-label="Resume Forge Home"
              className="inline-flex min-w-0 items-center"
            >
              <Image
                src={logoText}
                alt="Resume Forge"
                width={220}
                priority
                className="h-auto w-[170px] sm:w-[220px]"
              />
            </Link>

            <nav className="flex shrink-0 items-center gap-2 sm:gap-3">
              <Link
                href="https://github.com/626-Legendary"
                target="_blank"
                rel="noopener noreferrer"
                className="rf-brand-font hidden border border-zinc-700 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-300 transition hover:border-orange-400 hover:text-orange-400 sm:inline-flex"
              >
                GitHub
              </Link>

              <Link
                href="/dashboard"
                className="rf-brand-font border border-orange-400 bg-orange-500 px-3 py-2 text-[11px] font-extrabold uppercase tracking-[0.16em] text-black transition hover:bg-orange-400 sm:px-4 sm:text-xs"
              >
                Launch
              </Link>
            </nav>
          </div>
        </header>

        {/* Hero */}
        <section className="relative z-10 flex min-h-[calc(100vh-73px)] items-center">
          <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-12 px-4 py-14 sm:px-5 md:px-8 md:py-16 lg:grid-cols-[1fr_0.92fr] lg:items-center">
            <div className="rf-rise">
              <p className="rf-brand-font text-[11px] font-bold uppercase tracking-[0.32em] text-orange-400 sm:text-xs sm:tracking-[0.4em]">
                JSON to print-ready resume
              </p>

              <h1 className="rf-brand-font mt-5 text-5xl font-extrabold uppercase tracking-[0.035em] text-zinc-100 sm:text-6xl md:text-7xl lg:text-8xl">
                Resume
                <span className="block text-orange-500">Forge</span>
              </h1>

              <p className="mt-6 max-w-2xl text-base font-medium leading-7 text-zinc-300 sm:text-lg md:text-xl md:leading-8">
                Turn AI-generated resume JSON into an ATS-friendly,
                print-ready resume. Copy, paste, preview, and export without
                manually rebuilding layouts.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:mt-9 sm:flex-row">
                <Link
                  href="/dashboard"
                  className="rf-brand-font rf-glow inline-flex items-center justify-center border border-orange-300 bg-orange-500 px-5 py-4 text-xs font-extrabold uppercase tracking-[0.18em] text-black transition hover:bg-orange-400 sm:px-6 sm:text-sm"
                >
                  Start Forging
                </Link>

                <Link
                  href="https://github.com/626-Legendary"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rf-brand-font inline-flex items-center justify-center gap-2 border border-zinc-700 bg-[#0b1016] px-5 py-4 text-xs font-bold uppercase tracking-[0.14em] text-zinc-300 transition hover:border-orange-400 hover:text-orange-400 sm:px-6 sm:text-sm"
                >
                  <FaGithub />
                  View GitHub
                </Link>
              </div>

              <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500 sm:text-sm sm:tracking-[0.22em]">
                Apply faster. Tailor smarter. Land sooner.
              </p>
            </div>

            {/* Product visual */}
            <div className="rf-rise relative [animation-delay:120ms]">
              <div className="relative overflow-hidden border border-orange-500/25 bg-[#0b1016]/90 shadow-[0_36px_100px_rgba(0,0,0,0.5)]">
                <div className="flex items-center justify-between gap-4 border-b border-orange-500/20 bg-[#111820] px-4 py-4 sm:px-5">
                  <div className="min-w-0">
                    <p className="rf-brand-font text-[10px] font-bold uppercase tracking-[0.24em] text-orange-400 sm:tracking-[0.28em]">
                      Resume Forge Console
                    </p>

                    <p className="mt-1 truncate text-[11px] font-semibold text-zinc-400 sm:text-xs md:text-sm">
                      Input -&gt; Parse -&gt; Preview -&gt; Export
                    </p>
                  </div>

                  <div className="flex h-8 w-10 shrink-0 items-center justify-center border border-orange-500/40 bg-orange-500/10 text-orange-400">
                    <FaFilePdf />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-[0.88fr_1.12fr]">
                  <div className="border-b border-orange-500/15 p-4 sm:p-5 md:border-b-0 md:border-r">
                    <div className="mb-4 flex items-center gap-2 text-orange-400">
                      <FaCode />
                      <p className="rf-brand-font text-xs font-bold uppercase tracking-[0.16em] sm:tracking-[0.18em]">
                        JSON Input
                      </p>
                    </div>

                    <div className="rf-code-font space-y-2 text-[11px] leading-5 text-zinc-400 sm:text-xs">
                      <p>{`{`}</p>
                      <p className="pl-4 text-orange-300">{`"basicInfo": {`}</p>
                      <p className="pl-8">{`"name": "Your Name",`}</p>
                      <p className="pl-8">{`"email": "you@email.com"`}</p>
                      <p className="pl-4 text-orange-300">{`},`}</p>
                      <p className="pl-4 text-orange-300">{`"skills": { ... },`}</p>
                      <p className="hidden pl-4 text-orange-300 sm:block">{`"projects": [ ... ]`}</p>
                      <p>{`}`}</p>
                    </div>

                    <div className="mt-6 grid gap-3">
                      <div className="flex items-center gap-2 border border-orange-500/30 bg-orange-500/10 px-3 py-3 text-xs font-bold text-orange-400 sm:text-sm">
                        <FaHammer />
                        Parse JSON
                      </div>

                      <div className="border border-zinc-700 px-3 py-3 text-xs font-semibold text-zinc-400 sm:text-sm">
                        Load Mock Data
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#d8d3ca] p-4 sm:p-6">
                    <div className="min-h-[360px] bg-white p-5 text-black shadow-[0_20px_60px_rgba(0,0,0,0.25)] sm:min-h-[430px] sm:p-7">
                      <div className="border-b-2 border-black pb-4">
                        <div className="h-7 w-36 bg-zinc-900 sm:h-8 sm:w-40" />
                        <div className="mt-2 h-3 w-24 bg-orange-700/80 sm:w-28" />
                      </div>

                      <div className="mt-6 space-y-5">
                        <section>
                          <div className="mb-3 h-3 w-20 bg-zinc-900" />
                          <div className="space-y-2">
                            <div className="h-2.5 w-full bg-zinc-300" />
                            <div className="h-2.5 w-[92%] bg-zinc-300" />
                            <div className="h-2.5 w-[76%] bg-zinc-300" />
                          </div>
                        </section>

                        <section>
                          <div className="mb-3 h-3 w-16 bg-zinc-900" />
                          <div className="flex flex-wrap gap-2">
                            <div className="h-2.5 w-14 bg-zinc-300 sm:w-16" />
                            <div className="h-2.5 w-20 bg-zinc-300" />
                            <div className="h-2.5 w-24 bg-zinc-300" />
                            <div className="h-2.5 w-12 bg-zinc-300 sm:w-14" />
                          </div>
                        </section>

                        <section>
                          <div className="mb-3 h-3 w-24 bg-zinc-900" />
                          <div className="space-y-2">
                            <div className="h-2.5 w-[62%] bg-zinc-300" />
                            <div className="h-2.5 w-full bg-zinc-300" />
                            <div className="h-2.5 w-[84%] bg-zinc-300" />
                          </div>
                        </section>

                        <section className="pt-2">
                          <div className="flex items-center gap-2 text-orange-700">
                            <FaFilePdf />
                            <p className="rf-brand-font text-[10px] font-black uppercase tracking-[0.14em] sm:text-xs sm:tracking-[0.16em]">
                              Export Ready
                            </p>
                          </div>
                        </section>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="absolute left-0 top-8 h-16 w-1.5 bg-orange-500 sm:-left-3 sm:h-20 sm:w-2" />
                <div className="absolute bottom-8 right-0 h-16 w-1.5 bg-orange-500 sm:-right-3 sm:h-20 sm:w-2" />
                <div className="absolute bottom-0 left-10 h-1.5 w-24 bg-orange-500 sm:-bottom-3 sm:h-2 sm:w-28" />
              </div>
            </div>
          </div>
        </section>

        {/* Why */}
        <section className="relative z-10 border-t border-orange-500/15 bg-[#090d12]/80">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-5 md:px-8 md:py-20">
            <div className="max-w-3xl">
              <p className="rf-brand-font text-[11px] font-bold uppercase tracking-[0.32em] text-orange-400 sm:text-xs sm:tracking-[0.35em]">
                Why Resume Forge
              </p>

              <h2 className="rf-brand-font mt-4 text-3xl font-extrabold uppercase tracking-[0.04em] text-zinc-100 sm:text-4xl">
                Built for AI-assisted resume iteration
              </h2>

              <p className="mt-5 text-base leading-7 text-zinc-400 sm:text-lg">
                Many job seekers already use AI to rewrite resume content, but
                they still have to manually fix spacing, layout, and export
                formatting afterward. Resume Forge turns that workflow into a
                structured copy, paste, preview, and export process.
              </p>
            </div>

            <div className="mt-10 grid gap-4 md:grid-cols-3">
              <article className="border-t border-orange-500/35 bg-[#0b1016]/70 pt-5">
                <h3 className="rf-brand-font text-sm font-bold uppercase tracking-[0.16em] text-zinc-100">
                  AI-Ready Schema
                </h3>
                <p className="mt-3 text-sm leading-6 text-zinc-500">
                  Ask ChatGPT, Claude, or Gemini to generate resume data in the
                  expected JSON format, then paste it directly into the editor.
                </p>
              </article>

              <article className="border-t border-orange-500/35 bg-[#0b1016]/70 pt-5">
                <h3 className="rf-brand-font text-sm font-bold uppercase tracking-[0.16em] text-zinc-100">
                  Instant Preview
                </h3>
                <p className="mt-3 text-sm leading-6 text-zinc-500">
                  Parse your input and immediately inspect the resume layout
                  before exporting or submitting.
                </p>
              </article>

              <article className="border-t border-orange-500/35 bg-[#0b1016]/70 pt-5">
                <h3 className="rf-brand-font text-sm font-bold uppercase tracking-[0.16em] text-zinc-100">
                  ATS-Friendly Export
                </h3>
                <p className="mt-3 text-sm leading-6 text-zinc-500">
                  Generate clean, readable, print-ready resumes designed for
                  practical job applications.
                </p>
              </article>
            </div>
          </div>
        </section>

        {/* Workflow + FAQ */}
        <section className="relative z-10 border-t border-zinc-800 bg-[#07090c]/90">
          <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-5 md:px-8 md:py-20 lg:grid-cols-[1fr_0.9fr]">
            <div>
              <p className="rf-brand-font text-[11px] font-bold uppercase tracking-[0.28em] text-orange-400 sm:text-xs sm:tracking-[0.32em]">
                How it works
              </p>

              <h2 className="rf-brand-font mt-4 text-2xl font-extrabold uppercase tracking-[0.04em] text-zinc-100 sm:text-3xl">
                From AI output to submitted resume
              </h2>

              <ol className="mt-7 space-y-5 text-sm leading-7 text-zinc-400 sm:text-base">
                <li className="border-l border-orange-500/40 pl-4">
                  <span className="text-orange-400">1.</span> Ask an AI
                  assistant to convert your resume or job-targeted content into
                  the Resume Forge JSON schema.
                </li>
                <li className="border-l border-orange-500/40 pl-4">
                  <span className="text-orange-400">2.</span> Paste the JSON,
                  choose a template, and parse it into a live resume preview.
                </li>
                <li className="border-l border-orange-500/40 pl-4">
                  <span className="text-orange-400">3.</span> Export the
                  finished version and save it as a PDF through the browser
                  print dialog.
                </li>
              </ol>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/dashboard"
                  className="rf-brand-font inline-flex items-center justify-center border border-orange-400 bg-orange-500 px-5 py-3 text-xs font-extrabold uppercase tracking-[0.18em] text-black transition hover:bg-orange-400"
                >
                  Open Dashboard
                </Link>

                <Link
                  href="https://github.com/626-Legendary"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rf-brand-font inline-flex items-center justify-center gap-2 border border-zinc-700 bg-[#0b1016] px-5 py-3 text-xs font-bold uppercase tracking-[0.14em] text-zinc-300 transition hover:border-orange-400 hover:text-orange-400"
                >
                  <FaGithub />
                  GitHub
                </Link>
              </div>
            </div>

            <div>
              <p className="rf-brand-font text-[11px] font-bold uppercase tracking-[0.28em] text-orange-400 sm:text-xs sm:tracking-[0.32em]">
                FAQ
              </p>

              <div className="mt-7 space-y-5">
                <div className="border-t border-zinc-800 pt-5">
                  <h3 className="text-sm font-semibold text-zinc-100">
                    Who is Resume Forge for?
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-zinc-500">
                    It is useful for developers, students, and job seekers who
                    want to tailor resumes quickly without manually rebuilding
                    layouts.
                  </p>
                </div>

                <div className="border-t border-zinc-800 pt-5">
                  <h3 className="text-sm font-semibold text-zinc-100">
                    Do I need a database or account?
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-zinc-500">
                    No. The current version is intentionally lightweight and
                    runs in the browser.
                  </p>
                </div>

                <div className="border-t border-zinc-800 pt-5">
                  <h3 className="text-sm font-semibold text-zinc-100">
                    Can I generate the JSON with AI?
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-zinc-500">
                    Yes. Ask ChatGPT, Claude, or Gemini to output valid Resume
                    Forge JSON, then paste it into the editor.
                  </p>
                </div>

                <div className="border-t border-zinc-800 pt-5">
                  <h3 className="text-sm font-semibold text-zinc-100">
                    Is the output ATS-friendly?
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-zinc-500">
                    The templates are designed to stay clean, readable, and
                    practical for applicant tracking systems.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <AppFooter />
      </div>
    </main>
  );
}