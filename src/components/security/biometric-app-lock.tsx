import { Ionicons } from "@expo/vector-icons";
import * as LocalAuthentication from "expo-local-authentication";
import {
  type PropsWithChildren,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  AppState,
  type AppStateStatus,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  Fonts,
  KhedmatPalette,
  Layout,
  Radius,
  Spacing,
  Typography,
} from "../../constants/theme";
import { useBiometricSecurity } from "../../context/biometric-security-context";
import { useLanguage } from "../../context/languagecontext";
import { useSupabaseAuth } from "../../context/supabase-auth-context";

type BiometricAppLockProps =
  PropsWithChildren;

export function BiometricAppLock({
  children,
}: BiometricAppLockProps) {
  const {
    t,
    rowDirection,
    textDirection,
  } = useLanguage();

  const {
    user,
    signOut,
  } = useSupabaseAuth();

  const {
    isHydrated,
    biometricsEnabled,
    biometricLabel,
  } = useBiometricSecurity();

  const [
    isLocked,
    setIsLocked,
  ] = useState(true);

  const [
    isAuthenticating,
    setIsAuthenticating,
  ] = useState(false);

  const [
    unlockError,
    setUnlockError,
  ] = useState<
    string | null
  >(null);

  const [
    promptRequestId,
    setPromptRequestId,
  ] = useState(0);

  const currentAppStateRef =
    useRef<AppStateStatus>(
      AppState.currentState,
    );

  const initializedUserIdRef =
    useRef<
      string | null
    >(null);

  const requestUnlock =
    useCallback(
      async (): Promise<void> => {
        if (
          !user ||
          !biometricsEnabled ||
          isAuthenticating
        ) {
          return;
        }

        setIsAuthenticating(
          true,
        );

        setUnlockError(null);

        try {
          const result =
            await LocalAuthentication
              .authenticateAsync({
                promptMessage:
                  t("biometricPromptMessage"),
                cancelLabel:
                  t("cancelBiometricPrompt"),
                fallbackLabel:
                  t("useDevicePasscode"),
                disableDeviceFallback:
                  false,
              });

          if (result.success) {
            setIsLocked(false);

            return;
          }

          if (
            result.error ===
              "user_cancel" ||
            result.error ===
              "system_cancel" ||
            result.error ===
              "app_cancel"
          ) {
            return;
          }

          setUnlockError(
            getUnlockErrorMessage(
              result.error,
              biometricLabel,
              {
                genericUnlockError:
                  t(
                    "biometricGenericUnlockError",
                  ),
                notEnrolled:
                  t(
                    "biometricNotEnrolled",
                  ),
                notAvailable:
                  t(
                    "biometricNotAvailable",
                  ),
                lockout:
                  t(
                    "biometricLockout",
                  ),
                authenticationFailed:
                  t(
                    "biometricAuthenticationFailed",
                  ),
              },
            ),
          );
        } catch (error) {
          console.error(
            "Biometric app unlock failed:",
            error,
          );

          setUnlockError(
            t(
              "biometricGenericUnlockError",
            ),
          );
        } finally {
          setIsAuthenticating(
            false,
          );
        }
      },
      [
        biometricLabel,
        biometricsEnabled,
        isAuthenticating,
        user,
      ],
    );

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    const userId =
      user?.id ?? null;

    if (
      !userId ||
      !biometricsEnabled
    ) {
      initializedUserIdRef.current =
        userId;

      setIsLocked(false);

      setUnlockError(null);

      return;
    }

    if (
      initializedUserIdRef.current ===
      userId
    ) {
      return;
    }

    initializedUserIdRef.current =
      userId;

    setIsLocked(true);

    setPromptRequestId(
      (current) =>
        current + 1,
    );
  }, [
    biometricsEnabled,
    isHydrated,
    user?.id,
  ]);

  useEffect(() => {
    const subscription =
      AppState.addEventListener(
        "change",
        (
          nextAppState,
        ) => {
          const previousAppState =
            currentAppStateRef.current;

          currentAppStateRef.current =
            nextAppState;

          if (
            !user ||
            !biometricsEnabled
          ) {
            return;
          }

          if (
            nextAppState ===
            "background"
          ) {
            setIsLocked(true);

            setUnlockError(null);

            return;
          }

          if (
            previousAppState ===
              "background" &&
            nextAppState ===
              "active"
          ) {
            setIsLocked(true);

            setPromptRequestId(
              (current) =>
                current + 1,
            );
          }
        },
      );

    return () => {
      subscription.remove();
    };
  }, [
    biometricsEnabled,
    user,
  ]);

  useEffect(() => {
    if (
      promptRequestId === 0 ||
      !isLocked ||
      !user ||
      !biometricsEnabled ||
      currentAppStateRef.current !==
        "active"
    ) {
      return;
    }

    const timer =
      setTimeout(() => {
        void requestUnlock();
      }, 180);

    return () => {
      clearTimeout(timer);
    };
  }, [
    biometricsEnabled,
    isLocked,
    promptRequestId,
    requestUnlock,
    user,
  ]);

  const handleRetry =
    (): void => {
      if (
        isAuthenticating
      ) {
        return;
      }

      setPromptRequestId(
        (current) =>
          current + 1,
      );
    };

  const handleSignOut =
    async (): Promise<void> => {
      if (
        isAuthenticating
      ) {
        return;
      }

      try {
        await signOut();

        setIsLocked(false);

        setUnlockError(null);
      } catch (error) {
        console.error(
          "Could not sign out from biometric lock screen:",
          error,
        );

        setUnlockError(
          t(
            "biometricSignOutError",
          ),
        );
      }
    };

  const shouldShowLock =
    isHydrated &&
    Boolean(user) &&
    biometricsEnabled &&
    isLocked;

  if (!shouldShowLock) {
    return <>{children}</>;
  }

  return (
    <SafeAreaView
      style={styles.safeArea}
    >
      <View
        style={
          styles.container
        }
      >
        <View
          style={
            styles.lockIcon
          }
        >
          <Ionicons
            name="lock-closed"
            size={34}
            color={
              KhedmatPalette.navy900
            }
          />
        </View>

        <Text
          style={[
            styles.title,
            {
              writingDirection:
                textDirection,
            },
          ]}
        >
          {t("khedmatLockedTitle")}
        </Text>

        <Text
          style={[
            styles.subtitle,
            {
              writingDirection:
                textDirection,
            },
          ]}
        >
          {t("biometricUnlockSubtitle")}
        </Text>

        {unlockError ? (
          <View
            style={[
              styles.errorCard,
              {
                flexDirection:
                  rowDirection,
              },
            ]}
          >
            <Ionicons
              name="alert-circle-outline"
              size={19}
              color={
                KhedmatPalette.error
              }
            />

            <Text
              style={[
                styles.errorText,
                {
                  textAlign:
                    textDirection === "rtl"
                      ? "right"
                      : "left",
                  writingDirection:
                    textDirection,
                },
              ]}
            >
              {unlockError}
            </Text>
          </View>
        ) : null}

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t("unlockWithBiometrics")}
          disabled={
            isAuthenticating
          }
          onPress={
            handleRetry
          }
          style={({
            pressed,
          }) => [
            styles.unlockButton,
            isAuthenticating &&
              styles.buttonDisabled,
            pressed &&
              !isAuthenticating &&
              styles.buttonPressed,
          ]}
        >
          <Ionicons
            name="finger-print-outline"
            size={21}
            color={
              KhedmatPalette.white
            }
          />

          <Text
            style={
              styles.unlockButtonText
            }
          >
            {isAuthenticating
              ? t("checkingBiometrics")
              : t("unlockWithBiometrics")}
          </Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t("signOutAction")}
          disabled={
            isAuthenticating
          }
          onPress={() => {
            void handleSignOut();
          }}
          style={({
            pressed,
          }) => [
            styles.signOutButton,
            pressed &&
              !isAuthenticating &&
              styles.signOutPressed,
          ]}
        >
          <Text
            style={
              styles.signOutText
            }
          >
            {t("signOutAction")}
          </Text>
        </Pressable>

        <View
          style={[
            styles.securityNote,
            {
              flexDirection:
                rowDirection,
            },
          ]}
        >
          <Ionicons
            name="shield-checkmark-outline"
            size={18}
            color={
              KhedmatPalette.blue500
            }
          />

          <Text
            style={[
              styles.securityNoteText,
              {
                textAlign:
                  textDirection === "rtl"
                    ? "right"
                    : "left",
                writingDirection:
                  textDirection,
              },
            ]}
          >
            {t("biometricProtectionNote")}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

type BiometricUnlockErrorCopy = {
  genericUnlockError: string;
  notEnrolled: string;
  notAvailable: string;
  lockout: string;
  authenticationFailed: string;
};

function getUnlockErrorMessage(
  error:
    | string
    | undefined,
  biometricLabel: string,
  copy: BiometricUnlockErrorCopy,
): string {
  if (
    error ===
      "not_enrolled"
  ) {
    return copy.notEnrolled.replace(
      "{label}",
      biometricLabel,
    );
  }

  if (
    error ===
      "not_available"
  ) {
    return copy.notAvailable.replace(
      "{label}",
      biometricLabel,
    );
  }

  if (
    error ===
      "lockout"
  ) {
    return copy.lockout;
  }

  if (
    error ===
      "authentication_failed"
  ) {
    return copy.authenticationFailed;
  }

  return copy.genericUnlockError;
}

const styles =
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor:
        KhedmatPalette.white,
    },

    container: {
      flex: 1,
      width: "100%",
      maxWidth:
        Layout.contentMaxWidth,
      alignSelf: "center",
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal:
        Layout.screenPadding,
      paddingVertical:
        Spacing.xxl,
    },

    lockIcon: {
      width: 88,
      height: 88,
      borderRadius:
        Radius.pill,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor:
        KhedmatPalette.blue050,
      borderWidth:
        StyleSheet.hairlineWidth,
      borderColor:
        KhedmatPalette.blue200,
    },

    title: {
      ...Typography.screenTitle,
      width: "100%",
      marginTop:
        Spacing.lg,
      color:
        KhedmatPalette.textPrimary,
      textAlign: "center",
      fontFamily:
        Fonts.bold,
      fontSize: 24,
      lineHeight: 30,
    },

    subtitle: {
      ...Typography.bodyStyle,
      width: "100%",
      maxWidth: 360,
      marginTop:
        Spacing.xs,
      color:
        KhedmatPalette.textSecondary,
      textAlign: "center",
      lineHeight: 22,
    },

    errorCard: {
      width: "100%",
      maxWidth: 390,
      marginTop:
        Spacing.lg,
      alignItems:
        "flex-start",
      gap: Spacing.sm,
      padding:
        Spacing.md,
      borderRadius:
        Radius.md,
      backgroundColor:
        "#FFF3F2",
      borderWidth:
        StyleSheet.hairlineWidth,
      borderColor:
        "#F1B5B0",
    },

    errorText: {
      ...Typography.captionStyle,
      flex: 1,
      color:
        KhedmatPalette.error,
      lineHeight: 19,
    },

    unlockButton: {
      width: "100%",
      maxWidth: 390,
      minHeight: 54,
      marginTop:
        Spacing.xl,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: Spacing.sm,
      borderRadius:
        Radius.lg,
      backgroundColor:
        KhedmatPalette.navy900,
      shadowColor:
        KhedmatPalette.navy900,
      shadowOffset: {
        width: 0,
        height: 3,
      },
      shadowOpacity: 0.12,
      shadowRadius: 8,
      elevation: 2,
    },

    unlockButtonText: {
      ...Typography.label,
      color:
        KhedmatPalette.white,
      fontFamily:
        Fonts.bold,
      fontSize: 15,
      lineHeight: 20,
    },

    buttonDisabled: {
      opacity: 0.65,
    },

    buttonPressed: {
      opacity: 0.86,
      transform: [
        {
          scale: 0.995,
        },
      ],
    },

    signOutButton: {
      minHeight: 44,
      marginTop:
        Spacing.sm,
      paddingHorizontal:
        Spacing.lg,
      alignItems: "center",
      justifyContent: "center",
    },

    signOutText: {
      ...Typography.label,
      color:
        KhedmatPalette.textSecondary,
      fontSize: 14,
      lineHeight: 19,
    },

    signOutPressed: {
      opacity: 0.65,
    },

    securityNote: {
      width: "100%",
      maxWidth: 390,
      marginTop:
        Spacing.xl,
      alignItems:
        "flex-start",
      gap: Spacing.sm,
      padding:
        Spacing.md,
      borderRadius:
        Radius.md,
      backgroundColor:
        KhedmatPalette.blue050,
      borderWidth:
        StyleSheet.hairlineWidth,
      borderColor:
        KhedmatPalette.blue200,
    },

    securityNoteText: {
      ...Typography.captionStyle,
      flex: 1,
      color:
        KhedmatPalette.textSecondary,
      lineHeight: 19,
    },
  });
