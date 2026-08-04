import { Ionicons } from "@expo/vector-icons";
import { memo, useMemo } from "react";
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
import type {
  NotificationRecord,
  NotificationType,
} from "../../types/notifications";

interface NotificationCardProps {
  notification: NotificationRecord;
  onPress: () => void;
}

function getIcon(
  type: NotificationType,
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

function interpolate(
  template: string,
  params?: Record<string, string>,
): string {
  if (!params) {
    return template;
  }

  return Object.entries(params).reduce(
    (result, [key, value]) =>
      result.replace(
        new RegExp(`{{${key}}}`, "g"),
        value,
      ),
    template,
  );
}

function NotificationCard({
  notification,
  onPress,
}: NotificationCardProps) {
  const {
    language,
    isRTL,
    t,
  } = useLanguage();

  const title = useMemo(() => {
    if (notification.titleKey) {
      return t(notification.titleKey);
    }

    return notification.title ?? "";
  }, [
    notification.title,
    notification.titleKey,
    t,
  ]);

  const body = useMemo(() => {
    const template = notification.bodyKey
      ? t(notification.bodyKey)
      : notification.body ?? "";

    return interpolate(
      template,
      notification.bodyParams,
    );
  }, [
    notification.body,
    notification.bodyKey,
    notification.bodyParams,
    t,
  ]);

  const formattedTime = useMemo(() => {
    const date = new Date(
      notification.createdAt,
    );

    if (
      Number.isNaN(date.getTime())
    ) {
      return "";
    }

    const locale =
      language === "Dari"
        ? "fa-AF"
        : language === "Pashto"
          ? "ps-AF"
          : "en-US";

    return date.toLocaleString(locale, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  }, [
    language,
    notification.createdAt,
  ]);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${title}. ${body}`}
      accessibilityState={{
        selected: !notification.read,
      }}
      style={({ pressed }) => [
        styles.card,
        !notification.read &&
          (isRTL
            ? styles.unreadCardRTL
            : styles.unreadCardLTR),
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
              notification.type,
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
              isRTL
                ? styles.textRight
                : styles.textLeft,
            ]}
          >
            {title}
          </Text>

          <Text
            style={[
              styles.body,
              isRTL
                ? styles.textRight
                : styles.textLeft,
            ]}
          >
            {body}
          </Text>

          {formattedTime.length > 0 && (
            <Text
              style={[
                styles.time,
                isRTL
                  ? styles.textRight
                  : styles.textLeft,
              ]}
            >
              {formattedTime}
            </Text>
          )}
        </View>

        {!notification.read && (
          <View
            accessibilityElementsHidden
            importantForAccessibility="no"
            style={styles.unreadDot}
          />
        )}
      </View>
    </Pressable>
  );
}

export default memo(
  NotificationCard,
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

  unreadCardLTR: {
    borderLeftWidth: 4,
    borderLeftColor:
      KhedmatPalette.blue500,
  },

  unreadCardRTL: {
    borderRightWidth: 4,
    borderRightColor:
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
    marginBottom: Spacing.xs,
  },

  body: {
    ...Typography.bodyStyle,
    color:
      KhedmatPalette.textSecondary,
    marginBottom: Spacing.sm,
  },

  time: {
    ...Typography.captionStyle,
    color:
      KhedmatPalette.textMuted,
  },

  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: Radius.pill,
    backgroundColor:
      KhedmatPalette.blue500,
    alignSelf: "center",
  },

  textLeft: {
    textAlign: "left",
  },

  textRight: {
    textAlign: "right",
  },
});