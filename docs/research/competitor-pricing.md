# R3 — Competitor Pricing & Monetization (2026-05-14)

Pricing snapshot for the 12 direct competitors enumerated in [R1](competitors.md). All figures are USD unless noted, captured from public App Store / Play Store listings, vendor pricing pages, and third-party reviews on the date above. Where vendors hide pricing behind sign-up or paywall, the cell reads **?** — do not infer.

## Pricing matrix

| Name | Model | Free tier | Paid tier(s) | What's gated behind paid |
|------|-------|-----------|--------------|--------------------------|
| ReciMe | Freemium subscription | 5 lifetime recipe saves | $59.99/yr Premium (≈$5/mo) | Unlimited saves, all imports, meal planner, grocery hand-off |
| Pestle | Freemium subscription + one-time | Cloud sync + base recipe storage free | Pestle Pro: ~$3/mo, yearly tier, **lifetime one-time** available | AI Reel/TikTok extraction, scaling, Reminders sync, advanced features |
| Flavorish | Freemium subscription | Ad-free unlimited devices, basic saves | Premium $4.99/mo | Higher-volume imports + premium recipe organisation features |
| Pluck | Tiered freemium subscription | 3 extractions/mo, 10 saved recipes | Light $2.99/mo (10 extractions, AI cook assistant) · Plus $6.99/mo (50 extractions, 100 AI assistant msgs) | Extraction quota, AI cooking assistant volume |
| Recipe Notes | Free-forever + optional Pro | Unlimited social + web imports, cloud sync, no ads | "Pro" tier (price not publicly disclosed; positioned at power users / families) | Power-user / family features (unspecified) |
| Recipe Bro | ? | ? (vendor does not publish a free-tier cap) | ? | ? |
| Cookmark | Freemium one-time unlock | 10 recipe slots | One-time Premium unlock (price ?) for unlimited storage + future features | Storage cap, future feature drops |
| rmnd | Subscription with trial | 7-day full-feature trial | Recurring subscription (price ?) | All features after trial expires |
| Inspo — AI Recipe Keeper | Freemium subscription + lifetime IAP | Limited saves, ads, no AI gen | IAPs at $4.99, $19.99, $29.99 (likely weekly / yearly / lifetime) | Unlimited saves, AI recipe gen, photo/camera import, nutrition info |
| Recipe One | One-time / lifetime + optional subscription | Limited functional free tier | ~$15 one-time mentioned; $59.99/yr alternative tier referenced in reviews | Lifetime access vs subscription-gated extras |
| Crouton | Freemium one-time + subscription | 20 recipe limit free | Crouton Plus $3 one-time (remove cap) · Pro: $14.99/yr or $24.99 lifetime (one reviewer cites $8.99/yr historic price) | Storage cap, advanced features, meal planner extras |
| Cooking Guru | Freemium subscription (web) | 5 conversions/wk; free TikTok/IG/YouTube converters | Pro: unlimited conversions + premium features (price ?) | Conversion quota, premium features |

## Common patterns

- **Freemium with a hard import cap** is the dominant shape (ReciMe, Cookmark, Crouton, Pluck, Inspo, Cooking Guru). The cap is almost always on *saves* or *extractions*, not feature access — i.e. the bottleneck is the recurring cost of AI inference, exactly the cost we quantify in [P1](unit-economics.md).
- **Subscription pricing clusters at $2.99–$6.99/mo or $14.99–$59.99/yr.** ReciMe sits at the top of the band ($59.99/yr) and bundles a meal planner; the cheaper end ($2.99–$4.99/mo) is bare-bones recipe extraction.
- **Lifetime / one-time unlocks are still alive** but increasingly rare — Crouton ($24.99 lifetime), Recipe One (~$15 one-time mentioned), Pestle (lifetime tier), Cookmark (one-time Premium), Inspo (likely $29.99 lifetime IAP). These appeal to anti-subscription users; vendors keep them because the extraction-cost bottleneck still applies (Pluck explicitly avoids lifetime to fund per-recipe AI cost).
- **Truly free-forever with no Pro tier** is rare and almost always a marketing claim with an asterisk. Recipe Notes is the cleanest example (free unlimited + optional Pro). It is structurally hard to sustain without ads or BYOK if every save burns AI tokens.
- **No competitor surfaced uses an explicit BYOK model.** All "free unlimited" claims rely on a hidden Pro tier, ads, or VC-subsidised inference. This is a wedge for ReciGrams if option 2 of [C1](../TASKS.md#c1--move-api-keys-off-the-client-critical) is chosen.
- **App Store / Play Store take (15–30%)** applies to every subscription cell above. Lifetime / one-time IAPs incur the same cut. Web-based tools (Cooking Guru) avoid the cut by billing through Stripe directly.
- **Ad-funded recipe apps are absent from the social-extraction segment.** Ads dominate the legacy "search-our-database" recipe apps but no AI-extraction competitor relies on them as the primary monetisation lever — likely because AI cost per import is too high for ad RPMs to cover.

## Sources

- ReciMe — https://recime.app/help/en/articles/11630592-how-much-does-the-recime-subscription-cost , https://www.recipeone.app/blog/is-recime-app-free , https://www.recipeone.app/blog/recime-app-review
- Pestle — https://pestleapp.com/ , https://pluckrecipes.com/blog/best-recipe-apps-compared/ , https://www.macstories.net/reviews/pestle-1-2-the-macstories-review/
- Flavorish — https://www.flavorish.ai/ , https://play.google.com/store/apps/details?id=ai.flavorish.app
- Pluck — https://pluckrecipes.com/ , https://pluckrecipes.com/best-recipe-app/
- Recipe Notes — https://recipenotes.app/ , https://recipenotes.app/best-free-recipe-manager-app
- Recipe Bro — https://recipebro.com/ (pricing not publicly disclosed at fetch time)
- Cookmark — https://www.getcookmark.com/ , https://apps.apple.com/us/app/cookmark-recipe-bookmark/id6758881711
- rmnd — https://r-m-n-d.com/
- Inspo — https://apps.apple.com/us/app/inspo-ai-recipe-keeper/id6736347122 , https://mwm.ai/apps/inspo-ai-recipe-keeper/6736347122
- Recipe One — https://www.recipeone.app/ , https://www.recipeone.app/blog/best-recipe-manager-apps
- Crouton — https://crouton.app/ , https://toolsandtoys.net/crouton-recipe-and-meal-planner-app-for-iphone-ipad/ , https://www.tapsmart.com/apps/review-crouton/
- Cooking Guru — https://cooking.guru/pricing , https://cooking.guru/
- Cross-references — https://trypeel.app/blog/best-recipe-organizer-apps-2026 , https://www.drizzlelemons.com/blog/recipe-apps-without-subscriptions
