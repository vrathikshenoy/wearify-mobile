# Wearify Mobile

Native Expo/React Native implementation of the Wearify customer PWA (`/c`). It
uses the existing production Convex deployment and does not contain or deploy a
second backend.

## What is implemented

- All 23 customer routes and the five-tab authenticated shell.
- Phone/OTP registration and login with encrypted session persistence.
- Realtime home, looks, arrivals, wardrobe, wishlist, stores, visit history,
  loyalty, referrals, and tailor orders through Convex subscriptions.
- Profile photo camera/gallery upload to Convex Storage.
- Profile, language, preferences, consent, feedback, wishlist, referral, and
  tailor-rating mutations with offline write blocking.
- Native data export/sharing and confirmed permanent account deletion.
- Android App Links, iOS Universal Links, the `wearify://` scheme, tablet and
  landscape support, Expo Image, FlashList, and a skippable Expo Video ad.

The source audit is in [docs/source-audit.md](docs/source-audit.md), and the
migration decisions are in [docs/migration-plan.md](docs/migration-plan.md).

## Requirements

- Node.js 22.13+
- pnpm 11.13.1 (Corepack or a standalone installation)
- Android Studio for local Android builds
- macOS and Xcode for local iOS builds
- An Expo account for EAS builds/updates

## Local setup

```sh
pnpm install --frozen-lockfile
cp .env.example .env.local
pnpm typecheck
pnpm start
```

Set these public runtime values in `.env.local` and in each EAS environment:

```dotenv
EXPO_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
EXPO_PUBLIC_WEB_URL=https://wearify-app.vercel.app
```

`EXPO_PUBLIC_*` values are embedded in the client bundle. Only the public
Convex deployment URL belongs there—never OTP provider credentials, signing
keys, admin tokens, or other secrets.

Run on a device/emulator with `pnpm android` or `pnpm ios`. Camera,
SecureStore, Universal Links/App Links, and production notifications should be
verified in a development or release build rather than relying only on Expo Go.

## Checks

```sh
pnpm typecheck
pnpm test
pnpm doctor
pnpm expo export --platform android --output-dir /tmp/wearify-export
pnpm audit --prod
```

The 2026-07-22 audit reports one moderate `uuid` advisory inherited through
Expo's build/config toolchain (12 transitive paths). npm's forced remediation
downgrades Expo to SDK 46, so it is intentionally not applied. Recheck after
each Expo SDK patch and remove this note once upstream resolves it.

## EAS builds and updates

Authenticate and bind the project once:

```sh
pnpm dlx eas-cli@latest login
pnpm dlx eas-cli@latest init
pnpm dlx eas-cli@latest build:configure
```

Then add the generated `extra.eas.projectId` and `updates.url` to `app.json`.
Build with:

```sh
pnpm dlx eas-cli@latest build --profile preview --platform all
pnpm dlx eas-cli@latest build --profile production --platform all
```

Publish an OTA update only when its native runtime is unchanged:

```sh
pnpm dlx eas-cli@latest update --channel production --message "Release notes"
```

Before production OTA use, configure EAS Update code signing in the release
account and keep the private signing key outside this repository. Native module,
permission, app identifier, or runtime changes require new store binaries.

## Deep links

The app identifiers are `com.phygify.wearify`; the custom scheme is `wearify`.
Association files must be served by `wearify-app.vercel.app` over HTTPS without
redirects:

- `/.well-known/apple-app-site-association` from
  `docs/linking/apple-app-site-association.example`, after inserting the Apple
  Team ID.
- `/.well-known/assetlinks.json` from
  `docs/linking/assetlinks.json.example`, after inserting every production and
  preview signing certificate SHA-256 fingerprint that should open the app.

Test `/c/*` and `/register?inviteCode=...` on physical Android and iOS devices
after the signed builds are installed.

## Security and privacy behavior

- The 30-day opaque bearer session is stored with SecureStore using the
  device-only, unlocked-device accessibility class; invalid sessions clear
  local credentials.
- Login, registration, and privacy screens prevent screenshots where supported.
- All writes require connectivity. No background mutation queue can replay a
  stale sensitive action later.
- Photo type/size is checked before upload; the unchanged Convex backend remains
  the authoritative validation and authorization boundary.
- Data export is fetched only after confirmation, written to the cache directory,
  and handed to the platform share sheet. Users should remove exported copies
  from their selected destination when no longer needed.
- Notification configuration is present, but the app does not request permission
  or register a push token until the existing backend has an explicit token and
  delivery contract.

## Known intentional native differences

- The web-only IMG.LY WASM cutout generator is not bundled. Existing transparent
  cutouts are shown; otherwise the raw render or catalogue image is used.
- Offline mode is safe reconnect mode, not an offline database: reads do not
  pretend to be current and writes are blocked.
- Browser hover, dropdowns, DOM downloads, and new windows map to press states,
  native controls, Sharing, and Linking.
- The web app is light-only, so v1 remains light-only.

## Release checklist

1. Set production EAS environment variables and complete EAS project binding.
2. Publish both association files with real signing identifiers.
3. Configure store credentials, OTA code signing, privacy declarations, and
   app-store metadata in the owning Expo/Apple/Google accounts.
4. Exercise OTP, restored/expired sessions, every mutation, realtime reconnect,
   camera/gallery upload, export, deletion, WhatsApp/maps, deep links, tablet,
   landscape, large text, VoiceOver/TalkBack, and reduced-motion settings on
   signed Android and iOS builds.
5. Compare the signed app against `https://wearify-app.vercel.app/c` with an
   authorized test account; unauthenticated automated checks cannot validate
   private customer data or destructive actions.
