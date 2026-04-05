import { useState, useEffect, useCallback } from "react";
import * as Clipboard from "expo-clipboard";

const INSTAGRAM_URL_PATTERN = /instagram\.com\/(p|reel)\//i;

export function isInstagramUrl(text: string): boolean {
  return INSTAGRAM_URL_PATTERN.test(text);
}

export function useClipboard() {
  const [clipboardUrl, setClipboardUrl] = useState<string | null>(null);

  const checkClipboard = useCallback(async () => {
    try {
      const hasString = await Clipboard.hasStringAsync();
      if (!hasString) return;

      const content = await Clipboard.getStringAsync();
      if (content && isInstagramUrl(content)) {
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
