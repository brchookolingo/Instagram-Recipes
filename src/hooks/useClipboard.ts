import { useState, useEffect, useCallback } from "react";
import * as Clipboard from "expo-clipboard";
import { detectPlatform } from "../services/post-fetcher";

function isSupportedUrl(text: string): boolean {
  return detectPlatform(text) !== "unknown";
}

export function useClipboard() {
  const [hasClipboardContent, setHasClipboardContent] = useState(false);

  // Only check presence on mount — does not trigger the iOS paste permission prompt.
  useEffect(() => {
    Clipboard.hasStringAsync()
      .then(setHasClipboardContent)
      .catch(() => setHasClipboardContent(false));
  }, []);

  // Called only when the user explicitly taps the paste button.
  const getClipboardUrl = useCallback(async (): Promise<string | null> => {
    try {
      const content = await Clipboard.getStringAsync();
      if (content && isSupportedUrl(content)) {
        return content.trim();
      }
    } catch {
      // ignore
    }
    return null;
  }, []);

  return { hasClipboardContent, getClipboardUrl };
}
