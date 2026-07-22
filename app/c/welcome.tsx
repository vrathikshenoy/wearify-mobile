import { Pressable, Text, View, useWindowDimensions } from "react-native";
import { Image, ImageBackground } from "expo-image";
import { useRouter } from "expo-router";
import { ArrowRight, ChevronDown } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Brand } from "@/src/components/ui";
import { colors } from "@/src/theme/tokens";

export default function WelcomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const figureWidth = Math.min(width * 0.74, 300);

  return (
    <ImageBackground
      source={require("@/assets/customer/third-screen/background.svg")}
      style={{ flex: 1, backgroundColor: "#FFFFFF" }}
      contentFit="cover"
      contentPosition="center"
    >
      <View className="flex-row items-center justify-between px-[22px]" style={{ paddingTop: insets.top + 18 }}>
        <Brand width={124} />
        <Pressable accessibilityRole="button" accessibilityLabel="Language: English" className="min-h-[44px] flex-row items-center gap-[5px] rounded-full bg-cx-primary px-[15px]" style={({ pressed }) => [languageShadow, pressed && pressedStyle]}>
          <Text className="font-montserrat-medium text-xs tracking-[0.48px] text-white">Eng</Text>
          <ChevronDown color="#FFFFFF" size={15} strokeWidth={2.2} />
        </Pressable>
      </View>

      <View className="flex-1 items-center justify-center px-7">
        <Image
          source={require("@/assets/customer/third-screen/image.svg")}
          style={{ width: figureWidth, aspectRatio: 325 / 424, marginBottom: 30 }}
          contentFit="contain"
          accessibilityLabel="Saree virtual try-on preview"
        />
        <Text className="text-center font-montserrat-medium text-2xl leading-[29px] text-[#2A2522]">Find Your Perfect Look</Text>
        <Text className="mt-3 max-w-[311px] text-center font-montserrat text-base leading-5 text-[#222222]">“Explore bridal, festive, and designer sarees in real-time.”</Text>
      </View>

      <View>
        <View className="px-[22px]">
          <Pressable accessibilityRole="button" className="h-14 w-full flex-row items-center justify-center gap-2.5 rounded-[14px] bg-cx-primary" style={({ pressed }) => [ctaShadow, pressed && pressedStyle]} onPress={() => router.push("/c/register")}>
            <Text className="font-montserrat-medium text-base text-white">Let’s Get Started</Text>
            <ArrowRight color="#FFFFFF" size={19} strokeWidth={2.2} />
          </Pressable>
          <View className="mt-3.5 min-h-[44px] flex-row items-center justify-center">
            <Text className="font-montserrat text-sm leading-[17px] text-black">Already have an account? </Text>
            <Pressable accessibilityRole="button" hitSlop={10} onPress={() => router.push("/c/login")}>
              <Text className="font-montserrat text-sm leading-[17px] text-cx-primary underline">Login</Text>
            </Pressable>
          </View>
        </View>
        <View className="mt-4 bg-cx-primary px-4 pt-2" style={{ paddingBottom: insets.bottom + 8 }}>
          <Text className="text-center font-montserrat text-[10px] leading-3 text-white">© copyright PHYGIFY TECHNOSERVICES PRIVATE LIMITED</Text>
        </View>
      </View>
    </ImageBackground>
  );
}

const languageShadow = { shadowColor: colors.brand, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.22, shadowRadius: 8, elevation: 3 } as const;
const ctaShadow = { shadowColor: colors.brand, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.28, shadowRadius: 8, elevation: 5 } as const;
const pressedStyle = { transform: [{ scale: 0.97 }], opacity: 0.92 } as const;
