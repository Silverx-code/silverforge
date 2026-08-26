"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCart } from "@/lib/cart-context";

export default function CartPage() {
  const { slug } = useParams<{ slug: string }>();
  const { items, updateQuantity, removeItem, total } = useCart();

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-6 py-16 text-center">
        <p className="opacity-60">Your cart is empty.</p>
        <Link href={`/store/${slug}`} className="mt-4 inline-block underline">
          Continue shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl px-6 py-12">
      <h1 className="text-2xl font-semibold">Your cart</h1>

      <div className="mt-6 flex flex-col divide-y divide-black/10">
        {items.map((item) => (
          <div key={item.productId} className="flex items-center justify-between py-4">
            <div>
              <p className="font-medium">{item.name}</p>
              <p className="text-sm opacity-60">₦{item.price.toLocaleString()}</p>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min={1}
                value={item.quantity}
                onChange={(e) => updateQuantity(item.productId, Number(e.target.value))}
                className="input w-16 text-center"
              />
              <button
                onClick={() => removeItem(item.productId)}
                className="text-sm opacity-50 hover:opacity-100"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-black/10 pt-4">
        <span className="font-medium">Total</span>
        <span className="font-medium">₦{total.toLocaleString()}</span>
      </div>

      <Link
        href={`/store/${slug}/checkout`}
        className="mt-6 block w-full px-6 py-3 text-center text-white"
        style={{ background: "var(--store-primary)", borderRadius: "var(--store-radius)" }}
      >
        Checkout
      </Link>
    </div>
  );
}
