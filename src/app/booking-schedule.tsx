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

import { GlassButton } from "../components/glass/glass-button";
import { GlassIconButton } from "../components/glass/glass-icon-button";
import { GlassSurface } from "../components/glass/glass-surface";
import {
    Colors,
    Layout,
    Radius,
    Shadows,
    Spacing,
    Typography,
} from "../constants/theme";
import { useBooking } from "../context/booking-context";

type IconName = ComponentProps<typeof Ionicons>["name"];

type DateOption = {
  id: string;
  date: Date;
  weekdayLabel: string;
  dayLabel: string;
  monthLabel: string;
  relativeLabel?: string;
};

type TimeSlot = {
  id: string;
  label: string;
  period: "morning" | "afternoon" | "evening";
  available: boolean;
  recommended?: boolean;
};

const timeSlots: TimeSlot[] = [
  {
    id: "08:00",
    label: "۸:۰۰ صبح",
    period: "morning",
    available: true,
  },
  {
    id: "09:00",
    label: "۹:۰۰ صبح",
    period: "morning",
    available: true,
    recommended: true,
  },
  {
    id: "10:00",
    label: "۱۰:۰۰ صبح",
    period: "morning",
    available: false,
  },
  {
    id: "11:00",
    label: "۱۱:۰۰ صبح",
    period: "morning",
    available: true,
  },
  {
    id: "12:00",
    label: "۱۲:۰۰ ظهر",
    period: "afternoon",
    available: true,
  },
  {
    id: "13:00",
    label: "۱:۰۰ بعد از ظهر",
    period: "afternoon",
    available: false,
  },
  {
    id: "14:00",
    label: "۲:۰۰ بعد از ظهر",
    period: "afternoon",
    available: true,
  },
  {
    id: "15:00",
    label: "۳:۰۰ بعد از ظهر",
    period: "afternoon",
    available: true,
    recommended: true,
  },
  {
    id: "16:00",
    label: "۴:۰۰ بعد از ظهر",
    period: "afternoon",
    available: true,
  },
  {
    id: "17:00",
    label: "۵:۰۰ بعد از ظهر",
    period: "evening",
    available: true,
  },
  {
    id: "18:00",
    label: "۶:۰۰ عصر",
    period: "evening",
    available: false,
  },
];

export default function BookingScheduleScreen() {
  const router = useRouter();

  const {
    bookingDraft,
    updateBookingDraft,
  } = useBooking();

  const dateOptions = useMemo(
    () => createDateOptions(7),
    [],
  );

  const [selectedDateId, setSelectedDateId] = useState(
    bookingDraft.date || dateOptions[0]?.id || "",
  );

  const [selectedTimeId, setSelectedTimeId] = useState(
    bookingDraft.time || "",
  );

  const selectedDate = useMemo(
    () =>
      dateOptions.find(
        (option) => option.id === selectedDateId,
      ) ?? null,
    [dateOptions, selectedDateId],
  );

  const selectedTime = useMemo(
    () =>
      timeSlots.find(
        (slot) => slot.id === selectedTimeId,
      ) ?? null,
    [selectedTimeId],
  );

  const groupedSlots = useMemo(
    () => ({
      morning: timeSlots.filter(
        (slot) => slot.period === "morning",
      ),
      afternoon: timeSlots.filter(
        (slot) => slot.period === "afternoon",
      ),
      evening: timeSlots.filter(
        (slot) => slot.period === "evening",
      ),
    }),
    [],
  );

  const handleDateSelect = (dateId: string) => {
    setSelectedDateId(dateId);
    setSelectedTimeId("");
  };

  const handleContinue = () => {
    if (!selectedDate || !selectedTime) {
      return;
    }

    updateBookingDraft({
      date: selectedDate.id,
      time: selectedTime.id,
    });

    router.push("/booking-details");
  };

  const selectionComplete =
    Boolean(selectedDate) &&
    Boolean(selectedTime);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.topBar}>
          <GlassIconButton
            icon="chevron-back"
            accessibilityLabel="بازگشت"
            onPress={() => router.back()}
          />

          <Text style={styles.stepText}>
            مرحله ۲ از ۴
          </Text>
        </View>

        <View style={styles.header}>
          <Text style={styles.eyebrow}>
            زمان‌بندی رزرو
          </Text>

          <Text style={styles.title}>
            تاریخ و زمان مناسب را انتخاب کنید
          </Text>

          <Text style={styles.subtitle}>
            زمان‌های نمایش‌داده‌شده براساس برنامهٔ کاری ارائه‌دهنده
            هستند.
          </Text>
        </View>

        <GlassSurface
          variant="regular"
          radius={Radius.xl}
          style={styles.bookingSummaryCard}
          contentStyle={styles.bookingSummaryContent}
        >
          <View style={styles.bookingSummaryIcon}>
            <Ionicons
              name="briefcase-outline"
              size={23}
              color={Colors.primary}
            />
          </View>

          <View style={styles.bookingSummaryCopy}>
            <Text style={styles.bookingSummaryEyebrow}>
              رزرو شما
            </Text>

            <Text style={styles.bookingSummaryTitle}>
              {bookingDraft.serviceName || "خدمت انتخاب‌شده"}
            </Text>

            <Text style={styles.bookingSummarySubtitle}>
              {bookingDraft.providerName || "ارائه‌دهنده"} ·{" "}
              {bookingDraft.providerProfession || "متخصص خدمات"}
            </Text>
          </View>
        </GlassSurface>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              انتخاب روز
            </Text>

            <Text style={styles.sectionSubtitle}>
              یکی از روزهای موجود را انتخاب کنید.
            </Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.datesRow}
          >
            {dateOptions.map((option) => {
              const selected =
                option.id === selectedDateId;

              return (
                <Pressable
                  key={option.id}
                  accessibilityRole="radio"
                  accessibilityLabel={`${option.weekdayLabel} ${option.dayLabel} ${option.monthLabel}`}
                  accessibilityState={{ selected }}
                  onPress={() =>
                    handleDateSelect(option.id)
                  }
                  style={({ pressed }) => [
                    styles.datePressable,
                    pressed && styles.cardPressed,
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
                      styles.dateSurface,
                      selected &&
                        styles.selectedDateSurface,
                      selected && Shadows.small,
                    ]}
                    contentStyle={styles.dateContent}
                  >
                    {option.relativeLabel ? (
                      <Text
                        style={[
                          styles.relativeDateLabel,
                          selected &&
                            styles.selectedDateText,
                        ]}
                      >
                        {option.relativeLabel}
                      </Text>
                    ) : null}

                    <Text
                      style={[
                        styles.weekdayLabel,
                        selected &&
                          styles.selectedDateText,
                      ]}
                    >
                      {option.weekdayLabel}
                    </Text>

                    <Text
                      style={[
                        styles.dayNumber,
                        selected &&
                          styles.selectedDayNumber,
                      ]}
                    >
                      {option.dayLabel}
                    </Text>

                    <Text
                      style={[
                        styles.monthLabel,
                        selected &&
                          styles.selectedDateText,
                      ]}
                    >
                      {option.monthLabel}
                    </Text>

                    <View
                      style={[
                        styles.dateSelectionMark,
                        selected &&
                          styles.dateSelectionMarkSelected,
                      ]}
                    >
                      {selected ? (
                        <Ionicons
                          name="checkmark"
                          size={13}
                          color={Colors.white}
                        />
                      ) : null}
                    </View>
                  </GlassSurface>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.availabilityLegend}>
              <View style={styles.legendItem}>
                <View style={styles.availableLegendDot} />

                <Text style={styles.legendText}>
                  موجود
                </Text>
              </View>

              <View style={styles.legendItem}>
                <View style={styles.unavailableLegendDot} />

                <Text style={styles.legendText}>
                  پُر
                </Text>
              </View>
            </View>

            <View style={styles.sectionHeaderCopy}>
              <Text style={styles.sectionTitle}>
                انتخاب زمان
              </Text>

              <Text style={styles.sectionSubtitle}>
                زمان‌های پُر قابل انتخاب نیستند.
              </Text>
            </View>
          </View>

          <TimePeriodSection
            title="صبح"
            icon="sunny-outline"
            slots={groupedSlots.morning}
            selectedTimeId={selectedTimeId}
            onSelect={setSelectedTimeId}
          />

          <TimePeriodSection
            title="بعد از ظهر"
            icon="partly-sunny-outline"
            slots={groupedSlots.afternoon}
            selectedTimeId={selectedTimeId}
            onSelect={setSelectedTimeId}
          />

          <TimePeriodSection
            title="عصر"
            icon="moon-outline"
            slots={groupedSlots.evening}
            selectedTimeId={selectedTimeId}
            onSelect={setSelectedTimeId}
          />
        </View>

        {selectedDate && selectedTime ? (
          <GlassSurface
            variant="prominent"
            radius={Radius.xl}
            style={styles.selectedSummaryCard}
            contentStyle={styles.selectedSummaryContent}
          >
            <View style={styles.selectedSummaryIcon}>
              <Ionicons
                name="calendar-outline"
                size={24}
                color={Colors.primary}
              />
            </View>

            <View style={styles.selectedSummaryCopy}>
              <Text style={styles.selectedSummaryLabel}>
                زمان انتخاب‌شده
              </Text>

              <Text style={styles.selectedSummaryTitle}>
                {selectedDate.weekdayLabel}،{" "}
                {selectedDate.dayLabel}{" "}
                {selectedDate.monthLabel}
              </Text>

              <Text style={styles.selectedSummaryTime}>
                ساعت {selectedTime.label}
              </Text>
            </View>

            <Ionicons
              name="checkmark-circle"
              size={25}
              color={Colors.success}
            />
          </GlassSurface>
        ) : null}

        <GlassSurface
          variant="regular"
          radius={Radius.xl}
          style={styles.noticeCard}
          contentStyle={styles.noticeContent}
        >
          <View style={styles.noticeIcon}>
            <Ionicons
              name="information-circle-outline"
              size={22}
              color={Colors.primary}
            />
          </View>

          <Text style={styles.noticeText}>
            ارسال درخواست به معنی تأیید نهایی رزرو نیست. ارائه‌دهنده
            ابتدا درخواست را بررسی و تأیید می‌کند.
          </Text>
        </GlassSurface>
      </ScrollView>

      <View style={styles.footer}>
        <GlassButton
          label="ادامه و تکمیل جزئیات"
          icon="arrow-back"
          iconPosition="left"
          disabled={!selectionComplete}
          onPress={handleContinue}
        />

        <Text style={styles.footerSummary}>
          {selectedDate && selectedTime
            ? `${selectedDate.weekdayLabel}، ${selectedDate.dayLabel} ${selectedDate.monthLabel} · ${selectedTime.label}`
            : "برای ادامه تاریخ و زمان را انتخاب کنید."}
        </Text>
      </View>
    </SafeAreaView>
  );
}

type TimePeriodSectionProps = {
  title: string;
  icon: IconName;
  slots: TimeSlot[];
  selectedTimeId: string;
  onSelect: (timeId: string) => void;
};

function TimePeriodSection({
  title,
  icon,
  slots,
  selectedTimeId,
  onSelect,
}: TimePeriodSectionProps) {
  return (
    <View style={styles.timePeriod}>
      <View style={styles.timePeriodHeader}>
        <Text style={styles.timePeriodTitle}>
          {title}
        </Text>

        <Ionicons
          name={icon}
          size={18}
          color={Colors.textTertiary}
        />
      </View>

      <View style={styles.timeGrid}>
        {slots.map((slot) => {
          const selected =
            slot.id === selectedTimeId;

          return (
            <Pressable
              key={slot.id}
              accessibilityRole="radio"
              accessibilityLabel={slot.label}
              accessibilityState={{
                selected,
                disabled: !slot.available,
              }}
              disabled={!slot.available}
              onPress={() => onSelect(slot.id)}
              style={({ pressed }) => [
                styles.timePressable,
                pressed &&
                  slot.available &&
                  styles.cardPressed,
                !slot.available &&
                  styles.unavailableTimePressable,
              ]}
            >
              <GlassSurface
                variant={
                  selected
                    ? "prominent"
                    : "regular"
                }
                radius={Radius.lg}
                style={[
                  styles.timeSurface,
                  selected &&
                    styles.selectedTimeSurface,
                ]}
                contentStyle={styles.timeContent}
              >
                {slot.recommended ? (
                  <View style={styles.recommendedBadge}>
                    <Text style={styles.recommendedText}>
                      پیشنهادی
                    </Text>
                  </View>
                ) : null}

                <Text
                  style={[
                    styles.timeLabel,
                    selected &&
                      styles.selectedTimeLabel,
                    !slot.available &&
                      styles.unavailableTimeLabel,
                  ]}
                >
                  {slot.label}
                </Text>

                <View
                  style={[
                    styles.timeStatusDot,
                    slot.available
                      ? styles.timeAvailableDot
                      : styles.timeUnavailableDot,
                    selected &&
                      styles.timeSelectedDot,
                  ]}
                />
              </GlassSurface>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function createDateOptions(
  numberOfDays: number,
): DateOption[] {
  const today = startOfDay(new Date());

  return Array.from(
    { length: numberOfDays },
    (_, index) => {
      const date = new Date(today);
      date.setDate(today.getDate() + index);

      return {
        id: formatDateId(date),
        date,
        weekdayLabel:
          formatWeekdayDari(date),
        dayLabel: toDariDigits(
          date.getDate().toString(),
        ),
        monthLabel: formatMonthDari(date),
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
  const day = String(date.getDate()).padStart(
    2,
    "0",
  );

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

function formatMonthDari(date: Date): string {
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

function toDariDigits(value: string): string {
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
    paddingHorizontal: Layout.screenPadding,
    paddingTop: Spacing.md,
    paddingBottom: 150,
  },

  topBar: {
    minHeight: Layout.minimumTouchTarget,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  stepText: {
    ...Typography.captionStyle,
    color: Colors.textTertiary,
    textAlign: "right",
    writingDirection: "rtl",
  },

  header: {
    width: "100%",
    marginTop: Spacing.xl,
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

  bookingSummaryCard: {
    width: "100%",
    marginTop: Spacing.xxl,
  },

  bookingSummaryContent: {
    minHeight: 96,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: Spacing.md,
    padding: Spacing.lg,
  },

  bookingSummaryIcon: {
    width: 48,
    height: 48,
    flexShrink: 0,
    borderRadius: Radius.lg,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primarySoft,
  },

  bookingSummaryCopy: {
    flex: 1,
    alignItems: "flex-end",
    gap: 2,
  },

  bookingSummaryEyebrow: {
    ...Typography.captionStyle,
    width: "100%",
    color: Colors.primary,
    textAlign: "right",
    writingDirection: "rtl",
  },

  bookingSummaryTitle: {
    ...Typography.label,
    width: "100%",
    color: Colors.textPrimary,
    textAlign: "right",
    writingDirection: "rtl",
    fontSize: 17,
    lineHeight: 23,
  },

  bookingSummarySubtitle: {
    ...Typography.captionStyle,
    width: "100%",
    color: Colors.textSecondary,
    textAlign: "right",
    writingDirection: "rtl",
  },

  section: {
    width: "100%",
    marginTop: Spacing.section,
    gap: Spacing.lg,
  },

  sectionHeader: {
    width: "100%",
    alignItems: "flex-end",
    gap: Spacing.xs,
  },

  sectionHeaderRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: Spacing.md,
  },

  sectionHeaderCopy: {
    flex: 1,
    alignItems: "flex-end",
    gap: Spacing.xs,
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

  datesRow: {
    flexDirection: "row-reverse",
    gap: Spacing.sm,
    paddingHorizontal: 1,
  },

  datePressable: {
    width: 104,
    borderRadius: Radius.xl,
  },

  dateSurface: {
    width: "100%",
  },

  selectedDateSurface: {
    borderColor: "rgba(76, 141, 255, 0.58)",
    backgroundColor: "rgba(76, 141, 255, 0.11)",
  },

  dateContent: {
    minHeight: 142,
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
    padding: Spacing.md,
  },

  relativeDateLabel: {
    ...Typography.captionStyle,
    color: Colors.primary,
    textAlign: "center",
    writingDirection: "rtl",
    fontSize: 11,
  },

  weekdayLabel: {
    ...Typography.captionStyle,
    color: Colors.textSecondary,
    textAlign: "center",
    writingDirection: "rtl",
  },

  dayNumber: {
    color: Colors.textPrimary,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "700",
  },

  monthLabel: {
    ...Typography.captionStyle,
    color: Colors.textTertiary,
    textAlign: "center",
    writingDirection: "rtl",
  },

  selectedDateText: {
    color: "#DCE9FF",
  },

  selectedDayNumber: {
    color: Colors.white,
  },

  dateSelectionMark: {
    width: 22,
    height: 22,
    marginTop: Spacing.xs,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.borderStrong,
    backgroundColor: Colors.glass,
  },

  dateSelectionMarkSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary,
  },

  availabilityLegend: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },

  legendItem: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 5,
  },

  availableLegendDot: {
    width: 7,
    height: 7,
    borderRadius: Radius.pill,
    backgroundColor: Colors.success,
  },

  unavailableLegendDot: {
    width: 7,
    height: 7,
    borderRadius: Radius.pill,
    backgroundColor: Colors.textMuted,
  },

  legendText: {
    ...Typography.captionStyle,
    color: Colors.textTertiary,
    writingDirection: "rtl",
    fontSize: 11,
  },

  timePeriod: {
    width: "100%",
    gap: Spacing.md,
  },

  timePeriodHeader: {
    width: "100%",
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: Spacing.sm,
  },

  timePeriodTitle: {
    ...Typography.label,
    color: Colors.textSecondary,
    textAlign: "right",
    writingDirection: "rtl",
  },

  timeGrid: {
    width: "100%",
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: Spacing.sm,
  },

  timePressable: {
    width: "31.5%",
    minWidth: 98,
    borderRadius: Radius.lg,
  },

  unavailableTimePressable: {
    opacity: 0.42,
  },

  timeSurface: {
    width: "100%",
  },

  selectedTimeSurface: {
    borderColor: "rgba(76, 141, 255, 0.58)",
    backgroundColor: "rgba(76, 141, 255, 0.11)",
  },

  timeContent: {
    minHeight: 76,
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.md,
  },

  timeLabel: {
    ...Typography.label,
    width: "100%",
    color: Colors.textPrimary,
    textAlign: "center",
    writingDirection: "rtl",
    fontSize: 14,
  },

  selectedTimeLabel: {
    color: "#DCE9FF",
  },

  unavailableTimeLabel: {
    color: Colors.textMuted,
    textDecorationLine: "line-through",
  },

  timeStatusDot: {
    width: 6,
    height: 6,
    borderRadius: Radius.pill,
  },

  timeAvailableDot: {
    backgroundColor: Colors.success,
  },

  timeUnavailableDot: {
    backgroundColor: Colors.textMuted,
  },

  timeSelectedDot: {
    backgroundColor: Colors.primary,
  },

  recommendedBadge: {
    position: "absolute",
    top: 5,
    right: 5,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: Radius.pill,
    backgroundColor: Colors.primarySoft,
  },

  recommendedText: {
    color: Colors.primary,
    fontSize: 8,
    fontWeight: "600",
    writingDirection: "rtl",
  },

  selectedSummaryCard: {
    width: "100%",
    marginTop: Spacing.section,
    borderColor: "rgba(48, 183, 106, 0.30)",
    backgroundColor: "rgba(48, 183, 106, 0.06)",
  },

  selectedSummaryContent: {
    minHeight: 100,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: Spacing.md,
    padding: Spacing.lg,
  },

  selectedSummaryIcon: {
    width: 48,
    height: 48,
    flexShrink: 0,
    borderRadius: Radius.lg,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primarySoft,
  },

  selectedSummaryCopy: {
    flex: 1,
    alignItems: "flex-end",
    gap: 2,
  },

  selectedSummaryLabel: {
    ...Typography.captionStyle,
    width: "100%",
    color: Colors.success,
    textAlign: "right",
    writingDirection: "rtl",
  },

  selectedSummaryTitle: {
    ...Typography.label,
    width: "100%",
    color: Colors.textPrimary,
    textAlign: "right",
    writingDirection: "rtl",
    fontSize: 16,
  },

  selectedSummaryTime: {
    ...Typography.captionStyle,
    width: "100%",
    color: Colors.textSecondary,
    textAlign: "right",
    writingDirection: "rtl",
  },

  noticeCard: {
    width: "100%",
    marginTop: Spacing.xl,
  },

  noticeContent: {
    minHeight: 88,
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
    backgroundColor: Colors.primarySoft,
  },

  noticeText: {
    ...Typography.captionStyle,
    flex: 1,
    color: Colors.textSecondary,
    textAlign: "right",
    writingDirection: "rtl",
    lineHeight: 20,
  },

  footer: {
    position: "absolute",
    right: 0,
    bottom: 0,
    left: 0,
    minHeight: 104,
    paddingHorizontal: Layout.screenPadding,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
    gap: Spacing.sm,
    backgroundColor: "rgba(7, 10, 15, 0.96)",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.border,
  },

  footerSummary: {
    ...Typography.captionStyle,
    width: "100%",
    color: Colors.textTertiary,
    textAlign: "center",
    writingDirection: "rtl",
  },

  cardPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.988 }],
  },
});