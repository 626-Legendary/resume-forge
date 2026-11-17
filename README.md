# Resume Forge 1.0.5

A JSON-powered resume builder for AI-assisted job applications. Paste structured content, review every US Letter page, and download the same PDF shown in the preview.

**Copy. Paste. Parse. Review. Export. Apply.**

![Resume Forge](./public/og-image.png)

## What changed in 1.0.5

- Add optional `basicInfo["company-name"]` immediately after `name` in the JSON schema. It supplies the PDF filename prefix and is excluded from the resume body and text preview. The manual Company name input has been removed.
- Add independent **Name**, **Section titles** and **Body text** font-size controls, defaulting to **14pt**, **12pt** and **10pt**. Choose 6–32pt in 0.5pt increments. Body size includes contact information, entry headings, links and bullets.
- Font changes automatically regenerate the same PDF used for preview and download, including page breaks and page count. Export waits for the current settings; **Reset** restores the default sizes.
- Compact contact layout: phone, email and location share the first row; LinkedIn, GitHub and website links share the next row, separated by `|` with independent clickable targets. Rows wrap automatically when needed. Additional plain-text status notes remain below the links.
- Skills category labels such as **Languages:** and **Frontend:** are bold; their values keep the regular body font.
- Add **Spacing** controls for line spacing (default 1.35), paragraph gap (default 3pt) and section gap (default 10pt). Changes automatically update preview, pagination and export. Line spacing supports 1–2 in 0.05 steps; paragraph gap supports 0–12pt and section gap 0–24pt in whole points.
- **Restore font defaults** resets only the font sizes to 14/12/10pt. **Restore spacing defaults** resets only spacing to 1.35/3/10. Both preserve resume JSON, parsed content and the selected template. The main **Reset** clears the input back to the empty schema and restores all layout defaults.
- Preserve old JSON without a company field and migrate company metadata from 1.0.4 compatibility exports.

## Core features

- A focused two-panel dashboard replaces the crowded three-column console, repeated controls and scanning/pulsing effects.
- **Simple mode** on `/dashboard` uses light surfaces and disables animations, transitions and smooth scrolling. The preference is remembered in this browser.
- **Real paginated PDF preview** replaces crop lines. Each sheet is US Letter (612 × 792 points / 8.5 × 11 inches), with a page count and `Page n of N` labels.
- Preview and download use the **same PDF bytes**. No browser print dialog or screenshot-to-PDF conversion is needed.
- **Export PDF** downloads `Company_Full_Name_Mon_DD.pdf`, for example `Apple_Zexiang_Zhang_Nov_16.pdf`. The optional JSON field `basicInfo["company-name"]` controls the prefix; it never appears in the resume. An omitted or blank company uses `Resume`. Dates use the user's local date when clicking export, English month abbreviations and a two-digit day.
- Input validation requires a JSON object with a non-empty `basicInfo.name`. Unparsed edits disable export, so an old preview cannot accidentally be downloaded as the current version.
- Shared content, layout, rendering and builder modules replace duplicate dashboards, HTML templates and export implementations.
- Updated Next.js to 16.4.6 and refreshed compatible dependencies to address the existing dependency audit findings.

The original design specification and UI audit are in [docs/UIUX-1.0.4.md](./docs/UIUX-1.0.4.md). The current company metadata and typography requirements are in [docs/UIUX-1.0.5.md](./docs/UIUX-1.0.5.md).

## Get started

Use Node.js **22.13 or newer** (an active LTS release is recommended) and npm.

```bash
npm ci
npm run dev
```

Open `http://localhost:3000/dashboard`.

1. Paste your JSON or select **Load example**.
2. Select **Parse JSON** after changing content.
3. Choose Engineer or Engineer Intern. The intern template places Education before Skills and Experience.
4. Adjust **Name (pt)**, **Section titles (pt)**, **Body text (pt)** and **Spacing** as needed. To name the export for a company, set `basicInfo["company-name"]` in JSON and parse again. Use the independent restore buttons to reset fonts or spacing without losing your resume.
5. Review the page count, page breaks and content. Open **Read resume text** for an accessible text alternative.
6. Select **Export PDF** to download the document.

The page scales to the available width; its typography and Letter dimensions remain unchanged. On narrow screens, the editor and preview stack vertically.

## Resume schema

Only `basicInfo.name` is required. Other sections and fields are optional; blank sections are omitted. Strings are trimmed. `basicInfo["company-name"]` is filename metadata only; it is unrelated to employer names in `experiences[].company`. Old JSON without this field still works. Font sizes are dashboard settings, separate from resume content. The TypeScript contract is in [types/resume.ts](./types/resume.ts); the full empty schema and sample content are in [constants/default.json](./constants/default.json) and [constants/mockData.json](./constants/mockData.json).

```json
{
  "basicInfo": {
    "name": "Zexiang Zhang",
    "company-name": "Apple",
    "contact": {
      "tel": "+1 555 123 4567",
      "email": "zexiang@example.com",
      "location": "Seattle, WA",
      "extra": {
        "linkedIn": {
          "content": "linkedin.com/in/example",
          "link": "https://linkedin.com/in/example"
        },
        "github": {
          "content": "github.com/example",
          "link": "https://github.com/example"
        },
        "status": { "content": "Open to relocation" }
      }
    }
  },
  "summary": "Software engineer building accessible, reliable web applications.",
  "skills": {
    "Languages": ["TypeScript", "Python"],
    "Frontend": ["React", "Next.js"]
  },
  "experiences": [
    {
      "company": "Example Inc.",
      "title": "Software Engineer",
      "location": "Seattle, WA",
      "date": "Jan 2024 - Present",
      "description": ["Improved application performance by 30%."]
    }
  ],
  "projects": [
    {
      "name": "Resume Forge",
      "tools": ["TypeScript", "React"],
      "date": "2026",
      "url": "https://example.com",
      "description": ["Built a JSON-to-PDF resume workflow."]
    }
  ],
  "education": [
    {
      "school": "Example University",
      "degree": "Bachelor of Science",
      "major": "Computer Science",
      "location": "Seattle, WA",
      "date": "Class of 2024",
      "startDate": "Sep 2020",
      "endDate": "Jun 2024",
      "gpa": "3.8",
      "honors": ["Dean's List"],
      "description": [
        "Relevant coursework: algorithms and distributed systems."
      ]
    }
  ],
  "certifications": [
    {
      "name": "Example Certification",
      "issuer": "Example Organization",
      "date": "Nov 2026",
      "expirationDate": "Nov 2029",
      "credentialId": "CERT-123",
      "url": "https://example.com/verify"
    }
  ]
}
```

`skills` supports any category names. `contact.extra` supports any key with a string or `{ "content": "...", "link": "..." }`. `education.date` takes precedence over start/end dates; a start date without an end date renders as `Present`.

Suggested AI prompt:

```text
Convert my resume into the Resume Forge JSON schema below. Preserve factual
content and do not invent qualifications. Tailor wording to the job description.
Return only valid JSON, without Markdown fences.

[Paste constants/default.json, your resume and the job description here.]
```

## PDF behavior and privacy

PDF generation uses `@react-pdf/renderer`; PDF.js paints the resulting pages for preview. The download contains actual text and hyperlinks, using a single column, conventional section headings, Helvetica and 36pt margins. The default font sizes are 14pt for the name, 12pt for section titles and 10pt for all body text. Each is independently adjustable. Long paragraphs and lists flow onto subsequent pages with heading and widow/orphan protection; increasing font sizes can increase page count. These choices support ATS text extraction, but parsing varies between vendors and is not universally guaranteed.

The current PDF font targets English and Western Latin resumes. CJK scripts and emoji require a suitable embedded font before they can be supported reliably. US Letter is the only paper preset in this release. The canvas preview has a separate readable text view; text selection and link interaction are available in the downloaded PDF.

Downloaded PDF hyperlinks use standard URI actions. Whether a website opens in the same tab, a new tab or another browser window is controlled by the PDF reader/browser and its preferences. A website URI action has no portable equivalent of HTML `target="_blank"`; the PDF `NewWindow` flag applies to other action types and cannot reliably force website links into a new window across readers. See Adobe's [PDF Reference, URI Actions, pp. 602–603](https://opensource.adobe.com/dc-acrobat-sdk-docs/pdfstandards/pdfreference1.5_v6.pdf#page=624). The app preserves clickable URLs without adding reader-specific JavaScript actions.

Resume parsing, PDF generation and previews run in the browser. The dashboard keeps resume content, font sizes and spacing in memory and stores only the simple-mode preference. Reloading clears your current input and restores layout defaults. No resume data is submitted to an application backend. The app can still request static assets/fonts when loading.

`/export` remains a compatibility route for previously saved `resume-forge-data` local storage. It accepts legacy raw resumes and `{ resumeData, templateId, fontSizes?, spacing? }` payloads, uses the same PDF pipeline and offers a download link. `fontSizes` has `{ name, section, body }` numeric values and `spacing` has `{ lineHeight, paragraph, section }`; missing or invalid individual settings use their defaults. A legacy 1.0.4 `companyName` is migrated only when `basicInfo` has no `company-name` field; an explicit new value, including an empty string, takes precedence. The main dashboard downloads directly and does not write resumes to local storage. Simple mode is a visual preference, not an authentication or privacy boundary.

## Architecture

| Module                               | Responsibility                                                                     |
| ------------------------------------ | ---------------------------------------------------------------------------------- |
| `lib/resume.ts`                      | Input validation, normalization and legacy storage parsing                         |
| `lib/resume-content.ts`              | Ordered text content and safe hyperlinks for both templates                        |
| `lib/export-filename.ts`             | Filesystem-safe company/name/local-date filename                                   |
| `components/resume-pdf-document.tsx` | Letter PDF typography, margins and page wrapping                                   |
| `components/use-resume-pdf.ts`       | Lazy PDF generation, serialized jobs, stale-result protection and blob URL cleanup |
| `components/pdf-preview.tsx`         | Actual PDF page count, canvas rendering and readable text alternative              |
| `components/use-builder.ts`          | Input, parsed snapshot, template and font-size state                               |
| `lib/resume-typography.ts`           | Font defaults, supported sizes and stored-setting validation                       |
| `lib/resume-spacing.ts`              | Line, paragraph and section spacing defaults, options and validation               |
| `components/resume-builder.tsx`      | Shared dashboard UI and download interaction                                       |
| `components/resume-export-view.tsx`  | Shared legacy export UI                                                            |

The PDF worker is copied from the installed PDF.js package by `scripts/copy-pdf-worker.mjs` during install, development and build. It is served locally and ignored by Git; no runtime CDN dependency is needed for PDF rendering.

## Tests and production build

```bash
npm test
npm run typecheck
npm run lint
npx playwright install chromium
npm run test:e2e
npm run build
npm start
```

Unit and PDF integration tests verify input validation, normalization, company metadata migration and omission from resume content, legacy exports, filename/date handling, safe links, template order, default/custom font sizes extracted from actual PDFs, Letter dimensions, multiple pages and preservation/ordering of long content. Changing body size is checked for correct repagination without missing records.

Playwright tests exercise mode persistence and motion suppression, JSON company-based filenames, removal of the manual company input, font controls and actual font sizes in the downloaded PDF, stale-input protection, template changes, invalid input, reset, mobile layout and the compatibility export route. Chromium is required. The test runner builds the app and starts its own production server on port 3104; screenshots and failure traces are placed in ignored `test-results/`.

## Earlier releases

- **1.0.4** — Actual paginated Letter PDF preview/download, simple mode, shared rendering modules, private-route removal, regression tests and dependency security updates.
- **1.0.3** — Layout fixes and the original PrivateDashboard interface.
- **1.0.2** — Expanded resume schema and print crop lines (replaced by actual pagination in 1.0.4).
- **1.0.1** — Bug fixes and performance improvements.

## Author and license

Built by **Zexiang Zhang** — [GitHub](https://github.com/626-Legendary) · [Email](mailto:zhangzexiang626@gmail.com).

Licensed under [MIT](./LICENSE).
