import { useEffect, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useMutation, useQuery } from "convex/react";
import { Camera } from "lucide-react-native";
import { api } from "@/src/convex/api";
import { ConvexImage } from "@/src/components/media";
import { AppHeader, Field, Loading, PrimaryButton, Screen, Title } from "@/src/components/ui";
import { useAuth } from "@/src/providers/auth";
import { useIsOnline } from "@/src/providers/connectivity";
import { colors, radius } from "@/src/theme/tokens";
import type { FileId } from "@/src/types/domain";

const genders = [["female", "Female"], ["male", "Male"], ["other", "Other"], ["prefer_not_to_say", "Prefer not to say"]] as const;

export default function ProfileScreen() {
  const { token, user } = useAuth();
  const online = useIsOnline();
  const customer = useQuery(api.customers.getById, token && user ? { token, customerId: user.customerId } : "skip");
  const update = useMutation(api.customers.updateProfile);
  const uploadUrl = useMutation(api.files.generateUploadUrl);
  const [name, setName] = useState(""); const [dob, setDob] = useState(""); const [gender, setGender] = useState("");
  const [height, setHeight] = useState("160"); const [city, setCity] = useState(""); const [email, setEmail] = useState("");
  const [photo, setPhoto] = useState<FileId>(); const [busy, setBusy] = useState(false); const [error, setError] = useState("");

  useEffect(() => { if (!customer) return; setName(customer.name ?? ""); setDob(customer.dateOfBirth ?? ""); setGender(customer.gender ?? ""); setHeight(String(customer.heightCm ?? 160)); setCity(customer.city ?? ""); setEmail(customer.email ?? ""); setPhoto(customer.photoFileId); }, [customer]);

  async function pick(source: "camera" | "library") {
    if (!online) return setError("Reconnect to upload a photo.");
    const permission = source === "camera" ? await ImagePicker.requestCameraPermissionsAsync() : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return setError("Photo permission is required.");
    const result = source === "camera"
      ? await ImagePicker.launchCameraAsync({ mediaTypes: ["images"], allowsEditing: true, aspect: [1, 1], quality: 0.85 })
      : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], allowsEditing: true, aspect: [1, 1], quality: 0.85 });
    if (result.canceled) return;
    const asset = result.assets[0];
    if (!asset) return;
    const mime = asset.mimeType ?? "image/jpeg";
    if (!["image/jpeg", "image/png", "image/webp"].includes(mime)) return setError("Use a JPEG, PNG, or WebP image.");
    if ((asset.fileSize ?? 0) > 4 * 1024 * 1024) return setError("Photo must be under 4 MB.");
    setBusy(true); setError("");
    try {
      const destination = await uploadUrl({ token: token ?? undefined });
      const blob = await (await fetch(asset.uri)).blob();
      const response = await fetch(destination, { method: "POST", headers: { "Content-Type": mime }, body: blob });
      if (!response.ok) throw new Error("Upload failed");
      const payload: unknown = await response.json();
      if (!payload || typeof payload !== "object" || !("storageId" in payload) || typeof payload.storageId !== "string") throw new Error("Invalid upload response");
      setPhoto(payload.storageId as FileId);
    } catch { setError("Photo upload failed. Please try again."); } finally { setBusy(false); }
  }

  async function save() {
    const heightCm = Number(height); const cleanName = name.trim(); const cleanCity = city.trim();
    const birthday = /^\d{4}-\d{2}-\d{2}$/.test(dob) ? new Date(`${dob}T00:00:00`) : null;
    const age = birthday && !Number.isNaN(birthday.getTime()) ? new Date().getFullYear() - birthday.getFullYear() : 0;
    if (cleanName.length < 2) return setError("Enter your full name.");
    if (!birthday || age < 13 || age > 120) return setError("Enter a valid birth date as YYYY-MM-DD.");
    if (!gender) return setError("Select a gender.");
    if (!Number.isFinite(heightCm) || heightCm < 120 || heightCm > 220) return setError("Height must be between 120 and 220 cm.");
    if (!cleanCity) return setError("Enter your city.");
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return setError("Enter a valid email.");
    if (!online) return setError("Reconnect to save changes.");
    if (!token || !user) return;
    setBusy(true); setError("");
    try { await update({ token, customerId: user.customerId, name: cleanName, initials: cleanName.split(/\s+/).map((word) => word[0]).join("").toUpperCase().slice(0, 2), dateOfBirth: dob, gender, heightCm, heightUnit: "cm", city: cleanCity, email: email.trim() || undefined, photoFileId: photo }); Alert.alert("Saved", "Your profile has been updated."); }
    catch { setError("Couldn’t save your profile. Please try again."); } finally { setBusy(false); }
  }

  if (customer === undefined) return <><AppHeader back title="Edit profile" /><Loading /></>;
  return <><AppHeader back title="Edit profile" /><Screen><Title>Profile details</Title>
    <View style={styles.avatarWrap}><ConvexImage fileId={photo} label="Profile photo" style={styles.avatar} /><Pressable accessibilityRole="button" accessibilityLabel="Change profile photo" style={styles.camera} onPress={() => Alert.alert("Profile photo", undefined, [{ text: "Take photo", onPress: () => void pick("camera") }, { text: "Choose from library", onPress: () => void pick("library") }, { text: "Cancel", style: "cancel" }])}><Camera color="#FFFFFF" size={18} /></Pressable></View>
    <Field label="Full name" value={name} onChangeText={setName} autoCapitalize="words" />
    <Field label="Phone number" value={user?.phone ?? ""} editable={false} />
    <Field label="Date of birth (YYYY-MM-DD)" value={dob} onChangeText={setDob} keyboardType="numbers-and-punctuation" maxLength={10} />
    <Text style={styles.label}>Gender</Text><View style={styles.chips}>{genders.map(([value, label]) => <Pressable key={value} accessibilityRole="radio" accessibilityState={{ checked: gender === value }} onPress={() => setGender(value)} style={[styles.chip, gender === value && styles.chipOn]}><Text style={[styles.chipText, gender === value && styles.chipTextOn]}>{label}</Text></Pressable>)}</View>
    <Field label="Height (cm)" value={height} onChangeText={setHeight} keyboardType="number-pad" maxLength={3} />
    <Field label="City" value={city} onChangeText={setCity} autoCapitalize="words" />
    <Field label="Email (optional)" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
    {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}<PrimaryButton disabled={busy} onPress={() => void save()}>{busy ? "Saving…" : "Save changes"}</PrimaryButton>
  </Screen></>;
}

const styles = StyleSheet.create({ avatarWrap: { alignSelf: "center", marginBottom: 24 }, avatar: { width: 104, height: 104, borderRadius: 52 }, camera: { position: "absolute", right: -2, bottom: -2, width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center", backgroundColor: colors.brand, borderWidth: 3, borderColor: colors.canvas }, label: { color: colors.inkMid, fontFamily: "DMSans_600SemiBold", fontSize: 13, marginBottom: 8 }, chips: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 18 }, chip: { minHeight: 44, paddingHorizontal: 14, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border, alignItems: "center", justifyContent: "center" }, chipOn: { backgroundColor: colors.brand, borderColor: colors.brand }, chipText: { color: colors.ink, fontFamily: "DMSans_600SemiBold", fontSize: 13 }, chipTextOn: { color: "#FFFFFF" }, error: { color: colors.error, fontFamily: "DMSans_400Regular", marginBottom: 14 } });
