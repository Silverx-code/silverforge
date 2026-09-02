import Decimal from "decimal.js";

export type PricedQuantity = { price: Decimal.Value; quantity: number };

/** Calculates an order total with arbitrary-precision decimals, never JS floats. */
export function calculateOrderTotal(items: PricedQuantity[]) {
  return items.reduce(
    (total, item) => total.plus(new Decimal(item.price).mul(item.quantity)),
    new Decimal(0)
  );
}

