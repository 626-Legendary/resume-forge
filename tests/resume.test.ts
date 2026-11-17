import { test } from "node:test";
import assert from "node:assert/strict";
import { createExportFilename } from "../lib/export-filename";
import {
  parseResumeJson,
  parseStoredResumeExport,
  createStoredResumeExport,
  normalizeResumeData,
} from "../lib/resume";
import { buildResumeLines, safeResumeUrl } from "../lib/resume-content";

test("filename uses company, full name and a local English date", () => {
  assert.equal(
    createExportFilename("Apple", "Zexiang Zhang", new Date(2026, 10, 16)),
    "Apple_Zexiang_Zhang_Nov_16.pdf",
  );
  assert.equal(
    createExportFilename("", " Alex   Morgan ", new Date(2026, 0, 2)),
    "Resume_Alex_Morgan_Jan_02.pdf",
  );
  assert.equal(
    createExportFilename('A/B:*?<>|"\\', "../Zhang", new Date(2026, 11, 31)),
    "A_B_Zhang_Dec_31.pdf",
  );
  assert.ok(
    createExportFilename("x".repeat(400), "y".repeat(400)).length < 200,
  );
});

test("invalid JSON and non-resume shapes fail with useful messages", () => {
  for (const input of [
    "null",
    "[]",
    '"text"',
    "42",
    "{}",
    '{"basicInfo":{"name":" "}}',
  ]) {
    assert.throws(() => parseResumeJson(input), /basicInfo.name/);
  }
  assert.throws(() => parseResumeJson("{"), SyntaxError);
});

test("normalization trims content and removes empty sections", () => {
  const result = normalizeResumeData({
    basicInfo: {
      name: " Alex ",
      contact: {
        extra: { github: { label: "GitHub", href: "github.com/alex" } },
      },
    },
    skills: { empty: [], Languages: [" TS ", "", 123] },
    experiences: [{}],
    projects: [],
    education: [],
    certifications: [],
  });
  assert.equal(result.basicInfo.name, "Alex");
  assert.deepEqual(result.skills, { Languages: ["TS", "123"] });
  assert.equal(result.experiences, undefined);
  assert.deepEqual(result.basicInfo.contact?.extra?.github, {
    content: "GitHub",
    link: "github.com/alex",
  });
});

test("export storage supports old raw data and new metadata", () => {
  const data = normalizeResumeData({ basicInfo: { name: "Alex" } });
  assert.equal(
    parseStoredResumeExport(JSON.stringify(data)).templateId,
    "engineer",
  );
  const stored = createStoredResumeExport(data, "engineer-intern", "Apple");
  assert.deepEqual(parseStoredResumeExport(JSON.stringify(stored)), stored);
  assert.equal(
    parseStoredResumeExport(
      JSON.stringify({ resumeData: data, templateId: "unknown" }),
    ).templateId,
    "engineer",
  );
});

test("both templates retain content but prioritize different sections", () => {
  const data = normalizeResumeData({
    basicInfo: { name: "Alex" },
    experiences: [
      { company: "Acme", title: "Engineer", description: ["Built APIs"] },
    ],
    education: [{ school: "University", degree: "BS", startDate: "2020" }],
    projects: [{ name: "Tool", url: "github.com/alex/tool" }],
  });
  for (const template of ["engineer", "engineer-intern"] as const) {
    const lines = buildResumeLines(data, template);
    const sections = lines
      .filter((line) => line.kind === "section")
      .map((line) => line.text);
    assert.equal(
      sections[0],
      template === "engineer" ? "Experience" : "Education",
    );
    assert.ok(lines.some((line) => line.text === "Built APIs"));
    assert.ok(lines.some((line) => line.text.includes("2020 - Present")));
    assert.ok(
      lines.some((line) => line.link === "https://github.com/alex/tool"),
    );
  }
});

test("links reject executable schemes", () => {
  assert.equal(safeResumeUrl("javascript:alert(1)"), undefined);
  assert.equal(safeResumeUrl("data:text/html,test"), undefined);
  assert.equal(safeResumeUrl("github.com/alex"), "https://github.com/alex");
});
