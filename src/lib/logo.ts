/** Prepare an optional FOP logo for invoice / localStorage (free tier).
 *  Preserves aspect ratio (horizontal wordmarks stay horizontal).
 *  No forced square crop — invoices look better with natural logos.
 */

const MAX_W = 640;
const MAX_H = 240;
const MAX_BYTES = 220_000;

export async function prepareLogo(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("not_image");
  }
  if (file.size > 8_000_000) {
    throw new Error("too_large");
  }

  const bitmap = await createImageBitmap(file);
  try {
    const scale = Math.min(1, MAX_W / bitmap.width, MAX_H / bitmap.height);
    const outW = Math.max(1, Math.round(bitmap.width * scale));
    const outH = Math.max(1, Math.round(bitmap.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = outW;
    canvas.height = outH;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("no_canvas");

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, outW, outH);
    ctx.drawImage(bitmap, 0, 0, outW, outH);

    let quality = 0.9;
    let dataUrl = canvas.toDataURL("image/jpeg", quality);
    while (dataUrl.length > MAX_BYTES && quality > 0.45) {
      quality -= 0.1;
      dataUrl = canvas.toDataURL("image/jpeg", quality);
    }
    if (dataUrl.length > MAX_BYTES) {
      throw new Error("compress_failed");
    }
    return dataUrl;
  } finally {
    bitmap.close();
  }
}

/** @deprecated Use prepareLogo — kept so old imports don't break mid-deploy. */
export async function cropLogoToSquare(file: File): Promise<string> {
  return prepareLogo(file);
}
