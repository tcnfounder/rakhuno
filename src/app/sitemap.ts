import type { MetadataRoute } from "next";

type Entry = {
  path: string;
  priority: number;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  /** Stable content date — update when the page meaningfully changes */
  lastModified: string;
};

const entries: Entry[] = [
  { path: "", priority: 1, changeFrequency: "weekly", lastModified: "2026-09-29" },
  { path: "/invoice", priority: 0.95, changeFrequency: "weekly", lastModified: "2026-09-29" },
  { path: "/guides", priority: 0.9, changeFrequency: "weekly", lastModified: "2026-09-29" },
  {
    path: "/guides/rahunok-faktura",
    priority: 0.95,
    changeFrequency: "daily",
    lastModified: "2026-09-29",
  },
  {
    path: "/guides/zrazok-rahunku-faktury",
    priority: 0.94,
    changeFrequency: "weekly",
    lastModified: "2026-09-29",
  },
  {
    path: "/guides/vystavyty-rakhunok",
    priority: 0.94,
    changeFrequency: "weekly",
    lastModified: "2026-09-29",
  },
  {
    path: "/guides/rakhunok-na-oplatu",
    priority: 0.95,
    changeFrequency: "weekly",
    lastModified: "2026-09-29",
  },
  {
    path: "/guides/blank-rakhunku-faktury",
    priority: 0.93,
    changeFrequency: "weekly",
    lastModified: "2026-09-28",
  },
  {
    path: "/guides/fop-3-grupa",
    priority: 0.88,
    changeFrequency: "monthly",
    lastModified: "2026-09-27",
  },
  {
    path: "/guides/yedynyy-podatok",
    priority: 0.88,
    changeFrequency: "monthly",
    lastModified: "2026-09-27",
  },
  {
    path: "/guides/podatky-fop",
    priority: 0.86,
    changeFrequency: "monthly",
    lastModified: "2026-09-27",
  },
  {
    path: "/guides/rahunok-onlayn",
    priority: 0.9,
    changeFrequency: "weekly",
    lastModified: "2026-09-29",
  },
  { path: "/privacy", priority: 0.3, changeFrequency: "yearly", lastModified: "2026-09-20" },
  { path: "/terms", priority: 0.3, changeFrequency: "yearly", lastModified: "2026-09-20" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://rakhuno.com";
  return entries.map((e) => ({
    // Homepage with trailing slash to match Google canonical / IndexNow list.
    url: e.path === "" ? `${base}/` : `${base}${e.path}`,
    lastModified: new Date(e.lastModified),
    changeFrequency: e.changeFrequency,
    priority: e.priority,
  }));
}
