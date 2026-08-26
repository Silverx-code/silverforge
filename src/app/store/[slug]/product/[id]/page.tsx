import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AddToCartButton from "../../add-to-cart-button";

export const dynamic = "force-dynamic";

export default async function ProductPage({
  params,
}: {
  params: { slug: string; id: string };
}) {
  const store = await prisma.store.findUnique({ where: { slug: params.slug } });
  if (!store || !store.isPublished) notFound();

  const product = await prisma.product.findUnique({ where: { id: params.id } });
  if (!product || product.storeId !== store.id) notFound();

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
        </div>
      </div>
    </div>
  );
}
