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
    "This URL isn't from Instagram, TikTok, or Pinterest. Please paste a supported link.",
  NETWORK_ERROR:
    "A network error occurred. Check your connection and try again.",
  TIMEOUT: "The request timed out. Check your connection and try again.",
  RATE_LIMITED: "Too many requests. Please wait a moment and try again.",
  NOT_FOUND: "Could not find that post. It may have been deleted or made private.",
  UNKNOWN: "Could not fetch the post. Check the URL and try again.",
};
