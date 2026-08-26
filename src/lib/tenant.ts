import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

/**
 * Resolves the store owned by the currently authenticated user.
 * MVP assumption: one user owns exactly one store (enforced at onboarding).
 * Returns null if there's no session or the user has no store yet.
 */
export async function getOwnedStore() {
  const session = await getSession();
  if (!session) return null;

  const store = await prisma.store.findFirst({
    where: { ownerId: session.userId },
  });

  return store;
}

/** Same as getOwnedStore, but also returns the session for convenience. */
export async function requireOwnedStore() {
  const session = await getSession();
  if (!session) return { session: null, store: null };

  const store = await prisma.store.findFirst({
    where: { ownerId: session.userId },
  });

  return { session, store };
}
