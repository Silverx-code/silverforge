import { query } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { toStore } from "@/lib/store-data";
import type { Store } from "@/types/db";

/**
 * Resolves the store owned by the currently authenticated user.
 * MVP assumption: one user owns exactly one store (enforced at onboarding).
 * Returns null if there's no session or the user has no store yet.
 */
export async function getOwnedStore(): Promise<Store | null> {
  const session = await getSession();
  if (!session) return null;

  const res = await query(`SELECT * FROM stores WHERE owner_id = $1 LIMIT 1`, [session.userId]);
  return res.rows[0] ? toStore(res.rows[0]) : null;
}

/** Same as getOwnedStore, but also returns the session for convenience. */
export async function requireOwnedStore() {
  const session = await getSession();
  if (!session) return { session: null, store: null };

  const res = await query(`SELECT * FROM stores WHERE owner_id = $1 LIMIT 1`, [session.userId]);
  const store = res.rows[0] ? toStore(res.rows[0]) : null;

  return { session, store };
}
