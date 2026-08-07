"use client";

import Link from "next/link";
import Image from "next/image";
import { JetBrains_Mono, Orbitron } from "next/font/google";
import { useSyncExternalStore } from "react";
import { FaArrowLeft, FaFilePdf, FaPrint } from "react-icons/fa";

import logoText from "@/public/logo-text.png";
import ResumeTemplateRenderer from "@/components/resume-template-renderer";
import { parseStoredResumeExport, RESUME_STORAGE_KEY } from "@/lib/resume";
import type { ResumeTemplateId } from "@/lib/resume-template";
import type { ResumeData } from "@/types/resume";

type ExportState =
  | {
      status: "loading";
      message: string;
    }
  | {
      status: "error";
      message: string;
    }
  | {
      status: "ready";
      resumeData: ResumeData;
      templateId: ResumeTemplateId;
    };

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

const SERVER_RESUME_SNAPSHOT = "__resume_forge_server_snapshot__";

const exportThemeStyles = `
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

  .rf-brand-font {
    font-family: var(--font-orbitron), sans-serif;
    font-weight: 700;
    letter-spacing: 0.18em;
  }
`;

const ExportResumeView = () => {
  const storedResumeJson = useSyncExternalStore(
    subscribeToResumeStorage,
    getStoredResumeJson,
    getServerStoredResumeJson
  );
  const exportState = getExportState(storedResumeJson);

  const handlePrint = () => {
    window.print();
  };

  if (exportState.status === "loading") {
    return (
      <main className="min-h-screen bg-[#07090c] px-5 py-8 text-zinc-300">
        <div className="mx-auto flex min-h-[70vh] max-w-3xl items-center justify-center">
          <div className="text-center">
            <Image
              src={logoText}
              alt="Resume Forge"
              width={220}
              priority
              className="mx-auto h-auto w-[170px] sm:w-[220px]"
            />

            <p className="mt-4 text-sm text-zinc-500">
              {exportState.message}
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (exportState.status === "error") {
    return (
      <main className="min-h-screen bg-[#07090c] px-5 py-8 text-zinc-300">
        <div className="mx-auto flex min-h-[70vh] max-w-3xl items-center justify-center">
          <div className="w-full border border-zinc-800 bg-[#0b1016] p-6 text-center">
            <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center border border-red-500/40 bg-red-500/10 text-red-400">
              !
            </div>

            <Image
              src={logoText}
              alt="Resume Forge"
              width={220}
              priority
              className="mx-auto h-auto w-[170px] sm:w-[220px]"
            />

            <p className="mt-5 font-[var(--font-orbitron)] text-sm font-bold uppercase tracking-[0.22em] text-red-400 sm:text-base">
              Export Failed
            </p>

            <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-zinc-500">
              {exportState.message}
            </p>

            <Link
              href="/dashboard"
              className="mt-6 inline-flex items-center justify-center gap-2 border border-orange-500/70 px-4 py-2 font-[var(--font-orbitron)] text-xs font-bold uppercase tracking-[0.14em] text-orange-400 transition hover:bg-orange-500 hover:text-black"
            >
              <FaArrowLeft />
              Back to Dashboard
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <>
      <style jsx global>{exportThemeStyles}</style>
      <main
        className={`${orbitron.variable} ${jetbrainsMono.variable} rf-workspace min-h-screen bg-[var(--rf-bg)] font-[var(--font-mono)] text-[var(--rf-text)]`}
      >
      <header className="print:hidden relative z-10 border-b border-orange-500/25 bg-[#0b1016]/88 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1720px] items-center justify-between gap-4 px-4 py-4 sm:px-5 md:px-7">
          <div className="flex min-w-0 items-center gap-4 md:gap-5">
            <Image
              src={logoText}
              alt="Resume Forge"
              width={230}
              priority
              className="h-auto w-[170px] shrink-0 sm:w-[220px] md:w-[230px]"
            />

            <div className="hidden min-w-0 border-l border-zinc-700/80 pl-5 lg:block">
              <p className="rf-brand-font text-sm font-bold uppercase tracking-[0.28em] text-zinc-100">
                Export Preview
              </p>
              <p className="mt-1 text-xs font-medium text-[var(--rf-muted)]">
                Print this page or save it as a PDF.
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 border border-zinc-700 bg-[#0b1016] px-3 py-2 font-[var(--font-orbitron)] text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-300 transition hover:border-orange-400 hover:text-orange-400 sm:px-4 sm:text-xs"
            >
              <FaArrowLeft className="text-xs" />
              <span className="hidden sm:inline">Back</span>
            </Link>

            <button
              type="button"
              onClick={handlePrint}
              className="rf-brand-font inline-flex items-center justify-center gap-2 border border-orange-400 bg-[var(--rf-orange)] px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.14em] text-black transition hover:bg-orange-400 sm:px-4 sm:text-xs sm:tracking-[0.18em]"
            >
              <FaPrint className="text-xs" />
              <span className="hidden sm:inline">Export PDF</span>
              <span className="sm:hidden">PDF</span>
            </button>
          </div>
        </div>
      </header>

      <section className="print:hidden px-4 py-8 sm:px-5 md:px-7">
        <div className="mx-auto max-w-[1720px]">
          <div className="mb-4 flex flex-wrap items-center gap-2 text-sm text-zinc-500">
            <FaFilePdf className="text-orange-400" />
            <span>Use Ctrl + P on Windows or Command + P on Mac.</span>
          </div>

          <div className="mx-auto w-fit bg-white p-4 text-black shadow-[0_24px_80px_rgba(0,0,0,0.55)] sm:p-6">
            <div className="resume-print-area">
              <ResumeTemplateRenderer
                data={exportState.resumeData}
                templateId={exportState.templateId}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="hidden print:block">
        <div className="resume-print-area">
          <ResumeTemplateRenderer
            data={exportState.resumeData}
            templateId={exportState.templateId}
          />
        </div>
      </section>
      </main>
    </>
  );
};

export default ExportResumeView;

function subscribeToResumeStorage(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  return () => window.removeEventListener("storage", onStoreChange);
}

function getStoredResumeJson() {
  return window.localStorage.getItem(RESUME_STORAGE_KEY);
}

function getServerStoredResumeJson() {
  return SERVER_RESUME_SNAPSHOT;
}

function getExportState(storedResumeJson: string | null): ExportState {
  if (storedResumeJson === SERVER_RESUME_SNAPSHOT) {
    return {
      status: "loading",
      message: "Loading resume preview...",
    };
  }

  if (!storedResumeJson) {
    return {
      status: "error",
      message:
        "No resume data found. Please go back to the dashboard, parse your resume JSON, and export again.",
    };
  }

  try {
    const storedResumeExport = parseStoredResumeExport(storedResumeJson);

    return {
      status: "ready",
      resumeData: storedResumeExport.resumeData,
      templateId: storedResumeExport.templateId,
    };
  } catch {
    return {
      status: "error",
      message:
        "Resume data is invalid. Please return to the dashboard and export again.",
    };
  }
}
