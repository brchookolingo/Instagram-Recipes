import { useState } from "react";
import { View, Text, Pressable, Dimensions } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { markOnboardingSeen } from "../src/utils/onboarding";

const { width } = Dimensions.get("window");

const SLIDES = [
  {
    emoji: "🍽️",
    title: "Welcome to ReciGrams",
    description: "Save recipes from Instagram, TikTok & Pinterest in seconds.",
  },
  {
    emoji: "📲",
    title: "Paste Any Recipe Link",
    description:
      "We'll automatically extract the ingredients and instructions for you.",
  },
  {
    emoji: "🛒",
    title: "Smart Grocery Lists",
    description:
      "Add ingredients to your grocery list with one tap. Claude organises them by store section.",
  },
  {
    emoji: "📚",
    title: "Stay Organised",
    description: "Group your recipes into Collections to find them easily.",
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const { mode } = useLocalSearchParams<{ mode?: string }>();
  const isReview = mode === "review";

  const [currentIndex, setCurrentIndex] = useState(0);
  const isLast = currentIndex === SLIDES.length - 1;

  const handleNext = () => {
    if (isLast) {
      if (isReview) {
        router.back();
      } else {
        markOnboardingSeen();
        router.replace("/(tabs)");
      }
    } else {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleSkip = () => {
    if (isReview) {
      router.back();
    } else {
      markOnboardingSeen();
      router.replace("/(tabs)");
    }
  };

  const slide = SLIDES[currentIndex];

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      {/* Skip button */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "flex-end",
          paddingHorizontal: 24,
          paddingTop: 60,
        }}
      >
        {isLast ? (
          <View style={{ width: 48 }} />
        ) : (
          <Pressable onPress={handleSkip} hitSlop={8}>
            <Text style={{ color: "#9ca3af", fontSize: 15, fontWeight: "500" }}>
              {isReview ? "Done" : "Skip"}
            </Text>
          </Pressable>
        )}
      </View>

      {/* Slide content */}
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: 32,
        }}
      >
        <Text style={{ fontSize: 80, marginBottom: 32 }}>{slide.emoji}</Text>
        <Text
          style={{
            fontSize: 26,
            fontWeight: "700",
            textAlign: "center",
            color: "#111827",
            marginBottom: 16,
          }}
        >
          {slide.title}
        </Text>
        <Text
          style={{
            fontSize: 16,
            textAlign: "center",
            color: "#6b7280",
            lineHeight: 24,
          }}
        >
          {slide.description}
        </Text>
      </View>

      {/* Dots */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          gap: 8,
          marginBottom: 32,
        }}
      >
        {SLIDES.map((_, i) => (
          <View
            key={i}
            style={{
              width: i === currentIndex ? 20 : 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: i === currentIndex ? "#ec4899" : "#e5e7eb",
            }}
          />
        ))}
      </View>

      {/* Next / Get Started button */}
      <View style={{ paddingHorizontal: 24, paddingBottom: 48 }}>
        <Pressable
          onPress={handleNext}
          style={{
            backgroundColor: "#ec4899",
            borderRadius: 16,
            paddingVertical: 16,
            alignItems: "center",
          }}
        >
          <Text style={{ color: "#fff", fontSize: 16, fontWeight: "700" }}>
            {isLast ? (isReview ? "Done" : "Get Started") : "Next"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
