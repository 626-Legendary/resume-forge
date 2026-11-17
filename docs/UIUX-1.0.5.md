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

Contact layout: group phone/email/location in the first row and LinkedIn/GitHub/website profiles in the second row, separated by `|`. Preserve each profile's hyperlink and allow natural text wrapping within the Letter margins. Keep additional plain-text status notes on their own subsequent rows. Omit empty rows and separators for missing entries.

- Check normalized field order, missing/blank company fallback and legacy migration precedence.
- Extract text from actual PDFs to ensure the target company is absent, independently verify name/section/body point sizes, and check both templates.
- Compare page counts at different body sizes and confirm all content survives repagination.
- Exercise JSON-based filename downloads, font settings, reset, stale-input protection and mobile layout in Chromium against a production build.
- Run unit/PDF tests, TypeScript, lint and production-browser tests before committing and pushing 1.0.5.
