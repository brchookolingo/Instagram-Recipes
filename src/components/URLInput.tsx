import { useState } from "react";
import { View, TextInput, Text, Pressable } from "react-native";
import { useClipboard } from "../hooks/useClipboard";
import { detectPlatform } from "../services/post-fetcher";

interface URLInputProps {
  onSubmit: (url: string) => void;
}

export function URLInput({ onSubmit }: URLInputProps) {
  const [url, setUrl] = useState("");
  const [validationError, setValidationError] = useState("");
  const { hasClipboardContent, getClipboardUrl } = useClipboard();

  const handlePasteFromClipboard = async () => {
    const clipboardUrl = await getClipboardUrl();
    if (clipboardUrl) {
      setUrl(clipboardUrl);
      setValidationError("");
    }
  };

  const handleSubmit = () => {
    const trimmed = url.trim();
    if (!trimmed) return;

    try {
      new URL(trimmed);
    } catch {
      setValidationError("Please enter a valid URL.");
      return;
    }

    const platform = detectPlatform(trimmed);
    if (platform === "unknown") {
      setValidationError("Only Instagram, TikTok, and Pinterest URLs are supported.");
      return;
    }

    setValidationError("");
    onSubmit(trimmed);
  };

  return (
    <View className="px-4 py-3">
      <TextInput
        className={`border rounded-xl px-4 py-3 text-base bg-white ${validationError ? "border-red-400" : "border-gray-300"}`}
        placeholder="Paste Instagram, TikTok or Pinterest URL..."
        value={url}
        onChangeText={(text) => {
          setUrl(text);
          if (validationError) setValidationError("");
        }}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="url"
      />
      {validationError ? (
        <Text className="text-red-500 text-sm mt-1 ml-1">{validationError}</Text>
      ) : null}
      {hasClipboardContent && !url && (
        <Pressable
          className="mt-2 bg-pink-50 rounded-lg px-4 py-2"
          onPress={handlePasteFromClipboard}
        >
          <Text className="text-pink-600 text-sm">Paste from clipboard</Text>
        </Pressable>
      )}
      <Pressable
        className="mt-3 bg-pink-500 rounded-xl py-3 items-center"
        onPress={handleSubmit}
      >
        <Text className="text-white font-semibold text-base">Fetch Recipe</Text>
      </Pressable>
    </View>
  );
}
