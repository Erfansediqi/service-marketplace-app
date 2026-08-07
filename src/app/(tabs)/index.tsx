import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  ComponentProps,
  useMemo,
} from "react";
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
import { useCustomerProfile } from "../../context/customer-profile-context";
import { useLanguage } from "../../context/languagecontext";

type IconName =
  ComponentProps<
    typeof Ionicons
  >["name"];

type LanguageName =
  | "English"
  | "Dari"
  | "Pashto";

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
      English:
        "Installation and repairs",
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
      English:
        "Water and drainage",
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
      English:
        "Home and office",
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
      English:
        "Repair and renovation",
      Dari: "ترمیم و بازسازی",
      Pashto:
        "ترمیم او بیارغونه",
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
      English:
        "Furniture and woodwork",
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
      English:
        "Phones and computers",
      Dari: "موبایل و کمپیوتر",
      Pashto:
        "موبایل او کمپیوټر",
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
      English:
        "Walls and buildings",
      Dari:
        "نقاشی دیوار و ساختمان",
      Pashto:
        "دیوالونه او ودانۍ",
    },
    icon:
      "color-palette-outline",
  },
  {
    id: "gardener",
    title: {
      English: "Gardening",
      Dari: "باغبانی",
      Pashto: "باغواني",
    },
    subtitle: {
      English:
        "Gardens and plants",
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
      English:
        "Home appliance repair",
      Dari:
        "ترمیم لوازم خانه",
      Pashto:
        "د کور وسایلو ترمیم",
    },
    icon: "settings-outline",
  },
];

export default function HomeScreen() {
  const router = useRouter();

  const { language } =
    useLanguage();

  const { profile } =
    useCustomerProfile();

  const { width } =
    useWindowDimensions();

  const activeLanguage =
    normalizeLanguage(
      language,
    );

  const isRtl =
    activeLanguage === "Dari" ||
    activeLanguage === "Pashto";

  const copy =
    getHomeCopy(
      activeLanguage,
    );

  const greeting =
    getTimeSensitiveGreeting(
      copy,
      getFirstName(
        profile?.fullName,
      ),
      new Date().getHours(),
    );

  const compactGrid =
    width < 370;

  const categories =
    useMemo(
      () =>
        SERVICE_CATEGORIES.map(
          (category) => ({
            ...category,
            localizedTitle:
              category.title[
                activeLanguage
              ],
          }),
        ),
      [activeLanguage],
    );

  const openSearch =
    (): void => {
      router.push(
        "/(tabs)/search",
      );
    };

  const openCategory =
    (
      categoryId: string,
    ): void => {
      router.push({
        pathname:
          "/(tabs)/search",
        params: {
          category:
            categoryId,
        },
      });
    };

  return (
    <SafeAreaView
      style={styles.safeArea}
    >
      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={
          styles.scrollContent
        }
      >
        <View
          style={styles.hero}
        >
          <Text
            style={[
              styles.greeting,
              directionStyle(
                isRtl,
              ),
            ]}
          >
            {greeting}
          </Text>
        </View>

        <View
          style={styles.section}
        >
          <SectionHeader
            title={
              copy.popularServices
            }
            actionLabel={
              copy.viewAll
            }
            isRtl={isRtl}
            onPress={openSearch}
          />

          <View
            style={
              styles.categoriesGrid
            }
          >
            {categories.map(
              (category) => (
                <Pressable
                  key={
                    category.id
                  }
                  accessibilityRole="button"
                  accessibilityLabel={
                    category.localizedTitle
                  }
                  onPress={() =>
                    openCategory(
                      category.id,
                    )
                  }
                  style={({
                    pressed,
                  }) => [
                    styles.categoryCard,
                    compactGrid &&
                      styles.categoryCardCompact,
                    pressed &&
                      styles.cardPressed,
                  ]}
                >
                  <View
                    style={
                      styles.categoryContent
                    }
                  >
                    <View
                      style={
                        styles.categoryIcon
                      }
                    >
                      <Ionicons
                        name={
                          category.icon
                        }
                        size={
                          compactGrid
                            ? 26
                            : 28
                        }
                        color={
                          KhedmatPalette.blue500
                        }
                      />
                    </View>

                    <Text
                      numberOfLines={
                        1
                      }
                      adjustsFontSizeToFit
                      minimumFontScale={
                        0.7
                      }
                      style={
                        styles.categoryTitle
                      }
                    >
                      {
                        category.localizedTitle
                      }
                    </Text>
                  </View>
                </Pressable>
              ),
            )}
          </View>
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
          flexDirection:
            isRtl
              ? "row-reverse"
              : "row",
        },
      ]}
    >
      <Text
        style={[
          styles.sectionTitle,
          directionStyle(
            isRtl,
          ),
        ]}
      >
        {title}
      </Text>

      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        style={({ pressed }) => [
          styles.sectionAction,
          {
            flexDirection:
              isRtl
                ? "row-reverse"
                : "row",
          },
          pressed &&
            styles.pressed,
        ]}
      >
        <Text
          style={[
            styles.sectionActionText,
            directionStyle(
              isRtl,
            ),
          ]}
        >
          {actionLabel}
        </Text>

        <Ionicons
          name={
            isRtl
              ? "chevron-back"
              : "chevron-forward"
          }
          size={15}
          color={
            KhedmatPalette.blue500
          }
        />
      </Pressable>
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

function directionStyle(
  isRtl: boolean,
) {
  return {
    textAlign: isRtl
      ? ("right" as const)
      : ("left" as const),

    writingDirection:
      isRtl
        ? ("rtl" as const)
        : ("ltr" as const),
  };
}

function getFirstName(
  fullName:
    | string
    | null
    | undefined,
): string | null {
  const normalizedName =
    fullName
      ?.trim()
      .replace(
        /\s+/g,
        " ",
      );

  if (!normalizedName) {
    return null;
  }

  return (
    normalizedName.split(
      " ",
    )[0] ?? null
  );
}

function getTimeSensitiveGreeting(
  copy: ReturnType<
    typeof getHomeCopy
  >,
  firstName: string | null,
  hour: number,
): string {
  const greeting =
    hour >= 5 &&
    hour < 12
      ? copy.morningGreeting
      : hour >= 12 &&
          hour < 17
        ? copy.afternoonGreeting
        : copy.eveningGreeting;

  const displayName =
    firstName ||
    copy.fallbackName;

  return `${greeting}, ${displayName}`;
}

function getHomeCopy(
  language: LanguageName,
) {
  if (
    language === "Dari"
  ) {
    return {
      morningGreeting:
        "صبح بخیر",
      afternoonGreeting:
        "بعد از ظهر بخیر",
      eveningGreeting:
        "عصر بخیر",
      fallbackName: "دوست",
      popularServices:
        "خدمات محبوب",
      viewAll:
        "مشاهده همه",
    };
  }

  if (
    language === "Pashto"
  ) {
    return {
      morningGreeting:
        "سهار مو پخیر",
      afternoonGreeting:
        "غرمه مو پخیر",
      eveningGreeting:
        "ماښام مو پخیر",
      fallbackName: "ملګری",
      popularServices:
        "مشهور خدمتونه",
      viewAll:
        "ټول وګورئ",
    };
  }

  return {
    morningGreeting:
      "Good morning",
    afternoonGreeting:
      "Good afternoon",
    eveningGreeting:
      "Good evening",
    fallbackName: "there",
    popularServices:
      "Popular services",
    viewAll: "View all",
  };
}

const styles =
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor:
        KhedmatPalette.blue050,
    },

    scrollContent: {
      width: "100%",
      maxWidth:
        Layout.contentMaxWidth,
      alignSelf: "center",
      paddingHorizontal:
        Layout.screenPadding,
      paddingTop: Spacing.sm,
      paddingBottom: 125,
    },

    hero: {
      width: "100%",
      marginTop: Spacing.md,
    },

    greeting: {
      ...Typography.sectionTitle,
      width: "100%",
      color:
        KhedmatPalette.blue500,
      fontSize: 22,
      lineHeight: 29,
    },

    section: {
      width: "100%",
      marginTop: Spacing.xxl,
      gap: Spacing.lg,
    },

    sectionHeader: {
      width: "100%",
      alignItems: "center",
      justifyContent:
        "space-between",
    },

    sectionTitle: {
      ...Typography.sectionTitle,
      color:
        KhedmatPalette.textPrimary,
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
      color:
        KhedmatPalette.blue500,
      fontFamily:
        Fonts.medium,
    },

    categoriesGrid: {
      width: "100%",
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent:
        "space-between",
      rowGap: Spacing.md,
    },

    categoryCard: {
      width: "24%",
      minHeight: 102,
      paddingHorizontal: 4,
      paddingVertical:
        Spacing.xs,
      alignItems: "center",
      justifyContent:
        "center",
      borderRadius:
        Radius.lg,
      backgroundColor:
        KhedmatPalette.surface,
      borderWidth: 1,
      borderColor:
        KhedmatPalette.border,
      ...Shadows.small,
    },

    categoryCardCompact: {
      minHeight: 96,
    },

    categoryContent: {
      width: "100%",
      alignItems: "center",
      justifyContent:
        "center",
    },

    categoryIcon: {
      width: 46,
      height: 46,
      marginBottom:
        Spacing.xs,
      borderRadius:
        Radius.md,
      alignItems: "center",
      justifyContent:
        "center",
      backgroundColor:
        KhedmatPalette.surfaceSoft,
    },

    categoryTitle: {
      ...Typography.label,
      width: "100%",
      minHeight: 16,
      paddingHorizontal: 1,
      color:
        KhedmatPalette.textPrimary,
      textAlign: "center",
      fontSize: 11,
      lineHeight: 14,
      includeFontPadding:
        false,
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
