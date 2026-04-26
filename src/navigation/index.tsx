import { useTheme } from "@react-navigation/native";
import { Stack } from "expo-router";
import { ActivityIndicator, Platform, View } from "react-native";

export const StackNavigator = ({
  isDark,
  authReady,
}: {
  isDark: boolean;
  authReady: boolean;
}) => {
  const { colors } = useTheme();

  if (!authReady) {
    return (
      <View
        className="flex-1 justify-center items-center"
        style={{ backgroundColor: colors.background }}
      >
        <ActivityIndicator size={"large"} />
      </View>
    );
  }
  return (
    <Stack
      screenOptions={{
        ...(Platform.OS === "android"
          ? {
              statusBarStyle: isDark ? "light" : "dark",
            }
          : {}),
        headerBackTitle: "Back",
      }}
    >
      <Stack.Screen
        name="(product)/index"
        options={{
          title: "B Mart",
          headerShadowVisible: false,

          headerTitleAlign: "center",
        }}
      />
      <Stack.Screen name="(product)/add" />
      <Stack.Screen
        name="(product)/details"
        options={{
          headerTransparent:  Platform.OS !== "web",
          title: "Product Details",
        }}
      />
      <Stack.Screen name="(khata)/index" />
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="profile" />
    </Stack>
  );
};
