import { useState } from "react";
import { View, Text, Pressable, StyleSheet, StatusBar } from "react-native";
import { Image } from "expo-image";
import { useRouter, useLocalSearchParams } from "expo-router";
import { markOnboardingSeen } from "../src/utils/onboarding";

const SLIDES = [
  {
    image: require("../assets/onboarding/slide2.png"),
    title: "Save recipes you love",
    description:
      "Found something delicious on Instagram, TikTok or Pinterest? ReciGrams saves it as a proper recipe.",
  },
  {
    image: require("../assets/onboarding/slide1.png"),
    title: "Just copy the link",
    description:
      "Tap Share on any post, copy the link, and paste it into ReciGrams — that's all it takes.",
  },
  {
    image: require("../assets/onboarding/slide3.png"),
    title: "Recipe extracted instantly",
    description:
      "We automatically pull out the title, ingredients, instructions, and timing.",
  },
  {
    image: require("../assets/onboarding/slide4.png"),
    title: "Stay organised",
    description:
      "Group your saved recipes into Collections for easy browsing.",
  },
  {
    image: require("../assets/onboarding/slide5.png"),
    title: "Smart grocery lists",
    description:
      "Add ingredients to your list and Claude organises them by store section.",
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
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Full-screen screenshot */}
      <Image
        source={slide.image}
        style={StyleSheet.absoluteFillObject}
        contentFit="cover"
        transition={300}
      />

      {/* Skip button */}
      <View style={styles.skipRow}>
        {!isLast && (
          <Pressable onPress={handleSkip} hitSlop={12} style={styles.skipBtn}>
            <Text style={styles.skipText}>{isReview ? "Done" : "Skip"}</Text>
          </Pressable>
        )}
      </View>

      {/* Bottom card */}
      <View style={styles.card}>
        {/* Dots */}
        <View style={styles.dotsRow}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                i === currentIndex ? styles.dotActive : styles.dotInactive,
              ]}
            />
          ))}
        </View>

        <Text style={styles.title}>{slide.title}</Text>
        <Text style={styles.description}>{slide.description}</Text>

        <Pressable onPress={handleNext} style={styles.button}>
          <Text style={styles.buttonText}>
            {isLast ? (isReview ? "Done" : "Get Started") : "Next"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  skipRow: {
    position: "absolute",
    top: 60,
    right: 24,
    zIndex: 10,
  },
  skipBtn: {
    backgroundColor: "rgba(0,0,0,0.35)",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  skipText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  card: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 28,
    paddingTop: 24,
    paddingBottom: 48,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
  },
  dotsRow: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 20,
  },
  dot: {
    height: 7,
    borderRadius: 4,
  },
  dotActive: {
    width: 22,
    backgroundColor: "#ec4899",
  },
  dotInactive: {
    width: 7,
    backgroundColor: "#e5e7eb",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
  },
  description: {
    fontSize: 15,
    color: "#6b7280",
    lineHeight: 22,
    marginBottom: 24,
  },
  button: {
    backgroundColor: "#ec4899",
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});
