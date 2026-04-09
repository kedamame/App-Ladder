import type { Metadata } from "next";
import localFont from "next/font/local";
import { AppProvider } from "@/components/providers/AppProvider";
import { appConfig, createMiniAppEmbed } from "@/lib/config";
import "./globals.css";

const editorSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-editor-sans",
  weight: "100 900",
});

const cabinetMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-editor-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  metadataBase: new URL(appConfig.appUrl),
  title: "App Ladder",
  description:
    "Review one Base miniapp a day, grow your private tier board, and share your weekly S tier.",
  applicationName: "App Ladder",
  openGraph: {
    title: "App Ladder",
    description:
      "A solo miniapp journal for collecting, reviewing, and ranking Base miniapps.",
    url: appConfig.appUrl,
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "App Ladder editorial arcade cover",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "App Ladder",
    description:
      "Collect and review one Base miniapp a day inside Farcaster, Base App, or a regular browser.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/icon.png",
    shortcut: "/icon.png",
    apple: "/icon.png",
  },
  other: {
    "fc:miniapp": JSON.stringify(createMiniAppEmbed()),
    "fc:frame": JSON.stringify(createMiniAppEmbed()),
    "base:app_id": "69d7aed0ec96f8d98e3ef333",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={`${editorSans.variable} ${cabinetMono.variable}`}>
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
