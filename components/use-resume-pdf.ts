"use client";

import { useEffect, useMemo, useState } from "react";
import type { ResumeData } from "@/types/resume";
import type { ResumeTemplateId } from "@/lib/resume-template";
import {
  DEFAULT_RESUME_FONT_SIZES,
  type ResumeFontSizes,
} from "@/lib/resume-typography";

type PdfRequest = {
  data: ResumeData | null;
  templateId: ResumeTemplateId;
  revision: number;
  fontSizes: ResumeFontSizes;
};
type PdfArtifact = {
  request: PdfRequest;
  data: ResumeData;
  templateId: ResumeTemplateId;
  blob: Blob;
  url: string;
};
// The renderer has a shared font/layout runtime: serialize jobs across mounted views.
let renderQueue: Promise<unknown> = Promise.resolve();

export function useResumePdf(
  data: ResumeData | null,
  templateId: ResumeTemplateId,
  revision = 0,
  fontSizes: ResumeFontSizes = DEFAULT_RESUME_FONT_SIZES,
) {
  const [artifact, setArtifact] = useState<PdfArtifact | null>(null);
  const [failure, setFailure] = useState<{
    request: PdfRequest;
    message: string;
  } | null>(null);
  const request = useMemo(
    () => ({ data, templateId, revision, fontSizes }),
    [data, templateId, revision, fontSizes],
  );
  useEffect(() => {
    const { data, templateId, fontSizes } = request;
    if (!data) return;
    let cancelled = false;
    let url: string | undefined;
    const job = renderQueue
      .catch(() => {})
      .then(async () => {
        if (cancelled) return;
        const [{ pdf }, { default: ResumePdfDocument }] = await Promise.all([
          import("@react-pdf/renderer"),
          import("@/components/resume-pdf-document"),
        ]);
        const blob = await pdf(
          ResumePdfDocument({ data, templateId, fontSizes }),
        ).toBlob();
        if (cancelled) return;
        url = URL.createObjectURL(blob);
        setArtifact({ request, data, templateId, blob, url });
      });
    renderQueue = job;
    void job.catch(() => {
      if (!cancelled)
        setFailure({
          request,
          message: "Unable to generate PDF. Please retry.",
        });
    });
    return () => {
      cancelled = true;
      if (url) URL.revokeObjectURL(url);
    };
  }, [request]);
  const current = artifact?.request === request ? artifact : null;
  const error = !current && failure?.request === request ? failure.message : "";
  return { artifact: current, error, loading: !!data && !current && !error };
}
