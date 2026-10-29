# 서재한켠 — notes for Claude

Reading-log Android app (Capacitor 8 wrapping one HTML page). The user is not a developer: they open `android/` in Android Studio, build a signed AAB with their own key, and upload it to Play Console. Write to them in plain Korean, step by step.

## Fixed facts — do not change
- App ID / namespace: `com.nia.seojaehankyeon`. The user's other apps use `com.nia.*`. Never change it once an AAB has been uploaded (ask the user first if unsure; an earlier app had to be reverted after a mid-way ID change).
- App name: 서재한켠 (store title: 서재한켠 - 독서 기록과 형광펜). Earlier names 책장 노트 / 마침 were dropped.
- localStorage key `reading-log-books` and backup file `books.json` (Filesystem DATA): keep for data compatibility.
- Signing keys are never committed (`*.jks` is ignored). The user keeps `seojae-key.jks`.
- Bump `versionCode` in `android/app/build.gradle` for every Play upload.

## How it fits together
- `src/seojae.html` is the single source page. It is the same file as the user's Claude web artifact (which uses `window.claude` db/sample/assets for sharing and AI cover reading). In the app (`IS_APP`, Capacitor native) those features are hidden via `.native .social-only` and storage is local + `books.json` backup.
- `npm run sync` = `art/build_www.py` (bundles local fonts from @fontsource and `capacitor.js` from @capacitor/core) + `npx cap sync android`.
- Native plugins: App (back button), Filesystem (backup, export), Share (export). They are reached through `capacitor.js`'s `registerPlugin`, with `Capacitor.Plugins[name]` as fallback. The native bridge alone does NOT provide `registerPlugin` — a missing `capacitor.js` once froze the whole app on the shelf screen.
- Capacitor-generated files (`android/app/src/main/assets/public`, `capacitor-cordova-android-plugins`, plugin config) and `node_modules/@capacitor/{android,app,filesystem,share,core}` are committed on purpose so a plain "Download ZIP" opens in Android Studio.

## Checks
- `npm run test:native` runs `www/index.html` with the real `native-bridge.js` and a fake phone. Use it instead of stubbing `window.Capacitor`.
- `.github/workflows/android.yml` builds a debug APK on every push to main; check the run after pushing.
- Store images: `npm run store:images` (needs playwright). Screenshots are 1080×1920 with realistic sample books.

## Not done yet
- One-liner sharing between users (planned with Supabase; per-book one-liners only, covers stay private).
- AI cover text reading in the app.
