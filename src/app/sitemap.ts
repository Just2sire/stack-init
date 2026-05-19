import { MetadataRoute } from "next";
import { guides } from "@/lib/guides-manifest";

export default function sitemap(): MetadataRoute.Sitemap {
  const guideEntries: MetadataRoute.Sitemap = guides.map((g) => ({
    url: `https://stack-init-dev.vercel.app/guides/${g.slug}`,
    lastModified: new Date(g.date),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [
    {
      url: "https://stack-init-dev.vercel.app",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: "https://stack-init-dev.vercel.app/create",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: "https://stack-init-dev.vercel.app/guides",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    ...guideEntries,
  ];
}
