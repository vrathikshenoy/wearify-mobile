import { useEffect } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { VideoView, useVideoPlayer } from "expo-video";
import { X } from "lucide-react-native";
import { AppHeader } from "@/src/components/ui";
import { colors, radius } from "@/src/theme/tokens";

export function PreparingAd({ onDone }: { onDone: () => void }) {
  const player = useVideoPlayer(require("../../assets/customer/add/add.mp4"), (instance) => { instance.loop = true; instance.muted = true; instance.play(); });
  useEffect(() => { const timeout = setTimeout(onDone, 30_000); return () => clearTimeout(timeout); }, [onDone]);
  return <View style={styles.page}><AppHeader /><View style={styles.body}><View style={styles.videoWrap}><VideoView player={player} style={styles.video} contentFit="cover" nativeControls={false} /><Pressable accessibilityRole="button" accessibilityLabel="Skip advertisement" style={styles.close} onPress={onDone}><X color={colors.ink} size={18} /></Pressable><Text style={styles.ad}>Ad ⓘ</Text></View><View style={styles.preparing}><Text style={styles.title}>PREPARING YOUR SAREE…</Text><ActivityIndicator size="large" color={colors.brand} /></View></View><Text style={styles.copyright}>© PHYGIFY TECHNOSERVICES PRIVATE LIMITED</Text></View>;
}
const styles = StyleSheet.create({ page: { flex: 1, backgroundColor: colors.canvas }, body: { flex: 1, padding: 16 }, videoWrap: { width: "100%", aspectRatio: 361 / 418, borderRadius: radius.sm, overflow: "hidden", backgroundColor: "#000000" }, video: { position: "absolute", inset: 0 }, close: { position: "absolute", top: 10, right: 10, width: 36, height: 36, borderRadius: radius.sm, backgroundColor: "rgba(255,255,255,0.92)", alignItems: "center", justifyContent: "center" }, ad: { position: "absolute", right: 0, bottom: 0, paddingHorizontal: 9, paddingVertical: 5, backgroundColor: "#000000", color: "#FFFFFF", fontFamily: "DMSans_500Medium", fontSize: 9 }, preparing: { flex: 1, minHeight: 130, alignItems: "center", justifyContent: "center", gap: 14 }, title: { color: colors.ink, fontFamily: "Montserrat_500Medium", fontSize: 14 }, copyright: { paddingVertical: 7, textAlign: "center", backgroundColor: colors.brandSoft, color: colors.ink, fontFamily: "DMSans_400Regular", fontSize: 9 } });
