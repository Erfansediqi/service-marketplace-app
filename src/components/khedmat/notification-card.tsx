import { Ionicons } from "@expo/vector-icons";
import { memo } from "react";
import {
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";

import {
    KhedmatPalette,
    Radius,
    Shadows,
    Spacing,
    Typography,
} from "../../constants/theme";
import { useLanguage } from "../../context/languagecontext";
import {
    NotificationRecord,
    NotificationType,
} from "../../types/notifications";

interface NotificationCardProps {
  notification: NotificationRecord;
  onPress: () => void;
}

function getIcon(
  type: NotificationType
): keyof typeof Ionicons.glyphMap {
  switch (type) {
    case "booking-created":
      return "calendar-outline";

    case "booking-confirmed":
      return "checkmark-circle-outline";

    case "booking-rescheduled":
      return "time-outline";

    case "booking-cancelled":
      return "close-circle-outline";

    case "booking-completed":
      return "checkmark-done-circle-outline";

    case "booking-reminder":
      return "notifications-outline";

    case "message":
      return "chatbubble-ellipses-outline";

    case "system":
    default:
      return "information-circle-outline";
  }
}

function NotificationCard({
  notification,
  onPress,
}: NotificationCardProps) {
  const { isRTL } = useLanguage();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.card,
        !notification.read &&
          styles.unreadCard,
        pressed && styles.pressed,
      ]}
    >
      <View
        style={[
          styles.row,
          isRTL && styles.rowReverse,
        ]}
      >
        <View style={styles.iconContainer}>
          <Ionicons
            name={getIcon(
              notification.type
            )}
            size={24}
            color={
              KhedmatPalette.blue500
            }
          />
        </View>

        <View style={styles.content}>
          <Text
            style={[
              styles.title,
              isRTL &&
                styles.textRight,
            ]}
          >
            {notification.title}
          </Text>

          <Text
            style={[
              styles.body,
              isRTL &&
                styles.textRight,
            ]}
          >
            {notification.body}
          </Text>

          <Text
            style={[
              styles.time,
              isRTL &&
                styles.textRight,
            ]}
          >
            {new Date(
              notification.createdAt
            ).toLocaleString()}
          </Text>
        </View>

        {!notification.read && (
          <View
            style={styles.unreadDot}
          />
        )}
      </View>
    </Pressable>
  );
}

export default memo(
  NotificationCard
);

const styles = StyleSheet.create({
  card: {
    backgroundColor:
      KhedmatPalette.surface,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor:
      KhedmatPalette.border,
    ...Shadows.medium,
  },

  unreadCard: {
    borderLeftWidth: 4,
    borderLeftColor:
      KhedmatPalette.blue500,
  },

  pressed: {
    opacity: 0.9,
  },

  row: {
    flexDirection: "row",
    alignItems: "flex-start",
  },

  rowReverse: {
    flexDirection: "row-reverse",
  },

  iconContainer: {
    width: 42,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },

  content: {
    flex: 1,
    marginHorizontal:
      Spacing.md,
  },

  title: {
    ...Typography.sectionTitle,
    color:
      KhedmatPalette.textPrimary,
    marginBottom: 4,
  },

  body: {
    ...Typography.bodyStyle,
    color:
      KhedmatPalette.textSecondary,
    marginBottom: 8,
  },

  time: {
    ...Typography.captionStyle,
    color:
      KhedmatPalette.textMuted,
  },

  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor:
      KhedmatPalette.blue500,
    alignSelf: "center",
  },

  textRight: {
    textAlign: "right",
  },
});