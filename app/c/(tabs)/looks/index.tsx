import { useCallback, useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useMutation, useQuery } from "convex/react";
import { ChevronDown, Heart } from "lucide-react-native";
import { api } from "@/src/convex/api";
import { CatalogFilterSheet, EMPTY_FILTERS, MAX_BUDGET, type CatalogFilters } from "@/src/components/catalog-filter-sheet";
import { LookMedia } from "@/src/components/media";
import { PreparingAd } from "@/src/components/preparing-ad";
import { AppHeader, Loading } from "@/src/components/ui";
import { useAuth } from "@/src/providers/auth";
import { useIsOnline } from "@/src/providers/connectivity";
import type { Look, WishlistItem } from "@/src/types/domain";

const MAROON = "#68262A";
const LOOK_BG = "#FCF9F1";
const formatPrice = (price: number) => `₹${Number(price).toLocaleString("en-IN")}`;
const longDate = (timestamp?: number) => timestamp ? new Date(timestamp).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "";
const shortDate = (timestamp?: number) => timestamp ? new Date(timestamp).toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "2-digit" }) : "";
const chipLabel = (name?: string) => String(name || "").split(" ")[0]?.toUpperCase() || "STORE";

export default function LooksScreen() {
  const router = useRouter();
  const online = useIsOnline();
  const { token, user } = useAuth();
  const looks = useQuery(api.sessionOps.listByCustomer, token && user ? { token, customerId: user.customerId } : "skip");
  const stores = useQuery(api.customers.listStoreLinksEnriched, token && user ? { token, customerId: user.customerId } : "skip");
  const wishlist = useQuery(api.customers.getWishlist, token && user ? { token, customerId: user.customerId } : "skip");
  const add = useMutation(api.customers.addToWishlist);
  const remove = useMutation(api.customers.removeFromWishlist);
  const [preparing, setPreparing] = useState(true);
  const [storeFilter, setStoreFilter] = useState("ALL");
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState<CatalogFilters>(EMPTY_FILTERS);
  const [toast, setToast] = useState("");
  const finishPreparing = useCallback(() => setPreparing(false), []);
  const showToast = (message: string) => { setToast(message); setTimeout(() => setToast(""), 2000); };

  const wishlistBySaree = useMemo(() => new Map((wishlist || []).map((item) => [String(item.sareeId), item._id])), [wishlist]);
  const filtered = useMemo(() => (looks || []).filter((look) => {
    if (storeFilter !== "ALL" && String(look.storeId) !== storeFilter) return false;
    if (filters.dates.size && !filters.dates.has(shortDate(look.createdAt))) return false;
    if (filters.occasions.size && !filters.occasions.has(look.sareeOccasion || "")) return false;
    if (filters.fabrics.size && !filters.fabrics.has(look.fabric || "")) return false;
    if (filters.colors.size && !(look.sareeGrad || []).some((color) => filters.colors.has(color))) return false;
    return filters.budget === MAX_BUDGET || (look.price ?? 0) <= filters.budget;
  }), [filters, looks, storeFilter]);

  if (preparing) return <PreparingAd onDone={finishPreparing} />;
  if (looks === undefined) return <><AppHeader back /><Loading label="Loading your looks…" /></>;

  async function toggleWishlist(look: Look) {
    if (!online) return Alert.alert("You’re offline", "Reconnect before changing your wishlist.");
    if (!token || !user) return;
    const wishedId = wishlistBySaree.get(String(look.sareeId));
    try {
      if (wishedId) {
        await remove({ token, wishlistId: wishedId as WishlistItem["_id"] });
        showToast("Removed from wishlist");
      } else if (look.storeId) {
        await add({ token, customerId: user.customerId, sareeId: look.sareeId, storeId: look.storeId, sareeName: look.sareeName || "Saree", price: look.price });
        showToast("Added to wishlist");
      }
    } catch {
      showToast("Something went wrong. Please try again.");
    }
  }

  const dates = [...new Set(looks.map((look) => shortDate(look.createdAt)).filter(Boolean))].slice(0, 8);

  return (
    <View style={styles.page}>
      <AppHeader back />
      <View style={styles.listWrap}>
      <FlashList
        data={filtered}
        numColumns={2}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterStrip} contentContainerStyle={styles.filterRail}>
              <Pressable accessibilityRole="button" accessibilityLabel="Filter" style={styles.filterButton} onPress={() => setFilterOpen(true)}>
                <Image source={require("@/assets/customer/my-looks/15_vector.svg")} style={styles.filterIcon} contentFit="contain" />
              </Pressable>
              <StoreChip label="ALL" active={storeFilter === "ALL"} onPress={() => setStoreFilter("ALL")} />
              {(stores || []).map((store) => <StoreChip key={store._id} label={chipLabel(store.storeName)} active={storeFilter === store.storeId} onPress={() => setStoreFilter(store.storeId)} />)}
              <Pressable style={styles.more} onPress={() => setFilterOpen(true)}><Text style={styles.moreText}>More</Text><ChevronDown size={12} strokeWidth={2} color="#222222" /></Pressable>
            </ScrollView>
            <View style={styles.banner}>
              <Image source={require("@/assets/customer/my-looks/16_chatgpt_image_jul_3__2026__06_12_36_pm__1__1.svg")} style={[StyleSheet.absoluteFill, { opacity: 0.2 }]} contentFit="cover" accessibilityElementsHidden />
              <Text style={styles.bannerText}>New style from your favorite store</Text>
            </View>
            <Text style={styles.title}>MY LOOKS</Text>
          </>
        }
        ListEmptyComponent={<EmptyLooks />}
        renderItem={({ item }) => {
          const store = (stores || []).find((entry) => entry.storeId === item.storeId);
          const wished = wishlistBySaree.has(String(item.sareeId));
          return <LookCard item={item} city={store?.storeCity} wished={wished} onOpen={() => router.push(`/c/looks/${item._id}`)} onWishlist={() => void toggleWishlist(item)} />;
        }}
      />
      </View>
      <Copyright />
      {toast ? <View style={styles.toast}><Text style={styles.toastText}>{toast}</Text></View> : null}
      <CatalogFilterSheet visible={filterOpen} initial={filters} dates={dates} onClose={() => setFilterOpen(false)} onApply={(next) => { setFilters(next); setFilterOpen(false); }} />
    </View>
  );
}

function StoreChip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return <Pressable style={[styles.chip, active && styles.chipActive]} onPress={onPress}><Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text></Pressable>;
}

function LookCard({ item, city, wished, onOpen, onWishlist }: { item: Look; city?: string; wished: boolean; onOpen: () => void; onWishlist: () => void }) {
  return (
    <View style={styles.card}>
      <Pressable style={styles.imageWrap} onPress={onOpen}>
        <LookMedia cutout={item.imageNoBgFileId} render={item.imageFileId} fallback={item.sareeImageId} label={item.sareeName || "Saree"} surface={LOOK_BG} scale={1.08} style={styles.image} />
        <Pressable accessibilityRole="button" accessibilityLabel={wished ? "Remove from wishlist" : "Add to wishlist"} hitSlop={8} style={styles.heart} onPress={onWishlist}>
          <Heart size={14} color={MAROON} fill={wished ? MAROON : "transparent"} strokeWidth={2} />
        </Pressable>
        {item.sareeOccasion ? <View style={styles.badge}><Text style={styles.badgeText}>{item.sareeOccasion}</Text></View> : null}
      </Pressable>
      <Pressable style={styles.info} onPress={onOpen}>
        <Text numberOfLines={1} style={styles.name}>{item.sareeName || "Saree"}</Text>
        <View style={styles.metaRow}>
          <Text style={styles.meta}>{longDate(item.createdAt)}</Text>
          {city ? <><View style={styles.bullet} /><Text numberOfLines={1} style={styles.meta}>{city}</Text></> : null}
        </View>
        {item.price != null ? <Text style={styles.price}>{formatPrice(item.price)}</Text> : null}
      </Pressable>
    </View>
  );
}

function EmptyLooks() {
  return <View style={styles.empty}><View style={styles.emptyIcon}><Heart size={26} color={MAROON} /></View><Text style={styles.emptyTitle}>No looks yet</Text><Text style={styles.emptyCopy}>Try on sarees at a Wearify store to see them here</Text></View>;
}

function Copyright() {
  return <View style={styles.copyright}><Text style={styles.copyrightText}>© copyright PHYGIFY TECHNOSERVICES PRIVATE LIMITED</Text></View>;
}

const shadow = { shadowColor: "#000000", shadowOpacity: 0.16, shadowRadius: 7.5, shadowOffset: { width: 0, height: 4 }, elevation: 4 } as const;
const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#FAF7F4" },
  list: { paddingHorizontal: 11, paddingBottom: 0 },
  filterStrip: { marginHorizontal: -11, backgroundColor: "#FFFFFF" },
  filterRail: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12, gap: 8, alignItems: "center" },
  filterButton: { width: 35, height: 35, borderRadius: 8, borderWidth: 1, borderColor: "#D9D9D9", backgroundColor: "rgba(255,255,255,0.5)", alignItems: "center", justifyContent: "center" },
  filterIcon: { width: 18, height: 17 },
  chip: { height: 35, paddingHorizontal: 14, borderRadius: 8, borderWidth: 1, borderColor: "#D9D9D9", backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center" },
  chipActive: { borderColor: MAROON, backgroundColor: MAROON },
  chipText: { fontFamily: "Montserrat_400Regular", fontSize: 10, letterSpacing: -0.23, color: "#222222" },
  chipTextActive: { color: "#FFFFFF" },
  more: { height: 35, paddingHorizontal: 10, borderRadius: 8, borderWidth: 1, borderColor: "#D9D9D9", backgroundColor: "#FFFFFF", flexDirection: "row", alignItems: "center", gap: 4 },
  moreText: { fontFamily: "Montserrat_400Regular", fontSize: 10, letterSpacing: -0.23, color: "#222222" },
  banner: { height: 50, marginHorizontal: -11, marginTop: 0, overflow: "hidden", backgroundColor: MAROON, alignItems: "center", justifyContent: "center" },
  bannerText: { fontFamily: "Montserrat_500Medium", fontSize: 14, letterSpacing: -0.21, color: "#FFFFFF" },
  title: { marginHorizontal: -11, paddingHorizontal: 16, paddingTop: 18, paddingBottom: 10, backgroundColor: "#FFFFFF", fontFamily: "Montserrat_600SemiBold", fontSize: 16, lineHeight: 26, color: "#000000" },
  card: { flex: 1, marginHorizontal: 4.5, marginBottom: 9, overflow: "hidden", borderRadius: 10, backgroundColor: "#FFFFFF", ...shadow },
  imageWrap: { position: "relative", height: 218, overflow: "hidden", borderRadius: 10, backgroundColor: LOOK_BG },
  image: { width: "100%", height: "100%" },
  heart: { position: "absolute", top: 6, right: 6, width: 25, height: 25, borderRadius: 13, backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center", elevation: 1 },
  badge: { position: "absolute", bottom: 6, left: 6, height: 19, paddingHorizontal: 10, borderRadius: 10, borderWidth: 1, borderColor: MAROON, backgroundColor: "rgba(255,255,255,0.8)", justifyContent: "center" },
  badgeText: { fontFamily: "Montserrat_500Medium", fontSize: 8, color: MAROON, textTransform: "capitalize" },
  info: { minHeight: 64, paddingHorizontal: 10, paddingTop: 8, paddingBottom: 12 },
  name: { fontFamily: "Montserrat_400Regular", fontSize: 12, lineHeight: 17, color: "#000000", textTransform: "capitalize" },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 3 },
  meta: { flexShrink: 1, fontFamily: "Montserrat_400Regular", fontSize: 10, color: "#878787", textTransform: "capitalize" },
  bullet: { width: 2, height: 2, borderRadius: 1, backgroundColor: "#878787" },
  price: { marginTop: 1, fontFamily: "Montserrat_600SemiBold", fontSize: 12, lineHeight: 24, color: "#000000" },
  empty: { paddingHorizontal: 20, paddingVertical: 56, alignItems: "center" },
  emptyIcon: { width: 64, height: 64, marginBottom: 14, borderRadius: 32, backgroundColor: "#FBE4E8", alignItems: "center", justifyContent: "center" },
  emptyTitle: { fontFamily: "Montserrat_700Bold", fontSize: 17, color: "#2A2522" },
  emptyCopy: { marginTop: 6, fontFamily: "Montserrat_400Regular", fontSize: 13, color: "#9A8F8A", textAlign: "center" },
  listWrap: { flex: 1 },
  copyright: { minHeight: 20, paddingHorizontal: 16, paddingVertical: 6, backgroundColor: MAROON, alignItems: "center", justifyContent: "center" },
  copyrightText: { fontFamily: "Montserrat_400Regular", fontSize: 10, lineHeight: 12, color: "#FFFFFF", textAlign: "center" },
  toast: { position: "absolute", bottom: 20, alignSelf: "center", paddingHorizontal: 18, paddingVertical: 10, borderRadius: 20, backgroundColor: MAROON, elevation: 6 },
  toastText: { fontFamily: "Montserrat_600SemiBold", fontSize: 13, color: "#FFFFFF" },
});
