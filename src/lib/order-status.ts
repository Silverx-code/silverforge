export type OrderStatus = "PENDING" | "CONFIRMED" | "FULFILLED" | "CANCELLED";

export function canTransitionOrderStatus(current: OrderStatus, next: OrderStatus) {
  if (current === next) return true;
  if (current === "PENDING") return next === "CONFIRMED" || next === "CANCELLED";
  if (current === "CONFIRMED") return next === "FULFILLED" || next === "CANCELLED";
  return false;
}
