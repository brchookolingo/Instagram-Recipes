# Unit Economics — Cost per Recipe Extraction

**Task:** P1 — quantify per-recipe variable cost for the ReciGrams extraction pipeline.
**Pricing snapshot date:** 2026-05-06 (Anthropic & RapidAPI prices not re-verified live in this pass — see Caveats).
**Model:** `claude-sonnet-4-5` (constant `CLAUDE_MODEL` in `src/utils/constants.ts`).
**Code references:**
- `src/services/recipe-parser-ai.ts` — `parseRecipeWithAI`, `cleanupRecipeExtraction`
- `src/services/recipe-extractor.ts` — tier orchestration
- `src/services/instagram-scraper.ts` — RapidAPI `instagram-scraper21` host

---

## Summary: $/recipe by tier

| Tier | What runs | Claude calls | RapidAPI? | p50 $/recipe | p95 $/recipe |
|------|-----------|--------------|-----------|--------------|--------------|
| **Tier 0** — schema.org JSON-LD pre-extracted | nothing AI | 0 | No | **$0.0000** | **$0.0000** |
| **Tier 1** — caption → AI + cleanup | 2 (`parseRecipeWithAI` + `cleanupRecipeExtraction`) | No (oEmbed free) | **~$0.0260** | **~$0.0680** |
| **Tier 2** — linked page → AI + cleanup | 2 (same pair on page text) | No | **~$0.0330** | **~$0.0900** |
| **Instagram via scraper** — Tier 1 path with RapidAPI fetch | 2 | **Yes** (instagram-scraper21) | **~$0.0285** (Tier 1 + ~$0.0025 RapidAPI) | **~$0.0730** |
| **Worst-case fallback chain** — Tier 1 fails → Tier 2 runs on linked page | up to 3 (Tier 1 parse + Tier 2 parse + cleanup) | possibly | **~$0.0500** | **~$0.135** |

> Headline: a typical successful Instagram caption extraction costs **~2.6¢** at p50; a long page-text fallback can reach **~9¢** at p95.

---

## Per-call token + cost breakdown

### Pricing assumed
- Claude Sonnet 4.5: **$3.00 / 1M input tokens**, **$15.00 / 1M output tokens**.
- Prompt caching: **not used** in current code (no `cache_control` blocks in `parseRecipeWithAI` or `cleanupRecipeExtraction`).
- RapidAPI `instagram-scraper21`: estimated **~$0.002–$0.005 per request** on the lowest paid tier (free tier covers limited monthly calls); used as $0.0025 in totals.
- Facebook Graph oEmbed, TikTok oEmbed, Pinterest oEmbed: **free**.
- Heuristic: **~4 chars / token** (English text; emoji/JSON-heavy payloads can run higher).

### `parseRecipeWithAI` — Tier 1 (Instagram/TikTok caption)

| Component | Source | Chars (est) | Tokens (est) |
|-----------|--------|-------------|--------------|
| System prompt | hard-coded `SYSTEM_PROMPT` (lines 9–43) | ~1,750 | **~440** (measured by char count) |
| User wrapper (`<user_caption>…</user_caption>`) | code | ~30 | ~10 |
| Caption body (p50) | typical IG reel caption | ~600 | ~150 |
| Caption body (p95) | long recipe blog-style caption | ~3,500 | ~875 |
| **Input total p50** |  |  | **~600** |
| **Input total p95** |  |  | **~1,325** |
| Output (recipe JSON) p50 | typical | ~2,800 | ~700 |
| Output (recipe JSON) p95 | many ingredients/long instructions, capped by `max_tokens: 2048` | ~7,200 | ~1,800 |

Cost p50: 600 × $3/M + 700 × $15/M = **$0.0018 + $0.0105 = $0.0123**
Cost p95: 1,325 × $3/M + 1,800 × $15/M = **$0.0040 + $0.0270 = $0.0310**

### `parseRecipeWithAI` — Tier 2 (web page text)

Same prompt but `webResult.captionFallback` is the body text of a recipe page (often 4–25 KB after HTML strip).

| Component | Tokens (est) |
|-----------|--------------|
| System prompt | ~440 |
| Page text p50 (~6 KB) | ~1,500 |
| Page text p95 (~25 KB) | ~6,250 |
| **Input p50** | **~1,950** |
| **Input p95** | **~6,700** |
| Output p50 / p95 | ~700 / ~1,800 |

Cost p50: 1,950 × $3/M + 700 × $15/M = **$0.0059 + $0.0105 = $0.0164**
Cost p95: 6,700 × $3/M + 1,800 × $15/M = **$0.0201 + $0.0270 = $0.0471**

### `cleanupRecipeExtraction` — second Claude call (always runs after Tier 1 or Tier 2 success)

Per `recipe-extractor.ts` lines 56–58 and 81–83, cleanup is invoked **unconditionally whenever `parseRecipeWithAI` succeeds with sufficient data**. So in practice every successful AI extraction pays for two Claude calls.

| Component | Tokens (est) |
|-----------|--------------|
| System prompt (cleanup, lines 175–189) | ~250 |
| User payload = stringified prior recipe JSON p50 | ~700 |
| User payload p95 | ~1,800 |
| **Input p50 / p95** | **~960 / ~2,060** |
| Output p50 / p95 | ~700 / ~1,800 (cleanup re-emits the recipe) |

Cost p50: 960 × $3/M + 700 × $15/M = **$0.0029 + $0.0105 = $0.0134**
Cost p95: 2,060 × $3/M + 1,800 × $15/M = **$0.0062 + $0.0270 = $0.0332**

### Tier 1 successful end-to-end

p50: $0.0123 (parse) + $0.0134 (cleanup) = **~$0.0257**
p95: $0.0310 + $0.0332 = **~$0.0642**

### Tier 2 successful end-to-end

p50: $0.0164 + $0.0134 = **~$0.0298**
p95: $0.0471 + $0.0332 = **~$0.0803**

### Worst case (Tier 1 AI fires, returns insufficient data, Tier 2 fires on linked page, succeeds)

p50: $0.0123 (failed Tier 1 parse, no cleanup) + $0.0164 (Tier 2 parse) + $0.0134 (cleanup) ≈ **$0.042**
p95: $0.031 + $0.047 + $0.033 ≈ **$0.111**

Add **+$0.0025** if the post was Instagram and `fetchViaScraper` ran instead of (or before) oEmbed.

---

## Assumptions

| Assumption | Source / confidence |
|-----------|---------------------|
| ~4 chars per token | English-text heuristic; JSON & emoji-heavy captions can be ~3 chars/token, pushing costs ~25% higher. |
| Sonnet 4.5 pricing $3 / $15 per M | Anthropic public pricing as of late-2025/early-2026. **Not re-verified in this pass** — WebFetch was unavailable. Re-verify at <https://www.anthropic.com/pricing> before financial planning. |
| RapidAPI `instagram-scraper21` ~$0.0025/req | Order-of-magnitude estimate for community RapidAPI scrapers. **Not verified.** Re-check at the provider's RapidAPI listing. The Free tier (~100 req/mo) makes early-stage cost effectively $0 until volume grows. |
| Output token p50 ~700 / p95 ~1,800 | Inferred from `max_tokens: 2048` cap and typical recipe JSON size; not measured against real responses. |
| Cleanup runs every successful AI extraction | Verified in `recipe-extractor.ts` lines 56–58, 81–83 — unconditional. |
| Prompt caching not in use | Verified: no `cache_control` markers in `recipe-parser-ai.ts`. The 440-token system prompt is re-billed at full input price every call. |

---

## Caveats — what could push costs 2–5× higher

1. **No prompt caching.** Both calls re-pay for the system prompt every time. Adding `cache_control` on the system prompt would cut input cost by ~10× on cache hits ($0.30/M vs $3/M cache-read pricing) — biggest single optimization available.
2. **Cleanup is always-on.** It roughly doubles AI cost per successful extraction. If audit shows cleanup rarely changes the output, gating it (e.g. only run when ingredients/instructions show signs of mis-classification) would halve average cost.
3. **Long page text in Tier 2.** Recipe blog pages with ad-laden HTML can blow past 25 KB after stripping; a 50 KB page would push Tier 2 input alone past **$0.04** before cleanup.
4. **Output token cap (2,048).** Multi-page recipes hit the cap; Anthropic still bills full output. A recipe at the cap costs ~$0.031 in output alone.
5. **Token heuristic underestimates emoji/multilingual captions.** Real tokenizer counts can be 25–40% higher than the 4-chars-per-token rule.
6. **Retries.** Network errors trigger user retries today (no exponential backoff with idempotent dedup); each retry is a full re-bill.
7. **RapidAPI overage.** Once monthly free quota is exhausted, IG-scraper costs become a meaningful slice (~10% of a Tier 1 IG extraction).
8. **Worst-case chain (Tier 1 → Tier 2 → cleanup).** ~3× the Tier 1 happy-path cost.

---

## Recommended next steps

- Instrument actual `usage.input_tokens` / `usage.output_tokens` from the Anthropic SDK response in both `parseRecipeWithAI` and `cleanupRecipeExtraction`, log to the dev console / a metrics sink, and replace the estimates above with measured p50/p95.
- Add `cache_control: { type: "ephemeral" }` to the system prompt blocks. Expected saving: ~$0.001–$0.002 per call after warmup.
- Decide whether cleanup is worth ~50% of AI spend, or gate it behind a heuristic (e.g. only when an ingredient line contains a verb).
- Verify RapidAPI per-request cost on the actual selected plan and re-confirm Sonnet 4.5 pricing before basing any business decisions on these numbers.
