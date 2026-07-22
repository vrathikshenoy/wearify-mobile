import { useQuery } from "convex/react";
import { StyleSheet, View, type ImageStyle, type StyleProp } from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { api } from "@/src/convex/api";
import type { FileId } from "@/src/types/domain";
import { colors } from "@/src/theme/tokens";

export function ConvexImage({ fileId, fallbackFileId, label, style, contain = false }: {
  fileId?: FileId;
  fallbackFileId?: FileId;
  label: string;
  style: StyleProp<ImageStyle>;
  contain?: boolean;
}) {
  const selected = fileId ?? fallbackFileId;
  const url = useQuery(api.files.getUrl, selected ? { fileId: selected } : "skip");
  if (!url) return <LinearGradient colors={["#F7EAE4", "#E8CFC5"]} style={style} />;
  return <Image source={{ uri: url }} style={style} contentFit={contain ? "contain" : "cover"} transition={180} accessibilityLabel={label} />;
}

export function LookMedia({ cutout, render, fallback, label, style }: {
  cutout?: FileId;
  render?: FileId;
  fallback?: FileId;
  label: string;
  style: StyleProp<ImageStyle>;
}) {
  const cutoutUrl = useQuery(api.files.getUrl, cutout ? { fileId: cutout } : "skip");
  const raw = render ?? fallback;
  const rawUrl = useQuery(api.files.getUrl, !cutoutUrl && raw ? { fileId: raw } : "skip");
  return (
    <View style={[styles.clip, style]}>
      <LinearGradient colors={["#FBF3EE", "#F1DDD2"]} style={StyleSheet.absoluteFill} />
      {cutoutUrl ? (
        <Image source={{ uri: cutoutUrl }} style={styles.image} contentFit="contain" transition={180} accessibilityLabel={label} />
      ) : rawUrl ? (
        <Image source={{ uri: rawUrl }} style={styles.image} contentFit="cover" transition={180} accessibilityLabel={label} />
      ) : <View style={[styles.image, { backgroundColor: colors.brandSoft }]} />}
    </View>
  );
}

const styles = StyleSheet.create({
  clip: { overflow: "hidden", backgroundColor: colors.brandSoft },
  image: { width: "100%", height: "100%" },
});
