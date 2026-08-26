import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <header className="sticky top-0 z-10 border-b bg-canvas/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-6 md:px-10">
          <Link href="/" className="font-display text-2xl font-bold tracking-tight text-forge">SilverForge</Link>
          <nav className="hidden items-center gap-7 text-sm font-medium text-slate-600 md:flex"><a href="#how-it-works">How it works</a><a href="#merchants">For merchants</a></nav>
          <div className="flex items-center gap-3"><Link href="/login" className="hidden text-sm font-medium text-slate-700 sm:block">Sign in</Link><Link href="/signup" className="forge-button">Sign up to sell</Link></div>
        </div>
      </header>
      <main className="flex-1">
        <section className="relative flex min-h-[560px] items-center justify-center overflow-hidden px-6 py-24 text-center md:py-32">
          <div className="pointer-events-none absolute inset-0 opacity-[0.055] [background-image:radial-gradient(#475569_1px,transparent_1px)] [background-size:24px_24px]" />
          <div className="relative max-w-4xl"><p className="mb-5 text-sm font-semibold uppercase tracking-[0.22em] text-forge">Refined commerce</p><h1 className="font-display text-5xl font-bold tracking-tight text-slate md:text-6xl">Forge Your Commerce Empire</h1><p className="mx-auto mt-6 max-w-2xl text-lg leading-7 text-slate-600">Build a professional online store, manage your inventory, and turn customer orders into a business built to last.</p><div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row"><Link href="/signup" className="forge-button px-8 py-4">Create your seller account</Link><a href="#how-it-works" className="forge-button-secondary px-8 py-4">See how it works</a></div><p className="mt-5 text-sm text-slate-500">Already have an account? <Link href="/login" className="font-medium text-forge hover:underline">Sign in</Link></p></div>
        </section>
        <section id="how-it-works" className="border-y bg-white px-6 py-16"><div className="mx-auto max-w-5xl"><p className="text-center text-sm font-semibold uppercase tracking-[.18em] text-forge">Your guided launch</p><h2 className="mt-3 text-center font-display text-3xl font-semibold">From account to storefront in a few steps</h2><div className="mt-10 grid gap-5 md:grid-cols-3"><Step number="01" title="Create an account" text="Use the seller sign-up button above to start your secure merchant account."/><Step number="02" title="Choose your path" text="The onboarding guide asks whether you want to sell or simply explore stores."/><Step number="03" title="Launch your store" text="Set your name and URL, add products, then publish when you are ready."/></div></div></section>
      </main>
      <footer className="border-t bg-slate px-6 py-10 text-slate-200"><div className="mx-auto flex max-w-[1440px] flex-col items-center justify-between gap-4 text-sm md:flex-row"><span className="font-display text-xl font-bold text-forge-light">SilverForge</span><span className="text-slate-300">© {new Date().getFullYear()} SilverForge. Refined Commerce.</span></div></footer>
    </div>
  );
}
function Step({number,title,text}:{number:string;title:string;text:string}) { return <article className="forge-card p-6"><span className="font-display text-sm font-bold text-forge">{number}</span><h3 className="mt-4 font-display text-xl font-semibold">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{text}</p></article>; }
