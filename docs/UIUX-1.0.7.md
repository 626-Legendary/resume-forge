# Resume Forge 1.0.7 — Persistent layout preferences

This update supersedes earlier specifications that kept font sizes and spacing only in memory or restored them to defaults on every reload.

## Expected behavior

- Save all three Font sizes values and all three Spacing values immediately after an edit. Restore them on refresh or a later visit to the dashboard on the same browser/site.
- Restore font defaults persists 14/12/10pt and preserves saved spacing. Restore spacing defaults persists 1.35/3/10 and preserves saved font sizes. These actions preserve JSON, parsed data and template choice as before.
- The main Reset persists both groups of defaults and clears content back to the empty schema. Refresh must not resurrect earlier custom values.
- The saved settings drive the shared PDF generator, so preview pagination and download continue using the current layout.

## Storage and lifecycle

- Use `resume-forge-layout-preferences` local storage with `{ fontSizes: { name, section, body }, spacing: { lineHeight, paragraph, section } }`.
- Normalize each value through the existing size/spacing validators. Missing/corrupt records fall back safely; invalid fields do not discard valid neighboring fields.
- Read after client hydration through an external-store snapshot. Do not write initial defaults during mount, and do not persist resume JSON in this record.
- Each edit reads the latest snapshot, replaces only its setting group and notifies subscribers. Other dashboard tabs react to storage updates.
- If reads/writes are unavailable, keep controls working with a page-session fallback. Saved preferences are browser/site-local and can be removed by clearing site data.

## Verification

- Unit tests cover default recovery, valid round trips, unknown-field omission and per-field validation.
- Production browser tests cover six saved controls after reload, persistent independent restores, the main Reset, malformed/partially invalid storage without startup overwrites, cross-tab synchronization and storage failure fallback.
- Existing PDF, layout, import, branding, desktop and mobile tests remain part of the release checks. Update README and version metadata before commit/push.
