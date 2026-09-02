import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getOwnedStore } from "@/lib/tenant";

export async function GET() {
  const store = await getOwnedStore();
  if (!store) return NextResponse.json({ error: "No store found." }, { status: 404 });

  const ordersRes = await query(`SELECT * FROM orders WHERE store_id = $1 ORDER BY created_at DESC`, [store.id]);
  const orders = ordersRes.rows;

  if (orders.length === 0) return NextResponse.json([]);

  const orderIds = orders.map((o) => o.id);
  const itemsRes = await query(
    `SELECT oi.*, p.name as product_name, p.image as product_image, p.price as product_price
     FROM order_items oi
     JOIN products p ON oi.product_id = p.id
     WHERE oi.order_id = ANY($1::text[])`,
    [orderIds]
  );

  const itemsByOrderId = new Map<string, any[]>();
  for (const item of itemsRes.rows) {
    const list = itemsByOrderId.get(item.order_id) || [];
    list.push({
      id: item.id,
      orderId: item.order_id,
      productId: item.product_id,
      quantity: item.quantity,
      price: Number(item.price),
      product: {
        id: item.product_id,
        name: item.product_name,
        image: item.product_image,
        price: Number(item.product_price),
      },
    });
    itemsByOrderId.set(item.order_id, list);
  }

  const formattedOrders = orders.map((o) => ({
    id: o.id,
    storeId: o.store_id,
    customerName: o.customer_name,
    phone: o.phone,
    address: o.address,
    status: o.status,
    total: Number(o.total),
    createdAt: o.created_at,
    updatedAt: o.updated_at,
    items: itemsByOrderId.get(o.id) || [],
  }));

  return NextResponse.json(formattedOrders);
}
