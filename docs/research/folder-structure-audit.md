# Root-level file audit (FS1)

Goal: for every file currently sitting at the repo root, determine whether the consuming tool **requires** it at the project root or whether it can be relocated. The output of this audit feeds FS3, which actually moves the relocatable configs.

No changes are made by this task — it's research only.

## Method

For each file, I checked the consuming tool's docs (or, when unambiguous, the convention enforced by Expo / Metro / Babel / npm). "Required at root" means the tool either auto-discovers from the project root with no override, or has a hard expectation baked into a peer tool (e.g. Metro and EAS both expect `app.json` at the root regardless of what Expo itself accepts).

## Summary table

| File                     | Required at root?              | Why                                                                                                                                                                  | Proposed location if movable                          |
|--------------------------|--------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------|-------------------------------------------------------|
| `app.json`               | ✅ Yes                         | Expo config. Expo CLI, EAS Build, and Metro all discover it via project root. `app.config.{js,ts}` is the only sanctioned alternative — also at root.                | —                                                     |
| `babel.config.js`        | ✅ Yes (effectively)           | Babel walks up from each source file looking for the **project root** config. Metro + Expo expect it at root; moving it requires `BABEL_CONFIG_FILE` everywhere.     | — (not worth the breakage)                            |
| `eas.json`               | ✅ Yes                         | EAS CLI hard-codes the project root for `eas.json`. No override flag.                                                                                                | —                                                     |
| `metro.config.js`        | ✅ Yes                         | Metro auto-discovers from `--projectRoot`, which Expo sets to the repo root. No support for relocating without a wrapper script.                                     | —                                                     |
| `tsconfig.json`          | ✅ Yes (effectively)           | TS supports `--project path/to/tsconfig.json`, but VS Code, Expo TypeScript template, Jest's `ts-jest` / `jest-expo`, and ESLint all discover from cwd.              | — (cost > benefit)                                    |
| `tailwind.config.js`     | ✅ Yes (effectively)           | NativeWind v4 + Metro discover Tailwind config from the project root. CLI accepts `--config` but the in-Metro path does not.                                         | —                                                     |
| `package.json`           | ✅ Yes                         | npm / pnpm / yarn root convention; Expo, EAS, every tool reads it from the project root.                                                                             | —                                                     |
| `package-lock.json`      | ✅ Yes                         | npm writes alongside `package.json`.                                                                                                                                  | —                                                     |
| `.env`                   | ✅ Yes                         | Expo loads `.env*` files from the project root only.                                                                                                                 | —                                                     |
| `.env.example`           | ✅ Yes (convention)            | Pairs with `.env`; tooling-agnostic but conventionally at root next to its sibling.                                                                                  | —                                                     |
| `.gitignore`             | ✅ Yes                         | Git scans up from cwd; root `.gitignore` is the conventional place for repo-wide patterns.                                                                           | —                                                     |
| `nativewind-env.d.ts`    | ⚠️ Soft — anywhere `tsconfig` includes | Pure TS ambient declarations. As long as `tsconfig.json`'s `include` covers the new path, TS will pick it up. NativeWind docs put it at root by convention. | `types/nativewind-env.d.ts` (would also need a `types/*.d.ts` glob in `tsconfig.json`) |
| `global.css`             | ⚠️ Soft — referenced by import | Loaded via `import "../../global.css"` (or similar) from `app/_layout.tsx`. Move freely; update the import.                                                          | `src/styles/global.css`                               |
| `jest.config.js`         | ⚠️ Soft — `jest --config <path>` works | Jest auto-discovers from cwd; can be relocated if `npm test` runs `jest --config path/to/jest.config.js`. Cost: any IDE Jest plugin then needs the same flag. | `config/jest.config.js` — but worth weighing IDE friction |
| `jest.setup.ts`          | ✅ Movable freely              | Pointed to by `setupFiles: ["<rootDir>/jest.setup.ts"]` in `jest.config.js`. Move and update that one path. `<rootDir>` stays the project root regardless.           | `tests/jest.setup.ts` (or `config/jest.setup.ts`)     |
| `CLAUDE.md`              | ✅ Yes                         | Claude Code looks for `CLAUDE.md` at the project root.                                                                                                               | —                                                     |
| `README.md`              | ✅ Yes (convention)            | GitHub renders the root `README.md` on the repo home page.                                                                                                           | —                                                     |
| `TASKS.md`               | ⚠️ Soft — repo convention only | No tool reads it; it's referenced by `CLAUDE.md`. Movable, but currently linked from `CLAUDE.md` as `[TASKS.md](TASKS.md)`.                                          | Keep at root unless we want all docs in `docs/`       |

## What's actually movable

Three files are safely relocatable without breaking tooling:

1. **`jest.setup.ts`** → `tests/jest.setup.ts`. Pure path swap in `jest.config.js`. Lowest risk.
2. **`global.css`** → `src/styles/global.css`. One import path to update (likely `app/_layout.tsx`).
3. **`nativewind-env.d.ts`** → `types/nativewind-env.d.ts`. Requires a one-line `tsconfig.json` `include` change.

A fourth (`jest.config.js`) is technically movable but introduces friction with IDE Jest integrations. **Recommendation: leave `jest.config.js` at root.**

The other 14 files are all root-pinned by the consuming tool or by widespread convention; moving them costs more than it gains.

## Proposed target structure

```
.
├── app/                  # expo-router routes (unchanged)
├── android/ ios/          # native projects (unchanged)
├── assets/                # unchanged
├── config/                # NEW — only if we decide to relocate jest config too
├── docs/
│   ├── research/          # research outputs from FS1, R*, P*, AND*, VID* etc.
│   └── privacy-policy.html
├── src/
│   ├── styles/
│   │   └── global.css     # ← moved from root
│   └── …
├── tests/
│   └── jest.setup.ts      # ← moved from root
├── types/
│   └── nativewind-env.d.ts # ← moved from root
├── app.json
├── babel.config.js
├── eas.json
├── jest.config.js         # stays at root for IDE compatibility
├── metro.config.js
├── package.json package-lock.json
├── tailwind.config.js
├── tsconfig.json
├── .env .env.example .gitignore
├── CLAUDE.md README.md TASKS.md
```

This trims the root from 19 files (excluding hidden) down to 13 — modest but real, and every file at the root then has a clear "tool requires me here" justification.

## Recommendation for FS3

When FS3 picks this up, do the moves in this order, validating between each:

1. Move `jest.setup.ts` → `tests/jest.setup.ts`; update `setupFiles` path in `jest.config.js`; run `npm test`.
2. Move `global.css` → `src/styles/global.css`; update its import in `app/_layout.tsx` (or wherever it is); run `npx expo start` and confirm styles load.
3. Move `nativewind-env.d.ts` → `types/nativewind-env.d.ts`; ensure `tsconfig.json`'s `include` matches; run `npx tsc --noEmit`.

Each step is independently revertable. Skip any step where the validation fails.

## Source links

- Expo project structure: https://docs.expo.dev/workflow/expo-cli/
- Babel config lookup: https://babeljs.io/docs/config-files#project-wide-configuration
- Metro config: https://metrobundler.dev/docs/configuration/
- EAS build config: https://docs.expo.dev/build/eas-json/
- TypeScript `--project`: https://www.typescriptlang.org/docs/handbook/compiler-options.html
- Jest CLI `--config`: https://jestjs.io/docs/cli#--configpath
- NativeWind setup: https://www.nativewind.dev/getting-started/installation
