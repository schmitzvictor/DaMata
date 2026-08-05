import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * ERP -> Site catalog sync.
 *
 * Auth: header `x-sync-secret: <ERP_SYNC_SECRET>`.
 *
 * Body:
 * {
 *   "erpProductId": "erp-123",
 *   "name": "Camiseta Trilha Cerrada",
 *   "slug": "camiseta-trilha-cerrada",
 *   "category": "camisetas",
 *   "price": 129.9,
 *   "variants": [
 *     { "erpVariantId": "erp-123-P-verde", "size": "P", "color": "Verde", "stock": 12 }
 *   ]
 * }
 *
 * Product is upserted by erpProductId, writing only name/slug/category/price
 * — the ERP is the source of truth for those. description/images/featured
 * are content-admin curation (see /admin/produtos) and are never touched
 * here, on create or update. Each variant is upserted by erpVariantId,
 * writing size/color/stock.
 */

type SyncVariant = {
  erpVariantId: string;
  size: string;
  color: string | null;
  stock: number;
};

type SyncProductPayload = {
  erpProductId: string;
  slug: string;
  name: string;
  category: string;
  price: number;
  variants: SyncVariant[];
};

type ValidationResult =
  | { ok: true; data: SyncProductPayload }
  | { ok: false; error: string };

function validatePayload(body: unknown): ValidationResult {
  if (typeof body !== "object" || body === null) {
    return { ok: false, error: "Corpo da requisição precisa ser um objeto JSON." };
  }
  const b = body as Record<string, unknown>;

  for (const field of ["erpProductId", "slug", "name", "category"] as const) {
    if (typeof b[field] !== "string" || b[field].trim() === "") {
      return {
        ok: false,
        error: `Campo "${field}" é obrigatório e deve ser uma string não vazia.`,
      };
    }
  }
  if (typeof b.price !== "number" || !Number.isFinite(b.price) || b.price < 0) {
    return { ok: false, error: 'Campo "price" é obrigatório e deve ser um número >= 0.' };
  }
  if (!Array.isArray(b.variants)) {
    return { ok: false, error: 'Campo "variants" é obrigatório e deve ser uma lista.' };
  }

  const variants: SyncVariant[] = [];
  for (const [i, raw] of b.variants.entries()) {
    if (typeof raw !== "object" || raw === null) {
      return { ok: false, error: `variants[${i}] deve ser um objeto.` };
    }
    const v = raw as Record<string, unknown>;
    if (typeof v.erpVariantId !== "string" || v.erpVariantId.trim() === "") {
      return { ok: false, error: `variants[${i}].erpVariantId é obrigatório.` };
    }
    if (typeof v.size !== "string" || v.size.trim() === "") {
      return { ok: false, error: `variants[${i}].size é obrigatório.` };
    }
    if (v.color !== undefined && v.color !== null && typeof v.color !== "string") {
      return { ok: false, error: `variants[${i}].color deve ser string ou null.` };
    }
    if (typeof v.stock !== "number" || !Number.isInteger(v.stock) || v.stock < 0) {
      return {
        ok: false,
        error: `variants[${i}].stock é obrigatório e deve ser um inteiro >= 0.`,
      };
    }
    variants.push({
      erpVariantId: v.erpVariantId,
      size: v.size,
      color: (v.color as string | null | undefined) ?? null,
      stock: v.stock,
    });
  }

  return {
    ok: true,
    data: {
      erpProductId: b.erpProductId as string,
      slug: b.slug as string,
      name: b.name as string,
      category: b.category as string,
      price: b.price,
      variants,
    },
  };
}

export async function POST(req: NextRequest) {
  const secret = process.env.ERP_SYNC_SECRET;
  const provided = req.headers.get("x-sync-secret");
  if (!secret || provided !== secret) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Corpo da requisição precisa ser JSON válido." },
      { status: 400 },
    );
  }

  const validation = validatePayload(body);
  if (!validation.ok) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }
  const payload = validation.data;

  try {
    const existingProduct = await prisma.product.findUnique({
      where: { erpProductId: payload.erpProductId },
      select: { id: true },
    });

    const product = await prisma.product.upsert({
      where: { erpProductId: payload.erpProductId },
      update: {
        name: payload.name,
        slug: payload.slug,
        category: payload.category,
        price: payload.price,
      },
      create: {
        erpProductId: payload.erpProductId,
        name: payload.name,
        slug: payload.slug,
        category: payload.category,
        price: payload.price,
        // Owned by content admin, not the ERP — start empty until curated.
        description: null,
        images: [],
        featured: false,
      },
    });

    const existingVariants = await prisma.productVariant.findMany({
      where: { erpVariantId: { in: payload.variants.map((v) => v.erpVariantId) } },
      select: { erpVariantId: true },
    });
    const existingVariantIds = new Set(existingVariants.map((v) => v.erpVariantId));

    for (const variant of payload.variants) {
      await prisma.productVariant.upsert({
        where: { erpVariantId: variant.erpVariantId },
        update: {
          size: variant.size,
          color: variant.color,
          stock: variant.stock,
          productId: product.id,
        },
        create: {
          erpVariantId: variant.erpVariantId,
          productId: product.id,
          size: variant.size,
          color: variant.color,
          stock: variant.stock,
        },
      });
    }

    const variantsCreated = payload.variants.filter(
      (v) => !existingVariantIds.has(v.erpVariantId),
    ).length;

    return NextResponse.json({
      product: {
        id: product.id,
        erpProductId: product.erpProductId,
        action: existingProduct ? "updated" : "created",
      },
      variants: {
        total: payload.variants.length,
        created: variantsCreated,
        updated: payload.variants.length - variantsCreated,
      },
    });
  } catch (err) {
    console.error("api/sync/product failed", err);
    return NextResponse.json(
      { error: "Falha ao gravar no banco. Verifique erpProductId/erpVariantId/slug duplicados." },
      { status: 500 },
    );
  }
}
