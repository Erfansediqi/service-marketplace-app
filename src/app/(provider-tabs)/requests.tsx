import { Ionicons } from "@expo/vector-icons";
import {
  ComponentProps,
  ReactNode,
  useMemo,
  useState,
} from "react";
import {
  Alert,
  Pressable,
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
import { useNotifications } from "../../context/notification-context";
import { useSession } from "../../context/session-context";

type IconName =
  ComponentProps<typeof Ionicons>["name"];

type LanguageName =
  | "English"
  | "Dari"
  | "Pashto";

type RequestFilter =
  | "pending"
  | "active"
  | "completed"
  | "cancelled";

type FilterDefinition = {
  id: RequestFilter;
  icon: IconName;
};

type RequestCopy = ReturnType<
  typeof getRequestCopy
>;

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
  const { width } =
    useWindowDimensions();

  const {
    bookings,
    updateBookingStatus,
  } = useBooking();

  const {
    createCustomerBookingConfirmedNotification,
    createCustomerBookingCompletedNotification,
  } = useNotifications();

  const { activeProviderId } =
    useSession();

  const { language } =
    useLanguage();

  const activeLanguage =
    normalizeLanguage(language);

  const isRtl =
    activeLanguage === "Dari" ||
    activeLanguage === "Pashto";

  const localizedDigits =
    activeLanguage !== "English";

  const copy =
    getRequestCopy(
      activeLanguage,
    );

  const providerId =
    activeProviderId ??
    "provider-1";

  const [
    selectedFilter,
    setSelectedFilter,
  ] = useState<RequestFilter>(
    "pending",
  );

  const [
    expandedBookingId,
    setExpandedBookingId,
  ] = useState<string | null>(
    null,
  );

  const compactLayout =
    width < 370;

  const providerBookings =
    useMemo(
      () =>
        bookings.filter(
          (booking) =>
            booking.providerId ===
            providerId,
        ),
      [bookings, providerId],
    );

  const counts = useMemo(
    () => ({
      pending:
        providerBookings.filter(
          (booking) =>
            booking.status ===
            "pending",
        ).length,

      active:
        providerBookings.filter(
          (booking) =>
            booking.status ===
              "confirmed" ||
            booking.status ===
              "in-progress",
        ).length,

      completed:
        providerBookings.filter(
          (booking) =>
            booking.status ===
            "completed",
        ).length,

      cancelled:
        providerBookings.filter(
          (booking) =>
            booking.status ===
            "cancelled",
        ).length,
    }),
    [providerBookings],
  );

  const filteredBookings =
    useMemo(() => {
      const matching =
        providerBookings.filter(
          (booking) => {
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

      return [...matching].sort(
        (first, second) => {
          const firstTime =
            getBookingTimestamp(
              first,
            );

          const secondTime =
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
              secondTime -
              firstTime
            );
          }

          return (
            firstTime -
            secondTime
          );
        },
      );
    }, [
      providerBookings,
      selectedFilter,
    ]);

  const handleAccept = (
    booking: BookingRecord,
  ) => {
    Alert.alert(
      copy.acceptDialogTitle,
      copy.acceptDialogMessage(
        booking.serviceName,
      ),
      [
        {
          text: copy.cancel,
          style: "cancel",
        },
        {
          text: copy.accept,
          onPress: async () => {
            try {
              await updateBookingStatus(
                booking.id,
                "confirmed",
              );

              try {
                await createCustomerBookingConfirmedNotification(
                  {
                    customerId:
                      booking.customerId,
                    bookingId:
                      booking.id,
                    providerName:
                      booking.providerName,
                  },
                );
              } catch (
                notificationError
              ) {
                console.error(
                  "Booking was confirmed, but the customer notification failed:",
                  notificationError,
                );
              }

              setExpandedBookingId(
                null,
              );
            } catch (error) {
              console.error(
                "Failed to confirm booking:",
                error,
              );

              Alert.alert(
                "Unable to update booking",
                "Please try again.",
              );
            }
          },
        },
      ],
    );
  };

  const handleReject = (
    booking: BookingRecord,
  ) => {
    Alert.alert(
      copy.rejectDialogTitle,
      copy.rejectDialogMessage,
      [
        {
          text: copy.goBack,
          style: "cancel",
        },
        {
          text: copy.reject,
          style: "destructive",
          onPress: async () => {
            try {
              await updateBookingStatus(
                booking.id,
                "cancelled",
              );

              setExpandedBookingId(
                null,
              );
            } catch (error) {
              console.error(
                "Failed to cancel booking:",
                error,
              );

              Alert.alert(
                "Unable to update booking",
                "Please try again.",
              );
            }
          },
        },
      ],
    );
  };

  const handleStartWork = (
    booking: BookingRecord,
  ) => {
    Alert.alert(
      copy.startDialogTitle,
      copy.startDialogMessage,
      [
        {
          text: copy.cancel,
          style: "cancel",
        },
        {
          text: copy.startWork,
          onPress: async () => {
            try {
              await updateBookingStatus(
                booking.id,
                "in-progress",
              );
            } catch (error) {
              console.error(
                "Failed to start booking:",
                error,
              );

              Alert.alert(
                "Unable to update booking",
                "Please try again.",
              );
            }
          },
        },
      ],
    );
  };

  const handleCompleteWork = (
    booking: BookingRecord,
  ) => {
    Alert.alert(
      copy.completeDialogTitle,
      copy.completeDialogMessage,
      [
        {
          text: copy.cancel,
          style: "cancel",
        },
        {
          text: copy.completeWork,
          onPress: async () => {
            try {
              await updateBookingStatus(
                booking.id,
                "completed",
              );

              try {
                await createCustomerBookingCompletedNotification(
                  {
                    customerId:
                      booking.customerId,
                    bookingId:
                      booking.id,
                    providerName:
                      booking.providerName,
                  },
                );
              } catch (
                notificationError
              ) {
                console.error(
                  "Booking was completed, but the customer notification failed:",
                  notificationError,
                );
              }
            } catch (error) {
              console.error(
                "Failed to complete booking:",
                error,
              );

              Alert.alert(
                "Unable to update booking",
                "Please try again.",
              );
            }
          },
        },
      ],
    );
  };

  const toggleExpanded = (
    bookingId: string,
  ) => {
    setExpandedBookingId(
      (current) =>
        current === bookingId
          ? null
          : bookingId,
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

        <View
          style={
            styles.overviewGrid
          }
        >
          <OverviewCard
            icon="time-outline"
            label={
              copy.pendingOverview
            }
            value={counts.pending}
            color={WARNING}
            backgroundColor={
              WARNING_SOFT
            }
            isRtl={isRtl}
            localizedDigits={
              localizedDigits
            }
            compact={
              compactLayout
            }
          />

          <OverviewCard
            icon="briefcase-outline"
            label={
              copy.activeOverview
            }
            value={counts.active}
            color={
              KhedmatPalette.blue500
            }
            backgroundColor={
              INFO_SOFT
            }
            isRtl={isRtl}
            localizedDigits={
              localizedDigits
            }
            compact={
              compactLayout
            }
          />

          <OverviewCard
            icon="checkmark-circle-outline"
            label={
              copy.completedOverview
            }
            value={
              counts.completed
            }
            color={SUCCESS}
            backgroundColor={
              SUCCESS_SOFT
            }
            isRtl={isRtl}
            localizedDigits={
              localizedDigits
            }
            compact={
              compactLayout
            }
          />
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
          {FILTERS.map(
            (filter) => {
              const selected =
                selectedFilter ===
                filter.id;

              const count =
                counts[filter.id];

              return (
                <Pressable
                  key={filter.id}
                  accessibilityRole="button"
                  accessibilityState={{
                    selected,
                  }}
                  accessibilityLabel={getFilterLabel(
                    filter.id,
                    activeLanguage,
                  )}
                  onPress={() => {
                    setSelectedFilter(
                      filter.id,
                    );

                    setExpandedBookingId(
                      null,
                    );
                  }}
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
                      styles.filterLabel,
                      selected &&
                        styles.filterLabelSelected,
                      directionStyle(
                        isRtl,
                      ),
                    ]}
                  >
                    {getFilterLabel(
                      filter.id,
                      activeLanguage,
                    )}
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
                        localizedDigits,
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
            styles.resultsHeader,
            {
              flexDirection: isRtl
                ? "row-reverse"
                : "row",
            },
          ]}
        >
          <View
            style={[
              styles.resultsCopy,
              {
                alignItems: isRtl
                  ? "flex-end"
                  : "flex-start",
              },
            ]}
          >
            <Text
              style={[
                styles.resultsTitle,
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
                styles.resultsSubtitle,
                directionStyle(isRtl),
              ]}
            >
              {getFilterSubtitle(
                selectedFilter,
                activeLanguage,
              )}
            </Text>
          </View>

          <View
            style={
              styles.resultsCountBadge
            }
          >
            <Text
              style={
                styles.resultsCountText
              }
            >
              {formatDigits(
                filteredBookings.length.toString(),
                localizedDigits,
              )}
            </Text>
          </View>
        </View>

        <View
          style={
            styles.requestsList
          }
        >
          {filteredBookings.map(
            (booking) => (
              <ProviderRequestCard
                key={booking.id}
                booking={booking}
                expanded={
                  expandedBookingId ===
                  booking.id
                }
                language={
                  activeLanguage
                }
                isRtl={isRtl}
                copy={copy}
                onToggle={() =>
                  toggleExpanded(
                    booking.id,
                  )
                }
                onAccept={() =>
                  handleAccept(
                    booking,
                  )
                }
                onReject={() =>
                  handleReject(
                    booking,
                  )
                }
                onStart={() =>
                  handleStartWork(
                    booking,
                  )
                }
                onComplete={() =>
                  handleCompleteWork(
                    booking,
                  )
                }
              />
            ),
          )}

          {filteredBookings.length ===
          0 ? (
            <EmptyRequests
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

        <View
          style={[
            styles.noticeCard,
            {
              flexDirection: isRtl
                ? "row-reverse"
                : "row",
            },
          ]}
        >
          <View
            style={styles.noticeIcon}
          >
            <Ionicons
              name="information-circle-outline"
              size={23}
              color={
                KhedmatPalette.blue500
              }
            />
          </View>

          <Text
            style={[
              styles.noticeText,
              directionStyle(isRtl),
            ]}
          >
            {copy.notice}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

type OverviewCardProps = {
  icon: IconName;
  label: string;
  value: number;
  color: string;
  backgroundColor: string;
  isRtl: boolean;
  localizedDigits: boolean;
  compact: boolean;
};

function OverviewCard({
  icon,
  label,
  value,
  color,
  backgroundColor,
  isRtl,
  localizedDigits,
  compact,
}: OverviewCardProps) {
  return (
    <View
      style={[
        styles.overviewCard,
        compact &&
          styles.overviewCardCompact,
      ]}
    >
      <View
        style={[
          styles.overviewIcon,
          {
            backgroundColor,
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
        style={[
          styles.overviewValue,
          directionStyle(isRtl),
        ]}
      >
        {formatDigits(
          value.toString(),
          localizedDigits,
        )}
      </Text>

      <Text
        numberOfLines={2}
        style={[
          styles.overviewLabel,
          directionStyle(isRtl),
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

type ProviderRequestCardProps = {
  booking: BookingRecord;
  expanded: boolean;
  language: LanguageName;
  isRtl: boolean;
  copy: RequestCopy;
  onToggle: () => void;
  onAccept: () => void;
  onReject: () => void;
  onStart: () => void;
  onComplete: () => void;
};

function ProviderRequestCard({
  booking,
  expanded,
  language,
  isRtl,
  copy,
  onToggle,
  onAccept,
  onReject,
  onStart,
  onComplete,
}: ProviderRequestCardProps) {
  const status =
    getStatusConfig(
      booking.status,
      language,
    );

  const isPending =
    booking.status ===
    "pending";

  return (
    <View
      style={[
        styles.requestCard,
        isPending &&
          styles.pendingRequestCard,
      ]}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={
          booking.serviceName
        }
        accessibilityState={{
          expanded,
        }}
        onPress={onToggle}
        style={({ pressed }) => [
          styles.requestCardPressable,
          pressed &&
            styles.cardPressed,
        ]}
      >
        <View
          style={[
            styles.requestHeader,
            {
              flexDirection: isRtl
                ? "row-reverse"
                : "row",
            },
          ]}
        >
          <View
            style={[
              styles.serviceIcon,
              {
                backgroundColor:
                  isPending
                    ? WARNING_SOFT
                    : KhedmatPalette
                        .surfaceSoft,
              },
            ]}
          >
            <Ionicons
              name={getServiceIcon(
                booking.serviceId,
              )}
              size={24}
              color={
                isPending
                  ? WARNING
                  : KhedmatPalette
                      .blue500
              }
            />
          </View>

          <View
            style={[
              styles.requestMainCopy,
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
                styles.requestTitle,
                directionStyle(isRtl),
              ]}
            >
              {booking.serviceName}
            </Text>

            <Text
              style={[
                styles.requestReference,
                directionStyle(isRtl),
              ]}
            >
              {copy.requestNumber}:{" "}
              {getShortBookingId(
                booking.id,
                language,
              )}
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
                directionStyle(isRtl),
              ]}
            >
              {status.label}
            </Text>
          </View>
        </View>

        <View
          style={styles.summaryGrid}
        >
          <RequestSummary
            icon="calendar-outline"
            label={copy.date}
            value={formatBookingDate(
              booking.date,
              language,
            )}
            isRtl={isRtl}
          />

          <RequestSummary
            icon="time-outline"
            label={copy.time}
            value={formatTime(
              booking.time,
              language,
            )}
            isRtl={isRtl}
          />

          <RequestSummary
            icon="location-outline"
            label={copy.location}
            value={
              booking.address.label
            }
            isRtl={isRtl}
          />

          <RequestSummary
            icon="cash-outline"
            label={
              copy.estimatedCost
            }
            value={formatCurrency(
              booking.servicePrice,
              language,
            )}
            isRtl={isRtl}
          />
        </View>

        <View
          style={[
            styles.expandRow,
            {
              flexDirection: isRtl
                ? "row-reverse"
                : "row",
            },
          ]}
        >
          <Text
            style={[
              styles.expandText,
              directionStyle(isRtl),
            ]}
          >
            {expanded
              ? copy.closeDetails
              : copy.viewDetails}
          </Text>

          <Ionicons
            name={
              expanded
                ? "chevron-up"
                : "chevron-down"
            }
            size={17}
            color={
              KhedmatPalette.blue500
            }
          />
        </View>
      </Pressable>

      {expanded ? (
        <View
          style={
            styles.expandedContent
          }
        >
          <View
            style={styles.divider}
          />

          <DetailSection
            icon="location-outline"
            title={
              copy.serviceAddress
            }
            isRtl={isRtl}
          >
            <Text
              style={[
                styles.detailText,
                directionStyle(isRtl),
              ]}
            >
              {
                booking.address
                  .fullAddress
              }
            </Text>
          </DetailSection>

          <View
            style={
              styles.smallDivider
            }
          />

          <DetailSection
            icon="document-text-outline"
            title={
              copy.customerNotes
            }
            isRtl={isRtl}
          >
            <Text
              style={[
                styles.detailText,
                directionStyle(isRtl),
              ]}
            >
              {booking.notes?.trim()
                ? booking.notes
                : copy.noNotes}
            </Text>
          </DetailSection>

          <View
            style={
              styles.smallDivider
            }
          />

          <DetailSection
            icon="receipt-outline"
            title={
              copy.priceSummary
            }
            isRtl={isRtl}
          >
            <View
              style={
                styles.priceRows
              }
            >
              <PriceRow
                label={
                  copy.serviceCost
                }
                value={formatCurrency(
                  booking.servicePrice,
                  language,
                )}
                isRtl={isRtl}
              />

              <PriceRow
                label={
                  copy.platformFee
                }
                value={formatCurrency(
                  booking.platformFee,
                  language,
                )}
                isRtl={isRtl}
              />

              <View
                style={
                  styles.priceDivider
                }
              />

              <PriceRow
                label={
                  copy.customerTotal
                }
                value={formatCurrency(
                  booking.total,
                  language,
                )}
                emphasized
                isRtl={isRtl}
              />
            </View>
          </DetailSection>

          <RequestActions
            booking={booking}
            copy={copy}
            isRtl={isRtl}
            onAccept={onAccept}
            onReject={onReject}
            onStart={onStart}
            onComplete={onComplete}
          />
        </View>
      ) : null}
    </View>
  );
}

type RequestSummaryProps = {
  icon: IconName;
  label: string;
  value: string;
  isRtl: boolean;
};

function RequestSummary({
  icon,
  label,
  value,
  isRtl,
}: RequestSummaryProps) {
  return (
    <View
      style={[
        styles.summaryItem,
        {
          flexDirection: isRtl
            ? "row-reverse"
            : "row",
        },
      ]}
    >
      <View
        style={styles.summaryIcon}
      >
        <Ionicons
          name={icon}
          size={16}
          color={
            KhedmatPalette.blue500
          }
        />
      </View>

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
            styles.summaryLabel,
            directionStyle(isRtl),
          ]}
        >
          {label}
        </Text>

        <Text
          numberOfLines={2}
          style={[
            styles.summaryValue,
            directionStyle(isRtl),
          ]}
        >
          {value}
        </Text>
      </View>
    </View>
  );
}

type DetailSectionProps = {
  icon: IconName;
  title: string;
  children: ReactNode;
  isRtl: boolean;
};

function DetailSection({
  icon,
  title,
  children,
  isRtl,
}: DetailSectionProps) {
  return (
    <View
      style={styles.detailSection}
    >
      <View
        style={[
          styles.detailHeader,
          {
            flexDirection: isRtl
              ? "row-reverse"
              : "row",
          },
        ]}
      >
        <View
          style={
            styles.detailHeaderIcon
          }
        >
          <Ionicons
            name={icon}
            size={17}
            color={
              KhedmatPalette.blue500
            }
          />
        </View>

        <Text
          style={[
            styles.detailTitle,
            directionStyle(isRtl),
          ]}
        >
          {title}
        </Text>
      </View>

      {children}
    </View>
  );
}

type PriceRowProps = {
  label: string;
  value: string;
  emphasized?: boolean;
  isRtl: boolean;
};

function PriceRow({
  label,
  value,
  emphasized = false,
  isRtl,
}: PriceRowProps) {
  return (
    <View
      style={[
        styles.priceRow,
        {
          flexDirection: isRtl
            ? "row-reverse"
            : "row",
        },
      ]}
    >
      <Text
        style={[
          styles.priceLabel,
          emphasized &&
            styles.priceLabelEmphasized,
          directionStyle(isRtl),
        ]}
      >
        {label}
      </Text>

      <Text
        style={[
          styles.priceValue,
          emphasized &&
            styles.priceValueEmphasized,
          directionStyle(isRtl),
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

type RequestActionsProps = {
  booking: BookingRecord;
  copy: RequestCopy;
  isRtl: boolean;
  onAccept: () => void;
  onReject: () => void;
  onStart: () => void;
  onComplete: () => void;
};

function RequestActions({
  booking,
  copy,
  isRtl,
  onAccept,
  onReject,
  onStart,
  onComplete,
}: RequestActionsProps) {
  if (
    booking.status ===
    "pending"
  ) {
    return (
      <View
        style={[
          styles.actions,
          {
            flexDirection: isRtl
              ? "row-reverse"
              : "row",
          },
        ]}
      >
        <RequestActionButton
          label={copy.accept}
          icon="checkmark-circle-outline"
          variant="primary"
          isRtl={isRtl}
          onPress={onAccept}
        />

        <RequestActionButton
          label={copy.reject}
          icon="close-circle-outline"
          variant="destructive"
          isRtl={isRtl}
          onPress={onReject}
        />
      </View>
    );
  }

  if (
    booking.status ===
    "confirmed"
  ) {
    return (
      <View style={styles.actions}>
        <RequestActionButton
          label={copy.startWork}
          icon="play-circle-outline"
          variant="primary"
          isRtl={isRtl}
          onPress={onStart}
        />
      </View>
    );
  }

  if (
    booking.status ===
    "in-progress"
  ) {
    return (
      <View style={styles.actions}>
        <RequestActionButton
          label={copy.completeWork}
          icon="checkmark-done-outline"
          variant="success"
          isRtl={isRtl}
          onPress={onComplete}
        />
      </View>
    );
  }

  if (
    booking.status ===
    "completed"
  ) {
    return (
      <StatusMessage
        icon="checkmark-circle"
        text={
          copy.completedMessage
        }
        color={SUCCESS}
        backgroundColor={
          SUCCESS_SOFT
        }
        isRtl={isRtl}
      />
    );
  }

  return (
    <StatusMessage
      icon="close-circle-outline"
      text={
        copy.cancelledMessage
      }
      color={ERROR}
      backgroundColor={
        ERROR_SOFT
      }
      isRtl={isRtl}
    />
  );
}

type RequestActionButtonProps = {
  label: string;
  icon: IconName;
  variant:
    | "primary"
    | "destructive"
    | "success";
  isRtl: boolean;
  onPress: () => void;
};

function RequestActionButton({
  label,
  icon,
  variant,
  isRtl,
  onPress,
}: RequestActionButtonProps) {
  const style =
    getActionStyle(variant);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [
        styles.actionButton,
        {
          backgroundColor:
            style.backgroundColor,
          borderColor:
            style.borderColor,
        },
        pressed &&
          styles.actionButtonPressed,
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
          size={18}
          color={style.color}
        />

        <Text
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.82}
          style={[
            styles.actionButtonText,
            {
              color: style.color,
            },
            directionStyle(isRtl),
          ]}
        >
          {label}
        </Text>
      </View>
    </Pressable>
  );
}

type StatusMessageProps = {
  icon: IconName;
  text: string;
  color: string;
  backgroundColor: string;
  isRtl: boolean;
};

function StatusMessage({
  icon,
  text,
  color,
  backgroundColor,
  isRtl,
}: StatusMessageProps) {
  return (
    <View
      style={[
        styles.statusMessage,
        {
          backgroundColor,
          flexDirection: isRtl
            ? "row-reverse"
            : "row",
        },
      ]}
    >
      <Ionicons
        name={icon}
        size={21}
        color={color}
      />

      <Text
        style={[
          styles.statusMessageText,
          {
            color,
          },
          directionStyle(isRtl),
        ]}
      >
        {text}
      </Text>
    </View>
  );
}

type EmptyRequestsProps = {
  filter: RequestFilter;
  language: LanguageName;
  isRtl: boolean;
};

function EmptyRequests({
  filter,
  language,
  isRtl,
}: EmptyRequestsProps) {
  return (
    <View style={styles.emptyState}>
      <View
        style={
          styles.emptyIconContainer
        }
      >
        <Ionicons
          name={getEmptyIcon(
            filter,
          )}
          size={34}
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

function getActionStyle(
  variant:
    | "primary"
    | "destructive"
    | "success",
) {
  if (
    variant ===
    "destructive"
  ) {
    return {
      color: ERROR,
      backgroundColor:
        ERROR_SOFT,
      borderColor: "#E7B1AD",
    };
  }

  if (variant === "success") {
    return {
      color:
        KhedmatPalette.white,
      backgroundColor: SUCCESS,
      borderColor: SUCCESS,
    };
  }

  return {
    color:
      KhedmatPalette.white,
    backgroundColor:
      KhedmatPalette.navy900,
    borderColor:
      KhedmatPalette.navy900,
  };
}

function getFilterLabel(
  filter: RequestFilter,
  language: LanguageName,
): string {
  if (language === "English") {
    if (filter === "pending") {
      return "New";
    }

    if (filter === "active") {
      return "Active";
    }

    if (
      filter === "completed"
    ) {
      return "Completed";
    }

    return "Cancelled";
  }

  if (language === "Pashto") {
    if (filter === "pending") {
      return "نوې";
    }

    if (filter === "active") {
      return "فعال";
    }

    if (
      filter === "completed"
    ) {
      return "بشپړ";
    }

    return "لغوه";
  }

  if (filter === "pending") {
    return "جدید";
  }

  if (filter === "active") {
    return "فعال";
  }

  if (
    filter === "completed"
  ) {
    return "تکمیل‌شده";
  }

  return "رد و لغو";
}

function getFilterTitle(
  filter: RequestFilter,
  language: LanguageName,
): string {
  if (language === "English") {
    if (filter === "pending") {
      return "New requests";
    }

    if (filter === "active") {
      return "Active jobs";
    }

    if (
      filter === "completed"
    ) {
      return "Completed jobs";
    }

    return "Cancelled requests";
  }

  if (language === "Pashto") {
    if (filter === "pending") {
      return "نوې غوښتنې";
    }

    if (filter === "active") {
      return "فعال کارونه";
    }

    if (
      filter === "completed"
    ) {
      return "بشپړ شوي کارونه";
    }

    return "لغوه شوې غوښتنې";
  }

  if (filter === "pending") {
    return "درخواست‌های تازه";
  }

  if (filter === "active") {
    return "کارهای فعال";
  }

  if (
    filter === "completed"
  ) {
    return "کارهای تکمیل‌شده";
  }

  return "درخواست‌های رد یا لغوشده";
}

function getFilterSubtitle(
  filter: RequestFilter,
  language: LanguageName,
): string {
  if (language === "English") {
    if (filter === "pending") {
      return "Review and respond to new customer requests.";
    }

    if (filter === "active") {
      return "Manage confirmed and in-progress work.";
    }

    if (
      filter === "completed"
    ) {
      return "Review your completed service history.";
    }

    return "Review rejected or cancelled requests.";
  }

  if (language === "Pashto") {
    if (filter === "pending") {
      return "د پیرودونکو نوې غوښتنې وګورئ او ځواب ورکړئ.";
    }

    if (filter === "active") {
      return "تایید شوي او روان کارونه مدیریت کړئ.";
    }

    if (
      filter === "completed"
    ) {
      return "د بشپړ شوو خدمتونو تاریخچه وګورئ.";
    }

    return "رد یا لغوه شوې غوښتنې وګورئ.";
  }

  if (filter === "pending") {
    return "درخواست‌های تازهٔ مشتریان را بررسی و پاسخ دهید.";
  }

  if (filter === "active") {
    return "کارهای پذیرفته‌شده و در حال انجام را مدیریت کنید.";
  }

  if (
    filter === "completed"
  ) {
    return "سابقهٔ خدمات تکمیل‌شده را مشاهده کنید.";
  }

  return "درخواست‌های رد یا لغوشده را بررسی کنید.";
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

  if (
    filter === "completed"
  ) {
    return "checkmark-done-outline";
  }

  return "close-circle-outline";
}

function getEmptyTitle(
  filter: RequestFilter,
  language: LanguageName,
): string {
  if (language === "English") {
    if (filter === "pending") {
      return "No new requests";
    }

    if (filter === "active") {
      return "No active jobs";
    }

    if (
      filter === "completed"
    ) {
      return "No completed jobs yet";
    }

    return "No cancelled requests";
  }

  if (language === "Pashto") {
    if (filter === "pending") {
      return "نوې غوښتنه نشته";
    }

    if (filter === "active") {
      return "فعال کار نشته";
    }

    if (
      filter === "completed"
    ) {
      return "تر اوسه کار نه دی بشپړ شوی";
    }

    return "لغوه شوې غوښتنه نشته";
  }

  if (filter === "pending") {
    return "درخواست تازه‌ای ندارید";
  }

  if (filter === "active") {
    return "کار فعالی ندارید";
  }

  if (
    filter === "completed"
  ) {
    return "هنوز کاری تکمیل نشده است";
  }

  return "درخواست رد یا لغوشده‌ای نیست";
}

function getEmptySubtitle(
  filter: RequestFilter,
  language: LanguageName,
): string {
  if (language === "English") {
    if (filter === "pending") {
      return "New customer requests will appear here.";
    }

    if (filter === "active") {
      return "Accepted and in-progress jobs will appear here.";
    }

    if (
      filter === "completed"
    ) {
      return "Completed services will be added to this history.";
    }

    return "Rejected or cancelled requests will appear here.";
  }

  if (language === "Pashto") {
    if (filter === "pending") {
      return "د پیرودونکو نوې غوښتنې به دلته ښکاره شي.";
    }

    if (filter === "active") {
      return "منل شوي او روان کارونه به دلته ښکاره شي.";
    }

    if (
      filter === "completed"
    ) {
      return "بشپړ شوي خدمتونه به دې تاریخچې ته اضافه شي.";
    }

    return "رد یا لغوه شوې غوښتنې به دلته ښکاره شي.";
  }

  if (filter === "pending") {
    return "درخواست‌های تازهٔ مشتریان در این بخش نمایش داده می‌شوند.";
  }

  if (filter === "active") {
    return "درخواست‌های پذیرفته‌شده و در حال انجام در این بخش قرار می‌گیرند.";
  }

  if (
    filter === "completed"
  ) {
    return "پس از تکمیل خدمت، سابقهٔ آن در این بخش نمایش داده می‌شود.";
  }

  return "درخواست‌هایی که رد یا لغو شوند در این قسمت قرار خواهند گرفت.";
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
        INFO_SOFT,
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
      color: SUCCESS,
      backgroundColor:
        SUCCESS_SOFT,
    };
  }

  if (status === "cancelled") {
    return {
      label: labels.cancelled,
      color: ERROR,
      backgroundColor:
        ERROR_SOFT,
    };
  }

  return {
    label: labels.pending,
    color: WARNING,
    backgroundColor:
      WARNING_SOFT,
  };
}

function getStatusLabels(
  language: LanguageName,
) {
  if (language === "English") {
    return {
      confirmed: "Accepted",
      inProgress: "In progress",
      completed: "Completed",
      cancelled: "Cancelled",
      pending: "New",
    };
  }

  if (language === "Pashto") {
    return {
      confirmed: "منل شوی",
      inProgress: "روان",
      completed: "بشپړ شوی",
      cancelled: "لغوه شوی",
      pending: "نوې",
    };
  }

  return {
    confirmed: "پذیرفته‌شده",
    inProgress: "در حال انجام",
    completed: "تکمیل‌شده",
    cancelled: "رد یا لغو",
    pending: "جدید",
  };
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
    normalized.includes("heater") ||
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

function getShortBookingId(
  bookingId: string,
  language: LanguageName,
): string {
  const finalPart =
    bookingId.split("-").pop() ??
    bookingId;

  const shortened =
    finalPart.slice(-8);

  return language === "English"
    ? shortened
    : formatDigits(
        shortened,
        true,
      );
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
    if (language === "English") {
      return "Unknown";
    }

    if (language === "Pashto") {
      return "نامعلوم";
    }

    return "نامشخص";
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

  try {
    const formatted =
      new Intl.DateTimeFormat(
        language === "English"
          ? "en-US"
          : "fa-AF",
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
      ? value
      : formatDigits(
          value,
          true,
        );
  }
}

function formatTime(
  value: string,
  language: LanguageName,
): string {
  if (!value) {
    if (language === "English") {
      return "Unknown";
    }

    return language === "Pashto"
      ? "نامعلوم"
      : "نامشخص";
  }

  const [
    hoursRaw,
    minutesRaw,
  ] = value.split(":");

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

  if (language === "English") {
    return `${formatted} AFN`;
  }

  const localized =
    formatDigits(
      formatted,
      true,
    );

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

function getRequestCopy(
  language: LanguageName,
) {
  if (language === "Dari") {
    return {
      eyebrow: "مدیریت کارها",
      title: "درخواست‌ها",

      subtitle:
        "درخواست‌های تازه را بررسی کنید و وضعیت کارهای پذیرفته‌شده را مدیریت نمایید.",

      pendingOverview:
        "درخواست جدید",

      activeOverview:
        "کار فعال",

      completedOverview:
        "تکمیل‌شده",

      requestNumber:
        "شماره درخواست",

      date: "تاریخ",
      time: "زمان",
      location: "محل",

      estimatedCost:
        "هزینه تخمینی",

      serviceAddress:
        "آدرس انجام خدمت",

      customerNotes:
        "توضیحات مشتری",

      noNotes:
        "مشتری توضیح اضافی وارد نکرده است.",

      priceSummary:
        "خلاصه هزینه",

      serviceCost:
        "هزینه خدمت",

      platformFee:
        "هزینه پلتفرم",

      customerTotal:
        "مجموع مشتری",

      viewDetails:
        "مشاهده جزئیات",

      closeDetails:
        "بستن جزئیات",

      accept:
        "پذیرش درخواست",

      reject: "رد درخواست",

      startWork: "شروع کار",

      completeWork:
        "تکمیل خدمت",

      completedMessage:
        "این خدمت تکمیل شده است.",

      cancelledMessage:
        "این درخواست رد یا لغو شده است.",

      notice:
        "پیش از پذیرش، تاریخ، زمان، آدرس، توضیحات و هزینهٔ تخمینی درخواست را دقیق بررسی کنید.",

      acceptDialogTitle:
        "پذیرش درخواست",

      acceptDialogMessage:
        (service: string) =>
          `آیا می‌خواهید درخواست «${service}» را بپذیرید؟`,

      rejectDialogTitle:
        "رد درخواست",

      rejectDialogMessage:
        "با رد درخواست، مشتری باید ارائه‌دهندهٔ دیگری انتخاب کند.",

      startDialogTitle:
        "شروع کار",

      startDialogMessage:
        "آیا در محل حاضر شده‌اید و می‌خواهید وضعیت کار را به «در حال انجام» تغییر دهید؟",

      completeDialogTitle:
        "تکمیل خدمت",

      completeDialogMessage:
        "پس از تکمیل، این رزرو وارد سابقهٔ کارهای تکمیل‌شده می‌شود.",

      cancel: "لغو",
      goBack: "بازگشت",
    };
  }

  if (language === "Pashto") {
    return {
      eyebrow:
        "د کارونو مدیریت",

      title: "غوښتنې",

      subtitle:
        "نوې غوښتنې وګورئ او د منل شوو کارونو حالت مدیریت کړئ.",

      pendingOverview:
        "نوې غوښتنې",

      activeOverview:
        "فعال کارونه",

      completedOverview:
        "بشپړ شوي",

      requestNumber:
        "د غوښتنې شمېره",

      date: "نېټه",
      time: "وخت",
      location: "ځای",

      estimatedCost:
        "اټکلي لګښت",

      serviceAddress:
        "د خدمت پته",

      customerNotes:
        "د پیرودونکي یادښت",

      noNotes:
        "پیرودونکي اضافي معلومات نه دي لیکلي.",

      priceSummary:
        "د لګښت لنډیز",

      serviceCost:
        "د خدمت لګښت",

      platformFee:
        "د پلېټفارم فیس",

      customerTotal:
        "د پیرودونکي ټول مبلغ",

      viewDetails:
        "تفصیل وګورئ",

      closeDetails:
        "تفصیل وتړئ",

      accept:
        "غوښتنه ومنئ",

      reject:
        "غوښتنه رد کړئ",

      startWork:
        "کار پیل کړئ",

      completeWork:
        "خدمت بشپړ کړئ",

      completedMessage:
        "دا خدمت بشپړ شوی دی.",

      cancelledMessage:
        "دا غوښتنه رد یا لغوه شوې ده.",

      notice:
        "له منلو مخکې نېټه، وخت، پته، یادښتونه او اټکلي لګښت په دقت وګورئ.",

      acceptDialogTitle:
        "غوښتنه منل",

      acceptDialogMessage:
        (service: string) =>
          `ایا غواړئ د «${service}» غوښتنه ومنئ؟`,

      rejectDialogTitle:
        "غوښتنه ردول",

      rejectDialogMessage:
        "که غوښتنه رد کړئ، پیرودونکی باید بل خدمت وړاندې کوونکی وټاکي.",

      startDialogTitle:
        "کار پیلول",

      startDialogMessage:
        "ایا د خدمت ځای ته رسېدلي یاست او غواړئ حالت «روان» ته واړوئ؟",

      completeDialogTitle:
        "خدمت بشپړول",

      completeDialogMessage:
        "له بشپړېدو وروسته به دا رزرف د بشپړ شوو کارونو تاریخچې ته لاړ شي.",

      cancel: "لغوه",
      goBack: "بېرته",
    };
  }

  return {
    eyebrow: "Work management",
    title: "Requests",

    subtitle:
      "Review new requests and manage the status of accepted jobs.",

    pendingOverview:
      "New requests",

    activeOverview:
      "Active jobs",

    completedOverview:
      "Completed",

    requestNumber:
      "Request number",

    date: "Date",
    time: "Time",
    location: "Location",

    estimatedCost:
      "Estimated cost",

    serviceAddress:
      "Service address",

    customerNotes:
      "Customer notes",

    noNotes:
      "The customer did not provide additional notes.",

    priceSummary:
      "Price summary",

    serviceCost:
      "Service cost",

    platformFee:
      "Platform fee",

    customerTotal:
      "Customer total",

    viewDetails:
      "View details",

    closeDetails:
      "Close details",

    accept:
      "Accept request",

    reject:
      "Reject request",

    startWork: "Start work",

    completeWork:
      "Complete service",

    completedMessage:
      "This service has been completed.",

    cancelledMessage:
      "This request was rejected or cancelled.",

    notice:
      "Before accepting, carefully review the requested date, time, address, notes and estimated cost.",

    acceptDialogTitle:
      "Accept request",

    acceptDialogMessage:
      (service: string) =>
        `Do you want to accept the “${service}” request?`,

    rejectDialogTitle:
      "Reject request",

    rejectDialogMessage:
      "If you reject this request, the customer will need to select another provider.",

    startDialogTitle:
      "Start work",

    startDialogMessage:
      "Have you arrived at the service location and want to mark this job as in progress?",

    completeDialogTitle:
      "Complete service",

    completeDialogMessage:
      "After completion, this booking will be added to your completed-work history.",

    cancel: "Cancel",
    goBack: "Go back",
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

  overviewGrid: {
    width: "100%",
    marginTop: Spacing.xxl,
    flexDirection: "row",
    justifyContent:
      "space-between",
    gap: Spacing.sm,
  },

  overviewCard: {
    flex: 1,
    minHeight: 130,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.md,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor:
      KhedmatPalette.border,
    borderRadius: Radius.xl,
    backgroundColor:
      KhedmatPalette.surface,
    ...Shadows.small,
  },

  overviewCardCompact: {
    minHeight: 122,
    paddingHorizontal: 6,
  },

  overviewIcon: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
  },

  overviewValue: {
    ...Typography.sectionTitle,
    width: "100%",
    color:
      KhedmatPalette.textPrimary,
    textAlign: "center",
    fontSize: 20,
    lineHeight: 25,
  },

  overviewLabel: {
    ...Typography.captionStyle,
    width: "100%",
    color:
      KhedmatPalette.textMuted,
    textAlign: "center",
    fontSize: 11,
    lineHeight: 15,
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
    borderColor:
      KhedmatPalette.border,
    borderRadius: Radius.pill,
    backgroundColor:
      KhedmatPalette.surface,
  },

  filterChipSelected: {
    borderColor:
      KhedmatPalette.navy900,
    backgroundColor:
      KhedmatPalette.navy900,
  },

  filterLabel: {
    ...Typography.captionStyle,
    color:
      KhedmatPalette.textSecondary,
  },

  filterLabelSelected: {
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

  resultsHeader: {
    width: "100%",
    marginTop: Spacing.section,
    alignItems: "center",
    justifyContent:
      "space-between",
    gap: Spacing.md,
  },

  resultsCopy: {
    flex: 1,
    gap: 2,
  },

  resultsTitle: {
    ...Typography.sectionTitle,
    width: "100%",
    color:
      KhedmatPalette.textPrimary,
    fontSize: 21,
    lineHeight: 28,
  },

  resultsSubtitle: {
    ...Typography.captionStyle,
    width: "100%",
    color:
      KhedmatPalette.textMuted,
  },

  resultsCountBadge: {
    minWidth: 44,
    height: 44,
    paddingHorizontal: Spacing.sm,
    borderRadius: Radius.lg,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor:
      KhedmatPalette.border,
    backgroundColor:
      KhedmatPalette.surface,
  },

  resultsCountText: {
    fontFamily: Fonts.bold,
    fontSize: 16,
    color:
      KhedmatPalette.blue500,
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
    borderColor:
      KhedmatPalette.border,
    borderRadius: Radius.xl,
    backgroundColor:
      KhedmatPalette.surface,
    ...Shadows.small,
  },

  pendingRequestCard: {
    borderColor: "#E5C875",
    backgroundColor: "#FFFDF8",
  },

  requestCardPressable: {
    width: "100%",
    padding: Spacing.lg,
  },

  requestHeader: {
    width: "100%",
    alignItems: "flex-start",
    gap: Spacing.md,
  },

  serviceIcon: {
    width: 52,
    height: 52,
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
    color:
      KhedmatPalette.textPrimary,
    fontSize: 18,
    lineHeight: 24,
  },

  requestReference: {
    ...Typography.captionStyle,
    width: "100%",
    color:
      KhedmatPalette.textMuted,
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

  summaryGrid: {
    width: "100%",
    marginTop: Spacing.lg,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent:
      "space-between",
    rowGap: Spacing.md,
  },

  summaryItem: {
    width: "48.5%",
    minHeight: 58,
    alignItems: "center",
    gap: Spacing.sm,
  },

  summaryIcon: {
    width: 36,
    height: 36,
    flexShrink: 0,
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      KhedmatPalette.surfaceSoft,
  },

  summaryCopy: {
    flex: 1,
    gap: 1,
  },

  summaryLabel: {
    ...Typography.captionStyle,
    width: "100%",
    color:
      KhedmatPalette.textMuted,
    fontSize: 10,
  },

  summaryValue: {
    ...Typography.label,
    width: "100%",
    color:
      KhedmatPalette.textPrimary,
    fontSize: 13,
    lineHeight: 18,
  },

  expandRow: {
    width: "100%",
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderTopWidth:
      StyleSheet.hairlineWidth,
    borderTopColor:
      KhedmatPalette.border,
  },

  expandText: {
    ...Typography.captionStyle,
    color:
      KhedmatPalette.blue500,
    fontFamily: Fonts.medium,
  },

  expandedContent: {
    width: "100%",
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
  },

  divider: {
    width: "100%",
    height:
      StyleSheet.hairlineWidth,
    marginBottom: Spacing.lg,
    backgroundColor:
      KhedmatPalette.border,
  },

  smallDivider: {
    width: "100%",
    height:
      StyleSheet.hairlineWidth,
    marginVertical: Spacing.lg,
    backgroundColor:
      KhedmatPalette.border,
  },

  detailSection: {
    width: "100%",
    gap: Spacing.md,
  },

  detailHeader: {
    width: "100%",
    alignItems: "center",
    gap: Spacing.sm,
  },

  detailHeaderIcon: {
    width: 34,
    height: 34,
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      KhedmatPalette.surfaceSoft,
  },

  detailTitle: {
    ...Typography.label,
    flex: 1,
    color:
      KhedmatPalette.textPrimary,
  },

  detailText: {
    ...Typography.bodyStyle,
    width: "100%",
    color:
      KhedmatPalette.textSecondary,
    lineHeight: 23,
  },

  priceRows: {
    width: "100%",
    padding: Spacing.md,
    gap: Spacing.md,
    borderRadius: Radius.lg,
    backgroundColor:
      KhedmatPalette.surfaceSoft,
  },

  priceRow: {
    width: "100%",
    alignItems: "center",
    justifyContent:
      "space-between",
    gap: Spacing.md,
  },

  priceDivider: {
    width: "100%",
    height:
      StyleSheet.hairlineWidth,
    backgroundColor:
      KhedmatPalette.border,
  },

  priceLabel: {
    ...Typography.captionStyle,
    flex: 1,
    color:
      KhedmatPalette.textMuted,
  },

  priceValue: {
    ...Typography.label,
    color:
      KhedmatPalette.textPrimary,
  },

  priceLabelEmphasized: {
    color:
      KhedmatPalette.textPrimary,
    fontFamily: Fonts.medium,
  },

  priceValueEmphasized: {
    color: SUCCESS,
    fontFamily: Fonts.bold,
    fontSize: 16,
  },

  actions: {
    width: "100%",
    marginTop: Spacing.xl,
    gap: Spacing.sm,
  },

  actionButton: {
    flex: 1,
    minHeight: 50,
    paddingHorizontal: Spacing.md,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderRadius: Radius.lg,
  },

  actionButtonContent: {
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
  },

  actionButtonText: {
    ...Typography.label,
    fontFamily: Fonts.medium,
    fontSize: 14,
  },

  actionButtonPressed: {
    opacity: 0.8,
    transform: [
      {
        scale: 0.985,
      },
    ],
  },

  statusMessage: {
    width: "100%",
    minHeight: 56,
    marginTop: Spacing.xl,
    paddingHorizontal: Spacing.md,
    alignItems: "center",
    gap: Spacing.sm,
    borderRadius: Radius.lg,
  },

  statusMessageText: {
    ...Typography.label,
    flex: 1,
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
    borderColor:
      KhedmatPalette.border,
    backgroundColor:
      KhedmatPalette.surface,
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

  noticeCard: {
    width: "100%",
    minHeight: 92,
    marginTop: Spacing.section,
    padding: Spacing.lg,
    alignItems: "center",
    gap: Spacing.md,
    borderWidth: 1,
    borderColor:
      KhedmatPalette.blue200,
    borderRadius: Radius.xl,
    backgroundColor: "#F4FBFC",
  },

  noticeIcon: {
    width: 44,
    height: 44,
    flexShrink: 0,
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      KhedmatPalette.surface,
  },

  noticeText: {
    ...Typography.captionStyle,
    flex: 1,
    color:
      KhedmatPalette.textSecondary,
    lineHeight: 19,
  },

  pressed: {
    opacity: 0.78,
  },

  cardPressed: {
    opacity: 0.9,
  },
});