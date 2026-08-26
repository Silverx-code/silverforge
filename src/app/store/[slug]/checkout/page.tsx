"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useCart } from "@/lib/cart-context";

export default function CheckoutPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { items, total, clear } = useCart();
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [placed, setPlaced] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/public/store/${slug}/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName,
          phone,
          address,
          items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Couldn't place your order.");
        return;
      }
      clear();
      setPlaced(true);
    } finally {
      setLoading(false);
    }
  }

  if (placed) {
    return (
      <div className="mx-auto max-w-md px-6 py-20 text-center">
        <h1 className="text-2xl font-semibold">Order submitted</h1>
        <p className="mt-2 opacity-70">
          Thanks — the store owner will reach out to confirm your order.
        </p>
        <button onClick={() => router.push(`/store/${slug}`)} className="mt-6 underline">
          Back to store
        </button>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-md px-6 py-20 text-center opacity-60">
        Your cart is empty.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-6 py-12">
      <h1 className="text-2xl font-semibold">Checkout</h1>
      <p className="mt-1 text-sm opacity-60">Total: ₦{total.toLocaleString()}</p>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        <input
          className="input"
          placeholder="Full name"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          required
        />
        <input
          className="input"
          placeholder="Phone number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
        />
        <textarea
          className="input"
          placeholder="Delivery address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          rows={3}
          required
        />

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 text-white disabled:opacity-50"
          style={{ background: "var(--store-primary)", borderRadius: "var(--store-radius)" }}
        >
          {loading ? "Placing order…" : "Place order"}
        </button>
      </form>
    </div>
  );
}
