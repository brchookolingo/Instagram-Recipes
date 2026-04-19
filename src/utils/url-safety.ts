/**
 * Validates that a URL is safe to fetch from the client:
 * - http or https scheme only
 * - hostname is not localhost, a literal private/loopback/link-local IP,
 *   or a known cloud-metadata host.
 *
 * Cannot prevent DNS rebinding in React Native (no native DNS access);
 * blocks literal-IP and obvious-hostname attacks.
 */
export function isSafePublicUrl(url: string): boolean {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return false;
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return false;

  const host = parsed.hostname.toLowerCase().replace(/^\[|\]$/g, "");

  if (host === "" || host === "localhost" || host.endsWith(".localhost")) return false;
  if (host.endsWith(".local")) return false;
  if (host === "metadata" || host === "metadata.google.internal") return false;

  if (isIPv4(host)) return isPublicIPv4(host);
  if (host.includes(":")) return isPublicIPv6(host);

  return true;
}

function isIPv4(host: string): boolean {
  return /^\d{1,3}(?:\.\d{1,3}){3}$/.test(host);
}

function isPublicIPv4(host: string): boolean {
  const parts = host.split(".").map(Number);
  if (parts.length !== 4 || parts.some((p) => Number.isNaN(p) || p < 0 || p > 255)) {
    return false;
  }
  const [a, b] = parts;
  if (a === 0) return false;
  if (a === 10) return false;
  if (a === 127) return false;
  if (a === 169 && b === 254) return false;
  if (a === 172 && b >= 16 && b <= 31) return false;
  if (a === 192 && b === 168) return false;
  if (a === 100 && b >= 64 && b <= 127) return false;
  if (a >= 224) return false;
  return true;
}

function isPublicIPv6(host: string): boolean {
  if (host === "::1" || host === "::") return false;
  if (host.startsWith("fc") || host.startsWith("fd")) return false;
  if (host.startsWith("fe80") || host.startsWith("fe9") || host.startsWith("fea") || host.startsWith("feb")) return false;
  if (host.startsWith("ff")) return false;
  if (host.includes("169.254.169.254")) return false;
  return true;
}
