import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { useMutation, useQuery } from "convex/react";
import { Heart } from "lucide-react-native";
import { api } from "@/src/convex/api";
import { LookMedia } from "@/src/components/media";
import { AppHeader, Loading } from "@/src/components/ui";
import { useAuth } from "@/src/providers/auth";
import { useIsOnline } from "@/src/providers/connectivity";
import type { WishlistItem } from "@/src/types/domain";

const MAROON = "#68262A";
const formatPrice = (price: number) => `₹${Number(price).toLocaleString("en-IN")}`;
const formatDate = (timestamp?: number) => timestamp ? new Date(timestamp).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "";

export default function WishlistScreen() {
  const online = useIsOnline();
  const { token, user } = useAuth();
  const items = useQuery(api.customers.getWishlist, token && user ? { token, customerId: user.customerId } : "skip");
  const remove = useMutation(api.customers.removeFromWishlist);

  if (items === undefined) return <><AppHeader back /><Loading label="Loading your wishlist…" /></>;

  async function removeItem(id: WishlistItem["_id"]) {
    if (!online) return Alert.alert("You’re offline", "Reconnect before changing your wishlist.");
    if (token) await remove({ token, wishlistId: id });
  }

  return (
    <View style={styles.page}>
      <AppHeader back />
      <View style={styles.titleRow}>
        <Text style={styles.title}>MY WISHLIST</Text>
        <View style={styles.count}><Text style={styles.countText}>{items.length} Wishlist</Text></View>
      </View>
      <FlashList
        data={items}
        numColumns={2}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<EmptyWishlist />}
        ListFooterComponent={<Copyright />}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.imageWrap}>
              <LookMedia cutout={item.lookImageNoBgFileId} render={item.lookImageFileId} fallback={item.sareeImageId} label={item.sareeName} style={styles.image} surface="#FCF9F1" scale={1.08} />
              <Pressable accessibilityRole="button" accessibilityLabel={`Remove ${item.sareeName} from wishlist`} hitSlop={8} style={styles.heart} onPress={() => void removeItem(item._id)}>
                <Heart color={MAROON} fill={MAROON} strokeWidth={2} size={14} />
              </Pressable>
              {item.sareeOccasion ? <View style={styles.badge}><Text style={styles.badgeText}>{item.sareeOccasion}</Text></View> : null}
            </View>
            <View style={styles.info}>
              <Text numberOfLines={1} style={styles.name}>{item.sareeName}</Text>
              <View style={styles.metaRow}>
                <Text style={styles.meta}>{formatDate(item._creationTime)}</Text>
                {item.storeCity ? <><View style={styles.bullet} /><Text numberOfLines={1} style={styles.meta}>{item.storeCity}</Text></> : null}
              </View>
              {item.price != null ? <Text style={styles.price}>{formatPrice(item.price)}</Text> : null}
            </View>
          </View>
        )}
      />
    </View>
  );
}

function EmptyWishlist() {
  return <View style={styles.empty}><View style={styles.emptyIcon}><Heart size={26} color={MAROON} /></View><Text style={styles.emptyTitle}>Your wishlist is empty</Text><Text style={styles.emptyCopy}>Tap the heart on any look to save it here</Text></View>;
}

function Copyright() {
  return <View style={styles.copyright}><Text style={styles.copyrightText}>© copyright PHYGIFY TECHNOSERVICES PRIVATE LIMITED</Text></View>;
}

const shadow = { shadowColor: "#000000", shadowOpacity: 0.16, shadowRadius: 7.5, shadowOffset: { width: 0, height: 4 }, elevation: 4 } as const;
const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#FFFFFF" },
  titleRow: { minHeight: 65, paddingHorizontal: 16, paddingVertical: 14, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  title: { fontFamily: "Montserrat_600SemiBold", fontSize: 16, lineHeight: 26, color: "#000000" },
  count: { height: 35, paddingHorizontal: 14, justifyContent: "center", borderWidth: 1, borderColor: "rgba(104,38,42,0.1)", borderRadius: 8, backgroundColor: "#FFFFFF" },
  countText: { fontFamily: "Montserrat_500Medium", fontSize: 10, letterSpacing: -0.23, color: "#000000" },
  list: { paddingHorizontal: 11, paddingBottom: 0 },
  card: { flex: 1, marginHorizontal: 5, marginBottom: 10, overflow: "hidden", borderRadius: 10, backgroundColor: "#FFFFFF", ...shadow },
  imageWrap: { position: "relative", aspectRatio: 176 / 218, overflow: "hidden", borderRadius: 10, backgroundColor: "#FCF9F1" },
  image: { width: "100%", height: "100%" },
  heart: { position: "absolute", top: 6, right: 6, width: 25, height: 25, borderRadius: 13, borderWidth: 1, borderColor: "rgba(255,255,255,0.8)", backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center" },
  badge: { position: "absolute", bottom: 6, left: 6, height: 19, paddingHorizontal: 10, borderRadius: 10, borderWidth: 1, borderColor: MAROON, backgroundColor: "rgba(255,255,255,0.8)", justifyContent: "center" },
  badgeText: { fontFamily: "Montserrat_500Medium", fontSize: 8, lineHeight: 11, color: MAROON, textTransform: "capitalize" },
  info: { minHeight: 64, paddingHorizontal: 10, paddingTop: 8, paddingBottom: 12 },
  name: { fontFamily: "Montserrat_500Medium", fontSize: 12, lineHeight: 17, color: "#000000", textTransform: "capitalize" },
  metaRow: { minWidth: 0, flexDirection: "row", alignItems: "center", gap: 6, marginTop: 1 },
  meta: { flexShrink: 1, fontFamily: "Montserrat_400Regular", fontSize: 10, lineHeight: 14, color: "#878787", textTransform: "capitalize" },
  bullet: { width: 2, height: 2, borderRadius: 1, backgroundColor: "#878787" },
  price: { fontFamily: "Montserrat_500Medium", fontSize: 12, lineHeight: 24, color: "#000000" },
  empty: { paddingHorizontal: 20, paddingVertical: 72, alignItems: "center" },
  emptyIcon: { width: 64, height: 64, marginBottom: 14, borderRadius: 32, backgroundColor: "#FBE4E8", alignItems: "center", justifyContent: "center" },
  emptyTitle: { fontFamily: "Montserrat_600SemiBold", fontSize: 16, color: "#2A2522" },
  emptyCopy: { marginTop: 6, fontFamily: "Montserrat_400Regular", fontSize: 13, color: "#9A8F8A", textAlign: "center" },
  copyright: { minHeight: 20, marginHorizontal: -11, marginTop: 16, paddingHorizontal: 16, paddingVertical: 4, backgroundColor: MAROON, alignItems: "center", justifyContent: "center" },
  copyrightText: { fontFamily: "Montserrat_400Regular", fontSize: 10, lineHeight: 12, color: "#FFFFFF", textAlign: "center" },
});
