import {
  router,
  useFocusEffect,
} from "expo-router";
import {
  useCallback,
  useMemo,
} from "react";
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
import { useSupabaseAuth } from "../context/supabase-auth-context";

export default function CustomerNotificationsScreen() {
  const {
    user,
    isHydrated: authIsHydrated,
  } = useSupabaseAuth();

  const {
    refreshNotifications,
    getNotifications,
    getUnreadCount,
    markAllAsRead,
    markAsRead,
  } = useNotifications();

  const {
    isRTL,
    t,
  } = useLanguage();

  const customerId =
    user?.id ?? null;

  useFocusEffect(
    useCallback(() => {
      if (
        !authIsHydrated ||
        !customerId
      ) {
        return;
      }

      void refreshNotifications().catch(
        (error) => {
          console.error(
            "Failed to refresh customer notifications:",
            error,
          );
        },
      );
    }, [
      authIsHydrated,
      customerId,
      refreshNotifications,
    ]),
  );

  const notifications =
    useMemo(
      () =>
        customerId
          ? getNotifications(
              "customer",
              customerId,
            )
          : [],
      [
        customerId,
        getNotifications,
      ],
    );

  const unreadCount =
    useMemo(
      () =>
        customerId
          ? getUnreadCount(
              "customer",
              customerId,
            )
          : 0,
      [
        customerId,
        getUnreadCount,
      ],
    );

  const handleMarkAllAsRead =
    async (): Promise<void> => {
      if (
        !customerId ||
        unreadCount === 0
      ) {
        return;
      }

      try {
        await markAllAsRead(
          "customer",
          customerId,
        );
      } catch (error) {
        console.error(
          "Failed to mark customer notifications as read:",
          error,
        );
      }
    };

  return (
    <SafeAreaView
      style={styles.container}
    >
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
              isRTL &&
                styles.rowReverse,
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
              {t(
                "notificationsTitle",
              )}
            </Text>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t(
                "markAllAsRead",
              )}
              accessibilityState={{
                disabled:
                  !customerId ||
                  unreadCount === 0,
              }}
              disabled={
                !customerId ||
                unreadCount === 0
              }
              hitSlop={8}
              onPress={() => {
                void handleMarkAllAsRead();
              }}
              style={({ pressed }) => [
                styles.markAllButton,
                (!customerId ||
                  unreadCount === 0) &&
                  styles.markAllButtonDisabled,
                pressed &&
                  Boolean(customerId) &&
                  unreadCount > 0 &&
                  styles.markAllButtonPressed,
              ]}
            >
              <Text
                style={[
                  styles.markAllText,
                  (!customerId ||
                    unreadCount === 0) &&
                    styles.markAllTextDisabled,
                  isRTL
                    ? styles.textRight
                    : styles.textLeft,
                ]}
              >
                {t(
                  "markAllAsRead",
                )}
              </Text>
            </Pressable>
          </View>
        }
        ListEmptyComponent={
          <View
            style={styles.empty}
          >
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
                "customerNotificationsEmptyBody",
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
                  "Failed to mark customer notification as read:",
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
      KhedmatPalette.white,
  },

  content: {
    width: "100%",
    maxWidth:
      Layout.contentMaxWidth,
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
    marginBottom:
      Spacing.lg,
  },

  rowReverse: {
    flexDirection:
      "row-reverse",
  },

  title: {
    ...Typography.screenTitle,
    flex: 1,
    color:
      KhedmatPalette.navy900,
    fontSize: 28,
    lineHeight: 35,
  },

  markAllButton: {
    minHeight: 36,
    justifyContent:
      "center",
    paddingHorizontal:
      Spacing.sm,
    borderRadius:
      Radius.pill,
    backgroundColor:
      KhedmatPalette.white,
  },

  markAllButtonPressed: {
    opacity: 0.75,
  },

  markAllButtonDisabled: {
    backgroundColor:
      KhedmatPalette.white,
  },

  markAllText: {
    ...Typography.captionStyle,
    color:
      KhedmatPalette.navy900,
    fontWeight: "600",
  },

  markAllTextDisabled: {
    color:
      KhedmatPalette.textMuted,
  },

  empty: {
    flex: 1,
    minHeight: 280,
    alignItems: "center",
    justifyContent:
      "center",
    padding:
      Spacing.xl,
  },

  emptyTitle: {
    ...Typography.sectionTitle,
    color:
      KhedmatPalette.navy900,
  },

  emptyBody: {
    ...Typography.bodyStyle,
    maxWidth: 340,
    marginTop:
      Spacing.xs,
    color:
      KhedmatPalette.textSecondary,
  },

  textLeft: {
    textAlign: "left",
    writingDirection: "ltr",
  },

  textRight: {
    textAlign: "right",
    writingDirection: "rtl",
  },
});
