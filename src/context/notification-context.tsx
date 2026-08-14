import React, {
  type PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  listNotificationsForCurrentUser,
  markNotificationRead,
  markNotificationsRead,
} from "../repositories/notification-repository";
import type {
  NotificationRecipient,
  NotificationRecord,
} from "../types/notifications";

import { useSupabaseAuth } from "./supabase-auth-context";

interface NotificationContextValue {
  notifications: NotificationRecord[];
  isHydrated: boolean;
  isRefreshing: boolean;

  refreshNotifications: () => Promise<void>;

  markAsRead: (
    notificationId: string,
  ) => Promise<void>;

  markAllAsRead: (
    recipient: NotificationRecipient,
    recipientId: string,
  ) => Promise<void>;

  getNotifications: (
    recipient: NotificationRecipient,
    recipientId: string,
  ) => NotificationRecord[];

  getUnreadCount: (
    recipient: NotificationRecipient,
    recipientId: string,
  ) => number;

}

const NotificationContext =
  createContext<NotificationContextValue | null>(
    null,
  );

export function NotificationProvider({
  children,
}: PropsWithChildren) {
  const {
    user,
    isHydrated: authIsHydrated,
  } = useSupabaseAuth();

  const [
    remoteNotifications,
    setRemoteNotifications,
  ] = useState<NotificationRecord[]>([]);

  const [
    isHydrated,
    setIsHydrated,
  ] = useState(false);

  const [
    isRefreshing,
    setIsRefreshing,
  ] = useState(false);

  const currentUserId =
    user?.id ?? null;

  const refreshNotifications =
    useCallback(
      async (): Promise<void> => {
        if (!currentUserId) {
          setRemoteNotifications([]);
          return;
        }

        setIsRefreshing(true);

        try {
          const next =
            await listNotificationsForCurrentUser();

          setRemoteNotifications(next);
        } catch (error) {
          console.error(
            "Failed to load notifications from Supabase:",
            error,
          );

          throw error;
        } finally {
          setIsRefreshing(false);
        }
      },
      [currentUserId],
    );

  useEffect(() => {
    if (!authIsHydrated) {
      return;
    }

    let mounted = true;

    async function hydrate(): Promise<void> {
      setIsHydrated(false);

      if (!currentUserId) {
        setRemoteNotifications([]);
        setIsHydrated(true);
        return;
      }

      try {
        const next =
          await listNotificationsForCurrentUser();

        if (!mounted) {
          return;
        }

        setRemoteNotifications(next);

      } catch (error) {
        console.error(
          "Failed to hydrate notifications from Supabase:",
          error,
        );

        if (mounted) {
          setRemoteNotifications([]);
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
  }, [
    authIsHydrated,
    currentUserId,
  ]);

  const notifications =
    remoteNotifications;

  const markAsRead =
    useCallback(
      async (
        notificationId: string,
      ): Promise<void> => {
        const readAt =
          await markNotificationRead(
            notificationId,
          );

        setRemoteNotifications(
          (current) =>
            current.map(
              (notification) =>
                notification.id ===
                notificationId
                  ? {
                      ...notification,
                      read: true,
                      readAt,
                    }
                  : notification,
            ),
        );
      },
      [],
    );

  const markAllAsRead =
    useCallback(
      async (
        recipient: NotificationRecipient,
        recipientId: string,
      ): Promise<void> => {
        const readAt =
          await markNotificationsRead(
            recipient,
            recipientId,
          );

        setRemoteNotifications(
          (current) =>
            current.map(
              (notification) => {
                if (
                  notification.recipient !==
                    recipient ||
                  notification.recipientId !==
                    recipientId ||
                  notification.read
                ) {
                  return notification;
                }

                return {
                  ...notification,
                  read: true,
                  readAt,
                };
              },
            ),
        );
      },
      [],
    );

  const getNotifications =
    useCallback(
      (
        recipient: NotificationRecipient,
        recipientId: string,
      ): NotificationRecord[] =>
        notifications.filter(
          (notification) =>
            notification.recipient ===
              recipient &&
            notification.recipientId ===
              recipientId,
        ),
      [notifications],
    );

  const getUnreadCount =
    useCallback(
      (
        recipient: NotificationRecipient,
        recipientId: string,
      ): number =>
        notifications.filter(
          (notification) =>
            notification.recipient ===
              recipient &&
            notification.recipientId ===
              recipientId &&
            !notification.read,
        ).length,
      [notifications],
    );

  const value =
    useMemo<NotificationContextValue>(
      () => ({
        notifications,
        isHydrated,
        isRefreshing,
        refreshNotifications,
        markAsRead,
        markAllAsRead,
        getNotifications,
        getUnreadCount,
      }),
      [
        notifications,
        isHydrated,
        isRefreshing,
        refreshNotifications,
        markAsRead,
        markAllAsRead,
        getNotifications,
        getUnreadCount,
      ],
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
  const context =
    useContext(NotificationContext);

  if (!context) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider.",
    );
  }

  return context;
}
