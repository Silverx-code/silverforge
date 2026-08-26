import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

const updateStoreSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  description: z.string().max(500).optional(),
  logo: z.string().url().optional().nullable(),
  primaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  backgroundColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  font: z.string().min(1).max(60).optional(),
  buttonStyle: z.enum(["ROUNDED", "SQUARE", "PILL"]).optional(),
  isPublished: z.boolean().optional(),
});

async function assertOwnership(storeId: string, userId: string) {
  const store = await prisma.store.findUnique({ where: { id: storeId } });
  if (!store || store.ownerId !== userId) return null;
  return store;
}

export async function GET(_req: NextRequest, { params }: { params: { storeId: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const store = await assertOwnership(params.storeId, session.userId);
  if (!store) return NextResponse.json({ error: "Store not found." }, { status: 404 });

  return NextResponse.json(store);
}

export async function PATCH(req: NextRequest, { params }: { params: { storeId: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const store = await assertOwnership(params.storeId, session.userId);
  if (!store) return NextResponse.json({ error: "Store not found." }, { status: 404 });

  const body = await req.json().catch(() => null);
  const parsed = updateStoreSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid update." },
      { status: 400 }
    );
  }

  const updated = await prisma.store.update({
    where: { id: store.id },
    data: parsed.data,
  });

  return NextResponse.json(updated);
}
