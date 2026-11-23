import type { Metadata } from "next";
import { SiteShell } from "@/components/SiteShell";
import { VerifyLogin } from "./VerifyLogin";

export const metadata: Metadata = {
  title: "Вхід у кабінет",
  robots: { index: false, follow: false },
};

export default function VerifyPage() {
  return (
    <SiteShell>
      <div className="mx-auto max-w-md">
        <VerifyLogin />
      </div>
    </SiteShell>
  );
}
