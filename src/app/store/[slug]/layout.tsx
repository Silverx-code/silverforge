import { notFound } from "next/navigation";
import { CartProvider } from "@/lib/cart-context";
import { getPublishedStore } from "@/lib/store-data";

export const dynamic = "force-dynamic";

export default async function StoreLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { slug: string };
}) {
  const store = await getPublishedStore(params.slug);
  if (!store) notFound();

  const buttonRadius =
    store.buttonStyle === "SQUARE" ? "0px" : store.buttonStyle === "PILL" ? "9999px" : "0.5rem";

  return (
    <div
      style={
        {
          "--store-primary": store.primaryColor,
          "--store-bg": store.backgroundColor,
          "--store-font": store.font,
          "--store-radius": buttonRadius,
          background: "var(--store-bg)",
          fontFamily: "var(--store-font), sans-serif",
        } as React.CSSProperties
      }
      className="min-h-screen"
    >
      <CartProvider storeSlug={store.slug}>{children}</CartProvider>
    </div>
  );
}
