// Dynamic Expo config. Static config still lives in app.json; this only injects
// release version info from CI so a tag push produces a correctly-versioned APK.
//   APP_VERSION_NAME    -> versionName (from the git tag, e.g. v1.2.3 -> 1.2.3)
//   ANDROID_VERSION_CODE-> versionCode (CI run number, must increase for upgrades)
// Locally (no env vars set) it falls back to the app.json values unchanged.
module.exports = ({ config }) => ({
  ...config,
  version: process.env.APP_VERSION_NAME || config.version,
  android: {
    ...config.android,
    versionCode: process.env.ANDROID_VERSION_CODE
      ? Number(process.env.ANDROID_VERSION_CODE)
      : config.android?.versionCode,
  },
});
