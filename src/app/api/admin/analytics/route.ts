import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getCurrentRole, isPlatformAdmin } from "@/lib/roles";
export async function GET() { const role = await getCurrentRole(); if (!isPlatformAdmin(role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 }); const result = await query("SELECT COUNT(*)::int AS total_visits, COUNT(DISTINCT visitor_id)::int AS unique_visitors, COUNT(DISTINCT store_id)::int AS stores_visited FROM store_visits"); return NextResponse.json({ ...result.rows[0], role }); }
