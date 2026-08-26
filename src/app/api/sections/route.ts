import { NextResponse } from "next/server";
import { getOwnedStore } from "@/lib/tenant";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const store = await getOwnedStore();
  if (!store) return NextResponse.json({ error: "No store found." }, { status: 404 });

  const sections = await prisma.section.findMany({
    where: { storeId: store.id },
    orderBy: { sectionOrder: "asc" },
  });

  return NextResponse.json(sections);
}
