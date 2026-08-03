import { NotificationRecord } from "../types/notifications";

export const mockNotifications: NotificationRecord[] = [
  {
    id: "notification-1",
    recipient: "customer",
    recipientId: "customer-1",
    type: "booking-confirmed",
    title: "Booking confirmed",
    body: "Ahmad Plumbing accepted your booking request.",
    priority: "high",
    bookingId: "booking-1",
    read: false,
    createdAt: new Date().toISOString(),
    action: {
      route: "/booking-details",
      params: {
        bookingId: "booking-1",
      },
    },
  },
  {
    id: "notification-2",
    recipient: "provider",
    recipientId: "provider-1",
    type: "booking-created",
    title: "New booking request",
    body: "A customer requested your plumbing service.",
    priority: "high",
    bookingId: "booking-2",
    read: false,
    createdAt: new Date().toISOString(),
    action: {
      route: "/(provider-tabs)/requests",
      params: {
        bookingId: "booking-2",
      },
    },
  },
];