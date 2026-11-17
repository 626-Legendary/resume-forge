import { test } from "node:test";
import assert from "node:assert/strict";
import { renderToBuffer } from "@react-pdf/renderer";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";
import ResumePdfDocument from "../components/resume-pdf-document";
import { normalizeResumeData, mockResumeJson } from "../lib/resume";
import type { ResumeFontSizes } from "../lib/resume-typography";

async function readPdf(
  data: Parameters<typeof ResumePdfDocument>[0]["data"],
  templateId: "engineer" | "engineer-intern" = "engineer",
  fontSizes?: ResumeFontSizes,
) {
  const bytes = await renderToBuffer(
    ResumePdfDocument({ data, templateId, fontSizes }),
  );
  return getDocument({ data: new Uint8Array(bytes), useSystemFonts: true })
    .promise;
}

test("minimal resume is one Letter page with extractable text", async () => {
  const document = await readPdf(
    normalizeResumeData({
      basicInfo: { name: "Zexiang Zhang" },
      summary: "Building useful software.",
    }),
  );
  try {
    assert.equal(document.numPages, 1);
    const page = await document.getPage(1);
    assert.deepEqual(page.view, [0, 0, 612, 792]);
    const content = await page.getTextContent();
    const text = content.items
      .map((item) => ("str" in item ? item.str : ""))
      .join(" ");
    assert.match(text, /Zexiang Zhang/);
    assert.match(text, /Building useful software/);
    assert.doesNotMatch(text, /Education|Skills|Experience/);
  } finally {
    await document.loadingTask.destroy();
  }
});

test("PDF contains independent default/custom font sizes and never prints target company", async () => {
  const data = normalizeResumeData({
    basicInfo: {
      name: "Font Test Name",
      "company-name": "HiddenTargetCompany",
      contact: {
        email: "font@example.com",
        extra: {
          website: { content: "My Portfolio", link: "https://example.com" },
        },
      },
    },
    summary: "Body sample",
    experiences: [
      {
        company: "Employer",
        title: "Engineer",
        description: ["Bullet sample"],
      },
    ],
  });
  for (const template of ["engineer", "engineer-intern"] as const) {
    for (const sizes of [undefined, { name: 22, section: 16, body: 12.5 }]) {
      const document = await readPdf(data, template, sizes);
      try {
        const content = await (await document.getPage(1)).getTextContent();
        const items = content.items.filter((item) => "str" in item);
        const expected = sizes ?? { name: 14, section: 12, body: 10 };
        for (const [text, size] of [
          ["Font Test Name", expected.name],
          ["Summary", expected.section],
          ["Experience", expected.section],
          ["Body sample", expected.body],
          ["font@example.com", expected.body],
          ["My Portfolio", expected.body],
          ["Employer", expected.body],
          ["Bullet sample", expected.body],
        ] as const) {
          const item = items.find((item) => item.str.includes(text));
          assert.ok(item, `Missing ${text}`);
          assert.ok(
            Math.abs(item.height - size) < 0.01,
            `${text}: expected ${size}pt, got ${item.height}`,
          );
        }
        assert.ok(
          items.every((item) => !item.str.includes("HiddenTargetCompany")),
        );
      } finally {
        await document.loadingTask.destroy();
      }
    }
  }
});

test("changing body font repaginates while preserving every record", async () => {
  const data = normalizeResumeData({
    basicInfo: { name: "Pagination Test" },
    experiences: [
      {
        company: "Employer",
        title: "Engineer",
        description: Array.from(
          { length: 60 },
          (_, index) =>
            `Marker${index}: Delivered reliable application services and improved deployment quality across engineering teams.`,
        ),
      },
    ],
  });
  const pageCounts: number[] = [];
  for (const body of [8, 16]) {
    const document = await readPdf(data, "engineer", {
      name: 14,
      section: 12,
      body,
    });
    try {
      pageCounts.push(document.numPages);
      let text = "";
      for (let number = 1; number <= document.numPages; number++) {
        const page = await document.getPage(number);
        assert.deepEqual(page.view, [0, 0, 612, 792]);
        const content = await page.getTextContent();
        text += content.items
          .map((item) => ("str" in item ? item.str : ""))
          .join(" ");
      }
      assert.equal((text.match(/Marker\d+:/g) || []).length, 60);
      for (let index = 0; index < 60; index++)
        assert.ok(text.includes(`Marker${index}:`));
    } finally {
      await document.loadingTask.destroy();
    }
  }
  assert.ok(pageCounts[1] > pageCounts[0]);
});

test("long content paginates without loss, cropping or reordered bullets", async () => {
  const descriptions = Array.from(
    { length: 120 },
    (_, index) =>
      `Record ${String(index).padStart(3, "0")}: Designed reliable application services and improved deployment quality for engineering teams.`,
  );
  const document = await readPdf(
    normalizeResumeData({
      basicInfo: { name: "Alex Morgan" },
      experiences: [
        { company: "Acme", title: "Engineer", description: descriptions },
      ],
    }),
  );
  try {
    assert.ok(document.numPages > 2);
    let text = "";
    for (let number = 1; number <= document.numPages; number++) {
      const page = await document.getPage(number);
      assert.deepEqual(page.view, [0, 0, 612, 792]);
      const content = await page.getTextContent();
      for (const item of content.items)
        if ("str" in item) {
          text += `${item.str} `;
          if (item.str.trim()) {
            assert.ok(
              item.transform[5] >= 30 && item.transform[5] <= 762,
              `Text outside page margin: ${item.str}`,
            );
            assert.ok(
              item.transform[4] >= 35 && item.transform[4] + item.width <= 577,
              `Text outside horizontal margin: ${item.str}`,
            );
          }
        }
    }
    let previous = -1;
    for (let index = 0; index < descriptions.length; index++) {
      const position = text.indexOf(
        `Record ${String(index).padStart(3, "0")}:`,
      );
      assert.ok(position > previous, `Missing or reordered record ${index}`);
      previous = position;
    }
  } finally {
    await document.loadingTask.destroy();
  }
});

test("sample resume in both templates produces real multi-page PDF text", async () => {
  for (const template of ["engineer", "engineer-intern"] as const) {
    const document = await readPdf(mockResumeJson, template);
    try {
      let text = "";
      for (let index = 1; index <= document.numPages; index++) {
        const content = await (await document.getPage(index)).getTextContent();
        text += content.items
          .map((item) => ("str" in item ? item.str : ""))
          .join(" ");
      }
      assert.ok(document.numPages >= 2);
      assert.ok(text.includes(mockResumeJson.basicInfo.name));
      assert.ok(text.includes(mockResumeJson.certifications![0].name));
      assert.equal(
        text.indexOf("Education") < text.indexOf("Experience"),
        template === "engineer-intern",
      );
    } finally {
      await document.loadingTask.destroy();
    }
  }
});
