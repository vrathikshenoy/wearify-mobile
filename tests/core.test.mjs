import test from "node:test";
import assert from "node:assert/strict";
import { formatPhone, fullPhone, isValidPhone } from "../src/lib/phone.ts";
import { makeReferralCode } from "../src/lib/referral.ts";

test("portable customer helpers keep the web contract", () => {
  assert.equal(formatPhone("+91 98765-43210"), "9876543210");
  assert.equal(fullPhone("98765 43210"), "+919876543210");
  assert.equal(isValidPhone("5876543210"), false);
  assert.equal(makeReferralCode("customer_123"), "GGXJRDCY");
  assert.equal(makeReferralCode("customer_123"), makeReferralCode("customer_123"));
});
