import test from "node:test";
import assert from "node:assert/strict";
import { canTransitionOrderStatus } from "../src/lib/order-status";

test("allows forward order progress and cancellation", () => {
  assert.equal(canTransitionOrderStatus("PENDING", "CONFIRMED"), true);
  assert.equal(canTransitionOrderStatus("PENDING", "CANCELLED"), true);
  assert.equal(canTransitionOrderStatus("CONFIRMED", "FULFILLED"), true);
  assert.equal(canTransitionOrderStatus("CONFIRMED", "CANCELLED"), true);
});

test("keeps terminal orders terminal and allows idempotent status saves", () => {
  assert.equal(canTransitionOrderStatus("CANCELLED", "CANCELLED"), true);
  assert.equal(canTransitionOrderStatus("FULFILLED", "FULFILLED"), true);
  assert.equal(canTransitionOrderStatus("CANCELLED", "CONFIRMED"), false);
  assert.equal(canTransitionOrderStatus("FULFILLED", "CANCELLED"), false);
  assert.equal(canTransitionOrderStatus("PENDING", "FULFILLED"), false);
});
