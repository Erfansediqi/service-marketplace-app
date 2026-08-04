import type { NotificationRecord } from "../types/notifications";

function createNotificationId(): string {
  return `notification-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}

export function createBookingCreatedNotification(options: {
  providerId: string;
  bookingId: string;
  customerName: string;
}): NotificationRecord {
  return {
    id: createNotificationId(),

    recipient: "provider",
    recipientId: options.providerId,

    type: "booking-created",
    priority: "high",

    titleKey: "notificationBookingCreatedTitle",
    bodyKey: "notificationBookingCreatedBody",
    bodyParams: {
      customerName: options.customerName,
    },

    bookingId: options.bookingId,

    read: false,
    createdAt: new Date().toISOString(),

    action: {
      route: "/(provider-tabs)/requests",
      params: {
        bookingId: options.bookingId,
      },
    },
  };
}

export function createBookingConfirmedNotification(options: {
  customerId: string;
  bookingId: string;
  providerName: string;
}): NotificationRecord {
  return {
    id: createNotificationId(),

    recipient: "customer",
    recipientId: options.customerId,

    type: "booking-confirmed",
    priority: "high",

    titleKey: "notificationBookingConfirmedTitle",
    bodyKey: "notificationBookingConfirmedBody",
    bodyParams: {
      providerName: options.providerName,
    },

    bookingId: options.bookingId,

    read: false,
    createdAt: new Date().toISOString(),

    action: {
      route: "/booking-details",
      params: {
        bookingId: options.bookingId,
      },
    },
  };
}

export function createBookingCompletedNotification(options: {
  customerId: string;
  bookingId: string;
  providerName: string;
}): NotificationRecord {
  return {
    id: createNotificationId(),

    recipient: "customer",
    recipientId: options.customerId,

    type: "booking-completed",
    priority: "normal",

    titleKey: "notificationBookingCompletedTitle",
    bodyKey: "notificationBookingCompletedBody",
    bodyParams: {
      providerName: options.providerName,
    },

    bookingId: options.bookingId,

    read: false,
    createdAt: new Date().toISOString(),

    action: {
      route: "/booking-details",
      params: {
        bookingId: options.bookingId,
      },
    },
  };
}