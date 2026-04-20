import { useTheme } from "@react-navigation/native";
import { router, Stack } from "expo-router";
import { useRef, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  View,
} from "react-native";
import { Lock, User } from "lucide-react-native";
import CustomInput from "@components/CustomInput";
import CustomButton from "@components/CustomButton";
import { Text } from "@components/ui/text";
import { Heading } from "@components/ui/heading";
import { ButtonText } from "@components/ui/button";
import { supabase } from "@src/network/supabase";

const EMAIL_DOMAIN = "@bmart.com";

const Login = () => {
  const { colors } = useTheme();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const passwordRef = useRef<TextInput>(null);

  const onSubmit = async () => {
    const u = username.trim().toLowerCase();
    if (!u || !password) {
      Alert.alert("Missing fields", "Enter username and password");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: `${u}${EMAIL_DOMAIN}`,
      password,
    });
    setLoading(false);

    if (error) {
      Alert.alert("Login failed", error.message);
      return;
    }

    router.replace("/(product)");
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1, backgroundColor: colors.background }}
      >
        <View
          style={{
            flex: 1,
            padding: 24,
            justifyContent: "center",
            gap: 16,
          }}
        >
          <View style={{ alignItems: "center", marginBottom: 24 }}>
            <Heading size="2xl" style={{ color: colors.text }}>
              B Mart
            </Heading>
            <Text size="sm" style={{ color: colors.text + "80", marginTop: 4 }}>
              Sign in to continue
            </Text>
          </View>

          <CustomInput
            label="Username"
            placeholder="username"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="username"
            returnKeyType="next"
            onSubmitEditing={() => passwordRef.current?.focus()}
            leftIcon={<User size={20} color={colors.text + "80"} />}
          />

          <CustomInput
            ref={passwordRef}
            label="Password"
            placeholder="password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
            autoComplete="password"
            returnKeyType="done"
            onSubmitEditing={onSubmit}
            leftIcon={<Lock size={20} color={colors.text + "80"} />}
          />

          <CustomButton
            onPress={onSubmit}
            loading={loading}
            style={{ marginTop: 8, }}
          >
            <ButtonText className="color-white">Login</ButtonText>
          </CustomButton>
        </View>
      </KeyboardAvoidingView>
    </>
  );
};

export default Login;
