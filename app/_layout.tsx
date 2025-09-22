import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import "react-native-reanimated";
import "@/src/sheets";
import { SheetProvider } from "react-native-actions-sheet";
import { useColorScheme } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

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
      background: "#0a0a0a",
      border: "#2c2c2e",
      card: "#1c1c1e",
      notification: "#ff453a",
      primary: "#409cff",
      text: "#e5e5e7",
    },
  };

  const Light: typeof DefaultTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: "#f2f2f2",
      border: "#d8d8d8",
      card: "#ffffff",
      notification: "#ff3b30",
      primary: "#007aff",
      text: "#1c1c1e",
    },
  };

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: "black" }}>
      <ThemeProvider value={colorScheme === "dark" ? Dark : Light}>
        <SheetProvider>
          <Stack>
            <Stack.Screen
              name="index"
              options={{
                title: "B Mart",
                headerShadowVisible: false,
                // headerTransparent: true,
              }}
            />
            <Stack.Screen
              name="addProduct"
              //  options={{ presentation: "containedModal" }}
            />
            <Stack.Screen
              name="productDetails"
              options={{ presentation: "modal" }}
            />
          </Stack>
        </SheetProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
