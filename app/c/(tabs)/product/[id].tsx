import { useMemo } from "react";
import { Alert, Pressable, Share, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useMutation, useQuery } from "convex/react";
import { Heart, Share2 } from "lucide-react-native";
import { api } from "@/src/convex/api";
import { ConvexImage } from "@/src/components/media";
import { AppHeader, EmptyState, Loading, Screen, Title } from "@/src/components/ui";
import { useAuth } from "@/src/providers/auth";
import { useIsOnline } from "@/src/providers/connectivity";
import { colors, radius } from "@/src/theme/tokens";
import type { SareeId } from "@/src/types/domain";

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>(); const sareeId = id as SareeId; const online = useIsOnline(); const { token, user } = useAuth();
  const saree = useQuery(api.sarees.getById, { id: sareeId });
  const wishlist = useQuery(api.customers.getWishlist, token && user ? { token, customerId: user.customerId } : "skip");
  const add = useMutation(api.customers.addToWishlist); const remove = useMutation(api.customers.removeFromWishlist);
  const saved = useMemo(() => wishlist?.find((item) => item.sareeId === sareeId), [sareeId, wishlist]);
  if (saree === undefined) return <><AppHeader back title="Saree details" /><Loading /></>;
  if (!saree) return <><AppHeader back title="Saree details" /><Screen><EmptyState title="Saree not found" /></Screen></>;
  async function toggle() { if (!online) return Alert.alert("You’re offline", "Reconnect before changing your wishlist."); if (!token || !user || !saree) return; if (saved) await remove({ token, wishlistId: saved._id }); else await add({ token, customerId: user.customerId, sareeId: saree._id, storeId: saree.storeId, sareeName: saree.name, price: saree.price }); }
  const share = () => Share.share({ message: `See ${saree.name} on Wearify: ${process.env.EXPO_PUBLIC_WEB_URL}/c/product/${saree._id}` });
  return <><AppHeader back title="Saree details" right={<Pressable accessibilityLabel="Share saree" onPress={() => void share()}><Share2 color={colors.ink} size={20} /></Pressable>} /><Screen>
    <View style={styles.hero}><ConvexImage fileId={saree.imageIds?.[0]} label={saree.name} style={styles.image} /><Pressable accessibilityRole="button" accessibilityLabel={saved ? "Remove from wishlist" : "Add to wishlist"} style={styles.heart} onPress={() => void toggle()}><Heart color={colors.brand} fill={saved ? colors.brand : "transparent"} size={23} /></Pressable></View>
    <Title subtitle={[saree.fabric, saree.occasion].filter(Boolean).join(" · ")}>{saree.name}</Title>
    {saree.price ? <Text style={styles.price}>₹{saree.price.toLocaleString("en-IN")}</Text> : null}
    <Text style={styles.description}>{saree.description ?? "A curated saree from a Wearify partner store."}</Text>
    <View style={styles.info}><Info label="Colour" value={saree.colorName ?? saree.colors?.join(", ") ?? "—"} /><Info label="Weave" value={saree.weave ?? "—"} /><Info label="Region" value={saree.region ?? "—"} /><Info label="Availability" value={saree.stock && saree.stock > 0 ? "In stock" : saree.status ?? "Ask store"} /></View>
  </Screen></>;
}
function Info({ label, value }: { label: string; value: string }) { return <View style={styles.row}><Text style={styles.label}>{label}</Text><Text style={styles.value}>{value}</Text></View>; }
const styles = StyleSheet.create({ hero: { marginTop: 16, borderRadius: radius.lg, overflow: "hidden" }, image: { width: "100%", aspectRatio: 0.82 }, heart: { position: "absolute", right: 12, top: 12, width: 44, height: 44, borderRadius: 22, backgroundColor: "rgba(255,255,255,.92)", alignItems: "center", justifyContent: "center" }, price: { color: colors.brand, fontFamily: "Montserrat_700Bold", fontSize: 21, marginBottom: 12 }, description: { color: colors.muted, fontFamily: "DMSans_400Regular", fontSize: 14, lineHeight: 21, marginBottom: 20 }, info: { padding: 16, borderRadius: radius.lg, backgroundColor: colors.surface }, row: { minHeight: 46, flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border }, label: { color: colors.muted, fontFamily: "DMSans_400Regular" }, value: { color: colors.ink, fontFamily: "DMSans_600SemiBold" } });
