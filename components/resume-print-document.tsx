import ResumeTemplateRenderer from "@/components/resume-template-renderer";
import type { ResumeTemplateId } from "@/lib/resume-template";
import type { ResumeData } from "@/types/resume";

type ResumePrintDocumentProps = {
  data: ResumeData;
  templateId: ResumeTemplateId;
};

const ResumePrintDocument = ({
  data,
  templateId,
}: ResumePrintDocumentProps) => {
  return (
    <div className="resume-print-area">
      <ResumeTemplateRenderer data={data} templateId={templateId} />
    </div>
  );
};

export default ResumePrintDocument;
