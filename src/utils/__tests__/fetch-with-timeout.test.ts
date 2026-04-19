import { fetchWithTimeout, isTimeoutError } from "../fetch-with-timeout";

describe("fetchWithTimeout", () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.useRealTimers();
  });

  test("resolves when fetch completes before timeout", async () => {
    global.fetch = jest.fn(async () => new Response("ok")) as unknown as typeof fetch;
    const res = await fetchWithTimeout("https://example.com", {}, 1000);
    expect(await res.text()).toBe("ok");
  });

  test("aborts the request when timeout fires", async () => {
    global.fetch = jest.fn((_url: RequestInfo | URL, init?: RequestInit) => {
      return new Promise((_resolve, reject) => {
        const signal = init?.signal;
        if (signal) {
          signal.addEventListener("abort", () => {
            const err = new Error("The operation was aborted");
            err.name = "AbortError";
            reject(err);
          });
        }
      });
    }) as unknown as typeof fetch;

    await expect(
      fetchWithTimeout("https://example.com", {}, 10),
    ).rejects.toMatchObject({ name: "AbortError" });
  });

  test("forwards the signal option to fetch", async () => {
    const fetchMock = jest.fn(async () => new Response("ok")) as unknown as jest.Mock;
    global.fetch = fetchMock as unknown as typeof fetch;
    await fetchWithTimeout("https://example.com", { method: "POST" }, 1000);
    const init = fetchMock.mock.calls[0][1] as RequestInit;
    expect(init.method).toBe("POST");
    expect(init.signal).toBeInstanceOf(AbortSignal);
  });
});

describe("isTimeoutError", () => {
  test("returns true for AbortError", () => {
    const err = new Error("aborted");
    err.name = "AbortError";
    expect(isTimeoutError(err)).toBe(true);
  });

  test("returns true for errors whose message contains 'aborted'", () => {
    expect(isTimeoutError(new Error("request aborted"))).toBe(true);
  });

  test("returns false for unrelated errors", () => {
    expect(isTimeoutError(new Error("network down"))).toBe(false);
  });

  test("returns false for non-errors", () => {
    expect(isTimeoutError("oops")).toBe(false);
    expect(isTimeoutError(null)).toBe(false);
    expect(isTimeoutError(undefined)).toBe(false);
  });
});
