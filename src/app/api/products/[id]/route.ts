import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getOwnedStore } from "@/lib/tenant";

const updateProductSchema = z.object({
  name: z.string().min(1).max(160).optional(),
  description: z.string().max(2000).optional(),
  price: z.number().positive().optional(),
  image: z.string().url().optional().nullable(),
  stockStatus: z.enum(["IN_STOCK", "OUT_OF_STOCK"]).optional(),
  inventoryQuantity: z.number().int().min(0).max(1_000_000).optional(),
});

async function assertOwnership(productId: string, storeId: string) {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product || product.storeId !== storeId) return null;
  return product;
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const store = await getOwnedStore();
  if (!store) return NextResponse.json({ error: "No store found." }, { status: 404 });

  const product = await assertOwnership(params.id, store.id);
  if (!product) return NextResponse.json({ error: "Product not found." }, { status: 404 });

  const body = await req.json().catch(() => null);
  const parsed = updateProductSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid update." }, { status: 400 });
  }

  const inventoryQuantity = parsed.data.inventoryQuantity ?? (parsed.data.stockStatus === "IN_STOCK" ? Math.max(product.inventoryQuantity, 1) : product.inventoryQuantity);
  const stockStatus = inventoryQuantity === 0 ? "OUT_OF_STOCK" : (parsed.data.stockStatus ?? product.stockStatus);
  const updated = await prisma.product.update({
    where: { id: params.id },
    data: { ...parsed.data, inventoryQuantity, stockStatus },
  });

  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const store = await getOwnedStore();
  if (!store) return NextResponse.json({ error: "No store found." }, { status: 404 });

  const product = await assertOwnership(params.id, store.id);
  if (!product) return NextResponse.json({ error: "Product not found." }, { status: 404 });

  await prisma.product.delete({ where: { id: params.id } });

  return NextResponse.json({ ok: true });
}
