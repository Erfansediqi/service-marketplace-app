import React, {
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  createBookingCompletedNotification,
  createBookingConfirmedNotification,
  createBookingCreatedNotification,
} from "../services/notification-service";

import { StorageService } from "../services/storage";

import {
  NotificationRecipient,
  NotificationRecord,
} from "../types/notifications";

const STORAGE_KEY = "@khedmat_notifications";

interface NotificationContextValue {
  notifications: NotificationRecord[];
  isHydrated: boolean;

  addNotification: (
    notification: NotificationRecord
  ) => Promise<void>;

  removeNotification: (
    notificationId: string
  ) => Promise<void>;

  markAsRead: (
    notificationId: string
  ) => Promise<void>;

  markAllAsRead: (
    recipient: NotificationRecipient,
    recipientId: string
  ) => Promise<void>;

  createProviderBookingNotification: (
    options: {
      providerId: string;
      bookingId: string;
      customerName: string;
    }
  ) => Promise<void>;

  createCustomerBookingConfirmedNotification: (
    options: {
      customerId: string;
      bookingId: string;
      providerName: string;
    }
  ) => Promise<void>;

  createCustomerBookingCompletedNotification: (
    options: {
      customerId: string;
      bookingId: string;
      providerName: string;
    }
  ) => Promise<void>;

  getNotifications: (
    recipient: NotificationRecipient,
    recipientId: string
  ) => NotificationRecord[];

  getUnreadCount: (
    recipient: NotificationRecipient,
    recipientId: string
  ) => number;
}

const NotificationContext =
  createContext<NotificationContextValue | null>(
    null
  );

export function NotificationProvider({
  children,
}: PropsWithChildren) {
  const [notifications, setNotifications] =
    useState<NotificationRecord[]>([]);

  const notificationsRef =
    useRef<NotificationRecord[]>([]);

  const [isHydrated, setIsHydrated] =
    useState(false);

  useEffect(() => {
    let mounted = true;

    async function hydrate() {
      try {
        const stored =
          await StorageService.get<
            NotificationRecord[]
          >(STORAGE_KEY);

        if (!mounted) {
          return;
        }

        const hydrated =
  stored ?? [];

        notificationsRef.current =
          hydrated;

        setNotifications(hydrated);
      } catch (error) {
        console.error(
          "Failed to hydrate notifications:",
          error
        );

        if (mounted) {
          notificationsRef.current = [];
setNotifications([]);

          notificationsRef.current = [];
setNotifications([]);
        }
      } finally {
        if (mounted) {
          setIsHydrated(true);
        }
      }
    }

    void hydrate();

    return () => {
      mounted = false;
    };
  }, []);

  const persist = useCallback(
    async (
      next: NotificationRecord[]
    ): Promise<void> => {
      notificationsRef.current =
        next;

      setNotifications(next);

      await StorageService.save(
        STORAGE_KEY,
        next
      );
    },
    []
  );

  const addNotification =
    useCallback(
      async (
        notification: NotificationRecord
      ): Promise<void> => {
        await persist([
          notification,
          ...notificationsRef.current,
        ]);
      },
      [persist]
    );

    const createProviderBookingNotification =
  useCallback(
    async (options: {
      providerId: string;
      bookingId: string;
      customerName: string;
    }): Promise<void> => {
      await addNotification(
        createBookingCreatedNotification(options)
      );
    },
    [addNotification]
  );

const createCustomerBookingConfirmedNotification =
  useCallback(
    async (options: {
      customerId: string;
      bookingId: string;
      providerName: string;
    }): Promise<void> => {
      await addNotification(
        createBookingConfirmedNotification(options)
      );
    },
    [addNotification]
  );

const createCustomerBookingCompletedNotification =
  useCallback(
    async (options: {
      customerId: string;
      bookingId: string;
      providerName: string;
    }): Promise<void> => {
      await addNotification(
        createBookingCompletedNotification(options)
      );
    },
    [addNotification]
  );

  const removeNotification =
    useCallback(
      async (
        notificationId: string
      ): Promise<void> => {
        await persist(
          notificationsRef.current.filter(
            (notification) =>
              notification.id !==
              notificationId
          )
        );
      },
      [persist]
    );

  const markAsRead =
    useCallback(
      async (
        notificationId: string
      ): Promise<void> => {
        await persist(
          notificationsRef.current.map(
            (notification) =>
              notification.id ===
              notificationId
                ? {
                    ...notification,
                    read: true,
                    readAt:
                      new Date().toISOString(),
                  }
                : notification
          )
        );
      },
      [persist]
    );

  const markAllAsRead =
    useCallback(
      async (
        recipient: NotificationRecipient,
        recipientId: string
      ): Promise<void> => {
        await persist(
          notificationsRef.current.map(
            (notification) => {
              if (
                notification.recipient !==
                  recipient ||
                notification.recipientId !==
                  recipientId
              ) {
                return notification;
              }

              return {
                ...notification,
                read: true,
                readAt:
                  new Date().toISOString(),
              };
            }
          )
        );
      },
      [persist]
    );

  const getNotifications =
    useCallback(
      (
        recipient: NotificationRecipient,
        recipientId: string
      ): NotificationRecord[] =>
        notificationsRef.current.filter(
          (notification) =>
            notification.recipient ===
              recipient &&
            notification.recipientId ===
              recipientId
        ),
      []
    );

  const getUnreadCount =
    useCallback(
      (
        recipient: NotificationRecipient,
        recipientId: string
      ): number =>
        notificationsRef.current.filter(
          (notification) =>
            notification.recipient ===
              recipient &&
            notification.recipientId ===
              recipientId &&
            !notification.read
        ).length,
      []
    );

  const value =
    useMemo<NotificationContextValue>(
      () => ({
  notifications,
  isHydrated,
  addNotification,
  removeNotification,
  markAsRead,
  markAllAsRead,

  createProviderBookingNotification,
  createCustomerBookingConfirmedNotification,
  createCustomerBookingCompletedNotification,

  getNotifications,
  getUnreadCount,
}),
      [
  notifications,
  isHydrated,
  addNotification,
  removeNotification,
  markAsRead,
  markAllAsRead,
  createProviderBookingNotification,
  createCustomerBookingConfirmedNotification,
  createCustomerBookingCompletedNotification,
  getNotifications,
  getUnreadCount,
]
    );

  return (
    <NotificationContext.Provider
      value={value}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications(): NotificationContextValue {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider."
    );
  }

  return context;
}