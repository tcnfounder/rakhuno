"use client";

import { trackEvent } from "@/lib/analytics";

type TemplateFile = {
  href: string;
  label: string;
  format: "docx" | "xlsx";
};

/** Free Word/Excel blanks — matches «бланк … скачати word/excel» intent, then nudges to /invoice. */
export function TemplateDownload({
  title,
  text,
  files,
}: {
  title: string;
  text: string;
  files: TemplateFile[];
}) {
  return (
    <aside className="not-prose my-8 rounded-2xl border border-line bg-ink-2/40 px-5 py-5">
      <p className="font-display text-lg text-paper">{title}</p>
      <p className="mt-1 text-sm text-mist">{text}</p>
      <div className="mt-4 flex flex-wrap gap-3">
        {files.map((f) => (
          <a
            key={f.href}
            href={f.href}
            download
            onClick={() =>
              trackEvent("template_download", { file_name: f.href, file_extension: f.format })
            }
            className="inline-flex rounded-full border border-signal px-4 py-2 text-sm font-semibold text-signal transition hover:bg-signal hover:text-ink"
          >
            ↓ {f.label}
          </a>
        ))}
      </div>
    </aside>
  );
}
