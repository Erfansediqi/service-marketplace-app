import {
  Roboto_400Regular,
  Roboto_500Medium,
  Roboto_600SemiBold,
  Roboto_700Bold,
  useFonts,
} from "@expo-google-fonts/roboto";
import * as Notifications from "expo-notifications";
import { router, Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useCallback, useEffect, useRef } from "react";
import { BiometricAppLock } from "../components/security/biometric-app-lock";
import {
  CustomerProfileProvider,
  useCustomerProfile,
} from "../context/customer-profile-context";

import {
  CustomerAddressProvider,
  useCustomerAddresses,
} from "../context/customer-address-context";

import {
  BiometricSecurityProvider,
  useBiometricSecurity,
} from "../context/biometric-security-context";

import {
  NotificationProvider,
  useNotifications,
} from "../context/notification-context";

import {
  SupabaseAuthProvider,
  useSupabaseAuth,
} from "../context/supabase-auth-context";

import { BookingProvider, useBooking } from "../context/booking-context";
import { LanguageProvider, useLanguage } from "../context/languagecontext";
import { SessionProvider, useSession } from "../context/session-context";
import { startSyncEngine } from "../offline/sync-engine";
import {
  buildActionFromPushData,
} from "../services/notification-navigation";
import {
  configureNotificationClient,
  registerPushDeviceForCurrentInstallation,
} from "../services/push-notifications";

SplashScreen.preventAutoHideAsync().catch(() => {
  // Expo may already control the splash screen during fast refresh.
});

interface AppNavigatorProps {
  fontsReady: boolean;
}

function SyncEngineLifecycle() {
  const { isHydrated: authIsHydrated, user } = useSupabaseAuth();

  useEffect(() => {
    if (!authIsHydrated || !user) {
      return;
    }

    return startSyncEngine();
  }, [authIsHydrated, user]);

  return null;
}

function PushRegistrationLifecycle() {
  const {
    isHydrated: authIsHydrated,
    user,
  } = useSupabaseAuth();

  const userId =
    user?.id ?? null;

  useEffect(() => {
    if (
      !authIsHydrated ||
      !userId
    ) {
      return;
    }

    let isCancelled = false;

    const registerPushDevice =
      async (): Promise<void> => {
        try {
          const result =
            await registerPushDeviceForCurrentInstallation();

          if (
            isCancelled ||
            result.ok
          ) {
            return;
          }

          console.info(
            "Push registration was not completed:",
            result.reason,
          );
        } catch (error) {
          if (isCancelled) {
            return;
          }

          console.error(
            "Unexpected push registration failure:",
            error,
          );
        }
      };

    void registerPushDevice();

    return () => {
      isCancelled = true;
    };
  }, [
    authIsHydrated,
    userId,
  ]);

  return null;
}

function NotificationInteractionLifecycle() {
  const { user } = useSupabaseAuth();

  const {
    refreshNotifications,
    markAsRead,
  } = useNotifications();

  const handledResponses =
    useRef<Set<string>>(
      new Set(),
    );

  const handleNotificationResponse =
    useCallback(
      async (
        response:
          Notifications.NotificationResponse,
      ): Promise<void> => {
        if (!user) {
          return;
        }

        const responseKey =
          `${response.notification.request.identifier}:${response.actionIdentifier}`;

        if (
          handledResponses.current.has(
            responseKey,
          )
        ) {
          return;
        }

        handledResponses.current.add(
          responseKey,
        );

        const {
          notificationId,
          action,
        } =
          buildActionFromPushData(
            response.notification.request
              .content.data,
          );

        try {
          await refreshNotifications();
        } catch (error) {
          console.error(
            "Failed to refresh notifications after notification interaction:",
            error,
          );
        }

        if (notificationId) {
          try {
            await markAsRead(
              notificationId,
            );
          } catch (error) {
            console.error(
              "Failed to mark interacted notification as read:",
              error,
            );
          }
        }

        try {
          await Notifications.clearLastNotificationResponseAsync();
        } catch (error) {
          console.error(
            "Failed to clear the consumed notification response:",
            error,
          );
        }

        if (!action) {
          return;
        }

        router.push({
          pathname:
            action.route as never,
          params:
            action.params,
        });
      },
      [
        markAsRead,
        refreshNotifications,
        user,
      ],
    );

  useEffect(() => {
    const receivedSubscription =
      Notifications.addNotificationReceivedListener(
        () => {
          void refreshNotifications().catch(
            (error) => {
              console.error(
                "Failed to refresh notifications after receiving a notification:",
                error,
              );
            },
          );
        },
      );

    const responseSubscription =
      Notifications.addNotificationResponseReceivedListener(
        (response) => {
          void handleNotificationResponse(
            response,
          );
        },
      );

    return () => {
      receivedSubscription.remove();
      responseSubscription.remove();
    };
  }, [
    handleNotificationResponse,
    refreshNotifications,
  ]);

  const lastNotificationResponse =
    Notifications.useLastNotificationResponse();

  useEffect(() => {
    if (
      !lastNotificationResponse
    ) {
      return;
    }

    void handleNotificationResponse(
      lastNotificationResponse,
    );
  }, [
    handleNotificationResponse,
    lastNotificationResponse,
  ]);

  return null;
}

function AppNavigator({ fontsReady }: AppNavigatorProps) {
  const { isHydrated: authIsHydrated } = useSupabaseAuth();
  const { isHydrated: languageIsHydrated } = useLanguage();

  const { isHydrated: sessionIsHydrated } = useSession();

  const { isHydrated: customerProfileIsHydrated } = useCustomerProfile();

  const { isHydrated: customerAddressesAreHydrated } = useCustomerAddresses();

  const { isHydrated: bookingIsHydrated } = useBooking();

  const { isHydrated: biometricSecurityIsHydrated } = useBiometricSecurity();

  const appIsReady =
    fontsReady &&
    authIsHydrated &&
    languageIsHydrated &&
    sessionIsHydrated &&
    customerProfileIsHydrated &&
    customerAddressesAreHydrated &&
    bookingIsHydrated &&
    biometricSecurityIsHydrated;

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
    <>
      <NotificationInteractionLifecycle />

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
        <Stack.Screen name="booking-record-details" />
        <Stack.Screen name="booking-summary" />
        <Stack.Screen name="booking-success" />

        <Stack.Screen name="account/change-password" />

        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(provider-tabs)" />

        <Stack.Screen name="explore" />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  useEffect(() => {
    configureNotificationClient();
  }, []);

  const [fontsLoaded, fontError] = useFonts({
    Roboto_400Regular,
    Roboto_500Medium,
    Roboto_600SemiBold,
    Roboto_700Bold,
  });

  const fontsReady = fontsLoaded || Boolean(fontError);

  return (
    <SupabaseAuthProvider>
      <PushRegistrationLifecycle />

      <BiometricSecurityProvider>
        <SessionProvider>
          <SyncEngineLifecycle />

          <CustomerProfileProvider>
            <CustomerAddressProvider>
              <LanguageProvider>
                <BookingProvider>
                  <NotificationProvider>
                    <BiometricAppLock>
                      <AppNavigator
                        fontsReady={
                          fontsReady
                        }
                      />
                    </BiometricAppLock>
                  </NotificationProvider>
                </BookingProvider>
              </LanguageProvider>
            </CustomerAddressProvider>
          </CustomerProfileProvider>
        </SessionProvider>
      </BiometricSecurityProvider>
    </SupabaseAuthProvider>
  );
}