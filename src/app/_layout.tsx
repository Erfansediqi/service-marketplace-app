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
import { NotificationProvider } from "../context/notification-context";

import {
  BookingProvider,
  useBooking,
} from "../context/booking-context";
import {
  LanguageProvider,
  useLanguage,
} from "../context/languagecontext";
import {
  SessionProvider,
  useSession,
} from "../context/session-context";

SplashScreen.preventAutoHideAsync().catch(() => {
  // Expo may already control the splash screen during fast refresh.
});

interface AppNavigatorProps {
  fontsReady: boolean;
}

function AppNavigator({
  fontsReady,
}: AppNavigatorProps) {
  const {
    isHydrated: languageIsHydrated,
  } = useLanguage();

  const {
    isHydrated: sessionIsHydrated,
  } = useSession();

  const {
    isHydrated: bookingIsHydrated,
  } = useBooking();

  const appIsReady =
    fontsReady &&
    languageIsHydrated &&
    sessionIsHydrated &&
    bookingIsHydrated;

  useEffect(() => {
    if (!appIsReady) {
      return;
    }

    SplashScreen.hideAsync().catch(() => {
      // Ignore errors if the splash screen has already been hidden.
    });
  }, [appIsReady]);

  if (!appIsReady) {
    return null;
  }

  return (
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
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Roboto_400Regular,
    Roboto_500Medium,
    Roboto_600SemiBold,
    Roboto_700Bold,
  });

  const fontsReady =
    fontsLoaded || Boolean(fontError);

  return (
    <SessionProvider>
  <BookingProvider>
    <LanguageProvider>
      <NotificationProvider>
        <AppNavigator
          fontsReady={fontsReady}
        />
      </NotificationProvider>
    </LanguageProvider>
  </BookingProvider>
</SessionProvider>
  );
}