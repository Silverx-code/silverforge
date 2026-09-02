import { getSession } from "@/lib/auth";
import { query } from "@/lib/db";
import type { AccountType } from "@/types/db";

export async function getCurrentRole(): Promise<AccountType | null> {
  const session = await getSession();
  if (!session) return null;
  const result = await query("SELECT account_type FROM users WHERE id = $1 LIMIT 1", [session.userId]);
  return (result.rows[0]?.account_type as AccountType | undefined) ?? null;
}

export function isPlatformAdmin(role: AccountType | null) { return role === "ADMIN" || role === "SUPER_ADMIN"; }
