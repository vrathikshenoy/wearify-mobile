import { useState, type ReactNode } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Slider from "@expo/ui/community/slider";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const MAROON = "#68262A";
export const MAX_BUDGET = 10_000;
export type CatalogFilters = { dates: Set<string>; occasions: Set<string>; fabrics: Set<string>; colors: Set<string>; budget: number };
export const EMPTY_FILTERS: CatalogFilters = { dates: new Set(), occasions: new Set(), fabrics: new Set(), colors: new Set(), budget: MAX_BUDGET };

const OCCASIONS = ["Wedding", "Festival", "Party", "Office", "Daily", "Gift"];
const FABRICS = ["Pure Silk", "Georgette", "Cotton", "Linen", "Chanderi", "Banarasi", "Organza", "Kanjivaram"];
export const FILTER_COLORS = [
  { name: "Crimson", hex: "#DC143C" }, { name: "Pink", hex: "#FFC0CB" }, { name: "Gold", hex: "#FFD700" },
  { name: "Blue", hex: "#0000FF" }, { name: "Black", hex: "#000000" }, { name: "White", hex: "#FFFFFF" },
] as const;

export function CatalogFilterSheet({ visible, initial, onApply, onClose, dates = [] }: {
  visible: boolean;
  initial: CatalogFilters;
  onApply: (filters: CatalogFilters) => void;
  onClose: () => void;
  dates?: string[];
}) {
  return <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}><FilterContent key={visible ? "open" : "closed"} initial={initial} dates={dates} onApply={onApply} onClose={onClose} /></Modal>;
}

function FilterContent({ initial, dates, onApply, onClose }: { initial: CatalogFilters; dates: string[]; onApply: (filters: CatalogFilters) => void; onClose: () => void }) {
  const insets = useSafeAreaInsets();
  const [occasions, setOccasions] = useState(() => new Set(initial.occasions));
  const [fabrics, setFabrics] = useState(() => new Set(initial.fabrics));
  const [colors, setColors] = useState(() => new Set(initial.colors));
  const [budget, setBudget] = useState(initial.budget);
  const [selectedDates, setSelectedDates] = useState(() => new Set(initial.dates));
  const toggle = (current: Set<string>, value: string, update: (next: Set<string>) => void) => {
    const next = new Set(current);
    if (next.has(value)) next.delete(value); else next.add(value);
    update(next);
  };
  const reset = () => onApply(EMPTY_FILTERS);

  return (
    <View style={styles.modal}>
      <Pressable accessibilityLabel="Close filters" style={StyleSheet.absoluteFill} onPress={onClose} />
      <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <View style={styles.handle} />
        <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
          <Text style={styles.filterBy}>Filter by:</Text>
          {dates.length ? <FilterGroup title="Dates" onReset={() => setSelectedDates(new Set())}>{dates.map((date) => <FilterPill key={date} label={date} active={selectedDates.has(date)} onPress={() => toggle(selectedDates, date, setSelectedDates)} />)}</FilterGroup> : null}
          <FilterGroup title="Occasions" onReset={() => setOccasions(new Set())}>{OCCASIONS.map((occasion) => <FilterPill key={occasion} label={occasion} active={occasions.has(occasion)} onPress={() => toggle(occasions, occasion, setOccasions)} />)}</FilterGroup>
          <FilterGroup title="Fabrics" onReset={() => setFabrics(new Set())}>{FABRICS.map((fabric) => <FilterPill key={fabric} label={fabric} active={fabrics.has(fabric)} onPress={() => toggle(fabrics, fabric, setFabrics)} />)}</FilterGroup>
          <View style={styles.group}>
            <SectionRow title="Colors" onReset={() => setColors(new Set())} />
            <View style={styles.wrap}>{FILTER_COLORS.map((color) => <Pressable key={color.hex} accessibilityRole="checkbox" accessibilityLabel={color.name} accessibilityState={{ checked: colors.has(color.hex) }} style={[styles.color, { backgroundColor: color.hex }, color.hex === "#FFFFFF" && styles.whiteColor, colors.has(color.hex) && styles.colorActive]} onPress={() => toggle(colors, color.hex, setColors)} />)}</View>
          </View>
          <View style={styles.budget}>
            <Text style={styles.groupTitle}>Budget Range</Text>
            <Text style={styles.budgetValue}>₹{Math.round(budget).toLocaleString("en-IN")}</Text>
            <Slider value={budget} minimumValue={0} maximumValue={MAX_BUDGET} step={100} minimumTrackTintColor={MAROON} onValueChange={setBudget} />
            <View style={styles.range}><Text style={styles.rangeText}>₹0</Text><Text style={styles.rangeText}>₹10,000</Text></View>
          </View>
        </ScrollView>
        <View style={styles.footer}>
          <Pressable accessibilityRole="button" style={styles.resetButton} onPress={reset}><Text style={styles.resetText}>Reset</Text></Pressable>
          <Pressable accessibilityRole="button" style={styles.applyButton} onPress={() => onApply({ dates: selectedDates, occasions, fabrics, colors, budget })}><Text style={styles.applyText}>Apply</Text></Pressable>
        </View>
      </View>
    </View>
  );
}

function FilterGroup({ title, onReset, children }: { title: string; onReset: () => void; children: ReactNode }) {
  return <View style={styles.group}><SectionRow title={title} onReset={onReset} /><View style={styles.wrap}>{children}</View></View>;
}

function SectionRow({ title, onReset }: { title: string; onReset: () => void }) {
  return <View style={styles.sectionRow}><Text style={styles.groupTitle}>{title}</Text><Pressable onPress={onReset}><Text style={styles.resetLink}>Reset</Text></Pressable></View>;
}

function FilterPill({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: active }} style={[styles.pill, active && styles.pillActive]} onPress={onPress}><Text style={[styles.pillText, active && styles.pillTextActive]}>{label}</Text></Pressable>;
}

const styles = StyleSheet.create({
  modal: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.45)" },
  sheet: { maxHeight: "88%", borderTopLeftRadius: 16, borderTopRightRadius: 16, backgroundColor: "#FFFFFF" },
  handle: { alignSelf: "center", width: 30, height: 4, marginTop: 12, borderRadius: 2, backgroundColor: "#878787" },
  body: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
  filterBy: { marginBottom: -8, fontFamily: "Montserrat_500Medium", fontSize: 12, color: "#878787" },
  group: { marginTop: 26 },
  sectionRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  groupTitle: { fontFamily: "Montserrat_600SemiBold", fontSize: 16, letterSpacing: -0.23, color: "#000000" },
  resetLink: { fontFamily: "Montserrat_600SemiBold", fontSize: 16, letterSpacing: -0.23, color: MAROON },
  wrap: { marginTop: 14, flexDirection: "row", flexWrap: "wrap", gap: 8 },
  pill: { height: 34, paddingHorizontal: 14, borderRadius: 17, borderWidth: 1, borderColor: "#9F9F9F", alignItems: "center", justifyContent: "center", backgroundColor: "#FFFFFF" },
  pillActive: { borderColor: MAROON, backgroundColor: MAROON, elevation: 2 },
  pillText: { fontFamily: "Montserrat_400Regular", fontSize: 12, letterSpacing: -0.23, color: "#000000" },
  pillTextActive: { fontFamily: "Montserrat_500Medium", color: "#FFFFFF" },
  color: { width: 34, height: 34, borderRadius: 17 },
  whiteColor: { borderWidth: 1, borderColor: "#9F9F9F" },
  colorActive: { borderWidth: 4, borderColor: MAROON },
  budget: { marginTop: 28 },
  budgetValue: { marginTop: 14, fontFamily: "Montserrat_500Medium", fontSize: 16, color: "#000000" },
  range: { marginTop: 6, flexDirection: "row", justifyContent: "space-between" },
  rangeText: { fontFamily: "Montserrat_500Medium", fontSize: 16, color: MAROON },
  footer: { flexDirection: "row", gap: 16, paddingHorizontal: 16, paddingTop: 12 },
  resetButton: { flex: 1, height: 52, borderRadius: 8, borderWidth: 1, borderColor: MAROON, backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center" },
  applyButton: { flex: 1, height: 52, borderRadius: 8, backgroundColor: MAROON, alignItems: "center", justifyContent: "center" },
  resetText: { fontFamily: "Montserrat_600SemiBold", fontSize: 14, color: MAROON },
  applyText: { fontFamily: "Montserrat_600SemiBold", fontSize: 14, color: "#FFFFFF" },
});
