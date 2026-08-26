import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CartProvider } from "@/lib/cart-context";

export const dynamic = "force-dynamic";

export default async function StoreLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { slug: string };
}) {
  const store = await prisma.store.findUnique({ where: { slug: params.slug } });

  if (!store || !store.isPublished) notFound();

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
