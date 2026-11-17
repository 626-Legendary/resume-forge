import { test } from "node:test";
import assert from "node:assert/strict";
import { renderToBuffer } from "@react-pdf/renderer";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";
import ResumePdfDocument from "../components/resume-pdf-document";
import { normalizeResumeData, mockResumeJson } from "../lib/resume";
import type { ResumeFontSizes } from "../lib/resume-typography";
import type { ResumeSpacing } from "../lib/resume-spacing";

async function readPdf(
  data: Parameters<typeof ResumePdfDocument>[0]["data"],
  templateId: "engineer" | "engineer-intern" = "engineer",
  fontSizes?: ResumeFontSizes,
  spacing?: ResumeSpacing,
) {
  const bytes = await renderToBuffer(
    ResumePdfDocument({ data, templateId, fontSizes, spacing }),
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

test("Experience company/location and title/date occupy two rows with correct alignment", async () => {
  const data = normalizeResumeData({
    basicInfo: { name: "Alex" },
    experiences: [
      {
        company: "Acme",
        location: "Seattle",
        title: "Software Engineer",
        date: "Jan 2024 - Present",
        description: ["Built reliable tools"],
      },
    ],
  });
  for (const template of ["engineer", "engineer-intern"] as const) {
    const document = await readPdf(data, template);
    try {
      const content = await (await document.getPage(1)).getTextContent();
      const items = content.items.filter((item) => "str" in item);
      const get = (text: string) => {
        const item = items.find((item) => item.str === text);
        assert.ok(item, `Missing ${text}`);
        return item;
      };
      const company = get("Acme - Seattle");
      const role = get("Software Engineer");
      const date = get("Jan 2024 - Present");
      const bullet = items.find((item) =>
        item.str.includes("Built reliable tools"),
      )!;
      assert.ok(Math.abs(role.transform[4] - 36) < 0.1);
      assert.ok(Math.abs(date.transform[4] + date.width - 576) < 0.1);
      assert.ok(Math.abs(role.transform[5] - date.transform[5]) < 0.1);
      assert.ok(company.transform[5] > role.transform[5]);
      assert.ok(role.transform[5] > bullet.transform[5]);
      const text = items.map((item) => item.str).join(" ");
      assert.ok(text.indexOf("Acme") < text.indexOf("Software Engineer"));
      assert.ok(text.indexOf("Software Engineer") < text.indexOf("Jan 2024"));
      assert.ok(
        text.indexOf("Jan 2024") < text.indexOf("Built reliable tools"),
      );
    } finally {
      await document.loadingTask.destroy();
    }
  }
});

test("Experience headers wrap, stay on one page and preserve optional fields", async () => {
  const data = normalizeResumeData({
    basicInfo: { name: "Alex" },
    experiences: [
      ...Array.from({ length: 30 }, (_, index) => ({
        company: `Company${index}`,
        location: "Seattle",
        title: `Role${index} Senior Software Engineer for Cloud Infrastructure and Developer Experience`,
        date: `Date${index} January 2020 through December 2026`,
        description: [
          `Result${index} Built reliable services and improved the quality of engineering tools.`,
        ],
      })),
      { company: "NoLocation", title: "NoDate" },
      { company: "NoTitle", date: "DateOnly" },
      { description: ["NoHeaderBullet"] },
    ],
  });
  const document = await readPdf(data, "engineer", {
    name: 14,
    section: 12,
    body: 16,
  });
  try {
    assert.ok(document.numPages > 1);
    let text = "";
    for (let number = 1; number <= document.numPages; number++) {
      const content = await (await document.getPage(number)).getTextContent();
      const items = content.items.filter((item) => "str" in item);
      const pageText = items.map((item) => item.str).join(" ");
      for (const item of items)
        if (item.str.trim())
          assert.ok(
            item.transform[4] >= 35 && item.transform[4] + item.width <= 577,
            `Text beyond margins: ${item.str}`,
          );
      for (let index = 0; index < 30; index++)
        if (pageText.includes(`Company${index} -`)) {
          assert.ok(
            pageText.includes(`Role${index} `),
            `Split role for ${index}`,
          );
          assert.ok(
            pageText.includes(`Date${index} `),
            `Split date for ${index}`,
          );
        }
      text += pageText + " ";
    }
    for (let index = 0; index < 30; index++) {
      assert.ok(text.includes(`Company${index} - Seattle`));
      assert.ok(text.includes(`Result${index} `));
    }
    for (const field of [
      "NoLocation",
      "NoDate",
      "NoTitle",
      "DateOnly",
      "NoHeaderBullet",
    ])
      assert.ok(text.includes(field));
    assert.ok(!text.includes("NoLocation -"));
  } finally {
    await document.loadingTask.destroy();
  }
});

test("skill labels use the bold PDF font while values retain body font and size", async () => {
  const data = normalizeResumeData({
    basicInfo: { name: "Alex" },
    summary: "Body sample",
    skills: { Languages: ["TypeScript", "Python"], Frontend: ["React"] },
  });
  for (const template of ["engineer", "engineer-intern"] as const) {
    const document = await readPdf(data, template);
    try {
      const content = await (await document.getPage(1)).getTextContent();
      const items = content.items.filter((item) => "str" in item);
      const bold = items.find((item) => item.str === "Alex")!;
      const regular = items.find((item) => item.str === "Body sample")!;
      for (const label of ["Languages:", "Frontend:"]) {
        const item = items.find((item) => item.str.trim() === label);
        assert.ok(item);
        assert.equal(item.fontName, bold.fontName);
        assert.equal(item.height, 10);
      }
      for (const text of ["TypeScript, Python", "React"]) {
        const item = items.find((item) => item.str.trim() === text);
        assert.ok(item);
        assert.equal(item.fontName, regular.fontName);
        assert.equal(item.height, 10);
      }
      assert.notEqual(bold.fontName, regular.fontName);
    } finally {
      await document.loadingTask.destroy();
    }
  }
});

test("spacing changes line, paragraph and section distances without changing font sizes", async () => {
  const data = normalizeResumeData({
    basicInfo: { name: "Alex" },
    summary: "First line\nSecond line",
    skills: { Languages: ["TypeScript"], Frontend: ["React"] },
  });
  const measurements: number[][] = [];
  for (const spacing of [
    undefined,
    { lineHeight: 1.8, paragraph: 8, section: 20 },
  ]) {
    const document = await readPdf(data, "engineer", undefined, spacing);
    try {
      const content = await (await document.getPage(1)).getTextContent();
      const items = content.items.filter((item) => "str" in item);
      const get = (text: string) => {
        const item = items.find((item) => item.str.trim() === text);
        assert.ok(item, `Missing ${text}`);
        return item;
      };
      measurements.push([
        get("First line").transform[5] - get("Second line").transform[5],
        get("Languages:").transform[5] - get("Frontend:").transform[5],
        get("Second line").transform[5] - get("Skills").transform[5],
      ]);
      assert.equal(get("First line").height, 10);
      assert.equal(get("Alex").height, 14);
    } finally {
      await document.loadingTask.destroy();
    }
  }
  for (let index = 0; index < 3; index++)
    assert.ok(measurements[1][index] > measurements[0][index]);
  assert.ok(Math.abs(measurements[0][0] - 13.5) < 0.01);
  assert.ok(Math.abs(measurements[1][0] - 18) < 0.01);
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

test("PDF header uses two compact contact rows and preserves individual hyperlink targets", async () => {
  const data = normalizeResumeData({
    basicInfo: {
      name: "Alex",
      contact: {
        tel: "555-1234",
        email: "alex@example.com",
        location: "Seattle",
        extra: {
          linkedIn: {
            content: "LinkedIn",
            link: "https://linkedin.com/in/alex",
          },
          github: { content: "GitHub", link: "https://github.com/alex" },
          website: { content: "Website", link: "https://alex.example.com" },
        },
      },
    },
  });
  for (const template of ["engineer", "engineer-intern"] as const) {
    const document = await readPdf(data, template);
    try {
      const page = await document.getPage(1);
      const content = await page.getTextContent();
      const items = content.items
        .filter((item) => "str" in item)
        .filter((item) => item.str.trim());
      const contact = items.find((item) => item.str.includes("555-1234"));
      assert.ok(contact);
      const profileItems = ["LinkedIn", "GitHub", "Website"].map((text) => {
        const item = items.find((item) => item.str.includes(text));
        assert.ok(item, `Missing ${text}`);
        return item;
      });
      assert.ok(
        profileItems.every(
          (item) => item.transform[5] === profileItems[0].transform[5],
        ),
      );
      assert.ok(contact.transform[5] > profileItems[0].transform[5]);
      assert.equal(new Set(items.map((item) => item.transform[5])).size, 3);
      const annotations = await page.getAnnotations();
      for (const url of [
        "https://linkedin.com/in/alex",
        "https://github.com/alex",
        "https://alex.example.com/",
      ]) {
        assert.ok(
          annotations.some((annotation) => annotation.url === url),
          `Missing PDF link ${url}`,
        );
      }
    } finally {
      await document.loadingTask.destroy();
    }
  }
});

test("long profile rows wrap within Letter margins and retain all links", async () => {
  const extra = Object.fromEntries(
    Array.from({ length: 8 }, (_, index) => [
      `profile${index}`,
      {
        content: `Professional profile number ${index}`,
        link: `https://example.com/profile/${index}`,
      },
    ]),
  );
  const data = normalizeResumeData({
    basicInfo: { name: "Alex", contact: { extra } },
  });
  const document = await readPdf(data, "engineer", {
    name: 14,
    section: 12,
    body: 16,
  });
  try {
    const page = await document.getPage(1);
    const content = await page.getTextContent();
    const items = content.items
      .filter((item) => "str" in item)
      .filter((item) => item.str.trim() && item.str !== "Alex");
    assert.ok(new Set(items.map((item) => item.transform[5])).size > 1);
    for (const item of items) {
      assert.ok(
        item.transform[4] >= 35 && item.transform[4] + item.width <= 577,
        `Header text outside margin: ${item.str}`,
      );
    }
    const text = items.map((item) => item.str).join(" ");
    for (let index = 0; index < 8; index++)
      assert.ok(text.includes(`Professional profile number ${index}`));
    const annotations = await page.getAnnotations();
    for (let index = 0; index < 8; index++)
      assert.ok(
        annotations.some(
          (annotation) =>
            annotation.url === `https://example.com/profile/${index}`,
        ),
      );
  } finally {
    await document.loadingTask.destroy();
  }
});
