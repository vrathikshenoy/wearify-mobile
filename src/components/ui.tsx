import type { PropsWithChildren, ReactNode } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type PressableProps,
  type ScrollViewProps,
  type TextInputProps,
} from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { ArrowLeft, Bell } from "lucide-react-native";
import { colors, radius, spacing } from "@/src/theme/tokens";

export function AppFrame({ children }: PropsWithChildren) {
  return <View className="flex-1 items-center bg-[#F3ECE0]"><View className="w-full max-w-[720px] flex-1 bg-canvas">{children}</View></View>;
}

export function Screen({ children, contentContainerStyle, ...props }: PropsWithChildren<ScrollViewProps>) {
  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[styles.screen, contentContainerStyle]}
        {...props}
      >
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

export function Brand({ light = false, size = 28 }: { light?: boolean; size?: number }) {
  return <Text accessibilityRole="header" style={[styles.brand, { color: light ? "#F2E4DA" : colors.brand, fontSize: size }]}>WEARIFY</Text>;
}

export function AppHeader({ title, back = false, right }: { title?: string; back?: boolean; right?: ReactNode }) {
  const router = useRouter();
  return (
    <View style={styles.header}>
      <View style={styles.headerSide}>
        {back ? (
          <Pressable accessibilityRole="button" accessibilityLabel="Back" hitSlop={12} onPress={() => router.back()}>
            <ArrowLeft color={colors.ink} size={22} />
          </Pressable>
        ) : null}
      </View>
      {title ? <Text style={styles.headerTitle}>{title}</Text> : <Brand size={23} />}
      <View style={[styles.headerSide, styles.headerRight]}>
        {right ?? <Pressable accessibilityRole="button" accessibilityLabel="Notifications unavailable" hitSlop={12}><Bell color={colors.ink} size={20} /></Pressable>}
      </View>
    </View>
  );
}

export function Title({ children, subtitle }: PropsWithChildren<{ subtitle?: string }>) {
  return (
    <View style={styles.titleBlock}>
      <Text style={styles.title}>{children}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

export function PrimaryButton({ children, disabled, style, ...props }: PropsWithChildren<PressableProps>) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      style={({ pressed }) => [styles.primaryButton, disabled && styles.disabled, pressed && !disabled && styles.pressed, typeof style === "function" ? style({ pressed }) : style]}
      {...props}
    >
      <Text style={styles.primaryButtonText}>{children}</Text>
    </Pressable>
  );
}

export function SecondaryButton({ children, style, ...props }: PropsWithChildren<PressableProps>) {
  return (
    <Pressable accessibilityRole="button" style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed, typeof style === "function" ? style({ pressed }) : style]} {...props}>
      <Text style={styles.secondaryButtonText}>{children}</Text>
    </Pressable>
  );
}

export function Field({ label, error, ...props }: TextInputProps & { label: string; error?: string }) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        placeholderTextColor={colors.ghost}
        style={[styles.field, Boolean(error) && styles.fieldError, props.multiline && styles.multiline]}
        accessibilityLabel={label}
        {...props}
      />
      {error ? <Text accessibilityRole="alert" style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

export function Loading({ label = "Loading…" }: { label?: string }) {
  return <View style={styles.center}><ActivityIndicator color={colors.brand} /><Text style={styles.helper}>{label}</Text></View>;
}

export function EmptyState({ title, detail }: { title: string; detail?: string }) {
  return <View style={styles.empty}><Text style={styles.emptyTitle}>{title}</Text>{detail ? <Text style={styles.helper}>{detail}</Text> : null}</View>;
}

export function RemoteImage({ uri, style, accessibilityLabel }: { uri?: string | null; style?: object; accessibilityLabel: string }) {
  if (!uri) return <View style={[styles.imageFallback, style]}><Brand size={15} /></View>;
  return <Image source={{ uri }} style={style} contentFit="cover" transition={180} accessibilityLabel={accessibilityLabel} />;
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  screen: { paddingHorizontal: 16, paddingBottom: 112, flexGrow: 1 },
  brand: { fontFamily: "CormorantGaramond_700Bold", letterSpacing: 1.8 },
  header: { height: 64, paddingHorizontal: 16, flexDirection: "row", alignItems: "center", borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border, backgroundColor: colors.canvas },
  headerSide: { width: 44, alignItems: "flex-start" },
  headerRight: { alignItems: "flex-end" },
  headerTitle: { flex: 1, textAlign: "center", color: colors.ink, fontFamily: "Montserrat_600SemiBold", fontSize: 16 },
  titleBlock: { marginTop: 24, marginBottom: 20 },
  title: { fontFamily: "CormorantGaramond_700Bold", color: colors.ink, fontSize: 32, lineHeight: 37 },
  subtitle: { marginTop: 4, fontFamily: "DMSans_400Regular", color: colors.muted, fontSize: 14, lineHeight: 20 },
  primaryButton: { minHeight: 52, borderRadius: radius.pill, backgroundColor: colors.brand, alignItems: "center", justifyContent: "center", paddingHorizontal: 22 },
  primaryButtonText: { color: "#FFFFFF", fontFamily: "Montserrat_600SemiBold", fontSize: 15 },
  secondaryButton: { minHeight: 50, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.brand, alignItems: "center", justifyContent: "center", paddingHorizontal: 22 },
  secondaryButtonText: { color: colors.brand, fontFamily: "Montserrat_600SemiBold", fontSize: 15 },
  pressed: { transform: [{ scale: 0.98 }], opacity: 0.92 },
  disabled: { opacity: 0.5 },
  fieldWrap: { gap: 6, marginBottom: 16 },
  label: { fontFamily: "DMSans_600SemiBold", color: colors.inkMid, fontSize: 13 },
  field: { minHeight: 52, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, backgroundColor: colors.surface, paddingHorizontal: 14, color: colors.ink, fontFamily: "DMSans_400Regular", fontSize: 16 },
  multiline: { minHeight: 110, paddingTop: 14, textAlignVertical: "top" },
  fieldError: { borderColor: colors.error },
  errorText: { color: colors.error, fontFamily: "DMSans_400Regular", fontSize: 12 },
  center: { flex: 1, minHeight: 180, alignItems: "center", justifyContent: "center", gap: 10 },
  empty: { minHeight: 180, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, backgroundColor: colors.surface, alignItems: "center", justifyContent: "center", padding: spacing.lg },
  emptyTitle: { fontFamily: "Montserrat_600SemiBold", color: colors.ink, fontSize: 16, textAlign: "center" },
  helper: { fontFamily: "DMSans_400Regular", color: colors.muted, fontSize: 13, textAlign: "center" },
  imageFallback: { alignItems: "center", justifyContent: "center", backgroundColor: colors.brandSoft },
});

export const uiStyles = styles;
