import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { calculateOrderTotal } from "@/lib/money";
import { getClientIp, isRateLimited } from "@/lib/rate-limit";

const checkoutSchema = z.object({
  customerName: z.string().trim().min(1).max(160), phone: z.string().trim().min(5).max(30), address: z.string().trim().min(1).max(500),
  items: z.array(z.object({ productId: z.string().min(1), quantity: z.number().int().positive().max(20) })).min(1).max(50),
});

export async function POST(req: NextRequest, { params }: { params: { slug: string } }) {
  if (isRateLimited(`checkout:${getClientIp(req.headers)}`, 10, 60_000)) return NextResponse.json({ error: "Too many checkout attempts. Please wait a minute and try again." }, { status: 429 });
  const store = await prisma.store.findUnique({ where: { slug: params.slug } });
  if (!store || !store.isPublished) return NextResponse.json({ error: "Store not found." }, { status: 404 });
  const parsed = checkoutSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid order." }, { status: 400 });

  const quantities = new Map<string, number>();
  for (const item of parsed.data.items) quantities.set(item.productId, (quantities.get(item.productId) ?? 0) + item.quantity);
  if ([...quantities.values()].some((quantity) => quantity > 20)) return NextResponse.json({ error: "A maximum of 20 units per product is allowed." }, { status: 400 });
  const productIds = [...quantities.keys()];
  const products = await prisma.product.findMany({ where: { id: { in: productIds }, storeId: store.id, stockStatus: "IN_STOCK" } });
  if (products.length !== productIds.length) return NextResponse.json({ error: "One or more items are unavailable or out of stock." }, { status: 400 });
  const orderItems = productIds.map((productId) => { const product = products.find((candidate) => candidate.id === productId)!; return { productId, quantity: quantities.get(productId)!, price: product.price }; });

  try {
    const order = await prisma.$transaction(async (tx) => {
      for (const item of orderItems) {
        const reserved = await tx.product.updateMany({
          where: { id: item.productId, storeId: store.id, stockStatus: "IN_STOCK", inventoryQuantity: { gte: item.quantity } },
          data: { inventoryQuantity: { decrement: item.quantity } },
        });
        if (reserved.count !== 1) throw new Error("INSUFFICIENT_STOCK");
        await tx.product.updateMany({ where: { id: item.productId, inventoryQuantity: 0 }, data: { stockStatus: "OUT_OF_STOCK" } });
      }
      return tx.order.create({ data: { storeId: store.id, customerName: parsed.data.customerName, phone: parsed.data.phone, address: parsed.data.address, total: calculateOrderTotal(orderItems), items: { create: orderItems } } });
    });
    return NextResponse.json({ id: order.id }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "INSUFFICIENT_STOCK") return NextResponse.json({ error: "One or more items just sold out. Please update your cart." }, { status: 409 });
    throw error;
  }
}
