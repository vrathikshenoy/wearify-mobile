const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function makeReferralCode(id: string): string {
  let h1 = 0x811c9dc5 >>> 0;
  let h2 = 0x1000193 >>> 0;
  for (let index = 0; index < id.length; index += 1) {
    const char = id.charCodeAt(index);
    h1 = Math.imul(h1 ^ char, 0x01000193) >>> 0;
    h2 = Math.imul(h2 ^ ((char << 5) | (char >>> 3)), 0x85ebca77) >>> 0;
  }
  let code = "";
  for (let index = 0; index < 8; index += 1) {
    code += ALPHABET[h1 % ALPHABET.length];
    h1 = (Math.floor(h1 / ALPHABET.length) ^ Math.imul(h2, 0x27d4eb2f)) >>> 0;
    h2 = (Math.imul(h2, 0x165667b1) + 0x6c078965) >>> 0;
  }
  return code;
}
