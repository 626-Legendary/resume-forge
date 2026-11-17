# Resume Forge 1.0.4 — UI/UX specification

## Primary task

Convert structured resume JSON into a readable, ATS-friendly US Letter PDF. The preview must show the actual exported document, including every page break. Content correctness takes priority over decoration.

## Workspace

- Use two aligned panels: JSON input and document preview. Put template, company and parse actions beside the input; remove the redundant control column, repeated reset buttons, status badges and decorative scanning effects.
- Retain dark orange branding as the default. Add an accessible “Simple mode” toggle on `/dashboard`: light surfaces, dark readable text, no animations, transitions or smooth scrolling. Remember the preference locally.
- Use consistent 8px spacing, 44px controls, visible keyboard focus, associated labels and live status/error announcements. Stack panels on narrow screens. Scale paper without changing its layout or causing horizontal page scrolling.
- Clearly distinguish unparsed edits from the last successful preview. Disable export until the current input has been parsed. Invalid input explains the problem and never exports stale content.
- Add an optional target-company field. It is application metadata and must not appear in the resume body.

## Document and export

- Generate one PDF artifact in the browser; use its bytes for both preview and download. Never screenshot HTML to create the PDF.
- US Letter is exactly 612 × 792 PDF points (8.5 × 11 inches). Use 36pt margins and readable 10pt Helvetica body text, black on white.
- Use one text column, standard section names, real text, links and bullet paragraphs. Engineer Intern moves Education before Experience. Hide empty sections.
- Let long content flow onto subsequent pages; protect headings and text widows/orphans rather than clipping content or shrinking the entire resume to one page.
- Display the actual page count and label every preview sheet “Page n of N”. Scale sheets responsively; retain their original proportions. Provide a text alternative to the canvas preview.
- Download directly as `Company_Full_Name_Mon_DD.pdf`, using the user's local date at click time and English month abbreviations. Example: `Apple_Zexiang_Zhang_Nov_16.pdf`. Sanitize filesystem-reserved characters. Fall back to `Resume` when company is omitted.
- Generation/loading/error states must be explicit, and retry must be available. Cancel obsolete previews and revoke object URLs to avoid stale downloads and memory leaks.
- Keep `/export` as a compatibility view using the same PDF pipeline. Resume data stays in this browser; explain local storage used by this compatibility route.

## Boundaries and acceptance checks

- Data normalization/validation, filename creation, PDF layout, PDF generation state, preview painting and dashboard UI are independent modules.
- Test normalization, invalid input, backward-compatible storage, filename sanitization/date, both template orders, PDF text extraction, Letter geometry and multi-page overflow. Browser tests cover mode persistence, no motion, stale export protection, responsive preview, real downloads and export-route errors.
- Run tests, TypeScript, lint and a production build. Document installation, schema, workflow, architecture, testing and export limitations in README. ATS parsing varies by vendor; never promise universal compatibility.

## Audit against 1.0.3

| Finding                                           | 1.0.4 resolution                               |
| ------------------------------------------------- | ---------------------------------------------- |
| Three columns squeeze the preview                 | Two-column workspace with responsive paper     |
| Duplicate dashboard and export logic              | Shared builder and shared export view          |
| A4/Letter crop lines do not paginate              | Render actual paginated Letter PDF             |
| Preview and browser print can differ              | Preview and download use the same bytes        |
| Random export filename                            | Deterministic company/name/local-date filename |
| Decorative scanning/pulsing and repeated controls | Remove scanning/pulsing and duplicate controls |
| Edits can export an old preview                   | Disable download until edits are parsed        |
| Generic parse failures and silent empty input     | Validate object shape and required name        |

## Verification

- All audit resolutions above are implemented.
- Nine unit/PDF integration tests passed, including actual PDF text extraction, Letter page geometry and preservation of 120 records across pages.
- Four Chromium end-to-end tests passed against the production build, covering both modes, mobile paper scaling, PDF downloads, stale edits and compatibility routes. No uncaught browser runtime errors were observed.
- Desktop and mobile screenshots were visually reviewed. TypeScript, ESLint and the Next.js 16.4.6 production build passed.
- Dependencies were refreshed; the dependency audit reported zero known vulnerabilities at verification time.

Implementation details, supported schema and font limitations are recorded in README.
