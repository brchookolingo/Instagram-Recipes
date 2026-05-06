# R2 — Competitor Feature Matrix (2026-05-06)

Comparison of the 12 direct competitors enumerated in [R1](competitors.md). Cells: **Y** = explicitly advertised by the vendor (website / App Store / Play Store / press coverage), **N** = vendor explicitly states it isn't supported or the product category precludes it (e.g. web-only tool with no offline storage), **?** = no public confirmation either way (do not infer from category norms).

## Feature matrix

| Name | IG | TikTok | Pinterest | Web URL | AI extract | Scaling | Grocery list | Collections / folders | Offline storage | Dark mode | Sharing / export |
|------|----|--------|-----------|---------|------------|---------|--------------|----------------------|-----------------|-----------|------------------|
| ReciMe | Y | Y | Y | Y | Y | Y | Y | Y (Cookbooks) | ? | ? | Y (in-app + grocery delivery hand-off) |
| Pestle | Y | Y | ? | Y | Y (on-device) | Y (with auto unit conversion) | Y (Reminders integration) | Y (folders) | Y | Y | Y (import from Paprika/Crouton/Mela/Pepperplate) |
| Flavorish | Y | Y | Y | Y | Y | Y | Y (aisle/recipe grouped) | Y | ? | ? | ? |
| Pluck | Y | Y | ? | Y | Y (multi-modal: video/audio/text) | Y (AI-assisted) | ? | Y (tags + filters) | Y | ? | Y (Share Sheet input) |
| Recipe Notes | Y | Y | Y | Y | Y | ? | Y | Y (custom collections) | Y (cloud-backed) | ? | Y (one-tap save from anywhere) |
| Recipe Bro | Y | Y | ? | Y | Y | ? | ? | ? | ? | ? | ? |
| Cookmark | Y | Y | Y | Y | Y | ? | Y (categorised) | Y (categories) | ? | ? | ? |
| rmnd | Y | Y | Y | Y | Y | ? | Y (long-press add, grouped by recipe) | Y (custom themes/cuisines) | Y | ? | ? |
| Inspo — AI Recipe Keeper | Y | Y | ? | ? (Safari share only) | Y (auto-categorise) | Y (incl. metric/imperial) | Y (auto-generated) | Y (folders) | ? | ? | Y (PDF export) |
| Recipe One | Y | Y | ? | Y | Y | Y | Y | Y (cookbooks) | ? | ? | Y (cross-device sync) |
| Crouton | ? (no first-class IG flow advertised) | ? (community workaround only) | ? | Y | Y (OCR + LLM for cookbooks) | Y | Y (Reminders) | Y | ? | ? | Y (iCloud sync, Reminders) |
| Cooking Guru | Y | Y | ? | ? (YouTube Shorts only) | Y (frame-by-frame) | ? | ? | Y (auto-categorised by cuisine/meal/diet) | N (web-only, account-based) | ? | Y (share to friends/family) |

## Where ReciGrams stands out / lags

ReciGrams' clearest moat is the combination it ships today: **explicit Pinterest support** (only ~half of competitors confirm it), **scale-aware grocery lists** (most advertise scaling and grocery lists separately, but few couple them so the shopping list reflects the chosen ½×/1×/2× factor), and **MMKV-backed offline-first storage** with **collections, dark mode tokens, and a clipboard-listener share flow** all in one cross-platform RN app. Pestle and Pluck are the only competitors that match ReciGrams on offline storage *plus* multi-source AI extraction, and Pestle is iOS-only while Pluck is import-quota-gated behind a paywall. Where ReciGrams lags: it has no meal planner (ReciMe, Pestle, Crouton, Cookmark all ship one), no on-device-only AI option (Pestle's privacy story is stronger), no cookbook OCR (Flavorish, Crouton, Recipe One), no nutrition extraction (rmnd, Cooking Guru, Inspo), and no PDF export (Inspo) or hands-free cooking mode (Crouton, Pestle, rmnd). Dark mode is only "partial" today — every premium-tier competitor that mentions theming treats it as table-stakes, so finishing the token migration is a defence move, not a differentiator.

## Sources

- ReciMe — https://www.recime.app/ , https://recime.app/help/en/articles/11661452-import-from-tiktok , https://recime.app/help/en/articles/11596425-import-from-instagram , https://recime.app/help/en/articles/11596272-how-can-i-get-the-most-out-of-recime
- Pestle — https://pestleapp.com/ , https://apps.apple.com/us/app/pestle-recipe-manager/id1574776971 , https://techcrunch.com/2024/11/25/pestle-recipe-app-can-now-save-dishes-from-tiktok/ , https://www.macstories.net/reviews/pestle-1-2-the-macstories-review/
- Flavorish — https://www.flavorish.ai/ , https://www.flavorish.ai/blog/save-recipes-from-social-media-with-flavorish , https://apps.apple.com/us/app/flavorish-save-any-recipe/id6478546136
- Pluck — https://pluckrecipes.com/ , https://play.google.com/store/apps/details?id=com.pluckrecipes.app
- Recipe Notes — https://recipenotes.app/ , https://recipenotes.app/how-to-import-recipes-from-instagram , https://recipenotes.app/how-to-import-recipes-from-tiktok , https://recipenotes.app/how-to-import-recipes-from-pinterest
- Recipe Bro — https://recipebro.com/
- Cookmark — https://www.getcookmark.com/ , https://apps.apple.com/us/app/cookmark-recipe-bookmark/id6758881711
- rmnd — https://r-m-n-d.com/
- Inspo — https://apps.apple.com/us/app/inspo-ai-recipe-keeper/id6736347122 , https://apps.apple.com/us/app/inspo-recipes-meal-planner/id6736347122
- Recipe One — https://www.recipeone.app/ , https://www.recipeone.app/blog/best-recipe-saver-app , https://www.recipeone.app/blog/best-recipe-manager-apps
- Crouton — https://crouton.app/ , https://apps.apple.com/us/app/crouton-recipe-manager/id1461650987
- Cooking Guru — https://cooking.guru/ , https://cooking.guru/convert , https://cooking.guru/recipe
