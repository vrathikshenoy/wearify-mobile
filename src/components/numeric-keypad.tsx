import { Pressable, Text, View } from "react-native";
import { Delete } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "@/src/theme/tokens";

const rows = [["1", "2", "3"], ["4", "5", "6"], ["7", "8", "9"], ["", "0", "del"]] as const;

export function NumericKeypad({ onDigit, onBackspace }: { onDigit: (digit: string) => void; onBackspace: () => void }) {
  const insets = useSafeAreaInsets();
  return (
    <View className="border-t border-[#68262A0F] bg-[#F5EFEE] px-2 pt-3" style={{ paddingBottom: insets.bottom + 12 }}>
      <View className="w-full max-w-[420px] self-center gap-2">
        {rows.map((row, rowIndex) => (
          <View key={rowIndex} className="h-[52px] flex-row gap-2">
            {row.map((key, columnIndex) => key === "" ? (
              <View key={`spacer-${columnIndex}`} pointerEvents="none" className="flex-1 bg-transparent" />
            ) : (
              <Pressable
                key={key}
                accessibilityRole="button"
                accessibilityLabel={key === "del" ? "Delete" : key}
                className={`flex-1 items-center justify-center rounded-cx-md ${key === "del" ? "bg-transparent" : "bg-white"}`}
                style={({ pressed }) => [key !== "del" && keyShadow, pressed && pressedStyle]}
                onPress={key === "del" ? onBackspace : () => onDigit(key)}
              >
                {key === "del" ? <Delete size={24} color={colors.brand} strokeWidth={2} /> : <Text className="font-montserrat-medium text-2xl text-[#2A2522]">{key}</Text>}
              </Pressable>
            ))}
          </View>
        ))}
      </View>
    </View>
  );
}

const keyShadow = { shadowColor: "#000000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 1 } as const;
const pressedStyle = { transform: [{ scale: 0.96 }], opacity: 0.9 } as const;
