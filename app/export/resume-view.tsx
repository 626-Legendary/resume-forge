"use client";

import Link from "next/link";
import Image from "next/image";
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

const SERVER_RESUME_SNAPSHOT = "__resume_forge_server_snapshot__";

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

            <p className="mt-5 font-[var(--font-orbitron)] text-sm font-bold uppercase tracking-[0.22em] text-red-400">
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
    <main className="min-h-screen bg-[#07090c] text-white">
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
              <p className="font-[var(--font-orbitron)] text-sm font-bold uppercase tracking-[0.28em] text-zinc-100">
                Export Preview
              </p>
              <p className="mt-1 text-xs font-medium text-zinc-500">
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
              className="inline-flex items-center justify-center gap-2 border border-orange-400 bg-orange-500 px-3 py-2 font-[var(--font-orbitron)] text-[11px] font-extrabold uppercase tracking-[0.14em] text-black transition hover:bg-orange-400 sm:px-4 sm:text-xs"
            >
              <FaPrint className="text-xs" />
              <span className="hidden sm:inline">Print / Save PDF</span>
              <span className="sm:hidden">Print</span>
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
