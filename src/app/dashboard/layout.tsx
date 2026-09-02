import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getOwnedStore } from "@/lib/tenant";
import { query } from "@/lib/db";
import LogoutButton from "./logout-button";

const nav = [["/dashboard", "▦", "Overview"], ["/dashboard/website", "◎", "Website"], ["/dashboard/products", "▣", "Products"], ["/dashboard/orders", "🛒", "Orders"], ["/dashboard/settings", "⚙", "Settings"]];
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login");
  const user = await query("SELECT onboarding_completed FROM users WHERE id = $1 LIMIT 1", [session.userId]);
  if (!user.rows[0]?.onboarding_completed) redirect("/onboarding");
  const store = await getOwnedStore(); if (!store) redirect("/onboarding");
  return <div className="min-h-screen bg-canvas md:flex"><aside className="flex w-full flex-col border-b bg-slate-100 p-5 md:fixed md:inset-y-0 md:w-80 md:border-b-0 md:border-r md:p-7"><div><Link href="/dashboard" className="flex items-center gap-3"><div className="grid h-11 w-11 place-items-center rounded-full border bg-white font-display font-bold text-forge">SF</div><div><p className="font-display text-2xl font-semibold text-forge">{store.name}</p><p className="text-sm text-slate-600">Active: Store owner</p></div></Link><Link href="/dashboard/settings" className="forge-button mt-5 block w-full text-center">Manage Store</Link><nav className="mt-7 flex gap-1 overflow-x-auto md:flex-col">{nav.map(([href, icon, label]) => <Link key={href} href={href} className="flex shrink-0 items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-200 hover:text-slate"><span className="text-lg">{icon}</span>{label}</Link>)}</nav></div><div className="mt-6 border-t pt-5 text-sm md:mt-auto"><Link href={`/store/${store.slug}`} target="_blank" className="mb-3 block px-4 text-slate-600 hover:text-forge">↗ View public store</Link><LogoutButton /></div></aside><main className="min-w-0 flex-1 p-5 md:ml-80 md:p-10">{children}</main></div>;
}
