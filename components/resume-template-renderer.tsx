"use client";

import { useEffect, useRef, useState, type ComponentType } from "react";

import TemplateEngineer from "@/components/templateEngineer";
import TemplateEngineerIntern from "@/components/templateEngineerIntern";
import type { ResumeTemplateId } from "@/lib/resume-template";
import type { ResumeData } from "@/types/resume";

type ResumeTemplateRendererProps = {
  data: ResumeData;
  templateId: ResumeTemplateId;
};

const PAGE_HEIGHTS = {
  letter: 11 * 96,
  a4: (297 / 25.4) * 96,
};

const PAGE_CROP_OFFSET = {
  letter: 20,
  a4: 64,
};

const PAPER_LINE_TOP = {
  letter: PAGE_HEIGHTS.letter + PAGE_CROP_OFFSET.letter,
  a4: PAGE_HEIGHTS.a4 + PAGE_CROP_OFFSET.a4,
};

const templates: Record<
  ResumeTemplateId,
  ComponentType<{ data: ResumeData }>
> = {
  engineer: TemplateEngineer,
  "engineer-intern": TemplateEngineerIntern,
};

const ResumeTemplateRenderer = ({
  data,
  templateId,
}: ResumeTemplateRendererProps) => {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [cutoffState, setCutoffState] = useState({
    letter: false,
    a4: false,
  });

  useEffect(() => {
    const page = wrapperRef.current?.querySelector(".page");
    if (!page) return;

    const updateCutoffState = () => {
      const contentHeight = page.scrollHeight || page.clientHeight || 0;

      setCutoffState({
        letter: contentHeight > PAGE_HEIGHTS.letter + PAGE_CROP_OFFSET.letter,
        a4: contentHeight > PAGE_HEIGHTS.a4 + PAGE_CROP_OFFSET.a4,
      });
    };

    updateCutoffState();

    if (typeof ResizeObserver === "undefined") {
      return;
    }

    const observer = new ResizeObserver(updateCutoffState);
    observer.observe(page);

    return () => observer.disconnect();
  }, [data, templateId]);

  const Template = templates[templateId];

  return (
    <div ref={wrapperRef} className="relative">
      {cutoffState.a4 && (
        <div className="pointer-events-none absolute inset-0 z-10 print:hidden">
          <div
            className="absolute left-0 text-[10px] font-medium tracking-[0.18em] text-zinc-500"
            style={{ top: `${PAPER_LINE_TOP.a4 - 8}px` }}
          >
            ✂
          </div>
          <div
            className="absolute inset-x-0 border-t border-dashed border-zinc-400/80"
            style={{ top: `${PAPER_LINE_TOP.a4}px` }}
          />
          <div
            className="absolute right-0 text-right text-[10px] font-medium tracking-[0.18em] text-zinc-500"
            style={{ top: `${PAPER_LINE_TOP.a4 - 8}px` }}
          >
            A4
          </div>
        </div>
      )}

      {cutoffState.letter && (
        <div className="pointer-events-none absolute inset-0 z-10 print:hidden">
          <div
            className="absolute left-0 text-[10px] font-medium tracking-[0.18em] text-zinc-500"
            style={{ top: `${PAPER_LINE_TOP.letter - 8}px` }}
          >
            ✂
          </div>
          <div
            className="absolute inset-x-0 border-t border-dashed border-zinc-400/80"
            style={{ top: `${PAPER_LINE_TOP.letter}px` }}
          />
          <div
            className="absolute right-0 text-right text-[10px] font-medium tracking-[0.18em] text-zinc-500"
            style={{ top: `${PAPER_LINE_TOP.letter - 8}px` }}
          >
            US LETTER
          </div>
        </div>
      )}

      <Template data={data} />
    </div>
  );
};

export default ResumeTemplateRenderer;
