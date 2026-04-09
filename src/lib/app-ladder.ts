export const tiers = ["S", "A", "B", "C", "D"] as const;
export const maxTierEntries = 5;

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

export type MiniApp = {
  id: string;
  name: string;
  category: string;
  shortDescription: string;
  badge: string;
  accent: string;
  wash: string;
  imageUrl: string;
  externalUrl: string;
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
  imageUrl: string;
  externalUrl: string;
};

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
  const normalizedImageUrl = normalizeMiniAppUrl(input.imageUrl);
  const category = input.category.trim() || "Unsorted";
  const shortDescription =
    input.shortDescription.trim() ||
    "Saved from your own miniapp shelf so it can be reviewed on your private board.";

  if (!normalizedName || !normalizedUrl || !normalizedImageUrl) {
    throw new Error("Custom miniapp requires a name, image URL, and public URL.");
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
    imageUrl: normalizedImageUrl,
    externalUrl: normalizedUrl,
    addedAt: new Date().toISOString(),
  };
}

export function orderMiniApps(customApps: MiniApp[]) {
  return [...customApps].sort((left, right) =>
    (right.addedAt ?? "").localeCompare(left.addedAt ?? ""),
  );
}

export function buildAppCollection(customApps: MiniApp[]) {
  return orderMiniApps(customApps);
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
  if (!apps.length) {
    return null;
  }

  const hash = Array.from(dayKey).reduce(
    (total, character, index) => total + character.charCodeAt(0) * (index + 3),
    0,
  );

  return apps[hash % apps.length];
}

export function upsertReview(reviews: StoredReview[], nextReview: StoredReview) {
  const withoutMatchingReview = reviews.filter(
    (review) =>
      !(review.dayKey === nextReview.dayKey && review.appId === nextReview.appId),
  );
  return [nextReview, ...withoutMatchingReview].sort((left, right) =>
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
    addedAt: existing.addedAt ?? nextApp.addedAt,
  };

  return [mergedApp, ...apps.filter((app) => app.id !== existing.id)];
}

export function getTodayReview(reviews: StoredReview[], dayKey: string) {
  return (
    [...reviews]
      .filter((review) => review.dayKey === dayKey)
      .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))[0] ?? null
  );
}

export function getReviewForAppOnDay(
  reviews: StoredReview[],
  dayKey: string,
  appId?: string,
) {
  if (!appId) {
    return null;
  }

  return (
    [...reviews]
      .filter((review) => review.dayKey === dayKey && review.appId === appId)
      .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))[0] ?? null
  );
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
  const categories = Array.from(new Set(apps.map((app) => app.category)));
  return ["All", ...categories];
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

export function getShareEntriesForTemplate(
  template: ShareTemplate,
  apps: MiniApp[],
  reviews: StoredReview[],
) {
  const entries = buildTierEntries(apps, reviews);
  const rankedEntries = [...entries]
    .sort((left, right) => {
      if (left.review.tier === right.review.tier) {
        return right.averageScore - left.averageScore;
      }

      return tiers.indexOf(left.review.tier) - tiers.indexOf(right.review.tier);
    })
    .slice(0, 3);

  if (template === "top-3") {
    return rankedEntries;
  }

  if (template === "hidden-gem") {
    const hiddenGemEntry = rankedEntries[2] ?? rankedEntries[0] ?? null;
    return hiddenGemEntry ? [hiddenGemEntry] : [];
  }

  return entries
    .filter((entry) => entry.review.tier === "S")
    .sort((left, right) => right.review.updatedAt.localeCompare(left.review.updatedAt))
    .slice(0, 4);
}

export function buildShareCopy(
  template: ShareTemplate,
  apps: MiniApp[],
  reviews: StoredReview[],
  locale: AppLocale = "en",
) {
  const shareEntries = getShareEntriesForTemplate(template, apps, reviews);

  const appendLinks = (summary: string, linkedEntries: TierEntry[]) => {
    if (!linkedEntries.length) {
      return summary;
    }

    const links = linkedEntries.map((entry) => `${entry.app.name}: ${entry.app.externalUrl}`);
    return `${summary}\n\n${links.join("\n")}`;
  };

  if (locale === "ja") {
    if (template === "top-3") {
      return appendLinks(
        `いまの App Ladder Top 3: ${shareEntries.map((entry) => entry.app.name).join("、") || "まだランキング中。"}`,
        shareEntries,
      );
    }

    if (template === "hidden-gem") {
      return appendLinks(
        `App Ladder の隠れ推し: ${shareEntries[0]?.app.name ?? "まだ探索中。"}`,
        shareEntries,
      );
    }

    return appendLinks(
      `今週の S tier: ${shareEntries.map((entry) => entry.app.name).join("、") || "まだ S tier はありません。"}`,
      shareEntries,
    );
  }

  if (template === "top-3") {
    return appendLinks(
      `My App Ladder top 3 right now: ${shareEntries.map((entry) => entry.app.name).join(", ") || "still ranking."}`,
      shareEntries,
    );
  }

  if (template === "hidden-gem") {
    return appendLinks(
      `Hidden gem from my App Ladder board: ${shareEntries[0]?.app.name ?? "still looking."}`,
      shareEntries,
    );
  }

  return appendLinks(
    `This week's S tier on App Ladder: ${shareEntries.map((entry) => entry.app.name).join(", ") || "none yet, still climbing."}`,
    shareEntries,
  );
}
