import { useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { useAction, useMutation } from "convex/react";
import { useRouter } from "expo-router";
import { usePreventScreenCapture } from "expo-screen-capture";
import { api } from "@/src/convex/api";
import { AppHeader, Field, PrimaryButton, Screen, Title } from "@/src/components/ui";
import { formatPhone, fullPhone, isValidPhone } from "@/src/lib/phone";
import { useAuth } from "@/src/providers/auth";
import { useIsOnline } from "@/src/providers/connectivity";
import { colors } from "@/src/theme/tokens";

export default function LoginScreen() {
  usePreventScreenCapture("customer-login");
  const router = useRouter();
  const auth = useAuth();
  const online = useIsOnline();
  const sendOtp = useAction(api.phoneAuth.sendOtp);
  const verifyOtp = useAction(api.phoneAuth.verifyOtp);
  const login = useMutation(api.phoneAuth.loginWithOtp);
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function requestOtp() {
    if (!online) return setError("Connect to the internet to sign in.");
    if (!isValidPhone(phone)) return setError("Enter a valid 10-digit Indian mobile number.");
    setBusy(true); setError("");
    const result = await sendOtp({ phone: fullPhone(phone) }).catch(() => ({ success: false, error: "Could not send code. Try again." }));
    setBusy(false);
    if (!result.success) return setError(result.error ?? "Could not send code.");
    setStep("otp");
  }

  async function submitOtp() {
    if (!/^\d{6}$/.test(otp)) return setError("Enter the six-digit code.");
    setBusy(true); setError("");
    try {
      const verified = await verifyOtp({ phone: fullPhone(phone), otp });
      if (!verified.success) return setError(verified.error ?? "Invalid code.");
      const result = await login({ phone: fullPhone(phone), otp, role: "customer" });
      if (result.errorCode === "NO_ACCOUNT") {
        router.replace({ pathname: "/c/register", params: { phone: formatPhone(phone) } });
        return;
      }
      if (!result.success || !result.token || !result.customerId) return setError(result.error ?? "Could not sign in.");
      await auth.signIn(result.token, { phone: fullPhone(phone), name: "", role: "customer", customerId: result.customerId });
      router.replace("/c/(tabs)");
    } catch {
      setError("Could not sign in. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <><AppHeader back /><Screen>
      <Title subtitle={step === "phone" ? "We’ll send a secure one-time code." : `Sent to +91 ${formatPhone(phone)}`}>{step === "phone" ? "Welcome back" : "Enter your code"}</Title>
      {step === "phone" ? (
        <Field label="Mobile number" value={phone} onChangeText={(value) => setPhone(formatPhone(value))} keyboardType="phone-pad" maxLength={10} autoComplete="tel" error={error} />
      ) : (
        <Field label="Six-digit OTP" value={otp} onChangeText={(value) => setOtp(value.replace(/\D/g, "").slice(0, 6))} keyboardType="number-pad" maxLength={6} autoComplete="one-time-code" error={error} />
      )}
      <PrimaryButton disabled={busy} onPress={step === "phone" ? requestOtp : submitOtp}>{busy ? "Please wait…" : step === "phone" ? "Send code" : "Sign in"}</PrimaryButton>
      {step === "otp" ? <Pressable style={styles.link} onPress={() => { setStep("phone"); setOtp(""); setError(""); }}><Text style={styles.linkText}>Use a different number</Text></Pressable> : null}
      <View style={styles.footer}><Text style={styles.muted}>New to Wearify?</Text><Pressable onPress={() => router.push({ pathname: "/c/register", params: { phone } })}><Text style={styles.linkText}> Create account</Text></Pressable></View>
    </Screen></>
  );
}

const styles = StyleSheet.create({
  link: { minHeight: 44, alignItems: "center", justifyContent: "center", marginTop: 8 },
  linkText: { color: colors.brand, fontFamily: "DMSans_600SemiBold", fontSize: 14 },
  footer: { flexDirection: "row", justifyContent: "center", marginTop: 24 },
  muted: { color: colors.muted, fontFamily: "DMSans_400Regular", fontSize: 14 },
});
