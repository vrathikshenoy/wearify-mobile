import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useAction, useMutation } from "convex/react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { usePreventScreenCapture } from "expo-screen-capture";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "@/src/convex/api";
import { AppHeader, Field, PrimaryButton, Screen, Title } from "@/src/components/ui";
import { formatPhone, fullPhone, isAdultDob, isValidPhone } from "@/src/lib/phone";
import { useAuth } from "@/src/providers/auth";

const detailsSchema = z.object({
  name: z.string().trim().min(2, "Enter your full name"),
  dateOfBirth: z.string().refine(isAdultDob, "Enter a valid date; you must be at least 13"),
});
type Details = z.infer<typeof detailsSchema>;

export default function RegisterScreen() {
  usePreventScreenCapture("customer-register");
  const params = useLocalSearchParams<{ phone?: string }>();
  const router = useRouter();
  const auth = useAuth();
  const sendOtp = useAction(api.phoneAuth.sendOtp);
  const verifyOtp = useAction(api.phoneAuth.verifyOtp);
  const login = useMutation(api.phoneAuth.loginWithOtp);
  const completeProfile = useMutation(api.customers.completeProfile);
  const [step, setStep] = useState<"phone" | "otp" | "details">("phone");
  const [phone, setPhone] = useState(formatPhone(params.phone ?? ""));
  const [otp, setOtp] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const form = useForm<Details>({ resolver: zodResolver(detailsSchema), defaultValues: { name: "", dateOfBirth: "" } });

  async function next() {
    if (!isValidPhone(phone)) return setError("Enter a valid 10-digit Indian mobile number.");
    setBusy(true); setError("");
    const result = await sendOtp({ phone: fullPhone(phone) }).catch(() => ({ success: false, error: "Could not send code." }));
    setBusy(false);
    if (!result.success) return setError(result.error ?? "Could not send code.");
    setStep("otp");
  }

  async function confirmOtp() {
    if (!/^\d{6}$/.test(otp)) return setError("Enter the six-digit code.");
    setBusy(true); setError("");
    const result = await verifyOtp({ phone: fullPhone(phone), otp }).catch(() => ({ success: false, error: "Could not verify code." }));
    setBusy(false);
    if (!result.success) return setError(result.error ?? "Invalid code.");
    setStep("details");
  }

  const finish = form.handleSubmit(async ({ name, dateOfBirth }) => {
    setBusy(true); setError("");
    try {
      const result = await login({ phone: fullPhone(phone), otp, role: "customer", name, allowCreate: true });
      if (!result.success || !result.token || !result.customerId) return setError(result.error ?? "Could not create account.");
      await completeProfile({ token: result.token, customerId: result.customerId, name, dateOfBirth, gender: "", heightCm: 160, heightUnit: "cm", city: "" });
      await auth.signIn(result.token, { phone: fullPhone(phone), name, role: "customer", customerId: result.customerId });
      router.replace("/c/(tabs)");
    } catch {
      setError("Could not create account. Try again.");
    } finally { setBusy(false); }
  });

  return (
    <><AppHeader back /><Screen>
      <Title subtitle={step === "details" ? "You can complete the rest of your profile later." : "Secure sign-up with your phone."}>{step === "phone" ? "Create account" : step === "otp" ? "Verify your number" : "A little about you"}</Title>
      {step === "phone" ? <Field label="Mobile number" value={phone} onChangeText={(value) => setPhone(formatPhone(value))} keyboardType="phone-pad" maxLength={10} error={error} /> : null}
      {step === "otp" ? <Field label="Six-digit OTP" value={otp} onChangeText={(value) => setOtp(value.replace(/\D/g, "").slice(0, 6))} keyboardType="number-pad" maxLength={6} autoComplete="one-time-code" error={error} /> : null}
      {step === "details" ? <>
        <Controller control={form.control} name="name" render={({ field, fieldState }) => <Field label="Full name" value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} autoCapitalize="words" error={fieldState.error?.message} />} />
        <Controller control={form.control} name="dateOfBirth" render={({ field, fieldState }) => <Field label="Date of birth (YYYY-MM-DD)" value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} keyboardType="numbers-and-punctuation" maxLength={10} error={fieldState.error?.message} />} />
        {error ? <Text style={styles.error}>{error}</Text> : null}
      </> : null}
      <PrimaryButton disabled={busy} onPress={step === "phone" ? next : step === "otp" ? confirmOtp : finish}>{busy ? "Please wait…" : step === "phone" ? "Send code" : step === "otp" ? "Verify" : "Create my wardrobe"}</PrimaryButton>
      <View style={styles.legal}><Text style={styles.legalText}>By continuing, you agree to Wearify’s privacy and consent terms.</Text></View>
    </Screen></>
  );
}

const styles = StyleSheet.create({ error: { color: "#8B0000", marginBottom: 12 }, legal: { marginTop: 20 }, legalText: { textAlign: "center", color: "#6B5744", fontFamily: "DMSans_400Regular", fontSize: 12 } });
