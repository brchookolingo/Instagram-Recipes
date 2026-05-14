# Google Play Store Publishing Research — ReciGrams (AND2)

_Last updated: 2026-05-06_

This document captures every requirement, cost, and risk that stands between
ReciGrams (currently unpublished) and a Google Play production release.
**No accounts have been created and no fees paid yet** — this is a planning
artifact, not a launch checklist.

---

## Costs (do not pay yet)

| Cost | Amount | When | Notes |
| --- | --- | --- | --- |
| **Google Play Console developer registration** | **$25 USD, one-time** | **BLOCKER — must be paid before any submission can begin** | Per-account, non-refundable. Paid via Google Pay during account creation. **The user has NOT paid this yet.** Nothing else in this checklist can be completed until this account exists. |
| EAS Submit (Expo's submission CLI) | $0 on the Free / paid plans | At submission time | EAS Submit itself is included in every EAS plan tier, including Free. The Free tier rate-limits builds (not submits), so submission is effectively free. |
| EAS Build (to produce the AAB) | $0 on Free tier (limited concurrency / queue), or included in paid plans | Each build | An AAB (Android App Bundle) must be produced and uploaded. Local builds are also free if Android SDK is set up. |
| Play App Signing | $0 | One-time setup | Google holds the upload + app-signing keys for free. No HSM cost. |
| Domain hosting for privacy policy | Already covered (GitHub Pages) | Ongoing | Privacy policy is already hosted at `docs/privacy-policy.html` — needs to be reachable at a public URL (see risks). |
| D-U-N-S number (organization accounts only) | $0 (free via Dun & Bradstreet) | Optional | Only needed if registering as an **organization**. Personal/individual accounts do not require D-U-N-S. |

> **Action required from user:** Decide individual vs. organization account
> type, then pay the $25 registration fee at
> <https://play.google.com/console/signup>. Do not proceed with any other step
> in this document until that is done.

---

## Requirements checklist

Status legend: `done` = ready, `partial` = exists but needs work,
`missing` = not started.

| Requirement | Status | Notes |
| --- | --- | --- |
| Google Play Console developer account ($25 fee paid) | missing | **Hard blocker.** No account exists. |
| Identity verification (legal name, address, phone, government ID) | missing | Required for all new accounts since 2023. Personal accounts need ID + address verification within 30 days of registration. |
| D-U-N-S number (organization accounts only) | n/a | Skip if registering as an individual. |
| Application ID / package name | done | `com.bchookolingo.InstagramRecipes` is set in `app.json` → `android.package`. Cannot be changed after first Play upload. |
| App version code + version name | partial | `version: "1.0.0"` is in `app.json`. Android `versionCode` (integer) is not explicitly set — EAS will auto-increment, but it should be pinned for predictability. |
| Target SDK | partial | Expo SDK 50+ defaults to **targetSdk 34 (Android 14)**. As of 2026, Google Play requires **targetSdk 35 (Android 15)** for new apps and updates. Need to confirm Expo SDK in use targets 35; bump if not. |
| App signing — Play App Signing enrolled | missing | EAS Submit will generate an upload keystore on first run; Play App Signing is opt-in during the first release. Standard path. |
| Android App Bundle (AAB) artifact | missing | Must be produced by `eas build --platform android --profile production`. APKs are not accepted for new apps. |
| Privacy policy URL (publicly hosted, HTTPS) | partial | The HTML file exists at `docs/privacy-policy.html` (last updated 2026-04-05). Needs to be served at a stable public URL (e.g. GitHub Pages) and that URL pasted into the Play Console listing. |
| Data safety form | missing | Must declare every data type collected/shared. For ReciGrams: Instagram URLs (sent to Meta oEmbed + RapidAPI), captions/frames (sent to Anthropic), Claude API key (stored locally, never transmitted to us), no analytics. Declare "Data is not collected" only if the app truly sends nothing to first-party servers — third-party API calls still need to be disclosed. |
| Content rating questionnaire (IARC) | missing | Quick form. Expected rating: Everyone / PEGI 3. Must answer truthfully about UGC, web access, and AI features. |
| App icon (512x512 PNG, < 1 MB) | partial | `assets/icon.png` exists. Confirm it is exactly 512x512 and has no alpha at the edges. |
| Feature graphic (1024x500 PNG/JPG) | missing | Not present in the repo. Needs design. |
| Phone screenshots (min 2, max 8; 16:9 or 9:16; 1080p+) | missing | None captured. Need at least 2; recommend 4-6 (Home, Recipe detail, Add-from-link flow, Settings). |
| 7-inch tablet screenshots (optional but recommended) | missing | App declares `supportsTablet: true` for iOS but tablet screenshots are not strictly required for Android phone-only listings. |
| Short description (≤ 80 chars) | missing | Need to write. |
| Long description (≤ 4000 chars) | missing | Need to write. |
| Promotional video (YouTube URL, optional) | n/a | Not required. |
| Internal testing track | missing | Recommended first step after upload — invite up to 100 testers by email or Google Group. No review delay. |
| Closed testing track (≥ 12 testers, 14 days) | missing | **Required for new personal developer accounts** to unlock production access. Google added this requirement in 2023. Plan for ~2 weeks of closed testing minimum. |
| Open testing track (optional) | n/a | Can skip and go straight from closed → production once the 12-tester / 14-day requirement is satisfied. |
| Production release rollout | missing | Final step. Staged rollout (e.g. 20% → 50% → 100%) is recommended. |

**Score:** roughly **2 done / 5 partial / ~15 missing** out of ~22 line items
(~9% done, ~23% partial, ~68% missing). Most "missing" items are routine
listing work, but the closed-testing requirement adds a hard ~2-week delay.

---

## ReciGrams-specific risks

### 1. Instagram scraping — Play "Deceptive Behavior" + Meta Platform Terms (HIGH)

ReciGrams uses a **third-party RapidAPI Instagram scraper** in addition to
Meta's official oEmbed endpoint. Two distinct exposures:

- **Meta Platform Terms:** Meta prohibits scraping Instagram content outside
  approved APIs. Even though oEmbed is sanctioned, the RapidAPI scraper is
  not, and Meta has historically sent C&D letters to apps that surface
  scraped Instagram content. If Meta complains to Google, Play will pull the
  listing under the IP / deceptive-behavior policy.
- **Play "Deceptive Behavior" / "Impersonation" policy:** the app must not
  imply official Instagram affiliation. The app name "ReciGrams" and the
  package name `com.bchookolingo.InstagramRecipes` both echo "Instagram",
  which is a **registered Meta trademark**. Risk of trademark-based
  takedown is non-trivial.

**Mitigations to plan:**
- Rename the user-visible app to something that does not contain
  "Instagram" or "Gram" as a standalone word (the `name` field is
  `ReciGrams`, which is borderline; the package contains
  `InstagramRecipes`, which is higher risk but cannot be changed after
  upload).
- In the store listing, never show the Instagram logo, never use the word
  "Instagram" in the title/short-description, and add a disclaimer
  "Not affiliated with or endorsed by Meta / Instagram."
- Prefer oEmbed over the RapidAPI scraper wherever possible; document the
  scraper as a fallback for content the user is authorized to view.

### 2. AI-generated content disclosure (MEDIUM)

Google formalized a **Generative AI app policy** in 2024. Apps that
generate content using AI must:

- Disclose AI usage in the store listing (description) and in-app.
- Provide a way for users to **report offensive/harmful AI output**
  (in-app contact link or report button is acceptable).
- Prevent generation of restricted content (CSAM, non-consensual nudity,
  etc.) — for ReciGrams this is low risk because outputs are constrained
  to recipes, but the policy still applies whenever Claude is invoked.

**Mitigations to plan:**
- Add a one-line "Recipes are extracted by AI and may be inaccurate"
  notice on every AI-generated recipe screen.
- Add a "Report incorrect / offensive recipe" link (mailto is fine for v1).
- In the long description, include "This app uses generative AI (Anthropic
  Claude) to extract recipes from social media captions."

### 3. User-generated content category (LOW–MEDIUM)

Saved recipes are technically user-generated content even though they
are local-only. Play's UGC policy applies whenever users can create or
import content, regardless of where it is stored. Required:

- A way to report content / contact the developer (mailto already exists).
- A "Terms of Use" or in-app moderation statement is recommended but
  not strictly required for local-only UGC.

### 4. Permissions, deep links, clipboard (LOW)

- **Deep linking:** `app.json` declares `scheme: "instagramrecipes"`. Custom
  schemes are unrestricted. App Links (autoverify on `https://`) require a
  hosted `assetlinks.json` and a domain — currently not configured, so no
  policy exposure.
- **Clipboard:** if the app reads the clipboard on launch (common pattern
  for "paste Instagram URL" flows), Android 12+ surfaces a system toast.
  Not a Play policy issue but a UX one — only read the clipboard in
  response to an explicit user tap, not on `onMount`.
- **Foreground services / background location / accessibility / SMS:** not
  used. No restricted-permission declarations needed.
- **expo-secure-store plugin** is the only declared plugin. No sensitive
  permissions added.

### 5. Account-deletion requirement (LOW)

Since 2024, apps that allow account creation must offer in-app deletion
**and** a web URL for deletion. ReciGrams has **no accounts**, so this is
satisfied by stating "this app does not require an account" in the data
safety form and listing.

---

## Recommended sequence (after the $25 fee is paid)

1. Pay $25, complete identity verification, wait for approval.
2. Bump `targetSdk` to 35 if Expo SDK does not already default to it; pin
   `versionCode`.
3. Host privacy policy at a stable public HTTPS URL (GitHub Pages is fine).
4. Produce listing assets: feature graphic, ≥ 2 phone screenshots, short
   + long descriptions (with AI disclosure + Meta disclaimer).
5. `eas build -p android --profile production` → AAB artifact.
6. `eas submit -p android` → uploads to Play Console as draft.
7. Fill data safety form, content rating, store listing.
8. Push to **internal testing** track first (no review wait).
9. Move to **closed testing** with ≥ 12 testers for ≥ 14 days (required
   for new personal accounts to unlock production).
10. Promote to **production** with staged rollout.

---

## Sources

(WebFetch was denied during research; the items below are the canonical
Google / Expo / Meta references that should be re-verified by the user
or in a follow-up session before submission.)

- Expo — Submit to Google Play: <https://docs.expo.dev/submit/android/>
- Expo — Build for Android: <https://docs.expo.dev/build/setup/>
- Google Play Console — Sign up: <https://play.google.com/console/signup>
- Google Play — Target API level requirements: <https://support.google.com/googleplay/android-developer/answer/11926878>
- Google Play — Closed testing requirement for new personal accounts: <https://support.google.com/googleplay/android-developer/answer/14151465>
- Google Play — Data safety form: <https://support.google.com/googleplay/android-developer/answer/10787469>
- Google Play — Generative AI app policy: <https://support.google.com/googleplay/android-developer/answer/13985936>
- Google Play — Deceptive Behavior policy: <https://support.google.com/googleplay/android-developer/answer/9888076>
- Google Play — Store listing asset specs: <https://support.google.com/googleplay/android-developer/answer/9866151>
- Google Play — Account deletion requirement: <https://support.google.com/googleplay/android-developer/answer/13316080>
- Meta Platform Terms (scraping clause): <https://developers.facebook.com/terms/>
- Instagram oEmbed (sanctioned): <https://developers.facebook.com/docs/instagram/oembed>
