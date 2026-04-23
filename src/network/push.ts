import { supabase } from "./supabase";

const PUSH_ENDPOINT = "https://www.jahanzeb.dev/api/push";

type KhataPushPayload = {
  cust_name: string;
  description: string;
};

export async function sendKhataPush(payload: KhataPushPayload): Promise<void> {
  try {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) return;

    const res = await fetch(PUSH_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      console.log("sendKhataPush failed", res.status, await res.text());
    }
  } catch (e) {
    console.log("sendKhataPush error", e);
  }
}
