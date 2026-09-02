"use client";

import { useEffect, useState } from "react";

type Product = {
  id: string;
  name: string;
  description: string | null;
  price: string;
  image: string | null;
  stockStatus: "IN_STOCK" | "OUT_OF_STOCK";
  inventoryQuantity: number;
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[] | null>(null);
  const [showForm, setShowForm] = useState(false);

  async function load() {
    const res = await fetch("/api/products");
    setProducts(await res.json());
  }

  useEffect(() => {
    load();
  }, []);

  async function deleteProduct(id: string) {
    setProducts((prev) => prev!.filter((p) => p.id !== id));
    await fetch(`/api/products/${id}`, { method: "DELETE" });
  }

  async function toggleStock(product: Product) {
    const next = product.stockStatus === "IN_STOCK" ? "OUT_OF_STOCK" : "IN_STOCK";
    setProducts((prev) =>
      prev!.map((p) => (p.id === product.id ? { ...p, stockStatus: next } : p))
    );
    await fetch(`/api/products/${product.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stockStatus: next }),
    });
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Products</h1>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="rounded-full bg-ink px-4 py-2 text-sm text-paper hover:bg-ink/90"
        >
          + Add Product
        </button>
      </div>

      {showForm && (
        <ProductForm
          onCreated={(p) => {
            setProducts((prev) => [p, ...(prev ?? [])]);
            setShowForm(false);
          }}
        />
      )}

      <div className="mt-6 flex flex-col divide-y divide-ink/10 rounded-xl border border-ink/10">
        {products === null && <p className="p-4 text-sm text-ink/50">Loading…</p>}
        {products?.length === 0 && (
          <p className="p-4 text-sm text-ink/50">No products yet. Add your first one above.</p>
        )}
        {products?.map((product) => (
          <div key={product.id} className="flex items-center justify-between p-4">
            <div>
              <p className="font-medium">{product.name}</p>
              <p className="text-sm text-ink/50">₦{Number(product.price).toLocaleString()}</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => toggleStock(product)}
                className={`rounded-full px-3 py-1 text-xs ${
                  product.stockStatus === "IN_STOCK"
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {product.stockStatus === "IN_STOCK" ? "In Stock" : "Out of Stock"}
              </button>
              <button
                onClick={() => deleteProduct(product.id)}
                className="text-sm text-ink/50 hover:text-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProductForm({ onCreated }: { onCreated: (p: Product) => void }) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [inventoryQuantity, setInventoryQuantity] = useState("1");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description, image: image || null, price: Number(price), inventoryQuantity: Number(inventoryQuantity) }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Couldn't add product.");
      return;
    }
    onCreated(data);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-4 flex flex-col gap-3 rounded-xl border border-ink/10 p-4"
    >
      <div className="grid grid-cols-2 gap-3">
        <input
          className="input"
          placeholder="Product name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          className="input"
          placeholder="Price (₦)"
          type="number"
          min="0"
          step="0.01"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
        />
      </div>
      <textarea
        className="input"
        placeholder="Description (optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={2}
      />
      <input
        className="input"
        placeholder="Product image URL (optional)"
        type="url"
        value={image}
        onChange={(e) => setImage(e.target.value)}
      />
      <input
        className="input"
        placeholder="Inventory quantity"
        type="number"
        min="0"
        step="1"
        value={inventoryQuantity}
        onChange={(e) => setInventoryQuantity(e.target.value)}
        required
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        className="w-fit rounded-full bg-ink px-4 py-2 text-sm text-paper hover:bg-ink/90"
      >
        Save product
      </button>
    </form>
  );
}
