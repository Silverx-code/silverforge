import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { query } from "@/lib/db";
import { createSessionToken, setSessionCookie } from "@/lib/auth";
import { verifyPassword } from "@/lib/password";
import { getClientIp, isRateLimited } from "@/lib/rate-limit";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    if (isRateLimited(`login:${getClientIp(req.headers)}`, 10, 15 * 60_000)) {
      return NextResponse.json({ error: "Too many sign-in attempts. Please try again later." }, { status: 429 });
    }
    const body = await req.json().catch(() => null);
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Enter a valid email and password." }, { status: 400 });
    }

    const { password } = parsed.data;
    const email = parsed.data.email.trim().toLowerCase();

    const res = await query(`SELECT * FROM users WHERE email = $1 LIMIT 1`, [email]);
    const user = res.rows[0];
    if (!user) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    const valid = await verifyPassword(password, user.password_hash);
    if (!valid) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    // A store is definitive proof that this seller has finished setup. This
    // also repairs accounts created before onboarding state was introduced.
    const isSuperAdmin = email === process.env.SUPER_ADMIN_EMAIL?.trim().toLowerCase();
    if (isSuperAdmin && user.account_type !== "SUPER_ADMIN") await query("UPDATE users SET account_type = 'SUPER_ADMIN', onboarding_completed = TRUE WHERE id = $1", [user.id]);
    const storeRes = await query(`SELECT id FROM stores WHERE owner_id = $1 LIMIT 1`, [user.id]);
    const ownsStore = storeRes.rows.length > 0;
    const onboardingCompleted = isSuperAdmin || ownsStore || Boolean(user.onboarding_completed);
    const accountType = isSuperAdmin ? "SUPER_ADMIN" : ownsStore ? "SELLER" : user.account_type;
    if (ownsStore && (!user.onboarding_completed || user.account_type !== "SELLER")) {
      await query(
        "UPDATE users SET account_type = 'SELLER', onboarding_completed = TRUE WHERE id = $1",
        [user.id]
      );
    }

    const token = await createSessionToken({ userId: user.id, email: user.email });
    await setSessionCookie(token);

    return NextResponse.json({ id: user.id, email: user.email, name: user.name, accountType, onboardingCompleted });
  } catch (err: any) {
    console.error("Login error details:", err);
    return NextResponse.json(
      { error: "Unable to sign in right now. Please try again later." },
      { status: 500 }
    );
  }
}
