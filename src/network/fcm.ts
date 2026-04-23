import {
  registerDeviceForRemoteMessages,
  getToken,
  requestPermission,
  AuthorizationStatus,
  onTokenRefresh,
  getMessaging,
} from "@react-native-firebase/messaging";
import { Platform } from "react-native";
import { supabase } from "./supabase";
import { TABLES } from "./contants";

const messaging = getMessaging();

const TABLE = "users";

export async function requestNotificationPermission(): Promise<boolean> {
  const status = await requestPermission(messaging);
  return (
    status === AuthorizationStatus.AUTHORIZED ||
    status === AuthorizationStatus.PROVISIONAL
  );
}

export async function getFcmToken(): Promise<string | null> {
  try {
    // if (Platform.OS === "ios") {
    //   await registerDeviceForRemoteMessages(messaging);
    // }
    return await getToken(messaging);
  } catch (e) {
    console.log("getFcmToken error", e);
    return null;
  }
}

export async function registerDeviceToken(
  userId: string,
): Promise<string | null> {
  const granted = await requestNotificationPermission();
  if (!granted) return null;

  const token = await getFcmToken();
  if (!token) return null;
  console.log(userId);
  const { data: row } = await supabase
    .from(TABLE)
    .select("fcm_tokens")
    .eq("id", userId)
    .maybeSingle();

  const existing: string[] = row?.fcm_tokens ?? [];
  const next = Array.from(new Set([...existing, token]));

  const { error } = await supabase
    .from(TABLES.users)
    .update({
      id: userId,
      fcm_tokens: next,
    })
    .eq("id", userId);

  if (error) {
    console.log("registerDeviceToken upsert error", error.message);
    return null;
  }
  return token;
}

export async function unregisterDeviceToken(
  userId: string,
  token: string | null,
) {
  if (!token) return;
  const { data: row } = await supabase
    .from(TABLE)
    .select("fcm_tokens")
    .eq("id", userId)
    .maybeSingle();

  const existing: string[] = row?.fcm_tokens ?? [];
  const next = existing.filter((t) => t !== token);

  await supabase
    .from(TABLE)
    .update({
      fcm_tokens: next,
      //  updated_at: new Date().toISOString()
    })
    .eq("id", userId);
}

export function subscribeToTokenRefresh(userId: string) {
  return onTokenRefresh(messaging, async (newToken) => {
    const { data: row } = await supabase
      .from(TABLE)
      .select("fcm_tokens")
      .eq("id", userId)
      .maybeSingle();

    const existing: string[] = row?.fcm_tokens ?? [];
    const next = Array.from(new Set([...existing, newToken]));

    await supabase.from(TABLE).upsert(
      {
        id: userId,
        fcm_tokens: next,
        // updated_at: new Date().toISOString(),
      },
      { onConflict: "id" },
    );
  });
}
