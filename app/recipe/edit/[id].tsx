import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  Pressable,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useRecipeStore } from "../../../src/stores/recipe-store";
import { Ingredient, Instruction } from "../../../src/types/recipe";

export default function EditRecipeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const recipe = useRecipeStore((s) => s.getRecipeById(id ?? ""));
  const updateRecipe = useRecipeStore((s) => s.updateRecipe);

  const [title, setTitle] = useState(recipe?.title ?? "");
  const [description, setDescription] = useState(recipe?.description ?? "");
  const [prepTime, setPrepTime] = useState(recipe?.prepTime !== undefined ? String(recipe.prepTime) : "");
  const [cookTime, setCookTime] = useState(recipe?.cookTime !== undefined ? String(recipe.cookTime) : "");
  const [servings, setServings] = useState(recipe?.servings !== undefined ? String(recipe.servings) : "");
  const [ingredients, setIngredients] = useState<Ingredient[]>(
    recipe?.ingredients ?? [],
  );
  const [instructions, setInstructions] = useState<Instruction[]>(
    recipe?.instructions ?? [],
  );
  const [tags, setTags] = useState(recipe?.tags?.join(", ") ?? "");
  const [notes, setNotes] = useState(recipe?.notes ?? "");

  if (!recipe) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text className="text-gray-500">Recipe not found</Text>
      </View>
    );
  }

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

  const handleSave = () => {
    if (!title.trim()) {
      Alert.alert("Missing Title", "Please enter a recipe title.");
      return;
    }

    updateRecipe(recipe.id, {
      title: title.trim(),
      description: description.trim(),
      prepTime: parseInt(prepTime, 10) || undefined,
      cookTime: parseInt(cookTime, 10) || undefined,
      servings: parseInt(servings, 10) || undefined,
      ingredients: ingredients.filter((i) => i.text.trim()),
      instructions: instructions.filter((i) => i.text.trim()),
      notes: notes.trim() || undefined,
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    });

    router.back();
  };

  return (
    <ScrollView
      className="flex-1 bg-white"
      keyboardShouldPersistTaps="handled"
    >
      <View className="px-4 py-4 gap-4">
        {/* Title */}
        <View>
          <Text className="text-sm font-medium text-gray-500 mb-1">Title</Text>
          <TextInput
            className="border border-gray-200 rounded-xl px-4 py-3 text-base"
            value={title}
            onChangeText={setTitle}
            placeholder="Recipe title"
          />
        </View>

        {/* Description */}
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

        {/* Prep / Cook / Servings */}
        <View className="flex-row gap-3">
          <View className="flex-1">
            <Text className="text-sm font-medium text-gray-500 mb-1">
              Prep Time
            </Text>
            <TextInput
              className="border border-gray-200 rounded-xl px-4 py-3 text-base"
              value={prepTime}
              onChangeText={setPrepTime}
              placeholder="e.g. 15"
              keyboardType="numeric"
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
              placeholder="e.g. 30"
              keyboardType="numeric"
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
              keyboardType="numeric"
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

        {/* Notes */}
        <View>
          <View className="flex-row items-center justify-between mb-1">
            <Text className="text-sm font-medium text-gray-500">Notes</Text>
            <Text className="text-xs text-gray-400">{notes.length}/500</Text>
          </View>
          <TextInput
            className="border border-gray-200 rounded-xl px-4 py-3 text-base"
            value={notes}
            onChangeText={(text) => { if (text.length <= 500) setNotes(text); }}
            placeholder="Any extra notes, variations, tips..."
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            maxLength={500}
          />
        </View>

        {/* Tags */}
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
          <Text className="text-white font-bold text-base">Save Changes</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
