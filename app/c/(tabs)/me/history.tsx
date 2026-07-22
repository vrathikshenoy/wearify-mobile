import { StyleSheet, Text, View } from "react-native";
import { useQuery } from "convex/react";
import { CalendarDays, MapPin } from "lucide-react-native";
import { api } from "@/src/convex/api";
import { AppHeader, EmptyState, Loading, Screen, Title } from "@/src/components/ui";
import { useAuth } from "@/src/providers/auth";
import { colors, radius } from "@/src/theme/tokens";

export default function HistoryScreen() { const { token, user } = useAuth(); const visits = useQuery(api.customers.listVisitHistory, token && user ? { token, customerId: user.customerId } : "skip"); if (visits === undefined) return <><AppHeader back title="Visit history" /><Loading /></>; return <><AppHeader back title="Visit history" /><Screen><Title subtitle="Your Wearify store journey">Visit History</Title>{visits.length === 0 ? <EmptyState title="No visits recorded" detail="Completed in-store sessions will appear here." /> : visits.map((visit) => <View key={visit._id} style={styles.card}><View style={styles.icon}><MapPin color={colors.brand} size={19} /></View><View style={styles.copy}><Text style={styles.name}>{visit.storeName ?? visit.storeId}</Text><View style={styles.date}><CalendarDays color={colors.ghost} size={13} /><Text style={styles.meta}>{visit.lastVisit ?? "Recent visit"}</Text></View></View></View>)}</Screen></>; }
const styles = StyleSheet.create({ card: { minHeight: 70, marginBottom: 10, padding: 13, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, flexDirection: "row", alignItems: "center", gap: 12 }, icon: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center", backgroundColor: colors.brandSoft }, copy: { flex: 1 }, name: { color: colors.ink, fontFamily: "Montserrat_600SemiBold", fontSize: 14 }, date: { marginTop: 5, flexDirection: "row", alignItems: "center", gap: 5 }, meta: { color: colors.muted, fontFamily: "DMSans_400Regular", fontSize: 12 } });
