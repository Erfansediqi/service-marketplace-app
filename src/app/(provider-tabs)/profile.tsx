import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ComponentProps, useEffect, useMemo, useState } from "react";
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
import type { ProviderProfile } from "../../types/provider";
import { useActiveProvider } from "../../hooks/use-active-provider";
import { updateProviderAvailability } from "../../services/provider-repository";

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
  const { provider, isLoading, error } = useActiveProvider();

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.providerState}>
          <Text style={styles.providerStateTitle}>Loading provider...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!provider || error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.providerState}>
          <Text style={styles.providerStateTitle}>
            No active provider session.
          </Text>

          <Text style={styles.providerStateBody}>
            Complete provider registration or select a valid provider account.
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

  const copy = getProfileCopy(activeLanguage);

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const [availableForUrgentWork, setAvailableForUrgentWork] = useState(false);

  const [isSavingUrgentWork, setIsSavingUrgentWork] = useState(false);

  useEffect(() => {
    setAvailableForUrgentWork(provider.acceptsUrgentRequests);
  }, [provider.id, provider.acceptsUrgentRequests]);

  const handleUrgentWorkToggle = async (): Promise<void> => {
    if (isSavingUrgentWork) {
      return;
    }

    const previousValue = availableForUrgentWork;
    const nextValue = !previousValue;

    setAvailableForUrgentWork(nextValue);
    setIsSavingUrgentWork(true);

    try {
      await updateProviderAvailability(provider.id, {
        acceptsUrgentRequests: nextValue,
      });
    } catch (error) {
      console.error("Failed to update urgent-request availability:", error);

      setAvailableForUrgentWork(previousValue);

      Alert.alert(
        "Could not update urgent requests",
        "Your urgent-request preference was not saved. Please try again.",
      );
    } finally {
      setIsSavingUrgentWork(false);
    }
  };

  const profileCompletion = calculateProfileCompletion(provider);

  const accountItems = useMemo<ProfileMenuItem[]>(
    () => [
      {
        id: "personal-details",
        title: copy.personalDetails,
        subtitle: copy.personalDetailsSubtitle,
        icon: "person-outline",
        onPress: () => {
          console.log("Open provider personal details");
        },
      },
      {
        id: "professional-profile",
        title: copy.professionalProfile,
        subtitle: copy.professionalProfileSubtitle,
        icon: "briefcase-outline",
        badge: `${formatDigits(
          profileCompletion.toString(),
          localizedDigits,
        )}%`,
        onPress: () => {
          router.push({
            pathname: "/provider-profile",
            params: {
              providerId: provider.id,
            },
          });
        },
      },
      {
        id: "services",
        title: copy.servicesAndPrices,
        subtitle: copy.servicesAndPricesSubtitle,
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
        title: copy.portfolio,
        subtitle: copy.portfolioSubtitle,
        icon: "images-outline",
        badge: formatDigits(
          provider.portfolio.length.toString(),
          localizedDigits,
        ),
        onPress: () => {
          console.log("Open provider portfolio");
        },
      },
      {
        id: "verification",
        title: copy.verification,
        subtitle: provider.verified
          ? copy.verificationCompleteSubtitle
          : copy.verificationIncompleteSubtitle,
        icon: "shield-checkmark-outline",
        badge: provider.verified ? copy.verified : copy.incomplete,
        badgeTone: provider.verified ? "success" : "warning",
        onPress: () => {
          console.log("Open provider verification");
        },
      },
    ],
    [copy, localizedDigits, profileCompletion, provider, router],
  );

  const workItems = useMemo<ProfileMenuItem[]>(
    () => [
      {
        id: "availability",
        title: copy.scheduleAndAvailability,
        subtitle: copy.scheduleAndAvailabilitySubtitle,
        icon: "calendar-outline",
        onPress: () => {
          router.push("/(provider-tabs)/calendar");
        },
      },
      {
        id: "service-area",
        title: copy.serviceArea,
        subtitle: copy.serviceAreaValue(
          provider.locationLabel,
          formatDigits(provider.serviceRadiusKm.toString(), localizedDigits),
        ),
        icon: "location-outline",
        onPress: () => {
          console.log("Open provider service area");
        },
      },
      {
        id: "earnings",
        title: copy.earningsAndPayments,
        subtitle: copy.earningsAndPaymentsSubtitle,
        icon: "wallet-outline",
        onPress: () => {
          console.log("Open provider earnings");
        },
      },
      {
        id: "performance",
        title: copy.performance,
        subtitle: copy.performanceSubtitle,
        icon: "stats-chart-outline",
        badge: `${formatDigits(provider.rating.toFixed(1), localizedDigits)} ★`,
        onPress: () => {
          console.log("Open provider performance");
        },
      },
    ],
    [copy, localizedDigits, provider, router],
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
        title: copy.notifications,
        subtitle: copy.notificationsSubtitle,
        icon: "notifications-outline",
        badge: notificationsEnabled ? copy.enabled : copy.disabled,
        badgeTone: notificationsEnabled ? "success" : "default",
        onPress: () => {
          setNotificationsEnabled((current) => !current);
        },
      },
      {
        id: "privacy",
        title: copy.privacyAndSecurity,
        subtitle: copy.privacyAndSecuritySubtitle,
        icon: "lock-closed-outline",
        onPress: () => {
          console.log("Open provider privacy");
        },
      },
      {
        id: "language",
        title: copy.appLanguage,
        subtitle: getLanguageDisplayName(activeLanguage),
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
        title: copy.helpCenter,
        subtitle: copy.helpCenterSubtitle,
        icon: "help-circle-outline",
        onPress: () => {
          console.log("Open provider help center");
        },
      },
    ],
    [
      activeLanguage,
      copy,
      enterCustomerWorkspace,
      notificationsEnabled,
      router,
      t,
    ],
  );

  const handleLogout = () => {
    Alert.alert(
      copy.logout,
      copy.logoutConfirmation,
      [
        {
          text: copy.cancel,
          style: "cancel",
        },
        {
          text: copy.logout,
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
          <Text style={[styles.eyebrow, directionStyle(isRtl)]}>
            {copy.eyebrow}
          </Text>

          <Text style={[styles.title, directionStyle(isRtl)]}>
            {copy.title}
          </Text>

          <Text style={[styles.subtitle, directionStyle(isRtl)]}>
            {copy.subtitle}
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
              {provider.profession}
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
                icon="briefcase-outline"
                value={copy.jobsValue(
                  formatDigits(
                    provider.completedJobs.toString(),
                    localizedDigits,
                  ),
                )}
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
            accessibilityLabel={copy.viewPublicProfile}
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
                {copy.profileCompletion}
              </Text>

              <Text style={[styles.completionSubtitle, directionStyle(isRtl)]}>
                {copy.profileCompletionSubtitle}
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
              label={copy.basicInformation}
              completed={Boolean(provider.description)}
              isRtl={isRtl}
            />

            <CompletionCheck
              label={copy.services}
              completed={provider.services.length > 0}
              isRtl={isRtl}
            />

            <CompletionCheck
              label={copy.workSamples}
              completed={provider.portfolio.length > 0}
              isRtl={isRtl}
            />

            <CompletionCheck
              label={copy.accountVerification}
              completed={provider.verified}
              isRtl={isRtl}
            />
          </View>
        </View>

        <View
          style={[
            styles.availabilityCard,
            {
              flexDirection: isRtl ? "row-reverse" : "row",
            },
          ]}
        >
          <View
            style={[
              styles.availabilityIcon,
              availableForUrgentWork
                ? styles.availabilityIconActive
                : styles.availabilityIconInactive,
            ]}
          >
            <Ionicons
              name="flash-outline"
              size={22}
              color={
                availableForUrgentWork
                  ? KhedmatPalette.white
                  : KhedmatPalette.textMuted
              }
            />
          </View>

          <View
            style={[
              styles.availabilityCopy,
              {
                alignItems: isRtl ? "flex-end" : "flex-start",
              },
            ]}
          >
            <Text style={[styles.availabilityTitle, directionStyle(isRtl)]}>
              {copy.urgentRequests}
            </Text>

            <Text style={[styles.availabilitySubtitle, directionStyle(isRtl)]}>
              {availableForUrgentWork
                ? copy.urgentRequestsEnabledSubtitle
                : copy.urgentRequestsDisabledSubtitle}
            </Text>
          </View>

          <Pressable
            accessibilityRole="switch"
            accessibilityLabel={copy.urgentRequests}
            accessibilityState={{
              checked: availableForUrgentWork,
              disabled: isSavingUrgentWork,
            }}
            disabled={isSavingUrgentWork}
            onPress={() => {
              void handleUrgentWorkToggle();
            }}
            style={({ pressed }) => [
              styles.switchPressable,
              isSavingUrgentWork && {
                opacity: 0.6,
              },
              pressed && styles.pressed,
            ]}
          >
            <View
              style={[
                styles.switchTrack,
                availableForUrgentWork && styles.switchTrackSelected,
              ]}
            >
              <View
                style={[
                  styles.switchThumb,
                  availableForUrgentWork && {
                    alignSelf: isRtl ? "flex-start" : "flex-end",
                  },
                ]}
              />
            </View>
          </Pressable>
        </View>

        <ProfileSection
          title={copy.accountAndProfile}
          subtitle={copy.accountAndProfileSubtitle}
          items={accountItems}
          isRtl={isRtl}
        />

        <ProfileSection
          title={copy.workManagement}
          subtitle={copy.workManagementSubtitle}
          items={workItems}
          isRtl={isRtl}
        />

        <ProfileSection
          title={copy.settingsAndSupport}
          subtitle={copy.settingsAndSupportSubtitle}
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
                ? copy.verifiedProfessionalAccount
                : copy.unverifiedProfessionalAccount}
            </Text>

            <Text style={[styles.accountStatusSubtitle, directionStyle(isRtl)]}>
              {provider.verified
                ? copy.verifiedProfessionalAccountSubtitle
                : copy.unverifiedProfessionalAccountSubtitle}
            </Text>
          </View>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={copy.logout}
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
              {copy.logout}
            </Text>
          </View>
        </Pressable>

        <Text style={styles.versionText}>{copy.version}</Text>
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
  subtitle,
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

        <Text style={[styles.sectionSubtitle, directionStyle(isRtl)]}>
          {subtitle}
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

function getProfileCopy(language: LanguageName) {
  if (language === "Dari") {
    return {
      eyebrow: "حساب ارائه‌دهنده",
      title: "پروفایل و تنظیمات",
      subtitle:
        "معلومات حرفه‌ای، خدمات، برنامهٔ کاری و تنظیمات حساب خود را مدیریت کنید.",

      viewPublicProfile: "مشاهده پروفایل عمومی",
      jobsValue: (value: string) => `${value} کار`,

      profileCompletion: "تکمیل پروفایل حرفه‌ای",
      profileCompletionSubtitle:
        "پروفایل کامل‌تر اعتماد مشتریان و احتمال دریافت درخواست را افزایش می‌دهد.",
      basicInformation: "معلومات اصلی",
      services: "خدمات",
      workSamples: "نمونه‌کار",
      accountVerification: "تأیید حساب",

      urgentRequests: "پذیرش درخواست فوری",
      urgentRequestsEnabledSubtitle:
        "مشتریان می‌توانند برای خدمات فوری به شما درخواست بفرستند.",
      urgentRequestsDisabledSubtitle:
        "در حال حاضر درخواست فوری دریافت نمی‌کنید.",

      accountAndProfile: "حساب و پروفایل",
      accountAndProfileSubtitle: "معلومات شخصی و حرفه‌ای",
      personalDetails: "معلومات شخصی",
      personalDetailsSubtitle: "نام، شماره تماس، آدرس و معلومات حساب",
      professionalProfile: "پروفایل حرفه‌ای",
      professionalProfileSubtitle: "توضیحات، تجربه، مهارت‌ها و محدودهٔ کاری",
      servicesAndPrices: "خدمات و قیمت‌ها",
      servicesAndPricesSubtitle: "افزودن، حذف و ویرایش خدمات ارائه‌شده",
      portfolio: "نمونه‌کارها",
      portfolioSubtitle: "مدیریت عکس‌ها و پروژه‌های تکمیل‌شده",
      verification: "تأیید هویت و اسناد",
      verificationCompleteSubtitle: "حساب شما بررسی و تأیید شده است.",
      verificationIncompleteSubtitle:
        "اسناد لازم را برای تأیید حساب تکمیل کنید.",
      verified: "تأییدشده",
      incomplete: "ناقص",

      workManagement: "مدیریت کار",
      workManagementSubtitle: "برنامه، خدمات و درآمد",
      scheduleAndAvailability: "برنامه و دسترسی",
      scheduleAndAvailabilitySubtitle: "روزهای کاری، ساعت‌ها و مرخصی‌ها",
      serviceArea: "محدودهٔ خدمت",
      serviceAreaValue: (location: string, radius: string) =>
        `${location} · شعاع ${radius} کیلومتر`,
      earningsAndPayments: "درآمد و پرداخت‌ها",
      earningsAndPaymentsSubtitle: "درآمد، تسویه‌حساب و تاریخچهٔ مالی",
      performance: "عملکرد و آمار",
      performanceSubtitle: "امتیاز، نرخ پاسخ و کارهای تکمیل‌شده",

      settingsAndSupport: "تنظیمات و پشتیبانی",
      settingsAndSupportSubtitle: "امنیت، اعلان و راهنما",
      notifications: "اعلان‌ها",
      notificationsSubtitle: "درخواست‌ها، پیام‌ها و تغییر وضعیت رزرو",
      enabled: "فعال",
      disabled: "خاموش",
      privacyAndSecurity: "حریم خصوصی و امنیت",
      privacyAndSecuritySubtitle: "رمز، دسترسی‌ها و مدیریت معلومات",
      appLanguage: "زبان برنامه",
      helpCenter: "مرکز راهنما",
      helpCenterSubtitle: "سؤالات، پشتیبانی و گزارش مشکل",

      verifiedProfessionalAccount: "حساب حرفه‌ای تأییدشده",
      verifiedProfessionalAccountSubtitle:
        "معلومات و اسناد حساب شما بررسی شده است.",
      unverifiedProfessionalAccount: "تأیید حساب تکمیل نشده",
      unverifiedProfessionalAccountSubtitle:
        "برای افزایش اعتماد مشتریان، اسناد لازم را تکمیل کنید.",

      logout: "خروج از حساب",
      logoutConfirmation: "آیا مطمئن هستید که می‌خواهید از حساب خود خارج شوید؟",
      cancel: "لغو",
      version: "خدمت · نسخهٔ ۱.۰.۰",
    };
  }

  if (language === "Pashto") {
    return {
      eyebrow: "د خدمت وړاندې کوونکي حساب",
      title: "پروفایل او تنظیمات",
      subtitle:
        "خپل مسلکي معلومات، خدمتونه، کاري مهال‌وېش او د حساب تنظیمات مدیریت کړئ.",

      viewPublicProfile: "عامه پروفایل وګورئ",
      jobsValue: (value: string) => `${value} کارونه`,

      profileCompletion: "مسلکي پروفایل بشپړول",
      profileCompletionSubtitle:
        "بشپړ پروفایل د پیرودونکو باور او د غوښتنو د ترلاسه کولو امکان زیاتوي.",
      basicInformation: "اصلي معلومات",
      services: "خدمتونه",
      workSamples: "د کار نمونې",
      accountVerification: "د حساب تایید",

      urgentRequests: "بیړنۍ غوښتنې منل",
      urgentRequestsEnabledSubtitle:
        "پیرودونکي کولی شي د بیړنیو خدمتونو غوښتنې درولېږي.",
      urgentRequestsDisabledSubtitle: "اوس مهال بیړنۍ غوښتنې نه ترلاسه کوئ.",

      accountAndProfile: "حساب او پروفایل",
      accountAndProfileSubtitle: "شخصي او مسلکي معلومات",
      personalDetails: "شخصي معلومات",
      personalDetailsSubtitle: "نوم، د ټیلیفون شمېره، پته او د حساب معلومات",
      professionalProfile: "مسلکي پروفایل",
      professionalProfileSubtitle: "تشریح، تجربه، مهارتونه او کاري ساحه",
      servicesAndPrices: "خدمتونه او بیې",
      servicesAndPricesSubtitle: "خدمتونه زیاتول، لرې کول او سمول",
      portfolio: "د کار نمونې",
      portfolioSubtitle: "د عکسونو او بشپړ شوو پروژو مدیریت",
      verification: "د هویت او اسنادو تایید",
      verificationCompleteSubtitle: "ستاسو حساب کتل شوی او تایید شوی دی.",
      verificationIncompleteSubtitle:
        "د حساب د تایید لپاره اړین اسناد بشپړ کړئ.",
      verified: "تایید شوی",
      incomplete: "نیمګړی",

      workManagement: "د کار مدیریت",
      workManagementSubtitle: "مهال‌وېش، خدمتونه او عاید",
      scheduleAndAvailability: "مهال‌وېش او شتون",
      scheduleAndAvailabilitySubtitle: "کاري ورځې، ساعتونه او رخصتۍ",
      serviceArea: "د خدمت ساحه",
      serviceAreaValue: (location: string, radius: string) =>
        `${location} · ${radius} کیلومتره شعاع`,
      earningsAndPayments: "عاید او تادیات",
      earningsAndPaymentsSubtitle: "عاید، تصفیه او مالي تاریخچه",
      performance: "فعالیت او شمېرې",
      performanceSubtitle: "امتیاز، د ځواب کچه او بشپړ شوي کارونه",

      settingsAndSupport: "تنظیمات او ملاتړ",
      settingsAndSupportSubtitle: "امنیت، خبرتیاوې او مرسته",
      notifications: "خبرتیاوې",
      notificationsSubtitle: "غوښتنې، پیغامونه او د رزرف حالت",
      enabled: "فعال",
      disabled: "بند",
      privacyAndSecurity: "محرمیت او امنیت",
      privacyAndSecuritySubtitle: "پټنوم، اجازې او د معلوماتو مدیریت",
      appLanguage: "د اپلېکېشن ژبه",
      helpCenter: "د مرستې مرکز",
      helpCenterSubtitle: "پوښتنې، ملاتړ او د ستونزې راپور",

      verifiedProfessionalAccount: "تایید شوی مسلکي حساب",
      verifiedProfessionalAccountSubtitle:
        "ستاسو د حساب معلومات او اسناد کتل شوي دي.",
      unverifiedProfessionalAccount: "د حساب تایید بشپړ نه دی",
      unverifiedProfessionalAccountSubtitle:
        "د پیرودونکو د باور لپاره اړین اسناد بشپړ کړئ.",

      logout: "له حسابه وتل",
      logoutConfirmation: "ایا ډاډه یاست چې غواړئ له خپل حسابه ووځئ؟",
      cancel: "لغوه",
      version: "خدمت · نسخه ۱.۰.۰",
    };
  }

  return {
    eyebrow: "Provider account",
    title: "Profile and settings",
    subtitle:
      "Manage your professional information, services, schedule and account settings.",

    viewPublicProfile: "View public profile",
    jobsValue: (value: string) => `${value} jobs`,

    profileCompletion: "Professional profile completion",
    profileCompletionSubtitle:
      "A more complete profile builds customer trust and improves your chance of receiving requests.",
    basicInformation: "Basic information",
    services: "Services",
    workSamples: "Work samples",
    accountVerification: "Account verification",

    urgentRequests: "Accept urgent requests",
    urgentRequestsEnabledSubtitle:
      "Customers can send you requests for urgent services.",
    urgentRequestsDisabledSubtitle:
      "You are not currently receiving urgent requests.",

    accountAndProfile: "Account and profile",
    accountAndProfileSubtitle: "Personal and professional information",
    personalDetails: "Personal details",
    personalDetailsSubtitle:
      "Name, phone number, address and account information",
    professionalProfile: "Professional profile",
    professionalProfileSubtitle:
      "Description, experience, skills and work area",
    servicesAndPrices: "Services and prices",
    servicesAndPricesSubtitle: "Add, remove and edit offered services",
    portfolio: "Portfolio",
    portfolioSubtitle: "Manage photos and completed projects",
    verification: "Identity and document verification",
    verificationCompleteSubtitle:
      "Your account has been reviewed and verified.",
    verificationIncompleteSubtitle:
      "Complete the required documents to verify your account.",
    verified: "Verified",
    incomplete: "Incomplete",

    workManagement: "Work management",
    workManagementSubtitle: "Schedule, services and earnings",
    scheduleAndAvailability: "Schedule and availability",
    scheduleAndAvailabilitySubtitle: "Working days, hours and time off",
    serviceArea: "Service area",
    serviceAreaValue: (location: string, radius: string) =>
      `${location} · ${radius} km radius`,
    earningsAndPayments: "Earnings and payments",
    earningsAndPaymentsSubtitle: "Income, settlements and financial history",
    performance: "Performance and statistics",
    performanceSubtitle: "Rating, response rate and completed jobs",

    settingsAndSupport: "Settings and support",
    settingsAndSupportSubtitle: "Security, notifications and help",
    notifications: "Notifications",
    notificationsSubtitle: "Requests, messages and booking-status changes",
    enabled: "Enabled",
    disabled: "Off",
    privacyAndSecurity: "Privacy and security",
    privacyAndSecuritySubtitle: "Password, permissions and data management",
    appLanguage: "App language",
    helpCenter: "Help center",
    helpCenterSubtitle: "Questions, support and problem reporting",

    verifiedProfessionalAccount: "Verified professional account",
    verifiedProfessionalAccountSubtitle:
      "Your account information and documents have been reviewed.",
    unverifiedProfessionalAccount: "Account verification incomplete",
    unverifiedProfessionalAccountSubtitle:
      "Complete the required documents to improve customer trust.",

    logout: "Log out",
    logoutConfirmation: "Are you sure you want to log out of your account?",
    cancel: "Cancel",
    version: "Khedmat · Version 1.0.0",
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: KhedmatPalette.blue050,
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
    backgroundColor: KhedmatPalette.blue050,
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

  availabilityCard: {
    width: "100%",
    minHeight: 110,
    marginTop: Spacing.lg,
    padding: Spacing.lg,
    alignItems: "center",
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: KhedmatPalette.border,
    borderRadius: Radius.xl,
    backgroundColor: KhedmatPalette.surface,
    ...Shadows.small,
  },

  availabilityIcon: {
    width: 48,
    height: 48,
    flexShrink: 0,
    borderRadius: Radius.lg,
    alignItems: "center",
    justifyContent: "center",
  },

  availabilityIconActive: {
    backgroundColor: KhedmatPalette.blue500,
  },

  availabilityIconInactive: {
    backgroundColor: KhedmatPalette.surfaceSoft,
  },

  availabilityCopy: {
    flex: 1,
    gap: 3,
  },

  availabilityTitle: {
    ...Typography.label,
    width: "100%",
    color: KhedmatPalette.textPrimary,
    fontSize: 16,
  },

  availabilitySubtitle: {
    ...Typography.captionStyle,
    width: "100%",
    color: KhedmatPalette.textSecondary,
    lineHeight: 18,
  },

  switchPressable: {
    flexShrink: 0,
  },

  switchTrack: {
    width: 48,
    height: 29,
    paddingHorizontal: 3,
    borderRadius: Radius.pill,
    justifyContent: "center",
    backgroundColor: KhedmatPalette.border,
  },

  switchTrackSelected: {
    backgroundColor: KhedmatPalette.blue500,
  },

  switchThumb: {
    width: 23,
    height: 23,
    borderRadius: Radius.pill,
    backgroundColor: KhedmatPalette.white,
    ...Shadows.small,
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
