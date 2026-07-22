import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useQuery } from "convex/react";
import { Globe2, Heart, History, Lock, LogOut, MapPin, Scissors, Settings, Star, UserRound, Users } from "lucide-react-native";
import { api } from "@/src/convex/api";
import { ConvexImage } from "@/src/components/media";
import { SettingsRow } from "@/src/components/settings";
import { AppHeader, Screen, Title } from "@/src/components/ui";
import { useAuth } from "@/src/providers/auth";
import { colors, radius } from "@/src/theme/tokens";

export default function ProfileHubScreen() {
  const router = useRouter(); const auth = useAuth(); const { token, user, customer } = auth;
  const stores = useQuery(api.customers.listStoreLinksEnriched, token && user ? { token, customerId: user.customerId } : "skip");
  const wishlist = useQuery(api.customers.getWishlist, token && user ? { token, customerId: user.customerId } : "skip");
  const looks = useQuery(api.sessionOps.listByCustomer, token && user ? { token, customerId: user.customerId } : "skip");
  function confirmLogout() { Alert.alert("Sign out?", "You’ll need your phone number to sign back in.", [{ text: "Cancel", style: "cancel" }, { text: "Sign out", style: "destructive", onPress: () => void auth.signOut().then(() => router.replace("/c/welcome")) }]); }
  return <><AppHeader back title="My profile" /><Screen>
    <View style={styles.profile}><ConvexImage fileId={customer?.photoFileId} label="Profile photo" style={styles.avatar} /><Text style={styles.name}>{customer?.name || user?.name || "Wearify customer"}</Text><Text style={styles.phone}>{maskPhone(user?.phone ?? "")}</Text><Pressable style={styles.edit} onPress={() => router.push("/c/me/profile")}><Text style={styles.editText}>Edit profile</Text></Pressable></View>
    <View style={styles.stats}><Stat value={looks?.length ?? 0} label="Looks" /><Stat value={wishlist?.length ?? 0} label="Wishlist" /><Stat value={stores?.length ?? 0} label="Stores" /></View>
    <Title>My Wearify</Title><View style={styles.rows}>
      <SettingsRow icon={<UserRound color={colors.brand} size={19} />} title="Profile details" onPress={() => router.push("/c/me/profile")} />
      <SettingsRow icon={<MapPin color={colors.brand} size={19} />} title="My stores" detail={`${stores?.length ?? 0} connected`} onPress={() => router.push("/c/me/stores")} />
      <SettingsRow icon={<History color={colors.brand} size={19} />} title="Visit history" onPress={() => router.push("/c/me/history")} />
      <SettingsRow icon={<Star color={colors.brand} size={19} />} title="Loyalty credits" onPress={() => router.push("/c/me/loyalty")} />
      <SettingsRow icon={<Scissors color={colors.brand} size={19} />} title="My tailor orders" onPress={() => router.push("/c/me/tailor-orders")} />
      <SettingsRow icon={<Heart color={colors.brand} size={19} />} title="Style preferences" onPress={() => router.push("/c/me/preferences")} />
      <SettingsRow icon={<Globe2 color={colors.brand} size={19} />} title="Language" detail={customer?.language?.toUpperCase() ?? "EN"} onPress={() => router.push("/c/me/language")} />
      <SettingsRow icon={<Users color={colors.brand} size={19} />} title="Refer a friend" onPress={() => router.push("/c/me/refer")} />
      <SettingsRow icon={<Settings color={colors.brand} size={19} />} title="Rate your visit" onPress={() => router.push("/c/me/feedback")} />
      <SettingsRow icon={<Lock color={colors.brand} size={19} />} title="Privacy & data" onPress={() => router.push("/c/me/privacy")} />
      <SettingsRow icon={<LogOut color={colors.error} size={19} />} title="Sign out" danger onPress={confirmLogout} />
    </View>
  </Screen></>;
}
const maskPhone = (phone: string) => phone.length > 6 ? `${phone.slice(0, 5)}••••${phone.slice(-2)}` : phone;
function Stat({ value, label }: { value: number; label: string }) { return <View style={styles.stat}><Text style={styles.statValue}>{value}</Text><Text style={styles.statLabel}>{label}</Text></View>; }
const styles = StyleSheet.create({ profile: { alignItems: "center", paddingTop: 24 }, avatar: { width: 92, height: 92, borderRadius: 46 }, name: { marginTop: 12, color: colors.ink, fontFamily: "CormorantGaramond_700Bold", fontSize: 28 }, phone: { color: colors.muted, fontFamily: "DMMono_400Regular", fontSize: 12 }, edit: { marginTop: 12, paddingHorizontal: 20, paddingVertical: 9, borderRadius: radius.pill, backgroundColor: colors.brand }, editText: { color: "#FFFFFF", fontFamily: "DMSans_600SemiBold", fontSize: 12 }, stats: { marginTop: 24, paddingVertical: 16, borderRadius: radius.lg, flexDirection: "row", backgroundColor: colors.surface }, stat: { flex: 1, alignItems: "center" }, statValue: { color: colors.brand, fontFamily: "Montserrat_700Bold", fontSize: 20 }, statLabel: { marginTop: 3, color: colors.muted, fontFamily: "DMSans_400Regular", fontSize: 11 }, rows: { gap: 9 } });
