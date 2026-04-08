"use client";

import { useEffect, useMemo, useState } from "react";
import {
  buildDefaultDraft,
  buildDraftFromReview,
  buildTierBoard,
  findMiniApp,
  getCategoryFilters,
  getRecentEntries,
  getReviewStreak,
  getTodayReview,
  getWeekSTier,
  miniApps,
  normalizeDayKey,
  pickAppForDay,
  type ReviewDraft,
  type ShareTemplate,
  type StoredReview,
  upsertReview,
} from "@/lib/app-ladder";

const storageKey = "app-ladder-storage:v1";

type PersistedState = {
  reviews: StoredReview[];
};

type LoadState = {
  isLoaded: boolean;
  loadError: string | null;
  reviews: StoredReview[];
};

function parseStoredState(rawValue: string | null): PersistedState {
  if (!rawValue) {
    return { reviews: [] };
  }

  const parsed = JSON.parse(rawValue) as Partial<PersistedState>;
  return {
    reviews: Array.isArray(parsed.reviews) ? parsed.reviews : [],
  };
}

export function useAppLadderState(initialAppId?: string, initialDay?: string) {
  const dayKey = normalizeDayKey(initialDay);
  const todayPick = useMemo(() => pickAppForDay(dayKey), [dayKey]);
  const [selectedAppId, setSelectedAppId] = useState(initialAppId ?? todayPick.id);
  const [draft, setDraft] = useState<ReviewDraft>(buildDefaultDraft);
  const [loadState, setLoadState] = useState<LoadState>({
    isLoaded: false,
    loadError: null,
    reviews: [],
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
      });
    } catch {
      setLoadState({
        isLoaded: true,
        loadError:
          "Local data could not be read. You can keep reviewing, but older entries might be unavailable until storage is reset.",
        reviews: [],
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
      }),
    );
  }, [loadState.isLoaded, loadState.reviews]);

  const selectedApp = findMiniApp(selectedAppId) ?? todayPick;
  const todayReview = getTodayReview(loadState.reviews, dayKey);
  const recentEntries = getRecentEntries(loadState.reviews);
  const board = buildTierBoard(loadState.reviews);
  const weeklySTier = getWeekSTier(loadState.reviews, dayKey);
  const streak = getReviewStreak(loadState.reviews, dayKey);
  const categoryFilters = getCategoryFilters();

  useEffect(() => {
    if (!findMiniApp(selectedAppId)) {
      setSelectedAppId(initialAppId ?? todayPick.id);
    }
  }, [initialAppId, selectedAppId, todayPick.id]);

  useEffect(() => {
    if (!loadState.isLoaded) {
      return;
    }

    const seedReview =
      todayReview?.appId === selectedApp.id
        ? todayReview
        : loadState.reviews.find((review) => review.appId === selectedApp.id) ?? null;

    setDraft(buildDraftFromReview(seedReview));
  }, [dayKey, loadState.isLoaded, loadState.reviews, selectedApp.id, todayReview]);

  function saveReview() {
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
      reviews: upsertReview(current.reviews, review),
    }));
    setSaveMessage(now);
    return review;
  }

  function dismissLoadError() {
    setLoadState((current) => ({ ...current, loadError: null }));
  }

  return {
    apps: miniApps,
    board,
    categoryFilters,
    dayKey,
    draft,
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
    isLoaded: loadState.isLoaded,
  };
}
