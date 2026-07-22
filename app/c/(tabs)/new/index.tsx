import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { useRouter } from "expo-router";
import { useQuery } from "convex/react";
import { api } from "@/src/convex/api";
import { ConvexImage } from "@/src/components/media";
import { AppHeader, EmptyState, Loading, Title } from "@/src/components/ui";
import { useAuth } from "@/src/providers/auth";
import { colors, radius } from "@/src/theme/tokens";

export default function NewArrivalsScreen() {
  const router = useRouter(); const { token, user } = useAuth();
  const stores = useQuery(api.customers.listStoreLinksEnriched, token && user ? { token, customerId: user.customerId } : "skip");
  const arrivals = useQuery(api.customers.listNewArrivalsForCustomer, token && user ? { token, customerId: user.customerId } : "skip");
  const [store, setStore] = useState("All");
  const data = store === "All" ? arrivals : arrivals?.filter((item) => item.storeId === store);
  if (arrivals === undefined) return <><AppHeader /><Loading label="Finding new arrivals…" /></>;
  return <View style={styles.page}><AppHeader /><FlashList data={data ?? []} numColumns={2} contentContainerStyle={styles.list} ListHeaderComponent={<><Title subtitle="Fresh styles from your favourite stores">New Arrivals</Title><View style={styles.filters}><Chip active={store === "All"} label="All stores" onPress={() => setStore("All")} />{stores?.map((item) => <Chip key={item._id} active={store === item.storeId} label={item.storeName ?? item.storeId} onPress={() => setStore(item.storeId)} />)}</View></>} ListEmptyComponent={<EmptyState title="No new arrivals" detail="New store additions will appear here." />} renderItem={({ item }) => <Pressable style={styles.card} onPress={() => router.push(`/c/product/${item._id}`)}><ConvexImage fileId={item.imageIds?.[0]} label={item.name} style={styles.image} /><Text numberOfLines={1} style={styles.name}>{item.name}</Text><Text style={styles.meta}>{item.fabric ?? item.occasion ?? "Saree"}</Text><Text style={styles.price}>{item.price ? `₹${item.price.toLocaleString("en-IN")}` : "View details"}</Text></Pressable>} /></View>;
}
function Chip({ active, label, onPress }: { active: boolean; label: string; onPress: () => void }) { return <Pressable style={[styles.chip, active && styles.chipActive]} onPress={onPress}><Text numberOfLines={1} style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text></Pressable>; }
const styles = StyleSheet.create({ page: { flex: 1, backgroundColor: colors.canvas }, list: { paddingHorizontal: 12, paddingBottom: 100 }, filters: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 18 }, chip: { maxWidth: 180, paddingHorizontal: 13, paddingVertical: 8, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface }, chipActive: { backgroundColor: colors.brand, borderColor: colors.brand }, chipText: { color: colors.muted, fontFamily: "DMSans_500Medium", fontSize: 12 }, chipTextActive: { color: "#FFFFFF" }, card: { flex: 1, margin: 6, paddingBottom: 10, borderRadius: radius.sm, overflow: "hidden", backgroundColor: colors.surface }, image: { width: "100%", aspectRatio: 0.8 }, name: { marginTop: 10, paddingHorizontal: 10, color: colors.ink, fontFamily: "Montserrat_600SemiBold", fontSize: 13 }, meta: { paddingHorizontal: 10, marginTop: 3, color: colors.muted, fontFamily: "DMSans_400Regular", fontSize: 11 }, price: { paddingHorizontal: 10, marginTop: 6, color: colors.brand, fontFamily: "Montserrat_600SemiBold", fontSize: 13 } });
