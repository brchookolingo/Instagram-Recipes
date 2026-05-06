# ReciGrams — Outstanding Tasks

Tasks split by whether they can be completed autonomously by an AI agent on a loop, or whether they require a user decision/credential/external action first.

When working a task: pick from **AI-Autonomous**, complete it end-to-end (code + typecheck + tests), then move it into the "Completed Work" section at the bottom of this file and remove it from the outstanding section above.

---

## Task format

Every outstanding task uses this shape so an agent (or a human) can pick it up cold:

- **Status:** new / in-progress / partial / blocked
- **Estimate:** target ≤30 min of focused work
- **Scope:** one paragraph — what's in, what's out
- **Acceptance:** bulleted, verifiable conditions
- **Suggested approach:** entry point or first step
- **Output / Files:** files touched, or path of the deliverable doc

Research-only tasks deliver a markdown file under `docs/research/`. Code tasks must leave typecheck + tests green.

---

## ✅ AI-Autonomous (safe to run on a loop)

These have a clear scope, no external accounts/secrets, and no irreversible decisions. An agent can complete them without user input. **Do not buy anything, register paid accounts, or enter payment info — flag any cost in the deliverable and stop.**

### M-h — Dark mode className migration
- **Status:** partial; tokens already exist in `src/utils/colors.ts`
- **Estimate:** 30 min per screen batch (split across multiple sessions)
- **Scope:** add `dark:` variants across ~30 `className` sites, keyed off `useColorScheme()`. One session = one screen or one component cluster, not the full repo.
- **Acceptance:**
  - Every touched screen/component renders correctly in both light and dark mode
  - No hardcoded hex/rgb in touched `className`s where a token exists
  - Typecheck + existing test suite still pass
- **Suggested approach:** grep for `bg-`, `text-`, `border-` color classes within the chosen screen; add `dark:` companion for each using the token mapping. Manually verify after.
- **Output / Files:** `app/**/*.tsx`, `src/components/**/*.tsx`

### FS1 — Audit which root-level files are tool-required vs movable
- **Status:** new
- **Estimate:** ≤30 min
- **Scope:** for every file currently sitting at the repo root (`app.json`, `babel.config.js`, `eas.json`, `global.css`, `jest.config.js`, `jest.setup.ts`, `metro.config.js`, `nativewind-env.d.ts`, `tailwind.config.js`, `tsconfig.json`, `.env`, `.env.example`, `package.json`, `package-lock.json`, `CLAUDE.md`, `README.md`, `TASKS.md`), determine whether the tool that consumes it requires the file at root or supports a custom path.
- **Acceptance:**
  - `docs/research/folder-structure-audit.md` exists with a table: file | required-at-root? | source (link to tool docs) | proposed location if movable
  - Recommends a target structure (e.g. `config/` for movable configs) without making changes
- **Suggested approach:** check Expo, Metro, Babel, Jest, Tailwind, NativeWind, TypeScript docs for each. Many (Expo `app.json`, `package.json`, `tsconfig.json`) are pinned to root; some (`jest.setup.ts`) are freely relocatable.
- **Output / Files:** `docs/research/folder-structure-audit.md`

### FS2 — Add `.DS_Store` to `.gitignore` and untrack any tracked copies
- **Status:** new
- **Estimate:** 5 min
- **Scope:** ensure macOS Finder metadata is never committed.
- **Acceptance:**
  - `.gitignore` contains `.DS_Store` (and a recursive pattern if not already)
  - `git ls-files | grep DS_Store` returns nothing
  - Working tree clean after commit
- **Suggested approach:** append the pattern, then `git rm --cached` any tracked instances.
- **Output / Files:** `.gitignore`

### FS3 — Move freely-relocatable configs into a `config/` directory
- **Status:** blocked-on FS1
- **Estimate:** ≤30 min
- **Scope:** based on the FS1 audit, move only the configs that tooling supports relocating (likely `jest.setup.ts`, possibly `babel.config.js` with caveats). Update the consuming config to point at the new path.
- **Acceptance:**
  - `npm test` still passes
  - `npx tsc --noEmit` clean
  - Expo dev server starts without warnings about missing configs
- **Suggested approach:** move one file at a time, run tests after each move, revert if a tool complains.
- **Output / Files:** `config/`, `jest.config.js`, any other consumer configs

### FS4 — Audit `docs/` directory and propose consolidation
- **Status:** new
- **Estimate:** 10 min
- **Scope:** `docs/` currently holds `privacy-policy.html`. Decide whether new research docs go in `docs/research/` (recommended) and document the convention in `docs/README.md`.
- **Acceptance:**
  - `docs/README.md` exists describing what lives where
  - Convention referenced from `CLAUDE.md` Tasks section
- **Suggested approach:** straight write — no code changes.
- **Output / Files:** `docs/README.md`, `CLAUDE.md`

### R1 — Identify direct competitors to ReciGrams
- **Status:** new
- **Estimate:** ≤30 min
- **Scope:** find apps that let users save recipes from Instagram / TikTok / Pinterest / web links, with a focus on AI extraction. Capture 8–12 candidates.
- **Acceptance:**
  - `docs/research/competitors.md` lists each app with: name, platforms (iOS / Android / web), one-line value prop, primary input source (IG link / camera / web), AI-powered yes/no, link to App Store / Play Store / website
  - Includes both indie apps and well-funded ones
- **Suggested approach:** search App Store, Play Store, Product Hunt, Reddit r/recipes / r/MealPrepSunday for "save Instagram recipe" type queries. Use WebSearch / WebFetch.
- **Output / Files:** `docs/research/competitors.md`

### R2 — Build a competitor feature comparison matrix
- **Status:** blocked-on R1
- **Estimate:** ≤30 min
- **Scope:** for the apps from R1, fill a matrix on features that overlap with ReciGrams: IG / TikTok / Pinterest support, AI extraction, scaling, grocery list, collections, offline storage, dark mode, sharing/export.
- **Acceptance:**
  - `docs/research/competitor-features.md` with a markdown table
  - Short "where ReciGrams stands out / lags" paragraph at the bottom
- **Suggested approach:** read each app's listing + a few screenshots; do not install paid apps. If unclear, mark `?`.
- **Output / Files:** `docs/research/competitor-features.md`

### R3 — Survey competitor pricing and monetization models
- **Status:** blocked-on R1
- **Estimate:** ≤30 min
- **Scope:** for each app from R1, record monetization model (free, freemium, one-time, subscription, ads, BYOK), price points, and what's gated behind paid tiers.
- **Acceptance:**
  - `docs/research/competitor-pricing.md` with a table and a short summary of common patterns
- **Suggested approach:** App Store / Play Store pricing pages + each app's website. Do not subscribe to anything.
- **Output / Files:** `docs/research/competitor-pricing.md`

### P1 — Compute variable cost per new recipe
- **Status:** new
- **Estimate:** ≤30 min
- **Scope:** quantify what one new recipe extraction costs us. Inputs: average input/output token count for `parseRecipeWithAI` + `cleanupRecipeExtraction` against `claude-sonnet-4-5` published pricing; RapidAPI Instagram scraper per-call cost; Facebook oEmbed (free); TikTok/Pinterest oEmbed (free).
- **Acceptance:**
  - `docs/research/unit-economics.md` lists per-tier cost (Tier 0 / 1 / 2 / fallback) with token estimates from real prompts in `src/services/recipe-parser-ai.ts`
  - States expected $/recipe at p50 and p95
  - Notes which numbers are estimated vs measured
- **Suggested approach:** read the prompts in `recipe-parser-ai.ts`, estimate tokens with `tiktoken`-style heuristics or document assumptions. Pull current Anthropic + RapidAPI pricing from their public pages. Do not sign up for paid tiers.
- **Output / Files:** `docs/research/unit-economics.md`

### P2 — Draft 2–3 candidate pricing structures with break-even math
- **Status:** blocked-on P1, R3
- **Estimate:** ≤30 min
- **Scope:** propose at least three pricing structures (e.g. freemium with quota, BYOK + one-time unlock, monthly sub, lifetime). For each, show break-even on per-recipe cost from P1 plus App Store / Play Store cuts (15–30%).
- **Acceptance:**
  - `docs/research/pricing-options.md` with one section per option: target user, price, what's gated, monthly margin per active user under stated assumptions, risks
  - Recommendation paragraph at the end (not a final decision — that goes in PRICING1)
- **Suggested approach:** keep math explicit; cite P1's numbers.
- **Output / Files:** `docs/research/pricing-options.md`

### AND1 — Document the local Android test path
- **Status:** new
- **Estimate:** ≤30 min
- **Scope:** write up the steps to run ReciGrams on Android using the existing Expo setup, on both an emulator and a physical device, without paying for anything. Cover Android Studio install (free), AVD setup, Expo Go vs dev client, and `npx expo run:android`.
- **Acceptance:**
  - `docs/research/android-testing.md` covers: prerequisites, emulator path, physical device path, common gotchas (e.g. `EXPO_PUBLIC_*` env, MMKV native module needs dev client not Expo Go)
  - Notes any features that are likely to behave differently on Android (clipboard listener, `Linking`, secure-store, share-sheet intents)
- **Suggested approach:** check current `app.json` + `android/` config; cross-reference Expo + React Native docs.
- **Output / Files:** `docs/research/android-testing.md`

### AND2 — Document Play Store publishing requirements (no purchase)
- **Status:** new
- **Estimate:** ≤30 min
- **Scope:** survey what's required to publish on Google Play: developer account fee, app signing, target SDK, privacy policy URL, data-safety form, content rating, store listing assets, internal/closed/open testing tracks. Surface the **one-time $25 Google Play Console registration fee** prominently as a blocker — do not pay.
- **Acceptance:**
  - `docs/research/play-store-publishing.md` lists every requirement with a status (✅ have it / ⚠️ partial / ❌ missing) against our current state
  - Calls out costs (the $25 fee, plus anything else) under a "Costs (do not pay yet)" heading
  - Lists ReciGrams-specific risks: Instagram ToS scraping question, AI-generated content disclosure, user-generated content category
- **Suggested approach:** Play Console policy docs + Expo's "Submit to Google Play" guide.
- **Output / Files:** `docs/research/play-store-publishing.md`

### AND3 — Document EAS build + internal-distribution path for Android
- **Status:** blocked-on AND1
- **Estimate:** ≤30 min
- **Scope:** describe how to produce a shareable Android build via EAS without uploading to Play Store yet (internal distribution APK / AAB), so testers can install before the Play Console fee is paid.
- **Acceptance:**
  - `docs/research/android-internal-build.md` covers: `eas build --platform android --profile preview`, free-tier build limits, install-on-device steps, signing-key persistence
  - Flags any EAS paid tier limits that would force a purchase
- **Suggested approach:** consult `eas.json` + Expo EAS Build docs.
- **Output / Files:** `docs/research/android-internal-build.md`

### VID1 — Survey AI tools for producing app walkthrough videos
- **Status:** new
- **Estimate:** ≤30 min
- **Scope:** identify candidate tools for replacing the static onboarding slides with short demo videos. Cover at minimum: screen-recording-first tools with AI polish (Screen Studio, Tella, Arcade, Descript), AI avatar/voiceover tools (Synthesia, HeyGen, ElevenLabs), and full text-to-video models (Runway, Sora, Veo, Pika).
- **Acceptance:**
  - `docs/research/onboarding-video-tools.md` with one row per tool: input style (screen recording / prompt / avatar), output quality bracket, free-tier capability, watermark on free tier yes/no, paid tier cost, fit for "show app screens with voiceover" use case
  - Does **not** sign up for any tool
  - Concludes with a short shortlist (3 tools) for the user to pick from
- **Suggested approach:** WebFetch each tool's pricing page + a quick scan of recent reviews.
- **Output / Files:** `docs/research/onboarding-video-tools.md`

### VID2 — Recommend a capture-and-edit pipeline for the onboarding videos
- **Status:** blocked-on VID1
- **Estimate:** ≤30 min
- **Scope:** based on VID1's shortlist, propose an end-to-end pipeline (capture → edit → voiceover → export) that produces 4 short clips matching the existing 4 onboarding slides. Constrain to free-tier-only where possible; flag any paid step.
- **Acceptance:**
  - `docs/research/onboarding-video-pipeline.md` describes step-by-step pipeline with named tools
  - Lists target clip lengths, aspect ratio (portrait for in-app), file format, and where the clips would live (`assets/onboarding/`)
  - "Costs (do not pay yet)" section at the bottom
- **Suggested approach:** straight write-up; no execution.
- **Output / Files:** `docs/research/onboarding-video-pipeline.md`

---

## 🚧 Needs User Input / Decision

These are blocked on a human choice, an external account, a purchase, or a destructive/irreversible step. An AI loop should **skip** these.

### C1 — Move API keys off the client (CRITICAL)
- **Status:** blocked
- **Estimate:** decision: 5 min; implementation: 1–2 sessions after decision
- **Scope:** API keys currently ship in the client bundle. Two architectures on the table:
  1. **Backend proxy** — Expo API route or edge function holding `CLAUDE_API_KEY` + `RAPIDAPI_KEY`; client uses a session token. Requires hosting decision + deploy credentials.
  2. **BYOK** — Settings screen where the user pastes their own keys; stored in `expo-secure-store`. No backend.
- **Acceptance (decision):** user picks an option and, if (1), a hosting target + deploy owner; if (2), first-run UX (block vs graceful degrade).
- **Suggested approach:** option 2 is fully AI-implementable post-decision. Option 1 needs whoever owns the hosting account.
- **Output / Files:** `src/utils/env.ts`, `src/services/instagram-scraper.ts`, `src/services/recipe-extractor.ts`

### PRICING1 — Pick a pricing model
- **Status:** blocked-on P2
- **Estimate:** 10 min decision; implementation tracked separately
- **Scope:** review `docs/research/pricing-options.md`, pick one, and capture the call (price point, what's free, what's gated) so an agent can implement the gating UI.
- **Acceptance:** decision recorded as a new task `PRICING2 — Implement chosen pricing model` with concrete scope.
- **Suggested approach:** read P2 + R3, weigh against C1's chosen architecture (BYOK changes the model significantly).
- **Output / Files:** updated `TASKS.md` entry for `PRICING2`

### AND-PUBLISH — Pay the Google Play Console $25 fee and create the developer account
- **Status:** blocked
- **Estimate:** 30 min once committed
- **Scope:** one-time $25 USD payment to Google to register a Play Console developer account; identity verification; team setup. Strictly a user action.
- **Acceptance:** developer account exists; verified; ready to receive an EAS-submitted build.
- **Suggested approach:** only do this once AND2 has been read and the listing assets are close to ready.
- **Output / Files:** none in repo

### VID-PICK — Pick the AI video tool from the VID1 shortlist
- **Status:** blocked-on VID1
- **Estimate:** 10 min
- **Scope:** user reads `docs/research/onboarding-video-tools.md` and picks the tool. Sign-ups, paid plans, and credential storage are all the user's call.
- **Acceptance:** decision captured as a follow-up task `VID3 — Produce 4 onboarding clips using <chosen tool>`.
- **Suggested approach:** prefer free-tier or no-watermark options if available.
- **Output / Files:** updated `TASKS.md`

---

## 🗄️ Skipped / Deferred (do not action)

- **L9** — MMKV schema migration strategy. Skipped by user: too complex for a personal app at this stage. Leave alone unless user re-opens.

---

## Completed Work

### Task hygiene
- DOC1: verified every outstanding task in `TASKS.md` carries all six format fields (Status / Estimate / Scope / Acceptance / Suggested approach / Output / Files) in consistent order; no rewrites needed since entries were authored in the format.

### Code Cleanup
- Removed `App.tsx`, `index.ts` (legacy entry points superseded by expo-router)
- Removed `src/services/video-extractor.ts` (implemented but never wired up)
- Removed `getCachedImageUri`, `getCachedImageUriAsync` from `image-cache.ts` (unused exports)
- Removed `APP_NAME` from `constants.ts` (unused)
- Unexported `isInstagramUrl` in `useClipboard.ts` (internal only)
- Removed `coverImageUri` from `Board` type (never set or read)
- Deleted dev artifacts: `IMPLEMENTATION_PLAN.md`, `SCHEDULER_PROMPT.md`, `TASKS.json`

### Multi-Platform Support
- Added `src/types/post.ts` with shared `RawPost` type
- Added `src/services/tiktok.ts` (TikTok oEmbed, `vt.tiktok.com` short links)
- Added `src/services/pinterest.ts` (Pinterest oEmbed + schema.org JSON-LD web scraping)
- Added `src/services/post-fetcher.ts` (platform router with `detectPlatform`, `normalizePinterestUrl`)
- Added `src/services/web-recipe-fetcher.ts` (schema.org JSON-LD parser + page text fallback)
- Updated `useClipboard.ts` to detect all 3 platforms
- Updated `add-recipe.tsx` with Tier 0 (pre-extracted recipe data bypass)
- Updated `recipe-parser-ai.ts` prompt to be platform-agnostic
- Updated `URLInput.tsx` placeholder and `recipe/[id].tsx` "View Original Post" link

### Cache, Type & Code Quality
- Enforced 200 MB image cache limit in `src/utils/image-cache.ts` via `enforceCacheLimit()`; added startup orphan sweep in `app/_layout.tsx` (M3)
- Added `id?: string` to `Ingredient` type; all parse paths assign `generateId()`; `IngredientList` keys on stable id with index fallback for legacy data (M4)
- Moved `LOADING_THEMES` from `app/add-recipe.tsx` to `src/utils/constants.ts` (L10)
- Removed dead `"video"` member from `extractionSource` union in `src/types/recipe.ts` (L12)
- Switched all Claude API calls from `claude-opus-4-6` to `claude-sonnet-4-5` in `src/utils/constants.ts`

### Stability, Performance & UX
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

### Error Handling
- Replaced all silent `catch { return null }` blocks with typed `ParseResult<T>` pattern (C2)
- `parseRecipeWithAI` classifies Anthropic errors: 401 → `INVALID_API_KEY`, 429 → `RATE_LIMITED`, network → `NETWORK_ERROR`
- `extractRecipeFromPost` returns `ParseResult<ExtractionResult>` — surfaces critical AI errors to UI if all tiers fail
- `add-recipe.tsx` shows specific error messages for `INVALID_API_KEY`, `RATE_LIMITED`, `NETWORK_ERROR`; proceeds to manual preview for `PARSE_FAILED`
- Post-fetching services (`instagram-oembed`, `tiktok`, `pinterest`, `web-recipe-fetcher`) no longer swallow network/timeout errors; 429 responses thrown explicitly and classified by `post-fetcher.ts`
- `ParseErrorCode` and `ParseResult<T>` added to `src/types/result.ts`

### Features & UX
- Full-text search extended to match description, tags, and ingredient text in addition to title and author (L6)
- Onboarding flow added (`app/onboarding.tsx`) — 4-slide pager shown on first launch; MMKV-backed `hasSeenOnboarding()` / `markOnboardingSeen()` in `src/utils/onboarding.ts`; `app/_layout.tsx` redirects to `/onboarding` on first launch; Settings "How to Use" row reopens onboarding in review mode (F1)
- "Send Feedback" row added to Settings — opens Google Form via `Linking.openURL()` (F2)
- Renamed "Boards" → "Collections" throughout UI: `boards.tsx` → `collections.tsx`, `board/[id].tsx` → `collection/[id].tsx`, tab label/title updated, all nav routes updated; internal store/MMKV keys unchanged to preserve persisted data (F3)
- Replaced `ActivityIndicator` loading state in `add-recipe.tsx` with animated `CookingSpinner` component (`src/components/CookingSpinner.tsx`) using react-native-reanimated rotating 🍳 emoji (F4)
- Storage stats section added to Settings — shows recipe count and image cache size in MB using `expo-file-system/legacy` (F5)
- Removed "Lactose Free" from dietary filter pills; added Meal Type section (Salad, Appetizer, Dessert, Main, Soup); `filterMealType` added to `filter-store.ts`; removed "lactose free" from Claude system prompt (F6)
- "Add to Grocery List" uses currently selected scale (½×/1×/2×) — `scaledIngredients` passed to `addRecipeIngredients` (F7)
- `updateRecipe()` in `recipe-store.ts` regenerates `ingredientsHalf` and `ingredientsDouble` via `scaleIngredients()` whenever `ingredients` is updated (F8)

### Opus 4.7 deep-audit fixes

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
