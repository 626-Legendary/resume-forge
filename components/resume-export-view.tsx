"use client";
import Link from "next/link";
import { useState } from "react";
import { useStoredResumeExport } from "@/components/use-stored-resume-export";
import { useResumePdf } from "@/components/use-resume-pdf";
import PdfPreview from "@/components/pdf-preview";
import { DEFAULT_RESUME_TEMPLATE_ID } from "@/lib/resume-template";
import { createExportFilename } from "@/lib/export-filename";

export default function ResumeExportView() {
  const state = useStoredResumeExport();
  const [revision, setRevision] = useState(0);
  const { artifact, error, loading } = useResumePdf(
    state.status === "ready" ? state.resumeData : null,
    state.status === "ready" ? state.templateId : DEFAULT_RESUME_TEMPLATE_ID,
    revision,
    state.status === "ready" ? state.fontSizes : undefined,
  );
  return (
    <main className="builder" data-mode="dark">
      <header className="builder-header">
        <h1>Export preview</h1>
        <Link href="/dashboard">Back to builder</Link>
      </header>
      <section className="builder-intro">
        {state.status !== "ready" ? (
          <p role={state.status === "error" ? "alert" : "status"}>
            {state.message}
          </p>
        ) : (
          <>
            <p className="muted">
              Resume data for this compatibility view is read from this
              browser’s local storage.
            </p>
            {artifact && (
              <a
                className="inline-block my-4 underline"
                href={artifact.url}
                download={createExportFilename(
                  state.resumeData.basicInfo["company-name"] || "",
                  state.resumeData.basicInfo.name,
                )}
              >
                Download PDF
              </a>
            )}
            {loading && <p role="status">Generating your PDF…</p>}
            {error && (
              <div role="alert">
                <p>{error}</p>
                <button
                  type="button"
                  onClick={() => setRevision((value) => value + 1)}
                >
                  Retry PDF
                </button>
              </div>
            )}
            {artifact && (
              <PdfPreview
                blob={artifact.blob}
                data={artifact.data}
                templateId={artifact.templateId}
              />
            )}
          </>
        )}
      </section>
    </main>
  );
}
