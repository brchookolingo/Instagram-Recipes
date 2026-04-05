# Instagram Recipes

A React Native (Expo) mobile app for saving and organizing recipes from Instagram posts.

## How It Works

1. Copy an Instagram recipe post link
2. Paste the link in the app
3. The app fetches the post data and uses Claude AI to extract the recipe (ingredients, instructions, etc.)
4. If the recipe is in a video (not the caption), the app extracts video frames and uses Claude Vision to read the recipe
5. Save the recipe and organize it into boards (Pinterest-style collections)

## Tech Stack

- **React Native** via Expo (SDK 52+)
- **TypeScript**
- **Expo Router** for navigation
- **Zustand** + **MMKV** for state management and local storage
- **NativeWind** (Tailwind CSS) for styling
- **Claude AI** for intelligent recipe extraction from captions and video frames

## Getting Started

See [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) for the full implementation plan and architecture details.
