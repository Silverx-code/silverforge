import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { pool, query } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { createId } from "@/lib/id";

const createStoreSchema = z.object({
  name: z.string().min(1).max(120),
  description: z.string().max(500).optional(),
  whatsappNumber: z.string().transform((value) => value.replace(/\D/g, "")).refine((value) => value.length >= 8 && value.length <= 15, "Enter a WhatsApp number with country code."),
  slug: z
    .string()
    .min(2)
    .max(60)
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and dashes only."),
});

// Default homepage sections created for every new store, in display order.
const DEFAULT_SECTIONS = [
  { sectionType: "HEADER" as const, order: 0, content: { logoText: null } },
  {
    sectionType: "HERO" as const,
    order: 1,
    content: {
      heading: "The New Collection",
      description: "Designed for everyday expression",
      buttonText: "Shop Now",
      buttonLink: "/shop",
      image: null,
    },
  },
  {
    sectionType: "FEATURED_PRODUCTS" as const,
    order: 2,
    content: { heading: "Featured", productIds: [] },
  },
  {
    sectionType: "PROMO_BANNER" as const,
    order: 3,
    content: { heading: "Free delivery on your first order", link: null },
  },
  {
    sectionType: "ABOUT" as const,
    order: 4,
    content: { heading: "About us", body: "Tell your story here." },
  },
  {
    sectionType: "FOOTER" as const,
    order: 5,
    content: { text: null },
  },
];

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = createStoreSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid store details." },
      { status: 400 }
    );
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // MVP: one store per user.
    const existingRes = await client.query(`SELECT id FROM stores WHERE owner_id = $1 LIMIT 1`, [session.userId]);
    if (existingRes.rows.length > 0) {
      await client.query("ROLLBACK");
      return NextResponse.json(
        { error: "You already have a store. Multi-store per user isn't supported yet." },
        { status: 409 }
      );
    }

    const slugRes = await client.query(`SELECT id FROM stores WHERE slug = $1 LIMIT 1`, [parsed.data.slug]);
    if (slugRes.rows.length > 0) {
      await client.query("ROLLBACK");
      return NextResponse.json(
        { error: "That store address is already taken." },
        { status: 409 }
      );
    }

    const storeId = createId("sto");
    await client.query(
      `INSERT INTO stores (id, owner_id, name, description, slug, whatsapp_number) VALUES ($1, $2, $3, $4, $5, $6)`,
      [storeId, session.userId, parsed.data.name, parsed.data.description || null, parsed.data.slug, parsed.data.whatsappNumber]
    );

    for (const s of DEFAULT_SECTIONS) {
      const secId = createId("sec");
      await client.query(
        `INSERT INTO sections (id, store_id, section_type, content, section_order) VALUES ($1, $2, $3, $4, $5)`,
        [secId, storeId, s.sectionType, JSON.stringify(s.content), s.order]
      );
    }

    await client.query("COMMIT");

    const newStoreRes = await query(`SELECT * FROM stores WHERE id = $1`, [storeId]);
    return NextResponse.json(newStoreRes.rows[0], { status: 201 });
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}
