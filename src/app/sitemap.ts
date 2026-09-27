import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://rakhuno.com";
  return [
    { url: base, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${base}/invoice`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
  ];
}
