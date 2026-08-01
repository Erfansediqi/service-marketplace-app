import { Ionicons } from "@expo/vector-icons";
import { ComponentProps, useMemo, useState } from "react";
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
    Spacing,
    Typography
} from "../../constants/theme";
import {
    BookingRecord,
    BookingStatus,
    useBooking,
} from "../../context/booking-context";

type IconName =
  ComponentProps<typeof Ionicons>["name"];

type RequestFilter =
  | "pending"
  | "active"
  | "completed"
  | "cancelled";


const filters: Array<{
  id: RequestFilter;
  label: string;
}> = [
  {
    id: "pending",
    label: "جدید",
  },
  {
    id: "active",
    label: "فعال",
  },
  {
    id: "completed",
    label: "تکمیل‌شده",
  },
  {
    id: "cancelled",
    label: "رد و لغو",
  },
];

export default function ProviderRequestsScreen() {
  const {
    bookings,
    updateBookingStatus,
  } = useBooking();

  const { activeProviderId } = useSession();

  const providerId =
    activeProviderId ?? "provider-1";

  const [selectedFilter, setSelectedFilter] =
    useState<RequestFilter>("pending");

  const [expandedBookingId, setExpandedBookingId] =
    useState<string | null>(null);

  const providerBookings = useMemo(
    () =>
      bookings.filter(
        (booking) =>
          booking.providerId === providerId,
      ),
    [bookings, providerId],
  );

  const filteredBookings = useMemo(() => {
    return providerBookings
      .filter((booking) => {
        if (selectedFilter === "pending") {
          return booking.status === "pending";
        }

        if (selectedFilter === "active") {
          return (
            booking.status === "confirmed" ||
            booking.status === "in-progress"
          );
        }

        if (selectedFilter === "completed") {
          return booking.status === "completed";
        }

        return booking.status === "cancelled";
      })
      .sort((first, second) =>
        `${first.date}-${first.time}`.localeCompare(
          `${second.date}-${second.time}`,
        ),
      );
  }, [providerBookings, selectedFilter]);

  const counts = useMemo(
    () => ({
      pending: providerBookings.filter(
        (booking) =>
          booking.status === "pending",
      ).length,

      active: providerBookings.filter(
        (booking) =>
          booking.status === "confirmed" ||
          booking.status === "in-progress",
      ).length,

      completed: providerBookings.filter(
        (booking) =>
          booking.status === "completed",
      ).length,

      cancelled: providerBookings.filter(
        (booking) =>
          booking.status === "cancelled",
      ).length,
    }),
    [providerBookings],
  );

  const handleAccept = (
    booking: BookingRecord,
  ) => {
    Alert.alert(
      "پذیرش درخواست",
      `آیا می‌خواهید درخواست «${booking.serviceName}» را بپذیرید؟`,
      [
        {
          text: "لغو",
          style: "cancel",
        },
        {
          text: "پذیرش",
          onPress: () => {
            updateBookingStatus(
              booking.id,
              "confirmed",
            );

            setExpandedBookingId(null);
          },
        },
      ],
    );
  };

  const handleReject = (
    booking: BookingRecord,
  ) => {
    Alert.alert(
      "رد درخواست",
      "با رد درخواست، مشتری باید ارائه‌دهندهٔ دیگری انتخاب کند.",
      [
        {
          text: "بازگشت",
          style: "cancel",
        },
        {
          text: "رد درخواست",
          style: "destructive",
          onPress: () => {
            updateBookingStatus(
              booking.id,
              "cancelled",
            );

            setExpandedBookingId(null);
          },
        },
      ],
    );
  };

  const handleStartWork = (
    booking: BookingRecord,
  ) => {
    Alert.alert(
      "شروع کار",
      "آیا در محل حاضر شده‌اید و می‌خواهید وضعیت کار را به «در حال انجام» تغییر دهید؟",
      [
        {
          text: "لغو",
          style: "cancel",
        },
        {
          text: "شروع کار",
          onPress: () => {
            updateBookingStatus(
              booking.id,
              "in-progress",
            );
          },
        },
      ],
    );
  };

  const handleCompleteWork = (
    booking: BookingRecord,
  ) => {
    Alert.alert(
      "تکمیل خدمت",
      "پس از تکمیل، این رزرو وارد سابقهٔ کارهای تکمیل‌شده می‌شود.",
      [
        {
          text: "لغو",
          style: "cancel",
        },
        {
          text: "تکمیل شد",
          onPress: () => {
            updateBookingStatus(
              booking.id,
              "completed",
            );
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
            مدیریت کارها
          </Text>

          <Text style={styles.title}>
            درخواست‌ها
          </Text>

          <Text style={styles.subtitle}>
            درخواست‌های تازه را بررسی کنید و
            وضعیت کارهای پذیرفته‌شده را مدیریت
            نمایید.
          </Text>
        </View>

        <View style={styles.overviewGrid}>
          <OverviewCard
            icon="time-outline"
            label="درخواست جدید"
            value={counts.pending}
            color={Colors.warning}
          />

          <OverviewCard
            icon="briefcase-outline"
            label="کار فعال"
            value={counts.active}
            color={Colors.primary}
          />

          <OverviewCard
            icon="checkmark-circle-outline"
            label="تکمیل‌شده"
            value={counts.completed}
            color={Colors.success}
          />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={
            styles.filtersRow
          }
          style={styles.filtersScroll}
        >
          {filters.map((filter) => {
            const selected =
              selectedFilter === filter.id;

            const count = counts[filter.id];

            return (
              <Pressable
                key={filter.id}
                accessibilityRole="button"
                accessibilityState={{
                  selected,
                }}
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
                  contentStyle={
                    styles.filterContent
                  }
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

                  {count > 0 ? (
                    <View
                      style={[
                        styles.filterBadge,
                        selected &&
                          styles.selectedFilterBadge,
                      ]}
                    >
                      <Text
                        style={[
                          styles.filterBadgeText,
                          selected &&
                            styles.selectedFilterBadgeText,
                        ]}
                      >
                        {toDariDigits(
                          count.toString(),
                        )}
                      </Text>
                    </View>
                  ) : null}
                </GlassSurface>
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={styles.resultsHeader}>
          <Text style={styles.resultsCount}>
            {toDariDigits(
              filteredBookings.length.toString(),
            )}{" "}
            درخواست
          </Text>

          <Text style={styles.resultsTitle}>
            {getFilterTitle(selectedFilter)}
          </Text>
        </View>

        <View style={styles.requestsList}>
          {filteredBookings.map((booking) => (
            <ProviderRequestCard
              key={booking.id}
              booking={booking}
              expanded={
                expandedBookingId === booking.id
              }
              onToggle={() =>
                setExpandedBookingId(
                  expandedBookingId === booking.id
                    ? null
                    : booking.id,
                )
              }
              onAccept={() =>
                handleAccept(booking)
              }
              onReject={() =>
                handleReject(booking)
              }
              onStart={() =>
                handleStartWork(booking)
              }
              onComplete={() =>
                handleCompleteWork(booking)
              }
            />
          ))}

          {filteredBookings.length === 0 ? (
            <EmptyRequests
              filter={selectedFilter}
            />
          ) : null}
        </View>

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
            پیش از پذیرش، تاریخ، زمان، آدرس،
            توضیحات و هزینهٔ تخمینی درخواست را
            دقیق بررسی کنید.
          </Text>
        </GlassSurface>
      </ScrollView>
    </SafeAreaView>
  );
}

function OverviewCard({
  icon,
  label,
  value,
  color,
}: {
  icon: IconName;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <GlassSurface
      variant="regular"
      radius={Radius.xl}
      style={styles.overviewCard}
      contentStyle={styles.overviewContent}
    >
      <View
        style={[
          styles.overviewIcon,
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

      <Text style={styles.overviewValue}>
        {toDariDigits(value.toString())}
      </Text>

      <Text style={styles.overviewLabel}>
        {label}
      </Text>
    </GlassSurface>
  );
}

function ProviderRequestCard({
  booking,
  expanded,
  onToggle,
  onAccept,
  onReject,
  onStart,
  onComplete,
}: {
  booking: BookingRecord;
  expanded: boolean;
  onToggle: () => void;
  onAccept: () => void;
  onReject: () => void;
  onStart: () => void;
  onComplete: () => void;
}) {
  const status =
    getStatusConfig(booking.status);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={booking.serviceName}
      onPress={onToggle}
      style={({ pressed }) => [
        styles.requestPressable,
        pressed && styles.cardPressed,
      ]}
    >
      <GlassSurface
        variant={
          booking.status === "pending"
            ? "prominent"
            : "regular"
        }
        radius={Radius.xl}
        style={[
          styles.requestCard,
          booking.status === "pending" &&
            styles.pendingRequestCard,
        ]}
        contentStyle={styles.requestContent}
      >
        <View style={styles.requestHeader}>
          <View style={styles.serviceIcon}>
            <Ionicons
              name={getServiceIcon(
                booking.serviceId,
              )}
              size={24}
              color={Colors.primary}
            />
          </View>

          <View style={styles.requestMainCopy}>
            <Text style={styles.requestTitle}>
              {booking.serviceName}
            </Text>

            <Text
              style={styles.requestReference}
            >
              شماره درخواست:{" "}
              {getShortBookingId(booking.id)}
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

        <View style={styles.summaryGrid}>
          <RequestSummary
            icon="calendar-outline"
            label="تاریخ"
            value={formatBookingDate(
              booking.date,
            )}
          />

          <RequestSummary
            icon="time-outline"
            label="زمان"
            value={formatTimeForDari(
              booking.time,
            )}
          />

          <RequestSummary
            icon="location-outline"
            label="محل"
            value={booking.address.label}
          />

          <RequestSummary
            icon="cash-outline"
            label="هزینه تخمینی"
            value={formatCurrency(
              booking.servicePrice,
            )}
          />
        </View>

        {expanded ? (
          <View style={styles.expandedContent}>
            <View style={styles.divider} />

            <DetailSection
              icon="location-outline"
              title="آدرس انجام خدمت"
            >
              <Text style={styles.detailText}>
                {booking.address.fullAddress}
              </Text>
            </DetailSection>

            <View style={styles.smallDivider} />

            <DetailSection
              icon="document-text-outline"
              title="توضیحات مشتری"
            >
              <Text style={styles.detailText}>
                {booking.notes ||
                  "مشتری توضیح اضافی وارد نکرده است."}
              </Text>
            </DetailSection>

            <View style={styles.smallDivider} />

            <DetailSection
              icon="receipt-outline"
              title="خلاصه هزینه"
            >
              <View style={styles.priceRows}>
                <PriceRow
                  label="هزینه خدمت"
                  value={formatCurrency(
                    booking.servicePrice,
                  )}
                />

                <PriceRow
                  label="هزینه پلتفرم"
                  value={formatCurrency(
                    booking.platformFee,
                  )}
                />

                <PriceRow
                  label="مجموع مشتری"
                  value={formatCurrency(
                    booking.total,
                  )}
                  emphasized
                />
              </View>
            </DetailSection>

            <View style={styles.actions}>
              {booking.status === "pending" ? (
                <>
                  <GlassButton
                    label="پذیرش درخواست"
                    icon="checkmark-circle-outline"
                    iconPosition="left"
                    onPress={onAccept}
                    style={styles.primaryAction}
                  />

                  <GlassButton
                    label="رد"
                    icon="close-circle-outline"
                    iconPosition="left"
                    variant="destructive"
                    fullWidth={false}
                    onPress={onReject}
                    style={styles.secondaryAction}
                  />
                </>
              ) : null}

              {booking.status === "confirmed" ? (
                <GlassButton
                  label="شروع کار"
                  icon="play-circle-outline"
                  iconPosition="left"
                  onPress={onStart}
                />
              ) : null}

              {booking.status === "in-progress" ? (
                <GlassButton
                  label="تکمیل خدمت"
                  icon="checkmark-done-outline"
                  iconPosition="left"
                  onPress={onComplete}
                />
              ) : null}

              {booking.status === "completed" ? (
                <View
                  style={
                    styles.completedMessage
                  }
                >
                  <Ionicons
                    name="checkmark-circle"
                    size={21}
                    color={Colors.success}
                  />

                  <Text
                    style={
                      styles.completedMessageText
                    }
                  >
                    این خدمت تکمیل شده است.
                  </Text>
                </View>
              ) : null}

              {booking.status === "cancelled" ? (
                <View
                  style={
                    styles.cancelledMessage
                  }
                >
                  <Ionicons
                    name="close-circle-outline"
                    size={21}
                    color={Colors.error}
                  />

                  <Text
                    style={
                      styles.cancelledMessageText
                    }
                  >
                    این درخواست رد یا لغو شده
                    است.
                  </Text>
                </View>
              ) : null}
            </View>
          </View>
        ) : null}

        <View style={styles.expandRow}>
          <Ionicons
            name={
              expanded
                ? "chevron-up"
                : "chevron-down"
            }
            size={17}
            color={Colors.primary}
          />

          <Text style={styles.expandText}>
            {expanded
              ? "بستن جزئیات"
              : "مشاهده جزئیات"}
          </Text>
        </View>
      </GlassSurface>
    </Pressable>
  );
}

function RequestSummary({
  icon,
  label,
  value,
}: {
  icon: IconName;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.summaryItem}>
      <View style={styles.summaryIcon}>
        <Ionicons
          name={icon}
          size={16}
          color={Colors.textTertiary}
        />
      </View>

      <View style={styles.summaryCopy}>
        <Text style={styles.summaryLabel}>
          {label}
        </Text>

        <Text
          numberOfLines={2}
          style={styles.summaryValue}
        >
          {value}
        </Text>
      </View>
    </View>
  );
}

function DetailSection({
  icon,
  title,
  children,
}: {
  icon: IconName;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.detailSection}>
      <View style={styles.detailHeader}>
        <Ionicons
          name={icon}
          size={18}
          color={Colors.primary}
        />

        <Text style={styles.detailTitle}>
          {title}
        </Text>
      </View>

      {children}
    </View>
  );
}

function PriceRow({
  label,
  value,
  emphasized = false,
}: {
  label: string;
  value: string;
  emphasized?: boolean;
}) {
  return (
    <View style={styles.priceRow}>
      <Text
        style={[
          styles.priceValue,
          emphasized &&
            styles.priceValueEmphasized,
        ]}
      >
        {value}
      </Text>

      <Text
        style={[
          styles.priceLabel,
          emphasized &&
            styles.priceLabelEmphasized,
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

function EmptyRequests({
  filter,
}: {
  filter: RequestFilter;
}) {
  return (
    <View style={styles.emptyState}>
      <GlassSurface
        variant="regular"
        radius={Radius.xxl}
        style={styles.emptyIconSurface}
        contentStyle={
          styles.emptyIconContent
        }
      >
        <Ionicons
          name={getEmptyIcon(filter)}
          size={34}
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
  filter: RequestFilter,
): string {
  if (filter === "pending") {
    return "درخواست‌های تازه";
  }

  if (filter === "active") {
    return "کارهای فعال";
  }

  if (filter === "completed") {
    return "کارهای تکمیل‌شده";
  }

  return "درخواست‌های رد یا لغوشده";
}

function getEmptyIcon(
  filter: RequestFilter,
): IconName {
  if (filter === "pending") {
    return "file-tray-outline";
  }

  if (filter === "active") {
    return "briefcase-outline";
  }

  if (filter === "completed") {
    return "checkmark-done-outline";
  }

  return "close-circle-outline";
}

function getEmptyTitle(
  filter: RequestFilter,
): string {
  if (filter === "pending") {
    return "درخواست تازه‌ای ندارید";
  }

  if (filter === "active") {
    return "کار فعالی ندارید";
  }

  if (filter === "completed") {
    return "هنوز کاری تکمیل نشده است";
  }

  return "درخواست رد یا لغوشده‌ای نیست";
}

function getEmptySubtitle(
  filter: RequestFilter,
): string {
  if (filter === "pending") {
    return "درخواست‌های تازه مشتریان در این بخش نمایش داده می‌شوند.";
  }

  if (filter === "active") {
    return "درخواست‌های پذیرفته‌شده و در حال انجام در این بخش قرار می‌گیرند.";
  }

  if (filter === "completed") {
    return "پس از تکمیل خدمت، سابقهٔ آن در این بخش نمایش داده می‌شود.";
  }

  return "درخواست‌هایی که رد یا لغو شوند در این قسمت قرار خواهند گرفت.";
}

function getStatusConfig(
  status: BookingStatus,
) {
  if (status === "confirmed") {
    return {
      label: "پذیرفته‌شده",
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
      label: "رد یا لغو",
      color: Colors.error,
      backgroundColor:
        "rgba(225, 90, 90, 0.12)",
    };
  }

  return {
    label: "جدید",
    color: Colors.warning,
    backgroundColor:
      "rgba(217, 154, 43, 0.12)",
  };
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

function getShortBookingId(
  bookingId: string,
): string {
  const finalPart =
    bookingId.split("-").pop() ??
    bookingId;

  return toDariDigits(
    finalPart.slice(-8),
  );
}

function formatBookingDate(
  value: string,
): string {
  if (!value) {
    return "نامشخص";
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

  overviewGrid: {
    width: "100%",
    marginTop: Spacing.xxl,
    flexDirection: "row-reverse",
    gap: Spacing.sm,
  },

  overviewCard: {
    flex: 1,
  },

  overviewContent: {
    minHeight: 116,
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    padding: Spacing.sm,
  },

  overviewIcon: {
    width: 38,
    height: 38,
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
  },

  overviewValue: {
    ...Typography.sectionTitle,
    color: Colors.textPrimary,
    textAlign: "center",
    fontSize: 19,
  },

  overviewLabel: {
    ...Typography.captionStyle,
    width: "100%",
    color: Colors.textTertiary,
    textAlign: "center",
    writingDirection: "rtl",
    fontSize: 10,
  },

  filtersScroll: {
    marginTop: Spacing.xl,
  },

  filtersRow: {
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
    backgroundColor:
      Colors.primarySoft,
  },

  filterContent: {
    minHeight: 42,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },

  filterText: {
    ...Typography.captionStyle,
    color: Colors.textSecondary,
    writingDirection: "rtl",
  },

  selectedFilterText: {
    color: Colors.textPrimary,
    fontWeight: "600",
  },

  filterBadge: {
    minWidth: 20,
    height: 20,
    paddingHorizontal: 5,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.glassStrong,
  },

  selectedFilterBadge: {
    backgroundColor: Colors.primary,
  },

  filterBadgeText: {
    color: Colors.textSecondary,
    fontSize: 9,
    fontWeight: "700",
  },

  selectedFilterBadgeText: {
    color: Colors.white,
  },

  resultsHeader: {
    width: "100%",
    marginTop: Spacing.section,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  resultsCount: {
    ...Typography.captionStyle,
    color: Colors.textTertiary,
    writingDirection: "rtl",
  },

  resultsTitle: {
    ...Typography.sectionTitle,
    color: Colors.textPrimary,
    textAlign: "right",
    writingDirection: "rtl",
    fontSize: 21,
  },

  requestsList: {
    width: "100%",
    marginTop: Spacing.lg,
    gap: Spacing.md,
  },

  requestPressable: {
    width: "100%",
    borderRadius: Radius.xl,
  },

  requestCard: {
    width: "100%",
  },

  pendingRequestCard: {
    borderColor:
      "rgba(217, 154, 43, 0.34)",
    backgroundColor:
      "rgba(217, 154, 43, 0.05)",
  },

  requestContent: {
    padding: Spacing.lg,
  },

  requestHeader: {
    width: "100%",
    flexDirection: "row-reverse",
    alignItems: "flex-start",
    gap: Spacing.md,
  },

  serviceIcon: {
    width: 50,
    height: 50,
    flexShrink: 0,
    borderRadius: Radius.lg,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      Colors.primarySoft,
  },

  requestMainCopy: {
    flex: 1,
    alignItems: "flex-end",
    gap: 3,
  },

  requestTitle: {
    ...Typography.sectionTitle,
    width: "100%",
    color: Colors.textPrimary,
    textAlign: "right",
    writingDirection: "rtl",
    fontSize: 18,
    lineHeight: 24,
  },

  requestReference: {
    ...Typography.captionStyle,
    width: "100%",
    color: Colors.textTertiary,
    textAlign: "right",
    writingDirection: "rtl",
    fontSize: 10,
  },

  statusBadge: {
    flexShrink: 0,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: Radius.pill,
  },

  statusText: {
    ...Typography.captionStyle,
    fontSize: 10,
    textAlign: "center",
    writingDirection: "rtl",
  },

  summaryGrid: {
    width: "100%",
    marginTop: Spacing.lg,
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: Spacing.md,
  },

  summaryItem: {
    width: "48%",
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: Spacing.sm,
  },

  summaryIcon: {
    width: 34,
    height: 34,
    flexShrink: 0,
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.glass,
  },

  summaryCopy: {
    flex: 1,
    alignItems: "flex-end",
    gap: 1,
  },

  summaryLabel: {
    ...Typography.captionStyle,
    width: "100%",
    color: Colors.textTertiary,
    textAlign: "right",
    writingDirection: "rtl",
    fontSize: 10,
  },

  summaryValue: {
    ...Typography.captionStyle,
    width: "100%",
    color: Colors.textPrimary,
    textAlign: "right",
    writingDirection: "rtl",
    fontWeight: "600",
  },

  expandedContent: {
    width: "100%",
  },

  divider: {
    width: "100%",
    height: StyleSheet.hairlineWidth,
    marginVertical: Spacing.lg,
    backgroundColor: Colors.separator,
  },

  smallDivider: {
    width: "100%",
    height: StyleSheet.hairlineWidth,
    marginVertical: Spacing.md,
    backgroundColor: Colors.separator,
  },

  detailSection: {
    width: "100%",
    alignItems: "flex-end",
    gap: Spacing.sm,
  },

  detailHeader: {
    width: "100%",
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: Spacing.sm,
  },

  detailTitle: {
    ...Typography.label,
    color: Colors.textPrimary,
    textAlign: "right",
    writingDirection: "rtl",
  },

  detailText: {
    ...Typography.bodyStyle,
    width: "100%",
    color: Colors.textSecondary,
    textAlign: "right",
    writingDirection: "rtl",
    lineHeight: 24,
  },

  priceRows: {
    width: "100%",
    gap: Spacing.sm,
  },

  priceRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.md,
  },

  priceLabel: {
    ...Typography.captionStyle,
    color: Colors.textSecondary,
    textAlign: "right",
    writingDirection: "rtl",
  },

  priceValue: {
    ...Typography.label,
    color: Colors.textPrimary,
    textAlign: "left",
    writingDirection: "rtl",
  },

  priceLabelEmphasized: {
    color: Colors.textPrimary,
    fontWeight: "700",
  },

  priceValueEmphasized: {
    color: Colors.primary,
    fontSize: 17,
  },

  actions: {
    width: "100%",
    marginTop: Spacing.lg,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: Spacing.sm,
  },

  primaryAction: {
    flex: 1,
  },

  secondaryAction: {
    minWidth: 98,
  },

  completedMessage: {
    width: "100%",
    minHeight: 48,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    borderRadius: Radius.lg,
    backgroundColor:
      "rgba(48, 183, 106, 0.10)",
  },

  completedMessageText: {
    ...Typography.label,
    color: Colors.success,
    writingDirection: "rtl",
  },

  cancelledMessage: {
    width: "100%",
    minHeight: 48,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    borderRadius: Radius.lg,
    backgroundColor:
      "rgba(225, 90, 90, 0.10)",
  },

  cancelledMessageText: {
    ...Typography.label,
    color: Colors.error,
    writingDirection: "rtl",
  },

  expandRow: {
    width: "100%",
    marginTop: Spacing.md,
    minHeight: 34,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },

  expandText: {
    ...Typography.captionStyle,
    color: Colors.primary,
    writingDirection: "rtl",
  },

  emptyState: {
    minHeight: 350,
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

  noticeCard: {
    width: "100%",
    marginTop: Spacing.section,
  },

  noticeContent: {
    minHeight: 86,
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

  pressed: {
    opacity: 0.82,
  },

  cardPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.994 }],
  },
});