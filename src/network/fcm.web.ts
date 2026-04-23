// import { getToken, getMessaging, isSupported } from "firebase/messaging";
// import { initializeApp } from "firebase/app";

// import { Platform } from "react-native";
// import { supabase } from "./supabase";
// import { TABLES } from "./contants";

// Initialize Firebase
// const app = initializeApp(firebaseConfig);

// const messaging = getMessaging(app);

// const TABLE = "users";

export async function requestNotificationPermission() {
  //   const status = await Notification.requestPermission();
  //   return status === "granted";
}

export async function getFcmToken() {
  try {
    // if (Platform.OS === "ios") {
    //   await registerDeviceForRemoteMessages(messaging);
    // }
    // return await getToken(messaging, {
    //   vapidKey:
    //     "BEjspD13h2WyzWOdDUm4GyuXxavcXuCwJvYuh66gAV5qWCd2yLbveIY-n5dLqpcKUaH_7QP5sy84xHBQfzJBP74",
    // });
  } catch (e) {
    // console.log("getFcmToken error", e);
    return null;
  }
}

export async function registerDeviceToken(userId: string) {
  //   const granted = await requestNotificationPermission();
  //   if (!granted) return null;
  //   const token = await getFcmToken();
  //   if (!token) return null;
  //   console.log(userId);
  //   const { data: row } = await supabase
  //     .from(TABLE)
  //     .select("fcm_tokens")
  //     .eq("id", userId)
  //     .maybeSingle();
  //   const existing: string[] = row?.fcm_tokens ?? [];
  //   const next = Array.from(new Set([...existing, token]));
  //   const { error } = await supabase
  //     .from(TABLES.users)
  //     .update({
  //       id: userId,
  //       fcm_tokens: next,
  //     })
  //     .eq("id", userId);
  //   if (error) {
  //     console.log("registerDeviceToken upsert error", error.message);
  //     return null;
  //   }
  //   return token;
}

export const unregisterDeviceToken = async (
  userId: string,
  token: string | null,
) => {
  //   if (!token) return;
  //   const { data: row } = await supabase
  //     .from(TABLE)
  //     .select("fcm_tokens")
  //     .eq("id", userId)
  //     .maybeSingle();
  //   const existing: string[] = row?.fcm_tokens ?? [];
  //   const next = existing.filter((t) => t !== token);
  //   await supabase
  //     .from(TABLE)
  //     .update({
  //       fcm_tokens: next,
  //       //  updated_at: new Date().toISOString()
  //     })
  //     .eq("id", userId);
};

export const subscribeToTokenRefresh = (userId: string) => {
  //   return onTokenRefresh(messaging, async (newToken) => {
  //     const { data: row } = await supabase
  //       .from(TABLE)
  //       .select("fcm_tokens")
  //       .eq("id", userId)
  //       .maybeSingle();
  //     const existing: string[] = row?.fcm_tokens ?? [];
  //     const next = Array.from(new Set([...existing, newToken]));
  //     await supabase.from(TABLE).upsert(
  //       {
  //         id: userId,
  //         fcm_tokens: next,
  //         // updated_at: new Date().toISOString(),
  //       },
  //       { onConflict: "id" },
  //     );
  //   });
};
