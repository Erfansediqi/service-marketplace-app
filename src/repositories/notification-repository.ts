import type {
  Database,
  Json,
} from "../types/database";
import type {
  NotificationPriority,
  NotificationRecipient,
  NotificationRecord,
  NotificationType,
} from "../types/notifications";

import { supabase } from "../lib/supabase";
import { buildNotificationAction } from "../services/notification-navigation";

type NotificationRow =
  Database["public"]["Tables"]["notifications"]["Row"];

type NotificationListOptions = {
  recipient?: NotificationRecipient;
  providerId?: string;
  limit?: number;
};

const DEFAULT_LIMIT = 100;
const MAX_LIMIT = 250;

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

const NOTIFICATION_PRIORITIES: NotificationPriority[] = [
  "low",
  "normal",
  "high",
];

export async function listNotificationsForCurrentUser(
  options: NotificationListOptions = {},
): Promise<NotificationRecord[]> {
  const limit = normalizeLimit(options.limit);

  let query = supabase
    .from("notifications")
    .select("*")
    .order("created_at", {
      ascending: false,
    })
    .limit(limit);

  if (options.recipient) {
    query = query.eq(
      "recipient_role",
      options.recipient,
    );
  }

  if (options.recipient === "provider") {
    if (!options.providerId) {
      return [];
    }

    query = query.eq(
      "recipient_provider_id",
      options.providerId,
    );
  }

  if (options.recipient === "customer") {
    query = query.is(
      "recipient_provider_id",
      null,
    );
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(
      `Failed to load notifications: ${error.message}`,
    );
  }

  return (data ?? []).map(
    mapNotificationRow,
  );
}

export async function markNotificationRead(
  notificationId: string,
): Promise<string> {
  const normalizedId =
    notificationId.trim();

  if (!normalizedId) {
    throw new Error(
      "A notification ID is required.",
    );
  }

  const readAt =
    new Date().toISOString();

  const { data, error } = await supabase
    .from("notifications")
    .update({
      read_at: readAt,
    })
    .eq("id", normalizedId)
    .select("id")
    .maybeSingle();

  if (error) {
    throw new Error(
      `Failed to mark notification as read: ${error.message}`,
    );
  }

  if (!data) {
    throw new Error(
      "Notification was not found or is not accessible.",
    );
  }

  return readAt;
}

export async function markNotificationsRead(
  recipient: NotificationRecipient,
  recipientId: string,
): Promise<string> {
  const normalizedRecipientId =
    recipientId.trim();

  if (!normalizedRecipientId) {
    throw new Error(
      "A notification recipient ID is required.",
    );
  }

  const readAt =
    new Date().toISOString();

  let query = supabase
    .from("notifications")
    .update({
      read_at: readAt,
    })
    .eq(
      "recipient_role",
      recipient,
    )
    .is("read_at", null);

  if (recipient === "provider") {
    query = query.eq(
      "recipient_provider_id",
      normalizedRecipientId,
    );
  } else {
    query = query.is(
      "recipient_provider_id",
      null,
    );
  }

  const { error } = await query;

  if (error) {
    throw new Error(
      `Failed to mark notifications as read: ${error.message}`,
    );
  }

  return readAt;
}

export function mapNotificationRow(
  row: NotificationRow,
): NotificationRecord {
  const recipient =
    parseRecipient(
      row.recipient_role,
    );

  const type =
    parseNotificationType(
      row.type,
    );

  const priority =
    parsePriority(
      row.priority,
    );

  const bookingId =
    row.booking_id ?? undefined;

  return {
    id: row.id,

    recipient,
    recipientId:
      recipient === "provider"
        ? requireProviderRecipientId(
            row.recipient_provider_id,
          )
        : row.recipient_user_id,

    type,
    priority,

    titleKey:
      row.title_key as NotificationRecord["titleKey"],

    bodyKey:
      row.body_key as NotificationRecord["bodyKey"],

    bodyParams:
      mapBodyParams(
        row.body_params,
      ),

    bookingId,

    action:
      buildNotificationAction({
        recipient,
        type,
        bookingId,
      }),

    read:
      row.read_at !== null,

    createdAt:
      row.created_at,

    readAt:
      row.read_at ?? undefined,
  };
}

function parseRecipient(
  value: string,
): NotificationRecipient {
  if (
    value === "customer" ||
    value === "provider"
  ) {
    return value;
  }

  throw new Error(
    `Unsupported notification recipient: ${value}`,
  );
}

function parseNotificationType(
  value: string,
): NotificationType {
  if (
    NOTIFICATION_TYPES.includes(
      value as NotificationType,
    )
  ) {
    return value as NotificationType;
  }

  throw new Error(
    `Unsupported notification type: ${value}`,
  );
}

function parsePriority(
  value: string,
): NotificationPriority {
  if (
    NOTIFICATION_PRIORITIES.includes(
      value as NotificationPriority,
    )
  ) {
    return value as NotificationPriority;
  }

  throw new Error(
    `Unsupported notification priority: ${value}`,
  );
}

function requireProviderRecipientId(
  providerId: string | null,
): string {
  if (!providerId) {
    throw new Error(
      "Provider notification is missing recipient_provider_id.",
    );
  }

  return providerId;
}

function mapBodyParams(
  value: Json,
): Record<string, string> | undefined {
  if (
    value === null ||
    Array.isArray(value) ||
    typeof value !== "object"
  ) {
    return undefined;
  }

  const entries =
    Object.entries(value);

  if (entries.length === 0) {
    return undefined;
  }

  const result:
    Record<string, string> = {};

  for (
    const [key, item]
    of entries
  ) {
    if (
      typeof item === "string" ||
      typeof item === "number" ||
      typeof item === "boolean"
    ) {
      result[key] =
        String(item);
    }
  }

  return Object.keys(result).length > 0
    ? result
    : undefined;
}

function normalizeLimit(
  value?: number,
): number {
  if (
    value === undefined ||
    !Number.isFinite(value)
  ) {
    return DEFAULT_LIMIT;
  }

  return Math.min(
    MAX_LIMIT,
    Math.max(
      1,
      Math.trunc(value),
    ),
  );
}
