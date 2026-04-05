# Scheduled Agent Instructions

This file is the prompt for an AI agent that runs on a schedule (every hour) to autonomously complete project tasks.

## Your Goal

Select one pending `ai-safe` task from `TASKS.json`, complete it, and update the task status. You have approximately **30 minutes** of working time and a **44,000 token budget** per 5-hour window — keep your work focused.

---

## Step-by-Step Process

### 1. Read the task list

Read `TASKS.json`. Parse the `tasks` array.

### 2. Select a task

Apply these rules **in order**:

1. **Skip** any task where `status` is `complete`, `requires-human`, or `in-progress`.
2. **Skip** any task where `type` is `human-required` — these cannot be done by the AI.
3. **Skip** any task whose `depends_on` array contains a task ID that is not yet `complete`.
4. **Skip** any task that has 2 or more entries in its `attempts` array (already tried twice — flag it).
5. From the remaining eligible tasks, **pick the one with the lowest task ID** (T01, T02, etc.) — work in order.

If no eligible task exists, write a brief status message and exit.

### 3. Mark the task as in-progress

Before doing any work, update the selected task in `TASKS.json`:
- Set `status` to `"in-progress"`
- Append to the `attempts` array: `{ "started_at": "<ISO timestamp>", "agent_note": "Starting work" }`

Commit this change: `git commit -m "chore: start task <ID> - <title>"`

### 4. Do the work

Read the task's `description` carefully. Read any files mentioned. Then implement the changes.

**Rules while working:**
- Only modify files relevant to this task — do not refactor unrelated code
- Do not install new packages not listed in the task description
- Commit your work as you go (after each meaningful chunk)
- Stay focused — if a task is larger than expected, implement the core functionality and note what was skipped

### 5. Verify success

Check the task's `success_criteria`. Verify each criterion is met (read files, run `npx tsc --noEmit` if TypeScript checking is listed).

### 6. Update TASKS.json with the outcome

**If successful:**
```json
{
  "status": "complete",
  "completed_at": "<ISO timestamp>",
  "attempts": [
    { "started_at": "...", "agent_note": "Completed successfully" }
  ]
}
```

**If failed (error you cannot resolve):**
```json
{
  "status": "requires-human",
  "attempts": [
    { "started_at": "...", "agent_note": "Failed: <specific reason>" }
  ]
}
```

**If partially done (ran out of time/tokens):**
Set status back to `"pending"` and add a note in the attempt describing what was completed, so the next agent can continue.

### 7. Final commit and push

```bash
git add -A
git commit -m "feat: complete task <ID> - <title>"
git push -u origin claude/instagram-recipe-app-DDKSX
```

---

## Important Constraints

| Constraint | Rule |
|---|---|
| **Token budget** | Stop before using all tokens — leave ~2,000 tokens for status updates and the final commit |
| **Time limit** | Target ~30 minutes per task. If a task is taking much longer, save progress and mark pending |
| **Branch** | Always work on `claude/instagram-recipe-app-DDKSX` — never push to `main` |
| **No secrets** | Never commit `.env` files or API keys. They belong in `.env` (gitignored) only |
| **No scope creep** | Only implement what the task description asks. Do not add unrequested features |
| **Dependencies** | Check `depends_on` — do not start a task if a dependency is not `complete` |

---

## Reference Files

- `IMPLEMENTATION_PLAN.md` — Full architecture and design decisions
- `TASKS.json` — The task list you manage
- `src/types/recipe.ts` — Core data models (once created in T05)

---

## Task Status Reference

| Status | Meaning |
|---|---|
| `pending` | Ready to be worked on (if dependencies met) |
| `in-progress` | Currently being worked on |
| `complete` | Done and verified |
| `requires-human` | AI could not complete — human intervention needed |
| `blocked` | Dependency is stuck in `requires-human` |
