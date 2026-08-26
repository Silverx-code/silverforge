"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/lib/cart-context";

export default function AddToCartButton({
  storeSlug,
  productId,
  name,
  price,
  outOfStock,
}: {
  storeSlug: string;
  productId: string;
  name: string;
  price: number;
  outOfStock: boolean;
}) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  if (outOfStock) {
    return (
      <button disabled className="rounded px-6 py-3 text-white opacity-40" style={{ background: "var(--store-primary)", borderRadius: "var(--store-radius)" }}>
        Out of stock
      </button>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={() => {
          addItem({ productId, name, price });
          setAdded(true);
        }}
        className="px-6 py-3 text-white"
        style={{ background: "var(--store-primary)", borderRadius: "var(--store-radius)" }}
      >
        Add to cart
      </button>
      {added && (
        <Link href={`/store/${storeSlug}/cart`} className="text-sm underline">
          View cart
        </Link>
      )}
    </div>
  );
}
