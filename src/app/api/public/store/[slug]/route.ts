import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: { slug: string } }) {
  const store = await prisma.store.findUnique({
    where: { slug: params.slug },
    include: {
      sections: {
        where: { isVisible: true },
        orderBy: { sectionOrder: "asc" },
      },
      products: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!store || !store.isPublished) {
    return NextResponse.json({ error: "Store not found." }, { status: 404 });
  }

  return NextResponse.json(store);
}
