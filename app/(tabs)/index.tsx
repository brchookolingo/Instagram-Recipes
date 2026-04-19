import { useEffect, useState } from "react";
import { View, FlatList, TextInput, Pressable, Text, Modal } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useRecipeStore } from "../../src/stores/recipe-store";
import { useFilterStore } from "../../src/stores/filter-store";
import { useDebounce } from "../../src/hooks/useDebounce";
import { RecipeCard } from "../../src/components/RecipeCard";
import { EmptyState } from "../../src/components/EmptyState";
import { PillButton } from "../../src/components/PillButton";
import { SkeletonRecipeGrid } from "../../src/components/SkeletonRecipeGrid";
import { applyFilters } from "../../src/utils/recipe-filters";
import {
  FILTER_DIETARY,
  FILTER_PROTEIN,
  FILTER_PREP,
  FILTER_MEAL_TYPE,
} from "../../src/utils/constants";
import { Recipe } from "../../src/types/recipe";

export default function HomeScreen() {
  const recipes = useRecipeStore((s) => s.recipes);
  const {
    search,
    filterFavourites,
    filterDietary,
    filterProtein,
    filterPrep,
    filterMealType,
    setSearch,
    setFilterFavourites,
    setFilterDietary,
    setFilterProtein,
    setFilterPrep,
    setFilterMealType,
    clearAll: clearFilters,
  } = useFilterStore();
  const [showFilter, setShowFilter] = useState(false);
  const [hasHydrated, setHasHydrated] = useState(() =>
    useRecipeStore.persist.hasHydrated(),
  );
  const debouncedSearch = useDebounce(search, 300);
  const router = useRouter();

  useEffect(() => {
    if (hasHydrated) return;
    const unsub = useRecipeStore.persist.onFinishHydration(() => {
      setHasHydrated(true);
    });
    return unsub;
  }, [hasHydrated]);

  const activeFilterCount =
    (filterFavourites ? 1 : 0) +
    filterDietary.length +
    filterProtein.length +
    filterPrep.length +
    filterMealType.length;

  const togglePill = (arr: string[], val: string, setter: (v: string[]) => void) =>
    setter(arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val]);

  const filtered = applyFilters(recipes, {
    search: debouncedSearch,
    filterFavourites,
    filterDietary,
    filterProtein,
    filterPrep,
    filterMealType,
  });

  const handleClearFilters = () => clearFilters();

  const renderItem = ({ item }: { item: Recipe }) => (
    <RecipeCard
      recipe={item}
      onPress={() => router.push(`/recipe/${item.id}`)}
    />
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["bottom"]}>
      {/* Search + filter bar */}
      <View className="px-4 pt-2 pb-2 flex-row items-center gap-2">
        <TextInput
          className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-base"
          placeholder="Search recipes..."
          value={search}
          onChangeText={setSearch}
          accessibilityLabel="Search recipes"
        />
        <Pressable
          className="bg-white border border-gray-200 rounded-xl p-2.5 items-center justify-center"
          onPress={() => setShowFilter(true)}
          style={{ position: "relative" }}
          accessibilityRole="button"
          accessibilityLabel={
            activeFilterCount > 0
              ? `Filters, ${activeFilterCount} active`
              : "Filters"
          }
          accessibilityHint="Opens filter panel"
        >
          <Ionicons name="options-outline" size={22} color="#374151" />
          {activeFilterCount > 0 && (
            <View
              style={{
                position: "absolute",
                top: -6,
                right: -6,
                backgroundColor: "#ec4899",
                borderRadius: 10,
                width: 20,
                height: 20,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ color: "white", fontSize: 11, fontWeight: "bold" }}>
                {activeFilterCount}
              </Text>
            </View>
          )}
        </Pressable>
      </View>

      {!hasHydrated ? (
        <SkeletonRecipeGrid />
      ) : filtered.length === 0 ? (
        search || activeFilterCount > 0 ? (
          <EmptyState
            icon="🔍"
            title="No results"
            subtitle={
              search
                ? `No recipes matching "${search}"`
                : "No recipes match the current filters"
            }
          />
        ) : (
          <EmptyState
            icon="🍽️"
            title="No recipes yet"
            subtitle="Tap the + button to save your first Instagram recipe"
            actionLabel="Add Recipe"
            onAction={() => router.push("/add-recipe")}
          />
        )
      ) : (
        <FlatList
          data={filtered}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: "flex-start" }}
          contentContainerStyle={{ padding: 4 }}
          removeClippedSubviews
          initialNumToRender={8}
          maxToRenderPerBatch={8}
          windowSize={5}
        />
      )}

      <Pressable
        className="absolute bottom-6 right-6 w-14 h-14 bg-pink-500 rounded-full items-center justify-center shadow-lg"
        onPress={() => router.push("/add-recipe")}
        accessibilityRole="button"
        accessibilityLabel="Add recipe"
        accessibilityHint="Opens the add recipe form"
      >
        <Text className="text-white text-3xl font-light">+</Text>
      </Pressable>

      {/* Filter modal */}
      <Modal visible={showFilter} animationType="slide" transparent>
        <View className="flex-1 justify-end bg-black/40">
          <Pressable
            className="flex-1"
            onPress={() => setShowFilter(false)}
            accessibilityRole="button"
            accessibilityLabel="Close filter panel"
          />
          <View className="bg-white rounded-t-3xl px-4 pt-6 pb-10">
            {/* Header */}
            <View className="flex-row items-center justify-between mb-5">
              <Text className="text-lg font-bold" accessibilityRole="header">
                Filter Recipes
              </Text>
              <Pressable
                onPress={clearFilters}
                accessibilityRole="button"
                accessibilityLabel="Clear all filters"
              >
                <Text className="text-pink-500 font-semibold">Clear All</Text>
              </Pressable>
            </View>

            {/* Favourites */}
            <Text className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
              Favourites
            </Text>
            <View className="flex-row flex-wrap gap-2 mb-5">
              <PillButton
                label="Show Favourites Only"
                active={filterFavourites}
                onPress={() => setFilterFavourites(!filterFavourites)}
              />
            </View>

            {/* Dietary */}
            <Text className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
              Dietary
            </Text>
            <View className="flex-row flex-wrap gap-2 mb-5">
              {FILTER_DIETARY.map((diet) => (
                <PillButton
                  key={diet}
                  label={diet}
                  active={filterDietary.includes(diet)}
                  onPress={() => togglePill(filterDietary, diet, setFilterDietary)}
                />
              ))}
            </View>

            {/* Protein */}
            <Text className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
              Protein
            </Text>
            <View className="flex-row flex-wrap gap-2 mb-5">
              {FILTER_PROTEIN.map((protein) => (
                <PillButton
                  key={protein}
                  label={protein}
                  active={filterProtein.includes(protein)}
                  onPress={() => togglePill(filterProtein, protein, setFilterProtein)}
                />
              ))}
            </View>

            {/* Preparation */}
            <Text className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
              Preparation
            </Text>
            <View className="flex-row flex-wrap gap-2 mb-5">
              {FILTER_PREP.map((prep) => (
                <PillButton
                  key={prep}
                  label={prep}
                  active={filterPrep.includes(prep)}
                  onPress={() => togglePill(filterPrep, prep, setFilterPrep)}
                />
              ))}
            </View>

            {/* Meal Type */}
            <Text className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
              Meal Type
            </Text>
            <View className="flex-row flex-wrap gap-2 mb-4">
              {FILTER_MEAL_TYPE.map((mealType) => (
                <PillButton
                  key={mealType}
                  label={mealType}
                  active={filterMealType.includes(mealType)}
                  onPress={() => togglePill(filterMealType, mealType, setFilterMealType)}
                />
              ))}
            </View>

            {/* Done */}
            <Pressable
              className="bg-pink-500 rounded-xl py-3 items-center mt-2"
              onPress={() => setShowFilter(false)}
              accessibilityRole="button"
              accessibilityLabel="Apply filters"
            >
              <Text className="text-white font-semibold">Done</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
