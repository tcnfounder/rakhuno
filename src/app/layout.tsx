import type { Metadata } from "next";
import { Onest, Unbounded } from "next/font/google";
import "./globals.css";

const display = Unbounded({
  variable: "--font-display",
  subsets: ["latin", "cyrillic"],
  weight: ["500", "600", "700"],
});

const body = Onest({
  variable: "--font-body",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://rakhuno.com"),
  title: {
    default: "Rakhuno — простий рахунок для ФОП",
    template: "%s · Rakhuno",
  },
  description:
    "Створіть рахунок-фактуру за 2 хвилини. Email-нагадування про податки для ФОП. Без складної бухгалтерії.",
  icons: {
    icon: "/brand/mark-64.png",
    apple: "/brand/apple-touch-icon.png",
  },
  openGraph: {
    title: "Rakhuno — простий рахунок для ФОП",
    description:
      "Створіть рахунок-фактуру за 2 хвилини. Email-нагадування про податки.",
    url: "https://rakhuno.com",
    siteName: "Rakhuno",
    locale: "uk_UA",
    type: "website",
    images: [{ url: "/brand/hero.jpg", width: 1200, height: 800, alt: "Rakhuno" }],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/brand/hero.jpg"],
  },
  alternates: {
    canonical: "https://rakhuno.com",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uk">
      <body className={`${display.variable} ${body.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
