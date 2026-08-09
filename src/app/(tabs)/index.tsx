import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo } from "react";
import {
  Image,
  ImageSourcePropType,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";

import { LOCAL_CUSTOMER_ID } from "../../constants/identity";
import {
  Fonts,
  KhedmatPalette,
  Layout,
  Radius,
  Spacing,
  Typography,
} from "../../constants/theme";
import { useCustomerProfile } from "../../context/customer-profile-context";
import { useLanguage } from "../../context/languagecontext";
import { useNotifications } from "../../context/notification-context";

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
  image: ImageSourcePropType;
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
    image: require(
      "../../../assets/images/categories/3d/electrician.png"
    ),
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
    image: require(
      "../../../assets/images/categories/3d/plumber.png"
    ),
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
    image: require(
      "../../../assets/images/categories/3d/cleaning.png"
    ),
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
    image: require(
      "../../../assets/images/categories/3d/construction.png"
    ),
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
    image: require(
      "../../../assets/images/categories/3d/carpenter.png"
    ),
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
    image: require(
      "../../../assets/images/categories/3d/tech-repair.png"
    ),
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
    image: require(
      "../../../assets/images/categories/3d/painting.png"
    ),
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
    image: require(
      "../../../assets/images/categories/3d/gardening.png"
    ),
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
    image: require(
      "../../../assets/images/categories/3d/appliances.png"
    ),
  },
];

export default function HomeScreen() {
  const router = useRouter();

  const { language } =
    useLanguage();

  const { profile } =
    useCustomerProfile();

  const {
    getUnreadCount,
  } = useNotifications();

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

  const firstName =
    getFirstName(
      profile?.fullName,
    );

  const greetingLabel =
    getTimeSensitiveGreetingLabel(
      copy,
      new Date().getHours(),
    );

  const displayName =
    firstName ||
    copy.fallbackName;

  const compactGrid =
    width < 370;

  const unreadCount =
    getUnreadCount(
      "customer",
      LOCAL_CUSTOMER_ID,
    );

  const avatarInitials =
    getInitials(
      profile?.fullName,
    );

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

  const openProfile =
    (): void => {
      router.push(
        "/(tabs)/profile",
      );
    };

  const openNotifications =
    (): void => {
      router.push(
        "/customer-notifications",
      );
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
          style={[
            styles.topBar,
            {
              flexDirection:
                isRtl
                  ? "row-reverse"
                  : "row",
            },
          ]}
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              copy.profileAccessibility
            }
            onPress={openProfile}
            style={({ pressed }) => [
              styles.avatarButton,
              pressed &&
                styles.pressed,
            ]}
          >
            {profile?.avatarUri ? (
              <Image
                source={{
                  uri:
                    profile.avatarUri,
                }}
                style={
                  styles.avatarImage
                }
              />
            ) : (
              <View
                style={
                  styles.avatarFallback
                }
              >
                <Text
                  style={
                    styles.avatarInitials
                  }
                >
                  {avatarInitials}
                </Text>
              </View>
            )}
          </Pressable>

          <View
            style={
              styles.greetingWrap
            }
          >
            <Text
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.82}
              style={[
                styles.greetingLabel,
                directionStyle(
                  isRtl,
                ),
              ]}
            >
              {greetingLabel}
            </Text>

            <Text
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.74}
              style={[
                styles.greetingName,
                directionStyle(
                  isRtl,
                ),
              ]}
            >
              {displayName}
            </Text>
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              copy.notificationsAccessibility
            }
            onPress={
              openNotifications
            }
            style={({ pressed }) => [
              styles.notificationButton,
              pressed &&
                styles.pressed,
            ]}
          >
            <Ionicons
              name="notifications-outline"
              size={23}
              color={
                KhedmatPalette.navy900
              }
            />

            {unreadCount > 0 ? (
              <View
                style={
                  styles.notificationBadge
                }
              >
                <Text
                  style={
                    styles.notificationBadgeText
                  }
                >
                  {unreadCount > 99
                    ? "99+"
                    : unreadCount}
                </Text>
              </View>
            ) : null}
          </Pressable>
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
                        styles.categoryImageContainer
                      }
                    >
                      <Image
                        source={
                          category.image
                        }
                        resizeMode="contain"
                        style={[
                          styles.categoryImage,
                          compactGrid &&
                            styles.categoryImageCompact,
                        ]}
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

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={
            copy.searchBannerAccessibility
          }
          onPress={openSearch}
          style={({ pressed }) => [
            styles.searchBanner,
            pressed &&
              styles.cardPressed,
          ]}
        >
          <View
            style={[
              styles.searchBannerContent,
              {
                flexDirection:
                  isRtl
                    ? "row-reverse"
                    : "row",
              },
            ]}
          >
            <View
              style={
                styles.searchBannerCopy
              }
            >
              <Text
                style={[
                  styles.searchBannerTitle,
                  directionStyle(
                    isRtl,
                  ),
                ]}
              >
                {
                  copy.searchBannerTitle
                }
              </Text>

              <Text
                style={[
                  styles.searchBannerSubtitle,
                  directionStyle(
                    isRtl,
                  ),
                ]}
              >
                {
                  copy.searchBannerSubtitle
                }
              </Text>

              <View
                style={[
                  styles.searchBannerCta,
                  {
                    flexDirection:
                      isRtl
                        ? "row-reverse"
                        : "row",
                  },
                ]}
              >
                <Ionicons
                  name="search-outline"
                  size={16}
                  color={
                    KhedmatPalette.white
                  }
                />

                <Text
                  style={
                    styles.searchBannerCtaText
                  }
                >
                  {
                    copy.searchBannerButton
                  }
                </Text>
              </View>
            </View>

            <View
              style={
                styles.searchIllustration
              }
            >
              <View
                style={
                  styles.searchIllustrationPhone
                }
              >
                <Ionicons
                  name="location"
                  size={27}
                  color={
                    KhedmatPalette.blue500
                  }
                />
              </View>

              <View
                style={
                  styles.searchIllustrationLens
                }
              >
                <Ionicons
                  name="search"
                  size={22}
                  color={
                    KhedmatPalette.navy900
                  }
                />
              </View>
            </View>
          </View>
        </Pressable>

        <View
          style={[
            styles.trustStrip,
            {
              flexDirection:
                isRtl
                  ? "row-reverse"
                  : "row",
            },
          ]}
        >
          <TrustItem
            icon="shield-checkmark-outline"
            label={
              copy.trustedProviders
            }
          />

          <View
            style={
              styles.trustDivider
            }
          />

          <TrustItem
            icon="receipt-outline"
            label={
              copy.clearPricing
            }
          />

          <View
            style={
              styles.trustDivider
            }
          />

          <TrustItem
            icon="headset-outline"
            label={
              copy.support
            }
          />
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

type TrustItemProps = {
  icon:
    keyof typeof Ionicons.glyphMap;
  label: string;
};

function TrustItem({
  icon,
  label,
}: TrustItemProps) {
  return (
    <View
      style={
        styles.trustItem
      }
    >
      <Ionicons
        name={icon}
        size={18}
        color={
          KhedmatPalette.textMuted
        }
      />

      <Text
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.72}
        style={
          styles.trustItemText
        }
      >
        {label}
      </Text>
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

function getInitials(
  fullName:
    | string
    | null
    | undefined,
): string {
  const normalized =
    fullName
      ?.trim()
      .replace(
        /\s+/g,
        " ",
      );

  if (!normalized) {
    return "U";
  }

  return normalized
    .split(" ")
    .slice(0, 2)
    .map((part) =>
      part.charAt(0),
    )
    .join("")
    .toUpperCase();
}

function getTimeSensitiveGreetingLabel(
  copy: ReturnType<
    typeof getHomeCopy
  >,
  hour: number,
): string {
  if (
    hour >= 5 &&
    hour < 12
  ) {
    return copy.morningGreeting;
  }

  if (
    hour >= 12 &&
    hour < 17
  ) {
    return copy.afternoonGreeting;
  }

  return copy.eveningGreeting;
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
      profileAccessibility:
        "پروفایل",
      notificationsAccessibility:
        "اعلان‌ها",
      searchBannerAccessibility:
        "جستجوی خدمات",
      searchBannerTitle:
        "خدمات مورد نیاز خود را پیدا کنید",
      searchBannerSubtitle:
        "با ارائه‌دهندگان معتبر خدمات در ارتباط باشید.",
      searchBannerButton:
        "جستجو",
      trustedProviders:
        "ارائه‌دهندگان معتبر",
      clearPricing:
        "قیمت شفاف",
      support:
        "پشتیبانی",
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
      profileAccessibility:
        "پروفایل",
      notificationsAccessibility:
        "خبرتیاوې",
      searchBannerAccessibility:
        "خدمتونه ولټوئ",
      searchBannerTitle:
        "اړین خدمتونه ومومئ",
      searchBannerSubtitle:
        "له باوري خدمت وړاندې کوونکو سره اړیکه ونیسئ.",
      searchBannerButton:
        "لټون",
      trustedProviders:
        "باوري وړاندې کوونکي",
      clearPricing:
        "روښانه بیې",
      support:
        "ملاتړ",
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
    profileAccessibility:
      "Profile",
    notificationsAccessibility:
      "Notifications",
    searchBannerAccessibility:
      "Search for services",
    searchBannerTitle:
      "Find the service you need",
    searchBannerSubtitle:
      "Connect with trusted service providers.",
    searchBannerButton:
      "Search",
    trustedProviders:
      "Trusted providers",
    clearPricing:
      "Clear pricing",
    support:
      "Support",
  };
}

const styles =
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor:
        KhedmatPalette.white,
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

    topBar: {
      width: "100%",
      minHeight: 56,
      alignItems: "center",
      gap: Spacing.md,
      marginTop: Spacing.xs,
    },

    avatarButton: {
      width: 50,
      height: 50,
      flexShrink: 0,
      borderRadius:
        Radius.pill,
      borderWidth: 1,
      borderColor:
        KhedmatPalette.blue200,
      padding: 2,
      overflow: "hidden",
      backgroundColor:
        KhedmatPalette.white,
    },

    avatarImage: {
      width: "100%",
      height: "100%",
      borderRadius:
        Radius.pill,
    },

    avatarFallback: {
      flex: 1,
      borderRadius:
        Radius.pill,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor:
        KhedmatPalette.navy900,
    },

    avatarInitials: {
      color:
        KhedmatPalette.white,
      fontFamily:
        Fonts.bold,
      fontSize: 15,
      lineHeight: 19,
    },

    greetingWrap: {
      flex: 1,
      minWidth: 0,
      minHeight: 46,
      justifyContent: "center",
      gap: 1,
    },

    greetingLabel: {
      ...Typography.captionStyle,
      width: "100%",
      color:
        KhedmatPalette.blue500,
      fontFamily:
        Fonts.medium,
      fontSize: 13,
      lineHeight: 17,
    },

    greetingName: {
      ...Typography.label,
      width: "100%",
      color:
        KhedmatPalette.navy900,
      fontFamily:
        Fonts.bold,
      fontSize: 17,
      lineHeight: 21,
    },

    notificationButton: {
      width: 42,
      height: 42,
      flexShrink: 0,
      borderRadius:
        Radius.pill,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor:
        KhedmatPalette.white,
      borderWidth:
        StyleSheet.hairlineWidth,
      borderColor:
        KhedmatPalette.blue200,
    },

    notificationBadge: {
      position: "absolute",
      top: -4,
      right: -4,
      minWidth: 18,
      height: 18,
      paddingHorizontal: 4,
      borderRadius:
        Radius.pill,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor:
        KhedmatPalette.blue500,
      borderWidth: 1,
      borderColor:
        KhedmatPalette.white,
    },

    notificationBadgeText: {
      color:
        KhedmatPalette.white,
      fontFamily:
        Fonts.bold,
      fontSize: 9,
      lineHeight: 11,
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
      minHeight: 116,
      paddingHorizontal: 4,
      paddingVertical:
        Spacing.xs,
      alignItems: "center",
      justifyContent:
        "center",

      borderRadius:
        Radius.lg,

      backgroundColor:
        KhedmatPalette.white,

      borderWidth:
        StyleSheet.hairlineWidth,

      borderColor:
        KhedmatPalette.blue200,

      shadowColor:
        KhedmatPalette.navy900,

      shadowOffset: {
        width: 0,
        height: 4,
      },

      shadowOpacity: 0.07,
      shadowRadius: 10,

      elevation: 3,
    },

    categoryCardCompact: {
      minHeight: 108,
    },

    categoryContent: {
      width: "100%",
      alignItems: "center",
      justifyContent:
        "center",
    },

    categoryImageContainer: {
      width: 64,
      height: 64,
      marginBottom:
        Spacing.xs,
      alignItems: "center",
      justifyContent:
        "center",
    },

    categoryImage: {
      width: 60,
      height: 60,
    },

    categoryImageCompact: {
      width: 54,
      height: 54,
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

    searchBanner: {
      width: "100%",
      marginTop: Spacing.xxl,
      borderRadius:
        Radius.xl,
      borderWidth:
        StyleSheet.hairlineWidth,
      borderColor:
        KhedmatPalette.blue200,
      backgroundColor:
        KhedmatPalette.blue050,
      shadowColor:
        KhedmatPalette.navy900,
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.05,
      shadowRadius: 10,
      elevation: 2,
    },

    searchBannerContent: {
      width: "100%",
      minHeight: 150,
      alignItems: "center",
      justifyContent:
        "space-between",
      gap: Spacing.md,
      paddingHorizontal:
        Spacing.lg,
      paddingVertical:
        Spacing.lg,
    },

    searchBannerCopy: {
      flex: 1,
      minWidth: 0,
    },

    searchBannerTitle: {
      ...Typography.sectionTitle,
      color:
        KhedmatPalette.textPrimary,
      fontSize: 18,
      lineHeight: 24,
    },

    searchBannerSubtitle: {
      ...Typography.captionStyle,
      marginTop: 4,
      color:
        KhedmatPalette.textSecondary,
      lineHeight: 18,
    },

    searchBannerCta: {
      alignSelf: "flex-start",
      minHeight: 40,
      marginTop: Spacing.md,
      paddingHorizontal:
        Spacing.md,
      borderRadius:
        Radius.md,
      alignItems: "center",
      justifyContent: "center",
      gap: Spacing.xs,
      backgroundColor:
        KhedmatPalette.navy900,
    },

    searchBannerCtaText: {
      ...Typography.label,
      color:
        KhedmatPalette.white,
      fontSize: 12,
      lineHeight: 16,
    },

    searchIllustration: {
      width: 92,
      height: 92,
      flexShrink: 0,
      alignItems: "center",
      justifyContent: "center",
    },

    searchIllustrationPhone: {
      width: 56,
      height: 72,
      borderRadius:
        Radius.lg,
      borderWidth: 3,
      borderColor:
        KhedmatPalette.navy900,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor:
        KhedmatPalette.white,
      transform: [
        {
          rotate: "8deg",
        },
      ],
    },

    searchIllustrationLens: {
      position: "absolute",
      right: 3,
      bottom: 5,
      width: 42,
      height: 42,
      borderRadius:
        Radius.pill,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor:
        KhedmatPalette.white,
      borderWidth: 3,
      borderColor:
        KhedmatPalette.navy900,
    },

    trustStrip: {
      width: "100%",
      minHeight: 58,
      marginTop: Spacing.lg,
      alignItems: "center",
      justifyContent:
        "space-between",
      paddingHorizontal:
        Spacing.md,
      borderRadius:
        Radius.lg,
      backgroundColor:
        KhedmatPalette.blue050,
      borderWidth:
        StyleSheet.hairlineWidth,
      borderColor:
        KhedmatPalette.blue200,
    },

    trustItem: {
      flex: 1,
      minWidth: 0,
      alignItems: "center",
      justifyContent: "center",
      gap: 3,
    },

    trustItemText: {
      ...Typography.captionStyle,
      width: "100%",
      color:
        KhedmatPalette.textMuted,
      textAlign: "center",
      fontSize: 9,
      lineHeight: 12,
    },

    trustDivider: {
      width:
        StyleSheet.hairlineWidth,
      height: 28,
      marginHorizontal: 4,
      backgroundColor:
        KhedmatPalette.blue200,
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
