import { notFound } from "next/navigation";
import { CartProvider } from "@/lib/cart-context";
import { getPublishedStore } from "@/lib/store-data";
import { getSession } from "@/lib/auth";
import { query } from "@/lib/db";
import { redirect } from "next/navigation";
import VisitTracker from "./visit-tracker";

export const dynamic = "force-dynamic";

export default async function StoreLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { slug: string };
}) {
  // Visitors can browse without an account. Signed-in accounts must finish their
  // short tutorial before shopping so both roles receive the guided introduction.
  const session = await getSession();
  if (session) {
    const user = await query("SELECT onboarding_completed FROM users WHERE id = $1 LIMIT 1", [session.userId]);
    if (user.rows[0] && !user.rows[0].onboarding_completed) redirect("/onboarding");
  }
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
      <VisitTracker slug={store.slug} /><CartProvider storeSlug={store.slug}>{children}</CartProvider>
    </div>
  );
}
