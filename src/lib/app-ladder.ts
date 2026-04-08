export const tiers = ["S", "A", "B", "C", "D"] as const;

export const metricKeys = ["fun", "polish", "comeBack"] as const;

const stickerPalettes = [
  { accent: "#ff7b54", wash: "#ffe0d2" },
  { accent: "#0057ff", wash: "#dbe7ff" },
  { accent: "#8d5cff", wash: "#e7ddff" },
  { accent: "#28b57a", wash: "#dff8ec" },
  { accent: "#ffb000", wash: "#fff0c6" },
  { accent: "#00a6a6", wash: "#d5f8f8" },
  { accent: "#16213d", wash: "#dfe7f5" },
  { accent: "#ff5ca8", wash: "#ffe0ef" },
  { accent: "#3f8cff", wash: "#ddeaff" },
  { accent: "#5d44d7", wash: "#e8e1ff" },
  { accent: "#ff8a3d", wash: "#ffe8d7" },
  { accent: "#0f9d58", wash: "#dcf5e6" },
] as const;

export type Tier = (typeof tiers)[number];
export type MetricKey = (typeof metricKeys)[number];
export type MiniAppSource = "curated" | "custom";

export type MiniApp = {
  id: string;
  name: string;
  category: string;
  shortDescription: string;
  badge: string;
  accent: string;
  wash: string;
  externalUrl: string;
  source: MiniAppSource;
  addedAt?: string;
};

export type ReviewScores = Record<MetricKey, number>;

export type StoredReview = {
  id: string;
  appId: string;
  tier: Tier;
  note: string;
  scores: ReviewScores;
  dayKey: string;
  reviewedAt: string;
  updatedAt: string;
};

export type ReviewDraft = {
  tier: Tier;
  note: string;
  scores: ReviewScores;
};

export type TierEntry = {
  app: MiniApp;
  review: StoredReview;
  averageScore: number;
};

export type ShareTemplate = "s-tier" | "top-3" | "hidden-gem";
export type AppLocale = "en" | "ja";

export type CustomMiniAppInput = {
  name: string;
  category: string;
  shortDescription: string;
  externalUrl: string;
};

export const miniApps: MiniApp[] = [
  {
    id: "gmfren",
    name: "gmfren",
    category: "Social",
    shortDescription:
      "The gm client of Farcaster. View gms, leaderboards, and gm like a pro.",
    badge: "GM",
    accent: "#ff7b54",
    wash: "#ffe0d2",
    externalUrl:
      "https://farcaster.xyz/miniapps/01961ce5-a9c7-4f5d-8902-a81838ab99a2/gmfren",
    source: "curated",
  },
  {
    id: "gm-gn",
    name: "GM - GN",
    category: "Social",
    shortDescription:
      "Cast a GM or GN to your frens on Warpcast and keep your streak alive.",
    badge: "GG",
    accent: "#0057ff",
    wash: "#dbe7ff",
    externalUrl: "https://warpcast.com/~/frames/launch?domain=cast.basefrens.io",
    source: "curated",
  },
  {
    id: "adivina-drone",
    name: "adivinaDrone",
    category: "Games",
    shortDescription:
      "Guess where drone photos were taken in this interactive geography game.",
    badge: "AD",
    accent: "#8d5cff",
    wash: "#e7ddff",
    externalUrl: "https://warpcast.com/~/frames/launch?domain=adivinadrone.c13studio.mx",
    source: "curated",
  },
  {
    id: "base-pool",
    name: "Base Pool",
    category: "Games",
    shortDescription:
      "A provably fair lottery game on Base where you join draws with small onchain entries.",
    badge: "BP",
    accent: "#28b57a",
    wash: "#dff8ec",
    externalUrl:
      "https://warpcast.com/miniapps/01960e31-a5f7-2f26-3b46-41b033185e67/base-pool",
    source: "curated",
  },
  {
    id: "liv-more",
    name: "Liv More",
    category: "Health",
    shortDescription:
      "Gamifying wellness with wearables, blockchain attestations, and social challenges.",
    badge: "LM",
    accent: "#ffb000",
    wash: "#fff0c6",
    externalUrl:
      "https://farcaster.xyz/miniapps/019591c5-5e7b-503c-a658-a75e0f4438b3/liv-more",
    source: "curated",
  },
  {
    id: "base-build",
    name: "Base Build",
    category: "Utility",
    shortDescription: "Grow your app and earn on Base with distribution and builder tooling.",
    badge: "BB",
    accent: "#00a6a6",
    wash: "#d5f8f8",
    externalUrl:
      "https://farcaster.xyz/miniapps/01981558-11d7-a2e4-bb3c-4552d5dfbad9/base-build",
    source: "curated",
  },
  {
    id: "verify",
    name: "Verify",
    category: "Utility",
    shortDescription:
      "Help apps on Base verify real people and connect with the right audience faster.",
    badge: "VF",
    accent: "#16213d",
    wash: "#dfe7f5",
    externalUrl: "https://verify.base.dev",
    source: "curated",
  },
  {
    id: "mysphere",
    name: "MySphere.fun",
    category: "Social",
    shortDescription:
      "The onchain social app on Base where users build, grow, and own their digital sphere.",
    badge: "MS",
    accent: "#ff5ca8",
    wash: "#ffe0ef",
    externalUrl:
      "https://farcaster.xyz/miniapps/01961d73-cf12-2881-842d-4487d8af19d8/mysphere",
    source: "curated",
  },
  {
    id: "firefly-social",
    name: "Firefly Social",
    category: "Social",
    shortDescription:
      "Post, flex, and earn in a Web3 social app built for cross-network activity.",
    badge: "FS",
    accent: "#3f8cff",
    wash: "#ddeaff",
    externalUrl:
      "https://warpcast.com/miniapps/019909b9-355e-a6e9-8f4a-a3bcfbe5fc2b/firefly-social-dev",
    source: "curated",
  },
  {
    id: "run-on-base",
    name: "Run on Base",
    category: "Games",
    shortDescription:
      "A running-style mini game on Farcaster with rewards, streaks, and leaderboards.",
    badge: "RB",
    accent: "#5d44d7",
    wash: "#e8e1ff",
    externalUrl:
      "https://warpcast.com/miniapps/0196b705-3686-09c2-2464-4b729caf061e/run-on-base",
    source: "curated",
  },
  {
    id: "mibboverse",
    name: "Mibboverse",
    category: "Games",
    shortDescription:
      "An onchain adventure on Base with seasonal quests, artifacts, and Genesis NFTs.",
    badge: "MV",
    accent: "#ff8a3d",
    wash: "#ffe8d7",
    externalUrl:
      "https://farcaster.xyz/miniapps/0198ed48-5f9e-8ae0-3d66-95e160398f47/mibboverse",
    source: "curated",
  },
  {
    id: "mesh-mini",
    name: "Mesh Mini",
    category: "Social",
    shortDescription:
      "Onchain events and social coordination built for Farcaster groups and communities.",
    badge: "MM",
    accent: "#0f9d58",
    wash: "#dcf5e6",
    externalUrl:
      "https://warpcast.com/miniapps/01977f79-5a92-9df1-264b-5d057564a463/mesh-mini",
    source: "curated",
  },
];

export function todayKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

export function normalizeDayKey(value?: string) {
  if (value && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }

  return todayKey();
}

export function buildDefaultDraft(): ReviewDraft {
  return {
    tier: "B",
    note: "",
    scores: {
      fun: 3,
      polish: 3,
      comeBack: 3,
    },
  };
}

export function buildDraftFromReview(review?: StoredReview | null): ReviewDraft {
  if (!review) {
    return buildDefaultDraft();
  }

  return {
    tier: review.tier,
    note: review.note,
    scores: { ...review.scores },
  };
}

export function normalizeMiniAppUrl(value: string) {
  try {
    const next = new URL(value.trim());

    if (next.protocol !== "http:" && next.protocol !== "https:") {
      return null;
    }

    return next.toString();
  } catch {
    return null;
  }
}

export function slugifyMiniAppName(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

function hashString(value: string) {
  return Array.from(value).reduce(
    (total, character, index) => total + character.charCodeAt(0) * (index + 17),
    0,
  );
}

function buildBadge(name: string) {
  const words = name
    .trim()
    .split(/\s+/)
    .map((word) => word.replace(/[^a-zA-Z0-9]/g, ""))
    .filter(Boolean);

  if (words.length >= 2) {
    return `${words[0][0]}${words[1][0]}`.toUpperCase();
  }

  const compact = name.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  return compact.slice(0, 2) || "AP";
}

function pickStickerPalette(seed: string) {
  return stickerPalettes[hashString(seed) % stickerPalettes.length];
}

export function createCustomMiniApp(input: CustomMiniAppInput): MiniApp {
  const normalizedName = input.name.trim();
  const normalizedUrl = normalizeMiniAppUrl(input.externalUrl);
  const category = input.category.trim() || "Custom";
  const shortDescription =
    input.shortDescription.trim() ||
    "Added from a public miniapp link so it can be reviewed on your private board.";

  if (!normalizedName || !normalizedUrl) {
    throw new Error("Custom miniapp requires a name and a valid URL.");
  }

  const palette = pickStickerPalette(`${normalizedName}:${normalizedUrl}`);
  const hash = hashString(`${normalizedName}:${normalizedUrl}`).toString(36);

  return {
    id: `custom-${slugifyMiniAppName(normalizedName) || "miniapp"}-${hash}`,
    name: normalizedName,
    category,
    shortDescription,
    badge: buildBadge(normalizedName),
    accent: palette.accent,
    wash: palette.wash,
    externalUrl: normalizedUrl,
    source: "custom",
    addedAt: new Date().toISOString(),
  };
}

export function orderMiniApps(customApps: MiniApp[]) {
  return [...customApps].sort((left, right) =>
    (right.addedAt ?? "").localeCompare(left.addedAt ?? ""),
  );
}

export function buildAppCollection(customApps: MiniApp[]) {
  return [...orderMiniApps(customApps), ...miniApps];
}

export function findMiniApp(apps: MiniApp[], appId?: string) {
  return apps.find((app) => app.id === appId);
}

export function findMiniAppByUrl(apps: MiniApp[], externalUrl: string) {
  const normalizedUrl = normalizeMiniAppUrl(externalUrl);

  if (!normalizedUrl) {
    return null;
  }

  return apps.find((app) => app.externalUrl === normalizedUrl) ?? null;
}

export function pickAppForDay(apps: MiniApp[], dayKey: string) {
  const safeApps = apps.length ? apps : miniApps;
  const hash = Array.from(dayKey).reduce(
    (total, character, index) => total + character.charCodeAt(0) * (index + 3),
    0,
  );

  return safeApps[hash % safeApps.length];
}

export function upsertReview(reviews: StoredReview[], nextReview: StoredReview) {
  const withoutDay = reviews.filter((review) => review.dayKey !== nextReview.dayKey);
  return [nextReview, ...withoutDay].sort((left, right) =>
    right.updatedAt.localeCompare(left.updatedAt),
  );
}

export function upsertCustomMiniApp(apps: MiniApp[], nextApp: MiniApp) {
  const existing = apps.find(
    (app) => app.id === nextApp.id || app.externalUrl === nextApp.externalUrl,
  );

  if (!existing) {
    return [nextApp, ...apps];
  }

  const mergedApp: MiniApp = {
    ...existing,
    ...nextApp,
    id: existing.id,
    source: "custom",
    addedAt: existing.addedAt ?? nextApp.addedAt,
  };

  return [mergedApp, ...apps.filter((app) => app.id !== existing.id)];
}

export function getTodayReview(reviews: StoredReview[], dayKey: string) {
  return reviews.find((review) => review.dayKey === dayKey) ?? null;
}

export function getLatestReviewsByApp(reviews: StoredReview[]) {
  const seen = new Set<string>();
  const latest: StoredReview[] = [];

  for (const review of [...reviews].sort((left, right) =>
    right.updatedAt.localeCompare(left.updatedAt),
  )) {
    if (seen.has(review.appId)) {
      continue;
    }

    seen.add(review.appId);
    latest.push(review);
  }

  return latest;
}

export function buildTierEntries(apps: MiniApp[], reviews: StoredReview[]): TierEntry[] {
  return getLatestReviewsByApp(reviews)
    .map((review) => {
      const app = findMiniApp(apps, review.appId);

      if (!app) {
        return null;
      }

      const averageScore =
        (review.scores.fun + review.scores.polish + review.scores.comeBack) / 3;

      return { app, review, averageScore };
    })
    .filter((entry): entry is TierEntry => Boolean(entry));
}

export function buildTierBoard(apps: MiniApp[], reviews: StoredReview[]) {
  const entries = buildTierEntries(apps, reviews);

  return tiers.map((tier) => ({
    tier,
    entries: entries
      .filter((entry) => entry.review.tier === tier)
      .sort((left, right) => right.review.updatedAt.localeCompare(left.review.updatedAt)),
  }));
}

export function getRecentEntries(apps: MiniApp[], reviews: StoredReview[], limit = 4) {
  return [...reviews]
    .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
    .slice(0, limit)
    .map((review) => {
      const app = findMiniApp(apps, review.appId);
      return app ? { app, review } : null;
    })
    .filter(
      (
        entry,
      ): entry is {
        app: MiniApp;
        review: StoredReview;
      } => Boolean(entry),
    );
}

export function getCategoryFilters(apps: MiniApp[]) {
  return ["All", ...Array.from(new Set(apps.map((app) => app.category)))];
}

export function getReviewStreak(reviews: StoredReview[], anchor = todayKey()) {
  const uniqueDays = new Set(reviews.map((review) => review.dayKey));
  const cursor = new Date(`${anchor}T00:00:00`);
  let streak = 0;

  while (uniqueDays.has(cursor.toISOString().slice(0, 10))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

export function getWeekSTier(apps: MiniApp[], reviews: StoredReview[], anchor = todayKey()) {
  const anchorDate = new Date(`${anchor}T00:00:00`);
  const weekStart = new Date(anchorDate);
  weekStart.setDate(anchorDate.getDate() - 6);
  const startKey = weekStart.toISOString().slice(0, 10);

  return reviews
    .filter((review) => review.tier === "S" && review.dayKey >= startKey && review.dayKey <= anchor)
    .map((review) => {
      const app = findMiniApp(apps, review.appId);
      return app ? { app, review } : null;
    })
    .filter(
      (
        entry,
      ): entry is {
        app: MiniApp;
        review: StoredReview;
      } => Boolean(entry),
    );
}

export function buildShareCopy(
  template: ShareTemplate,
  apps: MiniApp[],
  reviews: StoredReview[],
  locale: AppLocale = "en",
) {
  const entries = buildTierEntries(apps, reviews);
  const topThree = [...entries]
    .sort((left, right) => {
      if (left.review.tier === right.review.tier) {
        return right.averageScore - left.averageScore;
      }

      return tiers.indexOf(left.review.tier) - tiers.indexOf(right.review.tier);
    })
    .slice(0, 3)
    .map((entry) => entry.app.name);

  const sTierNames = entries
    .filter((entry) => entry.review.tier === "S")
    .slice(0, 4)
    .map((entry) => entry.app.name);

  if (locale === "ja") {
    if (template === "top-3") {
      return `いまの App Ladder Top 3: ${topThree.join("、") || "まだランキング中。"}`;
    }

    if (template === "hidden-gem") {
      return `App Ladder の隠れ推し: ${topThree[2] ?? topThree[0] ?? "まだ探索中。"}`;
    }

    return `今週の S tier: ${sTierNames.join("、") || "まだ S tier はありません。"}`;
  }

  if (template === "top-3") {
    return `My App Ladder top 3 right now: ${topThree.join(", ") || "still ranking."}`;
  }

  if (template === "hidden-gem") {
    return `Hidden gem from my App Ladder board: ${topThree[2] ?? topThree[0] ?? "still looking."}`;
  }

  return `This week's S tier on App Ladder: ${sTierNames.join(", ") || "none yet, still climbing."}`;
}
