import { useState, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, Pressable, Alert } from 'react-native';
import { storage } from '../../src/utils/storage';
import { useRecipeStore } from '../../src/stores/recipe-store';
import { useBoardStore } from '../../src/stores/board-store';

const API_KEY_KEYS = {
  claude: 'settings:claude-api-key',
  rapidapi: 'settings:rapidapi-key',
} as const;

export default function SettingsScreen() {
  const [claudeKey, setClaudeKey] = useState('');
  const [rapidApiKey, setRapidApiKey] = useState('');
  const [showClaudeKey, setShowClaudeKey] = useState(false);
  const [showRapidApiKey, setShowRapidApiKey] = useState(false);

  useEffect(() => {
    setClaudeKey(storage.getString(API_KEY_KEYS.claude) ?? '');
    setRapidApiKey(storage.getString(API_KEY_KEYS.rapidapi) ?? '');
  }, []);

  const saveClaudeKey = (value: string) => {
    setClaudeKey(value);
    if (value) {
      storage.set(API_KEY_KEYS.claude, value);
    } else {
      storage.delete(API_KEY_KEYS.claude);
    }
  };

  const saveRapidApiKey = (value: string) => {
    setRapidApiKey(value);
    if (value) {
      storage.set(API_KEY_KEYS.rapidapi, value);
    } else {
      storage.delete(API_KEY_KEYS.rapidapi);
    }
  };

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'This will delete all saved recipes and boards. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All Data',
          style: 'destructive',
          onPress: () => {
            useRecipeStore.setState({ recipes: [] });
            useBoardStore.setState({ boards: [] });
            Alert.alert('Done', 'All data has been cleared.');
          },
        },
      ]
    );
  };

  const maskKey = (key: string) =>
    key.length > 8 ? key.substring(0, 4) + '••••' + key.substring(key.length - 4) : '••••••••';

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="mt-6 px-4">
        <Text className="text-xs font-semibold text-gray-400 uppercase mb-2 ml-1">
          API Keys
        </Text>
        <View className="bg-white rounded-2xl px-4 py-4 gap-4">
          <View>
            <Text className="text-sm font-medium text-gray-700 mb-1">Claude API Key</Text>
            <View className="flex-row items-center gap-2">
              <TextInput
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50"
                placeholder="sk-ant-..."
                value={showClaudeKey ? claudeKey : maskKey(claudeKey)}
                onChangeText={saveClaudeKey}
                autoCapitalize="none"
                autoCorrect={false}
                secureTextEntry={!showClaudeKey}
              />
              <Pressable onPress={() => setShowClaudeKey(!showClaudeKey)}>
                <Text className="text-pink-500 text-sm">{showClaudeKey ? 'Hide' : 'Show'}</Text>
              </Pressable>
            </View>
          </View>

          <View>
            <Text className="text-sm font-medium text-gray-700 mb-1">RapidAPI Key (optional)</Text>
            <View className="flex-row items-center gap-2">
              <TextInput
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50"
                placeholder="Enter RapidAPI key..."
                value={showRapidApiKey ? rapidApiKey : maskKey(rapidApiKey)}
                onChangeText={saveRapidApiKey}
                autoCapitalize="none"
                autoCorrect={false}
                secureTextEntry={!showRapidApiKey}
              />
              <Pressable onPress={() => setShowRapidApiKey(!showRapidApiKey)}>
                <Text className="text-pink-500 text-sm">{showRapidApiKey ? 'Hide' : 'Show'}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </View>

      <View className="mt-6 px-4">
        <Text className="text-xs font-semibold text-gray-400 uppercase mb-2 ml-1">
          App Info
        </Text>
        <View className="bg-white rounded-2xl px-4 py-4 gap-2">
          <View className="flex-row justify-between">
            <Text className="text-gray-600">App Name</Text>
            <Text className="text-gray-800 font-medium">InstagramRecipes</Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-gray-600">Version</Text>
            <Text className="text-gray-800 font-medium">1.0.0</Text>
          </View>
        </View>
      </View>

      <View className="mt-6 px-4 mb-10">
        <Text className="text-xs font-semibold text-gray-400 uppercase mb-2 ml-1">
          Data
        </Text>
        <View className="bg-white rounded-2xl px-4 py-4 gap-3">
          <Pressable
            className="bg-red-50 rounded-xl py-3 items-center"
            onPress={handleClearData}
          >
            <Text className="text-red-600 font-semibold">Clear All Data</Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}
