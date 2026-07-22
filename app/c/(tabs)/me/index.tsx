import { useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { BlurView } from "expo-blur";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useQuery } from "convex/react";
import { ArrowRight, ChevronRight, Star } from "lucide-react-native";
import { api } from "@/src/convex/api";
import { AppHeader } from "@/src/components/ui";
import { useAuth } from "@/src/providers/auth";

const MAROON = "#68262A";
const STORE_IMAGES = [
  require("@/assets/kiosk/img1.jpg"), require("@/assets/kiosk/img2.webp"),
  require("@/assets/kiosk/img3.webp"), require("@/assets/kiosk/img4.jpg"),
] as const;

const menuItems = [
  { icon: require("@/assets/customer/profile/edit-profile.svg"), label: "Edit Profile", sub: "Name , Photo, DOB, Height, City", href: "/c/me/profile" },
  { icon: require("@/assets/customer/profile/preferences.svg"), label: "Preferences", sub: "Occasions, Fabrics, colors, upcomings events", href: "/c/me/preferences" },
  { icon: require("@/assets/customer/profile/visit-histroy.svg"), label: "Visit History", sub: "Your visits across Wearify stores", href: "/c/me/history" },
  { icon: require("@/assets/customer/profile/loyalty-credits.svg"), label: "Loyalty & Credits", sub: "Points, store credit and membership", href: "/c/me/loyalty" },
  { icon: require("@/assets/customer/profile/my-tailor-orders.svg"), label: "My Tailor Orders", sub: "Track orders, measurements & rate tailors", href: "/c/me/tailor-orders" },
  { icon: require("@/assets/customer/profile/refer-a-friend.svg"), label: "Refer a Friend", sub: "Earn 500 Wearify credits per referral", href: "/c/me/refer" },
  { icon: require("@/assets/customer/profile/privacy.svg"), label: "Privacy & DPDP", sub: "Manage consent, download or delete data", href: "/c/me/privacy" },
  { icon: require("@/assets/customer/profile/language.svg"), label: "Language", sub: "Tap to change", href: "/c/me/language" },
  { icon: require("@/assets/customer/profile/rate.svg"), label: "Rate Your Visit", sub: "Share Feedback on your last store visit", href: "/c/me/feedback" },
] as const;

export default function ProfileHubScreen() {
  const router = useRouter();
  const auth = useAuth();
  const { token, user, customer } = auth;
  const stores = useQuery(api.customers.listStoreLinksEnriched, token && user ? { token, customerId: user.customerId } : "skip");
  const wishlist = useQuery(api.customers.getWishlist, token && user ? { token, customerId: user.customerId } : "skip");
  const looks = useQuery(api.sessionOps.listByCustomer, token && user ? { token, customerId: user.customerId } : "skip");
  const visits = useQuery(api.customers.listVisitHistory, token && user ? { token, customerId: user.customerId } : "skip");
  const photoUrl = useQuery(api.files.getUrl, customer?.photoFileId ? { fileId: customer.photoFileId } : "skip");
  const [showSignOut, setShowSignOut] = useState(false);

  if (!user) return null;

  const displayName = user.name || customer?.name || "Customer";
  const initials = displayName.split(" ").map((part) => part[0]).join("").toUpperCase().slice(0, 2);
  const maskedPhone = user.phone ? `${user.phone.slice(0, 8)}XXXX${user.phone.slice(-2)}` : "";
  const storeCredit = customer?.storeCredit || 0;
  const stats = [
    { label: "Looks", value: String(looks?.length || 0) },
    { label: "Stores", value: String(stores?.length || 0) },
    { label: "Wishlist", value: String(wishlist?.length || 0) },
    { label: "Credit", value: `₹${storeCredit}` },
  ];

  const logout = async () => {
    setShowSignOut(false);
    await auth.signOut();
    router.replace("/c/welcome");
  };

  return (
    <View style={styles.page}>
      <AppHeader back />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Text style={styles.title}>PROFILE</Text>
        <View style={styles.heroWrap}>
          <View style={styles.hero}>
            {photoUrl ? <Image source={{ uri: photoUrl }} style={StyleSheet.absoluteFill} contentFit="cover" accessibilityElementsHidden /> : <View style={[StyleSheet.absoluteFill, styles.heroFallback]} />}
            <BlurView intensity={42} tint="light" blurMethod="dimezisBlurViewSdk31Plus" style={[StyleSheet.absoluteFill, styles.blur]} />
            <View style={styles.heroContent}>
              <View style={styles.avatar}>{photoUrl ? <Image source={{ uri: photoUrl }} style={styles.avatarImage} contentFit="cover" accessibilityLabel={displayName} /> : <Text style={styles.initials}>{initials}</Text>}</View>
              <Text style={styles.name}>{displayName}</Text>
              {maskedPhone ? <Text style={styles.phone}>{maskedPhone}</Text> : null}
              <Pressable style={styles.edit} onPress={() => router.push("/c/me/profile")}><Text style={styles.editText}>Edit Profile</Text></Pressable>
            </View>
          </View>
        </View>

        <View style={styles.stats}>{stats.map((stat) => <View key={stat.label} style={styles.stat}><Text numberOfLines={1} style={styles.statValue}>{stat.value}</Text><Text style={styles.statLabel}>{stat.label}</Text></View>)}</View>

        {stores?.length ? (
          <View style={styles.storesSection}>
            <View style={styles.sectionHead}><Text style={styles.sectionTitle}>My Stores</Text><Pressable style={styles.seeAll} onPress={() => router.push("/c/me/stores")}><Text style={styles.seeAllText}>See All</Text><View style={styles.seeAllArrow}><ArrowRight size={15} color="#FFFFFF" strokeWidth={2.2} /></View></Pressable></View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.storeRail}>
              {stores.map((store, index) => (
                <View key={store._id} style={styles.storeCard}>
                  <View style={styles.storeImageWrap}><Image source={STORE_IMAGES[index % STORE_IMAGES.length] ?? STORE_IMAGES[0]} style={StyleSheet.absoluteFill} contentFit="cover" accessibilityLabel={store.storeName || store.storeId} /><View style={styles.rating}><Star size={7} fill={MAROON} color={MAROON} strokeWidth={0} /><Text style={styles.ratingText}>5.0</Text></View></View>
                  <View style={styles.storeInfo}><View style={styles.storeLabels}><Text numberOfLines={1} style={styles.storeName}>{store.storeName || store.storeId}</Text><Text numberOfLines={1} style={styles.storeCity}>{store.storeCity || "—"}</Text></View><Pressable accessibilityRole="button" accessibilityLabel={`Open ${store.storeName || "store"}`} style={styles.storeArrow} onPress={() => router.push("/c/me/stores")}><ArrowRight size={13} color={MAROON} strokeWidth={2.2} /></Pressable></View>
                </View>
              ))}
            </ScrollView>
          </View>
        ) : null}

        <View style={styles.rows}>
          {menuItems.map((item) => {
            let sub: string = item.sub;
            if (item.href === "/c/me/history") sub = `${visits?.length || 0} visits across ${stores?.length || 0} store${stores?.length === 1 ? "" : "s"}`;
            if (item.href === "/c/me/loyalty") sub = `${customer?.loyaltyPoints || 0} pts, ${storeCredit} credit, ${customer?.loyaltyTier || "Regular"}`;
            return <Pressable key={item.href} style={styles.row} onPress={() => router.push(item.href)}><View style={styles.rowIconWrap}><Image source={item.icon} style={styles.rowIcon} contentFit="contain" /></View><View style={styles.rowCopy}><Text style={styles.rowTitle}>{item.label}</Text><Text numberOfLines={1} style={styles.rowSubtitle}>{sub}</Text></View><ChevronRight size={18} color="#222222" strokeWidth={2} /></Pressable>;
          })}
        </View>

        <View style={styles.actions}>
          <Pressable style={styles.chat} onPress={() => router.push("/c/me/stores")}><Image source={require("@/assets/customer/looks/whatsapp.svg")} style={styles.chatIcon} contentFit="contain" /><Text style={styles.chatText}>Chat with a Wearify store</Text></Pressable>
          <Pressable style={styles.logout} onPress={() => setShowSignOut(true)}><Text style={styles.logoutText}>Log Out</Text></Pressable>
        </View>
        <View style={styles.copyright}><Text style={styles.copyrightText}>© copyright PHYGIFY TECHNOSERVICES PRIVATE LIMITED</Text></View>
      </ScrollView>

      <Modal visible={showSignOut} transparent animationType="fade" onRequestClose={() => setShowSignOut(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setShowSignOut(false)}>
          <Pressable style={styles.modalCard} onPress={() => undefined}>
            <Text style={styles.modalTitle}>Log out?</Text><Text style={styles.modalCopy}>You&apos;ll need your phone number to sign back in.</Text>
            <View style={styles.modalActions}><Pressable style={styles.cancelButton} onPress={() => setShowSignOut(false)}><Text style={styles.cancelText}>Cancel</Text></Pressable><Pressable style={styles.confirmButton} onPress={() => void logout()}><Text style={styles.confirmText}>Log Out</Text></Pressable></View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const shadow = { shadowColor: "#000000", shadowOpacity: 0.1, shadowRadius: 7.5, shadowOffset: { width: 0, height: 4 }, elevation: 4 } as const;
const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#FFFFFF" },
  content: { paddingBottom: 0 },
  title: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12, fontFamily: "Montserrat_600SemiBold", fontSize: 20, lineHeight: 26, color: "#222222" },
  heroWrap: { paddingHorizontal: 16 },
  hero: { position: "relative", height: 225, overflow: "hidden", borderRadius: 8, borderWidth: 1, borderColor: "#D9D9D9", backgroundColor: "#FFFFFF" },
  heroFallback: { backgroundColor: "#F3E7E4" },
  blur: { backgroundColor: "rgba(255,255,255,0.3)" },
  heroContent: { position: "absolute", inset: 0, alignItems: "center", justifyContent: "center" },
  avatar: { width: 104, height: 104, overflow: "hidden", borderRadius: 52, borderWidth: 2, borderColor: "#FFFFFF", backgroundColor: MAROON, alignItems: "center", justifyContent: "center" },
  avatarImage: { width: "100%", height: "100%" },
  initials: { fontFamily: "Montserrat_600SemiBold", fontSize: 30, color: "#FFFFFF" },
  name: { marginTop: 8, fontFamily: "Montserrat_600SemiBold", fontSize: 16, lineHeight: 26, color: "#000000" },
  phone: { fontFamily: "Montserrat_500Medium", fontSize: 12, lineHeight: 21, letterSpacing: -0.32, color: "#676F75", textTransform: "uppercase" },
  edit: { width: 124, height: 35, marginTop: 8, borderRadius: 18, backgroundColor: MAROON, alignItems: "center", justifyContent: "center" },
  editText: { fontFamily: "Montserrat_500Medium", fontSize: 12, letterSpacing: -0.32, color: "#FFFFFF" },
  stats: { paddingHorizontal: 16, paddingTop: 16, flexDirection: "row", gap: 9 },
  stat: { flex: 1, minWidth: 0, height: 62, borderRadius: 8, borderWidth: 1, borderColor: "#D9D9D9", backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center" },
  statValue: { maxWidth: "100%", fontFamily: "Montserrat_600SemiBold", fontSize: 18, lineHeight: 22, color: MAROON },
  statLabel: { fontFamily: "Montserrat_500Medium", fontSize: 12, lineHeight: 18, color: "rgba(36,36,36,0.8)" },
  storesSection: { marginTop: 22 },
  sectionHead: { paddingHorizontal: 16, marginBottom: 12, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  sectionTitle: { fontFamily: "Montserrat_600SemiBold", fontSize: 16, lineHeight: 30, letterSpacing: -0.21, color: "#000000" },
  seeAll: { flexDirection: "row", alignItems: "center", gap: 8 },
  seeAllText: { fontFamily: "Montserrat_400Regular", fontSize: 16, color: "#878787" },
  seeAllArrow: { width: 30, height: 30, borderRadius: 15, backgroundColor: MAROON, alignItems: "center", justifyContent: "center" },
  storeRail: { paddingHorizontal: 16, paddingBottom: 6, gap: 8 },
  storeCard: { width: 158, height: 179, overflow: "hidden", borderRadius: 10, backgroundColor: "#FFFFFF", ...shadow },
  storeImageWrap: { position: "relative", height: 123, overflow: "hidden", borderRadius: 10 },
  rating: { position: "absolute", bottom: 6, left: 4, width: 36, height: 16, borderRadius: 10, borderWidth: 1, borderColor: "#FFFFFF", backgroundColor: "rgba(255,255,255,0.8)", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 3 },
  ratingText: { fontFamily: "Montserrat_700Bold", fontSize: 8, lineHeight: 16, color: MAROON },
  storeInfo: { flex: 1, paddingHorizontal: 10, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 6 },
  storeLabels: { flex: 1, minWidth: 0 },
  storeName: { fontFamily: "Montserrat_600SemiBold", fontSize: 12, lineHeight: 15, color: "#000000" },
  storeCity: { fontFamily: "Montserrat_500Medium", fontSize: 10, lineHeight: 20, letterSpacing: 0.4, color: "#878787", textTransform: "capitalize" },
  storeArrow: { width: 24, height: 22, borderRadius: 4, borderWidth: 1, borderColor: "rgba(135,135,135,0.2)", alignItems: "center", justifyContent: "center" },
  rows: { paddingHorizontal: 16, paddingTop: 18, gap: 8 },
  row: { height: 75, paddingRight: 10, borderRadius: 10, borderWidth: 1, borderColor: "#D9D9D9", backgroundColor: "#FFFFFF", flexDirection: "row", alignItems: "center" },
  rowIconWrap: { width: 57, height: 57, alignItems: "center", justifyContent: "center" },
  rowIcon: { width: 24, height: 24 },
  rowCopy: { flex: 1, minWidth: 0 },
  rowTitle: { fontFamily: "Montserrat_500Medium", fontSize: 14, lineHeight: 22, color: "#222222" },
  rowSubtitle: { fontFamily: "Montserrat_400Regular", fontSize: 10, lineHeight: 16, color: "#000000" },
  actions: { paddingHorizontal: 16, paddingTop: 18, gap: 16 },
  chat: { height: 52, borderRadius: 8, backgroundColor: "#E5FFE8", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6 },
  chatIcon: { width: 16, height: 16 },
  chatText: { fontFamily: "Montserrat_500Medium", fontSize: 16, color: "#1FAF38" },
  logout: { height: 52, borderRadius: 8, backgroundColor: MAROON, alignItems: "center", justifyContent: "center" },
  logoutText: { fontFamily: "Montserrat_500Medium", fontSize: 16, color: "#FFFFFF" },
  copyright: { minHeight: 20, marginTop: 20, paddingHorizontal: 16, paddingVertical: 4, backgroundColor: MAROON, alignItems: "center", justifyContent: "center" },
  copyrightText: { fontFamily: "Montserrat_400Regular", fontSize: 10, lineHeight: 12, color: "#FFFFFF", textAlign: "center" },
  modalBackdrop: { flex: 1, padding: 20, backgroundColor: "rgba(28,17,8,.55)", alignItems: "center", justifyContent: "center" },
  modalCard: { width: "100%", maxWidth: 340, paddingHorizontal: 22, paddingTop: 26, paddingBottom: 20, borderRadius: 16, backgroundColor: "#FFFFFF", alignItems: "center", elevation: 12 },
  modalTitle: { fontFamily: "Montserrat_600SemiBold", fontSize: 18, color: "#222222" },
  modalCopy: { marginTop: 6, fontFamily: "Montserrat_400Regular", fontSize: 13, color: "#878787", textAlign: "center" },
  modalActions: { marginTop: 22, flexDirection: "row", gap: 12 },
  cancelButton: { flex: 1, height: 48, borderRadius: 8, borderWidth: 1, borderColor: MAROON, alignItems: "center", justifyContent: "center" },
  confirmButton: { flex: 1, height: 48, borderRadius: 8, backgroundColor: MAROON, alignItems: "center", justifyContent: "center" },
  cancelText: { fontFamily: "Montserrat_600SemiBold", fontSize: 14, color: MAROON },
  confirmText: { fontFamily: "Montserrat_600SemiBold", fontSize: 14, color: "#FFFFFF" },
});
