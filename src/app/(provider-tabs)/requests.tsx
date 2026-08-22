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
import {
  BookingRecord,
  BookingStatus,
  useBooking,
} from "../../context/booking-context";
import { useLanguage } from "../../context/languagecontext";
import { useActiveProvider } from "../../hooks/use-active-provider";

type IconName = ComponentProps<typeof Ionicons>["name"];

type LanguageName = "English" | "Dari" | "Pashto";

type RequestFilter = "pending" | "active" | "completed" | "cancelled";

type FilterDefinition = {
  id: RequestFilter;
  icon: IconName;
};

const SUCCESS = "#268A57";
const SUCCESS_SOFT = "#E8F6EE";

const WARNING = "#8A5A00";
const WARNING_SOFT = "#FFF4D6";

const ERROR = "#B3261E";
const ERROR_SOFT = "#FCE8E6";

const INFO_SOFT = "#E5F4F8";

const FILTERS: FilterDefinition[] = [
  {
    id: "pending",
    icon: "time-outline",
  },
  {
    id: "active",
    icon: "briefcase-outline",
  },
  {
    id: "completed",
    icon: "checkmark-circle-outline",
  },
  {
    id: "cancelled",
    icon: "close-circle-outline",
  },
];

export default function ProviderRequestsScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();

  const { bookings, isRefreshing, refreshBookings } =
    useBooking();


  const {
    provider,
    isLoading: providerIsLoading,
    error: providerError,
  } = useActiveProvider();

  const { language, t } = useLanguage();

  const activeLanguage = normalizeLanguage(language);

  const isRtl = activeLanguage === "Dari" || activeLanguage === "Pashto";

  const localizedDigits = activeLanguage !== "English";

  const providerId = provider?.id ?? null;

  const [selectedFilter, setSelectedFilter] =
    useState<RequestFilter>("pending");


  const compactLayout = width < 370;

  /*
   * Provider requests are server-backed. Refresh whenever this tab gains
   * focus so a provider can see new customer bookings without restarting the
   * app or switching workspaces.
   */
  useFocusEffect(
    useCallback(() => {
      void refreshBookings().catch((error) => {
        console.warn("Could not refresh provider requests:", error);
      });
    }, [refreshBookings]),
  );

  const providerBookings = useMemo(() => {
    if (!providerId) {
      return [];
    }

    return bookings.filter((booking) => booking.providerId === providerId);
  }, [bookings, providerId]);

  const counts = useMemo(
    () => ({
      pending: providerBookings.filter(
        (booking) => booking.status === "pending",
      ).length,

      active: providerBookings.filter(
        (booking) =>
          booking.status === "confirmed" || booking.status === "in-progress",
      ).length,

      completed: providerBookings.filter(
        (booking) => booking.status === "completed",
      ).length,

      cancelled: providerBookings.filter(
        (booking) => booking.status === "cancelled",
      ).length,
    }),
    [providerBookings],
  );

  const filteredBookings = useMemo(() => {
    const matching = providerBookings.filter((booking) => {
      if (selectedFilter === "pending") {
        return booking.status === "pending";
      }

      if (selectedFilter === "active") {
        return (
          booking.status === "confirmed" || booking.status === "in-progress"
        );
      }

      if (selectedFilter === "completed") {
        return booking.status === "completed";
      }

      return booking.status === "cancelled";
    });

    return [...matching].sort((first, second) => {
      const firstTime = getBookingTimestamp(first);

      const secondTime = getBookingTimestamp(second);

      if (selectedFilter === "completed" || selectedFilter === "cancelled") {
        return secondTime - firstTime;
      }

      return firstTime - secondTime;
    });
  }, [providerBookings, selectedFilter]);

  if (providerIsLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.providerState}>
          <Text style={[styles.providerStateTitle, directionStyle(isRtl)]}>
            {t("providerAccountLoading")}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!provider || providerError) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.providerState}>
          <Ionicons
            name="person-circle-outline"
            size={52}
            color={KhedmatPalette.textMuted}
          />

          <Text style={[styles.providerStateTitle, directionStyle(isRtl)]}>
            {t("providerAccountLoadError")}
          </Text>

          <Text style={[styles.providerStateBody, directionStyle(isRtl)]}>
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
              void refreshBookings().catch((error) => {
                console.warn("Could not refresh provider requests:", error);
              });
            }}
            tintColor={KhedmatPalette.blue500}
          />
        }
      >
        <View style={styles.header}>
          <Text style={[styles.title, directionStyle(isRtl)]}>
            {t("providerRequestsTitle")}
          </Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersRow}
          style={{
            direction: isRtl ? "rtl" : "ltr",
          }}
        >
          {FILTERS.map((filter) => {
            const selected = selectedFilter === filter.id;

            const count = counts[filter.id];

            return (
              <Pressable
                key={filter.id}
                accessibilityRole="button"
                accessibilityState={{
                  selected,
                }}
                accessibilityLabel={t(getFilterLabelKey(filter.id))}
                onPress={() => {
                  setSelectedFilter(filter.id);
                }}
                style={({ pressed }) => [
                  styles.filterChip,
                  selected && styles.filterChipSelected,
                  pressed && styles.pressed,
                ]}
              >
                <Ionicons
                  name={filter.icon}
                  size={17}
                  color={
                    selected ? KhedmatPalette.white : KhedmatPalette.navy700
                  }
                />

                <Text
                  style={[
                    styles.filterLabel,
                    selected && styles.filterLabelSelected,
                    directionStyle(isRtl),
                  ]}
                >
                  {t(getFilterLabelKey(filter.id))}
                </Text>

                <View
                  style={[
                    styles.filterCount,
                    selected && styles.filterCountSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.filterCountText,
                      selected && styles.filterCountTextSelected,
                    ]}
                  >
                    {formatDigits(count.toString(), localizedDigits)}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </ScrollView>

        <Text
          style={[
            styles.resultsCountLabel,
            directionStyle(isRtl),
          ]}
        >
          {formatRequestCount(
            filteredBookings.length,
            activeLanguage,
          )}
        </Text>

        <View style={styles.requestsList}>
          {filteredBookings.map((booking) => (
            <ProviderRequestCard
              key={booking.id}
              booking={booking}
              language={activeLanguage}
              isRtl={isRtl}
              customerFallback={t("providerRequestsCustomer")}
              viewDetailsLabel={t("providerRequestsViewDetails")}
              statusLabel={t(getStatusLabelKey(booking.status))}
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

          {filteredBookings.length === 0 ? (
            <EmptyRequests
              filter={selectedFilter}
              title={t(getEmptyTitleKey(selectedFilter))}
              subtitle={t(getEmptySubtitleKey(selectedFilter))}
              isRtl={isRtl}
            />
          ) : null}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

type ProviderRequestCardProps = {
  booking: BookingRecord;
  language: LanguageName;
  isRtl: boolean;
  customerFallback: string;
  viewDetailsLabel: string;
  statusLabel: string;
  onPress: () => void;
};

function ProviderRequestCard({
  booking,
  language,
  isRtl,
  customerFallback,
  viewDetailsLabel,
  statusLabel,
  onPress,
}: ProviderRequestCardProps) {
  const status = getStatusVisual(booking.status);

  const isPending = booking.status === "pending";

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={booking.serviceName}
      onPress={onPress}
      style={({ pressed }) => [
        styles.requestCard,
        isPending && styles.pendingRequestCard,
        pressed && styles.cardPressed,
      ]}
    >
      <View
        style={[
          styles.requestHeader,
          {
            flexDirection: isRtl ? "row-reverse" : "row",
          },
        ]}
      >
        <View
          style={[
            styles.serviceIcon,
            {
              backgroundColor:
                KhedmatPalette.surfaceSoft,
            },
          ]}
        >
          <Ionicons
            name={getServiceIcon(booking.serviceId)}
            size={22}
            color={KhedmatPalette.blue500}
          />
        </View>

        <View
          style={[
            styles.requestMainCopy,
            {
              alignItems: isRtl ? "flex-end" : "flex-start",
            },
          ]}
        >
          <Text
            numberOfLines={1}
            style={[styles.requestTitle, directionStyle(isRtl)]}
          >
            {booking.serviceName}
          </Text>

          <Text
            numberOfLines={1}
            style={[styles.requestReference, directionStyle(isRtl)]}
          >
            {booking.customerName?.trim() || customerFallback}
          </Text>
        </View>

        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor: status.backgroundColor,
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
            {statusLabel}
          </Text>
        </View>
      </View>

      <View
        style={[
          styles.compactMetaRow,
          {
            flexDirection: isRtl ? "row-reverse" : "row",
          },
        ]}
      >
        <Ionicons
          name="calendar-outline"
          size={15}
          color={KhedmatPalette.textMuted}
        />

        <Text
          numberOfLines={1}
          style={[
            styles.compactMetaText,
            directionStyle(isRtl),
          ]}
        >
          {formatBookingDate(
            booking.date,
            language,
          )}
          {" · "}
          {formatTime(
            booking.time,
            language,
          )}
        </Text>
      </View>

      <View
        style={[
          styles.compactMetaRow,
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
          numberOfLines={1}
          style={[
            styles.compactMetaText,
            directionStyle(isRtl),
          ]}
        >
          {booking.address.label}
        </Text>
      </View>

      <View
        style={[
          styles.requestFooter,
          {
            flexDirection: isRtl ? "row-reverse" : "row",
          },
        ]}
      >
        <Text
          style={[
            styles.priceText,
            directionStyle(isRtl),
          ]}
        >
          {formatCurrency(
            booking.servicePrice,
            language,
          )}
        </Text>

      <View
        style={[
          styles.openDetailsRow,
          {
            flexDirection: isRtl ? "row-reverse" : "row",
          },
        ]}
      >
        <Text style={[styles.openDetailsText, directionStyle(isRtl)]}>
          {viewDetailsLabel}
        </Text>

        <Ionicons
          name={isRtl ? "chevron-back" : "chevron-forward"}
          size={18}
          color={KhedmatPalette.blue500}
        />
      </View>
      </View>
    </Pressable>
  );
}

type EmptyRequestsProps = {
  filter: RequestFilter;
  title: string;
  subtitle: string;
  isRtl: boolean;
};

function EmptyRequests({
  filter,
  title,
  subtitle,
  isRtl,
}: EmptyRequestsProps) {
  return (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconContainer}>
        <Ionicons
          name={getEmptyIcon(filter)}
          size={34}
          color={KhedmatPalette.blue500}
        />
      </View>

      <Text style={[styles.emptyTitle, directionStyle(isRtl)]}>
        {title}
      </Text>

      <Text style={[styles.emptySubtitle, directionStyle(isRtl)]}>
        {subtitle}
      </Text>
    </View>
  );
}


function formatRequestCount(
  count: number,
  language: LanguageName,
): string {
  const value = formatDigits(
    count.toString(),
    language !== "English",
  );

  if (language === "Dari") {
    return `${value} درخواست`;
  }

  if (language === "Pashto") {
    return `${value} غوښتنې`;
  }

  return count === 1
    ? "1 request"
    : `${count} requests`;
}

function getFilterLabelKey(
  filter: RequestFilter,
):
  | "providerRequestsStatusNew"
  | "providerRequestsActive"
  | "providerRequestsCompleted"
  | "providerRequestsCancelled" {
  if (filter === "pending") {
    return "providerRequestsStatusNew";
  }

  if (filter === "active") {
    return "providerRequestsActive";
  }

  if (filter === "completed") {
    return "providerRequestsCompleted";
  }

  return "providerRequestsCancelled";
}

function getFilterTitleKey(
  filter: RequestFilter,
):
  | "providerRequestsPending"
  | "providerRequestsActive"
  | "providerRequestsCompleted"
  | "providerRequestsCancelled" {
  if (filter === "pending") {
    return "providerRequestsPending";
  }

  if (filter === "active") {
    return "providerRequestsActive";
  }

  if (filter === "completed") {
    return "providerRequestsCompleted";
  }

  return "providerRequestsCancelled";
}

function getFilterSubtitleKey(
  filter: RequestFilter,
):
  | "providerRequestsPendingFilterSubtitle"
  | "providerRequestsActiveFilterSubtitle"
  | "providerRequestsCompletedFilterSubtitle"
  | "providerRequestsCancelledFilterSubtitle" {
  if (filter === "pending") {
    return "providerRequestsPendingFilterSubtitle";
  }

  if (filter === "active") {
    return "providerRequestsActiveFilterSubtitle";
  }

  if (filter === "completed") {
    return "providerRequestsCompletedFilterSubtitle";
  }

  return "providerRequestsCancelledFilterSubtitle";
}

function getEmptyIcon(filter: RequestFilter): IconName {
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

function getEmptyTitleKey(
  filter: RequestFilter,
):
  | "providerRequestsEmptyPendingTitle"
  | "providerRequestsEmptyActiveTitle"
  | "providerRequestsEmptyCompletedTitle"
  | "providerRequestsEmptyCancelledTitle" {
  if (filter === "pending") {
    return "providerRequestsEmptyPendingTitle";
  }

  if (filter === "active") {
    return "providerRequestsEmptyActiveTitle";
  }

  if (filter === "completed") {
    return "providerRequestsEmptyCompletedTitle";
  }

  return "providerRequestsEmptyCancelledTitle";
}

function getEmptySubtitleKey(
  filter: RequestFilter,
):
  | "providerRequestsEmptyPendingMessage"
  | "providerRequestsEmptyActiveMessage"
  | "providerRequestsEmptyCompletedMessage"
  | "providerRequestsEmptyCancelledMessage" {
  if (filter === "pending") {
    return "providerRequestsEmptyPendingMessage";
  }

  if (filter === "active") {
    return "providerRequestsEmptyActiveMessage";
  }

  if (filter === "completed") {
    return "providerRequestsEmptyCompletedMessage";
  }

  return "providerRequestsEmptyCancelledMessage";
}

function getStatusLabelKey(
  status: BookingStatus,
):
  | "providerRequestsStatusNew"
  | "providerRequestsStatusAccepted"
  | "providerRequestsStatusInProgress"
  | "providerRequestsStatusCompleted"
  | "providerRequestsStatusCancelled" {
  if (status === "confirmed") {
    return "providerRequestsStatusAccepted";
  }

  if (status === "in-progress") {
    return "providerRequestsStatusInProgress";
  }

  if (status === "completed") {
    return "providerRequestsStatusCompleted";
  }

  if (status === "cancelled") {
    return "providerRequestsStatusCancelled";
  }

  return "providerRequestsStatusNew";
}

function getStatusVisual(status: BookingStatus) {
  if (status === "confirmed") {
    return {
      color: KhedmatPalette.blue500,
      backgroundColor: INFO_SOFT,
    };
  }

  if (status === "in-progress") {
    return {
      color: KhedmatPalette.navy700,
      backgroundColor: KhedmatPalette.blue050,
    };
  }

  if (status === "completed") {
    return {
      color: SUCCESS,
      backgroundColor: SUCCESS_SOFT,
    };
  }

  if (status === "cancelled") {
    return {
      color: ERROR,
      backgroundColor: ERROR_SOFT,
    };
  }

  return {
    color: WARNING,
    backgroundColor: WARNING_SOFT,
  };
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


function getBookingTimestamp(booking: BookingRecord): number {
  const date = booking.date || "1970-01-01";

  const time = booking.time || "00:00";

  const timestamp = new Date(`${date}T${time}:00`).getTime();

  return Number.isFinite(timestamp) ? timestamp : 0;
}

function formatBookingDate(value: string, language: LanguageName): string {
  if (!value) {
    if (language === "English") {
      return "Unknown";
    }

    if (language === "Pashto") {
      return "نامعلوم";
    }

    return "نامشخص";
  }

  const [year, month, day] = value.split("-").map(Number);

  if (!year || !month || !day) {
    return language === "English" ? value : formatDigits(value, true);
  }

  const date = new Date(year, month - 1, day);

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

function formatTime(value: string, language: LanguageName): string {
  if (!value) {
    if (language === "English") {
      return "Unknown";
    }

    return language === "Pashto" ? "نامعلوم" : "نامشخص";
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

  title: {
    ...Typography.screenTitle,
    width: "100%",
    color: KhedmatPalette.textPrimary,
    fontSize: 27,
    lineHeight: 34,
  },

  filtersRow: {
    marginTop: Spacing.xl,
    gap: Spacing.sm,
    paddingHorizontal: 1,
  },

  filterChip: {
    minHeight: 44,
    paddingHorizontal: Spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    borderWidth: 1,
    borderColor: KhedmatPalette.border,
    borderRadius: Radius.pill,
    backgroundColor: KhedmatPalette.surface,
  },

  filterChipSelected: {
    borderColor: KhedmatPalette.navy900,
    backgroundColor: KhedmatPalette.navy900,
  },

  filterLabel: {
    ...Typography.captionStyle,
    color: KhedmatPalette.textSecondary,
  },

  filterLabelSelected: {
    color: KhedmatPalette.white,
    fontFamily: Fonts.medium,
  },

  filterCount: {
    minWidth: 24,
    height: 24,
    paddingHorizontal: 6,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: KhedmatPalette.surfaceSoft,
  },

  filterCountSelected: {
    backgroundColor: "rgba(255,255,255,0.18)",
  },

  filterCountText: {
    fontFamily: Fonts.medium,
    fontSize: 11,
    color: KhedmatPalette.textMuted,
  },

  filterCountTextSelected: {
    color: KhedmatPalette.white,
  },

  requestsList: {
    width: "100%",
    marginTop: Spacing.lg,
    gap: Spacing.lg,
  },

  requestCard: {
    width: "100%",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: KhedmatPalette.border,
    borderRadius: Radius.xl,
    backgroundColor: KhedmatPalette.surface,
    ...Shadows.small,
  },

  pendingRequestCard: {
    borderColor: KhedmatPalette.border,
    backgroundColor: KhedmatPalette.white,
  },

  requestHeader: {
    width: "100%",
    alignItems: "flex-start",
    gap: Spacing.md,
  },

  serviceIcon: {
    width: 44,
    height: 44,
    flexShrink: 0,
    borderRadius: Radius.lg,
    alignItems: "center",
    justifyContent: "center",
  },

  requestMainCopy: {
    flex: 1,
    gap: 3,
  },

  requestTitle: {
    ...Typography.sectionTitle,
    width: "100%",
    color: KhedmatPalette.navy900,
    fontSize: 17,
    lineHeight: 24,
  },

  requestReference: {
    ...Typography.captionStyle,
    width: "100%",
    color: KhedmatPalette.textMuted,
    fontSize: 11,
  },

  statusBadge: {
    maxWidth: 112,
    flexShrink: 0,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: Radius.pill,
  },

  statusText: {
    ...Typography.captionStyle,
    fontFamily: Fonts.medium,
    fontSize: 10,
    textAlign: "center",
  },

  emptyState: {
    minHeight: 340,
    paddingHorizontal: Spacing.xl,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.md,
  },

  emptyIconContainer: {
    width: 82,
    height: 82,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: KhedmatPalette.border,
    backgroundColor: KhedmatPalette.surface,
  },

  emptyTitle: {
    ...Typography.sectionTitle,
    maxWidth: 340,
    color: KhedmatPalette.textPrimary,
    textAlign: "center",
  },

  emptySubtitle: {
    ...Typography.bodyStyle,
    maxWidth: 350,
    color: KhedmatPalette.textSecondary,
    textAlign: "center",
  },

  resultsCountLabel: {
    ...Typography.captionStyle,
    width: "100%",
    marginTop: Spacing.xl,
    color: KhedmatPalette.textMuted,
    fontFamily: Fonts.medium,
  },

  compactMetaRow: {
    width: "100%",
    marginTop: Spacing.sm,
    alignItems: "center",
    gap: 6,
  },

  compactMetaText: {
    ...Typography.captionStyle,
    flex: 1,
    color: KhedmatPalette.textSecondary,
    fontSize: 12,
  },

  requestFooter: {
    width: "100%",
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: KhedmatPalette.border,
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.md,
  },

  priceText: {
    ...Typography.label,
    flexShrink: 0,
    color: KhedmatPalette.navy900,
    fontFamily: Fonts.bold,
    fontSize: 14,
  },

  pressed: {
    opacity: 0.78,
  },

  openDetailsRow: {
    flexShrink: 0,
    alignItems: "center",
    gap: 4,
  },

  openDetailsText: {
    ...Typography.label,
    color: KhedmatPalette.blue500,
    fontSize: 13,
  },

  cardPressed: {
    opacity: 0.9,
  },
});
