import { useState, useEffect, useCallback } from "react";
import * as Clipboard from "expo-clipboard";
import { detectPlatform } from "../services/post-fetcher";

function isSupportedUrl(text: string): boolean {
  return detectPlatform(text) !== "unknown";
}

export function useClipboard() {
  const [clipboardUrl, setClipboardUrl] = useState<string | null>(null);

  const checkClipboard = useCallback(async () => {
    try {
      const hasString = await Clipboard.hasStringAsync();
      if (!hasString) return;

      const content = await Clipboard.getStringAsync();
      if (content && isSupportedUrl(content)) {
        setClipboardUrl(content.trim());
      } else {
        setClipboardUrl(null);
      }
    } catch {
      setClipboardUrl(null);
    }
  }, []);

  useEffect(() => {
    checkClipboard();
  }, [checkClipboard]);

  return { clipboardUrl, checkClipboard };
}
