import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

const createStoreSchema = z.object({
  name: z.string().min(1).max(120),
  description: z.string().max(500).optional(),
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

  // MVP: one store per user.
  const existing = await prisma.store.findFirst({ where: { ownerId: session.userId } });
  if (existing) {
    return NextResponse.json(
      { error: "You already have a store. Multi-store per user isn't supported yet." },
      { status: 409 }
    );
  }

  const slugTaken = await prisma.store.findUnique({ where: { slug: parsed.data.slug } });
  if (slugTaken) {
    return NextResponse.json(
      { error: "That store address is already taken." },
      { status: 409 }
    );
  }

  const store = await prisma.store.create({
    data: {
      ownerId: session.userId,
      name: parsed.data.name,
      description: parsed.data.description,
      slug: parsed.data.slug,
      sections: {
        create: DEFAULT_SECTIONS.map((s) => ({
          sectionType: s.sectionType,
          sectionOrder: s.order,
          content: s.content,
        })),
      },
    },
  });

  return NextResponse.json(store, { status: 201 });
}
