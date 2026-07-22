import { useState } from "react";
import { Modal, Pressable, Share, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useQuery } from "convex/react";
import { Maximize2, Share2, X } from "lucide-react-native";
import { api } from "@/src/convex/api";
import { LookMedia } from "@/src/components/media";
import { AppHeader, EmptyState, Loading, Screen, SecondaryButton, Title } from "@/src/components/ui";
import { useAuth } from "@/src/providers/auth";
import { colors, radius } from "@/src/theme/tokens";
import type { LookId } from "@/src/types/domain";

export default function LookDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>(); const { token, user } = useAuth(); const [expanded, setExpanded] = useState(false);
  const looks = useQuery(api.sessionOps.listByCustomer, token && user ? { token, customerId: user.customerId } : "skip");
  if (looks === undefined) return <><AppHeader back title="Look details" /><Loading /></>;
  const look = looks.find((item) => item._id === id as LookId);
  if (!look) return <><AppHeader back title="Look details" /><Screen><EmptyState title="Look not found" detail="It may have been removed from your account." /></Screen></>;
  const share = () => Share.share({ message: `See my ${look.sareeName ?? "saree"} look on Wearify: ${process.env.EXPO_PUBLIC_WEB_URL}/c/looks/${look._id}` });
  return <><AppHeader back title="Look details" right={<Pressable accessibilityLabel="Share look" onPress={() => void share()}><Share2 color={colors.ink} size={20} /></Pressable>} /><Screen>
    <Pressable style={styles.hero} onPress={() => setExpanded(true)}><LookMedia cutout={look.imageNoBgFileId} render={look.imageFileId} fallback={look.sareeImageId} label={look.sareeName ?? "Look"} style={styles.heroImage} /><View style={styles.expand}><Maximize2 color="#FFFFFF" size={18} /></View></Pressable>
    <Title subtitle={look.sareeOccasion ?? look.fabric ?? "Saved from your in-store try-on"}>{look.sareeName ?? "Your saree look"}</Title>
    <View style={styles.info}><Info label="Store" value={look.storeId ?? "Wearify partner"} /><Info label="Style" value={look.sareeOccasion ?? "Saree"} />{look.price ? <Info label="Price" value={`₹${look.price.toLocaleString("en-IN")}`} /> : null}</View>
    <SecondaryButton onPress={() => void share()}>Share this look</SecondaryButton>
  </Screen><Modal visible={expanded} animationType="fade" presentationStyle="fullScreen" onRequestClose={() => setExpanded(false)}><View style={styles.modal}><LookMedia cutout={look.imageNoBgFileId} render={look.imageFileId} fallback={look.sareeImageId} label={look.sareeName ?? "Look"} style={styles.fullImage} /><Pressable accessibilityLabel="Close image" style={styles.close} onPress={() => setExpanded(false)}><X color="#FFFFFF" size={24} /></Pressable></View></Modal></>;
}
function Info({ label, value }: { label: string; value: string }) { return <View style={styles.infoItem}><Text style={styles.infoLabel}>{label}</Text><Text style={styles.infoValue}>{value}</Text></View>; }
const styles = StyleSheet.create({ hero: { marginTop: 16, borderRadius: radius.lg, overflow: "hidden" }, heroImage: { width: "100%", aspectRatio: 0.82 }, expand: { position: "absolute", right: 12, bottom: 12, width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(0,0,0,.55)", alignItems: "center", justifyContent: "center" }, info: { marginBottom: 20, padding: 16, borderRadius: radius.lg, backgroundColor: colors.surface }, infoItem: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border }, infoLabel: { color: colors.muted, fontFamily: "DMSans_400Regular" }, infoValue: { maxWidth: "65%", color: colors.ink, fontFamily: "DMSans_600SemiBold", textAlign: "right" }, modal: { flex: 1, backgroundColor: "#000000", alignItems: "center", justifyContent: "center" }, fullImage: { width: "100%", height: "100%" }, close: { position: "absolute", top: 56, right: 20, width: 44, height: 44, borderRadius: 22, backgroundColor: "rgba(0,0,0,.55)", alignItems: "center", justifyContent: "center" } });
