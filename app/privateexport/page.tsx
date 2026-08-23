import type { Metadata } from "next";

import ExportResumeView from "./resume-view";

export const metadata: Metadata = {
  title: "Export Preview",
  description:
    "Resume Forge export preview for printing or saving a resume as PDF.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ExportPage() {
  return <ExportResumeView />;
}
