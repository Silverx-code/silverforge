"use client";

import { useEffect, useState } from "react";

type Order = {
  id: string;
  customerName: string;
  phone: string;
  address: string;
  status: "PENDING" | "CONFIRMED" | "FULFILLED" | "CANCELLED";
  total: string;
  createdAt: string;
  items: { id: string; quantity: number; product: { name: string } }[];
};

function allowedStatuses(current: Order["status"]): Order["status"][] {
  if (current === "PENDING") return ["PENDING", "CONFIRMED", "CANCELLED"];
  if (current === "CONFIRMED") return ["CONFIRMED", "FULFILLED", "CANCELLED"];
  return [current];
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[] | null>(null);

  useEffect(() => {
    fetch("/api/orders")
      .then((res) => res.json())
      .then(setOrders);
  }, []);

  async function updateStatus(order: Order, status: Order["status"]) {
    const previous = orders;
    setOrders((prev) => prev?.map((o) => (o.id === order.id ? { ...o, status } : o)) ?? null);
    try {
      const response = await fetch(`/api/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (response.ok) return;
    } catch {
      // Restore the server's current state below if the request failed.
    }
    const fresh = await fetch("/api/orders").then((res) => res.json()).catch(() => previous);
    setOrders(fresh);
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Orders</h1>

      <div className="mt-6 flex flex-col divide-y divide-ink/10 rounded-xl border border-ink/10">
        {orders === null && <p className="p-4 text-sm text-ink/50">Loading…</p>}
        {orders?.length === 0 && (
          <p className="p-4 text-sm text-ink/50">
            No orders yet. They&apos;ll show up here as customers check out.
          </p>
        )}
        {orders?.map((order) => (
          <div key={order.id} className="flex items-center justify-between p-4">
            <div>
              <p className="font-medium">{order.customerName}</p>
              <p className="text-sm text-ink/50">
                {order.items.map((i) => `${i.quantity}× ${i.product.name}`).join(", ")}
              </p>
              <p className="text-sm text-ink/50">
                ₦{Number(order.total).toLocaleString()} · {order.phone}
              </p>
            </div>
            <select
              value={order.status}
              onChange={(e) => updateStatus(order, e.target.value as Order["status"])}
              className="input"
            >
              {allowedStatuses(order.status).map((s) => (
                <option key={s} value={s}>
                  {s.charAt(0) + s.slice(1).toLowerCase()}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>
    </div>
  );
}
