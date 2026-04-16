import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import "react-native-reanimated";
import "@sheets";
import { SheetProvider } from "react-native-actions-sheet";
import { Platform, StatusBar, useColorScheme, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";

import { GluestackUIProvider } from "@components/ui/gluestack-ui-provider";
import "@/global.css";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@src/network/supabase";
import { SafeAreaProvider } from "react-native-safe-area-context";

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: "(product)/index",
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

  useEffect(() => {
    let mounted = true;

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!mounted) return;
        console.log("session", !!session);
      },
    );

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const isDark = colorScheme === "dark";

  const statusBarHeight = StatusBar.currentHeight;

  return (
    <SafeAreaProvider style={{ flex: 1, backgroundColor: "black" }}>
      <GluestackUIProvider mode={"system"}>
        <KeyboardProvider>
          <GestureHandlerRootView style={{ flex: 1, backgroundColor: "black" }}>
            <ThemeProvider value={isDark ? Dark : Light}>
              <SheetProvider>
                <View
                  style={{
                    flex: 1,
                    backgroundColor: isDark
                      ? Dark.colors.background
                      : Light.colors.background,
                    paddingTop: statusBarHeight,
                  }}
                >
                  <Stack
                    // screenLayout={({children})=><View style={{flex:1, backgroundColor:'pink', marginTop: 30}}>{children}</View>}
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
                        // statusBarTranslucent: true,
                        // headerTransparent:false,
                        // headerShadowVisible: false,
                        // headerBlurEffect: "systemMaterial",

                        headerTitleAlign: "center",
                      }}
                    />
                    <Stack.Screen name="(product)/add" />
                    <Stack.Screen
                      name="(product)/details"
                      options={{
                        headerTransparent: Platform.OS === "ios",
                        title: "Product Details",
                      }}
                    />
                    <Stack.Screen name="(khata)/index" />
                  </Stack>
                </View>
              </SheetProvider>
            </ThemeProvider>
          </GestureHandlerRootView>
        </KeyboardProvider>
      </GluestackUIProvider>
    </SafeAreaProvider>
  );
}

const Dark: typeof DarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: "#0a0a0a",
    border: "#2c2c2e",
    card: "#1c1c1e",
    notification: "#ff453a",
    primary: "#409cff",
    text: "#d1d1d6",
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
    text: "#2c2c2e",
  },
};
