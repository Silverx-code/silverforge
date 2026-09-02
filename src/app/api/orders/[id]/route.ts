import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { pool, query } from "@/lib/db";
import { getOwnedStore } from "@/lib/tenant";

const updateOrderSchema = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "FULFILLED", "CANCELLED"]),
});

function rowToOrder(row: any) {
  if (!row) return null;
  return {
    id: row.id,
    storeId: row.store_id,
    customerName: row.customer_name,
    phone: row.phone,
    address: row.address,
    status: row.status,
    total: Number(row.total),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const store = await getOwnedStore();
  if (!store) return NextResponse.json({ error: "No store found." }, { status: 404 });

  const orderRes = await query(`SELECT * FROM orders WHERE id = $1 LIMIT 1`, [params.id]);
  const order = rowToOrder(orderRes.rows[0]);

  if (!order || order.storeId !== store.id) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  const body = await req.json().catch(() => null);
  const parsed = updateOrderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid status." }, { status: 400 });
  }

  const nextStatus = parsed.data.status;
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    // A cancellation returns items to saleable inventory only once.
    if (order.status !== "CANCELLED" && nextStatus === "CANCELLED") {
      const items = await client.query("SELECT product_id, quantity FROM order_items WHERE order_id = $1", [params.id]);
      for (const item of items.rows) {
        await client.query("UPDATE products SET inventory_quantity = inventory_quantity + $1, stock_status = 'IN_STOCK' WHERE id = $2 AND store_id = $3", [item.quantity, store.id]);
      }
    }
    const updateRes = await client.query("UPDATE orders SET status = $1 WHERE id = $2 AND store_id = $3 RETURNING *", [nextStatus, params.id, store.id]);
    await client.query("COMMIT");
    return NextResponse.json(rowToOrder(updateRes.rows[0]));
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
