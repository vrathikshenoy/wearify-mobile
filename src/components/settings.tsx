import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { ChevronRight } from "lucide-react-native";
import { colors, radius } from "@/src/theme/tokens";

export function SettingsRow({ icon, title, detail, onPress, danger = false }: { icon: ReactNode; title: string; detail?: string; onPress: () => void; danger?: boolean }) {
  return <Pressable accessibilityRole="button" style={({ pressed }) => [styles.row, pressed && styles.pressed]} onPress={onPress}><View style={[styles.icon, danger && styles.dangerIcon]}>{icon}</View><View style={styles.copy}><Text style={[styles.title, danger && styles.danger]}>{title}</Text>{detail ? <Text style={styles.detail}>{detail}</Text> : null}</View><ChevronRight color={danger ? colors.error : colors.ghost} size={19} /></Pressable>;
}
const styles = StyleSheet.create({ row: { minHeight: 66, paddingHorizontal: 14, paddingVertical: 10, flexDirection: "row", alignItems: "center", gap: 12, borderRadius: radius.md, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }, pressed: { opacity: .82 }, icon: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center", backgroundColor: colors.brandSoft }, dangerIcon: { backgroundColor: "#F8E5E5" }, copy: { flex: 1 }, title: { color: colors.ink, fontFamily: "Montserrat_600SemiBold", fontSize: 14 }, detail: { marginTop: 3, color: colors.muted, fontFamily: "DMSans_400Regular", fontSize: 12 }, danger: { color: colors.error } });
