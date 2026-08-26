import bcrypt from "bcryptjs";

/** Node.js-only password helpers. Kept separate so middleware can run on Edge. */
export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}
