import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import type { AuthUser } from "@/src/types/domain";

const TOKEN_KEY = "wearify.auth.token";
const USER_KEY = "wearify.auth.user";
const options: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
};
let webCredentials: { token: string; user: AuthUser } | null = null;

export async function readCredentials(): Promise<{ token: string; user: AuthUser } | null> {
  if (Platform.OS === "web") return webCredentials;
  const [token, rawUser] = await Promise.all([
    SecureStore.getItemAsync(TOKEN_KEY, options),
    SecureStore.getItemAsync(USER_KEY, options),
  ]);
  if (!token || !rawUser) return null;
  try {
    const user: unknown = JSON.parse(rawUser);
    if (!user || typeof user !== "object" || !("customerId" in user) || typeof user.customerId !== "string" || !("phone" in user) || typeof user.phone !== "string" || !("name" in user) || typeof user.name !== "string" || !("role" in user) || user.role !== "customer") return null;
    return { token, user: user as AuthUser };
  } catch {
    return null;
  }
}

export async function writeCredentials(token: string, user: AuthUser): Promise<void> {
  if (Platform.OS === "web") {
    webCredentials = { token, user };
    return;
  }
  await Promise.all([
    SecureStore.setItemAsync(TOKEN_KEY, token, options),
    SecureStore.setItemAsync(USER_KEY, JSON.stringify(user), options),
  ]);
}

export async function clearCredentials(): Promise<void> {
  if (Platform.OS === "web") {
    webCredentials = null;
    return;
  }
  await Promise.all([
    SecureStore.deleteItemAsync(TOKEN_KEY, options),
    SecureStore.deleteItemAsync(USER_KEY, options),
  ]);
}
