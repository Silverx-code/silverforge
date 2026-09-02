import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { pool, query } from "@/lib/db";
import { calculateOrderTotal } from "@/lib/money";
import { getClientIp, isRateLimited } from "@/lib/rate-limit";
import { createId } from "@/lib/id";

const checkoutSchema = z.object({
  customerName: z.string().trim().min(1).max(160), phone: z.string().trim().min(5).max(30), address: z.string().trim().min(1).max(500),
  items: z.array(z.object({ productId: z.string().min(1), quantity: z.number().int().positive().max(20) })).min(1).max(50),
});

export async function POST(req: NextRequest, { params }: { params: { slug: string } }) {
  if (isRateLimited(`checkout:${getClientIp(req.headers)}`, 10, 60_000)) return NextResponse.json({ error: "Too many checkout attempts. Please wait a minute and try again." }, { status: 429 });
  
  const storeRes = await query(`SELECT * FROM stores WHERE slug = $1 LIMIT 1`, [params.slug]);
  const store = storeRes.rows[0];
  if (!store || !store.is_published) return NextResponse.json({ error: "Store not found." }, { status: 404 });
  
  const parsed = checkoutSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid order." }, { status: 400 });

  const quantities = new Map<string, number>();
  for (const item of parsed.data.items) quantities.set(item.productId, (quantities.get(item.productId) ?? 0) + item.quantity);
  if ([...quantities.values()].some((quantity) => quantity > 20)) return NextResponse.json({ error: "A maximum of 20 units per product is allowed." }, { status: 400 });
  const productIds = [...quantities.keys()];
  
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Read the current prices while holding row locks, so the saved order total is consistent.
    const productsRes = await client.query(
      "SELECT id, price, inventory_quantity FROM products WHERE id = ANY($1::text[]) AND store_id = $2 AND stock_status = 'IN_STOCK' FOR UPDATE",
      [productIds, store.id]
    );
    if (productsRes.rows.length !== productIds.length) throw new Error("INSUFFICIENT_STOCK");
    const orderItems = productIds.map((productId) => {
      const product = productsRes.rows.find((candidate) => candidate.id === productId)!;
      return { productId, quantity: quantities.get(productId)!, price: product.price };
    });

    for (const item of orderItems) {
      const updateRes = await client.query(
        `UPDATE products
         SET inventory_quantity = inventory_quantity - $1
         WHERE id = $2 AND store_id = $3 AND stock_status = 'IN_STOCK' AND inventory_quantity >= $1
         RETURNING inventory_quantity`,
        [item.quantity, item.productId, store.id]
      );
      if (updateRes.rowCount !== 1) {
        throw new Error("INSUFFICIENT_STOCK");
      }

      const newQty = updateRes.rows[0].inventory_quantity;
      if (newQty === 0) {
        await client.query(`UPDATE products SET stock_status = 'OUT_OF_STOCK' WHERE id = $1`, [item.productId]);
      }
    }

    const orderId = createId("ord");
    const total = calculateOrderTotal(orderItems).toString();

    await client.query(
      `INSERT INTO orders (id, store_id, customer_name, phone, address, total)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [orderId, store.id, parsed.data.customerName, parsed.data.phone, parsed.data.address, total]
    );

    for (const item of orderItems) {
      const itemId = createId("item");
      await client.query(
        `INSERT INTO order_items (id, order_id, product_id, quantity, price)
         VALUES ($1, $2, $3, $4, $5)`,
        [itemId, orderId, item.productId, item.quantity, item.price]
      );
    }

    await client.query("COMMIT");
    return NextResponse.json({ id: orderId }, { status: 201 });
  } catch (error) {
    await client.query("ROLLBACK");
    if (error instanceof Error && error.message === "INSUFFICIENT_STOCK") return NextResponse.json({ error: "One or more items just sold out. Please update your cart." }, { status: 409 });
    throw error;
  } finally {
    client.release();
  }
}
