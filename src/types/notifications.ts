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

  title: string;

  body: string;

  priority: NotificationPriority;

  bookingId?: string;

  action?: NotificationAction;

  read: boolean;

  createdAt: string;

  readAt?: string;
}