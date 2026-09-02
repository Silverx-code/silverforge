import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createId } from "@/lib/id";
import { query } from "@/lib/db";

const schema = z.object({ visitorId: z.string().min(16).max(80) });
export async function POST(req: NextRequest, { params }: { params: { slug: string } }) {
  const data = schema.safeParse(await req.json().catch(() => null));
  if (!data.success) return NextResponse.json({ ok: false }, { status: 400 });
  const store = await query("SELECT id FROM stores WHERE slug = $1 AND is_published = TRUE LIMIT 1", [params.slug]);
  if (!store.rows[0]) return NextResponse.json({ ok: false }, { status: 404 });
  await query("INSERT INTO store_visits (id, store_id, visitor_id) VALUES ($1, $2, $3) ON CONFLICT (store_id, visitor_id, visit_date) DO NOTHING", [createId("vis"), store.rows[0].id, data.data.visitorId]);
  return NextResponse.json({ ok: true });
}
