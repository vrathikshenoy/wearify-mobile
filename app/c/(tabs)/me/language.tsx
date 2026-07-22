import { useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useMutation } from "convex/react";
import { Check } from "lucide-react-native";
import { api } from "@/src/convex/api";
import { AppHeader } from "@/src/components/ui";
import { useAuth } from "@/src/providers/auth";
import { useIsOnline } from "@/src/providers/connectivity";

const MAROON = "#6E262B";
const LANGUAGES = [
  ["en", "English", "English"], ["hi", "हिन्दी", "Hindi"], ["mr", "मराठी", "Marathi"], ["kn", "ಕನ್ನಡ", "Kannada"], ["ta", "தமிழ்", "Tamil"],
  ["te", "తెలుగు", "Telugu"], ["bn", "বাংলা", "Bangali"], ["gu", "ગુજરાતી", "Gujarati"], ["ml", "മലയാളം", "Malayam"],
] as const;

export default function LanguageScreen() {
  const online = useIsOnline(); const { token, user, customer } = useAuth(); const update = useMutation(api.customers.updateProfile);
  const [selected, setSelected] = useState(customer?.language || "en"); const [saving, setSaving] = useState(false);
  useEffect(() => { if (customer?.language) setSelected(customer.language); }, [customer?.language]);
  async function choose(code: string) { if (code === selected || !token || !user) return; if (!online) return Alert.alert("You’re offline", "Reconnect to change your language."); const previous = selected; setSelected(code); setSaving(true); try { await update({ token, customerId: user.customerId, language: code }); } catch { setSelected(previous); Alert.alert("Couldn’t save language", "Please try again."); } finally { setSaving(false); } }
  return <View style={styles.page}><AppHeader back title="Language" /><ScrollView contentContainerStyle={styles.list}>{LANGUAGES.map(([code, native, english]) => { const active = selected === code; return <Pressable key={code} disabled={saving} style={[styles.card, active && styles.active]} onPress={() => void choose(code)}><View><Text style={[styles.native, active && styles.activeText]}>{native}</Text><Text style={[styles.english, active && styles.activeSub]}>{english}</Text></View>{active ? <View style={styles.check}><Check size={15} color="#FFFFFF" strokeWidth={3} /></View> : null}</Pressable>; })}</ScrollView></View>;
}
const styles = StyleSheet.create({ page: { flex: 1, backgroundColor: "#FFFFFF" }, list: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 32, gap: 12 }, card: { minHeight: 72, paddingHorizontal: 18, paddingVertical: 14, borderRadius: 12, borderWidth: 1.5, borderColor: "#E8E0DD", backgroundColor: "#FFFFFF", flexDirection: "row", alignItems: "center", justifyContent: "space-between" }, active: { borderColor: MAROON, backgroundColor: MAROON }, native: { fontFamily: "DMSans_700Bold", fontSize: 16, color: "#2A2522" }, english: { marginTop: 1, fontFamily: "DMSans_500Medium", fontSize: 12, color: "#9A8F8A" }, activeText: { color: "#FFFFFF" }, activeSub: { color: "rgba(255,255,255,0.72)" }, check: { width: 26, height: 26, borderRadius: 13, backgroundColor: "rgba(0,0,0,0.26)", alignItems: "center", justifyContent: "center" } });
