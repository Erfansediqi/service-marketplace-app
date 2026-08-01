import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ComponentProps, useMemo, useState } from "react";
import {
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { useSession } from "../../context/session-context";

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
    BookingRecord,
    useBooking,
} from "../../context/booking-context";
import { getProviderById } from "../../data/providers";

type IconName =
  ComponentProps<typeof Ionicons>["name"];

type DashboardAction = {
  id: string;
  title: string;
  subtitle: string;
  icon: IconName;
  route:
    | "/(provider-tabs)/requests"
    | "/(provider-tabs)/calendar"
    | "/(provider-tabs)/messages"
    | "/(provider-tabs)/profile";
};

const quickActions: DashboardAction[] = [
  {
    id: "requests",
    title: "درخواست‌ها",
    subtitle: "بررسی کارهای جدید",
    icon: "briefcase-outline",
    route: "/(provider-tabs)/requests",
  },
  {
    id: "calendar",
    title: "تقویم کاری",
    subtitle: "مدیریت برنامه",
    icon: "calendar-outline",
    route: "/(provider-tabs)/calendar",
  },
  {
    id: "messages",
    title: "پیام‌ها",
    subtitle: "گفتگو با مشتریان",
    icon: "chatbubble-outline",
    route: "/(provider-tabs)/messages",
  },
  {
    id: "profile",
    title: "پروفایل حرفه‌ای",
    subtitle: "خدمات و معلومات",
    icon: "person-outline",
    route: "/(provider-tabs)/profile",
  },
];

export default function ProviderDashboardScreen() {
  const router = useRouter();
  const { bookings } = useBooking();

  const { activeProviderId } = useSession();

  const providerId =
    activeProviderId ?? "provider-1";

  const [availableNow, setAvailableNow] =
    useState(true);

  const provider = useMemo(
    () =>
      getProviderById(providerId) ??
      getProviderById("provider-1")!,
    [providerId],
  );

  const providerBookings = useMemo(
    () =>
      bookings.filter(
        (booking) =>
          booking.providerId === provider.id,
      ),
    [bookings, provider.id],
  );

  const pendingBookings = useMemo(
    () =>
      providerBookings.filter(
        (booking) =>
          booking.status === "pending",
      ),
    [providerBookings],
  );

  const activeBookings = useMemo(
    () =>
      providerBookings.filter(
        (booking) =>
          booking.status === "confirmed" ||
          booking.status === "in-progress",
      ),
    [providerBookings],
  );

  const completedBookings = useMemo(
    () =>
      providerBookings.filter(
        (booking) =>
          booking.status === "completed",
      ),
    [providerBookings],
  );

  const todayBookings = useMemo(() => {
    const todayId = formatDateId(new Date());

    return providerBookings
      .filter(
        (booking) =>
          booking.date === todayId &&
          booking.status !== "cancelled",
      )
      .sort((first, second) =>
        first.time.localeCompare(second.time),
      );
  }, [providerBookings]);

  const upcomingBookings = useMemo(
    () =>
      providerBookings
        .filter(
          (booking) =>
            booking.status === "confirmed" ||
            booking.status === "pending",
        )
        .sort((first, second) =>
          `${first.date}-${first.time}`.localeCompare(
            `${second.date}-${second.time}`,
          ),
        )
        .slice(0, 3),
    [providerBookings],
  );

  const completedRevenue = useMemo(
    () =>
      completedBookings.reduce(
        (total, booking) =>
          total + booking.servicePrice,
        0,
      ),
    [completedBookings],
  );

  const todayRevenue = useMemo(
    () =>
      todayBookings
        .filter(
          (booking) =>
            booking.status === "completed",
        )
        .reduce(
          (total, booking) =>
            total + booking.servicePrice,
          0,
        ),
    [todayBookings],
  );

  const openRoute = (
    route: DashboardAction["route"],
  ) => {
    router.push(route);
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
          <View style={styles.headerTopRow}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="اعلان‌ها"
              onPress={() => {
                console.log(
                  "Open provider notifications",
                );
              }}
              style={({ pressed }) => [
                styles.notificationPressable,
                pressed && styles.pressed,
              ]}
            >
              <GlassSurface
                variant="regular"
                radius={Radius.pill}
                style={
                  styles.notificationSurface
                }
                contentStyle={
                  styles.notificationContent
                }
              >
                <Ionicons
                  name="notifications-outline"
                  size={22}
                  color={Colors.textSecondary}
                />

                {pendingBookings.length > 0 ? (
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
                      {toDariDigits(
                        pendingBookings.length.toString(),
                      )}
                    </Text>
                  </View>
                ) : null}
              </GlassSurface>
            </Pressable>

            <View style={styles.headerCopy}>
              <Text style={styles.eyebrow}>
                پنل ارائه‌دهنده
              </Text>

              <Text style={styles.title}>
                سلام، {provider.name}
              </Text>

              <Text style={styles.subtitle}>
                کارها، درخواست‌ها و برنامهٔ امروز
                خود را مدیریت کنید.
              </Text>
            </View>
          </View>
        </View>

        <GlassSurface
          variant="prominent"
          radius={Radius.xl}
          style={[
            styles.availabilityCard,
            Shadows.small,
          ]}
          contentStyle={
            styles.availabilityContent
          }
        >
          <View
            style={[
              styles.availabilityIcon,
              availableNow &&
                styles.availabilityIconActive,
            ]}
          >
            <Ionicons
              name={
                availableNow
                  ? "radio-outline"
                  : "pause-outline"
              }
              size={24}
              color={
                availableNow
                  ? Colors.white
                  : Colors.textTertiary
              }
            />
          </View>

          <View style={styles.availabilityCopy}>
            <Text
              style={styles.availabilityLabel}
            >
              وضعیت فعلی
            </Text>

            <Text
              style={styles.availabilityTitle}
            >
              {availableNow
                ? "آمادهٔ دریافت کار"
                : "موقتاً در دسترس نیستید"}
            </Text>

            <Text
              style={
                styles.availabilitySubtitle
              }
            >
              {availableNow
                ? "مشتریان می‌توانند شما را در نتایج فعال ببینند."
                : "تا فعال‌سازی دوباره، درخواست جدید دریافت نمی‌کنید."}
            </Text>
          </View>

          <Pressable
            accessibilityRole="switch"
            accessibilityLabel="وضعیت آمادگی"
            accessibilityState={{
              checked: availableNow,
            }}
            onPress={() =>
              setAvailableNow(
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
                availableNow &&
                  styles.switchTrackActive,
              ]}
            >
              <View
                style={[
                  styles.switchThumb,
                  availableNow &&
                    styles.switchThumbActive,
                ]}
              />
            </View>
          </Pressable>
        </GlassSurface>

        <View style={styles.metricsGrid}>
          <MetricCard
            icon="cash-outline"
            label="درآمد امروز"
            value={formatCurrency(todayRevenue)}
            accentColor={Colors.success}
          />

          <MetricCard
            icon="briefcase-outline"
            label="کارهای امروز"
            value={toDariDigits(
              todayBookings.length.toString(),
            )}
            accentColor={Colors.primary}
          />

          <MetricCard
            icon="time-outline"
            label="درخواست جدید"
            value={toDariDigits(
              pendingBookings.length.toString(),
            )}
            accentColor={Colors.warning}
          />

          <MetricCard
            icon="checkmark-circle-outline"
            label="کار تکمیل‌شده"
            value={toDariDigits(
              completedBookings.length.toString(),
            )}
            accentColor={Colors.secondary}
          />
        </View>

        {pendingBookings.length > 0 ? (
          <View style={styles.section}>
            <SectionHeader
              title="درخواست‌های جدید"
              subtitle={`${toDariDigits(
                pendingBookings.length.toString(),
              )} درخواست منتظر پاسخ شما است.`}
              actionLabel="مشاهده همه"
              onPress={() =>
                openRoute(
                  "/(provider-tabs)/requests",
                )
              }
            />

            <View style={styles.requestList}>
              {pendingBookings
                .slice(0, 2)
                .map((booking) => (
                  <NewRequestCard
                    key={booking.id}
                    booking={booking}
                    onPress={() =>
                      openRoute(
                        "/(provider-tabs)/requests",
                      )
                    }
                  />
                ))}
            </View>
          </View>
        ) : (
          <GlassSurface
            variant="regular"
            radius={Radius.xl}
            style={styles.noRequestsCard}
            contentStyle={
              styles.noRequestsContent
            }
          >
            <View style={styles.noRequestsIcon}>
              <Ionicons
                name="checkmark-done-outline"
                size={24}
                color={Colors.success}
              />
            </View>

            <View style={styles.noRequestsCopy}>
              <Text
                style={styles.noRequestsTitle}
              >
                درخواست تازه‌ای ندارید
              </Text>

              <Text
                style={
                  styles.noRequestsSubtitle
                }
              >
                درخواست‌های جدید مشتریان در این
                بخش نمایش داده می‌شوند.
              </Text>
            </View>
          </GlassSurface>
        )}

        <View style={styles.section}>
          <SectionHeader
            title="دسترسی سریع"
            subtitle="ابزارهای اصلی مدیریت کار"
          />

          <View style={styles.quickActionsGrid}>
            {quickActions.map((action) => (
              <QuickActionCard
                key={action.id}
                action={action}
                badgeCount={
                  action.id === "requests"
                    ? pendingBookings.length
                    : action.id === "messages"
                      ? activeBookings.length
                      : 0
                }
                onPress={() =>
                  openRoute(action.route)
                }
              />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <SectionHeader
            title="برنامهٔ آینده"
            subtitle="درخواست‌ها و کارهای نزدیک"
            actionLabel="تقویم"
            onPress={() =>
              openRoute(
                "/(provider-tabs)/calendar",
              )
            }
          />

          <View style={styles.upcomingList}>
            {upcomingBookings.length > 0 ? (
              upcomingBookings.map(
                (booking) => (
                  <UpcomingJobCard
                    key={booking.id}
                    booking={booking}
                  />
                ),
              )
            ) : (
              <EmptyUpcoming />
            )}
          </View>
        </View>

        <View style={styles.section}>
          <SectionHeader
            title="عملکرد شما"
            subtitle="خلاصهٔ فعالیت حساب حرفه‌ای"
          />

          <GlassSurface
            variant="regular"
            radius={Radius.xl}
            style={styles.performanceCard}
            contentStyle={
              styles.performanceContent
            }
          >
            <PerformanceRow
              icon="star-outline"
              label="امتیاز مشتریان"
              value={`${toDariDigits(
                provider.rating.toFixed(1),
              )} از ۵`}
            />

            <View
              style={styles.performanceDivider}
            />

            <PerformanceRow
              icon="chatbubble-ellipses-outline"
              label="میانگین زمان پاسخ"
              value={`${toDariDigits(
                provider.averageResponseMinutes.toString(),
              )} دقیقه`}
            />

            <View
              style={styles.performanceDivider}
            />

            <PerformanceRow
              icon="stats-chart-outline"
              label="نرخ پاسخ‌گویی"
              value={`${toDariDigits(
                provider.responseRate.toString(),
              )}٪`}
            />

            <View
              style={styles.performanceDivider}
            />

            <PerformanceRow
              icon="wallet-outline"
              label="مجموع درآمد ثبت‌شده"
              value={formatCurrency(
                completedRevenue,
              )}
            />
          </GlassSurface>
        </View>

        <GlassSurface
          variant="regular"
          radius={Radius.xl}
          style={styles.tipCard}
          contentStyle={styles.tipContent}
        >
          <View style={styles.tipIcon}>
            <Ionicons
              name="bulb-outline"
              size={24}
              color={Colors.warning}
            />
          </View>

          <View style={styles.tipCopy}>
            <Text style={styles.tipTitle}>
              پروفایل کامل، درخواست بیشتر
            </Text>

            <Text style={styles.tipSubtitle}>
              افزودن نمونه‌کار، توضیحات دقیق و
              قیمت روشن می‌تواند اعتماد مشتریان
              را افزایش دهد.
            </Text>
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={() =>
              openRoute(
                "/(provider-tabs)/profile",
              )
            }
            style={({ pressed }) => [
              styles.tipAction,
              pressed && styles.pressed,
            ]}
          >
            <Ionicons
              name="chevron-back"
              size={20}
              color={Colors.primary}
            />
          </Pressable>
        </GlassSurface>
      </ScrollView>
    </SafeAreaView>
  );
}

function MetricCard({
  icon,
  label,
  value,
  accentColor,
}: {
  icon: IconName;
  label: string;
  value: string;
  accentColor: string;
}) {
  return (
    <GlassSurface
      variant="regular"
      radius={Radius.xl}
      style={styles.metricCard}
      contentStyle={styles.metricContent}
    >
      <View
        style={[
          styles.metricIcon,
          {
            backgroundColor: `${accentColor}18`,
          },
        ]}
      >
        <Ionicons
          name={icon}
          size={21}
          color={accentColor}
        />
      </View>

      <Text
        numberOfLines={1}
        adjustsFontSizeToFit
        style={styles.metricValue}
      >
        {value}
      </Text>

      <Text style={styles.metricLabel}>
        {label}
      </Text>
    </GlassSurface>
  );
}

function SectionHeader({
  title,
  subtitle,
  actionLabel,
  onPress,
}: {
  title: string;
  subtitle: string;
  actionLabel?: string;
  onPress?: () => void;
}) {
  return (
    <View style={styles.sectionHeader}>
      {actionLabel && onPress ? (
        <Pressable
          accessibilityRole="button"
          onPress={onPress}
          style={({ pressed }) => [
            styles.sectionAction,
            pressed && styles.pressed,
          ]}
        >
          <Ionicons
            name="chevron-back"
            size={16}
            color={Colors.primary}
          />

          <Text
            style={styles.sectionActionText}
          >
            {actionLabel}
          </Text>
        </Pressable>
      ) : (
        <View />
      )}

      <View style={styles.sectionHeaderCopy}>
        <Text style={styles.sectionTitle}>
          {title}
        </Text>

        <Text
          style={styles.sectionSubtitle}
        >
          {subtitle}
        </Text>
      </View>
    </View>
  );
}

function NewRequestCard({
  booking,
  onPress,
}: {
  booking: BookingRecord;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={
        booking.serviceName
      }
      onPress={onPress}
      style={({ pressed }) => [
        styles.requestPressable,
        pressed && styles.cardPressed,
      ]}
    >
      <GlassSurface
        variant="prominent"
        radius={Radius.xl}
        style={styles.requestCard}
        contentStyle={styles.requestContent}
      >
        <View style={styles.requestIcon}>
          <Ionicons
            name={getServiceIcon(
              booking.serviceId,
            )}
            size={24}
            color={Colors.primary}
          />
        </View>

        <View style={styles.requestCopy}>
          <Text style={styles.requestEyebrow}>
            درخواست تازه
          </Text>

          <Text
            numberOfLines={1}
            style={styles.requestTitle}
          >
            {booking.serviceName}
          </Text>

          <View style={styles.requestMetaRow}>
            <RequestMeta
              icon="calendar-outline"
              value={formatShortDate(
                booking.date,
              )}
            />

            <RequestMeta
              icon="time-outline"
              value={formatTimeForDari(
                booking.time,
              )}
            />
          </View>

          <Text
            numberOfLines={1}
            style={styles.requestAddress}
          >
            {booking.address.fullAddress}
          </Text>
        </View>

        <View style={styles.requestPrice}>
          <Text
            style={styles.requestPriceLabel}
          >
            تخمینی
          </Text>

          <Text
            style={styles.requestPriceValue}
          >
            {formatCurrency(
              booking.servicePrice,
            )}
          </Text>
        </View>
      </GlassSurface>
    </Pressable>
  );
}

function RequestMeta({
  icon,
  value,
}: {
  icon: IconName;
  value: string;
}) {
  return (
    <View style={styles.requestMeta}>
      <Ionicons
        name={icon}
        size={13}
        color={Colors.textTertiary}
      />

      <Text style={styles.requestMetaText}>
        {value}
      </Text>
    </View>
  );
}

function QuickActionCard({
  action,
  badgeCount,
  onPress,
}: {
  action: DashboardAction;
  badgeCount: number;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={action.title}
      onPress={onPress}
      style={({ pressed }) => [
        styles.quickActionPressable,
        pressed && styles.cardPressed,
      ]}
    >
      <GlassSurface
        variant="regular"
        radius={Radius.xl}
        style={styles.quickActionCard}
        contentStyle={
          styles.quickActionContent
        }
      >
        <View style={styles.quickActionIcon}>
          <Ionicons
            name={action.icon}
            size={23}
            color={Colors.primary}
          />

          {badgeCount > 0 ? (
            <View
              style={styles.quickActionBadge}
            >
              <Text
                style={
                  styles.quickActionBadgeText
                }
              >
                {toDariDigits(
                  badgeCount.toString(),
                )}
              </Text>
            </View>
          ) : null}
        </View>

        <Text style={styles.quickActionTitle}>
          {action.title}
        </Text>

        <Text
          style={styles.quickActionSubtitle}
        >
          {action.subtitle}
        </Text>
      </GlassSurface>
    </Pressable>
  );
}

function UpcomingJobCard({
  booking,
}: {
  booking: BookingRecord;
}) {
  const status =
    booking.status === "confirmed"
      ? {
          label: "تأییدشده",
          color: Colors.success,
          background:
            "rgba(48, 183, 106, 0.11)",
        }
      : {
          label: "در انتظار",
          color: Colors.warning,
          background:
            "rgba(217, 154, 43, 0.11)",
        };

  return (
    <GlassSurface
      variant="regular"
      radius={Radius.xl}
      style={styles.upcomingCard}
      contentStyle={styles.upcomingContent}
    >
      <View style={styles.upcomingDate}>
        <Text style={styles.upcomingDay}>
          {getDayNumber(booking.date)}
        </Text>

        <Text style={styles.upcomingMonth}>
          {getMonthLabel(booking.date)}
        </Text>
      </View>

      <View style={styles.upcomingCopy}>
        <Text
          numberOfLines={1}
          style={styles.upcomingTitle}
        >
          {booking.serviceName}
        </Text>

        <Text
          numberOfLines={1}
          style={styles.upcomingCustomer}
        >
          مشتری · {booking.address.label}
        </Text>

        <View style={styles.upcomingMeta}>
          <Ionicons
            name="time-outline"
            size={14}
            color={Colors.textTertiary}
          />

          <Text
            style={styles.upcomingMetaText}
          >
            {formatTimeForDari(
              booking.time,
            )}
          </Text>
        </View>
      </View>

      <View
        style={[
          styles.upcomingStatus,
          {
            backgroundColor:
              status.background,
          },
        ]}
      >
        <Text
          style={[
            styles.upcomingStatusText,
            {
              color: status.color,
            },
          ]}
        >
          {status.label}
        </Text>
      </View>
    </GlassSurface>
  );
}

function EmptyUpcoming() {
  return (
    <GlassSurface
      variant="regular"
      radius={Radius.xl}
      style={styles.emptyUpcomingCard}
      contentStyle={
        styles.emptyUpcomingContent
      }
    >
      <View style={styles.emptyUpcomingIcon}>
        <Ionicons
          name="calendar-clear-outline"
          size={28}
          color={Colors.textTertiary}
        />
      </View>

      <Text style={styles.emptyUpcomingTitle}>
        برنامه‌ای ثبت نشده است
      </Text>

      <Text
        style={styles.emptyUpcomingSubtitle}
      >
        درخواست‌های پذیرفته‌شده و آینده در این
        بخش نمایش داده می‌شوند.
      </Text>
    </GlassSurface>
  );
}

function PerformanceRow({
  icon,
  label,
  value,
}: {
  icon: IconName;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.performanceRow}>
      <View style={styles.performanceIcon}>
        <Ionicons
          name={icon}
          size={19}
          color={Colors.primary}
        />
      </View>

      <View style={styles.performanceCopy}>
        <Text
          style={styles.performanceLabel}
        >
          {label}
        </Text>

        <Text
          style={styles.performanceValue}
        >
          {value}
        </Text>
      </View>
    </View>
  );
}

function getServiceIcon(
  serviceId: string,
): IconName {
  if (
    serviceId.includes("wiring") ||
    serviceId.includes("socket") ||
    serviceId.includes("lighting") ||
    serviceId.includes("breaker") ||
    serviceId.includes("generator")
  ) {
    return "flash-outline";
  }

  if (
    serviceId.includes("pipe") ||
    serviceId.includes("drain") ||
    serviceId.includes("water") ||
    serviceId.includes("heater")
  ) {
    return "water-outline";
  }

  if (serviceId.includes("clean")) {
    return "sparkles-outline";
  }

  if (
    serviceId.includes("computer") ||
    serviceId.includes("hardware") ||
    serviceId.includes("virus")
  ) {
    return "laptop-outline";
  }

  if (
    serviceId.includes("cabinet") ||
    serviceId.includes("door") ||
    serviceId.includes("furniture")
  ) {
    return "hammer-outline";
  }

  return "construct-outline";
}

function formatDateId(date: Date): string {
  const year = date.getFullYear();

  const month = String(
    date.getMonth() + 1,
  ).padStart(2, "0");

  const day = String(
    date.getDate(),
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatShortDate(
  value: string,
): string {
  if (!value) {
    return "نامشخص";
  }

  const parts = value
    .split("-")
    .map(Number);

  const year = parts[0];
  const month = parts[1];
  const day = parts[2];

  if (!year || !month || !day) {
    return value;
  }

  const date = new Date(
    year,
    month - 1,
    day,
  );

  const weekdays = [
    "یک‌شنبه",
    "دوشنبه",
    "سه‌شنبه",
    "چهارشنبه",
    "پنج‌شنبه",
    "جمعه",
    "شنبه",
  ];

  return `${weekdays[date.getDay()] ?? ""}، ${toDariDigits(
    day.toString(),
  )} ${getMonthLabel(value)}`;
}

function getDayNumber(
  value: string,
): string {
  const day = value.split("-")[2];

  return day
    ? toDariDigits(
        Number(day).toString(),
      )
    : "—";
}

function getMonthLabel(
  value: string,
): string {
  const month = Number(
    value.split("-")[1],
  );

  const months = [
    "جنوری",
    "فبروری",
    "مارچ",
    "اپریل",
    "می",
    "جون",
    "جولای",
    "اگست",
    "سپتمبر",
    "اکتوبر",
    "نوامبر",
    "دسمبر",
  ];

  return months[month - 1] ?? "";
}

function formatTimeForDari(
  value: string,
): string {
  const labels: Record<string, string> = {
    "07:00": "۷:۰۰ صبح",
    "08:00": "۸:۰۰ صبح",
    "09:00": "۹:۰۰ صبح",
    "10:00": "۱۰:۰۰ صبح",
    "11:00": "۱۱:۰۰ صبح",
    "12:00": "۱۲:۰۰ ظهر",
    "13:00": "۱:۰۰ بعد از ظهر",
    "14:00": "۲:۰۰ بعد از ظهر",
    "15:00": "۳:۰۰ بعد از ظهر",
    "16:00": "۴:۰۰ بعد از ظهر",
    "17:00": "۵:۰۰ بعد از ظهر",
    "18:00": "۶:۰۰ عصر",
  };

  return labels[value] ?? value;
}

function formatCurrency(
  value: number,
): string {
  return `${new Intl.NumberFormat(
    "fa-AF",
  ).format(value)} افغانی`;
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
  },

  headerTopRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: Spacing.md,
  },

  headerCopy: {
    flex: 1,
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

  notificationPressable: {
    width: 48,
    height: 48,
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

  notificationBadge: {
    position: "absolute",
    top: 3,
    right: 3,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.error,
    borderWidth: 2,
    borderColor: Colors.backgroundRaised,
  },

  notificationBadgeText: {
    color: Colors.white,
    fontSize: 9,
    fontWeight: "700",
  },

  availabilityCard: {
    width: "100%",
    marginTop: Spacing.xxl,
  },

  availabilityContent: {
    minHeight: 116,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: Spacing.md,
    padding: Spacing.lg,
  },

  availabilityIcon: {
    width: 52,
    height: 52,
    flexShrink: 0,
    borderRadius: Radius.lg,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.glassStrong,
  },

  availabilityIconActive: {
    backgroundColor: Colors.success,
  },

  availabilityCopy: {
    flex: 1,
    alignItems: "flex-end",
    gap: 3,
  },

  availabilityLabel: {
    ...Typography.captionStyle,
    width: "100%",
    color: Colors.primary,
    textAlign: "right",
    writingDirection: "rtl",
  },

  availabilityTitle: {
    ...Typography.label,
    width: "100%",
    color: Colors.textPrimary,
    textAlign: "right",
    writingDirection: "rtl",
    fontSize: 17,
    lineHeight: 23,
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
    minWidth: 48,
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
    backgroundColor: Colors.glassStrong,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.borderStrong,
  },

  switchTrackActive: {
    backgroundColor: Colors.success,
    borderColor: Colors.success,
  },

  switchThumb: {
    width: 22,
    height: 22,
    borderRadius: Radius.pill,
    backgroundColor: Colors.textTertiary,
  },

  switchThumbActive: {
    alignSelf: "flex-end",
    backgroundColor: Colors.white,
  },

  metricsGrid: {
    width: "100%",
    marginTop: Spacing.lg,
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: Spacing.sm,
  },

  metricCard: {
    width: "48.5%",
  },

  metricContent: {
    minHeight: 132,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    padding: Spacing.md,
  },

  metricIcon: {
    width: 42,
    height: 42,
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
  },

  metricValue: {
    ...Typography.sectionTitle,
    width: "100%",
    color: Colors.textPrimary,
    textAlign: "center",
    writingDirection: "rtl",
    fontSize: 19,
    lineHeight: 26,
  },

  metricLabel: {
    ...Typography.captionStyle,
    width: "100%",
    color: Colors.textTertiary,
    textAlign: "center",
    writingDirection: "rtl",
  },

  section: {
    width: "100%",
    marginTop: Spacing.section,
    gap: Spacing.lg,
  },

  sectionHeader: {
    width: "100%",
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: Spacing.md,
  },

  sectionHeaderCopy: {
    flex: 1,
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
    lineHeight: 28,
  },

  sectionSubtitle: {
    ...Typography.captionStyle,
    width: "100%",
    color: Colors.textTertiary,
    textAlign: "right",
    writingDirection: "rtl",
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

  requestList: {
    width: "100%",
    gap: Spacing.md,
  },

  requestPressable: {
    width: "100%",
    borderRadius: Radius.xl,
  },

  requestCard: {
    width: "100%",
    borderColor: "rgba(217, 154, 43, 0.28)",
    backgroundColor: "rgba(217, 154, 43, 0.05)",
  },

  requestContent: {
    minHeight: 126,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: Spacing.md,
    padding: Spacing.lg,
  },

  requestIcon: {
    width: 52,
    height: 52,
    flexShrink: 0,
    borderRadius: Radius.lg,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primarySoft,
  },

  requestCopy: {
    flex: 1,
    alignItems: "flex-end",
    gap: 4,
  },

  requestEyebrow: {
    ...Typography.captionStyle,
    width: "100%",
    color: Colors.warning,
    textAlign: "right",
    writingDirection: "rtl",
  },

  requestTitle: {
    ...Typography.label,
    width: "100%",
    color: Colors.textPrimary,
    textAlign: "right",
    writingDirection: "rtl",
    fontSize: 17,
  },

  requestMetaRow: {
    width: "100%",
    flexDirection: "row-reverse",
    alignItems: "center",
    flexWrap: "wrap",
    gap: Spacing.md,
  },

  requestMeta: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 4,
  },

  requestMetaText: {
    ...Typography.captionStyle,
    color: Colors.textTertiary,
    writingDirection: "rtl",
    fontSize: 11,
  },

  requestAddress: {
    ...Typography.captionStyle,
    width: "100%",
    color: Colors.textSecondary,
    textAlign: "right",
    writingDirection: "rtl",
  },

  requestPrice: {
    flexShrink: 0,
    alignItems: "flex-start",
    gap: 3,
  },

  requestPriceLabel: {
    ...Typography.captionStyle,
    color: Colors.textTertiary,
    writingDirection: "rtl",
    fontSize: 10,
  },

  requestPriceValue: {
    ...Typography.label,
    color: Colors.primary,
    textAlign: "left",
    writingDirection: "rtl",
    fontSize: 14,
  },

  noRequestsCard: {
    width: "100%",
    marginTop: Spacing.section,
  },

  noRequestsContent: {
    minHeight: 102,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: Spacing.md,
    padding: Spacing.lg,
  },

  noRequestsIcon: {
    width: 48,
    height: 48,
    flexShrink: 0,
    borderRadius: Radius.lg,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(48, 183, 106, 0.11)",
  },

  noRequestsCopy: {
    flex: 1,
    alignItems: "flex-end",
    gap: 3,
  },

  noRequestsTitle: {
    ...Typography.label,
    width: "100%",
    color: Colors.textPrimary,
    textAlign: "right",
    writingDirection: "rtl",
  },

  noRequestsSubtitle: {
    ...Typography.captionStyle,
    width: "100%",
    color: Colors.textSecondary,
    textAlign: "right",
    writingDirection: "rtl",
  },

  quickActionsGrid: {
    width: "100%",
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: Spacing.sm,
  },

  quickActionPressable: {
    width: "48.5%",
    borderRadius: Radius.xl,
  },

  quickActionCard: {
    width: "100%",
  },

  quickActionContent: {
    minHeight: 142,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    padding: Spacing.md,
  },

  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: Radius.lg,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primarySoft,
  },

  quickActionBadge: {
    position: "absolute",
    top: -5,
    right: -5,
    minWidth: 21,
    height: 21,
    paddingHorizontal: 5,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.error,
    borderWidth: 2,
    borderColor: Colors.backgroundRaised,
  },

  quickActionBadgeText: {
    color: Colors.white,
    fontSize: 9,
    fontWeight: "700",
  },

  quickActionTitle: {
    ...Typography.label,
    width: "100%",
    color: Colors.textPrimary,
    textAlign: "center",
    writingDirection: "rtl",
  },

  quickActionSubtitle: {
    ...Typography.captionStyle,
    width: "100%",
    color: Colors.textTertiary,
    textAlign: "center",
    writingDirection: "rtl",
  },

  upcomingList: {
    width: "100%",
    gap: Spacing.md,
  },

  upcomingCard: {
    width: "100%",
  },

  upcomingContent: {
    minHeight: 110,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: Spacing.md,
    padding: Spacing.lg,
  },

  upcomingDate: {
    width: 54,
    height: 62,
    flexShrink: 0,
    borderRadius: Radius.lg,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primarySoft,
  },

  upcomingDay: {
    color: Colors.primary,
    fontSize: 21,
    lineHeight: 25,
    fontWeight: "700",
  },

  upcomingMonth: {
    ...Typography.captionStyle,
    color: Colors.textSecondary,
    fontSize: 10,
    writingDirection: "rtl",
  },

  upcomingCopy: {
    flex: 1,
    alignItems: "flex-end",
    gap: 3,
  },

  upcomingTitle: {
    ...Typography.label,
    width: "100%",
    color: Colors.textPrimary,
    textAlign: "right",
    writingDirection: "rtl",
    fontSize: 16,
  },

  upcomingCustomer: {
    ...Typography.captionStyle,
    width: "100%",
    color: Colors.textSecondary,
    textAlign: "right",
    writingDirection: "rtl",
  },

  upcomingMeta: {
    width: "100%",
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 4,
  },

  upcomingMetaText: {
    ...Typography.captionStyle,
    color: Colors.textTertiary,
    writingDirection: "rtl",
  },

  upcomingStatus: {
    flexShrink: 0,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: Radius.pill,
  },

  upcomingStatusText: {
    ...Typography.captionStyle,
    fontSize: 10,
    writingDirection: "rtl",
  },

  emptyUpcomingCard: {
    width: "100%",
  },

  emptyUpcomingContent: {
    minHeight: 220,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.md,
    padding: Spacing.xl,
  },

  emptyUpcomingIcon: {
    width: 68,
    height: 68,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.glass,
  },

  emptyUpcomingTitle: {
    ...Typography.sectionTitle,
    color: Colors.textPrimary,
    textAlign: "center",
    writingDirection: "rtl",
    fontSize: 18,
  },

  emptyUpcomingSubtitle: {
    ...Typography.bodyStyle,
    maxWidth: 330,
    color: Colors.textSecondary,
    textAlign: "center",
    writingDirection: "rtl",
  },

  performanceCard: {
    width: "100%",
  },

  performanceContent: {
    padding: Spacing.lg,
  },

  performanceRow: {
    width: "100%",
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: Spacing.md,
  },

  performanceIcon: {
    width: 42,
    height: 42,
    flexShrink: 0,
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primarySoft,
  },

  performanceCopy: {
    flex: 1,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.md,
  },

  performanceLabel: {
    ...Typography.captionStyle,
    color: Colors.textTertiary,
    textAlign: "right",
    writingDirection: "rtl",
  },

  performanceValue: {
    ...Typography.label,
    flex: 1,
    color: Colors.textPrimary,
    textAlign: "left",
    writingDirection: "rtl",
  },

  performanceDivider: {
    width: "100%",
    height: StyleSheet.hairlineWidth,
    marginVertical: Spacing.md,
    backgroundColor: Colors.separator,
  },

  tipCard: {
    width: "100%",
    marginTop: Spacing.section,
    borderColor: "rgba(217, 154, 43, 0.25)",
    backgroundColor: "rgba(217, 154, 43, 0.05)",
  },

  tipContent: {
    minHeight: 106,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: Spacing.md,
    padding: Spacing.lg,
  },

  tipIcon: {
    width: 48,
    height: 48,
    flexShrink: 0,
    borderRadius: Radius.lg,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(217, 154, 43, 0.11)",
  },

  tipCopy: {
    flex: 1,
    alignItems: "flex-end",
    gap: 3,
  },

  tipTitle: {
    ...Typography.label,
    width: "100%",
    color: Colors.textPrimary,
    textAlign: "right",
    writingDirection: "rtl",
  },

  tipSubtitle: {
    ...Typography.captionStyle,
    width: "100%",
    color: Colors.textSecondary,
    textAlign: "right",
    writingDirection: "rtl",
    lineHeight: 19,
  },

  tipAction: {
    width: 38,
    height: 38,
    flexShrink: 0,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primarySoft,
  },

  pressed: {
    opacity: 0.82,
  },

  cardPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.993 }],
  },
});