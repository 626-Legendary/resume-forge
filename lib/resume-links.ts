function markdownLink(value: string) {
  const match = /^\[([^\]\r\n]*)\]\(([\s\S]+)\)$/.exec(value.trim());
  return match ? { text: match[1].trim(), target: match[2].trim() } : undefined;
}

function googleWrapper(url: URL) {
  return (
    (url.hostname === "google.com" || url.hostname.endsWith(".google.com")) &&
    ["/search", "/url"].includes(url.pathname)
  );
}

/** Normalize link wrappers without requesting or visiting any URL. */
export function safeResumeUrl(value?: string): string | undefined {
  if (!value) return undefined;
  let candidate = value.trim();
  for (let depth = 0; depth < 5; depth++) {
    const markdown = markdownLink(candidate);
    if (markdown) candidate = markdown.target;
    if (candidate.startsWith("<") && candidate.endsWith(">"))
      candidate = candidate.slice(1, -1);
    try {
      const url = new URL(
        /^[a-z][a-z\d+.-]*:/i.test(candidate)
          ? candidate
          : candidate.startsWith("//")
            ? `https:${candidate}`
            : `https://${candidate}`,
      );
      if (!["https:", "http:", "mailto:", "tel:"].includes(url.protocol))
        return undefined;
      if (!googleWrapper(url)) return url.href;
      const target = url.searchParams.get("url") || url.searchParams.get("q");
      // A search phrase is not a profile URL: never turn it into a hostname.
      if (!target || !/^https?:\/\//i.test(target)) return undefined;
      candidate = target;
    } catch {
      return undefined;
    }
  }
  return undefined;
}

export function normalizeContactLink(content: string, explicitLink?: string) {
  const markdown = markdownLink(content);
  const link = safeResumeUrl(explicitLink?.trim() || markdown?.target);
  let text = markdown?.text ?? content.trim();
  // Occasionally AI puts the search wrapper in the display field as well.
  try {
    if (googleWrapper(new URL(text))) text = safeResumeUrl(text) || "";
  } catch {
    /* Display labels need not be URLs. */
  }
  if (!text) text = link || "";
  return text ? { content: text, ...(link ? { link } : {}) } : undefined;
}
