import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import {
  useCallback,
  useMemo,
  useState,
} from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { KhedmatCard } from "../components/khedmat/khedmat-card";
import { KhedmatScreen } from "../components/khedmat/khedmat-screen";
import {
  KhedmatPalette,
  Layout,
  Radius,
  Spacing,
  Typography,
} from "../constants/theme";
import { useLanguage } from "../context/languagecontext";
import { useSession } from "../context/session-context";
import {
  BookingRepository,
  type BookingRow,
  type PaymentStatus,
} from "../repositories/booking-repository";

type EarningsSummary = {
  recorded: number;
  paid: number;
  unpaid: number;
  refunded: number;
};

export default function ProviderEarningsScreen() {
  const router = useRouter();

  const {
    t,
    language,
    isRTL,
    rowDirection,
    textDirection,
  } = useLanguage();

  const {
    activeProviderId,
  } = useSession();

  const [
    bookings,
    setBookings,
  ] = useState<BookingRow[]>([]);

  const [
    isLoading,
    setIsLoading,
  ] = useState(true);

  const [
    loadFailed,
    setLoadFailed,
  ] = useState(false);

  useFocusEffect(
    useCallback(() => {
    let isMounted = true;

    const load =
      async (): Promise<void> => {
        if (!activeProviderId) {
          if (isMounted) {
            setBookings([]);
            setLoadFailed(true);
            setIsLoading(false);
          }

          return;
        }

        setIsLoading(true);
        setLoadFailed(false);

        try {
          const rows =
            await BookingRepository.listProviderBookings(
              activeProviderId,
            );

          if (!isMounted) {
            return;
          }

          setBookings(rows);
        } catch (error) {
          console.error(
            "Failed to load provider earnings:",
            error,
          );

          if (isMounted) {
            setBookings([]);
            setLoadFailed(true);
          }
        } finally {
          if (isMounted) {
            setIsLoading(false);
          }
        }
      };

    void load();

    return () => {
      isMounted = false;
    };

    }, [activeProviderId]),
  );

  const completedBookings =
    useMemo(
      () =>
        bookings
          .filter(
            (booking) =>
              booking.status ===
              "completed",
          )
          .sort(
            (left, right) =>
              bookingTimestamp(
                right,
              ) -
              bookingTimestamp(
                left,
              ),
          ),
      [bookings],
    );

  const summary =
    useMemo<EarningsSummary>(() => {
      return completedBookings.reduce(
        (result, booking) => {
          const amount =
            safeAmount(
              booking.service_price,
            );

          result.recorded +=
            amount;

          if (
            booking.payment_status ===
            "paid"
          ) {
            result.paid +=
              amount;
          } else if (
            booking.payment_status ===
            "refunded"
          ) {
            result.refunded +=
              amount;
          } else {
            result.unpaid +=
              amount;
          }

          return result;
        },
        {
          recorded: 0,
          paid: 0,
          unpaid: 0,
          refunded: 0,
        },
      );
    }, [completedBookings]);

  if (isLoading) {
    return (
      <KhedmatScreen>
        <Header
          isRTL={isRTL}
          rowDirection={
            rowDirection
          }
          textDirection={
            textDirection
          }
          title={t(
            "providerEarningsTitle",
          )}
          subtitle={t(
            "providerEarningsSubtitle",
          )}
          backLabel={t("back")}
          onBack={() =>
            router.back()
          }
        />

        <View
          style={
            styles.loadingState
          }
        >
          <ActivityIndicator
            size="large"
            color={
              KhedmatPalette.blue500
            }
          />
        </View>
      </KhedmatScreen>
    );
  }

  if (loadFailed) {
    return (
      <KhedmatScreen>
        <Header
          isRTL={isRTL}
          rowDirection={
            rowDirection
          }
          textDirection={
            textDirection
          }
          title={t(
            "providerEarningsTitle",
          )}
          subtitle={t(
            "providerEarningsSubtitle",
          )}
          backLabel={t("back")}
          onBack={() =>
            router.back()
          }
        />

        <KhedmatCard
          variant="soft"
        >
          <View
            style={
              styles.errorState
            }
          >
            <View
              style={
                styles.errorIcon
              }
            >
              <Ionicons
                name="alert-circle-outline"
                size={28}
                color={
                  KhedmatPalette.error
                }
              />
            </View>

            <Text
              style={[
                styles.errorTitle,
                {
                  writingDirection:
                    textDirection,
                },
              ]}
            >
              {t(
                "providerEarningsLoadFailedTitle",
              )}
            </Text>

            <Text
              style={[
                styles.errorBody,
                {
                  writingDirection:
                    textDirection,
                },
              ]}
            >
              {t(
                "providerEarningsLoadFailedMessage",
              )}
            </Text>
          </View>
        </KhedmatCard>
      </KhedmatScreen>
    );
  }

  return (
    <KhedmatScreen
      scrollable
      contentStyle={
        styles.screenContent
      }
    >
      <Header
        isRTL={isRTL}
        rowDirection={rowDirection}
        textDirection={
          textDirection
        }
        title={t(
          "providerEarningsTitle",
        )}
        subtitle={t(
          "providerEarningsSubtitle",
        )}
        backLabel={t("back")}
        onBack={() =>
          router.back()
        }
      />

      <KhedmatCard
        style={
          styles.primaryCard
        }
        contentStyle={
          styles.primaryContent
        }
      >
        <View
          style={[
            styles.primaryTopRow,
            {
              flexDirection:
                rowDirection,
            },
          ]}
        >
          <View
            style={
              styles.primaryIcon
            }
          >
            <Ionicons
              name="wallet-outline"
              size={24}
              color={
                KhedmatPalette.blue500
              }
            />
          </View>

          <View
            style={
              styles.primaryCopy
            }
          >
            <Text
              style={[
                styles.primaryLabel,
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
                "providerEarningsRecorded",
              )}
            </Text>

            <Text
              style={[
                styles.primaryValue,
                {
                  textAlign: isRTL
                    ? "right"
                    : "left",
                  writingDirection:
                    textDirection,
                },
              ]}
            >
              {formatCurrency(
                summary.recorded,
                language,
                t(
                  "providerEarningsCurrency",
                ),
              )}
            </Text>
          </View>
        </View>

        <Text
          style={[
            styles.primaryHint,
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
            "providerEarningsRecordedHint",
          )}
        </Text>
      </KhedmatCard>

      <View
        style={
          styles.summaryGrid
        }
      >
        <SummaryCard
          icon="checkmark-circle-outline"
          label={t(
            "providerEarningsPaid",
          )}
          hint={t(
            "providerEarningsPaidHint",
          )}
          value={formatCurrency(
            summary.paid,
            language,
            t(
              "providerEarningsCurrency",
            ),
          )}
          tone="success"
          isRTL={isRTL}
          textDirection={
            textDirection
          }
        />

        <SummaryCard
          icon="time-outline"
          label={t(
            "providerEarningsAwaitingPayment",
          )}
          hint={t(
            "providerEarningsAwaitingPaymentHint",
          )}
          value={formatCurrency(
            summary.unpaid,
            language,
            t(
              "providerEarningsCurrency",
            ),
          )}
          tone="info"
          isRTL={isRTL}
          textDirection={
            textDirection
          }
        />

        <SummaryCard
          icon="return-down-back-outline"
          label={t(
            "providerEarningsRefunded",
          )}
          hint={t(
            "providerEarningsRefundedHint",
          )}
          value={formatCurrency(
            summary.refunded,
            language,
            t(
              "providerEarningsCurrency",
            ),
          )}
          tone="warning"
          isRTL={isRTL}
          textDirection={
            textDirection
          }
        />
      </View>

      <View
        style={[
          styles.recordedNote,
          {
            flexDirection:
              rowDirection,
          },
        ]}
      >
        <Ionicons
          name="information-circle-outline"
          size={20}
          color={
            KhedmatPalette.blue500
          }
        />

        <Text
          style={[
            styles.recordedNoteText,
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
            "providerEarningsRecordedNote",
          )}
        </Text>
      </View>

      <Text
        style={[
          styles.sectionTitle,
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
          "providerEarningsRecent",
        )}
      </Text>

      {completedBookings.length ===
      0 ? (
        <KhedmatCard
          variant="soft"
        >
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
                name="receipt-outline"
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
                  writingDirection:
                    textDirection,
                },
              ]}
            >
              {t(
                "providerEarningsNoHistoryTitle",
              )}
            </Text>

            <Text
              style={[
                styles.emptyBody,
                {
                  writingDirection:
                    textDirection,
                },
              ]}
            >
              {t(
                "providerEarningsNoHistoryMessage",
              )}
            </Text>
          </View>
        </KhedmatCard>
      ) : (
        <View
          style={
            styles.historyList
          }
        >
          {completedBookings.map(
            (booking) => (
              <EarningRow
                key={booking.id}
                booking={booking}
                language={
                  language
                }
                currencyLabel={t(
                  "providerEarningsCurrency",
                )}
                fallbackTitle={t(
                  "providerEarningsBookingFallback",
                )}
                paymentLabel={paymentStatusLabel(
                  booking.payment_status,
                  t,
                )}
                isRTL={isRTL}
                rowDirection={
                  rowDirection
                }
                textDirection={
                  textDirection
                }
              />
            ),
          )}
        </View>
      )}
    </KhedmatScreen>
  );
}

type HeaderProps = {
  isRTL: boolean;
  rowDirection:
    | "row"
    | "row-reverse";
  textDirection:
    | "ltr"
    | "rtl";
  title: string;
  subtitle: string;
  backLabel: string;
  onBack: () => void;
};

function Header({
  isRTL,
  rowDirection,
  textDirection,
  title,
  subtitle,
  backLabel,
  onBack,
}: HeaderProps) {
  return (
    <View
      style={[
        styles.header,
        {
          flexDirection:
            rowDirection,
        },
      ]}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={
          backLabel
        }
        onPress={onBack}
        style={({ pressed }) => [
          styles.backButton,
          pressed &&
            styles.pressed,
        ]}
      >
        <Ionicons
          name={
            isRTL
              ? "chevron-forward"
              : "chevron-back"
          }
          size={22}
          color={
            KhedmatPalette.navy900
          }
        />
      </Pressable>

      <View
        style={
          styles.headerCopy
        }
      >
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
          {title}
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
          {subtitle}
        </Text>
      </View>
    </View>
  );
}

type SummaryCardProps = {
  icon:
    | "checkmark-circle-outline"
    | "time-outline"
    | "return-down-back-outline";
  label: string;
  hint: string;
  value: string;
  tone:
    | "success"
    | "info"
    | "warning";
  isRTL: boolean;
  textDirection:
    | "ltr"
    | "rtl";
};

function SummaryCard({
  icon,
  label,
  hint,
  value,
  tone,
  isRTL,
  textDirection,
}: SummaryCardProps) {
  return (
    <View
      style={
        styles.summaryCard
      }
    >
      <View
        style={[
          styles.summaryIcon,
          tone ===
            "success" &&
            styles.summaryIconSuccess,
          tone ===
            "info" &&
            styles.summaryIconInfo,
          tone ===
            "warning" &&
            styles.summaryIconWarning,
        ]}
      >
        <Ionicons
          name={icon}
          size={21}
          color={
            tone === "success"
              ? KhedmatPalette.success
              : tone === "warning"
                ? KhedmatPalette.warning
                : KhedmatPalette.blue500
          }
        />
      </View>

      <Text
        style={[
          styles.summaryLabel,
          {
            textAlign: isRTL
              ? "right"
              : "left",
            writingDirection:
              textDirection,
          },
        ]}
      >
        {label}
      </Text>

      <Text
        style={[
          styles.summaryValue,
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

      <Text
        style={[
          styles.summaryHint,
          {
            textAlign: isRTL
              ? "right"
              : "left",
            writingDirection:
              textDirection,
          },
        ]}
      >
        {hint}
      </Text>
    </View>
  );
}

type EarningRowProps = {
  booking: BookingRow;
  language: string;
  currencyLabel: string;
  fallbackTitle: string;
  paymentLabel: string;
  isRTL: boolean;
  rowDirection:
    | "row"
    | "row-reverse";
  textDirection:
    | "ltr"
    | "rtl";
};

function EarningRow({
  booking,
  language,
  currencyLabel,
  fallbackTitle,
  paymentLabel,
  isRTL,
  rowDirection,
  textDirection,
}: EarningRowProps) {
  return (
    <View
      style={[
        styles.historyRow,
        {
          flexDirection:
            rowDirection,
        },
      ]}
    >
      <View
        style={
          styles.historyIcon
        }
      >
        <Ionicons
          name="briefcase-outline"
          size={20}
          color={
            KhedmatPalette.blue500
          }
        />
      </View>

      <View
        style={
          styles.historyCopy
        }
      >
        <Text
          style={[
            styles.historyTitle,
            {
              textAlign: isRTL
                ? "right"
                : "left",
              writingDirection:
                textDirection,
            },
          ]}
          numberOfLines={1}
        >
          {booking.service_name_snapshot.trim() ||
            fallbackTitle}
        </Text>

        <Text
          style={[
            styles.historyMeta,
            {
              textAlign: isRTL
                ? "right"
                : "left",
              writingDirection:
                textDirection,
            },
          ]}
        >
          {formatBookingDate(
            booking,
            language,
          )}
          {"  •  "}
          {paymentLabel}
        </Text>
      </View>

      <Text
        style={[
          styles.historyAmount,
          {
            textAlign: isRTL
              ? "left"
              : "right",
            writingDirection:
              textDirection,
          },
        ]}
      >
        {formatCurrency(
          booking.service_price,
          language,
          currencyLabel,
        )}
      </Text>
    </View>
  );
}

function paymentStatusLabel(
  status: PaymentStatus,
  t: (
    key:
      | "providerEarningsPaidStatus"
      | "providerEarningsUnpaidStatus"
      | "providerEarningsRefundedStatus"
  ) => string,
): string {
  if (status === "paid") {
    return t(
      "providerEarningsPaidStatus",
    );
  }

  if (status === "refunded") {
    return t(
      "providerEarningsRefundedStatus",
    );
  }

  return t(
    "providerEarningsUnpaidStatus",
  );
}

function safeAmount(
  value: number,
): number {
  if (
    !Number.isFinite(value) ||
    value < 0
  ) {
    return 0;
  }

  return value;
}

function bookingTimestamp(
  booking: BookingRow,
): number {
  const source =
    booking.completed_at ??
    `${booking.service_date}T${booking.service_time}`;

  const timestamp =
    new Date(source).getTime();

  return Number.isFinite(
    timestamp,
  )
    ? timestamp
    : 0;
}

function formatBookingDate(
  booking: BookingRow,
  language: string,
): string {
  const source =
    booking.completed_at ??
    `${booking.service_date}T${booking.service_time}`;

  const date =
    new Date(source);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return booking.service_date;
  }

  const locale =
    language === "English"
      ? "en"
      : "fa-AF";

  return date.toLocaleDateString(
    locale,
    {
      year: "numeric",
      month: "short",
      day: "numeric",
    },
  );
}

function formatCurrency(
  amount: number,
  language: string,
  currencyLabel: string,
): string {
  const normalized =
    Math.round(
      safeAmount(amount),
    );

  const locale =
    language === "English"
      ? "en-US"
      : "fa-AF";

  const value =
    normalized.toLocaleString(
      locale,
    );

  return language === "English"
    ? `${currencyLabel} ${value}`
    : `${value} ${currencyLabel}`;
}

const styles =
  StyleSheet.create({
    screenContent: {
      paddingTop:
        Spacing.md,
      paddingBottom:
        Spacing.xxl,
    },

    header: {
      width: "100%",
      maxWidth:
        Layout.contentMaxWidth,
      alignSelf: "center",
      alignItems:
        "flex-start",
      gap: Spacing.md,
      marginBottom:
        Spacing.xl,
    },

    backButton: {
      width: 40,
      height: 40,
      flexShrink: 0,
      alignItems: "center",
      justifyContent:
        "center",
      borderRadius:
        Radius.pill,
      backgroundColor:
        KhedmatPalette.white,
    },

    headerCopy: {
      flex: 1,
      minWidth: 0,
    },

    title: {
      ...Typography.screenTitle,
      color:
        KhedmatPalette.textPrimary,
      fontSize: 22,
      lineHeight: 28,
    },

    subtitle: {
      ...Typography.captionStyle,
      marginTop: 3,
      color:
        KhedmatPalette.textSecondary,
      lineHeight: 18,
    },

    loadingState: {
      flex: 1,
      alignItems: "center",
      justifyContent:
        "center",
    },

    errorState: {
      minHeight: 240,
      alignItems: "center",
      justifyContent:
        "center",
      padding:
        Spacing.xl,
    },

    errorIcon: {
      width: 56,
      height: 56,
      alignItems: "center",
      justifyContent:
        "center",
      borderRadius:
        Radius.pill,
      backgroundColor:
        KhedmatPalette.errorSoft,
      marginBottom:
        Spacing.md,
    },

    errorTitle: {
      ...Typography.sectionTitle,
      color:
        KhedmatPalette.textPrimary,
      textAlign: "center",
    },

    errorBody: {
      ...Typography.bodyStyle,
      marginTop:
        Spacing.xs,
      color:
        KhedmatPalette.textSecondary,
      textAlign: "center",
      lineHeight: 21,
    },

    primaryCard: {
      width: "100%",
    },

    primaryContent: {
      gap: Spacing.md,
    },

    primaryTopRow: {
      width: "100%",
      alignItems: "center",
      gap: Spacing.md,
    },

    primaryIcon: {
      width: 48,
      height: 48,
      flexShrink: 0,
      alignItems: "center",
      justifyContent:
        "center",
      borderRadius:
        Radius.pill,
      backgroundColor:
        KhedmatPalette.blue050,
    },

    primaryCopy: {
      flex: 1,
      minWidth: 0,
    },

    primaryLabel: {
      ...Typography.captionStyle,
      color:
        KhedmatPalette.textSecondary,
    },

    primaryValue: {
      ...Typography.screenTitle,
      marginTop: 2,
      color:
        KhedmatPalette.navy900,
      fontSize: 27,
      lineHeight: 32,
    },

    primaryHint: {
      ...Typography.captionStyle,
      color:
        KhedmatPalette.textSecondary,
      lineHeight: 18,
    },

    summaryGrid: {
      width: "100%",
      gap: Spacing.sm,
      marginTop:
        Spacing.md,
    },

    summaryCard: {
      width: "100%",
      minHeight: 118,
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

    summaryIcon: {
      width: 38,
      height: 38,
      alignItems: "center",
      justifyContent:
        "center",
      borderRadius:
        Radius.md,
      marginBottom:
        Spacing.sm,
    },

    summaryIconSuccess: {
      backgroundColor:
        KhedmatPalette.successSoft,
    },

    summaryIconInfo: {
      backgroundColor:
        KhedmatPalette.blue050,
    },

    summaryIconWarning: {
      backgroundColor:
        KhedmatPalette.warningSoft,
    },

    summaryLabel: {
      ...Typography.label,
      color:
        KhedmatPalette.textPrimary,
      fontSize: 14,
    },

    summaryValue: {
      ...Typography.sectionTitle,
      marginTop: 3,
      color:
        KhedmatPalette.navy900,
      fontSize: 18,
      lineHeight: 23,
    },

    summaryHint: {
      ...Typography.captionStyle,
      marginTop: 3,
      color:
        KhedmatPalette.textSecondary,
      lineHeight: 17,
    },

    recordedNote: {
      width: "100%",
      alignItems:
        "flex-start",
      gap: Spacing.sm,
      marginTop:
        Spacing.md,
      padding:
        Spacing.md,
      borderRadius:
        Radius.md,
      borderWidth:
        StyleSheet.hairlineWidth,
      borderColor:
        KhedmatPalette.blue200,
      backgroundColor:
        KhedmatPalette.blue050,
    },

    recordedNoteText: {
      ...Typography.captionStyle,
      flex: 1,
      color:
        KhedmatPalette.textSecondary,
      lineHeight: 19,
    },

    sectionTitle: {
      ...Typography.sectionTitle,
      width: "100%",
      marginTop:
        Spacing.xl,
      marginBottom:
        Spacing.sm,
      color:
        KhedmatPalette.textPrimary,
      fontSize: 18,
      lineHeight: 24,
    },

    historyList: {
      width: "100%",
      gap: Spacing.sm,
    },

    historyRow: {
      width: "100%",
      minHeight: 74,
      alignItems: "center",
      gap: Spacing.md,
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

    historyIcon: {
      width: 40,
      height: 40,
      flexShrink: 0,
      alignItems: "center",
      justifyContent:
        "center",
      borderRadius:
        Radius.md,
      backgroundColor:
        KhedmatPalette.blue050,
    },

    historyCopy: {
      flex: 1,
      minWidth: 0,
    },

    historyTitle: {
      ...Typography.label,
      color:
        KhedmatPalette.textPrimary,
      fontSize: 14,
      lineHeight: 19,
    },

    historyMeta: {
      ...Typography.captionStyle,
      marginTop: 3,
      color:
        KhedmatPalette.textSecondary,
      lineHeight: 17,
    },

    historyAmount: {
      ...Typography.label,
      flexShrink: 0,
      color:
        KhedmatPalette.navy900,
      fontSize: 14,
      lineHeight: 19,
    },

    emptyState: {
      minHeight: 220,
      alignItems: "center",
      justifyContent:
        "center",
      padding:
        Spacing.xl,
    },

    emptyIcon: {
      width: 58,
      height: 58,
      alignItems: "center",
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

    emptyBody: {
      ...Typography.bodyStyle,
      marginTop:
        Spacing.xs,
      color:
        KhedmatPalette.textSecondary,
      textAlign: "center",
      lineHeight: 21,
    },

    pressed: {
      opacity: 0.72,
    },
  });
