import { useEffect } from "react";
import { useRouter } from "expo-router";
import { WifiOff } from "lucide-react-native";
import { StyleSheet, Text, View } from "react-native";
import { PrimaryButton } from "@/src/components/ui";
import { colors } from "@/src/theme/tokens";
import { useIsOnline } from "@/src/providers/connectivity";

export default function OfflineScreen() {
  const router = useRouter();
  const online = useIsOnline();
  useEffect(() => { if (online) router.replace("/c"); }, [online, router]);
  return <View style={styles.page}><WifiOff color={colors.brand} size={52} /><Text style={styles.title}>You’re offline</Text><Text style={styles.copy}>Reconnect to refresh your wardrobe or make changes.</Text><PrimaryButton onPress={() => router.replace("/c")}>Try again</PrimaryButton></View>;
}
const styles = StyleSheet.create({ page: { flex: 1, justifyContent: "center", padding: 32, gap: 16, backgroundColor: colors.canvas }, title: { color: colors.ink, fontFamily: "CormorantGaramond_700Bold", fontSize: 34, textAlign: "center" }, copy: { color: colors.muted, fontFamily: "DMSans_400Regular", textAlign: "center", marginBottom: 12 } });
