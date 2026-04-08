import { NextResponse } from "next/server";

const maxHtmlLength = 200_000;
const requestTimeoutMs = 10_000;

function extractMetaContent(html: string, key: string) {
  const patterns = [
    new RegExp(
      `<meta[^>]+(?:property|name)=["']${key}["'][^>]+content=["']([^"']+)["'][^>]*>`,
      "i",
    ),
    new RegExp(
      `<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${key}["'][^>]*>`,
      "i",
    ),
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);

    if (match?.[1]) {
      return decodeHtml(match[1].trim());
    }
  }

  return "";
}

function extractTitle(html: string) {
  const match = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  return match?.[1] ? decodeHtml(match[1].trim()) : "";
}

function extractLinkHref(html: string, relMatcher: RegExp) {
  const matches = Array.from(html.matchAll(/<link\b[^>]*>/gi));

  for (const match of matches) {
    const tag = match[0];
    const rel = tag.match(/\brel=["']([^"']+)["']/i)?.[1] ?? "";

    if (!relMatcher.test(rel)) {
      continue;
    }

    const href = tag.match(/\bhref=["']([^"']+)["']/i)?.[1];

    if (href) {
      return decodeHtml(href.trim());
    }
  }

  return "";
}

function extractBestManifestIcon(manifest: unknown) {
  if (!manifest || typeof manifest !== "object") {
    return "";
  }

  const icons = (manifest as { icons?: Array<{ sizes?: string; src?: string }> }).icons;

  if (!Array.isArray(icons) || !icons.length) {
    return "";
  }

  const ranked = [...icons].sort((left, right) => {
    const leftSize = parseLargestIconSize(left.sizes);
    const rightSize = parseLargestIconSize(right.sizes);
    return rightSize - leftSize;
  });

  return ranked[0]?.src?.trim() ?? "";
}

function extractMiniAppManifestIcon(manifest: unknown) {
  if (!manifest || typeof manifest !== "object") {
    return "";
  }

  const miniapp = (manifest as { miniapp?: { iconUrl?: string } }).miniapp;
  return miniapp?.iconUrl?.trim() ?? "";
}

function parseLargestIconSize(value?: string) {
  if (!value) {
    return 0;
  }

  return value
    .split(/\s+/)
    .map((token) => {
      const match = token.match(/^(\d+)x(\d+)$/i);
      return match ? Number(match[1]) * Number(match[2]) : 0;
    })
    .sort((left, right) => right - left)[0] ?? 0;
}

function decodeHtml(value: string) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function toAbsoluteUrl(baseUrl: string, candidate: string) {
  if (!candidate) {
    return "";
  }

  try {
    return new URL(candidate, baseUrl).toString();
  } catch {
    return "";
  }
}

async function fetchManifestIcon(baseUrl: string, html: string) {
  const manifestHref = extractLinkHref(html, /\bmanifest\b/i);

  if (!manifestHref) {
    return "";
  }

  const manifestUrl = toAbsoluteUrl(baseUrl, manifestHref);

  if (!manifestUrl) {
    return "";
  }

  try {
    const response = await fetch(manifestUrl, {
      headers: {
        "user-agent": "App Ladder Metadata Bot/1.0 (+https://app-ladder.local)",
        accept: "application/manifest+json,application/json,text/plain",
      },
      redirect: "follow",
      cache: "no-store",
      signal: AbortSignal.timeout(requestTimeoutMs),
    });

    if (!response.ok) {
      return "";
    }

    const manifest = (await response.json()) as unknown;
    return toAbsoluteUrl(manifestUrl, extractBestManifestIcon(manifest));
  } catch {
    return "";
  }
}

async function fetchFarcasterManifestIcon(baseUrl: string) {
  let manifestUrl = "";

  try {
    manifestUrl = new URL("/.well-known/farcaster.json", baseUrl).toString();
  } catch {
    return "";
  }

  try {
    const response = await fetch(manifestUrl, {
      headers: {
        "user-agent": "App Ladder Metadata Bot/1.0 (+https://app-ladder.local)",
        accept: "application/json,text/plain",
      },
      redirect: "follow",
      cache: "no-store",
      signal: AbortSignal.timeout(requestTimeoutMs),
    });

    if (!response.ok) {
      return "";
    }

    const manifest = (await response.json()) as unknown;
    return toAbsoluteUrl(manifestUrl, extractMiniAppManifestIcon(manifest));
  } catch {
    return "";
  }
}

export async function POST(request: Request) {
  let url = "";

  try {
    const body = (await request.json()) as { url?: string };
    url = body.url?.trim() ?? "";
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (!url) {
    return NextResponse.json({ error: "URL is required." }, { status: 400 });
  }

  let target: URL;

  try {
    target = new URL(url);
  } catch {
    return NextResponse.json({ error: "URL is invalid." }, { status: 400 });
  }

  if (!["http:", "https:"].includes(target.protocol)) {
    return NextResponse.json({ error: "Only http and https URLs are supported." }, { status: 400 });
  }

  try {
    const response = await fetch(target.toString(), {
      headers: {
        "user-agent": "App Ladder Metadata Bot/1.0 (+https://app-ladder.local)",
        accept: "text/html,application/xhtml+xml",
      },
      redirect: "follow",
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });

    if (!response.ok) {
      return NextResponse.json({ error: "Could not fetch this URL." }, { status: 422 });
    }

    const html = (await response.text()).slice(0, maxHtmlLength);
    const resolvedUrl = response.url || target.toString();
    const farcasterManifestIconUrl = await fetchFarcasterManifestIcon(resolvedUrl);
    const manifestIconUrl = await fetchManifestIcon(resolvedUrl, html);
    const linkIconUrl = toAbsoluteUrl(
      resolvedUrl,
      extractLinkHref(html, /\bapple-touch-icon\b/i) ||
        extractLinkHref(html, /\bmask-icon\b/i) ||
        extractLinkHref(html, /\bshortcut icon\b/i) ||
        extractLinkHref(html, /\bicon\b/i),
    );
    const name =
      extractMetaContent(html, "og:title") ||
      extractMetaContent(html, "twitter:title") ||
      extractTitle(html);
    const imageUrl =
      farcasterManifestIconUrl ||
      manifestIconUrl ||
      linkIconUrl ||
      toAbsoluteUrl(
        resolvedUrl,
        extractMetaContent(html, "og:image") || extractMetaContent(html, "twitter:image"),
      );
    const description =
      extractMetaContent(html, "og:description") ||
      extractMetaContent(html, "description") ||
      extractMetaContent(html, "twitter:description");

    if (!name && !imageUrl) {
      return NextResponse.json(
        { error: "This page did not expose enough metadata to autofill." },
        { status: 422 },
      );
    }

    return NextResponse.json({
      name,
      imageUrl,
      shortDescription: description,
      resolvedUrl,
    });
  } catch {
    return NextResponse.json(
      { error: "Metadata lookup failed. Try entering the details manually." },
      { status: 502 },
    );
  }
}
