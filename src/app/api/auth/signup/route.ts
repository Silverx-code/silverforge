import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { query } from "@/lib/db";
import { createSessionToken, setSessionCookie } from "@/lib/auth";
import { hashPassword } from "@/lib/password";
import { getPasswordValidationError } from "@/lib/password-policy";
import { getClientIp, isRateLimited } from "@/lib/rate-limit";
import { createId } from "@/lib/id";

const signupSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  email: z.string().email(),
  password: z.string(),
});

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    if (isRateLimited(`signup:${getClientIp(req.headers)}`, 5, 60 * 60_000)) {
      return NextResponse.json({ error: "Too many account creation attempts. Please try again later." }, { status: 429 });
    }
    const body = await req.json().catch(() => null);
    const parsed = signupSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Please provide a valid name, email, and password." },
        { status: 400 }
      );
    }

    const { name, password } = parsed.data;
    const passwordError = getPasswordValidationError(password);
    if (passwordError) return NextResponse.json({ error: passwordError }, { status: 400 });
    const email = parsed.data.email.trim().toLowerCase();

    const existingRes = await query(`SELECT id FROM users WHERE email = $1 LIMIT 1`, [email]);
    if (existingRes.rows.length > 0) {
      return NextResponse.json(
        { error: "An account with that email already exists." },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);
    const userId = createId("usr");
    const isSuperAdmin = email === process.env.SUPER_ADMIN_EMAIL?.trim().toLowerCase();
    
    await query(
      `INSERT INTO users (id, email, password_hash, name, account_type, onboarding_completed) VALUES ($1, $2, $3, $4, $5, $6)`,
      [userId, email, passwordHash, name || null, isSuperAdmin ? "SUPER_ADMIN" : "SELLER", isSuperAdmin]
    );

    const token = await createSessionToken({ userId, email });
    await setSessionCookie(token);

    return NextResponse.json({ id: userId, email, name: name || null, accountType: isSuperAdmin ? "SUPER_ADMIN" : "SELLER", onboardingCompleted: isSuperAdmin });
  } catch (err: any) {
    console.error("Signup error details:", err);
    return NextResponse.json(
      { error: "Unable to create your account right now. Please try again later." },
      { status: 500 }
    );
  }
}
