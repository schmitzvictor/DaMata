import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkTrackRateLimit, getClientIp } from "@/lib/rate-limit";

const ALLOWED_TYPES = new Set(["pageview", "session_start", "click", "product_view"]);
const MAX_STR = 300;

function str(value: unknown, max = MAX_STR): string | null {
  if (typeof value !== "string" || value.length === 0) return null;
  return value.slice(0, max);
}

export async function POST(req: NextRequest) {
  if (!checkTrackRateLimit(getClientIp(req))) {
    return NextResponse.json({ error: "rate limited" }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const b = (body ?? {}) as Record<string, unknown>;
  const type = str(b.type, 20);
  const sessionId = str(b.sessionId, 64);
  if (!type || !ALLOWED_TYPES.has(type) || !sessionId) {
    return NextResponse.json({ error: "invalid event" }, { status: 400 });
  }

  const productId = typeof b.productId === "number" && Number.isInteger(b.productId) ? b.productId : null;

  await prisma.analyticsEvent.create({
    data: {
      type,
      sessionId,
      path: str(b.path),
      referrer: str(b.referrer),
      utmSource: str(b.utmSource, 100),
      utmMedium: str(b.utmMedium, 100),
      utmCampaign: str(b.utmCampaign, 100),
      label: str(b.label, 100),
      productId,
    },
  });

  return NextResponse.json({ ok: true });
}
