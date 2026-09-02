import { query } from "@/lib/db";
import type { Product, Section, Store } from "@/types/db";

type Row = Record<string, unknown>;

export function toStore(row: Row): Store {
  return {
    id: String(row.id), ownerId: String(row.owner_id), name: String(row.name), slug: String(row.slug),
    description: row.description as string | null, logo: row.logo as string | null,
    primaryColor: String(row.primary_color), backgroundColor: String(row.background_color),
    font: String(row.font), buttonStyle: row.button_style as Store["buttonStyle"],
    isPublished: Boolean(row.is_published), createdAt: row.created_at as Date, updatedAt: row.updated_at as Date,
  };
}

export function toSection(row: Row): Section {
  return {
    id: String(row.id), storeId: String(row.store_id), sectionType: row.section_type as Section["sectionType"],
    content: row.content, isVisible: Boolean(row.is_visible), sectionOrder: Number(row.section_order),
    createdAt: row.created_at as Date, updatedAt: row.updated_at as Date,
  };
}

export function toProduct(row: Row): Product {
  return {
    id: String(row.id), storeId: String(row.store_id), name: String(row.name),
    description: row.description as string | null, price: String(row.price), image: row.image as string | null,
    stockStatus: row.stock_status as Product["stockStatus"], inventoryQuantity: Number(row.inventory_quantity),
    createdAt: row.created_at as Date, updatedAt: row.updated_at as Date,
  };
}

export async function getPublishedStore(slug: string): Promise<Store | null> {
  const result = await query("SELECT * FROM stores WHERE slug = $1 AND is_published = true LIMIT 1", [slug]);
  return result.rows[0] ? toStore(result.rows[0]) : null;
}

export async function getPublishedStorefront(slug: string) {
  const store = await getPublishedStore(slug);
  if (!store) return null;
  const [sections, products] = await Promise.all([
    query("SELECT * FROM sections WHERE store_id = $1 AND is_visible = true ORDER BY section_order ASC", [store.id]),
    query("SELECT * FROM products WHERE store_id = $1 ORDER BY created_at DESC LIMIT 8", [store.id]),
  ]);
  return { store, sections: sections.rows.map(toSection), products: products.rows.map(toProduct) };
}
