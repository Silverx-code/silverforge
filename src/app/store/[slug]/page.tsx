import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublishedStorefront } from "@/lib/store-data";

export const dynamic = "force-dynamic";

type Content = Record<string, string | null | undefined> & { productIds?: string[] };

export default async function StoreHomePage({ params }: { params: { slug: string } }) {
  const storefront = await getPublishedStorefront(params.slug);
  if (!storefront) notFound();
  const { store, products, sections } = storefront;
  const section = (type: string) => sections.find((item) => item.sectionType === type)?.content as Content | undefined;
  const header = section("HEADER");
  const hero = section("HERO");
  const featured = section("FEATURED_PRODUCTS");
  const promo = section("PROMO_BANNER");
  const about = section("ABOUT");
  const footer = section("FOOTER");
  const selectedProductIds = Array.isArray(featured?.productIds) ? featured.productIds : [];
  const displayedProducts = selectedProductIds.length ? products.filter((product) => selectedProductIds.includes(product.id)) : products;

  return <div className="bg-[#f7f9fb] text-[#191c1e]">
    {header && <header className="sticky top-0 z-10 border-b bg-white/95 backdrop-blur"><div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-6"><Link href={`/store/${store.slug}`} className="font-display text-xl font-bold text-forge">{header.logoText || store.name}</Link><nav className="hidden gap-7 text-sm text-slate-600 sm:flex"><a href="#shop">Shop</a>{about && <a href="#about">About</a>}<Link href={`/store/${store.slug}/cart`}>Cart</Link></nav><Link href={`/store/${store.slug}/cart`} className="rounded-lg border px-3 py-1.5 text-sm">Cart</Link></div></header>}
    <main className="mx-auto max-w-[1440px] px-6 py-6 md:px-10">
      {hero && <section className="relative isolate min-h-[420px] overflow-hidden rounded-xl bg-slate-800 px-8 py-20 md:px-16"><div className="absolute inset-0 bg-cover bg-center opacity-55" style={{ backgroundImage: `url(${hero.image || "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=1800&q=80"})` }} /><div className="absolute inset-0 bg-gradient-to-r from-white via-white/70 to-transparent" /><div className="relative max-w-lg"><p className="text-sm font-semibold uppercase tracking-[.2em] text-forge">Made with intention</p><h1 className="mt-5 font-display text-5xl font-bold leading-tight md:text-6xl">{hero.heading || "Handcrafted Excellence"}</h1>{hero.description && <p className="mt-5 text-base leading-7 text-slate-700">{hero.description}</p>}<a href={hero.buttonLink || "#shop"} className="mt-7 inline-block rounded-lg bg-forge px-6 py-3 text-sm font-semibold text-white">{hero.buttonText || "Shop Now"} →</a></div></section>}
      {promo && <a href={promo.link || "#shop"} className="mt-6 block rounded-xl bg-forge px-6 py-4 text-center font-semibold text-white">{promo.heading}</a>}
      {featured && <section id="shop" className="py-14"><h2 className="mb-7 font-display text-3xl font-semibold">{featured.heading || "Featured products"}</h2>{displayedProducts.length ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{displayedProducts.map((product) => <Link href={`/store/${store.slug}/product/${product.id}`} key={product.id} className="group overflow-hidden rounded-xl border bg-white shadow-forge transition hover:-translate-y-1"><div className="h-52 bg-slate-100">{product.image && <img src={product.image} alt={product.name} className="h-full w-full object-cover" />}</div><div className="p-5"><h3 className="font-display text-lg font-semibold">{product.name}</h3>{product.description && <p className="mt-2 line-clamp-2 text-sm text-slate-600">{product.description}</p>}<p className="mt-5 font-display text-lg font-semibold">₦{Number(product.price).toLocaleString()}</p></div></Link>)}</div> : <p className="rounded-xl border border-dashed p-12 text-center text-slate-500">New work is being prepared for the forge.</p>}</section>}
      {about && <section id="about" className="rounded-2xl border bg-white p-8 shadow-forge md:p-14"><h2 className="font-display text-3xl font-semibold">{about.heading || "Our Story"}</h2>{about.body && <p className="mt-5 leading-7 text-slate-600">{about.body}</p>}</section>}
    </main>
    {footer && <footer className="mt-12 bg-slate px-6 py-10 text-white"><div className="mx-auto max-w-[1440px]"><p className="font-display text-xl font-bold">{store.name}</p><p className="mt-2 text-sm text-slate-300">{footer.text || `© ${new Date().getFullYear()} SilverForge.`}</p></div></footer>}
  </div>;
}
