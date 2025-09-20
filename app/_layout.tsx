import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import "react-native-reanimated";

import { useColorScheme } from "@/components/useColorScheme";

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: "index",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  const Dark: typeof DarkTheme = {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      background: "rgb(10, 10, 10)",
      border: "rgb(44, 44, 46)",
      card: "rgb(28, 28, 30)",
      notification: "rgb(255, 69, 58)",
      primary: "rgb(64, 156, 255)",
      text: "rgb(229, 229, 231)",
    },
  };

  const Light: typeof DefaultTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: "#f2f2f2ff",
      border: "#d8d8d8ff",
      card: "#ffffffff",
      notification: "#ff3b30ff",
      primary: "#007affff",
      text: "#1c1c1eff",
    },
  };
  return (
    <ThemeProvider value={colorScheme === "dark" ? Dark : Light}>
      <Stack>
        <Stack.Screen
          name="index"
          options={{
            title: "",
            headerTransparent: true,
          }}
        />
        <Stack.Screen name="addProduct" options={{ presentation: "modal" }} />
        <Stack.Screen
          name="productDetails"
          options={{ presentation: "modal" }}
        />
      </Stack>
    </ThemeProvider>
  );
}
