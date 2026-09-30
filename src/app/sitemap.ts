import type { MetadataRoute } from "next";

type Entry = {
  path: string;
  priority: number;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  /** Stable content date — update when the page meaningfully changes */
  lastModified: string;
  images?: string[];
};

const entries: Entry[] = [
  { path: "", priority: 1, changeFrequency: "weekly", lastModified: "2026-09-30" },
  { path: "/invoice", priority: 0.95, changeFrequency: "weekly", lastModified: "2026-09-30" },
  { path: "/guides", priority: 0.9, changeFrequency: "weekly", lastModified: "2026-09-30" },
  {
    path: "/guides/rahunok-faktura",
    priority: 0.95,
    changeFrequency: "daily",
    lastModified: "2026-09-30",
    images: [
      "https://rakhuno.com/brand/sample-rakhunok-faktury.webp",
      "https://rakhuno.com/brand/sample-rakhunok-faktury-card.webp",
    ],
  },
  {
    path: "/guides/zrazok-rahunku-faktury",
    priority: 0.94,
    changeFrequency: "weekly",
    lastModified: "2026-09-30",
    images: [
      "https://rakhuno.com/brand/sample-rakhunok-faktury.webp",
      "https://rakhuno.com/brand/sample-rakhunok-na-oplatu-card.webp",
    ],
  },
  {
    path: "/guides/rakhunok-u-word",
    priority: 0.92,
    changeFrequency: "weekly",
    lastModified: "2026-09-30",
    images: ["https://rakhuno.com/brand/sample-rakhunok-faktury-card.webp"],
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
    lastModified: "2026-09-30",
    images: ["https://rakhuno.com/brand/sample-rakhunok-na-oplatu.webp"],
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
    ...(e.images?.length ? { images: e.images } : {}),
  }));
}
