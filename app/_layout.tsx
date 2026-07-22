import "react-native-gesture-handler";
import "../global.css";
import { useEffect, useState } from "react";
import { LogBox, Platform, StyleSheet, Text, View } from "react-native";
import { ImageBackground } from "expo-image";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useFonts } from "expo-font";
import { Montserrat_400Regular } from "@expo-google-fonts/montserrat/400Regular";
import { Montserrat_300Light } from "@expo-google-fonts/montserrat/300Light";
import { Montserrat_500Medium } from "@expo-google-fonts/montserrat/500Medium";
import { Montserrat_600SemiBold } from "@expo-google-fonts/montserrat/600SemiBold";
import { Montserrat_700Bold } from "@expo-google-fonts/montserrat/700Bold";
import { DMSans_400Regular } from "@expo-google-fonts/dm-sans/400Regular";
import { DMSans_500Medium } from "@expo-google-fonts/dm-sans/500Medium";
import { DMSans_600SemiBold } from "@expo-google-fonts/dm-sans/600SemiBold";
import { DMSans_700Bold } from "@expo-google-fonts/dm-sans/700Bold";
import { DMMono_400Regular } from "@expo-google-fonts/dm-mono/400Regular";
import { CormorantGaramond_600SemiBold } from "@expo-google-fonts/cormorant-garamond/600SemiBold";
import { CormorantGaramond_700Bold } from "@expo-google-fonts/cormorant-garamond/700Bold";
import { Raleway_300Light } from "@expo-google-fonts/raleway/300Light";
import { ConnectivityProvider } from "@/src/providers/connectivity";
import { AuthProvider } from "@/src/providers/auth";
import { Brand } from "@/src/components/ui";

if (Platform.OS === "web") {
  LogBox.ignoreLogs(["Warning: ScrollView doesn't take rejection well - scrolls anyway"]);
}

void SplashScreen.preventAutoHideAsync();
const convexUrl = process.env.EXPO_PUBLIC_CONVEX_URL;
if (!convexUrl) throw new Error("EXPO_PUBLIC_CONVEX_URL is required");
const convex = new ConvexReactClient(convexUrl, { unsavedChangesWarning: false });

export default function RootLayout() {
  const [showLaunch, setShowLaunch] = useState(true);
  const [loaded, error] = useFonts({
    Montserrat_300Light, Montserrat_400Regular, Montserrat_500Medium, Montserrat_600SemiBold, Montserrat_700Bold,
    DMSans_400Regular, DMSans_500Medium, DMSans_600SemiBold, DMSans_700Bold,
    DMMono_400Regular, CormorantGaramond_600SemiBold, CormorantGaramond_700Bold, Raleway_300Light,
  });
  useEffect(() => {
    if (!loaded && !error) return;
    void SplashScreen.hideAsync();
    const timer = setTimeout(() => setShowLaunch(false), 1900);
    return () => clearTimeout(timer);
  }, [error, loaded]);
  if (!loaded && !error) return null;
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ConnectivityProvider>
          <ConvexProvider client={convex}>
            <AuthProvider>
              <StatusBar style={showLaunch ? "light" : "dark"} />
              {showLaunch ? <LaunchSplash /> : <Stack screenOptions={{ headerShown: false, animation: "fade_from_bottom" }} />}
            </AuthProvider>
          </ConvexProvider>
        </ConnectivityProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

function LaunchSplash() {
  return <View style={launch.page}><ImageBackground source={require("@/assets/customer/first-screen/background.svg")} style={StyleSheet.absoluteFill} contentFit="cover" /><View style={launch.logo}><Brand light width={240} /></View><Text style={launch.copyright}>© copyright PHYGIFY TECHNOSERVICES PRIVATE LIMITED</Text></View>;
}

const launch = StyleSheet.create({ page: { flex: 1, overflow: "hidden", backgroundColor: "#68262A" }, logo: { position: "absolute", inset: 0, alignItems: "center", justifyContent: "center" }, copyright: { position: "absolute", left: 16, right: 16, bottom: 24, textAlign: "center", fontFamily: "Montserrat_500Medium", fontSize: 11, letterSpacing: 0.1, color: "rgba(242,228,218,0.55)" } });
