import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
  useTheme,
} from "@react-navigation/native";
import { router, Stack, useSegments } from "expo-router";
import { SplashScreen } from "expo-router";
import { useEffect, useState } from "react";
import "react-native-reanimated";
import { SheetProvider } from "react-native-actions-sheet";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { useColorScheme } from "nativewind";

import { GluestackUIProvider } from "@components/ui/gluestack-ui-provider";
import "@/global.css";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@src/network/supabase";
import { registerDeviceToken, subscribeToTokenRefresh } from "@src/network/fcm";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Sheets } from "@/src/sheets";
import { StackNavigator } from "@/src/navigation";

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

const RootLayout = () => {
  const { colorScheme, setColorScheme } = useColorScheme();

  useEffect(() => {
    setColorScheme("system");
  }, [setColorScheme]);

  const [session, setSession] = useState<Session | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const segments = useSegments();

  useEffect(() => {
    if (authReady) SplashScreen.hideAsync();
  }, [authReady]);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      setAuthReady(true);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, nextSession) => {
        if (!mounted) return;
        setSession(nextSession);
      },
    );

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!authReady) return;
    const onLoginScreen = segments[0] === "login";
    if (!session && !onLoginScreen) {
      router.replace("/login");
    } else if (session && onLoginScreen) {
      router.replace("/(product)");
    }
  }, [authReady, session, segments]);

  useEffect(() => {
    const userId = session?.user.id;
    // console.log(session?.access_token);
    // console.log({userId})
    if (!userId) return;
    registerDeviceToken(userId);
    const unsubscribe = subscribeToTokenRefresh(userId);
    return () => unsubscribe();
  }, [session?.user.id]);

  const isDark = colorScheme === "dark";

  // console.log("authReady ", authReady);
  return (
    <SafeAreaProvider style={{ flex: 1, backgroundColor: "black" }}>
      <GluestackUIProvider mode={colorScheme}>
        <KeyboardProvider>
          <GestureHandlerRootView style={{ flex: 1, backgroundColor: "black" }}>
            <ThemeProvider value={isDark ? Dark : Light}>
              <SheetProvider>
                <Sheets />
                <StackNavigator isDark={isDark} authReady={authReady} />
              </SheetProvider>
            </ThemeProvider>
          </GestureHandlerRootView>
        </KeyboardProvider>
      </GluestackUIProvider>
    </SafeAreaProvider>
  );
};

export default RootLayout;

const Dark: typeof DarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: "#0B0F14",
    border: "#1F2937",
    card: "#111827",
    notification: "#ff453a",
    primary: "#409cff",
    text: "#E5E7EB",
  },
};

const Light: typeof DefaultTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: "#f2f2f7",
    border: "#c5c5c7",
    card: "#ffffff",
    // card: "#e7e7f3",
    notification: "#ff3b30",
    primary: "#007aff",
    text: "#1C1C1E",
  },
};
