import { useState } from "react";
import { View, FlatList, TextInput, Pressable, Text, Modal } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useRecipeStore } from "../../src/stores/recipe-store";
import { useFilterStore } from "../../src/stores/filter-store";
import { useDebounce } from "../../src/hooks/useDebounce";
import { RecipeCard } from "../../src/components/RecipeCard";
import { EmptyState } from "../../src/components/EmptyState";
import { applyFilters } from "../../src/utils/recipe-filters";
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
  const debouncedSearch = useDebounce(search, 300);
  const router = useRouter();

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

  const renderItem = ({ item }: { item: Recipe | null }) => {
    if (!item) return <View className="flex-1 m-1.5" />;
    return (
      <RecipeCard
        recipe={item}
        onPress={() => router.push(`/recipe/${item.id}`)}
      />
    );
  };

  const PillButton = ({
    label,
    active,
    onPress,
  }: {
    label: string;
    active: boolean;
    onPress: () => void;
  }) => (
    <Pressable
      className={`rounded-full px-4 py-2 border ${active ? "bg-pink-500 border-pink-500" : "bg-white border-gray-300"}`}
      onPress={onPress}
    >
      <Text className={`text-sm font-medium ${active ? "text-white" : "text-gray-600"}`}>
        {label}
      </Text>
    </Pressable>
  );

  return (
    <View className="flex-1 bg-gray-50">
      {/* Search + filter bar */}
      <View className="px-4 pt-2 pb-2 flex-row items-center gap-2">
        <TextInput
          className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-base"
          placeholder="Search recipes..."
          value={search}
          onChangeText={setSearch}
        />
        <Pressable
          className="bg-white border border-gray-200 rounded-xl p-2.5 items-center justify-center"
          onPress={() => setShowFilter(true)}
          style={{ position: "relative" }}
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

      {filtered.length === 0 ? (
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
          data={filtered.length % 2 !== 0 ? [...filtered, null] : filtered}
          renderItem={renderItem}
          keyExtractor={(item) => item?.id ?? "spacer"}
          numColumns={2}
          contentContainerStyle={{ padding: 4 }}
        />
      )}

      <Pressable
        className="absolute bottom-6 right-6 w-14 h-14 bg-pink-500 rounded-full items-center justify-center shadow-lg"
        onPress={() => router.push("/add-recipe")}
      >
        <Text className="text-white text-3xl font-light">+</Text>
      </Pressable>

      {/* Filter modal */}
      <Modal visible={showFilter} animationType="slide" transparent>
        <View className="flex-1 justify-end">
          <Pressable className="flex-1" onPress={() => setShowFilter(false)} />
          <View className="bg-white rounded-t-3xl px-4 pt-6 pb-10">
            {/* Header */}
            <View className="flex-row items-center justify-between mb-5">
              <Text className="text-lg font-bold">Filter Recipes</Text>
              <Pressable onPress={clearFilters}>
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
              {["Vegetarian", "Vegan", "Gluten Free"].map((diet) => (
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
              {["Beef", "Chicken", "Pork", "Lamb", "Fish", "Shellfish"].map((protein) => (
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
              {["Under 30 min", "Under 1 hour", "Serves 6+"].map((prep) => (
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
              {["Salad", "Appetizer", "Dessert", "Main", "Soup"].map((mealType) => (
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
            >
              <Text className="text-white font-semibold">Done</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}
