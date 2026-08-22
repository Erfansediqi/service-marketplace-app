import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ComponentProps, useMemo } from "react";
import {
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
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
import { useSession } from "../../context/session-context";
import { useSupabaseAuth } from "../../context/supabase-auth-context";
import { useActiveProvider } from "../../hooks/use-active-provider";
import type { ProviderProfile } from "../../types/provider";

type IconName = ComponentProps<typeof Ionicons>["name"];

type LanguageName = "English" | "Dari" | "Pashto";

type ProfileMenuItem = {
  id: string;
  title: string;
  subtitle: string;
  icon: IconName;
  badge?: string;
  badgeTone?: "default" | "success" | "warning";
  onPress: () => void;
};

const SUCCESS = "#268A57";
const SUCCESS_SOFT = "#E8F6EE";
const WARNING = "#8A5A00";
const WARNING_SOFT = "#FFF4D6";
const ERROR = "#B3261E";
const ERROR_SOFT = "#FCE8E6";
const INFO_SOFT = "#E5F4F8";

export default function ProviderAccountScreen() {
  const { t } = useLanguage();
  const { provider, isLoading, error } = useActiveProvider();

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.providerState}>
          <Text style={styles.providerStateTitle}>{t("providerAccountLoading")}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!provider || error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.providerState}>
          <Text style={styles.providerStateTitle}>
            {t("providerAccountLoadError")}
          </Text>

          <Text style={styles.providerStateBody}>
            {t("providerAccountLoadErrorBody")}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return <ProviderAccountContent provider={provider} />;
}

function ProviderAccountContent({ provider }: { provider: ProviderProfile }) {
  const router = useRouter();

  const {
    resetSession,
    enterCustomerWorkspace,
  } = useSession();
  const { signOut } =
    useSupabaseAuth();
  const {
    language,
    t,
  } = useLanguage();

  const activeLanguage = normalizeLanguage(language);

  const isRtl = activeLanguage === "Dari" || activeLanguage === "Pashto";

  const localizedDigits = activeLanguage !== "English";

  const profileCompletion = calculateProfileCompletion(provider);

  const localizedProfession =
    getLocalizedCategoryTitle(
      provider.categoryId,
      activeLanguage,
    );

  const accountItems = useMemo<ProfileMenuItem[]>(
    () => [
      {
        id: "personal-details",
        title: t(
          "personalInformationMenuTitle",
        ),
        subtitle: t(
          "personalInformationMenuSubtitle",
        ),
        icon: "person-outline",
        onPress: () => {
          router.push(
            "/account/personal-information",
          );
        },
      },
      {
        id: "professional-profile",
        title: t(
          "providerProfessionalProfileTitle",
        ),
        subtitle: t(
          "providerProfessionalProfileSubtitle",
        ),
        icon: "briefcase-outline",
        badge: `${formatDigits(
          profileCompletion.toString(),
          localizedDigits,
        )}%`,
        onPress: () => {
          router.push(
            "/provider-professional-profile",
          );
        },
      },
      {
        id: "services",
        title: t("providerAccountServicesPricesTitle"),
        subtitle: t("providerAccountServicesPricesSubtitle"),
        icon: "construct-outline",
        badge: formatDigits(
          provider.services.length.toString(),
          localizedDigits,
        ),
        onPress: () => {
          router.push("/provider-services-management" as never);
        },
      },
      {
        id: "portfolio",
        title: t(
          "providerPortfolioTitle",
        ),
        subtitle: t(
          "providerPortfolioSubtitle",
        ),
        icon: "images-outline",
        badge: formatDigits(
          provider.portfolio.length.toString(),
          localizedDigits,
        ),
        onPress: () => {
          router.push(
            "/provider-portfolio",
          );
        },
      },
      {
        id: "verification",
        title: t(
          "providerVerificationSettingsTitle",
        ),
        subtitle: provider.verified
          ? t(
              "providerVerificationVerifiedMessage",
            )
          : t(
              "providerVerificationUnverifiedMessage",
            ),
        icon: "shield-checkmark-outline",
        badge: provider.verified
          ? t(
              "providerVerificationStatusVerified",
            )
          : t(
              "providerVerificationStatusUnverified",
            ),
        badgeTone: provider.verified
          ? "success"
          : "warning",
        onPress: () => {
          router.push(
            "/provider-verification-settings",
          );
        },
      },
    ],
    [
      localizedDigits,
      profileCompletion,
      provider,
      router,
      t,
    ],
  );

  const workItems = useMemo<ProfileMenuItem[]>(
    () => [
      {
        id: "availability",
        title: t(
          "providerAvailabilitySettingsTitle",
        ),
        subtitle: t(
          "providerAvailabilitySettingsSubtitle",
        ),
        icon: "calendar-outline",
        onPress: () => {
          router.push(
            "/provider-availability-settings",
          );
        },
      },
      {
        id: "service-area",
        title: t(
          "providerServiceAreaSettingsTitle",
        ),
        subtitle: formatProviderServiceAreaValue(
          provider.locationLabel,
          formatDigits(
            provider.serviceRadiusKm.toString(),
            localizedDigits,
          ),
          activeLanguage,
        ),
        icon: "location-outline",
        onPress: () => {
          router.push(
            "/provider-service-area-settings",
          );
        },
      },
      {
        id: "earnings",
        title: t(
          "providerEarningsTitle",
        ),
        subtitle: t(
          "providerEarningsSubtitle",
        ),
        icon: "wallet-outline",
        onPress: () => {
          router.push(
            "/provider-earnings",
          );
        },
      },
      {
        id: "performance",
        title: t(
          "providerPerformanceTitle",
        ),
        subtitle: t(
          "providerPerformanceSubtitle",
        ),
        icon: "stats-chart-outline",
        badge: `${formatDigits(
          provider.rating.toFixed(1),
          localizedDigits,
        )} ★`,
        onPress: () => {
          router.push(
            "/provider-performance",
          );
        },
      },
    ],
    [
      localizedDigits,
      provider,
      router,
      t,
    ],
  );

  const settingsItems = useMemo<ProfileMenuItem[]>(
    () => [
      {
        id: "switch-to-customer",
        title: t(
          "switchToCustomerTitle",
        ),
        subtitle: t(
          "switchToCustomerSubtitle",
        ),
        icon:
          "swap-horizontal-outline",
        onPress: () => {
          enterCustomerWorkspace();

          router.replace(
            "/(tabs)",
          );
        },
      },
      {
        id: "notifications",
        title: t(
          "notificationsTitle",
        ),
        subtitle: t("providerAccountNotificationsSubtitle"),
        icon: "notifications-outline",
        onPress: () => {
          router.push(
            "/provider-notifications",
          );
        },
      },
      {
        id: "privacy",
        title: t(
          "privacySecurityTitle",
        ),
        subtitle:
          t("providerAccountPrivacySubtitle"),
        icon: "lock-closed-outline",
        onPress: () => {
          router.push(
            "/account/privacy-security",
          );
        },
      },
      {
        id: "language",
        title: t(
          "appLanguage",
        ),
        subtitle: getLanguageDisplayName(
          activeLanguage,
        ),
        icon: "language-outline",
        onPress: () => {
          router.push({
            pathname:
              "/language",
            params: {
              source:
                "account",
            },
          });
        },
      },
      {
        id: "help",
        title: t(
          "providerHelpCenterTitle",
        ),
        subtitle: t(
          "providerHelpCenterSubtitle",
        ),
        icon: "help-circle-outline",
        onPress: () => {
          router.push(
            "/provider-help-center",
          );
        },
      },
    ],
    [
      activeLanguage,
      enterCustomerWorkspace,
      router,
      t,
    ],
  );

  const handleLogout = () => {
    Alert.alert(
      t("logoutAction"),
      t("logoutConfirmation"),
      [
        {
          text: t("cancelAction"),
          style: "cancel",
        },
        {
          text: t("logoutAction"),
          style: "destructive",
          onPress: () => {
            void (async () => {
              try {
                await signOut();

                resetSession();

                router.replace(
                  "/login",
                );
              } catch (error) {
                console.error(
                  "Failed to log out of provider account:",
                  error,
                );

                Alert.alert(
                  t(
                    "logoutFailedTitle",
                  ),
                  t(
                    "logoutFailedMessage",
                  ),
                );
              }
            })();
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <Text style={[styles.title, directionStyle(isRtl)]}>
            {t("providerAccountTitle")}
          </Text>
        </View>

        <View
          style={[
            styles.profileCard,
            {
              flexDirection: isRtl ? "row-reverse" : "row",
            },
          ]}
        >
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{provider.initials}</Text>

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
              styles.profileCopy,
              {
                alignItems: isRtl ? "flex-end" : "flex-start",
              },
            ]}
          >
            <View
              style={[
                styles.nameRow,
                {
                  flexDirection: isRtl ? "row-reverse" : "row",
                },
              ]}
            >
              <Text
                numberOfLines={1}
                style={[styles.providerName, directionStyle(isRtl)]}
              >
                {provider.name}
              </Text>

              {provider.verified ? (
                <Ionicons
                  name="shield-checkmark"
                  size={17}
                  color={KhedmatPalette.blue500}
                />
              ) : null}
            </View>

            <Text
              numberOfLines={1}
              style={[styles.providerProfession, directionStyle(isRtl)]}
            >
              {localizedProfession}
            </Text>

            <View
              style={[
                styles.profileMetaRow,
                {
                  flexDirection: isRtl ? "row-reverse" : "row",
                },
              ]}
            >
              <ProfileMeta
                icon="star"
                value={`${formatDigits(
                  provider.rating.toFixed(1),
                  localizedDigits,
                )} (${formatDigits(
                  provider.reviewCount.toString(),
                  localizedDigits,
                )})`}
                color={WARNING}
                isRtl={isRtl}
              />



              <ProfileMeta
                icon="location-outline"
                value={provider.locationLabel}
                isRtl={isRtl}
              />
            </View>
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t("providerAccountViewPublicProfile")}
            onPress={() =>
              router.push({
                pathname: "/provider-profile",
                params: {
                  providerId: provider.id,
                },
              })
            }
            style={({ pressed }) => [
              styles.previewButton,
              pressed && styles.pressed,
            ]}
          >
            <Ionicons
              name="eye-outline"
              size={20}
              color={KhedmatPalette.navy700}
            />
          </Pressable>
        </View>

        <View style={styles.completionCard}>
          <View
            style={[
              styles.completionTopRow,
              {
                flexDirection: isRtl ? "row-reverse" : "row",
              },
            ]}
          >
            <View style={styles.completionPercentage}>
              <Text style={styles.completionPercentageText}>
                {formatDigits(profileCompletion.toString(), localizedDigits)}%
              </Text>
            </View>

            <View
              style={[
                styles.completionCopy,
                {
                  alignItems: isRtl ? "flex-end" : "flex-start",
                },
              ]}
            >
              <Text style={[styles.completionTitle, directionStyle(isRtl)]}>
                {t("providerAccountProfileCompletion")}
              </Text>

              <Text style={[styles.completionSubtitle, directionStyle(isRtl)]}>
                {t("providerAccountProfileCompletionSubtitle")}
              </Text>
            </View>
          </View>

          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${profileCompletion}%`,
                },
              ]}
            />
          </View>

          <View style={styles.completionChecks}>
            <CompletionCheck
              label={t("providerAccountBasicInformation")}
              completed={Boolean(provider.description)}
              isRtl={isRtl}
            />

            <CompletionCheck
              label={t("providerAccountServices")}
              completed={provider.services.length > 0}
              isRtl={isRtl}
            />

            <CompletionCheck
              label={t("providerAccountWorkSamples")}
              completed={provider.portfolio.length > 0}
              isRtl={isRtl}
            />

            <CompletionCheck
              label={t("providerAccountVerification")}
              completed={provider.verified}
              isRtl={isRtl}
            />
          </View>
        </View>

        <ProfileSection
          title={t("providerAccountSectionTitle")}
          subtitle={t("providerAccountSectionSubtitle")}
          items={accountItems}
          isRtl={isRtl}
        />

        <ProfileSection
          title={t("providerAccountWorkManagementTitle")}
          subtitle={t("providerAccountWorkManagementSubtitle")}
          items={workItems}
          isRtl={isRtl}
        />

        <ProfileSection
          title={t("providerAccountSettingsSupportTitle")}
          subtitle={t("providerAccountSettingsSupportSubtitle")}
          items={settingsItems}
          isRtl={isRtl}
        />

        <View
          style={[
            styles.accountStatusCard,
            {
              flexDirection: isRtl ? "row-reverse" : "row",
              borderColor: provider.verified ? "#A9D9BD" : "#E5C875",
              backgroundColor: provider.verified ? "#F5FCF8" : "#FFFDF6",
            },
          ]}
        >
          <View
            style={[
              styles.accountStatusIcon,
              {
                backgroundColor: provider.verified
                  ? SUCCESS_SOFT
                  : WARNING_SOFT,
              },
            ]}
          >
            <Ionicons
              name={
                provider.verified
                  ? "shield-checkmark-outline"
                  : "alert-circle-outline"
              }
              size={23}
              color={provider.verified ? SUCCESS : WARNING}
            />
          </View>

          <View
            style={[
              styles.accountStatusCopy,
              {
                alignItems: isRtl ? "flex-end" : "flex-start",
              },
            ]}
          >
            <Text style={[styles.accountStatusTitle, directionStyle(isRtl)]}>
              {provider.verified
                ? t("providerAccountVerifiedTitle")
                : t("providerAccountUnverifiedTitle")}
            </Text>

            <Text style={[styles.accountStatusSubtitle, directionStyle(isRtl)]}>
              {provider.verified
                ? t("providerAccountVerifiedSubtitle")
                : t("providerAccountUnverifiedSubtitle")}
            </Text>
          </View>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t("logoutAction")}
          onPress={handleLogout}
          style={({ pressed }) => [
            styles.logoutButton,
            pressed && styles.logoutButtonPressed,
          ]}
        >
          <View
            style={[
              styles.logoutContent,
              {
                flexDirection: isRtl ? "row-reverse" : "row",
              },
            ]}
          >
            <Ionicons name="log-out-outline" size={20} color={ERROR} />

            <Text style={[styles.logoutText, directionStyle(isRtl)]}>
              {t("logoutAction")}
            </Text>
          </View>
        </Pressable>

        <Text style={styles.versionText}>{t("providerAccountVersion")}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

type ProfileMetaProps = {
  icon: IconName;
  value: string;
  color?: string;
  isRtl: boolean;
};

function ProfileMeta({
  icon,
  value,
  color = KhedmatPalette.textMuted,
  isRtl,
}: ProfileMetaProps) {
  return (
    <View
      style={[
        styles.profileMeta,
        {
          flexDirection: isRtl ? "row-reverse" : "row",
        },
      ]}
    >
      <Ionicons name={icon} size={14} color={color} />

      <Text
        numberOfLines={1}
        style={[styles.profileMetaText, directionStyle(isRtl)]}
      >
        {value}
      </Text>
    </View>
  );
}

type CompletionCheckProps = {
  label: string;
  completed: boolean;
  isRtl: boolean;
};

function CompletionCheck({ label, completed, isRtl }: CompletionCheckProps) {
  return (
    <View
      style={[
        styles.completionCheck,
        {
          flexDirection: isRtl ? "row-reverse" : "row",
        },
      ]}
    >
      <View
        style={[styles.checkCircle, completed && styles.checkCircleCompleted]}
      >
        <Ionicons
          name={completed ? "checkmark" : "remove"}
          size={12}
          color={completed ? KhedmatPalette.white : KhedmatPalette.textMuted}
        />
      </View>

      <Text
        style={[
          styles.completionCheckText,
          completed && styles.completionCheckTextCompleted,
          directionStyle(isRtl),
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

type ProfileSectionProps = {
  title: string;
  subtitle: string;
  items: ProfileMenuItem[];
  isRtl: boolean;
};

function ProfileSection({
  title,
  subtitle: _subtitle,
  items,
  isRtl,
}: ProfileSectionProps) {
  return (
    <View style={styles.section}>
      <View
        style={[
          styles.sectionHeader,
          {
            alignItems: isRtl ? "flex-end" : "flex-start",
          },
        ]}
      >
        <Text style={[styles.sectionTitle, directionStyle(isRtl)]}>
          {title}
        </Text>

      </View>

      <View style={styles.menuCard}>
        {items.map((item, index) => (
          <View key={item.id}>
            <ProfileMenuRow item={item} isRtl={isRtl} />

            {index < items.length - 1 ? <View style={styles.divider} /> : null}
          </View>
        ))}
      </View>
    </View>
  );
}

type ProfileMenuRowProps = {
  item: ProfileMenuItem;
  isRtl: boolean;
};

function ProfileMenuRow({ item, isRtl }: ProfileMenuRowProps) {
  const badgeStyle = getBadgeStyle(item.badgeTone);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={item.title}
      onPress={item.onPress}
      style={({ pressed }) => [
        styles.menuRow,
        {
          flexDirection: isRtl ? "row-reverse" : "row",
        },
        pressed && styles.menuRowPressed,
      ]}
    >
      <View style={styles.menuIcon}>
        <Ionicons name={item.icon} size={21} color={KhedmatPalette.blue500} />
      </View>

      <View
        style={[
          styles.menuCopy,
          {
            alignItems: isRtl ? "flex-end" : "flex-start",
          },
        ]}
      >
        <Text style={[styles.menuTitle, directionStyle(isRtl)]}>
          {item.title}
        </Text>

        <Text
          numberOfLines={2}
          style={[styles.menuSubtitle, directionStyle(isRtl)]}
        >
          {item.subtitle}
        </Text>
      </View>

      {item.badge ? (
        <View
          style={[
            styles.menuBadge,
            {
              backgroundColor: badgeStyle.backgroundColor,
            },
          ]}
        >
          <Text
            style={[
              styles.menuBadgeText,
              {
                color: badgeStyle.color,
              },
              directionStyle(isRtl),
            ]}
          >
            {item.badge}
          </Text>
        </View>
      ) : null}

      <Ionicons
        name={isRtl ? "chevron-back" : "chevron-forward"}
        size={18}
        color={KhedmatPalette.textMuted}
      />
    </Pressable>
  );
}

function getBadgeStyle(tone: ProfileMenuItem["badgeTone"] | undefined) {
  if (tone === "success") {
    return {
      color: SUCCESS,
      backgroundColor: SUCCESS_SOFT,
    };
  }

  if (tone === "warning") {
    return {
      color: WARNING,
      backgroundColor: WARNING_SOFT,
    };
  }

  return {
    color: KhedmatPalette.blue500,
    backgroundColor: INFO_SOFT,
  };
}

function calculateProfileCompletion(provider: ProviderProfile): number {
  const checks = [
    Boolean(provider.name),
    Boolean(provider.profession),
    Boolean(provider.description),
    Boolean(provider.locationLabel),
    provider.services.length > 0,
    provider.workingDays.length > 0,
    provider.portfolio.length > 0,
    provider.verified,
  ];

  const completed = checks.filter(Boolean).length;

  return Math.round((completed / checks.length) * 100);
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

function getLanguageDisplayName(language: LanguageName): string {
  if (language === "Dari") {
    return "دری";
  }

  if (language === "Pashto") {
    return "پښتو";
  }

  return "English";
}

function getLocalizedCategoryTitle(
  categoryId: ProviderProfile["categoryId"],
  language: LanguageName,
): string {
  const titles: Record<
    ProviderProfile["categoryId"],
    Record<LanguageName, string>
  > = {
    electrician: {
      English: "Electrician",
      Dari: "برق‌کار",
      Pashto: "برېښناکار",
    },
    plumber: {
      English: "Plumber",
      Dari: "لوله‌کش",
      Pashto: "نلدوان",
    },
    carpenter: {
      English: "Carpenter",
      Dari: "نجار",
      Pashto: "ترکاڼ",
    },
    construction: {
      English: "Construction",
      Dari: "ساختمان",
      Pashto: "ساختماني کار",
    },
    painter: {
      English: "Painter",
      Dari: "رنگ‌مال",
      Pashto: "رنګمال",
    },
    cleaner: {
      English: "Cleaner",
      Dari: "نظافت‌چی",
      Pashto: "پاک‌کار",
    },
    "ac-technician": {
      English: "AC technician",
      Dari: "تخنیکر کولر",
      Pashto: "د اې سي تخنیکر",
    },
    driver: {
      English: "Driver",
      Dari: "راننده",
      Pashto: "موټر چلوونکی",
    },
    "phone-repair": {
      English: "Phone repair",
      Dari: "ترمیم موبایل",
      Pashto: "د موبایل ترمیم",
    },
    "computer-repair": {
      English: "Computer repair",
      Dari: "ترمیم کمپیوتر",
      Pashto: "د کمپیوټر ترمیم",
    },
    tailor: {
      English: "Tailor",
      Dari: "خیاط",
      Pashto: "خیاط",
    },
    barber: {
      English: "Barber",
      Dari: "آرایشگر",
      Pashto: "سلماني",
    },
    tutor: {
      English: "Tutor",
      Dari: "معلم خصوصی",
      Pashto: "خصوصي ښوونکی",
    },
    photographer: {
      English: "Photographer",
      Dari: "عکاس",
      Pashto: "عکاس",
    },
    other: {
      English: "Service provider",
      Dari: "ارائه‌دهندهٔ خدمات",
      Pashto: "خدمت وړاندې کوونکی",
    },
  };

  return titles[categoryId][language];
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

function formatProviderJobsValue(
  value: string,
  language: LanguageName,
): string {
  if (language === "Dari") {
    return `${value} کار`;
  }

  if (language === "Pashto") {
    return `${value} کارونه`;
  }

  return `${value} jobs`;
}

function formatProviderServiceAreaValue(
  location: string,
  radius: string,
  language: LanguageName,
): string {
  if (language === "Dari") {
    return `${location} · شعاع ${radius} کیلومتر`;
  }

  if (language === "Pashto") {
    return `${location} · ${radius} کیلومتره شعاع`;
  }

  return `${location} · ${radius} km radius`;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: KhedmatPalette.white,
  },

  providerState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Layout.screenPadding,
  },

  providerStateTitle: {
    ...Typography.sectionTitle,
    color: KhedmatPalette.textPrimary,
    textAlign: "center",
  },

  providerStateBody: {
    ...Typography.bodyStyle,
    color: KhedmatPalette.textMuted,
    marginTop: Spacing.sm,
    maxWidth: Layout.readableTextMaxWidth,
    textAlign: "center",
  },

  safeArea: {
    flex: 1,
    backgroundColor: KhedmatPalette.white,
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
    gap: Spacing.xs,
  },

  eyebrow: {
    ...Typography.captionStyle,
    width: "100%",
    color: KhedmatPalette.blue500,
    fontFamily: Fonts.medium,
  },

  title: {
    ...Typography.screenTitle,
    width: "100%",
    color: KhedmatPalette.textPrimary,
    fontSize: 27,
    lineHeight: 34,
  },

  subtitle: {
    ...Typography.bodyStyle,
    width: "100%",
    maxWidth: 460,
    color: KhedmatPalette.textSecondary,
  },

  profileCard: {
    width: "100%",
    minHeight: 130,
    marginTop: Spacing.xxl,
    padding: Spacing.lg,
    alignItems: "center",
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: KhedmatPalette.border,
    borderRadius: Radius.xl,
    backgroundColor: KhedmatPalette.surface,
    ...Shadows.small,
  },

  avatar: {
    width: 68,
    height: 68,
    flexShrink: 0,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: KhedmatPalette.navy900,
  },

  avatarText: {
    color: KhedmatPalette.white,
    fontFamily: Fonts.bold,
    fontSize: 20,
  },

  verifiedBadge: {
    position: "absolute",
    right: -2,
    bottom: -2,
    width: 22,
    height: 22,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: KhedmatPalette.blue500,
    borderWidth: 2,
    borderColor: KhedmatPalette.surface,
  },

  profileCopy: {
    flex: 1,
    gap: 4,
  },

  nameRow: {
    width: "100%",
    alignItems: "center",
    gap: 5,
  },

  providerName: {
    ...Typography.sectionTitle,
    flexShrink: 1,
    color: KhedmatPalette.textPrimary,
    fontSize: 20,
    lineHeight: 26,
  },

  providerProfession: {
    ...Typography.bodyStyle,
    width: "100%",
    color: KhedmatPalette.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },

  profileMetaRow: {
    width: "100%",
    marginTop: Spacing.xs,
    flexWrap: "wrap",
    gap: Spacing.sm,
  },

  profileMeta: {
    maxWidth: "100%",
    alignItems: "center",
    gap: 4,
  },

  profileMetaText: {
    ...Typography.captionStyle,
    flexShrink: 1,
    color: KhedmatPalette.textMuted,
    fontSize: 10,
  },

  previewButton: {
    width: 42,
    height: 42,
    flexShrink: 0,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: KhedmatPalette.surfaceSoft,
  },

  completionCard: {
    width: "100%",
    marginTop: Spacing.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: KhedmatPalette.blue200,
    borderRadius: Radius.xl,
    backgroundColor: "#F4FBFC",
  },

  completionTopRow: {
    width: "100%",
    alignItems: "center",
    gap: Spacing.md,
  },

  completionPercentage: {
    width: 64,
    height: 64,
    flexShrink: 0,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: KhedmatPalette.navy900,
  },

  completionPercentageText: {
    color: KhedmatPalette.white,
    fontFamily: Fonts.bold,
    fontSize: 18,
  },

  completionCopy: {
    flex: 1,
    gap: 3,
  },

  completionTitle: {
    ...Typography.label,
    width: "100%",
    color: KhedmatPalette.textPrimary,
    fontSize: 17,
    lineHeight: 23,
  },

  completionSubtitle: {
    ...Typography.captionStyle,
    width: "100%",
    color: KhedmatPalette.textSecondary,
    lineHeight: 19,
  },

  progressTrack: {
    width: "100%",
    height: 8,
    marginTop: Spacing.lg,
    overflow: "hidden",
    borderRadius: Radius.pill,
    backgroundColor: KhedmatPalette.border,
  },

  progressFill: {
    height: "100%",
    borderRadius: Radius.pill,
    backgroundColor: KhedmatPalette.blue500,
  },

  completionChecks: {
    width: "100%",
    marginTop: Spacing.md,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },

  completionCheck: {
    minWidth: "47%",
    flex: 1,
    alignItems: "center",
    gap: 6,
  },

  checkCircle: {
    width: 22,
    height: 22,
    flexShrink: 0,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: KhedmatPalette.border,
  },

  checkCircleCompleted: {
    backgroundColor: SUCCESS,
  },

  completionCheckText: {
    ...Typography.captionStyle,
    flex: 1,
    color: KhedmatPalette.textMuted,
    fontSize: 10,
  },

  completionCheckTextCompleted: {
    color: KhedmatPalette.textSecondary,
    fontFamily: Fonts.medium,
  },

  section: {
    width: "100%",
    marginTop: Spacing.section,
    gap: Spacing.md,
  },

  sectionHeader: {
    width: "100%",
    gap: 2,
  },

  sectionTitle: {
    ...Typography.sectionTitle,
    width: "100%",
    color: KhedmatPalette.textPrimary,
    fontSize: 20,
    lineHeight: 27,
  },

  sectionSubtitle: {
    ...Typography.captionStyle,
    width: "100%",
    color: KhedmatPalette.textMuted,
  },

  menuCard: {
    width: "100%",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: KhedmatPalette.border,
    borderRadius: Radius.xl,
    backgroundColor: KhedmatPalette.surface,
    ...Shadows.small,
  },

  menuRow: {
    width: "100%",
    minHeight: 78,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    alignItems: "center",
    gap: Spacing.md,
  },

  menuRowPressed: {
    backgroundColor: KhedmatPalette.surfaceSoft,
  },

  menuIcon: {
    width: 44,
    height: 44,
    flexShrink: 0,
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: KhedmatPalette.surfaceSoft,
  },

  menuCopy: {
    flex: 1,
    gap: 2,
  },

  menuTitle: {
    ...Typography.label,
    width: "100%",
    color: KhedmatPalette.textPrimary,
    fontSize: 15,
  },

  menuSubtitle: {
    ...Typography.captionStyle,
    width: "100%",
    color: KhedmatPalette.textMuted,
    lineHeight: 18,
  },

  menuBadge: {
    maxWidth: 100,
    flexShrink: 0,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 5,
    borderRadius: Radius.pill,
  },

  menuBadgeText: {
    ...Typography.captionStyle,
    fontFamily: Fonts.medium,
    fontSize: 10,
    textAlign: "center",
  },

  divider: {
    width: "100%",
    height: StyleSheet.hairlineWidth,
    marginHorizontal: Spacing.md,
    backgroundColor: KhedmatPalette.border,
  },

  accountStatusCard: {
    width: "100%",
    minHeight: 104,
    marginTop: Spacing.section,
    padding: Spacing.lg,
    alignItems: "center",
    gap: Spacing.md,
    borderWidth: 1,
    borderRadius: Radius.xl,
  },

  accountStatusIcon: {
    width: 48,
    height: 48,
    flexShrink: 0,
    borderRadius: Radius.lg,
    alignItems: "center",
    justifyContent: "center",
  },

  accountStatusCopy: {
    flex: 1,
    gap: 3,
  },

  accountStatusTitle: {
    ...Typography.label,
    width: "100%",
    color: KhedmatPalette.textPrimary,
    fontSize: 16,
  },

  accountStatusSubtitle: {
    ...Typography.captionStyle,
    width: "100%",
    color: KhedmatPalette.textSecondary,
    lineHeight: 19,
  },

  logoutButton: {
    width: "100%",
    minHeight: 52,
    marginTop: Spacing.section,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E7B1AD",
    borderRadius: Radius.lg,
    backgroundColor: ERROR_SOFT,
  },

  logoutButtonPressed: {
    opacity: 0.8,
    transform: [
      {
        scale: 0.99,
      },
    ],
  },

  logoutContent: {
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
  },

  logoutText: {
    ...Typography.label,
    color: ERROR,
    fontFamily: Fonts.medium,
  },

  versionText: {
    ...Typography.captionStyle,
    width: "100%",
    marginTop: Spacing.section,
    color: KhedmatPalette.textMuted,
    textAlign: "center",
  },

  pressed: {
    opacity: 0.78,
  },
});
