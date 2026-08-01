import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { Platform, StyleSheet, View } from "react-native";

import {
    Colors,
    Radius,
    Shadows,
} from "../../constants/theme";

export default function TabsLayout() {
  return (
    <Tabs
      initialRouteName="index"
      screenOptions={{
        headerShown: false,

        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textTertiary,

        tabBarHideOnKeyboard: true,
        tabBarShowLabel: true,

        tabBarLabelStyle: styles.label,

        tabBarStyle: styles.tabBar,

        tabBarItemStyle: styles.tabItem,

        tabBarBackground: () => (
          <View style={styles.tabBarBackground} />
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "خانه",
          tabBarIcon: ({ color, focused }) => (
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
          title: "جستجو",
          tabBarIcon: ({ color, focused }) => (
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
          title: "رزروها",
          tabBarIcon: ({ color, focused }) => (
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
          title: "پیام‌ها",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              color={color}
              focused={focused}
              activeIcon="chatbubble"
              inactiveIcon="chatbubble-outline"
            />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "پروفایل",
          tabBarIcon: ({ color, focused }) => (
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
  activeIcon: keyof typeof Ionicons.glyphMap;
  inactiveIcon: keyof typeof Ionicons.glyphMap;
};

function TabIcon({
  color,
  focused,
  activeIcon,
  inactiveIcon,
}: TabIconProps) {
  return (
    <View
      style={[
        styles.iconContainer,
        focused && styles.activeIconContainer,
      ]}
    >
      <Ionicons
        name={focused ? activeIcon : inactiveIcon}
        size={22}
        color={color}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: "absolute",
    right: 12,
    bottom: Platform.OS === "ios" ? 8 : 12,
    left: 12,

    height: Platform.OS === "ios" ? 82 : 70,

    paddingTop: 8,
    paddingBottom: Platform.OS === "ios" ? 20 : 8,

    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: Radius.xl,

    backgroundColor: "rgba(12, 18, 27, 0.94)",

    overflow: "hidden",

    ...Shadows.medium,
  },

  tabBarBackground: {
    flex: 1,
    backgroundColor: "rgba(12, 18, 27, 0.94)",
  },

  tabItem: {
    borderRadius: Radius.lg,
  },

  label: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "600",
    writingDirection: "rtl",
  },

  iconContainer: {
    width: 36,
    height: 30,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
  },

  activeIconContainer: {
    backgroundColor: "rgba(76, 141, 255, 0.14)",
  },
});