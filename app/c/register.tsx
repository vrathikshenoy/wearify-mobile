import { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Image } from "expo-image";
import DateTimePicker, { type DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { useAction, useMutation } from "convex/react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowRight } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { api } from "@/src/convex/api";
import { Brand } from "@/src/components/ui";
import { NumericKeypad } from "@/src/components/numeric-keypad";
import { formatPhone, fullPhone, isAdultDob, isValidPhone } from "@/src/lib/phone";
import { useScreenProtection } from "@/src/lib/screen-protection";
import { useAuth } from "@/src/providers/auth";
import { colors } from "@/src/theme/tokens";

const emptyOtp = () => ["", "", "", "", "", ""];

export default function RegisterScreen() {
  useScreenProtection("customer-register");
  const params = useLocalSearchParams<{ phone?: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const auth = useAuth();
  const sendOtp = useAction(api.phoneAuth.sendOtp);
  const verifyOtp = useAction(api.phoneAuth.verifyOtp);
  const login = useMutation(api.phoneAuth.loginWithOtp);
  const completeProfile = useMutation(api.customers.completeProfile);
  const [step, setStep] = useState<"phone" | "otp" | "details">("phone");
  const [phone, setPhone] = useState(formatPhone(params.phone ?? ""));
  const [otpDigits, setOtpDigits] = useState<string[]>(emptyOtp);
  const [fullName, setFullName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [resendIn, setResendIn] = useState(0);
  const maxDob = useMemo(() => { const date = new Date(); date.setFullYear(date.getFullYear() - 13); return date; }, []);

  useEffect(() => {
    if (resendIn <= 0) return;
    const timer = setTimeout(() => setResendIn((value) => value - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendIn]);

  function pressPhoneDigit(digit: string) {
    if (phone.length >= 10) return;
    setPhone(formatPhone(phone + digit));
    setError("");
  }

  async function requestOtp() {
    if (!isValidPhone(phone)) return setError("Enter a valid 10-digit mobile number starting with 6–9");
    setLoading(true);
    setError("");
    const result = await sendOtp({ phone: fullPhone(phone) }).catch(() => ({ success: false, error: "Could not send code. Try again." }));
    setLoading(false);
    if (!result.success) return setError(result.error ?? "Could not send code. Try again.");
    setStep("otp");
    setOtpDigits(emptyOtp());
    setResendIn(30);
  }

  async function resendOtp() {
    if (resendIn > 0 || loading) return;
    setLoading(true);
    setError("");
    setOtpDigits(emptyOtp());
    const result = await sendOtp({ phone: fullPhone(phone) }).catch(() => ({ success: false, error: "Could not resend code. Try again." }));
    setLoading(false);
    if (!result.success) return setError(result.error ?? "Could not resend code. Try again.");
    setResendIn(30);
  }

  const submitOtp = useCallback(async (digits: string[]) => {
    const otp = digits.join("");
    if (otp.length !== 6 || loading) return;
    setLoading(true);
    setError("");
    try {
      const result = await verifyOtp({ phone: fullPhone(phone), otp });
      if (!result.success) {
        setError(result.error ?? "Invalid OTP");
        setOtpDigits(emptyOtp());
        return;
      }
      setStep("details");
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }, [loading, phone, verifyOtp]);

  function pressOtpDigit(digit: string) {
    const index = otpDigits.findIndex((value) => value === "");
    if (index < 0) return;
    const next = [...otpDigits];
    next[index] = digit;
    setOtpDigits(next);
    setError("");
    if (next.every(Boolean)) void submitOtp(next);
  }

  function deleteOtpDigit() {
    const index = otpDigits.findLastIndex(Boolean);
    if (index < 0) return;
    const next = [...otpDigits];
    next[index] = "";
    setOtpDigits(next);
    setError("");
  }

  async function finish() {
    const name = fullName.trim();
    if (name.length < 2) return setError("Enter your full name");
    if (!dateOfBirth) return setError("Select your date of birth");
    if (!isAdultDob(dateOfBirth)) return setError("Enter a valid date; you must be at least 13");
    setSaving(true);
    setError("");
    try {
      const result = await login({ phone: fullPhone(phone), otp: otpDigits.join(""), role: "customer", name, allowCreate: true });
      if (!result.success || !result.token || !result.customerId) return setError(result.error ?? "Could not create account. Try again.");
      await completeProfile({ token: result.token, customerId: result.customerId, name, dateOfBirth, gender: "", heightCm: 160, heightUnit: "cm", city: "" });
      await auth.signIn(result.token, { phone: fullPhone(phone), name, role: "customer", customerId: result.customerId });
      router.replace("/c/(tabs)");
    } catch {
      setError("Could not create account. Try again.");
    } finally {
      setSaving(false);
    }
  }

  function chooseDate(event: DateTimePickerEvent, date?: Date) {
    setShowDatePicker(Platform.OS === "ios");
    if (event.type !== "set" || !date) return;
    setDateOfBirth(toIsoDate(date));
    setError("");
  }

  return (
    <View className="flex-1 bg-white">
      <Image source={require("@/assets/customer/third-screen/background.svg")} style={[StyleSheet.absoluteFill, { opacity: 0.12 }]} contentFit="cover" contentPosition="top center" pointerEvents="none" accessibilityElementsHidden />
      <ScrollView contentContainerClassName="grow items-center justify-center px-5 py-4" keyboardShouldPersistTaps="handled">
        <View className="mb-[22px] items-center"><Brand width={168} /><Text className="mt-1.5 font-raleway-light text-xs leading-[21px] tracking-[-0.32px] text-cx-primary">Your AI - Powered Saree Experience</Text></View>
        <View className="w-full max-w-[360px] rounded-cx-xl bg-white px-[21px] pb-[22px] pt-5" style={cardShadow}>
          {step === "phone" ? <>
            <Text className="font-montserrat-medium text-[21px] leading-[21px] tracking-[-0.32px] text-black">Create Account</Text>
            <Text className="mt-[7px] font-montserrat text-sm leading-[21px] tracking-[-0.32px] text-[#6F6F6F]">Sign up with your mobile number</Text>
            <Text className="mb-2 mt-[22px] font-montserrat-semibold text-sm leading-[21px] tracking-[-0.32px] text-[#6F6F6F]">MOBILE NUMBER</Text>
            <View className="flex-row gap-2.5">
              <View className="h-[54px] w-[58px] items-center justify-center rounded-cx-sm border border-[#E2E2E2] bg-white"><Text className="font-montserrat-semibold text-base tracking-[-0.32px] text-black">+91</Text></View>
              <View className="h-[54px] flex-1 items-start justify-center rounded-cx-sm border border-[#E2E2E2] bg-white px-4"><Text className={`font-montserrat-semibold text-base tracking-[-0.32px] ${phone ? "text-black" : "text-[#6F6F6F]"}`}>{phone || "7895XXXX85"}</Text></View>
            </View>
            {error ? <Text accessibilityRole="alert" className="mt-3 text-center font-montserrat text-xs text-cx-error">{error}</Text> : null}
            <ActionButton label={loading ? "Sending…" : "Send OTP"} loading={loading} disabled={!isValidPhone(phone) || loading} onPress={() => void requestOtp()} />
            <BottomLink onPress={() => router.push("/c/login")} />
          </> : null}

          {step === "otp" ? <>
            <Text className="font-montserrat-medium text-[21px] leading-[21px] tracking-[-0.32px] text-black">Verify OTP</Text>
            <Text className="mt-[7px] font-montserrat text-sm leading-[21px] tracking-[-0.32px] text-[#6F6F6F]">Sent to +91-{phone}</Text>
            <Text className="mb-2 mt-[22px] font-montserrat-semibold text-sm leading-[21px] tracking-[-0.32px] text-[#6F6F6F]">ENTER OTP</Text>
            <View className="mb-1 flex-row gap-2">{otpDigits.map((digit, index) => {
              const active = index === otpDigits.findIndex((value) => value === "");
              return <View key={index} className={`h-[52px] flex-1 items-center justify-center rounded-cx-md border-[1.5px] bg-white ${(digit || active) ? "border-cx-primary" : "border-[#E2E2E2]"}`}><Text className="font-montserrat-semibold text-xl text-[#2A2522]">{digit}</Text></View>;
            })}</View>
            {error ? <Text accessibilityRole="alert" className="mt-3 text-center font-montserrat text-xs text-cx-error">{error}</Text> : null}
            <ActionButton label={loading ? "Verifying…" : "Verify OTP"} loading={loading} disabled={otpDigits.some((digit) => !digit) || loading} onPress={() => void submitOtp(otpDigits)} />
            <Pressable disabled={resendIn > 0 || loading} className="min-h-[44px] items-center justify-center" onPress={() => void resendOtp()}><Text className={`font-montserrat-medium text-sm tracking-[-0.32px] ${resendIn > 0 ? "text-[#6F6F6F]" : "text-cx-primary underline"}`}>{resendIn > 0 ? `Resend OTP in ${resendIn}s` : "Resend OTP"}</Text></Pressable>
          </> : null}

          {step === "details" ? <>
            <Text className="mb-[22px] text-center font-montserrat-medium text-[21px] leading-[21px] tracking-[-0.32px] text-black">Register</Text>
            <Text className="mb-2 font-montserrat-semibold text-sm tracking-[-0.32px] text-[#6F6F6F]">Full Name</Text>
            <TextInput value={fullName} onChangeText={(value) => { setFullName(value); setError(""); }} placeholder="e.g. Shalini Gupta" placeholderTextColor="#6F6F6F" autoCapitalize="words" className="mb-[18px] h-[54px] w-full rounded-cx-sm border border-[#E2E2E2] bg-white px-4 font-montserrat text-base tracking-[-0.32px] text-black" />
            <Text className="mb-2 font-montserrat-semibold text-sm tracking-[-0.32px] text-[#6F6F6F]">Date Of Birth</Text>
            {Platform.OS === "web" ? (
              <View className="mb-6 h-[54px] w-full flex-row items-center justify-between rounded-cx-sm border border-[#E2E2E2] bg-white px-4"><TextInput value={dateOfBirth} onChangeText={(value) => { setDateOfBirth(value); setError(""); }} placeholder="DD - MM - YYYY" placeholderTextColor="#6F6F6F" keyboardType="numbers-and-punctuation" maxLength={10} className="h-[52px] flex-1 p-0 font-montserrat text-base tracking-[-0.32px] text-black" /><Image source={require("@/assets/customer/register/calendar.svg")} style={{ width: 18, height: 18 }} contentFit="contain" /></View>
            ) : (
              <Pressable accessibilityRole="button" accessibilityLabel="Choose date of birth" className="mb-6 h-[54px] w-full flex-row items-center justify-between rounded-cx-sm border border-[#E2E2E2] bg-white px-4" onPress={() => setShowDatePicker(true)}><Text className={`font-montserrat text-base tracking-[-0.32px] ${dateOfBirth ? "text-black" : "text-[#6F6F6F]"}`}>{dateOfBirth ? displayDate(dateOfBirth) : "DD - MM - YYYY"}</Text><Image source={require("@/assets/customer/register/calendar.svg")} style={{ width: 18, height: 18 }} contentFit="contain" /></Pressable>
            )}
            {showDatePicker && Platform.OS !== "web" ? <DateTimePicker value={dateOfBirth ? new Date(`${dateOfBirth}T12:00:00`) : maxDob} maximumDate={maxDob} minimumDate={new Date(1900, 0, 1)} mode="date" display="default" onChange={chooseDate} /> : null}
            {error ? <Text accessibilityRole="alert" className="-mt-3 mb-3 text-center font-montserrat text-xs text-cx-error">{error}</Text> : null}
            <ActionButton label={saving ? "Creating account…" : "Register"} loading={saving} disabled={saving} onPress={() => void finish()} />
            <BottomLink onPress={() => router.push("/c/login")} />
          </> : null}
        </View>
      </ScrollView>

      {step === "phone" ? <NumericKeypad onDigit={pressPhoneDigit} onBackspace={() => { setPhone(phone.slice(0, -1)); setError(""); }} /> : null}
      {step === "otp" ? <NumericKeypad onDigit={pressOtpDigit} onBackspace={deleteOtpDigit} /> : null}
      {step === "details" ? <View className="bg-cx-primary px-4 pt-2" style={{ paddingBottom: insets.bottom + 8 }}><Text className="text-center font-montserrat text-[10px] leading-3 text-white">© copyright PHYGIFY TECHNOSERVICES PRIVATE LIMITED</Text></View> : null}
    </View>
  );
}

function ActionButton({ label, disabled, loading = false, onPress }: { label: string; disabled?: boolean; loading?: boolean; onPress: () => void }) {
  return <Pressable accessibilityRole="button" disabled={disabled} className={`mt-[18px] h-[52px] w-full flex-row items-center justify-center gap-[9px] rounded-full bg-cx-primary ${disabled ? "opacity-[0.55]" : ""}`} style={({ pressed }) => [buttonShadow, pressed && pressedStyle]} onPress={onPress}>{loading ? <ActivityIndicator color="#FFFFFF" /> : <><Text className="font-montserrat-semibold text-base text-white">{label}</Text><ArrowRight color="#FFFFFF" size={18} strokeWidth={2.4} /></>}</Pressable>;
}

function BottomLink({ onPress }: { onPress: () => void }) {
  return <View className="mt-4 flex-row items-center justify-center"><Text className="font-montserrat-medium text-sm text-[#6F6F6F]">Already have an account? </Text><Pressable hitSlop={8} onPress={onPress}><Text className="font-montserrat-medium text-sm text-cx-primary">Login</Text></Pressable></View>;
}

function toIsoDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function displayDate(value: string) {
  const [year, month, day] = value.split("-");
  return `${day} - ${month} - ${year}`;
}

const cardShadow = { shadowColor: colors.brand, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 5 } as const;
const buttonShadow = { shadowColor: colors.brand, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.26, shadowRadius: 8, elevation: 4 } as const;
const pressedStyle = { transform: [{ scale: 0.97 }] } as const;
