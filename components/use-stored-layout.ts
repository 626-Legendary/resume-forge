"use client";

import { useMemo, useSyncExternalStore, type SetStateAction } from "react";
import {
  normalizeResumePreferences,
  parseResumePreferences,
  RESUME_PREFERENCES_KEY,
  type ResumePreferences,
} from "@/lib/resume-preferences";
import {
  DEFAULT_RESUME_FONT_SIZES,
  type ResumeFontSizes,
} from "@/lib/resume-typography";
import {
  DEFAULT_RESUME_SPACING,
  type ResumeSpacing,
} from "@/lib/resume-spacing";

const CHANGE_EVENT = "resume-forge-layout-change";
// Keep controls usable for this page when browser storage is unavailable/full.
let volatileSnapshot: string | undefined;

function getSnapshot() {
  if (volatileSnapshot !== undefined) return volatileSnapshot;
  try {
    return window.localStorage.getItem(RESUME_PREFERENCES_KEY);
  } catch {
    return null;
  }
}

function subscribe(onChange: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key === RESUME_PREFERENCES_KEY || event.key === null) {
      volatileSnapshot = undefined;
      onChange();
    }
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
}

function updatePreferences(
  update: (current: ResumePreferences) => ResumePreferences,
) {
  // Read the latest snapshot for every edit so rapid edits and separate tabs
  // preserve the other setting group instead of writing a stale React closure.
  const next = update(parseResumePreferences(getSnapshot()));
  const snapshot = JSON.stringify(normalizeResumePreferences(next));
  try {
    window.localStorage.setItem(RESUME_PREFERENCES_KEY, snapshot);
    volatileSnapshot = undefined;
  } catch {
    volatileSnapshot = snapshot;
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function useStoredLayout() {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, () => null);
  const preferences = useMemo(
    () => parseResumePreferences(snapshot),
    [snapshot],
  );
  function setFontSizes(update: SetStateAction<ResumeFontSizes>) {
    updatePreferences((current) => ({
      ...current,
      fontSizes:
        typeof update === "function" ? update(current.fontSizes) : update,
    }));
  }
  function setSpacing(update: SetStateAction<ResumeSpacing>) {
    updatePreferences((current) => ({
      ...current,
      spacing: typeof update === "function" ? update(current.spacing) : update,
    }));
  }
  return {
    ...preferences,
    setFontSizes,
    setSpacing,
    resetFontSizes: () => setFontSizes(DEFAULT_RESUME_FONT_SIZES),
    resetSpacing: () => setSpacing(DEFAULT_RESUME_SPACING),
    resetLayout: () =>
      updatePreferences(() => ({
        fontSizes: DEFAULT_RESUME_FONT_SIZES,
        spacing: DEFAULT_RESUME_SPACING,
      })),
  };
}
