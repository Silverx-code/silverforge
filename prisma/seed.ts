import bcrypt from "bcryptjs";
import { PrismaClient, SectionType } from "@prisma/client";

const prisma = new PrismaClient();
const sections: { sectionType: SectionType; sectionOrder: number; content: object }[] = [
  { sectionType: "HEADER", sectionOrder: 0, content: { logoText: "The Modern Smith" } },
  { sectionType: "HERO", sectionOrder: 1, content: { heading: "Handcrafted Excellence", description: "Forging raw materials into timeless, robust tools and artifacts.", buttonText: "Shop Now", image: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=1800&q=80" } },
  { sectionType: "FEATURED_PRODUCTS", sectionOrder: 2, content: { heading: "Featured Works" } },
  { sectionType: "ABOUT", sectionOrder: 3, content: { heading: "The Forge Heritage", body: "Built on industrial strength and refined design. Each piece is a testament to materials transformed through heat and intent." } },
  { sectionType: "FOOTER", sectionOrder: 4, content: { text: "Built with precision." } },
];

async function main() {
  const passwordHash = await bcrypt.hash("demo-password-123", 10);
  const user = await prisma.user.upsert({ where: { email: "demo@silverforge.test" }, update: {}, create: { name: "Demo Merchant", email: "demo@silverforge.test", passwordHash } });
  let store = await prisma.store.findUnique({ where: { slug: "modern-smith" } });
  if (!store) store = await prisma.store.create({ data: { ownerId: user.id, name: "The Modern Smith", slug: "modern-smith", description: "Handcrafted modern objects", isPublished: true } });
  await prisma.section.createMany({ data: sections.map((section) => ({ ...section, storeId: store!.id })), skipDuplicates: true });
  if (!(await prisma.product.count({ where: { storeId: store.id } }))) {
    await prisma.product.createMany({ data: [
      { storeId: store.id, name: "The Apex Chef's Blade", description: "Masterfully forged Damascus steel.", price: 345, inventoryQuantity: 12, image: "https://images.unsplash.com/photo-1593618998160-e34014e67546?auto=format&fit=crop&w=1200&q=80" },
      { storeId: store.id, name: "Foundry Skillet", description: "A modern heirloom cast-iron skillet.", price: 120, inventoryQuantity: 8, image: "https://images.unsplash.com/photo-1584990347449-a2d4ea6d5d8b?auto=format&fit=crop&w=1200&q=80" },
      { storeId: store.id, name: "Anvil Bookends", description: "Solid steel structural supports.", price: 85, inventoryQuantity: 20 },
    ] });
  }
  console.log("Seeded demo@silverforge.test / demo-password-123 and /store/modern-smith");
}
main().finally(() => prisma.$disconnect());
