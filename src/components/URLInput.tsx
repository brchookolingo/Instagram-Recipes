import { useState } from "react";
import { View, TextInput, Text, Pressable } from "react-native";
import { useClipboard } from "../hooks/useClipboard";

interface URLInputProps {
  onSubmit: (url: string) => void;
}

export function URLInput({ onSubmit }: URLInputProps) {
  const [url, setUrl] = useState("");
  const { clipboardUrl } = useClipboard();

  const handlePasteFromClipboard = () => {
    if (clipboardUrl) {
      setUrl(clipboardUrl);
    }
  };

  const handleSubmit = () => {
    const trimmed = url.trim();
    if (trimmed) {
      onSubmit(trimmed);
    }
  };

  return (
    <View className="px-4 py-3">
      <TextInput
        className="border border-gray-300 rounded-xl px-4 py-3 text-base bg-white"
        placeholder="Paste Instagram recipe URL..."
        value={url}
        onChangeText={setUrl}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="url"
      />
      {clipboardUrl && !url && (
        <Pressable
          className="mt-2 bg-pink-50 rounded-lg px-4 py-2"
          onPress={handlePasteFromClipboard}
        >
          <Text className="text-pink-600 text-sm">
            Paste from clipboard: {clipboardUrl.substring(0, 40)}...
          </Text>
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
