import { Ionicons } from "@expo/vector-icons";
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
  label: string;
  booking: BookingRecord | null;
  unavailable: boolean;
};


const CALENDAR_DAYS = 14;

export default function ProviderCalendarScreen() {
  const { bookings } = useBooking();
  const { activeProviderId } = useSession();

  const providerId =
    activeProviderId ?? "provider-1";

  const provider = useMemo(
    () =>
      getProviderById(providerId) ??
      getProviderById("provider-1")!,
    [providerId],
  );

  const dateOptions = useMemo(
    () => createDateOptions(CALENDAR_DAYS),
    [],
  );

  const [selectedDateId, setSelectedDateId] =
    useState(
      dateOptions[0]?.id ?? formatDateId(new Date()),
    );

  const providerBookings = useMemo(
    () =>
      bookings.filter(
        (booking) =>
          booking.providerId === provider.id &&
          booking.status !== "cancelled" &&
          booking.status !== "completed",
      ),
    [bookings, provider.id],
  );

  const selectedDate = useMemo(
    () =>
      dateOptions.find(
        (date) => date.id === selectedDateId,
      ) ?? dateOptions[0],
    [dateOptions, selectedDateId],
  );

  const selectedDayBookings = useMemo(
    () =>
      providerBookings
        .filter(
          (booking) =>
            booking.date === selectedDateId,
        )
        .sort((first, second) =>
          first.time.localeCompare(second.time),
        ),
    [providerBookings, selectedDateId],
  );

  const scheduleSlots = useMemo(
    () =>
      buildScheduleSlots(
        provider.startTime,
        provider.endTime,
        selectedDayBookings,
      ),
    [
      provider.endTime,
      provider.startTime,
      selectedDayBookings,
    ],
  );

  const confirmedCount =
    selectedDayBookings.filter(
      (booking) =>
        booking.status === "confirmed" ||
        booking.status === "in-progress",
    ).length;

  const pendingCount =
    selectedDayBookings.filter(
      (booking) =>
        booking.status === "pending",
    ).length;

  const expectedRevenue =
    selectedDayBookings
      .filter(
        (booking) =>
          booking.status === "confirmed" ||
          booking.status === "in-progress",
      )
      .reduce(
        (total, booking) =>
          total + booking.servicePrice,
        0,
      );

  const freeSlots = scheduleSlots.filter(
    (slot) =>
      !slot.booking && !slot.unavailable,
  ).length;

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
            برنامهٔ کاری
          </Text>

          <Text style={styles.title}>
            تقویم
          </Text>

          <Text style={styles.subtitle}>
            رزروها، درخواست‌های موقت و ساعت‌های
            آزاد خود را برای هر روز بررسی کنید.
          </Text>
        </View>

        <GlassSurface
          variant="prominent"
          radius={Radius.xl}
          style={[
            styles.selectedDateCard,
            Shadows.small,
          ]}
          contentStyle={
            styles.selectedDateContent
          }
        >
          <View style={styles.selectedDateIcon}>
            <Ionicons
              name="calendar-outline"
              size={26}
              color={Colors.primary}
            />
          </View>

          <View style={styles.selectedDateCopy}>
            <Text
              style={styles.selectedDateLabel}
            >
              روز انتخاب‌شده
            </Text>

            <Text
              style={styles.selectedDateTitle}
            >
              {selectedDate
                ? `${selectedDate.weekday}، ${selectedDate.day} ${selectedDate.month}`
                : "نامشخص"}
            </Text>

            <Text
              style={
                styles.selectedDateSubtitle
              }
            >
              ساعت کاری:{" "}
              {formatTimeForDari(
                provider.startTime,
              )}{" "}
              تا{" "}
              {formatTimeForDari(
                provider.endTime,
              )}
            </Text>
          </View>

          <View style={styles.selectedDateCount}>
            <Text
              style={
                styles.selectedDateCountValue
              }
            >
              {toDariDigits(
                selectedDayBookings.length.toString(),
              )}
            </Text>

            <Text
              style={
                styles.selectedDateCountLabel
              }
            >
              رزرو
            </Text>
          </View>
        </GlassSurface>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              انتخاب روز
            </Text>

            <Text
              style={styles.sectionSubtitle}
            >
              چهارده روز آینده
            </Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={
              styles.datesRow
            }
          >
            {dateOptions.map((option) => {
              const selected =
                selectedDateId === option.id;

              const bookingCount =
                providerBookings.filter(
                  (booking) =>
                    booking.date === option.id,
                ).length;

              return (
                <Pressable
                  key={option.id}
                  accessibilityRole="radio"
                  accessibilityState={{
                    selected,
                  }}
                  accessibilityLabel={`${option.weekday} ${option.day} ${option.month}`}
                  onPress={() =>
                    setSelectedDateId(option.id)
                  }
                  style={({ pressed }) => [
                    styles.datePressable,
                    pressed &&
                      styles.cardPressed,
                  ]}
                >
                  <GlassSurface
                    variant={
                      selected
                        ? "prominent"
                        : "regular"
                    }
                    radius={Radius.xl}
                    style={[
                      styles.dateCard,
                      selected &&
                        styles.selectedDateOption,
                    ]}
                    contentStyle={
                      styles.dateContent
                    }
                  >
                    {option.relativeLabel ? (
                      <Text
                        style={[
                          styles.relativeLabel,
                          selected &&
                            styles.selectedDateText,
                        ]}
                      >
                        {option.relativeLabel}
                      </Text>
                    ) : null}

                    <Text
                      style={[
                        styles.weekday,
                        selected &&
                          styles.selectedDateText,
                      ]}
                    >
                      {option.weekday}
                    </Text>

                    <Text
                      style={[
                        styles.dayNumber,
                        selected &&
                          styles.selectedDayNumber,
                      ]}
                    >
                      {option.day}
                    </Text>

                    <Text
                      style={[
                        styles.month,
                        selected &&
                          styles.selectedDateText,
                      ]}
                    >
                      {option.month}
                    </Text>

                    <View
                      style={[
                        styles.bookingCountBadge,
                        bookingCount > 0 &&
                          styles.bookingCountBadgeActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.bookingCountText,
                          bookingCount > 0 &&
                            styles.bookingCountTextActive,
                        ]}
                      >
                        {toDariDigits(
                          bookingCount.toString(),
                        )}
                      </Text>
                    </View>
                  </GlassSurface>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        <View style={styles.metricsGrid}>
          <MetricCard
            icon="checkmark-circle-outline"
            label="تأییدشده"
            value={confirmedCount}
            color={Colors.success}
          />

          <MetricCard
            icon="time-outline"
            label="در انتظار"
            value={pendingCount}
            color={Colors.warning}
          />

          <MetricCard
            icon="calendar-clear-outline"
            label="ساعت آزاد"
            value={freeSlots}
            color={Colors.primary}
          />

          <MetricCard
            icon="cash-outline"
            label="درآمد مورد انتظار"
            textValue={formatCurrency(
              expectedRevenue,
            )}
            color={Colors.secondary}
          />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              برنامهٔ روز
            </Text>

            <View style={styles.legend}>
              <LegendItem
                color={Colors.success}
                label="تأیید"
              />

              <LegendItem
                color={Colors.warning}
                label="موقت"
              />

              <LegendItem
                color={Colors.primary}
                label="آزاد"
              />
            </View>
          </View>

          <View style={styles.scheduleList}>
            {scheduleSlots.map((slot) => (
              <ScheduleRow
                key={slot.id}
                slot={slot}
              />
            ))}
          </View>
        </View>

        <GlassSurface
          variant="regular"
          radius={Radius.xl}
          style={styles.workingHoursCard}
          contentStyle={
            styles.workingHoursContent
          }
        >
          <View style={styles.workingHoursIcon}>
            <Ionicons
              name="time-outline"
              size={24}
              color={Colors.primary}
            />
          </View>

          <View style={styles.workingHoursCopy}>
            <Text
              style={styles.workingHoursTitle}
            >
              برنامهٔ کاری فعلی
            </Text>

            <Text
              style={
                styles.workingHoursSubtitle
              }
            >
              {formatWorkingDays(
                provider.workingDays,
              )}
            </Text>

            <Text
              style={styles.workingHoursTime}
            >
              {formatTimeForDari(
                provider.startTime,
              )}{" "}
              تا{" "}
              {formatTimeForDari(
                provider.endTime,
              )}
            </Text>
          </View>

          <View
            style={styles.scheduleStatusBadge}
          >
            <View
              style={styles.scheduleStatusDot}
            />

            <Text
              style={
                styles.scheduleStatusText
              }
            >
              فعال
            </Text>
          </View>
        </GlassSurface>

        <GlassSurface
          variant="regular"
          radius={Radius.xl}
          style={styles.noticeCard}
          contentStyle={styles.noticeContent}
        >
          <View style={styles.noticeIcon}>
            <Ionicons
              name="information-circle-outline"
              size={23}
              color={Colors.primary}
            />
          </View>

          <Text style={styles.noticeText}>
            درخواست‌های در انتظار تا زمان پذیرش
            به‌عنوان زمان موقت نمایش داده می‌شوند.
            پس از پذیرش، ساعت مربوطه به‌طور کامل
            رزرو خواهد شد.
          </Text>
        </GlassSurface>
      </ScrollView>
    </SafeAreaView>
  );
}

function MetricCard({
  icon,
  label,
  value,
  textValue,
  color,
}: {
  icon: IconName;
  label: string;
  value?: number;
  textValue?: string;
  color: string;
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
            backgroundColor: `${color}18`,
          },
        ]}
      >
        <Ionicons
          name={icon}
          size={20}
          color={color}
        />
      </View>

      <Text
        numberOfLines={1}
        adjustsFontSizeToFit
        style={styles.metricValue}
      >
        {textValue ??
          toDariDigits(
            (value ?? 0).toString(),
          )}
      </Text>

      <Text style={styles.metricLabel}>
        {label}
      </Text>
    </GlassSurface>
  );
}

function LegendItem({
  color,
  label,
}: {
  color: string;
  label: string;
}) {
  return (
    <View style={styles.legendItem}>
      <View
        style={[
          styles.legendDot,
          { backgroundColor: color },
        ]}
      />

      <Text style={styles.legendText}>
        {label}
      </Text>
    </View>
  );
}

function ScheduleRow({
  slot,
}: {
  slot: ScheduleSlot;
}) {
  const booking = slot.booking;

  const status = booking
    ? getScheduleStatus(booking)
    : null;

  return (
    <View style={styles.scheduleRow}>
      <View style={styles.timeColumn}>
        <Text style={styles.timeLabel}>
          {slot.label}
        </Text>

        <View
          style={[
            styles.timelineDot,
            booking
              ? {
                  backgroundColor:
                    status?.color,
                }
              : slot.unavailable
                ? styles.timelineDotUnavailable
                : styles.timelineDotFree,
          ]}
        />

        <View style={styles.timelineLine} />
      </View>

      {booking ? (
        <GlassSurface
          variant={
            booking.status === "pending"
              ? "prominent"
              : "regular"
          }
          radius={Radius.xl}
          style={[
            styles.bookingCard,
            {
              borderColor:
                status?.borderColor,
              backgroundColor:
                status?.backgroundColor,
            },
          ]}
          contentStyle={
            styles.bookingContent
          }
        >
          <View style={styles.bookingIcon}>
            <Ionicons
              name={getServiceIcon(
                booking.serviceId,
              )}
              size={22}
              color={status?.color}
            />
          </View>

          <View style={styles.bookingCopy}>
            <Text
              style={styles.bookingTitle}
            >
              {booking.serviceName}
            </Text>

            <Text
              numberOfLines={1}
              style={
                styles.bookingLocation
              }
            >
              {booking.address.fullAddress}
            </Text>

            <View style={styles.bookingMeta}>
              <Text
                style={styles.bookingPrice}
              >
                {formatCurrency(
                  booking.servicePrice,
                )}
              </Text>

              <View
                style={[
                  styles.bookingStatus,
                  {
                    backgroundColor:
                      status?.badgeBackground,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.bookingStatusText,
                    {
                      color: status?.color,
                    },
                  ]}
                >
                  {status?.label}
                </Text>
              </View>
            </View>
          </View>
        </GlassSurface>
      ) : (
        <GlassSurface
          variant="regular"
          radius={Radius.xl}
          style={[
            styles.freeSlotCard,
            slot.unavailable &&
              styles.unavailableSlotCard,
          ]}
          contentStyle={
            styles.freeSlotContent
          }
        >
          <Ionicons
            name={
              slot.unavailable
                ? "remove-circle-outline"
                : "add-circle-outline"
            }
            size={21}
            color={
              slot.unavailable
                ? Colors.textMuted
                : Colors.primary
            }
          />

          <View style={styles.freeSlotCopy}>
            <Text
              style={[
                styles.freeSlotTitle,
                slot.unavailable &&
                  styles.unavailableSlotText,
              ]}
            >
              {slot.unavailable
                ? "خارج از ساعت کاری"
                : "ساعت آزاد"}
            </Text>

            <Text
              style={styles.freeSlotSubtitle}
            >
              {slot.unavailable
                ? "رزرو در این زمان ممکن نیست."
                : "برای دریافت درخواست جدید آماده است."}
            </Text>
          </View>
        </GlassSurface>
      )}
    </View>
  );
}

function buildScheduleSlots(
  startTime: string,
  endTime: string,
  bookings: BookingRecord[],
): ScheduleSlot[] {
  const startHour =
    Number(startTime.split(":")[0]) || 8;

  const endHour =
    Number(endTime.split(":")[0]) || 17;

  const firstDisplayedHour = Math.max(
    7,
    startHour - 1,
  );

  const finalDisplayedHour = Math.min(
    19,
    endHour + 1,
  );

  const slots: ScheduleSlot[] = [];

  for (
    let hour = firstDisplayedHour;
    hour <= finalDisplayedHour;
    hour += 1
  ) {
    const id = `${String(hour).padStart(
      2,
      "0",
    )}:00`;

    const booking =
      bookings.find(
        (item) => item.time === id,
      ) ?? null;

    slots.push({
      id,
      label: formatTimeForDari(id),
      booking,
      unavailable:
        hour < startHour || hour >= endHour,
    });
  }

  return slots;
}

function getScheduleStatus(
  booking: BookingRecord,
) {
  if (booking.status === "confirmed") {
    return {
      label: "تأییدشده",
      color: Colors.success,
      backgroundColor:
        "rgba(48, 183, 106, 0.05)",
      borderColor:
        "rgba(48, 183, 106, 0.28)",
      badgeBackground:
        "rgba(48, 183, 106, 0.12)",
    };
  }

  if (booking.status === "in-progress") {
    return {
      label: "در حال انجام",
      color: Colors.secondary,
      backgroundColor:
        "rgba(86, 183, 201, 0.05)",
      borderColor:
        "rgba(86, 183, 201, 0.28)",
      badgeBackground:
        "rgba(86, 183, 201, 0.12)",
    };
  }

  return {
    label: "در انتظار",
    color: Colors.warning,
    backgroundColor:
      "rgba(217, 154, 43, 0.05)",
    borderColor:
      "rgba(217, 154, 43, 0.28)",
    badgeBackground:
      "rgba(217, 154, 43, 0.12)",
  };
}

function createDateOptions(
  count: number,
): CalendarDateOption[] {
  const today = startOfDay(new Date());

  return Array.from(
    { length: count },
    (_, index) => {
      const date = new Date(today);
      date.setDate(
        today.getDate() + index,
      );

      return {
        id: formatDateId(date),
        date,
        weekday:
          formatWeekdayDari(date),
        day: toDariDigits(
          date.getDate().toString(),
        ),
        month: formatMonthDari(date),
        relativeLabel:
          index === 0
            ? "امروز"
            : index === 1
              ? "فردا"
              : undefined,
      };
    },
  );
}

function startOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
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

function formatWeekdayDari(
  date: Date,
): string {
  const weekdays = [
    "یک‌شنبه",
    "دوشنبه",
    "سه‌شنبه",
    "چهارشنبه",
    "پنج‌شنبه",
    "جمعه",
    "شنبه",
  ];

  return weekdays[date.getDay()] ?? "";
}

function formatMonthDari(
  date: Date,
): string {
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

  return months[date.getMonth()] ?? "";
}

function formatWorkingDays(
  workingDays: string[],
): string {
  const labels: Record<string, string> = {
    saturday: "شنبه",
    sunday: "یک‌شنبه",
    monday: "دوشنبه",
    tuesday: "سه‌شنبه",
    wednesday: "چهارشنبه",
    thursday: "پنج‌شنبه",
    friday: "جمعه",
  };

  return workingDays
    .map((day) => labels[day] ?? day)
    .join("، ");
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

function formatTimeForDari(
  value: string,
): string {
  const hour = Number(
    value.split(":")[0],
  );

  if (Number.isNaN(hour)) {
    return value;
  }

  if (hour === 12) {
    return "۱۲:۰۰ ظهر";
  }

  if (hour < 12) {
    return `${toDariDigits(
      hour.toString(),
    )}:۰۰ صبح`;
  }

  if (hour < 18) {
    return `${toDariDigits(
      (hour - 12).toString(),
    )}:۰۰ بعد از ظهر`;
  }

  return `${toDariDigits(
    (hour - 12).toString(),
  )}:۰۰ عصر`;
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

  selectedDateCard: {
    width: "100%",
    marginTop: Spacing.xxl,
  },

  selectedDateContent: {
    minHeight: 112,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: Spacing.md,
    padding: Spacing.lg,
  },

  selectedDateIcon: {
    width: 52,
    height: 52,
    flexShrink: 0,
    borderRadius: Radius.lg,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      Colors.primarySoft,
  },

  selectedDateCopy: {
    flex: 1,
    alignItems: "flex-end",
    gap: 3,
  },

  selectedDateLabel: {
    ...Typography.captionStyle,
    width: "100%",
    color: Colors.primary,
    textAlign: "right",
    writingDirection: "rtl",
  },

  selectedDateTitle: {
    ...Typography.sectionTitle,
    width: "100%",
    color: Colors.textPrimary,
    textAlign: "right",
    writingDirection: "rtl",
    fontSize: 19,
    lineHeight: 25,
  },

  selectedDateSubtitle: {
    ...Typography.captionStyle,
    width: "100%",
    color: Colors.textSecondary,
    textAlign: "right",
    writingDirection: "rtl",
  },

  selectedDateCount: {
    width: 54,
    height: 54,
    flexShrink: 0,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      Colors.glassStrong,
  },

  selectedDateCountValue: {
    color: Colors.primary,
    fontSize: 18,
    lineHeight: 22,
    fontWeight: "700",
  },

  selectedDateCountLabel: {
    ...Typography.captionStyle,
    color: Colors.textTertiary,
    fontSize: 9,
    writingDirection: "rtl",
  },

  section: {
    width: "100%",
    marginTop: Spacing.section,
    gap: Spacing.lg,
  },

  sectionHeader: {
    width: "100%",
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.md,
  },

  sectionTitle: {
    ...Typography.sectionTitle,
    color: Colors.textPrimary,
    textAlign: "right",
    writingDirection: "rtl",
    fontSize: 21,
  },

  sectionSubtitle: {
    ...Typography.captionStyle,
    color: Colors.textTertiary,
    textAlign: "left",
    writingDirection: "rtl",
  },

  datesRow: {
    flexDirection: "row-reverse",
    gap: Spacing.sm,
    paddingHorizontal: 1,
  },

  datePressable: {
    width: 100,
    borderRadius: Radius.xl,
  },

  dateCard: {
    width: "100%",
  },

  selectedDateOption: {
    borderColor:
      "rgba(76, 141, 255, 0.54)",
    backgroundColor:
      "rgba(76, 141, 255, 0.10)",
  },

  dateContent: {
    minHeight: 146,
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
    padding: Spacing.md,
  },

  relativeLabel: {
    ...Typography.captionStyle,
    color: Colors.primary,
    fontSize: 10,
    writingDirection: "rtl",
  },

  weekday: {
    ...Typography.captionStyle,
    color: Colors.textSecondary,
    writingDirection: "rtl",
  },

  dayNumber: {
    color: Colors.textPrimary,
    fontSize: 27,
    lineHeight: 34,
    fontWeight: "700",
  },

  month: {
    ...Typography.captionStyle,
    color: Colors.textTertiary,
    writingDirection: "rtl",
  },

  selectedDateText: {
    color: "#DCE9FF",
  },

  selectedDayNumber: {
    color: Colors.white,
  },

  bookingCountBadge: {
    minWidth: 24,
    height: 24,
    marginTop: Spacing.xs,
    paddingHorizontal: 5,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.glass,
  },

  bookingCountBadgeActive: {
    backgroundColor: Colors.primary,
  },

  bookingCountText: {
    color: Colors.textTertiary,
    fontSize: 10,
    fontWeight: "700",
  },

  bookingCountTextActive: {
    color: Colors.white,
  },

  metricsGrid: {
    width: "100%",
    marginTop: Spacing.xl,
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: Spacing.sm,
  },

  metricCard: {
    width: "48.5%",
  },

  metricContent: {
    minHeight: 128,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    padding: Spacing.md,
  },

  metricIcon: {
    width: 40,
    height: 40,
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
    fontSize: 18,
  },

  metricLabel: {
    ...Typography.captionStyle,
    width: "100%",
    color: Colors.textTertiary,
    textAlign: "center",
    writingDirection: "rtl",
  },

  legend: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: Spacing.sm,
  },

  legendItem: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 4,
  },

  legendDot: {
    width: 6,
    height: 6,
    borderRadius: Radius.pill,
  },

  legendText: {
    ...Typography.captionStyle,
    color: Colors.textTertiary,
    fontSize: 10,
    writingDirection: "rtl",
  },

  scheduleList: {
    width: "100%",
  },

  scheduleRow: {
    width: "100%",
    minHeight: 102,
    flexDirection: "row-reverse",
    alignItems: "stretch",
    gap: Spacing.md,
  },

  timeColumn: {
    width: 74,
    flexShrink: 0,
    alignItems: "center",
  },

  timeLabel: {
    ...Typography.captionStyle,
    color: Colors.textSecondary,
    textAlign: "center",
    writingDirection: "rtl",
  },

  timelineDot: {
    width: 11,
    height: 11,
    marginTop: Spacing.sm,
    borderRadius: Radius.pill,
    borderWidth: 2,
    borderColor: Colors.background,
  },

  timelineDotFree: {
    backgroundColor: Colors.primary,
  },

  timelineDotUnavailable: {
    backgroundColor: Colors.textMuted,
  },

  timelineLine: {
    width: 2,
    flex: 1,
    minHeight: 42,
    backgroundColor: Colors.separator,
  },

  bookingCard: {
    flex: 1,
    marginBottom: Spacing.md,
  },

  bookingContent: {
    minHeight: 94,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: Spacing.md,
    padding: Spacing.md,
  },

  bookingIcon: {
    width: 44,
    height: 44,
    flexShrink: 0,
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.glass,
  },

  bookingCopy: {
    flex: 1,
    alignItems: "flex-end",
    gap: 3,
  },

  bookingTitle: {
    ...Typography.label,
    width: "100%",
    color: Colors.textPrimary,
    textAlign: "right",
    writingDirection: "rtl",
    fontSize: 16,
  },

  bookingLocation: {
    ...Typography.captionStyle,
    width: "100%",
    color: Colors.textSecondary,
    textAlign: "right",
    writingDirection: "rtl",
  },

  bookingMeta: {
    width: "100%",
    marginTop: 2,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.sm,
  },

  bookingPrice: {
    ...Typography.captionStyle,
    color: Colors.primary,
    writingDirection: "rtl",
    fontWeight: "600",
  },

  bookingStatus: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.pill,
  },

  bookingStatusText: {
    ...Typography.captionStyle,
    fontSize: 9,
    writingDirection: "rtl",
  },

  freeSlotCard: {
    flex: 1,
    marginBottom: Spacing.md,
  },

  unavailableSlotCard: {
    opacity: 0.46,
  },

  freeSlotContent: {
    minHeight: 82,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: Spacing.md,
    padding: Spacing.md,
  },

  freeSlotCopy: {
    flex: 1,
    alignItems: "flex-end",
    gap: 3,
  },

  freeSlotTitle: {
    ...Typography.label,
    width: "100%",
    color: Colors.primary,
    textAlign: "right",
    writingDirection: "rtl",
  },

  unavailableSlotText: {
    color: Colors.textMuted,
  },

  freeSlotSubtitle: {
    ...Typography.captionStyle,
    width: "100%",
    color: Colors.textTertiary,
    textAlign: "right",
    writingDirection: "rtl",
  },

  workingHoursCard: {
    width: "100%",
    marginTop: Spacing.section,
  },

  workingHoursContent: {
    minHeight: 106,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: Spacing.md,
    padding: Spacing.lg,
  },

  workingHoursIcon: {
    width: 48,
    height: 48,
    flexShrink: 0,
    borderRadius: Radius.lg,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      Colors.primarySoft,
  },

  workingHoursCopy: {
    flex: 1,
    alignItems: "flex-end",
    gap: 3,
  },

  workingHoursTitle: {
    ...Typography.label,
    width: "100%",
    color: Colors.textPrimary,
    textAlign: "right",
    writingDirection: "rtl",
  },

  workingHoursSubtitle: {
    ...Typography.captionStyle,
    width: "100%",
    color: Colors.textSecondary,
    textAlign: "right",
    writingDirection: "rtl",
  },

  workingHoursTime: {
    ...Typography.captionStyle,
    width: "100%",
    color: Colors.primary,
    textAlign: "right",
    writingDirection: "rtl",
    fontWeight: "600",
  },

  scheduleStatusBadge: {
    minHeight: 30,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: Spacing.sm,
    borderRadius: Radius.pill,
    backgroundColor:
      "rgba(48, 183, 106, 0.10)",
  },

  scheduleStatusDot: {
    width: 6,
    height: 6,
    borderRadius: Radius.pill,
    backgroundColor: Colors.success,
  },

  scheduleStatusText: {
    ...Typography.captionStyle,
    color: Colors.success,
    fontSize: 10,
    writingDirection: "rtl",
  },

  noticeCard: {
    width: "100%",
    marginTop: Spacing.lg,
  },

  noticeContent: {
    minHeight: 90,
    flexDirection: "row-reverse",
    alignItems: "flex-start",
    gap: Spacing.md,
    padding: Spacing.lg,
  },

  noticeIcon: {
    width: 42,
    height: 42,
    flexShrink: 0,
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      Colors.primarySoft,
  },

  noticeText: {
    ...Typography.captionStyle,
    flex: 1,
    color: Colors.textSecondary,
    textAlign: "right",
    writingDirection: "rtl",
    lineHeight: 20,
  },

  cardPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.992 }],
  },
});