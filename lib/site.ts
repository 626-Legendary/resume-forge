const DEFAULT_SITE_URL = "https://resume-forge.vercel.app";

function normalizeSiteUrl(url: string) {
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  return `https://${url}`;
}

const resolvedSiteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
  process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim() ||
  DEFAULT_SITE_URL;

export const siteUrl = normalizeSiteUrl(resolvedSiteUrl);
export const siteName = "Resume Forge";
export const siteTitle = "Resume Forge";
export const siteDescription =
  "Resume Forge is a JSON-powered resume builder that turns structured resume data into clean, print-ready resumes.";
export const siteKeywords = [
  "resume builder",
  "JSON resume",
  "printable resume",
  "resume generator",
];
export const githubProfileUrl = "https://github.com/626-Legendary";
export const creatorName = "Zexiang Zhang";
