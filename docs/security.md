# Mobile Security Baseline

Reviewed 2026-07-22 against the current Expo SDK 57, Android, Apple, Convex,
and OWASP mobile documentation.

| Area | Implemented control | Release verification |
| --- | --- | --- |
| Session storage | Opaque token and minimal user routing data use Expo SecureStore with `WHEN_UNLOCKED_THIS_DEVICE_ONLY`; Android backup exclusions are configured by the plugin | Confirm uninstall/reinstall and device migration do not restore a usable session |
| Authentication | OTP actions and every protected Convex function remain server-authorized; the client validates the session on reconnect and clears invalid local credentials | Test invalid, expired, revoked, wrong-role, and replayed sessions |
| Sensitive UI | Login, registration, and privacy screens use SDK 57 screen-capture prevention | Test screenshots, recordings, and app-switcher previews on supported Android/iOS versions |
| Data minimization | No local query database or write queue; no secrets in `EXPO_PUBLIC_*`; notification permission/token collection is deferred | Inspect signed bundle/config and platform data-safety disclosures |
| Files | JPEG/PNG/WebP and 4 MB checks run client-side; the unchanged Convex backend re-validates the blob and owns authorization | Test spoofed MIME, oversize, corrupt, canceled, and interrupted uploads |
| Export/deletion | Export is user-confirmed, fetched on demand, written to cache, and shared through the OS; deletion is separately destructive-confirmed and signs out | Verify export contents/cleanup guidance and full server deletion/anonymization behavior |
| Links | HTTPS App/Universal Links are constrained to the owned host and `/c`/`/register`; association templates require real signing identities | Verify AASA and Digital Asset Links on physical signed builds |
| OTA | Runtime is tied to app version; EAS project binding and end-to-end update signing require release-account credentials | Generate the private key outside source control, embed only its certificate, and test invalid-signature rejection |
| Android permissions | Camera, media, notifications, screen-capture detection, and network permissions come from used features; the unused overlay permission is blocked in app config | Inspect every signed release manifest with `aapt dump badging` |
| Dependencies | Exact pnpm lockfile, Expo Doctor, TypeScript, production Metro export, and pnpm audit are release gates | Keep Expo-compatible pins and the patched UUID override until Expo removes its UUID 7 constraint |

Primary references:

- Expo SecureStore: https://docs.expo.dev/versions/latest/sdk/securestore/
- Expo ScreenCapture SDK 57: https://docs.expo.dev/versions/v57.0.0/sdk/screen-capture/
- Expo linking overview: https://docs.expo.dev/linking/overview/
- Expo EAS Update code signing: https://docs.expo.dev/eas-update/code-signing/
- Android App Links: https://developer.android.com/training/app-links/about
- Apple associated domains: https://developer.apple.com/documentation/xcode/supporting-associated-domains
- Convex function authorization: https://docs.convex.dev/auth/functions-auth
- OWASP MASVS: https://mas.owasp.org/MASVS/

Root/jailbreak detection is intentionally not an authorization control. Expo
documents its device-root signal as experimental and bypassable; the existing
server must continue to authorize every operation regardless of device state.

## Release blockers

1. Rotate the Android signing credential that appeared in shared local-build
   output before production. Choose the EAS/Google Play rotation path that
   matches whether this application is already enrolled in Play App Signing.
2. Replace the association-file placeholders and verify App/Universal Links on
   signed physical-device builds.
3. Configure EAS Update end-to-end code signing before publishing production
   OTA updates, or do not publish OTA updates until it is configured.
