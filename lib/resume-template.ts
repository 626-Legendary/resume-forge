export const RESUME_TEMPLATE_OPTIONS = [
  {
    id: "engineer",
    label: "Engineer",
    description: "General software engineer resume template.",
  },
  {
    id: "engineer-intern",
    label: "Engineer Intern",
    description: "Intern-focused resume template.",
  },
] as const;

export type ResumeTemplateId =
  (typeof RESUME_TEMPLATE_OPTIONS)[number]["id"];

export const DEFAULT_RESUME_TEMPLATE_ID: ResumeTemplateId = "engineer";

export function isResumeTemplateId(
  value: unknown
): value is ResumeTemplateId {
  return RESUME_TEMPLATE_OPTIONS.some((option) => option.id === value);
}
