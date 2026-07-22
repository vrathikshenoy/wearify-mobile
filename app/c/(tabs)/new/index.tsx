import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useQuery } from "convex/react";
import { ChevronDown, Sparkles } from "lucide-react-native";
import { api } from "@/src/convex/api";
import { CatalogFilterSheet, EMPTY_FILTERS, FILTER_COLORS, MAX_BUDGET, type CatalogFilters } from "@/src/components/catalog-filter-sheet";
import { ConvexImage } from "@/src/components/media";
import { AppHeader, Loading } from "@/src/components/ui";
import { useAuth } from "@/src/providers/auth";
import type { Saree } from "@/src/types/domain";

const MAROON = "#68262A";
const FALLBACKS = [
  require("@/assets/kiosk/img1.jpg"), require("@/assets/kiosk/img2.webp"),
  require("@/assets/kiosk/img3.webp"), require("@/assets/kiosk/img4.jpg"),
] as const;
const formatPrice = (price?: number) => price == null ? "" : `₹${Number(price).toLocaleString("en-IN")}`;
const chipLabel = (name?: string) => String(name || "").split(" ")[0]?.toUpperCase() || "STORE";

type Arrival = { saree: Saree; storeId: string; storeName: string; city: string };

export default function NewArrivalsScreen() {
  const router = useRouter();
  const { token, user } = useAuth();
  const stores = useQuery(api.customers.listStoreLinksEnriched, token && user ? { token, customerId: user.customerId } : "skip");
  const arrivals = useQuery(api.customers.listNewArrivalsForCustomer, token && user ? { token, customerId: user.customerId } : "skip");
  const [storeFilter, setStoreFilter] = useState("ALL");
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState<CatalogFilters>(EMPTY_FILTERS);

  const items = useMemo(() => {
    if (!arrivals || !stores) return [];
    const cityById = new Map(stores.map((store) => [store.storeId, store.storeCity || ""]));
    return Object.values(arrivals)
      .flatMap((entry) => entry.sarees.map((saree) => ({ saree, storeId: entry.storeId, storeName: entry.storeName, city: cityById.get(entry.storeId) || "" })))
      .filter((item) => storeFilter === "ALL" || item.storeId === storeFilter)
      .filter(({ saree }) => {
        if (filters.occasions.size && !filters.occasions.has(saree.occasion || "")) return false;
        if (filters.fabrics.size && !filters.fabrics.has(saree.fabric || "")) return false;
        if (filters.colors.size) {
          const wanted = new Set(FILTER_COLORS.filter((color) => filters.colors.has(color.hex)).flatMap((color) => [color.hex.toLowerCase(), color.name.toLowerCase()]));
          const own = [...(saree.colors || []), saree.colorName || ""].map((color) => color.toLowerCase());
          if (!own.some((color) => wanted.has(color))) return false;
        }
        return filters.budget === MAX_BUDGET || (saree.price ?? 0) <= filters.budget;
      });
  }, [arrivals, filters, storeFilter, stores]);

  if (arrivals === undefined || stores === undefined) return <><AppHeader back /><Loading label="Finding new arrivals…" /></>;

  return (
    <View style={styles.page}>
      <AppHeader back />
      <FlashList
        data={items}
        numColumns={2}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRail}>
              <Pressable accessibilityRole="button" accessibilityLabel="Filter" style={styles.filterButton} onPress={() => setFilterOpen(true)}>
                <Image source={require("@/assets/customer/new-arrivals/35_vector.svg")} style={styles.filterIcon} contentFit="contain" />
              </Pressable>
              <StoreChip label="ALL" active={storeFilter === "ALL"} onPress={() => setStoreFilter("ALL")} />
              {stores.map((store) => <StoreChip key={store._id} label={chipLabel(store.storeName)} active={storeFilter === store.storeId} onPress={() => setStoreFilter(store.storeId)} />)}
              <Pressable style={styles.more} onPress={() => setFilterOpen(true)}><Text style={styles.moreText}>More</Text><ChevronDown size={12} strokeWidth={2} color="#222222" /></Pressable>
            </ScrollView>
            <View style={styles.banner}>
              <Image source={require("@/assets/customer/new-arrivals/36_chatgpt_image_jul_3__2026__06_12_36_pm__1__1.svg")} style={StyleSheet.absoluteFill} contentFit="cover" accessibilityElementsHidden />
              <Text style={styles.bannerText}>New style from your favorite store</Text>
            </View>
            <Text style={styles.title}>NEW ARRIVALS</Text>
          </>
        }
        ListEmptyComponent={<EmptyArrivals />}
        ListFooterComponent={<Footer />}
        renderItem={({ item, index }) => <ProductCard item={item} fallback={FALLBACKS[index % FALLBACKS.length] ?? FALLBACKS[0]} onPress={() => router.push(`/c/product/${item.saree._id}`)} />}
      />
      <CatalogFilterSheet visible={filterOpen} initial={filters} onClose={() => setFilterOpen(false)} onApply={(next) => { setFilters(next); setFilterOpen(false); }} />
    </View>
  );
}

function StoreChip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return <Pressable style={[styles.chip, active && styles.chipActive]} onPress={onPress}><Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text></Pressable>;
}

function ProductCard({ item, fallback, onPress }: { item: Arrival; fallback: number; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" style={styles.card} onPress={onPress}>
      <View style={styles.productImageWrap}>
        <ConvexImage fileId={item.saree.imageIds?.[0]} fallbackSource={fallback} label={item.saree.name} style={styles.productImage} />
        <View style={styles.newBadge}><Text style={styles.newBadgeText}>New</Text></View>
        {item.saree.occasion ? <View style={styles.categoryBadge}><Text style={styles.categoryText}>{item.saree.occasion}</Text></View> : null}
      </View>
      <View style={styles.info}>
        <View style={styles.infoCopy}>
          <Text numberOfLines={1} style={styles.name}>{item.saree.name}</Text>
          {item.city ? <View style={styles.cityRow}><View style={styles.bullet} /><Text numberOfLines={1} style={styles.city}>{item.city}</Text></View> : null}
          <Text style={styles.price}>{formatPrice(item.saree.price)}</Text>
        </View>
        <View style={styles.arrowButton}><Image source={require("@/assets/customer/new-arrivals/11_vector.svg")} style={styles.arrowIcon} contentFit="contain" /></View>
      </View>
    </Pressable>
  );
}

function EmptyArrivals() {
  return <View style={styles.empty}><View style={styles.emptyIcon}><Sparkles size={26} color={MAROON} /></View><Text style={styles.emptyTitle}>No new arrivals</Text><Text style={styles.emptyCopy}>Check back soon for fresh collections</Text></View>;
}

function Footer() {
  return <><View style={styles.adWrap}><View style={styles.ad}><Image source={require("@/assets/customer/product-detail/add.svg")} style={StyleSheet.absoluteFill} contentFit="cover" accessibilityLabel="Advertisement" /><View style={styles.adLabel}><Image source={require("@/assets/customer/new-arrivals/43_rectangle_12725.svg")} style={StyleSheet.absoluteFill} contentFit="fill" /><Text style={styles.adText}>Ad ⓘ</Text></View></View></View><View style={styles.copyright}><Text style={styles.copyrightText}>© copyright PHYGIFY TECHNOSERVICES PRIVATE LIMITED</Text></View></>;
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#FFFFFF" },
  list: { paddingHorizontal: 11, paddingBottom: 0 },
  filterRail: { marginHorizontal: -11, paddingHorizontal: 16, paddingTop: 16, gap: 8, alignItems: "center" },
  filterButton: { width: 35, height: 35, borderRadius: 8, borderWidth: 1, borderColor: "#D9D9D9", backgroundColor: "rgba(255,255,255,0.5)", alignItems: "center", justifyContent: "center" },
  filterIcon: { width: 18, height: 17 },
  chip: { height: 35, paddingHorizontal: 14, borderRadius: 8, borderWidth: 1, borderColor: "#D9D9D9", backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center" },
  chipActive: { borderColor: MAROON, backgroundColor: MAROON },
  chipText: { fontFamily: "Montserrat_400Regular", fontSize: 10, letterSpacing: -0.23, color: "#222222" },
  chipTextActive: { color: "#FFFFFF" },
  more: { height: 35, paddingHorizontal: 10, borderRadius: 8, borderWidth: 1, borderColor: "#D9D9D9", backgroundColor: "#FFFFFF", flexDirection: "row", alignItems: "center", gap: 4 },
  moreText: { fontFamily: "Montserrat_400Regular", fontSize: 10, letterSpacing: -0.23, color: "#222222" },
  banner: { height: 50, marginHorizontal: -11, marginTop: 10, overflow: "hidden", backgroundColor: MAROON, alignItems: "center", justifyContent: "center" },
  bannerText: { fontFamily: "Montserrat_500Medium", fontSize: 14, letterSpacing: -0.21, color: "#FFFFFF" },
  title: { marginHorizontal: 5, paddingTop: 18, paddingBottom: 10, fontFamily: "Montserrat_600SemiBold", fontSize: 16, lineHeight: 26, color: "#000000" },
  card: { flex: 1, height: 277, marginHorizontal: 4.5, marginBottom: 9, overflow: "hidden", borderRadius: 10, borderWidth: 1, borderColor: "rgba(104,38,42,0.1)", backgroundColor: "#FFFFFF" },
  productImageWrap: { position: "relative", height: 218, overflow: "hidden", borderRadius: 10, backgroundColor: "#71221D" },
  productImage: { width: "100%", height: "100%" },
  newBadge: { position: "absolute", top: 6, right: 6, height: 19, paddingHorizontal: 12, borderRadius: 10, backgroundColor: MAROON, justifyContent: "center" },
  newBadgeText: { fontFamily: "Montserrat_500Medium", fontSize: 8, color: "#FFFFFF", textTransform: "capitalize" },
  categoryBadge: { position: "absolute", bottom: 6, left: 6, height: 19, paddingHorizontal: 10, borderRadius: 10, borderWidth: 1, borderColor: "#FFFFFF", backgroundColor: "rgba(255,255,255,0.8)", justifyContent: "center" },
  categoryText: { fontFamily: "Montserrat_500Medium", fontSize: 8, color: MAROON, textTransform: "capitalize" },
  info: { flex: 1, paddingHorizontal: 6, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  infoCopy: { minWidth: 0, flex: 1 },
  name: { fontFamily: "Montserrat_400Regular", fontSize: 12, lineHeight: 17, color: "#000000", textTransform: "capitalize" },
  cityRow: { marginTop: 2, flexDirection: "row", alignItems: "center", gap: 4 },
  bullet: { width: 2, height: 2, borderRadius: 1, backgroundColor: "#878787" },
  city: { flexShrink: 1, fontFamily: "Montserrat_400Regular", fontSize: 10, color: "#878787", textTransform: "capitalize" },
  price: { marginTop: 1, fontFamily: "Montserrat_600SemiBold", fontSize: 12, lineHeight: 24, color: "#000000" },
  arrowButton: { width: 30, height: 30, borderRadius: 4, borderWidth: 1, borderColor: "rgba(135,135,135,0.2)", backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center" },
  arrowIcon: { width: 13, height: 12 },
  empty: { paddingHorizontal: 20, paddingVertical: 56, alignItems: "center" },
  emptyIcon: { width: 64, height: 64, marginBottom: 14, borderRadius: 32, backgroundColor: "#FBE4E8", alignItems: "center", justifyContent: "center" },
  emptyTitle: { fontFamily: "Montserrat_700Bold", fontSize: 17, color: "#2A2522" },
  emptyCopy: { marginTop: 6, fontFamily: "Montserrat_400Regular", fontSize: 13, color: "#9A8F8A", textAlign: "center" },
  adWrap: { marginHorizontal: 5, paddingTop: 12, paddingBottom: 20 },
  ad: { position: "relative", height: 110, overflow: "hidden", borderRadius: 8 },
  adLabel: { position: "absolute", right: 0, bottom: 0, width: 40, height: 21, justifyContent: "center" },
  adText: { marginLeft: 8, fontFamily: "Montserrat_500Medium", fontSize: 8, letterSpacing: -0.24, color: "#000000" },
  copyright: { minHeight: 20, marginHorizontal: -11, paddingHorizontal: 16, paddingVertical: 4, backgroundColor: MAROON, alignItems: "center", justifyContent: "center" },
  copyrightText: { fontFamily: "Montserrat_400Regular", fontSize: 10, lineHeight: 12, color: "#FFFFFF", textAlign: "center" },
});
