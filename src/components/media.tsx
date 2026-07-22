import { useQuery } from "convex/react";
import { ActivityIndicator, StyleSheet, View, type ImageStyle, type StyleProp } from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { api } from "@/src/convex/api";
import type { FileId } from "@/src/types/domain";
import { colors } from "@/src/theme/tokens";

export function ConvexImage({ fileId, fallbackFileId, fallbackSource, label, style, contain = false }: {
  fileId?: FileId;
  fallbackFileId?: FileId;
  fallbackSource?: number;
  label: string;
  style: StyleProp<ImageStyle>;
  contain?: boolean;
}) {
  const selected = fileId ?? fallbackFileId;
  const url = useQuery(api.files.getUrl, selected ? { fileId: selected } : "skip");
  if (url === undefined && selected) return <View style={[styles.loading, style]}><LinearGradient colors={["#F7EAE4", "#E8CFC5"]} style={StyleSheet.absoluteFill} /><ActivityIndicator color={colors.brand} /></View>;
  if (!url) return fallbackSource ? <Image source={fallbackSource} style={style} contentFit={contain ? "contain" : "cover"} accessibilityLabel={label} /> : <LinearGradient colors={["#F7EAE4", "#E8CFC5"]} style={style} />;
  return <Image source={{ uri: url }} style={style} contentFit={contain ? "contain" : "cover"} transition={180} accessibilityLabel={label} />;
}

export function LookMedia({ cutout, render, fallback, label, style, scale = 1, surface }: {
  cutout?: FileId;
  render?: FileId;
  fallback?: FileId;
  label: string;
  style: StyleProp<ImageStyle>;
  scale?: number;
  surface?: string;
}) {
  const cutoutUrl = useQuery(api.files.getUrl, cutout ? { fileId: cutout } : "skip");
  const raw = render ?? fallback;
  const rawUrl = useQuery(api.files.getUrl, !cutoutUrl && raw ? { fileId: raw } : "skip");
  const pending = Boolean((cutout && cutoutUrl === undefined) || (!cutoutUrl && raw && rawUrl === undefined));
  return (
    <View style={[styles.clip, style]}>
      {surface ? <View style={[StyleSheet.absoluteFill, { backgroundColor: surface }]} /> : <LinearGradient colors={["#FBF3EE", "#F1DDD2"]} style={StyleSheet.absoluteFill} />}
      {cutoutUrl ? (
        <Image source={{ uri: cutoutUrl }} style={[styles.image, { transform: [{ scale }] }]} contentFit="contain" transition={180} accessibilityLabel={label} />
      ) : rawUrl ? (
        <Image source={{ uri: rawUrl }} style={[styles.image, { transform: [{ scale }] }]} contentFit="cover" transition={180} accessibilityLabel={label} />
      ) : <View style={[styles.image, styles.missing]}>{pending ? <ActivityIndicator color={colors.brand} /> : null}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  clip: { overflow: "hidden" },
  image: { width: "100%", height: "100%" },
  loading: { overflow: "hidden", alignItems: "center", justifyContent: "center" },
  missing: { alignItems: "center", justifyContent: "center", backgroundColor: colors.brandSoft },
});
