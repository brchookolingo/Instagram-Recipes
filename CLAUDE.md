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

- [ ] **M3 — Enforce image cache size limit and clean up orphans**
  `deleteCachedImage(id)` is already called on recipe delete, but there's no maximum cache size and no cleanup for orphaned image files (e.g. left behind if a crash prevents the delete path from running). Add a 200 MB cap enforced on write and a startup sweep that removes files with no matching recipe.
  _File: src/utils/image-cache.ts_

- [ ] **M4 — Replace index-based keys in `IngredientList`**
  `IngredientList.tsx` uses `` key={`${index}-${ingredient.text}`} ``, which causes incorrect re-renders when ingredients are reordered or deleted. Add a stable `id` field to the `Ingredient` type (assigned at parse time) and key on that. `InstructionList` already keys on `stepNumber` and is fine.
  _Files: src/components/IngredientList.tsx, src/types/recipe.ts_

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
