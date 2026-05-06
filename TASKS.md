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

Each entry uses the shape: **Summary** (one line), **Shipped** (commit hash or `pre-loop` for work predating the task loop), **Files** (key paths). Synthetic IDs prefixed `CC*`, `MP*`, `EH*`, `MODEL*`, `SCALE*`, `TEST*` were assigned to entries that lacked an original ID.

### Task hygiene

#### DOC1 — Normalize outstanding TASKS.md entries to the task format
- **Summary:** verified every outstanding task in `TASKS.md` carries all six format fields (Status / Estimate / Scope / Acceptance / Suggested approach / Output / Files) in consistent order; no rewrites needed since entries were authored in the format.
- **Shipped:** c78266c
- **Files:** `TASKS.md`

#### DOC2 — Normalize the Completed Work section
- **Summary:** rewrote every completed-work entry to the three-field shape (Summary / Shipped / Files); preserved existing IDs, assigned synthetic IDs (CC*, MP*, EH*, MODEL*, SCALE*, TEST*) to legacy bullets that lacked them; flattened the per-Commit groupings under "Opus 4.7 deep-audit fixes" — commit refs now live in each entry's Shipped field.
- **Shipped:** this loop tick
- **Files:** `TASKS.md`

### Code Cleanup

#### CC1 — Remove legacy entry points
- **Summary:** deleted `App.tsx` and `index.ts`; expo-router supersedes them.
- **Shipped:** pre-loop
- **Files:** `App.tsx`, `index.ts`

#### CC2 — Remove unused video-extractor service
- **Summary:** deleted `src/services/video-extractor.ts` — implemented but never wired up.
- **Shipped:** pre-loop
- **Files:** `src/services/video-extractor.ts`

#### CC3 — Remove unused image-cache exports
- **Summary:** dropped `getCachedImageUri` and `getCachedImageUriAsync` from `image-cache.ts` (unused).
- **Shipped:** pre-loop
- **Files:** `src/utils/image-cache.ts`

#### CC4 — Remove unused APP_NAME constant
- **Summary:** dropped `APP_NAME` from `constants.ts` (unused).
- **Shipped:** pre-loop
- **Files:** `src/utils/constants.ts`

#### CC5 — Unexport internal `isInstagramUrl`
- **Summary:** made `isInstagramUrl` in `useClipboard.ts` module-internal.
- **Shipped:** pre-loop
- **Files:** `src/hooks/useClipboard.ts`

#### CC6 — Remove unused `coverImageUri` from Board type
- **Summary:** dropped `coverImageUri` field — never set or read.
- **Shipped:** pre-loop
- **Files:** `src/types/board.ts`

#### CC7 — Delete dev artifacts
- **Summary:** removed `IMPLEMENTATION_PLAN.md`, `SCHEDULER_PROMPT.md`, `TASKS.json`.
- **Shipped:** pre-loop
- **Files:** repo root

### Multi-Platform Support

#### MP1 — Add shared RawPost type
- **Summary:** introduced shared `RawPost` shape used by all platform fetchers.
- **Shipped:** pre-loop
- **Files:** `src/types/post.ts`

#### MP2 — Add TikTok service
- **Summary:** TikTok oEmbed integration plus `vt.tiktok.com` short-link resolution.
- **Shipped:** pre-loop
- **Files:** `src/services/tiktok.ts`

#### MP3 — Add Pinterest service
- **Summary:** Pinterest oEmbed plus schema.org JSON-LD web scraping fallback.
- **Shipped:** pre-loop
- **Files:** `src/services/pinterest.ts`

#### MP4 — Add post-fetcher router
- **Summary:** central router with `detectPlatform` and `normalizePinterestUrl`.
- **Shipped:** pre-loop
- **Files:** `src/services/post-fetcher.ts`

#### MP5 — Add web-recipe-fetcher
- **Summary:** schema.org JSON-LD parser plus page-text fallback for arbitrary recipe URLs.
- **Shipped:** c334155
- **Files:** `src/services/web-recipe-fetcher.ts`

#### MP6 — Detect all 3 platforms in useClipboard
- **Summary:** clipboard listener now recognizes Instagram, TikTok, and Pinterest URLs.
- **Shipped:** pre-loop
- **Files:** `src/hooks/useClipboard.ts`

#### MP7 — Tier 0 pre-extracted recipe bypass
- **Summary:** `add-recipe.tsx` skips AI extraction when a structured recipe is already present.
- **Shipped:** pre-loop
- **Files:** `app/add-recipe.tsx`

#### MP8 — Platform-agnostic AI parser prompt
- **Summary:** rewrote the parser prompt so it does not assume Instagram captions.
- **Shipped:** pre-loop
- **Files:** `src/services/recipe-parser-ai.ts`

#### MP9 — URLInput placeholder + recipe view-original link updates
- **Summary:** placeholder copy and "View Original Post" link generalized across platforms.
- **Shipped:** pre-loop
- **Files:** `src/components/URLInput.tsx`, `app/recipe/[id].tsx`

### Cache, Type & Code Quality

#### M3 — Image cache 200 MB ceiling + orphan sweep
- **Summary:** `enforceCacheLimit()` in `image-cache.ts`; startup orphan sweep runs from `_layout.tsx`.
- **Shipped:** pre-loop
- **Files:** `src/utils/image-cache.ts`, `app/_layout.tsx`

#### M4 — Stable IDs on Ingredient
- **Summary:** added `id?: string` to `Ingredient`; all parse paths assign `generateId()`; `IngredientList` keys on stable id with index fallback for legacy data.
- **Shipped:** pre-loop
- **Files:** `src/types/recipe.ts`, `src/components/IngredientList.tsx`

#### L10 — Move LOADING_THEMES to constants
- **Summary:** relocated `LOADING_THEMES` from `add-recipe.tsx` to the shared constants file.
- **Shipped:** pre-loop
- **Files:** `app/add-recipe.tsx`, `src/utils/constants.ts`

#### L12 — Drop dead `"video"` extractionSource member
- **Summary:** removed the unused `"video"` variant from the union.
- **Shipped:** pre-loop
- **Files:** `src/types/recipe.ts`

#### MODEL1 — Switch Claude calls to claude-sonnet-4-5
- **Summary:** all Anthropic API calls now target `claude-sonnet-4-5` (was `claude-opus-4-6`).
- **Shipped:** pre-loop
- **Files:** `src/utils/constants.ts`

### Stability, Performance & UX

#### C3 — Universal fetch timeout wrapper
- **Summary:** `fetch-with-timeout.ts` (AbortController + 10s default) used by every network service.
- **Shipped:** pre-loop
- **Files:** `src/utils/fetch-with-timeout.ts`

#### H1 — Fix image-cache race in addRecipe
- **Summary:** image is now cached before persist so reload never sees a missing file.
- **Shipped:** pre-loop
- **Files:** `src/stores/recipe-store.ts`

#### H2 — Extract tier-fallback logic
- **Summary:** moved tier orchestration into `recipe-extractor.ts`; `handleFetch` is UI-only.
- **Shipped:** pre-loop
- **Files:** `src/services/recipe-extractor.ts`, `app/add-recipe.tsx`

#### H3 — clearAll across stores
- **Summary:** added `clearAll()` to recipe / board / grocery stores; Settings "Clear all" calls all three.
- **Shipped:** pre-loop
- **Files:** `src/stores/recipe-store.ts`, `src/stores/board-store.ts`, `src/stores/grocery-store.ts`, `app/(tabs)/settings.tsx`

#### H4 — Minimum recipe save validation
- **Summary:** save handler requires a title plus at least one ingredient or instruction.
- **Shipped:** pre-loop
- **Files:** `app/add-recipe.tsx`

#### H5 — filter-store added
- **Summary:** centralized search + filter state. Persistence was added later (see A1).
- **Shipped:** pre-loop
- **Files:** `src/stores/filter-store.ts`

#### H6 — Retry with exponential backoff
- **Summary:** `retry.ts` uses exponential backoff and short-circuits on 4xx.
- **Shipped:** pre-loop
- **Files:** `src/utils/retry.ts`

#### M1 — Memoize list cards
- **Summary:** wrapped `RecipeCard` and `BoardCard` in `React.memo`.
- **Shipped:** 0df3625
- **Files:** `src/components/RecipeCard.tsx`, `src/components/BoardCard.tsx`

#### M2 — Debounced search
- **Summary:** added `useDebounce` hook; recipes-tab search debounced at 300ms.
- **Shipped:** pre-loop
- **Files:** `src/hooks/useDebounce.ts`, `app/(tabs)/index.tsx`

#### M5 — generateId helper
- **Summary:** `uuid.ts` `generateId()`; used for recipe and grocery IDs.
- **Shipped:** pre-loop
- **Files:** `src/utils/uuid.ts`

#### M6 — Duplicate-recipe prompt
- **Summary:** `add-recipe.tsx` checks `findBySourceUrl` before saving and prompts on duplicate.
- **Shipped:** pre-loop
- **Files:** `app/add-recipe.tsx`, `src/stores/recipe-store.ts`

#### M7 — Discriminated RawPost union
- **Summary:** `RawPost` is now `InstagramPost | TikTokPost | PinterestPost`, discriminated on `platform`.
- **Shipped:** pre-loop
- **Files:** `src/types/post.ts`

#### M8 — Inline URL validation
- **Summary:** `URLInput.tsx` validates URL format and supported platform inline before submit.
- **Shipped:** pre-loop
- **Files:** `src/components/URLInput.tsx`

#### SCALE1 — Recipe scaling (½× / 1× / 2×)
- **Summary:** half-and-double scaling computed at parse time; toggle on the recipe screen.
- **Shipped:** pre-loop
- **Files:** `src/utils/scale-recipe.ts`, `app/recipe/[id].tsx`

### Error Handling

#### C2 — Typed ParseResult pattern
- **Summary:** replaced silent `catch { return null }` blocks with typed `ParseResult<T>`.
- **Shipped:** ab2e195
- **Files:** `src/services/*.ts`, `src/types/result.ts`

#### EH1 — Classified Anthropic errors in parseRecipeWithAI
- **Summary:** 401 → `INVALID_API_KEY`, 429 → `RATE_LIMITED`, network → `NETWORK_ERROR`.
- **Shipped:** ab2e195
- **Files:** `src/services/recipe-parser-ai.ts`

#### EH2 — extractRecipeFromPost returns ParseResult
- **Summary:** surfaces critical AI errors to the UI when every tier fails.
- **Shipped:** ab2e195
- **Files:** `src/services/recipe-extractor.ts`

#### EH3 — UI error mapping
- **Summary:** `add-recipe.tsx` shows specific messages for `INVALID_API_KEY`, `RATE_LIMITED`, `NETWORK_ERROR`; falls through to manual preview on `PARSE_FAILED`.
- **Shipped:** ab2e195
- **Files:** `app/add-recipe.tsx`

#### EH4 — Post-fetchers no longer swallow errors
- **Summary:** Instagram / TikTok / Pinterest / web fetchers raise on network and timeout failures; 429 thrown explicitly and classified by `post-fetcher.ts`.
- **Shipped:** ab2e195
- **Files:** `src/services/instagram-oembed.ts`, `src/services/tiktok.ts`, `src/services/pinterest.ts`, `src/services/web-recipe-fetcher.ts`, `src/services/post-fetcher.ts`

#### EH5 — Result types
- **Summary:** added `ParseErrorCode` and `ParseResult<T>` to the shared types module.
- **Shipped:** ab2e195
- **Files:** `src/types/result.ts`

### Features & UX

#### L6 — Full-text search across recipe fields
- **Summary:** search now matches description, tags, and ingredient text in addition to title and author.
- **Shipped:** 5e2dc12
- **Files:** `app/(tabs)/index.tsx`, `src/stores/filter-store.ts`

#### F1 — Onboarding flow
- **Summary:** 4-slide pager on first launch; MMKV-backed `hasSeenOnboarding()` / `markOnboardingSeen()`; `_layout.tsx` redirects to `/onboarding` on first launch; Settings "How to Use" reopens it in review mode.
- **Shipped:** 5e2dc12
- **Files:** `app/onboarding.tsx`, `src/utils/onboarding.ts`, `app/_layout.tsx`, `app/(tabs)/settings.tsx`

#### F2 — Send Feedback row
- **Summary:** Settings row opens the Google Form via `Linking.openURL()`.
- **Shipped:** 5e2dc12
- **Files:** `app/(tabs)/settings.tsx`

#### F3 — Boards → Collections rename
- **Summary:** UI-only rename across files, tab label, and routes; internal store and MMKV keys preserved so persisted data still loads.
- **Shipped:** 5e2dc12
- **Files:** `app/(tabs)/collections.tsx`, `app/collection/[id].tsx`, plus all referring routes

#### F4 — CookingSpinner loading component
- **Summary:** replaced `ActivityIndicator` in `add-recipe.tsx` with a reanimated rotating 🍳 emoji.
- **Shipped:** 5e2dc12
- **Files:** `src/components/CookingSpinner.tsx`, `app/add-recipe.tsx`

#### F5 — Storage stats in Settings
- **Summary:** shows recipe count and image cache size in MB via `expo-file-system/legacy`.
- **Shipped:** 5e2dc12
- **Files:** `app/(tabs)/settings.tsx`

#### F6 — Filter pill rebalance + Meal Type
- **Summary:** removed "Lactose Free" pill; added Meal Type section (Salad / Appetizer / Dessert / Main / Soup); `filterMealType` added to filter store; "lactose free" removed from the Claude system prompt.
- **Shipped:** 5e2dc12
- **Files:** `src/utils/constants.ts`, `src/stores/filter-store.ts`, `src/services/recipe-parser-ai.ts`

#### F7 — Grocery list respects scale
- **Summary:** "Add to Grocery List" passes the currently selected (½× / 1× / 2×) `scaledIngredients`.
- **Shipped:** 5e2dc12
- **Files:** `app/recipe/[id].tsx`, `src/services/grocery-service.ts`

#### F8 — Regenerate scaled ingredients on update
- **Summary:** `updateRecipe()` rebuilds `ingredientsHalf` and `ingredientsDouble` whenever `ingredients` is updated.
- **Shipped:** 5e2dc12
- **Files:** `src/stores/recipe-store.ts`

### Opus 4.7 deep-audit fixes

#### S1 — Facebook App Secret → Client Token
- **Summary:** swapped App Secret for `EXPO_PUBLIC_FACEBOOK_CLIENT_TOKEN`; App Secret rotated in Meta dashboard.
- **Shipped:** 0ef844b
- **Files:** `src/services/instagram-oembed.ts`

#### S4 — Encrypted MMKV
- **Summary:** 32-byte key generated via `expo-crypto`, stored in `expo-secure-store`, passed to `createMMKV({ encryptionKey })`; one-shot plaintext→ciphertext migration on first post-upgrade launch.
- **Shipped:** 0ef844b
- **Files:** `src/utils/storage.ts`

#### S2 — SSRF-safe redirect resolver
- **Summary:** `resolveShortUrl` parses each `Location`, rejects private / link-local / loopback IPs and non-http(s) schemes via `url-safety.ts`, caps hops at 3.
- **Shipped:** 0ef844b
- **Files:** `src/services/post-fetcher.ts`, `src/utils/url-safety.ts`

#### M-d — Pinterest destination URL validation
- **Summary:** destination URL validated through `new URL()` + `isSafePublicUrl` before follow.
- **Shipped:** 0ef844b
- **Files:** `src/services/pinterest.ts`

#### M-c — Log redaction
- **Summary:** added `redactUrl()` and `redactError()`; applied across the Instagram, recipe-extractor, post-fetcher, and web-recipe-fetcher modules.
- **Shipped:** 0ef844b
- **Files:** `src/utils/log-redact.ts`, `src/services/instagram-scraper.ts`, `src/services/recipe-extractor.ts`, `src/services/post-fetcher.ts`, `src/services/web-recipe-fetcher.ts`

#### S3 + A3 — AI boundary hardening
- **Summary:** Zod schemas (`RecipeResponseSchema`, `CleanupResponseSchema`) validate Claude JSON; user caption wrapped in `<user_caption>…</user_caption>` delimiters; `sanitizeForPrompt()` strips control chars and injected closing tags.
- **Shipped:** 0ef844b
- **Files:** `src/services/recipe-parser-ai.ts`

#### A2 — cleanupRecipeExtraction error classification
- **Summary:** catch classifies Anthropic errors (AuthN / RateLimit / Connection / Timeout) and logs `console.warn` with `redactError`; unknown errors hit `console.error`.
- **Shipped:** 0ef844b
- **Files:** `src/services/recipe-parser-ai.ts`

#### M-a — HTML input cap on JSON-LD parser
- **Summary:** HTML input capped at 200 KB before the JSON-LD regex runs; regex is anchored.
- **Shipped:** 0ef844b
- **Files:** `src/services/web-recipe-fetcher.ts`

#### M-b — Recipe-URL extractor uses an allowlist
- **Summary:** `extractUrlsFromCaption` switched from host-blocklist to allowlist of known recipe domains.
- **Shipped:** 0ef844b
- **Files:** `src/services/recipe-parser.ts`

#### A1 — Persist filter-store
- **Summary:** wrapped `filter-store` in `persist(...)` with `zustandMMKVStorage` — search and filters survive cold start.
- **Shipped:** 0df3625
- **Files:** `src/stores/filter-store.ts`

#### A4 — In-flight save dedupe
- **Summary:** `addRecipe` tracks in-flight saves by `sourceUrl` via a `Set`; Save button disabled while saving.
- **Shipped:** 0df3625
- **Files:** `src/stores/recipe-store.ts`, `app/add-recipe.tsx`

#### A6 — Per-ingredient grocery IDs
- **Summary:** `grocery-service.ts` uses `generateId()` instead of array indexes.
- **Shipped:** 0df3625
- **Files:** `src/services/grocery-service.ts`

#### A7 — Aggressive grocery key normalization
- **Summary:** check-state key collapses whitespace, strips punctuation, canonicalizes fractions.
- **Shipped:** 0df3625
- **Files:** `src/services/grocery-service.ts`

#### A5 — Image-cache batched cleanup
- **Summary:** switched to `Promise.allSettled` in 50-batch chunks; startup sweep awaits with explicit `.catch(log)`.
- **Shipped:** 0df3625
- **Files:** `src/utils/image-cache.ts`, `app/_layout.tsx`

#### M-e — Reject invalid scaling factors
- **Summary:** `scaleIngredients` / `scaleIngredientText` / `scaleTime` reject `factor <= 0` or `!isFinite`.
- **Shipped:** 0df3625
- **Files:** `src/utils/scale-recipe.ts`

#### A8 — Single env source
- **Summary:** `env.ts` holds `CLAUDE_API_KEY`, `RAPIDAPI_KEY`, `FACEBOOK_APP_ID`, `FACEBOOK_CLIENT_TOKEN`; console-warns in `__DEV__` when missing; removed inline `process.env` reads from `recipe/[id].tsx` and `recipe-extractor.ts`.
- **Shipped:** 0df3625
- **Files:** `src/utils/env.ts`, `app/recipe/[id].tsx`, `src/services/recipe-extractor.ts`

#### A9 — SafeAreaView wraps every screen
- **Summary:** applied `react-native-safe-area-context` `SafeAreaView` to all tab screens, `add-recipe`, `onboarding`, `collection/[id]`, `recipe/edit/[id]`.
- **Shipped:** 0df3625
- **Files:** `app/**/*.tsx`

#### A10 — Accessibility props across interactive surfaces
- **Summary:** `accessibilityRole` / `accessibilityLabel` / `accessibilityHint` / `accessibilityState` on every `Pressable`, filter pill, FAB, scale toggle, favorite heart; `accessibilityLiveRegion="polite"` on error text.
- **Shipped:** 0df3625
- **Files:** `app/**/*.tsx`, `src/components/**/*.tsx`

#### L-a — Dismiss keyboard on save
- **Summary:** `Keyboard.dismiss()` in the save handlers of `add-recipe.tsx` and `recipe/edit/[id].tsx`.
- **Shipped:** 0df3625
- **Files:** `app/add-recipe.tsx`, `app/recipe/edit/[id].tsx`

#### L-b — keyboardShouldPersistTaps on touchable scrollers
- **Summary:** set `keyboardShouldPersistTaps="handled"` on every `ScrollView` containing touchables.
- **Shipped:** 0df3625
- **Files:** `app/**/*.tsx`

#### M-f — Drop the null-padding grid hack
- **Summary:** removed the placeholder-padding grid hack on the home tab; `columnWrapperStyle={{ justifyContent: "flex-start" }}` with `numColumns={2}`.
- **Shipped:** 0df3625
- **Files:** `app/(tabs)/index.tsx`

#### M-g — FlatList perf props
- **Summary:** `removeClippedSubviews`, `initialNumToRender`, `maxToRenderPerBatch`, `windowSize` set on recipes and collections lists.
- **Shipped:** 0df3625
- **Files:** `app/(tabs)/index.tsx`, `app/(tabs)/collections.tsx`

#### M-j — Lift Modal out of ScrollView
- **Summary:** moved the recipe modal out of the `ScrollView` via a Fragment wrapper.
- **Shipped:** 0df3625
- **Files:** `app/recipe/[id].tsx`

#### M-k — Drop blurhash placeholder
- **Summary:** `RecipeCard` uses `colors.surfaceAlt` background instead of the blurhash placeholder.
- **Shipped:** 0df3625
- **Files:** `src/components/RecipeCard.tsx`

#### L-c — PillButton component + centralized pill arrays
- **Summary:** extracted `PillButton`; filter-pill arrays moved to `constants.ts`.
- **Shipped:** 0df3625
- **Files:** `src/components/PillButton.tsx`, `src/utils/constants.ts`

#### L-d — SkeletonRecipeGrid until MMKV hydrates
- **Summary:** show skeleton on home until `useRecipeStore.persist.hasHydrated()`; hides via `onFinishHydration` listener.
- **Shipped:** 0df3625
- **Files:** `src/components/SkeletonRecipeGrid.tsx`, `app/(tabs)/index.tsx`

#### L-e — Filter modal backdrop dim
- **Summary:** filter modal backdrop uses `bg-black/40`.
- **Shipped:** 0df3625
- **Files:** `app/(tabs)/index.tsx`

#### M-h (partial) — Color tokens file
- **Summary:** `colors.ts` token file added; per-className dark-mode migration deferred (tracked under outstanding M-h).
- **Shipped:** 0df3625
- **Files:** `src/utils/colors.ts`

#### TEST1 — Jest harness
- **Summary:** `jest.config.js` + `jest.setup.ts` with mocks for `expo-secure-store`, `expo-crypto`, `react-native-mmkv` (`MockMMKV`), and `expo-file-system/legacy`.
- **Shipped:** 9e54e2e
- **Files:** `jest.config.js`, `jest.setup.ts`

#### TEST2 — Pure-function tests
- **Summary:** unit tests for `scale-recipe`, `uuid`, `fetch-with-timeout`, `url-safety`.
- **Shipped:** 9e54e2e
- **Files:** `src/utils/__tests__/*.test.ts`

#### TEST3 — AI boundary tests
- **Summary:** mocked Anthropic SDK; covers happy path, malformed JSON, schema mismatch, classified errors, prompt-injection defense.
- **Shipped:** 9e54e2e
- **Files:** `src/services/__tests__/recipe-parser-ai.test.ts`

#### TEST4 — recipe-extractor integration test
- **Summary:** tier 0 / 1 / 2 / fallback paths plus error surfacing.
- **Shipped:** 9e54e2e
- **Files:** `src/services/__tests__/recipe-extractor.test.ts`

#### TEST5 — RecipeCard component test
- **Summary:** rendering smoke test for the recipe card.
- **Shipped:** 9e54e2e
- **Files:** `src/components/__tests__/RecipeCard.test.tsx`

#### M-i — Test scripts and baseline
- **Summary:** added `npm test`, `npm run test:watch`, `npm run test:coverage`. Baseline: 101 tests passing, typecheck clean.
- **Shipped:** 9e54e2e
- **Files:** `package.json`
