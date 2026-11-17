"use client";
import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import { useBuilder } from "@/components/use-builder";
import { useResumePdf } from "@/components/use-resume-pdf";
import PdfPreview from "@/components/pdf-preview";
import { createExportFilename } from "@/lib/export-filename";
import {
  RESUME_TEMPLATE_OPTIONS,
  type ResumeTemplateId,
} from "@/lib/resume-template";
import { app_version } from "@/constants/metaData";
const MODE_KEY = "resume-forge-simple-mode";
function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener("resume-mode", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("resume-mode", callback);
  };
}
function getMode() {
  try {
    return localStorage.getItem(MODE_KEY) === "true";
  } catch {
    return false;
  }
}
export default function ResumeBuilder() {
  const builder = useBuilder();
  const savedSimple = useSyncExternalStore(subscribe, getMode, () => false);
  const [modeOverride, setModeOverride] = useState<boolean | null>(null);
  const simple = modeOverride ?? savedSimple;
  const [revision, setRevision] = useState(0);
  const {
    artifact,
    error: pdfError,
    loading,
  } = useResumePdf(builder.data, builder.templateId, revision);
  const [downloadError, setDownloadError] = useState("");
  function toggleMode() {
    setModeOverride(!simple);
    try {
      localStorage.setItem(MODE_KEY, String(!simple));
      window.dispatchEvent(new Event("resume-mode"));
    } catch {
      /* Session preference remains available. */
    }
  }
  function download() {
    if (!artifact || builder.stale) return;
    try {
      const anchor = document.createElement("a");
      anchor.href = artifact.url;
      anchor.download = createExportFilename(
        builder.company,
        artifact.data.basicInfo.name,
      );
      document.body.append(anchor);
      anchor.click();
      anchor.remove();
      setDownloadError("");
    } catch {
      setDownloadError("Download could not start. Please try again.");
    }
  }
  return (
    <main className="builder" data-mode={simple ? "simple" : "dark"}>
      <header className="builder-header">
        <Link href="/" className="builder-brand">
          Resume Forge <span>v{app_version}</span>
        </Link>
        <button type="button" aria-pressed={simple} onClick={toggleMode}>
          Simple mode {simple ? "on" : "off"}
        </button>
      </header>
      <div className="builder-intro">
        <p className="eyebrow">JSON to application-ready PDF</p>
        <h1>Build your next opportunity.</h1>
        <p>Edit your content. Review every page. Export your resume.</p>
      </div>
      <div className="builder-grid">
        <section
          className="builder-panel editor-panel"
          aria-labelledby="input-title"
        >
          <div className="panel-heading">
            <h2 id="input-title">JSON Input</h2>
            <button type="button" onClick={builder.reset}>
              Reset
            </button>
          </div>
          <label htmlFor="resume-json" className="muted">
            Paste resume JSON or start with an example.
          </label>
          <textarea
            id="resume-json"
            spellCheck={false}
            value={builder.input}
            onChange={(event) => builder.setInput(event.target.value)}
            aria-invalid={!!builder.error}
            aria-describedby="builder-status"
          />
          <p
            id="builder-status"
            role={builder.error ? "alert" : "status"}
            className={builder.error ? "error" : "muted"}
          >
            {builder.error ||
              (builder.stale
                ? "Unparsed changes. Parse JSON to update the preview and export."
                : builder.data
                  ? "JSON parsed. Review your resume before exporting."
                  : "Ready to parse JSON.")}
          </p>
          <div className="builder-actions">
            <button
              type="button"
              className="primary"
              onClick={() => builder.parse()}
            >
              Parse JSON
            </button>
            <button type="button" onClick={builder.loadExample}>
              Load example
            </button>
          </div>
          <div className="builder-fields">
            <div>
              <label htmlFor="resume-template">Template</label>
              <select
                id="resume-template"
                value={builder.templateId}
                onChange={(event) =>
                  builder.setTemplateId(event.target.value as ResumeTemplateId)
                }
              >
                {RESUME_TEMPLATE_OPTIONS.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="target-company">
                Company name <span className="muted">(optional)</span>
              </label>
              <input
                id="target-company"
                placeholder="e.g. Apple"
                value={builder.company}
                onChange={(event) => builder.setCompany(event.target.value)}
                maxLength={120}
                aria-describedby="company-help"
              />
            </div>
          </div>
          <p id="company-help" className="muted">
            Company name is used only for the PDF filename.
          </p>
          <details className="builder-help">
            <summary>JSON format and tips</summary>
            <p>
              Use basicInfo.name and optional summary, skills, experiences,
              projects, education and certifications. Empty sections are
              omitted.
            </p>
            <p>
              Generate content using the schema below, then paste it into JSON
              Input.
            </p>
            <pre className="schema-example">
              {JSON.stringify(
                {
                  basicInfo: {
                    name: "Your Name",
                    contact: { tel: "", email: "", location: "" },
                  },
                  summary: "",
                  skills: { Languages: ["TypeScript"] },
                  experiences: [
                    { company: "", title: "", date: "", description: [] },
                  ],
                  projects: [],
                  education: [],
                  certifications: [],
                },
                null,
                2,
              )}
            </pre>
          </details>
        </section>
        <section
          className="builder-panel preview-panel"
          aria-labelledby="preview-title"
        >
          <div className="panel-heading">
            <div>
              <h2 id="preview-title">Live Preview</h2>
              <p className="muted">US Letter · Actual PDF layout</p>
            </div>
            <button
              type="button"
              className="primary"
              disabled={!artifact || builder.stale || !!pdfError}
              onClick={download}
            >
              Export PDF
            </button>
          </div>
          {builder.stale && (
            <p className="preview-notice" role="status">
              Showing the last parsed version.
            </p>
          )}
          {downloadError && (
            <p className="error" role="alert">
              {downloadError}
            </p>
          )}
          <div className="preview-surface" aria-busy={loading}>
            {loading && (
              <p className="preview-empty" role="status">
                Generating your PDF…
              </p>
            )}
            {pdfError && (
              <div className="preview-empty" role="alert">
                <p>{pdfError}</p>
                <button
                  type="button"
                  onClick={() => setRevision((value) => value + 1)}
                >
                  Retry PDF
                </button>
              </div>
            )}
            {artifact && !pdfError && (
              <PdfPreview
                blob={artifact.blob}
                data={artifact.data}
                templateId={artifact.templateId}
              />
            )}
            {!builder.data && (
              <div className="preview-empty">
                <p>Your resume will appear here.</p>
                <p className="muted">
                  Parse JSON or load an example to see every page.
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
      <footer className="builder-footer">
        Your resume is generated in this browser.{" "}
        <span>Resume Forge · v{app_version}</span>
      </footer>
    </main>
  );
}
