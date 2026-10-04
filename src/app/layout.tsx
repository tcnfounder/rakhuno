import type { Metadata } from "next";
import { Analytics } from "@/components/Analytics";
import { JsonLd, organizationLd, softwareLd, websiteLd } from "@/components/JsonLd";
import WebMcpRegister from "@/components/WebMcpRegister";
import "./globals.css";

const googleVerification = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION?.trim();

/**
 * Fonts load via CSS link (not next/font/google).
 * Railway Turbopack builds were failing on @vercel/turbopack-next font resolution.
 */

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
    siteName: "Rakhuno",
    locale: "uk_UA",
    type: "website",
    images: [
      {
        url: "/brand/og-default.png",
        width: 1200,
        height: 630,
        alt: "Rakhuno — простий рахунок-фактура для ФОП",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Rakhuno — простий рахунок для ФОП",
    description: "Створіть рахунок-фактуру за 2 хвилини. Email-нагадування про податки.",
    images: ["/brand/og-default.png"],
  },
  ...(googleVerification
    ? { verification: { google: googleVerification } }
    : {}),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uk">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Onest:wght@400;500;600&family=Unbounded:wght@500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        <JsonLd data={[organizationLd, softwareLd, websiteLd]} />
        <Analytics />
        <WebMcpRegister />
        {children}
      </body>
    </html>
  );
}
