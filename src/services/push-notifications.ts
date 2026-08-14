import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

import { supabase } from "../lib/supabase";
import { getOrCreateInstallationId } from "./installation-id";

export const KHEDMAT_NOTIFICATION_CHANNEL_ID =
  "khedmat-default";

let notificationClientConfigured = false;

export type NotificationRuntimeStatus = {
  platform:
    | "ios"
    | "android"
    | "web"
    | "other";
  isPhysicalDevice: boolean;
  isExpoGo: boolean;
  remotePushSupported: boolean;
  reason?: string;
};

export type ExpoPushTokenResult =
  | {
      ok: true;
      token: string;
    }
  | {
      ok: false;
      reason: string;
    };

export type PushDeviceRegistrationResult =
  | {
      ok: true;
      deviceId: string;
      installationId: string;
      pushToken: string;
    }
  | {
      ok: false;
      reason: string;
    };

export function configureNotificationClient(): void {
  if (notificationClientConfigured) {
    return;
  }

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });

  notificationClientConfigured = true;
}

export async function configureAndroidNotificationChannel(): Promise<void> {
  if (Platform.OS !== "android") {
    return;
  }

  await Notifications.setNotificationChannelAsync(
    KHEDMAT_NOTIFICATION_CHANNEL_ID,
    {
      name: "Khedmat notifications",
      description:
        "Booking, message, and account notifications from Khedmat.",
      importance:
        Notifications.AndroidImportance.HIGH,
      sound: "default",
      vibrationPattern: [
        0,
        250,
        250,
        250,
      ],
      enableVibrate: true,
      showBadge: true,
    },
  );
}

export function getNotificationRuntimeStatus(): NotificationRuntimeStatus {
  const platform =
    getSupportedPlatform();

  const isExpoGo =
    Constants.expoGoConfig !== null;

  const isPhysicalDevice =
    Device.isDevice;

  if (
    platform !== "ios" &&
    platform !== "android"
  ) {
    return {
      platform,
      isPhysicalDevice,
      isExpoGo,
      remotePushSupported: false,
      reason:
        "Remote push registration is only supported by the Khedmat iOS and Android apps.",
    };
  }

  if (isExpoGo) {
    return {
      platform,
      isPhysicalDevice,
      isExpoGo,
      remotePushSupported: false,
      reason:
        "Remote push notifications require a Khedmat development or production build.",
    };
  }

  if (!isPhysicalDevice) {
    return {
      platform,
      isPhysicalDevice,
      isExpoGo,
      remotePushSupported: false,
      reason:
        "Remote push registration requires a physical device.",
    };
  }

  return {
    platform,
    isPhysicalDevice,
    isExpoGo,
    remotePushSupported: true,
  };
}

export async function getNotificationPermissionStatus(): Promise<
  Notifications.NotificationPermissionsStatus
> {
  return Notifications.getPermissionsAsync();
}

export async function notificationPermissionAllowsDelivery(): Promise<boolean> {
  const permissions =
    await getNotificationPermissionStatus();

  return notificationPermissionAllowsDeliveryFromStatus(
    permissions,
  );
}

export async function requestNotificationPermission(): Promise<
  Notifications.NotificationPermissionsStatus
> {
  await configureAndroidNotificationChannel();

  return Notifications.requestPermissionsAsync({
    ios: {
      allowAlert: true,
      allowBadge: true,
      allowSound: true,
    },
  });
}

export async function getExpoPushTokenForCurrentInstallation(): Promise<
  ExpoPushTokenResult
> {
  const runtimeStatus =
    getNotificationRuntimeStatus();

  if (!runtimeStatus.remotePushSupported) {
    return {
      ok: false,
      reason:
        runtimeStatus.reason ??
        "Remote push registration is not supported in the current runtime.",
    };
  }

  await configureAndroidNotificationChannel();

  let permissionStatus =
    await getNotificationPermissionStatus();

  if (
    !notificationPermissionAllowsDeliveryFromStatus(
      permissionStatus,
    )
  ) {
    permissionStatus =
      await requestNotificationPermission();
  }

  if (
    !notificationPermissionAllowsDeliveryFromStatus(
      permissionStatus,
    )
  ) {
    return {
      ok: false,
      reason:
        "Notification permission was not granted.",
    };
  }

  const projectId =
    getEasProjectId();

  if (!projectId) {
    return {
      ok: false,
      reason:
        "Khedmat EAS project ID is missing from the app configuration.",
    };
  }

  try {
    const pushToken =
      await Notifications.getExpoPushTokenAsync({
        projectId,
      });

    const token =
      pushToken.data.trim();

    if (!token) {
      return {
        ok: false,
        reason:
          "Expo Push Service returned an empty push token.",
      };
    }

    return {
      ok: true,
      token,
    };
  } catch (error) {
    console.error(
      "Failed to obtain Expo push token:",
      error,
    );

    return {
      ok: false,
      reason:
        "Khedmat could not obtain an Expo push token.",
    };
  }
}

export async function registerPushDeviceForCurrentInstallation(): Promise<
  PushDeviceRegistrationResult
> {
  const runtimeStatus =
    getNotificationRuntimeStatus();

  if (!runtimeStatus.remotePushSupported) {
    return {
      ok: false,
      reason:
        runtimeStatus.reason ??
        "Remote push registration is not supported in the current runtime.",
    };
  }

  if (
    runtimeStatus.platform !== "ios" &&
    runtimeStatus.platform !== "android"
  ) {
    return {
      ok: false,
      reason:
        "Unsupported push platform.",
    };
  }

  const pushTokenResult =
    await getExpoPushTokenForCurrentInstallation();

  if (!pushTokenResult.ok) {
    return pushTokenResult;
  }

  const projectId =
    getEasProjectId();

  if (!projectId) {
    return {
      ok: false,
      reason:
        "Khedmat EAS project ID is missing from the app configuration.",
    };
  }

  try {
    const installationId =
      await getOrCreateInstallationId();

    const {
      data: deviceId,
      error,
    } = await supabase.rpc(
      "register_push_device",
      {
        p_installation_id:
          installationId,
        p_platform:
          runtimeStatus.platform,
        p_push_provider:
          "expo",
        p_push_token:
          pushTokenResult.token,
        p_project_id:
          projectId,
        p_app_version:
          getAppVersion(),
      },
    );

    if (error) {
      console.error(
        "Failed to register push device:",
        error,
      );

      return {
        ok: false,
        reason:
          "Khedmat could not register this device for push notifications.",
      };
    }

    if (
      typeof deviceId !== "string" ||
      !deviceId.trim()
    ) {
      return {
        ok: false,
        reason:
          "Push device registration returned an invalid device ID.",
      };
    }

    return {
      ok: true,
      deviceId:
        deviceId.trim(),
      installationId,
      pushToken:
        pushTokenResult.token,
    };
  } catch (error) {
    console.error(
      "Failed to register the current Khedmat installation for push notifications:",
      error,
    );

    return {
      ok: false,
      reason:
        "Khedmat could not register this installation for push notifications.",
    };
  }
}

function notificationPermissionAllowsDeliveryFromStatus(
  permissions:
    Notifications.NotificationPermissionsStatus,
): boolean {
  if (permissions.granted) {
    return true;
  }

  if (
    Platform.OS === "ios" &&
    permissions.ios?.status ===
      Notifications.IosAuthorizationStatus.PROVISIONAL
  ) {
    return true;
  }

  return false;
}

function getEasProjectId(): string | null {
  const projectId =
    Constants.expoConfig?.extra?.eas
      ?.projectId ??
    Constants.easConfig?.projectId;

  if (
    typeof projectId !== "string" ||
    !projectId.trim()
  ) {
    return null;
  }

  return projectId.trim();
}

function getAppVersion(): string | undefined {
  const version =
    Constants.expoConfig?.version;

  if (
    typeof version !== "string" ||
    !version.trim()
  ) {
    return undefined;
  }

  return version.trim();
}

function getSupportedPlatform():
  | "ios"
  | "android"
  | "web"
  | "other" {
  if (Platform.OS === "ios") {
    return "ios";
  }

  if (Platform.OS === "android") {
    return "android";
  }

  if (Platform.OS === "web") {
    return "web";
  }

  return "other";
}