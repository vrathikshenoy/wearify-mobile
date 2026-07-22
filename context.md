# Project Context — Wearify Mobile (APK release setup)

Handoff notes for humans and AI agents. Covers what was set up, every blocker
hit, and how each was fixed. Written 2026-07-22.

> Read [AGENTS.md](AGENTS.md) first: **Expo SDK 57** — always check
> https://docs.expo.dev/versions/v57.0.0/ before writing native/build code.

## Project snapshot

- Expo SDK **57**, React Native **0.86**, React 19.2, **pnpm 11.13.1**.
- App id `com.phygify.wearify`, base version `1.0.0` (in `app.json`).
- Backend: existing production **Convex** (`EXPO_PUBLIC_CONVEX_URL`). No second backend.
- GitHub: **https://github.com/vrathikshenoy/wearify-mobile** (public), default branch `main`.
- `gh` is logged into **two** accounts: `vrathikshenoy` (owner, use this) and `Ai-Phygifyt` (org).
  The active account silently flips — if `gh` 404s on the repo, run
  `gh auth switch --user vrathikshenoy`.

## Goal

Open-source-style **versioned APK releases**: push a `vX.Y.Z` tag → CI builds a
signed Android APK → published as a GitHub Release asset. Plus a cleaned-up
`.gitignore`, and the project set up + pushed to GitHub.

## What was set up

| File | Purpose |
| --- | --- |
| `.github/workflows/release-apk.yml` | On `v*` tag: `expo prebuild` → `gradlew assembleRelease` → sign (apksigner) → publish GitHub Release with the APK. |
| `app.config.js` | Dynamic version injection: `versionName` from `APP_VERSION_NAME` (git tag), `versionCode` from `ANDROID_VERSION_CODE` (CI run number). Falls back to `app.json` locally. |
| `.gitignore` | Added `.env*` (keeps `.env.example`), `.playwright-cli/`, `security_best_practices_report.md`. |
| `README.md` | "Versioned APK releases" section: flow + required secrets/variables + keystore command. |

Design decisions:
- **Local Gradle in CI**, not EAS cloud build (user choice).
- **Signing via post-build `apksigner`** re-sign, not build.gradle patching (survives
  any Expo version). Conditional: if no keystore secret, publishes the debug-signed
  APK + a warning, so a tag never hard-fails on missing signing.
- **versionCode = CI run number** so installs upgrade in place.

Repo config already done:
- Repo variables set: `EXPO_PUBLIC_CONVEX_URL`, `EXPO_PUBLIC_WEB_URL`.
- Renamed local `master` → `main`; repo created public and pushed.

## Blockers and fixes (chronological)

**1. "Why is the build slow, I have plenty of cores?"**
CI runs on a **GitHub-hosted runner** (4 vCPU / 16 GB), not the user's machine.
"Local Gradle in CI" means *local gradle build* (vs the EAS cloud build service) —
still on GitHub's cloud box. No code change; clarification only.

**2. OOM Metaspace — build failed (`v1.0.0`, ~17 min).**
Failed at `:expo:lintVitalAnalyzeRelease` → `java.lang.OutOfMemoryError: Metaspace`.
Root cause: Expo's generated `gradle.properties` defaults to **512m metaspace**, too
small for release lint.
Fix (commit `624cbf1`): after prebuild, append the proven `eas.json` *preview*
memory settings (`-Xmx4g -XX:MaxMetaspaceSize=1g`, `parallel=false`,
`workers.max=4`, `daemon=false`) and trim to the two phone ABIs
(`armeabi-v7a,arm64-v8a`).

**3. `gradle.properties` corruption → `node` exit 1 (`v1.0.1`, ~3.5 min). ← the nasty one**
Failed with `Process 'command 'node'' finished with non-zero exit value 1`, only 36
tasks, during **Gradle configuration** (no task path).
Root cause: Expo's generated `gradle.properties` **has no trailing newline** — it
ends `expo.inlineModules.watchedDirectories=[]`. The `>> gradle.properties` append
glued onto it:
```
expo.inlineModules.watchedDirectories=[]org.gradle.jvmargs=-Xmx4g ...
```
That corrupted value was passed as `--watched-directories-serialized` to Expo's
autolinking `node` call → exit 1 (and the metaspace fix never even applied).
How it was diagnosed: `expo export` succeeded (JS fine) → reproduced the full build
locally (fails in **17 s**) → re-ran with `--info` to capture the exact node command
→ saw the leaked jvmargs → confirmed with `tail -8 android/gradle.properties | cat -A`.
Fix (commit `69a958c`): prepend a blank line (`echo ""`) before the append.
Verified: local rebuild cleared autolinking and built a full APK.

**4. `gh` log retrieval flakiness.**
`gh run view --log` intermittently `404`'d (active account flipped to `Ai-Phygifyt`);
one failed run was also deleted from the Actions UI. Worked around with
`gh auth switch --user vrathikshenoy` and by reproducing/inspecting the build locally.

**5. Self-hosted runner install blocked.**
User wanted to test self-hosted for speed. The harness classifier blocks the agent
from downloading/registering the runner agent (system-level install). The user must
run those commands themselves (see README / chat). A **local build** was used as the
self-hosted-speed proxy instead.

## Build performance

| Runner | Time | Notes |
| --- | --- | --- |
| User's machine (self-hosted proxy) | **~2m 32s** (2m40s incl. prebuild) | 2 ABIs, Java 17 |
| GitHub cloud (`ubuntu-latest`) | 17+ min | and was failing before the fixes |

~7× faster on the user's hardware.

## Current state (as of handoff)

- **Pipeline is fixed and proven** — a full release APK builds successfully with the
  committed workflow settings.
- Workflow is currently set to **`runs-on: self-hosted`** → tags will **not** build
  until a self-hosted runner is installed and listening.
- **`v1.0.2` Release exists**, published **manually** from the locally-built APK:
  https://github.com/vrathikshenoy/wearify-mobile/releases/tag/v1.0.2
  - ⚠️ It is **debug-signed** (no keystore configured yet). Installs for testing, but
    once a real keystore is added, future release-signed builds **won't upgrade over
    it in place** (signature mismatch → uninstall/reinstall).
- Abandoned tags: `v1.0.0` (OOM, cancelled), `v1.0.1` (corruption, failed/deleted),
  `v1.0.2` CI run (was queued for missing runner, cancelled; released manually).

## Open items / next steps

1. **Pick the CI runner**:
   - Cloud: set `runs-on: ubuntu-latest` (zero setup, ~15 min, 24/7). Fix already makes it pass.
   - Self-hosted: keep `runs-on: self-hosted`, user installs the runner (commands in README/chat),
     `~2.5 min` builds, machine must be online when tagging.
2. **Add keystore secrets** for real release-signing (until then, APKs are debug-signed):
   `ANDROID_KEYSTORE_BASE64`, `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS`, `ANDROID_KEY_PASSWORD`.
   Generate: `keytool -genkeypair -v -keystore release.jks -alias wearify -keyalg RSA -keysize 2048 -validity 10000`
   (keep `release.jks` backed up — losing it breaks in-place upgrades forever).
3. Optional: cut a clean signed `v1.0.3` once 1 + 2 are done.
4. Optional: per-ABI APK splits to shrink the 97 MB universal APK (~half).

## How to cut a release

```sh
git tag v1.2.3
git push origin v1.2.3   # if self-hosted: start the runner first (./run.sh)
```
`versionName` = tag, `versionCode` = CI run number. Release + APK appear under the
repo's **Releases** tab (APKs are gitignored, never in the code tree).

## Local build (repro / manual)

```sh
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64   # RN 0.86 needs Java 17, not 25
export ANDROID_HOME=/home/vrathik/Android/Sdk ANDROID_SDK_ROOT=$ANDROID_HOME
export EXPO_PUBLIC_CONVEX_URL=... EXPO_PUBLIC_WEB_URL=...
export APP_VERSION_NAME=1.2.3 ANDROID_VERSION_CODE=123
pnpm expo prebuild --platform android --no-install
# append memory/ABI props to android/gradle.properties WITH a leading newline (see breaker #3)
cd android && ./gradlew assembleRelease --no-daemon
# APK: android/app/build/outputs/apk/release/app-release.apk
```

## Commit history (this work)

- `Add tag-driven APK release workflow, dynamic version config, ignore local artifacts`
- `Fix release build: raise Gradle metaspace to 1g, trim to phone ABIs`
- `Test: run release build on self-hosted runner (speed comparison vs hosted)`
- `Fix gradle.properties corruption: prepend newline before appending`
