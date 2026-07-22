import { StyleSheet, Text, View } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { useQuery } from "convex/react";
import { api } from "@/src/convex/api";
import { LookMedia } from "@/src/components/media";
import { AppHeader, EmptyState, Loading, Title } from "@/src/components/ui";
import { useAuth } from "@/src/providers/auth";
import { colors, radius } from "@/src/theme/tokens";

export default function WardrobeScreen() {
  const { token, user } = useAuth();
  const items = useQuery(api.sessionOps.listWardrobeByCustomer, token && user ? { token, customerId: user.customerId } : "skip");
  if (items === undefined) return <><AppHeader /><Loading label="Opening your wardrobe…" /></>;
  return <View style={styles.page}><AppHeader /><FlashList data={items} numColumns={2} contentContainerStyle={styles.list} ListHeaderComponent={<Title subtitle={`${items.length} favourite${items.length === 1 ? "" : "s"} in one place`}>My Wardrobe</Title>} ListEmptyComponent={<EmptyState title="Your wardrobe is empty" detail="Save a look during an in-store visit." />} renderItem={({ item }) => <View style={styles.card}><LookMedia cutout={item.lookImageNoBgFileId} render={item.lookImageFileId} fallback={item.sareeImageId} label={item.sareeName ?? "Wardrobe item"} style={styles.image} /><Text numberOfLines={1} style={styles.name}>{item.sareeName ?? "Saved saree"}</Text><Text style={styles.meta}>{item.sareeOccasion ?? "Your wardrobe"}</Text></View>} /></View>;
}
const styles = StyleSheet.create({ page: { flex: 1, backgroundColor: colors.canvas }, list: { paddingHorizontal: 12, paddingBottom: 100 }, card: { flex: 1, margin: 6, paddingBottom: 10, borderRadius: radius.sm, overflow: "hidden", backgroundColor: colors.surface }, image: { width: "100%", aspectRatio: 0.8 }, name: { paddingHorizontal: 10, marginTop: 9, color: colors.ink, fontFamily: "Montserrat_600SemiBold", fontSize: 13 }, meta: { paddingHorizontal: 10, marginTop: 3, color: colors.muted, fontFamily: "DMSans_400Regular", fontSize: 11 } });
