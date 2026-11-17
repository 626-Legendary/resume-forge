"use client";
import { useState } from "react";
import {
  defaultResumeJson,
  mockResumeJson,
  parseResumeJson,
  stringifyResumeJson,
} from "@/lib/resume";
import {
  DEFAULT_RESUME_TEMPLATE_ID,
  type ResumeTemplateId,
} from "@/lib/resume-template";
import type { ResumeData } from "@/types/resume";
import {
  DEFAULT_RESUME_FONT_SIZES,
  type ResumeFontSizes,
} from "@/lib/resume-typography";
import {
  DEFAULT_RESUME_SPACING,
  type ResumeSpacing,
} from "@/lib/resume-spacing";
const initialInput = stringifyResumeJson(defaultResumeJson);
export function useBuilder() {
  const [input, setInput] = useState(initialInput);
  const [parsed, setParsed] = useState<{
    input: string;
    data: ResumeData;
  } | null>(null);
  const [error, setError] = useState("");
  const [templateId, setTemplateId] = useState<ResumeTemplateId>(
    DEFAULT_RESUME_TEMPLATE_ID,
  );
  const [fontSizes, setFontSizes] = useState<ResumeFontSizes>(
    DEFAULT_RESUME_FONT_SIZES,
  );
  const [spacing, setSpacing] = useState<ResumeSpacing>(DEFAULT_RESUME_SPACING);
  function resetFontSizes() {
    setFontSizes(DEFAULT_RESUME_FONT_SIZES);
  }
  function resetSpacing() {
    setSpacing(DEFAULT_RESUME_SPACING);
  }
  function parse(value = input) {
    try {
      setParsed({ input: value, data: parseResumeJson(value) });
      setError("");
    } catch (error) {
      setParsed(null);
      setError(error instanceof Error ? error.message : "Invalid resume JSON.");
    }
  }
  function loadExample() {
    const value = stringifyResumeJson(mockResumeJson);
    setInput(value);
    parse(value);
  }
  function reset() {
    resetFontSizes();
    resetSpacing();
    setInput(initialInput);
    setParsed(null);
    setError("");
  }
  return {
    input,
    setInput,
    data: parsed?.data ?? null,
    stale: !!parsed && parsed.input !== input,
    error,
    parse,
    loadExample,
    reset,
    templateId,
    setTemplateId,
    fontSizes,
    setFontSizes,
    resetFontSizes,
    spacing,
    setSpacing,
    resetSpacing,
  };
}
