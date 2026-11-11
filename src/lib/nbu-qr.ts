import QRCode from "qrcode";

/**
 * NBU payment QR, data format 002 (NBU Resolution №97 of 19.08.2025, annex 3).
 * 002 is the version Ukrainian bank apps read today; 003 support is not confirmed yet.
 *
 * The QR holds a link: https://bank.gov.ua/qr/ + Base64URL (no padding) of 13 LF-separated
 * elements, UTF-8. Rules: version 10–17, error correction M (L is not allowed), encoded part
 * ≤ 475 characters, hryvnia sign in a white circle in the centre.
 */

const BASE_URL = "https://bank.gov.ua/qr/";
const MAX_ENCODED = 475;
const MAX_NAME = 70;
const MAX_PURPOSE = 140;

export type NbuPayment = {
  name: string;
  iban: string;
  taxId: string;
  amount: number;
  purpose: string;
};

const cleanIban = (raw: string) => raw.replace(/\s+/g, "").toUpperCase();
const oneLine = (raw: string) => raw.replace(/\s+/g, " ").trim();

/** Null when the invoice lacks something the bank app needs. */
export function toNbuPayment(input: NbuPayment): NbuPayment | null {
  const iban = cleanIban(input.iban);
  const taxId = input.taxId.replace(/\D/g, "");
  const name = oneLine(input.name).slice(0, MAX_NAME);
  const purpose = oneLine(input.purpose).slice(0, MAX_PURPOSE);
  if (!name || !purpose) return null;
  if (!/^UA\d{27}$/.test(iban)) return null;
  if (taxId.length !== 8 && taxId.length !== 10) return null;
  if (!(input.amount > 0) || input.amount >= 1e9) return null;
  return { name, iban, taxId, amount: input.amount, purpose };
}

/** «UAH3» for whole sums, otherwise exactly two decimals: «UAH576.45». */
export function formatNbuAmount(amount: number) {
  const cents = Math.round(amount * 100);
  return cents % 100 === 0 ? `UAH${cents / 100}` : `UAH${(cents / 100).toFixed(2)}`;
}

export function buildNbuPayload(p: NbuPayment) {
  return [
    "BCD", // service tag
    "002", // format version
    "1", // encoding: UTF-8
    "UCT", // function
    "", // BIC (reserved)
    p.name,
    p.iban,
    formatNbuAmount(p.amount),
    p.taxId,
    "", // purpose code (reserved)
    "", // reference (reserved)
    p.purpose,
    "", // display (reserved)
  ].join("\n");
}

function base64Url(text: string) {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function buildNbuLink(p: NbuPayment): string | null {
  const encoded = base64Url(buildNbuPayload(p));
  if (encoded.length > MAX_ENCODED) return null;
  return BASE_URL + encoded;
}

/** PNG data URL of the QR with the hryvnia sign in a white circle, or null if it cannot be built. */
export async function renderNbuQr(link: string, size = 480): Promise<string | null> {
  if (typeof document === "undefined") return null;
  const canvas = document.createElement("canvas");
  // The rules allow versions 10–17 only: take the smallest one the link fits into.
  let drawn = false;
  for (let version = 10; version <= 17 && !drawn; version++) {
    try {
      await QRCode.toCanvas(canvas, link, {
        errorCorrectionLevel: "M",
        version,
        margin: 2,
        width: size,
        color: { dark: "#000000", light: "#ffffff" },
      });
      drawn = true;
    } catch {
      /* too long for this version */
    }
  }
  if (!drawn) return null;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  const c = canvas.width / 2;
  // Small enough for level M to recover the covered modules (checked by decoding in tests).
  const r = canvas.width * 0.085;
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(c, c, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#000000";
  ctx.font = `bold ${Math.round(r * 1.35)}px Arial, Helvetica, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("₴", c, c + r * 0.06);
  return canvas.toDataURL("image/png");
}
