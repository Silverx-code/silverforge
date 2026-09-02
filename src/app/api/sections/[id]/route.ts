import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { query } from "@/lib/db";
import { getOwnedStore } from "@/lib/tenant";

const updateSectionSchema = z.object({
  content: z.record(z.any()).optional(),
  isVisible: z.boolean().optional(),
  sectionOrder: z.number().int().min(0).optional(),
});

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

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const store = await getOwnedStore();
  if (!store) return NextResponse.json({ error: "No store found." }, { status: 404 });

  const sectionRes = await query(`SELECT * FROM sections WHERE id = $1 LIMIT 1`, [params.id]);
  const section = rowToSection(sectionRes.rows[0]);

  if (!section || section.storeId !== store.id) {
    return NextResponse.json({ error: "Section not found." }, { status: 404 });
  }

  const body = await req.json().catch(() => null);
  const parsed = updateSectionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid update." }, { status: 400 });
  }

  const data = parsed.data;
  const newContent = data.content !== undefined ? { ...(section.content as object), ...data.content } : section.content;
  const isVisible = data.isVisible !== undefined ? data.isVisible : section.isVisible;
  const sectionOrder = data.sectionOrder !== undefined ? data.sectionOrder : section.sectionOrder;

  const updateRes = await query(
    `UPDATE sections SET content = $1, is_visible = $2, section_order = $3, updated_at = NOW() WHERE id = $4 RETURNING *`,
    [JSON.stringify(newContent), isVisible, sectionOrder, params.id]
  );

  return NextResponse.json(rowToSection(updateRes.rows[0]));
}
