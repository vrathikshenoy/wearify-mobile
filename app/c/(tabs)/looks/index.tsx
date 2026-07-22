import { useCallback, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { useRouter } from "expo-router";
import { useQuery } from "convex/react";
import { Heart } from "lucide-react-native";
import { api } from "@/src/convex/api";
import { LookMedia } from "@/src/components/media";
import { PreparingAd } from "@/src/components/preparing-ad";
import { AppHeader, EmptyState, Loading, Title } from "@/src/components/ui";
import { useAuth } from "@/src/providers/auth";
import { colors, radius } from "@/src/theme/tokens";

export default function LooksScreen() {
  const router = useRouter(); const { token, user } = useAuth();
  const looks = useQuery(api.sessionOps.listByCustomer, token && user ? { token, customerId: user.customerId } : "skip");
  const [preparing, setPreparing] = useState(true);
  const finishPreparing = useCallback(() => setPreparing(false), []);
  const [filter, setFilter] = useState("All");
  const filters = useMemo(() => ["All", ...new Set((looks ?? []).map((look) => look.sareeOccasion).filter((x): x is string => Boolean(x)))], [looks]);
  const filtered = filter === "All" ? looks : looks?.filter((look) => look.sareeOccasion === filter);
  if (preparing) return <PreparingAd onDone={finishPreparing} />;
  if (looks === undefined) return <><AppHeader /><Loading label="Loading your looks…" /></>;
  return <View style={styles.page}><AppHeader /><FlashList data={filtered ?? []} numColumns={2} contentContainerStyle={styles.list} ListHeaderComponent={<><Title subtitle={`${looks.length} saved try-on${looks.length === 1 ? "" : "s"}`}>My Looks</Title><View style={styles.filters}>{filters.map((item) => <Pressable key={item} style={[styles.filter, item === filter && styles.filterActive]} onPress={() => setFilter(item)}><Text style={[styles.filterText, item === filter && styles.filterTextActive]}>{item}</Text></Pressable>)}</View></>} ListEmptyComponent={<EmptyState title="No looks yet" detail="Try on sarees in store to build your collection." />} renderItem={({ item }) => <Pressable style={styles.card} onPress={() => router.push(`/c/looks/${item._id}`)}><LookMedia cutout={item.imageNoBgFileId} render={item.imageFileId} fallback={item.sareeImageId} label={item.sareeName ?? "Look"} style={styles.image} /><View style={styles.cardBody}><Text numberOfLines={1} style={styles.name}>{item.sareeName ?? "Saree look"}</Text><Text style={styles.meta}>{item.sareeOccasion ?? item.fabric ?? "Saree"}</Text></View><Heart color={colors.brand} size={18} style={styles.heart} /></Pressable>} /></View>;
}
const styles = StyleSheet.create({ page: { flex: 1, backgroundColor: colors.canvas }, list: { paddingHorizontal: 12, paddingBottom: 100 }, filters: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 18 }, filter: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.pill, paddingHorizontal: 14, paddingVertical: 8, backgroundColor: colors.surface }, filterActive: { backgroundColor: colors.brand, borderColor: colors.brand }, filterText: { color: colors.muted, fontFamily: "DMSans_500Medium", fontSize: 12 }, filterTextActive: { color: "#FFFFFF" }, card: { flex: 1, margin: 6, borderRadius: radius.sm, overflow: "hidden", backgroundColor: colors.surface }, image: { width: "100%", aspectRatio: 0.8 }, cardBody: { padding: 10 }, name: { color: colors.ink, fontFamily: "Montserrat_600SemiBold", fontSize: 13 }, meta: { marginTop: 3, color: colors.muted, fontFamily: "DMSans_400Regular", fontSize: 11 }, heart: { position: "absolute", top: 10, right: 10 } });
