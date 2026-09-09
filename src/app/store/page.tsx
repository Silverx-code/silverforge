import Link from "next/link";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

type PublishedStore = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  primary_color: string;
};

export default async function StoreDirectoryPage() {
  const { rows } = await query(
    "SELECT id, name, slug, description, primary_color FROM stores WHERE is_published = TRUE ORDER BY updated_at DESC, name ASC"
  );
  const stores = rows as PublishedStore[];

  return (
    <main className="min-h-screen bg-canvas px-6 py-12">
      <div className="mx-auto max-w-6xl">
        <Link href="/" className="font-display text-2xl font-bold text-forge">SilverForge</Link>
        <p className="mt-10 text-sm font-semibold uppercase tracking-[.18em] text-forge">Discover</p>
        <h1 className="mt-2 font-display text-4xl font-bold tracking-tight text-slate sm:text-5xl">Live stores</h1>
        <p className="mt-3 max-w-2xl text-slate-600">Browse every store currently open to customers.</p>
        {stores.length ? (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {stores.map((store) => (
              <Link key={store.id} href={`/store/${store.slug}`} className="forge-card group block overflow-hidden p-0 transition hover:-translate-y-1 hover:shadow-lg">
                <div className="h-2" style={{ backgroundColor: store.primary_color }} />
                <div className="p-6">
                  <h2 className="font-display text-2xl font-semibold text-slate group-hover:text-forge">{store.name}</h2>
                  <p className="mt-3 min-h-12 text-sm leading-6 text-slate-600">{store.description || "Visit this SilverForge store."}</p>
                  <p className="mt-6 text-sm font-semibold text-forge">Visit store <span aria-hidden="true">→</span></p>
                </div>
              </Link>
            ))}
          </div>
        ) : <p className="mt-8 rounded-xl border border-dashed p-10 text-center text-slate-600">There are no live stores yet. Check back soon.</p>}
      </div>
    </main>
  );
}
