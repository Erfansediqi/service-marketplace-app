import { NotificationRecord } from "../types/notifications";

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

    title: "New booking request",

    body: `${options.customerName} requested your service.`,

    priority: "high",

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

    title: "Booking confirmed",

    body: `${options.providerName} accepted your booking.`,

    priority: "high",

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

    title: "Booking completed",

    body: `${options.providerName} marked your booking as completed.`,

    priority: "normal",

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