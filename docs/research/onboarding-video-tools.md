# Onboarding Video Tools — VID1 Research

**Date:** 2026-05-06
**Goal:** Replace the 4 static onboarding slides in `app/onboarding.tsx` with short (~10–20s) portrait (9:16) demo videos that play inside the React Native app.
**Constraint:** Optimize for free or low-cost, no watermark on free where possible, good fit for "show app screens with voiceover."

---

## Tool Comparison

| # | Name | Category | Input style | Output quality | Free tier | Watermark (free) | Paid starting (USD/mo) | Fit for use case |
|---|------|----------|-------------|----------------|-----------|------------------|------------------------|------------------|
| 1 | Screen Studio | Screen-cap (Mac) | Screen recording + auto polish | High | Record/edit free; **export requires paid** | N/A (no free export) | $9/mo (annual) or $229 lifetime | Great |
| 2 | Tella | Screen-cap (web) | Screen + camera recording | Mid–High | 10 videos lifetime, watermarked | Y | $12/mo (annual) | Good |
| 3 | Arcade | Interactive demo / screen-cap | Screen capture, click-through | Mid (more "demo" than cinematic) | 3 demos, 200 AI credits/mo, MP4 export Pro-only | Y | $27.20/user/mo (annual) | OK (more product-tour than video) |
| 4 | Descript | Screen-cap + AI editor | Screen recording + transcript editing + AI voice | High | 60 min/mo, watermarked exports (1 watermark-free/mo at 720p) | Y | $24/user/mo (Hobbyist) | Great |
| 5 | Synthesia | AI avatar | Script -> avatar video | Mid–High (avatar) | 10 min/mo, watermarked, 9 avatars | Y | $29/mo (Starter) | Poor (avatar talks at camera, doesn't show app) |
| 6 | HeyGen | AI avatar | Script -> avatar video | High (avatar) | 3 videos/mo, 3 min each, 720p, watermarked | Y | ~$24/mo (Creator) | Poor (same: avatar-centric) |
| 7 | ElevenLabs | AI voice (pair w/ screen capture) | Text -> voiceover | High | 10k credits/mo (~10 min audio), no commercial use without attribution | N (audio; attribution required) | $5/mo (Starter) | Great (as voiceover layer) |
| 8 | Runway (Gen-4 / Gen-4 Turbo) | Text-to-video | Prompt or image-to-video | High (cinematic, but not UI-faithful) | 125 one-time credits (~25s of Gen-4 Turbo), 720p | Y | $12/mo (annual Standard) | Poor (can't reliably render real app UI) |
| 9 | OpenAI Sora 2 / Pro | Text-to-video | Prompt or image-to-video | High | None standalone; ChatGPT Plus required | Y (visible on most exports) | $20/mo (Plus, 480p unlimited) | Poor (same TTV limitation; UI hallucination) |
| 10 | Google Veo 3 / 3.1 | Text-to-video | Prompt | High | Limited free tier in Gemini/Flow (~10–20 generations); 8s max per clip | Y (SynthID + visible) | $19.99/mo (Google AI Pro, ~90 Veo 3.1 Fast/mo) | Poor (8s cap, no real app UI) |
| 11 | Pika 2.x | Text-to-video | Prompt or image-to-video | Mid | 80 credits/mo, 480p, 5–10s clips | Y | $10/mo (Standard) | Poor (low res, watermark, hallucinated UI) |

Notes:
- "Fit" judged specifically against the use case: **portrait video showing real ReciGrams screens, with voiceover, ~10–20s, embeddable in the app**.
- TTV models (Runway / Sora / Veo / Pika) cannot faithfully reproduce a specific app's UI; they're disqualified for screen-walkthrough onboarding even though their headline quality is highest.
- Avatar tools (Synthesia / HeyGen) talk *about* the app but don't show it, unless paired with a separate screen recorder — at which point you've duplicated the screen-cap workflow with extra cost.

---

## Shortlist (Top 3)

1. **Screen Studio** — Best polish-per-dollar for portrait Mac screen recordings: auto-zoom on cursor, smooth motion, clean export. The free tier blocks export, but the $9/mo annual or $229 lifetime is easily the lowest TCO for 4 high-quality onboarding clips that you'll re-render rarely.
2. **Descript** — Strong second pick because the script-driven workflow (record screen, edit by editing the transcript, regenerate AI voiceover) matches the "show app screens with voiceover" use case end-to-end in one tool; free tier yields one watermark-free 720p export per month, which can produce all 4 onboarding clips over 4 months at $0.
3. **ElevenLabs (paired with QuickTime / iOS screen recording)** — Cheapest path to broadcast-quality voiceover ($5/mo Starter unlocks commercial rights). Combine with a free OS-level screen recorder for a $5/mo total stack with no watermark, useful as a fallback if Screen Studio / Descript don't fit.

---

## Sources

- [Screen Studio Pricing 2026 — Scribe](https://scribehow.com/page/Screen_Studio_Pricing_Plans_2026_dollar9Mo_dollar229_Lifetime_and_Student_Discounts_Explained__erhQ-2YGSm-VDi7ds2r-HA)
- [Tella Pricing — tella.com](https://www.tella.com/pricing)
- [Tella Plans Help](https://www.tella.tv/help/introduction/plans)
- [Arcade Pricing 2026 — arcade.software blog](https://www.arcade.software/post/arcade-pricing)
- [Arcade Pricing — supademo comparison](https://supademo.com/blog/arcade-pricing)
- [Descript Pricing 2026 — gptprompts.ai](https://gptprompts.ai/ai-pricing/descript-pricing)
- [Descript Pricing — descript.com](https://www.descript.com/pricing)
- [Synthesia Pricing — synthesia.io](https://www.synthesia.io/pricing)
- [Synthesia Free Plan breakdown — autogpt.net](https://autogpt.net/synthesia-free-plan-what-you-actually-get-for-0/)
- [HeyGen Pricing FAQ](https://help.heygen.com/en/articles/9204682-heygen-pricing-plans-and-subscriptions-explained-what-you-need-to-know)
- [HeyGen Pricing 2026 — Arcade blog](https://www.arcade.software/post/heygen-pricing)
- [ElevenLabs Pricing 2026 — BIGVU](https://bigvu.tv/blog/elevenlabs-pricing-2026-plans-credits-commercial-rights-api-costs)
- [ElevenLabs Pricing — gptprompts.ai](https://gptprompts.ai/ai-pricing/elevenlabs-pricing)
- [Runway Pricing — runwayml.com](https://runwayml.com/pricing)
- [Runway Pricing Guide 2026 — Get AI Perks](https://www.getaiperks.com/en/articles/runway-pricing)
- [Sora 2 Pricing Guide — costgoat.com](https://costgoat.com/pricing/sora)
- [Sora Billing FAQ — OpenAI](https://help.openai.com/en/articles/10245774-sora-billing-faq)
- [Veo 3 Pricing 2026 — veo3ai.io](https://www.veo3ai.io/blog/veo-3-pricing-2026)
- [Google Flow Pricing — MindStudio](https://www.mindstudio.ai/blog/google-flow-pricing-credits-tiers-explained)
- [Pika Pricing — pika.art](https://pika.art/pricing)
- [Pika Pricing 2026 — Flowith](https://flowith.io/blog/pika-art-pricing-2026-free-vs-basic-vs-pro/)
