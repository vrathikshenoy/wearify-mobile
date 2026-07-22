import { Alert, Pressable, StyleSheet, Text } from "react-native";
import { useMutation } from "convex/react";
import { Check } from "lucide-react-native";
import { api } from "@/src/convex/api";
import { AppHeader, Screen, Title } from "@/src/components/ui";
import { useAuth } from "@/src/providers/auth";
import { useIsOnline } from "@/src/providers/connectivity";
import { colors, radius } from "@/src/theme/tokens";

const languages = [{ code: "en", name: "English" }, { code: "hi", name: "हिन्दी" }, { code: "bn", name: "বাংলা" }, { code: "ta", name: "தமிழ்" }, { code: "te", name: "తెలుగు" }, { code: "mr", name: "मराठी" }, { code: "gu", name: "ગુજરાતી" }, { code: "kn", name: "ಕನ್ನಡ" }, { code: "ml", name: "മലയാളം" }];
export default function LanguageScreen() { const online = useIsOnline(); const { token, user, customer } = useAuth(); const update = useMutation(api.customers.updateProfile); async function choose(code: string) { if (!online) return Alert.alert("You’re offline", "Reconnect to change your language."); if (token && user) await update({ token, customerId: user.customerId, language: code }); } return <><AppHeader back title="Language" /><Screen><Title subtitle="Choose your preferred language">Language</Title>{languages.map((language) => { const active = (customer?.language ?? "en") === language.code; return <Pressable key={language.code} style={[styles.row, active && styles.active]} onPress={() => void choose(language.code)}><Text style={[styles.name, active && styles.activeName]}>{language.name}</Text>{active ? <Check color={colors.brand} size={20} /> : null}</Pressable>; })}</Screen></>; }
const styles = StyleSheet.create({ row: { minHeight: 56, marginBottom: 8, paddingHorizontal: 16, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, backgroundColor: colors.surface, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }, active: { borderColor: colors.brand, backgroundColor: colors.brandSoft }, name: { color: colors.ink, fontFamily: "DMSans_500Medium", fontSize: 15 }, activeName: { color: colors.brand, fontFamily: "DMSans_600SemiBold" } });
