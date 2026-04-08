/**
 * Generates a RFC 4122-compliant v4 UUID that works on Hermes (React Native).
 * `crypto.randomUUID()` is not available in the Hermes JS engine, so we use
 * `Math.random()` with enough entropy for our use case (non-cryptographic IDs).
 */
export function generateId(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
