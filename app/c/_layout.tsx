import { Stack } from "expo-router";
import { AppFrame } from "@/src/components/ui";

export default function CustomerLayout() {
  return (
    <AppFrame>
      <Stack screenOptions={{ headerShown: false, animation: "slide_from_right" }} />
    </AppFrame>
  );
}
