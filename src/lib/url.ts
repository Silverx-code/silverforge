export function isHttpUrl(value: string): boolean {
  try {
    const protocol = new URL(value).protocol;
    return protocol === "http:" || protocol === "https:";
  } catch {
    return false;
  }
}

/** Store content may be edited by a seller, so only allow safe navigation targets. */
export function safeStoreLink(value: unknown, fallback: string): string {
  if (typeof value !== "string" || !value.trim()) return fallback;
  const target = value.trim();
  if (target.startsWith("#")) return target;
  if (target.startsWith("/") && !target.startsWith("//") && !target.includes("\\")) return target;
  return isHttpUrl(target) ? target : fallback;
}

export function safeStoreImage(value: unknown, fallback: string): string {
  if (typeof value !== "string") return fallback;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:" ? url.href : fallback;
  } catch {
    return fallback;
  }
}
