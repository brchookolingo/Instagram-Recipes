# Android Local Testing — ReciGrams

> Task AND1 deliverable. How to run ReciGrams on Android locally without paying for anything (no EAS Build credits required, no Play Console account, no paid emulator service). All tooling below is free.
>
> Project state at time of writing: Expo SDK `~55.0.0`, React Native `0.83.4`, New Architecture enabled (`newArchEnabled: true`), `expo-router` ^55, `react-native-mmkv` ^4, `react-native-nitro-modules` ^0.35, `react-native-reanimated` ~4.2, `react-native-worklets` ^0.7.

---

## Overview

There are two free local-testing paths for ReciGrams on Android:

1. **Android emulator (AVD)** — fastest dev loop, runs on the same machine as the Metro bundler. Requires Android Studio + a free system image.
2. **Physical Android device over USB or Wi-Fi (ADB)** — required for testing real-world clipboard / share-sheet / Instagram intent behaviour, camera, biometrics, and gesture feel.

Both paths build a **development client** (a.k.a. dev client) of the app locally with `npx expo run:android` — Expo Go is **not** an option for ReciGrams (see [Expo Go vs dev client](#expo-go-vs-dev-client) below). The first `run:android` invocation does a Gradle build (slow, 5–15 min). After that, JS reloads via Metro are instant.

---

## Prerequisites

All free.

| Tool | Version | Notes |
| --- | --- | --- |
| Node.js | ≥ 20.x LTS | Match local `.nvmrc` if present. Expo SDK 55 requires Node ≥ 20. |
| Android Studio | Koala (2024.1) or newer | Free download from `developer.android.com/studio`. Do **not** need IntelliJ Ultimate. |
| Android SDK Platform | API 34 (Android 14) minimum, API 35 recommended | Installed via Android Studio → **SDK Manager**. |
| Android SDK Build-Tools | 34.0.0+ | Same SDK Manager screen. |
| Android Emulator + Platform-Tools (`adb`) | latest | Same SDK Manager screen. |
| JDK | 17 (bundled with Android Studio as “Embedded JDK”) | Expo SDK 55 / RN 0.83 requires Java 17. Set `JAVA_HOME` to the embedded JDK path. |
| Expo CLI | local only — use `npx expo` | Do **not** install the deprecated global `expo-cli`. The local CLI ships with the `expo` package (`~55.0.0`). |
| `eas-cli` | ≥ 18.5.0 | Optional. Only needed if you ever want a cloud build. Local dev does not require it. `eas.json` already pins `>= 18.5.0`. |

### Environment variables to set (zsh / bash)

```bash
export ANDROID_HOME="$HOME/Library/Android/sdk"        # macOS default
export PATH="$PATH:$ANDROID_HOME/platform-tools:$ANDROID_HOME/emulator"
export JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"
```

(Linux: `~/Android/Sdk`. Windows: `%LOCALAPPDATA%\Android\Sdk`.)

Verify: `adb --version`, `java -version`, `npx expo --version`.

---

## Emulator path

1. **Open Android Studio → More Actions → Virtual Device Manager → Create Device.**
2. **Hardware profile:** Pixel 7 or Pixel 8 (covers edge-to-edge / predictive-back / cutout — important since `app.json` sets `edgeToEdgeEnabled: true`).
3. **System image:** API 35 (Android 15) **with Google APIs** (not “Google Play” unless you need the Play Store on the emulator — Play images can’t be rooted but are fine for ReciGrams). Pick an `arm64-v8a` image on Apple Silicon, `x86_64` on Intel/AMD.
4. **AVD options:** RAM 2–4 GB, Internal storage 4 GB, Graphics: Hardware – GLES 2.0.
5. Boot the AVD once from Android Studio to verify it works, then close it (or leave it running).
6. From the repo root:

   ```bash
   npx expo run:android        # first build OR after native deps change
   ```

   This runs a local Gradle build, installs the resulting `.apk` (the **dev client**) onto the running emulator, and starts Metro.

7. For subsequent JS-only changes:

   ```bash
   npx expo start --android    # opens the already-installed dev client
   ```

### `expo run:android` vs `expo start --android`

| Command | When to use | What it does |
| --- | --- | --- |
| `npx expo run:android` | First-ever run, after adding/removing/upgrading any native dep, after editing `app.json` plugins, after upgrading Expo SDK | Runs `prebuild` → `gradlew assembleDebug` → installs APK → starts Metro |
| `npx expo start --android` | Day-to-day JS work | Just starts Metro and tells the already-installed dev client to connect |

If `start --android` complains it can’t find the dev client, fall back to `run:android`.

---

## Physical device path

### USB debugging (most reliable)

1. On the Android device: **Settings → About phone → Build number** — tap 7 times to unlock Developer options.
2. **Settings → System → Developer options → USB debugging** → On.
3. Plug the device in via USB. The device shows an “Allow USB debugging?” prompt — tick **Always allow from this computer**, tap **Allow**.
4. On the dev machine: `adb devices` — should list the device with status `device` (not `unauthorized`).
5. From repo root: `npx expo run:android` — same command as the emulator path. Expo CLI auto-detects the connected device.

### Wireless debugging (Android 11+)

Useful when you don’t want a cable, or need to test something USB-blocking (e.g., the device is in a phone mount).

1. **Settings → Developer options → Wireless debugging** → On.
2. Tap **Pair device with pairing code**. Note the IP, port, and 6-digit code.
3. On the dev machine:

   ```bash
   adb pair <IP>:<PAIR_PORT>
   # paste the 6-digit code when prompted
   adb connect <IP>:<CONNECT_PORT>   # different port, shown on the main Wireless debugging screen
   adb devices                        # confirm device is listed
   ```

4. `npx expo run:android` as usual.

The pairing code is one-time but the connection survives Wi-Fi drops within the same network. After a reboot of either side, repeat `adb connect <IP>:<CONNECT_PORT>` (no re-pairing needed).

---

## Expo Go vs dev client

`react-native-mmkv` and `react-native-nitro-modules` ship native C++/JSI code that is **not** included in the Expo Go app binary. As soon as a dependency uses an unsupported native module, the project must use a **development build** (dev client).

| Dependency | Works in Expo Go? | Notes |
| --- | --- | --- |
| `expo` ~55.0.0 | ✅ | Core. |
| `expo-router` ^55 | ✅ | Bundled in Expo Go. |
| `expo-clipboard` ^55 | ✅ | Bundled. |
| `expo-constants` ^55 | ✅ | Bundled. |
| `expo-crypto` ~55 | ✅ | Bundled. |
| `expo-file-system` ^55 | ✅ | Bundled. |
| `expo-image` ^55 | ✅ | Bundled. |
| `expo-linking` ^55 | ✅ | Bundled. |
| `expo-secure-store` ~55 | ✅ | Bundled in Expo Go. (`app.json` plugin entry is harmless there.) |
| `expo-status-bar` ~55 | ✅ | Bundled. |
| `expo-system-ui` ^55 | ✅ | Bundled. |
| `expo-video-thumbnails` ~55 | ✅ | Bundled. |
| `react-native-gesture-handler` ~2.30 | ✅ | Bundled. |
| `react-native-safe-area-context` ~5.6 | ✅ | Bundled. |
| `react-native-screens` ~4.23 | ✅ | Bundled. |
| `react-native-reanimated` ~4.2 | ✅ | Bundled, but Reanimated 4 requires Worklets (below) — which is **not** in Expo Go. |
| `react-native-worklets` ^0.7 | ❌ | Required by Reanimated v4. Standalone native module — needs dev client. |
| **`react-native-mmkv` ^4** | ❌ | Native JSI module on top of Nitro. Not in Expo Go. |
| **`react-native-nitro-modules` ^0.35** | ❌ | Native bridging layer. Not in Expo Go. |
| `nativewind` ^4 | ✅ | JS-only at runtime. |
| `@anthropic-ai/sdk` ^0.82 | ✅ | JS-only. |
| `zustand`, `zod` | ✅ | JS-only. |

**Conclusion: ReciGrams cannot run in Expo Go.** A development client built locally with `npx expo run:android` is mandatory because of `react-native-mmkv`, `react-native-nitro-modules`, and `react-native-worklets`. The `eas.json` already has a `development` profile with `developmentClient: true`, but you do not need to use EAS — local Gradle builds produce the same dev-client APK for free.

---

## `EXPO_PUBLIC_*` env handling

Expo inlines any environment variable prefixed with `EXPO_PUBLIC_` at **bundle time** (Metro). The behaviour differs slightly per build path:

| Build path | How `EXPO_PUBLIC_*` is read |
| --- | --- |
| Local dev client (`npx expo run:android`) | Metro reads `.env`, `.env.local`, `.env.development`, `.env.development.local` from the repo root and inlines matching `EXPO_PUBLIC_*` values into the JS bundle. Restart Metro after editing `.env`. |
| `npx expo start --android` (subsequent runs) | Same — Metro re-reads `.env` files when it starts. JS-only Fast Refresh does **not** pick up `.env` changes; you must stop & restart Metro. |
| Expo Go | N/A for this project (Expo Go isn’t supported), but the same `.env` inlining would apply. |
| Production build | `.env.production` / `.env.production.local` take precedence. EAS Build pulls env vars from the EAS dashboard at build time; local production `npx expo run:android --variant release` reads the local files. |

### Conventions

- Files are loaded in this order (later wins): `.env`, `.env.local`, `.env.<env>`, `.env.<env>.local`.
- Only `EXPO_PUBLIC_*` vars are inlined into the bundle. Anything else is server-only and must be plumbed through a different mechanism (e.g., a backend proxy).
- **Secrets are not safe in `EXPO_PUBLIC_*`.** They end up in the shipped JS bundle and are extractable from the APK. Use `expo-secure-store` for per-device secrets and a backend for shared secrets.
- Add `.env*.local` to `.gitignore` (already standard for Expo).

---

## Android-specific gotchas

- **Clipboard read on focus.** Android 12+ shows a system toast (“… pasted from your clipboard”) every time `Clipboard.getStringAsync()` is called. ReciGrams uses `expo-clipboard` for its “share→paste” flow; expect the toast on every foreground. Do not poll the clipboard on a timer — Android will throttle and Google Play will reject in review later. Read it once on app foreground / on user tap.
- **`expo-linking` deep links.** `app.json` sets `"scheme": "instagramrecipes"`. Test with `adb shell am start -W -a android.intent.action.VIEW -d "instagramrecipes://recipe/abc" com.bchookolingo.InstagramRecipes`. Note the package name `com.bchookolingo.InstagramRecipes` from `app.json` → `android.package`.
- **Share-sheet / Instagram intent.** Instagram’s Android app does not always honour `ACTION_SEND` text payloads identically to iOS. When testing the “share an IG reel into ReciGrams” path, share from Instagram → ReciGrams via the system share sheet — this only works on a physical device with Instagram installed (the emulator can install Instagram via the Play Store image, but it’s flakier than a real device).
- **`expo-secure-store` on Android** uses Android Keystore + EncryptedSharedPreferences. Values do **not** survive an app uninstall. They survive a reinstall over the top during dev (`expo run:android` re-installs but keeps app data unless you `adb uninstall com.bchookolingo.InstagramRecipes` first).
- **`edgeToEdgeEnabled: true`.** ReciGrams draws under the system bars on Android 15+. Always wrap top-level screens in `SafeAreaView` from `react-native-safe-area-context`. The status bar will overlap content otherwise — this is a real-device-only bug; the emulator without notch is forgiving.
- **`predictiveBackGestureEnabled: false`.** ReciGrams opts out of Android 14+ predictive back. If you flip this on later, every `expo-router` stack screen needs to handle `BackHandler` cleanly or the predictive back animation will look broken.
- **New Architecture.** `newArchEnabled: true` means Fabric + TurboModules are on. Some older RN community libs may still print bridge warnings at startup — these are usually safe to ignore on SDK 55 but file an issue if behaviour is broken.
- **Hermes is the default JS engine.** Stack traces in red boxes are Hermes traces; source maps work in dev automatically.
- **Metro bundler port 8081.** If `npx expo start` says “port 8081 is in use,” it’s usually a leftover Metro process — kill with `lsof -ti:8081 | xargs kill -9`.
- **`adb reverse` for physical devices.** Expo CLI normally runs `adb reverse tcp:8081 tcp:8081` automatically so the device can reach Metro on `localhost`. If JS bundles fail to load on a USB device, run `adb reverse tcp:8081 tcp:8081` manually.
- **Wireless debugging dropouts.** Wi-Fi sleep on the device will kill the ADB connection. In Developer options enable **Stay awake** while charging during dev.

---

## Sources

- Expo docs — Android Studio emulator setup: `https://docs.expo.dev/workflow/android-studio-emulator/`
- Expo docs — Development builds (when Expo Go is not enough): `https://docs.expo.dev/develop/development-builds/introduction/`
- Expo docs — `npx expo run:android`: `https://docs.expo.dev/more/expo-cli/#compiling`
- Expo docs — Environment variables: `https://docs.expo.dev/guides/environment-variables/`
- Expo docs — Deep linking & schemes: `https://docs.expo.dev/guides/linking/`
- Expo docs — Edge-to-edge on Android: `https://docs.expo.dev/develop/user-interface/safe-areas/`
- React Native docs — Running on device: `https://reactnative.dev/docs/running-on-device`
- Android developer docs — Wireless debugging: `https://developer.android.com/tools/adb#wireless`
- `react-native-mmkv` README (requires dev client / Nitro modules): `https://github.com/mrousavy/react-native-mmkv`
- `react-native-nitro-modules` README: `https://github.com/mrousavy/nitro`
- `react-native-reanimated` v4 install (requires `react-native-worklets`): `https://docs.swmansion.com/react-native-reanimated/docs/4.x/fundamentals/getting-started`
- Project files inspected: `app.json`, `eas.json`, `package.json` (root of repo).
