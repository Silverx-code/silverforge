import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(_req: NextRequest, { params }: { params: { slug: string } }) {
  const storeRes = await query(`SELECT * FROM stores WHERE slug = $1 LIMIT 1`, [params.slug]);
  const storeRow = storeRes.rows[0];

  if (!storeRow || !storeRow.is_published) {
    return NextResponse.json({ error: "Store not found." }, { status: 404 });
  }

  const sectionsRes = await query(
    `SELECT * FROM sections WHERE store_id = $1 AND is_visible = true ORDER BY section_order ASC`,
    [storeRow.id]
  );

  const productsRes = await query(
    `SELECT * FROM products WHERE store_id = $1 ORDER BY created_at DESC`,
    [storeRow.id]
  );

  const formattedStore = {
    id: storeRow.id,
    ownerId: storeRow.owner_id,
    name: storeRow.name,
    slug: storeRow.slug,
    description: storeRow.description,
    logo: storeRow.logo,
    primaryColor: storeRow.primary_color,
    backgroundColor: storeRow.background_color,
    font: storeRow.font,
    buttonStyle: storeRow.button_style,
    isPublished: storeRow.is_published,
    createdAt: storeRow.created_at,
    updatedAt: storeRow.updated_at,
    sections: sectionsRes.rows.map((s) => ({
      id: s.id,
      storeId: s.store_id,
      sectionType: s.section_type,
      content: s.content,
      isVisible: s.is_visible,
      sectionOrder: s.section_order,
      createdAt: s.created_at,
      updatedAt: s.updated_at,
    })),
    products: productsRes.rows.map((p) => ({
      id: p.id,
      storeId: p.store_id,
      name: p.name,
      description: p.description,
      price: Number(p.price),
      image: p.image,
      stockStatus: p.stock_status,
      inventoryQuantity: p.inventory_quantity,
      createdAt: p.created_at,
      updatedAt: p.updated_at,
    })),
  };

  return NextResponse.json(formattedStore);
}
