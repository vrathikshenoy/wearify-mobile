import { ImageBackground, Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { ArrowRight } from "lucide-react-native";
import { Brand, PrimaryButton, SecondaryButton } from "@/src/components/ui";
import { colors } from "@/src/theme/tokens";

export default function WelcomeScreen() {
  const router = useRouter();
  return (
    <ImageBackground source={require("@/assets/customer/first-screen/background.svg")} style={styles.page} resizeMode="cover">
      <LinearGradient colors={["rgba(104,38,42,0.82)", "#68262A"]} style={StyleSheet.absoluteFill} />
      <View style={styles.hero}>
        <Brand light size={48} />
        <Text style={styles.tagline}>Your personal saree wardrobe, wherever you go.</Text>
      </View>
      <View style={styles.panel}>
        <Text style={styles.title}>Try on the moment</Text>
        <Text style={styles.body}>Keep every look, discover new arrivals and stay connected to your favourite stores.</Text>
        <PrimaryButton onPress={() => router.push("/c/register")}>Create an account</PrimaryButton>
        <SecondaryButton onPress={() => router.push("/c/login")}>I already have an account</SecondaryButton>
        <Pressable accessibilityRole="button" onPress={() => router.push("/c/login")} style={styles.continueRow}>
          <Text style={styles.continueText}>Continue securely with your phone</Text><ArrowRight color={colors.brand} size={17} />
        </Pressable>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, justifyContent: "space-between" },
  hero: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32 },
  tagline: { marginTop: 14, color: "#F2E4DA", fontFamily: "DMSans_400Regular", fontSize: 16, textAlign: "center", lineHeight: 23 },
  panel: { gap: 12, padding: 24, paddingBottom: 34, borderTopLeftRadius: 28, borderTopRightRadius: 28, backgroundColor: colors.canvas },
  title: { fontFamily: "CormorantGaramond_700Bold", color: colors.ink, fontSize: 35 },
  body: { marginBottom: 8, color: colors.muted, fontFamily: "DMSans_400Regular", fontSize: 14, lineHeight: 21 },
  continueRow: { minHeight: 44, flexDirection: "row", gap: 8, alignItems: "center", justifyContent: "center" },
  continueText: { color: colors.brand, fontFamily: "DMSans_500Medium", fontSize: 13 },
});
