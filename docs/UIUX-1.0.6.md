# Resume Forge 1.0.6 — Interface and project identity

## Dashboard

- Rename the visible toggle to “Light mode on/off”. Keep the pressed state, light palette and motion suppression. Preserve the existing preference storage key so returning users retain their choice.
- Add a full-width, theme-aware separator between Font sizes and Spacing. Keep the independent restore actions.
- Replace the abbreviated JSON help with a full content framework generated from the shared default schema, excluding export-only company metadata. Include every supported content section and nested entry field; use a non-empty placeholder name so the copied framework can be parsed immediately.
- Explain optional sections, quoted strings, arrays, trailing commas, AI output without Markdown fences and Parse JSON. Provide a copy button with success/error status. Keep long code in a keyboard-accessible scrolling region.
- Pair the existing logo with the Resume Forge title and JSON-to-PDF/version caption. Ensure the header fits narrow viewports in both themes and the home link has an accessible name.
- Make personal authorship prominent: “An independent personal project”, “Built by Zexiang Zhang” and a direct repository link to `https://github.com/626-Legendary/resume-forge`. Keep the local PDF-generation note secondary.
- Reuse the landing footer component: 28px vertical padding, a brand/navigation row, a gradient divider with 20px vertical margins, and a lower copyright/author/note row. Keep its responsive stacking and adapt text/borders to dashboard light and dark themes. Keep the version in the footer; the dashboard header uses the logo and title alone.

## Landing hero

- Preserve the existing dark orange identity, grid/lighting effects, Orbitron headings and JetBrains Mono body/code font.
- Lead with “Tailor faster. Apply sooner.” Explain JSON input, actual Letter page review and direct PDF download.
- Give the builder a clear primary action and link the secondary action to the repository. Include the three-step workflow and browser-local/no-account context.
- Replace anonymous placeholder bars with readable sample resume content. Show valid JSON using the actual nested contact schema, matching the sample resume's name and content. Treat this panel as an illustration, not a second editor.
- Verify desktop and mobile layouts, primary navigation, readable text and absence of horizontal overflow.

## Verification

- Run the existing PDF and state regressions, TypeScript, ESLint and a production build.
- Browser checks cover renamed light-mode persistence, logo/title/version, divider, author attribution and exact repository URL, complete/copyable/parseable JSON help, preserved hero font family and responsive landing layout.
- Review screenshots before committing the 1.0.6 release. Preserve unrelated local changes.
