import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { query } from "@/lib/db";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const userRes = await query(`SELECT id, email, name FROM users WHERE id = $1 LIMIT 1`, [session.userId]);
  const user = userRes.rows[0];

  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const storesRes = await query(`SELECT id, name, slug FROM stores WHERE owner_id = $1`, [session.userId]);

  return NextResponse.json({
    id: user.id,
    email: user.email,
    name: user.name,
    stores: storesRes.rows,
  });
}
