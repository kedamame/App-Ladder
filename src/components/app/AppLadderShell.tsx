"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toPng } from "html-to-image";
import clsx from "clsx";
import { appConfig } from "@/lib/config";
import {
  tiers,
  type MetricKey,
  type MiniApp,
  type ShareTemplate,
} from "@/lib/app-ladder";
import { useFarcasterMiniApp } from "@/lib/farcaster";
import { useAppLadderState } from "@/lib/use-app-ladder-state";

type AppLadderShellProps = {
  initialAppId?: string;
  initialDay?: string;
};

const sections = [
  { id: "today", label: "Today" },
  { id: "review", label: "Review" },
  { id: "ladder", label: "Ladder" },
  { id: "share", label: "Share" },
] as const;

const metricLabels: Record<MetricKey, string> = {
  fun: "Fun",
  polish: "Polish",
  comeBack: "Come back",
};

const shareOptions: { id: ShareTemplate; label: string }[] = [
  { id: "s-tier", label: "This week's S tier" },
  { id: "top-3", label: "Top 3" },
  { id: "hidden-gem", label: "Hidden gem" },
];

export function AppLadderShell({
  initialAppId,
  initialDay,
}: AppLadderShellProps) {
  const { isInMiniApp, isLoading, user } = useFarcasterMiniApp();
  const {
    apps,
    board,
    categoryFilters,
    dayKey,
    draft,
    loadError,
    recentEntries,
    reviewCount,
    saveMessage,
    selectedApp,
    selectedAppId,
    setDraft,
    setSelectedAppId,
    shareCopy,
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
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [shareStatus, setShareStatus] = useState("");
  const shareCardRef = useRef<HTMLDivElement>(null);

  const surface = isLoading
    ? "Detecting surface"
    : isInMiniApp
      ? "Farcaster miniapp"
      : "Browser / Base App";

  const filteredBoard = useMemo(
    () =>
      board.map((column) => ({
        ...column,
        entries: [...column.entries]
          .filter((entry) =>
            selectedCategory === "All" ? true : entry.app.category === selectedCategory,
          )
          .sort((left, right) =>
            sortOrder === "newest"
              ? right.review.updatedAt.localeCompare(left.review.updatedAt)
              : left.review.updatedAt.localeCompare(right.review.updatedAt),
          ),
      })),
    [board, selectedCategory, sortOrder],
  );

  const flattenedEntries = useMemo(
    () => filteredBoard.flatMap((column) => column.entries),
    [filteredBoard],
  );

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    params.set("app", selectedApp.id);
    params.set("day", dayKey);
    window.history.replaceState({}, "", `?${params.toString()}`);
  }, [dayKey, selectedApp.id]);

  async function handleCopyShare() {
    try {
      await navigator.clipboard.writeText(shareCopy);
      setShareStatus("Share copy copied.");
    } catch {
      setShareStatus("Clipboard copy was blocked in this environment.");
    }
  }

  async function handleDownloadShareCard() {
    if (!shareCardRef.current) {
      setShareStatus("Share card preview is not ready yet.");
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
      setShareStatus("PNG saved from the share preview.");
    } catch {
      setShareStatus("PNG export failed in this browser.");
    }
  }

  return (
    <main className={clsx("app-shell", streak >= 7 && "app-shell-streak-7")}>
      {loadError ? (
        <aside className="status-banner status-banner-warning">
          <p>{loadError}</p>
          <button onClick={dismissLoadError} type="button">
            Dismiss
          </button>
        </aside>
      ) : null}

      <section className="hero-card">
        <div className="hero-copy">
          <p className="eyebrow">App Ladder</p>
          <h1>One Base miniapp a day. Your own tier board by the weekend.</h1>
          <p className="hero-text">
            A solo miniapp journal with a sticker-board attitude. Review in five
            minutes, keep the data local, and share only when the board looks
            sharp enough.
          </p>
          <div className="today-spotlight">
            <AppSticker app={todayPick} />
            <div>
              <p className="mini-profile-label">Today&apos;s one pick</p>
              <h2>{todayPick.name}</h2>
              <p>{todayPick.shortDescription}</p>
            </div>
          </div>
          <div className="hero-actions">
            <a className="button-primary" href="#review">
              Start today&apos;s review
            </a>
            <a className="button-secondary" href="#share">
              Build a share card
            </a>
          </div>
        </div>
        <div className="hero-panel">
          <div className="surface-chip">
            <span className="surface-dot" />
            {surface}
          </div>
          <div className="mini-profile">
            <p className="mini-profile-label">Current session</p>
            <strong>{user?.displayName ?? user?.username ?? "Guest collector"}</strong>
            <span>
              {user?.fid
                ? `FID ${user.fid}`
                : "No login required for the MVP core loop"}
            </span>
          </div>
          <div className="status-stack">
            <StatusPill
              label="Today"
              value={todayReview ? `${todayReview.tier} tier locked` : "No review yet"}
            />
            <StatusPill label="Streak" value={`${streak} day`} />
            <StatusPill label="Board" value={`${reviewCount} reviews`} />
          </div>
          <dl className="config-list">
            <div>
              <dt>App URL</dt>
              <dd>{appConfig.appUrl}</dd>
            </div>
            <div>
              <dt>Base App ID</dt>
              <dd>{appConfig.baseAppId}</dd>
            </div>
            <div>
              <dt>Surface</dt>
              <dd>{surface}</dd>
            </div>
            <div>
              <dt>Day key</dt>
              <dd>{dayKey}</dd>
            </div>
          </dl>
        </div>
      </section>

      <nav className="section-nav" aria-label="App sections">
        {sections.map((section) => (
          <a key={section.id} href={`#${section.id}`}>
            {section.label}
          </a>
        ))}
      </nav>

      <section className="grid-shell">
        <article id="today" className="board-card board-card-wide">
          <div className="card-kicker">Today</div>
          <div className="section-heading">
            <div>
              <h2>Home base for the daily loop</h2>
              <p>
                Pick one app, leave a sharp note, and let the ladder grow at a
                human pace. No account, no backend, no pressure.
              </p>
            </div>
          </div>
          <div className="overview-grid">
            <div className="feature-tile">
              <p className="mini-profile-label">Today&apos;s review target</p>
              <div className="tile-row">
                <AppSticker app={todayPick} />
                <div>
                  <h3>{todayPick.name}</h3>
                  <p>{todayPick.category}</p>
                </div>
              </div>
              <p className="muted-copy">{todayPick.shortDescription}</p>
            </div>
            <div className="feature-tile">
              <p className="mini-profile-label">Daily status</p>
              {todayReview ? (
                <div className="review-snapshot">
                  <strong>{todayReview.tier} tier saved today</strong>
                  <p>{todayReview.note || "No short note yet."}</p>
                </div>
              ) : (
                <EmptyState
                  title="Today is still open"
                  body="You have not saved a review for this day yet. Pick one app and pin it to the board."
                />
              )}
            </div>
            <div className="feature-tile">
              <p className="mini-profile-label">Recent reviews</p>
              {recentEntries.length ? (
                <div className="review-list">
                  {recentEntries.map(({ app, review }) => (
                    <button
                      key={review.id}
                      className="review-list-item"
                      onClick={() => setSelectedAppId(app.id)}
                      type="button"
                    >
                      <span className="tier-badge">{review.tier}</span>
                      <div>
                        <strong>{app.name}</strong>
                        <p>{review.note || "Freshly ranked."}</p>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="No reviews yet"
                  body="Your first review will unlock the recent activity strip here."
                />
              )}
            </div>
          </div>
        </article>

        <article id="review" className="board-card board-card-wide">
          <div className="card-kicker">Review</div>
          <div className="section-heading">
            <div>
              <h2>5 minute review studio</h2>
              <p>
                Browse the static miniapp set, choose today&apos;s candidate, and
                save one private rating for this day.
              </p>
            </div>
            {saveMessage ? <p className="status-inline">{saveMessage}</p> : null}
          </div>
          <div className="review-grid">
            <div className="catalog-grid">
              {apps.map((app) => (
                <button
                  key={app.id}
                  className={clsx(
                    "catalog-card",
                    selectedAppId === app.id && "catalog-card-active",
                  )}
                  onClick={() => setSelectedAppId(app.id)}
                  type="button"
                >
                  <AppSticker app={app} compact />
                  <div>
                    <strong>{app.name}</strong>
                    <p>{app.category}</p>
                  </div>
                </button>
              ))}
            </div>

            <div className="review-panel">
              <div className="selected-app-card">
                <AppSticker app={selectedApp} />
                <div>
                  <p className="mini-profile-label">Selected miniapp</p>
                  <h3>{selectedApp.name}</h3>
                  <p>{selectedApp.shortDescription}</p>
                  <a href={selectedApp.externalUrl} rel="noreferrer" target="_blank">
                    Open external link
                  </a>
                </div>
              </div>

              <div className="field-stack">
                <div>
                  <label className="field-label">Tier</label>
                  <div className="tier-row">
                    {tiers.map((tier) => (
                      <button
                        key={tier}
                        className={clsx(
                          "tier-option",
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
                    <label key={metricKey} className="slider-card">
                      <span className="field-label">{label}</span>
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
                  <span className="field-label">Short note</span>
                  <textarea
                    maxLength={160}
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        note: event.target.value,
                      }))
                    }
                    placeholder="What made this one stick with you today?"
                    rows={4}
                    value={draft.note}
                  />
                </label>

                <button className="button-primary full-width-button" onClick={saveReview} type="button">
                  Save today&apos;s review
                </button>
              </div>
            </div>
          </div>
        </article>

        <article id="ladder" className="board-card board-card-wide">
          <div className="card-kicker">Ladder</div>
          <div className="section-heading">
            <div>
              <h2>Private tier board</h2>
              <p>
                Filter by category, switch the order, and keep the latest review
                per miniapp as the board truth.
              </p>
            </div>
          </div>
          <div className="controls-row">
            <div className="control-group">
              {categoryFilters.map((category) => (
                <button
                  key={category}
                  className={clsx(
                    "control-pill",
                    selectedCategory === category && "control-pill-active",
                  )}
                  onClick={() => setSelectedCategory(category)}
                  type="button"
                >
                  {category}
                </button>
              ))}
            </div>
            <div className="control-group">
              {[
                { id: "newest", label: "Newest first" },
                { id: "oldest", label: "Oldest first" },
              ].map((option) => (
                <button
                  key={option.id}
                  className={clsx(
                    "control-pill",
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
          <div className="tier-board-grid">
            {filteredBoard.map((column) => (
              <div key={column.tier} className="tier-column">
                <div className="tier-column-head">
                  <span>{column.tier}</span>
                  <small>{column.entries.length}</small>
                </div>
                {column.entries.length ? (
                  column.entries.map((entry) => (
                    <div key={entry.review.id} className="tier-entry">
                      <AppSticker app={entry.app} compact />
                      <div>
                        <strong>{`${entry.review.tier} tier | ${entry.app.name}`}</strong>
                        <p>{entry.review.note || "Boarded without a note."}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <EmptyState
                    title={`No ${column.tier} tier yet`}
                    body="A saved review will drop a sticker here."
                    compact
                  />
                )}
              </div>
            ))}
          </div>
        </article>

        <article id="share" className="board-card board-card-wide">
          <div className="card-kicker">Share</div>
          <div className="section-heading">
            <div>
              <h2>Share card studio</h2>
              <p>
                Preview a tall card, export a PNG, and copy a short cast line
                without leaving the app.
              </p>
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
                      shareTemplate === template.id && "share-template-pill-active",
                    )}
                    onClick={() => setShareTemplate(template.id)}
                    type="button"
                  >
                    {template.label}
                  </button>
                ))}
              </div>
              <div className="share-copy-box">
                <p>{shareCopy}</p>
              </div>
              <div className="share-action-row">
                <button className="button-primary" onClick={handleDownloadShareCard} type="button">
                  Save PNG
                </button>
                <button className="button-secondary" onClick={handleCopyShare} type="button">
                  Copy cast text
                </button>
              </div>
            </div>

            <div ref={shareCardRef} className="share-card-preview">
              <div className="share-card-meta">
                <span>APP LADDER</span>
                <span>{dayKey}</span>
              </div>
              <div className="share-card-headline">
                <strong>{shareOptions.find((option) => option.id === shareTemplate)?.label}</strong>
                <h3>Private Base miniapp tier list</h3>
                <p>
                  {flattenedEntries.length
                    ? `${flattenedEntries.length} apps ranked with a ${streak}-day streak.`
                    : "Start reviewing to generate your first board card."}
                </p>
              </div>
              <div className="weekly-stack">
                {flattenedEntries.length ? (
                  flattenedEntries.slice(0, 4).map((entry) => (
                    <div key={entry.review.id} className="weekly-item">
                      <AppSticker app={entry.app} compact />
                      <div>
                        <strong>{`${entry.review.tier} tier | ${entry.app.name}`}</strong>
                        <p>{entry.review.note || "Pinned without a note."}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <EmptyState
                    title="Nothing ranked yet"
                    body="The share card will fill itself from your saved reviews."
                  />
                )}
              </div>
              <div className="share-card-footer">
                <span>base + farcaster + browser</span>
                <span>solo collection mode</span>
              </div>
            </div>
          </div>
        </article>

        <article className="board-card">
          <div className="card-kicker">Weekly</div>
          <h2>S tier roundup</h2>
          <p>Last 7 days of S-tier hits, ready for a share card and cast caption.</p>
          {weeklySTier.length ? (
            <div className="weekly-stack">
              {weeklySTier.map(({ app, review }) => (
                <div key={review.id} className="weekly-item">
                  <AppSticker app={app} compact />
                  <div>
                    <strong>{app.name}</strong>
                    <p>{review.note || "No note attached yet."}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No S tier this week"
              body="Once something really lands, it will surface here for sharing."
            />
          )}
        </article>
      </section>

      <footer className="footer-note">
        <p>
          {isLoaded
            ? "Catalog, local-first reviews, filters, share copy, PNG export, and generated miniapp assets are live."
            : "Loading local board data..."}
        </p>
        <Link href="/.well-known/farcaster.json" target="_blank">
          Inspect manifest
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
      <span>{app.badge}</span>
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
