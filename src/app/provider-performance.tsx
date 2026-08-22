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
  type BookingStatus,
} from "../repositories/booking-repository";
import {
  getProviderAccount,
  type ProviderAccountRow,
} from "../repositories/provider-account-repository";

type ActivityCounts = Record<
  BookingStatus,
  number
>;

export default function ProviderPerformanceScreen() {
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
    provider,
    setProvider,
  ] = useState<ProviderAccountRow | null>(
    null,
  );

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
            setProvider(null);
            setBookings([]);
            setLoadFailed(true);
            setIsLoading(false);
          }

          return;
        }

        setIsLoading(true);
        setLoadFailed(false);

        try {
          const [
            account,
            providerBookings,
          ] = await Promise.all([
            getProviderAccount(
              activeProviderId,
            ),
            BookingRepository.listProviderBookings(
              activeProviderId,
            ),
          ]);

          if (!isMounted) {
            return;
          }

          setProvider(account);
          setBookings(
            providerBookings,
          );

          if (!account) {
            setLoadFailed(true);
          }
        } catch (error) {
          console.error(
            "Failed to load provider performance:",
            error,
          );

          if (isMounted) {
            setProvider(null);
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

  const activityCounts =
    useMemo<ActivityCounts>(
      () =>
        bookings.reduce(
          (counts, booking) => {
            counts[
              booking.status
            ] += 1;

            return counts;
          },
          {
            pending: 0,
            confirmed: 0,
            "in-progress": 0,
            completed: 0,
            cancelled: 0,
          },
        ),
      [bookings],
    );

  const completedServiceValue =
    useMemo(
      () =>
        bookings
          .filter(
            (booking) =>
              booking.status ===
              "completed",
          )
          .reduce(
            (total, booking) =>
              total +
              safeAmount(
                booking.service_price,
              ),
            0,
          ),
      [bookings],
    );

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
            "providerPerformanceTitle",
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

  if (
    loadFailed ||
    !provider
  ) {
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
            "providerPerformanceTitle",
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
                "providerPerformanceLoadFailedTitle",
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
                "providerPerformanceLoadFailedMessage",
              )}
            </Text>
          </View>
        </KhedmatCard>
      </KhedmatScreen>
    );
  }

  const ratingValue =
    provider.review_count > 0
      ? `${formatNumber(
          provider.rating,
          language,
          1,
        )} / 5`
      : t(
          "providerPerformanceNoRating",
        );

  const reviewValue =
    provider.review_count > 0
      ? formatInteger(
          provider.review_count,
          language,
        )
      : t(
          "providerPerformanceNoReviews",
        );

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
          "providerPerformanceTitle",
        )}
        backLabel={t("back")}
        onBack={() =>
          router.back()
        }
      />

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
          "providerPerformanceOverview",
        )}
      </Text>

      <View
        style={
          styles.metricList
        }
      >
        <MetricRow
          icon="star-outline"
          label={t(
            "providerPerformanceRating",
          )}
          value={ratingValue}
          isRTL={isRTL}
          rowDirection={
            rowDirection
          }
          textDirection={
            textDirection
          }
        />

        <MetricRow
          icon="chatbubble-ellipses-outline"
          label={t(
            "providerPerformanceReviews",
          )}
          value={reviewValue}
          isRTL={isRTL}
          rowDirection={
            rowDirection
          }
          textDirection={
            textDirection
          }
        />

        <MetricRow
          icon="checkmark-done-outline"
          label={t(
            "providerPerformanceCompletedJobs",
          )}
          value={formatInteger(
            activityCounts.completed,
            language,
          )}
          isRTL={isRTL}
          rowDirection={
            rowDirection
          }
          textDirection={
            textDirection
          }
        />

        <MetricRow
          icon="stats-chart-outline"
          label={t(
            "providerPerformanceResponseRate",
          )}
          value={`${formatNumber(
            provider.response_rate,
            language,
            0,
          )}%`}
          isRTL={isRTL}
          rowDirection={
            rowDirection
          }
          textDirection={
            textDirection
          }
        />

        <MetricRow
          icon="time-outline"
          label={t(
            "providerPerformanceAverageResponse",
          )}
          value={`${formatInteger(
            provider.average_response_minutes,
            language,
          )} ${t(
            "providerPerformanceMinutes",
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

      <KhedmatCard
        style={
          styles.valueCard
        }
        contentStyle={
          styles.valueContent
        }
      >
        <View
          style={[
            styles.valueTopRow,
            {
              flexDirection:
                rowDirection,
            },
          ]}
        >
          <View
            style={
              styles.valueIcon
            }
          >
            <Ionicons
              name="cash-outline"
              size={23}
              color={
                KhedmatPalette.blue500
              }
            />
          </View>

          <View
            style={
              styles.valueCopy
            }
          >
            <Text
              style={[
                styles.valueLabel,
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
                "providerPerformanceCompletedRevenue",
              )}
            </Text>

            <Text
              style={[
                styles.valueAmount,
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
                completedServiceValue,
                language,
                t(
                  "providerPerformanceCurrency",
                ),
              )}
            </Text>
          </View>
        </View>

        <Text
          style={[
            styles.valueHint,
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
            "providerPerformanceCompletedRevenueHint",
          )}
        </Text>
      </KhedmatCard>

      <Text
        style={[
          styles.sectionTitle,
          styles.activityTitle,
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
          "providerPerformanceActivity",
        )}
      </Text>

      <View
        style={
          styles.activityGrid
        }
      >
        <ActivityCard
          label={t(
            "providerPerformancePending",
          )}
          value={
            activityCounts.pending
          }
          language={language}
          tone="neutral"
          isRTL={isRTL}
          textDirection={
            textDirection
          }
        />

        <ActivityCard
          label={t(
            "providerPerformanceConfirmed",
          )}
          value={
            activityCounts.confirmed
          }
          language={language}
          tone="info"
          isRTL={isRTL}
          textDirection={
            textDirection
          }
        />

        <ActivityCard
          label={t(
            "providerPerformanceInProgress",
          )}
          value={
            activityCounts[
              "in-progress"
            ]
          }
          language={language}
          tone="info"
          isRTL={isRTL}
          textDirection={
            textDirection
          }
        />

        <ActivityCard
          label={t(
            "providerPerformanceCompleted",
          )}
          value={
            activityCounts.completed
          }
          language={language}
          tone="success"
          isRTL={isRTL}
          textDirection={
            textDirection
          }
        />

        <ActivityCard
          label={t(
            "providerPerformanceCancelled",
          )}
          value={
            activityCounts.cancelled
          }
          language={language}
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
            "providerPerformanceRecordedNote",
          )}
        </Text>
      </View>
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
  backLabel: string;
  onBack: () => void;
};

function Header({
  isRTL,
  rowDirection,
  textDirection,
  title,
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

      </View>
    </View>
  );
}

type MetricRowProps = {
  icon:
    | "star-outline"
    | "chatbubble-ellipses-outline"
    | "checkmark-done-outline"
    | "stats-chart-outline"
    | "time-outline";
  label: string;
  value: string;
  isRTL: boolean;
  rowDirection:
    | "row"
    | "row-reverse";
  textDirection:
    | "ltr"
    | "rtl";
};

function MetricRow({
  icon,
  label,
  value,
  isRTL,
  rowDirection,
  textDirection,
}: MetricRowProps) {
  return (
    <View
      style={[
        styles.metricRow,
        {
          flexDirection:
            rowDirection,
        },
      ]}
    >
      <View
        style={
          styles.metricIcon
        }
      >
        <Ionicons
          name={icon}
          size={21}
          color={
            KhedmatPalette.blue500
          }
        />
      </View>

      <Text
        style={[
          styles.metricLabel,
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
          styles.metricValue,
          {
            textAlign: isRTL
              ? "left"
              : "right",
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

type ActivityCardProps = {
  label: string;
  value: number;
  language: string;
  tone:
    | "neutral"
    | "info"
    | "success"
    | "warning";
  isRTL: boolean;
  textDirection:
    | "ltr"
    | "rtl";
};

function ActivityCard({
  label,
  value,
  language,
  tone,
  isRTL,
  textDirection,
}: ActivityCardProps) {
  return (
    <View
      style={[
        styles.activityCard,
        tone === "info" &&
          styles.activityCardInfo,
        tone === "success" &&
          styles.activityCardSuccess,
        tone === "warning" &&
          styles.activityCardWarning,
      ]}
    >
      <Text
        style={[
          styles.activityValue,
          {
            textAlign: isRTL
              ? "right"
              : "left",
            writingDirection:
              textDirection,
          },
        ]}
      >
        {formatInteger(
          value,
          language,
        )}
      </Text>

      <Text
        style={[
          styles.activityLabel,
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
    </View>
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

function formatInteger(
  value: number,
  language: string,
): string {
  const locale =
    language === "English"
      ? "en-US"
      : "fa-AF";

  return Math.round(
    Number.isFinite(value)
      ? value
      : 0,
  ).toLocaleString(locale);
}

function formatNumber(
  value: number,
  language: string,
  maximumFractionDigits: number,
): string {
  const locale =
    language === "English"
      ? "en-US"
      : "fa-AF";

  return (
    Number.isFinite(value)
      ? value
      : 0
  ).toLocaleString(locale, {
    minimumFractionDigits:
      maximumFractionDigits,
    maximumFractionDigits,
  });
}

function formatCurrency(
  amount: number,
  language: string,
  currencyLabel: string,
): string {
  const value =
    formatInteger(
      safeAmount(amount),
      language,
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
      width: 36,
      height: 36,
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
        KhedmatPalette.navy900,
      fontSize: 24,
      lineHeight: 28,
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
        KhedmatPalette.navy900,
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

    sectionTitle: {
      ...Typography.sectionTitle,
      width: "100%",
      marginBottom:
        Spacing.sm,
      color:
        KhedmatPalette.navy900,
      fontSize: 18,
      lineHeight: 24,
    },

    metricList: {
      width: "100%",
      gap: Spacing.sm,
    },

    metricRow: {
      width: "100%",
      minHeight: 62,
      alignItems: "center",
      gap: Spacing.md,
      paddingHorizontal:
        Spacing.md,
      paddingVertical:
        Spacing.md,
      borderRadius:
        Radius.lg,
      borderWidth:
        StyleSheet.hairlineWidth,
      borderColor:
        KhedmatPalette.border,
      backgroundColor:
        KhedmatPalette.white,
    },

    metricIcon: {
      width: 40,
      height: 40,
      flexShrink: 0,
      alignItems: "center",
      justifyContent:
        "center",
      borderRadius:
        Radius.md,
      backgroundColor:
        KhedmatPalette.surfaceSoft,
    },

    metricLabel: {
      ...Typography.label,
      flex: 1,
      color:
        KhedmatPalette.textPrimary,
      fontSize: 14,
      lineHeight: 19,
    },

    metricValue: {
      ...Typography.label,
      flexShrink: 0,
      color:
        KhedmatPalette.navy900,
      fontSize: 14,
      lineHeight: 19,
    },

    valueCard: {
      width: "100%",
      marginTop:
        Spacing.lg,
    },

    valueContent: {
      gap: Spacing.md,
    },

    valueTopRow: {
      width: "100%",
      alignItems: "center",
      gap: Spacing.md,
    },

    valueIcon: {
      width: 42,
      height: 42,
      flexShrink: 0,
      alignItems: "center",
      justifyContent:
        "center",
      borderRadius:
        Radius.pill,
      backgroundColor:
        KhedmatPalette.surfaceSoft,
    },

    valueCopy: {
      flex: 1,
      minWidth: 0,
    },

    valueLabel: {
      ...Typography.captionStyle,
      color:
        KhedmatPalette.textSecondary,
    },

    valueAmount: {
      ...Typography.sectionTitle,
      marginTop: 2,
      color:
        KhedmatPalette.navy900,
      fontSize: 21,
      lineHeight: 27,
    },

    valueHint: {
      ...Typography.captionStyle,
      color:
        KhedmatPalette.textSecondary,
      lineHeight: 18,
    },

    activityTitle: {
      marginTop:
        Spacing.xl,
    },

    activityGrid: {
      width: "100%",
      flexDirection: "row",
      flexWrap: "wrap",
      gap: Spacing.sm,
    },

    activityCard: {
      flexGrow: 1,
      minWidth: "46%",
      minHeight: 82,
      justifyContent:
        "center",
      padding:
        Spacing.md,
      borderRadius:
        Radius.lg,
      borderWidth:
        StyleSheet.hairlineWidth,
      borderColor:
        KhedmatPalette.border,
      backgroundColor:
        KhedmatPalette.surfaceSoft,
    },

    activityCardInfo: {
      borderColor:
        KhedmatPalette.border,
      backgroundColor:
        KhedmatPalette.white,
    },

    activityCardSuccess: {
      borderColor:
        KhedmatPalette.success,
      backgroundColor:
        KhedmatPalette.successSoft,
    },

    activityCardWarning: {
      borderColor:
        KhedmatPalette.warning,
      backgroundColor:
        KhedmatPalette.warningSoft,
    },

    activityValue: {
      ...Typography.screenTitle,
      color:
        KhedmatPalette.navy900,
      fontSize: 24,
      lineHeight: 29,
    },

    activityLabel: {
      ...Typography.captionStyle,
      marginTop: 4,
      color:
        KhedmatPalette.textSecondary,
      lineHeight: 18,
    },

    recordedNote: {
      width: "100%",
      alignItems:
        "flex-start",
      gap: Spacing.sm,
      marginTop:
        Spacing.lg,
      padding:
        Spacing.md,
      borderRadius:
        Radius.md,
      borderWidth:
        StyleSheet.hairlineWidth,
      borderColor:
        KhedmatPalette.border,
      backgroundColor:
        KhedmatPalette.surfaceSoft,
    },

    recordedNoteText: {
      ...Typography.captionStyle,
      flex: 1,
      color:
        KhedmatPalette.textSecondary,
      lineHeight: 19,
    },

    pressed: {
      opacity: 0.72,
    },
  });
