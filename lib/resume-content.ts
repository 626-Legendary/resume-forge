import type { Experience, ResumeData } from "@/types/resume";
import type { ResumeTemplateId } from "@/lib/resume-template";
import { safeResumeUrl } from "@/lib/resume-links";
export { safeResumeUrl } from "@/lib/resume-links";

export type ResumeInline = { text: string; link?: string };

export type ResumeLine = {
  text: string;
  kind: "name" | "contact" | "section" | "heading" | "body" | "bullet";
  link?: string;
  parts?: ResumeInline[];
  label?: string;
  experience?: Pick<Experience, "company" | "location" | "title" | "date">;
};

export function buildResumeLines(
  data: ResumeData,
  template: ResumeTemplateId,
): ResumeLine[] {
  const lines: ResumeLine[] = [];
  const add = (
    text: string | undefined,
    kind: ResumeLine["kind"] = "body",
    link?: string,
  ) => {
    if (text)
      lines.push({
        text,
        kind,
        ...(safeResumeUrl(link) ? { link: safeResumeUrl(link) } : {}),
      });
  };
  const join = (items: (string | undefined)[]) =>
    items.filter(Boolean).join(" | ");
  const bullets = (items?: string[]) =>
    items?.forEach((text) => add(text, "bullet"));
  const addContactRow = (parts: ResumeInline[]) => {
    if (parts.length)
      lines.push({
        text: parts.map((part) => part.text).join(" | "),
        kind: "contact",
        parts,
      });
  };
  add(data.basicInfo.name, "name");
  const contact = data.basicInfo.contact;
  add(join([contact?.tel, contact?.email, contact?.location]), "contact");
  const profileParts: ResumeInline[] = [];
  const otherContactLines: ResumeInline[] = [];
  Object.entries(contact?.extra ?? {}).forEach(([key, item]) => {
    const text = (typeof item === "string" ? item : item.content).trim();
    if (!text) return;
    const link = safeResumeUrl(
      typeof item === "string" ? undefined : item.link,
    );
    const part = { text, ...(link ? { link } : {}) };
    if (
      link ||
      ["linkedin", "github", "portfolio", "website"].includes(key.toLowerCase())
    ) {
      profileParts.push(part);
    } else {
      otherContactLines.push(part);
    }
  });
  addContactRow(profileParts);
  otherContactLines.forEach((part) => add(part.text, "contact"));
  if (data.summary) {
    add("Summary", "section");
    add(data.summary);
  }
  const skills = () => {
    if (!data.skills || !Object.keys(data.skills).length) return;
    add("Skills", "section");
    Object.entries(data.skills).forEach(([category, values]) => {
      lines.push({
        text: `${category}: ${values.join(", ")}`,
        kind: "body",
        label: `${category}:`,
      });
    });
  };
  const experience = () => {
    if (!data.experiences?.length) return;
    add("Experience", "section");
    data.experiences.forEach((item) => {
      const companyLine = [item.company, item.location]
        .filter(Boolean)
        .join(" - ");
      const roleLine = join([item.title, item.date]);
      const text = [companyLine, roleLine].filter(Boolean).join("\n");
      if (text)
        lines.push({
          text,
          kind: "heading",
          experience: {
            company: item.company,
            location: item.location,
            title: item.title,
            date: item.date,
          },
        });
      bullets(item.description);
    });
  };
  const projects = () => {
    if (!data.projects?.length) return;
    add("Projects", "section");
    data.projects.forEach((item) => {
      add(join([item.name, item.date]), "heading", item.url);
      add(item.tools?.join(", "));
      add(item.url, "body", item.url);
      bullets(item.description);
    });
  };
  const education = () => {
    if (!data.education?.length) return;
    add("Education", "section");
    data.education.forEach((item) => {
      add(item.school, "heading");
      add(
        join([
          [item.degree, item.major].filter(Boolean).join(" in "),
          item.location,
          item.date ||
            (item.startDate
              ? `${item.startDate} - ${item.endDate || "Present"}`
              : item.endDate),
        ]),
      );
      if (item.gpa) add(`GPA: ${item.gpa}`);
      if (item.honors?.length) add(`Honors: ${item.honors.join(", ")}`);
      bullets(item.description);
    });
  };
  if (template === "engineer-intern") {
    education();
    skills();
    experience();
    projects();
  } else {
    skills();
    experience();
    projects();
    education();
  }
  if (data.certifications?.length) {
    add("Certifications", "section");
    data.certifications.forEach((item) =>
      add(
        join([
          item.name,
          item.issuer,
          item.date,
          item.expirationDate ? `Expires: ${item.expirationDate}` : undefined,
          item.credentialId ? `Credential ID: ${item.credentialId}` : undefined,
        ]),
        "body",
        item.url,
      ),
    );
  }
  return lines;
}
