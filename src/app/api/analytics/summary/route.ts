import { timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Site -> ERP (puxado pelo ERP, não fire-and-forget): resumo agregado dos
 * eventos de analytics próprios (sem PII, sem terceiros — ver
 * AnalyticsEvent no schema). Consumido pela tela /site-analytics do ERP.
 *
 * Auth: header `x-sync-secret` (mesmo secret do resto do sync ERP<->site).
 * Query: ?days=30 (padrão 30, máximo 365).
 */

function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.ERP_SYNC_SECRET;
  if (!secret) return false;
  const provided = req.headers.get("x-sync-secret") ?? "";
  const a = Buffer.from(provided);
  const b = Buffer.from(secret);
  return a.length === b.length && timingSafeEqual(a, b);
}

function hostnameOf(url: string): string | null {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

function topEntries(counts: Map<string, number>, take: number) {
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, take)
    .map(([label, count]) => ({ label, count }));
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const daysParam = Number(req.nextUrl.searchParams.get("days"));
  const days = Number.isFinite(daysParam) && daysParam > 0 ? Math.min(daysParam, 365) : 30;
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const [sessionStarts, clicks, productViews, pageviewCount, sessionCount] = await Promise.all([
    prisma.analyticsEvent.findMany({
      where: { type: "session_start", createdAt: { gte: since } },
      select: { referrer: true, utmSource: true },
    }),
    prisma.analyticsEvent.findMany({
      where: { type: "click", createdAt: { gte: since }, label: { not: null } },
      select: { label: true },
    }),
    prisma.analyticsEvent.findMany({
      where: { type: "product_view", createdAt: { gte: since }, productId: { not: null } },
      select: { productId: true },
    }),
    prisma.analyticsEvent.count({ where: { type: "pageview", createdAt: { gte: since } } }),
    prisma.analyticsEvent.count({ where: { type: "session_start", createdAt: { gte: since } } }),
  ]);

  const sourceCounts = new Map<string, number>();
  for (const row of sessionStarts) {
    const label = row.utmSource || hostnameOf(row.referrer ?? "") || "Direto";
    sourceCounts.set(label, (sourceCounts.get(label) ?? 0) + 1);
  }

  const clickCounts = new Map<string, number>();
  for (const row of clicks) {
    if (!row.label) continue;
    clickCounts.set(row.label, (clickCounts.get(row.label) ?? 0) + 1);
  }

  const productCounts = new Map<number, number>();
  for (const row of productViews) {
    if (row.productId == null) continue;
    productCounts.set(row.productId, (productCounts.get(row.productId) ?? 0) + 1);
  }
  const topProductIds = Array.from(productCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([id]) => id);
  const products = topProductIds.length
    ? await prisma.product.findMany({
        where: { id: { in: topProductIds } },
        select: { id: true, name: true, slug: true },
      })
    : [];
  const productById = new Map(products.map((p) => [p.id, p]));
  const topProducts = topProductIds.map((id) => ({
    productId: id,
    name: productById.get(id)?.name ?? `#${id}`,
    slug: productById.get(id)?.slug ?? null,
    count: productCounts.get(id) ?? 0,
  }));

  return NextResponse.json({
    days,
    pageviews: pageviewCount,
    sessions: sessionCount,
    topSources: topEntries(sourceCounts, 10),
    topClicks: topEntries(clickCounts, 10),
    topProducts,
  });
}
