import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  ComponentProps,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  ActivityIndicator,
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
import { getProviderById } from "../../services/provider-repository";
import { getLocalProviders } from "../../services/provider-storage";

type IconName =
  ComponentProps<typeof Ionicons>["name"];

type LanguageName =
  | "English"
  | "Dari"
  | "Pashto";

type ProviderStatus =
  | "not-started"
  | "pending"
  | "approved"
  | "rejected";

type LocalizedText = {
  English: string;
  Dari: string;
  Pashto: string;
};

type ProfileMenuItem = {
  id: string;
  title: string;
  subtitle?: string;
  icon: IconName;
  badge?: string;
  destructive?: boolean;
  onPress: () => void;
};

export default function ProfileScreen() {
  const router = useRouter();
  const { language } = useLanguage();

  const {
  activeProviderId,
  enterProviderWorkspace,
  resetSession,
} = useSession();

  const activeLanguage =
    normalizeLanguage(language);

  const isRtl =
    activeLanguage === "Dari" ||
    activeLanguage === "Pashto";

  const copy =
    getProfileCopy(activeLanguage);

  const [
    notificationsEnabled,
    setNotificationsEnabled,
  ] = useState(true);

  const [
    providerStatus,
    setProviderStatus,
  ] = useState<ProviderStatus | null>(
    null,
  );

  const [
    providerAccountId,
    setProviderAccountId,
  ] = useState<string | null>(
    null,
  );

  const [
    providerAccountError,
    setProviderAccountError,
  ] = useState<Error | null>(
    null,
  );

  useEffect(() => {
    let isMounted = true;

    const resolveProviderAccount =
      async (): Promise<void> => {
        setProviderStatus(null);
        setProviderAccountError(null);

        try {
          if (activeProviderId) {
            const activeProvider =
              await getProviderById(
                activeProviderId,
              );

            if (
              isMounted &&
              activeProvider
            ) {
              setProviderAccountId(
                activeProvider.id,
              );
              setProviderStatus(
                "approved",
              );

              return;
            }
          }

          const localProviders =
            await getLocalProviders();

          if (!isMounted) {
            return;
          }

          const savedProvider =
            localProviders[0];

          if (savedProvider) {
            setProviderAccountId(
              savedProvider.id,
            );
            setProviderStatus(
              "approved",
            );

            return;
          }

          setProviderAccountId(null);
          setProviderStatus(
            "not-started",
          );
        } catch (error) {
          if (!isMounted) {
            return;
          }

          setProviderAccountId(null);
          setProviderStatus(
            "not-started",
          );
          setProviderAccountError(
            error instanceof Error
              ? error
              : new Error(
                  "Failed to resolve the provider account.",
                ),
          );
        }
      };

    void resolveProviderAccount();

    return () => {
      isMounted = false;
    };
  }, [activeProviderId]);

  const accountItems =
    useMemo<ProfileMenuItem[]>(
      () => [
        {
          id: "personal-information",
          title:
            copy.personalInformation,
          subtitle:
            copy.personalInformationSubtitle,
          icon: "person-outline",
          onPress: () => {
            console.log(
              "Open personal information",
            );
          },
        },
        {
          id: "saved-addresses",
          title:
            copy.savedAddresses,
          subtitle:
            copy.savedAddressesSubtitle,
          icon: "location-outline",
          badge: formatDigits(
            "2",
            activeLanguage !==
              "English",
          ),
          onPress: () => {
            console.log(
              "Open saved addresses",
            );
          },
        },
        {
          id: "language",
          title: copy.appLanguage,
          subtitle:
            getLanguageDisplayName(
              activeLanguage,
            ),
          icon: "language-outline",
          onPress: () => {
            router.push("/language");
          },
        },
      ],
      [
        activeLanguage,
        copy,
        router,
      ],
    );

  const settingsItems =
    useMemo<ProfileMenuItem[]>(
      () => [
        {
          id: "notifications",
          title: copy.notifications,
          subtitle:
            copy.notificationsSubtitle,
          icon:
            "notifications-outline",
          onPress: () => {
            setNotificationsEnabled(
              (current) => !current,
            );
          },
        },
        {
          id: "privacy",
          title:
            copy.privacyAndSecurity,
          subtitle:
            copy.privacyAndSecuritySubtitle,
          icon:
            "shield-checkmark-outline",
          onPress: () => {
            console.log(
              "Open privacy and security",
            );
          },
        },
        {
          id: "payments",
          title: copy.payments,
          subtitle:
            copy.paymentsSubtitle,
          icon: "card-outline",
          onPress: () => {
            console.log(
              "Open payments",
            );
          },
        },
      ],
      [copy],
    );

  const supportItems =
    useMemo<ProfileMenuItem[]>(
      () => [
        {
          id: "help",
          title: copy.helpCenter,
          subtitle:
            copy.helpCenterSubtitle,
          icon:
            "help-circle-outline",
          onPress: () => {
            console.log(
              "Open help center",
            );
          },
        },
        {
          id: "contact-support",
          title:
            copy.contactSupport,
          subtitle:
            copy.contactSupportSubtitle,
          icon: "headset-outline",
          onPress: () => {
            router.push(
              "/(tabs)/messages",
            );
          },
        },
        {
          id: "terms",
          title:
            copy.termsAndPrivacy,
          icon:
            "document-text-outline",
          onPress: () => {
            console.log(
              "Open legal documents",
            );
          },
        },
      ],
      [copy, router],
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
          resetSession();

          router.replace(
            "/language",
          );
        },
      },
    ],
  );
};

  const openProviderStatus = () => {
    if (!providerStatus) {
      return;
    }

    if (
      providerStatus ===
      "not-started"
    ) {
      router.push(
        "/provider-welcome",
      );

      return;
    }

    if (
      providerStatus ===
        "approved" &&
      providerAccountId
    ) {
      enterProviderWorkspace(
        providerAccountId,
      );

      router.push(
        "/(provider-tabs)",
      );

      return;
    }

    console.log(
      "Open provider application status",
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
        <View style={styles.header}>
          <Text
            style={[
              styles.eyebrow,
              directionStyle(isRtl),
            ]}
          >
            {copy.eyebrow}
          </Text>

          <Text
            style={[
              styles.title,
              directionStyle(isRtl),
            ]}
          >
            {copy.title}
          </Text>

          <Text
            style={[
              styles.subtitle,
              directionStyle(isRtl),
            ]}
          >
            {copy.subtitle}
          </Text>
        </View>

        <View
          style={[
            styles.profileCard,
            {
              flexDirection: isRtl
                ? "row-reverse"
                : "row",
            },
          ]}
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              copy.changeProfilePhoto
            }
            onPress={() => {
              console.log(
                "Change profile photo",
              );
            }}
            style={({ pressed }) => [
              styles.profileAvatar,
              pressed &&
                styles.pressed,
            ]}
          >
            <Text
              style={
                styles.profileInitials
              }
            >
              {activeLanguage ===
              "English"
                ? "A"
                : "ا"}
            </Text>

            <View
              style={
                styles.editAvatarBadge
              }
            >
              <Ionicons
                name="camera-outline"
                size={13}
                color={
                  KhedmatPalette.white
                }
              />
            </View>
          </Pressable>

          <View
            style={[
              styles.profileCopy,
              {
                alignItems: isRtl
                  ? "flex-end"
                  : "flex-start",
              },
            ]}
          >
            <Text
              numberOfLines={1}
              style={[
                styles.profileName,
                directionStyle(isRtl),
              ]}
            >
              {copy.profileName}
            </Text>

            <Text
              style={[
                styles.profilePhone,
                directionStyle(isRtl),
              ]}
            >
              {activeLanguage ===
              "English"
                ? "+93 70 123 4567"
                : "+۹۳ ۷۰ ۱۲۳ ۴۵۶۷"}
            </Text>

            <View
              style={[
                styles.accountBadge,
                {
                  flexDirection: isRtl
                    ? "row-reverse"
                    : "row",
                },
              ]}
            >
              <Ionicons
                name="shield-checkmark"
                size={14}
                color={
                  KhedmatPalette.blue500
                }
              />

              <Text
                style={[
                  styles.accountBadgeText,
                  directionStyle(
                    isRtl,
                  ),
                ]}
              >
                {copy.verifiedAccount}
              </Text>
            </View>
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              copy.editProfile
            }
            onPress={() => {
              console.log(
                "Edit profile",
              );
            }}
            style={({ pressed }) => [
              styles.editProfileButton,
              pressed &&
                styles.pressed,
            ]}
          >
            <Ionicons
              name="create-outline"
              size={20}
              color={
                KhedmatPalette.navy700
              }
            />
          </Pressable>
        </View>

        {providerStatus ? (
          <ProviderStatusCard
            status={providerStatus}
            language={activeLanguage}
            isRtl={isRtl}
            onPress={
              openProviderStatus
            }
          />
        ) : (
          <View
            style={[
              styles.providerStatusLoading,
              {
                flexDirection: isRtl
                  ? "row-reverse"
                  : "row",
              },
            ]}
          >
            <ActivityIndicator
              size="small"
              color={
                KhedmatPalette.blue500
              }
            />

            <Text
              style={[
                styles.providerStatusLoadingText,
                directionStyle(isRtl),
              ]}
            >
              {activeLanguage === "Dari"
                ? "در حال بررسی حساب ارائه‌دهنده..."
                : activeLanguage === "Pashto"
                  ? "د خدمت چمتو کوونکي حساب کتل کېږي..."
                  : "Checking provider account..."}
            </Text>
          </View>
        )}

        {providerAccountError ? (
          <Text
            style={[
              styles.providerStatusError,
              directionStyle(isRtl),
            ]}
          >
            {activeLanguage === "Dari"
              ? "بارگذاری حساب ارائه‌دهنده ناموفق بود."
              : activeLanguage === "Pashto"
                ? "د خدمت چمتو کوونکي حساب بارول ناکام شول."
                : "Unable to load the provider account."}
          </Text>
        ) : null}

        <ProfileSection
          title={copy.account}
          items={accountItems}
          isRtl={isRtl}
        />

        <View
          style={styles.section}
        >
          <Text
            style={[
              styles.sectionTitle,
              directionStyle(isRtl),
            ]}
          >
            {copy.settings}
          </Text>

          <View
            style={styles.menuList}
          >
            {settingsItems.map(
              (item) => {
                if (
                  item.id ===
                  "notifications"
                ) {
                  return (
                    <ProfileToggleItem
                      key={item.id}
                      item={item}
                      selected={
                        notificationsEnabled
                      }
                      isRtl={isRtl}
                    />
                  );
                }

                return (
                  <ProfileMenuItemCard
                    key={item.id}
                    item={item}
                    isRtl={isRtl}
                  />
                );
              },
            )}
          </View>
        </View>

        <ProfileSection
          title={copy.support}
          items={supportItems}
          isRtl={isRtl}
        />

        <View
          style={styles.section}
        >
          <Text
            style={[
              styles.sectionTitle,
              directionStyle(isRtl),
            ]}
          >
            {copy.accountActions}
          </Text>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              copy.logout
            }
            onPress={handleLogout}
            style={({ pressed }) => [
              styles.logoutButton,
              pressed &&
                styles.logoutButtonPressed,
            ]}
          >
            <View
              style={[
                styles.logoutButtonContent,
                {
                  flexDirection: isRtl
                    ? "row-reverse"
                    : "row",
                },
              ]}
            >
              <Ionicons
                name="log-out-outline"
                size={20}
                color={
                  KhedmatPalette.error
                }
              />

              <Text
                style={[
                  styles.logoutButtonText,
                  directionStyle(
                    isRtl,
                  ),
                ]}
              >
                {copy.logout}
              </Text>
            </View>
          </Pressable>
        </View>

        <Text
          style={styles.versionText}
        >
          {copy.version}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

type ProviderStatusCardProps = {
  status: ProviderStatus;
  language: LanguageName;
  isRtl: boolean;
  onPress: () => void;
};

function ProviderStatusCard({
  status,
  language,
  isRtl,
  onPress,
}: ProviderStatusCardProps) {
  const config =
    getProviderStatusConfig(
      status,
      language,
    );

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={
        config.title
      }
      onPress={onPress}
      style={({ pressed }) => [
        styles.providerStatusCard,
        {
          borderColor:
            config.borderColor,
          backgroundColor:
            config.backgroundColor,
          flexDirection: isRtl
            ? "row-reverse"
            : "row",
        },
        pressed &&
          styles.cardPressed,
      ]}
    >
      <View
        style={[
          styles.providerStatusIcon,
          {
            backgroundColor:
              config.iconBackground,
          },
        ]}
      >
        <Ionicons
          name={config.icon}
          size={24}
          color={config.color}
        />
      </View>

      <View
        style={[
          styles.providerStatusCopy,
          {
            alignItems: isRtl
              ? "flex-end"
              : "flex-start",
          },
        ]}
      >
        <Text
          style={[
            styles.providerStatusEyebrow,
            {
              color: config.color,
            },
            directionStyle(isRtl),
          ]}
        >
          {
            config.providerAccountLabel
          }
        </Text>

        <Text
          style={[
            styles.providerStatusTitle,
            directionStyle(isRtl),
          ]}
        >
          {config.title}
        </Text>

        <Text
          style={[
            styles.providerStatusSubtitle,
            directionStyle(isRtl),
          ]}
        >
          {config.subtitle}
        </Text>
      </View>

      <Ionicons
        name={
          isRtl
            ? "chevron-back"
            : "chevron-forward"
        }
        size={20}
        color={
          KhedmatPalette.textMuted
        }
      />
    </Pressable>
  );
}

type ProfileSectionProps = {
  title: string;
  items: ProfileMenuItem[];
  isRtl: boolean;
};

function ProfileSection({
  title,
  items,
  isRtl,
}: ProfileSectionProps) {
  return (
    <View style={styles.section}>
      <Text
        style={[
          styles.sectionTitle,
          directionStyle(isRtl),
        ]}
      >
        {title}
      </Text>

      <View
        style={styles.menuList}
      >
        {items.map((item) => (
          <ProfileMenuItemCard
            key={item.id}
            item={item}
            isRtl={isRtl}
          />
        ))}
      </View>
    </View>
  );
}

type ProfileMenuItemCardProps = {
  item: ProfileMenuItem;
  isRtl: boolean;
};

function ProfileMenuItemCard({
  item,
  isRtl,
}: ProfileMenuItemCardProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={
        item.title
      }
      onPress={item.onPress}
      style={({ pressed }) => [
        styles.menuCard,
        pressed &&
          styles.cardPressed,
      ]}
    >
      <View
        style={[
          styles.menuContent,
          {
            flexDirection: isRtl
              ? "row-reverse"
              : "row",
          },
        ]}
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
                ? KhedmatPalette.error
                : KhedmatPalette
                    .blue500
            }
          />
        </View>

        <View
          style={[
            styles.menuCopy,
            {
              alignItems: isRtl
                ? "flex-end"
                : "flex-start",
            },
          ]}
        >
          <Text
            style={[
              styles.menuTitle,
              item.destructive &&
                styles.destructiveMenuTitle,
              directionStyle(isRtl),
            ]}
          >
            {item.title}
          </Text>

          {item.subtitle ? (
            <Text
              style={[
                styles.menuSubtitle,
                directionStyle(
                  isRtl,
                ),
              ]}
            >
              {item.subtitle}
            </Text>
          ) : null}
        </View>

        {item.badge ? (
          <View
            style={styles.menuBadge}
          >
            <Text
              style={
                styles.menuBadgeText
              }
            >
              {item.badge}
            </Text>
          </View>
        ) : null}

        <Ionicons
          name={
            isRtl
              ? "chevron-back"
              : "chevron-forward"
          }
          size={18}
          color={
            KhedmatPalette.textMuted
          }
        />
      </View>
    </Pressable>
  );
}

type ProfileToggleItemProps = {
  item: ProfileMenuItem;
  selected: boolean;
  isRtl: boolean;
};

function ProfileToggleItem({
  item,
  selected,
  isRtl,
}: ProfileToggleItemProps) {
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityLabel={
        item.title
      }
      accessibilityState={{
        checked: selected,
      }}
      onPress={item.onPress}
      style={({ pressed }) => [
        styles.menuCard,
        selected &&
          styles.selectedToggleCard,
        pressed &&
          styles.cardPressed,
      ]}
    >
      <View
        style={[
          styles.menuContent,
          {
            flexDirection: isRtl
              ? "row-reverse"
              : "row",
          },
        ]}
      >
        <View
          style={[
            styles.menuIcon,
            selected &&
              styles.selectedMenuIcon,
          ]}
        >
          <Ionicons
            name={item.icon}
            size={21}
            color={
              selected
                ? KhedmatPalette.white
                : KhedmatPalette
                    .blue500
            }
          />
        </View>

        <View
          style={[
            styles.menuCopy,
            {
              alignItems: isRtl
                ? "flex-end"
                : "flex-start",
            },
          ]}
        >
          <Text
            style={[
              styles.menuTitle,
              directionStyle(isRtl),
            ]}
          >
            {item.title}
          </Text>

          {item.subtitle ? (
            <Text
              style={[
                styles.menuSubtitle,
                directionStyle(
                  isRtl,
                ),
              ]}
            >
              {item.subtitle}
            </Text>
          ) : null}
        </View>

        <View
          style={[
            styles.switchTrack,
            selected &&
              styles.switchTrackSelected,
          ]}
        >
          <View
            style={[
              styles.switchThumb,
              selected && {
                alignSelf: isRtl
                  ? "flex-start"
                  : "flex-end",
              },
            ]}
          />
        </View>
      </View>
    </Pressable>
  );
}

function getProviderStatusConfig(
  status: ProviderStatus,
  language: LanguageName,
) {
  const copy =
    getProviderStatusCopy(
      language,
    );

  if (status === "pending") {
    return {
      providerAccountLabel:
        copy.providerAccount,

      title: copy.pendingTitle,

      subtitle:
        copy.pendingSubtitle,

      icon:
        "time-outline" as const,

      color: "#8A5A00",

      backgroundColor:
        "#FFF9E9",

      borderColor:
        "#E5C875",

      iconBackground:
        "#FFF0C2",
    };
  }

  if (status === "approved") {
    return {
      providerAccountLabel:
        copy.providerAccount,

      title: copy.approvedTitle,

      subtitle:
        copy.approvedSubtitle,

      icon:
        "checkmark-circle-outline" as const,

      color:
        KhedmatPalette.success,

      backgroundColor:
        "#F2FBF6",

      borderColor:
        "#9ED9B6",

      iconBackground:
        KhedmatPalette.successSoft,
    };
  }

  if (status === "rejected") {
    return {
      providerAccountLabel:
        copy.providerAccount,

      title: copy.rejectedTitle,

      subtitle:
        copy.rejectedSubtitle,

      icon:
        "alert-circle-outline" as const,

      color:
        KhedmatPalette.error,

      backgroundColor:
        "#FFF5F4",

      borderColor:
        "#E8AAA5",

      iconBackground:
        KhedmatPalette.errorSoft,
    };
  }

  return {
    providerAccountLabel:
      copy.providerAccount,

    title: copy.notStartedTitle,

    subtitle:
      copy.notStartedSubtitle,

    icon:
      "briefcase-outline" as const,

    color:
      KhedmatPalette.blue500,

    backgroundColor:
      "#F4FBFC",

    borderColor:
      KhedmatPalette.blue200,

    iconBackground:
      KhedmatPalette.surfaceSoft,
  };
}

function getProviderStatusCopy(
  language: LanguageName,
) {
  if (language === "Dari") {
    return {
      providerAccount:
        "حساب ارائه‌دهنده",

      pendingTitle:
        "درخواست شما در حال بررسی است",

      pendingSubtitle:
        "پس از تأیید، حساب حرفه‌ای شما فعال می‌شود.",

      approvedTitle:
        "حساب ارائه‌دهنده فعال است",

      approvedSubtitle:
        "درخواست‌های مشتریان را مشاهده و مدیریت کنید.",

      rejectedTitle:
        "درخواست نیاز به اصلاح دارد",

      rejectedSubtitle:
        "جزئیات درخواست را مشاهده و اطلاعات را تکمیل کنید.",

      notStartedTitle:
        "به‌عنوان ارائه‌دهنده ثبت‌نام کنید",

      notStartedSubtitle:
        "مهارت‌های خود را معرفی کنید و درخواست‌های کاری دریافت نمایید.",
    };
  }

  if (language === "Pashto") {
    return {
      providerAccount:
        "د خدمت وړاندې کوونکي حساب",

      pendingTitle:
        "ستاسو غوښتنه تر کتنې لاندې ده",

      pendingSubtitle:
        "له تایید وروسته به ستاسو مسلکي حساب فعال شي.",

      approvedTitle:
        "د خدمت وړاندې کوونکي حساب فعال دی",

      approvedSubtitle:
        "د پیرودونکو غوښتنې وګورئ او مدیریت یې کړئ.",

      rejectedTitle:
        "غوښتنه سمون ته اړتیا لري",

      rejectedSubtitle:
        "د غوښتنې تفصیل وګورئ او معلومات بشپړ کړئ.",

      notStartedTitle:
        "د خدمت وړاندې کوونکي په توګه نوم‌لیکنه وکړئ",

      notStartedSubtitle:
        "خپل مهارتونه معرفي کړئ او کاري غوښتنې ترلاسه کړئ.",
    };
  }

  return {
    providerAccount:
      "Provider account",

    pendingTitle:
      "Your application is under review",

    pendingSubtitle:
      "Your professional account will activate after approval.",

    approvedTitle:
      "Your provider account is active",

    approvedSubtitle:
      "View and manage customer service requests.",

    rejectedTitle:
      "Your application needs changes",

    rejectedSubtitle:
      "Review the application and complete the required information.",

    notStartedTitle:
      "Register as a provider",

    notStartedSubtitle:
      "Present your skills and receive service requests.",
  };
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

function directionStyle(
  isRtl: boolean,
) {
  return {
    textAlign: isRtl
      ? ("right" as const)
      : ("left" as const),

    writingDirection: isRtl
      ? ("rtl" as const)
      : ("ltr" as const),
  };
}

function formatDigits(
  value: string,
  localized: boolean,
): string {
  if (!localized) {
    return value;
  }

  const digits: Record<
    string,
    string
  > = {
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

  return value.replace(
    /\d/g,
    (digit) =>
      digits[digit] ?? digit,
  );
}

function getLanguageDisplayName(
  language: LanguageName,
): string {
  if (language === "Dari") {
    return "دری";
  }

  if (language === "Pashto") {
    return "پښتو";
  }

  return "English";
}

function getProfileCopy(
  language: LanguageName,
) {
  if (language === "Dari") {
    return {
      eyebrow: "حساب کاربری",
      title: "پروفایل",

      subtitle:
        "اطلاعات حساب، تنظیمات و گزینه‌های پشتیبانی خود را مدیریت کنید.",

      profileName: "احمد ظاهر",

      verifiedAccount:
        "حساب تأییدشده",

      editProfile:
        "ویرایش پروفایل",

      changeProfilePhoto:
        "تغییر عکس پروفایل",

      account: "حساب",

      personalInformation:
        "اطلاعات شخصی",

      personalInformationSubtitle:
        "نام، شماره تلفن و عکس پروفایل",

      savedAddresses:
        "آدرس‌های ذخیره‌شده",

      savedAddressesSubtitle:
        "خانه، محل کار و آدرس‌های دیگر",

      appLanguage:
        "زبان برنامه",

      settings: "تنظیمات",

      notifications: "اعلان‌ها",

      notificationsSubtitle:
        "رزروها، پیام‌ها و تغییرات حساب",

      privacyAndSecurity:
        "حریم خصوصی و امنیت",

      privacyAndSecuritySubtitle:
        "رمز، دسترسی‌ها و مدیریت اطلاعات",

      payments: "پرداخت‌ها",

      paymentsSubtitle:
        "روش‌های پرداخت و تاریخچه",

      support: "پشتیبانی",

      helpCenter:
        "مرکز راهنما",

      helpCenterSubtitle:
        "پرسش‌های رایج و راهنمای استفاده",

      contactSupport:
        "تماس با پشتیبانی",

      contactSupportSubtitle:
        "گزارش مشکل یا درخواست کمک",

      termsAndPrivacy:
        "شرایط استفاده و حریم خصوصی",

      accountActions:
        "مدیریت حساب",

      logout: "خروج از حساب",

      logoutConfirmation:
        "آیا مطمئن هستید که می‌خواهید از حساب خود خارج شوید؟",

      cancel: "لغو",

      version:
        "خدمت، نسخهٔ ۱.۰.۰",
    };
  }

  if (language === "Pashto") {
    return {
      eyebrow:
        "کارن حساب",
      title: "پروفایل",

      subtitle:
        "د خپل حساب معلومات، تنظیمات او د ملاتړ انتخابونه مدیریت کړئ.",

      profileName:
        "احمد ظاهر",

      verifiedAccount:
        "تایید شوی حساب",

      editProfile:
        "پروفایل سمول",

      changeProfilePhoto:
        "د پروفایل عکس بدلول",

      account: "حساب",

      personalInformation:
        "شخصي معلومات",

      personalInformationSubtitle:
        "نوم، د ټیلیفون شمېره او د پروفایل عکس",

      savedAddresses:
        "خوندي شوې پتې",

      savedAddressesSubtitle:
        "کور، د کار ځای او نورې پتې",

      appLanguage:
        "د اپلېکېشن ژبه",

      settings: "تنظیمات",

      notifications:
        "خبرتیاوې",

      notificationsSubtitle:
        "رزرفونه، پیغامونه او د حساب بدلونونه",

      privacyAndSecurity:
        "محرمیت او امنیت",

      privacyAndSecuritySubtitle:
        "پټنوم، اجازې او د معلوماتو مدیریت",

      payments: "تادیات",

      paymentsSubtitle:
        "د تادیې لارې او تاریخچه",

      support: "ملاتړ",

      helpCenter:
        "د مرستې مرکز",

      helpCenterSubtitle:
        "عامې پوښتنې او د کارونې لارښود",

      contactSupport:
        "له ملاتړ سره اړیکه",

      contactSupportSubtitle:
        "ستونزه راپور کړئ یا مرسته وغواړئ",

      termsAndPrivacy:
        "د کارونې شرایط او محرمیت",

      accountActions:
        "د حساب مدیریت",

      logout:
        "له حسابه وتل",

      logoutConfirmation:
        "ایا ډاډه یاست چې غواړئ له خپل حسابه ووځئ؟",

      cancel: "لغوه",

      version:
        "خدمت، نسخه ۱.۰.۰",
    };
  }

  return {
    eyebrow: "User account",
    title: "Profile",

    subtitle:
      "Manage your account information, settings and support options.",

    profileName: "Ahmad Zahir",

    verifiedAccount:
      "Verified account",

    editProfile: "Edit profile",

    changeProfilePhoto:
      "Change profile photo",

    account: "Account",

    personalInformation:
      "Personal information",

    personalInformationSubtitle:
      "Name, phone number and profile photo",

    savedAddresses:
      "Saved addresses",

    savedAddressesSubtitle:
      "Home, work and other addresses",

    appLanguage:
      "App language",

    settings: "Settings",

    notifications:
      "Notifications",

    notificationsSubtitle:
      "Bookings, messages and account updates",

    privacyAndSecurity:
      "Privacy and security",

    privacyAndSecuritySubtitle:
      "Password, permissions and data management",

    payments: "Payments",

    paymentsSubtitle:
      "Payment methods and history",

    support: "Support",

    helpCenter: "Help center",

    helpCenterSubtitle:
      "Frequently asked questions and usage guides",

    contactSupport:
      "Contact support",

    contactSupportSubtitle:
      "Report a problem or request help",

    termsAndPrivacy:
      "Terms of use and privacy",

    accountActions:
      "Account management",

    logout: "Log out",

    logoutConfirmation:
      "Are you sure you want to log out of your account?",

    cancel: "Cancel",

    version:
      "Khedmat, version 1.0.0",
  };
}

const styles = StyleSheet.create({
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
    color:
      KhedmatPalette.blue500,
    fontFamily: Fonts.medium,
  },

  title: {
    ...Typography.screenTitle,
    width: "100%",
    color:
      KhedmatPalette.textPrimary,
    fontSize: 27,
    lineHeight: 34,
  },

  subtitle: {
    ...Typography.bodyStyle,
    width: "100%",
    maxWidth:
      Layout.readableTextMaxWidth,
    color:
      KhedmatPalette.textSecondary,
  },

  profileCard: {
    width: "100%",
    minHeight: 118,
    marginTop: Spacing.xxl,
    padding: Spacing.lg,
    alignItems: "center",
    gap: Spacing.md,
    borderWidth: 1,
    borderColor:
      KhedmatPalette.border,
    borderRadius: Radius.xl,
    backgroundColor:
      KhedmatPalette.surface,
    ...Shadows.small,
  },

  profileAvatar: {
    width: 70,
    height: 70,
    flexShrink: 0,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      KhedmatPalette.navy900,
  },

  profileInitials: {
    fontFamily: Fonts.bold,
    color:
      KhedmatPalette.white,
    fontSize: 24,
  },

  editAvatarBadge: {
    position: "absolute",
    right: -2,
    bottom: -2,
    width: 25,
    height: 25,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      KhedmatPalette.blue500,
    borderWidth: 2,
    borderColor:
      KhedmatPalette.surface,
  },

  profileCopy: {
    flex: 1,
    gap: 3,
  },

  profileName: {
    ...Typography.sectionTitle,
    width: "100%",
    color:
      KhedmatPalette.textPrimary,
    fontSize: 21,
    lineHeight: 28,
  },

  profilePhone: {
    ...Typography.bodyStyle,
    width: "100%",
    color:
      KhedmatPalette.textSecondary,
  },

  accountBadge: {
    marginTop: Spacing.xs,
    alignItems: "center",
    gap: 5,
  },

  accountBadgeText: {
    ...Typography.captionStyle,
    color:
      KhedmatPalette.blue500,
    fontFamily: Fonts.medium,
  },

  editProfileButton: {
    width: 42,
    height: 42,
    flexShrink: 0,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      KhedmatPalette.surfaceSoft,
  },

  providerStatusLoading: {
    width: "100%",
    minHeight: 88,
    marginTop: Spacing.lg,
    padding: Spacing.lg,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.md,
    borderWidth: 1,
    borderColor:
      KhedmatPalette.border,
    borderRadius: Radius.xl,
    backgroundColor:
      KhedmatPalette.surface,
  },

  providerStatusLoadingText: {
    ...Typography.label,
    flex: 1,
    color:
      KhedmatPalette.textSecondary,
  },

  providerStatusError: {
    ...Typography.captionStyle,
    width: "100%",
    marginTop: Spacing.sm,
    color:
      KhedmatPalette.error,
  },

  providerStatusCard: {
    width: "100%",
    minHeight: 112,
    marginTop: Spacing.lg,
    padding: Spacing.lg,
    alignItems: "center",
    gap: Spacing.md,
    borderWidth: 1,
    borderRadius: Radius.xl,
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
    gap: 3,
  },

  providerStatusEyebrow: {
    ...Typography.captionStyle,
    width: "100%",
    fontFamily: Fonts.medium,
  },

  providerStatusTitle: {
    ...Typography.label,
    width: "100%",
    color:
      KhedmatPalette.textPrimary,
    fontSize: 17,
    lineHeight: 23,
  },

  providerStatusSubtitle: {
    ...Typography.captionStyle,
    width: "100%",
    color:
      KhedmatPalette.textSecondary,
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
    color:
      KhedmatPalette.textPrimary,
    fontSize: 20,
    lineHeight: 27,
  },

  menuList: {
    width: "100%",
    gap: Spacing.sm,
  },

  menuCard: {
    width: "100%",
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor:
      KhedmatPalette.border,
    backgroundColor:
      KhedmatPalette.surface,
  },

  selectedToggleCard: {
    borderColor:
      KhedmatPalette.blue500,
    backgroundColor:
      "#F4FBFC",
  },

  menuContent: {
    width: "100%",
    minHeight: 76,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    alignItems: "center",
    gap: Spacing.md,
  },

  menuIcon: {
    width: 44,
    height: 44,
    flexShrink: 0,
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      KhedmatPalette.surfaceSoft,
  },

  selectedMenuIcon: {
    backgroundColor:
      KhedmatPalette.blue500,
  },

  destructiveMenuIcon: {
    backgroundColor:
      KhedmatPalette.errorSoft,
  },

  menuCopy: {
    flex: 1,
    gap: 2,
  },

  menuTitle: {
    ...Typography.label,
    width: "100%",
    color:
      KhedmatPalette.textPrimary,
    fontSize: 16,
    lineHeight: 22,
  },

  destructiveMenuTitle: {
    color:
      KhedmatPalette.error,
  },

  menuSubtitle: {
    ...Typography.captionStyle,
    width: "100%",
    color:
      KhedmatPalette.textMuted,
  },

  menuBadge: {
    minWidth: 27,
    height: 27,
    paddingHorizontal: 7,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      KhedmatPalette.surfaceSoft,
  },

  menuBadgeText: {
    ...Typography.captionStyle,
    color:
      KhedmatPalette.blue500,
    fontFamily: Fonts.bold,
  },

  switchTrack: {
    width: 46,
    height: 28,
    flexShrink: 0,
    borderRadius: Radius.pill,
    justifyContent: "center",
    paddingHorizontal: 3,
    backgroundColor:
      KhedmatPalette.border,
  },

  switchTrackSelected: {
    backgroundColor:
      KhedmatPalette.blue500,
  },

  switchThumb: {
    width: 22,
    height: 22,
    borderRadius: Radius.pill,
    backgroundColor:
      KhedmatPalette.white,
  },

  logoutButton: {
    width: "100%",
    minHeight: 52,
    borderRadius: Radius.lg,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E7B1AD",
    backgroundColor:
      KhedmatPalette.errorSoft,
  },

  logoutButtonPressed: {
    opacity: 0.8,
    transform: [
      {
        scale: 0.99,
      },
    ],
  },

  logoutButtonContent: {
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
  },

  logoutButtonText: {
    ...Typography.label,
    color:
      KhedmatPalette.error,
    fontFamily: Fonts.medium,
  },

  versionText: {
    ...Typography.captionStyle,
    width: "100%",
    marginTop: Spacing.section,
    color:
      KhedmatPalette.textMuted,
    textAlign: "center",
  },

  pressed: {
    opacity: 0.78,
  },

  cardPressed: {
    opacity: 0.88,
    transform: [
      {
        scale: 0.993,
      },
    ],
  },
});