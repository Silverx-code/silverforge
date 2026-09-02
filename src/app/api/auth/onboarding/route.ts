import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { query } from "@/lib/db";

const schema = z.object({ accountType: z.enum(["SELLER", "CUSTOMER"]) });

/** Marks the short, role-specific tutorial complete for the signed-in account. */
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Choose an account type." }, { status: 400 });

  if (parsed.data.accountType === "SELLER") {
    const store = await query("SELECT id FROM stores WHERE owner_id = $1 LIMIT 1", [session.userId]);
    if (!store.rows[0]) return NextResponse.json({ error: "Create your store before completing seller onboarding." }, { status: 400 });
  }

  await query(
    "UPDATE users SET account_type = $1, onboarding_completed = TRUE WHERE id = $2",
    [parsed.data.accountType, session.userId]
  );
  return NextResponse.json({ ok: true, accountType: parsed.data.accountType });
}
