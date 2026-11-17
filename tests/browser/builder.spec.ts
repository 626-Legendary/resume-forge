import { test, expect } from "@playwright/test";
import schema from "../../constants/default.json" with { type: "json" };
import { RESUME_PREFERENCES_KEY } from "../../lib/resume-preferences";

let browserErrors: string[] = [];
test.beforeEach(async ({ page }) => {
  browserErrors = [];
  page.on("pageerror", (error) => browserErrors.push(error.message));
});
test.afterEach(() => {
  expect(browserErrors, "No uncaught browser runtime errors").toEqual([]);
});

test("light mode persists, is light, and suppresses all motion", async ({
  page,
}) => {
  await page.goto("/dashboard");
  await page.getByRole("button", { name: "Light mode off" }).click();
  await expect(page.locator("main")).toHaveAttribute("data-mode", "simple");
  expect(
    await page.locator("main").evaluate((element) => {
      const style = getComputedStyle(element);
      return {
        background: style.backgroundColor,
        animation: style.animationName,
        transition: style.transitionDuration,
      };
    }),
  ).toEqual({
    background: "rgb(246, 247, 249)",
    animation: "none",
    transition: "0s",
  });
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Light mode on" }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Light mode on" }).click();
  await expect(page.locator("main")).toHaveAttribute("data-mode", "dark");
});

test("parse, paginate and download actual PDF; edits block stale exports", async ({
  page,
}) => {
  await page.goto("/dashboard");
  const input = page.locator("#resume-json");
  await input.fill(
    JSON.stringify({
      basicInfo: { name: "Zexiang Zhang", "company-name": "Apple" },
      summary: "Software engineer.",
    }),
  );
  await page.getByRole("button", { name: "Parse JSON", exact: true }).click();
  await expect(
    page.getByText("1 page · US Letter", { exact: false }),
  ).toBeVisible();
  await expect(page.locator("canvas")).toHaveCount(1);
  await expect(page.locator("#target-company")).toHaveCount(0);
  const pending = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export PDF" }).click();
  const download = await pending;
  expect(download.suggestedFilename()).toMatch(
    /^Apple_Zexiang_Zhang_[A-Z][a-z]{2}_\d{2}\.pdf$/,
  );
  const stream = await download.createReadStream();
  const chunks: Buffer[] = [];
  for await (const chunk of stream!) chunks.push(chunk);
  expect(Buffer.concat(chunks).subarray(0, 5).toString()).toBe("%PDF-");
  await input.fill('{"basicInfo":{"name":"Changed"}}');
  await expect(page.getByRole("button", { name: "Export PDF" })).toBeDisabled();
  await expect(
    page.getByText("Showing the last parsed version."),
  ).toBeVisible();
  await page.getByRole("button", { name: "Load example" }).click();
  await expect(page.locator("canvas").nth(1)).toBeVisible();
  await page.screenshot({
    path: "test-results/dashboard-desktop.png",
    fullPage: true,
  });
  await page
    .getByLabel("Template", { exact: true })
    .selectOption("engineer-intern");
  await expect(page.getByRole("button", { name: "Export PDF" })).toBeEnabled();
  await page.getByLabel("Template", { exact: true }).selectOption("engineer");
  await expect(page.getByRole("button", { name: "Export PDF" })).toBeEnabled();
  const secondDownload = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export PDF" }).click();
  await expect((await secondDownload).failure()).resolves.toBeNull();
});

test("font controls update actual downloaded PDF and reset to 14/12/10", async ({
  page,
}) => {
  await page.goto("/dashboard");
  await expect(page.getByLabel("Name (pt)", { exact: true })).toHaveValue("14");
  await expect(page.getByLabel("Section titles (pt)")).toHaveValue("12");
  await expect(page.getByLabel("Body text (pt)")).toHaveValue("10");
  await page.locator("#resume-json").fill(
    JSON.stringify({
      basicInfo: { name: "Typography User", "company-name": "HiddenTarget" },
      summary: "Typography body",
    }),
  );
  await page.getByRole("button", { name: "Parse JSON", exact: true }).click();
  await expect(page.getByRole("button", { name: "Export PDF" })).toBeEnabled();
  await page.getByLabel("Name (pt)", { exact: true }).selectOption("22");
  await page.getByLabel("Section titles (pt)").selectOption("16");
  await page.getByLabel("Body text (pt)").selectOption("12.5");
  await expect(page.getByRole("button", { name: "Export PDF" })).toBeEnabled();
  const pending = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export PDF" }).click();
  const download = await pending;
  expect(download.suggestedFilename()).toMatch(
    /^HiddenTarget_Typography_User_/,
  );
  const stream = await download.createReadStream();
  const chunks: Buffer[] = [];
  for await (const chunk of stream!) chunks.push(chunk);
  const { getDocument } = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const document = await getDocument({
    data: new Uint8Array(Buffer.concat(chunks)),
    useSystemFonts: true,
  }).promise;
  try {
    const content = await (await document.getPage(1)).getTextContent();
    const items = content.items.filter((item) => "str" in item);
    expect(
      items.find((item) => item.str === "Typography User")?.height,
    ).toBeCloseTo(22);
    expect(items.find((item) => item.str === "Summary")?.height).toBeCloseTo(
      16,
    );
    expect(
      items.find((item) => item.str === "Typography body")?.height,
    ).toBeCloseTo(12.5);
    expect(items.map((item) => item.str).join(" ")).not.toContain(
      "HiddenTarget",
    );
  } finally {
    await document.loadingTask.destroy();
  }
  await page.getByRole("button", { name: "Reset", exact: true }).click();
  await expect(page.getByLabel("Name (pt)", { exact: true })).toHaveValue("14");
  await expect(page.getByLabel("Section titles (pt)")).toHaveValue("12");
  await expect(page.getByLabel("Body text (pt)")).toHaveValue("10");
});

test("validation errors, reset and responsive paper", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/dashboard");
  await page.getByRole("button", { name: "Light mode off" }).click();
  await expect(page.locator("main")).toHaveAttribute("data-mode", "simple");
  await page.locator("#resume-json").fill("{}");
  await page.getByRole("button", { name: "Parse JSON", exact: true }).click();
  await expect(page.locator("#builder-status")).toContainText("basicInfo.name");
  await page.getByRole("button", { name: "Load example" }).click();
  await expect(page.locator("canvas").first()).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  const box = await page.locator("canvas").first().boundingBox();
  expect(box!.width / box!.height).toBeCloseTo(612 / 792, 2);
  await page.screenshot({
    path: "test-results/dashboard-mobile.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "Reset", exact: true }).click();
  await expect(page.locator("canvas")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Export PDF" })).toBeDisabled();
});

test("font and spacing defaults restore independently without clearing JSON or the template", async ({
  page,
}) => {
  await page.goto("/dashboard");
  await page.getByRole("button", { name: "Load example" }).click();
  const input = await page.locator("#resume-json").inputValue();
  await page
    .getByLabel("Template", { exact: true })
    .selectOption("engineer-intern");
  await page.getByLabel("Name (pt)", { exact: true }).selectOption("20");
  await page.getByLabel("Section titles (pt)").selectOption("16");
  await page.getByLabel("Body text (pt)").selectOption("12");
  await page.getByLabel("Line spacing", { exact: true }).selectOption("1.8");
  await page.getByLabel("Paragraph gap (pt)").selectOption("6");
  await page.getByLabel("Section gap (pt)").selectOption("18");
  await expect(page.getByRole("button", { name: "Export PDF" })).toBeEnabled();
  await page.getByRole("button", { name: "Restore font defaults" }).click();
  await expect(page.getByLabel("Name (pt)", { exact: true })).toHaveValue("14");
  await expect(page.getByLabel("Section titles (pt)")).toHaveValue("12");
  await expect(page.getByLabel("Body text (pt)")).toHaveValue("10");
  await expect(page.getByLabel("Line spacing", { exact: true })).toHaveValue(
    "1.8",
  );
  await expect(page.getByLabel("Paragraph gap (pt)")).toHaveValue("6");
  await expect(page.getByLabel("Section gap (pt)")).toHaveValue("18");
  await expect(page.locator("#resume-json")).toHaveValue(input);
  await expect(page.getByLabel("Template", { exact: true })).toHaveValue(
    "engineer-intern",
  );
  await page.getByLabel("Name (pt)", { exact: true }).selectOption("18");
  await page.getByRole("button", { name: "Restore spacing defaults" }).click();
  await expect(page.getByLabel("Line spacing", { exact: true })).toHaveValue(
    "1.35",
  );
  await expect(page.getByLabel("Paragraph gap (pt)")).toHaveValue("3");
  await expect(page.getByLabel("Section gap (pt)")).toHaveValue("10");
  await expect(page.getByLabel("Name (pt)", { exact: true })).toHaveValue("18");
  await expect(page.locator("#resume-json")).toHaveValue(input);
  await expect(page.getByRole("button", { name: "Export PDF" })).toBeEnabled();
  await page.getByRole("button", { name: "Reset", exact: true }).click();
  await expect(page.getByLabel("Name (pt)", { exact: true })).toHaveValue("14");
  await expect(page.getByLabel("Line spacing", { exact: true })).toHaveValue(
    "1.35",
  );
  await expect(page.getByRole("button", { name: "Export PDF" })).toBeDisabled();
});

test("layout preferences and restored defaults survive refresh independently", async ({
  page,
}) => {
  await page.goto("/dashboard");
  await page.getByRole("button", { name: "Load example" }).click();
  await page.getByLabel("Name (pt)", { exact: true }).selectOption("20");
  await page.getByLabel("Section titles (pt)").selectOption("16");
  await page.getByLabel("Body text (pt)").selectOption("12");
  await page.getByLabel("Line spacing", { exact: true }).selectOption("1.8");
  await page.getByLabel("Paragraph gap (pt)").selectOption("6");
  await page.getByLabel("Section gap (pt)").selectOption("18");
  await page.reload();
  await expect(page.getByLabel("Name (pt)", { exact: true })).toHaveValue("20");
  await expect(page.getByLabel("Section titles (pt)")).toHaveValue("16");
  await expect(page.getByLabel("Body text (pt)")).toHaveValue("12");
  await expect(page.getByLabel("Line spacing", { exact: true })).toHaveValue(
    "1.8",
  );
  await expect(page.getByLabel("Paragraph gap (pt)")).toHaveValue("6");
  await expect(page.getByLabel("Section gap (pt)")).toHaveValue("18");
  // Resume content is still kept only in memory, independently of layout preferences.
  expect(JSON.parse(await page.locator("#resume-json").inputValue())).toEqual(
    schema,
  );
  await page.getByRole("button", { name: "Restore font defaults" }).click();
  await page.reload();
  await expect(page.getByLabel("Name (pt)", { exact: true })).toHaveValue("14");
  await expect(page.getByLabel("Section titles (pt)")).toHaveValue("12");
  await expect(page.getByLabel("Body text (pt)")).toHaveValue("10");
  await expect(page.getByLabel("Line spacing", { exact: true })).toHaveValue(
    "1.8",
  );
  await expect(page.getByLabel("Paragraph gap (pt)")).toHaveValue("6");
  await expect(page.getByLabel("Section gap (pt)")).toHaveValue("18");
  await page.getByLabel("Name (pt)", { exact: true }).selectOption("18");
  await page.getByRole("button", { name: "Restore spacing defaults" }).click();
  await page.reload();
  await expect(page.getByLabel("Name (pt)", { exact: true })).toHaveValue("18");
  await expect(page.getByLabel("Line spacing", { exact: true })).toHaveValue(
    "1.35",
  );
  await expect(page.getByLabel("Paragraph gap (pt)")).toHaveValue("3");
  await expect(page.getByLabel("Section gap (pt)")).toHaveValue("10");
  await page.getByLabel("Line spacing", { exact: true }).selectOption("1.6");
  await page.getByRole("button", { name: "Reset", exact: true }).click();
  await page.reload();
  await expect(page.getByLabel("Name (pt)", { exact: true })).toHaveValue("14");
  await expect(page.getByLabel("Line spacing", { exact: true })).toHaveValue(
    "1.35",
  );
  const saved = await page.evaluate(
    (key) => JSON.parse(localStorage.getItem(key)!),
    RESUME_PREFERENCES_KEY,
  );
  expect(saved).toEqual({
    fontSizes: { name: 14, section: 12, body: 10 },
    spacing: { lineHeight: 1.35, paragraph: 3, section: 10 },
  });
});

test("bad saved preferences recover per field without overwriting valid values on startup", async ({
  page,
}) => {
  await page.goto("/dashboard");
  await page.evaluate(
    (key) => localStorage.setItem(key, "{broken"),
    RESUME_PREFERENCES_KEY,
  );
  await page.reload();
  await expect(page.getByLabel("Name (pt)", { exact: true })).toHaveValue("14");
  await expect(page.getByLabel("Line spacing", { exact: true })).toHaveValue(
    "1.35",
  );
  const stored = JSON.stringify({
    fontSizes: { name: 20, section: "bad", body: 999 },
    spacing: { lineHeight: 1.8, paragraph: -1, section: 18 },
  });
  await page.evaluate(({ key, stored }) => localStorage.setItem(key, stored), {
    key: RESUME_PREFERENCES_KEY,
    stored,
  });
  await page.reload();
  await expect(page.getByLabel("Name (pt)", { exact: true })).toHaveValue("20");
  await expect(page.getByLabel("Section titles (pt)")).toHaveValue("12");
  await expect(page.getByLabel("Body text (pt)")).toHaveValue("10");
  await expect(page.getByLabel("Line spacing", { exact: true })).toHaveValue(
    "1.8",
  );
  await expect(page.getByLabel("Paragraph gap (pt)")).toHaveValue("3");
  await expect(page.getByLabel("Section gap (pt)")).toHaveValue("18");
  expect(
    await page.evaluate(
      (key) => localStorage.getItem(key),
      RESUME_PREFERENCES_KEY,
    ),
  ).toBe(stored);
  await page.getByLabel("Body text (pt)").selectOption("11");
  await page.reload();
  await expect(page.getByLabel("Name (pt)", { exact: true })).toHaveValue("20");
  await expect(page.getByLabel("Body text (pt)")).toHaveValue("11");
  await expect(page.getByLabel("Section gap (pt)")).toHaveValue("18");
});

test("layout edits synchronize across tabs without losing the other setting group", async ({
  page,
  context,
}) => {
  await page.goto("/dashboard");
  const second = await context.newPage();
  try {
    await second.goto("/dashboard");
    await page.getByLabel("Name (pt)", { exact: true }).selectOption("20");
    await expect(second.getByLabel("Name (pt)", { exact: true })).toHaveValue(
      "20",
    );
    await second
      .getByLabel("Line spacing", { exact: true })
      .selectOption("1.8");
    await expect(page.getByLabel("Line spacing", { exact: true })).toHaveValue(
      "1.8",
    );
    await page.getByRole("button", { name: "Restore font defaults" }).click();
    await expect(second.getByLabel("Name (pt)", { exact: true })).toHaveValue(
      "14",
    );
    await expect(
      second.getByLabel("Line spacing", { exact: true }),
    ).toHaveValue("1.8");
  } finally {
    await second.close();
  }
});

test("layout controls and restores still work when preference storage is unavailable", async ({
  page,
}) => {
  await page.addInitScript((key) => {
    const read = Storage.prototype.getItem;
    const write = Storage.prototype.setItem;
    Storage.prototype.getItem = function (name) {
      if (name === key)
        throw new DOMException("Storage blocked", "SecurityError");
      return read.call(this, name);
    };
    Storage.prototype.setItem = function (name, value) {
      if (name === key)
        throw new DOMException("Storage blocked", "QuotaExceededError");
      return write.call(this, name, value);
    };
  }, RESUME_PREFERENCES_KEY);
  await page.goto("/dashboard");
  await page.getByLabel("Name (pt)", { exact: true }).selectOption("20");
  await page.getByLabel("Line spacing", { exact: true }).selectOption("1.8");
  await expect(page.getByLabel("Name (pt)", { exact: true })).toHaveValue("20");
  await expect(page.getByLabel("Line spacing", { exact: true })).toHaveValue(
    "1.8",
  );
  await page.getByRole("button", { name: "Restore font defaults" }).click();
  await expect(page.getByLabel("Name (pt)", { exact: true })).toHaveValue("14");
  await expect(page.getByLabel("Line spacing", { exact: true })).toHaveValue(
    "1.8",
  );
  await page.getByRole("button", { name: "Restore spacing defaults" }).click();
  await expect(page.getByLabel("Line spacing", { exact: true })).toHaveValue(
    "1.35",
  );
});

test("export reports missing data and renders legacy storage", async ({
  page,
}) => {
  await page.goto("/export");
  await expect(page.locator("main").getByRole("alert")).toContainText(
    "No resume data",
  );
  await page.evaluate(() =>
    localStorage.setItem(
      "resume-forge-data",
      JSON.stringify({ basicInfo: { name: "Legacy User" } }),
    ),
  );
  await page.reload();
  await expect(page.locator("canvas")).toHaveCount(1);
  await expect(
    page.getByRole("link", { name: "Download PDF" }),
  ).toHaveAttribute("download", /^Resume_Legacy_User_/);
});

test("AI JSON wrappers render clean profile labels without search or Markdown noise", async ({
  page,
}) => {
  await page.goto("/dashboard");
  const input = JSON.stringify({
    basicInfo: {
      name: "Alex",
      contact: {
        extra: {
          linkedIn: {
            content:
              "[linkedin.com/in/alex](https://www.google.com/search?q=https://linkedin.com/in/alex)",
            link: "[https://linkedin.com/in/alex](https://www.google.com/search?q=https://linkedin.com/in/alex)",
          },
          github: {
            content: "[github.com/alex](https://github.com/alex)",
            link: "[https://github.com/alex](https://github.com/alex)",
          },
        },
      },
    },
    aiNotes: "Unused AI commentary",
  });
  await page
    .locator("#resume-json")
    .fill(`\x60\x60\x60json\n${input}\n\x60\x60\x60`);
  await page.getByRole("button", { name: "Parse JSON", exact: true }).click();
  await expect(page.locator("canvas")).toHaveCount(1);
  await page.getByText("Read resume text", { exact: true }).click();
  const text = page.locator(".resume-text");
  await expect(text).toContainText("linkedin.com/in/alex | github.com/alex");
  await expect(text).not.toContainText("google.com");
  await expect(text).not.toContainText("](");
  await expect(text).not.toContainText("Unused AI commentary");
  await expect(page.getByRole("button", { name: "Export PDF" })).toBeEnabled();
});

test("dashboard branding, personal-project footer and complete JSON writing guide", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/dashboard");
  const brand = page.getByRole("link", {
    name: "Resume Forge home",
    exact: true,
  });
  await expect(brand).toHaveAttribute("href", "/");
  await expect(brand.locator("img")).toBeVisible();
  const footer = page.locator(".builder-footer");
  await expect(footer).toContainText("v1.0.7");
  await expect(footer).toContainText("An independent personal project");
  await expect(footer).toContainText("Zexiang Zhang");
  await expect(
    footer.getByRole("link", { name: "GitHub", exact: true }),
  ).toHaveAttribute("href", "https://github.com/626-Legendary/resume-forge");
  await expect(
    footer.getByRole("link", { name: "GitHub", exact: true }),
  ).toHaveAttribute("target", "_blank");
  await expect(page.getByRole("separator")).toHaveCSS(
    "border-top-width",
    "1px",
  );
  await page.getByText("JSON format and tips", { exact: true }).click();
  const help = page.locator(".builder-help");
  await expect(help).not.toContainText("company-name");
  const frameworkText = await help
    .getByLabel("Complete resume JSON framework")
    .textContent();
  const framework = JSON.parse(frameworkText!);
  expect(framework).toEqual({
    ...schema,
    basicInfo: { name: "Your Name", contact: schema.basicInfo.contact },
  });
  await help.getByRole("button", { name: "Copy JSON framework" }).click();
  await expect(help.getByRole("status")).toHaveText("JSON framework copied.");
  const copiedFramework = await page.evaluate(() =>
    navigator.clipboard.readText(),
  );
  // Clipboard text uses platform line endings on Windows.
  expect(JSON.parse(copiedFramework)).toEqual(framework);
  await page.locator("#resume-json").fill(copiedFramework);
  await page.getByRole("button", { name: "Parse JSON", exact: true }).click();
  await expect(page.getByRole("button", { name: "Export PDF" })).toBeEnabled();
  await page.screenshot({
    path: "test-results/dashboard-help.png",
    fullPage: true,
  });
});

test("landing hero explains the workflow and preserves the visual identity on desktop and mobile", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const width of [1280, 390]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    const hero = page.getByRole("region", {
      name: "Tailor faster. Apply sooner.",
    });
    await expect(hero.getByRole("heading", { level: 1 })).toBeVisible();
    expect(
      await hero
        .getByRole("heading", { level: 1 })
        .evaluate((element) => getComputedStyle(element).fontFamily),
    ).toMatch(/Orbitron/i);
    await expect(
      hero.getByRole("link", { name: "Build my resume" }),
    ).toHaveAttribute("href", "/dashboard");
    await expect(
      hero.getByRole("link", { name: "View source", exact: true }),
    ).toHaveAttribute("href", "https://github.com/626-Legendary/resume-forge");
    await expect(
      hero.getByText("Review pages", { exact: false }),
    ).toBeVisible();
    const example = JSON.parse(
      (await hero.getByLabel("Example resume JSON").textContent())!,
    );
    expect(example.basicInfo.contact.email).toBe("alex@example.com");
    const preview = hero.getByRole("article", {
      name: "Example resume preview",
    });
    await expect(preview).toBeVisible();
    await expect(preview).not.toContainText(example.basicInfo.name);
    await expect(preview.locator('[aria-hidden="true"]')).toBeVisible();
    await expect(preview).toContainText("US LETTER · PAGE 1");
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    await page.screenshot({
      path: `test-results/home-${width}.png`,
      fullPage: true,
    });
  }
});
