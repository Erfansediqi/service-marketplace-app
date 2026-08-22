import { Ionicons } from "@expo/vector-icons";
import {
  useFocusEffect,
  useLocalSearchParams,
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

export default function CustomerMessagesScreen() {
  const router = useRouter();

  const params =
    useLocalSearchParams<{
      bookingId?: string;
      providerId?: string;
      providerName?: string;
    }>();

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

  useFocusEffect(
    useCallback(() => {
      void refreshBookings().catch(
        (error) => {
          console.warn(
            "Could not refresh customer message bookings:",
            error,
          );
        },
      );
    }, [refreshBookings]),
  );

  const conversationRows =
    useMemo<ConversationRow[]>(
      () =>
        [...bookings]
          .sort(
            (
              first,
              second,
            ) => {
              if (
                params.bookingId &&
                first.id ===
                  params.bookingId
              ) {
                return -1;
              }

              if (
                params.bookingId &&
                second.id ===
                  params.bookingId
              ) {
                return 1;
              }

              return `${second.date}-${second.time}`.localeCompare(
                `${first.date}-${first.time}`,
              );
            },
          )
          .map(
            (booking) => ({
              booking,
              searchableText:
                [
                  booking.providerName,
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
      [
        bookings,
        params.bookingId,
      ],
    );

  const filteredRows =
    useMemo(() => {
      const normalizedQuery =
        query
          .trim()
          .toLocaleLowerCase();

      return conversationRows.filter(
        ({
          booking,
          searchableText,
        }) => {
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
              booking.status ===
              "completed",
          ).length,
        cancelled:
          conversationRows.filter(
            ({ booking }) =>
              booking.status ===
              "cancelled",
          ).length,
      }),
      [conversationRows],
    );

  const filterLabel =
    (
      filter:
        ConversationFilter,
    ): string => {
      if (
        filter ===
        "active"
      ) {
        return t(
          "customerMessagesActive",
        );
      }

      if (
        filter ===
        "completed"
      ) {
        return t(
          "customerMessagesCompleted",
        );
      }

      if (
        filter ===
        "cancelled"
      ) {
        return t(
          "customerMessagesCancelled",
        );
      }

      return t(
        "customerMessagesAll",
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
                (error) => {
                  console.warn(
                    "Could not refresh customer message bookings:",
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
        contentContainerStyle={
          styles.scrollContent
        }
      >
        <View style={styles.header}>
          <Text
            style={[
              styles.title,
              directionStyle(
                isRTL,
                textDirection,
              ),
            ]}
          >
            {t(
              "customerMessagesTitle",
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
          <Ionicons
            name="chatbubble-ellipses-outline"
            size={18}
            color={
              KhedmatPalette.blue500
            }
          />

          <Text
            style={[
              styles.backendNoticeTitle,
              directionStyle(
                isRTL,
                textDirection,
              ),
            ]}
          >
            {t(
              "customerMessagesBackendNoticeTitle",
            )}
          </Text>
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
              "customerMessagesSearchPlaceholder",
            )}
            placeholderTextColor={
              KhedmatPalette.textMuted
            }
            returnKeyType="search"
            style={[
              styles.searchInput,
              {
                textAlign:
                  isRTL
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
                "customerMessagesClearSearch",
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

        {filteredRows.length >
        0 ? (
          <View
            style={
              styles.conversationList
            }
          >
            {filteredRows.map(
              ({ booking }) => (
                <CustomerConversationCard
                  key={
                    booking.id
                  }
                  booking={
                    booking
                  }
                  selected={
                    booking.id ===
                    params.bookingId
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
                        "/booking-record-details",
                      params: {
                        bookingId:
                          booking.id,
                      },
                    } as never)
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

function CustomerConversationCard({
  booking,
  selected,
  isRTL,
  rowDirection,
  textDirection,
  language,
  onPress,
}: {
  booking: BookingRecord;
  selected: boolean;
  isRTL: boolean;
  rowDirection:
    | "row"
    | "row-reverse";
  textDirection:
    | "ltr"
    | "rtl";
  language: string;
  onPress: () => void;
}) {
  const { t } =
    useLanguage();

  const status =
    getStatusPresentation(
      booking.status,
      t,
    );

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${booking.providerName} · ${booking.serviceName}`}
      onPress={onPress}
      style={({
        pressed,
      }) => [
        styles.conversationCard,
        selected &&
          styles.selectedConversationCard,
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
              booking.providerName,
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
              styles.providerName,
              directionStyle(
                isRTL,
                textDirection,
              ),
            ]}
          >
            {
              booking.providerName
            }
          </Text>

          <Text
            numberOfLines={1}
            style={[
              styles.serviceName,
              directionStyle(
                isRTL,
                textDirection,
              ),
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
    | "calendar-outline";
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
          directionStyle(
            isRTL,
            textDirection,
          ),
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
          directionStyle(
            isRTL,
            textDirection,
          ),
        ]}
      >
        {hasQuery
          ? t(
              "customerMessagesNoSearchResultsTitle",
            )
          : t(
              "customerMessagesNoConversationsTitle",
            )}
      </Text>

      <Text
        style={[
          styles.emptyMessage,
          directionStyle(
            isRTL,
            textDirection,
          ),
        ]}
      >
        {hasQuery
          ? t(
              "customerMessagesNoSearchResultsMessage",
            )
          : t(
              "customerMessagesNoConversationsMessage",
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
  if (
    filter ===
    "active"
  ) {
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
        "customerMessagesStatusConfirmed",
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
        "customerMessagesStatusInProgress",
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
        "customerMessagesStatusCompleted",
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
        "customerMessagesStatusCancelled",
      ),
      color:
        KhedmatPalette.error,
      background:
        KhedmatPalette.errorSoft,
    };
  }

  return {
    label: t(
      "customerMessagesStatusPending",
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

  const date =
    new Date();

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

function directionStyle(
  isRTL: boolean,
  textDirection:
    | "ltr"
    | "rtl",
) {
  return {
    textAlign: isRTL
      ? ("right" as const)
      : ("left" as const),
    writingDirection:
      textDirection,
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
      paddingBottom: 120,
    },

    header: {
      width: "100%",
    },

    title: {
      ...Typography.screenTitle,
      color:
        KhedmatPalette.navy900,
      fontSize: 28,
      lineHeight: 35,
    },

    backendNotice: {
      width: "100%",
      minHeight: 42,
      alignItems: "center",
      gap: Spacing.sm,
      marginTop:
        Spacing.md,
      paddingHorizontal:
        Spacing.md,
      paddingVertical:
        Spacing.sm,
      borderRadius:
        Radius.lg,
      borderWidth:
        StyleSheet.hairlineWidth,
      borderColor:
        KhedmatPalette.border,
      backgroundColor:
        KhedmatPalette.surfaceSoft,
    },

    backendNoticeTitle: {
      ...Typography.captionStyle,
      flex: 1,
      color:
        KhedmatPalette.textSecondary,
      fontWeight: "600",
    },

    searchBox: {
      width: "100%",
      minHeight: 50,
      alignItems: "center",
      gap: Spacing.sm,
      marginTop:
        Spacing.md,
      paddingHorizontal:
        Spacing.md,
      borderRadius:
        Radius.xl,
      borderWidth: 1,
      borderColor:
        KhedmatPalette.border,
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

    filterLabel: {
      ...Typography.captionStyle,
      color:
        KhedmatPalette.textSecondary,
      fontWeight: "600",
    },

    filterLabelSelected: {
      color:
        KhedmatPalette.white,
    },

    conversationList: {
      width: "100%",
      marginTop:
        Spacing.lg,
      gap: Spacing.md,
    },

    conversationCard: {
      width: "100%",
      padding:
        Spacing.md,
      borderRadius:
        Radius.xl,
      borderWidth: 1,
      borderColor:
        KhedmatPalette.border,
      backgroundColor:
        KhedmatPalette.white,
    },

    selectedConversationCard: {
      borderColor:
        KhedmatPalette.blue500,
      backgroundColor:
        KhedmatPalette.surfaceSoft,
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
        KhedmatPalette.navy900,
    },

    avatarText: {
      ...Typography.label,
      color:
        KhedmatPalette.white,
    },

    cardCopy: {
      flex: 1,
      minWidth: 0,
    },

    providerName: {
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
