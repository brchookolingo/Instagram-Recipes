# `docs/`

Documentation and research outputs for ReciGrams.

## Layout

- `privacy-policy.html` — public privacy policy (linked from the App Store / Play Store listings).
- `research/` — markdown deliverables from research-only tasks tracked in [`../TASKS.md`](../TASKS.md). One file per task ID (e.g. `folder-structure-audit.md`, `competitors.md`, `unit-economics.md`).

## Convention

Any task in `TASKS.md` whose Output is a markdown deliverable goes under `docs/research/`. Filename should be a short kebab-case slug describing the topic, not the task ID. The task entry in `TASKS.md` names the exact path.

Code-touching tasks do **not** produce a doc here — they ship as code with typecheck + tests green.
