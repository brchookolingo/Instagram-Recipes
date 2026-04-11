import { RawPost } from "./post";

export type FetchErrorCode =
  | "UNSUPPORTED_PLATFORM"
  | "NETWORK_ERROR"
  | "TIMEOUT"
  | "RATE_LIMITED"
  | "NOT_FOUND"
  | "UNKNOWN";

export type FetchResult =
  | { ok: true; post: RawPost }
  | { ok: false; code: FetchErrorCode; message: string };

export const FETCH_ERROR_MESSAGES: Record<FetchErrorCode, string> = {
  UNSUPPORTED_PLATFORM:
    "This doesn't look like a supported URL. Please paste a link to a recipe website or social media post.",
  NETWORK_ERROR:
    "A network error occurred. Check your connection and try again.",
  TIMEOUT: "The request timed out. Check your connection and try again.",
  RATE_LIMITED: "Too many requests. Please wait a moment and try again.",
  NOT_FOUND: "Could not find that post. It may have been deleted or made private.",
  UNKNOWN: "Could not fetch the post. Check the URL and try again.",
};

// ---------------------------------------------------------------------------
// Recipe extraction result
// ---------------------------------------------------------------------------

export type ParseErrorCode =
  | "INVALID_API_KEY"
  | "RATE_LIMITED"
  | "NETWORK_ERROR"
  | "PARSE_FAILED"
  | "UNKNOWN";

export type ParseResult<T> =
  | { ok: true; data: T }
  | { ok: false; code: ParseErrorCode; message: string };

export const PARSE_ERROR_MESSAGES: Record<ParseErrorCode, string> = {
  INVALID_API_KEY:
    "Recipe extraction failed: invalid API key. Check your app settings.",
  RATE_LIMITED:
    "The AI service is busy. Please wait a moment and try again.",
  NETWORK_ERROR:
    "Could not reach the AI service. Check your connection and try again.",
  PARSE_FAILED:
    "Could not extract a recipe from this post. You can add the details manually.",
  UNKNOWN:
    "Recipe extraction failed. You can add the details manually.",
};
