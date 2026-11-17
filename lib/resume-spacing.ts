export type ResumeSpacing = {
  lineHeight: number;
  paragraph: number;
  section: number;
};

export const DEFAULT_RESUME_SPACING: Readonly<ResumeSpacing> = Object.freeze({
  lineHeight: 1.35,
  paragraph: 3,
  section: 10,
});

export const RESUME_SPACING_FIELDS = [
  {
    key: "lineHeight",
    label: "Line spacing",
    values: Array.from({ length: 21 }, (_, index) =>
      Number((1 + index * 0.05).toFixed(2)),
    ),
  },
  {
    key: "paragraph",
    label: "Paragraph gap (pt)",
    values: Array.from({ length: 13 }, (_, index) => index),
  },
  {
    key: "section",
    label: "Section gap (pt)",
    values: Array.from({ length: 25 }, (_, index) => index),
  },
] as const;

export function normalizeResumeSpacing(value: unknown): ResumeSpacing {
  const source =
    value && typeof value === "object" && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : {};
  const valid = (key: keyof ResumeSpacing) => {
    const candidate = source[key];
    const field = RESUME_SPACING_FIELDS.find((field) => field.key === key)!;
    return typeof candidate === "number" && field.values.includes(candidate)
      ? candidate
      : DEFAULT_RESUME_SPACING[key];
  };
  return {
    lineHeight: valid("lineHeight"),
    paragraph: valid("paragraph"),
    section: valid("section"),
  };
}
