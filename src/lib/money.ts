import { Prisma } from "@prisma/client";

export type PricedQuantity = { price: Prisma.Decimal.Value; quantity: number };

/** Calculates an order total with arbitrary-precision decimals, never JS floats. */
export function calculateOrderTotal(items: PricedQuantity[]) {
  return items.reduce(
    (total, item) => total.plus(new Prisma.Decimal(item.price).mul(item.quantity)),
    new Prisma.Decimal(0)
  );
}
