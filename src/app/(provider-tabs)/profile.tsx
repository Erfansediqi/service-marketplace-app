import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
    ComponentProps,
    useMemo,
    useState,
} from "react";
import {
    Alert,
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { useSession } from "../../context/session-context";

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
import {
    getProviderById,
    ProviderProfile,
} from "../../data/providers";

type IconName =
  ComponentProps<typeof Ionicons>["name"];

type ProfileMenuItem = {
  id: string;
  title: string;
  subtitle: string;
  icon: IconName;
  badge?: string;
  onPress: () => void;
};


export default function ProviderAccountScreen() {
  const router = useRouter();

  const { activeProviderId } = useSession();

  const providerId =
    activeProviderId ?? "provider-1";

  const [notificationsEnabled, setNotificationsEnabled] =
    useState(true);

  const [availableForUrgentWork, setAvailableForUrgentWork] =
    useState(true);

  const provider = useMemo(
    () =>
      getProviderById(providerId) ??
      getProviderById("provider-1")!,
    [providerId],
  );

  const profileCompletion =
    calculateProfileCompletion(provider);

  const accountItems: ProfileMenuItem[] = [
    {
      id: "personal-details",
      title: "معلومات شخصی",
      subtitle:
        "نام، شماره تماس، آدرس و معلومات حساب",
      icon: "person-outline",
      onPress: () => {
        console.log(
          "Open provider personal details",
        );
      },
    },
    {
      id: "professional-profile",
      title: "پروفایل حرفه‌ای",
      subtitle:
        "توضیحات، تجربه، مهارت‌ها و محدودهٔ کاری",
      icon: "briefcase-outline",
      badge: `${toDariDigits(
        profileCompletion.toString(),
      )}٪`,
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
      title: "خدمات و قیمت‌ها",
      subtitle:
        "افزودن، حذف و ویرایش خدمات ارائه‌شده",
      icon: "construct-outline",
      badge: toDariDigits(
        provider.services.length.toString(),
      ),
      onPress: () => {
        console.log(
          "Open provider services settings",
        );
      },
    },
    {
      id: "portfolio",
      title: "نمونه‌کارها",
      subtitle:
        "مدیریت عکس‌ها و پروژه‌های تکمیل‌شده",
      icon: "images-outline",
      badge: toDariDigits(
        provider.portfolio.length.toString(),
      ),
      onPress: () => {
        console.log(
          "Open provider portfolio",
        );
      },
    },
    {
      id: "verification",
      title: "تأیید هویت و اسناد",
      subtitle:
        provider.verified
          ? "حساب شما بررسی و تأیید شده است"
          : "اسناد لازم را برای تأیید حساب تکمیل کنید",
      icon: "shield-checkmark-outline",
      badge: provider.verified
        ? "تأییدشده"
        : "ناقص",
      onPress: () => {
        console.log(
          "Open provider verification",
        );
      },
    },
  ];

  const workItems: ProfileMenuItem[] = [
    {
      id: "availability",
      title: "برنامه و دسترسی",
      subtitle:
        "روزهای کاری، ساعت‌ها و مرخصی‌ها",
      icon: "calendar-outline",
      onPress: () => {
        router.push(
          "/(provider-tabs)/calendar",
        );
      },
    },
    {
      id: "service-area",
      title: "محدودهٔ خدمت",
      subtitle: `${provider.locationLabel} · شعاع ${toDariDigits(
        provider.serviceRadiusKm.toString(),
      )} کیلومتر`,
      icon: "location-outline",
      onPress: () => {
        console.log(
          "Open provider service area",
        );
      },
    },
    {
      id: "earnings",
      title: "درآمد و پرداخت‌ها",
      subtitle:
        "درآمد، تسویه‌حساب و تاریخچهٔ مالی",
      icon: "wallet-outline",
      onPress: () => {
        console.log(
          "Open provider earnings",
        );
      },
    },
    {
      id: "performance",
      title: "عملکرد و آمار",
      subtitle:
        "امتیاز، نرخ پاسخ و کارهای تکمیل‌شده",
      icon: "stats-chart-outline",
      badge: `${toDariDigits(
        provider.rating.toFixed(1),
      )} ★`,
      onPress: () => {
        console.log(
          "Open provider performance",
        );
      },
    },
  ];

  const settingsItems: ProfileMenuItem[] = [
    {
      id: "notifications",
      title: "اعلان‌ها",
      subtitle:
        "درخواست‌ها، پیام‌ها و تغییر وضعیت رزرو",
      icon: "notifications-outline",
      badge: notificationsEnabled
        ? "فعال"
        : "خاموش",
      onPress: () => {
        setNotificationsEnabled(
          (current) => !current,
        );
      },
    },
    {
      id: "privacy",
      title: "حریم خصوصی و امنیت",
      subtitle:
        "رمز، دسترسی‌ها و مدیریت معلومات",
      icon: "lock-closed-outline",
      onPress: () => {
        console.log(
          "Open provider privacy",
        );
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
    {
      id: "help",
      title: "مرکز راهنما",
      subtitle:
        "سؤالات، پشتیبانی و گزارش مشکل",
      icon: "help-circle-outline",
      onPress: () => {
        console.log(
          "Open provider help center",
        );
      },
    },
  ];

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
            router.replace("/");
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          styles.scrollContent
        }
      >
        <View style={styles.header}>
          <Text style={styles.eyebrow}>
            حساب ارائه‌دهنده
          </Text>

          <Text style={styles.title}>
            پروفایل و تنظیمات
          </Text>

          <Text style={styles.subtitle}>
            معلومات حرفه‌ای، خدمات، برنامهٔ کاری
            و تنظیمات حساب خود را مدیریت کنید.
          </Text>
        </View>

        <GlassSurface
          variant="prominent"
          radius={Radius.xl}
          style={[
            styles.profileCard,
            Shadows.small,
          ]}
          contentStyle={styles.profileContent}
        >
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {provider.initials}
            </Text>

            {provider.verified ? (
              <View style={styles.verifiedBadge}>
                <Ionicons
                  name="checkmark"
                  size={12}
                  color={Colors.white}
                />
              </View>
            ) : null}
          </View>

          <View style={styles.profileCopy}>
            <View style={styles.nameRow}>
              <Text style={styles.providerName}>
                {provider.name}
              </Text>

              {provider.verified ? (
                <Ionicons
                  name="shield-checkmark"
                  size={18}
                  color={Colors.primary}
                />
              ) : null}
            </View>

            <Text
              style={styles.providerProfession}
            >
              {provider.profession}
            </Text>

            <View style={styles.profileMetaRow}>
              <ProfileMeta
                icon="star"
                value={`${toDariDigits(
                  provider.rating.toFixed(1),
                )} (${toDariDigits(
                  provider.reviewCount.toString(),
                )})`}
                color={Colors.warning}
              />

              <ProfileMeta
                icon="briefcase-outline"
                value={`${toDariDigits(
                  provider.completedJobs.toString(),
                )} کار`}
              />

              <ProfileMeta
                icon="location-outline"
                value={provider.locationLabel}
              />
            </View>
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="مشاهده پروفایل عمومی"
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
              color={Colors.primary}
            />
          </Pressable>
        </GlassSurface>

        <GlassSurface
          variant="regular"
          radius={Radius.xl}
          style={styles.completionCard}
          contentStyle={
            styles.completionContent
          }
        >
          <View style={styles.completionTopRow}>
            <View
              style={styles.completionPercentage}
            >
              <Text
                style={
                  styles.completionPercentageText
                }
              >
                {toDariDigits(
                  profileCompletion.toString(),
                )}
                ٪
              </Text>
            </View>

            <View style={styles.completionCopy}>
              <Text
                style={styles.completionTitle}
              >
                تکمیل پروفایل حرفه‌ای
              </Text>

              <Text
                style={
                  styles.completionSubtitle
                }
              >
                پروفایل کامل‌تر اعتماد مشتریان و
                احتمال دریافت درخواست را افزایش
                می‌دهد.
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
              label="معلومات اصلی"
              completed={Boolean(
                provider.description,
              )}
            />

            <CompletionCheck
              label="خدمات"
              completed={
                provider.services.length > 0
              }
            />

            <CompletionCheck
              label="نمونه‌کار"
              completed={
                provider.portfolio.length > 0
              }
            />

            <CompletionCheck
              label="تأیید حساب"
              completed={provider.verified}
            />
          </View>
        </GlassSurface>

        <GlassSurface
          variant="regular"
          radius={Radius.xl}
          style={styles.availabilityCard}
          contentStyle={
            styles.availabilityContent
          }
        >
          <View
            style={[
              styles.availabilityIcon,
              availableForUrgentWork &&
                styles.availabilityIconActive,
            ]}
          >
            <Ionicons
              name="flash-outline"
              size={23}
              color={
                availableForUrgentWork
                  ? Colors.white
                  : Colors.textTertiary
              }
            />
          </View>

          <View style={styles.availabilityCopy}>
            <Text
              style={styles.availabilityTitle}
            >
              پذیرش درخواست فوری
            </Text>

            <Text
              style={
                styles.availabilitySubtitle
              }
            >
              {availableForUrgentWork
                ? "مشتریان می‌توانند برای خدمات فوری به شما درخواست بفرستند."
                : "در حال حاضر درخواست فوری دریافت نمی‌کنید."}
            </Text>
          </View>

          <Pressable
            accessibilityRole="switch"
            accessibilityLabel="پذیرش درخواست فوری"
            accessibilityState={{
              checked:
                availableForUrgentWork,
            }}
            onPress={() =>
              setAvailableForUrgentWork(
                (current) => !current,
              )
            }
            style={({ pressed }) => [
              styles.switchPressable,
              pressed && styles.pressed,
            ]}
          >
            <View
              style={[
                styles.switchTrack,
                availableForUrgentWork &&
                  styles.switchTrackSelected,
              ]}
            >
              <View
                style={[
                  styles.switchThumb,
                  availableForUrgentWork &&
                    styles.switchThumbSelected,
                ]}
              />
            </View>
          </Pressable>
        </GlassSurface>

        <ProfileSection
          title="حساب و پروفایل"
          subtitle="معلومات شخصی و حرفه‌ای"
          items={accountItems}
        />

        <ProfileSection
          title="مدیریت کار"
          subtitle="برنامه، خدمات و درآمد"
          items={workItems}
        />

        <ProfileSection
          title="تنظیمات و پشتیبانی"
          subtitle="امنیت، اعلان و راهنما"
          items={settingsItems}
        />

        <GlassSurface
          variant="regular"
          radius={Radius.xl}
          style={styles.accountStatusCard}
          contentStyle={
            styles.accountStatusContent
          }
        >
          <View
            style={styles.accountStatusIcon}
          >
            <Ionicons
              name={
                provider.verified
                  ? "shield-checkmark-outline"
                  : "alert-circle-outline"
              }
              size={24}
              color={
                provider.verified
                  ? Colors.success
                  : Colors.warning
              }
            />
          </View>

          <View
            style={styles.accountStatusCopy}
          >
            <Text
              style={styles.accountStatusTitle}
            >
              {provider.verified
                ? "حساب حرفه‌ای تأییدشده"
                : "تأیید حساب تکمیل نشده"}
            </Text>

            <Text
              style={
                styles.accountStatusSubtitle
              }
            >
              {provider.verified
                ? "معلومات و اسناد حساب شما بررسی شده است."
                : "برای افزایش اعتماد مشتریان، اسناد لازم را تکمیل کنید."}
            </Text>
          </View>
        </GlassSurface>

        <GlassButton
          label="خروج از حساب"
          icon="log-out-outline"
          iconPosition="left"
          variant="destructive"
          onPress={handleLogout}
          style={styles.logoutButton}
        />

        <Text style={styles.versionText}>
          خدمت · نسخهٔ ۱.۰.۰
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function ProfileMeta({
  icon,
  value,
  color = Colors.textTertiary,
}: {
  icon: IconName;
  value: string;
  color?: string;
}) {
  return (
    <View style={styles.profileMeta}>
      <Ionicons
        name={icon}
        size={14}
        color={color}
      />

      <Text
        numberOfLines={1}
        style={styles.profileMetaText}
      >
        {value}
      </Text>
    </View>
  );
}

function CompletionCheck({
  label,
  completed,
}: {
  label: string;
  completed: boolean;
}) {
  return (
    <View style={styles.completionCheck}>
      <View
        style={[
          styles.checkCircle,
          completed &&
            styles.checkCircleCompleted,
        ]}
      >
        <Ionicons
          name={
            completed
              ? "checkmark"
              : "remove"
          }
          size={12}
          color={
            completed
              ? Colors.white
              : Colors.textMuted
          }
        />
      </View>

      <Text
        style={[
          styles.completionCheckText,
          completed &&
            styles.completionCheckTextCompleted,
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

function ProfileSection({
  title,
  subtitle,
  items,
}: {
  title: string;
  subtitle: string;
  items: ProfileMenuItem[];
}) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          {title}
        </Text>

        <Text
          style={styles.sectionSubtitle}
        >
          {subtitle}
        </Text>
      </View>

      <GlassSurface
        variant="regular"
        radius={Radius.xl}
        style={styles.menuCard}
        contentStyle={styles.menuContent}
      >
        {items.map((item, index) => (
          <View key={item.id}>
            <ProfileMenuRow item={item} />

            {index < items.length - 1 ? (
              <View style={styles.divider} />
            ) : null}
          </View>
        ))}
      </GlassSurface>
    </View>
  );
}

function ProfileMenuRow({
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
        styles.menuRow,
        pressed && styles.menuRowPressed,
      ]}
    >
      <View style={styles.menuIcon}>
        <Ionicons
          name={item.icon}
          size={21}
          color={Colors.primary}
        />
      </View>

      <View style={styles.menuCopy}>
        <Text style={styles.menuTitle}>
          {item.title}
        </Text>

        <Text
          numberOfLines={2}
          style={styles.menuSubtitle}
        >
          {item.subtitle}
        </Text>
      </View>

      {item.badge ? (
        <View style={styles.menuBadge}>
          <Text
            style={styles.menuBadgeText}
          >
            {item.badge}
          </Text>
        </View>
      ) : null}

      <Ionicons
        name="chevron-back"
        size={18}
        color={Colors.textTertiary}
      />
    </Pressable>
  );
}

function calculateProfileCompletion(
  provider: ProviderProfile,
): number {
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

  const completed = checks.filter(
    Boolean,
  ).length;

  return Math.round(
    (completed / checks.length) * 100,
  );
}

function toDariDigits(
  value: string,
): string {
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

  return value.replace(
    /\d/g,
    (digit) => digits[digit] ?? digit,
  );
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
    paddingHorizontal:
      Layout.screenPadding,
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

  subtitle: {
    ...Typography.bodyStyle,
    width: "100%",
    color: Colors.textSecondary,
    textAlign: "right",
    writingDirection: "rtl",
  },

  profileCard: {
    width: "100%",
    marginTop: Spacing.xxl,
  },

  profileContent: {
    minHeight: 136,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: Spacing.md,
    padding: Spacing.lg,
  },

  avatar: {
    width: 68,
    height: 68,
    flexShrink: 0,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      Colors.primarySoft,
    borderWidth:
      StyleSheet.hairlineWidth,
    borderColor:
      "rgba(76, 141, 255, 0.30)",
  },

  avatarText: {
    color: Colors.primary,
    fontSize: 21,
    fontWeight: "700",
  },

  verifiedBadge: {
    position: "absolute",
    right: 0,
    bottom: 0,
    width: 22,
    height: 22,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primary,
    borderWidth: 2,
    borderColor:
      Colors.backgroundRaised,
  },

  profileCopy: {
    flex: 1,
    alignItems: "flex-end",
    gap: 4,
  },

  nameRow: {
    width: "100%",
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 5,
  },

  providerName: {
    ...Typography.sectionTitle,
    color: Colors.textPrimary,
    textAlign: "right",
    writingDirection: "rtl",
    fontSize: 20,
    lineHeight: 26,
  },

  providerProfession: {
    ...Typography.bodyStyle,
    width: "100%",
    color: Colors.textSecondary,
    textAlign: "right",
    writingDirection: "rtl",
  },

  profileMetaRow: {
    width: "100%",
    marginTop: 3,
    flexDirection: "row-reverse",
    alignItems: "center",
    flexWrap: "wrap",
    gap: Spacing.md,
  },

  profileMeta: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 4,
  },

  profileMetaText: {
    ...Typography.captionStyle,
    maxWidth: 120,
    color: Colors.textTertiary,
    writingDirection: "rtl",
    fontSize: 11,
  },

  previewButton: {
    width: 42,
    height: 42,
    flexShrink: 0,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      Colors.primarySoft,
  },

  completionCard: {
    width: "100%",
    marginTop: Spacing.lg,
  },

  completionContent: {
    padding: Spacing.lg,
    gap: Spacing.lg,
  },

  completionTopRow: {
    width: "100%",
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: Spacing.md,
  },

  completionPercentage: {
    width: 54,
    height: 54,
    flexShrink: 0,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      Colors.primarySoft,
  },

  completionPercentageText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: "700",
  },

  completionCopy: {
    flex: 1,
    alignItems: "flex-end",
    gap: 3,
  },

  completionTitle: {
    ...Typography.label,
    width: "100%",
    color: Colors.textPrimary,
    textAlign: "right",
    writingDirection: "rtl",
    fontSize: 17,
  },

  completionSubtitle: {
    ...Typography.captionStyle,
    width: "100%",
    color: Colors.textSecondary,
    textAlign: "right",
    writingDirection: "rtl",
    lineHeight: 19,
  },

  progressTrack: {
    width: "100%",
    height: 8,
    overflow: "hidden",
    borderRadius: Radius.pill,
    backgroundColor:
      Colors.glassStrong,
  },

  progressFill: {
    height: "100%",
    borderRadius: Radius.pill,
    backgroundColor: Colors.primary,
  },

  completionChecks: {
    width: "100%",
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },

  completionCheck: {
    width: "48%",
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: Spacing.sm,
  },

  checkCircle: {
    width: 22,
    height: 22,
    flexShrink: 0,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.glass,
    borderWidth:
      StyleSheet.hairlineWidth,
    borderColor: Colors.border,
  },

  checkCircleCompleted: {
    backgroundColor: Colors.success,
    borderColor: Colors.success,
  },

  completionCheckText: {
    ...Typography.captionStyle,
    color: Colors.textTertiary,
    textAlign: "right",
    writingDirection: "rtl",
  },

  completionCheckTextCompleted: {
    color: Colors.textSecondary,
  },

  availabilityCard: {
    width: "100%",
    marginTop: Spacing.lg,
  },

  availabilityContent: {
    minHeight: 104,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: Spacing.md,
    padding: Spacing.lg,
  },

  availabilityIcon: {
    width: 48,
    height: 48,
    flexShrink: 0,
    borderRadius: Radius.lg,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.glassStrong,
  },

  availabilityIconActive: {
    backgroundColor: Colors.warning,
  },

  availabilityCopy: {
    flex: 1,
    alignItems: "flex-end",
    gap: 3,
  },

  availabilityTitle: {
    ...Typography.label,
    width: "100%",
    color: Colors.textPrimary,
    textAlign: "right",
    writingDirection: "rtl",
  },

  availabilitySubtitle: {
    ...Typography.captionStyle,
    width: "100%",
    color: Colors.textSecondary,
    textAlign: "right",
    writingDirection: "rtl",
    lineHeight: 19,
  },

  switchPressable: {
    minWidth: 50,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
  },

  switchTrack: {
    width: 48,
    height: 28,
    paddingHorizontal: 3,
    borderRadius: Radius.pill,
    justifyContent: "center",
    backgroundColor:
      Colors.glassStrong,
    borderWidth:
      StyleSheet.hairlineWidth,
    borderColor: Colors.borderStrong,
  },

  switchTrackSelected: {
    backgroundColor: Colors.warning,
    borderColor: Colors.warning,
  },

  switchThumb: {
    width: 22,
    height: 22,
    borderRadius: Radius.pill,
    backgroundColor:
      Colors.textTertiary,
  },

  switchThumbSelected: {
    alignSelf: "flex-end",
    backgroundColor: Colors.white,
  },

  section: {
    width: "100%",
    marginTop: Spacing.section,
    gap: Spacing.md,
  },

  sectionHeader: {
    width: "100%",
    alignItems: "flex-end",
    gap: 2,
  },

  sectionTitle: {
    ...Typography.sectionTitle,
    width: "100%",
    color: Colors.textPrimary,
    textAlign: "right",
    writingDirection: "rtl",
    fontSize: 21,
  },

  sectionSubtitle: {
    ...Typography.captionStyle,
    width: "100%",
    color: Colors.textTertiary,
    textAlign: "right",
    writingDirection: "rtl",
  },

  menuCard: {
    width: "100%",
  },

  menuContent: {
    paddingHorizontal: Spacing.md,
  },

  menuRow: {
    width: "100%",
    minHeight: 84,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: Spacing.md,
    paddingVertical: Spacing.md,
  },

  menuRowPressed: {
    opacity: 0.72,
  },

  menuIcon: {
    width: 44,
    height: 44,
    flexShrink: 0,
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      Colors.primarySoft,
  },

  menuCopy: {
    flex: 1,
    alignItems: "flex-end",
    gap: 3,
  },

  menuTitle: {
    ...Typography.label,
    width: "100%",
    color: Colors.textPrimary,
    textAlign: "right",
    writingDirection: "rtl",
    fontSize: 16,
  },

  menuSubtitle: {
    ...Typography.captionStyle,
    width: "100%",
    color: Colors.textTertiary,
    textAlign: "right",
    writingDirection: "rtl",
    lineHeight: 18,
  },

  menuBadge: {
    flexShrink: 0,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 5,
    borderRadius: Radius.pill,
    backgroundColor:
      Colors.primarySoft,
  },

  menuBadgeText: {
    ...Typography.captionStyle,
    color: Colors.primary,
    fontSize: 9,
    writingDirection: "rtl",
  },

  divider: {
    width: "100%",
    height:
      StyleSheet.hairlineWidth,
    backgroundColor: Colors.separator,
  },

  accountStatusCard: {
    width: "100%",
    marginTop: Spacing.section,
    borderColor:
      "rgba(48, 183, 106, 0.26)",
    backgroundColor:
      "rgba(48, 183, 106, 0.05)",
  },

  accountStatusContent: {
    minHeight: 96,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: Spacing.md,
    padding: Spacing.lg,
  },

  accountStatusIcon: {
    width: 48,
    height: 48,
    flexShrink: 0,
    borderRadius: Radius.lg,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      "rgba(48, 183, 106, 0.11)",
  },

  accountStatusCopy: {
    flex: 1,
    alignItems: "flex-end",
    gap: 3,
  },

  accountStatusTitle: {
    ...Typography.label,
    width: "100%",
    color: Colors.textPrimary,
    textAlign: "right",
    writingDirection: "rtl",
  },

  accountStatusSubtitle: {
    ...Typography.captionStyle,
    width: "100%",
    color: Colors.textSecondary,
    textAlign: "right",
    writingDirection: "rtl",
    lineHeight: 19,
  },

  logoutButton: {
    width: "100%",
    marginTop: Spacing.section,
  },

  versionText: {
    ...Typography.captionStyle,
    width: "100%",
    marginTop: Spacing.lg,
    color: Colors.textMuted,
    textAlign: "center",
    writingDirection: "rtl",
  },

  pressed: {
    opacity: 0.82,
  },
});