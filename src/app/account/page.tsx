import type { Metadata } from "next";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteShell } from "@/components/SiteShell";
import { AccountView } from "./AccountView";

export const metadata: Metadata = {
  title: "Кабінет",
  robots: { index: false, follow: false },
};

export default function AccountPage() {
  return (
    <>
      <SiteShell>
        <AccountView />
      </SiteShell>
      <SiteFooter />
    </>
  );
}
