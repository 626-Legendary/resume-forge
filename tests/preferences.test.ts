import { test } from "node:test";
import assert from "node:assert/strict";
import { parseResumePreferences } from "../lib/resume-preferences";
import { DEFAULT_RESUME_FONT_SIZES } from "../lib/resume-typography";
import { DEFAULT_RESUME_SPACING } from "../lib/resume-spacing";

test("missing or corrupt browser preferences recover defaults", () => {
  for (const snapshot of [null, "", "{broken", "null", "[]", "42", '"text"']) {
    assert.deepEqual(parseResumePreferences(snapshot), {
      fontSizes: DEFAULT_RESUME_FONT_SIZES,
      spacing: DEFAULT_RESUME_SPACING,
    });
  }
});

test("saved font and spacing values round trip without keeping unrelated data", () => {
  const preferences = {
    fontSizes: { name: 18, section: 13.5, body: 10.5 },
    spacing: { lineHeight: 1.6, paragraph: 6, section: 18 },
  };
  assert.deepEqual(
    parseResumePreferences(
      JSON.stringify({
        ...preferences,
        resumeData: "Do not save resume content here",
      }),
    ),
    preferences,
  );
});

test("invalid individual preferences fall back without discarding valid settings", () => {
  assert.deepEqual(
    parseResumePreferences(
      JSON.stringify({
        fontSizes: { name: 20, section: "16", body: 999 },
        spacing: { lineHeight: 1.8, paragraph: -1, section: 18 },
      }),
    ),
    {
      fontSizes: { name: 20, section: 12, body: 10 },
      spacing: { lineHeight: 1.8, paragraph: 3, section: 18 },
    },
  );
});
