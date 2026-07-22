import { useRef, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useQuery } from "convex/react";
import { ChevronLeft, ChevronRight, Maximize2, X } from "lucide-react-native";
import { api } from "@/src/convex/api";
import { LookMedia } from "@/src/components/media";
import { AppHeader, Loading } from "@/src/components/ui";
import { useAuth } from "@/src/providers/auth";
import type { WardrobeItem } from "@/src/types/domain";

const MAROON = "#68262A";
const REFERENCE_HERO_HEIGHT = 460;
const MIN_SCALE = 0.72;
const formatPrice = (price?: number) => price && price > 0 ? `₹ ${Number(price).toLocaleString("en-IN")}` : "";

export default function WardrobeScreen() {
  const { width } = useWindowDimensions();
  const { token, user } = useAuth();
  const items = useQuery(api.sessionOps.listWardrobeByCustomer, token && user ? { token, customerId: user.customerId } : "skip");
  const [selected, setSelected] = useState(0);
  const [fullView, setFullView] = useState(false);
  const [heroHeight, setHeroHeight] = useState(REFERENCE_HERO_HEIGHT);
  const rail = useRef<ScrollView>(null);

  if (items === undefined) return <><AppHeader back /><Loading label="Opening your wardrobe…" /></>;

  const index = Math.min(selected, Math.max(items.length - 1, 0));
  const current = items[index];
  const contentWidth = Math.min(width, 720) - 32;
  const scale = Math.min(1, Math.max(MIN_SCALE, heroHeight / REFERENCE_HERO_HEIGHT));
  const px = (value: number) => Math.round(value * scale);
  const cardWidth = px(80);
  const cardGap = px(13);
  const selectedWidth = px(90);
  const select = (next: number) => {
    const safe = (next + items.length) % items.length;
    setSelected(safe);
    rail.current?.scrollTo({ x: safe * (cardWidth + cardGap), animated: true });
  };

  return (
    <View className="flex-1 bg-white">
      <AppHeader back />
      {fullView && current ? (
        <View style={styles.fullStage}>
          <StudioBackground />
          <View pointerEvents="none" style={styles.fullModel}><WardrobeMedia item={current} /></View>
          <Pressable accessibilityRole="button" accessibilityLabel="Close" style={[styles.frosted, styles.close]} onPress={() => setFullView(false)}><X size={20} color={MAROON} strokeWidth={2.4} /></Pressable>
          {items.length > 1 ? <>
            <Pressable accessibilityRole="button" accessibilityLabel="Previous" style={[styles.navButton, styles.previous]} onPress={() => select(index - 1)}><ChevronLeft size={22} color="#000000" strokeWidth={1.6} /></Pressable>
            <Pressable accessibilityRole="button" accessibilityLabel="Next" style={[styles.navButton, styles.next]} onPress={() => select(index + 1)}><ChevronRight size={22} color="#000000" strokeWidth={1.6} /></Pressable>
          </> : null}
          <View style={styles.namePill}><Text numberOfLines={1} style={styles.fullName}>{current.sareeName || "Saved saree"}</Text>{current.price ? <Text style={styles.fullPrice}>{formatPrice(current.price)}</Text> : null}</View>
        </View>
      ) : (
        <>
          <Text className="px-4 pb-3 pt-4 font-montserrat-semibold text-base leading-[26px] text-black">WARDROBE</Text>
          <View className="min-h-0 flex-1 px-4">
            {!current ? <EmptyWardrobe /> : (
              <View style={styles.hero} onLayout={(event) => setHeroHeight(event.nativeEvent.layout.height)}>
                <StudioBackground />
                <View pointerEvents="none" style={[styles.heroModel, { top: px(4), bottom: px(142), maxWidth: px(300) }]}><WardrobeMedia item={current} /></View>
                <Pressable accessibilityRole="button" accessibilityLabel="Expand" style={[styles.frosted, styles.expand, { top: px(16), right: px(16), width: px(35), height: px(35) }]} onPress={() => setFullView(true)}><Maximize2 size={px(17)} color="#111111" strokeWidth={2} /></Pressable>
                <View style={[styles.galleryBand, { bottom: px(5) }]}>
                  <View style={[styles.selectedCopy, { marginBottom: px(10) }]}><Text numberOfLines={1} style={[styles.selectedName, { fontSize: px(12), lineHeight: px(14) }]}>{current.sareeName || "Saved saree"}</Text>{current.price ? <Text style={[styles.selectedPrice, { fontSize: px(12), lineHeight: px(14) }]}>{formatPrice(current.price)}</Text> : null}</View>
                  <ScrollView
                    ref={rail}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: Math.max((contentWidth - cardWidth) / 2, 0), gap: cardGap, alignItems: "flex-end" }}
                  >
                    {items.map((item, itemIndex) => {
                      const active = itemIndex === index;
                      return <Pressable key={item._id} accessibilityRole="button" accessibilityLabel={item.sareeName || "Saved saree"} style={[styles.thumbnail, { width: active ? selectedWidth : cardWidth, height: active ? px(122) : px(108), marginHorizontal: active ? (cardWidth - selectedWidth) / 2 : 0 }, active && styles.thumbnailActive]} onPress={() => select(itemIndex)}><WardrobeMedia item={item} /></Pressable>;
                    })}
                  </ScrollView>
                </View>
              </View>
            )}
          </View>
        </>
      )}
      <Copyright />
    </View>
  );
}

function StudioBackground() {
  return <LinearGradient colors={["#FFFFFF", "#F4F4F4", "#D6D6D6", "#A4A4A4"]} locations={[0, 0.38, 0.68, 1]} style={StyleSheet.absoluteFill} />;
}

function WardrobeMedia({ item }: { item: WardrobeItem }) {
  return <LookMedia cutout={item.lookImageNoBgFileId} render={item.lookImageFileId} fallback={item.sareeImageId} label={item.sareeName || "Saved saree"} surface="transparent" style={styles.media} />;
}

function EmptyWardrobe() {
  return <View style={styles.empty}><Text style={styles.emptyTitle}>Nothing in your wardrobe yet</Text><Text style={styles.emptyCopy}>Save looks from the smart mirror to build your wardrobe</Text></View>;
}

function Copyright() {
  return <View style={styles.copyright}><Text style={styles.copyrightText}>© copyright PHYGIFY TECHNOSERVICES PRIVATE LIMITED</Text></View>;
}

const styles = StyleSheet.create({
  hero: { flex: 1, minHeight: 280, position: "relative", overflow: "hidden", borderRadius: 8, borderWidth: 1, borderColor: "#FFFFFF", backgroundColor: "#D6D6D6", shadowColor: "#000000", shadowOpacity: 0.08, shadowRadius: 11, shadowOffset: { width: 0, height: 6 }, elevation: 3 },
  halo: { position: "absolute", alignSelf: "center", top: "8%", width: "90%", aspectRatio: 1, borderRadius: 999, backgroundColor: "rgba(255,255,255,0.42)" },
  heroModel: { position: "absolute", alignSelf: "center", width: "82%", zIndex: 1 },
  media: { position: "absolute", top: 0, right: 0, bottom: 0, left: 0 },
  frosted: { width: 35, height: 35, borderRadius: 8, borderWidth: 1, borderColor: "#FFFFFF", backgroundColor: "rgba(255,255,255,0.72)", alignItems: "center", justifyContent: "center" },
  expand: { position: "absolute", zIndex: 3 },
  galleryBand: { position: "absolute", left: 0, right: 0, zIndex: 2, overflow: "hidden" },
  selectedCopy: { paddingHorizontal: 20, alignItems: "center" },
  selectedName: { fontFamily: "Montserrat_600SemiBold", fontSize: 12, lineHeight: 14, letterSpacing: -0.24, color: MAROON, textAlign: "center" },
  selectedPrice: { marginTop: 2, fontFamily: "Montserrat_600SemiBold", fontSize: 12, lineHeight: 14, letterSpacing: -0.24, color: MAROON },
  thumbnail: { overflow: "hidden", borderRadius: 8, borderWidth: 2, borderColor: "#FFFFFF", backgroundColor: "#F4F0ED", shadowColor: "#000000", shadowOpacity: 0.12, shadowRadius: 5, shadowOffset: { width: 0, height: 3 }, elevation: 2 },
  thumbnailActive: { borderColor: MAROON, shadowColor: MAROON, shadowOpacity: 0.24, shadowRadius: 8, shadowOffset: { width: 0, height: 6 }, elevation: 5 },
  empty: { paddingHorizontal: 20, paddingVertical: 72, alignItems: "center" },
  emptyTitle: { fontFamily: "Montserrat_600SemiBold", fontSize: 16, color: "#2A2522", textAlign: "center" },
  emptyCopy: { marginTop: 6, fontFamily: "Montserrat_400Regular", fontSize: 13, color: "#9A8F8A", textAlign: "center" },
  fullStage: { flex: 1, minHeight: 0, position: "relative", overflow: "hidden", backgroundColor: "#D6D6D6" },
  fullModel: { position: "absolute", top: 0, left: 0, right: 0, bottom: 96, padding: 16 },
  close: { position: "absolute", top: 16, left: 16, zIndex: 3 },
  navButton: { position: "absolute", top: "48%", width: 42, height: 42, borderRadius: 8, borderWidth: 1, borderColor: "#FFFFFF", backgroundColor: "rgba(255,255,255,0.72)", alignItems: "center", justifyContent: "center", zIndex: 3 },
  previous: { left: 16 },
  next: { right: 16 },
  namePill: { position: "absolute", alignSelf: "center", bottom: 22, zIndex: 3, width: 153, minHeight: 48, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: "rgba(104,38,42,0.1)", backgroundColor: "rgba(255,255,255,0.72)", alignItems: "center", justifyContent: "center", gap: 2 },
  fullName: { fontFamily: "Montserrat_500Medium", fontSize: 14, lineHeight: 17, letterSpacing: -0.24, color: MAROON, textAlign: "center" },
  fullPrice: { fontFamily: "Montserrat_600SemiBold", fontSize: 14, lineHeight: 17, letterSpacing: -0.24, color: MAROON, textAlign: "center" },
  copyright: { minHeight: 20, marginTop: 14, paddingHorizontal: 16, paddingVertical: 4, backgroundColor: MAROON, alignItems: "center", justifyContent: "center" },
  copyrightText: { fontFamily: "Montserrat_400Regular", fontSize: 10, lineHeight: 12, color: "#FFFFFF", textAlign: "center" },
});
