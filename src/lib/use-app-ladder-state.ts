"use client";

import { useEffect, useMemo, useState } from "react";
import {
  buildAppCollection,
  buildDefaultDraft,
  buildDraftFromReview,
  buildTierBoard,
  createCustomMiniApp,
  findMiniApp,
  findMiniAppByUrl,
  getCategoryFilters,
  getRecentEntries,
  getReviewStreak,
  getTodayReview,
  getWeekSTier,
  normalizeDayKey,
  normalizeMiniAppUrl,
  pickAppForDay,
  type CustomMiniAppInput,
  type MiniApp,
  type ReviewDraft,
  type ShareTemplate,
  type StoredReview,
  upsertCustomMiniApp,
  upsertReview,
} from "@/lib/app-ladder";

const storageKey = "app-ladder-storage:v1";

type PersistedState = {
  reviews: StoredReview[];
  customApps: MiniApp[];
  hiddenBoardAppIds: string[];
};

type LoadState = {
  isLoaded: boolean;
  loadError: string | null;
  reviews: StoredReview[];
  customApps: MiniApp[];
  hiddenBoardAppIds: string[];
};

type AddCustomMiniAppResult =
  | { status: "invalid"; app: null }
  | { status: "existing"; app: MiniApp }
  | { status: "created"; app: MiniApp };

type DeleteCustomMiniAppResult =
  | { status: "missing"; app: null }
  | { status: "deleted"; app: MiniApp };

type DeleteBoardEntryResult =
  | { status: "missing"; app: null }
  | { status: "deleted"; app: MiniApp };

function parseStoredState(rawValue: string | null): PersistedState {
  if (!rawValue) {
    return { reviews: [], customApps: [], hiddenBoardAppIds: [] };
  }

  const parsed = JSON.parse(rawValue) as Partial<PersistedState>;
  return {
    reviews: Array.isArray(parsed.reviews) ? parsed.reviews : [],
    customApps: Array.isArray(parsed.customApps) ? parsed.customApps : [],
    hiddenBoardAppIds: Array.isArray(parsed.hiddenBoardAppIds)
      ? parsed.hiddenBoardAppIds.filter((value): value is string => typeof value === "string")
      : [],
  };
}

export function useAppLadderState(initialAppId?: string, initialDay?: string) {
  const dayKey = normalizeDayKey(initialDay);
  const [selectedAppId, setSelectedAppId] = useState(initialAppId ?? "");
  const [draft, setDraft] = useState<ReviewDraft>(buildDefaultDraft);
  const [loadState, setLoadState] = useState<LoadState>({
    isLoaded: false,
    loadError: null,
    reviews: [],
    customApps: [],
    hiddenBoardAppIds: [],
  });
  const [saveMessage, setSaveMessage] = useState("");
  const [shareTemplate, setShareTemplate] = useState<ShareTemplate>("s-tier");

  useEffect(() => {
    try {
      const stored = parseStoredState(window.localStorage.getItem(storageKey));
      setLoadState({
        isLoaded: true,
        loadError: null,
        reviews: stored.reviews,
        customApps: stored.customApps,
        hiddenBoardAppIds: stored.hiddenBoardAppIds,
      });
    } catch {
      setLoadState({
        isLoaded: true,
        loadError:
          "Local data could not be read. You can keep reviewing, but older entries might be unavailable until storage is reset.",
        reviews: [],
        customApps: [],
        hiddenBoardAppIds: [],
      });
    }
  }, []);

  useEffect(() => {
    if (!loadState.isLoaded) {
      return;
    }

    window.localStorage.setItem(
      storageKey,
      JSON.stringify({
        reviews: loadState.reviews,
        customApps: loadState.customApps,
        hiddenBoardAppIds: loadState.hiddenBoardAppIds,
      }),
    );
  }, [loadState.customApps, loadState.hiddenBoardAppIds, loadState.isLoaded, loadState.reviews]);

  const apps = useMemo(() => buildAppCollection(loadState.customApps), [loadState.customApps]);
  const todayPick = useMemo(() => pickAppForDay(apps, dayKey), [apps, dayKey]);
  const selectedApp = findMiniApp(apps, selectedAppId) ?? todayPick ?? null;
  const todayReview = getTodayReview(loadState.reviews, dayKey);
  const recentEntries = getRecentEntries(apps, loadState.reviews);
  const board = buildTierBoard(apps, loadState.reviews);
  const weeklySTier = getWeekSTier(apps, loadState.reviews, dayKey);
  const streak = getReviewStreak(loadState.reviews, dayKey);
  const categoryFilters = getCategoryFilters(apps);

  useEffect(() => {
    if (!apps.length) {
      if (selectedAppId) {
        setSelectedAppId("");
      }
      return;
    }

    if (!findMiniApp(apps, selectedAppId)) {
      setSelectedAppId(initialAppId && findMiniApp(apps, initialAppId) ? initialAppId : apps[0].id);
    }
  }, [apps, initialAppId, selectedAppId]);

  useEffect(() => {
    if (!loadState.isLoaded) {
      return;
    }

    const seedReview =
      todayReview?.appId === selectedApp?.id
        ? todayReview
        : selectedApp
          ? loadState.reviews.find((review) => review.appId === selectedApp.id) ?? null
          : null;

    setDraft(buildDraftFromReview(seedReview));
  }, [dayKey, loadState.isLoaded, loadState.reviews, selectedApp, todayReview]);

  function addCustomApp(input: CustomMiniAppInput): AddCustomMiniAppResult {
    const normalizedUrl = normalizeMiniAppUrl(input.externalUrl);
    const normalizedImageUrl = normalizeMiniAppUrl(input.imageUrl);

    if (!input.name.trim() || !normalizedUrl || !normalizedImageUrl) {
      return { status: "invalid", app: null };
    }

    const existingApp = findMiniAppByUrl(apps, normalizedUrl);

    if (existingApp) {
      setSelectedAppId(existingApp.id);
      return { status: "existing", app: existingApp };
    }

    const nextApp = createCustomMiniApp({
      ...input,
      externalUrl: normalizedUrl,
      imageUrl: normalizedImageUrl,
    });

    setLoadState((current) => ({
      ...current,
      customApps: upsertCustomMiniApp(current.customApps, nextApp),
    }));
    setSelectedAppId(nextApp.id);

    return { status: "created", app: nextApp };
  }

  function deleteCustomApp(appId: string): DeleteCustomMiniAppResult {
    const existingApp = findMiniApp(loadState.customApps, appId);

    if (!existingApp) {
      return { status: "missing", app: null };
    }

    setLoadState((current) => ({
      ...current,
      customApps: current.customApps.filter((app) => app.id !== appId),
      reviews: current.reviews.filter((review) => review.appId !== appId),
    }));

    if (selectedAppId === appId) {
      setSelectedAppId("");
    }

    return { status: "deleted", app: existingApp };
  }

  function deleteBoardEntry(appId: string): DeleteBoardEntryResult {
    const existingApp = findMiniApp(apps, appId);

    if (!existingApp) {
      return { status: "missing", app: null };
    }

    setLoadState((current) => ({
      ...current,
      hiddenBoardAppIds: current.hiddenBoardAppIds.includes(appId)
        ? current.hiddenBoardAppIds
        : [...current.hiddenBoardAppIds, appId],
    }));

    return { status: "deleted", app: existingApp };
  }

  function saveReview() {
    if (!selectedApp) {
      return null;
    }

    const now = new Date().toISOString();
    const review: StoredReview = {
      id: todayReview?.id ?? `${dayKey}:${selectedApp.id}`,
      appId: selectedApp.id,
      tier: draft.tier,
      note: draft.note.trim(),
      scores: draft.scores,
      dayKey,
      reviewedAt: todayReview?.reviewedAt ?? now,
      updatedAt: now,
    };

    setLoadState((current) => ({
      ...current,
      hiddenBoardAppIds: current.hiddenBoardAppIds.filter((id) => id !== selectedApp.id),
      reviews: upsertReview(current.reviews, review),
    }));
    setSaveMessage(now);
    return review;
  }

  function dismissLoadError() {
    setLoadState((current) => ({ ...current, loadError: null }));
  }

  return {
    addCustomApp,
    apps,
    board,
    categoryFilters,
    customAppCount: loadState.customApps.length,
    dayKey,
    draft,
    hiddenBoardAppIds: loadState.hiddenBoardAppIds,
    loadError: loadState.loadError,
    recentEntries,
    reviews: loadState.reviews,
    reviewCount: loadState.reviews.length,
    saveMessage,
    selectedApp,
    selectedAppId,
    setDraft,
    setSelectedAppId,
    shareTemplate,
    setShareTemplate,
    saveReview,
    streak,
    todayPick,
    todayReview,
    weeklySTier,
    dismissLoadError,
    deleteBoardEntry,
    deleteCustomApp,
    isLoaded: loadState.isLoaded,
  };
}
