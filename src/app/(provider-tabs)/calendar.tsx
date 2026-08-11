import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { ComponentProps, useCallback, useMemo, useState } from "react";
import {
  Pressable,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
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
import {
  BookingRecord,
  BookingStatus,
  useBooking,
} from "../../context/booking-context";
import { useLanguage } from "../../context/languagecontext";
import { useActiveProvider } from "../../hooks/use-active-provider";
import type { ProviderProfile } from "../../types/provider";

type IconName = ComponentProps<typeof Ionicons>["name"];

type LanguageName = "English" | "Dari" | "Pashto";

type CalendarDateOption = {
  id: string;
  date: Date;
  weekday: string;
  day: string;
  month: string;
  relativeLabel?: string;
};

type ScheduleSlot = {
  id: string;
  startTime: string;
  endTime: string;
  label: string;
  booking: BookingRecord | null;
  unavailable: boolean;
};

type TranslationFunction = ReturnType<typeof useLanguage>["t"];

type ScheduleStatusConfig = {
  label: string;
  color: string;
  backgroundColor: string;
  borderColor: string;
};

const CALENDAR_DAYS = 14;
const SLOT_DURATION_MINUTES = 60;

const SUCCESS = "#268A57";
const SUCCESS_SOFT = "#E8F6EE";

const WARNING = "#8A5A00";
const WARNING_SOFT = "#FFF4D6";

const ERROR = "#B3261E";
const ERROR_SOFT = "#FCE8E6";

const INFO_SOFT = "#E5F4F8";

export default function ProviderCalendarScreen() {
  const { t } = useLanguage();
  const { provider, isLoading, error } = useActiveProvider();

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.providerState}>
          <Text style={styles.providerStateTitle}>
            {t("providerCalendarLoading")}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!provider || error) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.providerState}>
          <Ionicons
            name="calendar-outline"
            size={52}
            color={KhedmatPalette.textMuted}
          />

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

  return <ProviderCalendarContent provider={provider} />;
}

function ProviderCalendarContent({ provider }: { provider: ProviderProfile }) {
  const { width } = useWindowDimensions();

  const { language, t } = useLanguage();

  const { bookings, isRefreshing, refreshBookings } = useBooking();

  const providerId = provider.id;

  const activeLanguage = normalizeLanguage(language);

  const isRtl = activeLanguage === "Dari" || activeLanguage === "Pashto";

  const localizedDigits = activeLanguage !== "English";

  /*
   * Provider calendar data is server-backed. Refresh whenever the Calendar
   * tab gains focus so new customer bookings and booking status changes are
   * reflected without restarting the app.
   */
  useFocusEffect(
    useCallback(() => {
      void refreshBookings().catch((refreshError) => {
        console.warn("Could not refresh provider calendar:", refreshError);
      });
    }, [refreshBookings]),
  );

  const dateOptions = useMemo(
    () => createDateOptions(CALENDAR_DAYS, activeLanguage),
    [activeLanguage],
  );

  const [selectedDateId, setSelectedDateId] = useState(
    dateOptions[0]?.id ?? formatDateId(new Date()),
  );

  const providerBookings = useMemo(
    () =>
      bookings.filter(
        (booking) =>
          booking.providerId === providerId &&
          booking.status !== "cancelled" &&
          booking.status !== "completed",
      ),
    [bookings, providerId],
  );

  const selectedDate = useMemo(
    () =>
      dateOptions.find((date) => date.id === selectedDateId) ?? dateOptions[0],
    [dateOptions, selectedDateId],
  );

  const selectedDayBookings = useMemo(
    () =>
      providerBookings
        .filter((booking) => booking.date === selectedDateId)
        .sort((first, second) => first.time.localeCompare(second.time)),
    [providerBookings, selectedDateId],
  );

  const selectedDateAvailable = useMemo(() => {
    if (!selectedDate) {
      return false;
    }

    const workingDay = isProviderWorkingDate(
      selectedDate.date,
      provider.workingDays,
    );

    if (!workingDay) {
      return false;
    }

    const todayId = formatDateId(new Date());

    if (
      selectedDate.id === todayId &&
      !provider.availableToday
    ) {
      return false;
    }

    return true;
  }, [
    provider.availableToday,
    provider.workingDays,
    selectedDate,
  ]);

  const scheduleSlots = useMemo(
    () =>
      buildScheduleSlots(
        provider.startTime,
        provider.endTime,
        selectedDayBookings,
        selectedDateAvailable,
      ),
    [
      provider.endTime,
      provider.startTime,
      selectedDateAvailable,
      selectedDayBookings,
    ],
  );

  const bookingCountsByDate = useMemo(() => {
    const counts = new Map<string, number>();

    providerBookings.forEach((booking) => {
      counts.set(booking.date, (counts.get(booking.date) ?? 0) + 1);
    });

    return counts;
  }, [providerBookings]);

  const confirmedCount = selectedDayBookings.filter(
    (booking) =>
      booking.status === "confirmed" || booking.status === "in-progress",
  ).length;

  const pendingCount = selectedDayBookings.filter(
    (booking) => booking.status === "pending",
  ).length;

  const freeSlots = scheduleSlots.filter(
    (slot) => !slot.booking && !slot.unavailable,
  ).length;

  const occupiedSlots = scheduleSlots.filter(
    (slot) => slot.booking !== null,
  ).length;

  const compactLayout = width < 370;

  const workingDaysText = formatWorkingDays(
    provider.workingDays,
    activeLanguage,
  );

  const workingHoursText = formatCalendarTimeRange(
    formatTime(provider.startTime, activeLanguage),
    formatTime(provider.endTime, activeLanguage),
    activeLanguage,
  );

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
                  "Could not refresh provider calendar:",
                  refreshError,
                );
              });
            }}
            tintColor={KhedmatPalette.blue500}
          />
        }
      >
        <View style={styles.header}>
          <Text style={[styles.eyebrow, directionStyle(isRtl)]}>
            {t("providerCalendarEyebrow")}
          </Text>

          <Text style={[styles.title, directionStyle(isRtl)]}>
            {t("providerCalendarTitle")}
          </Text>

          <Text style={[styles.subtitle, directionStyle(isRtl)]}>
            {t("providerCalendarSubtitle")}
          </Text>
        </View>

        <View
          style={[
            styles.selectedDateCard,
            {
              flexDirection: isRtl ? "row-reverse" : "row",
            },
          ]}
        >
          <View style={styles.selectedDateIcon}>
            <Ionicons
              name="calendar-outline"
              size={26}
              color={KhedmatPalette.blue500}
            />
          </View>

          <View
            style={[
              styles.selectedDateCopy,
              {
                alignItems: isRtl ? "flex-end" : "flex-start",
              },
            ]}
          >
            <Text style={[styles.selectedDateLabel, directionStyle(isRtl)]}>
              {t("providerCalendarSelectedDay")}
            </Text>

            <Text
              numberOfLines={2}
              style={[styles.selectedDateTitle, directionStyle(isRtl)]}
            >
              {selectedDate
                ? formatCalendarFullDate(
                    selectedDate.weekday,
                    selectedDate.day,
                    selectedDate.month,
                    activeLanguage,
                  )
                : t("providerCalendarUnknown")}
            </Text>

            <View
              style={[
                styles.workingTimeRow,
                {
                  flexDirection: isRtl ? "row-reverse" : "row",
                },
              ]}
            >
              <Ionicons
                name="time-outline"
                size={15}
                color={KhedmatPalette.textMuted}
              />

              <Text
                style={[styles.selectedDateSubtitle, directionStyle(isRtl)]}
              >
                {workingHoursText}
              </Text>
            </View>
          </View>

          <View style={styles.selectedDateCount}>
            <Text style={styles.selectedDateCountValue}>
              {formatDigits(
                selectedDayBookings.length.toString(),
                localizedDigits,
              )}
            </Text>

            <Text
              style={[styles.selectedDateCountLabel, directionStyle(isRtl)]}
            >
              {t("providerCalendarBookings")}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
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
                {t("providerCalendarChooseDay")}
              </Text>

              <Text style={[styles.sectionSubtitle, directionStyle(isRtl)]}>
                {t("providerCalendarNextFourteenDays")}
              </Text>
            </View>

            <View style={styles.calendarRangeBadge}>
              <Ionicons
                name="calendar-number-outline"
                size={16}
                color={KhedmatPalette.blue500}
              />

              <Text style={styles.calendarRangeText}>
                {formatDigits(CALENDAR_DAYS.toString(), localizedDigits)}
              </Text>
            </View>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.datesRow}
            style={{
              direction: isRtl ? "rtl" : "ltr",
            }}
          >
            {dateOptions.map((option) => {
              const selected = selectedDateId === option.id;

              const bookingCount = bookingCountsByDate.get(option.id) ?? 0;

              return (
                <Pressable
                  key={option.id}
                  accessibilityRole="radio"
                  accessibilityState={{
                    selected,
                  }}
                  accessibilityLabel={formatCalendarFullDate(
                    option.weekday,
                    option.day,
                    option.month,
                    activeLanguage,
                  )}
                  onPress={() => setSelectedDateId(option.id)}
                  style={({ pressed }) => [
                    styles.dateCard,

                    selected && styles.dateCardSelected,

                    pressed && styles.cardPressed,
                  ]}
                >
                  {option.relativeLabel ? (
                    <View
                      style={[
                        styles.relativeBadge,

                        selected && styles.relativeBadgeSelected,
                      ]}
                    >
                      <Text
                        style={[
                          styles.relativeLabel,

                          selected && styles.relativeLabelSelected,

                          directionStyle(isRtl),
                        ]}
                      >
                        {option.relativeLabel}
                      </Text>
                    </View>
                  ) : (
                    <View style={styles.relativeBadgePlaceholder} />
                  )}

                  <Text
                    style={[
                      styles.weekday,

                      selected && styles.dateTextSelected,

                      directionStyle(isRtl),
                    ]}
                  >
                    {option.weekday}
                  </Text>

                  <Text
                    style={[
                      styles.dayNumber,

                      selected && styles.dayNumberSelected,
                    ]}
                  >
                    {option.day}
                  </Text>

                  <Text
                    style={[
                      styles.month,

                      selected && styles.dateTextSelected,

                      directionStyle(isRtl),
                    ]}
                  >
                    {option.month}
                  </Text>

                  <View
                    style={[
                      styles.bookingCountBadge,

                      bookingCount > 0 && styles.bookingCountBadgeActive,

                      selected && styles.bookingCountBadgeSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.bookingCountText,

                        bookingCount > 0 && styles.bookingCountTextActive,

                        selected && styles.bookingCountTextSelected,
                      ]}
                    >
                      {formatDigits(bookingCount.toString(), localizedDigits)}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        <View style={styles.metricsGrid}>
          <MetricCard
            icon="checkmark-circle-outline"
            label={t("providerCalendarConfirmed")}
            value={formatDigits(confirmedCount.toString(), localizedDigits)}
            color={SUCCESS}
            backgroundColor={SUCCESS_SOFT}
            isRtl={isRtl}
            compact={compactLayout}
          />

          <MetricCard
            icon="time-outline"
            label={t("providerCalendarPending")}
            value={formatDigits(pendingCount.toString(), localizedDigits)}
            color={WARNING}
            backgroundColor={WARNING_SOFT}
            isRtl={isRtl}
            compact={compactLayout}
          />

          <MetricCard
            icon="calendar-clear-outline"
            label={t("providerCalendarFreeSlots")}
            value={formatDigits(freeSlots.toString(), localizedDigits)}
            color={KhedmatPalette.blue500}
            backgroundColor={INFO_SOFT}
            isRtl={isRtl}
            compact={compactLayout}
          />

        </View>

        <View style={styles.section}>
          <View
            style={[
              styles.scheduleSectionHeader,
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
                {t("providerCalendarDailySchedule")}
              </Text>

              <Text style={[styles.sectionSubtitle, directionStyle(isRtl)]}>
                {formatCalendarScheduleSummary(
                  formatDigits(
                    occupiedSlots.toString(),
                    localizedDigits,
                  ),
                  formatDigits(
                    freeSlots.toString(),
                    localizedDigits,
                  ),
                  activeLanguage,
                  t("providerCalendarBookings"),
                  t("providerCalendarFreeSlots"),
                )}
              </Text>
            </View>

            <View
              style={[
                styles.legend,
                {
                  flexDirection: isRtl ? "row-reverse" : "row",
                },
              ]}
            >
              <LegendItem color={SUCCESS} label={t("providerCalendarBooked")} isRtl={isRtl} />

              <LegendItem
                color={WARNING}
                label={t("providerCalendarUnavailable")}
                isRtl={isRtl}
              />

              <LegendItem
                color={KhedmatPalette.blue500}
                label={t("providerCalendarAvailable")}
                isRtl={isRtl}
              />
            </View>
          </View>

          {/* SECTION 2 CONTINUES FROM HERE */}
          <View style={styles.scheduleList}>
            {scheduleSlots.length > 0 ? (
              scheduleSlots.map((slot, index) => (
                <ScheduleSlotCard
                  key={slot.id}
                  slot={slot}
                  index={index}
                  language={activeLanguage}
                  isRtl={isRtl}
                  isLast={index === scheduleSlots.length - 1}
                />
              ))
            ) : (
              <EmptySchedule isRtl={isRtl} />
            )}
          </View>
        </View>

        <View style={styles.section}>
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
                {t("providerCalendarWorkingHours")}
              </Text>

              <Text style={[styles.sectionSubtitle, directionStyle(isRtl)]}>
                {t("providerCalendarWorkingHoursSubtitle")}
              </Text>
            </View>

            <View style={styles.workingHoursIcon}>
              <Ionicons
                name="time-outline"
                size={21}
                color={KhedmatPalette.blue500}
              />
            </View>
          </View>

          <View style={styles.workingHoursCard}>
            <WorkingHoursRow
              icon="calendar-outline"
              label={t("providerCalendarWorkingDays")}
              value={workingDaysText}
              isRtl={isRtl}
            />

            <View style={styles.workingHoursDivider} />

            <WorkingHoursRow
              icon="time-outline"
              label={t("providerCalendarDailyHours")}
              value={workingHoursText}
              isRtl={isRtl}
            />

            <View style={styles.workingHoursDivider} />

            <WorkingHoursRow
              icon="flash-outline"
              label={t("providerAvailabilityAvailableToday")}
              value={provider.availableToday ? t("providerCalendarEnabled") : t("providerCalendarDisabled")}
              isRtl={isRtl}
              valueColor={
                provider.availableToday ? SUCCESS : KhedmatPalette.textMuted
              }
            />
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
  color: string;
  backgroundColor: string;
  isRtl: boolean;
  compact: boolean;
};

function MetricCard({
  icon,
  label,
  value,
  color,
  backgroundColor,
  isRtl,
  compact,
}: MetricCardProps) {
  return (
    <View style={[styles.metricCard, compact && styles.metricCardCompact]}>
      <View
        style={[
          styles.metricIcon,
          {
            backgroundColor,
          },
        ]}
      >
        <Ionicons name={icon} size={20} color={color} />
      </View>

      <Text
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.72}
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

type LegendItemProps = {
  color: string;
  label: string;
  isRtl: boolean;
};

function LegendItem({ color, label, isRtl }: LegendItemProps) {
  return (
    <View
      style={[
        styles.legendItem,
        {
          flexDirection: isRtl ? "row-reverse" : "row",
        },
      ]}
    >
      <View
        style={[
          styles.legendDot,
          {
            backgroundColor: color,
          },
        ]}
      />

      <Text style={[styles.legendText, directionStyle(isRtl)]}>{label}</Text>
    </View>
  );
}

type ScheduleSlotCardProps = {
  slot: ScheduleSlot;
  index: number;
  language: LanguageName;
  isRtl: boolean;
  isLast: boolean;
};

function ScheduleSlotCard({
  slot,
  index,
  language,
  isRtl,
  isLast,
}: ScheduleSlotCardProps) {
  const { t } = useLanguage();
  const booking = slot.booking;

  const statusConfig = booking
    ? getScheduleStatusConfig(booking.status, t)
    : null;

  const slotState = getSlotState(slot, t);

  const timelineColor =
    booking?.status === "in-progress"
      ? KhedmatPalette.navy700
      : booking
        ? (statusConfig?.color ?? KhedmatPalette.blue500)
        : slot.unavailable
          ? WARNING
          : KhedmatPalette.blue500;

  return (
    <View
      style={[
        styles.scheduleRow,
        {
          flexDirection: isRtl ? "row-reverse" : "row",
        },
      ]}
    >
      <View style={styles.scheduleTimeColumn}>
        <Text style={[styles.scheduleTime, directionStyle(isRtl)]}>
          {formatTime(slot.startTime, language)}
        </Text>

        <Text style={[styles.scheduleEndTime, directionStyle(isRtl)]}>
          {formatTime(slot.endTime, language)}
        </Text>
      </View>

      <View style={styles.timelineColumn}>
        <View
          style={[
            styles.timelineDot,
            {
              borderColor: timelineColor,
              backgroundColor: booking ? timelineColor : KhedmatPalette.surface,
            },
          ]}
        >
          {booking ? <View style={styles.timelineDotInner} /> : null}
        </View>

        {!isLast ? (
          <View
            style={[
              styles.timelineLine,
              {
                backgroundColor: booking
                  ? timelineColor
                  : KhedmatPalette.border,
              },
            ]}
          />
        ) : null}
      </View>

      <View style={styles.scheduleContent}>
        {booking ? (
          <BookingScheduleCard
            booking={booking}
            language={language}
            isRtl={isRtl}
            statusConfig={
              statusConfig ?? getScheduleStatusConfig("pending", t)
            }
          />
        ) : (
          <View
            style={[
              styles.emptySlotCard,

              slot.unavailable
                ? styles.unavailableSlotCard
                : styles.availableSlotCard,
            ]}
          >
            <View
              style={[
                styles.emptySlotTopRow,
                {
                  flexDirection: isRtl ? "row-reverse" : "row",
                },
              ]}
            >
              <View
                style={[
                  styles.emptySlotIcon,
                  {
                    backgroundColor: slot.unavailable
                      ? WARNING_SOFT
                      : INFO_SOFT,
                  },
                ]}
              >
                <Ionicons
                  name={
                    slot.unavailable ? "pause-outline" : "add-circle-outline"
                  }
                  size={20}
                  color={slot.unavailable ? WARNING : KhedmatPalette.blue500}
                />
              </View>

              <View
                style={[
                  styles.emptySlotCopy,
                  {
                    alignItems: isRtl ? "flex-end" : "flex-start",
                  },
                ]}
              >
                <Text
                  style={[
                    styles.emptySlotTitle,
                    {
                      color: slot.unavailable
                        ? WARNING
                        : KhedmatPalette.navy700,
                    },
                    directionStyle(isRtl),
                  ]}
                >
                  {slotState.title}
                </Text>

                <Text style={[styles.emptySlotSubtitle, directionStyle(isRtl)]}>
                  {slotState.subtitle}
                </Text>
              </View>
            </View>

            {!slot.unavailable ? (
              <View
                style={[
                  styles.availableSlotBadge,
                  {
                    flexDirection: isRtl ? "row-reverse" : "row",
                  },
                ]}
              >
                <Ionicons
                  name="checkmark-circle-outline"
                  size={14}
                  color={SUCCESS}
                />

                <Text
                  style={[styles.availableSlotBadgeText, directionStyle(isRtl)]}
                >
                  {t("providerCalendarAvailableForBooking")}
                </Text>
              </View>
            ) : null}
          </View>
        )}
      </View>
    </View>
  );
}

type BookingScheduleCardProps = {
  booking: BookingRecord;
  language: LanguageName;
  isRtl: boolean;
  statusConfig: ScheduleStatusConfig;
};

function BookingScheduleCard({
  booking,
  language,
  isRtl,
  statusConfig,
}: BookingScheduleCardProps) {
  const router = useRouter();
  const { t } = useLanguage();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={booking.serviceName}
      onPress={() =>
        router.push({
          pathname: "/provider-request-details",
          params: {
            bookingId: booking.id,
          },
        })
      }
      style={({ pressed }) => [
        styles.bookingCard,
        {
          borderColor: statusConfig.borderColor,
        },
        pressed && styles.cardPressed,
      ]}
    >
      <View
        style={[
          styles.bookingCardHeader,
          {
            flexDirection: isRtl ? "row-reverse" : "row",
          },
        ]}
      >
        <View
          style={[
            styles.serviceIcon,
            {
              backgroundColor: statusConfig.backgroundColor,
            },
          ]}
        >
          <Ionicons
            name={getServiceIcon(booking.serviceId)}
            size={22}
            color={statusConfig.color}
          />
        </View>

        <View
          style={[
            styles.bookingCardCopy,
            {
              alignItems: isRtl ? "flex-end" : "flex-start",
            },
          ]}
        >
          <Text
            numberOfLines={2}
            style={[styles.bookingServiceName, directionStyle(isRtl)]}
          >
            {booking.serviceName}
          </Text>

          <Text
            numberOfLines={1}
            style={[styles.bookingReference, directionStyle(isRtl)]}
          >
            {formatCalendarBookingReference(
              getShortBookingId(booking.id, language),
              t("providerCalendarBooking"),
            )}
          </Text>
        </View>

        <View
          style={[
            styles.bookingStatusBadge,
            {
              backgroundColor: statusConfig.backgroundColor,
            },
          ]}
        >
          <Text
            style={[
              styles.bookingStatusText,
              {
                color: statusConfig.color,
              },
              directionStyle(isRtl),
            ]}
          >
            {statusConfig.label}
          </Text>
        </View>
      </View>

      <View
        style={[
          styles.bookingMetaRow,
          {
            flexDirection: isRtl ? "row-reverse" : "row",
          },
        ]}
      >
        <BookingMeta
          icon="location-outline"
          value={booking.address.label}
          isRtl={isRtl}
        />

        <BookingMeta
          icon="cash-outline"
          value={formatCurrency(booking.servicePrice, language)}
          isRtl={isRtl}
        />
      </View>

      <View
        style={[
          styles.bookingOpenRow,
          {
            flexDirection: isRtl ? "row-reverse" : "row",
          },
        ]}
      >
        <Text style={[styles.bookingOpenText, directionStyle(isRtl)]}>
          {t("providerRequestsViewDetails")}
        </Text>

        <Ionicons
          name={isRtl ? "chevron-back" : "chevron-forward"}
          size={17}
          color={KhedmatPalette.blue500}
        />
      </View>
    </Pressable>
  );
}

type BookingMetaProps = {
  icon: IconName;
  value: string;
  isRtl: boolean;
};

function BookingMeta({ icon, value, isRtl }: BookingMetaProps) {
  return (
    <View
      style={[
        styles.bookingMeta,
        {
          flexDirection: isRtl ? "row-reverse" : "row",
        },
      ]}
    >
      <Ionicons name={icon} size={14} color={KhedmatPalette.textMuted} />

      <Text
        numberOfLines={1}
        style={[styles.bookingMetaText, directionStyle(isRtl)]}
      >
        {value}
      </Text>
    </View>
  );
}

type WorkingHoursRowProps = {
  icon: IconName;
  label: string;
  value: string;
  isRtl: boolean;
  valueColor?: string;
};

function WorkingHoursRow({
  icon,
  label,
  value,
  isRtl,
  valueColor,
}: WorkingHoursRowProps) {
  return (
    <View
      style={[
        styles.workingHoursRow,
        {
          flexDirection: isRtl ? "row-reverse" : "row",
        },
      ]}
    >
      <View style={styles.workingHoursRowIcon}>
        <Ionicons name={icon} size={18} color={KhedmatPalette.blue500} />
      </View>

      <View
        style={[
          styles.workingHoursRowCopy,
          {
            flexDirection: isRtl ? "row-reverse" : "row",
          },
        ]}
      >
        <Text style={[styles.workingHoursLabel, directionStyle(isRtl)]}>
          {label}
        </Text>

        <Text
          numberOfLines={2}
          style={[
            styles.workingHoursValue,
            valueColor
              ? {
                  color: valueColor,
                }
              : null,
            directionStyle(isRtl),
          ]}
        >
          {value}
        </Text>
      </View>
    </View>
  );
}

type EmptyScheduleProps = {
  isRtl: boolean;
};

function EmptySchedule({ isRtl }: EmptyScheduleProps) {
  const { t } = useLanguage();

  return (
    <View style={styles.emptySchedule}>
      <View style={styles.emptyScheduleIcon}>
        <Ionicons
          name="calendar-clear-outline"
          size={32}
          color={KhedmatPalette.blue500}
        />
      </View>

      <Text style={[styles.emptyScheduleTitle, directionStyle(isRtl)]}>
        {t("providerCalendarNoScheduleTitle")}
      </Text>

      <Text style={[styles.emptyScheduleSubtitle, directionStyle(isRtl)]}>
        {t("providerCalendarNoScheduleSubtitle")}
      </Text>
    </View>
  );
}

function createDateOptions(
  count: number,
  language: LanguageName,
): CalendarDateOption[] {
  const today = startOfDay(new Date());

  return Array.from(
    {
      length: count,
    },
    (_, index) => {
      const date = new Date(today);

      date.setDate(today.getDate() + index);

      return {
        id: formatDateId(date),
        date,
        weekday: formatWeekday(date, language),
        day: formatDigits(date.getDate().toString(), language !== "English"),
        month: formatMonth(date, language),
        relativeLabel: getRelativeDateLabel(index, language),
      };
    },
  );
}

function isProviderWorkingDate(
  date: Date,
  workingDays: string[],
): boolean {
  if (
    !workingDays ||
    workingDays.length === 0
  ) {
    return false;
  }

  const target =
    getWeekdayKey(date);

  return workingDays.some(
    (day) =>
      normalizeWorkingDayKey(day) ===
      target,
  );
}

function getWeekdayKey(
  date: Date,
):
  | "sunday"
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday" {
  const keys = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ] as const;

  return keys[date.getDay()];
}

function normalizeWorkingDayKey(
  value: string,
): string {
  const normalized =
    value
      .trim()
      .toLowerCase();

  const aliases: Record<
    string,
    string
  > = {
    sun: "sunday",
    mon: "monday",
    tue: "tuesday",
    tues: "tuesday",
    wed: "wednesday",
    thu: "thursday",
    thur: "thursday",
    thurs: "thursday",
    fri: "friday",
    sat: "saturday",
  };

  return aliases[normalized] ??
    normalized;
}

function buildScheduleSlots(
  startTime: string,
  endTime: string,
  bookings: BookingRecord[],
  availableForBooking: boolean,
): ScheduleSlot[] {
  const startMinutes = timeToMinutes(startTime);

  const endMinutes = timeToMinutes(endTime);

  if (
    startMinutes === null ||
    endMinutes === null ||
    endMinutes <= startMinutes
  ) {
    return [];
  }

  const slots: ScheduleSlot[] = [];

  for (
    let current = startMinutes;
    current < endMinutes;
    current += SLOT_DURATION_MINUTES
  ) {
    const slotEnd = Math.min(current + SLOT_DURATION_MINUTES, endMinutes);

    const slotStartTime = minutesToTime(current);

    const slotEndTime = minutesToTime(slotEnd);

    const booking = findBookingForSlot(bookings, current, slotEnd);

    slots.push({
      id: `${slotStartTime}-${slotEndTime}`,
      startTime: slotStartTime,
      endTime: slotEndTime,
      label: `${slotStartTime}-${slotEndTime}`,
      booking,
      unavailable:
        booking === null &&
        !availableForBooking,
    });
  }

  return slots;
}

function findBookingForSlot(
  bookings: BookingRecord[],
  slotStartMinutes: number,
  slotEndMinutes: number,
): BookingRecord | null {
  return (
    bookings.find((booking) => {
      const bookingMinutes = timeToMinutes(booking.time);

      if (bookingMinutes === null) {
        return false;
      }

      return (
        bookingMinutes >= slotStartMinutes && bookingMinutes < slotEndMinutes
      );
    }) ?? null
  );
}

function getSlotState(
  slot: ScheduleSlot,
  t: TranslationFunction,
) {
  if (slot.unavailable) {
    return {
      title: t("providerCalendarUnavailableSlotTitle"),
      subtitle: t("providerCalendarUnavailableSlotSubtitle"),
    };
  }

  return {
    title: t("providerCalendarAvailableSlotTitle"),
    subtitle: t("providerCalendarAvailableSlotSubtitle"),
  };
}

function getScheduleStatusConfig(
  status: BookingStatus,
  t: TranslationFunction,
): ScheduleStatusConfig {
  if (status === "confirmed") {
    return {
      label: t("providerRequestsStatusAccepted"),
      color: KhedmatPalette.blue500,
      backgroundColor: INFO_SOFT,
      borderColor: KhedmatPalette.blue200,
    };
  }

  if (status === "in-progress") {
    return {
      label: t("providerRequestsStatusInProgress"),
      color: KhedmatPalette.navy700,
      backgroundColor: KhedmatPalette.blue050,
      borderColor: KhedmatPalette.blue200,
    };
  }

  if (status === "completed") {
    return {
      label: t("providerRequestsStatusCompleted"),
      color: SUCCESS,
      backgroundColor: SUCCESS_SOFT,
      borderColor: "#A9D9BD",
    };
  }

  if (status === "cancelled") {
    return {
      label: t("providerRequestsStatusCancelled"),
      color: ERROR,
      backgroundColor: ERROR_SOFT,
      borderColor: "#E7B1AD",
    };
  }

  return {
    label: t("providerRequestsStatusNew"),
    color: WARNING,
    backgroundColor: WARNING_SOFT,
    borderColor: "#E4C77A",
  };
}

function getServiceIcon(serviceId: string): IconName {
  const normalized = serviceId.toLowerCase();

  if (
    normalized.includes("electric") ||
    normalized.includes("wiring") ||
    normalized.includes("lighting") ||
    normalized.includes("socket") ||
    normalized.includes("breaker")
  ) {
    return "flash-outline";
  }

  if (
    normalized.includes("plumb") ||
    normalized.includes("water") ||
    normalized.includes("pipe") ||
    normalized.includes("drain")
  ) {
    return "water-outline";
  }

  if (normalized.includes("clean")) {
    return "sparkles-outline";
  }

  if (
    normalized.includes("computer") ||
    normalized.includes("phone") ||
    normalized.includes("software") ||
    normalized.includes("hardware")
  ) {
    return "laptop-outline";
  }

  if (
    normalized.includes("wood") ||
    normalized.includes("door") ||
    normalized.includes("cabinet") ||
    normalized.includes("furniture")
  ) {
    return "hammer-outline";
  }

  return "construct-outline";
}

/*
 * SECTION 3 CONTINUES FROM HERE:
 * remaining formatters, localization copy,
 * and the complete StyleSheet.
 */
function startOfDay(date: Date): Date {
  const result = new Date(date);

  result.setHours(0, 0, 0, 0);

  return result;
}

function formatDateId(date: Date): string {
  const year = date.getFullYear();

  const month = String(date.getMonth() + 1).padStart(2, "0");

  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatWeekday(date: Date, language: LanguageName): string {
  const weekdays = {
    English: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],

    Dari: [
      "یکشنبه",
      "دوشنبه",
      "سه‌شنبه",
      "چهارشنبه",
      "پنجشنبه",
      "جمعه",
      "شنبه",
    ],

    Pashto: [
      "یکشنبه",
      "دوشنبه",
      "سه‌شنبه",
      "چهارشنبه",
      "پنجشنبه",
      "جمعه",
      "شنبه",
    ],
  } as const;

  return weekdays[language][date.getDay()];
}

function formatMonth(date: Date, language: LanguageName): string {
  try {
    return new Intl.DateTimeFormat(language === "English" ? "en-US" : "fa-AF", {
      month: "short",
    }).format(date);
  } catch {
    const months = {
      English: [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ],

      Dari: [
        "جنوری",
        "فبروری",
        "مارچ",
        "اپریل",
        "می",
        "جون",
        "جولای",
        "اگست",
        "سپتمبر",
        "اکتبر",
        "نوامبر",
        "دسمبر",
      ],

      Pashto: [
        "جنوري",
        "فبروري",
        "مارچ",
        "اپریل",
        "می",
        "جون",
        "جولای",
        "اګست",
        "سپتمبر",
        "اکتوبر",
        "نومبر",
        "دسمبر",
      ],
    } as const;

    return months[language][date.getMonth()];
  }
}

function getRelativeDateLabel(
  index: number,
  language: LanguageName,
): string | undefined {
  if (index === 0) {
    if (language === "Dari") {
      return "امروز";
    }

    if (language === "Pashto") {
      return "نن";
    }

    return "Today";
  }

  if (index === 1) {
    if (language === "Dari") {
      return "فردا";
    }

    if (language === "Pashto") {
      return "سبا";
    }

    return "Tomorrow";
  }

  return undefined;
}

function timeToMinutes(value: string): number | null {
  const [hoursRaw, minutesRaw] = value.split(":");

  const hours = Number(hoursRaw);

  const minutes = Number(minutesRaw);

  if (
    !Number.isFinite(hours) ||
    !Number.isFinite(minutes) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    return null;
  }

  return hours * 60 + minutes;
}

function minutesToTime(value: number): string {
  const normalized = Math.max(0, value);

  const hours = Math.floor(normalized / 60);

  const minutes = normalized % 60;

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
    2,
    "0",
  )}`;
}

function formatTime(value: string, language: LanguageName): string {
  const minutes = timeToMinutes(value);

  if (minutes === null) {
    return language === "English" ? value : formatDigits(value, true);
  }

  const date = new Date();

  date.setHours(Math.floor(minutes / 60), minutes % 60, 0, 0);

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

function formatWorkingDays(
  workingDays: string[],
  language: LanguageName,
): string {
  if (!workingDays || workingDays.length === 0) {
    if (language === "Dari") {
      return "روز کاری مشخص نشده";
    }

    if (language === "Pashto") {
      return "کاري ورځې نه دي ټاکل شوي";
    }

    return "No working days set";
  }

  return workingDays
    .map((day) => translateWorkingDay(day, language))
    .join(language === "English" ? ", " : "، ");
}

function translateWorkingDay(day: string, language: LanguageName): string {
  const normalized = day.trim().toLowerCase();

  const translations: Record<
    string,
    {
      English: string;
      Dari: string;
      Pashto: string;
    }
  > = {
    sunday: {
      English: "Sunday",
      Dari: "یکشنبه",
      Pashto: "یکشنبه",
    },

    monday: {
      English: "Monday",
      Dari: "دوشنبه",
      Pashto: "دوشنبه",
    },

    tuesday: {
      English: "Tuesday",
      Dari: "سه‌شنبه",
      Pashto: "سه‌شنبه",
    },

    wednesday: {
      English: "Wednesday",
      Dari: "چهارشنبه",
      Pashto: "چهارشنبه",
    },

    thursday: {
      English: "Thursday",
      Dari: "پنجشنبه",
      Pashto: "پنجشنبه",
    },

    friday: {
      English: "Friday",
      Dari: "جمعه",
      Pashto: "جمعه",
    },

    saturday: {
      English: "Saturday",
      Dari: "شنبه",
      Pashto: "شنبه",
    },

    sun: {
      English: "Sunday",
      Dari: "یکشنبه",
      Pashto: "یکشنبه",
    },

    mon: {
      English: "Monday",
      Dari: "دوشنبه",
      Pashto: "دوشنبه",
    },

    tue: {
      English: "Tuesday",
      Dari: "سه‌شنبه",
      Pashto: "سه‌شنبه",
    },

    wed: {
      English: "Wednesday",
      Dari: "چهارشنبه",
      Pashto: "چهارشنبه",
    },

    thu: {
      English: "Thursday",
      Dari: "پنجشنبه",
      Pashto: "پنجشنبه",
    },

    fri: {
      English: "Friday",
      Dari: "جمعه",
      Pashto: "جمعه",
    },

    sat: {
      English: "Saturday",
      Dari: "شنبه",
      Pashto: "شنبه",
    },
  };

  const translated = translations[normalized];

  if (translated) {
    return translated[language];
  }

  return day;
}

function formatCurrency(amount: number, language: LanguageName): string {
  const formatted = new Intl.NumberFormat("en-US").format(amount);

  if (language === "English") {
    return `${formatted} AFN`;
  }

  const localized = formatDigits(formatted, true);

  return language === "Dari" ? `${localized} افغانی` : `${localized} افغانۍ`;
}

function getShortBookingId(bookingId: string, language: LanguageName): string {
  const finalPart = bookingId.split("-").pop() ?? bookingId;

  const shortened = finalPart.slice(-8);

  return language === "English" ? shortened : formatDigits(shortened, true);
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

function formatCalendarFullDate(
  weekday: string,
  day: string,
  month: string,
  language: LanguageName,
): string {
  if (language === "English") {
    return `${weekday}, ${month} ${day}`;
  }

  return `${weekday}، ${day} ${month}`;
}

function formatCalendarTimeRange(
  start: string,
  end: string,
  language: LanguageName,
): string {
  if (language === "Dari") {
    return `${start} تا ${end}`;
  }

  if (language === "Pashto") {
    return `${start} تر ${end}`;
  }

  return `${start} to ${end}`;
}

function formatCalendarMinutes(
  value: string,
  minutesLabel: string,
): string {
  return `${value} ${minutesLabel}`;
}

function formatCalendarScheduleSummary(
  occupied: string,
  free: string,
  language: LanguageName,
  bookingsLabel: string,
  freeSlotsLabel: string,
): string {
  if (language === "Dari") {
    return `${occupied} ${bookingsLabel} و ${free} ${freeSlotsLabel}`;
  }

  if (language === "Pashto") {
    return `${occupied} ${bookingsLabel} او ${free} ${freeSlotsLabel}`;
  }

  return `${occupied} ${bookingsLabel} and ${free} ${freeSlotsLabel}`;
}

function formatCalendarBookingReference(
  value: string,
  bookingLabel: string,
): string {
  return `${bookingLabel} ${value}`;
}

const styles = StyleSheet.create({
  providerState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.md,
    paddingHorizontal: Layout.screenPadding,
  },

  providerStateTitle: {
    ...Typography.sectionTitle,
    width: "100%",
    maxWidth: Layout.readableTextMaxWidth,
    color: KhedmatPalette.textPrimary,
    textAlign: "center",
  },

  providerStateBody: {
    ...Typography.bodyStyle,
    width: "100%",
    maxWidth: Layout.readableTextMaxWidth,
    color: KhedmatPalette.textMuted,
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
    maxWidth: Layout.readableTextMaxWidth,
    color: KhedmatPalette.textSecondary,
  },

  selectedDateCard: {
    width: "100%",
    minHeight: 112,
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

  selectedDateIcon: {
    width: 54,
    height: 54,
    flexShrink: 0,
    borderRadius: Radius.lg,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: KhedmatPalette.surfaceSoft,
  },

  selectedDateCopy: {
    flex: 1,
    gap: 3,
  },

  selectedDateLabel: {
    ...Typography.captionStyle,
    width: "100%",
    color: KhedmatPalette.textMuted,
  },

  selectedDateTitle: {
    ...Typography.sectionTitle,
    width: "100%",
    color: KhedmatPalette.textPrimary,
    fontSize: 19,
    lineHeight: 25,
  },

  workingTimeRow: {
    width: "100%",
    alignItems: "center",
    gap: 5,
  },

  selectedDateSubtitle: {
    ...Typography.captionStyle,
    flex: 1,
    color: KhedmatPalette.textSecondary,
  },

  selectedDateCount: {
    minWidth: 58,
    minHeight: 58,
    flexShrink: 0,
    paddingHorizontal: Spacing.sm,
    borderRadius: Radius.lg,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: KhedmatPalette.navy900,
  },

  selectedDateCountValue: {
    fontFamily: Fonts.bold,
    color: KhedmatPalette.white,
    fontSize: 20,
    lineHeight: 24,
  },

  selectedDateCountLabel: {
    ...Typography.captionStyle,
    color: "rgba(255,255,255,0.76)",
    fontSize: 9,
    textAlign: "center",
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
    gap: Spacing.md,
  },

  scheduleSectionHeader: {
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
    lineHeight: 18,
  },

  calendarRangeBadge: {
    minWidth: 48,
    height: 38,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    paddingHorizontal: Spacing.sm,
    borderWidth: 1,
    borderColor: KhedmatPalette.border,
    borderRadius: Radius.lg,
    backgroundColor: KhedmatPalette.surface,
  },

  calendarRangeText: {
    fontFamily: Fonts.bold,
    color: KhedmatPalette.blue500,
    fontSize: 13,
  },

  datesRow: {
    gap: Spacing.sm,
    paddingHorizontal: 1,
    paddingBottom: Spacing.sm,
  },

  dateCard: {
    width: 84,
    minHeight: 142,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: KhedmatPalette.border,
    borderRadius: Radius.xl,
    backgroundColor: KhedmatPalette.surface,
    ...Shadows.small,
  },

  dateCardSelected: {
    borderColor: KhedmatPalette.navy900,
    backgroundColor: KhedmatPalette.navy900,
  },

  relativeBadge: {
    minHeight: 22,
    paddingHorizontal: 7,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: KhedmatPalette.surfaceSoft,
  },

  relativeBadgeSelected: {
    backgroundColor: "rgba(255,255,255,0.15)",
  },

  relativeBadgePlaceholder: {
    height: 22,
  },

  relativeLabel: {
    ...Typography.captionStyle,
    color: KhedmatPalette.blue500,
    fontSize: 9,
    fontFamily: Fonts.medium,
  },

  relativeLabelSelected: {
    color: KhedmatPalette.white,
  },

  weekday: {
    ...Typography.captionStyle,
    color: KhedmatPalette.textSecondary,
    fontSize: 11,
    textAlign: "center",
  },

  dayNumber: {
    fontFamily: Fonts.bold,
    color: KhedmatPalette.textPrimary,
    fontSize: 25,
    lineHeight: 30,
  },

  dayNumberSelected: {
    color: KhedmatPalette.white,
  },

  month: {
    ...Typography.captionStyle,
    color: KhedmatPalette.textMuted,
    fontSize: 10,
    textAlign: "center",
  },

  dateTextSelected: {
    color: "rgba(255,255,255,0.82)",
  },

  bookingCountBadge: {
    minWidth: 25,
    height: 25,
    paddingHorizontal: 6,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: KhedmatPalette.surfaceSoft,
  },

  bookingCountBadgeActive: {
    backgroundColor: INFO_SOFT,
  },

  bookingCountBadgeSelected: {
    backgroundColor: "rgba(255,255,255,0.17)",
  },

  bookingCountText: {
    fontFamily: Fonts.medium,
    color: KhedmatPalette.textMuted,
    fontSize: 10,
  },

  bookingCountTextActive: {
    color: KhedmatPalette.blue500,
  },

  bookingCountTextSelected: {
    color: KhedmatPalette.white,
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
    minHeight: 132,
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
    minHeight: 124,
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

  legend: {
    maxWidth: 160,
    flexWrap: "wrap",
    justifyContent: "flex-end",
    gap: Spacing.sm,
  },

  legendItem: {
    alignItems: "center",
    gap: 4,
  },

  legendDot: {
    width: 8,
    height: 8,
    borderRadius: Radius.pill,
  },

  legendText: {
    ...Typography.captionStyle,
    color: KhedmatPalette.textMuted,
    fontSize: 9,
  },

  scheduleList: {
    width: "100%",
  },

  scheduleRow: {
    width: "100%",
    alignItems: "stretch",
  },

  scheduleTimeColumn: {
    width: 65,
    flexShrink: 0,
    paddingTop: 5,
  },

  scheduleTime: {
    ...Typography.label,
    width: "100%",
    color: KhedmatPalette.textPrimary,
    fontSize: 12,
    lineHeight: 17,
  },

  scheduleEndTime: {
    ...Typography.captionStyle,
    width: "100%",
    marginTop: 2,
    color: KhedmatPalette.textMuted,
    fontSize: 9,
  },

  timelineColumn: {
    width: 25,
    flexShrink: 0,
    alignItems: "center",
  },

  timelineDot: {
    width: 17,
    height: 17,
    zIndex: 2,
    borderWidth: 3,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
  },

  timelineDotInner: {
    width: 5,
    height: 5,
    borderRadius: Radius.pill,
    backgroundColor: KhedmatPalette.white,
  },

  timelineLine: {
    width: 2,
    flex: 1,
    minHeight: 94,
    marginTop: -1,
  },

  scheduleContent: {
    flex: 1,
    paddingBottom: Spacing.md,
  },

  bookingCard: {
    width: "100%",
    padding: Spacing.md,
    borderWidth: 1,
    borderRadius: Radius.xl,
    backgroundColor: KhedmatPalette.surface,
    ...Shadows.small,
  },

  bookingCardHeader: {
    width: "100%",
    alignItems: "flex-start",
    gap: Spacing.sm,
  },

  serviceIcon: {
    width: 44,
    height: 44,
    flexShrink: 0,
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
  },

  bookingCardCopy: {
    flex: 1,
    gap: 2,
  },

  bookingServiceName: {
    ...Typography.label,
    width: "100%",
    color: KhedmatPalette.textPrimary,
    fontSize: 15,
    lineHeight: 21,
  },

  bookingReference: {
    ...Typography.captionStyle,
    width: "100%",
    color: KhedmatPalette.textMuted,
    fontSize: 10,
  },

  bookingStatusBadge: {
    maxWidth: 104,
    flexShrink: 0,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 5,
    borderRadius: Radius.pill,
  },

  bookingStatusText: {
    ...Typography.captionStyle,
    fontFamily: Fonts.medium,
    fontSize: 9,
    textAlign: "center",
  },

  bookingMetaRow: {
    width: "100%",
    marginTop: Spacing.md,
    flexWrap: "wrap",
    gap: Spacing.md,
  },

  bookingMeta: {
    maxWidth: "48%",
    alignItems: "center",
    gap: 4,
  },

  bookingMetaText: {
    ...Typography.captionStyle,
    flexShrink: 1,
    color: KhedmatPalette.textSecondary,
    fontSize: 10,
  },

  bookingAddressRow: {
    width: "100%",
    marginTop: Spacing.sm,
    alignItems: "flex-start",
    gap: 5,
  },

  bookingAddress: {
    ...Typography.captionStyle,
    flex: 1,
    color: KhedmatPalette.textMuted,
    lineHeight: 17,
  },

  bookingNotes: {
    width: "100%",
    marginTop: Spacing.sm,
    padding: Spacing.sm,
    alignItems: "flex-start",
    gap: Spacing.sm,
    borderRadius: Radius.md,
    backgroundColor: KhedmatPalette.surfaceSoft,
  },

  bookingNotesText: {
    ...Typography.captionStyle,
    flex: 1,
    color: KhedmatPalette.textSecondary,
    lineHeight: 18,
  },

  emptySlotCard: {
    width: "100%",
    minHeight: 92,
    padding: Spacing.md,
    borderWidth: 1,
    borderRadius: Radius.xl,
  },

  availableSlotCard: {
    borderColor: KhedmatPalette.blue200,
    backgroundColor: "#F4FBFC",
  },

  unavailableSlotCard: {
    borderColor: "#E5C875",
    backgroundColor: "#FFFDF6",
  },

  emptySlotTopRow: {
    width: "100%",
    alignItems: "center",
    gap: Spacing.md,
  },

  emptySlotIcon: {
    width: 42,
    height: 42,
    flexShrink: 0,
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
  },

  emptySlotCopy: {
    flex: 1,
    gap: 2,
  },

  emptySlotTitle: {
    ...Typography.label,
    width: "100%",
    fontSize: 14,
  },

  emptySlotSubtitle: {
    ...Typography.captionStyle,
    width: "100%",
    color: KhedmatPalette.textMuted,
    lineHeight: 17,
  },

  availableSlotBadge: {
    marginTop: Spacing.sm,
    alignItems: "center",
    gap: 5,
  },

  availableSlotBadgeText: {
    ...Typography.captionStyle,
    color: SUCCESS,
    fontFamily: Fonts.medium,
    fontSize: 10,
  },

  workingHoursIcon: {
    width: 44,
    height: 44,
    flexShrink: 0,
    borderRadius: Radius.lg,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: KhedmatPalette.surface,
    borderWidth: 1,
    borderColor: KhedmatPalette.border,
  },

  workingHoursCard: {
    width: "100%",
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: KhedmatPalette.border,
    borderRadius: Radius.xl,
    backgroundColor: KhedmatPalette.surface,
    ...Shadows.small,
  },

  workingHoursRow: {
    width: "100%",
    alignItems: "center",
    gap: Spacing.md,
  },

  workingHoursRowIcon: {
    width: 40,
    height: 40,
    flexShrink: 0,
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: KhedmatPalette.surfaceSoft,
  },

  workingHoursRowCopy: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.md,
  },

  workingHoursLabel: {
    ...Typography.captionStyle,
    flex: 1,
    color: KhedmatPalette.textMuted,
  },

  workingHoursValue: {
    ...Typography.label,
    maxWidth: "58%",
    color: KhedmatPalette.textPrimary,
    fontSize: 13,
    lineHeight: 19,
  },

  workingHoursDivider: {
    width: "100%",
    height: StyleSheet.hairlineWidth,
    marginVertical: Spacing.md,
    backgroundColor: KhedmatPalette.border,
  },

  emptySchedule: {
    width: "100%",
    minHeight: 270,
    padding: Spacing.xl,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: KhedmatPalette.border,
    borderRadius: Radius.xl,
    backgroundColor: KhedmatPalette.surface,
  },

  emptyScheduleIcon: {
    width: 74,
    height: 74,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: KhedmatPalette.surfaceSoft,
  },

  emptyScheduleTitle: {
    ...Typography.sectionTitle,
    maxWidth: 340,
    color: KhedmatPalette.textPrimary,
    textAlign: "center",
    fontSize: 19,
  },

  emptyScheduleSubtitle: {
    ...Typography.bodyStyle,
    maxWidth: 350,
    color: KhedmatPalette.textSecondary,
    textAlign: "center",
  },

  noticeCard: {
    width: "100%",
    minHeight: 108,
    marginTop: Spacing.section,
    padding: Spacing.lg,
    alignItems: "center",
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: KhedmatPalette.blue200,
    borderRadius: Radius.xl,
    backgroundColor: "#F4FBFC",
  },

  noticeIcon: {
    width: 46,
    height: 46,
    flexShrink: 0,
    borderRadius: Radius.lg,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: KhedmatPalette.surface,
  },

  noticeCopy: {
    flex: 1,
    gap: 3,
  },

  noticeTitle: {
    ...Typography.label,
    width: "100%",
    color: KhedmatPalette.textPrimary,
  },

  noticeText: {
    ...Typography.captionStyle,
    width: "100%",
    color: KhedmatPalette.textSecondary,
    lineHeight: 19,
  },

  bookingOpenRow: {
    width: "100%",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.sm,
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: KhedmatPalette.blue200,
  },

  bookingOpenText: {
    ...Typography.label,
    color: KhedmatPalette.blue500,
    fontSize: 13,
  },

  cardPressed: {
    opacity: 0.88,
    transform: [
      {
        scale: 0.99,
      },
    ],
  },
});
