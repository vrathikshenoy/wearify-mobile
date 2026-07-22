import { useState } from "react";
import {
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery } from "convex/react";
import { ArrowRight, Bell, Star, User, X } from "lucide-react-native";
import { api } from "@/src/convex/api";
import { ConvexImage } from "@/src/components/media";
import { Brand, Loading } from "@/src/components/ui";
import { useAuth } from "@/src/providers/auth";
import type { FileId } from "@/src/types/domain";

const MAROON = "#68262A";
const HOME = {
  hero: require("@/assets/customer/home/3_chatgpt_image_jul_3__2026__06_12_36_pm__1__1.svg"),
  offer: require("@/assets/customer/home/8_rectangle_2.svg"),
  looks: require("@/assets/customer/home/looks.svg"),
  store: require("@/assets/customer/home/store.svg"),
  arrivals: require("@/assets/customer/home/43_chatgpt_image_jul_3__2026__05_26_30_pm_1.svg"),
  wardrobe: require("@/assets/customer/home/45_chatgpt_image_jul_3__2026__06_18_59_pm__1__1.svg"),
  explore: require("@/assets/customer/home/47_chatgpt_image_jul_3__2026__05_01_03_pm__1__1.svg"),
};

const PLACEHOLDER_STORES = [
  { id: "ps-1", name: "MAUVE Sarees", city: "Mumbai", rating: "5.0", image: require("@/assets/customer/home/13_rectangle_12600.svg") },
  { id: "ps-2", name: "Rukmini Sarees", city: "Pune", rating: "5.0", image: require("@/assets/customer/home/15_rectangle_12601.svg") },
  { id: "ps-3", name: "Channie", city: "Chennai", rating: "5.0", image: require("@/assets/customer/home/19_rectangle_12601.svg") },
  { id: "ps-4", name: "Calcutta Chic", city: "Kolkata", rating: "4.9", image: require("@/assets/customer/stores/calcutta-chic.svg") },
  { id: "ps-5", name: "Libas", city: "New Delhi", rating: "4.8", image: require("@/assets/customer/stores/libas.svg") },
  { id: "ps-6", name: "Silk Sutra", city: "Chennai", rating: "5.0", image: require("@/assets/customer/stores/mauve-saree.svg") },
  { id: "ps-7", name: "Kanchi House", city: "Jaipur", rating: "4.7", image: require("@/assets/customer/stores/rukmini.svg") },
] as const;

const formatPrice = (price: number) => `₹${Number(price).toLocaleString("en-IN")}`;

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
}

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { token, user, customer } = useAuth();
  const customerId = user?.customerId;
  const stores = useQuery(api.customers.listStoreLinksEnriched, token && customerId ? { token, customerId } : "skip");
  const looks = useQuery(api.sessionOps.listByCustomer, token && customerId ? { token, customerId } : "skip");
  const [dismissed, setDismissed] = useState(() => new Set<string>());
  const [offerIndex, setOfferIndex] = useState(0);
  const shellWidth = Math.min(width, 720);
  const offerWidth = shellWidth - 32;

  if (!customerId || stores === undefined || looks === undefined) return <Loading />;

  const displayName = user?.name || customer?.name || "there";
  const recentLooks = looks.slice(0, 5);
  const visibleStores = PLACEHOLDER_STORES.filter((store) => !dismissed.has(store.id));

  return (
    <View className="flex-1 bg-white">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={[styles.hero, { paddingTop: insets.top }]}>
          <Image source={HOME.hero} style={StyleSheet.absoluteFill} contentFit="cover" accessibilityElementsHidden />
          <View style={styles.appBar}>
            <Pressable accessibilityRole="button" accessibilityLabel="Profile" hitSlop={12} onPress={() => router.push("/c/me")}>
              <User size={20} strokeWidth={1.6} color="#222222" />
            </Pressable>
            <View pointerEvents="none" style={styles.logo}><Brand width={116} /></View>
            <Pressable accessibilityRole="button" accessibilityLabel="Notifications" hitSlop={12} style={styles.bell}>
              <Bell size={19} strokeWidth={1.5} color="#222222" />
              <View style={styles.notificationDot} />
            </Pressable>
          </View>

          <View style={styles.greeting}>
            <Text style={styles.greetingLabel}>{greeting()}</Text>
            <Text style={styles.greetingName}>{displayName}</Text>
          </View>
          <View style={styles.chips}>
            <Chip icon={HOME.looks} label={`${looks.length} look${looks.length === 1 ? "" : "s"}`} onPress={() => router.push("/c/looks")} />
            <Chip icon={HOME.store} label={`${stores.length} store${stores.length === 1 ? "" : "s"}`} onPress={() => router.push("/c/me/stores")} />
          </View>
        </View>

        <View style={styles.offerSection}>
          <Text style={styles.sectionTitle}>Offers &amp; Promotions</Text>
          <ScrollView
            horizontal
            pagingEnabled
            disableScrollViewPanResponder
            decelerationRate="fast"
            snapToInterval={offerWidth + 14}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.offerRail}
            onMomentumScrollEnd={(event) => setOfferIndex(Math.round(event.nativeEvent.contentOffset.x / (offerWidth + 14)))}
          >
            {[0, 1, 2].map((index) => (
              <Pressable key={index} onPress={() => router.push("/c/new")} style={{ width: offerWidth }}>
                <Image source={HOME.offer} style={styles.offerImage} contentFit="fill" accessibilityLabel="Offers and promotions" />
              </Pressable>
            ))}
          </ScrollView>
          <View style={styles.dots}>
            {[0, 1, 2].map((index) => <View key={index} style={[styles.dot, index === offerIndex && styles.dotActive]} />)}
          </View>
        </View>

        <View style={styles.newSpaceSection}>
          <Text style={[styles.sectionTitle, styles.noHorizontalPadding]}>New Space</Text>
          <View style={styles.newSpaceGrid}>
            <View style={styles.newSpaceColumn}>
              <NewSpaceCard title="New Arrivals" subtitle="New style from your favorite store" background="#CB857C" image={HOME.arrivals} imageWidth={62} onPress={() => router.push("/c/new")} />
              <NewSpaceCard title="Wardrobe" subtitle="All your favorite in one place" background="#F6CBB7" color={MAROON} image={HOME.wardrobe} imageWidth={78} onPress={() => router.push("/c/wardrobe")} />
            </View>
            <NewSpaceCard tall title="Explore Store" subtitle="Visit stores around you" background={MAROON} image={HOME.explore} imageWidth={124} imageBottom={-8} onPress={() => router.push("/c/me/stores")} />
          </View>
        </View>

        <View style={styles.looksSection}>
          <SectionHead title="Recent Looks" onPress={() => router.push("/c/looks")} />
          {recentLooks.length ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.lookRail}>
              {recentLooks.map((look) => {
                const colors = look.sareeGrad?.length ? look.sareeGrad : ["#71221D", "#D4A843"];
                const fileId = (look.imageNoBgFileId ?? look.imageFileId ?? look.sareeImageId) as FileId | undefined;
                return (
                  <Pressable key={look._id} style={styles.lookCard} onPress={() => router.push(`/c/looks/${look._id}`)}>
                    <View style={[styles.lookImage, { backgroundColor: colors[0] }]}>
                      <ConvexImage fileId={fileId} label={look.sareeName || "Saree"} style={styles.absoluteFill} />
                    </View>
                    <View style={styles.lookCopy}>
                      <Text numberOfLines={1} style={styles.lookName}>{look.sareeName || "Saree"}</Text>
                      <Text style={styles.lookPrice}>{look.price && look.price > 0 ? formatPrice(look.price) : ""}</Text>
                    </View>
                  </Pressable>
                );
              })}
            </ScrollView>
          ) : (
            <View style={styles.emptyLooks}>
              <Text style={styles.emptyTitle}>No looks yet</Text>
              <Text style={styles.emptyCopy}>Try on sarees at a Wearify store to see them here</Text>
            </View>
          )}
        </View>

        {visibleStores.length ? (
          <View style={styles.storesSection}>
            <SectionHead title="My Stores" onPress={() => router.push("/c/me/stores")} />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.storeRail}>
              {visibleStores.map((store) => (
                <View key={store.id} style={styles.storeCard}>
                  <View style={styles.storeImageWrap}>
                    <Image source={store.image} style={StyleSheet.absoluteFill} contentFit="cover" accessibilityLabel={store.name} />
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`Dismiss ${store.name}`}
                      hitSlop={8}
                      style={styles.dismiss}
                      onPress={() => setDismissed((current) => new Set(current).add(store.id))}
                    >
                      <X size={13} color={MAROON} strokeWidth={2} />
                    </Pressable>
                    <View style={styles.rating}><Star size={8} fill={MAROON} color={MAROON} strokeWidth={0} /><Text style={styles.ratingText}>{store.rating}</Text></View>
                  </View>
                  <View style={styles.storeCopy}>
                    <View style={styles.storeLabels}>
                      <Text numberOfLines={1} style={styles.storeName}>{store.name}</Text>
                      <Text numberOfLines={1} style={styles.storeCity}>{store.city}</Text>
                    </View>
                    <Pressable accessibilityRole="button" accessibilityLabel={`Open ${store.name}`} style={styles.storeArrow} onPress={() => router.push("/c/me/stores")}>
                      <ArrowRight size={14} color={MAROON} strokeWidth={2} />
                    </Pressable>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        ) : null}

        <View style={styles.copyright}><Text style={styles.copyrightText}>© copyright PHYGIFY TECHNOSERVICES PRIVATE LIMITED</Text></View>
      </ScrollView>

      <Pressable
        accessibilityRole="link"
        accessibilityLabel="Chat with us on WhatsApp"
        className="absolute bottom-3 right-3 z-20 h-[60px] w-[132px]"
        style={({ pressed }) => [whatsappShadow, pressed && { transform: [{ scale: 0.97 }] }]}
        onPress={() => void Linking.openURL("https://wa.me/?text=Hi%2C%20I%27d%20like%20some%20styling%20help%20on%20Wearify.")}
      >
        <View className="absolute left-0 top-[13px] h-9 w-[96px] justify-center rounded-l-full bg-white pl-3 pr-5" style={styles.whatsappLabelShadow}>
          <Text className="font-montserrat-bold text-[9px] text-[#168C2A]">Chat With Us</Text>
        </View>
        <View className="absolute right-0 top-0 size-[60px] items-center justify-center rounded-full border-[3px] border-white bg-[#43D969]">
          <Image source={require("@/assets/home/whatsapp-icon/9_group_1967.svg")} style={{ width: 34, height: 34 }} contentFit="contain" />
        </View>
      </Pressable>
    </View>
  );
}

function Chip({ icon, label, onPress }: { icon: number; label: string; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" style={styles.chip} onPress={onPress}>
      <Image source={icon} style={styles.chipIcon} contentFit="contain" tintColor={MAROON} />
      <Text style={styles.chipLabel}>{label}</Text>
    </Pressable>
  );
}

function NewSpaceCard({ title, subtitle, background, color = "#FFFFFF", image, imageWidth, imageBottom = 0, tall = false, onPress }: {
  title: string;
  subtitle: string;
  background: string;
  color?: string;
  image: number;
  imageWidth: number;
  imageBottom?: number;
  tall?: boolean;
  onPress: () => void;
}) {
  const words = title.trim().split(" ");
  const accent = words.pop();
  const lead = words.join(" ");
  return (
    <Pressable accessibilityRole="button" style={[styles.newSpaceCard, tall ? styles.newSpaceTall : styles.newSpaceShort, { backgroundColor: background }]} onPress={onPress}>
      <Text style={[styles.newSpaceTitle, { color }]}>
        {lead ? <Text style={styles.newSpaceTitleLead}>{lead} </Text> : null}
        <Text style={styles.newSpaceTitleAccent}>{accent}</Text>
      </Text>
      <Text style={[styles.newSpaceSubtitle, { color }]}>{subtitle}</Text>
      <ArrowRight size={18} color={color} strokeWidth={2} style={styles.newSpaceArrow} />
      <Image source={image} style={[styles.newSpaceImage, { width: imageWidth, bottom: imageBottom }]} contentFit="contain" accessibilityElementsHidden />
    </Pressable>
  );
}

function SectionHead({ title, onPress }: { title: string; onPress: () => void }) {
  return (
    <View style={styles.sectionHead}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Pressable accessibilityRole="button" style={styles.seeAll} onPress={onPress}>
        <Text style={styles.seeAllText}>See All</Text>
        <View style={styles.seeAllArrow}><ArrowRight size={16} color="#FFFFFF" strokeWidth={2.2} /></View>
      </Pressable>
    </View>
  );
}

const shadow = { shadowColor: "#000000", shadowOpacity: 0.16, shadowRadius: 7.5, shadowOffset: { width: 0, height: 4 }, elevation: 4 } as const;
const whatsappShadow = Platform.OS === "web" ? { filter: "drop-shadow(0px 4px 15px rgba(0,0,0,0.16))" } as const : shadow;

const styles = StyleSheet.create({
  absoluteFill: { position: "absolute", inset: 0 },
  content: { paddingBottom: 8 },
  hero: { minHeight: 219, borderBottomLeftRadius: 16, borderBottomRightRadius: 16, overflow: "hidden", backgroundColor: "#FFFFFF" },
  appBar: { position: "relative", height: 60, paddingTop: 14, paddingHorizontal: 16, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "#D9D9D9", flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  logo: { position: "absolute", left: 0, right: 0, top: 14, height: 45, alignItems: "center", justifyContent: "center" },
  bell: { position: "relative" },
  notificationDot: { position: "absolute", top: 0, right: 0, width: 5, height: 5, borderRadius: 3, backgroundColor: MAROON },
  greeting: { paddingHorizontal: 16, paddingTop: 16 },
  greetingLabel: { fontFamily: "Montserrat_300Light", fontSize: 12, letterSpacing: -0.408, color: MAROON },
  greetingName: { fontFamily: "Montserrat_500Medium", fontSize: 20, lineHeight: 36, letterSpacing: -0.28, color: MAROON },
  chips: { flexDirection: "row", gap: 8, paddingHorizontal: 16, paddingTop: 8, paddingBottom: 20 },
  chip: { minHeight: 34, flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, borderWidth: 1, borderColor: "#878787", borderRadius: 8, backgroundColor: "#FFFFFF" },
  chipIcon: { width: 11, height: 11 },
  chipLabel: { fontFamily: "Montserrat_500Medium", fontSize: 10, letterSpacing: -0.16, color: MAROON },
  offerSection: { marginTop: 18 },
  sectionTitle: { paddingHorizontal: 16, marginBottom: 12, fontFamily: "Montserrat_600SemiBold", fontSize: 16, letterSpacing: -0.21, color: "#000000" },
  noHorizontalPadding: { paddingHorizontal: 0 },
  offerRail: { paddingHorizontal: 16, gap: 14 },
  offerImage: { width: "100%", aspectRatio: 361 / 150, borderRadius: 10 },
  dots: { flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 10, marginTop: 14 },
  dot: { height: 10, width: 10, borderRadius: 5, backgroundColor: MAROON, opacity: 0.2 },
  dotActive: { width: 40, opacity: 1 },
  newSpaceSection: { marginTop: 22, paddingHorizontal: 16 },
  newSpaceGrid: { height: 209, flexDirection: "row", gap: 9 },
  newSpaceColumn: { flex: 1, gap: 9 },
  newSpaceCard: { flex: 1, position: "relative", overflow: "hidden", borderRadius: 10, padding: 12, alignItems: "flex-start" },
  newSpaceShort: { height: 100 },
  newSpaceTall: { height: 209 },
  newSpaceTitle: { zIndex: 1, fontFamily: "CormorantGaramond_600SemiBold", fontSize: 23, lineHeight: 26, letterSpacing: -0.3 },
  newSpaceTitleLead: { fontFamily: "CormorantGaramond_600SemiBold" },
  newSpaceTitleAccent: { fontFamily: "CormorantGaramond_600SemiBold_Italic" },
  newSpaceSubtitle: { zIndex: 1, width: 96, maxWidth: "72%", marginTop: 4, fontFamily: "Montserrat_300Light", fontSize: 10, lineHeight: 12, letterSpacing: -0.21 },
  newSpaceArrow: { zIndex: 1, marginTop: "auto" },
  newSpaceImage: { position: "absolute", right: 0, height: "72%" },
  looksSection: { marginTop: 24 },
  sectionHead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingRight: 16 },
  seeAll: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 12 },
  seeAllText: { fontFamily: "Montserrat_400Regular", fontSize: 15, color: "#878787" },
  seeAllArrow: { width: 31, height: 31, borderRadius: 16, backgroundColor: MAROON, alignItems: "center", justifyContent: "center" },
  lookRail: { paddingHorizontal: 16, paddingTop: 4, paddingBottom: 20, gap: 14 },
  lookCard: { width: 144, overflow: "hidden", borderRadius: 10, backgroundColor: "#FFFFFF", ...shadow },
  lookImage: { height: 179, overflow: "hidden", borderRadius: 10 },
  lookCopy: { paddingHorizontal: 10, paddingTop: 8, paddingBottom: 12 },
  lookName: { fontFamily: "Montserrat_400Regular", fontSize: 12, lineHeight: 17, color: "#000000", textTransform: "capitalize" },
  lookPrice: { minHeight: 24, marginTop: 1, fontFamily: "Montserrat_600SemiBold", fontSize: 12, lineHeight: 24, color: MAROON },
  emptyLooks: { marginHorizontal: 16, marginTop: 4, marginBottom: 20, paddingHorizontal: 20, paddingVertical: 26, borderWidth: 1, borderColor: "#D9D9D9", borderRadius: 10, alignItems: "center" },
  emptyTitle: { fontFamily: "Montserrat_600SemiBold", fontSize: 14, color: "#222222" },
  emptyCopy: { marginTop: 4, fontFamily: "Montserrat_400Regular", fontSize: 12, color: "#878787", textAlign: "center" },
  storesSection: { marginTop: 4 },
  storeRail: { paddingHorizontal: 16, paddingTop: 4, paddingBottom: 20, gap: 8 },
  storeCard: { width: 158, overflow: "hidden", borderRadius: 10, backgroundColor: "#FFFFFF", ...shadow },
  storeImageWrap: { height: 123, backgroundColor: "#F6EFEC" },
  dismiss: { position: "absolute", top: 6, right: 6, width: 24, height: 24, borderRadius: 12, borderWidth: 1, borderColor: "#FFFFFF", backgroundColor: "rgba(255,255,255,0.8)", alignItems: "center", justifyContent: "center" },
  rating: { position: "absolute", bottom: 7, left: 4, height: 16, paddingHorizontal: 6, borderRadius: 10, borderWidth: 1, borderColor: "#FFFFFF", backgroundColor: "rgba(255,255,255,0.8)", flexDirection: "row", alignItems: "center", gap: 3 },
  ratingText: { fontFamily: "Montserrat_700Bold", fontSize: 8, lineHeight: 16, color: MAROON },
  storeCopy: { minHeight: 57, padding: 10, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 6 },
  storeLabels: { flex: 1 },
  storeName: { fontFamily: "Montserrat_600SemiBold", fontSize: 12, lineHeight: 15, color: "#000000" },
  storeCity: { marginTop: 4, fontFamily: "Montserrat_500Medium", fontSize: 10, letterSpacing: 0.4, color: "#878787", textTransform: "capitalize" },
  storeArrow: { width: 24, height: 22, borderRadius: 4, borderWidth: 1, borderColor: "rgba(135,135,135,0.2)", alignItems: "center", justifyContent: "center" },
  copyright: { minHeight: 20, marginTop: 4, paddingHorizontal: 16, paddingVertical: 4, backgroundColor: MAROON, alignItems: "center", justifyContent: "center" },
  copyrightText: { fontFamily: "Montserrat_400Regular", fontSize: 10, lineHeight: 12, color: "#FFFFFF", textAlign: "center" },
  whatsappLabelShadow: { shadowColor: "#000000", shadowOpacity: 0.1, shadowRadius: 5, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
});
