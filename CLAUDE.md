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

Outstanding tasks live in [`TASKS.md`](TASKS.md), split into **AI-Autonomous** (safe for loop execution) and **Needs User Input** (blocked on a human decision). When a task ships, move its entry from `TASKS.md` into the "Completed Work" section below.

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
- Added `src/stores/filter-store.ts` (H5). Note: initial version was _not_ persisted — `persist` middleware + MMKV storage were added later in the Opus audit (Commit 3, A1).
- `src/utils/retry.ts` now uses exponential backoff and short-circuits on 4xx (H6)
- `RecipeCard` and `BoardCard` wrapped in `React.memo` (M1)
- Added `src/hooks/useDebounce.ts`; search is debounced 300ms in the recipes tab (M2)
- Added `src/utils/uuid.ts` `generateId()`; used for recipe and grocery IDs (M5)
- `add-recipe.tsx` checks `findBySourceUrl` before saving and prompts on duplicate (M6)
- `RawPost` in `src/types/post.ts` is now a discriminated union over `platform` (`InstagramPost | TikTokPost | PinterestPost`) (M7)
- `URLInput.tsx` validates URL format + supported platform inline before submit (M8)
- Recipe scaling added (half and double)

### Error Handling (completed)
- Replaced all silent `catch { return null }` blocks with typed `ParseResult<T>` pattern (C2)
- `parseRecipeWithAI` classifies Anthropic errors: 401 → `INVALID_API_KEY`, 429 → `RATE_LIMITED`, network → `NETWORK_ERROR`
- `extractRecipeFromPost` returns `ParseResult<ExtractionResult>` — surfaces critical AI errors to UI if all tiers fail
- `add-recipe.tsx` shows specific error messages for `INVALID_API_KEY`, `RATE_LIMITED`, `NETWORK_ERROR`; proceeds to manual preview for `PARSE_FAILED`
- Post-fetching services (`instagram-oembed`, `tiktok`, `pinterest`, `web-recipe-fetcher`) no longer swallow network/timeout errors; 429 responses thrown explicitly and classified by `post-fetcher.ts`
- `ParseErrorCode` and `ParseResult<T>` added to `src/types/result.ts`

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

### Opus 4.7 deep-audit fixes (completed)

**Commit 1 — Security foundations**
- S1: replaced Facebook App Secret with Client Token (`EXPO_PUBLIC_FACEBOOK_CLIENT_TOKEN`) in `src/services/instagram-oembed.ts`; App Secret rotated in Meta dashboard
- S4: encrypted MMKV — `src/utils/storage.ts` generates a 32-byte key via `expo-crypto`, stores it in `expo-secure-store`, passes it to `createMMKV({ encryptionKey })`; one-shot plaintext→ciphertext migration on first post-upgrade launch
- S2: `src/services/post-fetcher.ts` `resolveShortUrl` now parses each `Location`, rejects private/link-local/loopback IPs + non-http(s) schemes via `src/utils/url-safety.ts`, caps hops at 3
- M-d: Pinterest destination URL validated through `new URL()` + `isSafePublicUrl` before follow
- M-c: `src/utils/log-redact.ts` — `redactUrl()` and `redactError()` used in `instagram-scraper.ts`, `recipe-extractor.ts`, `post-fetcher.ts`, `web-recipe-fetcher.ts`

**Commit 2 — AI boundary hardening**
- S3 + A3: Zod schemas (`RecipeResponseSchema`, `CleanupResponseSchema`) validate Claude's JSON in `src/services/recipe-parser-ai.ts`; user-supplied caption wrapped in `<user_caption>…</user_caption>` delimiters; `sanitizeForPrompt()` strips control chars and injected closing tags
- A2: `cleanupRecipeExtraction` catch now classifies Anthropic errors (AuthN / RateLimit / Connection / Timeout) and logs `console.warn` with `redactError`; unknown errors hit `console.error`
- M-a: HTML input capped at 200 KB in `src/services/web-recipe-fetcher.ts` before JSON-LD regex runs; regex is anchored
- M-b: `src/services/recipe-parser.ts` `extractUrlsFromCaption` switched from host-blocklist to allowlist of known recipe domains

**Commit 3 — Store correctness & races**
- A1: `src/stores/filter-store.ts` wrapped in `persist(...)` with `zustandMMKVStorage` — search + filters now survive cold start
- A4: `addRecipe` in `src/stores/recipe-store.ts` tracks in-flight saves by `sourceUrl` via a `Set`; Save button disabled while saving in `add-recipe.tsx`
- A6: `src/services/grocery-service.ts` uses `generateId()` from `src/utils/uuid.ts` for per-ingredient IDs
- A7: grocery check-state key aggressively normalized (collapse whitespace, strip punctuation, canonicalize fractions)
- A5: `src/utils/image-cache.ts` switched to `Promise.allSettled`, batches in 50; `app/_layout.tsx` startup sweep awaits with explicit `.catch(log)`
- M-e: `scaleIngredients` / `scaleIngredientText` / `scaleTime` reject `factor <= 0` or `!isFinite`

**Commit 4 — Env discipline**
- A8: `src/utils/env.ts` — single source for `CLAUDE_API_KEY`, `RAPIDAPI_KEY`, `FACEBOOK_APP_ID`, `FACEBOOK_CLIENT_TOKEN`; console-warns in `__DEV__` when keys are missing; removed inline `process.env` reads from `app/recipe/[id].tsx` and `src/services/recipe-extractor.ts`

**Commit 5 — Accessibility & UX**
- A9: `SafeAreaView` from `react-native-safe-area-context` wraps all tab screens, `add-recipe`, `onboarding`, `collection/[id]`, `recipe/edit/[id]`
- A10: `accessibilityRole` / `accessibilityLabel` / `accessibilityHint` / `accessibilityState` added across all `Pressable`s, filter pills, FAB, scale toggles, favorite heart; `accessibilityLiveRegion="polite"` on error text
- L-a: `Keyboard.dismiss()` in `add-recipe.tsx` + `recipe/edit/[id].tsx` `handleSave`
- L-b: `keyboardShouldPersistTaps="handled"` on `ScrollView`s with touchables

**Commit 6 — Performance & UI polish**
- M-f: `app/(tabs)/index.tsx` null-padding grid hack removed; `columnWrapperStyle={{ justifyContent: "flex-start" }}` with `numColumns={2}`
- M-g: FlatList perf props (`removeClippedSubviews`, `initialNumToRender`, `maxToRenderPerBatch`, `windowSize`) on recipes + collections lists
- M-j: `app/recipe/[id].tsx` `Modal` lifted out of `ScrollView` via Fragment wrapper
- M-k: `RecipeCard` blurhash placeholder removed; uses `colors.surfaceAlt` background
- L-c: extracted `src/components/PillButton.tsx`; filter-pill arrays centralized in `src/utils/constants.ts`
- L-d: `src/components/SkeletonRecipeGrid.tsx` shown on home until MMKV hydrates (`useRecipeStore.persist.hasHydrated()` + `onFinishHydration` listener)
- L-e: filter modal backdrop uses `bg-black/40` dim
- M-h (partial): `src/utils/colors.ts` token file added; per-className dark-mode migration deferred to future commit (see backlog)

**Commit 7 — Testing infrastructure (M-i)**
- `jest.config.js` + `jest.setup.ts` (mocks for `expo-secure-store`, `expo-crypto`, `react-native-mmkv` with `MockMMKV`, `expo-file-system/legacy`)
- Pure-function tests: `src/utils/__tests__/{scale-recipe,uuid,fetch-with-timeout,url-safety}.test.ts`
- AI boundary tests: `src/services/__tests__/recipe-parser-ai.test.ts` (mocked Anthropic SDK — happy path, malformed JSON, schema mismatch, classified errors, prompt-injection defense)
- Integration test: `src/services/__tests__/recipe-extractor.test.ts` (tier 0/1/2/fallback + error surfacing)
- Component test: `src/components/__tests__/RecipeCard.test.tsx`
- Scripts: `npm test`, `npm run test:watch`, `npm run test:coverage`
- **101 tests passing**, typecheck clean
