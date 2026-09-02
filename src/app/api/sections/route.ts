import { NextResponse } from "next/server";
import { getOwnedStore } from "@/lib/tenant";
import { query } from "@/lib/db";

function rowToSection(row: any) {
  if (!row) return null;
  return {
    id: row.id,
    storeId: row.store_id,
    sectionType: row.section_type,
    content: row.content,
    isVisible: row.is_visible,
    sectionOrder: row.section_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function GET() {
  const store = await getOwnedStore();
  if (!store) return NextResponse.json({ error: "No store found." }, { status: 404 });

  const res = await query(
    `SELECT * FROM sections WHERE store_id = $1 ORDER BY section_order ASC`,
    [store.id]
  );

  return NextResponse.json(res.rows.map(rowToSection));
}
