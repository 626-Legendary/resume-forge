"use client";

import { useSyncExternalStore } from "react";

import { parseStoredResumeExport, RESUME_STORAGE_KEY } from "@/lib/resume";
import type { ResumeTemplateId } from "@/lib/resume-template";
import type { ResumeData } from "@/types/resume";

export type StoredResumeExportState =
  | { status: "loading"; message: string }
  | { status: "error"; message: string }
  | {
      status: "ready";
      resumeData: ResumeData;
      templateId: ResumeTemplateId;
    };

const SERVER_RESUME_SNAPSHOT = "__resume_forge_server_snapshot__";

export function useStoredResumeExport(): StoredResumeExportState {
  const storedResumeJson = useSyncExternalStore(
    subscribeToResumeStorage,
    getStoredResumeJson,
    getServerStoredResumeJson
  );

  return getExportState(storedResumeJson);
}

function subscribeToResumeStorage(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  return () => window.removeEventListener("storage", onStoreChange);
}

function getStoredResumeJson() {
  return window.localStorage.getItem(RESUME_STORAGE_KEY);
}

function getServerStoredResumeJson() {
  return SERVER_RESUME_SNAPSHOT;
}

function getExportState(storedResumeJson: string | null): StoredResumeExportState {
  if (storedResumeJson === SERVER_RESUME_SNAPSHOT) {
    return { status: "loading", message: "Loading resume preview..." };
  }

  if (!storedResumeJson) {
    return {
      status: "error",
      message:
        "No resume data found. Please return to the builder and export again.",
    };
  }

  try {
    const storedResumeExport = parseStoredResumeExport(storedResumeJson);

    return {
      status: "ready",
      resumeData: storedResumeExport.resumeData,
      templateId: storedResumeExport.templateId,
    };
  } catch {
    return {
      status: "error",
      message:
        "Resume data is invalid. Please return to the builder and export again.",
    };
  }
}
