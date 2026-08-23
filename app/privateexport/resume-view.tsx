"use client";

import Link from "next/link";
import { useEffect } from "react";

import ResumePrintDocument from "@/components/resume-print-document";
import { useStoredResumeExport } from "@/components/use-stored-resume-export";

const ExportResumeView = () => {
  const exportState = useStoredResumeExport();
  const resumeName =
    exportState.status === "ready"
      ? exportState.resumeData.basicInfo.name.trim() || "resume"
      : "";

  useEffect(() => {
    if (!resumeName) {
      return;
    }

    const randomNumber = Math.floor(100000 + Math.random() * 900000);
    document.title = `${resumeName}-${randomNumber}`;
  }, [resumeName]);

  const handlePrint = () => {
    const randomNumber = Math.floor(100000 + Math.random() * 900000);
    document.title = `${resumeName}-${randomNumber}`;
    window.print();
  };

  if (exportState.status === "loading") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white px-5 text-black">
        <p className="text-sm text-zinc-500">{exportState.message}</p>
      </main>
    );
  }

  if (exportState.status === "error") {
    return (
      <main className="min-h-screen bg-white px-5 py-6 text-black sm:px-8 lg:px-12">
        <div className="mx-auto flex min-h-[70vh] max-w-2xl items-center justify-center text-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
              Resume Forge
            </p>
            <h1 className="mt-4 text-2xl font-semibold tracking-tight">
              Export unavailable
            </h1>
            <p className="mt-3 text-sm leading-6 text-zinc-500">
              {exportState.message}
            </p>
            <Link
              href="/privatedashboard"
              className="mt-6 inline-block bg-black px-5 py-3 text-sm font-medium text-white transition hover:bg-zinc-700"
            >
              Back to builder
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <>
      <main className="private-export min-h-screen bg-white text-black">
        <header className="print:hidden mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-4 border-b border-black px-5 py-6 sm:px-8 lg:px-12">
          <div className="ml-auto flex items-center gap-4">
            <Link
              href="/privatedashboard"
              className="text-sm text-zinc-500 underline decoration-zinc-300 underline-offset-4 transition hover:text-black"
            >
              Back
            </Link>
            <button
              type="button"
              onClick={handlePrint}
              className="bg-black px-3 py-2 text-sm font-medium text-white transition hover:bg-zinc-700 sm:px-4"
            >
              Export PDF
            </button>
          </div>
        </header>

        <section className="mx-auto max-w-[1440px] px-5 py-8 print:px-0 print:py-0 sm:px-8 lg:px-12">

          <div className="flex justify-center">
            <div className="w-fit bg-white text-black shadow-sm print:shadow-none">
              <ResumePrintDocument
                data={exportState.resumeData}
                templateId={exportState.templateId}
              />
            </div>
          </div>
        </section>
      </main>
    </>
  );
};

export default ExportResumeView;

