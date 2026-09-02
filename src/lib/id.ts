import { randomBytes } from "node:crypto";

/** URL-safe, cryptographically random IDs that fit the existing VARCHAR(30) keys. */
export function createId(prefix: string) {
  return `${prefix}_${randomBytes(12).toString("base64url")}`;
}
