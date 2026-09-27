import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://rakhuno.com";
  const paths = [
    "",
    "/invoice",
    "/guides",
    "/guides/rahunok-faktura",
    "/guides/fop-3-grupa",
    "/guides/yedynyy-podatok",
    "/guides/podatky-fop",
    "/guides/rahunok-onlayn",
  ];
  return paths.map((path, i) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: path.startsWith("/guides") ? "weekly" : "weekly",
    priority: path === "" ? 1 : path === "/invoice" ? 0.9 : 0.7 - i * 0.01,
  }));
}
