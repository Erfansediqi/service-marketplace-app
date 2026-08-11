import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import {
  ComponentProps,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Alert,
  Pressable,
  RefreshControl,
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
import { BookingRecord, useBooking } from "../../context/booking-context";
import { useLanguage } from "../../context/languagecontext";
import { useActiveProvider } from "../../hooks/use-active-provider";
import { updateProviderAvailability } from "../../services/provider-repository";

type IconName = ComponentProps<typeof Ionicons>["name"];

type LanguageName = "English" | "Dari" | "Pashto";

type ProviderRoute =
  | "/(provider-tabs)/requests"
  | "/(provider-tabs)/calendar"
  | "/(provider-tabs)/messages"
  | "/(provider-tabs)/profile";

const SUCCESS = "#268A57";
const SUCCESS_SOFT = "#E8F6EE";

const WARNING = "#9A6500";
const WARNING_SOFT = "#FFF4D6";

const ERROR = "#B3261E";
const ERROR_SOFT = "#FCE8E6";

const INFO_SOFT = "#E5F4F8";

export default function ProviderDashboardScreen() {
  const router = useRouter();

  const { width } = useWindowDimensions();

  const { bookings, isRefreshing, refreshBookings } = useBooking();

  const { language, t } = useLanguage();

  const activeLanguage = normalizeLanguage(language);

  const isRtl = activeLanguage === "Dari" || activeLanguage === "Pashto";

  const {
    provider,
    isLoading: providerIsLoading,
    error: providerError,
  } = useActiveProvider();

  const providerId = provider?.id ?? "";

  /*
   * Dashboard statistics are derived from bookings. Refresh the provider
   * booking scope whenever this tab gains focus so request counts, active
   * jobs, today's work and revenue reflect the latest Supabase state.
   */
  useFocusEffect(
    useCallback(() => {
      if (!providerId) {
        return;
      }

      void refreshBookings().catch((refreshError) => {
        console.warn(
          "Could not refresh provider dashboard bookings:",
          refreshError,
        );
      });
    }, [providerId, refreshBookings]),
  );

  const [availableNow, setAvailableNow] = useState(false);

  const [isSavingAvailability, setIsSavingAvailability] = useState(false);

  useEffect(() => {
    if (!provider) {
      return;
    }

    setAvailableNow(provider.availableToday);
  }, [provider?.id, provider?.availableToday]);

  const handleAvailabilityToggle = async (): Promise<void> => {
    if (!provider || isSavingAvailability) {
      return;
    }

    const previousValue = availableNow;
    const nextValue = !previousValue;

    setAvailableNow(nextValue);
    setIsSavingAvailability(true);

    try {
      await updateProviderAvailability(provider.id, {
        availableToday: nextValue,
      });
    } catch (error) {
      console.error("Failed to update provider availability:", error);

      setAvailableNow(previousValue);

      Alert.alert(
        t("providerDashboardAvailabilityErrorTitle"),
        t("providerDashboardAvailabilityErrorMessage"),
      );
    } finally {
      setIsSavingAvailability(false);
    }
  };

  const providerBookings = useMemo(
    () => bookings.filter((booking) => booking.providerId === providerId),
    [bookings, providerId],
  );

  const pendingBookings = useMemo(
    () => providerBookings.filter((booking) => booking.status === "pending"),
    [providerBookings],
  );

  const todayBookings = useMemo(() => {
    const todayId = formatDateId(new Date());

    return providerBookings
      .filter(
        (booking) => booking.date === todayId && booking.status !== "cancelled",
      )
      .sort((first, second) => first.time.localeCompare(second.time));
  }, [providerBookings]);

  const upcomingBookings = useMemo(
    () =>
      providerBookings
        .filter(
          (booking) =>
            booking.status === "confirmed" || booking.status === "pending",
        )
        .sort((first, second) =>
          `${first.date}-${first.time}`.localeCompare(
            `${second.date}-${second.time}`,
          ),
        )
        .slice(0, 3),
    [providerBookings],
  );

  const todayRevenue = useMemo(
    () =>
      todayBookings
        .filter((booking) => booking.status === "completed")
        .reduce((total, booking) => total + booking.servicePrice, 0),
    [todayBookings],
  );

  const compactLayout = width < 370;

  const localizedDigits = activeLanguage !== "English";

  const openRoute = (route: ProviderRoute) => {
    router.push(route);
  };

  if (providerIsLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.stateContainer}>
          <Text
            style={[
              styles.stateTitle,
              {
                textAlign: isRtl ? "right" : "left",
              },
            ]}
          >
{t("providerAccountLoading")}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!provider || providerError) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.stateContainer}>
          <Ionicons
            name="alert-circle-outline"
            size={34}
            color={KhedmatPalette.error}
          />

          <Text
            style={[
              styles.stateTitle,
              {
                textAlign: isRtl ? "right" : "left",
              },
            ]}
          >
{t("providerAccountLoadError")}
          </Text>

          <Text
            style={[
              styles.stateBody,
              {
                textAlign: isRtl ? "right" : "left",
              },
            ]}
          >
{t("providerAccountLoadErrorBody")}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => {
              void refreshBookings().catch((refreshError) => {
                console.warn(
                  "Could not refresh provider dashboard bookings:",
                  refreshError,
                );
              });
            }}
            tintColor={KhedmatPalette.blue500}
          />
        }
      >
        <View
          style={[
            styles.topBar,
            {
              flexDirection: isRtl ? "row-reverse" : "row",
            },
          ]}
        >
          <View
            style={[
              styles.identity,
              {
                flexDirection: isRtl ? "row-reverse" : "row",
              },
            ]}
          >
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t("providerDashboardOpenProfile")}
              onPress={() => openRoute("/(provider-tabs)/profile")}
              style={({ pressed }) => [
                styles.providerAvatar,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.providerInitials}>
                {getInitials(provider.name)}
              </Text>

              {provider.verified ? (
                <View style={styles.verifiedBadge}>
                  <Ionicons
                    name="checkmark"
                    size={10}
                    color={KhedmatPalette.white}
                  />
                </View>
              ) : null}
            </Pressable>

            <View
              style={[
                styles.identityCopy,
                {
                  alignItems: isRtl ? "flex-end" : "flex-start",
                },
              ]}
            >
              <Text style={[styles.eyebrow, directionStyle(isRtl)]}>
                {t("providerDashboardEyebrow")}
              </Text>

              <Text
                numberOfLines={1}
                style={[styles.greeting, directionStyle(isRtl)]}
              >
                {t("providerDashboardGreeting")}, {provider.name}
              </Text>
            </View>
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t("providerDashboardNotifications")}
            onPress={() => {
              router.push("/provider-notifications");
            }}
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

            {pendingBookings.length > 0 ? (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>
                  {formatDigits(
                    pendingBookings.length.toString(),
                    localizedDigits,
                  )}
                </Text>
              </View>
            ) : null}
          </Pressable>
        </View>

        <View style={styles.hero}>
          <Text style={[styles.heroTitle, directionStyle(isRtl)]}>
            {t("providerDashboardHeroTitle")}
          </Text>

          <Text style={[styles.heroSubtitle, directionStyle(isRtl)]}>
            {t("providerDashboardHeroSubtitle")}
          </Text>
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
              availableNow
                ? styles.availabilityIconActive
                : styles.availabilityIconInactive,
            ]}
          >
            <Ionicons
              name={availableNow ? "radio-outline" : "pause-outline"}
              size={23}
              color={
                availableNow ? KhedmatPalette.white : KhedmatPalette.textMuted
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
            <Text style={[styles.availabilityLabel, directionStyle(isRtl)]}>
              {t("providerDashboardCurrentStatus")}
            </Text>

            <Text style={[styles.availabilityTitle, directionStyle(isRtl)]}>
              {availableNow ? t("providerDashboardAvailableTitle") : t("providerDashboardUnavailableTitle")}
            </Text>

            <Text style={[styles.availabilitySubtitle, directionStyle(isRtl)]}>
              {availableNow ? t("providerDashboardAvailableSubtitle") : t("providerDashboardUnavailableSubtitle")}
            </Text>
          </View>

          <Pressable
            accessibilityRole="switch"
            accessibilityLabel={t("providerDashboardAvailabilityControl")}
            accessibilityState={{
              checked: availableNow,
              disabled: isSavingAvailability,
            }}
            disabled={isSavingAvailability}
            onPress={() => {
              void handleAvailabilityToggle();
            }}
            style={({ pressed }) => [
              styles.switchPressable,
              isSavingAvailability && {
                opacity: 0.6,
              },
              pressed && styles.pressed,
            ]}
          >
            <View
              style={[
                styles.switchTrack,
                availableNow && styles.switchTrackActive,
              ]}
            >
              <View
                style={[
                  styles.switchThumb,
                  availableNow && {
                    alignSelf: isRtl ? "flex-start" : "flex-end",
                  },
                ]}
              />
            </View>
          </Pressable>
        </View>

        <View style={styles.metricsGrid}>
          <MetricCard
            icon="cash-outline"
            label={t("providerDashboardTodayRevenue")}
            value={formatCurrency(todayRevenue, activeLanguage)}
            iconColor={SUCCESS}
            iconBackground={SUCCESS_SOFT}
            compact={compactLayout}
            isRtl={isRtl}
          />

          <MetricCard
            icon="briefcase-outline"
            label={t("providerDashboardTodayJobs")}
            value={formatDigits(
              todayBookings.length.toString(),
              localizedDigits,
            )}
            iconColor={KhedmatPalette.blue500}
            iconBackground={INFO_SOFT}
            compact={compactLayout}
            isRtl={isRtl}
          />

          <MetricCard
            icon="time-outline"
            label={t("providerDashboardNewRequests")}
            value={formatDigits(
              pendingBookings.length.toString(),
              localizedDigits,
            )}
            iconColor={WARNING}
            iconBackground={WARNING_SOFT}
            compact={compactLayout}
            isRtl={isRtl}
          />

        </View>

        <View style={styles.section}>
          <SectionHeader
            title={t("providerDashboardNewRequestsTitle")}
            subtitle={
              pendingBookings.length > 0
                ? formatDashboardCountMessage(
                    formatDigits(
                      pendingBookings.length.toString(),
                      localizedDigits,
                    ),
                    t("providerDashboardNewRequestsCount"),
                  )
                : t("providerDashboardNoNewRequestsSubtitle")
            }
            actionLabel={pendingBookings.length > 0 ? t("providerDashboardViewAll") : undefined}
            isRtl={isRtl}
            onPress={() => openRoute("/(provider-tabs)/requests")}
          />

          {pendingBookings.length > 0 ? (
            <View style={styles.requestList}>
              {pendingBookings.slice(0, 2).map((booking) => (
                <NewRequestCard
                  key={booking.id}
                  booking={booking}
                  language={activeLanguage}
                  isRtl={isRtl}
                  onPress={() =>
                    router.push({
                      pathname: "/provider-request-details",
                      params: {
                        bookingId: booking.id,
                      },
                    })
                  }
                />
              ))}
            </View>
          ) : (
            <View
              style={[
                styles.emptyRequestCard,
                {
                  flexDirection: isRtl ? "row-reverse" : "row",
                },
              ]}
            >
              <View style={styles.emptyRequestIcon}>
                <Ionicons
                  name="checkmark-done-outline"
                  size={24}
                  color={SUCCESS}
                />
              </View>

              <View
                style={[
                  styles.emptyRequestCopy,
                  {
                    alignItems: isRtl ? "flex-end" : "flex-start",
                  },
                ]}
              >
                <Text style={[styles.emptyRequestTitle, directionStyle(isRtl)]}>
                  {t("providerDashboardNoNewRequestsTitle")}
                </Text>

                <Text
                  style={[styles.emptyRequestSubtitle, directionStyle(isRtl)]}
                >
                  {t("providerDashboardNoNewRequestsSubtitle")}
                </Text>
              </View>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <SectionHeader
            title={t("providerDashboardUpcomingTitle")}
            subtitle={t("providerDashboardUpcomingSubtitle")}
            actionLabel={t("providerDashboardCalendar")}
            isRtl={isRtl}
            onPress={() => openRoute("/(provider-tabs)/calendar")}
          />

          <View style={styles.upcomingList}>
            {upcomingBookings.length > 0 ? (
              upcomingBookings.map((booking) => (
                <UpcomingJobCard
                  key={booking.id}
                  booking={booking}
                  language={activeLanguage}
                  isRtl={isRtl}
                />
              ))
            ) : (
              <EmptyUpcoming isRtl={isRtl} />
            )}
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

type MetricCardProps = {
  icon: IconName;
  label: string;
  value: string;
  iconColor: string;
  iconBackground: string;
  compact: boolean;
  isRtl: boolean;
};

function MetricCard({
  icon,
  label,
  value,
  iconColor,
  iconBackground,
  compact,
  isRtl,
}: MetricCardProps) {
  return (
    <View style={[styles.metricCard, compact && styles.metricCardCompact]}>
      <View
        style={[
          styles.metricIcon,
          {
            backgroundColor: iconBackground,
          },
        ]}
      >
        <Ionicons name={icon} size={21} color={iconColor} />
      </View>

      <Text
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.75}
        style={[styles.metricValue, directionStyle(isRtl)]}
      >
        {value}
      </Text>

      <Text
        numberOfLines={2}
        style={[styles.metricLabel, directionStyle(isRtl)]}
      >
        {label}
      </Text>
    </View>
  );
}

type SectionHeaderProps = {
  title: string;
  subtitle: string;
  actionLabel?: string;
  isRtl: boolean;
  onPress?: () => void;
};

function SectionHeader({
  title,
  subtitle,
  actionLabel,
  isRtl,
  onPress,
}: SectionHeaderProps) {
  return (
    <View
      style={[
        styles.sectionHeader,
        {
          flexDirection: isRtl ? "row-reverse" : "row",
        },
      ]}
    >
      <View
        style={[
          styles.sectionHeaderCopy,
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

      {actionLabel && onPress ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
          onPress={onPress}
          style={({ pressed }) => [
            styles.sectionAction,
            pressed && styles.pressed,
          ]}
        >
          <Text style={[styles.sectionActionText, directionStyle(isRtl)]}>
            {actionLabel}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

type NewRequestCardProps = {
  booking: BookingRecord;
  language: LanguageName;
  isRtl: boolean;
  onPress: () => void;
};

function NewRequestCard({
  booking,
  language,
  isRtl,
  onPress,
}: NewRequestCardProps) {
  const { t } = useLanguage();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={booking.serviceName}
      onPress={onPress}
      style={({ pressed }) => [
        styles.requestCard,
        pressed && styles.cardPressed,
      ]}
    >
      <View
        style={[
          styles.requestTopRow,
          {
            flexDirection: isRtl ? "row-reverse" : "row",
          },
        ]}
      >
        <View style={styles.requestIcon}>
          <Ionicons
            name={getServiceIcon(booking.serviceId)}
            size={23}
            color={KhedmatPalette.blue500}
          />
        </View>

        <View
          style={[
            styles.requestCopy,
            {
              alignItems: isRtl ? "flex-end" : "flex-start",
            },
          ]}
        >
          <Text style={[styles.requestEyebrow, directionStyle(isRtl)]}>
            {t("providerDashboardFreshRequest")}
          </Text>

          <Text
            numberOfLines={2}
            style={[styles.requestTitle, directionStyle(isRtl)]}
          >
            {booking.serviceName}
          </Text>
        </View>

        <View
          style={[
            styles.requestPrice,
            {
              alignItems: isRtl ? "flex-start" : "flex-end",
            },
          ]}
        >
          <Text style={[styles.requestPriceLabel, directionStyle(isRtl)]}>
            {t("providerDashboardEstimated")}
          </Text>

          <Text
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.75}
            style={[styles.requestPriceValue, directionStyle(isRtl)]}
          >
            {formatCurrency(booking.servicePrice, language)}
          </Text>
        </View>
      </View>

      <View
        style={[
          styles.requestMetaRow,
          {
            flexDirection: isRtl ? "row-reverse" : "row",
          },
        ]}
      >
        <RequestMeta
          icon="calendar-outline"
          value={formatShortDate(booking.date, language)}
          isRtl={isRtl}
        />

        <RequestMeta
          icon="time-outline"
          value={formatTime(booking.time, language)}
          isRtl={isRtl}
        />
      </View>

      <View
        style={[
          styles.requestAddressRow,
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
          numberOfLines={2}
          style={[styles.requestAddress, directionStyle(isRtl)]}
        >
          {booking.address.fullAddress}
        </Text>
      </View>
    </Pressable>
  );
}

type RequestMetaProps = {
  icon: IconName;
  value: string;
  isRtl: boolean;
};

function RequestMeta({ icon, value, isRtl }: RequestMetaProps) {
  return (
    <View
      style={[
        styles.requestMeta,
        {
          flexDirection: isRtl ? "row-reverse" : "row",
        },
      ]}
    >
      <Ionicons name={icon} size={14} color={KhedmatPalette.textMuted} />

      <Text style={[styles.requestMetaText, directionStyle(isRtl)]}>
        {value}
      </Text>
    </View>
  );
}

type UpcomingJobCardProps = {
  booking: BookingRecord;
  language: LanguageName;
  isRtl: boolean;
};

function UpcomingJobCard({
  booking,
  language,
  isRtl,
}: UpcomingJobCardProps) {
  const { t } = useLanguage();
  const confirmed = booking.status === "confirmed";

  const statusLabel = confirmed
    ? t("providerDashboardConfirmed")
    : t("providerDashboardPending");

  return (
    <View
      style={[
        styles.upcomingCard,
        {
          flexDirection: isRtl ? "row-reverse" : "row",
        },
      ]}
    >
      <View style={styles.upcomingDate}>
        <Text style={styles.upcomingDay}>
          {getDayNumber(booking.date, language)}
        </Text>

        <Text style={styles.upcomingMonth}>
          {getMonthLabel(booking.date, language)}
        </Text>
      </View>

      <View
        style={[
          styles.upcomingCopy,
          {
            alignItems: isRtl ? "flex-end" : "flex-start",
          },
        ]}
      >
        <Text
          numberOfLines={1}
          style={[styles.upcomingTitle, directionStyle(isRtl)]}
        >
          {booking.serviceName}
        </Text>

        <Text
          numberOfLines={1}
          style={[styles.upcomingCustomer, directionStyle(isRtl)]}
        >
          {t("providerDashboardCustomer")} · {booking.address.label}
        </Text>

        <View
          style={[
            styles.upcomingMeta,
            {
              flexDirection: isRtl ? "row-reverse" : "row",
            },
          ]}
        >
          <Ionicons
            name="time-outline"
            size={14}
            color={KhedmatPalette.textMuted}
          />

          <Text style={[styles.upcomingMetaText, directionStyle(isRtl)]}>
            {formatTime(booking.time, language)}
          </Text>
        </View>
      </View>

      <View
        style={[
          styles.upcomingStatus,
          {
            backgroundColor: confirmed ? SUCCESS_SOFT : WARNING_SOFT,
          },
        ]}
      >
        <Text
          style={[
            styles.upcomingStatusText,
            {
              color: confirmed ? SUCCESS : WARNING,
            },
            directionStyle(isRtl),
          ]}
        >
          {statusLabel}
        </Text>
      </View>
    </View>
  );
}

type EmptyUpcomingProps = {
  isRtl: boolean;
};

function EmptyUpcoming({ isRtl }: EmptyUpcomingProps) {
  const { t } = useLanguage();

  return (
    <View style={styles.emptyUpcomingCard}>
      <View style={styles.emptyUpcomingIcon}>
        <Ionicons
          name="calendar-clear-outline"
          size={29}
          color={KhedmatPalette.blue500}
        />
      </View>

      <Text style={[styles.emptyUpcomingTitle, directionStyle(isRtl)]}>
        {t("providerDashboardNoUpcomingTitle")}
      </Text>

      <Text style={[styles.emptyUpcomingSubtitle, directionStyle(isRtl)]}>
        {t("providerDashboardNoUpcomingSubtitle")}
      </Text>
    </View>
  );
}

function getServiceIcon(serviceId: string): IconName {
  const normalized = serviceId.toLowerCase();

  if (
    normalized.includes("wiring") ||
    normalized.includes("socket") ||
    normalized.includes("lighting") ||
    normalized.includes("breaker") ||
    normalized.includes("generator") ||
    normalized.includes("electric")
  ) {
    return "flash-outline";
  }

  if (
    normalized.includes("pipe") ||
    normalized.includes("drain") ||
    normalized.includes("water") ||
    normalized.includes("heater") ||
    normalized.includes("plumb")
  ) {
    return "water-outline";
  }

  if (normalized.includes("clean")) {
    return "sparkles-outline";
  }

  if (
    normalized.includes("computer") ||
    normalized.includes("hardware") ||
    normalized.includes("virus") ||
    normalized.includes("phone")
  ) {
    return "laptop-outline";
  }

  if (
    normalized.includes("cabinet") ||
    normalized.includes("door") ||
    normalized.includes("furniture") ||
    normalized.includes("wood")
  ) {
    return "hammer-outline";
  }

  return "construct-outline";
}

function formatDateId(date: Date): string {
  const year = date.getFullYear();

  const month = String(date.getMonth() + 1).padStart(2, "0");

  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return "P";
  }

  return parts
    .map((part) => part.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function getBookingDate(value: string): Date | null {
  const [year, month, day] = value.split("-").map(Number);

  if (!year || !month || !day) {
    return null;
  }

  return new Date(year, month - 1, day);
}

function formatShortDate(value: string, language: LanguageName): string {
  const date = getBookingDate(value);

  if (!date) {
    return language === "English" ? value : formatDigits(value, true);
  }

  try {
    const formatted = new Intl.DateTimeFormat(
      language === "English" ? "en-US" : "fa-AF",
      {
        weekday: "short",
        day: "numeric",
        month: "short",
      },
    ).format(date);

    return language === "English" ? formatted : formatDigits(formatted, true);
  } catch {
    return language === "English" ? value : formatDigits(value, true);
  }
}

function getDayNumber(value: string, language: LanguageName): string {
  const date = getBookingDate(value);

  const day = date ? date.getDate().toString() : (value.split("-")[2] ?? "");

  return language === "English" ? day : formatDigits(day, true);
}

function getMonthLabel(value: string, language: LanguageName): string {
  const date = getBookingDate(value);

  if (!date) {
    return "";
  }

  try {
    return new Intl.DateTimeFormat(language === "English" ? "en-US" : "fa-AF", {
      month: "short",
    }).format(date);
  } catch {
    return "";
  }
}

function formatTime(value: string, language: LanguageName): string {
  if (!value) {
    return "";
  }

  const [hoursRaw, minutesRaw] = value.split(":");

  const hours = Number(hoursRaw);

  const minutes = Number(minutesRaw);

  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) {
    return language === "English" ? value : formatDigits(value, true);
  }

  const date = new Date();

  date.setHours(hours, minutes, 0, 0);

  try {
    const formatted = new Intl.DateTimeFormat(
      language === "English" ? "en-US" : "fa-AF",
      {
        hour: "numeric",
        minute: "2-digit",
      },
    ).format(date);

    return language === "English" ? formatted : formatDigits(formatted, true);
  } catch {
    return language === "English" ? value : formatDigits(value, true);
  }
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

function formatDashboardCountMessage(
  count: string,
  suffix: string,
): string {
  return `${count} ${suffix}`;
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

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,

    backgroundColor: KhedmatPalette.white,
  },

  stateContainer: {
    flex: 1,

    width: "100%",

    maxWidth: Layout.contentMaxWidth,

    alignSelf: "center",

    justifyContent: "center",

    alignItems: "center",

    gap: Spacing.md,

    paddingHorizontal: Layout.screenPadding,
  },

  stateTitle: {
    ...Typography.sectionTitle,

    width: "100%",

    color: KhedmatPalette.textPrimary,
  },

  stateBody: {
    ...Typography.bodyStyle,

    width: "100%",

    color: KhedmatPalette.textSecondary,
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
    width: "100%",

    minHeight: 52,

    alignItems: "center",

    justifyContent: "space-between",

    gap: Spacing.md,
  },

  identity: {
    flex: 1,

    alignItems: "center",

    gap: Spacing.md,
  },

  providerAvatar: {
    width: 50,
    height: 50,

    flexShrink: 0,

    borderRadius: Radius.pill,

    alignItems: "center",

    justifyContent: "center",

    backgroundColor: KhedmatPalette.navy900,

    ...Shadows.small,
  },

  providerInitials: {
    fontFamily: Fonts.bold,

    color: KhedmatPalette.white,

    fontSize: 16,
  },

  verifiedBadge: {
    position: "absolute",

    right: -2,
    bottom: -2,

    width: 19,
    height: 19,

    borderRadius: Radius.pill,

    alignItems: "center",

    justifyContent: "center",

    backgroundColor: KhedmatPalette.blue500,

    borderWidth: 2,

    borderColor: KhedmatPalette.blue050,
  },

  identityCopy: {
    flex: 1,

    gap: 1,
  },

  eyebrow: {
    ...Typography.captionStyle,

    width: "100%",

    color: KhedmatPalette.blue500,

    fontFamily: Fonts.medium,
  },

  greeting: {
    ...Typography.label,

    width: "100%",

    color: KhedmatPalette.textPrimary,

    fontSize: 16,

    lineHeight: 22,
  },

  notificationButton: {
    width: 46,
    height: 46,

    flexShrink: 0,

    borderRadius: Radius.pill,

    alignItems: "center",

    justifyContent: "center",

    backgroundColor: KhedmatPalette.surface,

    borderWidth: 1,

    borderColor: KhedmatPalette.border,
  },

  notificationBadge: {
    position: "absolute",

    top: -2,
    right: -2,

    minWidth: 20,
    height: 20,

    paddingHorizontal: 5,

    borderRadius: Radius.pill,

    alignItems: "center",

    justifyContent: "center",

    backgroundColor: ERROR,

    borderWidth: 2,

    borderColor: KhedmatPalette.blue050,
  },

  notificationBadgeText: {
    fontFamily: Fonts.bold,

    color: KhedmatPalette.white,

    fontSize: 10,
  },

  hero: {
    width: "100%",

    marginTop: Spacing.xl,

    gap: Spacing.xs,
  },

  heroTitle: {
    ...Typography.screenTitle,

    width: "100%",

    maxWidth: 460,

    color: KhedmatPalette.textPrimary,

    fontSize: 27,

    lineHeight: 34,
  },

  heroSubtitle: {
    ...Typography.bodyStyle,

    width: "100%",

    maxWidth: Layout.readableTextMaxWidth,

    color: KhedmatPalette.textSecondary,
  },

  availabilityCard: {
    width: "100%",

    minHeight: 116,

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

  availabilityIcon: {
    width: 50,
    height: 50,

    flexShrink: 0,

    borderRadius: Radius.lg,

    alignItems: "center",

    justifyContent: "center",
  },

  availabilityIconActive: {
    backgroundColor: SUCCESS,
  },

  availabilityIconInactive: {
    backgroundColor: KhedmatPalette.surfaceSoft,
  },

  availabilityCopy: {
    flex: 1,

    gap: 2,
  },

  availabilityLabel: {
    ...Typography.captionStyle,

    width: "100%",

    color: KhedmatPalette.textMuted,
  },

  availabilityTitle: {
    ...Typography.label,

    width: "100%",

    color: KhedmatPalette.textPrimary,

    fontSize: 17,

    lineHeight: 23,
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

    justifyContent: "center",

    borderRadius: Radius.pill,

    backgroundColor: KhedmatPalette.border,
  },

  switchTrackActive: {
    backgroundColor: KhedmatPalette.blue500,
  },

  switchThumb: {
    width: 23,
    height: 23,

    borderRadius: Radius.pill,

    backgroundColor: KhedmatPalette.white,

    ...Shadows.small,
  },

  metricsGrid: {
    width: "100%",

    marginTop: Spacing.lg,

    flexDirection: "row",

    flexWrap: "wrap",

    justifyContent: "space-between",

    rowGap: Spacing.sm,
  },

  metricCard: {
    width: "48.7%",

    minHeight: 138,

    padding: Spacing.md,

    alignItems: "center",

    justifyContent: "center",

    gap: Spacing.sm,

    borderWidth: 1,

    borderColor: KhedmatPalette.border,

    borderRadius: Radius.xl,

    backgroundColor: KhedmatPalette.surface,

    ...Shadows.small,
  },

  metricCardCompact: {
    minHeight: 130,

    paddingHorizontal: Spacing.sm,
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

    color: KhedmatPalette.textPrimary,

    textAlign: "center",

    fontSize: 18,

    lineHeight: 24,
  },

  metricLabel: {
    ...Typography.captionStyle,

    width: "100%",

    color: KhedmatPalette.textMuted,

    textAlign: "center",

    lineHeight: 17,
  },

  section: {
    width: "100%",

    marginTop: Spacing.section,

    gap: Spacing.lg,
  },

  sectionHeader: {
    width: "100%",

    alignItems: "flex-start",

    justifyContent: "space-between",

    gap: Spacing.md,
  },

  sectionHeaderCopy: {
    flex: 1,

    gap: 2,
  },

  sectionTitle: {
    ...Typography.sectionTitle,

    width: "100%",

    color: KhedmatPalette.textPrimary,

    fontSize: 21,

    lineHeight: 28,
  },

  sectionSubtitle: {
    ...Typography.captionStyle,

    width: "100%",

    color: KhedmatPalette.textMuted,
  },

  sectionAction: {
    minHeight: 36,

    justifyContent: "center",
  },

  sectionActionText: {
    ...Typography.captionStyle,

    color: KhedmatPalette.blue500,

    fontFamily: Fonts.medium,
  },

  requestList: {
    width: "100%",

    gap: Spacing.md,
  },

  requestCard: {
    width: "100%",

    padding: Spacing.lg,

    borderWidth: 1,

    borderColor: "#E5C875",

    borderRadius: Radius.xl,

    backgroundColor: "#FFFDF6",

    ...Shadows.small,
  },

  requestTopRow: {
    width: "100%",

    alignItems: "flex-start",

    gap: Spacing.md,
  },

  requestIcon: {
    width: 50,
    height: 50,

    flexShrink: 0,

    borderRadius: Radius.lg,

    alignItems: "center",

    justifyContent: "center",

    backgroundColor: KhedmatPalette.surfaceSoft,
  },

  requestCopy: {
    flex: 1,

    gap: 3,
  },

  requestEyebrow: {
    ...Typography.captionStyle,

    width: "100%",

    color: WARNING,

    fontFamily: Fonts.medium,
  },

  requestTitle: {
    ...Typography.label,

    width: "100%",

    color: KhedmatPalette.textPrimary,

    fontSize: 17,

    lineHeight: 23,
  },

  requestPrice: {
    maxWidth: 105,

    flexShrink: 0,

    gap: 2,
  },

  requestPriceLabel: {
    ...Typography.captionStyle,

    color: KhedmatPalette.textMuted,

    fontSize: 10,
  },

  requestPriceValue: {
    ...Typography.label,

    color: SUCCESS,

    fontSize: 13,
  },

  requestMetaRow: {
    width: "100%",

    marginTop: Spacing.md,

    flexWrap: "wrap",

    gap: Spacing.md,
  },

  requestMeta: {
    alignItems: "center",

    gap: 5,
  },

  requestMetaText: {
    ...Typography.captionStyle,

    color: KhedmatPalette.textMuted,

    fontSize: 11,
  },

  requestAddressRow: {
    width: "100%",

    marginTop: Spacing.sm,

    alignItems: "flex-start",

    gap: 6,
  },

  requestAddress: {
    ...Typography.captionStyle,

    flex: 1,

    color: KhedmatPalette.textSecondary,

    lineHeight: 18,
  },

  emptyRequestCard: {
    width: "100%",

    minHeight: 100,

    padding: Spacing.lg,

    alignItems: "center",

    gap: Spacing.md,

    borderWidth: 1,

    borderColor: "#A9D9BD",

    borderRadius: Radius.xl,

    backgroundColor: "#F5FCF8",
  },

  emptyRequestIcon: {
    width: 48,
    height: 48,

    flexShrink: 0,

    borderRadius: Radius.lg,

    alignItems: "center",

    justifyContent: "center",

    backgroundColor: SUCCESS_SOFT,
  },

  emptyRequestCopy: {
    flex: 1,

    gap: 3,
  },

  emptyRequestTitle: {
    ...Typography.label,

    width: "100%",

    color: KhedmatPalette.textPrimary,
  },

  emptyRequestSubtitle: {
    ...Typography.captionStyle,

    width: "100%",

    color: KhedmatPalette.textSecondary,
  },

  quickActionsGrid: {
    width: "100%",

    flexDirection: "row",

    flexWrap: "wrap",

    justifyContent: "space-between",

    rowGap: Spacing.sm,
  },

  quickActionCard: {
    width: "48.7%",

    minHeight: 142,

    padding: Spacing.md,

    alignItems: "center",

    justifyContent: "center",

    gap: Spacing.sm,

    borderWidth: 1,

    borderColor: KhedmatPalette.border,

    borderRadius: Radius.xl,

    backgroundColor: KhedmatPalette.surface,

    ...Shadows.small,
  },

  quickActionCardCompact: {
    minHeight: 136,

    paddingHorizontal: Spacing.sm,
  },

  quickActionIcon: {
    width: 48,
    height: 48,

    borderRadius: Radius.lg,

    alignItems: "center",

    justifyContent: "center",

    backgroundColor: KhedmatPalette.surfaceSoft,
  },

  quickActionBadge: {
    position: "absolute",

    top: -6,
    right: -6,

    minWidth: 21,
    height: 21,

    paddingHorizontal: 5,

    borderRadius: Radius.pill,

    alignItems: "center",

    justifyContent: "center",

    backgroundColor: ERROR,

    borderWidth: 2,

    borderColor: KhedmatPalette.surface,
  },

  quickActionBadgeText: {
    fontFamily: Fonts.bold,

    color: KhedmatPalette.white,

    fontSize: 9,
  },

  quickActionTitle: {
    ...Typography.label,

    width: "100%",

    color: KhedmatPalette.textPrimary,

    textAlign: "center",

    fontSize: 15,
  },

  quickActionSubtitle: {
    ...Typography.captionStyle,

    width: "100%",

    color: KhedmatPalette.textMuted,

    textAlign: "center",

    lineHeight: 17,
  },

  upcomingList: {
    width: "100%",

    gap: Spacing.md,
  },

  upcomingCard: {
    width: "100%",

    minHeight: 108,

    padding: Spacing.md,

    alignItems: "center",

    gap: Spacing.md,

    borderWidth: 1,

    borderColor: KhedmatPalette.border,

    borderRadius: Radius.xl,

    backgroundColor: KhedmatPalette.surface,

    ...Shadows.small,
  },

  upcomingDate: {
    width: 54,
    height: 62,

    flexShrink: 0,

    borderRadius: Radius.lg,

    alignItems: "center",

    justifyContent: "center",

    backgroundColor: KhedmatPalette.surfaceSoft,
  },

  upcomingDay: {
    fontFamily: Fonts.bold,

    color: KhedmatPalette.blue500,

    fontSize: 20,

    lineHeight: 24,
  },

  upcomingMonth: {
    ...Typography.captionStyle,

    color: KhedmatPalette.textSecondary,

    fontSize: 10,
  },

  upcomingCopy: {
    flex: 1,

    gap: 3,
  },

  upcomingTitle: {
    ...Typography.label,

    width: "100%",

    color: KhedmatPalette.textPrimary,

    fontSize: 16,
  },

  upcomingCustomer: {
    ...Typography.captionStyle,

    width: "100%",

    color: KhedmatPalette.textSecondary,
  },

  upcomingMeta: {
    width: "100%",

    alignItems: "center",

    gap: 5,
  },

  upcomingMetaText: {
    ...Typography.captionStyle,

    color: KhedmatPalette.textMuted,
  },

  upcomingStatus: {
    flexShrink: 0,

    paddingHorizontal: Spacing.sm,

    paddingVertical: 6,

    borderRadius: Radius.pill,
  },

  upcomingStatusText: {
    ...Typography.captionStyle,

    fontFamily: Fonts.medium,

    fontSize: 10,
  },

  emptyUpcomingCard: {
    width: "100%",

    minHeight: 230,

    padding: Spacing.xl,

    alignItems: "center",

    justifyContent: "center",

    gap: Spacing.md,

    borderWidth: 1,

    borderColor: KhedmatPalette.border,

    borderRadius: Radius.xl,

    backgroundColor: KhedmatPalette.surface,
  },

  emptyUpcomingIcon: {
    width: 70,
    height: 70,

    borderRadius: Radius.pill,

    alignItems: "center",

    justifyContent: "center",

    backgroundColor: KhedmatPalette.surfaceSoft,
  },

  emptyUpcomingTitle: {
    ...Typography.sectionTitle,

    color: KhedmatPalette.textPrimary,

    textAlign: "center",

    fontSize: 18,
  },

  emptyUpcomingSubtitle: {
    ...Typography.bodyStyle,

    maxWidth: 340,

    color: KhedmatPalette.textSecondary,

    textAlign: "center",
  },

  performanceCard: {
    width: "100%",

    padding: Spacing.lg,

    borderWidth: 1,

    borderColor: KhedmatPalette.border,

    borderRadius: Radius.xl,

    backgroundColor: KhedmatPalette.surface,

    ...Shadows.small,
  },

  performanceRow: {
    width: "100%",

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

    backgroundColor: KhedmatPalette.surfaceSoft,
  },

  performanceCopy: {
    flex: 1,

    alignItems: "center",

    justifyContent: "space-between",

    gap: Spacing.md,
  },

  performanceLabel: {
    ...Typography.captionStyle,

    flex: 1,

    color: KhedmatPalette.textMuted,
  },

  performanceValue: {
    ...Typography.label,

    maxWidth: "52%",

    color: KhedmatPalette.textPrimary,
  },

  performanceDivider: {
    width: "100%",

    height: StyleSheet.hairlineWidth,

    marginVertical: Spacing.md,

    backgroundColor: KhedmatPalette.border,
  },

  tipCard: {
    width: "100%",

    minHeight: 108,

    marginTop: Spacing.section,

    padding: Spacing.lg,

    alignItems: "center",

    gap: Spacing.md,

    borderWidth: 1,

    borderColor: "#E5C875",

    borderRadius: Radius.xl,

    backgroundColor: "#FFFDF6",
  },

  tipIcon: {
    width: 48,
    height: 48,

    flexShrink: 0,

    borderRadius: Radius.lg,

    alignItems: "center",

    justifyContent: "center",

    backgroundColor: WARNING_SOFT,
  },

  tipCopy: {
    flex: 1,

    gap: 3,
  },

  tipTitle: {
    ...Typography.label,

    width: "100%",

    color: KhedmatPalette.textPrimary,
  },

  tipSubtitle: {
    ...Typography.captionStyle,

    width: "100%",

    color: KhedmatPalette.textSecondary,

    lineHeight: 19,
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
