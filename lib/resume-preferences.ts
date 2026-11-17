import {
  normalizeResumeFontSizes,
  type ResumeFontSizes,
} from "@/lib/resume-typography";
import {
  normalizeResumeSpacing,
  type ResumeSpacing,
} from "@/lib/resume-spacing";

export const RESUME_PREFERENCES_KEY = "resume-forge-layout-preferences";

export type ResumePreferences = {
  fontSizes: ResumeFontSizes;
  spacing: ResumeSpacing;
};

export function parseResumePreferences(
  snapshot: string | null,
): ResumePreferences {
  let value: unknown;
  try {
    value = snapshot ? JSON.parse(snapshot) : null;
  } catch {
    value = null;
  }
  return normalizeResumePreferences(value);
}

export function normalizeResumePreferences(value: unknown): ResumePreferences {
  const source =
    value && typeof value === "object" && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : {};
  return {
    fontSizes: normalizeResumeFontSizes(source.fontSizes),
    spacing: normalizeResumeSpacing(source.spacing),
  };
}
