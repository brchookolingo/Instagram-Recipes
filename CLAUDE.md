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
  _Files: app/add-recipe.tsx:56, app/recipe/[id].tsx:35, src/services/instagram-oembed.ts:23-24_

- [ ] **C2 — Replace silent catch blocks with typed errors**
  Every `catch { return null }` swallows errors silently. Introduce a typed `ServiceResult<T>` pattern (`{ ok: true, data } | { ok: false, error: { code, message } }`) so callers can distinguish rate limits, bad URLs, network failures, and invalid API keys.
  _Files: src/services/recipe-parser-ai.ts:86, src/services/instagram-oembed.ts:59, src/services/tiktok.ts, src/services/pinterest.ts, src/services/web-recipe-fetcher.ts_

- [ ] **C3 — Add request timeouts to all fetch calls**
  No `AbortController` is used anywhere. On slow/offline connections the loading spinner runs forever. Wrap every `fetch` with a 10-second timeout using `AbortController` + `setTimeout`.
  _Files: src/services/instagram-scraper.ts, src/services/instagram-oembed.ts, src/services/tiktok.ts, src/services/pinterest.ts, src/services/web-recipe-fetcher.ts, src/utils/image-cache.ts_

---

### 🟠 HIGH SEVERITY

- [ ] **H1 — Fix race condition in image caching**
  `addRecipe` saves the recipe to MMKV first, then caches the image in the background. If the app is killed between these two steps, `localImageUri` is never set. Fix: cache the image first, then persist the recipe atomically.
  _File: src/stores/recipe-store.ts:21-30_

- [ ] **H2 — Refactor handleFetch in add-recipe.tsx**
  The `handleFetch` function mixes URL routing, network calls, multi-tier parsing, and state updates in ~50 lines. Extract the tier-fallback logic into a dedicated `RecipeExtractionService` so `add-recipe.tsx` only handles UI state.
  _File: app/add-recipe.tsx:123-177_

- [ ] **H3 — Fix "Clear All Data" in settings**
  `useRecipeStore.setState({ recipes: [] })` bypasses the store API and doesn't clear the grocery list, leaving stale data. Add explicit `clearAll()` actions to all three stores and call them from settings.
  _File: app/(tabs)/settings.tsx:22-23, src/stores/grocery-store.ts_

- [ ] **H4 — Add minimum recipe validation before saving**
  A recipe with empty title, no ingredients, and no instructions satisfies the TypeScript type and saves successfully. Enforce a minimum: title required + at least one ingredient OR one instruction. Show inline validation errors rather than an alert.
  _File: app/add-recipe.tsx:219-264_

- [ ] **H5 — Persist filter state across navigation**
  Search query and active filters in the recipes tab are local component state. Navigating to a recipe and back resets them. Move filter state to Zustand or React Context.
  _File: app/(tabs)/index.tsx:11-18_

- [ ] **H6 — Make retry logic error-aware**
  `withRetry` retries all errors uniformly, including `401 Unauthorized` and `404 Not Found` which will never succeed. Add error classification so only transient errors (network timeout, `5xx`) are retried. Switch to exponential backoff: `delay * 2^(attempt-1)`.
  _File: src/utils/retry.ts_

---

### 🟡 MEDIUM SEVERITY

- [ ] **M1 — Memoize RecipeCard and BoardCard**
  Neither component is wrapped in `React.memo`, causing full FlatList re-renders on any parent state change. Wrap both with `React.memo` and audit all inline callbacks for `useCallback`.
  _Files: src/components/RecipeCard.tsx, src/components/BoardCard.tsx_

- [ ] **M2 — Debounce search input**
  Every keystroke in the search box synchronously recomputes the full filtered recipe list. Add a 300ms debounce to the search state update.
  _File: app/(tabs)/index.tsx_

- [ ] **M3 — Add image cache eviction**
  `cacheImage()` writes to disk but nothing ever deletes files. Implement a cleanup function that removes images for deleted recipes and enforce a maximum cache size (e.g. 200 MB).
  _File: src/utils/image-cache.ts_

- [ ] **M4 — Replace index-based keys in lists**
  `key={index}` in `IngredientList` and `InstructionList` causes incorrect re-renders when items are reordered or deleted. Assign stable IDs to ingredients and instructions at parse time.
  _Files: src/components/IngredientList.tsx, src/components/InstructionList.tsx_

- [ ] **M5 — Replace Date.now() IDs with crypto.randomUUID()**
  ID generation using `Date.now()` + `Math.random()` is collision-prone when two items are created rapidly. Replace with `crypto.randomUUID()` throughout.
  _Files: src/stores/grocery-store.ts, app/add-recipe.tsx_

- [ ] **M6 — Prevent duplicate recipe saves**
  Pasting the same URL twice saves two identical recipes. Before saving, check if a recipe with the same `sourceUrl` already exists and warn the user.
  _File: app/add-recipe.tsx, src/stores/recipe-store.ts_

- [ ] **M7 — Strengthen RawPost type with discriminated union**
  All fields on `RawPost` are optional, forcing defensive null-checking everywhere. Replace with a discriminated union: `{ type: 'structured', recipe } | { type: 'caption', text, meta } | { type: 'empty', meta }`.
  _File: src/types/post.ts_

- [ ] **M8 — Add input validation on URL submission**
  `URLInput` submits any non-empty string. Validate that the input matches a supported platform pattern before calling `fetchPost`, and show an inline error if not.
  _File: src/components/URLInput.tsx_

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
- **L10** — Inline loading messages (`LOADING_THEMES`) are hardcoded in `add-recipe.tsx`; should live in `constants.ts`.
- **L11** — Grocery list AI consolidation has no preview/undo before committing changes.
- **L12** — `extractionSource: "video"` remains in the type even though video extraction was removed.

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
