import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useQuery } from "convex/react";
import { ArrowRight, MapPin, User } from "lucide-react-native";
import { api } from "@/src/convex/api";
import { LookMedia } from "@/src/components/media";
import { AppHeader, EmptyState, Loading, Screen, Title } from "@/src/components/ui";
import { useAuth } from "@/src/providers/auth";
import { colors, radius } from "@/src/theme/tokens";

export default function HomeScreen() {
  const router = useRouter();
  const { token, user, customer } = useAuth();
  const customerId = user?.customerId;
  const stores = useQuery(api.customers.listStoreLinksEnriched, token && customerId ? { token, customerId } : "skip");
  const looks = useQuery(api.sessionOps.listByCustomer, token && customerId ? { token, customerId } : "skip");
  return <><AppHeader right={<Pressable accessibilityRole="button" accessibilityLabel="Profile" onPress={() => router.push("/c/me")}><User color={colors.ink} size={21} /></Pressable>} /><Screen>
    <Title subtitle="Your personal saree wardrobe">Hello, {customer?.name?.split(" ")[0] || user?.name?.split(" ")[0] || "there"}</Title>
    <View style={styles.quickRow}>
      <QuickCard title="My Looks" detail={`${looks?.length ?? 0} saved`} onPress={() => router.push("/c/looks")} />
      <QuickCard title="My Stores" detail={`${stores?.length ?? 0} connected`} onPress={() => router.push("/c/me/stores")} />
    </View>
    <Pressable style={styles.offer} onPress={() => router.push("/c/new")}>
      <View><Text style={styles.offerKicker}>JUST IN</Text><Text style={styles.offerTitle}>New sarees from your stores</Text><Text style={styles.offerCopy}>Discover the latest arrivals</Text></View>
      <ArrowRight color="#FFFFFF" size={23} />
    </Pressable>
    <Section title="Recent Looks" action={() => router.push("/c/looks")} />
    {looks === undefined ? <Loading /> : looks.length === 0 ? <EmptyState title="No looks yet" detail="Your in-store try-ons will appear here." /> : (
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rail}>
        {looks.slice(0, 8).map((look) => <Pressable key={look._id} style={styles.lookCard} onPress={() => router.push(`/c/looks/${look._id}`)}><LookMedia cutout={look.imageNoBgFileId} render={look.imageFileId} fallback={look.sareeImageId} label={look.sareeName ?? "Saree look"} style={styles.lookImage} /><Text numberOfLines={1} style={styles.cardTitle}>{look.sareeName ?? "Your look"}</Text><Text style={styles.cardMeta}>{look.sareeOccasion ?? look.fabric ?? "Saree"}</Text></Pressable>)}
      </ScrollView>
    )}
    <Section title="My Stores" action={() => router.push("/c/me/stores")} />
    {stores?.slice(0, 3).map((store) => <Pressable key={store._id} style={styles.store} onPress={() => router.push("/c/me/stores")}><View style={styles.storeIcon}><MapPin color={colors.brand} size={19} /></View><View style={styles.storeText}><Text style={styles.cardTitle}>{store.storeName ?? store.storeId}</Text><Text style={styles.cardMeta}>{store.storeCity ?? store.lastVisit ?? "Connected store"}</Text></View><ArrowRight color={colors.brand} size={17} /></Pressable>)}
  </Screen></>;
}

function QuickCard({ title, detail, onPress }: { title: string; detail: string; onPress: () => void }) { return <Pressable style={styles.quickCard} onPress={onPress}><Text style={styles.quickTitle}>{title}</Text><Text style={styles.quickDetail}>{detail}</Text></Pressable>; }
function Section({ title, action }: { title: string; action: () => void }) { return <View style={styles.section}><Text style={styles.sectionTitle}>{title}</Text><Pressable onPress={action}><Text style={styles.seeAll}>See all</Text></Pressable></View>; }
const styles = StyleSheet.create({ quickRow: { flexDirection: "row", gap: 12 }, quickCard: { flex: 1, minHeight: 92, borderRadius: radius.lg, padding: 16, backgroundColor: colors.brandSoft }, quickTitle: { fontFamily: "Montserrat_600SemiBold", color: colors.brand, fontSize: 15 }, quickDetail: { marginTop: 8, fontFamily: "DMSans_400Regular", color: colors.muted, fontSize: 13 }, offer: { marginTop: 16, minHeight: 132, padding: 20, borderRadius: radius.lg, backgroundColor: "#CB857C", flexDirection: "row", justifyContent: "space-between", alignItems: "center" }, offerKicker: { color: "#FFFFFF", fontFamily: "DMMono_400Regular", fontSize: 10, letterSpacing: 1.4 }, offerTitle: { marginTop: 7, maxWidth: 230, color: "#FFFFFF", fontFamily: "CormorantGaramond_700Bold", fontSize: 25 }, offerCopy: { marginTop: 4, color: "rgba(255,255,255,.82)", fontFamily: "DMSans_400Regular", fontSize: 12 }, section: { marginTop: 28, marginBottom: 12, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }, sectionTitle: { fontFamily: "Montserrat_600SemiBold", color: colors.ink, fontSize: 17 }, seeAll: { color: colors.brand, fontFamily: "DMSans_600SemiBold", fontSize: 13 }, rail: { gap: 12, paddingRight: 16 }, lookCard: { width: 148, borderRadius: radius.sm, overflow: "hidden", backgroundColor: colors.surface }, lookImage: { width: 148, height: 184 }, cardTitle: { paddingHorizontal: 10, paddingTop: 9, fontFamily: "Montserrat_600SemiBold", color: colors.ink, fontSize: 13 }, cardMeta: { paddingHorizontal: 10, paddingTop: 2, paddingBottom: 10, fontFamily: "DMSans_400Regular", color: colors.muted, fontSize: 11 }, store: { minHeight: 68, marginBottom: 10, padding: 12, borderRadius: radius.md, flexDirection: "row", alignItems: "center", backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }, storeIcon: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center", backgroundColor: colors.brandSoft }, storeText: { flex: 1 }, });
