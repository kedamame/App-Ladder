import { createMiniAppImage } from "@/lib/miniapp-images";

export const runtime = "edge";

export async function GET() {
  return createMiniAppImage("icon");
}
