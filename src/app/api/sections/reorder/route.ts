import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getOwnedStore } from "@/lib/tenant";

const schema = z.object({ sectionId: z.string().min(1), direction: z.enum(["up", "down"]) });

export async function POST(req: NextRequest) {
  const store = await getOwnedStore();
  if (!store) return NextResponse.json({ error: "Not authenticated or no store found." }, { status: 401 });
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid reorder request." }, { status: 400 });

  const sections = await prisma.section.findMany({ where: { storeId: store.id }, orderBy: { sectionOrder: "asc" } });
  const index = sections.findIndex((section) => section.id === parsed.data.sectionId);
  const target = sections[index + (parsed.data.direction === "up" ? -1 : 1)];
  const source = sections[index];
  if (!source || !target) return NextResponse.json({ error: "Section cannot be moved further." }, { status: 400 });

  await prisma.$transaction([
    prisma.section.update({ where: { id: source.id }, data: { sectionOrder: target.sectionOrder } }),
    prisma.section.update({ where: { id: target.id }, data: { sectionOrder: source.sectionOrder } }),
  ]);
  return NextResponse.json({ sourceId: source.id, sourceOrder: target.sectionOrder, targetId: target.id, targetOrder: source.sectionOrder });
}
