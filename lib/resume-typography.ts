export type ResumeFontSizes = {
  name: number;
  section: number;
  body: number;
};

export const DEFAULT_RESUME_FONT_SIZES: Readonly<ResumeFontSizes> =
  Object.freeze({
    name: 14,
    section: 12,
    body: 10,
  });

export const RESUME_FONT_FIELDS = [
  { key: "name", label: "Name (pt)" },
  { key: "section", label: "Section titles (pt)" },
  { key: "body", label: "Body text (pt)" },
] as const;

export const RESUME_FONT_SIZE_OPTIONS = Array.from(
  { length: 53 },
  (_, index) => 6 + index / 2,
);

export function normalizeResumeFontSizes(value: unknown): ResumeFontSizes {
  const source =
    value && typeof value === "object"
      ? (value as Record<string, unknown>)
      : {};
  const valid = (key: keyof ResumeFontSizes) => {
    const size = source[key];
    return typeof size === "number" &&
      Number.isFinite(size) &&
      size >= 6 &&
      size <= 32 &&
      Number.isInteger(size * 2)
      ? size
      : DEFAULT_RESUME_FONT_SIZES[key];
  };
  return {
    name: valid("name"),
    section: valid("section"),
    body: valid("body"),
  };
}
