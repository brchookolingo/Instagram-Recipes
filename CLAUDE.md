# ReciGrams — Project Memory

This file is read by Claude Code as persistent context. Keep it up to date as tasks are completed.

---

## Tech Stack
- React Native (Expo) with Expo Router
- Zustand + react-native-mmkv for state/persistence
- NativeWind (Tailwind) for styling
- Claude API (Anthropic) for AI recipe extraction
- RapidAPI (Instagram scraper) + Facebook Graph API (oEmbed) for Instagram
- TikTok oEmbed + Pinterest oEmbed + schema.org JSON-LD for TikTok/Pinterest

---

## Task Backlog

### 🔴 CRITICAL (must fix before any public release)

- [ ] **C1 — Move API keys to a backend proxy**
  All `EXPO_PUBLIC_*` secrets (Claude, RapidAPI, Facebook) are exposed in the client bundle and readable from any decompiled APK. Build a lightweight backend (e.g. Expo API routes or a simple Node/Edge function) that holds the secrets and proxies requests. The client exchanges a session token only.
  _Files: src/services/recipe-extractor.ts:40, app/recipe/[id].tsx:85, src/services/instagram-scraper.ts:14, src/services/instagram-oembed.ts:24-25_

- [ ] **C2 — Replace silent catch blocks with typed errors**
  Every `catch { return null }` swallows errors silently. Introduce a typed `ServiceResult<T>` pattern (`{ ok: true, data } | { ok: false, error: { code, message } }`) so callers can distinguish rate limits, bad URLs, network failures, and invalid API keys.
  _Files: src/services/recipe-parser-ai.ts:86, src/services/instagram-oembed.ts:59, src/services/tiktok.ts, src/services/pinterest.ts, src/services/web-recipe-fetcher.ts_

---

### 🟢 LOW PRIORITY

- **L9** — No MMKV schema migration strategy; corrupted storage has no recovery path. _(skipped by user — too complex for personal app at this stage)_

---

## Completed Work

### Code Cleanup (completed)
- Removed `App.tsx`, `index.ts` (legacy entry points superseded by expo-router)
- Removed `src/services/video-extractor.ts` (implemented but never wired up)
- Removed `getCachedImageUri`, `getCachedImageUriAsync` from `image-cache.ts` (unused exports)
- Removed `APP_NAME` from `constants.ts` (unused)
- Unexported `isInstagramUrl` in `useClipboard.ts` (internal only)
- Removed `coverImageUri` from `Board` type (never set or read)
- Deleted dev artifacts: `IMPLEMENTATION_PLAN.md`, `SCHEDULER_PROMPT.md`, `TASKS.json`

### Multi-Platform Support (completed)
- Added `src/types/post.ts` with shared `RawPost` type
- Added `src/services/tiktok.ts` (TikTok oEmbed, `vt.tiktok.com` short links)
- Added `src/services/pinterest.ts` (Pinterest oEmbed + schema.org JSON-LD web scraping)
- Added `src/services/post-fetcher.ts` (platform router with `detectPlatform`, `normalizePinterestUrl`)
- Added `src/services/web-recipe-fetcher.ts` (schema.org JSON-LD parser + page text fallback)
- Updated `useClipboard.ts` to detect all 3 platforms
- Updated `add-recipe.tsx` with Tier 0 (pre-extracted recipe data bypass)
- Updated `recipe-parser-ai.ts` prompt to be platform-agnostic
- Updated `URLInput.tsx` placeholder and `recipe/[id].tsx` "View Original Post" link

### Cache, Type & Code Quality (completed)
- Enforced 200 MB image cache limit in `src/utils/image-cache.ts` via `enforceCacheLimit()`; added startup orphan sweep in `app/_layout.tsx` (M3)
- Added `id?: string` to `Ingredient` type; all parse paths assign `generateId()`; `IngredientList` keys on stable id with index fallback for legacy data (M4)
- Moved `LOADING_THEMES` from `app/add-recipe.tsx` to `src/utils/constants.ts` (L10)
- Removed dead `"video"` member from `extractionSource` union in `src/types/recipe.ts` (L12)
- Switched all Claude API calls from `claude-opus-4-6` to `claude-sonnet-4-5` in `src/utils/constants.ts`

### Stability, Performance & UX (completed)
- Added `src/utils/fetch-with-timeout.ts` — AbortController + 10s timeout wrapper used by all services (C3)
- Fixed image-cache race in `recipe-store.ts` `addRecipe` — image is cached before persist (H1)
- Extracted tier-fallback logic into `src/services/recipe-extractor.ts`; `add-recipe.tsx` `handleFetch` is now UI-only (H2)
- Added `clearAll()` to recipe/board/grocery stores; `settings.tsx` calls all three (H3)
- Added minimum recipe validation in `add-recipe.tsx` save handler — title required + at least one ingredient or instruction (H4)
- Added `src/stores/filter-store.ts`; search + filters now persist across navigation (H5)
- `src/utils/retry.ts` now uses exponential backoff and short-circuits on 4xx (H6)
- `RecipeCard` and `BoardCard` wrapped in `React.memo` (M1)
- Added `src/hooks/useDebounce.ts`; search is debounced 300ms in the recipes tab (M2)
- Added `src/utils/uuid.ts` `generateId()`; used for recipe and grocery IDs (M5)
- `add-recipe.tsx` checks `findBySourceUrl` before saving and prompts on duplicate (M6)
- `RawPost` in `src/types/post.ts` is now a discriminated union over `platform` (`InstagramPost | TikTokPost | PinterestPost`) (M7)
- `URLInput.tsx` validates URL format + supported platform inline before submit (M8)
- Recipe scaling added (half and double)

### Features & UX (completed)
- Full-text search extended to match description, tags, and ingredient text in addition to title and author (L6)
- Onboarding flow added (`app/onboarding.tsx`) — 4-slide pager shown on first launch; MMKV-backed `hasSeenOnboarding()` / `markOnboardingSeen()` in `src/utils/onboarding.ts`; `app/_layout.tsx` redirects to `/onboarding` on first launch; Settings "How to Use" row reopens onboarding in review mode (F1)
- "Send Feedback" row added to Settings — opens Google Form via `Linking.openURL()` (F2)
- Renamed "Boards" → "Collections" throughout UI: `boards.tsx` → `collections.tsx`, `board/[id].tsx` → `collection/[id].tsx`, tab label/title updated, all nav routes updated; internal store/MMKV keys unchanged to preserve persisted data (F3)
- Replaced `ActivityIndicator` loading state in `add-recipe.tsx` with animated `CookingSpinner` component (`src/components/CookingSpinner.tsx`) using react-native-reanimated rotating 🍳 emoji (F4)
- Storage stats section added to Settings — shows recipe count and image cache size in MB using `expo-file-system/legacy` (F5)
- Removed "Lactose Free" from dietary filter pills; added Meal Type section (Salad, Appetizer, Dessert, Main, Soup); `filterMealType` added to `filter-store.ts`; removed "lactose free" from Claude system prompt (F6)
- "Add to Grocery List" uses currently selected scale (½×/1×/2×) — `scaledIngredients` passed to `addRecipeIngredients` (F7)
- `updateRecipe()` in `recipe-store.ts` regenerates `ingredientsHalf` and `ingredientsDouble` via `scaleIngredients()` whenever `ingredients` is updated (F8)
