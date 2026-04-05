# Instagram Recipes App - Implementation Plan

## Context

Build a React Native mobile app that lets users save Instagram recipe posts. Users paste an Instagram link, the app fetches the post data, uses Claude AI to extract structured recipe information (ingredients, instructions), and displays it as a card. Users can organize saved recipes into Pinterest-style boards. No authentication — all data stored locally on-device.

## Tech Stack

| Category | Choice | Why |
|---|---|---|
| Framework | **Expo** (managed workflow, SDK 52+) | Fastest setup, OTA updates, no native config needed |
| Language | **TypeScript** | Type safety across the project |
| Routing | **Expo Router** | File-based routing built on React Navigation |
| Storage | **react-native-mmkv** | ~30x faster than AsyncStorage, synchronous, encryption support |
| State | **zustand** + persist middleware | Tiny, hooks-based, pairs naturally with MMKV |
| Styling | **NativeWind** (Tailwind for RN) | Utility-first CSS, rapid iteration |
| Images | **expo-image** | Better caching/performance than default Image |
| AI Parsing | **Claude API** (`@anthropic-ai/sdk`) | Extract recipe title, ingredients, instructions from captions and video frames |
| Video Frames | **expo-video-thumbnails** | Extract key frames from Instagram videos for Claude Vision analysis |
| Clipboard | **expo-clipboard** | Detect Instagram URLs from clipboard |

## Instagram Data Fetching Strategy

**Important constraint:** Instagram's official Graph API only works with Business/Creator accounts and cannot read arbitrary public posts. The oEmbed API no longer returns caption text or image URLs as standalone fields.

**Recommended approach — multi-layer strategy:**

1. **Primary: Instagram oEmbed API** — Requires a Facebook App ID and app access token (free, no user login needed). Returns embed HTML containing the caption and image. We parse the HTML to extract data.
2. **Fallback: Third-party scraper API** (e.g., RapidAPI Instagram scrapers) — Returns structured JSON with caption, image URLs, author info. These can break when Instagram changes internals but provide the richest data.
3. **Always available: Manual entry** — User can paste/type recipe details directly if fetching fails.

The `InstagramService` facade abstracts these providers so swapping is a single-file change.

## AI-Powered Recipe Extraction (Two-Tier)

Recipe extraction follows a **caption-first, video-fallback** strategy:

### Tier 1: Caption & Metadata Extraction

- Fetch the Instagram post's caption text and metadata via the data fetching layer
- Send the raw caption to **Claude API** with a prompt asking for: title, description, ingredients (with quantities), instructions (ordered steps), tags, prep time, cook time, servings
- Claude handles messy formats, emoji-heavy captions, multi-language text
- If Claude successfully extracts a recipe with ingredients AND instructions, we're done
- Fallback to simple regex heuristics if API key is not configured

### Tier 2: Video Frame Extraction (Fallback)

If Tier 1 fails (caption has no recipe info, or the post is a video-only recipe):

1. **Download the video** — Instagram video URLs are obtained from the scraper API response or the user can select a pre-downloaded video from their device
2. **Extract key frames** — Use `expo-video-thumbnails` to capture 5-8 frames at even intervals throughout the video. This catches title cards, ingredient lists, and step-by-step visuals that recipe creators typically show
3. **Send frames to Claude Vision API** — Claude's vision capabilities can analyze multiple images per request. Send all extracted frames with a prompt asking Claude to identify and extract recipe information visible in the frames (ingredient lists, step text overlays, cooking techniques)
4. **Merge results** — Combine any partial caption data from Tier 1 with video-extracted data from Tier 2. Claude is prompted to produce the same structured JSON format

**Why this works:** Recipe videos typically display ingredients and steps as text overlays or title cards. Claude Vision can read this text from frame screenshots, even with stylized fonts or backgrounds.

**Key constraint:** Claude cannot process video directly — only images. Frame extraction on-device via `expo-video-thumbnails` is fast and requires no server infrastructure.

## Data Models

```typescript
// src/types/recipe.ts

interface Recipe {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  localImageUri?: string;       // cached locally via expo-file-system
  videoUrl?: string;            // Instagram video URL (if video post)
  sourceUrl: string;            // original Instagram URL
  author: string;
  ingredients: Ingredient[];
  instructions: Instruction[];
  tags: string[];
  prepTime?: string;
  cookTime?: string;
  servings?: string;
  extractionSource: 'caption' | 'video' | 'manual'; // how the recipe was extracted
  boardIds: string[];
  createdAt: string;
  updatedAt: string;
}

interface Ingredient {
  text: string;
  quantity?: string;
  unit?: string;
  checked: boolean;
}

interface Instruction {
  stepNumber: number;
  text: string;
}

interface Board {
  id: string;
  name: string;
  coverImageUri?: string;
  recipeIds: string[];
  createdAt: string;
}
```

## App Screens & Navigation

Tab-based layout with Expo Router:

```
app/
├── _layout.tsx          # Root layout (tab navigator)
├── (tabs)/
│   ├── _layout.tsx      # Tab bar config
│   ├── index.tsx        # Home — saved recipes grid
│   ├── boards.tsx       # Boards list
│   └── settings.tsx     # Settings (API key config, theme)
├── add-recipe.tsx       # Add recipe (paste link → fetch → preview → save)
├── recipe/[id].tsx      # Recipe detail view
└── board/[id].tsx       # Board detail (recipes in board)
```

### Screen Descriptions

| Screen | Purpose |
|---|---|
| **Home** | Displays all saved recipes in a 2-column grid of `RecipeCard` tiles. Search/filter bar at top. FAB button to add new recipe. |
| **Add Recipe** | User pastes Instagram URL (with clipboard auto-detect). Shows loading state while fetching → parsing. Displays preview card with editable fields (title, ingredients, instructions). Save button adds to local storage. |
| **Recipe Detail** | Full recipe view: hero image, title, author, prep/cook time, servings, ingredient checklist, numbered instructions. Actions: edit, delete, add to board. |
| **Boards** | List of user-created boards displayed as cards with cover images. Create new board button. |
| **Board Detail** | Grid of recipes within a selected board. Edit board name, remove recipes. |
| **Settings** | Claude API key input, theme toggle (light/dark), about section. |

## Project File Structure

```
Instagram-Recipes/
├── app/                          # Expo Router screens (see above)
│   ├── _layout.tsx
│   ├── (tabs)/
│   │   ├── _layout.tsx
│   │   ├── index.tsx
│   │   ├── boards.tsx
│   │   └── settings.tsx
│   ├── add-recipe.tsx
│   ├── recipe/[id].tsx
│   └── board/[id].tsx
├── src/
│   ├── components/
│   │   ├── RecipeCard.tsx        # Recipe tile for grid display
│   │   ├── BoardCard.tsx         # Board tile for boards list
│   │   ├── URLInput.tsx          # Instagram URL input with clipboard detection
│   │   ├── IngredientList.tsx    # Checkable ingredient list
│   │   └── InstructionList.tsx   # Numbered steps
│   ├── services/
│   │   ├── instagram.ts          # Facade: orchestrates data fetching
│   │   ├── instagram-oembed.ts   # oEmbed API provider
│   │   ├── instagram-scraper.ts  # Third-party scraper fallback
│   │   ├── recipe-parser.ts      # Regex-based heuristic parser (no-API fallback)
│   │   ├── recipe-parser-ai.ts   # Claude API caption extraction (Tier 1)
│   │   └── video-extractor.ts    # Video frame extraction + Claude Vision (Tier 2)
│   ├── stores/
│   │   ├── recipe-store.ts       # Zustand store for recipes (CRUD + persist)
│   │   └── board-store.ts        # Zustand store for boards (CRUD + persist)
│   ├── types/
│   │   └── recipe.ts             # All TypeScript interfaces
│   ├── utils/
│   │   ├── storage.ts            # MMKV instance setup
│   │   └── constants.ts          # App constants, colors, config
│   └── hooks/
│       └── useClipboard.ts       # Clipboard monitoring hook
├── assets/                       # App icon, splash, fonts
├── app.json                      # Expo config
├── tailwind.config.js            # NativeWind/Tailwind config
├── tsconfig.json
└── package.json
```

## Implementation Phases

### Phase 1: Project Setup & Foundation

- [ ] Initialize Expo project with TypeScript template: `npx create-expo-app@latest InstagramRecipes --template blank-typescript`
- [ ] Install dependencies: `react-native-mmkv`, `zustand`, `nativewind`, `expo-image`, `expo-clipboard`, `expo-video-thumbnails`, `expo-file-system`, `@anthropic-ai/sdk`
- [ ] Configure NativeWind (tailwind.config.js, babel preset, metro config)
- [ ] Set up Expo Router with tab navigation layout
- [ ] Create placeholder screens for all routes
- [ ] Define TypeScript types in `src/types/recipe.ts`
- [ ] Set up MMKV storage instance and Zustand stores with persist middleware

### Phase 2: Core Recipe Flow

- [ ] Build `URLInput` component with clipboard paste detection
- [ ] Implement Instagram data fetching service (oEmbed + scraper fallback)
- [ ] Implement Claude AI caption parser (`recipe-parser-ai.ts`) — Tier 1
- [ ] Implement video frame extractor (`video-extractor.ts`) — Tier 2: uses `expo-video-thumbnails` to extract 5-8 frames, sends to Claude Vision API
- [ ] Implement regex fallback parser (`recipe-parser.ts`) for when no API key is configured
- [ ] Wire up the two-tier extraction flow: try caption first → if insufficient, extract from video frames
- [ ] Build Add Recipe screen: URL input → fetch → AI parse (caption → video fallback) → preview/edit → save
- [ ] Test end-to-end with both caption-based and video-based Instagram recipe posts

### Phase 3: Display & Browse

- [ ] Build `RecipeCard` component
- [ ] Build Home screen with recipe grid (2-column FlatList)
- [ ] Build Recipe Detail screen with full layout
- [ ] Build `IngredientList` with checkboxes and `InstructionList` with numbered steps
- [ ] Add recipe deletion with confirmation
- [ ] Add search/filter on Home screen (by title, ingredient, tag)

### Phase 4: Boards

- [ ] Build `BoardCard` component and Boards list screen
- [ ] Build Board Detail screen
- [ ] Add "Add to Board" action from Recipe Detail
- [ ] Add board selection during recipe save flow
- [ ] Handle board cover image (use first recipe's image by default)

### Phase 5: Polish

- [ ] Empty states with helpful illustrations/text
- [ ] Settings screen (Claude API key input, theme toggle)
- [ ] Error handling and retry logic for network requests
- [ ] Image caching (download to local storage via expo-file-system)
- [ ] App icon and splash screen
- [ ] Test on both iOS and Android

## Risks & Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| **Instagram data access fragility** | Third-party APIs can break when Instagram changes internals | Abstraction layer (`InstagramService`) makes swapping providers a single-file change; manual entry always works |
| **Caption parsing accuracy** | Captions vary wildly in format, language, emoji usage | Claude AI handles most formats well; parsed results are always editable by the user |
| **Image URL expiration** | Instagram CDN URLs expire after some time | Download and cache images locally at save time using `expo-file-system` |
| **Claude API key requirement** | Users need their own API key for AI features | Regex fallback parser works without a key; Settings screen guides API key setup |
| **Video frame extraction quality** | Some videos rely on spoken instructions with no text overlays | Claude Vision attempts to identify cooking steps from visual context; users can manually edit results; future enhancement: audio transcription via cloud speech-to-text |

## Verification Checklist

- [ ] Run `npx expo start` and verify app loads on iOS/Android simulator
- [ ] Paste a real Instagram recipe URL and verify data is fetched
- [ ] Verify Claude AI extracts ingredients and instructions from a **caption-based** recipe post
- [ ] Verify Claude Vision extracts recipe from a **video-only** recipe post (Tier 2 fallback)
- [ ] Save a recipe and verify it persists across app restarts (MMKV)
- [ ] Create a board, add recipes to it, verify board display
- [ ] Test offline: saved recipes should display without network
- [ ] Run TypeScript checks: `npx tsc --noEmit`
