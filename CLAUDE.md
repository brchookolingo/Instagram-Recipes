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

### 🟡 MEDIUM SEVERITY

_(No open medium-severity items)_

---

### 🟢 LOW PRIORITY (logged, not scheduled)

- **L1** — No cloud backup / cross-device sync. Reinstalling loses all data.
- **L2** — No recipe sharing (URL scheme, export, social share).
- **L3** — No recipe scaling (e.g. double ingredients for more servings).
- **L4** — Hardcoded dietary filter tags in `index.tsx` won't reflect custom user tags.
- **L5** — `isFavourite` uses British spelling inconsistently with the codebase.
- **L6** — No full-text search; current search only matches title and author.
- **L7** — No nutritional information or macro tracking.
- **L8** — No undo for ingredient/instruction deletes in the grocery list.
- **L9** — No MMKV schema migration strategy; corrupted storage has no recovery path.
- **L11** — Grocery list AI consolidation has no preview/undo before committing changes.

---

### 🆕 Feature Requests (logged by user)

- [ ] **F1 — Onboarding flow for first-time users**
  On first launch, show a series of images/screens walking the user through how to use the app. Also add an "Instructions / How to use" section in Settings so users can revisit it anytime.

- [ ] **F2 — In-app feedback via Google Form**
  Add a feedback link in Settings that opens a Google Form for collecting user feedback. Create a dedicated Gmail account for the app so users can email directly with questions or issues.

- [ ] **F3 — Rename "Boards" to "Collections"**
  UX change throughout the app — rename all instances of "Boards" / "boards" to "Collections" / "collections" including tab labels, screen titles, store names, and type definitions.

- [ ] **F4 — Cooking-themed loading animations**
  Replace the current loading spinner with fun cooking-themed animations (e.g. Lottie animations of a chef, bubbling pot, stirring spoon) to make the recipe fetch experience more engaging.

- [ ] **F5 — Storage stats in Settings**
  Add a section in Settings showing the user how many recipes they have saved and the approximate storage the app is using on their device.

- [ ] **F6 — Update dietary filters and add meal type filters**
  Remove "Lactose Free" from dietary filter options. Add a new "Meal Type" filter section with options: Salad, Appetizer, Dessert, Main, Soup.

- [ ] **F7 — Grocery list respects ingredient multiplier**
  When the user taps "Add to Grocery List" on the recipe detail screen, use the currently selected multiplier scale (½x, 1x, 2x) to determine which ingredient quantities are added, rather than always using the base amounts.
  _File: app/recipe/[id].tsx_

- [ ] **F8 — Regenerate scaled ingredients on manual edit**
  When a user adds, removes, or edits an ingredient on a recipe, automatically regenerate the `ingredientsHalf` and `ingredientsDouble` arrays to keep them in sync with the updated base ingredients.
  _Files: src/stores/recipe-store.ts, src/types/recipe.ts_

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

### Backlog Cleanup (completed)
- Enforced 200 MB image cache cap in `image-cache.ts`: `cacheImage` evicts oldest files before each download; `sweepOrphanedImages(ids)` exported and called once at app startup (`_layout.tsx`) to remove files with no matching recipe (M3)
- Added stable `id: string` field to `Ingredient` type; assigned via `generateId()` at parse time in `recipe-parser-ai.ts`, `recipe-parser.ts`, `web-recipe-fetcher.ts`, `add-recipe.tsx`, and `edit/[id].tsx`; `IngredientList` now keys on `ingredient.id` (M4)
- Moved `LOADING_THEMES` array from inline constant in `add-recipe.tsx` into `src/utils/constants.ts` (L10)
- Removed `"video"` from `extractionSource` union type — only `"caption" | "manual"` remain (L12)
