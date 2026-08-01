import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import {
  Platform,
  StyleSheet,
  View,
} from "react-native";

import {
  Colors,
  Radius,
  Shadows,
} from "../../constants/theme";

export default function ProviderTabsLayout() {
  return (
    <Tabs
      initialRouteName="index"
      screenOptions={{
        headerShown: false,

        tabBarActiveTintColor:
          Colors.primary,

        tabBarInactiveTintColor:
          Colors.textTertiary,

        tabBarHideOnKeyboard: true,
        tabBarShowLabel: true,

        tabBarLabelStyle: styles.label,
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
          title: "داشبورد",
          tabBarIcon: ({
            color,
            focused,
          }) => (
            <TabIcon
              color={color}
              focused={focused}
              activeIcon="grid"
              inactiveIcon="grid-outline"
            />
          ),
        }}
      />

      <Tabs.Screen
        name="requests"
        options={{
          title: "درخواست‌ها",
          tabBarIcon: ({
            color,
            focused,
          }) => (
            <TabIcon
              color={color}
              focused={focused}
              activeIcon="briefcase"
              inactiveIcon="briefcase-outline"
              badgeCount={3}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="calendar"
        options={{
          title: "تقویم",
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
          title: "پیام‌ها",
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
          title: "حساب",
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

const styles = StyleSheet.create({
  tabBar: {
    position: "absolute",
    right: 12,
    bottom:
      Platform.OS === "ios" ? 8 : 12,
    left: 12,

    height:
      Platform.OS === "ios" ? 82 : 70,

    paddingTop: 8,
    paddingBottom:
      Platform.OS === "ios" ? 20 : 8,

    borderTopWidth:
      StyleSheet.hairlineWidth,

    borderTopColor:
      "rgba(255, 255, 255, 0.15)",

    borderRadius: Radius.xl,

    backgroundColor:
      "rgba(12, 18, 27, 0.94)",

    overflow: "hidden",

    ...Shadows.medium,
  },

  tabBarBackground: {
    flex: 1,
    backgroundColor:
      "rgba(12, 18, 27, 0.94)",
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

  iconWrapper: {
    width: 40,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },

  iconContainer: {
    width: 36,
    height: 30,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
  },

  activeIconContainer: {
    backgroundColor:
      "rgba(76, 141, 255, 0.14)",
  },

  badge: {
    position: "absolute",
    top: 0,
    right: 1,

    width: 11,
    height: 11,

    borderRadius: Radius.pill,

    alignItems: "center",
    justifyContent: "center",

    backgroundColor:
      "rgba(12, 18, 27, 0.98)",
  },

  badgeInner: {
    width: 7,
    height: 7,
    borderRadius: Radius.pill,
    backgroundColor: Colors.error,
  },
});