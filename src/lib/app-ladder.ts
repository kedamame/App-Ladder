export const tiers = ["S", "A", "B", "C", "D"] as const;

export const metricKeys = ["fun", "polish", "comeBack"] as const;

export type Tier = (typeof tiers)[number];
export type MetricKey = (typeof metricKeys)[number];

export type MiniApp = {
  id: string;
  name: string;
  category: string;
  shortDescription: string;
  badge: string;
  accent: string;
  wash: string;
  externalUrl: string;
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

export const miniApps: MiniApp[] = [
  {
    id: "quest-bloom",
    name: "Quest Bloom",
    category: "Games",
    shortDescription: "Tiny daily quests with score bursts, sticker drops, and one-tap rematches.",
    badge: "QB",
    accent: "#ff7b54",
    wash: "#ffe0d2",
    externalUrl: "https://example.com/quest-bloom",
  },
  {
    id: "frame-cart",
    name: "Frame Cart",
    category: "Shopping",
    shortDescription: "Snap together wishlists from mini storefronts and sort them into mood boards.",
    badge: "FC",
    accent: "#0057ff",
    wash: "#dbe7ff",
    externalUrl: "https://example.com/frame-cart",
  },
  {
    id: "byte-beats",
    name: "Byte Beats",
    category: "Music",
    shortDescription: "Loop packs and pocket listening rooms that feel halfway between a sampler and a zine.",
    badge: "BB",
    accent: "#8d5cff",
    wash: "#e7ddff",
    externalUrl: "https://example.com/byte-beats",
  },
  {
    id: "tipjar-fm",
    name: "TipJar FM",
    category: "Social",
    shortDescription: "Short creator shoutouts, fast reactions, and a clean micro-tipping vibe.",
    badge: "TJ",
    accent: "#28b57a",
    wash: "#dff8ec",
    externalUrl: "https://example.com/tipjar-fm",
  },
  {
    id: "receipt-rally",
    name: "Receipt Rally",
    category: "Utility",
    shortDescription: "Scan a purchase, pin a sticker, and turn boring tracking into a playful streak.",
    badge: "RR",
    accent: "#ffb000",
    wash: "#fff0c6",
    externalUrl: "https://example.com/receipt-rally",
  },
  {
    id: "chain-canvas",
    name: "Chain Canvas",
    category: "Art",
    shortDescription: "Swipe through remix prompts and build little visual collages on a timeline.",
    badge: "CC",
    accent: "#00a6a6",
    wash: "#d5f8f8",
    externalUrl: "https://example.com/chain-canvas",
  },
  {
    id: "market-sprint",
    name: "Market Sprint",
    category: "Finance",
    shortDescription: "Prediction sprints and fast explainers that make market mood feel readable.",
    badge: "MS",
    accent: "#16213d",
    wash: "#dfe7f5",
    externalUrl: "https://example.com/market-sprint",
  },
  {
    id: "lore-loop",
    name: "Lore Loop",
    category: "Entertainment",
    shortDescription: "Collect episodic fiction cards and rank each chapter like a weekend magazine issue.",
    badge: "LL",
    accent: "#ff5ca8",
    wash: "#ffe0ef",
    externalUrl: "https://example.com/lore-loop",
  },
  {
    id: "pocket-guild",
    name: "Pocket Guild",
    category: "Productivity",
    shortDescription: "Tiny accountability rooms with short timers, shared prompts, and quiet momentum.",
    badge: "PG",
    accent: "#3f8cff",
    wash: "#ddeaff",
    externalUrl: "https://example.com/pocket-guild",
  },
  {
    id: "builder-bingo",
    name: "Builder Bingo",
    category: "Developer",
    shortDescription: "Weekly builder prompts turned into bingo cards for shipping tiny experiments.",
    badge: "BI",
    accent: "#5d44d7",
    wash: "#e8e1ff",
    externalUrl: "https://example.com/builder-bingo",
  },
  {
    id: "snack-vote",
    name: "Snack Vote",
    category: "Social",
    shortDescription: "One-question community polls with instant visual results and silly sticker energy.",
    badge: "SV",
    accent: "#ff8a3d",
    wash: "#ffe8d7",
    externalUrl: "https://example.com/snack-vote",
  },
  {
    id: "mirror-drop",
    name: "Mirror Drop",
    category: "Collecting",
    shortDescription: "Capture a mini moment every day and stack it into a collectible memory shelf.",
    badge: "MD",
    accent: "#0f9d58",
    wash: "#dcf5e6",
    externalUrl: "https://example.com/mirror-drop",
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

export function findMiniApp(appId?: string) {
  return miniApps.find((app) => app.id === appId);
}

export function pickAppForDay(dayKey: string) {
  const hash = Array.from(dayKey).reduce(
    (total, character, index) => total + character.charCodeAt(0) * (index + 3),
    0,
  );

  return miniApps[hash % miniApps.length];
}

export function upsertReview(reviews: StoredReview[], nextReview: StoredReview) {
  const withoutDay = reviews.filter((review) => review.dayKey !== nextReview.dayKey);
  return [nextReview, ...withoutDay].sort((left, right) =>
    right.updatedAt.localeCompare(left.updatedAt),
  );
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

export function buildTierEntries(reviews: StoredReview[]): TierEntry[] {
  return getLatestReviewsByApp(reviews)
    .map((review) => {
      const app = findMiniApp(review.appId);

      if (!app) {
        return null;
      }

      const averageScore =
        (review.scores.fun + review.scores.polish + review.scores.comeBack) / 3;

      return { app, review, averageScore };
    })
    .filter((entry): entry is TierEntry => Boolean(entry));
}

export function buildTierBoard(reviews: StoredReview[]) {
  const entries = buildTierEntries(reviews);

  return tiers.map((tier) => ({
    tier,
    entries: entries
      .filter((entry) => entry.review.tier === tier)
      .sort((left, right) => right.review.updatedAt.localeCompare(left.review.updatedAt)),
  }));
}

export function getRecentEntries(reviews: StoredReview[], limit = 4) {
  return [...reviews]
    .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
    .slice(0, limit)
    .map((review) => {
      const app = findMiniApp(review.appId);
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

export function getCategoryFilters() {
  return ["All", ...Array.from(new Set(miniApps.map((app) => app.category)))];
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

export function getWeekSTier(reviews: StoredReview[], anchor = todayKey()) {
  const anchorDate = new Date(`${anchor}T00:00:00`);
  const weekStart = new Date(anchorDate);
  weekStart.setDate(anchorDate.getDate() - 6);
  const startKey = weekStart.toISOString().slice(0, 10);

  return reviews
    .filter((review) => review.tier === "S" && review.dayKey >= startKey && review.dayKey <= anchor)
    .map((review) => {
      const app = findMiniApp(review.appId);
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

export function buildShareCopy(template: ShareTemplate, reviews: StoredReview[]) {
  const entries = buildTierEntries(reviews);
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

  if (template === "top-3") {
    return `My App Ladder top 3 right now: ${topThree.join(", ") || "still ranking."}`;
  }

  if (template === "hidden-gem") {
    return `Hidden gem from my App Ladder board: ${topThree[2] ?? topThree[0] ?? "still looking."}`;
  }

  return `This week's S tier on App Ladder: ${sTierNames.join(", ") || "none yet, still climbing."}`;
}
