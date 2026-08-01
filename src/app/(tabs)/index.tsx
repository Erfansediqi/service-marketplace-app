import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ComponentProps } from "react";
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { GlassSurface } from "../../components/glass/glass-surface";
import {
  Colors,
  Layout,
  Radius,
  Shadows,
  Spacing,
  Typography,
} from "../../constants/theme";
import { ProviderProfile, providers } from "../../data/providers";

type IconName = ComponentProps<typeof Ionicons>["name"];

type ServiceCategory = {
  id: string;
  title: string;
  subtitle: string;
  icon: IconName;
};

const serviceCategories: ServiceCategory[] = [
  {
    id: "electrician",
    title: "برق‌کاری",
    subtitle: "نصب و ترمیم برق",
    icon: "flash-outline",
  },
  {
    id: "plumber",
    title: "لوله‌کشی",
    subtitle: "آب و فاضلاب",
    icon: "water-outline",
  },
  {
    id: "cleaner",
    title: "نظافت",
    subtitle: "خانه و دفتر",
    icon: "sparkles-outline",
  },
  {
    id: "construction",
    title: "ساختمان",
    subtitle: "ترمیم و بازسازی",
    icon: "construct-outline",
  },
  {
    id: "carpenter",
    title: "نجاری",
    subtitle: "وسایل چوبی",
    icon: "hammer-outline",
  },
  {
    id: "computer-repair",
    title: "تخنیک",
    subtitle: "موبایل و کمپیوتر",
    icon: "laptop-outline",
  },
  {
    id: "painter",
    title: "رنگ‌کاری",
    subtitle: "نقاشی دیوار و ساختمان",
    icon: "color-palette-outline",
  },
  {
    id: "gardener",
    title: "باغبانی",
    subtitle: "تنظیم باغچه و گل",
    icon: "leaf-outline",
  },
  {
    id: "appliance-repair",
    title: "لوازم خانگی",
    subtitle: "یخچال، ماشین لباسشویی",
    icon: "settings-outline",
  },
];

const featuredProviders = [...providers]
  .sort((first, second) => {
    if (first.availableToday !== second.availableToday) {
      return first.availableToday ? -1 : 1;
    }

    if (first.rating !== second.rating) {
      return second.rating - first.rating;
    }

    return first.distanceKm - second.distanceKm;
  })
  .slice(0, 4);

export default function HomeScreen() {
  const router = useRouter();

  const openSearch = () => {
    router.push("/(tabs)/search");
  };

  const openCategory = (categoryId: string) => {
    router.push({
      pathname: "/(tabs)/search",
      params: {
        category: categoryId,
      },
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.topBar}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="باز کردن پروفایل"
            onPress={() => router.push("/(tabs)/profile")}
            style={({ pressed }) => [
              styles.avatarPressable,
              pressed && styles.pressed,
            ]}
          >
            <GlassSurface
              variant="prominent"
              radius={Radius.pill}
              style={styles.avatarSurface}
              contentStyle={styles.avatarContent}
            >
              <Text style={styles.avatarText}>ا</Text>
            </GlassSurface>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="اعلان‌ها"
            style={({ pressed }) => [
              styles.notificationPressable,
              pressed && styles.pressed,
            ]}
          >
            <GlassSurface
              radius={Radius.pill}
              style={styles.notificationSurface}
              contentStyle={styles.notificationContent}
            >
              <Ionicons
                name="notifications-outline"
                size={21}
                color={Colors.textPrimary}
              />

              <View style={styles.notificationDot} />
            </GlassSurface>
          </Pressable>
        </View>

        <View style={styles.hero}>
          <Text style={styles.greeting}>سلام، احمد</Text>

          <Text style={styles.heroTitle}>امروز به کدام خدمت نیاز دارید؟</Text>
        </View>

        <Pressable
          accessibilityRole="search"
          accessibilityLabel="جستجوی خدمات"
          onPress={openSearch}
          style={({ pressed }) => [
            styles.searchPressable,
            pressed && styles.pressed,
          ]}
        >
          <GlassSurface
            variant="prominent"
            radius={Radius.xl}
            style={[styles.searchSurface, Shadows.small]}
            contentStyle={styles.searchContent}
          >
            <View style={styles.searchIcon}>
              <Ionicons
                name="search-outline"
                size={22}
                color={Colors.primary}
              />
            </View>

            <Text style={styles.searchPlaceholder}>
              جستجوی خدمت یا ارائه‌دهنده...
            </Text>

            <View style={styles.filterIcon}>
              <Ionicons
                name="options-outline"
                size={20}
                color={Colors.textSecondary}
              />
            </View>
          </GlassSurface>
        </Pressable>

        <View style={styles.section}>
          <SectionHeader
            title="خدمات محبوب"
            actionLabel="مشاهده همه"
            onPress={openSearch}
          />

          <View style={styles.categoriesGrid}>
            {serviceCategories.map((category) => (
              <Pressable
                key={category.id}
                accessibilityRole="button"
                accessibilityLabel={category.title}
                onPress={() => openCategory(category.id)}
                style={({ pressed }) => [
                  styles.categoryPressable,
                  pressed && styles.cardPressed,
                ]}
              >
                <GlassSurface
                  variant="regular"
                  radius={Radius.xl}
                  style={styles.categorySurface}
                  contentStyle={styles.categoryContent}
                >
                  <View style={styles.categoryIcon}>
                    <Ionicons
                      name={category.icon}
                      size={25}
                      color={Colors.primary}
                    />
                  </View>

                  <Text style={styles.categoryTitle}>{category.title}</Text>

                  <Text numberOfLines={1} style={styles.categorySubtitle}>
                    {category.subtitle}
                  </Text>
                </GlassSurface>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <SectionHeader
            title="ارائه‌دهندگان نزدیک"
            actionLabel="مشاهده همه"
            onPress={openSearch}
          />

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.providersRow}
          >
            {featuredProviders.map((provider) => (
              <ProviderCard
                key={provider.id}
                provider={provider}
                onPress={() =>
                  router.push({
                    pathname: "/provider-profile",
                    params: {
                      providerId: provider.id,
                    },
                  })
                }
              />
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

type SectionHeaderProps = {
  title: string;
  actionLabel: string;
  onPress: () => void;
};

function SectionHeader({ title, actionLabel, onPress }: SectionHeaderProps) {
  return (
    <View style={styles.sectionHeader}>
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        style={({ pressed }) => [
          styles.sectionAction,
          pressed && styles.pressed,
        ]}
      >
        <Ionicons name="chevron-back" size={16} color={Colors.primary} />

        <Text style={styles.sectionActionText}>{actionLabel}</Text>
      </Pressable>

      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );
}

function ProviderCard({
  provider,
  onPress,
}: {
  provider: ProviderProfile;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={provider.name}
      onPress={onPress}
      style={({ pressed }) => [
        styles.providerPressable,
        pressed && styles.cardPressed,
      ]}
    >
      <GlassSurface
        variant="regular"
        radius={Radius.xl}
        style={styles.providerSurface}
        contentStyle={styles.providerContent}
      >
        <View style={styles.providerTopRow}>
          <View
            style={[
              styles.availabilityBadge,
              !provider.availableToday && styles.unavailableBadge,
            ]}
          >
            <View
              style={[
                styles.availabilityDot,
                !provider.availableToday && styles.unavailableDot,
              ]}
            />

            <Text style={styles.availabilityText}>
              {provider.availableToday ? "امروز آماده" : "فعلاً مصروف"}
            </Text>
          </View>

          <View style={styles.providerAvatar}>
            <Text style={styles.providerInitials}>{provider.initials}</Text>

            {provider.verified ? (
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark" size={11} color={Colors.white} />
              </View>
            ) : null}
          </View>
        </View>

        <View style={styles.providerCopy}>
          <Text style={styles.providerName}>{provider.name}</Text>

          <Text style={styles.providerProfession}>{provider.profession}</Text>

          <View style={styles.providerLocation}>
            <Text numberOfLines={1} style={styles.providerLocationText}>
              {provider.locationLabel}
            </Text>

            <Ionicons
              name="location-outline"
              size={15}
              color={Colors.textTertiary}
            />
          </View>

          <Text style={styles.providerPrice}>
            از {formatCurrency(provider.minimumPrice)}
          </Text>
        </View>

        <View style={styles.providerDivider} />

        <View style={styles.providerStats}>
          <View style={styles.providerStat}>
            <Ionicons
              name="briefcase-outline"
              size={15}
              color={Colors.textTertiary}
            />

            <Text style={styles.providerStatText}>
              {toDariDigits(provider.completedJobs.toString())} کار
            </Text>
          </View>

          <View style={styles.providerStat}>
            <Text style={styles.providerStatText}>
              {toDariDigits(provider.rating.toFixed(1))}
            </Text>

            <Ionicons name="star" size={15} color={Colors.warning} />

            <Text style={styles.reviewCount}>
              ({toDariDigits(provider.reviewCount.toString())})
            </Text>
          </View>
        </View>
      </GlassSurface>
    </Pressable>
  );
}

function formatCurrency(amount: number): string {
  return `${new Intl.NumberFormat("fa-AF").format(amount)} افغانی`;
}

function toDariDigits(value: string): string {
  const digits: Record<string, string> = {
    "0": "۰",
    "1": "۱",
    "2": "۲",
    "3": "۳",
    "4": "۴",
    "5": "۵",
    "6": "۶",
    "7": "۷",
    "8": "۸",
    "9": "۹",
  };

  return value.replace(/\d/g, (digit) => digits[digit] ?? digit);
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
    paddingTop: Spacing.md,
    paddingBottom: 130,
  },

  topBar: {
    minHeight: Layout.minimumTouchTarget,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
  },

  avatarPressable: {
    width: Layout.minimumTouchTarget,
    height: Layout.minimumTouchTarget,
    borderRadius: Radius.pill,
  },

  avatarSurface: {
    flex: 1,
  },

  avatarContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  avatarText: {
    color: Colors.textPrimary,
    fontSize: 17,
    fontWeight: "700",
  },

  notificationPressable: {
    width: Layout.minimumTouchTarget,
    height: Layout.minimumTouchTarget,
    borderRadius: Radius.pill,
  },

  notificationSurface: {
    flex: 1,
  },

  notificationContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  notificationDot: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 7,
    height: 7,
    borderRadius: Radius.pill,
    backgroundColor: Colors.error,
    borderWidth: 1.5,
    borderColor: Colors.background,
  },

  hero: {
    width: "100%",
    marginTop: Spacing.xxl,
    alignItems: "flex-end",
    gap: Spacing.xs,
  },

  greeting: {
    ...Typography.label,
    width: "100%",
    color: Colors.primary,
    textAlign: "right",
    writingDirection: "rtl",
  },

  heroTitle: {
    ...Typography.screenTitle,
    width: "100%",
    color: Colors.textPrimary,
    textAlign: "right",
    writingDirection: "rtl",
    fontSize: 28,
    lineHeight: 35,
  },

  searchPressable: {
    width: "100%",
    marginTop: Spacing.xxl,
    borderRadius: Radius.xl,
  },

  searchSurface: {
    width: "100%",
  },

  searchContent: {
    minHeight: 62,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },

  searchIcon: {
    width: 38,
    height: 38,
    flexShrink: 0,
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primarySoft,
  },

  searchPlaceholder: {
    ...Typography.bodyStyle,
    flex: 1,
    color: Colors.textSecondary,
    textAlign: "right",
    writingDirection: "rtl",
  },

  filterIcon: {
    width: 36,
    height: 36,
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.glass,
  },

  section: {
    width: "100%",
    marginTop: Spacing.section,
    gap: Spacing.lg,
  },

  sectionHeader: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  sectionTitle: {
    ...Typography.sectionTitle,
    color: Colors.textPrimary,
    textAlign: "right",
    writingDirection: "rtl",
    fontSize: 21,
    lineHeight: 28,
  },

  sectionAction: {
    minHeight: 36,
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },

  sectionActionText: {
    ...Typography.captionStyle,
    color: Colors.primary,
    writingDirection: "rtl",
  },

  categoriesGrid: {
    width: "100%",
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: Spacing.md,
  },

  categoryPressable: {
    width: "31.5%",
    minWidth: 96,
    borderRadius: Radius.xl,
  },

  categorySurface: {
    width: "100%",
  },

  categoryContent: {
    minHeight: 128,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.md,
  },

  categoryIcon: {
    width: 50,
    height: 50,
    borderRadius: Radius.lg,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primarySoft,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(76, 141, 255, 0.22)",
  },

  categoryTitle: {
    ...Typography.label,
    width: "100%",
    color: Colors.textPrimary,
    textAlign: "center",
    writingDirection: "rtl",
    fontSize: 15,
  },

  categorySubtitle: {
    ...Typography.captionStyle,
    width: "100%",
    color: Colors.textTertiary,
    textAlign: "center",
    writingDirection: "rtl",
    fontSize: 11,
  },

  providersRow: {
    flexDirection: "row-reverse",
    gap: Spacing.md,
    paddingHorizontal: 1,
  },

  providerPressable: {
    width: 274,
    borderRadius: Radius.xl,
  },

  providerSurface: {
    width: "100%",
  },

  providerContent: {
    padding: Spacing.lg,
  },

  providerTopRow: {
    flexDirection: "row-reverse",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },

  providerAvatar: {
    width: 58,
    height: 58,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primarySoft,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(76, 141, 255, 0.30)",
  },

  providerInitials: {
    color: Colors.primary,
    fontSize: 19,
    fontWeight: "700",
  },

  verifiedBadge: {
    position: "absolute",
    right: -2,
    bottom: -2,
    width: 20,
    height: 20,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primary,
    borderWidth: 2,
    borderColor: Colors.backgroundRaised,
  },

  availabilityBadge: {
    minHeight: 28,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: Spacing.sm,
    borderRadius: Radius.pill,
    backgroundColor: "rgba(48, 183, 106, 0.10)",
  },

  unavailableBadge: {
    backgroundColor: Colors.glass,
  },

  availabilityDot: {
    width: 6,
    height: 6,
    borderRadius: Radius.pill,
    backgroundColor: Colors.success,
  },

  unavailableDot: {
    backgroundColor: Colors.textTertiary,
  },

  availabilityText: {
    ...Typography.captionStyle,
    color: Colors.textSecondary,
    writingDirection: "rtl",
    fontSize: 11,
  },

  providerCopy: {
    width: "100%",
    marginTop: Spacing.md,
    alignItems: "flex-end",
    gap: 3,
  },

  providerName: {
    ...Typography.sectionTitle,
    width: "100%",
    color: Colors.textPrimary,
    textAlign: "right",
    writingDirection: "rtl",
    fontSize: 19,
    lineHeight: 25,
  },

  providerProfession: {
    ...Typography.bodyStyle,
    width: "100%",
    color: Colors.textSecondary,
    textAlign: "right",
    writingDirection: "rtl",
  },

  providerLocation: {
    width: "100%",
    marginTop: 3,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 4,
  },

  providerLocationText: {
    ...Typography.captionStyle,
    flex: 1,
    color: Colors.textTertiary,
    textAlign: "right",
    writingDirection: "rtl",
  },

  providerPrice: {
    ...Typography.captionStyle,
    width: "100%",
    color: Colors.success,
    textAlign: "right",
    writingDirection: "rtl",
    fontWeight: "600",
  },

  providerDivider: {
    width: "100%",
    height: StyleSheet.hairlineWidth,
    marginVertical: Spacing.md,
    backgroundColor: Colors.separator,
  },

  providerStats: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
  },

  providerStat: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 4,
  },

  providerStatText: {
    ...Typography.captionStyle,
    color: Colors.textSecondary,
    writingDirection: "rtl",
  },

  reviewCount: {
    ...Typography.captionStyle,
    color: Colors.textTertiary,
  },

  pressed: {
    opacity: 0.82,
  },

  cardPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.992 }],
  },
});
