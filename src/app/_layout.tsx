import {
  Roboto_400Regular,
  Roboto_500Medium,
  Roboto_600SemiBold,
  Roboto_700Bold,
  useFonts,
} from "@expo-google-fonts/roboto";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";

import { BookingProvider } from "../context/booking-context";
import { LanguageProvider } from "../context/languagecontext";
import { SessionProvider } from "../context/session-context";

SplashScreen.preventAutoHideAsync().catch(() => {
  // The splash screen may already be controlled by Expo during fast refresh.
});

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Roboto_400Regular,
    Roboto_500Medium,
    Roboto_600SemiBold,
    Roboto_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync().catch(() => {
        // Ignore errors if the splash screen has already been hidden.
      });
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <SessionProvider>
      <BookingProvider>
        <LanguageProvider>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: {
                backgroundColor: "#D6E8EE",
              },
            }}
          >
            <Stack.Screen name="index" />
            <Stack.Screen name="language" />

            <Stack.Screen name="onboarding-1" />
            <Stack.Screen name="onboarding-2" />
            <Stack.Screen name="onboarding-3" />

            <Stack.Screen name="signup" />
            <Stack.Screen name="verify-code" />

            <Stack.Screen name="location-permission" />
            <Stack.Screen name="confirm-location" />
            <Stack.Screen name="manual-address" />
            <Stack.Screen name="role-selection" />

            <Stack.Screen name="provider-welcome" />
            <Stack.Screen name="provider-category" />
            <Stack.Screen name="provider-services" />
            <Stack.Screen name="provider-details" />
            <Stack.Screen name="provider-service-area" />
            <Stack.Screen name="provider-availability" />
            <Stack.Screen name="provider-verification" />
            <Stack.Screen name="provider-submitted" />

            <Stack.Screen name="provider-profile" />

            <Stack.Screen name="booking-create" />
            <Stack.Screen name="booking-schedule" />
            <Stack.Screen name="booking-details" />
            <Stack.Screen name="booking-summary" />
            <Stack.Screen name="booking-success" />

            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="(provider-tabs)" />

            <Stack.Screen name="explore" />
          </Stack>
        </LanguageProvider>
      </BookingProvider>
    </SessionProvider>
  );
}