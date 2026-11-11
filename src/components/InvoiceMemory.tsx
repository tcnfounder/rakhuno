"use client";

import { formatDateUk, formatUah } from "@/lib/invoice";
import type { SavedClient, SavedInvoice } from "@/lib/history";

const chip =
  "max-w-full truncate rounded-full border border-white/15 px-3 py-1.5 text-sm text-mist transition hover:border-signal hover:text-signal";

/** Recent clients as one-tap chips. Renders nothing until the first invoice is saved. */
export function ClientChips({
  clients,
  activeName,
  onPick,
  className = "",
}: {
  clients: SavedClient[];
  activeName: string;
  onPick: (client: SavedClient) => void;
  className?: string;
}) {
  if (!clients.length) return null;
  const active = activeName.trim().toLowerCase();
  return (
    <div className={className}>
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-mist">Ваші клієнти</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {clients.slice(0, 8).map((client) => {
          const isActive = client.name.trim().toLowerCase() === active;
          return (
            <button
              key={client.id}
              type="button"
              onClick={() => onPick(client)}
              aria-pressed={isActive}
              title={[client.name, client.taxId].filter(Boolean).join(" · ")}
              className={`${chip} ${isActive ? "border-signal text-signal" : ""}`}
            >
              {client.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** Last invoices with a «Повторити» action that copies client, lines and terms into a new number. */
export function RecentInvoices({
  history,
  onRepeat,
  limit = 6,
  className = "",
}: {
  history: SavedInvoice[];
  onRepeat: (invoice: SavedInvoice) => void;
  limit?: number;
  className?: string;
}) {
  if (!history.length) return null;
  return (
    <section className={className}>
      <p className="font-display text-sm uppercase tracking-[0.18em] text-signal">
        Останні рахунки
      </p>
      <p className="mt-1 text-sm text-mist">
        Зберігаються лише у вашому браузері. «Повторити» — той самий клієнт і позиції з новим номером.
      </p>
      <ul className="mt-3 divide-y divide-white/10 rounded-xl border border-white/10 bg-ink-2/60">
        {history.slice(0, limit).map((invoice) => (
          <li key={invoice.id} className="flex items-center gap-3 px-3 py-2.5">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-paper">
                № {invoice.number || "—"} · {invoice.buyerName || "Без клієнта"}
              </p>
              <p className="text-xs text-mist">
                {formatDateUk(invoice.date)} · {formatUah(invoice.total)}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onRepeat(invoice)}
              className="shrink-0 rounded-full border border-signal/60 px-3 py-1.5 text-sm font-semibold text-signal transition hover:bg-signal hover:text-ink"
            >
              Повторити
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
