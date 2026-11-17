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
import {
  DEFAULT_RESUME_FONT_SIZES,
  normalizeResumeFontSizes,
} from "../lib/resume-typography";
import {
  DEFAULT_RESUME_SPACING,
  normalizeResumeSpacing,
} from "../lib/resume-spacing";

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
  const stored = createStoredResumeExport(data, "engineer-intern", {
    name: 18,
    section: 13,
    body: 10.5,
  });
  assert.deepEqual(parseStoredResumeExport(JSON.stringify(stored)), stored);
  assert.equal(
    parseStoredResumeExport(
      JSON.stringify({ resumeData: data, templateId: "unknown" }),
    ).templateId,
    "engineer",
  );
});

test("company-name is normalized after name, optional and excluded from content", () => {
  const data = parseResumeJson(
    JSON.stringify({
      basicInfo: { name: " Alex ", "company-name": " Apple " },
    }),
  );
  assert.equal(data.basicInfo["company-name"], "Apple");
  assert.deepEqual(Object.keys(data.basicInfo).slice(0, 2), [
    "name",
    "company-name",
  ]);
  assert.equal(
    normalizeResumeData({ basicInfo: { name: "Alex" } }).basicInfo[
      "company-name"
    ],
    "",
  );
  for (const template of ["engineer", "engineer-intern"] as const) {
    assert.ok(
      buildResumeLines(data, template).every(
        (line) => !line.text.includes("Apple"),
      ),
    );
  }
});

test("legacy company metadata migrates without overriding explicit JSON", () => {
  const legacy = {
    resumeData: { basicInfo: { name: "Alex" } },
    companyName: "Old Company",
    templateId: "engineer",
  };
  const result = parseStoredResumeExport(JSON.stringify(legacy));
  assert.equal(result.resumeData.basicInfo["company-name"], "Old Company");
  assert.deepEqual(result.fontSizes, DEFAULT_RESUME_FONT_SIZES);
  for (const company of ["New Company", ""]) {
    const result = parseStoredResumeExport(
      JSON.stringify({
        ...legacy,
        resumeData: { basicInfo: { name: "Alex", "company-name": company } },
      }),
    );
    assert.equal(result.resumeData.basicInfo["company-name"], company);
  }
});

test("font settings default independently and reject unsafe or invalid values", () => {
  assert.deepEqual(normalizeResumeFontSizes(undefined), {
    name: 14,
    section: 12,
    body: 10,
  });
  assert.deepEqual(
    normalizeResumeFontSizes({ name: 20, section: "16", body: 10.5 }),
    { name: 20, section: 12, body: 10.5 },
  );
  for (const invalid of [NaN, Infinity, -1, 0, 5.5, 32.5, 10.2, null]) {
    assert.equal(normalizeResumeFontSizes({ body: invalid }).body, 10);
  }
  assert.deepEqual(
    normalizeResumeFontSizes({ name: 6, section: 32, body: 8.5 }),
    { name: 6, section: 32, body: 8.5 },
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

test("Experience uses company/location then title/date without empty separators or headers", () => {
  const data = normalizeResumeData({
    basicInfo: { name: "Alex" },
    experiences: [
      {
        company: "Acme",
        location: "Seattle",
        title: "Engineer",
        date: "2024 - Present",
      },
      { company: "Remote Co", title: "Developer" },
      { date: "2020" },
      { description: ["Achievement only"] },
    ],
  });
  for (const template of ["engineer", "engineer-intern"] as const) {
    const lines = buildResumeLines(data, template);
    const headers = lines.filter((line) => line.experience);
    assert.deepEqual(
      headers.map((line) => line.text),
      [
        "Acme - Seattle\nEngineer | 2024 - Present",
        "Remote Co\nDeveloper",
        "2020",
      ],
    );
    assert.ok(lines.some((line) => line.text === "Achievement only"));
  }
});

test("skill category labels remain separate from regular-weight values", () => {
  const data = normalizeResumeData({
    basicInfo: { name: "Alex" },
    skills: { Languages: ["TypeScript", "Python"], Frontend: ["React"] },
  });
  for (const template of ["engineer", "engineer-intern"] as const) {
    const lines = buildResumeLines(data, template).filter((line) => line.label);
    assert.deepEqual(
      lines.map((line) => ({ text: line.text, label: line.label })),
      [
        { text: "Languages: TypeScript, Python", label: "Languages:" },
        { text: "Frontend: React", label: "Frontend:" },
      ],
    );
  }
});

test("spacing settings validate independently and survive stored-export round trips", () => {
  assert.deepEqual(normalizeResumeSpacing(undefined), {
    lineHeight: 1.35,
    paragraph: 3,
    section: 10,
  });
  for (const invalid of [NaN, Infinity, -1, "2", null, [], {}]) {
    assert.deepEqual(
      normalizeResumeSpacing({
        lineHeight: invalid,
        paragraph: invalid,
        section: invalid,
      }),
      DEFAULT_RESUME_SPACING,
    );
  }
  assert.deepEqual(
    normalizeResumeSpacing({ lineHeight: 1.8, paragraph: 2.5, section: 50 }),
    { lineHeight: 1.8, paragraph: 3, section: 10 },
  );
  const data = normalizeResumeData({ basicInfo: { name: "Alex" } });
  const spacing = { lineHeight: 1.6, paragraph: 6, section: 18 };
  const stored = createStoredResumeExport(data, "engineer", undefined, spacing);
  assert.deepEqual(parseStoredResumeExport(JSON.stringify(stored)), stored);
  assert.deepEqual(
    parseStoredResumeExport(JSON.stringify(data)).spacing,
    DEFAULT_RESUME_SPACING,
  );
});

test("contact profiles share one row with independent safe links and no empty separators", () => {
  const data = normalizeResumeData({
    basicInfo: {
      name: "Alex",
      contact: {
        tel: "555-1234",
        email: "alex@example.com",
        location: "Seattle",
        extra: {
          linkedIn: { content: "LinkedIn", link: "linkedin.com/in/alex" },
          github: { content: "GitHub", link: "https://github.com/alex" },
          website: { content: "Website", link: "javascript:alert(1)" },
          portfolio: "Portfolio",
          empty: { content: "" },
          status: "Open to relocation",
        },
      },
    },
  });
  for (const template of ["engineer", "engineer-intern"] as const) {
    const contacts = buildResumeLines(data, template).filter(
      (line) => line.kind === "contact",
    );
    assert.deepEqual(
      contacts.map((line) => line.text),
      [
        "555-1234 | alex@example.com | Seattle",
        "LinkedIn | GitHub | Website | Portfolio",
        "Open to relocation",
      ],
    );
    assert.deepEqual(contacts[1].parts, [
      { text: "LinkedIn", link: "https://linkedin.com/in/alex" },
      { text: "GitHub", link: "https://github.com/alex" },
      { text: "Website" },
      { text: "Portfolio" },
    ]);
  }
  assert.deepEqual(
    buildResumeLines(
      normalizeResumeData({ basicInfo: { name: "Alex" } }),
      "engineer",
    ).map((line) => line.kind),
    ["name"],
  );
  const single = buildResumeLines(
    normalizeResumeData({
      basicInfo: { name: "Alex", contact: { extra: { github: "GitHub" } } },
    }),
    "engineer",
  );
  assert.equal(single[1].text, "GitHub");
});
