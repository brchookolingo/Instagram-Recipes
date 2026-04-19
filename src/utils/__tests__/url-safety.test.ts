import { isSafePublicUrl } from "../url-safety";

describe("isSafePublicUrl — accepts", () => {
  test.each([
    "https://www.instagram.com/p/abc/",
    "https://tiktok.com/@user/video/123",
    "https://pinterest.com/pin/123/",
    "https://example.com",
    "http://8.8.8.8",
    "https://[2606:4700:4700::1111]",
  ])("accepts %s", (url) => {
    expect(isSafePublicUrl(url)).toBe(true);
  });
});

describe("isSafePublicUrl — rejects invalid / non-http schemes", () => {
  test.each([
    "not-a-url",
    "",
    "javascript:alert(1)",
    "file:///etc/passwd",
    "ftp://example.com",
    "data:text/html,<script>",
  ])("rejects %s", (url) => {
    expect(isSafePublicUrl(url)).toBe(false);
  });
});

describe("isSafePublicUrl — rejects loopback & private hostnames", () => {
  test.each([
    "http://localhost",
    "http://127.0.0.1",
    "http://127.1.2.3",
    "http://[::1]",
    "http://something.localhost",
    "http://device.local",
    "http://metadata",
    "http://metadata.google.internal",
  ])("rejects %s", (url) => {
    expect(isSafePublicUrl(url)).toBe(false);
  });
});

describe("isSafePublicUrl — rejects private IPv4 ranges", () => {
  test.each([
    "http://10.0.0.1",
    "http://10.255.255.255",
    "http://192.168.1.1",
    "http://172.16.0.1",
    "http://172.31.0.1",
    "http://169.254.169.254", // AWS metadata
    "http://100.64.0.1", // CGNAT
    "http://0.0.0.0",
    "http://224.0.0.1", // multicast
  ])("rejects %s", (url) => {
    expect(isSafePublicUrl(url)).toBe(false);
  });
});

describe("isSafePublicUrl — rejects private IPv6 ranges", () => {
  test.each([
    "http://[::]",
    "http://[::1]",
    "http://[fc00::1]",
    "http://[fd00::1]",
    "http://[fe80::1]",
    "http://[ff00::1]",
  ])("rejects %s", (url) => {
    expect(isSafePublicUrl(url)).toBe(false);
  });
});
