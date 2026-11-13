"use client";

import { trackEvent } from "@/lib/analytics";

/** One Word/Excel download button with the same template_download event as TemplateDownload. */
export function BlankDownloadLink({ href, format }: { href: string; format: "docx" | "xlsx" }) {
  return (
    <a
      href={href}
      download
      onClick={() => trackEvent("template_download", { file_name: href, file_extension: format })}
      className="inline-flex items-center rounded-full border border-signal px-4 py-2 text-sm font-semibold text-signal transition hover:bg-signal hover:text-ink"
    >
      ↓ {format === "docx" ? "Word" : "Excel"}
    </a>
  );
}
