import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ComponentProps, useState } from "react";
import {
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { GlassButton } from "../../components/glass/glass-button";
import { GlassSurface } from "../../components/glass/glass-surface";
import {
  Colors,
  Layout,
  Radius,
  Shadows,
  Spacing,
  Typography,
} from "../../constants/theme";

type IconName = ComponentProps<typeof Ionicons>["name"];

type ProfileMenuItem = {
  id: string;
  title: string;
  subtitle?: string;
  icon: IconName;
  badge?: string;
  destructive?: boolean;
  onPress: () => void;
};

type ProviderStatus =
  | "not-started"
  | "pending"
  | "approved"
  | "rejected";

export default function ProfileScreen() {
  const router = useRouter();

  const [notificationsEnabled, setNotificationsEnabled] =
    useState(true);

  const [providerStatus] =
    useState<ProviderStatus>("pending");

  const handleLogout = () => {
    Alert.alert(
      "خروج از حساب",
      "آیا مطمئن هستید که می‌خواهید از حساب خود خارج شوید؟",
      [
        {
          text: "لغو",
          style: "cancel",
        },
        {
          text: "خروج",
          style: "destructive",
          onPress: () => {
            router.replace("/language");
          },
        },
      ],
    );
  };

  const accountItems: ProfileMenuItem[] = [
    {
      id: "personal-information",
      title: "اطلاعات شخصی",
      subtitle: "نام، شماره تلفن و عکس پروفایل",
      icon: "person-outline",
      onPress: () => {
        console.log("Open personal information");
      },
    },
    {
      id: "saved-addresses",
      title: "آدرس‌های ذخیره‌شده",
      subtitle: "خانه، محل کار و آدرس‌های دیگر",
      icon: "location-outline",
      badge: "۲",
      onPress: () => {
        console.log("Open saved addresses");
      },
    },
    {
      id: "language",
      title: "زبان برنامه",
      subtitle: "دری",
      icon: "language-outline",
      onPress: () => {
        router.push("/language");
      },
    },
  ];

  const settingsItems: ProfileMenuItem[] = [
    {
      id: "notifications",
      title: "اعلان‌ها",
      subtitle: "رزروها، پیام‌ها و تغییرات حساب",
      icon: "notifications-outline",
      onPress: () => {
        setNotificationsEnabled((current) => !current);
      },
    },
    {
      id: "privacy",
      title: "حریم خصوصی و امنیت",
      subtitle: "رمز، دسترسی‌ها و مدیریت اطلاعات",
      icon: "shield-checkmark-outline",
      onPress: () => {
        console.log("Open privacy and security");
      },
    },
        {
      id: "payments",
      title: "پرداخت‌ها",
      subtitle: "روش‌های پرداخت و تاریخچه",
      icon: "card-outline",
      onPress: () => {
        console.log("Open payments");
      },
    },
  ];

  const supportItems: ProfileMenuItem[] = [
    {
      id: "help",
      title: "مرکز راهنما",
      subtitle: "پرسش‌های رایج و راهنمای استفاده",
      icon: "help-circle-outline",
      onPress: () => {
        console.log("Open help center");
      },
    },
    {
      id: "contact-support",
      title: "تماس با پشتیبانی",
      subtitle: "گزارش مشکل یا درخواست کمک",
      icon: "headset-outline",
      onPress: () => {
        router.push("/(tabs)/messages");
      },
    },
    {
      id: "terms",
      title: "شرایط استفاده و حریم خصوصی",
      icon: "document-text-outline",
      onPress: () => {
        console.log("Open legal documents");
      },
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <Text style={styles.eyebrow}>
            حساب کاربری
          </Text>

          <Text style={styles.title}>
            پروفایل
          </Text>
        </View>

        <GlassSurface
          variant="prominent"
          radius={Radius.xl}
          style={[styles.profileCard, Shadows.small]}
          contentStyle={styles.profileContent}
        >
          <View style={styles.profileAvatar}>
            <Text style={styles.profileInitials}>
              ا
            </Text>

            <View style={styles.editAvatarBadge}>
              <Ionicons
                name="camera-outline"
                size={13}
                color={Colors.white}
              />
            </View>
          </View>

          <View style={styles.profileCopy}>
            <Text style={styles.profileName}>
              احمد ظاهر
            </Text>

            <Text style={styles.profilePhone}>
              +۹۳ ۷۰ ۱۲۳ ۴۵۶۷
            </Text>

            <View style={styles.accountBadge}>
              <Ionicons
                name="shield-checkmark"
                size={14}
                color={Colors.primary}
              />

              <Text style={styles.accountBadgeText}>
                حساب تأییدشده
              </Text>
            </View>
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="ویرایش پروفایل"
            onPress={() => {
              console.log("Edit profile");
            }}
            style={({ pressed }) => [
              styles.editProfileButton,
              pressed && styles.pressed,
            ]}
          >
            <Ionicons
              name="create-outline"
              size={20}
              color={Colors.textSecondary}
            />
          </Pressable>
        </GlassSurface>

        <ProviderStatusCard
          status={providerStatus}
          onPress={() => {
            if (providerStatus === "not-started") {
              router.push("/provider-welcome");
              return;
            }

            console.log("Open provider application status");
          }}
        />

        <ProfileSection
          title="حساب"
          items={accountItems}
        />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            تنظیمات
          </Text>

          <View style={styles.menuList}>
            {settingsItems.map((item) => {
              if (item.id === "notifications") {
                return (
                  <ProfileToggleItem
                    key={item.id}
                    item={item}
                    selected={notificationsEnabled}
                  />
                );
              }

              return (
                <ProfileMenuItemCard
                  key={item.id}
                  item={item}
                />
              );
            })}
          </View>
        </View>

        <ProfileSection
          title="پشتیبانی"
          items={supportItems}
        />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            حساب
          </Text>

          <GlassButton
            label="خروج از حساب"
            icon="log-out-outline"
            iconPosition="left"
            variant="destructive"
            onPress={handleLogout}
          />
        </View>

        <Text style={styles.versionText}>
          خدمت، نسخهٔ ۱.۰.۰
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function ProviderStatusCard({
  status,
  onPress,
}: {
  status: ProviderStatus;
  onPress: () => void;
}) {
  const config = getProviderStatusConfig(status);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={config.title}
      onPress={onPress}
      style={({ pressed }) => [
        styles.providerStatusPressable,
        pressed && styles.cardPressed,
      ]}
    >
      <GlassSurface
        variant="regular"
        radius={Radius.xl}
        style={[
          styles.providerStatusCard,
          {
            borderColor: config.borderColor,
            backgroundColor: config.backgroundColor,
          },
        ]}
        contentStyle={styles.providerStatusContent}
      >
        <View
          style={[
            styles.providerStatusIcon,
            {
              backgroundColor: config.iconBackground,
            },
          ]}
        >
          <Ionicons
            name={config.icon}
            size={24}
            color={config.color}
          />
        </View>

        <View style={styles.providerStatusCopy}>
          <Text
            style={[
              styles.providerStatusEyebrow,
              {
                color: config.color,
              },
            ]}
          >
            حساب ارائه‌دهنده
          </Text>

          <Text style={styles.providerStatusTitle}>
            {config.title}
          </Text>

          <Text style={styles.providerStatusSubtitle}>
            {config.subtitle}
          </Text>
        </View>

        <Ionicons
          name="chevron-back"
          size={20}
          color={Colors.textTertiary}
        />
      </GlassSurface>
    </Pressable>
  );
}

function ProfileSection({
  title,
  items,
}: {
  title: string;
  items: ProfileMenuItem[];
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>
        {title}
      </Text>

      <View style={styles.menuList}>
        {items.map((item) => (
          <ProfileMenuItemCard
            key={item.id}
            item={item}
          />
        ))}
      </View>
    </View>
  );
}

function ProfileMenuItemCard({
  item,
}: {
  item: ProfileMenuItem;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={item.title}
      onPress={item.onPress}
      style={({ pressed }) => [
        styles.menuPressable,
        pressed && styles.cardPressed,
      ]}
    >
      <GlassSurface
        variant="regular"
        radius={Radius.lg}
        style={styles.menuSurface}
        contentStyle={styles.menuContent}
      >
        <View
          style={[
            styles.menuIcon,
            item.destructive &&
              styles.destructiveMenuIcon,
          ]}
        >
          <Ionicons
            name={item.icon}
            size={21}
            color={
              item.destructive
                ? Colors.error
                : Colors.primary
            }
          />
        </View>

        <View style={styles.menuCopy}>
          <Text
            style={[
              styles.menuTitle,
              item.destructive &&
                styles.destructiveMenuTitle,
            ]}
          >
            {item.title}
          </Text>

          {item.subtitle ? (
            <Text style={styles.menuSubtitle}>
              {item.subtitle}
            </Text>
          ) : null}
        </View>

        {item.badge ? (
          <View style={styles.menuBadge}>
            <Text style={styles.menuBadgeText}>
              {item.badge}
            </Text>
          </View>
        ) : null}

        <Ionicons
          name="chevron-back"
          size={18}
          color={Colors.textTertiary}
        />
      </GlassSurface>
    </Pressable>
  );
}

function ProfileToggleItem({
  item,
  selected,
}: {
  item: ProfileMenuItem;
  selected: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityLabel={item.title}
      accessibilityState={{ checked: selected }}
      onPress={item.onPress}
      style={({ pressed }) => [
        styles.menuPressable,
        pressed && styles.cardPressed,
      ]}
    >
      <GlassSurface
        variant={selected ? "prominent" : "regular"}
        radius={Radius.lg}
        style={[
          styles.menuSurface,
          selected && styles.selectedToggleSurface,
        ]}
        contentStyle={styles.menuContent}
      >
        <View
          style={[
            styles.menuIcon,
            selected && styles.selectedMenuIcon,
          ]}
        >
          <Ionicons
            name={item.icon}
            size={21}
            color={
              selected
                ? Colors.white
                : Colors.primary
            }
          />
        </View>

        <View style={styles.menuCopy}>
          <Text style={styles.menuTitle}>
            {item.title}
          </Text>

          {item.subtitle ? (
            <Text style={styles.menuSubtitle}>
              {item.subtitle}
            </Text>
          ) : null}
        </View>

        <View
          style={[
            styles.switchTrack,
            selected && styles.switchTrackSelected,
          ]}
        >
          <View
            style={[
              styles.switchThumb,
              selected && styles.switchThumbSelected,
            ]}
          />
        </View>
      </GlassSurface>
    </Pressable>
  );
}

function getProviderStatusConfig(
  status: ProviderStatus,
) {
  if (status === "pending") {
    return {
      title: "درخواست شما در حال بررسی است",
      subtitle:
        "پس از تأیید، حساب حرفه‌ای شما فعال می‌شود.",
      icon: "time-outline" as const,
      color: Colors.warning,
      backgroundColor:
        "rgba(217, 154, 43, 0.06)",
      borderColor:
        "rgba(217, 154, 43, 0.30)",
      iconBackground:
        "rgba(217, 154, 43, 0.12)",
    };
  }

  if (status === "approved") {
    return {
      title: "حساب ارائه‌دهنده فعال است",
      subtitle:
        "درخواست‌های مشتریان را مشاهده و مدیریت کنید.",
      icon: "checkmark-circle-outline" as const,
      color: Colors.success,
      backgroundColor:
        "rgba(48, 183, 106, 0.06)",
      borderColor:
        "rgba(48, 183, 106, 0.30)",
      iconBackground:
        "rgba(48, 183, 106, 0.12)",
    };
  }

  if (status === "rejected") {
    return {
      title: "درخواست نیاز به اصلاح دارد",
      subtitle:
        "جزئیات درخواست را مشاهده و اطلاعات را تکمیل کنید.",
      icon: "alert-circle-outline" as const,
      color: Colors.error,
      backgroundColor:
        "rgba(225, 90, 90, 0.06)",
      borderColor:
        "rgba(225, 90, 90, 0.30)",
      iconBackground:
        "rgba(225, 90, 90, 0.12)",
    };
  }

  return {
    title: "به‌عنوان ارائه‌دهنده ثبت‌نام کنید",
    subtitle:
      "مهارت‌های خود را معرفی کنید و درخواست‌های کاری دریافت نمایید.",
    icon: "briefcase-outline" as const,
    color: Colors.primary,
    backgroundColor:
      "rgba(76, 141, 255, 0.06)",
    borderColor:
      "rgba(76, 141, 255, 0.26)",
    iconBackground: Colors.primarySoft,
  };
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  scrollContent: {
    width: "100%",
    maxWidth: Layout.contentMaxWidth,
    alignSelf: "center",
    paddingHorizontal: Layout.screenPadding,
    paddingTop: Spacing.lg,
    paddingBottom: 130,
  },

  header: {
    width: "100%",
    alignItems: "flex-end",
    gap: Spacing.xs,
  },

  eyebrow: {
    ...Typography.captionStyle,
    width: "100%",
    color: Colors.primary,
    textAlign: "right",
    writingDirection: "rtl",
  },

  title: {
    ...Typography.screenTitle,
    width: "100%",
    color: Colors.textPrimary,
    textAlign: "right",
    writingDirection: "rtl",
    fontSize: 28,
    lineHeight: 35,
  },

  profileCard: {
    width: "100%",
    marginTop: Spacing.xxl,
  },

  profileContent: {
    minHeight: 116,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: Spacing.md,
    padding: Spacing.lg,
  },

  profileAvatar: {
    width: 68,
    height: 68,
    flexShrink: 0,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primarySoft,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor:
      "rgba(76, 141, 255, 0.30)",
  },

  profileInitials: {
    color: Colors.primary,
    fontSize: 24,
    fontWeight: "700",
  },

  editAvatarBadge: {
    position: "absolute",
    right: -2,
    bottom: -2,
    width: 24,
    height: 24,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primary,
    borderWidth: 2,
    borderColor: Colors.backgroundRaised,
  },

  profileCopy: {
    flex: 1,
    alignItems: "flex-end",
    gap: 3,
  },

  profileName: {
    ...Typography.sectionTitle,
    width: "100%",
    color: Colors.textPrimary,
    textAlign: "right",
    writingDirection: "rtl",
    fontSize: 21,
    lineHeight: 28,
  },

  profilePhone: {
    ...Typography.bodyStyle,
    width: "100%",
    color: Colors.textSecondary,
    textAlign: "right",
    writingDirection: "rtl",
  },

  accountBadge: {
    marginTop: Spacing.xs,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 5,
  },

  accountBadgeText: {
    ...Typography.captionStyle,
    color: Colors.primary,
    textAlign: "right",
    writingDirection: "rtl",
  },

  editProfileButton: {
    width: 40,
    height: 40,
    flexShrink: 0,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.glass,
  },

  providerStatusPressable: {
    width: "100%",
    marginTop: Spacing.lg,
    borderRadius: Radius.xl,
  },

  providerStatusCard: {
    width: "100%",
  },

  providerStatusContent: {
    minHeight: 112,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: Spacing.md,
    padding: Spacing.lg,
  },

  providerStatusIcon: {
    width: 50,
    height: 50,
    flexShrink: 0,
    borderRadius: Radius.lg,
    alignItems: "center",
    justifyContent: "center",
  },

  providerStatusCopy: {
    flex: 1,
    alignItems: "flex-end",
    gap: 3,
  },

  providerStatusEyebrow: {
    ...Typography.captionStyle,
    width: "100%",
    textAlign: "right",
    writingDirection: "rtl",
  },

  providerStatusTitle: {
    ...Typography.label,
    width: "100%",
    color: Colors.textPrimary,
    textAlign: "right",
    writingDirection: "rtl",
    fontSize: 17,
    lineHeight: 23,
  },

  providerStatusSubtitle: {
    ...Typography.captionStyle,
    width: "100%",
    color: Colors.textSecondary,
    textAlign: "right",
    writingDirection: "rtl",
    lineHeight: 19,
  },

  section: {
    width: "100%",
    marginTop: Spacing.section,
    gap: Spacing.md,
  },

  sectionTitle: {
    ...Typography.sectionTitle,
    width: "100%",
    color: Colors.textPrimary,
    textAlign: "right",
    writingDirection: "rtl",
    fontSize: 20,
    lineHeight: 27,
  },

  menuList: {
    width: "100%",
    gap: Spacing.sm,
  },

  menuPressable: {
    width: "100%",
    borderRadius: Radius.lg,
  },

  menuSurface: {
    width: "100%",
  },

  menuContent: {
    minHeight: 76,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: Spacing.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },

  menuIcon: {
    width: 44,
    height: 44,
    flexShrink: 0,
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primarySoft,
  },

  selectedMenuIcon: {
    backgroundColor: Colors.primary,
  },

  destructiveMenuIcon: {
    backgroundColor:
      "rgba(225, 90, 90, 0.10)",
  },

  menuCopy: {
    flex: 1,
    alignItems: "flex-end",
    gap: 2,
  },

  menuTitle: {
    ...Typography.label,
    width: "100%",
    color: Colors.textPrimary,
    textAlign: "right",
    writingDirection: "rtl",
    fontSize: 16,
    lineHeight: 22,
  },

  destructiveMenuTitle: {
    color: Colors.error,
  },

  menuSubtitle: {
    ...Typography.captionStyle,
    width: "100%",
    color: Colors.textTertiary,
    textAlign: "right",
    writingDirection: "rtl",
  },

  menuBadge: {
    minWidth: 26,
    height: 26,
    paddingHorizontal: 7,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primarySoft,
  },

  menuBadgeText: {
    ...Typography.captionStyle,
    color: Colors.primary,
    fontWeight: "700",
  },

  selectedToggleSurface: {
    borderColor:
      "rgba(76, 141, 255, 0.42)",
    backgroundColor:
      "rgba(76, 141, 255, 0.07)",
  },

  switchTrack: {
    width: 46,
    height: 28,
    flexShrink: 0,
    borderRadius: Radius.pill,
    justifyContent: "center",
    paddingHorizontal: 3,
    backgroundColor: Colors.glassStrong,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.borderStrong,
  },

  switchTrackSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },

  switchThumb: {
    width: 22,
    height: 22,
    borderRadius: Radius.pill,
    backgroundColor: Colors.textTertiary,
  },

  switchThumbSelected: {
    alignSelf: "flex-end",
    backgroundColor: Colors.white,
  },

  versionText: {
    ...Typography.captionStyle,
    width: "100%",
    marginTop: Spacing.section,
    color: Colors.textMuted,
    textAlign: "center",
    writingDirection: "rtl",
  },

  pressed: {
    opacity: 0.82,
  },

  cardPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.993 }],
  },
});