import { useMemo, useState } from "react";
import { Alert, Linking, Modal, Pressable, ScrollView, Share, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMutation, useQuery } from "convex/react";
import { ChevronDown, Heart, Maximize2, Share2, Shirt, Sparkles, X } from "lucide-react-native";
import { api } from "@/src/convex/api";
import { ConvexImage, LookMedia } from "@/src/components/media";
import { AppHeader, EmptyState, Loading } from "@/src/components/ui";
import { useAuth } from "@/src/providers/auth";
import { useIsOnline } from "@/src/providers/connectivity";
import type { Look, LookId, WishlistItem } from "@/src/types/domain";

const MAROON = "#68262A";
const LOOK_BG = "#FCF9F1";
const formatPrice = (price: number) => `₹${Number(price).toLocaleString("en-IN")}`;
const longDate = (timestamp?: number) => timestamp ? new Date(timestamp).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "";

export default function LookDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const lookId = id as LookId;
  const online = useIsOnline();
  const { token, user } = useAuth();
  const allLooks = useQuery(api.sessionOps.listByCustomer, token && user ? { token, customerId: user.customerId } : "skip");
  const look = allLooks?.find((item) => item._id === lookId);
  const saree = useQuery(api.sarees.getById, look ? { id: look.sareeId } : "skip");
  const wishlist = useQuery(api.customers.getWishlist, token && user ? { token, customerId: user.customerId } : "skip");
  const add = useMutation(api.customers.addToWishlist);
  const remove = useMutation(api.customers.removeFromWishlist);
  const wishedEntry = useMemo(() => wishlist?.find((item) => item.sareeId === look?.sareeId), [look?.sareeId, wishlist]);
  const [expanded, setExpanded] = useState(false);
  const [viewOnYou, setViewOnYou] = useState(false);
  const [lightbox, setLightbox] = useState(false);
  const [toast, setToast] = useState("");
  const showToast = (message: string) => { setToast(message); setTimeout(() => setToast(""), 2000); };

  if (allLooks === undefined) return <><AppHeader back /><Loading /></>;
  if (!look) return <View style={styles.page}><AppHeader back /><EmptyState title="Product not found" /></View>;

  const sareeImage = saree?.imageIds?.[0] ?? look.sareeImageId;
  const hasLook = Boolean(look.imageFileId || look.imageNoBgFileId);
  const showLook = viewOnYou && hasLook;
  const available = !saree || saree.status === "active" || (saree.stock ?? 1) > 0;
  const description = saree?.description || "A premium handcrafted saree — elegant drape, fine weave and a finish made for weddings and festive occasions.";
  const specs = [
    ["Type", saree?.type || look.sareeName], ["Fabric", saree?.fabric || look.fabric], ["Color", saree?.colorName || saree?.colors?.join(" / ")],
    ["Pattern", saree?.weave], ["Border", saree?.border], ["Occasion", saree?.occasion || look.sareeOccasion], ["Style", saree?.drapingStyles?.join(", ") || saree?.region],
  ].filter((row): row is [string, string] => Boolean(row[1]));
  const features = [["Saree Length", "5.5 Meter"], ["Blouse Length", "0.8 Meter"], ["Wash Care", saree?.careInstructions || "Dry Clean Only"]];
  const message = `Check out this ${look.sareeName || "saree"} at Wearify! ${look.price ? formatPrice(look.price) : ""}`;

  async function toggleWishlist() {
    if (!online) return Alert.alert("You’re offline", "Reconnect before changing your wishlist.");
    if (!token || !user || !look) return;
    try {
      if (wishedEntry) { await remove({ token, wishlistId: wishedEntry._id as WishlistItem["_id"] }); showToast("Removed from wishlist"); }
      else if (look.storeId) { await add({ token, customerId: user.customerId, sareeId: look.sareeId, storeId: look.storeId, sareeName: look.sareeName || "Saree", price: look.price }); showToast("Added to wishlist"); }
    } catch { showToast("Couldn’t update wishlist"); }
  }

  const shareWhatsApp = () => Linking.openURL(`https://wa.me/?text=${encodeURIComponent(message)}`);
  const share = () => Share.share({ message: `${message} ${process.env.EXPO_PUBLIC_WEB_URL}/c/looks/${look._id}` });

  return (
    <View style={styles.page}>
      <AppHeader back />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Text style={styles.title}>PRODUCT DETAIL</Text>
        <View style={styles.sectionPadding}>
          <View style={[styles.hero, { backgroundColor: showLook ? LOOK_BG : look.sareeGrad?.[0] || "#71221D" }]}>
            {showLook ? <LookMedia cutout={look.imageNoBgFileId} render={look.imageFileId} fallback={sareeImage} label={`${look.sareeName || "Saree"} — on you`} surface={LOOK_BG} style={styles.heroImage} /> : <ConvexImage fileId={sareeImage} label={look.sareeName || "Saree"} style={styles.heroImage} />}
            <View style={styles.heroActions}>
              <Pressable accessibilityRole="button" accessibilityLabel="Wishlist" style={styles.frosted} onPress={() => void toggleWishlist()}><Heart size={18} color={MAROON} fill={wishedEntry ? MAROON : "transparent"} strokeWidth={2} /></Pressable>
              <Pressable accessibilityRole="button" accessibilityLabel="WhatsApp" style={styles.frosted} onPress={() => void shareWhatsApp()}><Image source={require("@/assets/customer/looks/whatsapp.svg")} style={styles.whatsapp} contentFit="contain" /></Pressable>
              <Pressable accessibilityRole="button" accessibilityLabel="Share" style={styles.frosted} onPress={() => void share()}><Share2 size={16} color={MAROON} strokeWidth={2} /></Pressable>
            </View>
            {hasLook ? <Pressable style={[styles.viewToggle, showLook && styles.viewToggleLight]} onPress={() => setViewOnYou((current) => !current)}>{showLook ? <Shirt size={16} color={MAROON} /> : <Sparkles size={16} color="#FFFFFF" />}<Text style={[styles.viewToggleText, showLook && styles.viewToggleTextLight]}>{showLook ? "View Saree" : "View on You"}</Text></Pressable> : null}
            {(showLook ? hasLook : sareeImage) ? <Pressable accessibilityRole="button" accessibilityLabel="View full image" style={[styles.frosted, styles.expand]} onPress={() => setLightbox(true)}><Maximize2 size={17} color="#000000" strokeWidth={2} /></Pressable> : null}
          </View>
        </View>

        <View style={[styles.sectionPadding, styles.infoSection]}>
          <View style={styles.infoCard}>
            <View style={styles.nameRow}><Text style={styles.name}>{look.sareeName || "Saree"}</Text>{look.price != null ? <Text style={styles.price}>{formatPrice(look.price)}</Text> : null}</View>
            <View style={styles.categoryRow}><Text style={styles.category}>{saree?.fabric || look.fabric || "Silk"}</Text><View style={styles.bullet} /><Text style={styles.category}>{longDate(look.createdAt)}</Text></View>
            <View style={styles.stock}><Text style={[styles.stockText, { color: available ? "#46B31E" : "#B3261E" }]}>{available ? "IN STOCK" : "SOLD OUT"}</Text></View>
            <Text style={styles.descriptionTitle}>Description</Text>
            <Text style={styles.description}>{expanded ? description : `${description.slice(0, 96)}${description.length > 96 ? "…" : ""}`}</Text>
            {description.length > 96 ? <Pressable onPress={() => setExpanded((current) => !current)}><Text style={styles.readMore}>{expanded ? "Read less" : "Read more"}</Text></Pressable> : null}
            {expanded ? <View style={styles.specs}>{specs.map(([label, value]) => <View key={label} style={styles.specBlock}><Text style={styles.specTitle}>{label}</Text><Text style={styles.specText}>{value}</Text></View>)}<View style={styles.featureHeader}><Text style={styles.featureHeading}>Feature</Text><Text style={styles.featureHeading}>Value</Text></View>{features.map(([feature, value]) => <View key={feature} style={styles.featureRow}><Text style={styles.featureText}>{feature}</Text><Text style={styles.featureText}>{value}</Text></View>)}</View> : null}
            <Pressable accessibilityRole="button" accessibilityLabel={expanded ? "Collapse" : "Expand"} style={styles.expandBar} onPress={() => setExpanded((current) => !current)}><ChevronDown size={18} color="#000000" strokeWidth={2} style={{ transform: [{ rotate: expanded ? "180deg" : "0deg" }] }} /></Pressable>
          </View>
        </View>

        <View style={[styles.sectionPadding, styles.orderSection]}><Pressable style={styles.order} onPress={() => void shareWhatsApp()}><Text style={styles.orderText}>Place Order</Text></Pressable></View>
        <View style={[styles.sectionPadding, styles.adSection]}><View style={styles.ad}><Image source={require("@/assets/customer/product-detail/add.svg")} style={StyleSheet.absoluteFill} contentFit="cover" accessibilityLabel="Advertisement" /><View style={styles.adLabel}><Text style={styles.adText}>Ad ⓘ</Text></View></View></View>
        <Text style={styles.myLooksTitle}>My Looks</Text>
        <View style={styles.lookGrid}>{allLooks.slice(0, 4).map((item) => <MiniLook key={item._id} item={item} onPress={() => router.push(`/c/looks/${item._id}`)} />)}</View>
        <View style={styles.copyright}><Text style={styles.copyrightText}>© copyright PHYGIFY TECHNOSERVICES PRIVATE LIMITED</Text></View>
      </ScrollView>

      {toast ? <View style={styles.toast}><Text style={styles.toastText}>{toast}</Text></View> : null}
      <Modal visible={lightbox} animationType="fade" onRequestClose={() => setLightbox(false)}><View style={styles.lightbox}>{showLook ? <LookMedia cutout={look.imageNoBgFileId} render={look.imageFileId} fallback={sareeImage} label={look.sareeName || "Saree"} surface="#000000" style={styles.lightboxImage} /> : sareeImage ? <ConvexImage fileId={sareeImage} label={look.sareeName || "Saree"} contain style={styles.lightboxImage} /> : null}<Pressable accessibilityRole="button" accessibilityLabel="Close image" style={styles.close} onPress={() => setLightbox(false)}><X size={22} color="#FFFFFF" /></Pressable></View></Modal>
    </View>
  );
}

function MiniLook({ item, onPress }: { item: Look; onPress: () => void }) {
  return <Pressable style={styles.miniCard} onPress={onPress}><View style={styles.miniImageWrap}><LookMedia cutout={item.imageNoBgFileId} render={item.imageFileId} fallback={item.sareeImageId} label={item.sareeName || "Saree"} surface={LOOK_BG} scale={1.08} style={styles.miniImage} />{item.sareeOccasion ? <View style={styles.badge}><Text style={styles.badgeText}>{item.sareeOccasion}</Text></View> : null}</View><View style={styles.miniInfo}><Text numberOfLines={1} style={styles.miniName}>{item.sareeName || "Saree"}</Text><Text style={styles.miniDate}>{longDate(item.createdAt)}</Text>{item.price != null ? <Text style={styles.miniPrice}>{formatPrice(item.price)}</Text> : null}</View></Pressable>;
}

const shadow = { shadowColor: "#000000", shadowOpacity: 0.16, shadowRadius: 7.5, shadowOffset: { width: 0, height: 4 }, elevation: 4 } as const;
const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#FFFFFF" }, content: { paddingBottom: 0 }, sectionPadding: { paddingHorizontal: 16 },
  title: { paddingHorizontal: 16, paddingTop: 18, paddingBottom: 12, fontFamily: "Montserrat_600SemiBold", fontSize: 16, lineHeight: 26, color: "#000000" },
  hero: { position: "relative", height: 387, overflow: "hidden", borderRadius: 16 }, heroImage: { width: "100%", height: "100%" },
  heroActions: { position: "absolute", top: 16, right: 16, gap: 10 }, frosted: { width: 35, height: 35, borderRadius: 8, borderWidth: 1, borderColor: "#FFFFFF", backgroundColor: "rgba(255,255,255,0.72)", alignItems: "center", justifyContent: "center" }, whatsapp: { width: 18, height: 18 }, expand: { position: "absolute", right: 16, bottom: 16 },
  viewToggle: { position: "absolute", left: 16, bottom: 16, height: 38, paddingHorizontal: 15, borderRadius: 19, backgroundColor: MAROON, flexDirection: "row", alignItems: "center", gap: 7, ...shadow }, viewToggleLight: { backgroundColor: "rgba(255,255,255,0.85)" }, viewToggleText: { fontFamily: "Montserrat_600SemiBold", fontSize: 12.5, letterSpacing: 0.13, color: "#FFFFFF" }, viewToggleTextLight: { color: MAROON },
  infoSection: { paddingTop: 16 }, infoCard: { overflow: "hidden", padding: 16, borderRadius: 16, borderWidth: 1, borderColor: "#E7E7E7", backgroundColor: "#FFFFFF" }, nameRow: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }, name: { flex: 1, fontFamily: "Montserrat_500Medium", fontSize: 22, lineHeight: 29, letterSpacing: 0.88, color: "#000000", textTransform: "capitalize" }, price: { fontFamily: "Montserrat_700Bold", fontSize: 22, lineHeight: 29, letterSpacing: 0.88, color: MAROON },
  categoryRow: { marginTop: 2, flexDirection: "row", alignItems: "center", gap: 8 }, category: { fontFamily: "Montserrat_500Medium", fontSize: 16, letterSpacing: 0.64, color: "#878787", textTransform: "capitalize" }, bullet: { width: 2, height: 2, borderRadius: 1, backgroundColor: "#878787" }, stock: { alignSelf: "flex-start", height: 35, marginTop: 14, paddingHorizontal: 16, borderRadius: 18, borderWidth: 1, borderColor: "#E7E7E7", justifyContent: "center" }, stockText: { fontFamily: "Montserrat_500Medium", fontSize: 12, letterSpacing: 0.48 },
  descriptionTitle: { marginTop: 20, fontFamily: "Montserrat_600SemiBold", fontSize: 14, letterSpacing: 0.56, color: "#222222" }, description: { marginTop: 8, fontFamily: "Montserrat_500Medium", fontSize: 12, lineHeight: 15, color: "#878787", textTransform: "capitalize" }, readMore: { marginTop: 4, fontFamily: "Montserrat_600SemiBold", fontSize: 12, color: MAROON }, specs: { marginTop: 20, gap: 16 }, specTitle: { fontFamily: "Montserrat_500Medium", fontSize: 14, color: "#000000", textTransform: "capitalize" }, specText: { marginTop: 1, fontFamily: "Montserrat_500Medium", fontSize: 12, color: "#878787", textTransform: "capitalize" }, specBlock: {}, featureHeader: { marginTop: 6, flexDirection: "row" }, featureHeading: { flex: 1, fontFamily: "Montserrat_500Medium", fontSize: 14, color: "#000000" }, featureRow: { marginTop: 8, flexDirection: "row" }, featureText: { flex: 1, fontFamily: "Montserrat_500Medium", fontSize: 12, color: "#878787", textTransform: "capitalize" },
  expandBar: { height: 30, marginHorizontal: -16, marginBottom: -16, marginTop: 16, borderBottomLeftRadius: 16, borderBottomRightRadius: 16, backgroundColor: "#D9D9D9", alignItems: "center", justifyContent: "center" },
  orderSection: { paddingTop: 16 }, order: { height: 52, borderRadius: 8, backgroundColor: MAROON, alignItems: "center", justifyContent: "center", ...shadow }, orderText: { fontFamily: "Montserrat_600SemiBold", fontSize: 16, color: "#FFFFFF" }, adSection: { paddingTop: 16 }, ad: { position: "relative", height: 145, overflow: "hidden", borderRadius: 8 }, adLabel: { position: "absolute", right: 0, bottom: 0, height: 21, paddingHorizontal: 8, backgroundColor: "rgba(255,255,255,0.9)", justifyContent: "center" }, adText: { fontFamily: "Montserrat_500Medium", fontSize: 8, letterSpacing: -0.24, color: "#000000" },
  myLooksTitle: { paddingHorizontal: 16, paddingTop: 22, paddingBottom: 12, fontFamily: "Montserrat_600SemiBold", fontSize: 16, letterSpacing: -0.21, color: "#000000" }, lookGrid: { paddingHorizontal: 16, flexDirection: "row", flexWrap: "wrap", gap: 9 }, miniCard: { width: "48%", overflow: "hidden", borderRadius: 10, backgroundColor: "#FFFFFF", ...shadow }, miniImageWrap: { position: "relative", height: 218, overflow: "hidden", borderRadius: 10, backgroundColor: LOOK_BG }, miniImage: { width: "100%", height: "100%" }, badge: { position: "absolute", bottom: 6, left: 6, height: 19, paddingHorizontal: 10, borderRadius: 10, borderWidth: 1, borderColor: MAROON, backgroundColor: "rgba(255,255,255,0.8)", justifyContent: "center" }, badgeText: { fontFamily: "Montserrat_500Medium", fontSize: 8, color: MAROON, textTransform: "capitalize" }, miniInfo: { paddingHorizontal: 10, paddingTop: 8, paddingBottom: 12 }, miniName: { fontFamily: "Montserrat_400Regular", fontSize: 12, lineHeight: 17, color: "#000000", textTransform: "capitalize" }, miniDate: { marginTop: 3, fontFamily: "Montserrat_400Regular", fontSize: 10, color: "#878787" }, miniPrice: { marginTop: 1, fontFamily: "Montserrat_600SemiBold", fontSize: 12, lineHeight: 24, color: "#000000" },
  copyright: { minHeight: 20, marginTop: 20, paddingHorizontal: 16, paddingVertical: 4, backgroundColor: MAROON, alignItems: "center", justifyContent: "center" }, copyrightText: { fontFamily: "Montserrat_400Regular", fontSize: 10, lineHeight: 12, color: "#FFFFFF", textAlign: "center" }, toast: { position: "absolute", bottom: 20, alignSelf: "center", paddingHorizontal: 18, paddingVertical: 10, borderRadius: 20, backgroundColor: MAROON, elevation: 6 }, toastText: { fontFamily: "Montserrat_600SemiBold", fontSize: 13, color: "#FFFFFF" }, lightbox: { flex: 1, padding: 16, backgroundColor: "rgba(0,0,0,0.94)", alignItems: "center", justifyContent: "center" }, lightboxImage: { width: "100%", height: "100%" }, close: { position: "absolute", top: 52, right: 12, width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,.14)", alignItems: "center", justifyContent: "center" },
});
