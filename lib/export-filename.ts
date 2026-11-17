const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function filenamePart(value: string, fallback: string): string {
  const clean = value
    .normalize("NFKC")
    .replace(/[<>:"/\\|?*\u0000-\u001f\u007f]/g, " ")
    .trim()
    .replace(/[\s._]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 80);
  return clean || fallback;
}

export function createExportFilename(
  company: string,
  name: string,
  date = new Date(),
): string {
  return `${filenamePart(company, "Resume")}_${filenamePart(name, "Resume")}_${MONTHS[date.getMonth()]}_${String(date.getDate()).padStart(2, "0")}.pdf`;
}
