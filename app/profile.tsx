import { useTheme } from "@react-navigation/native";
import { router, Stack } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, View } from "react-native";
import { LogOut, UserCircle2 } from "lucide-react-native";
import CustomButton from "@components/CustomButton";
import { Text } from "@components/ui/text";
import { Heading } from "@components/ui/heading";
import { ButtonText } from "@components/ui/button";
import { supabase } from "@src/network/supabase";
import { getFcmToken, unregisterDeviceToken } from "@src/network/fcm";

const EMAIL_DOMAIN = "@bmart.com";

const Profile = () => {
  const { colors } = useTheme();
   
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? null);
    });
  }, []);

  const username = email?.endsWith(EMAIL_DOMAIN)
    ? email.slice(0, -EMAIL_DOMAIN.length)
    : email;

  const onSignOut = () => {
    Alert.alert("Sign out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign out",
        style: "destructive",
        onPress: async () => {
          setLoading(true);
          const { data } = await supabase.auth.getUser();
          const userId = data.user?.id;
          if (userId) {
            const token = await getFcmToken();
            await unregisterDeviceToken(userId, token);
          }
          const { error } = await supabase.auth.signOut();
          setLoading(false);
          if (error) {
            Alert.alert("Sign out failed", error.message);
            return;
          }
          router.replace("/login");
        },
      },
    ]);
  };

  return (
    <>
      <Stack.Screen options={{ title: "Profile", headerTitleAlign: "center" }} />
      <View style={{ flex: 1, backgroundColor: colors.background, padding: 24 }}>
        <View
          style={{
            alignItems: "center",
            paddingVertical: 32,
            backgroundColor: colors.card,
            borderRadius: 16,
            marginBottom: 24,
          }}
        >
          <UserCircle2 size={72} color={colors.primary} strokeWidth={1.5} />
          <Heading size="xl" style={{ color: colors.text, marginTop: 12 }}>
            {username ?? "—"}
          </Heading>
          {/* <Text size="sm" style={{ color: colors.text + "80", marginTop: 4 }}>
            {email ?? "Loading..."}
          </Text> */}
        </View>

        <CustomButton
          onPress={onSignOut}
          loading={loading}
          style={{ backgroundColor: "#ef4444" }}
        >
          <LogOut size={18} color="white" style={{ marginRight: 8 }} />
          <ButtonText className="color-white">Sign out</ButtonText>
        </CustomButton>
      </View>
    </>
  );
};

export default Profile;
