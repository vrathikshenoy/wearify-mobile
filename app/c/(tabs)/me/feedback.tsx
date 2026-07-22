import { useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useMutation, useQuery } from "convex/react";
import { ChevronRight, Clock, MapPin, Star, User } from "lucide-react-native";
import { api } from "@/src/convex/api";
import { AppHeader, Loading } from "@/src/components/ui";
import { useAuth } from "@/src/providers/auth";
import { useIsOnline } from "@/src/providers/connectivity";
import type { StoreLink } from "@/src/types/domain";

const MAROON = "#6E262B";
const STORE_IMAGES = [require("@/assets/kiosk/img1.jpg"), require("@/assets/kiosk/img2.webp"), require("@/assets/kiosk/img3.webp"), require("@/assets/kiosk/img4.jpg")] as const;

export default function FeedbackScreen() {
  const router = useRouter();
  const { token, user } = useAuth();
  const online = useIsOnline();
  const stores = useQuery(api.customers.listStoreLinksEnriched, token && user ? { token, customerId: user.customerId } : "skip");
  const submitFeedback = useMutation(api.customers.submitFeedback);
  const [selected, setSelected] = useState<number>();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const store = selected === undefined ? undefined : stores?.[selected];

  const openRate = (index: number) => { setSelected(index); setRating(0); setComment(""); };
  const goBack = () => selected === undefined ? router.back() : setSelected(undefined);
  async function submit() {
    if (!online) return Alert.alert("You’re offline", "Reconnect to send feedback.");
    if (!store || !token || !user || !rating || submitting) return;
    setSubmitting(true);
    try {
      await submitFeedback({ token, customerId: user.customerId, customerPhone: user.phone, storeId: store.storeId, rating, comment: comment.trim() || undefined, date: new Date().toISOString().slice(0, 10) });
      setSelected(undefined);
      setRating(0);
      setComment("");
    } catch {
      Alert.alert("Couldn’t submit", "Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (stores === undefined) return <View style={styles.page}><AppHeader back title="Rate your visit" /><Loading /></View>;
  return (
    <View style={styles.page}>
      <AppHeader back title="Rate your visit" onBack={goBack} />
      {!stores.length ? <Empty onBack={() => router.push("/c/me")} /> : store ? <Rate store={store} index={selected!} rating={rating} comment={comment} submitting={submitting} onRating={setRating} onComment={setComment} onSubmit={() => void submit()} /> : <StoreList stores={stores} onSelect={openRate} />}
    </View>
  );
}

function StoreList({ stores, onSelect }: { stores: StoreLink[]; onSelect: (index: number) => void }) {
  return <ScrollView contentContainerStyle={styles.list}><Text style={styles.heading}>{stores.length} Wearify Store</Text><View style={styles.stack}>{stores.map((store, index) => <Pressable accessibilityRole="button" key={store._id} onPress={() => onSelect(index)} style={({ pressed }) => [styles.storeCard, pressed && styles.pressed]}><Image source={STORE_IMAGES[index % STORE_IMAGES.length]} style={styles.listImage} contentFit="cover" accessibilityLabel={store.storeName || "Wearify store"} /><View style={styles.storeCopy}><Text style={styles.storeName}>{store.storeName || store.storeId}</Text>{store.lastVisit ? <Text style={styles.lastVisit}>{store.lastVisit}</Text> : null}{store.storeCity || store.storeState ? <View style={styles.row}><Image source={require("@/assets/customer/rate-your-visit/location.svg")} style={styles.locationAsset} contentFit="contain" /><Text style={styles.city}>{[store.storeCity, store.storeState].filter(Boolean).join(", ")}</Text></View> : null}</View><ChevronRight size={20} color="#C4B8B3" /></Pressable>)}</View></ScrollView>;
}

function Rate({ store, index, rating, comment, submitting, onRating, onComment, onSubmit }: { store: StoreLink; index: number; rating: number; comment: string; submitting: boolean; onRating: (value: number) => void; onComment: (value: string) => void; onSubmit: () => void }) {
  const city = [store.storeCity, store.storeState].filter(Boolean).join(", ");
  return <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.ratePage}><Text style={styles.heading}>Rate {store.storeName}</Text><View style={styles.infoCard}><Image source={STORE_IMAGES[index % STORE_IMAGES.length]} style={styles.infoImage} contentFit="cover" accessibilityLabel={store.storeName || "Wearify store"} /><View style={styles.infoCopy}><Text style={styles.storeName}>{store.storeName || store.storeId}</Text>{city ? <Detail icon={<Image source={require("@/assets/customer/rate-your-visit/location.svg")} style={styles.locationAsset} contentFit="contain" />} text={city} strong /> : null}<Detail icon={<User size={12} color="#A99F9A" />} text={`${store.visits ?? 0} visits`} extra={store.lastVisit ? `Last: ${store.lastVisit}` : undefined} />{store.storeAddress ? <Detail icon={<MapPin size={12} color="#A99F9A" />} text={store.storeAddress} /> : null}{store.storeHours ? <Detail icon={<Clock size={12} color="#A99F9A" />} text={store.storeHours} /> : null}</View></View><View style={styles.feedbackCard}><Text style={styles.feedbackTitle}>Wearify feedback</Text><Text style={styles.feedbackCopy}>Please rate your experience below</Text><View style={styles.ratingRow}><View style={styles.stars}>{[1, 2, 3, 4, 5].map((value) => <Pressable accessibilityRole="radio" accessibilityLabel={`${value} stars`} accessibilityState={{ checked: value === rating }} hitSlop={6} key={value} onPress={() => onRating(value)}><Star size={30} color="#F5A623" fill={value <= rating ? "#F5A623" : "transparent"} strokeWidth={1.6} /></Pressable>)}</View><Text style={styles.ratingText}>{rating}/5 stars</Text></View><Text style={styles.fieldLabel}>Additional feedback</Text><TextInput accessibilityLabel="Additional feedback" placeholder="My feedback!!" placeholderTextColor="#9A8F8A" value={comment} onChangeText={onComment} maxLength={500} multiline style={styles.input} /><Pressable accessibilityRole="button" disabled={!rating || submitting} onPress={onSubmit} style={({ pressed }) => [styles.submit, (!rating || submitting) && styles.disabled, pressed && styles.pressed]}><Text style={styles.submitText}>{submitting ? "Submitting…" : "Submit feedback"}</Text></Pressable></View></ScrollView>;
}

function Detail({ icon, text, strong, extra }: { icon: React.ReactNode; text: string; strong?: boolean; extra?: string }) { return <View style={styles.detail}>{icon}<Text numberOfLines={2} style={[styles.detailText, strong && styles.detailStrong]}>{text}</Text>{extra ? <><Clock size={12} color="#A99F9A" /><Text style={styles.detailText}>{extra}</Text></> : null}</View>; }

function Empty({ onBack }: { onBack: () => void }) { return <View style={styles.emptyWrap}><View style={styles.emptyCard}><View style={styles.emptyIcon}><Image source={require("@/assets/customer/rate-your-visit/no-visit.svg")} style={{ width: 26, height: 26 }} contentFit="contain" /></View><Text style={styles.emptyTitle}>No visits yet</Text><Text style={styles.emptyCopy}>Once you’ve visited a Wearify store, you’ll be able to rate your experience here.</Text><Pressable accessibilityRole="button" onPress={onBack} style={styles.backButton}><Text style={styles.backText}>Back to profile</Text></Pressable></View></View>; }

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#FFFFFF" }, list: { padding: 16, paddingBottom: 32 }, heading: { marginBottom: 16, fontFamily: "DMSans_700Bold", fontSize: 22, color: "#1C1714" }, stack: { gap: 12 }, storeCard: { width: "100%", padding: 12, borderWidth: 1, borderColor: "#F0E6E3", borderRadius: 14, backgroundColor: "#FFFFFF", flexDirection: "row", alignItems: "center", gap: 14, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 6, shadowOffset: { width: 0, height: 3 }, elevation: 2 }, listImage: { width: 72, height: 72, borderRadius: 12 }, storeCopy: { flex: 1, gap: 4 }, storeName: { fontFamily: "DMSans_700Bold", fontSize: 16, color: "#2A2522" }, lastVisit: { fontFamily: "DMSans_400Regular", fontSize: 12, color: "#9A8F8A" }, row: { flexDirection: "row", alignItems: "center", gap: 4 }, locationAsset: { width: 13, height: 13 }, city: { fontFamily: "DMSans_600SemiBold", fontSize: 12.5, color: MAROON }, pressed: { opacity: 0.85, transform: [{ scale: 0.99 }] }, ratePage: { padding: 16, paddingBottom: 36 }, infoCard: { marginBottom: 22, padding: 12, borderWidth: 1, borderColor: "#F0E6E3", borderRadius: 16, backgroundColor: "#FFFFFF", flexDirection: "row", gap: 14, shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 2 }, infoImage: { width: 104, height: 104, borderRadius: 12 }, infoCopy: { flex: 1, justifyContent: "center", gap: 5 }, detail: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 6 }, detailText: { fontFamily: "DMSans_400Regular", fontSize: 12.5, color: "#9A8F8A" }, detailStrong: { fontFamily: "DMSans_700Bold", color: MAROON }, feedbackCard: { paddingHorizontal: 18, paddingVertical: 22, borderWidth: 1, borderColor: "#ECE4E1", borderRadius: 18 }, feedbackTitle: { textAlign: "center", fontFamily: "DMSans_700Bold", fontSize: 22, color: "#243447" }, feedbackCopy: { marginTop: 4, textAlign: "center", fontFamily: "DMSans_400Regular", fontSize: 14, color: "#6B7280" }, ratingRow: { marginTop: 18, marginBottom: 6, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10 }, stars: { flexDirection: "row", gap: 6 }, ratingText: { fontFamily: "DMSans_600SemiBold", fontSize: 14, color: "#2A2522" }, fieldLabel: { marginTop: 18, marginBottom: 8, fontFamily: "DMSans_600SemiBold", fontSize: 14, color: "#2A2522" }, input: { minHeight: 112, paddingHorizontal: 14, paddingVertical: 12, borderWidth: 1, borderColor: "#DDD4D0", borderRadius: 10, color: "#2A2522", fontFamily: "DMSans_400Regular", fontSize: 16, lineHeight: 24, textAlignVertical: "top" }, submit: { height: 52, marginTop: 16, borderRadius: 10, backgroundColor: MAROON, alignItems: "center", justifyContent: "center" }, submitText: { fontFamily: "DMSans_700Bold", fontSize: 16, color: "#FFFFFF" }, disabled: { opacity: 0.6 }, emptyWrap: { flex: 1, paddingHorizontal: 22, paddingTop: 100, alignItems: "center" }, emptyCard: { width: "100%", maxWidth: 340, paddingHorizontal: 24, paddingVertical: 30, borderWidth: 1, borderColor: "#F0E6E3", borderRadius: 22, backgroundColor: "#FFFFFF", alignItems: "center", shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 15, shadowOffset: { width: 0, height: 8 }, elevation: 3 }, emptyIcon: { width: 60, height: 60, marginBottom: 16, borderRadius: 30, backgroundColor: "#FCE4E8", alignItems: "center", justifyContent: "center" }, emptyTitle: { fontFamily: "DMSans_700Bold", fontSize: 18, color: "#2A2522" }, emptyCopy: { marginTop: 8, textAlign: "center", fontFamily: "DMSans_400Regular", fontSize: 13, lineHeight: 20, color: "#9A8F8A" }, backButton: { width: "100%", height: 50, marginTop: 22, borderWidth: 1.5, borderColor: "#E8E0DD", borderRadius: 25, alignItems: "center", justifyContent: "center" }, backText: { fontFamily: "DMSans_700Bold", fontSize: 15, color: "#2A2522" },
});
