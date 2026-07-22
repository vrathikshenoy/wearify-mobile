import { Redirect, Tabs } from "expo-router";
import { Heart, Home, Images, Shirt, Sparkles } from "lucide-react-native";
import type { ColorValue } from "react-native";
import { Loading } from "@/src/components/ui";
import { useAuth } from "@/src/providers/auth";
import { useIsOnline } from "@/src/providers/connectivity";
import { colors } from "@/src/theme/tokens";

const icon = (Icon: typeof Home) => ({ color, size }: { color: ColorValue; size: number }) => <Icon color={typeof color === "string" ? color : colors.brand} size={size} strokeWidth={1.8} />;

export default function CustomerTabs() {
  const auth = useAuth();
  const online = useIsOnline();
  if (!auth.ready) return <Loading label="Restoring your wardrobe…" />;
  if (!auth.authenticated) return <Redirect href="/c/welcome" />;
  if (!online) return <Redirect href="/c/offline" />;
  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: colors.brand,
      tabBarInactiveTintColor: colors.ghost,
      tabBarStyle: { height: 72, paddingTop: 7, paddingBottom: 9, borderTopColor: colors.border, backgroundColor: colors.surface },
      tabBarLabelStyle: { fontFamily: "DMSans_500Medium", fontSize: 11 },
    }}>
      <Tabs.Screen name="index" options={{ title: "Home", tabBarIcon: icon(Home) }} />
      <Tabs.Screen name="looks" options={{ title: "Looks", tabBarIcon: icon(Images) }} />
      <Tabs.Screen name="new" options={{ title: "New", tabBarIcon: icon(Sparkles) }} />
      <Tabs.Screen name="wardrobe" options={{ title: "Wardrobe", tabBarIcon: icon(Shirt) }} />
      <Tabs.Screen name="wishlist" options={{ title: "Wishlist", tabBarIcon: icon(Heart) }} />
      <Tabs.Screen name="product" options={{ href: null }} />
      <Tabs.Screen name="me" options={{ href: null }} />
    </Tabs>
  );
}
