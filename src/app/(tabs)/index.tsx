import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ComponentProps, useMemo } from "react";
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";

import {
  Fonts,
  KhedmatPalette,
  Layout,
  Radius,
  Shadows,
  Spacing,
  Typography,
} from "../../constants/theme";
import { useLanguage } from "../../context/languagecontext";
import { ProviderProfile, providers } from "../../data/providers";

type IconName = ComponentProps<typeof Ionicons>["name"];

type LanguageName = "English" | "Dari" | "Pashto";

type LocalizedText = {
  English: string;
  Dari: string;
  Pashto: string;
};

type ServiceCategory = {
  id: string;
  title: LocalizedText;
  subtitle: LocalizedText;
  icon: IconName;
};

const SERVICE_CATEGORIES: ServiceCategory[] = [
  {
    id: "electrician",
    title: {
      English: "Electrician",
      Dari: "برق‌کاری",
      Pashto: "برېښناکار",
    },
    subtitle: {
      English: "Installation and repairs",
      Dari: "نصب و ترمیم برق",
      Pashto: "نصب او ترمیم",
    },
    icon: "flash-outline",
  },
  {
    id: "plumber",
    title: {
      English: "Plumber",
      Dari: "لوله‌کشی",
      Pashto: "نلدوان",
    },
    subtitle: {
      English: "Water and drainage",
      Dari: "آب و فاضلاب",
      Pashto: "اوبه او فاضلاب",
    },
    icon: "water-outline",
  },
  {
    id: "cleaner",
    title: {
      English: "Cleaning",
      Dari: "نظافت",
      Pashto: "پاک‌کاري",
    },
    subtitle: {
      English: "Home and office",
      Dari: "خانه و دفتر",
      Pashto: "کور او دفتر",
    },
    icon: "sparkles-outline",
  },
  {
    id: "construction",
    title: {
      English: "Construction",
      Dari: "ساختمان",
      Pashto: "ساختماني کار",
    },
    subtitle: {
      English: "Repair and renovation",
      Dari: "ترمیم و بازسازی",
      Pashto: "ترمیم او بیارغونه",
    },
    icon: "construct-outline",
  },
  {
    id: "carpenter",
    title: {
      English: "Carpenter",
      Dari: "نجاری",
      Pashto: "ترکاڼ",
    },
    subtitle: {
      English: "Furniture and woodwork",
      Dari: "وسایل چوبی",
      Pashto: "لرګین وسایل",
    },
    icon: "hammer-outline",
  },
  {
    id: "computer-repair",
    title: {
      English: "Tech repair",
      Dari: "تخنیک",
      Pashto: "تخنیکي ترمیم",
    },
    subtitle: {
      English: "Phones and computers",
      Dari: "موبایل و کمپیوتر",
      Pashto: "موبایل او کمپیوټر",
    },
    icon: "laptop-outline",
  },
  {
    id: "painter",
    title: {
      English: "Painting",
      Dari: "رنگ‌کاری",
      Pashto: "رنګمالي",
    },
    subtitle: {
      English: "Walls and buildings",
      Dari: "نقاشی دیوار و ساختمان",
      Pashto: "دیوالونه او ودانۍ",
    },
    icon: "color-palette-outline",
  },
  {
    id: "gardener",
    title: {
      English: "Gardening",
      Dari: "باغبانی",
      Pashto: "باغواني",
    },
    subtitle: {
      English: "Gardens and plants",
      Dari: "تنظیم باغچه و گل",
      Pashto: "باغ او بوټي",
    },
    icon: "leaf-outline",
  },
  {
    id: "appliance-repair",
    title: {
      English: "Appliances",
      Dari: "لوازم خانگی",
      Pashto: "کورني وسایل",
    },
    subtitle: {
      English: "Home appliance repair",
      Dari: "ترمیم لوازم خانه",
      Pashto: "د کور وسایلو ترمیم",
    },
    icon: "settings-outline",
  },
];

const FEATURED_PROVIDERS = [...providers]
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
  const { language } = useLanguage();
  const { width } = useWindowDimensions();

  const activeLanguage = normalizeLanguage(language);

  const isRtl = activeLanguage === "Dari" || activeLanguage === "Pashto";

  const copy = getHomeCopy(activeLanguage);

  const compactGrid = width < 370;

  const categories = useMemo(
    () =>
      SERVICE_CATEGORIES.map((category) => ({
        ...category,
        localizedTitle: category.title[activeLanguage],
        localizedSubtitle: category.subtitle[activeLanguage],
      })),
    [activeLanguage],
  );

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

  const openProvider = (providerId: string) => {
    router.push({
      pathname: "/provider-profile",
      params: {
        providerId,
      },
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View
          style={[
            styles.topBar,
            {
              flexDirection: isRtl ? "row" : "row-reverse",
            },
          ]}
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={copy.profileAccessibility}
            onPress={() => router.push("/(tabs)/profile")}
            style={({ pressed }) => [
              styles.avatarButton,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.avatarText}>
              {activeLanguage === "English" ? "A" : "ا"}
            </Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={copy.notificationsAccessibility}
            style={({ pressed }) => [
              styles.notificationButton,
              pressed && styles.pressed,
            ]}
          >
            <Ionicons
              name="notifications-outline"
              size={22}
              color={KhedmatPalette.navy900}
            />

            <View style={styles.notificationDot} />
          </Pressable>
        </View>

        <View style={styles.hero}>
          <Text style={[styles.greeting, directionStyle(isRtl)]}>
            {copy.greeting}
          </Text>

          <Text style={[styles.heroTitle, directionStyle(isRtl)]}>
            {copy.heroTitle}
          </Text>
        </View>

        <Pressable
          accessibilityRole="search"
          accessibilityLabel={copy.searchAccessibility}
          onPress={openSearch}
          style={({ pressed }) => [
            styles.searchBox,
            pressed && styles.pressed,
            {
              flexDirection: isRtl ? "row-reverse" : "row",
            },
          ]}
        >
          <View style={styles.searchIcon}>
            <Ionicons
              name="search-outline"
              size={22}
              color={KhedmatPalette.white}
            />
          </View>

          <Text
            numberOfLines={1}
            style={[styles.searchPlaceholder, directionStyle(isRtl)]}
          >
            {copy.searchPlaceholder}
          </Text>

          <View style={styles.filterIcon}>
            <Ionicons
              name="options-outline"
              size={20}
              color={KhedmatPalette.navy700}
            />
          </View>
        </Pressable>

        <View style={styles.section}>
          <SectionHeader
            title={copy.popularServices}
            actionLabel={copy.viewAll}
            isRtl={isRtl}
            onPress={openSearch}
          />

          <View style={styles.categoriesGrid}>
            {categories.map((category) => (
              <Pressable
                key={category.id}
                accessibilityRole="button"
                accessibilityLabel={category.localizedTitle}
                onPress={() => openCategory(category.id)}
                style={({ pressed }) => [
                  styles.categoryCard,
                  compactGrid && styles.categoryCardCompact,
                  pressed && styles.cardPressed,
                ]}
              >
                <View style={styles.categoryIcon}>
                  <Ionicons
                    name={category.icon}
                    size={compactGrid ? 24 : 27}
                    color={KhedmatPalette.blue500}
                  />
                </View>

                <Text
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={0.82}
                  style={[styles.categoryTitle, directionStyle(isRtl)]}
                >
                  {category.localizedTitle}
                </Text>

                <Text
                  numberOfLines={2}
                  style={[styles.categorySubtitle, directionStyle(isRtl)]}
                >
                  {category.localizedSubtitle}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <SectionHeader
            title={copy.nearbyProviders}
            actionLabel={copy.viewAll}
            isRtl={isRtl}
            onPress={openSearch}
          />

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.providersRow}
            style={[
              styles.providersScroll,
              {
                direction: isRtl ? "rtl" : "ltr",
              },
            ]}
          >
            {FEATURED_PROVIDERS.map((provider) => (
              <ProviderCard
                key={provider.id}
                provider={provider}
                language={activeLanguage}
                isRtl={isRtl}
                copy={copy}
                onPress={() => openProvider(provider.id)}
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
  isRtl: boolean;
  onPress: () => void;
};

function SectionHeader({
  title,
  actionLabel,
  isRtl,
  onPress,
}: SectionHeaderProps) {
  return (
    <View
      style={[
        styles.sectionHeader,
        {
          // Title on left for English (LTR), on right for Dari/Pashto (RTL)
          flexDirection: isRtl ? "row" : "row",
        },
      ]}
    >
      <Text style={[styles.sectionTitle, directionStyle(isRtl)]}>{title}</Text>

      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        style={({ pressed }) => [
          styles.sectionAction,
          {
            // View all button layout direction based on language
            flexDirection: isRtl ? "row-reverse" : "row",
          },
          pressed && styles.pressed,
        ]}
      >
        <Text style={[styles.sectionActionText, directionStyle(isRtl)]}>
          {actionLabel}
        </Text>

        <Ionicons
          name={isRtl ? "chevron-back" : "chevron-forward"}
          size={15}
          color={KhedmatPalette.blue500}
        />
      </Pressable>
    </View>
  );
}

type ProviderCardProps = {
  provider: ProviderProfile;
  language: LanguageName;
  isRtl: boolean;
  copy: ReturnType<typeof getHomeCopy>;
  onPress: () => void;
};

function ProviderCard({
  provider,
  language,
  isRtl,
  copy,
  onPress,
}: ProviderCardProps) {
  const useLocalizedDigits = language !== "English";

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={provider.name}
      onPress={onPress}
      style={({ pressed }) => [
        styles.providerCard,
        pressed && styles.cardPressed,
      ]}
    >
      <View
        style={[
          styles.providerTopRow,
          {
            flexDirection: isRtl ? "row-reverse" : "row",
          },
        ]}
      >
        <View style={styles.providerAvatar}>
          <Text style={styles.providerInitials}>{provider.initials}</Text>

          {provider.verified ? (
            <View style={styles.verifiedBadge}>
              <Ionicons
                name="checkmark"
                size={11}
                color={KhedmatPalette.white}
              />
            </View>
          ) : null}
        </View>

        <View
          style={[
            styles.availabilityBadge,
            !provider.availableToday && styles.unavailableBadge,
            {
              flexDirection: isRtl ? "row-reverse" : "row",
            },
          ]}
        >
          <View
            style={[
              styles.availabilityDot,
              !provider.availableToday && styles.unavailableDot,
            ]}
          />

          <Text style={[styles.availabilityText, directionStyle(isRtl)]}>
            {provider.availableToday ? copy.availableToday : copy.currentlyBusy}
          </Text>
        </View>
      </View>

      <View
        style={[
          styles.providerCopy,
          {
            alignItems: isRtl ? "flex-end" : "flex-start",
          },
        ]}
      >
        <Text
          numberOfLines={1}
          style={[styles.providerName, directionStyle(isRtl)]}
        >
          {provider.name}
        </Text>

        <Text
          numberOfLines={1}
          style={[styles.providerProfession, directionStyle(isRtl)]}
        >
          {provider.profession}
        </Text>

        <View
          style={[
            styles.providerLocation,
            {
              flexDirection: isRtl ? "row-reverse" : "row",
            },
          ]}
        >
          <Ionicons
            name="location-outline"
            size={15}
            color={KhedmatPalette.textMuted}
          />

          <Text
            numberOfLines={1}
            style={[styles.providerLocationText, directionStyle(isRtl)]}
          >
            {provider.locationLabel}
          </Text>
        </View>

        <Text style={[styles.providerPrice, directionStyle(isRtl)]}>
          {copy.fromPrice} {formatCurrency(provider.minimumPrice, language)}
        </Text>
      </View>

      <View style={styles.providerDivider} />

      <View
        style={[
          styles.providerStats,
          {
            flexDirection: isRtl ? "row-reverse" : "row",
          },
        ]}
      >
        <View
          style={[
            styles.providerStat,
            {
              flexDirection: isRtl ? "row-reverse" : "row",
            },
          ]}
        >
          <Ionicons
            name="briefcase-outline"
            size={15}
            color={KhedmatPalette.textMuted}
          />

          <Text style={styles.providerStatText}>
            {formatDigits(
              provider.completedJobs.toString(),
              useLocalizedDigits,
            )}{" "}
            {copy.jobs}
          </Text>
        </View>

        <View
          style={[
            styles.providerStat,
            {
              flexDirection: isRtl ? "row-reverse" : "row",
            },
          ]}
        >
          <Ionicons name="star" size={15} color="#D99A2B" />

          <Text style={styles.providerStatText}>
            {formatDigits(provider.rating.toFixed(1), useLocalizedDigits)}
          </Text>

          <Text style={styles.reviewCount}>
            ({formatDigits(provider.reviewCount.toString(), useLocalizedDigits)}
            )
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

function normalizeLanguage(language: string): LanguageName {
  if (language === "Dari") {
    return "Dari";
  }

  if (language === "Pashto") {
    return "Pashto";
  }

  return "English";
}

function directionStyle(isRtl: boolean) {
  return {
    textAlign: isRtl ? ("right" as const) : ("left" as const),

    writingDirection: isRtl ? ("rtl" as const) : ("ltr" as const),
  };
}

function formatCurrency(amount: number, language: LanguageName): string {
  const formatted = new Intl.NumberFormat("en-US").format(amount);

  if (language === "English") {
    return `${formatted} AFN`;
  }

  const localized = formatDigits(formatted, true);

  return language === "Dari" ? `${localized} افغانی` : `${localized} افغانۍ`;
}

function formatDigits(value: string, localized: boolean): string {
  if (!localized) {
    return value;
  }

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

function getHomeCopy(language: LanguageName) {
  if (language === "Dari") {
    return {
      greeting: "سلام، احمد",
      heroTitle: "امروز به کدام خدمت نیاز دارید؟",
      searchPlaceholder: "جستجوی خدمت یا ارائه‌دهنده",
      popularServices: "خدمات محبوب",
      nearbyProviders: "ارائه‌دهندگان نزدیک",
      viewAll: "مشاهده همه",
      availableToday: "امروز آماده",
      currentlyBusy: "فعلاً مصروف",
      fromPrice: "از",
      jobs: "کار",
      profileAccessibility: "باز کردن پروفایل",
      notificationsAccessibility: "اعلان‌ها",
      searchAccessibility: "جستجوی خدمات",
    };
  }

  if (language === "Pashto") {
    return {
      greeting: "سلام، احمد",
      heroTitle: "نن کوم خدمت ته اړتیا لرئ؟",
      searchPlaceholder: "خدمت یا خدمت وړاندې کوونکی ولټوئ",
      popularServices: "مشهور خدمتونه",
      nearbyProviders: "نږدې خدمت وړاندې کوونکي",
      viewAll: "ټول وګورئ",
      availableToday: "نن چمتو دی",
      currentlyBusy: "اوس بوخت دی",
      fromPrice: "له",
      jobs: "کارونه",
      profileAccessibility: "پروفایل پرانیستل",
      notificationsAccessibility: "خبرتیاوې",
      searchAccessibility: "خدمتونه ولټوئ",
    };
  }

  return {
    greeting: "Hello, Ahmad",
    heroTitle: "What service do you need today?",
    searchPlaceholder: "Search services or providers",
    popularServices: "Popular services",
    nearbyProviders: "Providers near you",
    viewAll: "View all",
    availableToday: "Available today",
    currentlyBusy: "Currently busy",
    fromPrice: "From",
    jobs: "jobs",
    profileAccessibility: "Open profile",
    notificationsAccessibility: "Notifications",
    searchAccessibility: "Search services",
  };
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: KhedmatPalette.blue050,
  },

  scrollContent: {
    width: "100%",
    maxWidth: Layout.contentMaxWidth,
    alignSelf: "center",
    paddingHorizontal: Layout.screenPadding,
    paddingTop: Spacing.md,
    paddingBottom: 125,
  },

  topBar: {
    width: "100%",
    minHeight: Layout.minimumTouchTarget,
    alignItems: "center",
    justifyContent: "space-between",
  },

  avatarButton: {
    width: 46,
    height: 46,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: KhedmatPalette.navy900,
    ...Shadows.small,
  },

  avatarText: {
    fontFamily: Fonts.bold,
    color: KhedmatPalette.white,
    fontSize: 17,
    lineHeight: 22,
  },

  notificationButton: {
    width: 46,
    height: 46,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: KhedmatPalette.surface,
    borderWidth: 1,
    borderColor: KhedmatPalette.border,
  },

  notificationDot: {
    position: "absolute",
    top: 9,
    right: 9,
    width: 7,
    height: 7,
    borderRadius: Radius.pill,
    backgroundColor: KhedmatPalette.error,
    borderWidth: 1.5,
    borderColor: KhedmatPalette.surface,
  },

  hero: {
    width: "100%",
    marginTop: Spacing.xl,
    gap: Spacing.xs,
  },

  greeting: {
    ...Typography.label,
    width: "100%",
    color: KhedmatPalette.blue500,
  },

  heroTitle: {
    ...Typography.screenTitle,
    width: "100%",
    maxWidth: 430,
    color: KhedmatPalette.textPrimary,
    fontSize: 26,
    lineHeight: 33,
  },

  searchBox: {
    width: "100%",
    minHeight: 58,
    marginTop: Spacing.xl,
    paddingHorizontal: Spacing.md,
    alignItems: "center",
    gap: Spacing.md,
    borderRadius: Radius.xl,
    backgroundColor: KhedmatPalette.surface,
    borderWidth: 1,
    borderColor: KhedmatPalette.border,
    ...Shadows.small,
  },

  searchIcon: {
    width: 40,
    height: 40,
    flexShrink: 0,
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: KhedmatPalette.blue500,
  },

  searchPlaceholder: {
    ...Typography.bodyStyle,
    flex: 1,
    color: KhedmatPalette.textMuted,
  },

  filterIcon: {
    width: 38,
    height: 38,
    flexShrink: 0,
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: KhedmatPalette.surfaceSoft,
  },

  section: {
    width: "100%",
    marginTop: Spacing.section,
    gap: Spacing.lg,
  },

  sectionHeader: {
    width: "100%",
    alignItems: "center",
    justifyContent: "space-between",
  },

  sectionTitle: {
    ...Typography.sectionTitle,
    color: KhedmatPalette.textPrimary,
    fontSize: 20,
    lineHeight: 26,
  },

  sectionAction: {
    minHeight: 36,
    alignItems: "center",
    gap: 2,
  },

  sectionActionText: {
    ...Typography.captionStyle,
    color: KhedmatPalette.blue500,
    fontFamily: Fonts.medium,
  },

  categoriesGrid: {
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: Spacing.md,
  },

  categoryCard: {
    width: "31.5%",
    minHeight: 154,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.md,
    alignItems: "center",
    justifyContent: "flex-start",
    borderRadius: Radius.xl,
    backgroundColor: KhedmatPalette.surface,
    borderWidth: 1,
    borderColor: KhedmatPalette.border,
    ...Shadows.small,
  },

  categoryCardCompact: {
    minHeight: 144,
  },

  categoryIcon: {
    width: 54,
    height: 54,
    marginBottom: Spacing.md,
    borderRadius: Radius.lg,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: KhedmatPalette.surfaceSoft,
  },

  categoryTitle: {
    ...Typography.label,
    width: "100%",
    color: KhedmatPalette.textPrimary,
    textAlign: "center",
    fontSize: 14,
    lineHeight: 19,
  },

  categorySubtitle: {
    ...Typography.captionStyle,
    width: "100%",
    marginTop: Spacing.xs,
    color: KhedmatPalette.textMuted,
    textAlign: "center",
    fontSize: 11,
    lineHeight: 15,
  },

  providersScroll: {
    overflow: "visible",
  },

  providersRow: {
    gap: Spacing.md,
    paddingRight: 2,
    paddingLeft: 2,
    paddingBottom: Spacing.sm,
  },

  providerCard: {
    width: 286,
    minHeight: 260,
    padding: Spacing.lg,
    borderRadius: Radius.xl,
    backgroundColor: KhedmatPalette.surface,
    borderWidth: 1,
    borderColor: KhedmatPalette.border,
    ...Shadows.small,
  },

  providerTopRow: {
    width: "100%",
    alignItems: "center",
    justifyContent: "space-between",
  },

  providerAvatar: {
    width: 58,
    height: 58,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: KhedmatPalette.navy900,
  },

  providerInitials: {
    fontFamily: Fonts.bold,
    fontSize: 18,
    color: KhedmatPalette.white,
  },

  verifiedBadge: {
    position: "absolute",
    right: -2,
    bottom: -1,
    width: 20,
    height: 20,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: KhedmatPalette.blue500,
    borderWidth: 2,
    borderColor: KhedmatPalette.surface,
  },

  availabilityBadge: {
    minHeight: 30,
    paddingHorizontal: Spacing.md,
    alignItems: "center",
    gap: Spacing.xs,
    borderRadius: Radius.pill,
    backgroundColor: KhedmatPalette.successSoft,
  },

  unavailableBadge: {
    backgroundColor: KhedmatPalette.surfaceSoft,
  },

  availabilityDot: {
    width: 7,
    height: 7,
    borderRadius: Radius.pill,
    backgroundColor: KhedmatPalette.success,
  },

  unavailableDot: {
    backgroundColor: KhedmatPalette.textMuted,
  },

  availabilityText: {
    ...Typography.captionStyle,
    color: KhedmatPalette.textSecondary,
    fontSize: 11,
  },

  providerCopy: {
    width: "100%",
    marginTop: Spacing.lg,
  },

  providerName: {
    ...Typography.sectionTitle,
    width: "100%",
    color: KhedmatPalette.textPrimary,
    fontSize: 19,
    lineHeight: 25,
  },

  providerProfession: {
    ...Typography.bodyStyle,
    width: "100%",
    marginTop: 2,
    color: KhedmatPalette.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },

  providerLocation: {
    width: "100%",
    marginTop: Spacing.md,
    alignItems: "center",
    gap: Spacing.xs,
  },

  providerLocationText: {
    ...Typography.captionStyle,
    flex: 1,
    color: KhedmatPalette.textMuted,
  },

  providerPrice: {
    ...Typography.label,
    width: "100%",
    marginTop: Spacing.sm,
    color: KhedmatPalette.success,
  },

  providerDivider: {
    width: "100%",
    height: StyleSheet.hairlineWidth,
    marginVertical: Spacing.lg,
    backgroundColor: KhedmatPalette.border,
  },

  providerStats: {
    width: "100%",
    alignItems: "center",
    justifyContent: "space-between",
  },

  providerStat: {
    alignItems: "center",
    gap: Spacing.xs,
  },

  providerStatText: {
    ...Typography.captionStyle,
    color: KhedmatPalette.textSecondary,
  },

  reviewCount: {
    ...Typography.captionStyle,
    color: KhedmatPalette.textMuted,
  },

  pressed: {
    opacity: 0.78,
  },

  cardPressed: {
    opacity: 0.86,
    transform: [
      {
        scale: 0.985,
      },
    ],
  },
});
