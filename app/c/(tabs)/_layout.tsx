import { Redirect, Tabs } from "expo-router";
import { Image } from "expo-image";
import type { ColorValue } from "react-native";
import { Loading } from "@/src/components/ui";
import { useAuth } from "@/src/providers/auth";
import { useIsOnline } from "@/src/providers/connectivity";
import { colors } from "@/src/theme/tokens";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type TabIconProps = { color: ColorValue; focused: boolean; size: number };
const tabIcon = (inactive: number, active = inactive) => ({ color, focused }: TabIconProps) => (
  <Image source={focused ? active : inactive} style={{ width: 25, height: 25 }} contentFit="contain" tintColor={typeof color === "string" ? color : colors.brand} />
);

const icons = {
  home: tabIcon(require("@/assets/customer/navbar/home.svg"), require("@/assets/customer/navbar/home-filled.svg")),
  looks: tabIcon(require("@/assets/customer/navbar/looks.svg"), require("@/assets/customer/navbar/looks-filled.svg")),
  fresh: tabIcon(require("@/assets/customer/navbar/new.svg"), require("@/assets/customer/navbar/new-filled.svg")),
  wardrobe: tabIcon(require("@/assets/customer/navbar/wardrobe.svg")),
  wishlist: tabIcon(require("@/assets/customer/navbar/wishlist.svg"), require("@/assets/customer/navbar/wishlist-filled.svg")),
};

export default function CustomerTabs() {
  const auth = useAuth();
  const online = useIsOnline();
  const insets = useSafeAreaInsets();
  if (!auth.ready) return <Loading label="Restoring your wardrobe…" />;
  if (!auth.authenticated) return <Redirect href="/c/welcome" />;
  if (!online) return <Redirect href="/c/offline" />;
  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: colors.brand,
      tabBarInactiveTintColor: "#6F6F6F",
      tabBarHideOnKeyboard: true,
      tabBarStyle: { height: 68 + insets.bottom, paddingTop: 8, paddingBottom: Math.max(insets.bottom, 7), borderTopColor: "rgba(0,0,0,0.08)", backgroundColor: colors.surface },
      tabBarLabelStyle: { fontFamily: "Montserrat_600SemiBold", fontSize: 11 },
      tabBarItemStyle: { minHeight: 52, paddingVertical: 1 },
    }}>
      <Tabs.Screen name="index" options={{ title: "Home", tabBarIcon: icons.home }} />
      <Tabs.Screen name="looks" options={{ title: "Looks", tabBarIcon: icons.looks }} />
      <Tabs.Screen name="new" options={{ title: "New", tabBarIcon: icons.fresh }} />
      <Tabs.Screen name="wardrobe" options={{ title: "Wardrobe", tabBarIcon: icons.wardrobe }} />
      <Tabs.Screen name="wishlist" options={{ title: "Wishlist", tabBarIcon: icons.wishlist }} />
      <Tabs.Screen name="product" options={{ href: null }} />
      <Tabs.Screen name="me" options={{ href: null }} />
    </Tabs>
  );
}
