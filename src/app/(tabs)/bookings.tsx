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

import { GlassButton } from "../../components/glass/glass-button";
import { GlassSurface } from "../../components/glass/glass-surface";
import {
  Colors,
  Layout,
  Radius,
  Spacing,
  Typography,
} from "../../constants/theme";
import {
  BookingRecord,
  BookingStatus,
  useBooking,
} from "../../context/booking-context";

type IconName = ComponentProps<typeof Ionicons>["name"];

type BookingFilter =
  | "active"
  | "pending"
  | "completed"
  | "cancelled";

const filters: Array<{
  id: BookingFilter;
  label: string;
}> = [
  {
    id: "active",
    label: "فعال",
  },
  {
    id: "pending",
    label: "در انتظار",
  },
  {
    id: "completed",
    label: "تکمیل‌شده",
  },
  {
    id: "cancelled",
    label: "لغوشده",
  },
];

export default function BookingsScreen() {
  const { bookings } = useBooking();

  const [selectedFilter, setSelectedFilter] =
    useState<BookingFilter>("active");

  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      if (selectedFilter === "active") {
        return (
          booking.status === "confirmed" ||
          booking.status === "in-progress"
        );
      }

      if (selectedFilter === "pending") {
        return booking.status === "pending";
      }

      if (selectedFilter === "completed") {
        return booking.status === "completed";
      }

      return booking.status === "cancelled";
    });
  }, [bookings, selectedFilter]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <Text style={styles.eyebrow}>
            مدیریت درخواست‌ها
          </Text>

          <Text style={styles.title}>
            رزروهای شما
          </Text>

          <Text style={styles.subtitle}>
            درخواست‌های فعال، در انتظار و تکمیل‌شدهٔ خود را مدیریت کنید.
          </Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersRow}
        >
          {filters.map((filter) => {
            const selected =
              selectedFilter === filter.id;

            return (
              <Pressable
                key={filter.id}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                onPress={() =>
                  setSelectedFilter(filter.id)
                }
                style={({ pressed }) => [
                  styles.filterPressable,
                  pressed && styles.pressed,
                ]}
              >
                <GlassSurface
                  variant={
                    selected
                      ? "prominent"
                      : "regular"
                  }
                  radius={Radius.pill}
                  style={[
                    styles.filterSurface,
                    selected &&
                      styles.selectedFilterSurface,
                  ]}
                  contentStyle={styles.filterContent}
                >
                  <Text
                    style={[
                      styles.filterText,
                      selected &&
                        styles.selectedFilterText,
                    ]}
                  >
                    {filter.label}
                  </Text>
                </GlassSurface>
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={styles.summaryRow}>
          <View style={styles.summaryCopy}>
            <Text style={styles.summaryTitle}>
              {getFilterTitle(selectedFilter)}
            </Text>

            <Text style={styles.summarySubtitle}>
              {toDariDigits(
                filteredBookings.length.toString(),
              )}{" "}
              رزرو
            </Text>
          </View>

          <GlassSurface
            variant="regular"
            radius={Radius.pill}
            style={styles.summaryIconSurface}
            contentStyle={styles.summaryIconContent}
          >
            <Ionicons
              name="calendar-outline"
              size={21}
              color={Colors.primary}
            />
          </GlassSurface>
        </View>

        <View style={styles.bookingsList}>
          {filteredBookings.map((booking) => (
            <BookingCard
              key={booking.id}
              booking={booking}
            />
          ))}

          {filteredBookings.length === 0 ? (
            <EmptyBookings
              filter={selectedFilter}
            />
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function BookingCard({
  booking,
}: {
  booking: BookingRecord;
}) {
  const status =
    getStatusConfig(booking.status);

  const providerInitials = getInitials(
    booking.providerName,
  );

  const serviceIcon = getServiceIcon(
    booking.serviceId,
  );

  const formattedDate = formatBookingDate(
    booking.date,
  );

  const formattedTime = formatTimeForDari(
    booking.time,
  );

  const showMessageButton =
    booking.status === "confirmed" ||
    booking.status === "in-progress";

  const showRepeatButton =
    booking.status === "completed";

  return (
    <GlassSurface
      variant="regular"
      radius={Radius.xl}
      style={styles.bookingCard}
      contentStyle={styles.bookingContent}
    >
      <View style={styles.bookingHeader}>
        <View style={styles.bookingIcon}>
          <Ionicons
            name={serviceIcon}
            size={24}
            color={Colors.primary}
          />
        </View>

        <View style={styles.bookingMainCopy}>
          <Text style={styles.bookingService}>
            {booking.serviceName}
          </Text>

          <Text style={styles.bookingCategory}>
            {booking.providerProfession}
          </Text>
        </View>

        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor:
                status.backgroundColor,
            },
          ]}
        >
          <Text
            style={[
              styles.statusText,
              {
                color: status.color,
              },
            ]}
          >
            {status.label}
          </Text>
        </View>
      </View>

      <View style={styles.providerRow}>
        <View style={styles.providerAvatar}>
          <Text style={styles.providerInitials}>
            {providerInitials}
          </Text>

          <View style={styles.verifiedBadge}>
            <Ionicons
              name="checkmark"
              size={10}
              color={Colors.white}
            />
          </View>
        </View>

        <View style={styles.providerCopy}>
          <Text style={styles.providerLabel}>
            ارائه‌دهنده
          </Text>

          <Text style={styles.providerName}>
            {booking.providerName}
          </Text>
        </View>
      </View>

      <View style={styles.details}>
        <BookingDetail
          icon="calendar-outline"
          label="تاریخ"
          value={formattedDate}
        />

        <BookingDetail
          icon="time-outline"
          label="زمان"
          value={formattedTime}
        />

        <BookingDetail
          icon="location-outline"
          label="آدرس"
          value={booking.address.fullAddress}
        />

        <BookingDetail
          icon="cash-outline"
          label="مبلغ"
          value={formatCurrency(booking.total)}
        />
      </View>

      <View style={styles.cardActions}>
        <GlassButton
          label="مشاهده جزئیات"
          icon="document-text-outline"
          iconPosition="left"
          variant="secondary"
          fullWidth={false}
          style={styles.actionButton}
          onPress={() => {
            console.log(
              "Open booking:",
              booking.id,
            );
          }}
        />

        {showMessageButton ? (
          <GlassButton
            label="پیام"
            icon="chatbubble-outline"
            iconPosition="left"
            fullWidth={false}
            style={styles.actionButton}
            onPress={() => {
              console.log(
                "Message provider:",
                booking.providerName,
              );
            }}
          />
        ) : null}

        {showRepeatButton ? (
          <GlassButton
            label="رزرو دوباره"
            icon="refresh-outline"
            iconPosition="left"
            fullWidth={false}
            style={styles.actionButton}
            onPress={() => {
              console.log(
                "Repeat booking:",
                booking.id,
              );
            }}
          />
        ) : null}
      </View>
    </GlassSurface>
  );
}

type BookingDetailProps = {
  icon: IconName;
  label: string;
  value: string;
};

function BookingDetail({
  icon,
  label,
  value,
}: BookingDetailProps) {
  return (
    <View style={styles.detailItem}>
      <View style={styles.detailIcon}>
        <Ionicons
          name={icon}
          size={17}
          color={Colors.textTertiary}
        />
      </View>

      <View style={styles.detailCopy}>
        <Text style={styles.detailLabel}>
          {label}
        </Text>

        <Text
          numberOfLines={3}
          style={styles.detailValue}
        >
          {value}
        </Text>
      </View>
    </View>
  );
}

function EmptyBookings({
  filter,
}: {
  filter: BookingFilter;
}) {
  return (
    <View style={styles.emptyState}>
      <GlassSurface
        variant="regular"
        radius={Radius.xxl}
        style={styles.emptyIconSurface}
        contentStyle={styles.emptyIconContent}
      >
        <Ionicons
          name="calendar-clear-outline"
          size={32}
          color={Colors.textTertiary}
        />
      </GlassSurface>

      <Text style={styles.emptyTitle}>
        {getEmptyTitle(filter)}
      </Text>

      <Text style={styles.emptySubtitle}>
        {getEmptySubtitle(filter)}
      </Text>
    </View>
  );
}

function getFilterTitle(
  filter: BookingFilter,
): string {
  if (filter === "active") {
    return "رزروهای فعال";
  }

  if (filter === "pending") {
    return "در انتظار تأیید";
  }

  if (filter === "completed") {
    return "رزروهای تکمیل‌شده";
  }

  return "رزروهای لغوشده";
}

function getEmptyTitle(
  filter: BookingFilter,
): string {
  if (filter === "active") {
    return "رزرو فعالی ندارید";
  }

  if (filter === "pending") {
    return "درخواستی در انتظار نیست";
  }

  if (filter === "completed") {
    return "هنوز رزروی تکمیل نشده است";
  }

  return "رزرو لغوشده‌ای ندارید";
}

function getEmptySubtitle(
  filter: BookingFilter,
): string {
  if (filter === "active") {
    return "پس از تأیید ارائه‌دهنده، رزروهای فعال شما در اینجا نمایش داده می‌شوند.";
  }

  if (filter === "pending") {
    return "درخواست‌های تازه‌ای که منتظر پاسخ ارائه‌دهنده هستند در این بخش قرار می‌گیرند.";
  }

  if (filter === "completed") {
    return "خدمات انجام‌شده و سابقهٔ رزروهای شما در این بخش نمایش داده می‌شوند.";
  }

  return "رزروهایی که لغو شده‌اند در این قسمت نمایش داده خواهند شد.";
}

function getStatusConfig(
  status: BookingStatus,
) {
  if (status === "confirmed") {
    return {
      label: "تأییدشده",
      color: Colors.primary,
      backgroundColor: Colors.primarySoft,
    };
  }

  if (status === "in-progress") {
    return {
      label: "در حال انجام",
      color: Colors.secondary,
      backgroundColor:
        "rgba(86, 183, 201, 0.12)",
    };
  }

  if (status === "completed") {
    return {
      label: "تکمیل‌شده",
      color: Colors.success,
      backgroundColor:
        "rgba(48, 183, 106, 0.12)",
    };
  }

  if (status === "cancelled") {
    return {
      label: "لغوشده",
      color: Colors.error,
      backgroundColor:
        "rgba(225, 90, 90, 0.12)",
    };
  }

  return {
    label: "در انتظار",
    color: Colors.warning,
    backgroundColor:
      "rgba(217, 154, 43, 0.12)",
  };
}

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0))
    .join("")
    .slice(0, 2);
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
    serviceId.includes("water")
  ) {
    return "water-outline";
  }

  if (serviceId.includes("clean")) {
    return "sparkles-outline";
  }

  if (
    serviceId.includes("computer") ||
    serviceId.includes("software")
  ) {
    return "laptop-outline";
  }

  if (
    serviceId.includes("carpenter") ||
    serviceId.includes("cabinet") ||
    serviceId.includes("door")
  ) {
    return "hammer-outline";
  }

  return "construct-outline";
}

function formatBookingDate(
  value: string,
): string {
  if (!value) {
    return "تاریخ نامشخص";
  }

  const [year, month, day] = value
    .split("-")
    .map(Number);

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

  return `${weekdays[date.getDay()] ?? ""}، ${toDariDigits(
    day.toString(),
  )} ${months[date.getMonth()] ?? ""}`;
}

function formatTimeForDari(
  value: string,
): string {
  const labels: Record<string, string> = {
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
  amount: number,
): string {
  return `${new Intl.NumberFormat(
    "fa-AF",
  ).format(amount)} افغانی`;
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
    paddingHorizontal: Layout.screenPadding,
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

  filtersRow: {
    marginTop: Spacing.xxl,
    flexDirection: "row-reverse",
    gap: Spacing.sm,
    paddingHorizontal: 1,
  },

  filterPressable: {
    borderRadius: Radius.pill,
  },

  filterSurface: {
    minHeight: 42,
  },

  selectedFilterSurface: {
    borderColor:
      "rgba(76, 141, 255, 0.50)",
    backgroundColor: Colors.primarySoft,
  },

  filterContent: {
    minHeight: 42,
    paddingHorizontal: Spacing.md,
    alignItems: "center",
    justifyContent: "center",
  },

  filterText: {
    ...Typography.captionStyle,
    color: Colors.textSecondary,
    textAlign: "center",
    writingDirection: "rtl",
  },

  selectedFilterText: {
    color: Colors.textPrimary,
    fontWeight: "600",
  },

  summaryRow: {
    width: "100%",
    marginTop: Spacing.section,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
  },

  summaryCopy: {
    alignItems: "flex-end",
    gap: 2,
  },

  summaryTitle: {
    ...Typography.sectionTitle,
    color: Colors.textPrimary,
    textAlign: "right",
    writingDirection: "rtl",
    fontSize: 21,
    lineHeight: 28,
  },

  summarySubtitle: {
    ...Typography.captionStyle,
    color: Colors.textTertiary,
    textAlign: "right",
    writingDirection: "rtl",
  },

  summaryIconSurface: {
    width: 44,
    height: 44,
  },

  summaryIconContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  bookingsList: {
    width: "100%",
    marginTop: Spacing.lg,
    gap: Spacing.lg,
  },

  bookingCard: {
    width: "100%",
  },

  bookingContent: {
    padding: Spacing.lg,
  },

  bookingHeader: {
    width: "100%",
    flexDirection: "row-reverse",
    alignItems: "flex-start",
    gap: Spacing.md,
  },

  bookingIcon: {
    width: 50,
    height: 50,
    flexShrink: 0,
    borderRadius: Radius.lg,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primarySoft,
  },

  bookingMainCopy: {
    flex: 1,
    alignItems: "flex-end",
    gap: 3,
  },

  bookingService: {
    ...Typography.sectionTitle,
    width: "100%",
    color: Colors.textPrimary,
    textAlign: "right",
    writingDirection: "rtl",
    fontSize: 18,
    lineHeight: 24,
  },

  bookingCategory: {
    ...Typography.captionStyle,
    width: "100%",
    color: Colors.textTertiary,
    textAlign: "right",
    writingDirection: "rtl",
  },

  statusBadge: {
    flexShrink: 0,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: Radius.pill,
  },

  statusText: {
    ...Typography.captionStyle,
    fontSize: 11,
    textAlign: "center",
    writingDirection: "rtl",
  },

  providerRow: {
    width: "100%",
    marginTop: Spacing.lg,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: Spacing.md,
  },

  providerAvatar: {
    width: 48,
    height: 48,
    flexShrink: 0,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primarySoft,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor:
      "rgba(76, 141, 255, 0.28)",
  },

  providerInitials: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: "700",
  },

  verifiedBadge: {
    position: "absolute",
    right: -2,
    bottom: -2,
    width: 18,
    height: 18,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primary,
    borderWidth: 2,
    borderColor: Colors.backgroundRaised,
  },

  providerCopy: {
    flex: 1,
    alignItems: "flex-end",
    gap: 2,
  },

  providerLabel: {
    ...Typography.captionStyle,
    width: "100%",
    color: Colors.textTertiary,
    textAlign: "right",
    writingDirection: "rtl",
  },

  providerName: {
    ...Typography.label,
    width: "100%",
    color: Colors.textPrimary,
    textAlign: "right",
    writingDirection: "rtl",
    fontSize: 16,
  },

  details: {
    width: "100%",
    marginTop: Spacing.lg,
    paddingVertical: Spacing.md,
    borderTopWidth:
      StyleSheet.hairlineWidth,
    borderBottomWidth:
      StyleSheet.hairlineWidth,
    borderColor: Colors.separator,
    gap: Spacing.md,
  },

  detailItem: {
    width: "100%",
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: Spacing.md,
  },

  detailIcon: {
    width: 34,
    height: 34,
    flexShrink: 0,
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.glass,
  },

  detailCopy: {
    flex: 1,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.md,
  },

  detailLabel: {
    ...Typography.captionStyle,
    color: Colors.textTertiary,
    textAlign: "right",
    writingDirection: "rtl",
  },

  detailValue: {
    ...Typography.label,
    flex: 1,
    color: Colors.textPrimary,
    textAlign: "left",
    writingDirection: "rtl",
  },

  cardActions: {
    width: "100%",
    marginTop: Spacing.lg,
    flexDirection: "row-reverse",
    gap: Spacing.sm,
  },

  actionButton: {
    flex: 1,
  },

  emptyState: {
    minHeight: 360,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.md,
    paddingHorizontal: Spacing.xl,
  },

  emptyIconSurface: {
    width: 78,
    height: 78,
  },

  emptyIconContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  emptyTitle: {
    ...Typography.sectionTitle,
    color: Colors.textPrimary,
    textAlign: "center",
    writingDirection: "rtl",
  },

  emptySubtitle: {
    ...Typography.bodyStyle,
    maxWidth: 350,
    color: Colors.textSecondary,
    textAlign: "center",
    writingDirection: "rtl",
  },

  pressed: {
    opacity: 0.82,
  },
});