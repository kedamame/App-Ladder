"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toPng } from "html-to-image";
import clsx from "clsx";
import { appConfig } from "@/lib/config";
import {
  buildShareCopy,
  tiers,
  type AppLocale,
  type CustomMiniAppInput,
  type MetricKey,
  type MiniApp,
} from "@/lib/app-ladder";
import { useFarcasterMiniApp } from "@/lib/farcaster";
import { sections, shareOptions, uiCopy } from "@/lib/ui-copy";
import { useAppLadderState } from "@/lib/use-app-ladder-state";

type AppLadderShellProps = {
  initialAppId?: string;
  initialDay?: string;
};

const localeStorageKey = "app-ladder-locale:v1";

const metricLabels: Record<MetricKey, string> = {
  fun: "fun",
  polish: "polish",
  comeBack: "comeBack",
};

const emptyCustomAppDraft: CustomMiniAppInput = {
  name: "",
  category: "",
  shortDescription: "",
  imageUrl: "",
  externalUrl: "",
};

export function AppLadderShell({
  initialAppId,
  initialDay,
}: AppLadderShellProps) {
  const { isInMiniApp, isLoading, user } = useFarcasterMiniApp();
  const {
    addCustomApp,
    apps,
    board,
    categoryFilters,
    dayKey,
    deleteBoardEntry,
    deleteCustomApp,
    draft,
    hiddenBoardAppIds,
    loadError,
    recentEntries,
    reviews,
    reviewCount,
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
    isLoaded,
  } = useAppLadderState(initialAppId, initialDay);
  const [locale, setLocale] = useState<AppLocale>("en");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [ladderStatus, setLadderStatus] = useState("");
  const [reviewStatus, setReviewStatus] = useState("");
  const [catalogStatus, setCatalogStatus] = useState("");
  const [catalogQuery, setCatalogQuery] = useState("");
  const [customAppDraft, setCustomAppDraft] =
    useState<CustomMiniAppInput>(emptyCustomAppDraft);
  const [isAutofilling, setIsAutofilling] = useState(false);
  const [shareStatus, setShareStatus] = useState("");
  const shareCardRef = useRef<HTMLDivElement>(null);
  const text = uiCopy[locale];

  const surface = isLoading
    ? text.detectSurface
    : isInMiniApp
      ? "Farcaster miniapp"
      : "Browser / Base App";
  const shareCopy = useMemo(
    () => buildShareCopy(shareTemplate, apps, reviews, locale),
    [apps, locale, reviews, shareTemplate],
  );

  const filteredBoard = useMemo(
    () =>
      board.map((column) => ({
        ...column,
        entries: [...column.entries]
          .filter((entry) => !hiddenBoardAppIds.includes(entry.app.id))
          .filter((entry) =>
            selectedCategory === "All" ? true : entry.app.category === selectedCategory,
          )
          .sort((left, right) =>
            sortOrder === "newest"
              ? right.review.updatedAt.localeCompare(left.review.updatedAt)
              : left.review.updatedAt.localeCompare(right.review.updatedAt),
          ),
      })),
    [board, hiddenBoardAppIds, selectedCategory, sortOrder],
  );

  const shareEntries = useMemo(
    () =>
      board.flatMap((column) =>
        [...column.entries].sort((left, right) =>
          sortOrder === "newest"
            ? right.review.updatedAt.localeCompare(left.review.updatedAt)
            : left.review.updatedAt.localeCompare(right.review.updatedAt),
        ),
      ),
    [board, sortOrder],
  );

  const visibleApps = useMemo(() => {
    const query = catalogQuery.trim().toLowerCase();

    if (!query) {
      return apps;
    }

    return apps.filter((app) =>
      [app.name, app.category, app.shortDescription, app.externalUrl].some((value) =>
        value.toLowerCase().includes(query),
      ),
    );
  }, [apps, catalogQuery]);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(localeStorageKey);
      if (stored === "en" || stored === "ja") {
        setLocale(stored);
      }
    } catch {
      // Keep English as the default when storage is unavailable.
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
    try {
      window.localStorage.setItem(localeStorageKey, locale);
    } catch {
      // Ignore locale persistence failures.
    }
  }, [locale]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    params.set("day", dayKey);

    if (selectedApp?.id) {
      params.set("app", selectedApp.id);
    } else {
      params.delete("app");
    }

    window.history.replaceState({}, "", `?${params.toString()}`);
  }, [dayKey, selectedApp?.id]);

  function getCategoryLabel(category: string) {
    return category === "All" ? text.ladder.all : category;
  }

  async function handleCopyShare() {
    try {
      await navigator.clipboard.writeText(shareCopy);
      setShareStatus(text.share.copied);
    } catch {
      setShareStatus(text.share.blocked);
    }
  }

  async function handleDownloadShareCard() {
    if (!shareCardRef.current) {
      setShareStatus(text.share.notReady);
      return;
    }

    try {
      const dataUrl = await toPng(shareCardRef.current, {
        cacheBust: true,
        pixelRatio: 2,
      });
      const anchor = document.createElement("a");
      anchor.download = `app-ladder-${dayKey}.png`;
      anchor.href = dataUrl;
      anchor.click();
      setShareStatus(text.share.pngSaved);
    } catch {
      setShareStatus(text.share.pngFailed);
    }
  }

  function handleSaveReview() {
    if (!selectedApp) {
      setReviewStatus(text.review.saveDisabled);
      return;
    }

    saveReview();
    setReviewStatus(text.review.saved(selectedApp.name, dayKey));
  }

  function handleCustomAppField<K extends keyof CustomMiniAppInput>(
    key: K,
    value: CustomMiniAppInput[K],
  ) {
    setCustomAppDraft((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function handleAddCustomApp() {
    const result = addCustomApp(customAppDraft);

    if (result.status === "invalid") {
      setCatalogStatus(text.review.addAnyInvalid);
      return;
    }

    if (result.status === "existing") {
      setCatalogStatus(text.review.addAnyExists(result.app.name));
      return;
    }

    setCatalogStatus(text.review.addAnySaved(result.app.name));
    setCatalogQuery("");
    setCustomAppDraft(emptyCustomAppDraft);
  }

  function handleDeleteCustomApp(app: MiniApp) {
    if (!window.confirm(text.review.deleteConfirm(app.name))) {
      return;
    }

    const result = deleteCustomApp(app.id);

    if (result.status === "missing") {
      setCatalogStatus(text.review.deleteMissing);
      return;
    }

    setCatalogStatus(text.review.deleteDone(result.app.name));

    if (selectedAppId === app.id) {
      setReviewStatus("");
    }
  }

  function handleDeleteBoardEntry(app: MiniApp) {
    if (!window.confirm(text.ladder.deleteConfirm(app.name))) {
      return;
    }

    const result = deleteBoardEntry(app.id);

    if (result.status === "missing") {
      setLadderStatus(text.ladder.deleteMissing);
      return;
    }

    setLadderStatus(text.ladder.deleteDone(result.app.name));

    if (selectedAppId === app.id) {
      setReviewStatus("");
    }
  }

  async function handleAutofillFromUrl() {
    if (!customAppDraft.externalUrl.trim()) {
      setCatalogStatus(text.review.autofillInvalid);
      return;
    }

    setIsAutofilling(true);
    setCatalogStatus(text.review.autofillLoading);

    try {
      const response = await fetch("/api/miniapp-metadata", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          url: customAppDraft.externalUrl,
        }),
      });

      const payload = (await response.json()) as {
        error?: string;
        imageUrl?: string;
        name?: string;
        resolvedUrl?: string;
        shortDescription?: string;
      };

      if (!response.ok) {
        setCatalogStatus(payload.error || text.review.autofillFailed);
        return;
      }

      setCustomAppDraft((current) => ({
        ...current,
        externalUrl: payload.resolvedUrl || current.externalUrl,
        imageUrl: payload.imageUrl || current.imageUrl,
        name: payload.name || current.name,
        shortDescription: payload.shortDescription || current.shortDescription,
      }));
      setCatalogStatus(text.review.autofillSuccess);
    } catch {
      setCatalogStatus(text.review.autofillFailed);
    } finally {
      setIsAutofilling(false);
    }
  }

  return (
    <main className={clsx("app-shell", streak >= 7 && "app-shell-streak-7")}>
      {loadError ? (
        <aside className="status-banner status-banner-warning">
          <p>{text.loadError}</p>
          <button onClick={dismissLoadError} type="button">
            {text.dismiss}
          </button>
        </aside>
      ) : null}

      <section className="hero-card hero-card-refined">
        <div className="hero-topbar">
          <p className="eyebrow">{text.heroEyebrow}</p>
          <div className="locale-switcher" role="group" aria-label="Language switcher">
            <button
              className={clsx("locale-button", locale === "en" && "locale-button-active")}
              onClick={() => setLocale("en")}
              type="button"
            >
              EN
            </button>
            <button
              className={clsx("locale-button", locale === "ja" && "locale-button-active")}
              onClick={() => setLocale("ja")}
              type="button"
            >
              JP
            </button>
          </div>
        </div>
        <div className="hero-copy">
          <h1>{text.heroTitle}</h1>
          <p className="hero-text">{text.heroText}</p>
          <div className="today-spotlight today-spotlight-refined">
            {todayPick ? (
              <>
                <AppSticker app={todayPick} />
                <div>
                  <p className="mini-profile-label">{text.todayPick}</p>
                  <h2>{todayPick.name}</h2>
                  <p>{todayPick.shortDescription}</p>
                </div>
              </>
            ) : (
              <EmptyState title={text.today.emptyPickTitle} body={text.today.emptyPickBody} />
            )}
          </div>
          <div className="hero-actions">
            <a className="button-primary" href="#review">
              {text.startReview}
            </a>
            <a className="button-secondary" href="#share">
              {text.openShare}
            </a>
          </div>
        </div>
        <div className="hero-panel hero-panel-refined">
          <div className="surface-chip surface-chip-refined">
            <span className="surface-dot" />
            {surface}
          </div>
          <div className="mini-profile">
            <p className="mini-profile-label">{text.currentSession}</p>
            <strong>{user?.displayName ?? user?.username ?? text.guest}</strong>
            <span>{user?.fid ? `FID ${user.fid}` : text.guestCopy}</span>
          </div>
          <div className="status-stack">
            <StatusPill
              label={text.statuses.today}
              value={todayReview ? text.locked(todayReview.tier) : text.noReview}
            />
            <StatusPill label={text.statuses.streak} value={text.days(streak)} />
            <StatusPill label={text.statuses.board} value={text.reviews(reviewCount)} />
          </div>
          <dl className="config-list">
            <div>
              <dt>{text.config.appUrl}</dt>
              <dd>{appConfig.appUrl}</dd>
            </div>
            <div>
              <dt>{text.config.appId}</dt>
              <dd>{appConfig.baseAppId}</dd>
            </div>
            <div>
              <dt>{text.config.surface}</dt>
              <dd>{surface}</dd>
            </div>
            <div>
              <dt>{text.config.dayKey}</dt>
              <dd>{dayKey}</dd>
            </div>
          </dl>
        </div>
      </section>

      <nav className="section-nav section-nav-refined" aria-label="App sections">
        {sections.map((section) => (
          <a key={section.id} href={`#${section.id}`}>
            {text.nav[section.key]}
          </a>
        ))}
      </nav>

      <section className="grid-shell">
        <article id="today" className="board-card board-card-wide board-card-refined">
          <div className="card-kicker">{text.today.kicker}</div>
          <div className="section-heading">
            <div>
              <h2>{text.today.title}</h2>
              <p>{text.today.body}</p>
            </div>
          </div>
          <div className="overview-grid">
            <div className="feature-tile feature-tile-refined">
              <p className="mini-profile-label">{text.today.target}</p>
              {todayPick ? (
                <>
                  <div className="tile-row">
                    <AppSticker app={todayPick} />
                    <div>
                      <h3>{todayPick.name}</h3>
                      <p>{todayPick.category}</p>
                    </div>
                  </div>
                  <p className="muted-copy">{todayPick.shortDescription}</p>
                </>
              ) : (
                <EmptyState title={text.today.emptyPickTitle} body={text.today.emptyPickBody} />
              )}
            </div>
            <div className="feature-tile feature-tile-refined">
              <p className="mini-profile-label">{text.today.status}</p>
              {todayReview ? (
                <div className="review-snapshot">
                  <strong>{text.today.savedToday(todayReview.tier)}</strong>
                  <p>{todayReview.note || text.today.noShortNote}</p>
                </div>
              ) : (
                <EmptyState title={text.today.openTitle} body={text.today.openBody} />
              )}
            </div>
            <div className="feature-tile feature-tile-refined">
              <p className="mini-profile-label">{text.today.recent}</p>
              {recentEntries.length ? (
                <div className="review-list">
                  {recentEntries.map(({ app, review }) => (
                    <button
                      key={review.id}
                      className="review-list-item review-list-item-refined"
                      onClick={() => setSelectedAppId(app.id)}
                      type="button"
                    >
                      <span className="tier-badge">{review.tier}</span>
                      <div>
                        <strong>{app.name}</strong>
                        <p>{review.note || text.today.freshlyRanked}</p>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <EmptyState title={text.today.noReviewsTitle} body={text.today.noReviewsBody} />
              )}
            </div>
          </div>
        </article>

        <article id="review" className="board-card board-card-wide board-card-refined">
          <div className="card-kicker">{text.review.kicker}</div>
          <div className="section-heading">
            <div>
              <h2>{text.review.title}</h2>
              <p>{text.review.body}</p>
            </div>
            {reviewStatus ? <p className="status-inline">{reviewStatus}</p> : null}
          </div>
          <div className="review-grid">
            <div className="review-selector-stack">
              <div className="catalog-toolbar">
                <label className="search-field">
                  <span className="field-label">{text.review.searchLabel}</span>
                  <input
                    onChange={(event) => setCatalogQuery(event.target.value)}
                    placeholder={text.review.searchPlaceholder}
                    type="search"
                    value={catalogQuery}
                  />
                </label>
                <p className="catalog-meta">
                  {text.review.catalogCount(visibleApps.length, apps.length)}
                </p>
              </div>

              {visibleApps.length ? (
                <div className="catalog-grid">
                  {visibleApps.map((app) => (
                    <button
                      key={app.id}
                      className={clsx(
                        "catalog-card",
                        "catalog-card-refined",
                        selectedAppId === app.id && "catalog-card-active",
                      )}
                      onClick={() => setSelectedAppId(app.id)}
                      type="button"
                    >
                      <AppSticker app={app} compact />
                      <div className="catalog-card-copy">
                        <div className="catalog-card-head">
                          <strong>{app.name}</strong>
                          <button
                            aria-label={text.review.deleteAction}
                            className="icon-button-delete"
                            onClick={(event) => {
                              event.preventDefault();
                              event.stopPropagation();
                              handleDeleteCustomApp(app);
                            }}
                            type="button"
                          >
                            {text.review.deleteAction}
                          </button>
                        </div>
                        <p>{app.category}</p>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <EmptyState title={text.review.noMatchesTitle} body={text.review.noMatchesBody} />
              )}

              <div className="custom-app-card custom-app-card-refined">
                <div className="section-heading section-heading-compact">
                  <div>
                    <p className="mini-profile-label">{text.review.addAnyTitle}</p>
                    <h3>{text.review.addAnyTitle}</h3>
                    <p>{text.review.addAnyBody}</p>
                  </div>
                </div>
                {catalogStatus ? <p className="status-inline">{catalogStatus}</p> : null}
                <div className="custom-form-grid">
                  <label className="input-field input-field-full">
                    <span className="field-label">{text.review.imageLabel}</span>
                    <input
                      onChange={(event) => handleCustomAppField("imageUrl", event.target.value)}
                      placeholder={text.review.imagePlaceholder}
                      type="url"
                      value={customAppDraft.imageUrl}
                    />
                  </label>
                  <label className="input-field input-field-full">
                    <span className="field-label">{text.review.urlLabel}</span>
                    <input
                      onChange={(event) =>
                        handleCustomAppField("externalUrl", event.target.value)
                      }
                      placeholder={text.review.urlPlaceholder}
                      type="url"
                      value={customAppDraft.externalUrl}
                    />
                  </label>
                  <div className="autofill-row input-field-full">
                    <button
                      className="button-secondary"
                      disabled={isAutofilling}
                      onClick={handleAutofillFromUrl}
                      type="button"
                    >
                      {isAutofilling ? text.review.autofillLoading : text.review.autofill}
                    </button>
                  </div>
                  <label className="input-field">
                    <span className="field-label">{text.review.nameLabel}</span>
                    <input
                      onChange={(event) => handleCustomAppField("name", event.target.value)}
                      placeholder={text.review.namePlaceholder}
                      type="text"
                      value={customAppDraft.name}
                    />
                  </label>
                  <label className="input-field">
                    <span className="field-label">{text.review.categoryLabel}</span>
                    <input
                      onChange={(event) => handleCustomAppField("category", event.target.value)}
                      placeholder={text.review.categoryPlaceholder}
                      type="text"
                      value={customAppDraft.category}
                    />
                  </label>
                  <label className="input-field input-field-full">
                    <span className="field-label">{text.review.descriptionLabel}</span>
                    <textarea
                      onChange={(event) =>
                        handleCustomAppField("shortDescription", event.target.value)
                      }
                      placeholder={text.review.descriptionPlaceholder}
                      rows={3}
                      value={customAppDraft.shortDescription}
                    />
                  </label>
                </div>
                <button
                  className="button-secondary full-width-button"
                  onClick={handleAddCustomApp}
                  type="button"
                >
                  {text.review.addAny}
                </button>
              </div>
            </div>

            <div className="review-panel review-panel-refined">
              {selectedApp ? (
                <div className="selected-app-card selected-app-card-refined">
                  <AppSticker app={selectedApp} />
                  <div>
                    <div className="selected-app-head">
                      <p className="mini-profile-label">{text.review.selected}</p>
                      <button
                        className="icon-button-delete"
                        onClick={() => handleDeleteCustomApp(selectedApp)}
                        type="button"
                      >
                        {text.review.deleteAction}
                      </button>
                    </div>
                    <h3>{selectedApp.name}</h3>
                    <p>{selectedApp.shortDescription}</p>
                    <a href={selectedApp.externalUrl} rel="noreferrer" target="_blank">
                      {text.review.external}
                    </a>
                  </div>
                </div>
              ) : (
                <EmptyState
                  title={text.review.selectedEmptyTitle}
                  body={text.review.selectedEmptyBody}
                />
              )}

              <div className="field-stack">
                <div>
                  <label className="field-label">{text.review.tier}</label>
                  <div className="tier-row">
                    {tiers.map((tier) => (
                      <button
                        key={tier}
                        className={clsx(
                          "tier-option",
                          "tier-option-refined",
                          draft.tier === tier && "tier-option-active",
                        )}
                        onClick={() =>
                          setDraft((current) => ({
                            ...current,
                            tier,
                          }))
                        }
                        type="button"
                      >
                        {tier}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="metrics-grid">
                  {Object.entries(metricLabels).map(([metricKey, label]) => (
                    <label key={metricKey} className="slider-card slider-card-refined">
                      <span className="field-label">{text.review[label as MetricKey]}</span>
                      <div className="slider-row">
                        <input
                          max={5}
                          min={1}
                          onChange={(event) =>
                            setDraft((current) => ({
                              ...current,
                              scores: {
                                ...current.scores,
                                [metricKey]: Number(event.target.value),
                              },
                            }))
                          }
                          type="range"
                          value={draft.scores[metricKey as MetricKey]}
                        />
                        <strong>{draft.scores[metricKey as MetricKey]}</strong>
                      </div>
                    </label>
                  ))}
                </div>

                <label className="note-field">
                  <span className="field-label">{text.review.shortNote}</span>
                  <textarea
                    maxLength={160}
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        note: event.target.value,
                      }))
                    }
                    placeholder={text.review.placeholder}
                    rows={4}
                    value={draft.note}
                  />
                </label>

                <button
                  className="button-primary full-width-button"
                  disabled={!selectedApp}
                  onClick={handleSaveReview}
                  type="button"
                >
                  {selectedApp ? text.review.save : text.review.saveDisabled}
                </button>
              </div>
            </div>
          </div>
        </article>

        <article id="ladder" className="board-card board-card-wide board-card-refined">
          <div className="card-kicker">{text.ladder.kicker}</div>
          <div className="section-heading">
            <div>
              <h2>{text.ladder.title}</h2>
              <p>{text.ladder.body}</p>
            </div>
            {ladderStatus ? <p className="status-inline">{ladderStatus}</p> : null}
          </div>
          <div className="controls-row controls-row-refined">
            <div className="control-group">
              {categoryFilters.map((category) => (
                <button
                  key={category}
                  className={clsx(
                    "control-pill",
                    "control-pill-refined",
                    selectedCategory === category && "control-pill-active",
                  )}
                  onClick={() => setSelectedCategory(category)}
                  type="button"
                >
                  {getCategoryLabel(category)}
                </button>
              ))}
            </div>
            <div className="control-group">
              {[
                { id: "newest", label: text.ladder.newest },
                { id: "oldest", label: text.ladder.oldest },
              ].map((option) => (
                <button
                  key={option.id}
                  className={clsx(
                    "control-pill",
                    "control-pill-refined",
                    sortOrder === option.id && "control-pill-active",
                  )}
                  onClick={() => setSortOrder(option.id as typeof sortOrder)}
                  type="button"
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
          <div className="tier-board-grid tier-board-grid-refined">
            {filteredBoard.map((column) => (
              <div key={column.tier} className="tier-column tier-column-refined">
                <div className="tier-column-head">
                  <span>{column.tier}</span>
                  <small>{column.entries.length}</small>
                </div>
                {column.entries.length ? (
                  column.entries.map((entry) => (
                    <div key={entry.review.id} className="tier-entry tier-entry-refined">
                      <AppSticker app={entry.app} compact />
                      <div>
                        <div className="tier-entry-head">
                          <strong>{`${entry.review.tier} tier | ${entry.app.name}`}</strong>
                          <button
                            className="icon-button-delete"
                            onClick={() => handleDeleteBoardEntry(entry.app)}
                            type="button"
                          >
                            {text.ladder.deleteAction}
                          </button>
                        </div>
                        <p>{entry.review.note || text.ladder.noNote}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <EmptyState
                    title={text.ladder.emptyTitle(column.tier)}
                    body={text.ladder.emptyBody}
                    compact
                  />
                )}
              </div>
            ))}
          </div>
        </article>

        <article id="share" className="board-card board-card-wide board-card-refined">
          <div className="card-kicker">{text.share.kicker}</div>
          <div className="section-heading">
            <div>
              <h2>{text.share.title}</h2>
              <p>{text.share.body}</p>
            </div>
            {shareStatus ? <p className="status-inline">{shareStatus}</p> : null}
          </div>
          <div className="review-grid">
            <div>
              <div className="share-template-row">
                {shareOptions.map((template) => (
                  <button
                    key={template.id}
                    className={clsx(
                      "share-template-pill",
                      "share-template-pill-refined",
                      shareTemplate === template.id && "share-template-pill-active",
                    )}
                    onClick={() => setShareTemplate(template.id)}
                    type="button"
                  >
                    {text.share[template.key]}
                  </button>
                ))}
              </div>
              <div className="share-copy-box share-copy-box-refined">
                <p>{shareCopy}</p>
              </div>
              <div className="share-action-row">
                <button className="button-primary" onClick={handleDownloadShareCard} type="button">
                  {text.share.savePng}
                </button>
                <button className="button-secondary" onClick={handleCopyShare} type="button">
                  {text.share.copy}
                </button>
              </div>
            </div>

            <div ref={shareCardRef} className="share-card-preview share-card-preview-refined">
              <div className="share-card-meta">
                <span>{appConfig.name}</span>
                <span>{dayKey}</span>
              </div>
              <div className="share-card-headline">
                <strong>{text.share[shareOptions.find((option) => option.id === shareTemplate)!.key]}</strong>
                <h3>{text.share.cardTitle}</h3>
                <p>
                  {shareEntries.length
                    ? text.share.cardCount(shareEntries.length, streak)
                    : text.share.cardEmpty}
                </p>
              </div>
              <div className="weekly-stack">
                {shareEntries.length ? (
                  shareEntries.slice(0, 4).map((entry) => (
                    <div key={entry.review.id} className="weekly-item weekly-item-refined">
                      <AppSticker app={entry.app} compact />
                      <div>
                        <strong>{`${entry.review.tier} tier | ${entry.app.name}`}</strong>
                        <p>{entry.review.note || text.share.noNote}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <EmptyState title={text.share.nothingTitle} body={text.share.nothingBody} />
                )}
              </div>
              <div className="share-card-footer">
                <span>{text.share.footerLeft}</span>
                <span>{text.share.footerRight}</span>
              </div>
            </div>
          </div>
        </article>

        <article className="board-card board-card-refined">
          <div className="card-kicker">{text.weekly.kicker}</div>
          <h2>{text.weekly.title}</h2>
          <p>{text.weekly.body}</p>
          {weeklySTier.length ? (
            <div className="weekly-stack">
              {weeklySTier.map(({ app, review }) => (
                <div key={review.id} className="weekly-item weekly-item-refined">
                  <AppSticker app={app} compact />
                  <div>
                    <strong>{app.name}</strong>
                    <p>{review.note || text.weekly.noNote}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title={text.weekly.emptyTitle} body={text.weekly.emptyBody} />
          )}
        </article>
      </section>

      <footer className="footer-note footer-note-refined">
        <p>{isLoaded ? text.footerLoaded : text.footerLoading}</p>
        <Link href="/.well-known/farcaster.json" target="_blank">
          {text.inspectManifest}
        </Link>
      </footer>
    </main>
  );
}

function AppSticker({
  app,
  compact = false,
}: {
  app: MiniApp;
  compact?: boolean;
}) {
  return (
    <div
      className={clsx("app-sticker", compact && "app-sticker-compact")}
      style={
        {
          "--sticker-accent": app.accent,
          "--sticker-wash": app.wash,
        } as CSSProperties
      }
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img alt={app.name} className="app-sticker-image" src={app.imageUrl} />
    </div>
  );
}

function EmptyState({
  title,
  body,
  compact = false,
}: {
  title: string;
  body: string;
  compact?: boolean;
}) {
  return (
    <div className={clsx("empty-state", compact && "empty-state-compact")}>
      <strong>{title}</strong>
      <p>{body}</p>
    </div>
  );
}

function StatusPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="status-pill">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
