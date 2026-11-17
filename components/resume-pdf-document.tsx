import {
  Document,
  Page,
  Text,
  View,
  Link,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import { buildResumeLines } from "@/lib/resume-content";
import type { ResumeData } from "@/types/resume";
import type { ResumeTemplateId } from "@/lib/resume-template";
import {
  normalizeResumeFontSizes,
  type ResumeFontSizes,
} from "@/lib/resume-typography";
import {
  normalizeResumeSpacing,
  type ResumeSpacing,
} from "@/lib/resume-spacing";

// Preserve words and reading order in extracted PDF text.
Font.registerHyphenationCallback((word) => [word]);
function createStyles(spacing: ResumeSpacing) {
  return StyleSheet.create({
    page: {
      padding: 36,
      fontFamily: "Helvetica",
      lineHeight: spacing.lineHeight,
      color: "#111111",
    },
    name: {
      fontFamily: "Helvetica-Bold",
      textAlign: "center",
      marginBottom: spacing.paragraph + 2,
    },
    contact: { textAlign: "center", marginBottom: spacing.paragraph },
    section: {
      fontFamily: "Helvetica-Bold",
      borderBottomWidth: 0.7,
      paddingBottom: 3,
      marginTop: spacing.section,
      marginBottom: spacing.paragraph + 2,
    },
    heading: {
      fontFamily: "Helvetica-Bold",
      marginTop: spacing.paragraph + 1,
      marginBottom: (spacing.paragraph * 2) / 3,
    },
    body: { marginBottom: spacing.paragraph },
    bullet: { paddingLeft: 10, marginBottom: spacing.paragraph },
    experienceRole: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      columnGap: 12,
      marginBottom: spacing.paragraph,
    },
    experienceTitle: { flexGrow: 1, flexShrink: 1, flexBasis: 0 },
    experienceDate: { maxWidth: "40%", flexShrink: 0, textAlign: "right" },
    skillLabel: { fontFamily: "Helvetica-Bold" },
    link: { color: "#111111", textDecoration: "none" },
  });
}

// The built-in PDF font lacks arrow glyphs; preserve their meaning as ASCII.
function printableText(text: string) {
  return text.replace(/→/g, "->").replace(/←/g, "<-").replace(/↔/g, "<->");
}

export default function ResumePdfDocument({
  data,
  templateId,
  fontSizes,
  spacing,
}: {
  data: ResumeData;
  templateId: ResumeTemplateId;
  fontSizes?: ResumeFontSizes;
  spacing?: ResumeSpacing;
}) {
  const sizes = normalizeResumeFontSizes(fontSizes);
  const styles = createStyles(normalizeResumeSpacing(spacing));
  return (
    <Document
      title={`${data.basicInfo.name} Resume`}
      author={data.basicInfo.name}
      language="en-US"
    >
      <Page size="LETTER" style={[styles.page, { fontSize: sizes.body }]} wrap>
        {buildResumeLines(data, templateId).map((line, index) =>
          line.experience ? (
            <View key={index} wrap={false} minPresenceAhead={sizes.body * 2.4}>
              {(line.experience.company || line.experience.location) && (
                <Text style={[styles.heading, { fontSize: sizes.body }]}>
                  {printableText(
                    [line.experience.company, line.experience.location]
                      .filter(Boolean)
                      .join(" - "),
                  )}
                </Text>
              )}
              {(line.experience.title || line.experience.date) && (
                <View style={styles.experienceRole}>
                  <Text
                    style={[styles.experienceTitle, { fontSize: sizes.body }]}
                  >
                    {printableText(line.experience.title)}
                  </Text>
                  {line.experience.date && (
                    <Text
                      style={[styles.experienceDate, { fontSize: sizes.body }]}
                    >
                      {printableText(line.experience.date)}
                    </Text>
                  )}
                </View>
              )}
            </View>
          ) : (
            <Text
              key={index}
              style={[
                styles[line.kind],
                {
                  fontSize:
                    line.kind === "name"
                      ? sizes.name
                      : line.kind === "section"
                        ? sizes.section
                        : sizes.body,
                },
              ]}
              orphans={2}
              widows={2}
              minPresenceAhead={
                line.kind === "section"
                  ? sizes.body * 4
                  : line.kind === "heading"
                    ? sizes.body * 2.4
                    : 0
              }
            >
              {line.label ? (
                <>
                  <Text style={styles.skillLabel}>
                    {printableText(line.label)}
                  </Text>
                  {printableText(line.text.slice(line.label.length))}
                </>
              ) : line.parts ? (
                line.parts.map((part, partIndex) => (
                  <Text key={partIndex}>
                    {partIndex > 0 ? " | " : ""}
                    {part.link ? (
                      <Link src={part.link} style={styles.link}>
                        {printableText(part.text)}
                      </Link>
                    ) : (
                      printableText(part.text)
                    )}
                  </Text>
                ))
              ) : line.link ? (
                <Link src={line.link} style={styles.link}>
                  {printableText(line.text)}
                </Link>
              ) : (
                `${line.kind === "bullet" ? "• " : ""}${printableText(line.text)}`
              )}
            </Text>
          ),
        )}
      </Page>
    </Document>
  );
}
