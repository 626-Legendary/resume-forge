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

const PAPER_ASPECT_RATIOS = {
  letter: 11 / 8.5,
  a4: 297 / 210,
};

const DEFAULT_PAGE_WIDTH = 8.5 * 96;
const DEFAULT_PAGE_HEIGHTS = {
  letter: DEFAULT_PAGE_WIDTH * PAPER_ASPECT_RATIOS.letter,
  a4: DEFAULT_PAGE_WIDTH * PAPER_ASPECT_RATIOS.a4,
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
  const [paperHeights, setPaperHeights] = useState(DEFAULT_PAGE_HEIGHTS);

  useEffect(() => {
    const page = wrapperRef.current?.querySelector(".page");
    if (!page) return;

    const updateCutoffState = () => {
      const contentHeight = page.scrollHeight || page.clientHeight || 0;
      const pageWidth = page.getBoundingClientRect().width || DEFAULT_PAGE_WIDTH;
      const letterHeight = pageWidth * PAPER_ASPECT_RATIOS.letter;
      const a4Height = pageWidth * PAPER_ASPECT_RATIOS.a4;

      setCutoffState({
        letter: contentHeight > letterHeight,
        a4: contentHeight > a4Height,
      });
      setPaperHeights({ letter: letterHeight, a4: a4Height });
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
            style={{ top: `${paperHeights.a4 - 8}px` }}
          >
            ✂
          </div>
          <div
            className="absolute inset-x-0 border-t border-dashed border-zinc-400/80"
            style={{ top: `${paperHeights.a4}px` }}
          />
          <div
            className="absolute right-0 text-right text-[10px] font-medium tracking-[0.18em] text-zinc-500"
            style={{ top: `${paperHeights.a4 - 8}px` }}
          >
            A4
          </div>
        </div>
      )}

      {cutoffState.letter && (
        <div className="pointer-events-none absolute inset-0 z-10 print:hidden">
          <div
            className="absolute left-0 text-[10px] font-medium tracking-[0.18em] text-zinc-500"
            style={{ top: `${paperHeights.letter - 8}px` }}
          >
            ✂
          </div>
          <div
            className="absolute inset-x-0 border-t border-dashed border-zinc-400/80"
            style={{ top: `${paperHeights.letter}px` }}
          />
          <div
            className="absolute right-0 text-right text-[10px] font-medium tracking-[0.18em] text-zinc-500"
            style={{ top: `${paperHeights.letter - 8}px` }}
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
