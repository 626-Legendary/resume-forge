import {
  Document,
  Page,
  Text,
  Link,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import { buildResumeLines } from "@/lib/resume-content";
import type { ResumeData } from "@/types/resume";
import type { ResumeTemplateId } from "@/lib/resume-template";

// Preserve words and reading order in extracted PDF text.
Font.registerHyphenationCallback((word) => [word]);
const styles = StyleSheet.create({
  page: {
    padding: 36,
    fontFamily: "Helvetica",
    fontSize: 10,
    lineHeight: 1.35,
    color: "#111111",
  },
  name: {
    fontSize: 20,
    fontFamily: "Helvetica-Bold",
    textAlign: "center",
    marginBottom: 5,
  },
  contact: { fontSize: 9, textAlign: "center", marginBottom: 3 },
  section: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    borderBottomWidth: 0.7,
    paddingBottom: 3,
    marginTop: 10,
    marginBottom: 5,
  },
  heading: { fontFamily: "Helvetica-Bold", marginTop: 4, marginBottom: 2 },
  body: { marginBottom: 3 },
  bullet: { paddingLeft: 10, marginBottom: 3 },
  link: { color: "#111111", textDecoration: "none" },
});

// The built-in PDF font lacks arrow glyphs; preserve their meaning as ASCII.
function printableText(text: string) {
  return text.replace(/→/g, "->").replace(/←/g, "<-").replace(/↔/g, "<->");
}

export default function ResumePdfDocument({
  data,
  templateId,
}: {
  data: ResumeData;
  templateId: ResumeTemplateId;
}) {
  return (
    <Document
      title={`${data.basicInfo.name} Resume`}
      author={data.basicInfo.name}
      language="en-US"
    >
      <Page size="LETTER" style={styles.page} wrap>
        {buildResumeLines(data, templateId).map((line, index) => (
          <Text
            key={index}
            style={styles[line.kind]}
            orphans={2}
            widows={2}
            minPresenceAhead={
              line.kind === "section" ? 40 : line.kind === "heading" ? 24 : 0
            }
          >
            {line.link ? (
              <Link src={line.link} style={styles.link}>
                {printableText(line.text)}
              </Link>
            ) : (
              `${line.kind === "bullet" ? "• " : ""}${printableText(line.text)}`
            )}
          </Text>
        ))}
      </Page>
    </Document>
  );
}
