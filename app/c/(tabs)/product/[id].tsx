import { useMemo, useState } from "react";
import { Alert, Linking, Modal, Pressable, ScrollView, Share, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { useLocalSearchParams } from "expo-router";
import { useMutation, useQuery } from "convex/react";
import { ChevronDown, Heart, Maximize2, Share2, X } from "lucide-react-native";
import { api } from "@/src/convex/api";
import { ConvexImage } from "@/src/components/media";
import { AppHeader, EmptyState, Loading } from "@/src/components/ui";
import { useAuth } from "@/src/providers/auth";
import { useIsOnline } from "@/src/providers/connectivity";
import type { SareeId } from "@/src/types/domain";

const MAROON = "#68262A";
const formatPrice = (price: number) => `₹${Number(price).toLocaleString("en-IN")}`;

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const sareeId = id as SareeId;
  const online = useIsOnline();
  const { token, user } = useAuth();
  const saree = useQuery(api.sarees.getById, { id: sareeId });
  const wishlist = useQuery(api.customers.getWishlist, token && user ? { token, customerId: user.customerId } : "skip");
  const add = useMutation(api.customers.addToWishlist);
  const remove = useMutation(api.customers.removeFromWishlist);
  const saved = useMemo(() => wishlist?.find((item) => item.sareeId === sareeId), [sareeId, wishlist]);
  const [expanded, setExpanded] = useState(false);
  const [readMore, setReadMore] = useState(false);
  const [lightbox, setLightbox] = useState(false);
  const [toast, setToast] = useState("");
  const showToast = (message: string) => { setToast(message); setTimeout(() => setToast(""), 2000); };

  if (saree === undefined) return <><AppHeader back /><Loading /></>;
  if (!saree) return <View style={styles.page}><AppHeader back /><EmptyState title="Saree not found" /></View>;

  const imageFileId = saree.imageIds?.[0];
  const available = saree.status === "active" || (saree.stock ?? 0) > 0;
  const description = saree.description || "A premium handcrafted saree — elegant drape, fine weave and a finish made for weddings and festive occasions.";
  const specs = [
    ["Type", saree.type], ["Fabric", saree.fabric], ["Color", saree.colorName || saree.colors?.join(" / ")],
    ["Pattern", saree.weave], ["Occasion", saree.occasion], ["Region", saree.region], ["Style", saree.drapingStyles?.join(", ")],
  ].filter((row): row is [string, string] => Boolean(row[1]));
  const features = [["Saree Length", "5.5 Meter"], ["Blouse Length", "0.8 Meter"], ["Wash Care", saree.careInstructions || "Dry Clean Only"]];
  const message = `Check out this ${saree.name} at Wearify! ${saree.price ? formatPrice(saree.price) : ""}`;

  async function toggleWishlist() {
    if (!online) return Alert.alert("You’re offline", "Reconnect before changing your wishlist.");
    if (!token || !user || !saree) return;
    try {
      if (saved) { await remove({ token, wishlistId: saved._id }); showToast("Removed from wishlist"); }
      else { await add({ token, customerId: user.customerId, sareeId: saree._id, storeId: saree.storeId, sareeName: saree.name, price: saree.price }); showToast("Added to wishlist"); }
    } catch { showToast("Couldn’t update wishlist"); }
  }

  const shareWhatsApp = () => Linking.openURL(`https://wa.me/?text=${encodeURIComponent(message)}`);
  const share = () => Share.share({ message: `${message} ${process.env.EXPO_PUBLIC_WEB_URL}/c/product/${saree._id}` });

  return (
    <View style={styles.page}>
      <AppHeader back />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Text style={styles.title}>PRODUCT DETAIL</Text>
        <View style={styles.sectionPadding}>
          <View style={styles.hero}>
            <ConvexImage fileId={imageFileId} label={saree.name} style={styles.heroImage} />
            <View style={styles.heroActions}>
              <Pressable accessibilityRole="button" accessibilityLabel="Wishlist" style={styles.frosted} onPress={() => void toggleWishlist()}><Heart size={18} color={MAROON} fill={saved ? MAROON : "transparent"} strokeWidth={2} /></Pressable>
              <Pressable accessibilityRole="button" accessibilityLabel="WhatsApp" style={styles.frosted} onPress={() => void shareWhatsApp()}><Image source={require("@/assets/customer/looks/whatsapp.svg")} style={styles.whatsapp} contentFit="contain" /></Pressable>
              <Pressable accessibilityRole="button" accessibilityLabel="Share" style={styles.frosted} onPress={() => void share()}><Share2 size={16} color={MAROON} strokeWidth={2} /></Pressable>
            </View>
            {imageFileId ? <Pressable accessibilityRole="button" accessibilityLabel="View full image" style={[styles.frosted, styles.expand]} onPress={() => setLightbox(true)}><Maximize2 size={17} color="#000000" strokeWidth={2} /></Pressable> : null}
          </View>
        </View>

        <View style={[styles.sectionPadding, styles.infoSection]}>
          <View style={styles.infoCard}>
            <View style={styles.nameRow}><Text style={styles.name}>{saree.name}</Text>{saree.price != null ? <Text style={styles.price}>{formatPrice(saree.price)}</Text> : null}</View>
            <View style={styles.categoryRow}><Text style={styles.category}>{saree.fabric || "Silk"}</Text>{saree.occasion ? <><View style={styles.bullet} /><Text style={styles.category}>{saree.occasion}</Text></> : null}</View>
            <View style={[styles.stock, { borderColor: available ? "#1E7B34" : "#B23A3A" }]}><Text style={[styles.stockText, { color: available ? "#1E7B34" : "#B23A3A" }]}>{available ? "IN STOCK" : "OUT OF STOCK"}</Text></View>
            <Text style={styles.descriptionTitle}>Description</Text>
            <Text style={styles.description}>{readMore || description.length <= 110 ? description : `${description.slice(0, 110)}…`}</Text>
            {description.length > 110 ? <Pressable onPress={() => setReadMore((current) => !current)}><Text style={styles.readMore}>{readMore ? "Read less" : "Read more"}</Text></Pressable> : null}
            {expanded ? <View style={styles.specs}>
              {specs.map(([label, value]) => <View key={label} style={styles.specRow}><Text style={styles.specLabel}>{label}</Text><Text style={styles.specValue}>{value}</Text></View>)}
              <View style={styles.table}><View style={styles.tableHeader}><Text style={styles.tableHeading}>Feature</Text><Text style={styles.tableHeading}>Value</Text></View>{features.map(([feature, value]) => <View key={feature} style={styles.tableRow}><Text style={styles.tableLabel}>{feature}</Text><Text style={styles.tableValue}>{value}</Text></View>)}</View>
            </View> : null}
            <Pressable accessibilityRole="button" accessibilityLabel={expanded ? "Show less" : "Show more"} style={styles.expandBar} onPress={() => setExpanded((current) => !current)}><ChevronDown size={18} color="#878787" strokeWidth={2} style={{ transform: [{ rotate: expanded ? "180deg" : "0deg" }] }} /></Pressable>
          </View>
        </View>

        <View style={[styles.sectionPadding, styles.orderSection]}><Pressable style={styles.order} onPress={() => void shareWhatsApp()}><Text style={styles.orderText}>Place Order</Text></Pressable></View>
        <View style={[styles.sectionPadding, styles.adSection]}><View style={styles.ad}><Image source={require("@/assets/customer/product-detail/add.svg")} style={StyleSheet.absoluteFill} contentFit="cover" accessibilityLabel="Advertisement" /><View style={styles.adLabel}><Text style={styles.adText}>Ad ⓘ</Text></View></View></View>
        <View style={styles.copyright}><Text style={styles.copyrightText}>© copyright PHYGIFY TECHNOSERVICES PRIVATE LIMITED</Text></View>
      </ScrollView>

      {toast ? <View style={styles.toast}><Text style={styles.toastText}>{toast}</Text></View> : null}
      <Modal visible={lightbox} animationType="fade" onRequestClose={() => setLightbox(false)}>
        <View style={styles.lightbox}>{imageFileId ? <ConvexImage fileId={imageFileId} label={saree.name} contain style={styles.lightboxImage} /> : null}<Pressable accessibilityRole="button" accessibilityLabel="Close image" style={styles.close} onPress={() => setLightbox(false)}><X size={22} color="#FFFFFF" /></Pressable></View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#FFFFFF" },
  content: { paddingBottom: 0 },
  title: { paddingHorizontal: 16, paddingTop: 18, paddingBottom: 12, fontFamily: "Montserrat_600SemiBold", fontSize: 16, lineHeight: 26, color: "#000000" },
  sectionPadding: { paddingHorizontal: 16 },
  hero: { position: "relative", height: 387, overflow: "hidden", borderRadius: 16, backgroundColor: "#71221D" },
  heroImage: { width: "100%", height: "100%" },
  heroActions: { position: "absolute", top: 16, right: 16, gap: 10 },
  frosted: { width: 35, height: 35, borderRadius: 8, borderWidth: 1, borderColor: "#FFFFFF", backgroundColor: "rgba(255,255,255,0.72)", alignItems: "center", justifyContent: "center" },
  whatsapp: { width: 18, height: 18 },
  expand: { position: "absolute", right: 16, bottom: 16 },
  infoSection: { paddingTop: 16 },
  infoCard: { overflow: "hidden", padding: 16, borderRadius: 16, borderWidth: 1, borderColor: "#E7E7E7", backgroundColor: "#FFFFFF" },
  nameRow: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 10 },
  name: { flex: 1, fontFamily: "Montserrat_500Medium", fontSize: 22, lineHeight: 29, letterSpacing: 0.88, color: "#000000", textTransform: "capitalize" },
  price: { fontFamily: "Montserrat_700Bold", fontSize: 22, lineHeight: 29, letterSpacing: 0.88, color: MAROON },
  categoryRow: { marginTop: 2, flexDirection: "row", alignItems: "center", gap: 8 },
  category: { fontFamily: "Montserrat_500Medium", fontSize: 16, letterSpacing: 0.64, color: "#878787", textTransform: "capitalize" },
  bullet: { width: 2, height: 2, borderRadius: 1, backgroundColor: "#878787" },
  stock: { alignSelf: "flex-start", height: 26, marginTop: 12, paddingHorizontal: 12, borderRadius: 13, borderWidth: 1, justifyContent: "center" },
  stockText: { fontFamily: "Montserrat_600SemiBold", fontSize: 10, letterSpacing: 0.4 },
  descriptionTitle: { marginTop: 16, fontFamily: "Montserrat_600SemiBold", fontSize: 14, color: "#000000" },
  description: { marginTop: 6, fontFamily: "Montserrat_400Regular", fontSize: 12, lineHeight: 20, color: "#878787", textTransform: "capitalize" },
  readMore: { marginTop: 4, fontFamily: "Montserrat_600SemiBold", fontSize: 12, color: MAROON },
  specs: { marginTop: 16 },
  specRow: { minHeight: 32, paddingVertical: 7, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "#F1F1F1", flexDirection: "row", justifyContent: "space-between", gap: 12 },
  specLabel: { fontFamily: "Montserrat_500Medium", fontSize: 12, color: "#878787", textTransform: "capitalize" },
  specValue: { flex: 1, fontFamily: "Montserrat_500Medium", fontSize: 12, color: "#000000", textAlign: "right", textTransform: "capitalize" },
  table: { marginTop: 16, overflow: "hidden", borderWidth: 1, borderColor: "#E7E7E7", borderRadius: 8 },
  tableHeader: { paddingVertical: 8, paddingHorizontal: 12, backgroundColor: "#FAFAFA", flexDirection: "row" },
  tableHeading: { flex: 1, fontFamily: "Montserrat_600SemiBold", fontSize: 12, color: "#000000" },
  tableRow: { paddingVertical: 8, paddingHorizontal: 12, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: "#F1F1F1", flexDirection: "row" },
  tableLabel: { flex: 1, fontFamily: "Montserrat_400Regular", fontSize: 12, color: "#878787" },
  tableValue: { flex: 1, fontFamily: "Montserrat_400Regular", fontSize: 12, color: "#000000" },
  expandBar: { height: 30, marginHorizontal: -16, marginBottom: -16, marginTop: 16, borderBottomLeftRadius: 16, borderBottomRightRadius: 16, backgroundColor: "#F5F5F5", alignItems: "center", justifyContent: "center" },
  orderSection: { paddingTop: 16 },
  order: { height: 52, borderRadius: 8, backgroundColor: MAROON, alignItems: "center", justifyContent: "center", shadowColor: "#000000", shadowOpacity: 0.25, shadowRadius: 7.5, shadowOffset: { width: 0, height: 4 }, elevation: 4 },
  orderText: { fontFamily: "Montserrat_600SemiBold", fontSize: 14, color: "#FFFFFF" },
  adSection: { paddingTop: 16 },
  ad: { position: "relative", height: 145, overflow: "hidden", borderRadius: 8 },
  adLabel: { position: "absolute", right: 0, bottom: 0, height: 21, paddingHorizontal: 8, backgroundColor: "rgba(255,255,255,0.9)", justifyContent: "center" },
  adText: { fontFamily: "Montserrat_500Medium", fontSize: 8, letterSpacing: -0.24, color: "#000000" },
  copyright: { minHeight: 20, marginTop: 20, paddingHorizontal: 16, paddingVertical: 4, backgroundColor: MAROON, alignItems: "center", justifyContent: "center" },
  copyrightText: { fontFamily: "Montserrat_400Regular", fontSize: 10, lineHeight: 12, color: "#FFFFFF", textAlign: "center" },
  toast: { position: "absolute", bottom: 20, alignSelf: "center", paddingHorizontal: 18, paddingVertical: 10, borderRadius: 20, backgroundColor: MAROON, elevation: 6 },
  toastText: { fontFamily: "Montserrat_600SemiBold", fontSize: 13, color: "#FFFFFF" },
  lightbox: { flex: 1, padding: 16, backgroundColor: "rgba(0,0,0,0.94)", alignItems: "center", justifyContent: "center" },
  lightboxImage: { width: "100%", height: "100%" },
  close: { position: "absolute", top: 52, right: 12, width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,.14)", alignItems: "center", justifyContent: "center" },
});
