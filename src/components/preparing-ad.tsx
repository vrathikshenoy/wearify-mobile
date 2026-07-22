import { useEffect } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { VideoView, useVideoPlayer } from "expo-video";
import { X } from "lucide-react-native";
import { AppHeader } from "@/src/components/ui";
import { colors, radius } from "@/src/theme/tokens";

export function PreparingAd({ onDone }: { onDone: () => void }) {
  const player = useVideoPlayer(require("../../assets/customer/add/add.mp4"), (instance) => { instance.loop = true; instance.muted = true; instance.play(); });
  useEffect(() => { const timeout = setTimeout(onDone, 30_000); return () => clearTimeout(timeout); }, [onDone]);
  return <View style={styles.page}><AppHeader back /><View style={styles.body}><View style={styles.videoWrap}><VideoView player={player} style={styles.video} contentFit="cover" nativeControls={false} /><Pressable accessibilityRole="button" accessibilityLabel="Skip advertisement" style={styles.close} onPress={onDone}><X color="#000000" strokeWidth={1.6} size={18} /></Pressable><Text style={styles.ad}>Ad ⓘ</Text></View><View style={styles.preparing}><Image source={require("@/assets/customer/add/3_chatgpt_image_jul_4__2026__12_57_23_am__1__1.svg")} style={styles.preparingImage} contentFit="contain" accessibilityElementsHidden /><Text style={styles.title}>PREPARING YOUR SAREE...</Text><ActivityIndicator size={46} color={colors.brand} /></View></View><Text style={styles.copyright}>© copyright PHYGIFY TECHNOSERVICES PRIVATE LIMITED</Text></View>;
}
const styles = StyleSheet.create({ page: { flex: 1, backgroundColor: "#FFFFFF" }, body: { flex: 1, minHeight: 0, paddingHorizontal: 16, paddingTop: 16 }, videoWrap: { width: "100%", aspectRatio: 361 / 418, borderRadius: radius.sm, overflow: "hidden", backgroundColor: "#000000" }, video: { position: "absolute", inset: 0 }, close: { position: "absolute", top: 10, right: 10, width: 35, height: 35, borderRadius: 8, backgroundColor: "rgba(255,255,255,0.92)", alignItems: "center", justifyContent: "center", elevation: 2 }, ad: { position: "absolute", right: 0, bottom: 0, height: 24, paddingHorizontal: 8, textAlignVertical: "center", backgroundColor: "#000000", color: "#FFFFFF", fontFamily: "Montserrat_500Medium", fontSize: 8, letterSpacing: -0.24 }, preparing: { flex: 1, minHeight: 150, paddingBottom: 12, alignItems: "center", justifyContent: "center", gap: 14 }, preparingImage: { width: 141, height: 94 }, title: { color: "#000000", fontFamily: "Montserrat_500Medium", fontSize: 14, lineHeight: 26 }, copyright: { minHeight: 20, paddingHorizontal: 16, paddingVertical: 4, textAlign: "center", backgroundColor: "rgba(104,38,42,0.1)", color: "#222222", fontFamily: "Montserrat_300Light", fontSize: 10, lineHeight: 12 } });
