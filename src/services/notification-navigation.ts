import type {
    NotificationAction,
    NotificationRecipient,
    NotificationType,
} from "../types/notifications";

export type PushNotificationData = {
  notificationId?: string;
  recipient?: NotificationRecipient;
  type?: NotificationType;
  bookingId?: string;
};

const NOTIFICATION_TYPES: NotificationType[] = [
  "booking-created",
  "booking-confirmed",
  "booking-rescheduled",
  "booking-cancelled",
  "booking-completed",
  "booking-reminder",
  "message",
  "system",
];

export function buildNotificationAction({
  recipient,
  type,
  bookingId,
}: {
  recipient: NotificationRecipient;
  type: NotificationType;
  bookingId?: string;
}): NotificationAction | undefined {
  if (
    type === "booking-created" &&
    recipient === "provider" &&
    bookingId
  ) {
    return {
      route: "/provider-request-details",
      params: {
        bookingId,
      },
    };
  }

  if (
    (type === "booking-confirmed" ||
      type === "booking-completed") &&
    recipient === "customer" &&
    bookingId
  ) {
    return {
      route: "/booking-record-details",
      params: {
        bookingId,
      },
    };
  }

  if (type === "message") {
    return {
      route:
        recipient === "provider"
          ? "/(provider-tabs)/messages"
          : "/(tabs)/messages",
      ...(bookingId
        ? {
            params: {
              bookingId,
            },
          }
        : {}),
    };
  }

  return undefined;
}

export function parsePushNotificationData(
  value: unknown,
): PushNotificationData {
  if (
    !value ||
    typeof value !== "object" ||
    Array.isArray(value)
  ) {
    return {};
  }

  const record = value as Record<string, unknown>;

  return {
    notificationId: readNonEmptyString(
      record.notificationId,
    ),
    recipient: parseRecipient(
      record.recipient,
    ),
    type: parseNotificationType(
      record.type,
    ),
    bookingId: readNonEmptyString(
      record.bookingId,
    ),
  };
}

export function buildActionFromPushData(
  value: unknown,
): {
  notificationId?: string;
  action?: NotificationAction;
} {
  const parsed = parsePushNotificationData(value);

  if (
    !parsed.recipient ||
    !parsed.type
  ) {
    return {
      notificationId: parsed.notificationId,
    };
  }

  return {
    notificationId: parsed.notificationId,
    action: buildNotificationAction({
      recipient: parsed.recipient,
      type: parsed.type,
      bookingId: parsed.bookingId,
    }),
  };
}

function parseRecipient(
  value: unknown,
): NotificationRecipient | undefined {
  if (
    value === "customer" ||
    value === "provider"
  ) {
    return value;
  }

  return undefined;
}

function parseNotificationType(
  value: unknown,
): NotificationType | undefined {
  if (
    typeof value !== "string" ||
    !NOTIFICATION_TYPES.includes(
      value as NotificationType,
    )
  ) {
    return undefined;
  }

  return value as NotificationType;
}

function readNonEmptyString(
  value: unknown,
): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const normalized = value.trim();

  return normalized
    ? normalized
    : undefined;
}