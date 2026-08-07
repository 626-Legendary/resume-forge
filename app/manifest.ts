import type { MetadataRoute } from "next";

import { siteDescription, siteName, siteUrl } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteName,
    short_name: siteName,
    description: siteDescription,
    lang: "en-US",
    start_url: "/",
    scope: "/",
    id: "/",
    display: "standalone",
    display_override: ["window-controls-overlay", "standalone"],
    orientation: "portrait",
    background_color: "#07090c",
    theme_color: "#f97316",
    categories: ["productivity", "business", "developer tools"],
    icons: [
      {
        src: `${siteUrl}/logo.png`,
        sizes: "534x534",
        type: "image/png",
        purpose: "any",
      },
      {
        src: `${siteUrl}/logo.png`,
        sizes: "534x534",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
