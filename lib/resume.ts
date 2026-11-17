import defaultResumeJsonSource from "@/constants/default.json";
import mockResumeJsonSource from "@/constants/mockData.json";
import { normalizeContactLink, safeResumeUrl } from "@/lib/resume-links";
import {
  DEFAULT_RESUME_SPACING,
  normalizeResumeSpacing,
  type ResumeSpacing,
} from "@/lib/resume-spacing";
import {
  DEFAULT_RESUME_FONT_SIZES,
  normalizeResumeFontSizes,
  type ResumeFontSizes,
} from "@/lib/resume-typography";
import {
  DEFAULT_RESUME_TEMPLATE_ID,
  isResumeTemplateId,
  type ResumeTemplateId,
} from "@/lib/resume-template";
import type {
  Certification,
  ContactExtraEntry,
  Education,
  Experience,
  Project,
  ResumeData,
  SkillsByCategory,
} from "@/types/resume";

export const RESUME_STORAGE_KEY = "resume-forge-data";

export const defaultResumeJson: ResumeData = defaultResumeJsonSource;
export const mockResumeJson: ResumeData = mockResumeJsonSource;

export type StoredResumeExport = {
  resumeData: ResumeData;
  templateId: ResumeTemplateId;
  fontSizes: ResumeFontSizes;
  spacing: ResumeSpacing;
};

export function stringifyResumeJson(input: unknown): string {
  return JSON.stringify(input, null, 2);
}

export function parseResumeJson(jsonInput: string): ResumeData {
  const input = jsonInput.trim();
  const fenced = /^```(?:json)?\s*\n([\s\S]*?)\n\s*```$/i.exec(input);
  return normalizeResumeData(JSON.parse(fenced ? fenced[1] : input));
}

export function normalizeResumeData(input: unknown): ResumeData {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new Error("Resume JSON must be an object with basicInfo.name.");
  }
  const source = toRecord(input);
  const basicInfo = toRecord(source.basicInfo);
  if (typeof basicInfo.name !== "string" || !basicInfo.name.trim()) {
    throw new Error("Please provide a non-empty basicInfo.name.");
  }
  const contact = toRecord(basicInfo.contact);

  return {
    basicInfo: {
      name: toText(basicInfo.name),
      "company-name": toText(basicInfo["company-name"]),
      contact: {
        tel: toText(contact.tel),
        email: toText(contact.email),
        location: toText(contact.location),
        extra: normalizeContactExtra(contact.extra),
      },
    },
    summary: toOptionalText(source.summary),
    skills: normalizeSkills(source.skills),
    experiences: normalizeExperiences(source.experiences),
    projects: normalizeProjects(source.projects),
    education: normalizeEducation(source.education),
    certifications: normalizeCertifications(source.certifications),
  };
}

export function createStoredResumeExport(
  resumeData: ResumeData,
  templateId: ResumeTemplateId,
  fontSizes: ResumeFontSizes = DEFAULT_RESUME_FONT_SIZES,
  spacing: ResumeSpacing = DEFAULT_RESUME_SPACING,
): StoredResumeExport {
  return {
    resumeData,
    templateId,
    fontSizes: normalizeResumeFontSizes(fontSizes),
    spacing: normalizeResumeSpacing(spacing),
  };
}

export function parseStoredResumeExport(
  storedResumeJson: string,
): StoredResumeExport {
  const parsed = JSON.parse(storedResumeJson);
  const source = toRecord(parsed);

  if ("resumeData" in source) {
    const resumeData = normalizeResumeData(source.resumeData);
    // Migrate 1.0.4 metadata only when the JSON has no explicit company field.
    if (!("company-name" in toRecord(toRecord(source.resumeData).basicInfo))) {
      resumeData.basicInfo["company-name"] = toText(source.companyName);
    }
    return {
      resumeData,
      fontSizes: normalizeResumeFontSizes(source.fontSizes),
      spacing: normalizeResumeSpacing(source.spacing),
      templateId: isResumeTemplateId(source.templateId)
        ? source.templateId
        : DEFAULT_RESUME_TEMPLATE_ID,
    };
  }

  return {
    resumeData: normalizeResumeData(parsed),
    fontSizes: normalizeResumeFontSizes(undefined),
    spacing: normalizeResumeSpacing(undefined),
    templateId: DEFAULT_RESUME_TEMPLATE_ID,
  };
}

function normalizeSkills(value: unknown): SkillsByCategory | undefined {
  const skills = toRecord(value);
  const entries = Object.entries(skills)
    .map(([category, items]) => [category, toStringArray(items)] as const)
    .filter(([, items]) => items.length > 0);

  if (entries.length === 0) {
    return undefined;
  }

  return Object.fromEntries(entries);
}

function normalizeExperiences(value: unknown): Experience[] | undefined {
  const experiences = toRecordArray(value)
    .map((experience) => ({
      company: toText(experience.company),
      title: toText(experience.title),
      location: toOptionalText(experience.location),
      date: toOptionalText(experience.date),
      description: toOptionalStringArray(experience.description),
    }))
    .filter(
      (experience) =>
        Boolean(experience.company) ||
        Boolean(experience.title) ||
        Boolean(experience.location) ||
        Boolean(experience.date) ||
        Boolean(experience.description?.length),
    );

  return experiences.length > 0 ? experiences : undefined;
}

function normalizeProjects(value: unknown): Project[] | undefined {
  const projects = toRecordArray(value)
    .map((project) => ({
      name: toText(project.name),
      tools: toOptionalStringArray(project.tools),
      date: toOptionalText(project.date),
      url: safeResumeUrl(toOptionalText(project.url)),
      description: toOptionalStringArray(project.description),
    }))
    .filter(
      (project) =>
        Boolean(project.name) ||
        Boolean(project.url) ||
        Boolean(project.date) ||
        Boolean(project.tools?.length) ||
        Boolean(project.description?.length),
    );

  return projects.length > 0 ? projects : undefined;
}

function normalizeEducation(value: unknown): Education[] | undefined {
  const education = toRecordArray(value)
    .map((item) => ({
      school: toText(item.school),
      degree: toOptionalText(item.degree),
      major: toOptionalText(item.major),
      location: toOptionalText(item.location),
      date: toOptionalText(item.date),
      startDate: toOptionalText(item.startDate),
      endDate: toOptionalText(item.endDate),
      gpa: toOptionalText(item.gpa),
      honors: toOptionalStringArray(item.honors),
      description: toOptionalStringArray(item.description),
    }))
    .filter(
      (item) =>
        Boolean(item.school) ||
        Boolean(item.degree) ||
        Boolean(item.major) ||
        Boolean(item.location) ||
        Boolean(item.date) ||
        Boolean(item.startDate) ||
        Boolean(item.endDate) ||
        Boolean(item.gpa) ||
        Boolean(item.honors?.length) ||
        Boolean(item.description?.length),
    );

  return education.length > 0 ? education : undefined;
}

function normalizeCertifications(value: unknown): Certification[] | undefined {
  const certifications = toRecordArray(value)
    .map((item) => ({
      name: toText(item.name),
      issuer: toOptionalText(item.issuer),
      date: toOptionalText(item.date),
      expirationDate: toOptionalText(item.expirationDate),
      credentialId: toOptionalText(item.credentialId),
      url: safeResumeUrl(toOptionalText(item.url)),
    }))
    .filter(
      (item) =>
        Boolean(item.name) ||
        Boolean(item.issuer) ||
        Boolean(item.date) ||
        Boolean(item.expirationDate) ||
        Boolean(item.credentialId) ||
        Boolean(item.url),
    );

  return certifications.length > 0 ? certifications : undefined;
}

function normalizeContactExtra(
  value: unknown,
): Record<string, ContactExtraEntry> | undefined {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return undefined;
  }

  const source = toRecord(value);
  const normalizedEntries: Array<[string, ContactExtraEntry]> = Object.entries(
    source,
  )
    .map(([key, entryValue]) => {
      const normalizedEntry = normalizeContactExtraEntry(entryValue);

      return normalizedEntry ? ([key, normalizedEntry] as const) : null;
    })
    .filter((entry): entry is [string, ContactExtraEntry] => entry !== null);

  if (normalizedEntries.length === 0) {
    return undefined;
  }

  return Object.fromEntries(normalizedEntries);
}

function normalizeContactExtraEntry(
  value: unknown,
): ContactExtraEntry | undefined {
  if (typeof value === "string") {
    return normalizeContactLink(value);
  }

  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return undefined;
  }

  const source = toRecord(value);
  const content =
    toOptionalText(source.content) ??
    toOptionalText(source.text) ??
    toOptionalText(source.value) ??
    toOptionalText(source.label);

  if (!content) {
    return undefined;
  }

  const link =
    toOptionalText(source.link) ??
    toOptionalText(source.href) ??
    toOptionalText(source.url);

  return normalizeContactLink(content, link);
}

function toRecord(value: unknown): Record<string, unknown> {
  if (typeof value === "object" && value !== null && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }

  return {};
}

function toRecordArray(value: unknown): Record<string, unknown>[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map(toRecord);
}

function toText(value: unknown): string {
  if (typeof value === "string") {
    return value.trim();
  }

  if (typeof value === "number") {
    return String(value);
  }

  return "";
}

function toOptionalText(value: unknown): string | undefined {
  const text = toText(value);
  return text ? text : undefined;
}

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map(toText).filter(Boolean);
}

function toOptionalStringArray(value: unknown): string[] | undefined {
  const items = toStringArray(value);
  return items.length > 0 ? items : undefined;
}
