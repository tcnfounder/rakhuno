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
    icon: [
      { url: "/brand/favicon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/brand/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/brand/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/brand/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/brand/favicon.png",
    apple: [{ url: "/brand/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  manifest: "/site.webmanifest",
  openGraph: {
    title: "Rakhuno — простий рахунок для ФОП",
    description:
      "Створіть рахунок-фактуру за 2 хвилини. Email-нагадування про податки.",
    url: "https://rakhuno.com",
    siteName: "Rakhuno",
    locale: "uk_UA",
    type: "website",
    images: [{ url: "/brand/mark.webp", width: 256, height: 256, alt: "Rakhuno" }],
  },
  twitter: {
    card: "summary",
    images: ["/brand/mark.webp"],
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
