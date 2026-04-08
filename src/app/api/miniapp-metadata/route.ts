import { NextResponse } from "next/server";

const maxHtmlLength = 200_000;

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
    const name =
      extractMetaContent(html, "og:title") ||
      extractMetaContent(html, "twitter:title") ||
      extractTitle(html);
    const imageUrl = toAbsoluteUrl(
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
