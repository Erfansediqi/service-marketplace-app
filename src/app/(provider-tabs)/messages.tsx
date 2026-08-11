import { Ionicons } from "@expo/vector-icons";
import {
  useFocusEffect,
  useRouter,
} from "expo-router";
import {
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
  TextInput,
  View,
} from "react-native";

import {
  KhedmatPalette,
  Layout,
  Radius,
  Spacing,
  Typography,
} from "../../constants/theme";
import {
  type BookingRecord,
  type BookingStatus,
  useBooking,
} from "../../context/booking-context";
import { useLanguage } from "../../context/languagecontext";
import { useActiveProvider } from "../../hooks/use-active-provider";

type ConversationFilter =
  | "all"
  | "active"
  | "completed"
  | "cancelled";

type ConversationRow = {
  booking: BookingRecord;
  searchableText: string;
};

const FILTERS: ConversationFilter[] = [
  "all",
  "active",
  "completed",
  "cancelled",
];

export default function ProviderMessagesScreen() {
  const router = useRouter();

  const {
    t,
    language,
    isRTL,
    rowDirection,
    textDirection,
  } = useLanguage();

  const {
    bookings,
    isRefreshing,
    refreshBookings,
  } = useBooking();

  const {
    provider,
    isLoading,
    error,
  } = useActiveProvider();

  const [
    selectedFilter,
    setSelectedFilter,
  ] = useState<ConversationFilter>(
    "all",
  );

  const [
    query,
    setQuery,
  ] = useState("");

  const providerId =
    provider?.id ?? "";

  useFocusEffect(
    useCallback(() => {
      if (!providerId) {
        return;
      }

      void refreshBookings().catch(
        (refreshError) => {
          console.warn(
            "Could not refresh provider message bookings:",
            refreshError,
          );
        },
      );
    }, [
      providerId,
      refreshBookings,
    ]),
  );

  const providerBookings =
    useMemo(
      () =>
        bookings
          .filter(
            (booking) =>
              booking.providerId ===
              providerId,
          )
          .sort(
            (
              first,
              second,
            ) =>
              `${second.date}-${second.time}`.localeCompare(
                `${first.date}-${first.time}`,
              ),
          ),
      [
        bookings,
        providerId,
      ],
    );

  const conversationRows =
    useMemo<ConversationRow[]>(
      () =>
        providerBookings.map(
          (booking) => ({
            booking,
            searchableText:
              [
                booking.customerName ??
                  "",
                booking.serviceName,
                booking.address.label,
                booking.address
                  .fullAddress,
                booking.id,
              ]
                .join(" ")
                .toLocaleLowerCase(),
          }),
        ),
      [providerBookings],
    );

  const filteredRows =
    useMemo(() => {
      const normalizedQuery =
        query
          .trim()
          .toLocaleLowerCase();

      return conversationRows.filter(
        ({ booking, searchableText }) => {
          if (
            !matchesFilter(
              booking.status,
              selectedFilter,
            )
          ) {
            return false;
          }

          if (
            normalizedQuery &&
            !searchableText.includes(
              normalizedQuery,
            )
          ) {
            return false;
          }

          return true;
        },
      );
    }, [
      conversationRows,
      query,
      selectedFilter,
    ]);

  const counts =
    useMemo(
      () => ({
        all:
          conversationRows.length,
        active:
          conversationRows.filter(
            ({ booking }) =>
              matchesFilter(
                booking.status,
                "active",
              ),
          ).length,
        completed:
          conversationRows.filter(
            ({ booking }) =>
              matchesFilter(
                booking.status,
                "completed",
              ),
          ).length,
        cancelled:
          conversationRows.filter(
            ({ booking }) =>
              matchesFilter(
                booking.status,
                "cancelled",
              ),
          ).length,
      }),
      [conversationRows],
    );

  if (isLoading) {
    return (
      <SafeAreaView
        style={
          styles.safeArea
        }
      >
        <View
          style={
            styles.stateContainer
          }
        >
          <Text
            style={[
              styles.stateTitle,
              {
                textAlign: isRTL
                  ? "right"
                  : "left",
                writingDirection:
                  textDirection,
              },
            ]}
          >
            {t(
              "providerAccountLoading",
            )}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (
    !provider ||
    error
  ) {
    return (
      <SafeAreaView
        style={
          styles.safeArea
        }
      >
        <View
          style={
            styles.stateContainer
          }
        >
          <Ionicons
            name="alert-circle-outline"
            size={34}
            color={
              KhedmatPalette.error
            }
          />

          <Text
            style={[
              styles.stateTitle,
              {
                textAlign: isRTL
                  ? "right"
                  : "left",
                writingDirection:
                  textDirection,
              },
            ]}
          >
            {t(
              "providerAccountLoadError",
            )}
          </Text>

          <Text
            style={[
              styles.stateBody,
              {
                textAlign: isRTL
                  ? "right"
                  : "left",
                writingDirection:
                  textDirection,
              },
            ]}
          >
            {t(
              "providerAccountLoadErrorBody",
            )}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const filterLabel =
    (
      filter:
        ConversationFilter,
    ): string => {
      if (filter === "active") {
        return t(
          "providerMessagesActive",
        );
      }

      if (
        filter ===
        "completed"
      ) {
        return t(
          "providerMessagesCompleted",
        );
      }

      if (
        filter ===
        "cancelled"
      ) {
        return t(
          "providerMessagesCancelled",
        );
      }

      return t(
        "providerMessagesAll",
      );
    };

  return (
    <SafeAreaView
      style={
        styles.safeArea
      }
    >
      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        refreshControl={
          <RefreshControl
            refreshing={
              isRefreshing
            }
            onRefresh={() => {
              void refreshBookings().catch(
                (
                  refreshError,
                ) => {
                  console.warn(
                    "Could not refresh provider message bookings:",
                    refreshError,
                  );
                },
              );
            }}
            tintColor={
              KhedmatPalette.blue500
            }
          />
        }
        contentContainerStyle={
          styles.scrollContent
        }
      >
        <View
          style={
            styles.header
          }
        >
          <Text
            style={[
              styles.eyebrow,
              {
                textAlign: isRTL
                  ? "right"
                  : "left",
                writingDirection:
                  textDirection,
              },
            ]}
          >
            {t(
              "providerMessagesEyebrow",
            )}
          </Text>

          <Text
            style={[
              styles.title,
              {
                textAlign: isRTL
                  ? "right"
                  : "left",
                writingDirection:
                  textDirection,
              },
            ]}
          >
            {t(
              "providerMessagesTitle",
            )}
          </Text>

          <Text
            style={[
              styles.subtitle,
              {
                textAlign: isRTL
                  ? "right"
                  : "left",
                writingDirection:
                  textDirection,
              },
            ]}
          >
            {t(
              "providerMessagesSubtitle",
            )}
          </Text>
        </View>

        <View
          style={[
            styles.backendNotice,
            {
              flexDirection:
                rowDirection,
            },
          ]}
        >
          <View
            style={
              styles.backendNoticeIcon
            }
          >
            <Ionicons
              name="chatbubble-ellipses-outline"
              size={22}
              color={
                KhedmatPalette.blue500
              }
            />
          </View>

          <View
            style={
              styles.backendNoticeCopy
            }
          >
            <Text
              style={[
                styles.backendNoticeTitle,
                {
                  textAlign: isRTL
                    ? "right"
                    : "left",
                  writingDirection:
                    textDirection,
                },
              ]}
            >
              {t(
                "providerMessagesBackendNoticeTitle",
              )}
            </Text>

            <Text
              style={[
                styles.backendNoticeMessage,
                {
                  textAlign: isRTL
                    ? "right"
                    : "left",
                  writingDirection:
                    textDirection,
                },
              ]}
            >
              {t(
                "providerMessagesBackendNoticeMessage",
              )}
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.searchBox,
            {
              flexDirection:
                rowDirection,
            },
          ]}
        >
          <Ionicons
            name="search-outline"
            size={20}
            color={
              KhedmatPalette.textMuted
            }
          />

          <TextInput
            value={query}
            onChangeText={
              setQuery
            }
            placeholder={t(
              "providerMessagesSearchPlaceholder",
            )}
            placeholderTextColor={
              KhedmatPalette.textMuted
            }
            returnKeyType="search"
            style={[
              styles.searchInput,
              {
                textAlign: isRTL
                  ? "right"
                  : "left",
                writingDirection:
                  textDirection,
              },
            ]}
          />

          {query ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t(
                "providerMessagesClearSearch",
              )}
              hitSlop={8}
              onPress={() =>
                setQuery("")
              }
            >
              <Ionicons
                name="close-circle"
                size={19}
                color={
                  KhedmatPalette.textMuted
                }
              />
            </Pressable>
          ) : null}
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={
            false
          }
          contentContainerStyle={
            styles.filters
          }
        >
          {FILTERS.map(
            (filter) => {
              const selected =
                filter ===
                selectedFilter;

              return (
                <Pressable
                  key={filter}
                  accessibilityRole="button"
                  accessibilityState={{
                    selected,
                  }}
                  onPress={() =>
                    setSelectedFilter(
                      filter,
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
                      styles.filterLabel,
                      selected &&
                        styles.filterLabelSelected,
                      {
                        writingDirection:
                          textDirection,
                      },
                    ]}
                  >
                    {filterLabel(
                      filter,
                    )}{" "}
                    {formatDigits(
                      counts[
                        filter
                      ].toString(),
                      language !==
                        "English",
                    )}
                  </Text>
                </Pressable>
              );
            },
          )}
        </ScrollView>

        <View
          style={[
            styles.resultsHeader,
            {
              flexDirection:
                rowDirection,
            },
          ]}
        >
          <Text
            style={[
              styles.resultsTitle,
              {
                textAlign: isRTL
                  ? "right"
                  : "left",
                writingDirection:
                  textDirection,
              },
            ]}
          >
            {formatDigits(
              filteredRows.length.toString(),
              language !==
                "English",
            )}{" "}
            {t(
              "providerMessagesConversationCount",
            )}
          </Text>
        </View>

        {filteredRows.length >
        0 ? (
          <View
            style={
              styles.conversationList
            }
          >
            {filteredRows.map(
              ({ booking }) => (
                <BookingConversationCard
                  key={
                    booking.id
                  }
                  booking={
                    booking
                  }
                  isRTL={
                    isRTL
                  }
                  rowDirection={
                    rowDirection
                  }
                  textDirection={
                    textDirection
                  }
                  language={
                    language
                  }
                  onPress={() =>
                    router.push({
                      pathname:
                        "/provider-request-details",
                      params: {
                        bookingId:
                          booking.id,
                      },
                    })
                  }
                />
              ),
            )}
          </View>
        ) : (
          <EmptyState
            hasQuery={
              query.trim().length >
              0
            }
            isRTL={isRTL}
            textDirection={
              textDirection
            }
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

type BookingConversationCardProps = {
  booking: BookingRecord;
  isRTL: boolean;
  rowDirection:
    | "row"
    | "row-reverse";
  textDirection:
    | "ltr"
    | "rtl";
  language: string;
  onPress: () => void;
};

function BookingConversationCard({
  booking,
  isRTL,
  rowDirection,
  textDirection,
  language,
  onPress,
}: BookingConversationCardProps) {
  const { t } =
    useLanguage();

  const customerName =
    booking.customerName?.trim() ||
    t(
      "providerMessagesCustomer",
    );

  const status =
    getStatusPresentation(
      booking.status,
      t,
    );

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${customerName} · ${booking.serviceName}`}
      onPress={onPress}
      style={({
        pressed,
      }) => [
        styles.conversationCard,
        pressed &&
          styles.cardPressed,
      ]}
    >
      <View
        style={[
          styles.cardHeader,
          {
            flexDirection:
              rowDirection,
          },
        ]}
      >
        <View
          style={
            styles.avatar
          }
        >
          <Text
            style={
              styles.avatarText
            }
          >
            {getInitials(
              customerName,
            )}
          </Text>
        </View>

        <View
          style={
            styles.cardCopy
          }
        >
          <Text
            numberOfLines={1}
            style={[
              styles.customerName,
              {
                textAlign: isRTL
                  ? "right"
                  : "left",
                writingDirection:
                  textDirection,
              },
            ]}
          >
            {customerName}
          </Text>

          <Text
            numberOfLines={1}
            style={[
              styles.serviceName,
              {
                textAlign: isRTL
                  ? "right"
                  : "left",
                writingDirection:
                  textDirection,
              },
            ]}
          >
            {
              booking.serviceName
            }
          </Text>
        </View>

        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor:
                status.background,
            },
          ]}
        >
          <Text
            style={[
              styles.statusText,
              {
                color:
                  status.color,
                writingDirection:
                  textDirection,
              },
            ]}
          >
            {status.label}
          </Text>
        </View>
      </View>

      <View
        style={
          styles.metaGroup
        }
      >
        <MetaRow
          icon="calendar-outline"
          value={`${formatDate(
            booking.date,
            language,
          )} · ${formatTime(
            booking.time,
            language,
          )}`}
          isRTL={isRTL}
          rowDirection={
            rowDirection
          }
          textDirection={
            textDirection
          }
        />

        <MetaRow
          icon="location-outline"
          value={
            booking.address
              .label
          }
          isRTL={isRTL}
          rowDirection={
            rowDirection
          }
          textDirection={
            textDirection
          }
        />
      </View>

      <View
        style={[
          styles.openRow,
          {
            flexDirection:
              rowDirection,
          },
        ]}
      >
        <Text
          style={[
            styles.openText,
            {
              writingDirection:
                textDirection,
            },
          ]}
        >
          {t(
            "providerMessagesOpenRequest",
          )}
        </Text>

        <Ionicons
          name={
            isRTL
              ? "chevron-back"
              : "chevron-forward"
          }
          size={18}
          color={
            KhedmatPalette.blue500
          }
        />
      </View>
    </Pressable>
  );
}

function MetaRow({
  icon,
  value,
  isRTL,
  rowDirection,
  textDirection,
}: {
  icon:
    | "calendar-outline"
    | "location-outline";
  value: string;
  isRTL: boolean;
  rowDirection:
    | "row"
    | "row-reverse";
  textDirection:
    | "ltr"
    | "rtl";
}) {
  return (
    <View
      style={[
        styles.metaRow,
        {
          flexDirection:
            rowDirection,
        },
      ]}
    >
      <Ionicons
        name={icon}
        size={16}
        color={
          KhedmatPalette.textMuted
        }
      />

      <Text
        numberOfLines={1}
        style={[
          styles.metaText,
          {
            textAlign: isRTL
              ? "right"
              : "left",
            writingDirection:
              textDirection,
          },
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

function EmptyState({
  hasQuery,
  isRTL,
  textDirection,
}: {
  hasQuery: boolean;
  isRTL: boolean;
  textDirection:
    | "ltr"
    | "rtl";
}) {
  const { t } =
    useLanguage();

  return (
    <View
      style={
        styles.emptyState
      }
    >
      <View
        style={
          styles.emptyIcon
        }
      >
        <Ionicons
          name={
            hasQuery
              ? "search-outline"
              : "chatbubbles-outline"
          }
          size={30}
          color={
            KhedmatPalette.blue500
          }
        />
      </View>

      <Text
        style={[
          styles.emptyTitle,
          {
            textAlign: isRTL
              ? "right"
              : "left",
            writingDirection:
              textDirection,
          },
        ]}
      >
        {hasQuery
          ? t(
              "providerMessagesNoSearchResultsTitle",
            )
          : t(
              "providerMessagesNoConversationsTitle",
            )}
      </Text>

      <Text
        style={[
          styles.emptyMessage,
          {
            textAlign: isRTL
              ? "right"
              : "left",
            writingDirection:
              textDirection,
          },
        ]}
      >
        {hasQuery
          ? t(
              "providerMessagesNoSearchResultsMessage",
            )
          : t(
              "providerMessagesNoConversationsMessage",
            )}
      </Text>
    </View>
  );
}

function matchesFilter(
  status: BookingStatus,
  filter:
    ConversationFilter,
): boolean {
  if (filter === "active") {
    return (
      status ===
        "pending" ||
      status ===
        "confirmed" ||
      status ===
        "in-progress"
    );
  }

  if (
    filter ===
    "completed"
  ) {
    return (
      status ===
      "completed"
    );
  }

  if (
    filter ===
    "cancelled"
  ) {
    return (
      status ===
      "cancelled"
    );
  }

  return true;
}

function getStatusPresentation(
  status: BookingStatus,
  t: ReturnType<
    typeof useLanguage
  >["t"],
) {
  if (
    status ===
    "confirmed"
  ) {
    return {
      label: t(
        "providerMessagesStatusConfirmed",
      ),
      color:
        KhedmatPalette.blue500,
      background:
        KhedmatPalette.blue050,
    };
  }

  if (
    status ===
    "in-progress"
  ) {
    return {
      label: t(
        "providerMessagesStatusInProgress",
      ),
      color:
        KhedmatPalette.navy700,
      background:
        KhedmatPalette.blue050,
    };
  }

  if (
    status ===
    "completed"
  ) {
    return {
      label: t(
        "providerMessagesStatusCompleted",
      ),
      color:
        KhedmatPalette.success,
      background:
        KhedmatPalette.successSoft,
    };
  }

  if (
    status ===
    "cancelled"
  ) {
    return {
      label: t(
        "providerMessagesStatusCancelled",
      ),
      color:
        KhedmatPalette.error,
      background:
        KhedmatPalette.errorSoft,
    };
  }

  return {
    label: t(
      "providerMessagesStatusPending",
    ),
    color:
      KhedmatPalette.warning,
    background:
      KhedmatPalette.warningSoft,
  };
}

function getInitials(
  value: string,
): string {
  const parts =
    value
      .trim()
      .split(/\s+/)
      .filter(Boolean);

  if (
    parts.length === 0
  ) {
    return "?";
  }

  if (
    parts.length === 1
  ) {
    return parts[0]
      .slice(0, 2)
      .toUpperCase();
  }

  return `${parts[0][0] ?? ""}${parts[parts.length - 1][0] ?? ""}`.toUpperCase();
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

function formatDate(
  value: string,
  language: string,
): string {
  const date =
    new Date(
      `${value}T12:00:00`,
    );

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return value;
  }

  return date.toLocaleDateString(
    language === "English"
      ? "en-US"
      : "fa-AF",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    },
  );
}

function formatTime(
  value: string,
  language: string,
): string {
  const [hour, minute] =
    value.split(":");

  const date = new Date();
  date.setHours(
    Number(hour),
    Number(minute),
    0,
    0,
  );

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return value;
  }

  return date.toLocaleTimeString(
    language === "English"
      ? "en-US"
      : "fa-AF",
    {
      hour: "numeric",
      minute: "2-digit",
    },
  );
}

const styles =
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor:
        KhedmatPalette.white,
    },

    stateContainer: {
      flex: 1,
      width: "100%",
      maxWidth:
        Layout.contentMaxWidth,
      alignSelf: "center",
      justifyContent:
        "center",
      gap: Spacing.sm,
      paddingHorizontal:
        Layout.screenPadding,
    },

    stateTitle: {
      ...Typography.sectionTitle,
      color:
        KhedmatPalette.textPrimary,
      fontSize: 18,
    },

    stateBody: {
      ...Typography.bodyStyle,
      color:
        KhedmatPalette.textSecondary,
      lineHeight: 21,
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
      paddingBottom: 120,
    },

    header: {
      width: "100%",
    },

    eyebrow: {
      ...Typography.captionStyle,
      color:
        KhedmatPalette.blue500,
      fontWeight: "600",
    },

    title: {
      ...Typography.screenTitle,
      marginTop:
        Spacing.xs,
      color:
        KhedmatPalette.textPrimary,
    },

    subtitle: {
      ...Typography.bodyStyle,
      marginTop:
        Spacing.xs,
      color:
        KhedmatPalette.textSecondary,
      lineHeight: 21,
    },

    backendNotice: {
      width: "100%",
      alignItems:
        "flex-start",
      gap: Spacing.md,
      marginTop:
        Spacing.lg,
      padding:
        Spacing.md,
      borderRadius:
        Radius.lg,
      borderWidth:
        StyleSheet.hairlineWidth,
      borderColor:
        KhedmatPalette.blue200,
      backgroundColor:
        KhedmatPalette.blue050,
    },

    backendNoticeIcon: {
      width: 42,
      height: 42,
      flexShrink: 0,
      alignItems:
        "center",
      justifyContent:
        "center",
      borderRadius:
        Radius.md,
      backgroundColor:
        KhedmatPalette.white,
    },

    backendNoticeCopy: {
      flex: 1,
      minWidth: 0,
    },

    backendNoticeTitle: {
      ...Typography.label,
      color:
        KhedmatPalette.textPrimary,
    },

    backendNoticeMessage: {
      ...Typography.captionStyle,
      marginTop: 3,
      color:
        KhedmatPalette.textSecondary,
      lineHeight: 18,
    },

    searchBox: {
      width: "100%",
      minHeight: 50,
      alignItems: "center",
      gap: Spacing.sm,
      marginTop:
        Spacing.lg,
      paddingHorizontal:
        Spacing.md,
      borderRadius:
        Radius.lg,
      borderWidth:
        StyleSheet.hairlineWidth,
      borderColor:
        KhedmatPalette.blue200,
      backgroundColor:
        KhedmatPalette.white,
    },

    searchInput: {
      flex: 1,
      minHeight: 48,
      ...Typography.bodyStyle,
      color:
        KhedmatPalette.textPrimary,
    },

    filters: {
      gap: Spacing.sm,
      paddingTop:
        Spacing.md,
      paddingBottom:
        Spacing.xs,
    },

    filterChip: {
      minHeight: 38,
      justifyContent:
        "center",
      paddingHorizontal:
        Spacing.md,
      borderRadius:
        Radius.pill,
      borderWidth:
        StyleSheet.hairlineWidth,
      borderColor:
        KhedmatPalette.blue200,
      backgroundColor:
        KhedmatPalette.white,
    },

    filterChipSelected: {
      borderColor:
        KhedmatPalette.blue500,
      backgroundColor:
        KhedmatPalette.blue050,
    },

    filterLabel: {
      ...Typography.captionStyle,
      color:
        KhedmatPalette.textSecondary,
      fontWeight: "600",
    },

    filterLabelSelected: {
      color:
        KhedmatPalette.blue500,
    },

    resultsHeader: {
      width: "100%",
      alignItems: "center",
      justifyContent:
        "space-between",
      marginTop:
        Spacing.lg,
      marginBottom:
        Spacing.sm,
    },

    resultsTitle: {
      ...Typography.sectionTitle,
      color:
        KhedmatPalette.textPrimary,
      fontSize: 16,
    },

    conversationList: {
      width: "100%",
      gap: Spacing.md,
    },

    conversationCard: {
      width: "100%",
      padding:
        Spacing.md,
      borderRadius:
        Radius.lg,
      borderWidth:
        StyleSheet.hairlineWidth,
      borderColor:
        KhedmatPalette.blue200,
      backgroundColor:
        KhedmatPalette.white,
    },

    cardHeader: {
      width: "100%",
      alignItems:
        "center",
      gap: Spacing.md,
    },

    avatar: {
      width: 44,
      height: 44,
      flexShrink: 0,
      alignItems:
        "center",
      justifyContent:
        "center",
      borderRadius:
        Radius.pill,
      backgroundColor:
        KhedmatPalette.blue050,
    },

    avatarText: {
      ...Typography.label,
      color:
        KhedmatPalette.blue500,
    },

    cardCopy: {
      flex: 1,
      minWidth: 0,
    },

    customerName: {
      ...Typography.label,
      color:
        KhedmatPalette.textPrimary,
      fontSize: 15,
    },

    serviceName: {
      ...Typography.captionStyle,
      marginTop: 2,
      color:
        KhedmatPalette.textSecondary,
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
      fontWeight: "600",
    },

    metaGroup: {
      width: "100%",
      gap: 6,
      marginTop:
        Spacing.md,
    },

    metaRow: {
      width: "100%",
      alignItems:
        "center",
      gap: Spacing.sm,
    },

    metaText: {
      ...Typography.captionStyle,
      flex: 1,
      color:
        KhedmatPalette.textSecondary,
    },

    openRow: {
      width: "100%",
      alignItems: "center",
      justifyContent:
        "space-between",
      gap: Spacing.sm,
      marginTop:
        Spacing.md,
      paddingTop:
        Spacing.sm,
      borderTopWidth:
        StyleSheet.hairlineWidth,
      borderTopColor:
        KhedmatPalette.blue200,
    },

    openText: {
      ...Typography.label,
      color:
        KhedmatPalette.blue500,
      fontSize: 13,
    },

    emptyState: {
      width: "100%",
      minHeight: 260,
      alignItems:
        "center",
      justifyContent:
        "center",
      padding:
        Spacing.xl,
      borderRadius:
        Radius.lg,
      borderWidth:
        StyleSheet.hairlineWidth,
      borderColor:
        KhedmatPalette.blue200,
      backgroundColor:
        KhedmatPalette.white,
    },

    emptyIcon: {
      width: 62,
      height: 62,
      alignItems:
        "center",
      justifyContent:
        "center",
      borderRadius:
        Radius.pill,
      backgroundColor:
        KhedmatPalette.blue050,
      marginBottom:
        Spacing.md,
    },

    emptyTitle: {
      ...Typography.sectionTitle,
      color:
        KhedmatPalette.textPrimary,
      textAlign: "center",
    },

    emptyMessage: {
      ...Typography.bodyStyle,
      maxWidth: 340,
      marginTop:
        Spacing.xs,
      color:
        KhedmatPalette.textSecondary,
      textAlign: "center",
      lineHeight: 21,
    },

    pressed: {
      opacity: 0.75,
    },

    cardPressed: {
      opacity: 0.86,
    },
  });
