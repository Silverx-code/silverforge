import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { pool, query } from "@/lib/db";
import { getOwnedStore } from "@/lib/tenant";

const schema = z.object({ sectionId: z.string().min(1), direction: z.enum(["up", "down"]) });

export async function POST(req: NextRequest) {
  const store = await getOwnedStore();
  if (!store) return NextResponse.json({ error: "Not authenticated or no store found." }, { status: 401 });
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid reorder request." }, { status: 400 });

  const res = await query(
    `SELECT id, section_order FROM sections WHERE store_id = $1 ORDER BY section_order ASC`,
    [store.id]
  );
  const sections = res.rows;
  const index = sections.findIndex((section) => section.id === parsed.data.sectionId);
  const target = sections[index + (parsed.data.direction === "up" ? -1 : 1)];
  const source = sections[index];
  if (!source || !target) return NextResponse.json({ error: "Section cannot be moved further." }, { status: 400 });

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query(`UPDATE sections SET section_order = $1 WHERE id = $2`, [target.section_order, source.id]);
    await client.query(`UPDATE sections SET section_order = $1 WHERE id = $2`, [source.section_order, target.id]);
    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }

  return NextResponse.json({ sourceId: source.id, sourceOrder: target.section_order, targetId: target.id, targetOrder: source.section_order });
}
