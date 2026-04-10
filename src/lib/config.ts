const fallbackAppUrl = "https://app-ladder.vercel.app";

export const appConfig = {
  name: "App Ladder",
  appUrl: process.env.NEXT_PUBLIC_APP_URL?.trim() || fallbackAppUrl,
  baseAppId:
    process.env.NEXT_PUBLIC_BASE_APP_ID?.trim() || "69d7aed0ec96f8d98e3ef333",
  walletConnectProjectId:
    process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID?.trim() || "",
  accountAssociation: {
    header: process.env.FARCASTER_HEADER?.trim() || "TODO_WARPCAST_HEADER",
    payload: process.env.FARCASTER_PAYLOAD?.trim() || "TODO_WARPCAST_PAYLOAD",
    signature:
      process.env.FARCASTER_SIGNATURE?.trim() || "TODO_WARPCAST_SIGNATURE",
  },
};

type FarcasterActionType = "launch_miniapp" | "launch_frame";

export function createMiniAppEmbed(actionType: FarcasterActionType = "launch_miniapp") {
  return {
    version: "1",
    imageUrl: `${appConfig.appUrl}/opengraph-image`,
    button: {
      title: "Open App Ladder",
      action: {
        type: actionType,
        name: appConfig.name,
        url: appConfig.appUrl,
        splashImageUrl: `${appConfig.appUrl}/splash.png`,
        splashBackgroundColor: "#fff4c4",
      },
    },
  };
}
