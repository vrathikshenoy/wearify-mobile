import type { PropsWithChildren, ReactNode } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
  type PressableProps,
  type ScrollViewProps,
  type TextInputProps,
} from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Bell } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "@/src/theme/tokens";

export function AppFrame({ children }: PropsWithChildren) {
  return (
    <View className="flex-1 items-center bg-cx-bg-deep sm:px-4 sm:py-6">
      <View className="w-full max-w-[720px] flex-1 overflow-hidden bg-cx-bg sm:rounded-cx-xl">
        {children}
      </View>
    </View>
  );
}

export function Screen({ children, contentContainerStyle, ...props }: PropsWithChildren<ScrollViewProps>) {
  return (
    <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerClassName="grow px-4 pb-28"
        contentContainerStyle={contentContainerStyle}
        {...props}
      >
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

export function Brand({ light = false, size = 23, width }: { light?: boolean; size?: number; width?: number }) {
  const imageWidth = width ?? size * 5;
  return (
    <Image
      source={require("@/assets/brand/wearify-logo.svg")}
      style={{ width: imageWidth, aspectRatio: 395.69 / 63.6 }}
      contentFit="contain"
      tintColor={light ? "#F2E4DA" : colors.brand}
      accessibilityLabel="Wearify"
    />
  );
}

export function AppHeader({ title, back = false, right, onBack }: { title?: string; back?: boolean; right?: ReactNode; onBack?: () => void }) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  return (
    <View
      accessibilityLabel={title}
      className="relative flex-row items-center justify-between border-b border-[#D9D9D9] bg-cx-surface px-4"
      style={{ height: insets.top + 59, paddingTop: insets.top + 14 }}
    >
      <View className="w-11 items-start">
        {back ? (
          <Pressable accessibilityRole="button" accessibilityLabel="Back" hitSlop={12} onPress={onBack ?? (() => router.back())}>
            <Image source={require("@/assets/customer/back-navigation.svg")} style={{ width: 22, height: 18 }} contentFit="contain" tintColor="#222222" />
          </Pressable>
        ) : null}
      </View>
      <View pointerEvents="none" className="absolute inset-x-0 bottom-0 h-[45px] items-center justify-center">
        {title ? <Text className="font-dm-bold text-base text-[#2A2522]">{title}</Text> : <Brand width={116} />}
      </View>
      <View className="w-11 items-end">
        {right ?? (title ? null : (
          <Pressable accessibilityRole="button" accessibilityLabel="Notifications" hitSlop={12} className="relative">
            <Bell color="#222222" strokeWidth={1.5} size={19} />
            <View className="absolute right-0 top-0 size-[5px] rounded-full bg-cx-primary" />
          </Pressable>
        ))}
      </View>
    </View>
  );
}

export function Title({ children, subtitle }: PropsWithChildren<{ subtitle?: string }>) {
  return (
    <View className="mb-5 mt-6">
      <Text className="font-display-bold text-[32px] leading-[37px] text-cx-ink">{children}</Text>
      {subtitle ? <Text className="mt-1 font-dm text-sm leading-5 text-cx-ink-soft">{subtitle}</Text> : null}
    </View>
  );
}

export function PrimaryButton({ children, disabled, style, ...props }: PropsWithChildren<PressableProps>) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      className="min-h-[52px] items-center justify-center rounded-full bg-cx-primary px-[22px] disabled:opacity-50"
      style={(state) => [state.pressed && !disabled && pressedStyle, typeof style === "function" ? style(state) : style]}
      {...props}
    >
      <Text className="font-montserrat-semibold text-[15px] text-white">{children}</Text>
    </Pressable>
  );
}

export function SecondaryButton({ children, style, ...props }: PropsWithChildren<PressableProps>) {
  return (
    <Pressable
      accessibilityRole="button"
      className="min-h-[50px] items-center justify-center rounded-full border border-cx-primary px-[22px]"
      style={(state) => [state.pressed && pressedStyle, typeof style === "function" ? style(state) : style]}
      {...props}
    >
      <Text className="font-montserrat-semibold text-[15px] text-cx-primary">{children}</Text>
    </Pressable>
  );
}

export function Field({ label, error, multiline, style, ...props }: TextInputProps & { label: string; error?: string }) {
  return (
    <View className="mb-4 gap-1.5">
      <Text className="font-dm-semibold text-[13px] text-cx-ink-mid">{label}</Text>
      <TextInput
        placeholderTextColor="#77685D"
        className={`min-h-[52px] rounded-cx-md border bg-cx-surface px-3.5 font-dm text-base text-cx-ink ${error ? "border-cx-error" : "border-cx-border"} ${multiline ? "min-h-[110px] pt-3.5" : ""}`}
        style={[multiline && { textAlignVertical: "top" }, style]}
        accessibilityLabel={label}
        multiline={multiline}
        {...props}
      />
      {error ? <Text accessibilityRole="alert" className="font-dm text-xs text-cx-error">{error}</Text> : null}
    </View>
  );
}

export function Loading({ label = "Loading…" }: { label?: string }) {
  return (
    <View className="min-h-[180px] flex-1 items-center justify-center gap-2.5">
      <ActivityIndicator color={colors.brand} />
      <Text className="font-dm text-[13px] text-cx-ink-soft">{label}</Text>
    </View>
  );
}

export function EmptyState({ title, detail }: { title: string; detail?: string }) {
  return (
    <View className="min-h-[180px] items-center justify-center rounded-cx-lg border border-cx-border bg-cx-surface p-6">
      <Text className="text-center font-montserrat-semibold text-base text-cx-ink">{title}</Text>
      {detail ? <Text className="mt-2 text-center font-dm text-[13px] text-cx-ink-soft">{detail}</Text> : null}
    </View>
  );
}

export function RemoteImage({ uri, style, accessibilityLabel }: { uri?: string | null; style?: object; accessibilityLabel: string }) {
  if (!uri) return <View className="items-center justify-center bg-cx-primary-ghost" style={style}><Brand size={15} /></View>;
  return <Image source={{ uri }} style={style} contentFit="cover" transition={180} accessibilityLabel={accessibilityLabel} />;
}

const pressedStyle = { transform: [{ scale: 0.98 }], opacity: 0.92 } as const;
