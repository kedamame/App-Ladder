import { ImageResponse } from "next/og";

type ImageKind =
  | "icon"
  | "splash"
  | "og"
  | "thumbnail"
  | "embed"
  | "screenshot-1"
  | "screenshot-2"
  | "screenshot-3";

const imagePresets: Record<
  ImageKind,
  {
    width: number;
    height: number;
    kicker: string;
    title: string;
    subtitle: string;
    accent: string;
    wash: string;
  }
> = {
  icon: {
    width: 1024,
    height: 1024,
    kicker: "APP LADDER",
    title: "AL",
    subtitle: "daily tiers",
    accent: "#0057ff",
    wash: "#ffe79b",
  },
  splash: {
    width: 200,
    height: 200,
    kicker: "APP",
    title: "AL",
    subtitle: "loading",
    accent: "#16213d",
    wash: "#fff3c4",
  },
  og: {
    width: 1200,
    height: 630,
    kicker: "EDITORIAL x ARCADE",
    title: "App Ladder",
    subtitle: "Review one Base miniapp a day and grow your private tier board.",
    accent: "#0057ff",
    wash: "#ffe06b",
  },
  thumbnail: {
    width: 1200,
    height: 628,
    kicker: "BASE MINIAPP",
    title: "App Ladder",
    subtitle: "Review miniapps, grow your tier board, and share your favorites.",
    accent: "#0057ff",
    wash: "#dfe8ff",
  },
  embed: {
    width: 900,
    height: 600,
    kicker: "DAILY PICK",
    title: "App Ladder",
    subtitle: "A solo miniapp journal for Base and Farcaster.",
    accent: "#ff8e53",
    wash: "#dfe8ff",
  },
  "screenshot-1": {
    width: 1284,
    height: 2778,
    kicker: "TODAY'S ONE",
    title: "Pick today's app",
    subtitle: "A bright, tactile home that spotlights the daily miniapp and your streak.",
    accent: "#ff7b54",
    wash: "#fff0da",
  },
  "screenshot-2": {
    width: 1284,
    height: 2778,
    kicker: "5 MIN REVIEW",
    title: "Rate with speed",
    subtitle: "Tier, quick note, and three sliders keep the loop punchy on mobile.",
    accent: "#0057ff",
    wash: "#e4edff",
  },
  "screenshot-3": {
    width: 1284,
    height: 2778,
    kicker: "PRIVATE BOARD",
    title: "Watch the ladder grow",
    subtitle: "Your latest review per app lands on a sticker-board tier layout.",
    accent: "#28b57a",
    wash: "#e4f8ee",
  },
};

export function createMiniAppImage(kind: ImageKind) {
  const preset = imagePresets[kind];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          overflow: "hidden",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(180deg, #fff9e5 0%, #f6f0dd 58%, #f2ecdd 100%)",
          color: "#16213d",
          fontFamily: "sans-serif",
          padding:
            kind === "icon" || kind === "splash"
              ? Math.round(preset.width * 0.12)
              : 72,
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at top left, rgba(255, 224, 107, 0.7), transparent 30%), radial-gradient(circle at top right, rgba(0, 87, 255, 0.22), transparent 28%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            right: -80,
            bottom: -100,
            width: preset.width * 0.42,
            height: preset.width * 0.42,
            borderRadius: 48,
            background: preset.accent,
            opacity: 0.14,
            transform: "rotate(16deg)",
          }}
        />

        <div style={{ display: "flex", position: "relative", flexDirection: "column" }}>
          <div
            style={{
              display: "inline-flex",
              width: "fit-content",
              borderRadius: 999,
              border: "2px solid rgba(22, 33, 61, 0.12)",
              padding: kind === "icon" || kind === "splash" ? "8px 12px" : "12px 18px",
              background: "rgba(255, 255, 255, 0.82)",
              fontSize: kind === "icon" || kind === "splash" ? 28 : 32,
              letterSpacing: "0.16em",
            }}
          >
            {preset.kicker}
          </div>
        </div>

        <div style={{ display: "flex", position: "relative", flexDirection: "column", gap: 18 }}>
          <div
            style={{
              display: "flex",
              width: kind === "icon" || kind === "splash" ? "100%" : 220,
              height: kind === "icon" || kind === "splash" ? undefined : 220,
              alignItems: "center",
              justifyContent: "center",
              alignSelf: kind === "icon" || kind === "splash" ? "center" : "flex-start",
              padding: kind === "icon" || kind === "splash" ? "0" : "18px 0",
              borderRadius: kind === "icon" || kind === "splash" ? 180 : 36,
              background: `linear-gradient(135deg, ${preset.wash}, white)`,
              border: "2px solid rgba(22, 33, 61, 0.1)",
              transform: "rotate(-4deg)",
            }}
          >
            <span
              style={{
                color: preset.accent,
                fontSize:
                  kind === "icon"
                    ? 320
                    : kind === "splash"
                      ? 76
                      : kind === "embed"
                        ? 90
                        : 110,
                fontWeight: 800,
                letterSpacing: "-0.05em",
              }}
            >
              {kind === "icon" || kind === "splash" ? "AL" : "S/A"}
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div
              style={{
                fontSize:
                  kind === "icon"
                    ? 144
                    : kind === "splash"
                      ? 42
                      : kind === "embed"
                        ? 66
                        : 92,
                lineHeight: 0.96,
                letterSpacing: "-0.05em",
                fontWeight: 800,
              }}
            >
              {preset.title}
            </div>
            {kind !== "icon" && kind !== "splash" ? (
              <div
                style={{
                  maxWidth: kind === "embed" ? 620 : 860,
                  color: "#4d5b78",
                  fontSize: kind === "embed" ? 30 : 42,
                  lineHeight: 1.35,
                }}
              >
                {preset.subtitle}
              </div>
            ) : null}
          </div>
        </div>

        {kind.startsWith("screenshot") ? (
          <div
            style={{
              display: "flex",
              gap: 18,
              position: "relative",
            }}
          >
            {["TODAY", "REVIEW", "BOARD"].map((label) => (
              <div
                key={label}
                style={{
                  display: "flex",
                  minWidth: 180,
                  padding: "14px 18px",
                  borderRadius: 20,
                  background: "rgba(255, 255, 255, 0.74)",
                  fontSize: 28,
                  color: "#4d5b78",
                }}
              >
                {label}
              </div>
            ))}
          </div>
        ) : null}
      </div>
    ),
    {
      width: preset.width,
      height: preset.height,
    },
  );
}
