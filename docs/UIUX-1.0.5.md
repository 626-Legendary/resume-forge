# Resume Forge 1.0.5 — Company metadata and typography

This addendum supersedes the company input and fixed typography details in the 1.0.4 specification.

## JSON company metadata

- Put optional `"company-name"` immediately after `name` inside `basicInfo` in the empty schema, examples and inline help.
- Remove the manual company input and its separate state. Generate the PDF filename from the successfully parsed JSON. Do not include this metadata in PDF content, links, headings or readable preview text.
- Continue using `Company_Full_Name_Mon_DD.pdf`. Missing or blank company metadata uses `Resume`. Changing company JSON requires parsing before export, just like other edits.
- Accept older JSON without the field. For legacy stored exports, migrate the previous top-level `companyName` only if the nested field is absent. An explicit empty nested value uses `Resume`.

## Independent font-size settings

| Control             | Default | Applies to                                                          |
| ------------------- | ------- | ------------------------------------------------------------------- |
| Name (pt)           | 14pt    | Candidate name only                                                 |
| Section titles (pt) | 12pt    | Summary, Skills, Experience, Projects, Education and Certifications |
| Body text (pt)      | 10pt    | Contact lines, links, entry headings, paragraphs and bullets        |

- Place three labeled selectors together below Template. Support 6–32pt in half-point steps with native keyboard-accessible controls. Wrap them on narrow screens.
- Keep these settings separate from resume JSON. Changes immediately regenerate the PDF without requiring Parse JSON. Preview and download must use the same generated artifact and updated pagination.
- Disable export until the current font settings finish generating. Ignore obsolete render results after rapid changes. Keep Letter dimensions and page margins fixed.
- Reset restores 14/12/10 defaults. Reload also restores defaults; no new persistent browser storage is introduced.
- Both templates and the compatibility export route use the same defaults and rendering rules. Stored font sizes are validated individually, with invalid values falling back to defaults.

## Verification

### Skills hierarchy, spacing and independent reset

- Render Skills category labels, including the colon, in the bold font while values remain regular body text. Apply the same hierarchy in the readable text preview.
- Add line-height (1–2 in 0.05 steps, default 1.35), paragraph gap (0–12pt, default 3pt) and section gap (0–24pt, default 10pt) controls. Changes regenerate the shared PDF artifact and page count, preserving Letter dimensions and margins.
- Provide independent font and spacing restore buttons. Font restore resets 14/12/10pt only. Spacing restore resets 1.35/3/10 only. Neither clears JSON, parsed data or the selected template. The main Reset restores both groups and clears content as before.
- Normalize stored spacing values independently for compatibility exports; old payloads receive the current default spacing.
- Keep downloaded hyperlinks as standard URI actions. New-tab/window behavior is controlled by the PDF reader; do not promise that a PDF can enforce HTML-style link targets across readers. See Adobe's [URI action definition](https://opensource.adobe.com/dc-acrobat-sdk-docs/pdfstandards/pdfreference1.5_v6.pdf#page=624).
- Verify actual PDF bold/regular font identity, measured baseline gaps, export compatibility and independent reset behavior in browser regression tests.

Contact layout: group phone/email/location in the first row and LinkedIn/GitHub/website profiles in the second row, separated by `|`. Preserve each profile's hyperlink and allow natural text wrapping within the Letter margins. Keep additional plain-text status notes on their own subsequent rows. Omit empty rows and separators for missing entries.

- Check normalized field order, missing/blank company fallback and legacy migration precedence.
- Extract text from actual PDFs to ensure the target company is absent, independently verify name/section/body point sizes, and check both templates.
- Compare page counts at different body sizes and confirm all content survives repagination.
- Exercise JSON-based filename downloads, font settings, reset, stale-input protection and mobile layout in Chromium against a production build.
- Run unit/PDF tests, TypeScript, lint and production-browser tests before committing and pushing 1.0.5.
