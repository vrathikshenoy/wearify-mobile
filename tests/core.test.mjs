import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { formatPhone, fullPhone, isValidPhone } from "../src/lib/phone.ts";
import { makeReferralCode } from "../src/lib/referral.ts";

test("portable customer helpers keep the web contract", () => {
  assert.equal(formatPhone("+91 98765-43210"), "9876543210");
  assert.equal(fullPhone("98765 43210"), "+919876543210");
  assert.equal(isValidPhone("5876543210"), false);
  assert.equal(makeReferralCode("customer_123"), "GGXJRDCY");
  assert.equal(makeReferralCode("customer_123"), makeReferralCode("customer_123"));
});

test("web-only rendering keeps native guards and keypad keys safe", () => {
  const keypad = readFileSync(new URL("../src/components/numeric-keypad.tsx", import.meta.url), "utf8");
  const guard = readFileSync(new URL("../src/lib/screen-protection.ts", import.meta.url), "utf8");
  assert.match(keypad, /key=\{`spacer-\$\{columnIndex\}`\} pointerEvents="none" className="flex-1 bg-transparent"/);
  assert.doesNotMatch(keypad, /<Pressable[^>]+key=\{`spacer/);
  assert.match(guard, /Platform\.OS === "web"/);
  for (const route of ["login.tsx", "register.tsx", "(tabs)/me/privacy.tsx"]) {
    const source = readFileSync(new URL(`../app/c/${route}`, import.meta.url), "utf8");
    assert.match(source, /useScreenProtection/);
    assert.doesNotMatch(source, /from "expo-screen-capture"/);
  }
});

test("customer tabs expose only the five primary destinations", () => {
  const root = readFileSync(new URL("../app/_layout.tsx", import.meta.url), "utf8");
  const tabs = readFileSync(new URL("../app/c/(tabs)/_layout.tsx", import.meta.url), "utf8");
  assert.match(root, /LogBox\.ignoreLogs\(\["Warning: ScrollView doesn't take rejection well - scrolls anyway"\]\)/);
  assert.equal([...tabs.matchAll(/<Tabs\.Screen name="([^"]+)"/g)].map((match) => match[1]).join(","), "index,looks,new,wardrobe,wishlist,product,me");
  for (const route of ["looks", "new", "product", "me"]) {
    const layout = readFileSync(new URL(`../app/c/(tabs)/${route}/_layout.tsx`, import.meta.url), "utf8");
    assert.match(layout, /<Stack screenOptions=\{\{ headerShown: false \}\} \/>/);
  }
});

test("the WhatsApp widget preserves the PWA composite on web", () => {
  const home = readFileSync(new URL("../app/c/(tabs)/index.tsx", import.meta.url), "utf8");
  assert.match(home, /filter: "drop-shadow\(0px 4px 15px rgba\(0,0,0,0\.16\)\)"/);
  assert.match(home, /className="absolute bottom-3 right-3 z-20 h-\[60px\] w-\[132px\]"/);
  assert.match(home, /className="absolute right-0 top-0 size-\[60px\][^"]*bg-\[#43D969\]"/);
});
