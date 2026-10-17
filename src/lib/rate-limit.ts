import { createHash } from "node:crypto";
import { query } from "@/lib/db";

/** Atomic shared throttle for public endpoints, backed by PostgreSQL. */
export async function isRateLimited(key: string, limit: number, windowMs: number) {
  const bucketKey = createHash("sha256").update(key).digest("hex");
  const result = await query(
    `INSERT INTO rate_limit_buckets (bucket_key, request_count, reset_at)
     VALUES ($1, 1, NOW() + ($2 * INTERVAL '1 millisecond'))
     ON CONFLICT (bucket_key) DO UPDATE SET
       request_count = CASE WHEN rate_limit_buckets.reset_at <= NOW() THEN 1 ELSE rate_limit_buckets.request_count + 1 END,
       reset_at = CASE WHEN rate_limit_buckets.reset_at <= NOW() THEN NOW() + ($2 * INTERVAL '1 millisecond') ELSE rate_limit_buckets.reset_at END
     RETURNING request_count`,
    [bucketKey, windowMs]
  );

  // Opportunistically remove expired keys so the shared table stays bounded.
  if (Math.random() < 0.01) {
    await query("DELETE FROM rate_limit_buckets WHERE reset_at < NOW() - INTERVAL '1 day'");
  }
  return Number(result.rows[0]?.request_count ?? 0) > limit;
}

export function getClientIp(headers: Headers) {
  // Use proxy-injected x-real-ip when available. Otherwise use the final
  // forwarded address, which is the address appended by a trusted proxy.
  const realIp = headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;
  const forwarded = headers.get("x-forwarded-for")?.split(",").map((value) => value.trim()).filter(Boolean);
  return forwarded?.at(-1) || "unknown";
}
