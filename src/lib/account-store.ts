import { cleanAccountData, mergeAccountData, type AccountData } from "@/lib/account-data";
import { db } from "@/lib/db";

type Row = { profile: unknown; clients: unknown; invoices: unknown; invoice_counter: number };

function fromRow(row: Row | undefined): AccountData {
  return cleanAccountData(
    row ? { profile: row.profile, clients: row.clients, invoices: row.invoices, counter: row.invoice_counter } : {},
  );
}

export async function readAccountData(userId: string): Promise<AccountData> {
  const sql = await db();
  const rows = await sql<Row[]>`SELECT profile, clients, invoices, invoice_counter FROM user_data WHERE user_id = ${userId}`;
  return fromRow(rows[0]);
}

/** Merges the browser's copy into the stored one in a single transaction and returns the result. */
export async function syncAccountData(userId: string, incoming: AccountData): Promise<AccountData> {
  const sql = await db();
  return sql.begin(async (tx) => {
    await tx`INSERT INTO user_data (user_id) VALUES (${userId}) ON CONFLICT (user_id) DO NOTHING`;
    const rows = await tx<Row[]>`
      SELECT profile, clients, invoices, invoice_counter FROM user_data WHERE user_id = ${userId} FOR UPDATE`;
    const merged = mergeAccountData(fromRow(rows[0]), incoming);
    await tx`
      UPDATE user_data SET
        profile = ${merged.profile ? tx.json(merged.profile as never) : null},
        clients = ${tx.json(merged.clients as never)},
        invoices = ${tx.json(merged.invoices as never)},
        invoice_counter = ${merged.counter},
        updated_at = now()
      WHERE user_id = ${userId}`;
    return merged;
  }) as Promise<AccountData>;
}
