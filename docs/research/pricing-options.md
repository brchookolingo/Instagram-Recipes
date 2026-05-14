# P2 — Pricing Structures & Break-Even Math (2026-05-14)

Three candidate pricing structures for ReciGrams, evaluated against the per-recipe variable cost from [P1](unit-economics.md) and the competitor pricing landscape from [R3](competitor-pricing.md). Numbers below treat **$0.026/recipe at p50** and **$0.07/recipe at p95** as the canonical per-extraction cost (Tier 1 caption → AI + cleanup), plus **$0.0025** when RapidAPI Instagram scraping runs.

App Store / Play Store cuts assumed:
- **30%** standard.
- **15%** after Year 1 on auto-renew subscriptions (Apple) / Small Business Program (Google). Used below as the optimistic case.

All margin numbers below are gross margin on **AI + scraper variable cost only**. They exclude hosting (currently zero — keys are on-device), fixed dev time, and refund/chargeback dilution.

---

## Option A — Freemium with monthly quota + subscription

**Target user:** the median "I save a Reel a week" user; converts the heaviest savers.

**Free tier:** 5 extractions / month. Unlimited storage, scaling, grocery list, dark mode. Hard cap on new imports.
**Paid tier:** **$4.99/mo or $34.99/yr** (≈$2.92/mo) — unlimited extractions.

**Why these numbers:** $4.99/mo sits squarely in the Flavorish/Pluck-Light band ($2.99–$4.99) and below ReciMe's $59.99/yr; $34.99/yr undercuts ReciMe by ~40% while clearing break-even at realistic volumes. 5-recipe free cap matches ReciMe; Pluck's 3 is too punishing for a clipboard-listener app.

**Break-even (per paid user, per month):**

| Store cut | Net per $4.99 mo | Recipes/mo before margin = 0 (p50) | Recipes/mo before margin = 0 (p95) |
|-----------|------------------|------------------------------------|------------------------------------|
| 30% | $3.49 | 134 recipes | 50 recipes |
| 15% | $4.24 | 163 recipes | 60 recipes |

| Store cut | Net per $34.99 yr (annualised) | Recipes/mo break-even (p50) | Recipes/mo break-even (p95) |
|-----------|---------------------------------|------------------------------|------------------------------|
| 30% | $2.04/mo | 78 recipes/mo | 29 recipes/mo |
| 15% | $2.48/mo | 95 recipes/mo | 35 recipes/mo |

At a realistic **15 recipes/mo per paid power-user** (3× the free-tier cap), monthly margin is ~$3.10 at p50 / ~$2.44 at p95 under the 30% store cut. Healthy.

**Risks:** quota anchoring trains users to expect "free" — same trap ReciMe hit (reviews complain about the 5-cap loudly). A small but vocal segment churns at first import-blocked moment. Also: extraction costs are concentrated at the top of the curve — if a power user hits 200 recipes/month, the unit economics flip negative at p95.

---

## Option B — BYOK + one-time unlock for non-AI features

**Target user:** the privacy-/cost-conscious user who already has a Claude API key, or doesn't mind getting one. Differentiated against every competitor (R3 confirms **no competitor advertises BYOK**).

**Free tier:** all extraction features unlocked, **user supplies their own `CLAUDE_API_KEY` and `RAPIDAPI_KEY`** via Settings (the [C1](../TASKS.md#c1--move-api-keys-off-the-client-critical) option-2 architecture). Storage, scaling, grocery list, collections, dark mode all free.
**Paid tier (optional):** **$9.99 one-time "Pro" IAP** — unlocks meal planner, export-to-PDF, cookbook/handwritten OCR (future), and removes onboarding paywall prompt. **No subscription.**

**Why these numbers:** BYOK shifts AI cost entirely off ReciGrams' P&L, which makes the whole business viable at near-zero recurring revenue. The $9.99 one-time matches Crouton Plus territory ($3–$25) and Cookmark's "Premium one-time unlock"; it's a thank-you, not the funding mechanism. The free, no-cap, no-ads tier is the marketing pitch.

**Break-even:** trivially $0 per extraction — user pays Anthropic / RapidAPI directly. Even one Pro unlock per ~150 installs covers the Apple/Google developer fees and a year of EAS Build minutes.

| Store cut | Net per $9.99 one-time |
|-----------|------------------------|
| 30% | $6.99 |
| 15% (subs only — N/A here) | $9.99 — Apple's small-biz program does apply to non-subscription IAPs after year 1 enrolment |

**Risks:** BYOK adoption is hostile to non-technical users. Onboarding must include either a "get a key in 90 seconds" guided flow with a Claude Console deeplink, or accept a smaller addressable market. Pluck's existence (a freemium AI app charging $2.99/mo) suggests most consumers won't pursue BYOK even if it's free. Mitigation: ship BYOK as the *default* free tier so the conversion barrier only hits on first-launch, not at the import moment.

---

## Option C — One-time lifetime + low monthly with grandfathered free tier

**Target user:** anti-subscription buyers who'd pay $30 once but never $5/mo; plus a fallback sub for the rest.

**Free tier:** 25 lifetime saved recipes (storage cap, not import cap). All imports unlocked while under cap. Pressures users into a decision once they're committed.
**Lifetime IAP:** **$24.99 one-time** — unlocks unlimited storage, no future feature gates.
**Monthly sub (alternative):** **$2.99/mo or $19.99/yr** — same unlock, for users who won't commit upfront.

**Why these numbers:** mirrors Crouton's $24.99 lifetime + $14.99/yr structure, which has proven sustainable for 5+ years. Lifetime price needs to recover ~LTV worth of inference; at 15 recipes/mo × $0.026 × 36 months = ~$14 in AI cost, $24.99 lifetime ($17.49 net at 30%) clears it comfortably for the median user but is exposed to power-user abuse.

**Break-even (per lifetime buyer, p50, 30% store cut):**

| Usage profile | Months until margin = 0 |
|---------------|--------------------------|
| 10 recipes/mo (light) | 67 months — safe |
| 30 recipes/mo (heavy) | 22 months — viable past Apple's typical refund window |
| 100 recipes/mo (power) | 6.7 months — **net negative** if user stays active >1 year |

| Sub tier (p50 / 30%) | Recipes/mo break-even |
|-----------------------|------------------------|
| $2.99/mo → $2.09 net | 80 recipes/mo |
| $19.99/yr → $1.17/mo net | 45 recipes/mo |

**Risks:** lifetime pricing is structurally exposed to top-1% power users — one user importing every TikTok they scroll can erase 10 lifetime sales' worth of margin. Mitigates partially via a soft fair-use cap (e.g. 500 extractions/mo before rate-limiting). Storage-cap-style free tier (25 saves) is a weaker hook than import-cap because users don't hit it on day one — slower paid-conversion funnel.

---

## Recommendation (not a decision)

If the answer to [C1](../TASKS.md#c1--move-api-keys-off-the-client-critical) is **option 2 (BYOK)**, then **P2 Option B** is the only structure that doesn't contradict the architecture — you can't ship BYOK and a quota in the same app. Option B also has the cleanest differentiation story against R3's field (no competitor advertises BYOK) and removes the inference-cost tail risk entirely.

If C1 lands as **option 1 (backend proxy)**, then **Option A** is the safest first launch — pricing matches the freemium-with-quota consensus, break-even is comfortable at realistic usage, and conversion psychology is well-understood. **Option C** is worth a second-launch experiment once 6+ months of usage data quantifies the power-user tail and whether lifetime pricing can survive it.

The final call belongs in **PRICING1**.

## Sources

- [P1 — unit-economics.md](unit-economics.md) (per-recipe cost)
- [R3 — competitor-pricing.md](competitor-pricing.md) (market price points)
- Apple Small Business Program — https://developer.apple.com/app-store/small-business-program/
- Google Play 15% post-Year-1 — https://support.google.com/googleplay/android-developer/answer/10632485
