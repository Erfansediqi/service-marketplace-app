import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import {
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  Fonts,
  KhedmatPalette,
  Radius
} from "../../constants/theme";
import { useLanguage } from "../../context/languagecontext";

type LanguageName =
  | "English"
  | "Dari"
  | "Pashto";

type VisibleTabName =
  | "home"
  | "search"
  | "bookings"
  | "messages"
  | "profile";

type IconName =
  keyof typeof Ionicons.glyphMap;

type TabIconProps = {
  focused: boolean;
  color: string;
  activeIcon: IconName;
  inactiveIcon: IconName;
  isCenter?: boolean;
};

export default function CustomerTabsLayout() {
  const { language } =
    useLanguage();

  const activeLanguage =
    normalizeLanguage(
      language,
    );

  const copy =
    getTabCopy(
      activeLanguage,
    );

  const isRtl =
    activeLanguage ===
      "Dari" ||
    activeLanguage ===
      "Pashto";

  const renderLabel = (
    tab: VisibleTabName,
    color: string,
    focused: boolean,
    isCenter = false,
  ) => (
    <Text
      numberOfLines={1}
      style={[
        styles.label,
        isCenter &&
          styles.centerLabel,
        {
          color:
            isCenter &&
            focused
              ? KhedmatPalette.navy900
              : color,

          textAlign:
            "center",

          writingDirection:
            isRtl
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

        tabBarShowLabel:
          true,

        tabBarHideOnKeyboard:
          true,

        tabBarActiveTintColor:
          KhedmatPalette.navy900,

        tabBarInactiveTintColor:
          KhedmatPalette.textMuted,

        tabBarStyle:
          styles.tabBar,

        tabBarItemStyle:
          styles.tabItem,

        tabBarBackground:
          () => (
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
              focused={
                focused
              }
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
              focused={
                focused
              }
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
          title:
            copy.bookings,

          tabBarAccessibilityLabel:
            copy.bookings,

          tabBarItemStyle: [
            styles.tabItem,
            styles.centerTabItem,
          ],

          tabBarLabel: ({
            color,
            focused,
          }) =>
            renderLabel(
              "bookings",
              color,
              focused,
              true,
            ),

          tabBarIcon: ({
            color,
            focused,
          }) => (
            <TabIcon
              focused={
                focused
              }
              color={color}
              activeIcon="calendar"
              inactiveIcon="calendar-outline"
              isCenter
            />
          ),
        }}
      />

      {/*
       * Notifications remains a valid Expo Router
       * route, but it is intentionally hidden from
       * the visible bottom navigation. Notifications
       * can still be opened from notification buttons
       * elsewhere in the customer experience.
       */}
      <Tabs.Screen
        name="notifications"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="messages"
        options={{
          title:
            copy.messages,

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
              focused={
                focused
              }
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
          title:
            copy.profile,

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
              focused={
                focused
              }
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
  isCenter = false,
}: TabIconProps) {
  return (
    <View
      style={[
        styles.iconWrapper,
        isCenter &&
          styles.centerIconWrapper,
      ]}
    >
      <View
        style={[
          styles.iconContainer,

          focused &&
            styles.activeIconContainer,

          isCenter &&
            styles.centerIconContainer,

          isCenter &&
            focused &&
            styles.centerIconContainerFocused,
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
    </View>
  );
}

function normalizeLanguage(
  language: string,
): LanguageName {
  if (
    language === "Dari"
  ) {
    return "Dari";
  }

  if (
    language === "Pashto"
  ) {
    return "Pashto";
  }

  return "English";
}

function getTabCopy(
  language: LanguageName,
): Record<
  VisibleTabName,
  string
> {
  if (
    language === "Dari"
  ) {
    return {
      home: "خانه",
      search: "جستجو",
      bookings: "رزروها",
      messages: "پیام‌ها",
      profile: "حساب",
    };
  }

  if (
    language === "Pashto"
  ) {
    return {
      home: "کور",
      search: "لټون",
      bookings: "رزرفونه",
      messages: "پیغامونه",
      profile: "حساب",
    };
  }

  return {
    home: "Home",
    search: "Search",
    bookings: "Bookings",
    messages: "Messages",
    profile: "Account",
  };
}

const styles =
  StyleSheet.create({
    tabBar: {      position: "absolute",

      left: 0,
      right: 0,
      bottom: 0,

      height:
        Platform.OS ===
        "ios"
          ? 88
          : 72,

      paddingTop: 8,

      paddingBottom:
        Platform.OS ===
        "ios"
          ? 22
          : 8,

      borderTopWidth: 1,
      borderLeftWidth: 0,
      borderRightWidth: 0,
      borderBottomWidth: 0,

      borderColor:
        KhedmatPalette.border,

      borderTopLeftRadius:
        Radius.xl,

      borderTopRightRadius:
        Radius.xl,

      borderBottomLeftRadius: 0,
      borderBottomRightRadius: 0,

      backgroundColor:
        KhedmatPalette.white,

      overflow: "visible",
      shadowColor:
        KhedmatPalette.navy900,

      shadowOffset: {
        width: 0,
        height: -4,
      },

      shadowOpacity: 0.08,
      shadowRadius: 12,

      elevation: 10,
    },

    tabBarBackground: {
      flex: 1,

      borderTopLeftRadius:
        Radius.xl,

      borderTopRightRadius:
        Radius.xl,

      backgroundColor:
        KhedmatPalette.white,
    },

    tabItem: {
      minHeight: 56,
      paddingHorizontal: 0,
      borderRadius:
        Radius.lg,
    },

    centerTabItem: {
      marginTop: 0,
    },

    label: {
      maxWidth: 62,

      marginTop: 1,

      fontFamily:
        Fonts.medium,

      fontSize: 9,

      lineHeight: 12,

      fontWeight:
        "500",
    },

    centerLabel: {
      marginTop: 1,
    },

    labelFocused: {
      fontFamily:
        Fonts.bold,

      fontWeight:
        "700",
    },

    iconWrapper: {
      width: 38,
      height: 34,

      alignItems:
        "center",

      justifyContent:
        "center",
    },

    centerIconWrapper: {
      width: 38,
      height: 34,
    },

    iconContainer: {
      width: 36,
      height: 32,

      borderRadius:
        Radius.pill,

      alignItems:
        "center",

      justifyContent:
        "center",
    },

    activeIconContainer: {
      backgroundColor:
        "transparent",
    },

    centerIconContainer: {
      width: 36,
      height: 32,

      borderRadius:
        Radius.pill,

      borderWidth: 0,

      backgroundColor:
        "transparent",
    },

    centerIconContainerFocused: {
      backgroundColor:
        "transparent",
    },
  });
