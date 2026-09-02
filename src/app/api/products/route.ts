import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { query } from "@/lib/db";
import { getOwnedStore } from "@/lib/tenant";
import { createId } from "@/lib/id";

const createProductSchema = z.object({
  name: z.string().min(1).max(160),
  description: z.string().max(2000).optional(),
  price: z.number().positive(),
  image: z.string().url().optional().nullable(),
  stockStatus: z.enum(["IN_STOCK", "OUT_OF_STOCK"]).optional(),
  inventoryQuantity: z.number().int().min(0).max(1_000_000).default(0),
});

function rowToProduct(row: any) {
  if (!row) return null;
  return {
    id: row.id,
    storeId: row.store_id,
    name: row.name,
    description: row.description,
    price: Number(row.price),
    image: row.image,
    stockStatus: row.stock_status,
    inventoryQuantity: row.inventory_quantity,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function GET() {
  const store = await getOwnedStore();
  if (!store) return NextResponse.json({ error: "No store found." }, { status: 404 });

  const res = await query(
    `SELECT * FROM products WHERE store_id = $1 ORDER BY created_at DESC`,
    [store.id]
  );

  return NextResponse.json(res.rows.map(rowToProduct));
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

  const data = parsed.data;
  const productId = createId("prd");
  const stockStatus = data.inventoryQuantity > 0 && data.stockStatus !== "OUT_OF_STOCK" ? "IN_STOCK" : "OUT_OF_STOCK";

  const res = await query(
    `INSERT INTO products (id, store_id, name, description, price, image, stock_status, inventory_quantity)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
    [productId, store.id, data.name, data.description || null, data.price, data.image || null, stockStatus, data.inventoryQuantity]
  );

  return NextResponse.json(rowToProduct(res.rows[0]), { status: 201 });
}
