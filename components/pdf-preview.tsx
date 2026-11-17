"use client";

import { useEffect, useRef, useState } from "react";
import type { PDFDocumentProxy, RenderTask } from "pdfjs-dist";
import { buildResumeLines } from "@/lib/resume-content";
import type { ResumeData } from "@/types/resume";
import type { ResumeTemplateId } from "@/lib/resume-template";

function PdfSheet({
  document,
  number,
}: {
  document: PDFDocumentProxy;
  number: number;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let cancelled = false;
    let task: RenderTask | undefined;
    void document
      .getPage(number)
      .then(async (page) => {
        if (cancelled || !ref.current) return;
        const canvas = ref.current;
        const viewport = page.getViewport({ scale: 1.5 });
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        task = page.render({ canvas, viewport });
        await task.promise;
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
      task?.cancel();
    };
  }, [document, number]);
  return (
    <figure className="pdf-sheet">
      <figcaption>
        Page {number} of {document.numPages}
      </figcaption>
      {failed ? (
        <p role="alert">
          Page preview unavailable. Download the PDF to view it.
        </p>
      ) : (
        <canvas
          ref={ref}
          role="img"
          aria-label={`Resume page ${number} of ${document.numPages}`}
        />
      )}
    </figure>
  );
}

export default function PdfPreview({
  blob,
  data,
  templateId,
}: {
  blob: Blob;
  data: ResumeData;
  templateId: ResumeTemplateId;
}) {
  const [result, setResult] = useState<{
    blob: Blob;
    document?: PDFDocumentProxy;
    error?: string;
  } | null>(null);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let cancelled = false;
    let task: ReturnType<typeof import("pdfjs-dist").getDocument> | undefined;
    void (async () => {
      const pdfjs = await import("pdfjs-dist");
      pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
      const bytes = new Uint8Array(await blob.arrayBuffer());
      if (cancelled) return;
      task = pdfjs.getDocument({ data: bytes });
      const document = await task.promise;
      if (!cancelled) setResult({ blob, document });
    })().catch(() => {
      if (!cancelled)
        setResult({
          blob,
          error: "Preview unavailable. You can still download the PDF.",
        });
    });
    return () => {
      cancelled = true;
      void task?.destroy();
    };
  }, [blob, attempt]);
  const current = result?.blob === blob ? result : null;
  return (
    <div className="pdf-preview">
      <p className="page-count" role="status">
        {current?.document
          ? `${current.document.numPages} ${current.document.numPages === 1 ? "page" : "pages"} · US Letter · 8.5 × 11 in`
          : current?.error || "Loading pages…"}
      </p>
      {current?.error && (
        <button type="button" onClick={() => setAttempt((value) => value + 1)}>
          Retry preview
        </button>
      )}
      {current?.document &&
        Array.from({ length: current.document.numPages }, (_, index) => (
          <PdfSheet
            key={`${attempt}-${index}`}
            document={current.document!}
            number={index + 1}
          />
        ))}
      <details className="resume-text">
        <summary>Read resume text</summary>
        {buildResumeLines(data, templateId).map((line, index) => (
          <p key={index}>
            {line.label ? (
              <>
                <strong>{line.label}</strong>
                {line.text.slice(line.label.length)}
              </>
            ) : (
              line.text
            )}
          </p>
        ))}
      </details>
    </div>
  );
}
