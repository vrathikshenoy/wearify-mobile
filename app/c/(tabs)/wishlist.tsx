import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { useMutation, useQuery } from "convex/react";
import { useRouter } from "expo-router";
import { Heart } from "lucide-react-native";
import { api } from "@/src/convex/api";
import { LookMedia } from "@/src/components/media";
import { AppHeader, EmptyState, Loading, Title } from "@/src/components/ui";
import { useAuth } from "@/src/providers/auth";
import { useIsOnline } from "@/src/providers/connectivity";
import { colors, radius } from "@/src/theme/tokens";
import type { WishlistItem } from "@/src/types/domain";

export default function WishlistScreen() {
  const router = useRouter(); const online = useIsOnline(); const { token, user } = useAuth();
  const items = useQuery(api.customers.getWishlist, token && user ? { token, customerId: user.customerId } : "skip");
  const remove = useMutation(api.customers.removeFromWishlist);
  if (items === undefined) return <><AppHeader /><Loading label="Loading your wishlist…" /></>;
  async function removeItem(id: WishlistItem["_id"]) { if (!online) return Alert.alert("You’re offline", "Reconnect before changing your wishlist."); if (token) await remove({ token, wishlistId: id }); }
  return <View style={styles.page}><AppHeader /><FlashList data={items} numColumns={2} contentContainerStyle={styles.list} ListHeaderComponent={<Title subtitle={`${items.length} saved style${items.length === 1 ? "" : "s"}`}>Wishlist</Title>} ListEmptyComponent={<EmptyState title="Nothing here yet" detail="Heart a saree to save it for later." />} renderItem={({ item }) => <Pressable style={styles.card} onPress={() => router.push(`/c/product/${item.sareeId}`)}><LookMedia cutout={item.lookImageNoBgFileId} render={item.lookImageFileId} fallback={item.sareeImageId} label={item.sareeName} style={styles.image} /><Pressable accessibilityRole="button" accessibilityLabel={`Remove ${item.sareeName} from wishlist`} style={styles.heart} onPress={() => void removeItem(item._id)}><Heart color="#FFFFFF" fill={colors.brand} size={21} /></Pressable><Text numberOfLines={1} style={styles.name}>{item.sareeName}</Text><Text style={styles.meta}>{item.storeName ?? item.storeCity ?? "Saved saree"}</Text></Pressable>} /></View>;
}
const styles = StyleSheet.create({ page: { flex: 1, backgroundColor: colors.canvas }, list: { paddingHorizontal: 12, paddingBottom: 100 }, card: { flex: 1, margin: 6, paddingBottom: 10, borderRadius: radius.sm, overflow: "hidden", backgroundColor: colors.surface }, image: { width: "100%", aspectRatio: 0.8 }, heart: { position: "absolute", top: 9, right: 9, width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,.9)" }, name: { paddingHorizontal: 10, marginTop: 9, color: colors.ink, fontFamily: "Montserrat_600SemiBold", fontSize: 13 }, meta: { paddingHorizontal: 10, marginTop: 3, color: colors.muted, fontFamily: "DMSans_400Regular", fontSize: 11 } });
