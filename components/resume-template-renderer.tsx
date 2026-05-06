import type { ComponentType } from "react";

import TemplateEngineer from "@/components/templateEngineer";
import TemplateEngineerIntern from "@/components/templateEngineerIntern";
import type { ResumeTemplateId } from "@/lib/resume-template";
import type { ResumeData } from "@/types/resume";

type ResumeTemplateRendererProps = {
  data: ResumeData;
  templateId: ResumeTemplateId;
};

const templates: Record<
  ResumeTemplateId,
  ComponentType<{ data: ResumeData }>
> = {
  engineer: TemplateEngineer,
  "engineer-intern": TemplateEngineerIntern,
};

const ResumeTemplateRenderer = ({
  data,
  templateId,
}: ResumeTemplateRendererProps) => {
  const Template = templates[templateId];
  return <Template data={data} />;
};

export default ResumeTemplateRenderer;
