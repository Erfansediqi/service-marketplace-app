import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  ComponentProps,
  useMemo,
  useState,
} from "react";
import {
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
import {
  BookingRecord,
  BookingStatus,
  useBooking,
} from "../../context/booking-context";
import { useLanguage } from "../../context/languagecontext";
type IconName =
  ComponentProps<typeof Ionicons>["name"];

type LanguageName =
  | "English"
  | "Dari"
  | "Pashto";

type BookingFilter =
  | "active"
  | "pending"
  | "completed"
  | "cancelled";

type LocalizedText = {
  English: string;
  Dari: string;
  Pashto: string;
};

type FilterDefinition = {
  id: BookingFilter;
  label: LocalizedText;
  icon: IconName;
};

const FILTERS: FilterDefinition[] = [
  {
    id: "active",
    label: {
      English: "Active",
      Dari: "فعال",
      Pashto: "فعال",
    },
    icon: "flash-outline",
  },
  {
    id: "pending",
    label: {
      English: "Pending",
      Dari: "در انتظار",
      Pashto: "په تمه",
    },
    icon: "time-outline",
  },
  {
    id: "completed",
    label: {
      English: "Completed",
      Dari: "تکمیل‌شده",
      Pashto: "بشپړ شوي",
    },
    icon: "checkmark-circle-outline",
  },
  {
    id: "cancelled",
    label: {
      English: "Cancelled",
      Dari: "لغوشده",
      Pashto: "لغوه شوي",
    },
    icon: "close-circle-outline",
  },
];

export default function BookingsScreen() {
  const router = useRouter();
  const { bookings } = useBooking();
  const { language } = useLanguage();

  const activeLanguage =
    normalizeLanguage(language);

  const isRtl =
    activeLanguage === "Dari" ||
    activeLanguage === "Pashto";

  const copy =
    getBookingsCopy(activeLanguage);

  const [
    selectedFilter,
    setSelectedFilter,
  ] = useState<BookingFilter>(
    "active",
  );

  const localizedFilters =
    useMemo(
      () =>
        FILTERS.map((filter) => ({
          ...filter,
          localizedLabel:
            filter.label[
              activeLanguage
            ],
        })),
      [activeLanguage],
    );

  const filteredBookings =
    useMemo(() => {
      const results =
        bookings.filter((booking) => {
          if (
            selectedFilter ===
            "active"
          ) {
            return (
              booking.status ===
                "confirmed" ||
              booking.status ===
                "in-progress"
            );
          }

          if (
            selectedFilter ===
            "pending"
          ) {
            return (
              booking.status ===
              "pending"
            );
          }

          if (
            selectedFilter ===
            "completed"
          ) {
            return (
              booking.status ===
              "completed"
            );
          }

          return (
            booking.status ===
            "cancelled"
          );
        });

      return [...results].sort(
        (first, second) => {
          const firstTimestamp =
            getBookingTimestamp(
              first,
            );

          const secondTimestamp =
            getBookingTimestamp(
              second,
            );

          if (
            selectedFilter ===
              "completed" ||
            selectedFilter ===
              "cancelled"
          ) {
            return (
              secondTimestamp -
              firstTimestamp
            );
          }

          return (
            firstTimestamp -
            secondTimestamp
          );
        },
      );
    }, [bookings, selectedFilter]);

  const statusCounts = useMemo(
    () => ({
      active: bookings.filter(
        (booking) =>
          booking.status ===
            "confirmed" ||
          booking.status ===
            "in-progress",
      ).length,

      pending: bookings.filter(
        (booking) =>
          booking.status ===
          "pending",
      ).length,

      completed: bookings.filter(
        (booking) =>
          booking.status ===
          "completed",
      ).length,

      cancelled: bookings.filter(
        (booking) =>
          booking.status ===
          "cancelled",
      ).length,
    }),
    [bookings],
  );

  const openMessages = (
    booking: BookingRecord,
  ) => {
    router.push({
      pathname: "/(tabs)/messages",
      params: {
        providerId:
          booking.providerId,
        providerName:
          booking.providerName,
        bookingId: booking.id,
      },
    });
  };

  const repeatBooking = (
    booking: BookingRecord,
  ) => {
    router.push({
      pathname: "/booking-create",
      params: {
        providerId:
          booking.providerId,
        serviceId:
          booking.serviceId,
      },
    });
  };

  const openBooking = (
    booking: BookingRecord,
  ) => {
    /*
     * There is not yet a dedicated route for
     * viewing an existing BookingRecord.
     *
     * Keep this action safe until a booking-record
     * details screen is added.
     */
    console.log(
      "Open booking:",
      booking.id,
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
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={
            false
          }
          contentContainerStyle={
            styles.filtersRow
          }
          style={{
            direction: isRtl
              ? "rtl"
              : "ltr",
          }}
        >
          {localizedFilters.map(
            (filter) => {
              const selected =
                selectedFilter ===
                filter.id;

              const count =
                statusCounts[
                  filter.id
                ];

              return (
                <Pressable
                  key={filter.id}
                  accessibilityRole="button"
                  accessibilityState={{
                    selected,
                  }}
                  accessibilityLabel={
                    filter.localizedLabel
                  }
                  onPress={() =>
                    setSelectedFilter(
                      filter.id,
                    )
                  }
                  style={({ pressed }) => [
                    styles.filterChip,
                    selected &&
                      styles.filterChipSelected,
                    pressed &&
                      styles.pressed,
                  ]}
                >
                  <Ionicons
                    name={filter.icon}
                    size={17}
                    color={
                      selected
                        ? KhedmatPalette
                            .white
                        : KhedmatPalette
                            .navy700
                    }
                  />

                  <Text
                    style={[
                      styles.filterText,
                      selected &&
                        styles.filterTextSelected,
                      directionStyle(
                        isRtl,
                      ),
                    ]}
                  >
                    {
                      filter.localizedLabel
                    }
                  </Text>

                  <View
                    style={[
                      styles.filterCount,
                      selected &&
                        styles.filterCountSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.filterCountText,
                        selected &&
                          styles.filterCountTextSelected,
                      ]}
                    >
                      {formatDigits(
                        count.toString(),
                        activeLanguage !==
                          "English",
                      )}
                    </Text>
                  </View>
                </Pressable>
              );
            },
          )}
        </ScrollView>

        <View
          style={[
            styles.summaryRow,
            {
              flexDirection: isRtl
                ? "row-reverse"
                : "row",
            },
          ]}
        >
          <View
            style={[
              styles.summaryCopy,
              {
                alignItems: isRtl
                  ? "flex-end"
                  : "flex-start",
              },
            ]}
          >
            <Text
              style={[
                styles.summaryTitle,
                directionStyle(isRtl),
              ]}
            >
              {getFilterTitle(
                selectedFilter,
                activeLanguage,
              )}
            </Text>

            <Text
              style={[
                styles.summarySubtitle,
                directionStyle(isRtl),
              ]}
            >
              {formatDigits(
                filteredBookings.length.toString(),
                activeLanguage !==
                  "English",
              )}{" "}
              {copy.bookingsCount}
            </Text>
          </View>

          <View
            style={styles.summaryIcon}
          >
            <Ionicons
              name="calendar-outline"
              size={23}
              color={
                KhedmatPalette.blue500
              }
            />
          </View>
        </View>

        <View
          style={styles.bookingsList}
        >
          {filteredBookings.map(
            (booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                language={
                  activeLanguage
                }
                isRtl={isRtl}
                copy={copy}
                onOpen={() =>
                  openBooking(booking)
                }
                onMessage={() =>
                  openMessages(booking)
                }
                onRepeat={() =>
                  repeatBooking(booking)
                }
              />
            ),
          )}

          {filteredBookings.length ===
          0 ? (
            <EmptyBookings
              filter={selectedFilter}
              language={
                activeLanguage
              }
              isRtl={isRtl}
            />
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

type BookingCardProps = {
  booking: BookingRecord;
  language: LanguageName;
  isRtl: boolean;
  copy: ReturnType<
    typeof getBookingsCopy
  >;
  onOpen: () => void;
  onMessage: () => void;
  onRepeat: () => void;
};

function BookingCard({
  booking,
  language,
  isRtl,
  copy,
  onOpen,
  onMessage,
  onRepeat,
}: BookingCardProps) {
  const status = getStatusConfig(
    booking.status,
    language,
  );

  const providerInitials =
    getInitials(
      booking.providerName,
    );

  const serviceIcon =
    getServiceIcon(
      booking.serviceId,
    );

  const formattedDate =
    formatBookingDate(
      booking.date,
      language,
    );

  const formattedTime =
    formatBookingTime(
      booking.time,
      language,
    );

  const showMessageButton =
    booking.status ===
      "confirmed" ||
    booking.status ===
      "in-progress";

  const showRepeatButton =
    booking.status ===
    "completed";

  return (
    <View style={styles.bookingCard}>
      <View
        style={[
          styles.bookingHeader,
          {
            flexDirection: isRtl
              ? "row-reverse"
              : "row",
          },
        ]}
      >
        <View
          style={styles.bookingIcon}
        >
          <Ionicons
            name={serviceIcon}
            size={25}
            color={
              KhedmatPalette.blue500
            }
          />
        </View>

        <View
          style={[
            styles.bookingMainCopy,
            {
              alignItems: isRtl
                ? "flex-end"
                : "flex-start",
            },
          ]}
        >
          <Text
            numberOfLines={2}
            style={[
              styles.bookingService,
              directionStyle(isRtl),
            ]}
          >
            {booking.serviceName}
          </Text>

          <Text
            numberOfLines={1}
            style={[
              styles.bookingCategory,
              directionStyle(isRtl),
            ]}
          >
            {
              booking.providerProfession
            }
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
              directionStyle(isRtl),
            ]}
          >
            {status.label}
          </Text>
        </View>
      </View>

      <View
        style={[
          styles.providerRow,
          {
            flexDirection: isRtl
              ? "row-reverse"
              : "row",
          },
        ]}
      >
        <View
          style={
            styles.providerAvatar
          }
        >
          <Text
            style={
              styles.providerInitials
            }
          >
            {providerInitials}
          </Text>

          <View
            style={
              styles.verifiedBadge
            }
          >
            <Ionicons
              name="checkmark"
              size={10}
              color={
                KhedmatPalette.white
              }
            />
          </View>
        </View>

        <View
          style={[
            styles.providerCopy,
            {
              alignItems: isRtl
                ? "flex-end"
                : "flex-start",
            },
          ]}
        >
          <Text
            style={[
              styles.providerLabel,
              directionStyle(isRtl),
            ]}
          >
            {copy.provider}
          </Text>

          <Text
            numberOfLines={1}
            style={[
              styles.providerName,
              directionStyle(isRtl),
            ]}
          >
            {booking.providerName}
          </Text>
        </View>
      </View>

      <View style={styles.details}>
        <BookingDetail
          icon="calendar-outline"
          label={copy.date}
          value={formattedDate}
          isRtl={isRtl}
        />

        <BookingDetail
          icon="time-outline"
          label={copy.time}
          value={formattedTime}
          isRtl={isRtl}
        />

        <BookingDetail
          icon="location-outline"
          label={copy.address}
          value={
            booking.address
              .fullAddress
          }
          isRtl={isRtl}
        />

        <BookingDetail
          icon="cash-outline"
          label={copy.amount}
          value={formatCurrency(
            booking.total,
            language,
          )}
          isRtl={isRtl}
        />
      </View>

      <View
        style={[
          styles.cardActions,
          {
            flexDirection: isRtl
              ? "row-reverse"
              : "row",
          },
        ]}
      >
        <ActionButton
          label={copy.viewDetails}
          icon="document-text-outline"
          variant="secondary"
          isRtl={isRtl}
          onPress={onOpen}
        />

        {showMessageButton ? (
          <ActionButton
            label={copy.message}
            icon="chatbubble-outline"
            variant="primary"
            isRtl={isRtl}
            onPress={onMessage}
          />
        ) : null}

        {showRepeatButton ? (
          <ActionButton
            label={copy.bookAgain}
            icon="refresh-outline"
            variant="primary"
            isRtl={isRtl}
            onPress={onRepeat}
          />
        ) : null}
      </View>
    </View>
  );
}

type BookingDetailProps = {
  icon: IconName;
  label: string;
  value: string;
  isRtl: boolean;
};

function BookingDetail({
  icon,
  label,
  value,
  isRtl,
}: BookingDetailProps) {
  return (
    <View
      style={[
        styles.detailItem,
        {
          flexDirection: isRtl
            ? "row-reverse"
            : "row",
        },
      ]}
    >
      <View
        style={styles.detailIcon}
      >
        <Ionicons
          name={icon}
          size={18}
          color={
            KhedmatPalette.blue500
          }
        />
      </View>

      <View
        style={[
          styles.detailCopy,
          {
            flexDirection: isRtl
              ? "row-reverse"
              : "row",
          },
        ]}
      >
        <Text
          style={[
            styles.detailLabel,
            directionStyle(isRtl),
          ]}
        >
          {label}
        </Text>

        <Text
          numberOfLines={3}
          style={[
            styles.detailValue,
            directionStyle(isRtl),
          ]}
        >
          {value}
        </Text>
      </View>
    </View>
  );
}

type ActionButtonProps = {
  label: string;
  icon: IconName;
  variant:
    | "primary"
    | "secondary";
  isRtl: boolean;
  onPress: () => void;
};

function ActionButton({
  label,
  icon,
  variant,
  isRtl,
  onPress,
}: ActionButtonProps) {
  const primary =
    variant === "primary";

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [
        styles.actionButton,
        primary
          ? styles.actionButtonPrimary
          : styles.actionButtonSecondary,
        pressed && styles.pressed,
      ]}
    >
      <View
        style={[
          styles.actionButtonContent,
          {
            flexDirection: isRtl
              ? "row-reverse"
              : "row",
          },
        ]}
      >
        <Ionicons
          name={icon}
          size={17}
          color={
            primary
              ? KhedmatPalette.white
              : KhedmatPalette
                  .navy700
          }
        />

        <Text
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.82}
          style={[
            styles.actionButtonText,
            primary
              ? styles.actionButtonTextPrimary
              : styles.actionButtonTextSecondary,
            directionStyle(isRtl),
          ]}
        >
          {label}
        </Text>
      </View>
    </Pressable>
  );
}

type EmptyBookingsProps = {
  filter: BookingFilter;
  language: LanguageName;
  isRtl: boolean;
};

function EmptyBookings({
  filter,
  language,
  isRtl,
}: EmptyBookingsProps) {
  return (
    <View style={styles.emptyState}>
      <View
        style={
          styles.emptyIconContainer
        }
      >
        <Ionicons
          name="calendar-clear-outline"
          size={35}
          color={
            KhedmatPalette.blue500
          }
        />
      </View>

      <Text
        style={[
          styles.emptyTitle,
          directionStyle(isRtl),
        ]}
      >
        {getEmptyTitle(
          filter,
          language,
        )}
      </Text>

      <Text
        style={[
          styles.emptySubtitle,
          directionStyle(isRtl),
        ]}
      >
        {getEmptySubtitle(
          filter,
          language,
        )}
      </Text>
    </View>
  );
}

function getFilterTitle(
  filter: BookingFilter,
  language: LanguageName,
): string {
  if (language === "English") {
    if (filter === "active") {
      return "Active bookings";
    }

    if (filter === "pending") {
      return "Awaiting confirmation";
    }

    if (filter === "completed") {
      return "Completed bookings";
    }

    return "Cancelled bookings";
  }

  if (language === "Pashto") {
    if (filter === "active") {
      return "فعال رزرفونه";
    }

    if (filter === "pending") {
      return "د تایید په تمه";
    }

    if (filter === "completed") {
      return "بشپړ شوي رزرفونه";
    }

    return "لغوه شوي رزرفونه";
  }

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
  language: LanguageName,
): string {
  if (language === "English") {
    if (filter === "active") {
      return "No active bookings";
    }

    if (filter === "pending") {
      return "No pending requests";
    }

    if (filter === "completed") {
      return "No completed bookings yet";
    }

    return "No cancelled bookings";
  }

  if (language === "Pashto") {
    if (filter === "active") {
      return "فعال رزرف نه لرئ";
    }

    if (filter === "pending") {
      return "په تمه غوښتنه نشته";
    }

    if (filter === "completed") {
      return "تر اوسه رزرف نه دی بشپړ شوی";
    }

    return "لغوه شوی رزرف نه لرئ";
  }

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
  language: LanguageName,
): string {
  if (language === "English") {
    if (filter === "active") {
      return "Confirmed and in-progress bookings will appear here.";
    }

    if (filter === "pending") {
      return "New requests awaiting a provider response will appear here.";
    }

    if (filter === "completed") {
      return "Your completed services and booking history will appear here.";
    }

    return "Bookings that have been cancelled will appear here.";
  }

  if (language === "Pashto") {
    if (filter === "active") {
      return "تایید شوي او روان رزرفونه به دلته ښکاره شي.";
    }

    if (filter === "pending") {
      return "هغه نوې غوښتنې چې د خدمت وړاندې کوونکي ځواب ته په تمه دي، دلته ښکاري.";
    }

    if (filter === "completed") {
      return "بشپړ شوي خدمتونه او د رزرفونو تاریخچه به دلته ښکاره شي.";
    }

    return "لغوه شوي رزرفونه به دلته ښکاره شي.";
  }

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
  language: LanguageName,
) {
  const labels =
    getStatusLabels(language);

  if (status === "confirmed") {
    return {
      label: labels.confirmed,
      color:
        KhedmatPalette.blue500,
      backgroundColor:
        "#E1F2F7",
    };
  }

  if (
    status === "in-progress"
  ) {
    return {
      label: labels.inProgress,
      color:
        KhedmatPalette.navy700,
      backgroundColor:
        KhedmatPalette.blue050,
    };
  }

  if (status === "completed") {
    return {
      label: labels.completed,
      color:
        KhedmatPalette.success,
      backgroundColor:
        KhedmatPalette.successSoft,
    };
  }

  if (status === "cancelled") {
    return {
      label: labels.cancelled,
      color:
        KhedmatPalette.error,
      backgroundColor:
        KhedmatPalette.errorSoft,
    };
  }

  return {
    label: labels.pending,
    color: "#8A5A00",
    backgroundColor: "#FFF4D6",
  };
}

function getStatusLabels(
  language: LanguageName,
) {
  if (language === "English") {
    return {
      confirmed: "Confirmed",
      inProgress: "In progress",
      completed: "Completed",
      cancelled: "Cancelled",
      pending: "Pending",
    };
  }

  if (language === "Pashto") {
    return {
      confirmed: "تایید شوی",
      inProgress: "د ترسره کېدو په حال کې",
      completed: "بشپړ شوی",
      cancelled: "لغوه شوی",
      pending: "په تمه",
    };
  }

  return {
    confirmed: "تأییدشده",
    inProgress: "در حال انجام",
    completed: "تکمیل‌شده",
    cancelled: "لغوشده",
    pending: "در انتظار",
  };
}

function getInitials(
  name: string,
): string {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) =>
      part.charAt(0),
    )
    .join("")
    .slice(0, 2);
}

function getServiceIcon(
  serviceId: string,
): IconName {
  const normalized =
    serviceId.toLowerCase();

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
    normalized.includes("plumb")
  ) {
    return "water-outline";
  }

  if (
    normalized.includes("clean")
  ) {
    return "sparkles-outline";
  }

  if (
    normalized.includes("computer") ||
    normalized.includes("software") ||
    normalized.includes("phone")
  ) {
    return "laptop-outline";
  }

  if (
    normalized.includes("carpenter") ||
    normalized.includes("cabinet") ||
    normalized.includes("door") ||
    normalized.includes("wood")
  ) {
    return "hammer-outline";
  }

  return "construct-outline";
}

function getBookingTimestamp(
  booking: BookingRecord,
): number {
  const date =
    booking.date || "1970-01-01";

  const time =
    booking.time || "00:00";

  const timestamp = new Date(
    `${date}T${time}:00`,
  ).getTime();

  return Number.isFinite(timestamp)
    ? timestamp
    : 0;
}

function formatBookingDate(
  value: string,
  language: LanguageName,
): string {
  if (!value) {
    if (language === "English") {
      return "Date unavailable";
    }

    if (language === "Pashto") {
      return "نېټه نه ده معلومه";
    }

    return "تاریخ نامشخص";
  }

  const [year, month, day] =
    value.split("-").map(Number);

  if (!year || !month || !day) {
    return language === "English"
      ? value
      : formatDigits(value, true);
  }

  const date = new Date(
    year,
    month - 1,
    day,
  );

  const locale =
    language === "English"
      ? "en-US"
      : "fa-AF";

  try {
    const formatted =
      new Intl.DateTimeFormat(
        locale,
        {
          weekday: "short",
          day: "numeric",
          month: "short",
        },
      ).format(date);

    return language === "English"
      ? formatted
      : formatDigits(
          formatted,
          true,
        );
  } catch {
    return language === "English"
      ? `${day}/${month}/${year}`
      : formatDigits(
          `${day}/${month}/${year}`,
          true,
        );
  }
}

function formatBookingTime(
  value: string,
  language: LanguageName,
): string {
  if (!value) {
    if (language === "English") {
      return "Time unavailable";
    }

    if (language === "Pashto") {
      return "وخت نه دی معلوم";
    }

    return "زمان نامشخص";
  }

  const [hoursRaw, minutesRaw] =
    value.split(":");

  const hours =
    Number(hoursRaw);

  const minutes =
    Number(minutesRaw);

  if (
    !Number.isFinite(hours) ||
    !Number.isFinite(minutes)
  ) {
    return language === "English"
      ? value
      : formatDigits(value, true);
  }

  const date = new Date();
  date.setHours(
    hours,
    minutes,
    0,
    0,
  );

  try {
    const formatted =
      new Intl.DateTimeFormat(
        language === "English"
          ? "en-US"
          : "fa-AF",
        {
          hour: "numeric",
          minute: "2-digit",
        },
      ).format(date);

    return language === "English"
      ? formatted
      : formatDigits(
          formatted,
          true,
        );
  } catch {
    return language === "English"
      ? value
      : formatDigits(value, true);
  }
}

function formatCurrency(
  amount: number,
  language: LanguageName,
): string {
  const formatted =
    new Intl.NumberFormat(
      "en-US",
    ).format(amount);

  if (language === "English") {
    return `${formatted} AFN`;
  }

  const localized =
    formatDigits(formatted, true);

  return language === "Dari"
    ? `${localized} افغانی`
    : `${localized} افغانۍ`;
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

function getBookingsCopy(
  language: LanguageName,
) {
  if (language === "Dari") {
    return {
      eyebrow: "مدیریت درخواست‌ها",
      title: "رزروهای شما",
      subtitle:
        "درخواست‌های فعال، در انتظار و تکمیل‌شدهٔ خود را مدیریت کنید.",
      bookingsCount: "رزرو",
      provider: "ارائه‌دهنده",
      date: "تاریخ",
      time: "زمان",
      address: "آدرس",
      amount: "مبلغ",
      viewDetails: "مشاهده جزئیات",
      message: "پیام",
      bookAgain: "رزرو دوباره",
    };
  }

  if (language === "Pashto") {
    return {
      eyebrow:
        "د غوښتنو مدیریت",
      title: "ستاسو رزرفونه",
      subtitle:
        "خپل فعال، په تمه او بشپړ شوي رزرفونه مدیریت کړئ.",
      bookingsCount: "رزرفونه",
      provider:
        "خدمت وړاندې کوونکی",
      date: "نېټه",
      time: "وخت",
      address: "پته",
      amount: "مبلغ",
      viewDetails:
        "تفصیل وګورئ",
      message: "پیغام",
      bookAgain:
        "بیا رزرف کړئ",
    };
  }

  return {
    eyebrow: "Request management",
    title: "Your bookings",
    subtitle:
      "Manage your active, pending and completed service requests.",
    bookingsCount: "bookings",
    provider: "Provider",
    date: "Date",
    time: "Time",
    address: "Address",
    amount: "Amount",
    viewDetails: "View details",
    message: "Message",
    bookAgain: "Book again",
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

  filtersRow: {
    marginTop: Spacing.xxl,
    gap: Spacing.sm,
    paddingHorizontal: 1,
  },

  filterChip: {
    minHeight: 44,
    paddingHorizontal: Spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor:
      KhedmatPalette.border,
    backgroundColor:
      KhedmatPalette.surface,
  },

  filterChipSelected: {
    borderColor:
      KhedmatPalette.navy900,
    backgroundColor:
      KhedmatPalette.navy900,
  },

  filterText: {
    ...Typography.captionStyle,
    color:
      KhedmatPalette.textSecondary,
  },

  filterTextSelected: {
    color:
      KhedmatPalette.white,
    fontFamily: Fonts.medium,
  },

  filterCount: {
    minWidth: 24,
    height: 24,
    paddingHorizontal: 6,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      KhedmatPalette.surfaceSoft,
  },

  filterCountSelected: {
    backgroundColor:
      "rgba(255,255,255,0.18)",
  },

  filterCountText: {
    fontFamily: Fonts.medium,
    fontSize: 11,
    color:
      KhedmatPalette.textMuted,
  },

  filterCountTextSelected: {
    color:
      KhedmatPalette.white,
  },

  summaryRow: {
    width: "100%",
    marginTop: Spacing.section,
    alignItems: "center",
    justifyContent:
      "space-between",
  },

  summaryCopy: {
    flex: 1,
    gap: 2,
  },

  summaryTitle: {
    ...Typography.sectionTitle,
    width: "100%",
    color:
      KhedmatPalette.textPrimary,
    fontSize: 21,
    lineHeight: 28,
  },

  summarySubtitle: {
    ...Typography.captionStyle,
    width: "100%",
    color:
      KhedmatPalette.textMuted,
  },

  summaryIcon: {
    width: 46,
    height: 46,
    borderRadius: Radius.lg,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      KhedmatPalette.surface,
    borderWidth: 1,
    borderColor:
      KhedmatPalette.border,
  },

  bookingsList: {
    width: "100%",
    marginTop: Spacing.lg,
    gap: Spacing.lg,
  },

  bookingCard: {
    width: "100%",
    padding: Spacing.lg,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor:
      KhedmatPalette.border,
    backgroundColor:
      KhedmatPalette.surface,
    ...Shadows.small,
  },

  bookingHeader: {
    width: "100%",
    alignItems: "flex-start",
    gap: Spacing.md,
  },

  bookingIcon: {
    width: 52,
    height: 52,
    flexShrink: 0,
    borderRadius: Radius.lg,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      KhedmatPalette.surfaceSoft,
  },

  bookingMainCopy: {
    flex: 1,
    gap: 3,
  },

  bookingService: {
    ...Typography.sectionTitle,
    width: "100%",
    color:
      KhedmatPalette.textPrimary,
    fontSize: 18,
    lineHeight: 24,
  },

  bookingCategory: {
    ...Typography.captionStyle,
    width: "100%",
    color:
      KhedmatPalette.textMuted,
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
    fontFamily: Fonts.medium,
  },

  providerRow: {
    width: "100%",
    marginTop: Spacing.lg,
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
    backgroundColor:
      KhedmatPalette.navy900,
  },

  providerInitials: {
    fontFamily: Fonts.bold,
    color:
      KhedmatPalette.white,
    fontSize: 16,
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
    backgroundColor:
      KhedmatPalette.blue500,
    borderWidth: 2,
    borderColor:
      KhedmatPalette.surface,
  },

  providerCopy: {
    flex: 1,
    gap: 2,
  },

  providerLabel: {
    ...Typography.captionStyle,
    width: "100%",
    color:
      KhedmatPalette.textMuted,
  },

  providerName: {
    ...Typography.label,
    width: "100%",
    color:
      KhedmatPalette.textPrimary,
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
    borderColor:
      KhedmatPalette.border,
    gap: Spacing.md,
  },

  detailItem: {
    width: "100%",
    alignItems: "center",
    gap: Spacing.md,
  },

  detailIcon: {
    width: 36,
    height: 36,
    flexShrink: 0,
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      KhedmatPalette.surfaceSoft,
  },

  detailCopy: {
    flex: 1,
    alignItems: "center",
    justifyContent:
      "space-between",
    gap: Spacing.md,
  },

  detailLabel: {
    ...Typography.captionStyle,
    flexShrink: 0,
    color:
      KhedmatPalette.textMuted,
  },

  detailValue: {
    ...Typography.label,
    flex: 1,
    color:
      KhedmatPalette.textPrimary,
  },

  cardActions: {
    width: "100%",
    marginTop: Spacing.lg,
    gap: Spacing.sm,
  },

  actionButton: {
    flex: 1,
    minHeight: 46,
    borderRadius: Radius.lg,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.sm,
  },

  actionButtonPrimary: {
    backgroundColor:
      KhedmatPalette.navy900,
  },

  actionButtonSecondary: {
    backgroundColor:
      KhedmatPalette.surfaceSoft,
    borderWidth: 1,
    borderColor:
      KhedmatPalette.border,
  },

  actionButtonContent: {
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },

  actionButtonText: {
    ...Typography.captionStyle,
    fontFamily: Fonts.medium,
  },

  actionButtonTextPrimary: {
    color:
      KhedmatPalette.white,
  },

  actionButtonTextSecondary: {
    color:
      KhedmatPalette.navy700,
  },

  emptyState: {
    minHeight: 360,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.md,
    paddingHorizontal: Spacing.xl,
  },

  emptyIconContainer: {
    width: 82,
    height: 82,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      KhedmatPalette.surface,
    borderWidth: 1,
    borderColor:
      KhedmatPalette.border,
  },

  emptyTitle: {
    ...Typography.sectionTitle,
    maxWidth: 340,
    color:
      KhedmatPalette.textPrimary,
    textAlign: "center",
  },

  emptySubtitle: {
    ...Typography.bodyStyle,
    maxWidth: 350,
    color:
      KhedmatPalette.textSecondary,
    textAlign: "center",
  },

  pressed: {
    opacity: 0.78,
    transform: [
      {
        scale: 0.985,
      },
    ],
  },
});