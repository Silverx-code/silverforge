import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { query } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { Store } from "@/types/db";

const updateStoreSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  description: z.string().max(500).optional(),
  logo: z.string().url().optional().nullable(),
  whatsappNumber: z.string().transform((value) => value.replace(/\D/g, "")).refine((value) => value.length >= 8 && value.length <= 15, "Enter a WhatsApp number with country code.").optional().nullable(),
  primaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  backgroundColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  font: z.string().min(1).max(60).optional(),
  buttonStyle: z.enum(["ROUNDED", "SQUARE", "PILL"]).optional(),
  isPublished: z.boolean().optional(),
});

function rowToStore(row: any): Store | null {
  if (!row) return null;
  return {
    id: row.id,
    ownerId: row.owner_id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    logo: row.logo,
    whatsappNumber: row.whatsapp_number,
    primaryColor: row.primary_color,
    backgroundColor: row.background_color,
    font: row.font,
    buttonStyle: row.button_style,
    isPublished: row.is_published,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function assertOwnership(storeId: string, userId: string) {
  const res = await query(`SELECT * FROM stores WHERE id = $1 LIMIT 1`, [storeId]);
  const store = rowToStore(res.rows[0]);
  if (!store || store.ownerId !== userId) return null;
  return store;
}

export async function GET(_req: NextRequest, { params }: { params: { storeId: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const store = await assertOwnership(params.storeId, session.userId);
  if (!store) return NextResponse.json({ error: "Store not found." }, { status: 404 });

  return NextResponse.json(store);
}

export async function PATCH(req: NextRequest, { params }: { params: { storeId: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const store = await assertOwnership(params.storeId, session.userId);
  if (!store) return NextResponse.json({ error: "Store not found." }, { status: 404 });

  const body = await req.json().catch(() => null);
  const parsed = updateStoreSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid update." },
      { status: 400 }
    );
  }

  const data = parsed.data;
  const updates: string[] = [];
  const values: any[] = [];
  let idx = 1;

  if (data.name !== undefined) { updates.push(`name = $${idx++}`); values.push(data.name); }
  if (data.description !== undefined) { updates.push(`description = $${idx++}`); values.push(data.description); }
  if (data.logo !== undefined) { updates.push(`logo = $${idx++}`); values.push(data.logo); }
  if (data.whatsappNumber !== undefined) { updates.push(`whatsapp_number = $${idx++}`); values.push(data.whatsappNumber); }
  if (data.primaryColor !== undefined) { updates.push(`primary_color = $${idx++}`); values.push(data.primaryColor); }
  if (data.backgroundColor !== undefined) { updates.push(`background_color = $${idx++}`); values.push(data.backgroundColor); }
  if (data.font !== undefined) { updates.push(`font = $${idx++}`); values.push(data.font); }
  if (data.buttonStyle !== undefined) { updates.push(`button_style = $${idx++}`); values.push(data.buttonStyle); }
  if (data.isPublished !== undefined) { updates.push(`is_published = $${idx++}`); values.push(data.isPublished); }

  updates.push(`updated_at = NOW()`);

  if (updates.length > 1) {
    values.push(store.id);
    const updateRes = await query(
      `UPDATE stores SET ${updates.join(", ")} WHERE id = $${idx} RETURNING *`,
      values
    );
    return NextResponse.json(rowToStore(updateRes.rows[0]));
  }

  return NextResponse.json(store);
}
