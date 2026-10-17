import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { query } from "@/lib/db";

const schema = z.object({ accountType: z.enum(["SELLER", "CUSTOMER"]) });

/** Marks the short, role-specific tutorial complete for the signed-in account. */
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

    const parsed = schema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) return NextResponse.json({ error: "Choose an account type." }, { status: 400 });

    const userRes = await query("SELECT account_type, onboarding_completed FROM users WHERE id = $1 LIMIT 1", [session.userId]);
    const user = userRes.rows[0];
    if (!user) return NextResponse.json({ error: "Account not found." }, { status: 404 });
    if (user.account_type === "ADMIN" || user.account_type === "SUPER_ADMIN") {
      return NextResponse.json({ error: "Platform administrator accounts cannot change account type here." }, { status: 403 });
    }
    if (user.onboarding_completed && user.account_type !== parsed.data.accountType) {
      return NextResponse.json({ error: "Account type can only be selected during onboarding." }, { status: 409 });
    }

    if (parsed.data.accountType === "SELLER") {
      const store = await query("SELECT id FROM stores WHERE owner_id = $1 LIMIT 1", [session.userId]);
      if (!store.rows[0]) return NextResponse.json({ error: "Create your store before completing seller onboarding." }, { status: 400 });
    }

    const updateRes = await query(
      "UPDATE users SET account_type = $1, onboarding_completed = TRUE WHERE id = $2 AND account_type IN ('SELLER', 'CUSTOMER') AND onboarding_completed = FALSE RETURNING account_type",
      [parsed.data.accountType, session.userId]
    );
    if (!updateRes.rowCount) {
      const latestRes = await query("SELECT account_type FROM users WHERE id = $1 LIMIT 1", [session.userId]);
      if (latestRes.rows[0]?.account_type !== parsed.data.accountType) {
        return NextResponse.json({ error: "Account type can only be selected during onboarding." }, { status: 409 });
      }
    }
    return NextResponse.json({ ok: true, accountType: parsed.data.accountType });
  } catch (err) {
    console.error("Failed to complete onboarding", err);
    return NextResponse.json({ error: "We couldn't finish onboarding right now. Please try again." }, { status: 500 });
  }
}
