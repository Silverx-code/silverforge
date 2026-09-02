import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { query } from "@/lib/db";
import { getOwnedStore } from "@/lib/tenant";

const updateProductSchema = z.object({
  name: z.string().min(1).max(160).optional(),
  description: z.string().max(2000).optional(),
  price: z.number().positive().optional(),
  image: z.string().url().optional().nullable(),
  stockStatus: z.enum(["IN_STOCK", "OUT_OF_STOCK"]).optional(),
  inventoryQuantity: z.number().int().min(0).max(1_000_000).optional(),
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

async function assertOwnership(productId: string, storeId: string) {
  const res = await query(`SELECT * FROM products WHERE id = $1 LIMIT 1`, [productId]);
  const product = rowToProduct(res.rows[0]);
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

  const data = parsed.data;
  const inventoryQuantity = data.inventoryQuantity ?? (data.stockStatus === "IN_STOCK" ? Math.max(product.inventoryQuantity, 1) : product.inventoryQuantity);
  const stockStatus = inventoryQuantity === 0 ? "OUT_OF_STOCK" : (data.stockStatus ?? product.stockStatus);

  const updates: string[] = [];
  const values: any[] = [];
  let idx = 1;

  if (data.name !== undefined) { updates.push(`name = $${idx++}`); values.push(data.name); }
  if (data.description !== undefined) { updates.push(`description = $${idx++}`); values.push(data.description); }
  if (data.price !== undefined) { updates.push(`price = $${idx++}`); values.push(data.price); }
  if (data.image !== undefined) { updates.push(`image = $${idx++}`); values.push(data.image); }
  updates.push(`stock_status = $${idx++}`); values.push(stockStatus);
  updates.push(`inventory_quantity = $${idx++}`); values.push(inventoryQuantity);
  updates.push(`updated_at = NOW()`);

  values.push(params.id);
  const updateRes = await query(
    `UPDATE products SET ${updates.join(", ")} WHERE id = $${idx} RETURNING *`,
    values
  );

  return NextResponse.json(rowToProduct(updateRes.rows[0]));
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const store = await getOwnedStore();
  if (!store) return NextResponse.json({ error: "No store found." }, { status: 404 });

  const product = await assertOwnership(params.id, store.id);
  if (!product) return NextResponse.json({ error: "Product not found." }, { status: 404 });

  const orderItemRes = await query(`SELECT 1 FROM order_items WHERE product_id = $1 LIMIT 1`, [params.id]);
  if (orderItemRes.rows.length) {
    return NextResponse.json({ error: "Products with order history cannot be deleted." }, { status: 409 });
  }

  await query(`DELETE FROM products WHERE id = $1 AND store_id = $2`, [params.id, store.id]);

  return NextResponse.json({ ok: true });
}
