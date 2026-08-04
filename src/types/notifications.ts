import type { TranslationKeys } from "../translations";

export type NotificationRecipient =
  | "customer"
  | "provider";

export type NotificationType =
  | "booking-created"
  | "booking-confirmed"
  | "booking-rescheduled"
  | "booking-cancelled"
  | "booking-completed"
  | "booking-reminder"
  | "message"
  | "system";

export type NotificationPriority =
  | "low"
  | "normal"
  | "high";

export interface NotificationAction {
  route: string;
  params?: Record<string, string>;
}

export interface NotificationRecord {
  id: string;

  recipient: NotificationRecipient;
  recipientId: string;

  type: NotificationType;
  priority: NotificationPriority;

  /**
   * New localized notification content.
   */
  titleKey?: TranslationKeys;
  bodyKey?: TranslationKeys;
  bodyParams?: Record<string, string>;

  /**
   * Legacy content retained so notifications already stored
   * in AsyncStorage continue rendering after this migration.
   */
  title?: string;
  body?: string;

  bookingId?: string;
  action?: NotificationAction;

  read: boolean;
  createdAt: string;
  readAt?: string;
}