"use client";
import Link from "next/link";
import Image from "next/image";
import { FaGithub } from "react-icons/fa";
import logo from "@/public/logo.png";
import ResumeJsonHelp from "@/components/resume-json-help";
import { creatorName, githubRepositoryUrl } from "@/lib/site";
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
import {
  RESUME_FONT_FIELDS,
  RESUME_FONT_SIZE_OPTIONS,
} from "@/lib/resume-typography";
import { RESUME_SPACING_FIELDS } from "@/lib/resume-spacing";
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
  const savedLight = useSyncExternalStore(subscribe, getMode, () => false);
  const [modeOverride, setModeOverride] = useState<boolean | null>(null);
  const light = modeOverride ?? savedLight;
  const [revision, setRevision] = useState(0);
  const {
    artifact,
    error: pdfError,
    loading,
  } = useResumePdf(
    builder.data,
    builder.templateId,
    revision,
    builder.fontSizes,
    builder.spacing,
  );
  const [downloadError, setDownloadError] = useState("");
  function toggleMode() {
    setModeOverride(!light);
    try {
      localStorage.setItem(MODE_KEY, String(!light));
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
        artifact.data.basicInfo["company-name"] || "",
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
    <main className="builder" data-mode={light ? "simple" : "dark"}>
      <header className="builder-header">
        <Link href="/" className="builder-brand" aria-label="Resume Forge home">
          <span className="builder-brand-mark">
            <Image src={logo} alt="" width={40} height={40} priority />
          </span>
          <span className="builder-brand-copy">
            <span className="builder-brand-title">Resume Forge</span>
            <span className="builder-brand-meta">
              JSON to PDF <span aria-hidden="true">·</span> v{app_version}
            </span>
          </span>
        </Link>
        <button type="button" aria-pressed={light} onClick={toggleMode}>
          Light mode {light ? "on" : "off"}
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
            <fieldset className="font-size-controls">
              <legend>Font sizes</legend>
              <button
                type="button"
                className="settings-reset"
                onClick={builder.resetFontSizes}
              >
                Restore font defaults
              </button>
              <div className="font-size-grid">
                {RESUME_FONT_FIELDS.map(({ key, label }) => (
                  <div key={key}>
                    <label htmlFor={`font-size-${key}`}>{label}</label>
                    <select
                      id={`font-size-${key}`}
                      value={builder.fontSizes[key]}
                      onChange={(event) =>
                        builder.setFontSizes((current) => ({
                          ...current,
                          [key]: Number(event.target.value),
                        }))
                      }
                    >
                      {RESUME_FONT_SIZE_OPTIONS.map((size) => (
                        <option key={size} value={size}>
                          {size}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
              <p className="muted">
                Sizes are in points. Changes update the PDF and pagination
                automatically.
              </p>
            </fieldset>
            <hr className="settings-divider" />
            <fieldset className="font-size-controls">
              <legend>Spacing</legend>
              <button
                type="button"
                className="settings-reset"
                onClick={builder.resetSpacing}
              >
                Restore spacing defaults
              </button>
              <div className="font-size-grid">
                {RESUME_SPACING_FIELDS.map(({ key, label, values }) => (
                  <div key={key}>
                    <label htmlFor={`spacing-${key}`}>{label}</label>
                    <select
                      id={`spacing-${key}`}
                      value={builder.spacing[key]}
                      onChange={(event) =>
                        builder.setSpacing((current) => ({
                          ...current,
                          [key]: Number(event.target.value),
                        }))
                      }
                    >
                      {values.map((value) => (
                        <option key={value} value={value}>
                          {value}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
              <p className="muted">
                Spacing updates the preview, page count and exported PDF
                automatically.
              </p>
            </fieldset>
          </div>
          <ResumeJsonHelp />
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
        <div className="builder-footer-author">
          <p className="eyebrow">An independent personal project</p>
          <p>
            Built by <strong>{creatorName}</strong>.
          </p>
          <p className="muted">
            Created to make resume iteration easier. Your PDF is generated in
            this browser.
          </p>
        </div>
        <div className="builder-footer-links">
          <a
            href={githubRepositoryUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaGithub aria-hidden="true" />
            View source on GitHub
          </a>
          <span>Resume Forge · v{app_version}</span>
        </div>
      </footer>
    </main>
  );
}
