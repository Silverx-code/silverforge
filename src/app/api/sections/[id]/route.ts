import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getOwnedStore } from "@/lib/tenant";

const updateSectionSchema = z.object({
  content: z.record(z.any()).optional(),
  isVisible: z.boolean().optional(),
  sectionOrder: z.number().int().min(0).optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const store = await getOwnedStore();
  if (!store) return NextResponse.json({ error: "No store found." }, { status: 404 });

  const section = await prisma.section.findUnique({ where: { id: params.id } });
  if (!section || section.storeId !== store.id) {
    return NextResponse.json({ error: "Section not found." }, { status: 404 });
  }

  const body = await req.json().catch(() => null);
  const parsed = updateSectionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid update." }, { status: 400 });
  }

  const updated = await prisma.section.update({
    where: { id: params.id },
    data: {
      ...(parsed.data.content !== undefined && {
        content: { ...(section.content as object), ...parsed.data.content },
      }),
      ...(parsed.data.isVisible !== undefined && { isVisible: parsed.data.isVisible }),
      ...(parsed.data.sectionOrder !== undefined && { sectionOrder: parsed.data.sectionOrder }),
    },
  });

  return NextResponse.json(updated);
}
