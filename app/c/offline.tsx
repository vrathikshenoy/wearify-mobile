import { useEffect } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { WifiOff } from "lucide-react-native";
import { useIsOnline } from "@/src/providers/connectivity";

export default function OfflineScreen() {
  const router = useRouter();
  const online = useIsOnline();
  useEffect(() => { if (online) router.replace("/c"); }, [online, router]);
  return <LinearGradient colors={["#2A1612", "#3F1A14", "#5E1A18", "#8B2E2B", "#A94540"]} locations={[0, 0.25, 0.55, 0.85, 1]} start={{ x: 0.15, y: 0 }} end={{ x: 0.85, y: 1 }} style={styles.page}><StatusBar style="light" /><View style={styles.icon}><WifiOff size={36} color="#C9941A" /></View><Text style={styles.title}>You’re offline</Text><Text style={styles.copy}>Reconnect to load fresh looks, your wardrobe, and the latest from your stores.</Text><Pressable accessibilityRole="button" onPress={() => router.replace("/c")} style={({ pressed }) => [styles.button, pressed && styles.pressed]}><Text style={styles.buttonText}>Try again</Text></Pressable></LinearGradient>;
}

const styles = StyleSheet.create({
  page: { flex: 1, padding: 24, alignItems: "center", justifyContent: "center", gap: 18 }, icon: { width: 84, height: 84, borderRadius: 22, borderWidth: 1.5, borderColor: "rgba(184,134,11,0.65)", backgroundColor: "rgba(255,255,255,0.08)", alignItems: "center", justifyContent: "center" }, title: { fontFamily: "CormorantGaramond_700Bold", fontStyle: "italic", fontSize: 28, color: "#FBF7F1", textAlign: "center" }, copy: { maxWidth: 320, fontFamily: "DMSans_400Regular", fontSize: 14, lineHeight: 21, color: "rgba(253,248,240,0.7)", textAlign: "center" }, button: { marginTop: 12, paddingHorizontal: 24, paddingVertical: 10, borderWidth: 1.5, borderColor: "rgba(184,134,11,0.65)", borderRadius: 999 }, buttonText: { fontFamily: "DMSans_600SemiBold", fontSize: 13, letterSpacing: 1.04, textTransform: "uppercase", color: "#C9941A" }, pressed: { opacity: 0.75 },
});
