import type { AccountData } from "@/lib/account-data";
import { loadClients, loadHistory, replaceLocalLists } from "@/lib/history";
import { COUNTER_KEY, loadSellerProfile, saveSellerProfile, type SellerProfile } from "@/lib/invoice";

/** Client side of account sync: localStorage stays the working copy, the account keeps everything. */

export type AccountSnapshot = AccountData & { email: string };

export function isSignedIn() {
  return typeof document !== "undefined" && /(?:^|;\s*)rk_in=1/.test(document.cookie);
}

function forgetSignedIn() {
  document.cookie = "rk_in=; path=/; max-age=0";
}

function readCounter() {
  try {
    return Number(window.localStorage.getItem(COUNTER_KEY) || "1") || 1;
  } catch {
    return 1;
  }
}

function applyLocally(data: AccountData) {
  if (data.profile?.sellerName?.trim()) {
    saveSellerProfile({
      sellerLogo: data.profile.sellerLogo || "",
      sellerName: data.profile.sellerName || "",
      sellerTaxId: data.profile.sellerTaxId || "",
      sellerAddress: data.profile.sellerAddress || "",
      sellerIban: data.profile.sellerIban || "",
      sellerBank: data.profile.sellerBank || "",
      fopGroup: data.profile.fopGroup || "",
    } as SellerProfile);
  }
  replaceLocalLists(data.clients, data.invoices);
  try {
    if (data.counter > readCounter()) window.localStorage.setItem(COUNTER_KEY, String(data.counter));
  } catch {
    /* ignore */
  }
}

/** Sends this browser's data, stores the merged result locally and returns it. Null when signed out. */
export async function syncAccount(): Promise<AccountSnapshot | null> {
  if (!isSignedIn()) return null;
  const local: AccountData = {
    profile: loadSellerProfile(),
    clients: loadClients(),
    invoices: loadHistory(),
    counter: readCounter(),
  };
  try {
    const res = await fetch("/api/account/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(local),
    });
    if (res.status === 401) {
      forgetSignedIn();
      return null;
    }
    if (!res.ok) return null;
    const merged = (await res.json()) as AccountSnapshot;
    applyLocally(merged);
    return merged;
  } catch {
    return null;
  }
}
