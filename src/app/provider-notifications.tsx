import { router } from "expo-router";
import { useMemo } from "react";
import {
  FlatList,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import NotificationCard from "../components/khedmat/notification-card";
import {
  KhedmatPalette,
  Layout,
  Radius,
  Spacing,
  Typography,
} from "../constants/theme";
import { useLanguage } from "../context/languagecontext";
import { useNotifications } from "../context/notification-context";
import { useSession } from "../context/session-context";

export default function ProviderNotificationsScreen() {
  const { activeProviderId } =
    useSession();

  const {
    notifications: notificationState,
    getNotifications,
    getUnreadCount,
    markAllAsRead,
    markAsRead,
  } = useNotifications();

  const { isRTL, t } = useLanguage();

  const notifications = useMemo(
    () =>
      activeProviderId
        ? getNotifications(
            "provider",
            activeProviderId,
          )
        : [],
    [
      activeProviderId,
      getNotifications,
      notificationState,
    ],
  );

  const unreadCount = useMemo(
    () =>
      activeProviderId
        ? getUnreadCount(
            "provider",
            activeProviderId,
          )
        : 0,
    [
      activeProviderId,
      getUnreadCount,
      notificationState,
    ],
  );

  const handleMarkAllAsRead =
    async (): Promise<void> => {
      if (
        !activeProviderId ||
        unreadCount === 0
      ) {
        return;
      }

      try {
        await markAllAsRead(
          "provider",
          activeProviderId,
        );
      } catch (error) {
        console.error(
          "Failed to mark provider notifications as read:",
          error,
        );
      }
    };

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.content,
          notifications.length === 0 &&
            styles.emptyContent,
        ]}
        ListHeaderComponent={
          <View
            style={[
              styles.header,
              isRTL && styles.rowReverse,
            ]}
          >
            <Text
              style={[
                styles.title,
                isRTL
                  ? styles.textRight
                  : styles.textLeft,
              ]}
            >
              {t("notificationsTitle")}
            </Text>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t(
                "markAllAsRead",
              )}
              accessibilityState={{
                disabled:
                  !activeProviderId ||
                  unreadCount === 0,
              }}
              disabled={
                !activeProviderId ||
                unreadCount === 0
              }
              hitSlop={8}
              onPress={() => {
                void handleMarkAllAsRead();
              }}
              style={({ pressed }) => [
                styles.markAllButton,
                (!activeProviderId ||
                  unreadCount === 0) &&
                  styles.markAllButtonDisabled,
                pressed &&
                  Boolean(
                    activeProviderId,
                  ) &&
                  unreadCount > 0 &&
                  styles.markAllButtonPressed,
              ]}
            >
              <Text
                style={[
                  styles.markAllText,
                  (!activeProviderId ||
                    unreadCount === 0) &&
                    styles.markAllTextDisabled,
                  isRTL
                    ? styles.textRight
                    : styles.textLeft,
                ]}
              >
                {t("markAllAsRead")}
              </Text>
            </Pressable>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text
              style={[
                styles.emptyTitle,
                isRTL
                  ? styles.textRight
                  : styles.textLeft,
              ]}
            >
              {t(
                "notificationsEmptyTitle",
              )}
            </Text>

            <Text
              style={[
                styles.emptyBody,
                isRTL
                  ? styles.textRight
                  : styles.textLeft,
              ]}
            >
              {t(
                "providerNotificationsEmptyBody",
              )}
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <NotificationCard
            notification={item}
            onPress={async () => {
              try {
                if (!item.read) {
                  await markAsRead(
                    item.id,
                  );
                }
              } catch (error) {
                console.error(
                  "Failed to mark provider notification as read:",
                  error,
                );
              }

              if (item.action) {
                router.push({
                  pathname:
                    item.action
                      .route as never,
                  params:
                    item.action.params,
                });
              }
            }}
          />
        )}
        showsVerticalScrollIndicator={
          false
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:
      KhedmatPalette.blue050,
  },

  content: {
    width: "100%",
    maxWidth: Layout.contentMaxWidth,
    alignSelf: "center",
    padding:
      Layout.screenPadding,
    paddingBottom: 120,
  },

  emptyContent: {
    flexGrow: 1,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent:
      "space-between",
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },

  rowReverse: {
    flexDirection: "row-reverse",
  },

  title: {
    ...Typography.screenTitle,
    flex: 1,
    color:
      KhedmatPalette.textPrimary,
  },

  markAllButton: {
    minHeight:
      Layout.minimumTouchTarget,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Spacing.sm,
    borderRadius: Radius.md,
  },

  markAllButtonPressed: {
    opacity: 0.72,
  },

  markAllButtonDisabled: {
    opacity: 0.6,
  },

  markAllText: {
    ...Typography.label,
    color:
      KhedmatPalette.blue500,
  },

  markAllTextDisabled: {
    color:
      KhedmatPalette.disabled,
  },

  empty: {
    flex: 1,
    minHeight: 320,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Spacing.xl,
  },

  emptyTitle: {
    ...Typography.sectionTitle,
    color:
      KhedmatPalette.textPrimary,
    marginBottom: Spacing.sm,
    textAlign: "center",
  },

  emptyBody: {
    ...Typography.bodyStyle,
    color:
      KhedmatPalette.textMuted,
    textAlign: "center",
    maxWidth:
      Layout.readableTextMaxWidth,
  },

  textLeft: {
    textAlign: "left",
  },

  textRight: {
    textAlign: "right",
  },
});