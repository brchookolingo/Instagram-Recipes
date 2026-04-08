import { isTimeoutError } from "./fetch-with-timeout";

/** Errors that should never be retried — they won't succeed on a second attempt. */
function isNonRetryable(error: unknown): boolean {
  if (error instanceof Response && error.status >= 400 && error.status < 500) {
    return true;
  }
  // AbortError (timeout) is retryable — a later attempt might succeed on a better network
  if (isTimeoutError(error)) return false;
  return false;
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  delayMs: number = 1000,
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      // Don't retry client errors (4xx) — they will never succeed
      if (isNonRetryable(error)) throw error;
      if (attempt < maxAttempts) {
        // Exponential backoff: 1s, 2s, 4s
        const backoff = delayMs * Math.pow(2, attempt - 1);
        await new Promise((resolve) => setTimeout(resolve, backoff));
      }
    }
  }

  throw lastError;
}
