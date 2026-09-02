import { notFound } from "next/navigation";
import AddToCartButton from "../../add-to-cart-button";
import { query } from "@/lib/db";
import { getPublishedStore, toProduct } from "@/lib/store-data";

export const dynamic = "force-dynamic";

export default async function ProductPage({
  params,
}: {
  params: { slug: string; id: string };
}) {
  const store = await getPublishedStore(params.slug);
  if (!store) notFound();
  const result = await query("SELECT * FROM products WHERE id = $1 AND store_id = $2 LIMIT 1", [params.id, store.id]);
  if (!result.rows[0]) notFound();
  const product = toProduct(result.rows[0]);
  const whatsappMessage = `Hello ${store.name}, I would like to buy ${product.name} for ₦${Number(product.price).toLocaleString()}. Please let me know if it is available.`;
  const whatsappLink = store.whatsappNumber
    ? `https://wa.me/${store.whatsappNumber.replace(/\D/g, "")}?text=${encodeURIComponent(whatsappMessage)}`
    : null;

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <div className="grid grid-cols-1 gap-10 sm:grid-cols-2">
        <div className="aspect-square overflow-hidden rounded-lg bg-black/5">
          {product.image ? (
            <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
          ) : (
            <div className="grid h-full place-items-center text-sm text-slate-500">Product image coming soon</div>
          )}
        </div>
        <div>
          <h1 className="text-2xl font-semibold">{product.name}</h1>
          <p className="mt-2 text-lg opacity-70">
            ₦{Number(product.price).toLocaleString()}
          </p>
          {product.description && (
            <p className="mt-4 text-sm opacity-70">{product.description}</p>
          )}
          <div className="mt-6">
            <AddToCartButton
              storeSlug={store.slug}
              productId={product.id}
              name={product.name}
              price={Number(product.price)}
              outOfStock={product.stockStatus === "OUT_OF_STOCK"}
            />
          </div>
          {whatsappLink && (
            <a
              href={whatsappLink}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex items-center gap-2 rounded px-6 py-3 text-sm font-semibold text-white transition hover:scale-[1.02]"
              style={{ background: "#25D366", borderRadius: "var(--store-radius)" }}
            >
              Buy on WhatsApp
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
