import assert from "node:assert/strict";
import test from "node:test";
import { calculateOrderTotal } from "../src/lib/money";

test("calculates order totals without floating-point rounding errors", () => {
  assert.equal(calculateOrderTotal([{ price: "19.99", quantity: 3 }, { price: "0.10", quantity: 1 }]).toFixed(2), "60.07");
});
