import { Stack } from "expo-router";

import { BookingProvider } from "../context/booking-context";
import { LanguageProvider } from "../context/languagecontext";
import { SessionProvider } from "../context/session-context";

export default function RootLayout() {
  return (
    <SessionProvider>
      <BookingProvider>
        <LanguageProvider>
          <Stack screenOptions={{ headerShown: false }}>
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
