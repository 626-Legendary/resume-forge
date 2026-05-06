import type { MetadataRoute } from "next";

import { siteDescription, siteName } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteName,
    short_name: siteName,
    description: siteDescription,
    start_url: "/",
    display: "standalone",
    background_color: "#07090c",
    theme_color: "#f97316",
    categories: ["productivity", "business", "developer tools"],
    icons: [
      {
        src: "/logo.png",
        sizes: "534x534",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/logo.png",
        sizes: "534x534",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
