import { pool } from "../src/lib/db";
import { hashPassword } from "../src/lib/password";
import { createId } from "../src/lib/id";

const sections = [
  { sectionType: "HEADER", sectionOrder: 0, content: { logoText: "The Modern Smith" } },
  { sectionType: "HERO", sectionOrder: 1, content: { heading: "Handcrafted Excellence", description: "Forging raw materials into timeless, robust tools and artifacts.", buttonText: "Shop Now", image: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=1800&q=80" } },
  { sectionType: "FEATURED_PRODUCTS", sectionOrder: 2, content: { heading: "Featured Works" } },
  { sectionType: "ABOUT", sectionOrder: 3, content: { heading: "The Forge Heritage", body: "Built on industrial strength and refined design. Each piece is a testament to materials transformed through heat and intent." } },
  { sectionType: "FOOTER", sectionOrder: 4, content: { text: "Built with precision." } },
];

async function main() {
  const passwordHash = await hashPassword("demo-password-123");
  
  // Upsert user
  let userRes = await pool.query(`SELECT id FROM users WHERE email = $1`, ["demo@silverforge.test"]);
  let userId: string;
  if (userRes.rows.length === 0) {
    userId = createId("usr");
    await pool.query(
      `INSERT INTO users (id, email, password_hash, name) VALUES ($1, $2, $3, $4)`,
      [userId, "demo@silverforge.test", passwordHash, "Demo Merchant"]
    );
  } else {
    userId = userRes.rows[0].id;
  }

  // Find or create store
  let storeRes = await pool.query(`SELECT id FROM stores WHERE slug = $1`, ["modern-smith"]);
  let storeId: string;
  if (storeRes.rows.length === 0) {
    storeId = createId("sto");
    await pool.query(
      `INSERT INTO stores (id, owner_id, name, slug, description, is_published) VALUES ($1, $2, $3, $4, $5, $6)`,
      [storeId, userId, "The Modern Smith", "modern-smith", "Handcrafted modern objects", true]
    );
  } else {
    storeId = storeRes.rows[0].id;
  }

  // Insert sections
  for (const s of sections) {
    await pool.query(
      `INSERT INTO sections (id, store_id, section_type, content, is_visible, section_order)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (store_id, section_type) DO NOTHING`,
      [createId("sec"), storeId, s.sectionType, JSON.stringify(s.content), true, s.sectionOrder]
    );
  }

  // Check products count
  let prodCount = await pool.query(`SELECT COUNT(*) FROM products WHERE store_id = $1`, [storeId]);
  if (parseInt(prodCount.rows[0].count, 10) === 0) {
    const products = [
      { name: "The Apex Chef's Blade", description: "Masterfully forged Damascus steel.", price: 345, inventoryQuantity: 12, image: "https://images.unsplash.com/photo-1593618998160-e34014e67546?auto=format&fit=crop&w=1200&q=80" },
      { name: "Foundry Skillet", description: "A modern heirloom cast-iron skillet.", price: 120, inventoryQuantity: 8, image: "https://images.unsplash.com/photo-1584990347449-a2d4ea6d5d8b?auto=format&fit=crop&w=1200&q=80" },
      { name: "Anvil Bookends", description: "Solid steel structural supports.", price: 85, inventoryQuantity: 20, image: null },
    ];
    for (const p of products) {
      await pool.query(
        `INSERT INTO products (id, store_id, name, description, price, image, inventory_quantity, stock_status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, 'IN_STOCK')`,
        [createId("prd"), storeId, p.name, p.description, p.price, p.image, p.inventoryQuantity]
      );
    }
  }

  console.log("Seeded demo@silverforge.test / demo-password-123 and /store/modern-smith");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => pool.end());
