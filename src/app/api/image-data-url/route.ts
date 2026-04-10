import { NextResponse } from "next/server";

const requestTimeoutMs = 10_000;
const maxImageBytes = 1_500_000;

export const runtime = "nodejs";

function isSupportedImageType(contentType: string) {
  return /^image\/(png|jpe?g|webp|gif|svg\+xml)$/i.test(contentType);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url")?.trim() ?? "";

  if (!url) {
    return NextResponse.json({ error: "Image URL is required." }, { status: 400 });
  }

  let target: URL;

  try {
    target = new URL(url);
  } catch {
    return NextResponse.json({ error: "Image URL is invalid." }, { status: 400 });
  }

  if (!["http:", "https:"].includes(target.protocol)) {
    return NextResponse.json({ error: "Only http and https URLs are supported." }, { status: 400 });
  }

  try {
    const response = await fetch(target.toString(), {
      headers: {
        "user-agent": "App Ladder Image Proxy/1.0 (+https://app-ladder.local)",
        accept: "image/avif,image/webp,image/png,image/jpeg,image/gif,image/svg+xml,*/*;q=0.8",
      },
      redirect: "follow",
      cache: "no-store",
      signal: AbortSignal.timeout(requestTimeoutMs),
    });

    if (!response.ok) {
      return NextResponse.json({ error: "Could not fetch this image." }, { status: 422 });
    }

    const contentType = response.headers.get("content-type")?.split(";")[0]?.trim() ?? "";

    if (!isSupportedImageType(contentType)) {
      return NextResponse.json({ error: "This URL did not return a supported image." }, { status: 415 });
    }

    const contentLength = Number(response.headers.get("content-length") ?? 0);

    if (contentLength > maxImageBytes) {
      return NextResponse.json({ error: "Image is too large for board export." }, { status: 413 });
    }

    const imageBuffer = Buffer.from(await response.arrayBuffer());

    if (imageBuffer.byteLength > maxImageBytes) {
      return NextResponse.json({ error: "Image is too large for board export." }, { status: 413 });
    }

    return NextResponse.json({
      dataUrl: `data:${contentType};base64,${imageBuffer.toString("base64")}`,
    });
  } catch {
    return NextResponse.json({ error: "Image lookup failed." }, { status: 502 });
  }
}
