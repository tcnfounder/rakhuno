import postgres from "postgres";

/**
 * Postgres (Neon on Vercel, a local database in development). Accounts, sessions and
 * cloud copies of invoice data live here. Without DATABASE_URL, accounts are off and
 * the rest of the site keeps working.
 */

type Sql = ReturnType<typeof postgres>;

let client: Sql | null = null;
let schemaReady: Promise<void> | null = null;

export function hasDatabase() {
  return Boolean(process.env.DATABASE_URL);
}

function connect(): Sql {
  if (!client) {
    client = postgres(process.env.DATABASE_URL!, {
      // Neon's pooled URL goes through PgBouncer, which does not keep prepared statements.
      prepare: false,
      max: 3,
      idle_timeout: 20,
      connect_timeout: 10,
      // CREATE ... IF NOT EXISTS raises a NOTICE per existing table on every cold start.
      onnotice: () => {},
    });
  }
  return client;
}

const SCHEMA = `
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  last_login_at timestamptz
);
CREATE TABLE IF NOT EXISTS login_tokens (
  token_hash text PRIMARY KEY,
  email text NOT NULL,
  next_path text NOT NULL DEFAULT '/account',
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  used_at timestamptz
);
CREATE INDEX IF NOT EXISTS login_tokens_email_idx ON login_tokens (email, created_at);
CREATE TABLE IF NOT EXISTS sessions (
  token_hash text PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL
);
CREATE INDEX IF NOT EXISTS sessions_user_idx ON sessions (user_id);
CREATE TABLE IF NOT EXISTS user_data (
  user_id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  profile jsonb,
  clients jsonb NOT NULL DEFAULT '[]'::jsonb,
  invoices jsonb NOT NULL DEFAULT '[]'::jsonb,
  invoice_counter integer NOT NULL DEFAULT 1,
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS invoice_links (
  id text PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  invoice_key text NOT NULL,
  data jsonb NOT NULL,
  total numeric(14,2) NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  first_viewed_at timestamptz,
  last_viewed_at timestamptz,
  views integer NOT NULL DEFAULT 0,
  paid_at timestamptz,
  revoked_at timestamptz,
  UNIQUE (user_id, invoice_key)
);
CREATE INDEX IF NOT EXISTS invoice_links_user_idx ON invoice_links (user_id, created_at DESC);
`;

/** The database, with the schema created once per server instance. */
export async function db(): Promise<Sql> {
  const sql = connect();
  if (!schemaReady) {
    schemaReady = sql.unsafe(SCHEMA).then(
      () => undefined,
      (e) => {
        schemaReady = null;
        throw e;
      },
    );
  }
  await schemaReady;
  return sql;
}
