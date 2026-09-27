/** Center-crop + compress a logo for invoice / localStorage (free tier). */

const MAX_EDGE = 480;
const MAX_BYTES = 180_000;

export async function cropLogoToSquare(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("not_image");
  }
  if (file.size > 8_000_000) {
    throw new Error("too_large");
  }

  const bitmap = await createImageBitmap(file);
  try {
    const side = Math.min(bitmap.width, bitmap.height);
    const sx = Math.floor((bitmap.width - side) / 2);
    const sy = Math.floor((bitmap.height - side) / 2);
    const out = Math.min(MAX_EDGE, side);

    const canvas = document.createElement("canvas");
    canvas.width = out;
    canvas.height = out;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("no_canvas");

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, out, out);
    ctx.drawImage(bitmap, sx, sy, side, side, 0, 0, out, out);

    let quality = 0.88;
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
