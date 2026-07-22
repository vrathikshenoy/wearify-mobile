import { Platform } from "react-native";
import { usePreventScreenCapture } from "expo-screen-capture";

// Disabled on web and in dev (so screenshots/QA work); production release builds keep FLAG_SECURE.
export const useScreenProtection: (key?: string) => void =
  Platform.OS === "web" || __DEV__ ? () => undefined : usePreventScreenCapture;
