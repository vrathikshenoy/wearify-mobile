import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useQuery } from "convex/react";
import { Clock, MapPin, User } from "lucide-react-native";
import { api } from "@/src/convex/api";
import { AppHeader, Loading } from "@/src/components/ui";
import { useAuth } from "@/src/providers/auth";

const MAROON = "#6E262B";
const STORE_IMAGES = [require("@/assets/kiosk/img1.jpg"), require("@/assets/kiosk/img2.webp"), require("@/assets/kiosk/img3.webp"), require("@/assets/kiosk/img4.jpg")] as const;

export default function HistoryScreen() {
  const router = useRouter();
  const { token, user } = useAuth();
  const stores = useQuery(api.customers.listStoreLinksEnriched, token && user ? { token, customerId: user.customerId } : "skip");
  if (stores === undefined) return <><AppHeader back title="Visit History" /><Loading /></>;
  return <View style={styles.page}><AppHeader back title="Visit History" />{stores.length ? <ScrollView contentContainerStyle={styles.list}>{stores.map((store, index) => <View key={store._id} style={styles.card}><Image source={STORE_IMAGES[index % STORE_IMAGES.length] ?? STORE_IMAGES[0]} style={styles.storeImage} contentFit="cover" accessibilityLabel={store.storeName || store.storeId} /><View style={styles.copy}><Text style={styles.name}>{store.storeName || store.storeId}</Text>{store.storeCity || store.storeState ? <Row icon={<MapPin size={12} color={MAROON} fill={MAROON} />} text={[store.storeCity, store.storeState].filter(Boolean).join(", ")} strong /> : null}{store.lastVisit ? <Row icon={<Clock size={12} color="#A99F9A" />} text={`Last: ${store.lastVisit}`} /> : null}{store.storeAddress ? <Row icon={<User size={12} color="#A99F9A" />} text={store.storeAddress} /> : null}{store.storeHours ? <Row icon={<Clock size={12} color="#A99F9A" />} text={store.storeHours} /> : null}</View></View>)}</ScrollView> : <View style={styles.emptyWrap}><View style={styles.emptyCard}><View style={styles.emptyIcon}><Image source={require("@/assets/customer/visit-histroy/no-visit.svg")} style={{ width: 24, height: 22 }} contentFit="contain" /></View><Text style={styles.emptyTitle}>No visits yet</Text><Text style={styles.emptyCopy}>Your visited stores will show up here.</Text><Pressable style={styles.backButton} onPress={() => router.push("/c/me")}><Text style={styles.backText}>Back to profile</Text></Pressable></View></View>}</View>;
}

function Row({ icon, text, strong = false }: { icon: React.ReactNode; text: string; strong?: boolean }) { return <View style={styles.row}>{icon}<Text numberOfLines={1} style={[styles.rowText, strong && styles.rowStrong]}>{text}</Text></View>; }

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#FFFFFF" }, list: { paddingHorizontal: 16, paddingVertical: 16, gap: 14 }, card: { padding: 12, borderRadius: 16, borderWidth: 1, borderColor: "#F0E6E3", backgroundColor: "#FFFFFF", flexDirection: "row", gap: 14, shadowColor: "#000000", shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 2 }, storeImage: { width: 92, height: 92, borderRadius: 12 }, copy: { flex: 1, minWidth: 0, justifyContent: "center", gap: 6 }, name: { fontFamily: "DMSans_700Bold", fontSize: 16, color: "#2A2522" }, row: { flexDirection: "row", alignItems: "center", gap: 6 }, rowText: { flex: 1, fontFamily: "DMSans_400Regular", fontSize: 12.5, color: "#9A8F8A" }, rowStrong: { fontFamily: "DMSans_700Bold", color: "#3A2B28" }, emptyWrap: { flex: 1, padding: 24, alignItems: "center", justifyContent: "center" }, emptyCard: { width: "100%", maxWidth: 320, paddingHorizontal: 22, paddingVertical: 30, borderRadius: 20, borderWidth: 1, borderColor: "#F0E6E3", backgroundColor: "#FFFFFF", alignItems: "center", shadowColor: "#000000", shadowOpacity: 0.07, shadowRadius: 15, shadowOffset: { width: 0, height: 8 }, elevation: 3 }, emptyIcon: { width: 56, height: 56, marginBottom: 14, borderRadius: 28, backgroundColor: "#FBE4E8", alignItems: "center", justifyContent: "center" }, emptyTitle: { fontFamily: "DMSans_700Bold", fontSize: 18, color: "#2A2522" }, emptyCopy: { marginTop: 6, fontFamily: "DMSans_400Regular", fontSize: 13, color: "#9A8F8A" }, backButton: { width: "100%", height: 50, marginTop: 22, borderRadius: 25, borderWidth: 1.5, borderColor: "rgba(104,38,42,0.18)", alignItems: "center", justifyContent: "center" }, backText: { fontFamily: "DMSans_700Bold", fontSize: 15, color: "#2A2522" },
});
