# ReciGrams — Outstanding Tasks

Tasks split by whether they can be completed autonomously by an AI agent on a loop, or whether they require a user decision/credential/external action first.

When working a task: pick from **AI-Autonomous**, complete it end-to-end (code + typecheck + tests), then move it into the "Completed Work" section of `CLAUDE.md` and remove it from this file.

---

## ✅ AI-Autonomous (safe to run on a loop)

These have a clear scope, no external accounts/secrets, and no irreversible decisions. An agent can complete them without user input.

### M-h — Dark mode className migration
- **Status:** partial; tokens already exist in `src/utils/colors.ts`
- **Scope:** add `dark:` variants across ~30 `className` sites, keyed off `useColorScheme()`
- **Acceptance:**
  - Every screen and component renders correctly in both light and dark mode
  - No hardcoded hex/rgb in `className`s where a token exists
  - Typecheck + existing test suite still pass
- **Suggested approach:** grep for `bg-`, `text-`, `border-` color classes; add `dark:` companion for each using the token mapping. Manually verify a few key screens after.
- **Files (likely):** `app/**/*.tsx`, `src/components/**/*.tsx`

---

## 🚧 Needs User Input / Decision

These are blocked on a human choice, an external account, or a destructive/irreversible step. An AI loop should **skip** these.

### C1 — Move API keys off the client (CRITICAL)
- **Why blocked:** requires the user to pick between two architectures, and either path needs credentials/infra the agent can't provision.
- **Options:**
  1. **Backend proxy** — Expo API route or edge function holding `CLAUDE_API_KEY` + `RAPIDAPI_KEY`; client uses a session token. Requires hosting decision + deploy credentials.
  2. **BYOK (bring-your-own-keys)** — Settings screen where the user pastes their own keys; stored in `expo-secure-store`. No backend needed.
- **What the user needs to decide:**
  - Which option (1 or 2)
  - If (1): hosting target (Vercel / Cloudflare / Expo API routes / other) and who owns the deploy
  - If (2): UX for first-run (block app until keys entered? graceful degrade?)
- **Once decided, AI can implement.** Option 2 in particular is fully AI-doable after the product decision.
- **Files:** `src/utils/env.ts`, `src/services/instagram-scraper.ts`, `src/services/recipe-extractor.ts`

---

## 🗄️ Skipped / Deferred (do not action)

- **L9** — MMKV schema migration strategy. Skipped by user: too complex for a personal app at this stage. Leave alone unless user re-opens.
