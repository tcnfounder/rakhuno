import type { Metadata } from "next";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteShell } from "@/components/SiteShell";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "Вхід у кабінет",
  description: "Вхід у Rakhuno за посиланням на email, без пароля.",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <>
      <SiteShell>
        <div className="mx-auto max-w-md">
          <h1 className="font-display text-4xl font-semibold">Вхід у кабінет</h1>
          <p className="mt-3 text-mist">
            Без пароля: надішлемо посилання на email. Рахунки, клієнти й реквізити зберігаються в кабінеті й
            доступні на будь-якому пристрої.
          </p>
          <LoginForm />
        </div>
      </SiteShell>
      <SiteFooter />
    </>
  );
}
