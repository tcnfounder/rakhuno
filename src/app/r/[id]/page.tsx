import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { SESSION_COOKIE, userForSessionToken } from "@/lib/auth";
import { hasDatabase } from "@/lib/db";
import { openInvoiceLink } from "@/lib/invoice-links";
import { SharedInvoice } from "./SharedInvoice";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Рахунок на оплату",
  robots: { index: false, follow: false },
};

export default async function SharedInvoicePage({ params }: { params: Promise<{ id: string }> }) {
  if (!hasDatabase()) notFound();
  const { id } = await params;
  const viewer = await userForSessionToken((await cookies()).get(SESSION_COOKIE)?.value);
  const link = await openInvoiceLink(id, viewer?.id ?? null);
  if (!link) notFound();
  return (
    <SharedInvoice
      id={link.id}
      data={link.data}
      paid={Boolean(link.paid_at)}
      isOwner={link.isOwner}
      views={link.views}
    />
  );
}
