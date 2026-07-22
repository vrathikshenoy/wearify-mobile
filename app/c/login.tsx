import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { ImageBackground } from "expo-image";
import { useAction, useMutation } from "convex/react";
import { useRouter } from "expo-router";
import { ArrowRight } from "lucide-react-native";
import { api } from "@/src/convex/api";
import { Brand } from "@/src/components/ui";
import { NumericKeypad } from "@/src/components/numeric-keypad";
import { formatPhone, fullPhone, isValidPhone } from "@/src/lib/phone";
import { useScreenProtection } from "@/src/lib/screen-protection";
import { useAuth } from "@/src/providers/auth";
import { useIsOnline } from "@/src/providers/connectivity";
import { colors } from "@/src/theme/tokens";

const emptyOtp = () => ["", "", "", "", "", ""];

export default function LoginScreen() {
  useScreenProtection("customer-login");
  const router = useRouter();
  const auth = useAuth();
  const online = useIsOnline();
  const sendOtp = useAction(api.phoneAuth.sendOtp);
  const verifyOtp = useAction(api.phoneAuth.verifyOtp);
  const login = useMutation(api.phoneAuth.loginWithOtp);
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [otpDigits, setOtpDigits] = useState<string[]>(emptyOtp);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [noAccount, setNoAccount] = useState(false);
  const [resendIn, setResendIn] = useState(0);
  const phoneValid = isValidPhone(phone);

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
    if (!online) return setError("Connect to the internet to sign in.");
    if (!phoneValid) return setError("Enter a valid 10-digit mobile number starting with 6-9");
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
    setNoAccount(false);
    try {
      const verified = await verifyOtp({ phone: fullPhone(phone), otp });
      if (!verified.success) {
        setError(verified.error ?? "Invalid OTP");
        setOtpDigits(emptyOtp());
        return;
      }
      const result = await login({ phone: fullPhone(phone), otp, role: "customer" });
      if (result.success && result.token && result.customerId) {
        await auth.signIn(result.token, { phone: fullPhone(phone), name: "", role: "customer", customerId: result.customerId });
        router.replace("/c/(tabs)");
      } else if (result.errorCode === "NO_ACCOUNT") {
        setNoAccount(true);
        setOtpDigits(emptyOtp());
      } else {
        setError(result.error ?? "Invalid OTP");
        setOtpDigits(emptyOtp());
      }
    } catch {
      setError("Something went wrong. Please try again.");
      setOtpDigits(emptyOtp());
    } finally {
      setLoading(false);
    }
  }, [auth, loading, login, phone, router, verifyOtp]);

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

  return (
    <ImageBackground source={require("@/assets/customer/third-screen/background.svg")} style={{ flex: 1, backgroundColor: "#FFFFFF" }} contentFit="cover" contentPosition="top center">
      <ScrollView contentContainerClassName="grow items-center justify-center px-5 py-4" keyboardShouldPersistTaps="handled">
        <View className="mb-[22px] items-center">
          <Brand width={168} />
          <Text className="mt-1.5 font-raleway-light text-xs leading-[21px] tracking-[-0.32px] text-cx-primary">Your AI - Powered Saree Experience</Text>
        </View>

        <View className="w-full max-w-[360px] rounded-cx-xl bg-white px-[21px] pb-[22px] pt-5" style={cardShadow}>
          {step === "phone" ? (
            <>
              <Text className="font-montserrat-medium text-[21px] leading-[21px] tracking-[-0.32px] text-black">Welcome Back</Text>
              <Text className="mt-[7px] font-montserrat text-sm leading-[21px] tracking-[-0.32px] text-[#6F6F6F]">Login with your mobile number</Text>
              <Text className="mb-2 mt-[22px] font-montserrat-semibold text-sm leading-[21px] tracking-[-0.32px] text-[#6F6F6F]">MOBILE NUMBER</Text>
              <View className="flex-row gap-2.5">
                <View className="h-[54px] w-[58px] items-center justify-center rounded-cx-sm border border-[#E2E2E2] bg-white"><Text className="font-montserrat-semibold text-base tracking-[-0.32px] text-black">+91</Text></View>
                <View className="h-[54px] flex-1 items-start justify-center rounded-cx-sm border border-[#E2E2E2] bg-white px-4"><Text className={`font-montserrat-semibold text-base tracking-[-0.32px] ${phone ? "text-black" : "text-[#6F6F6F]"}`}>{phone || "7895XXXX85"}</Text></View>
              </View>
              {error ? <Text accessibilityRole="alert" className="mt-3 text-center font-montserrat text-xs text-cx-error">{error}</Text> : null}
              <ActionButton label={loading ? "Sending…" : "Send OTP"} disabled={!phoneValid || loading} loading={loading} onPress={() => void requestOtp()} />
              <View className="mt-4 flex-row items-center justify-center"><Text className="font-montserrat-medium text-sm text-[#6F6F6F]">New user? </Text><Pressable hitSlop={8} onPress={() => router.push({ pathname: "/c/register", params: { phone } })}><Text className="font-montserrat-medium text-sm text-cx-primary">Register</Text></Pressable></View>
            </>
          ) : (
            <>
              <Text className="font-montserrat-medium text-[21px] leading-[21px] tracking-[-0.32px] text-black">Verify OTP</Text>
              <Text className="mt-[7px] font-montserrat text-sm leading-[21px] tracking-[-0.32px] text-[#6F6F6F]">Sent to +91-{phone}</Text>
              <Text className="mb-2 mt-[22px] font-montserrat-semibold text-sm leading-[21px] tracking-[-0.32px] text-[#6F6F6F]">ENTER OTP</Text>
              <View className="mb-1 flex-row gap-2">{otpDigits.map((digit, index) => {
                const active = index === otpDigits.findIndex((value) => value === "");
                return <View key={index} className={`h-[52px] flex-1 items-center justify-center rounded-cx-md border-[1.5px] bg-white ${(digit || active) ? "border-cx-primary" : "border-[#E2E2E2]"}`}><Text className="font-montserrat-semibold text-xl text-[#2A2522]">{digit}</Text></View>;
              })}</View>
              {error && !noAccount ? <Text accessibilityRole="alert" className="mt-3 text-center font-montserrat text-xs text-cx-error">{error}</Text> : null}
              {noAccount ? (
                <View className="mt-2.5 items-center rounded-[14px] border border-[#68262A2E] bg-[#F4B4AA29] p-3.5">
                  <Text className="font-montserrat-bold text-[13px] text-[#2A2522]">No account found</Text>
                  <Text className="mb-3 mt-1 text-center font-montserrat text-xs leading-[18px] text-[#5C4F4B]">We couldn’t find a Wearify account for +91 {phone}. Create one in under a minute.</Text>
                  <Pressable className="h-12 w-full items-center justify-center rounded-full bg-cx-primary" onPress={() => router.push({ pathname: "/c/register", params: { phone } })}><Text className="font-montserrat-bold text-sm text-white">Register as new user</Text></Pressable>
                  <Pressable hitSlop={8} onPress={() => { setNoAccount(false); setStep("phone"); setOtpDigits(emptyOtp()); }}><Text className="mt-2.5 font-montserrat-semibold text-xs text-cx-primary underline">Try a different number</Text></Pressable>
                </View>
              ) : loading ? (
                <View className="mt-3.5 items-center gap-1.5"><ActivityIndicator color={colors.brand} /><Text className="font-montserrat text-xs text-[#6F6F6F]">Verifying...</Text></View>
              ) : (
                <ActionButton label="Verify OTP" disabled={otpDigits.some((digit) => !digit)} onPress={() => void submitOtp(otpDigits)} />
              )}
              <Pressable accessibilityRole="button" disabled={resendIn > 0 || loading} hitSlop={8} className="min-h-[44px] items-center justify-center" onPress={() => void resendOtp()}>
                <Text className={`font-montserrat-medium text-sm tracking-[-0.32px] ${resendIn > 0 ? "text-[#6F6F6F]" : "text-cx-primary underline"}`}>{resendIn > 0 ? `Resend OTP in ${resendIn}s` : "Resend OTP"}</Text>
              </Pressable>
            </>
          )}
        </View>
      </ScrollView>
      <NumericKeypad onDigit={step === "phone" ? pressPhoneDigit : pressOtpDigit} onBackspace={step === "phone" ? () => { setPhone(phone.slice(0, -1)); setError(""); } : deleteOtpDigit} />
    </ImageBackground>
  );
}

function ActionButton({ label, disabled, loading = false, onPress }: { label: string; disabled?: boolean; loading?: boolean; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" disabled={disabled} className={`mt-[18px] h-[52px] w-full flex-row items-center justify-center gap-[9px] rounded-full bg-cx-primary ${disabled ? "opacity-[0.55]" : ""}`} style={({ pressed }) => [buttonShadow, pressed && pressedStyle]} onPress={onPress}>
      {loading ? <ActivityIndicator color="#FFFFFF" /> : <><Text className="font-montserrat-semibold text-base text-white">{label}</Text><ArrowRight color="#FFFFFF" size={18} strokeWidth={2.4} /></>}
    </Pressable>
  );
}

const cardShadow = { shadowColor: colors.brand, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 5 } as const;
const buttonShadow = { shadowColor: colors.brand, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.26, shadowRadius: 8, elevation: 4 } as const;
const pressedStyle = { transform: [{ scale: 0.97 }] } as const;
