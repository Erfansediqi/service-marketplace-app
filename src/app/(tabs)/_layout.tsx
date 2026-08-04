import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { useMemo } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { LOCAL_CUSTOMER_ID } from "../../constants/identity";
import {
  Fonts,
  KhedmatPalette,
  Radius,
  Shadows,
} from "../../constants/theme";
import { useLanguage } from "../../context/languagecontext";
import { useNotifications } from "../../context/notification-context";

type LanguageName =
  | "English"
  | "Dari"
  | "Pashto";

type TabName =
  | "home"
  | "search"
  | "bookings"
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

export default function CustomerTabsLayout() {
  const { language } = useLanguage();

  const {
    notifications,
    getUnreadCount,
  } = useNotifications();

  const activeLanguage =
    normalizeLanguage(language);

  const copy =
    getTabCopy(activeLanguage);

  const isRtl =
    activeLanguage === "Dari" ||
    activeLanguage === "Pashto";

  const unreadNotificationsCount =
    useMemo(
      () =>
        getUnreadCount(
  "customer",
  LOCAL_CUSTOMER_ID,
),
      [
        getUnreadCount,
        notifications,
      ],
    );

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
          title: copy.home,

          tabBarAccessibilityLabel:
            copy.home,

          tabBarLabel: ({
            color,
            focused,
          }) =>
            renderLabel(
              "home",
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
              activeIcon="home"
              inactiveIcon="home-outline"
            />
          ),
        }}
      />

      <Tabs.Screen
        name="search"
        options={{
          title: copy.search,

          tabBarAccessibilityLabel:
            copy.search,

          tabBarLabel: ({
            color,
            focused,
          }) =>
            renderLabel(
              "search",
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
              activeIcon="search"
              inactiveIcon="search-outline"
            />
          ),
        }}
      />

      <Tabs.Screen
        name="bookings"
        options={{
          title: copy.bookings,

          tabBarAccessibilityLabel:
            copy.bookings,

          tabBarLabel: ({
            color,
            focused,
          }) =>
            renderLabel(
              "bookings",
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
            />
          ),
        }}
      />

      <Tabs.Screen
        name="notifications"
        options={{
          title:
            copy.notifications,

          tabBarAccessibilityLabel:
            copy.notifications,

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
          title: copy.messages,

          tabBarAccessibilityLabel:
            copy.messages,

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

          tabBarAccessibilityLabel:
            copy.profile,

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
            styles.activeIconContainer,
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
              ? KhedmatPalette.navy900
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
      home: "خانه",
      search: "جستجو",
      bookings: "رزروها",
      notifications: "اعلان‌ها",
      messages: "پیام‌ها",
      profile: "حساب",
    };
  }

  if (language === "Pashto") {
    return {
      home: "کور",
      search: "لټون",
      bookings: "رزرفونه",
      notifications: "خبرتیاوې",
      messages: "پیغامونه",
      profile: "حساب",
    };
  }

  return {
    home: "Home",
    search: "Search",
    bookings: "Bookings",
    notifications: "Alerts",
    messages: "Messages",
    profile: "Account",
  };
}

const styles = StyleSheet.create({
  tabBar: {
    position: "absolute",

    right: 8,
    left: 8,

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

  activeIconContainer: {
    backgroundColor:
      KhedmatPalette.surfaceSoft,
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