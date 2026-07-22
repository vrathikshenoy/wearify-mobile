import { Platform } from "react-native";
import { usePreventScreenCapture } from "expo-screen-capture";

export const useScreenProtection: (key?: string) => void = Platform.OS === "web" ? () => undefined : usePreventScreenCapture;
