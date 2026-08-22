import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import {
  ComponentProps,
  useCallback,
  useMemo,
  useState,
} from "react";
import {
  Pressable,
  RefreshControl,
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
};

const FILTERS: FilterDefinition[] = [
  {
    id: "active",
    label: {
      English: "Active",
      Dari: "فعال",
      Pashto: "فعال",
    },
  },
  {
    id: "pending",
    label: {
      English: "Pending",
      Dari: "در انتظار",
      Pashto: "په تمه",
    },
  },
  {
    id: "completed",
    label: {
      English: "Completed",
      Dari: "تکمیل‌شده",
      Pashto: "بشپړ شوي",
    },
  },
  {
    id: "cancelled",
    label: {
      English: "Cancelled",
      Dari: "لغوشده",
      Pashto: "لغوه شوي",
    },
  },
];

export default function BookingsScreen() {
  const router = useRouter();

  const {
    bookings,
    isRefreshing,
    refreshBookings,
  } = useBooking();

  const { language } =
    useLanguage();

  const activeLanguage =
    normalizeLanguage(language);

  const isRtl =
    activeLanguage === "Dari" ||
    activeLanguage === "Pashto";

  const copy =
    getBookingsCopy(
      activeLanguage,
    );

  const [
    selectedFilter,
    setSelectedFilter,
  ] =
    useState<BookingFilter>(
      "active",
    );

  const localizedFilters =
    useMemo(
      () =>
        FILTERS.map(
          (filter) => ({
            ...filter,
            localizedLabel:
              filter.label[
                activeLanguage
              ],
          }),
        ),
      [activeLanguage],
    );

  useFocusEffect(
    useCallback(() => {
      void refreshBookings().catch(
        (error) => {
          console.warn(
            "Could not refresh customer bookings:",
            error,
          );
        },
      );
    }, [refreshBookings]),
  );

  const filteredBookings =
    useMemo(() => {
      const results =
        bookings.filter(
          (booking) => {
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
          },
        );

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
    }, [
      bookings,
      selectedFilter,
    ]);

  const statusCounts =
    useMemo(
      () => ({
        active:
          bookings.filter(
            (booking) =>
              booking.status ===
                "confirmed" ||
              booking.status ===
                "in-progress",
          ).length,

        pending:
          bookings.filter(
            (booking) =>
              booking.status ===
              "pending",
          ).length,

        completed:
          bookings.filter(
            (booking) =>
              booking.status ===
              "completed",
          ).length,

        cancelled:
          bookings.filter(
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
      pathname:
        "/(tabs)/messages",
      params: {
        providerId:
          booking.providerId,
        providerName:
          booking.providerName,
        bookingId:
          booking.id,
      },
    });
  };

  const repeatBooking = (
    booking: BookingRecord,
  ) => {
    router.push({
      pathname:
        "/booking-create",
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
    router.push({
      pathname:
        "/booking-record-details",
      params: {
        bookingId:
          booking.id,
      },
    } as never);
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
        refreshControl={
          <RefreshControl
            refreshing={
              isRefreshing
            }
            onRefresh={() => {
              void refreshBookings().catch(
                (error) => {
                  console.warn(
                    "Could not refresh customer bookings:",
                    error,
                  );
                },
              );
            }}
            tintColor={
              KhedmatPalette.blue500
            }
          />
        }
      >
        <Text
          style={[
            styles.title,
            directionStyle(isRtl),
          ]}
        >
          {copy.title}
        </Text>

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
                  style={({
                    pressed,
                  }) => [
                    styles.filterChip,
                    selected &&
                      styles.filterChipSelected,
                    pressed &&
                      styles.pressed,
                  ]}
                >
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

                  {count > 0 ? (
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
                  ) : null}
                </Pressable>
              );
            },
          )}
        </ScrollView>

        <Text
          style={[
            styles.resultsCount,
            directionStyle(isRtl),
          ]}
        >
          {getResultsLabel(
            filteredBookings.length,
            activeLanguage,
          )}
        </Text>

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
                  openBooking(
                    booking,
                  )
                }
                onMessage={() =>
                  openMessages(
                    booking,
                  )
                }
                onRepeat={() =>
                  repeatBooking(
                    booking,
                  )
                }
              />
            ),
          )}

          {filteredBookings.length ===
          0 ? (
            <EmptyBookings
              filter={
                selectedFilter
              }
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
  const status =
    getStatusConfig(
      booking.status,
      language,
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
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={
        booking.serviceName
      }
      onPress={onOpen}
      style={({ pressed }) => [
        styles.bookingCard,
        pressed &&
          styles.cardPressed,
      ]}
    >
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
          style={
            styles.bookingIcon
          }
        >
          <Ionicons
            name={getServiceIcon(
              booking.serviceId,
            )}
            size={22}
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
              directionStyle(
                isRtl,
              ),
            ]}
          >
            {booking.serviceName}
          </Text>

          <Text
            numberOfLines={1}
            style={[
              styles.providerName,
              directionStyle(
                isRtl,
              ),
            ]}
          >
            {booking.providerName}
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
                color:
                  status.color,
              },
              directionStyle(
                isRtl,
              ),
            ]}
          >
            {status.label}
          </Text>
        </View>
      </View>

      <View
        style={[
          styles.metaRow,
          {
            flexDirection: isRtl
              ? "row-reverse"
              : "row",
          },
        ]}
      >
        <MetaItem
          icon="calendar-outline"
          text={formattedDate}
          isRtl={isRtl}
        />

        <View
          style={
            styles.metaDivider
          }
        />

        <MetaItem
          icon="time-outline"
          text={formattedTime}
          isRtl={isRtl}
        />
      </View>

      <View
        style={[
          styles.addressRow,
          {
            flexDirection: isRtl
              ? "row-reverse"
              : "row",
          },
        ]}
      >
        <Ionicons
          name="location-outline"
          size={16}
          color={
            KhedmatPalette.textMuted
          }
        />

        <Text
          numberOfLines={1}
          style={[
            styles.addressText,
            directionStyle(isRtl),
          ]}
        >
          {
            booking.address
              .fullAddress
          }
        </Text>
      </View>

      <View
        style={[
          styles.cardFooter,
          {
            flexDirection: isRtl
              ? "row-reverse"
              : "row",
          },
        ]}
      >
        <Text
          style={[
            styles.amountText,
            directionStyle(isRtl),
          ]}
        >
          {formatCurrency(
            booking.total,
            language,
          )}
        </Text>

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
          {showMessageButton ? (
            <ActionButton
              label={
                copy.message
              }
              icon="chatbubble-outline"
              variant="secondary"
              onPress={
                onMessage
              }
            />
          ) : null}

          {showRepeatButton ? (
            <ActionButton
              label={
                copy.bookAgain
              }
              icon="refresh-outline"
              variant="secondary"
              onPress={
                onRepeat
              }
            />
          ) : null}

          <ActionButton
            label={
              copy.viewDetails
            }
            icon={
              isRtl
                ? "chevron-back"
                : "chevron-forward"
            }
            variant="primary"
            onPress={onOpen}
          />
        </View>
      </View>
    </Pressable>
  );
}

type MetaItemProps = {
  icon: IconName;
  text: string;
  isRtl: boolean;
};

function MetaItem({
  icon,
  text,
  isRtl,
}: MetaItemProps) {
  return (
    <View
      style={[
        styles.metaItem,
        {
          flexDirection: isRtl
            ? "row-reverse"
            : "row",
        },
      ]}
    >
      <Ionicons
        name={icon}
        size={15}
        color={
          KhedmatPalette.textMuted
        }
      />

      <Text
        numberOfLines={1}
        style={[
          styles.metaText,
          directionStyle(isRtl),
        ]}
      >
        {text}
      </Text>
    </View>
  );
}

type ActionButtonProps = {
  label: string;
  icon: IconName;
  variant:
    | "primary"
    | "secondary";
  onPress: () => void;
};

function ActionButton({
  label,
  icon,
  variant,
  onPress,
}: ActionButtonProps) {
  const primary =
    variant === "primary";

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={
        label
      }
      onPress={(event) => {
        event.stopPropagation();
        onPress();
      }}
      style={({ pressed }) => [
        styles.actionButton,
        primary
          ? styles.actionButtonPrimary
          : styles.actionButtonSecondary,
        pressed &&
          styles.pressed,
      ]}
    >
      <Text
        numberOfLines={1}
        style={[
          styles.actionButtonText,
          primary
            ? styles.actionButtonTextPrimary
            : styles.actionButtonTextSecondary,
        ]}
      >
        {label}
      </Text>

      <Ionicons
        name={icon}
        size={15}
        color={
          primary
            ? KhedmatPalette.white
            : KhedmatPalette.navy700
        }
      />
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
    <View
      style={styles.emptyState}
    >
      <View
        style={
          styles.emptyIconContainer
        }
      >
        <Ionicons
          name="calendar-clear-outline"
          size={31}
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

function getResultsLabel(
  count: number,
  language: LanguageName,
): string {
  const value =
    formatDigits(
      count.toString(),
      language !== "English",
    );

  if (
    language === "Dari"
  ) {
    return `${value} رزرو`;
  }

  if (
    language === "Pashto"
  ) {
    return `${value} رزرف`;
  }

  return count === 1
    ? "1 booking"
    : `${count} bookings`;
}

function getEmptyTitle(
  filter: BookingFilter,
  language: LanguageName,
): string {
  if (
    language === "English"
  ) {
    if (
      filter === "active"
    ) {
      return "No active bookings";
    }

    if (
      filter === "pending"
    ) {
      return "No pending bookings";
    }

    if (
      filter === "completed"
    ) {
      return "No completed bookings";
    }

    return "No cancelled bookings";
  }

  if (
    language === "Pashto"
  ) {
    if (
      filter === "active"
    ) {
      return "فعال رزرف نه لرئ";
    }

    if (
      filter === "pending"
    ) {
      return "په تمه رزرف نه لرئ";
    }

    if (
      filter === "completed"
    ) {
      return "بشپړ شوی رزرف نه لرئ";
    }

    return "لغوه شوی رزرف نه لرئ";
  }

  if (
    filter === "active"
  ) {
    return "رزرو فعالی ندارید";
  }

  if (
    filter === "pending"
  ) {
    return "رزرو در انتظاری ندارید";
  }

  if (
    filter === "completed"
  ) {
    return "رزرو تکمیل‌شده‌ای ندارید";
  }

  return "رزرو لغوشده‌ای ندارید";
}

function getEmptySubtitle(
  filter: BookingFilter,
  language: LanguageName,
): string {
  if (
    language === "English"
  ) {
    if (
      filter === "active"
    ) {
      return "Confirmed bookings will appear here.";
    }

    if (
      filter === "pending"
    ) {
      return "Bookings awaiting a provider response will appear here.";
    }

    if (
      filter === "completed"
    ) {
      return "Completed bookings will appear here.";
    }

    return "Cancelled bookings will appear here.";
  }

  if (
    language === "Pashto"
  ) {
    if (
      filter === "active"
    ) {
      return "تایید شوي رزرفونه به دلته ښکاره شي.";
    }

    if (
      filter === "pending"
    ) {
      return "په تمه رزرفونه به دلته ښکاره شي.";
    }

    if (
      filter === "completed"
    ) {
      return "بشپړ شوي رزرفونه به دلته ښکاره شي.";
    }

    return "لغوه شوي رزرفونه به دلته ښکاره شي.";
  }

  if (
    filter === "active"
  ) {
    return "رزروهای تأییدشده در اینجا نمایش داده می‌شوند.";
  }

  if (
    filter === "pending"
  ) {
    return "رزروهای در انتظار پاسخ در اینجا نمایش داده می‌شوند.";
  }

  if (
    filter === "completed"
  ) {
    return "رزروهای تکمیل‌شده در اینجا نمایش داده می‌شوند.";
  }

  return "رزروهای لغوشده در اینجا نمایش داده می‌شوند.";
}

function getStatusConfig(
  status: BookingStatus,
  language: LanguageName,
) {
  const labels =
    getStatusLabels(language);

  if (
    status === "confirmed"
  ) {
    return {
      label:
        labels.confirmed,
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
      label:
        labels.inProgress,
      color:
        KhedmatPalette.navy700,
      backgroundColor:
        KhedmatPalette.blue050,
    };
  }

  if (
    status === "completed"
  ) {
    return {
      label:
        labels.completed,
      color:
        KhedmatPalette.success,
      backgroundColor:
        KhedmatPalette.successSoft,
    };
  }

  if (
    status === "cancelled"
  ) {
    return {
      label:
        labels.cancelled,
      color:
        KhedmatPalette.error,
      backgroundColor:
        KhedmatPalette.errorSoft,
    };
  }

  return {
    label:
      labels.pending,
    color: "#8A5A00",
    backgroundColor:
      "#FFF4D6",
  };
}

function getStatusLabels(
  language: LanguageName,
) {
  if (
    language === "English"
  ) {
    return {
      confirmed:
        "Confirmed",
      inProgress:
        "In progress",
      completed:
        "Completed",
      cancelled:
        "Cancelled",
      pending:
        "Pending",
    };
  }

  if (
    language === "Pashto"
  ) {
    return {
      confirmed:
        "تایید شوی",
      inProgress:
        "د ترسره کېدو په حال کې",
      completed:
        "بشپړ شوی",
      cancelled:
        "لغوه شوی",
      pending:
        "په تمه",
    };
  }

  return {
    confirmed:
      "تأییدشده",
    inProgress:
      "در حال انجام",
    completed:
      "تکمیل‌شده",
    cancelled:
      "لغوشده",
    pending:
      "در انتظار",
  };
}

function getServiceIcon(
  serviceId: string,
): IconName {
  const normalized =
    serviceId.toLowerCase();

  if (
    normalized.includes(
      "wiring",
    ) ||
    normalized.includes(
      "socket",
    ) ||
    normalized.includes(
      "lighting",
    ) ||
    normalized.includes(
      "breaker",
    ) ||
    normalized.includes(
      "generator",
    ) ||
    normalized.includes(
      "electric",
    )
  ) {
    return "flash-outline";
  }

  if (
    normalized.includes(
      "pipe",
    ) ||
    normalized.includes(
      "drain",
    ) ||
    normalized.includes(
      "water",
    ) ||
    normalized.includes(
      "plumb",
    )
  ) {
    return "water-outline";
  }

  if (
    normalized.includes(
      "clean",
    )
  ) {
    return "sparkles-outline";
  }

  if (
    normalized.includes(
      "computer",
    ) ||
    normalized.includes(
      "software",
    ) ||
    normalized.includes(
      "phone",
    )
  ) {
    return "laptop-outline";
  }

  if (
    normalized.includes(
      "carpenter",
    ) ||
    normalized.includes(
      "cabinet",
    ) ||
    normalized.includes(
      "door",
    ) ||
    normalized.includes(
      "wood",
    )
  ) {
    return "hammer-outline";
  }

  return "construct-outline";
}

function getBookingTimestamp(
  booking: BookingRecord,
): number {
  const date =
    booking.date ||
    "1970-01-01";

  const time =
    booking.time ||
    "00:00";

  const timestamp =
    new Date(
      `${date}T${time}:00`,
    ).getTime();

  return Number.isFinite(
    timestamp,
  )
    ? timestamp
    : 0;
}

function formatBookingDate(
  value: string,
  language: LanguageName,
): string {
  if (!value) {
    if (
      language === "English"
    ) {
      return "Date unavailable";
    }

    if (
      language === "Pashto"
    ) {
      return "نېټه نه ده معلومه";
    }

    return "تاریخ نامشخص";
  }

  const [
    year,
    month,
    day,
  ] = value
    .split("-")
    .map(Number);

  if (
    !year ||
    !month ||
    !day
  ) {
    return language ===
      "English"
      ? value
      : formatDigits(
          value,
          true,
        );
  }

  const date =
    new Date(
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

    return language ===
      "English"
      ? formatted
      : formatDigits(
          formatted,
          true,
        );
  } catch {
    const fallback =
      `${day}/${month}/${year}`;

    return language ===
      "English"
      ? fallback
      : formatDigits(
          fallback,
          true,
        );
  }
}

function formatBookingTime(
  value: string,
  language: LanguageName,
): string {
  if (!value) {
    if (
      language === "English"
    ) {
      return "Time unavailable";
    }

    if (
      language === "Pashto"
    ) {
      return "وخت نه دی معلوم";
    }

    return "زمان نامشخص";
  }

  const [
    hoursRaw,
    minutesRaw,
  ] =
    value.split(":");

  const hours =
    Number(hoursRaw);

  const minutes =
    Number(minutesRaw);

  if (
    !Number.isFinite(
      hours,
    ) ||
    !Number.isFinite(
      minutes,
    )
  ) {
    return language ===
      "English"
      ? value
      : formatDigits(
          value,
          true,
        );
  }

  const date =
    new Date();

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

    return language ===
      "English"
      ? formatted
      : formatDigits(
          formatted,
          true,
        );
  } catch {
    return language ===
      "English"
      ? value
      : formatDigits(
          value,
          true,
        );
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

  if (
    language === "English"
  ) {
    return `${formatted} AFN`;
  }

  const localized =
    formatDigits(
      formatted,
      true,
    );

  return language ===
    "Dari"
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
      digits[digit] ??
      digit,
  );
}

function normalizeLanguage(
  language: string,
): LanguageName {
  if (
    language === "Dari"
  ) {
    return "Dari";
  }

  if (
    language === "Pashto"
  ) {
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
  if (
    language === "Dari"
  ) {
    return {
      title: "رزروها",
      viewDetails:
        "جزئیات",
      message: "پیام",
      bookAgain:
        "رزرو دوباره",
    };
  }

  if (
    language === "Pashto"
  ) {
    return {
      title: "رزرفونه",
      viewDetails:
        "جزیات",
      message: "پیغام",
      bookAgain:
        "بیا رزرف",
    };
  }

  return {
    title: "Bookings",
    viewDetails:
      "Details",
    message: "Message",
    bookAgain: "Book again",
  };
}

const styles =
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor:
        KhedmatPalette.white,
    },

    scrollContent: {
      width: "100%",
      maxWidth:
        Layout.contentMaxWidth,
      alignSelf: "center",
      paddingHorizontal:
        Layout.screenPadding,
      paddingTop:
        Spacing.lg,
      paddingBottom: 130,
    },

    title: {
      ...Typography.screenTitle,
      width: "100%",
      color:
        KhedmatPalette.navy900,
      fontSize: 28,
      lineHeight: 35,
    },

    filtersRow: {
      marginTop:
        Spacing.lg,
      gap: Spacing.sm,
      paddingHorizontal: 1,
    },

    filterChip: {
      minHeight: 40,
      paddingHorizontal:
        Spacing.md,
      flexDirection: "row",
      alignItems: "center",
      gap: 7,
      borderRadius:
        Radius.pill,
      borderWidth: 1,
      borderColor:
        KhedmatPalette.border,
      backgroundColor:
        KhedmatPalette.white,
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
      fontFamily:
        Fonts.medium,
    },

    filterCount: {
      minWidth: 20,
      height: 20,
      paddingHorizontal: 5,
      borderRadius:
        Radius.pill,
      alignItems: "center",
      justifyContent:
        "center",
      backgroundColor:
        KhedmatPalette.surfaceSoft,
    },

    filterCountSelected: {
      backgroundColor:
        "rgba(255,255,255,0.18)",
    },

    filterCountText: {
      fontFamily:
        Fonts.medium,
      fontSize: 10,
      color:
        KhedmatPalette.textMuted,
    },

    filterCountTextSelected: {
      color:
        KhedmatPalette.white,
    },

    resultsCount: {
      ...Typography.captionStyle,
      width: "100%",
      marginTop:
        Spacing.xl,
      color:
        KhedmatPalette.textMuted,
      fontFamily:
        Fonts.medium,
    },

    bookingsList: {
      width: "100%",
      marginTop:
        Spacing.sm,
      gap: Spacing.md,
    },

    bookingCard: {
      width: "100%",
      padding:
        Spacing.lg,
      borderRadius:
        Radius.xl,
      borderWidth: 1,
      borderColor:
        KhedmatPalette.border,
      backgroundColor:
        KhedmatPalette.white,
      ...Shadows.small,
    },

    bookingHeader: {
      width: "100%",
      alignItems:
        "flex-start",
      gap: Spacing.md,
    },

    bookingIcon: {
      width: 46,
      height: 46,
      flexShrink: 0,
      borderRadius:
        Radius.lg,
      alignItems: "center",
      justifyContent:
        "center",
      backgroundColor:
        KhedmatPalette.surfaceSoft,
    },

    bookingMainCopy: {
      flex: 1,
      minWidth: 0,
      gap: 3,
    },

    bookingService: {
      ...Typography.sectionTitle,
      width: "100%",
      color:
        KhedmatPalette.navy900,
      fontSize: 17,
      lineHeight: 23,
    },

    providerName: {
      ...Typography.captionStyle,
      width: "100%",
      color:
        KhedmatPalette.textSecondary,
      fontSize: 12,
    },

    statusBadge: {
      flexShrink: 0,
      paddingHorizontal:
        Spacing.sm,
      paddingVertical: 6,
      borderRadius:
        Radius.pill,
    },

    statusText: {
      ...Typography.captionStyle,
      fontSize: 10,
      textAlign: "center",
      fontFamily:
        Fonts.medium,
    },

    metaRow: {
      width: "100%",
      marginTop:
        Spacing.md,
      alignItems: "center",
      gap: Spacing.sm,
    },

    metaItem: {
      flexShrink: 1,
      alignItems: "center",
      gap: 5,
    },

    metaText: {
      ...Typography.captionStyle,
      color:
        KhedmatPalette.textSecondary,
      fontSize: 12,
    },

    metaDivider: {
      width: 1,
      height: 14,
      backgroundColor:
        KhedmatPalette.border,
    },

    addressRow: {
      width: "100%",
      marginTop:
        Spacing.sm,
      alignItems: "center",
      gap: 6,
    },

    addressText: {
      ...Typography.captionStyle,
      flex: 1,
      color:
        KhedmatPalette.textMuted,
      fontSize: 12,
    },

    cardFooter: {
      width: "100%",
      marginTop:
        Spacing.md,
      paddingTop:
        Spacing.md,
      borderTopWidth:
        StyleSheet.hairlineWidth,
      borderTopColor:
        KhedmatPalette.border,
      alignItems: "center",
      justifyContent:
        "space-between",
      gap: Spacing.md,
    },

    amountText: {
      ...Typography.label,
      flexShrink: 0,
      color:
        KhedmatPalette.navy900,
      fontFamily:
        Fonts.bold,
      fontSize: 14,
    },

    cardActions: {
      flex: 1,
      alignItems: "center",
      justifyContent:
        "flex-end",
      gap: Spacing.sm,
    },

    actionButton: {
      minHeight: 38,
      paddingHorizontal:
        Spacing.md,
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "center",
      gap: 4,
      borderRadius:
        Radius.pill,
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

    actionButtonText: {
      ...Typography.captionStyle,
      fontFamily:
        Fonts.medium,
      fontSize: 11,
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
      minHeight: 320,
      alignItems: "center",
      justifyContent:
        "center",
      gap: Spacing.md,
      paddingHorizontal:
        Spacing.xl,
    },

    emptyIconContainer: {
      width: 72,
      height: 72,
      borderRadius:
        Radius.pill,
      alignItems: "center",
      justifyContent:
        "center",
      backgroundColor:
        KhedmatPalette.surfaceSoft,
    },

    emptyTitle: {
      ...Typography.sectionTitle,
      maxWidth: 320,
      color:
        KhedmatPalette.navy900,
      textAlign: "center",
      fontSize: 18,
      lineHeight: 24,
    },

    emptySubtitle: {
      ...Typography.bodyStyle,
      maxWidth: 330,
      color:
        KhedmatPalette.textSecondary,
      textAlign: "center",
      fontSize: 13,
      lineHeight: 19,
    },

    pressed: {
      opacity: 0.78,
    },

    cardPressed: {
      opacity: 0.9,
      transform: [
        {
          scale: 0.994,
        },
      ],
    },
  });
