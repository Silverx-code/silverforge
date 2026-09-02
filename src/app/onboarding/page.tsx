"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Role = "seller" | "customer";
const customerSteps = [["Browse", "Open a published store from its shared SilverForge link."], ["Build your cart", "Your cart is separate for each store, so products never mix."], ["Place an order", "At checkout, provide delivery details and the seller will confirm next steps."]];
const sellerSteps = [["Create your storefront", "Choose a business name, description, and memorable web address."], ["Stock your store", "Add products with prices and quantities. Checkout reserves stock automatically."], ["Design and publish", "Use the design workspace and appearance settings, then publish when ready."]];

function slugify(input: string) { return input.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, ""); }

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1); const [role, setRole] = useState<Role | null>(null);
  const [name, setName] = useState(""); const [description, setDescription] = useState(""); const [whatsappNumber, setWhatsappNumber] = useState(""); const [slug, setSlug] = useState(""); const [slugTouched, setSlugTouched] = useState(false);
  const [error, setError] = useState<string | null>(null); const [loading, setLoading] = useState(false);
  const seller = role === "seller";

  async function complete(accountType: "SELLER" | "CUSTOMER") {
    const res = await fetch("/api/auth/onboarding", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ accountType }) });
    const data = await res.json(); if (!res.ok) throw new Error(data.error ?? "We couldn't finish the tutorial.");
  }
  async function finishCustomer() { setLoading(true); setError(null); try { await complete("CUSTOMER"); router.push("/"); router.refresh(); } catch (e) { setError(e instanceof Error ? e.message : "We couldn't finish the tutorial."); } finally { setLoading(false); } }
  async function createStore() {
    setLoading(true); setError(null);
    try {
      const res = await fetch("/api/stores", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, description, whatsappNumber, slug }) });
      const data = await res.json(); if (!res.ok) throw new Error(data.error ?? "We couldn't create your store.");
      await complete("SELLER"); router.push("/dashboard"); router.refresh();
    } catch (e) { setError(e instanceof Error ? e.message : "We couldn't create your store."); } finally { setLoading(false); }
  }

  const Tutorial = ({ items }: { items: string[][] }) => <ol className="mt-7 space-y-4">{items.map(([title, text], index) => <li key={title} className="rounded-lg border bg-slate-50 p-4"><span className="text-sm font-bold text-forge">0{index + 1}</span><h2 className="mt-1 font-display font-semibold">{title}</h2><p className="mt-1 text-sm leading-6 text-slate-600">{text}</p></li>)}</ol>;
  return <main className="grid min-h-screen place-items-center bg-canvas px-5 py-10"><div className="w-full max-w-2xl"><div className="mb-8 flex items-center justify-between"><span className="font-display text-2xl font-bold text-forge">SilverForge</span><span className="text-sm text-slate-500">Step {step} of {seller ? 4 : 2}</span></div><div className="forge-card p-7 md:p-10">
    {step === 1 && <><p className="text-sm font-semibold uppercase tracking-[.18em] text-forge">Welcome</p><h1 className="mt-3 font-display text-3xl font-semibold">What brings you to SilverForge?</h1><p className="mt-3 text-slate-600">First, take a short guide tailored to how you will use the platform.</p><div className="mt-8 grid gap-4 md:grid-cols-2"><button onClick={() => { setRole("seller"); setStep(2); }} className="rounded-xl border-2 border-slate-200 p-6 text-left transition hover:border-forge hover:bg-forge/5"><h2 className="font-display text-xl font-semibold">I want to sell</h2><p className="mt-2 text-sm leading-6 text-slate-600">Create a store, add products, manage inventory, and receive orders.</p></button><button onClick={() => { setRole("customer"); setStep(2); }} className="rounded-xl border-2 border-slate-200 p-6 text-left transition hover:border-forge hover:bg-forge/5"><h2 className="font-display text-xl font-semibold">I want to shop</h2><p className="mt-2 text-sm leading-6 text-slate-600">Learn how stores, carts, and checkout work before you browse.</p></button></div></>}
    {step === 2 && role === "customer" && <><p className="text-sm font-semibold uppercase tracking-[.18em] text-forge">Customer quick tour</p><h1 className="mt-3 font-display text-3xl font-semibold">You are ready to discover stores.</h1><Tutorial items={customerSteps}/>{error && <p className="mt-4 text-sm text-red-600">{error}</p>}<div className="mt-8 flex gap-3"><button onClick={() => setStep(1)} className="forge-button-secondary">Back</button><button disabled={loading} onClick={finishCustomer} className="forge-button flex-1">{loading ? "Finishing…" : "Start exploring"}</button></div></>}
    {step === 2 && seller && <><p className="text-sm font-semibold uppercase tracking-[.18em] text-forge">Seller quick tour</p><h1 className="mt-3 font-display text-3xl font-semibold">Here is your launch plan.</h1><Tutorial items={sellerSteps}/><div className="mt-8 flex gap-3"><button onClick={() => setStep(1)} className="forge-button-secondary">Back</button><button onClick={() => setStep(3)} className="forge-button flex-1">Create my store</button></div></>}
    {step === 3 && seller && <><p className="text-sm font-semibold uppercase tracking-[.18em] text-forge">Store details</p><h1 className="mt-3 font-display text-3xl font-semibold">Tell us about your business.</h1><div className="mt-7 space-y-4"><label className="block text-sm font-medium text-slate-700">Store name<input className="input mt-1 w-full" value={name} onChange={(e) => { setName(e.target.value); if (!slugTouched) setSlug(slugify(e.target.value)); }} placeholder="The Modern Smith" /></label><label className="block text-sm font-medium text-slate-700">WhatsApp business number<input className="input mt-1 w-full" value={whatsappNumber} onChange={(e) => setWhatsappNumber(e.target.value)} placeholder="2348012345678" inputMode="tel" /><span className="mt-1 block text-xs font-normal text-slate-500">Include country code. Customers will use this number to contact you.</span></label><label className="block text-sm font-medium text-slate-700">Store description<textarea className="input mt-1 w-full" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Objects made to last." rows={3} /></label></div><div className="mt-8 flex gap-3"><button onClick={() => setStep(2)} className="forge-button-secondary">Back</button><button disabled={!name.trim() || whatsappNumber.replace(/\D/g, "").length < 8} onClick={() => setStep(4)} className="forge-button flex-1">Continue</button></div></>}
    {step === 4 && seller && <><p className="text-sm font-semibold uppercase tracking-[.18em] text-forge">Store address</p><h1 className="mt-3 font-display text-3xl font-semibold">Choose your public URL.</h1><p className="mt-2 text-slate-600">Customers will find your store at this address.</p><label className="mt-7 block text-sm font-medium text-slate-700">silverforge.com/store/<input className="input mt-1 w-full" value={slug} onChange={(e) => { setSlugTouched(true); setSlug(slugify(e.target.value)); }} placeholder="the-modern-smith" /></label>{error && <p className="mt-3 text-sm text-red-600">{error}</p>}<div className="mt-8 flex gap-3"><button onClick={() => setStep(3)} className="forge-button-secondary">Back</button><button disabled={!slug.trim() || loading} onClick={createStore} className="forge-button flex-1">{loading ? "Creating your store…" : "Launch workspace"}</button></div></>}
  </div></div></main>;
}
