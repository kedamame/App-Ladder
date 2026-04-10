import { NextResponse } from "next/server";
import { appConfig } from "@/lib/config";

export async function GET() {
  const miniapp = {
    version: "1",
    name: "App Ladder",
    homeUrl: appConfig.appUrl,
    iconUrl: `${appConfig.appUrl}/icon.png`,
    splashImageUrl: `${appConfig.appUrl}/splash.png`,
    splashBackgroundColor: "#fff4c4",
    subtitle: "Solo Base app reviews",
    description:
      "Review one Base miniapp a day, grow your private tier board, and share your weekly S tier card when it feels right.",
    screenshotUrls: [
      `${appConfig.appUrl}/screenshot1.png`,
      `${appConfig.appUrl}/screenshot2.png`,
      `${appConfig.appUrl}/screenshot3.png`,
    ],
    primaryCategory: "entertainment",
    tags: ["base", "miniapps", "reviews", "tiers", "solo"],
    heroImageUrl: `${appConfig.appUrl}/og-image.png`,
    tagline: "Raise your miniapp taste",
    ogTitle: "App Ladder",
    ogDescription: "A solo tier board for Base miniapp reviews.",
    ogImageUrl: `${appConfig.appUrl}/og-image.png`,
    requiredChains: ["eip155:8453"],
    requiredCapabilities: [],
    noindex: false,
  };

  return NextResponse.json({
    accountAssociation: appConfig.accountAssociation,
    miniapp,
    frame: miniapp,
  });
}
