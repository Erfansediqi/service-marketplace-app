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
import { useSession } from "../../context/session-context";

type LanguageName =
  | "English"
  | "Dari"
  | "Pashto";

type TabName =
  | "dashboard"
  | "requests"
  | "calendar"
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
  const { language } = useLanguage();
  const { bookings } = useBooking();
  const { activeProviderId } =
    useSession();

  const activeLanguage =
    normalizeLanguage(language);

  const isRtl =
    activeLanguage === "Dari" ||
    activeLanguage === "Pashto";

  const copy =
    getTabCopy(activeLanguage);

  const providerId =
    activeProviderId ??
    "provider-1";

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
      {copy[tab]}
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
          title: copy.dashboard,

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
          title: copy.requests,

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
          title: copy.calendar,

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
        name="messages"
        options={{
          title: copy.messages,

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
          title: copy.profile,

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
          size={21}
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

function normalizeLanguage(
  language: string,
): LanguageName {
  if (language === "Dari") {
    return "Dari";
  }

  if (language === "Pashto") {
    return "Pashto";
  }

  return "English";
}

function getTabCopy(
  language: LanguageName,
): Record<TabName, string> {
  if (language === "Dari") {
    return {
      dashboard: "داشبورد",
      requests: "درخواست‌ها",
      calendar: "تقویم",
      messages: "پیام‌ها",
      profile: "پروفایل",
    };
  }

  if (language === "Pashto") {
    return {
      dashboard: "ډشبورډ",
      requests: "غوښتنې",
      calendar: "کلیز",
      messages: "پیغامونه",
      profile: "پروفایل",
    };
  }

  return {
    dashboard: "Dashboard",
    requests: "Requests",
    calendar: "Calendar",
    messages: "Messages",
    profile: "Profile",
  };
}

const styles = StyleSheet.create({
  tabBar: {
    position: "absolute",

    left: 12,
    right: 12,

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

    paddingHorizontal: 1,

    borderRadius: Radius.lg,
  },

  label: {
    maxWidth: 72,

    marginTop: 1,

    fontFamily: Fonts.medium,

    fontSize: 10,

    lineHeight: 14,

    fontWeight: "500",
  },

  labelFocused: {
    fontFamily: Fonts.bold,

    fontWeight: "700",
  },

  iconWrapper: {
    width: 44,
    height: 34,

    alignItems: "center",

    justifyContent: "center",
  },

  iconContainer: {
    width: 40,
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
    right: -4,

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