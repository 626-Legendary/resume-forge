"use client";

import { useState } from "react";
import Image from "next/image";
import { JetBrains_Mono, Orbitron } from "next/font/google";
import AppFooter from "@/components/AppFooter";
import ResumeTemplateRenderer from "@/components/resume-template-renderer";
import {
  DEFAULT_RESUME_TEMPLATE_ID,
  RESUME_TEMPLATE_OPTIONS,
  type ResumeTemplateId,
} from "@/lib/resume-template";
import {
  createStoredResumeExport,
  defaultResumeJson,
  mockResumeJson,
  parseResumeJson,
  RESUME_STORAGE_KEY,
  stringifyResumeJson,
} from "@/lib/resume";
import logoText from "@/public/logo-text.png";
import type { ResumeData } from "@/types/resume";

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

const defaultJsonInput = stringifyResumeJson(defaultResumeJson);
const mockJsonInput = stringifyResumeJson(mockResumeJson);

const Page = () => {
  const [jsonInput, setJsonInput] = useState(defaultJsonInput);
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [templateId, setTemplateId] = useState<ResumeTemplateId>(
    DEFAULT_RESUME_TEMPLATE_ID
  );
  const [error, setError] = useState("");

  const handleExport = () => {
    if (!resumeData) {
      setError("Please parse your resume JSON before exporting.");
      return;
    }

    window.localStorage.setItem(
      RESUME_STORAGE_KEY,
      stringifyResumeJson(createStoredResumeExport(resumeData, templateId))
    );

    window.open("/export", "_blank", "noopener,noreferrer");
  };

  const handleParse = () => {
    try {
      const parsed = parseResumeJson(jsonInput);
      setResumeData(parsed);
      setError("");
    } catch {
      setResumeData(null);
      setError("Invalid JSON. Please check your format.");
    }
  };

  const handleLoadMockData = () => {
    const parsed = parseResumeJson(mockJsonInput);
    setJsonInput(mockJsonInput);
    setResumeData(parsed);
    setError("");
  };

  const handleReset = () => {
    setJsonInput(defaultJsonInput);
    setResumeData(null);
    setError("");
  };

  return (
    <main
      className={`${orbitron.variable} ${jetbrainsMono.variable} min-h-screen overflow-hidden bg-[var(--rf-bg)] font-[var(--font-mono)] text-[var(--rf-text)]`}
    >
      <style jsx global>{`
        :root {
          --rf-bg: #07090c;
          --rf-panel: #10151b;
          --rf-panel-2: #151b23;
          --rf-panel-3: #0b1016;
          --rf-line: rgba(249, 115, 22, 0.28);
          --rf-line-soft: rgba(148, 163, 184, 0.16);
          --rf-orange: #f97316;
          --rf-orange-soft: rgba(249, 115, 22, 0.12);
          --rf-amber: #ffb454;
          --rf-text: #f4f4f5;
          --rf-muted: #8b949e;
          --rf-danger: #fb7185;
          --rf-success: #4ade80;
        }

        @keyframes rf-scan {
          0% {
            transform: translateY(-100%);
            opacity: 0;
          }
          12% {
            opacity: 0.48;
          }
          100% {
            transform: translateY(100vh);
            opacity: 0;
          }
        }

        @keyframes rf-enter {
          from {
            opacity: 0;
            transform: translateY(18px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes rf-pulse {
          0%,
          100% {
            box-shadow: 0 0 0 rgba(249, 115, 22, 0);
          }
          50% {
            box-shadow: 0 0 32px rgba(249, 115, 22, 0.22);
          }
        }

        .rf-workspace {
          background:
            radial-gradient(
              circle at 18% 8%,
              rgba(249, 115, 22, 0.18),
              transparent 28%
            ),
            radial-gradient(
              circle at 85% 18%,
              rgba(255, 180, 84, 0.08),
              transparent 26%
            ),
            linear-gradient(
              135deg,
              rgba(255, 255, 255, 0.035) 0,
              transparent 32%
            ),
            var(--rf-bg);
        }

        .rf-workspace::before {
          content: "";
          position: fixed;
          inset: 0;
          pointer-events: none;
          background-image:
            linear-gradient(rgba(249, 115, 22, 0.05) 1px, transparent 1px),
            linear-gradient(
              90deg,
              rgba(249, 115, 22, 0.05) 1px,
              transparent 1px
            );
          background-size: 48px 48px;
          mask-image: linear-gradient(to bottom, black, transparent 80%);
          z-index: 0;
        }

        .rf-workspace::after {
          content: "";
          position: fixed;
          left: 0;
          right: 0;
          top: 0;
          height: 160px;
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

        .rf-brand-font {
          font-family: var(--font-orbitron), sans-serif;
        }

        .rf-code-font {
          font-family: var(--font-mono), monospace;
        }

        .rf-enter {
          animation: rf-enter 520ms ease both;
        }

        .rf-pulse {
          animation: rf-pulse 3.6s ease-in-out infinite;
        }
      `}</style>

      <div className="rf-workspace relative flex min-h-screen flex-col">
        {/* Header */}
        <header className="relative z-10 border-b border-[var(--rf-line)] bg-[#0b1016]/88 backdrop-blur-xl">
          <div className="mx-auto flex max-w-[1720px] items-center justify-between gap-4 px-4 py-4 sm:px-5 md:px-7">
            <div className="flex min-w-0 items-center gap-4 md:gap-5">
              <Image
                src={logoText}
                alt="Resume Forge Logo"
                width={230}
                priority
                className="h-auto w-[170px] shrink-0 sm:w-[220px] md:w-[230px]"
              />

              <div className="hidden min-w-0 border-l border-zinc-700/80 pl-5 lg:block">
                <p className="rf-brand-font text-sm font-bold uppercase tracking-[0.28em] text-zinc-100">
                  Resume Forge Console
                </p>
                <p className="mt-1 text-xs font-medium text-[var(--rf-muted)]">
                  Apply faster. Tailor smarter. Land sooner.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleExport}
              disabled={!resumeData}
              className="rf-brand-font shrink-0 border border-orange-400 bg-[var(--rf-orange)] px-3 py-2 text-[11px] font-extrabold uppercase tracking-[0.14em] text-black transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:border-zinc-700 disabled:bg-zinc-800 disabled:text-zinc-500 sm:px-5 sm:py-2.5 sm:text-xs sm:tracking-[0.18em]"
            >
              Export PDF
            </button>
          </div>
        </header>

        {/* Brand strip */}
        <section className="relative z-10 border-b border-[var(--rf-line-soft)] bg-gradient-to-r from-[#0a0f15]/90 via-[#121820]/80 to-[#0a0f15]/90">
          <div className="mx-auto max-w-[1720px] px-4 py-4 sm:px-5 md:px-7">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="rf-brand-font text-[11px] font-bold uppercase tracking-[0.28em] text-[var(--rf-orange)] sm:text-xs sm:tracking-[0.35em]">
                  JSON to print-ready resume
                </p>

                <h1 className="rf-brand-font mt-2 text-2xl font-extrabold uppercase tracking-[0.06em] text-zinc-100 md:text-4xl md:tracking-[0.08em]">
                  Resume Forge
                </h1>
              </div>
            </div>
          </div>
        </section>

        {/* Main composition: Input Bay | Control Console | Output Bay */}
        <div className="relative z-10 mx-auto grid w-full max-w-[1720px] flex-1 grid-cols-1 gap-4 p-4 sm:p-5 md:px-7 xl:grid-cols-[430px_310px_minmax(0,1fr)]">
          {/* Input Bay */}
          <section className="rf-enter flex min-h-[620px] flex-col overflow-hidden border border-zinc-800 bg-[var(--rf-panel)] xl:min-h-[720px]">
            <div className="border-b border-zinc-800 bg-[var(--rf-panel-3)] px-4 py-4 sm:px-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="rf-brand-font text-[10px] font-bold uppercase tracking-[0.24em] text-[var(--rf-orange)] sm:text-[11px] sm:tracking-[0.28em]">
                    Input Bay
                  </p>

                  <h2 className="mt-2 text-lg font-bold uppercase tracking-[0.1em] text-zinc-100 sm:text-xl sm:tracking-[0.12em]">
                    JSON Input
                  </h2>

                  <p className="mt-1 text-sm leading-6 text-[var(--rf-muted)]">
                    Edit the schema or paste AI-generated resume JSON.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleReset}
                  className="shrink-0 border border-zinc-700 bg-[#0b1016] px-3 py-1.5 text-xs font-semibold text-zinc-300 transition hover:border-orange-400 hover:text-orange-400 sm:text-sm"
                >
                  Reset
                </button>
              </div>
            </div>

            <div className="flex flex-1 flex-col p-4">
              <textarea
                value={jsonInput}
                onChange={(event) => setJsonInput(event.target.value)}
                placeholder="Paste your resume JSON here..."
                spellCheck={false}
                className="rf-code-font min-h-[460px] flex-1 resize-none border border-zinc-700 bg-[#05080b] p-4 text-xs leading-6 text-zinc-200 outline-none transition placeholder:text-zinc-600 focus:border-orange-500 focus:ring-1 focus:ring-orange-500/50 sm:text-sm xl:min-h-[560px]"
              />

              <div className="mt-3 border border-zinc-800 bg-[#0b1016] px-3 py-2">
                {error ? (
                  <p className="text-sm font-semibold text-[var(--rf-danger)]">
                    {error}
                  </p>
                ) : resumeData ? (
                  <p className="text-sm font-semibold text-[var(--rf-success)]">
                    JSON parsed successfully. Preview is ready.
                  </p>
                ) : (
                  <p className="text-sm font-semibold text-zinc-500">
                    Ready to parse JSON.
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* Control Console */}
          <aside className="rf-enter flex min-h-0 flex-col gap-4 xl:min-h-[720px] [animation-delay:90ms]">
            {/* Actions */}
            <section className="border border-zinc-800 bg-[var(--rf-panel)] p-4 sm:p-5">
              <p className="rf-brand-font text-[10px] font-bold uppercase tracking-[0.24em] text-[var(--rf-orange)] sm:text-[11px] sm:tracking-[0.28em]">
                Control Console
              </p>

              <h2 className="mt-2 text-lg font-bold uppercase tracking-[0.1em] text-zinc-100 sm:text-xl sm:tracking-[0.12em]">
                Build Flow
              </h2>

              <p className="mt-2 text-sm leading-6 text-[var(--rf-muted)]">
                Parse JSON, inspect the preview, then export a print-ready PDF.
              </p>

              <div className="mt-5 grid gap-3">
                <button
                  type="button"
                  onClick={handleParse}
                  className="rf-brand-font rf-pulse w-full border border-orange-300 bg-[var(--rf-orange)] px-4 py-3 text-xs font-extrabold uppercase tracking-[0.18em] text-black transition hover:bg-orange-400 sm:tracking-[0.2em]"
                >
                  Parse JSON
                </button>

                <button
                  type="button"
                  onClick={handleLoadMockData}
                  className="rf-brand-font w-full border border-zinc-700 bg-[#0b1016] px-4 py-3 text-xs font-bold uppercase tracking-[0.16em] text-zinc-300 transition hover:border-orange-400 hover:text-orange-400 sm:tracking-[0.18em]"
                >
                  Load Mock Data
                </button>

                <button
                  type="button"
                  onClick={handleReset}
                  className="rf-brand-font w-full border border-zinc-700 bg-[#0b1016] px-4 py-3 text-xs font-bold uppercase tracking-[0.16em] text-zinc-400 transition hover:border-orange-400 hover:text-orange-400 sm:tracking-[0.18em]"
                >
                  Reset Template
                </button>
              </div>
            </section>

            {/* Template Selector */}
            <section className="border border-zinc-800 bg-[var(--rf-panel)] p-4 sm:p-5 xl:flex-1">
              <p className="rf-brand-font text-[10px] font-bold uppercase tracking-[0.24em] text-[var(--rf-orange)] sm:text-[11px] sm:tracking-[0.28em]">
                Template Deck
              </p>

              <h2 className="mt-2 text-lg font-bold uppercase tracking-[0.1em] text-zinc-100 sm:text-xl sm:tracking-[0.12em]">
                Template
              </h2>

              <p className="mt-2 text-sm leading-6 text-[var(--rf-muted)]">
                Choose the resume style used by preview and export.
              </p>

              <div className="mt-5 grid gap-2">
                {RESUME_TEMPLATE_OPTIONS.map((option) => {
                  const isSelected = templateId === option.id;

                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setTemplateId(option.id)}
                      title={option.description}
                      className={`border px-3 py-3 text-left transition ${
                        isSelected
                          ? "border-orange-400 bg-[var(--rf-orange)] text-black"
                          : "border-zinc-700 bg-[#0b1016] text-zinc-200 hover:border-orange-400 hover:text-orange-300"
                      }`}
                    >
                      <span className="block text-sm font-bold uppercase tracking-[0.08em]">
                        {option.label}
                      </span>

                      <span
                        className={`mt-1 block text-sm leading-5 ${
                          isSelected ? "text-black/70" : "text-zinc-500"
                        }`}
                      >
                        {option.description}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Guide */}
            <section className="border border-zinc-800 bg-[var(--rf-panel)] p-4 sm:p-5">
              <p className="rf-brand-font text-[10px] font-bold uppercase tracking-[0.24em] text-[var(--rf-orange)] sm:text-[11px] sm:tracking-[0.28em]">
                Quick Guide
              </p>

              <ol className="mt-4 space-y-2 text-sm leading-6 text-zinc-400">
                <li>1. Edit JSON input.</li>
                <li>2. Select a template.</li>
                <li>3. Click Parse JSON.</li>
                <li>4. Export and save as PDF.</li>
              </ol>

              <p className="mt-4 border-t border-zinc-800 pt-4 text-sm leading-6 text-zinc-500">
                Tip: Ask ChatGPT, Gemini, or Claude to generate resume JSON from
                your existing resume, then paste it here.
              </p>
            </section>
          </aside>

          {/* Output Bay */}
          <section className="rf-enter flex min-h-[620px] flex-col overflow-hidden border border-zinc-800 bg-[var(--rf-panel)] xl:min-h-[720px] [animation-delay:160ms]">
            <div className="flex items-start justify-between gap-4 border-b border-zinc-800 bg-[var(--rf-panel-3)] px-4 py-4 sm:px-5">
              <div>
                <p className="rf-brand-font text-[10px] font-bold uppercase tracking-[0.24em] text-[var(--rf-orange)] sm:text-[11px] sm:tracking-[0.28em]">
                  Output Bay
                </p>

                <h2 className="mt-2 text-lg font-bold uppercase tracking-[0.1em] text-zinc-100 sm:text-xl sm:tracking-[0.12em]">
                  Live Preview
                </h2>

                <p className="mt-1 text-sm leading-6 text-[var(--rf-muted)]">
                  Preview updates after parsing your JSON.
                </p>
              </div>

              <div
                className={`shrink-0 border px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] sm:text-xs sm:tracking-[0.14em] ${
                  resumeData
                    ? "border-green-500/40 bg-green-500/10 text-green-400"
                    : "border-zinc-700 bg-[#0b1016] text-zinc-500"
                }`}
              >
                {resumeData ? "Ready" : "Standby"}
              </div>
            </div>

            <div className="flex-1 overflow-auto bg-[linear-gradient(135deg,rgba(255,255,255,0.03),transparent_32%),#0b1016] p-4 sm:p-5 md:p-6">
              {resumeData ? (
                <div className="mx-auto w-fit bg-white p-4 text-black shadow-[0_24px_80px_rgba(0,0,0,0.55)] sm:p-8">
                  <ResumeTemplateRenderer
                    data={resumeData}
                    templateId={templateId}
                  />
                </div>
              ) : (
                <div className="flex h-full min-h-[460px] items-center justify-center sm:min-h-[560px]">
                  <div className="max-w-md border border-dashed border-zinc-700 bg-[#0b1016] p-6 text-center sm:p-8">
                    

                    <p className="rf-brand-font text-xs font-bold uppercase tracking-[0.2em] text-zinc-200 sm:text-sm sm:tracking-[0.22em]">
                      No Preview Yet
                    </p>

                    <p className="mt-4 text-sm leading-6 text-zinc-500">
                      Paste resume JSON, choose a template, then click Parse
                      JSON to generate a live preview.
                    </p>

                    <button
                      type="button"
                      onClick={handleLoadMockData}
                      className="mt-6 border border-orange-500/70 px-4 py-2 text-sm font-bold uppercase tracking-[0.12em] text-orange-400 transition hover:bg-orange-500 hover:text-black"
                    >
                      Try Mock Data
                    </button>
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>

        <AppFooter />
      </div>
    </main>
  );
};

export default Page;