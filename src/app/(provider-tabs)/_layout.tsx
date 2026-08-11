import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { useMemo } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  Fonts,
  KhedmatPalette,
  Radius,
  Shadows,
} from "../../constants/theme";
import { useBooking } from "../../context/booking-context";
import { useLanguage } from "../../context/languagecontext";
import { useNotifications } from "../../context/notification-context";
import { useActiveProvider } from "../../hooks/use-active-provider";

type TabName =
  | "dashboard"
  | "requests"
  | "calendar"
  | "notifications"
  | "messages"
  | "profile";

type IconName =
  keyof typeof Ionicons.glyphMap;

type TabIconProps = {
  focused: boolean;
  color: string;
  activeIcon: IconName;
  inactiveIcon: IconName;
  badgeCount?: number;
};

export default function ProviderTabsLayout() {
  const { t, isRTL } = useLanguage();
  const { bookings } = useBooking();

  const {
    notifications,
  } = useNotifications();

  const {
    provider,
  } = useActiveProvider();

  const isRtl = isRTL;

  const providerId =
    provider?.id;

  const providerBookings =
    useMemo(
      () =>
        bookings.filter(
          (booking) =>
            booking.providerId ===
            providerId,
        ),
      [bookings, providerId],
    );

  const pendingRequestsCount =
    useMemo(
      () =>
        providerBookings.filter(
          (booking) =>
            booking.status ===
            "pending",
        ).length,
      [providerBookings],
    );

  const todayBookingsCount =
    useMemo(() => {
      const today =
        formatDateId(new Date());

      return providerBookings.filter(
        (booking) =>
          booking.date === today &&
          booking.status !==
            "cancelled",
      ).length;
    }, [providerBookings]);

  const unreadNotificationsCount =
    useMemo(() => {
      if (!providerId) {
        return 0;
      }

      return notifications.filter(
        (notification) =>
          notification.recipient ===
            "provider" &&
          notification.recipientId ===
            providerId &&
          !notification.read,
      ).length;
    }, [
      notifications,
      providerId,
    ]);

  const renderLabel = (
    tab: TabName,
    color: string,
    focused: boolean,
  ) => (
    <Text
      numberOfLines={1}
      style={[
        styles.label,
        {
          color,
          textAlign: "center",
          writingDirection: isRtl
            ? "rtl"
            : "ltr",
        },
        focused &&
          styles.labelFocused,
      ]}
    >
      {t(getTabTranslationKey(tab))}
    </Text>
  );

  return (
    <Tabs
      initialRouteName="index"
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarHideOnKeyboard: true,

        tabBarActiveTintColor:
          KhedmatPalette.navy900,

        tabBarInactiveTintColor:
          KhedmatPalette.textMuted,

        tabBarStyle: styles.tabBar,
        tabBarItemStyle:
          styles.tabItem,

        tabBarBackground: () => (
          <View
            style={
              styles.tabBarBackground
            }
          />
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t("providerTabDashboard"),

          tabBarLabel: ({
            color,
            focused,
          }) =>
            renderLabel(
              "dashboard",
              color,
              focused,
            ),

          tabBarIcon: ({
            color,
            focused,
          }) => (
            <TabIcon
              focused={focused}
              color={color}
              activeIcon="grid"
              inactiveIcon="grid-outline"
            />
          ),
        }}
      />

      <Tabs.Screen
        name="requests"
        options={{
          title: t("providerTabRequests"),

          tabBarLabel: ({
            color,
            focused,
          }) =>
            renderLabel(
              "requests",
              color,
              focused,
            ),

          tabBarIcon: ({
            color,
            focused,
          }) => (
            <TabIcon
              focused={focused}
              color={color}
              activeIcon="briefcase"
              inactiveIcon="briefcase-outline"
              badgeCount={
                pendingRequestsCount
              }
            />
          ),
        }}
      />

      <Tabs.Screen
        name="calendar"
        options={{
          title: t("providerTabCalendar"),

          tabBarLabel: ({
            color,
            focused,
          }) =>
            renderLabel(
              "calendar",
              color,
              focused,
            ),

          tabBarIcon: ({
            color,
            focused,
          }) => (
            <TabIcon
              focused={focused}
              color={color}
              activeIcon="calendar"
              inactiveIcon="calendar-outline"
              badgeCount={
                todayBookingsCount
              }
            />
          ),
        }}
      />

      <Tabs.Screen
        name="notifications"
        options={{
          title: t("providerTabNotifications"),

          tabBarLabel: ({
            color,
            focused,
          }) =>
            renderLabel(
              "notifications",
              color,
              focused,
            ),

          tabBarIcon: ({
            color,
            focused,
          }) => (
            <TabIcon
              focused={focused}
              color={color}
              activeIcon="notifications"
              inactiveIcon="notifications-outline"
              badgeCount={
                unreadNotificationsCount
              }
            />
          ),
        }}
      />

      <Tabs.Screen
        name="messages"
        options={{
          title: t("providerTabMessages"),

          tabBarLabel: ({
            color,
            focused,
          }) =>
            renderLabel(
              "messages",
              color,
              focused,
            ),

          tabBarIcon: ({
            color,
            focused,
          }) => (
            <TabIcon
              focused={focused}
              color={color}
              activeIcon="chatbubble"
              inactiveIcon="chatbubble-outline"
            />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: t("providerTabProfile"),

          tabBarLabel: ({
            color,
            focused,
          }) =>
            renderLabel(
              "profile",
              color,
              focused,
            ),

          tabBarIcon: ({
            color,
            focused,
          }) => (
            <TabIcon
              focused={focused}
              color={color}
              activeIcon="person"
              inactiveIcon="person-outline"
            />
          ),
        }}
      />
    </Tabs>
  );
}

function TabIcon({
  focused,
  color,
  activeIcon,
  inactiveIcon,
  badgeCount = 0,
}: TabIconProps) {
  return (
    <View style={styles.iconWrapper}>
      <View
        style={[
          styles.iconContainer,
          focused &&
            styles.iconContainerFocused,
        ]}
      >
        <Ionicons
          name={
            focused
              ? activeIcon
              : inactiveIcon
          }
          size={20}
          color={
            focused
              ? KhedmatPalette.white
              : color
          }
        />
      </View>

      {badgeCount > 0 ? (
        <View style={styles.badge}>
          <Text
            numberOfLines={1}
            style={styles.badgeText}
          >
            {formatBadgeCount(
              badgeCount,
            )}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

function formatBadgeCount(
  count: number,
): string {
  if (count > 9) {
    return "9+";
  }

  return count.toString();
}

function formatDateId(
  date: Date,
): string {
  const year =
    date.getFullYear();

  const month = String(
    date.getMonth() + 1,
  ).padStart(2, "0");

  const day = String(
    date.getDate(),
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getTabTranslationKey(
  tab: TabName,
):
  | "providerTabDashboard"
  | "providerTabRequests"
  | "providerTabCalendar"
  | "providerTabNotifications"
  | "providerTabMessages"
  | "providerTabProfile" {
  if (tab === "requests") {
    return "providerTabRequests";
  }

  if (tab === "calendar") {
    return "providerTabCalendar";
  }

  if (tab === "notifications") {
    return "providerTabNotifications";
  }

  if (tab === "messages") {
    return "providerTabMessages";
  }

  if (tab === "profile") {
    return "providerTabProfile";
  }

  return "providerTabDashboard";
}

const styles = StyleSheet.create({
  tabBar: {
    position: "absolute",

    left: 8,
    right: 8,

    bottom:
      Platform.OS === "ios"
        ? 8
        : 12,

    height:
      Platform.OS === "ios"
        ? 82
        : 72,

    paddingTop: 8,

    paddingBottom:
      Platform.OS === "ios"
        ? 20
        : 8,

    borderTopWidth: 0,
    borderWidth: 1,

    borderColor:
      KhedmatPalette.border,

    borderRadius: Radius.xl,

    backgroundColor:
      KhedmatPalette.surface,

    overflow: "hidden",

    ...Shadows.medium,
  },

  tabBarBackground: {
    flex: 1,

    backgroundColor:
      KhedmatPalette.surface,
  },

  tabItem: {
    minHeight: 56,
    paddingHorizontal: 0,
    borderRadius: Radius.lg,
  },

  label: {
    maxWidth: 56,

    marginTop: 1,

    fontFamily: Fonts.medium,

    fontSize: 9,

    lineHeight: 12,

    fontWeight: "500",
  },

  labelFocused: {
    fontFamily: Fonts.bold,
    fontWeight: "700",
  },

  iconWrapper: {
    width: 38,
    height: 34,

    alignItems: "center",
    justifyContent: "center",
  },

  iconContainer: {
    width: 36,
    height: 32,

    borderRadius: Radius.pill,

    alignItems: "center",
    justifyContent: "center",
  },

  iconContainerFocused: {
    backgroundColor:
      KhedmatPalette.navy900,
  },

  badge: {
    position: "absolute",

    top: -3,
    right: -5,

    minWidth: 18,
    height: 18,

    paddingHorizontal: 4,

    borderRadius: Radius.pill,

    alignItems: "center",
    justifyContent: "center",

    borderWidth: 2,

    borderColor:
      KhedmatPalette.surface,

    backgroundColor:
      KhedmatPalette.error,
  },

  badgeText: {
    color:
      KhedmatPalette.white,

    fontFamily: Fonts.bold,

    fontSize: 8,

    lineHeight: 10,

    textAlign: "center",
  },
});