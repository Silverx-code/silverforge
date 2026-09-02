import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createId } from "@/lib/id";
import { hashPassword } from "@/lib/password";
import { query } from "@/lib/db";
import { getCurrentRole } from "@/lib/roles";
const schema = z.object({ name: z.string().min(1).max(120), email: z.string().email(), password: z.string().min(12).max(200), role: z.enum(["ADMIN", "CUSTOMER", "SELLER"]) });
export async function POST(req: NextRequest) { if (await getCurrentRole() !== "SUPER_ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 }); const data = schema.safeParse(await req.json().catch(() => null)); if (!data.success) return NextResponse.json({ error: "Enter a name, valid email, and password of at least 12 characters." }, { status: 400 }); const email = data.data.email.toLowerCase(); const exists = await query("SELECT id FROM users WHERE email = $1 LIMIT 1", [email]); if (exists.rows[0]) return NextResponse.json({ error: "An account with that email already exists." }, { status: 409 }); const id = createId("usr"); await query("INSERT INTO users (id, email, password_hash, name, account_type, onboarding_completed) VALUES ($1,$2,$3,$4,$5,TRUE)", [id, email, await hashPassword(data.data.password), data.data.name, data.data.role]); return NextResponse.json({ id, email, role: data.data.role }, { status: 201 }); }
