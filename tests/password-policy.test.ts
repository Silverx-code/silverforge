import test from "node:test";
import assert from "node:assert/strict";
import { getPasswordValidationError, isValidPassword } from "../src/lib/password-policy";

test("accepts a strong password", () => {
  assert.equal(isValidPassword("Forge!2026Pass"), true);
});

test("rejects weak passwords", () => {
  for (const password of ["short!A1", "alllowercase!1", "ALLUPPERCASE!1", "NoNumberHere!", "NoSymbol12345", "Has space!123A"]) {
    assert.notEqual(getPasswordValidationError(password), null);
  }
});
