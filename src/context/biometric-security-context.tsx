import * as LocalAuthentication from "expo-local-authentication";
import {
    type PropsWithChildren,
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";

import { StorageService } from "../services/storage";
import { useSupabaseAuth } from "./supabase-auth-context";

type BiometricSecurityContextValue = {
  isHydrated: boolean;
  biometricsEnabled: boolean;
  isBiometricAvailable: boolean;
  biometricLabel: string;
  isChangingBiometricSetting: boolean;

  enableBiometrics: () => Promise<void>;
  disableBiometrics: () => Promise<void>;
  refreshBiometricAvailability: () => Promise<void>;
};

type PersistedBiometricPreferenceV1 = {
  version: 1;
  enabled: boolean;
};

const BIOMETRIC_PREFERENCE_STORAGE_PREFIX =
  "@khedmat_biometric_login";

const BiometricSecurityContext =
  createContext<BiometricSecurityContextValue | null>(
    null,
  );

function createStorageKey(
  userId: string | null,
): string {
  return `${BIOMETRIC_PREFERENCE_STORAGE_PREFIX}:${
    userId || "local"
  }`;
}

async function readPreference(
  storageKey: string,
): Promise<boolean> {
  const stored =
    await StorageService.get<unknown>(
      storageKey,
    );

  if (
    typeof stored !== "object" ||
    stored === null
  ) {
    return false;
  }

  const record =
    stored as Record<
      string,
      unknown
    >;

  return (
    record.version === 1 &&
    record.enabled === true
  );
}

async function writePreference(
  storageKey: string,
  enabled: boolean,
): Promise<void> {
  const value: PersistedBiometricPreferenceV1 = {
    version: 1,
    enabled,
  };

  await StorageService.save(
    storageKey,
    value,
  );
}

function getBiometricLabel(
  authenticationTypes:
    LocalAuthentication.AuthenticationType[],
): string {
  if (
    authenticationTypes.includes(
      LocalAuthentication
        .AuthenticationType
        .FACIAL_RECOGNITION,
    )
  ) {
    return "Face ID";
  }

  if (
    authenticationTypes.includes(
      LocalAuthentication
        .AuthenticationType
        .FINGERPRINT,
    )
  ) {
    return "Fingerprint";
  }

  if (
    authenticationTypes.includes(
      LocalAuthentication
        .AuthenticationType
        .IRIS,
    )
  ) {
    return "Iris";
  }

  return "Biometrics";
}

export function BiometricSecurityProvider({
  children,
}: PropsWithChildren) {
  const {
    user,
    isHydrated:
      authIsHydrated,
  } = useSupabaseAuth();

  const [
    isHydrated,
    setIsHydrated,
  ] = useState(false);

  const [
    biometricsEnabled,
    setBiometricsEnabled,
  ] = useState(false);

  const [
    isBiometricAvailable,
    setIsBiometricAvailable,
  ] = useState(false);

  const [
    biometricLabel,
    setBiometricLabel,
  ] = useState(
    "Biometrics",
  );

  const [
    isChangingBiometricSetting,
    setIsChangingBiometricSetting,
  ] = useState(false);

  const storageKey =
    useMemo(
      () =>
        createStorageKey(
          user?.id ?? null,
        ),
      [user?.id],
    );

  const refreshBiometricAvailability =
    useCallback(
      async (): Promise<void> => {
        try {
          const [
            hasHardware,
            isEnrolled,
            authenticationTypes,
          ] =
            await Promise.all([
              LocalAuthentication
                .hasHardwareAsync(),
              LocalAuthentication
                .isEnrolledAsync(),
              LocalAuthentication
                .supportedAuthenticationTypesAsync(),
            ]);

          setIsBiometricAvailable(
            hasHardware &&
              isEnrolled,
          );

          setBiometricLabel(
            getBiometricLabel(
              authenticationTypes,
            ),
          );
        } catch (error) {
          console.warn(
            "Could not determine biometric availability:",
            error,
          );

          setIsBiometricAvailable(
            false,
          );

          setBiometricLabel(
            "Biometrics",
          );
        }
      },
      [],
    );

  useEffect(() => {
    if (!authIsHydrated) {
      return;
    }

    let isMounted = true;

    const hydrate =
      async (): Promise<void> => {
        setIsHydrated(false);

        try {
          const [
            enabled,
          ] =
            await Promise.all([
              readPreference(
                storageKey,
              ),
              refreshBiometricAvailability(),
            ]);

          if (isMounted) {
            setBiometricsEnabled(
              enabled,
            );
          }
        } catch (error) {
          console.error(
            "Failed to hydrate biometric security settings:",
            error,
          );

          if (isMounted) {
            setBiometricsEnabled(
              false,
            );
          }
        } finally {
          if (isMounted) {
            setIsHydrated(true);
          }
        }
      };

    void hydrate();

    return () => {
      isMounted = false;
    };
  }, [
    authIsHydrated,
    refreshBiometricAvailability,
    storageKey,
  ]);

  const enableBiometrics =
    useCallback(
      async (): Promise<void> => {
        if (!user) {
          throw new Error(
            "You must be signed in before enabling biometric login.",
          );
        }

        setIsChangingBiometricSetting(
          true,
        );

        try {
          const hasHardware =
            await LocalAuthentication
              .hasHardwareAsync();

          if (!hasHardware) {
            throw new Error(
              "This device does not support biometric authentication.",
            );
          }

          const isEnrolled =
            await LocalAuthentication
              .isEnrolledAsync();

          if (!isEnrolled) {
            throw new Error(
              "No biometric identity is enrolled on this device. Add Face ID, Touch ID, or fingerprint in your device settings first.",
            );
          }

          const authenticationTypes =
            await LocalAuthentication
              .supportedAuthenticationTypesAsync();

          const label =
            getBiometricLabel(
              authenticationTypes,
            );

          setBiometricLabel(
            label,
          );

          const result =
            await LocalAuthentication
              .authenticateAsync({
                promptMessage:
                  `Enable ${label} for Khedmat`,
                cancelLabel:
                  "Cancel",
                fallbackLabel:
                  "Use device passcode",
                disableDeviceFallback:
                  false,
              });

          if (!result.success) {
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

            throw new Error(
              "Biometric authentication was not successful.",
            );
          }

          await writePreference(
            storageKey,
            true,
          );

          setBiometricsEnabled(
            true,
          );

          setIsBiometricAvailable(
            true,
          );
        } finally {
          setIsChangingBiometricSetting(
            false,
          );
        }
      },
      [
        storageKey,
        user,
      ],
    );

  const disableBiometrics =
    useCallback(
      async (): Promise<void> => {
        setIsChangingBiometricSetting(
          true,
        );

        try {
          await writePreference(
            storageKey,
            false,
          );

          setBiometricsEnabled(
            false,
          );
        } finally {
          setIsChangingBiometricSetting(
            false,
          );
        }
      },
      [storageKey],
    );

  const value =
    useMemo<BiometricSecurityContextValue>(
      () => ({
        isHydrated,
        biometricsEnabled,
        isBiometricAvailable,
        biometricLabel,
        isChangingBiometricSetting,
        enableBiometrics,
        disableBiometrics,
        refreshBiometricAvailability,
      }),
      [
        isHydrated,
        biometricsEnabled,
        isBiometricAvailable,
        biometricLabel,
        isChangingBiometricSetting,
        enableBiometrics,
        disableBiometrics,
        refreshBiometricAvailability,
      ],
    );

  return (
    <BiometricSecurityContext.Provider
      value={value}
    >
      {children}
    </BiometricSecurityContext.Provider>
  );
}

export function useBiometricSecurity(): BiometricSecurityContextValue {
  const context =
    useContext(
      BiometricSecurityContext,
    );

  if (!context) {
    throw new Error(
      "useBiometricSecurity must be used within a BiometricSecurityProvider.",
    );
  }

  return context;
}
