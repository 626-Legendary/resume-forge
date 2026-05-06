import defaultResumeJsonSource from "@/constants/default.json";
import mockResumeJsonSource from "@/constants/mockData.json";
import {
  DEFAULT_RESUME_TEMPLATE_ID,
  isResumeTemplateId,
  type ResumeTemplateId,
} from "@/lib/resume-template";
import type {
  Certification,
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
};

export function stringifyResumeJson(input: unknown): string {
  return JSON.stringify(input, null, 2);
}

export function parseResumeJson(jsonInput: string): ResumeData {
  return normalizeResumeData(JSON.parse(jsonInput));
}

export function normalizeResumeData(input: unknown): ResumeData {
  const source = toRecord(input);
  const basicInfo = toRecord(source.basicInfo);
  const contact = toRecord(basicInfo.contact);

  return {
    basicInfo: {
      name: toText(basicInfo.name),
      contact: {
        tel: toText(contact.tel),
        email: toText(contact.email),
        location: toText(contact.location),
        linkedIn: toOptionalText(contact.linkedIn),
        github: toOptionalText(contact.github),
        portfolio: toOptionalText(contact.portfolio),
        website: toOptionalText(contact.website),
        extra: toOptionalText(contact.extra),
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
  templateId: ResumeTemplateId
): StoredResumeExport {
  return {
    resumeData,
    templateId,
  };
}

export function parseStoredResumeExport(
  storedResumeJson: string
): StoredResumeExport {
  const parsed = JSON.parse(storedResumeJson);
  const source = toRecord(parsed);

  if ("resumeData" in source) {
    return {
      resumeData: normalizeResumeData(source.resumeData),
      templateId: isResumeTemplateId(source.templateId)
        ? source.templateId
        : DEFAULT_RESUME_TEMPLATE_ID,
    };
  }

  return {
    resumeData: normalizeResumeData(parsed),
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
        Boolean(experience.description?.length)
    );

  return experiences.length > 0 ? experiences : undefined;
}

function normalizeProjects(value: unknown): Project[] | undefined {
  const projects = toRecordArray(value)
    .map((project) => ({
      name: toText(project.name),
      tools: toOptionalStringArray(project.tools),
      date: toOptionalText(project.date),
      url: toOptionalText(project.url),
      description: toOptionalStringArray(project.description),
    }))
    .filter(
      (project) =>
        Boolean(project.name) ||
        Boolean(project.url) ||
        Boolean(project.date) ||
        Boolean(project.tools?.length) ||
        Boolean(project.description?.length)
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
        Boolean(item.description?.length)
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
      url: toOptionalText(item.url),
    }))
    .filter(
      (item) =>
        Boolean(item.name) ||
        Boolean(item.issuer) ||
        Boolean(item.date) ||
        Boolean(item.expirationDate) ||
        Boolean(item.credentialId) ||
        Boolean(item.url)
    );

  return certifications.length > 0 ? certifications : undefined;
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
