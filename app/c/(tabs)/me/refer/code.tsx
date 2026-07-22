import { Share, StyleSheet, Text, View } from "react-native";
import { AppHeader, PrimaryButton, Screen, SecondaryButton, Title } from "@/src/components/ui";
import { makeReferralCode } from "@/src/lib/referral";
import { useAuth } from "@/src/providers/auth";
import { colors, radius } from "@/src/theme/tokens";

export default function ReferralCodeScreen() { const { user } = useAuth(); if (!user) return null; const code = makeReferralCode(user.customerId); const link = `https://wearify-app.vercel.app/register?inviteCode=${code}`; const message = `Use my Wearify referral code ${code}: ${link}`; return <><AppHeader back title="Your referral" /><Screen><Title subtitle="Share this code with friends">Referral Code</Title><View style={styles.code}><Text selectable style={styles.value}>{code}</Text></View><PrimaryButton onPress={() => void Share.share({ message })}>Share code and link</PrimaryButton><View style={{ height: 12 }} /><SecondaryButton onPress={() => void Share.share({ message: link })}>Share registration link</SecondaryButton></Screen></>; }
const styles = StyleSheet.create({ code: { minHeight: 180, marginBottom: 24, borderRadius: radius.lg, backgroundColor: colors.brandSoft, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: colors.border }, value: { color: colors.brand, fontFamily: "DMMono_500Medium", fontSize: 34, letterSpacing: 5 } });
