import { router } from "expo-router";
import { useMemo } from "react";
import {
    FlatList,
    SafeAreaView,
    StyleSheet,
    Text,
    View,
} from "react-native";

import NotificationCard from "../components/khedmat/notification-card";
import {
    KhedmatPalette,
    Layout,
    Spacing,
    Typography,
} from "../constants/theme";
import { useNotifications } from "../context/notification-context";
import { useSession } from "../context/session-context";

export default function ProviderNotificationsScreen() {
  const {
    activeProviderId,
  } = useSession();

  const {
    getNotifications,
    markAsRead,
  } = useNotifications();

  const notifications = useMemo(
    () =>
      activeProviderId
        ? getNotifications(
            "provider",
            activeProviderId
          )
        : [],
    [
      activeProviderId,
      getNotifications,
    ]
  );

  return (
    <SafeAreaView
      style={styles.container}
    >
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        contentContainerStyle={
          styles.content
        }
        ListHeaderComponent={
          <Text style={styles.title}>
            Notifications
          </Text>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>
              No notifications yet
            </Text>

            <Text style={styles.emptyBody}>
              New booking requests and
              customer updates will
              appear here.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <NotificationCard
            notification={item}
            onPress={async () => {
              await markAsRead(
                item.id
              );

              if (item.action) {
                router.push({
                  pathname:
                    item.action.route as never,
                  params:
                    item.action.params,
                });
              }
            }}
          />
        )}
      />
    </SafeAreaView>
  );
}

const styles =
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor:
        KhedmatPalette.blue050,
    },

    content: {
      padding:
        Layout.screenPadding,
      paddingBottom: 120,
    },

    title: {
      ...Typography.screenTitle,
      color:
        KhedmatPalette.textPrimary,
      marginBottom:
        Spacing.xl,
    },

    empty: {
      marginTop: 80,
      alignItems: "center",
    },

    emptyTitle: {
      ...Typography.sectionTitle,
      color:
        KhedmatPalette.textPrimary,
      marginBottom:
        Spacing.sm,
    },

    emptyBody: {
      ...Typography.bodyStyle,
      color:
        KhedmatPalette.textMuted,
      textAlign: "center",
      maxWidth: 300,
    },
  });