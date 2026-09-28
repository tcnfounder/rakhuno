import { getCloudflareContext } from "@opennextjs/cloudflare";

/** Brevo free tier: transactional scheduledAt max ~3 days ahead. */
export const BREVO_MAX_SCHEDULE_DAYS = 3;
export const DAY_MS = 24 * 60 * 60 * 1000;

export type LeadsKv = {
  put: (key: string, value: string) => Promise<void>;
};

export type WorkerEnv = {
  LEADS?: LeadsKv;
  BREVO_API_KEY?: string;
  BREVO_LIST_ID?: string;
  BREVO_WELCOME_TEMPLATE_ID?: string;
  BREVO_DAY3_TEMPLATE_ID?: string;
  BREVO_DAY7_TEMPLATE_ID?: string;
  CRON_SECRET?: string;
};

export async function getWorkerEnv(): Promise<WorkerEnv> {
  const fromProcess: WorkerEnv = {
    BREVO_API_KEY: process.env.BREVO_API_KEY,
    BREVO_LIST_ID: process.env.BREVO_LIST_ID,
    BREVO_WELCOME_TEMPLATE_ID: process.env.BREVO_WELCOME_TEMPLATE_ID,
    BREVO_DAY3_TEMPLATE_ID: process.env.BREVO_DAY3_TEMPLATE_ID,
    BREVO_DAY7_TEMPLATE_ID: process.env.BREVO_DAY7_TEMPLATE_ID,
    CRON_SECRET: process.env.CRON_SECRET,
  };
  try {
    const { env } = await getCloudflareContext({ async: true });
    const cf = env as WorkerEnv;
    return {
      LEADS: cf.LEADS,
      BREVO_API_KEY: cf.BREVO_API_KEY || fromProcess.BREVO_API_KEY,
      BREVO_LIST_ID: cf.BREVO_LIST_ID || fromProcess.BREVO_LIST_ID,
      BREVO_WELCOME_TEMPLATE_ID:
        cf.BREVO_WELCOME_TEMPLATE_ID || fromProcess.BREVO_WELCOME_TEMPLATE_ID,
      BREVO_DAY3_TEMPLATE_ID:
        cf.BREVO_DAY3_TEMPLATE_ID || fromProcess.BREVO_DAY3_TEMPLATE_ID,
      BREVO_DAY7_TEMPLATE_ID:
        cf.BREVO_DAY7_TEMPLATE_ID || fromProcess.BREVO_DAY7_TEMPLATE_ID,
      CRON_SECRET: cf.CRON_SECRET || fromProcess.CRON_SECRET,
    };
  } catch {
    return fromProcess;
  }
}

export function scheduledAtDaysFromNow(days: number) {
  return new Date(Date.now() + days * DAY_MS).toISOString();
}

export async function sendTransactionalTemplate(
  email: string,
  env: WorkerEnv,
  opts: {
    templateId: number;
    tags: string[];
    scheduledAt?: string;
    logLabel: string;
  },
) {
  if (!env.BREVO_API_KEY) return "skipped";
  if (!Number.isFinite(opts.templateId) || opts.templateId <= 0) {
    return "bad_template";
  }

  try {
    const body: Record<string, unknown> = {
      to: [{ email }],
      templateId: opts.templateId,
      tags: opts.tags,
    };
    if (opts.scheduledAt) body.scheduledAt = opts.scheduledAt;

    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        "api-key": env.BREVO_API_KEY,
      },
      body: JSON.stringify(body),
    });
    if (res.ok) return opts.scheduledAt ? "scheduled" : "sent";
    const text = await res.text();
    console.error(`[${opts.logLabel}]`, res.status, text);
    return "send_error";
  } catch (e) {
    console.error(`[${opts.logLabel}]`, e);
    return "send_error";
  }
}

/** Create text attributes if missing (400 = already exists). */
async function ensureDripAttributes(env: WorkerEnv) {
  if (!env.BREVO_API_KEY) return;
  for (const name of ["DRIP_DAY7", "DRIP_DAY7_DUE"] as const) {
    try {
      const res = await fetch("https://api.brevo.com/v3/contacts/attributes", {
        method: "POST",
        headers: {
          accept: "application/json",
          "content-type": "application/json",
          "api-key": env.BREVO_API_KEY,
        },
        body: JSON.stringify({ name, type: "text" }),
      });
      if (!res.ok && res.status !== 400) {
        console.error("[brevo-attr-create]", name, res.status, await res.text());
      }
    } catch (e) {
      console.error("[brevo-attr-create]", name, e);
    }
  }
}

async function patchContactAttributes(
  email: string,
  env: WorkerEnv,
  attributes: Record<string, string>,
) {
  if (!env.BREVO_API_KEY) return false;
  try {
    const res = await fetch(
      `https://api.brevo.com/v3/contacts/${encodeURIComponent(email)}`,
      {
        method: "PUT",
        headers: {
          accept: "application/json",
          "content-type": "application/json",
          "api-key": env.BREVO_API_KEY,
        },
        body: JSON.stringify({ attributes }),
      },
    );
    if (res.ok || res.status === 204) return true;
    console.error("[brevo-attr]", res.status, await res.text());
    return false;
  } catch (e) {
    console.error("[brevo-attr]", e);
    return false;
  }
}

/**
 * Day 3: Brevo scheduledAt (+3d, free-plan max).
 * Day 7: mark contact pending; cron schedules when within 3-day window.
 */
export async function scheduleDripEmails(email: string, env: WorkerEnv) {
  const day3Id = Number(env.BREVO_DAY3_TEMPLATE_ID || "3");
  const day7Due = scheduledAtDaysFromNow(7);

  const day3 = await sendTransactionalTemplate(email, env, {
    templateId: day3Id,
    tags: ["rakhuno-drip-day3"],
    scheduledAt: scheduledAtDaysFromNow(3),
    logLabel: "brevo-drip-day3",
  });

  await ensureDripAttributes(env);
  const queued = await patchContactAttributes(email, env, {
    DRIP_DAY7: "pending",
    DRIP_DAY7_DUE: day7Due,
  });

  return { day3, day7: queued ? "queued" : "queue_error" };
}

type BrevoContact = {
  email?: string;
  attributes?: Record<string, unknown>;
};

/**
 * Schedule or send Day 7 for contacts whose due date is within Brevo's
 * 3-day schedule window (or already past due → send now).
 */
export async function processDay7Queue(env: WorkerEnv) {
  if (!env.BREVO_API_KEY || !env.BREVO_LIST_ID) {
    return { ok: false as const, error: "missing_brevo", processed: 0, scanned: 0 };
  }
  const listId = Number(env.BREVO_LIST_ID);
  const day7Id = Number(env.BREVO_DAY7_TEMPLATE_ID || "2");
  const maxScheduleMs = BREVO_MAX_SCHEDULE_DAYS * DAY_MS;

  let offset = 0;
  let scanned = 0;
  let processed = 0;
  const results: Array<{ email: string; status: string }> = [];

  for (let page = 0; page < 40; page++) {
    const url = new URL("https://api.brevo.com/v3/contacts");
    url.searchParams.set("limit", "50");
    url.searchParams.set("offset", String(offset));
    url.searchParams.append("listIds", String(listId));

    const res = await fetch(url, {
      headers: {
        accept: "application/json",
        "api-key": env.BREVO_API_KEY,
      },
    });
    if (!res.ok) {
      console.error("[drip-cron]", res.status, await res.text());
      break;
    }

    const data = (await res.json()) as {
      contacts?: BrevoContact[];
      count?: number;
    };
    const contacts = data.contacts || [];
    if (contacts.length === 0) break;

    for (const c of contacts) {
      scanned += 1;
      const email = (c.email || "").trim().toLowerCase();
      if (!email) continue;
      const attrs = c.attributes || {};
      const status = String(attrs.DRIP_DAY7 || "").toLowerCase();
      if (status !== "pending") continue;

      const dueRaw = String(attrs.DRIP_DAY7_DUE || "");
      const dueMs = Date.parse(dueRaw);
      if (!Number.isFinite(dueMs)) continue;

      const msLeft = dueMs - Date.now();
      if (msLeft > maxScheduleMs) continue;

      let sendStatus: string;
      if (msLeft <= 0) {
        sendStatus = await sendTransactionalTemplate(email, env, {
          templateId: day7Id,
          tags: ["rakhuno-drip-day7"],
          logLabel: "brevo-drip-day7-now",
        });
      } else {
        sendStatus = await sendTransactionalTemplate(email, env, {
          templateId: day7Id,
          tags: ["rakhuno-drip-day7"],
          scheduledAt: new Date(dueMs).toISOString(),
          logLabel: "brevo-drip-day7-sched",
        });
      }

      if (sendStatus === "sent" || sendStatus === "scheduled") {
        await patchContactAttributes(email, env, {
          DRIP_DAY7: sendStatus,
        });
        processed += 1;
      }
      results.push({ email, status: sendStatus });
    }

    offset += contacts.length;
    if (contacts.length < 50) break;
  }

  return { ok: true as const, scanned, processed, results };
}
