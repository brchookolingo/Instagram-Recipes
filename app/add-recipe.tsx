import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  Pressable,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { Image } from "expo-image";
import { URLInput } from "../src/components/URLInput";
import {
  fetchInstagramPost,
  RawInstagramPost,
} from "../src/services/instagram";
import {
  parseRecipeWithAI,
  cleanupRecipeExtraction,
  isExtractionSufficient,
} from "../src/services/recipe-parser-ai";
import {
  parseRecipeFromCaption,
  hasRecipeContent,
} from "../src/services/recipe-parser";
import { useRecipeStore } from "../src/stores/recipe-store";
import { Recipe, Ingredient, Instruction } from "../src/types/recipe";
import { cacheImage } from "../src/utils/image-cache";

type Step = "input" | "loading" | "preview";

export default function AddRecipeScreen() {
  const router = useRouter();
  const addRecipe = useRecipeStore((s) => s.addRecipe);

  const [step, setStep] = useState<Step>("input");
  const [loadingMessage, setLoadingMessage] = useState("");
  const [error, setError] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [postData, setPostData] = useState<RawInstagramPost | null>(null);

  // Editable recipe fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [instructions, setInstructions] = useState<Instruction[]>([]);
  const [tags, setTags] = useState("");
  const [prepTime, setPrepTime] = useState("");
  const [cookTime, setCookTime] = useState("");
  const [servings, setServings] = useState("");
  const [extractionSource, setExtractionSource] =
    useState<Recipe["extractionSource"]>("manual");

  const apiKey = process.env.EXPO_PUBLIC_CLAUDE_API_KEY ?? "";

  const populateFromPartial = (partial: Partial<Recipe>) => {
    if (partial.title) setTitle(partial.title);
    if (partial.description) setDescription(partial.description);
    if (partial.ingredients) setIngredients(partial.ingredients);
    if (partial.instructions) setInstructions(partial.instructions);
    if (partial.tags) setTags(partial.tags.join(", "));
    if (partial.prepTime) setPrepTime(partial.prepTime);
    if (partial.cookTime) setCookTime(partial.cookTime);
    if (partial.servings) setServings(partial.servings);
    if (partial.extractionSource) setExtractionSource(partial.extractionSource);
  };

  const LOADING_THEMES = [
    [
      "Hunting down that post... 🔍",
      "Sniffing out the recipe... 🧑‍🍳",
      "Giving it a taste test... ✨",
    ],
    [
      "Hunting down that post... 🔍",
      "Cooking up the recipe... 🍳",
      "Putting on the finishing touches... ✨",
    ],
    [
      "Sliding into Instagram... 📱",
      "Teaching Claude to cook... 🤖",
      "Almost ready to plate... 🍽️",
    ],
  ];

  const handleFetch = async (url: string) => {
    setSourceUrl(url);
    setStep("loading");
    setError("");

    const theme = LOADING_THEMES[Math.floor(Math.random() * LOADING_THEMES.length)];

    try {
      setLoadingMessage(theme[0]);
      const post = await fetchInstagramPost(url);

      if (!post) {
        setError("Could not fetch post. Check the URL and try again.");
        setStep("input");
        return;
      }

      setPostData(post);

      // Tier 1 — AI caption parsing
      if (post.caption && apiKey) {
        setLoadingMessage(theme[1]);
        const aiResult = await parseRecipeWithAI(post.caption, apiKey);

        if (aiResult && isExtractionSufficient(aiResult)) {
          setLoadingMessage(theme[2]);
          const cleanedResult = await cleanupRecipeExtraction(aiResult, apiKey);
          populateFromPartial(cleanedResult);
          setStep("preview");
          return;
        }
      }

      // Fallback — regex parser
      if (post.caption && hasRecipeContent(post.caption)) {
        const regexResult = parseRecipeFromCaption(post.caption);
        populateFromPartial(regexResult);
      }

      // Even if extraction was weak, go to preview so user can edit
      if (post.authorName && !title) setTitle("");
      setStep("preview");
    } catch {
      setError("An unexpected error occurred. Please try again.");
      setStep("input");
    }
  };

  const handleManualEntry = () => {
    setExtractionSource("manual");
    setStep("preview");
  };

  const handleAddIngredient = () => {
    setIngredients([...ingredients, { text: "", checked: false }]);
  };

  const handleUpdateIngredient = (index: number, text: string) => {
    setIngredients(
      ingredients.map((ing, i) => (i === index ? { ...ing, text } : ing)),
    );
  };

  const handleRemoveIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const handleAddInstruction = () => {
    setInstructions([
      ...instructions,
      { stepNumber: instructions.length + 1, text: "" },
    ]);
  };

  const handleUpdateInstruction = (index: number, text: string) => {
    setInstructions(
      instructions.map((inst, i) => (i === index ? { ...inst, text } : inst)),
    );
  };

  const handleRemoveInstruction = (index: number) => {
    setInstructions(
      instructions
        .filter((_, i) => i !== index)
        .map((inst, i) => ({ ...inst, stepNumber: i + 1 })),
    );
  };

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert("Missing Title", "Please enter a recipe title.");
      return;
    }

    const now = new Date().toISOString();
    const recipeId = Date.now().toString();
    const rawImageUrl = postData?.imageUrl ?? postData?.thumbnailUrl;

    // Cache the image now while the CDN URL is fresh
    let localImageUri: string | undefined;
    if (rawImageUrl) {
      try {
        localImageUri = await cacheImage(rawImageUrl, recipeId);
      } catch {
        // Silently fall back to remote URL
      }
    }

    const recipe: Recipe = {
      id: recipeId,
      title: title.trim(),
      description: description.trim(),
      imageUrl: rawImageUrl ?? "",
      localImageUri,
      videoUrl: postData?.videoUrl,
      sourceUrl,
      author: postData?.authorName ?? "",
      ingredients: ingredients.filter((i) => i.text.trim()),
      instructions: instructions.filter((i) => i.text.trim()),
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      prepTime: prepTime || undefined,
      cookTime: cookTime || undefined,
      servings: servings || undefined,
      extractionSource,
      boardIds: [],
      createdAt: now,
      updatedAt: now,
    };

    addRecipe(recipe);
    router.back();
  };

  // Loading state
  if (step === "loading") {
    return (
      <View className="flex-1 items-center justify-center bg-white px-8">
        <ActivityIndicator size="large" color="#ec4899" />
        <Text className="text-gray-600 mt-4 text-center">{loadingMessage}</Text>
      </View>
    );
  }

  // Input state
  if (step === "input") {
    return (
      <View className="flex-1 bg-white">
        <View className="pt-6">
          <URLInput onSubmit={handleFetch} />
        </View>
        {error ? (
          <View className="mx-4 mt-2 bg-red-50 rounded-xl px-4 py-3">
            <Text className="text-red-600 text-sm">{error}</Text>
          </View>
        ) : null}
        <View className="items-center mt-8">
          <Text className="text-gray-400 mb-3">or</Text>
          <Pressable
            className="bg-gray-100 rounded-xl px-6 py-3"
            onPress={handleManualEntry}
          >
            <Text className="text-gray-600 font-semibold">Enter Manually</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  // Preview/edit state
  return (
    <ScrollView className="flex-1 bg-white" keyboardShouldPersistTaps="handled">
      {postData?.imageUrl && (
        <Image
          source={{ uri: postData.imageUrl }}
          className="w-full aspect-video"
          contentFit="cover"
        />
      )}

      <View className="px-4 py-4 gap-4">
        <View>
          <Text className="text-sm font-medium text-gray-500 mb-1">Title</Text>
          <TextInput
            className="border border-gray-200 rounded-xl px-4 py-3 text-base"
            value={title}
            onChangeText={setTitle}
            placeholder="Recipe title"
          />
        </View>

        <View>
          <Text className="text-sm font-medium text-gray-500 mb-1">
            Description
          </Text>
          <TextInput
            className="border border-gray-200 rounded-xl px-4 py-3 text-base"
            value={description}
            onChangeText={setDescription}
            placeholder="Brief description"
            multiline
          />
        </View>

        <View className="flex-row gap-3">
          <View className="flex-1">
            <Text className="text-sm font-medium text-gray-500 mb-1">
              Prep Time
            </Text>
            <TextInput
              className="border border-gray-200 rounded-xl px-4 py-3 text-base"
              value={prepTime}
              onChangeText={setPrepTime}
              placeholder="e.g. 15 min"
            />
          </View>
          <View className="flex-1">
            <Text className="text-sm font-medium text-gray-500 mb-1">
              Cook Time
            </Text>
            <TextInput
              className="border border-gray-200 rounded-xl px-4 py-3 text-base"
              value={cookTime}
              onChangeText={setCookTime}
              placeholder="e.g. 30 min"
            />
          </View>
          <View className="flex-1">
            <Text className="text-sm font-medium text-gray-500 mb-1">
              Servings
            </Text>
            <TextInput
              className="border border-gray-200 rounded-xl px-4 py-3 text-base"
              value={servings}
              onChangeText={setServings}
              placeholder="e.g. 4"
            />
          </View>
        </View>

        {/* Ingredients */}
        <View>
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-lg font-bold">Ingredients</Text>
            <Pressable onPress={handleAddIngredient}>
              <Text className="text-pink-500 font-semibold">+ Add</Text>
            </Pressable>
          </View>
          {ingredients.map((ing, i) => (
            <View key={i} className="flex-row items-center gap-2 mb-2">
              <TextInput
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-base"
                value={ing.text}
                onChangeText={(text) => handleUpdateIngredient(i, text)}
                placeholder={`Ingredient ${i + 1}`}
              />
              <Pressable onPress={() => handleRemoveIngredient(i)}>
                <Text className="text-red-400 text-lg px-2">✕</Text>
              </Pressable>
            </View>
          ))}
        </View>

        {/* Instructions */}
        <View>
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-lg font-bold">Instructions</Text>
            <Pressable onPress={handleAddInstruction}>
              <Text className="text-pink-500 font-semibold">+ Add</Text>
            </Pressable>
          </View>
          {instructions.map((inst, i) => (
            <View key={i} className="flex-row items-start gap-2 mb-2">
              <View className="w-7 h-7 rounded-full bg-pink-100 items-center justify-center mt-2">
                <Text className="text-pink-600 text-xs font-bold">
                  {inst.stepNumber}
                </Text>
              </View>
              <TextInput
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-base"
                value={inst.text}
                onChangeText={(text) => handleUpdateInstruction(i, text)}
                placeholder={`Step ${i + 1}`}
                multiline
              />
              <Pressable onPress={() => handleRemoveInstruction(i)}>
                <Text className="text-red-400 text-lg px-2 mt-2">✕</Text>
              </Pressable>
            </View>
          ))}
        </View>

        <View>
          <Text className="text-sm font-medium text-gray-500 mb-1">
            Tags (comma-separated)
          </Text>
          <TextInput
            className="border border-gray-200 rounded-xl px-4 py-3 text-base"
            value={tags}
            onChangeText={setTags}
            placeholder="e.g. pasta, italian, quick"
          />
        </View>

        <Pressable
          className="bg-pink-500 rounded-xl py-4 items-center mt-2 mb-8"
          onPress={handleSave}
        >
          <Text className="text-white font-bold text-base">Save Recipe</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
