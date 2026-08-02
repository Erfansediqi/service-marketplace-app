import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import {
  Platform,
  StyleSheet,
  View,
} from "react-native";

import {
  Fonts,
  KhedmatPalette,
  Radius,
  Shadows,
} from "../../constants/theme";
import { useLanguage } from "../../context/languagecontext";

type LanguageName =
  | "English"
  | "Dari"
  | "Pashto";

export default function CustomerTabsLayout() {
  const { language } = useLanguage();

  const activeLanguage =
    normalizeLanguage(language);

  const copy =
    getTabCopy(activeLanguage);

  const isRtl =
    activeLanguage === "Dari" ||
    activeLanguage === "Pashto";

  return (
    <Tabs
      initialRouteName="index"
      screenOptions={{
        headerShown: false,

        tabBarActiveTintColor:
          KhedmatPalette.navy900,

        tabBarInactiveTintColor:
          KhedmatPalette.textMuted,

        tabBarHideOnKeyboard: true,
        tabBarShowLabel: true,

        tabBarLabelStyle: [
          styles.label,
          {
            writingDirection: isRtl
              ? "rtl"
              : "ltr",
          },
        ],

        tabBarStyle: styles.tabBar,
        tabBarItemStyle: styles.tabItem,

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

          tabBarIcon: ({
            color,
            focused,
          }) => (
            <TabIcon
              color={color}
              focused={focused}
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

          tabBarIcon: ({
            color,
            focused,
          }) => (
            <TabIcon
              color={color}
              focused={focused}
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

          tabBarIcon: ({
            color,
            focused,
          }) => (
            <TabIcon
              color={color}
              focused={focused}
              activeIcon="calendar"
              inactiveIcon="calendar-outline"
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

          tabBarIcon: ({
            color,
            focused,
          }) => (
            <TabIcon
              color={color}
              focused={focused}
              activeIcon="chatbubble"
              inactiveIcon="chatbubble-outline"
              badgeCount={2}
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

          tabBarIcon: ({
            color,
            focused,
          }) => (
            <TabIcon
              color={color}
              focused={focused}
              activeIcon="person"
              inactiveIcon="person-outline"
            />
          ),
        }}
      />
    </Tabs>
  );
}

type TabIconProps = {
  color: string;
  focused: boolean;

  activeIcon:
    keyof typeof Ionicons.glyphMap;

  inactiveIcon:
    keyof typeof Ionicons.glyphMap;

  badgeCount?: number;
};

function TabIcon({
  color,
  focused,
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
          size={22}
          color={color}
        />
      </View>

      {badgeCount > 0 ? (
        <View style={styles.badge}>
          <View
            style={
              styles.badgeInner
            }
          />
        </View>
      ) : null}
    </View>
  );
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
) {
  if (language === "Dari") {
    return {
      home: "خانه",
      search: "جستجو",
      bookings: "رزروها",
      messages: "پیام‌ها",
      profile: "حساب",
    };
  }

  if (language === "Pashto") {
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

const styles = StyleSheet.create({
  tabBar: {
    position: "absolute",

    right: 12,
    left: 12,

    bottom:
      Platform.OS === "ios"
        ? 8
        : 12,

    height:
      Platform.OS === "ios"
        ? 82
        : 70,

    paddingTop: 7,

    paddingBottom:
      Platform.OS === "ios"
        ? 19
        : 7,

    borderTopWidth:
      StyleSheet.hairlineWidth,

    borderTopColor:
      KhedmatPalette.border,

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
    borderRadius: Radius.lg,

    paddingHorizontal: 1,
  },

  label: {
    fontFamily: Fonts.medium,

    fontSize: 10,

    lineHeight: 14,

    fontWeight: "500",
  },

  iconWrapper: {
    width: 42,
    height: 32,

    alignItems: "center",
    justifyContent: "center",
  },

  iconContainer: {
    width: 38,
    height: 30,

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

    top: 0,
    right: 0,

    width: 12,
    height: 12,

    borderRadius: Radius.pill,

    alignItems: "center",
    justifyContent: "center",

    backgroundColor:
      KhedmatPalette.surface,
  },

  badgeInner: {
    width: 7,
    height: 7,

    borderRadius: Radius.pill,

    backgroundColor:
      KhedmatPalette.error,
  },
});