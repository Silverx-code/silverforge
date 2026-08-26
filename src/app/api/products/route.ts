import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getOwnedStore } from "@/lib/tenant";

const createProductSchema = z.object({
  name: z.string().min(1).max(160),
  description: z.string().max(2000).optional(),
  price: z.number().positive(),
  image: z.string().url().optional().nullable(),
  stockStatus: z.enum(["IN_STOCK", "OUT_OF_STOCK"]).optional(),
  inventoryQuantity: z.number().int().min(0).max(1_000_000).default(0),
});

export async function GET() {
  const store = await getOwnedStore();
  if (!store) return NextResponse.json({ error: "No store found." }, { status: 404 });

  const products = await prisma.product.findMany({
    where: { storeId: store.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(products);
}

export async function POST(req: NextRequest) {
  const store = await getOwnedStore();
  if (!store) return NextResponse.json({ error: "No store found." }, { status: 404 });

  const body = await req.json().catch(() => null);
  const parsed = createProductSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid product." },
      { status: 400 }
    );
  }

  const product = await prisma.product.create({
    data: {
      ...parsed.data,
      storeId: store.id,
      stockStatus: parsed.data.inventoryQuantity > 0 && parsed.data.stockStatus !== "OUT_OF_STOCK" ? "IN_STOCK" : "OUT_OF_STOCK",
    },
  });

  return NextResponse.json(product, { status: 201 });
}
