import { Ionicons } from "@expo/vector-icons";
import {
  useLocalSearchParams,
  useRouter,
} from "expo-router";
import {
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
} from "react-native";

import { KhedmatButton } from "../components/khedmat/khedmat-button";
import {
  KhedmatPalette,
  Layout,
  Radius,
  Spacing,
  Typography,
} from "../constants/theme";
import {
  type BookingRecord,
  useBooking,
} from "../context/booking-context";
import { useLanguage } from "../context/languagecontext";

export default function ProviderRequestDetailsScreen() {
  const router = useRouter();

  const params =
    useLocalSearchParams<{
      bookingId?: string;
    }>();

  const {
    t,
    language,
    isRTL,
    rowDirection,
    textDirection,
  } = useLanguage();

  const {
    getBookingById,
    updateBookingStatus,
  } = useBooking();

  const [
    isUpdating,
    setIsUpdating,
  ] = useState(false);

  const booking =
    useMemo(
      () =>
        params.bookingId
          ? getBookingById(
              params.bookingId,
            )
          : undefined,
      [
        getBookingById,
        params.bookingId,
      ],
    );

  if (!booking) {
    return (
      <SafeAreaView
        style={
          styles.safeArea
        }
      >
        <Header
          isRTL={isRTL}
          rowDirection={
            rowDirection
          }
          textDirection={
            textDirection
          }
          title={t(
            "providerRequestsTitle",
          )}
          subtitle={t(
            "providerRequestsLoadFailedMessage",
          )}
          onBack={() =>
            router.back()
          }
        />
      </SafeAreaView>
    );
  }

  const handleStatusUpdate =
    async (
      nextStatus:
        | "confirmed"
        | "cancelled"
        | "in-progress"
        | "completed",
    ): Promise<void> => {
      if (isUpdating) {
        return;
      }

      setIsUpdating(true);

      try {
        await updateBookingStatus(
          booking.id,
          nextStatus,
        );

      } catch (error) {
        console.error(
          "Failed to update provider request:",
          error,
        );

        Alert.alert(
          t(
            "providerRequestsActionFailedTitle",
          ),
          t(
            "providerRequestsActionFailedMessage",
          ),
        );
      } finally {
        setIsUpdating(false);
      }
    };

  const confirmAccept =
    (): void => {
      Alert.alert(
        t(
          "providerRequestsAcceptDialogTitle",
        ),
        t(
          "providerRequestsAcceptDialogMessage",
        ),
        [
          {
            text: t(
              "cancelAction",
            ),
            style: "cancel",
          },
          {
            text: t(
              "providerRequestsAccept",
            ),
            onPress: () => {
              void handleStatusUpdate(
                "confirmed",
              );
            },
          },
        ],
      );
    };

  const confirmReject =
    (): void => {
      Alert.alert(
        t(
          "providerRequestsRejectDialogTitle",
        ),
        t(
          "providerRequestsRejectDialogMessage",
        ),
        [
          {
            text: t(
              "cancelAction",
            ),
            style: "cancel",
          },
          {
            text: t(
              "providerRequestsReject",
            ),
            style:
              "destructive",
            onPress: () => {
              void handleStatusUpdate(
                "cancelled",
              );
            },
          },
        ],
      );
    };

  const confirmStart =
    (): void => {
      Alert.alert(
        t(
          "providerRequestsStartDialogTitle",
        ),
        t(
          "providerRequestsStartDialogMessage",
        ),
        [
          {
            text: t(
              "cancelAction",
            ),
            style: "cancel",
          },
          {
            text: t(
              "providerRequestsStartWork",
            ),
            onPress: () => {
              void handleStatusUpdate(
                "in-progress",
              );
            },
          },
        ],
      );
    };

  const confirmComplete =
    (): void => {
      Alert.alert(
        t(
          "providerRequestsCompleteDialogTitle",
        ),
        t(
          "providerRequestsCompleteDialogMessage",
        ),
        [
          {
            text: t(
              "cancelAction",
            ),
            style: "cancel",
          },
          {
            text: t(
              "providerRequestsCompleteWork",
            ),
            onPress: () => {
              void handleStatusUpdate(
                "completed",
              );
            },
          },
        ],
      );
    };

  return (
    <SafeAreaView
      style={
        styles.safeArea
      }
    >
      <Header
        isRTL={isRTL}
        rowDirection={
          rowDirection
        }
        textDirection={
          textDirection
        }
        title={
          booking.serviceName
        }
        subtitle={`${t(
          "providerRequestsRequestNumber",
        )}: ${shortBookingId(
          booking.id,
        )}`}
        onBack={() =>
          router.back()
        }
      />

      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={
          styles.scrollContent
        }
      >
        <View
          style={[
            styles.statusCard,
            {
              flexDirection:
                rowDirection,
            },
          ]}
        >
          <View
            style={
              styles.statusIcon
            }
          >
            <Ionicons
              name={statusIcon(
                booking.status,
              )}
              size={23}
              color={
                statusColor(
                  booking.status,
                )
              }
            />
          </View>

          <View
            style={
              styles.statusCopy
            }
          >
            <Text
              style={[
                styles.statusLabel,
                {
                  textAlign: isRTL
                    ? "right"
                    : "left",
                  writingDirection:
                    textDirection,
                },
              ]}
            >
              {statusLabel(
                booking.status,
                t,
              )}
            </Text>

            {booking.status ===
            "pending" ? (
              <Text
                style={[
                  styles.statusHint,
                  {
                    textAlign:
                      isRTL
                        ? "right"
                        : "left",
                    writingDirection:
                      textDirection,
                  },
                ]}
              >
                {t(
                  "providerRequestsReviewNotice",
                )}
              </Text>
            ) : null}
          </View>
        </View>

        <SectionTitle
          text={t(
            "providerRequestsCustomer",
          )}
          isRTL={isRTL}
          textDirection={
            textDirection
          }
        />

        <InfoCard>
          <InfoRow
            icon="person-outline"
            label={t(
              "providerRequestsCustomer",
            )}
            value={
              booking.customerName?.trim() ||
              t(
                "providerRequestsCustomer",
              )
            }
            isRTL={isRTL}
            rowDirection={
              rowDirection
            }
            textDirection={
              textDirection
            }
          />

          {booking.customerPhone ? (
  <>
    <Divider />

    <InfoRow
      icon="call-outline"
      label={t(
        "providerRequestsCustomerPhone",
      )}
      value={
        booking.customerPhone
      }
      isRTL={isRTL}
      rowDirection={
        rowDirection
      }
      textDirection={
        textDirection
      }
    />
  </>
) : null}
        </InfoCard>

        <SectionTitle
          text={t(
            "providerRequestsDate",
          )}
          isRTL={isRTL}
          textDirection={
            textDirection
          }
        />

        <InfoCard>
          <InfoRow
            icon="calendar-outline"
            label={t(
              "providerRequestsDate",
            )}
            value={formatDate(
              booking.date,
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

          <Divider />

          <InfoRow
            icon="time-outline"
            label={t(
              "providerRequestsTime",
            )}
            value={formatTime(
              booking.time,
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

          <Divider />

          <InfoRow
            icon="location-outline"
            label={t(
              "providerRequestsServiceAddress",
            )}
            value={
              booking.address
                .fullAddress
            }
            isRTL={isRTL}
            rowDirection={
              rowDirection
            }
            textDirection={
              textDirection
            }
          />
        </InfoCard>

        <SectionTitle
          text={t(
            "providerRequestsCustomerNotes",
          )}
          isRTL={isRTL}
          textDirection={
            textDirection
          }
        />

        <View
          style={
            styles.notesCard
          }
        >
          <Text
            style={[
              styles.notesText,
              {
                textAlign: isRTL
                  ? "right"
                  : "left",
                writingDirection:
                  textDirection,
              },
            ]}
          >
            {booking.notes?.trim()
              ? booking.notes
              : t(
                  "providerRequestsNoNotes",
                )}
          </Text>
        </View>

        <SectionTitle
          text={t(
            "providerRequestsPriceSummary",
          )}
          isRTL={isRTL}
          textDirection={
            textDirection
          }
        />

        <InfoCard>
          <PriceRow
            label={t(
              "providerRequestsServiceCost",
            )}
            value={formatCurrency(
              booking.servicePrice,
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

          <Divider />

          <PriceRow
            label={t(
              "providerRequestsPlatformFee",
            )}
            value={formatCurrency(
              booking.platformFee,
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

          <Divider />

          <PriceRow
            label={t(
              "providerRequestsCustomerTotal",
            )}
            value={formatCurrency(
              booking.total,
              language,
            )}
            emphasized
            isRTL={isRTL}
            rowDirection={
              rowDirection
            }
            textDirection={
              textDirection
            }
          />
        </InfoCard>

        <ActionArea
          booking={booking}
          isUpdating={
            isUpdating
          }
          t={t}
          onAccept={
            confirmAccept
          }
          onReject={
            confirmReject
          }
          onStart={
            confirmStart
          }
          onComplete={
            confirmComplete
          }
          textDirection={
            textDirection
          }
        />
      </ScrollView>
    </SafeAreaView>
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
  onBack: () => void;
};

function Header({
  isRTL,
  rowDirection,
  textDirection,
  title,
  subtitle,
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
        onPress={onBack}
        style={({
          pressed,
        }) => [
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
          numberOfLines={2}
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

function SectionTitle({
  text,
  isRTL,
  textDirection,
}: {
  text: string;
  isRTL: boolean;
  textDirection:
    | "ltr"
    | "rtl";
}) {
  return (
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
      {text}
    </Text>
  );
}

function InfoCard({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <View
      style={
        styles.infoCard
      }
    >
      {children}
    </View>
  );
}

function InfoRow({
  icon,
  label,
  value,
  isRTL,
  rowDirection,
  textDirection,
}: {
  icon:
    | "person-outline"
    | "call-outline"
    | "calendar-outline"
    | "time-outline"
    | "location-outline";
  label: string;
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
        styles.infoRow,
        {
          flexDirection:
            rowDirection,
        },
      ]}
    >
      <View
        style={
          styles.infoIcon
        }
      >
        <Ionicons
          name={icon}
          size={20}
          color={
            KhedmatPalette.blue500
          }
        />
      </View>

      <View
        style={
          styles.infoCopy
        }
      >
        <Text
          style={[
            styles.infoLabel,
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
            styles.infoValue,
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
    </View>
  );
}

function PriceRow({
  label,
  value,
  emphasized = false,
  isRTL,
  rowDirection,
  textDirection,
}: {
  label: string;
  value: string;
  emphasized?: boolean;
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
        styles.priceRow,
        {
          flexDirection:
            rowDirection,
        },
      ]}
    >
      <Text
        style={[
          styles.priceLabel,
          emphasized &&
            styles.priceEmphasized,
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
          styles.priceValue,
          emphasized &&
            styles.priceEmphasized,
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

function Divider() {
  return (
    <View
      style={
        styles.divider
      }
    />
  );
}

function ActionArea({
  booking,
  isUpdating,
  t,
  onAccept,
  onReject,
  onStart,
  onComplete,
  textDirection,
}: {
  booking: BookingRecord;
  isUpdating: boolean;
  t: (
    key:
      | "providerRequestsAccept"
      | "providerRequestsReject"
      | "providerRequestsStartWork"
      | "providerRequestsCompleteWork"
      | "providerRequestsCompletedMessage"
      | "providerRequestsCancelledMessage"
  ) => string;
  onAccept: () => void;
  onReject: () => void;
  onStart: () => void;
  onComplete: () => void;
  textDirection:
    | "ltr"
    | "rtl";
}) {
  if (
    booking.status ===
    "pending"
  ) {
    return (
      <View
        style={
          styles.actions
        }
      >
        <KhedmatButton
          label={t(
            "providerRequestsAccept",
          )}
          loading={
            isUpdating
          }
          disabled={
            isUpdating
          }
          onPress={
            onAccept
          }
        />

        <KhedmatButton
          label={t(
            "providerRequestsReject",
          )}
          variant="secondary"
          disabled={
            isUpdating
          }
          onPress={
            onReject
          }
        />
      </View>
    );
  }

  if (
    booking.status ===
    "confirmed"
  ) {
    return (
      <View
        style={
          styles.actions
        }
      >
        <KhedmatButton
          label={t(
            "providerRequestsStartWork",
          )}
          loading={
            isUpdating
          }
          disabled={
            isUpdating
          }
          onPress={
            onStart
          }
        />
      </View>
    );
  }

  if (
    booking.status ===
    "in-progress"
  ) {
    return (
      <View
        style={
          styles.actions
        }
      >
        <KhedmatButton
          label={t(
            "providerRequestsCompleteWork",
          )}
          loading={
            isUpdating
          }
          disabled={
            isUpdating
          }
          onPress={
            onComplete
          }
        />
      </View>
    );
  }

  return (
    <View
      style={
        styles.readOnlyMessage
      }
    >
      <Ionicons
        name={
          booking.status ===
          "completed"
            ? "checkmark-circle-outline"
            : "close-circle-outline"
        }
        size={22}
        color={
          booking.status ===
          "completed"
            ? KhedmatPalette.success
            : KhedmatPalette.error
        }
      />

      <Text
        style={[
          styles.readOnlyText,
          {
            writingDirection:
              textDirection,
          },
        ]}
      >
        {booking.status ===
        "completed"
          ? t(
              "providerRequestsCompletedMessage",
            )
          : t(
              "providerRequestsCancelledMessage",
            )}
      </Text>
    </View>
  );
}

function statusLabel(
  status:
    BookingRecord["status"],
  t: (
    key:
      | "providerRequestsStatusNew"
      | "providerRequestsStatusAccepted"
      | "providerRequestsStatusInProgress"
      | "providerRequestsStatusCompleted"
      | "providerRequestsStatusCancelled"
  ) => string,
): string {
  if (status === "pending") {
    return t(
      "providerRequestsStatusNew",
    );
  }

  if (
    status ===
    "confirmed"
  ) {
    return t(
      "providerRequestsStatusAccepted",
    );
  }

  if (
    status ===
    "in-progress"
  ) {
    return t(
      "providerRequestsStatusInProgress",
    );
  }

  if (
    status ===
    "completed"
  ) {
    return t(
      "providerRequestsStatusCompleted",
    );
  }

  return t(
    "providerRequestsStatusCancelled",
  );
}

function statusIcon(
  status:
    BookingRecord["status"],
):
  | "time-outline"
  | "checkmark-circle-outline"
  | "construct-outline"
  | "close-circle-outline" {
  if (
    status ===
    "pending"
  ) {
    return "time-outline";
  }

  if (
    status ===
    "confirmed" ||
    status ===
    "completed"
  ) {
    return "checkmark-circle-outline";
  }

  if (
    status ===
    "in-progress"
  ) {
    return "construct-outline";
  }

  return "close-circle-outline";
}

function statusColor(
  status:
    BookingRecord["status"],
): string {
  if (
    status ===
    "completed"
  ) {
    return KhedmatPalette.success;
  }

  if (
    status ===
    "cancelled"
  ) {
    return KhedmatPalette.error;
  }

  return KhedmatPalette.blue500;
}

function shortBookingId(
  value: string,
): string {
  return value.length > 8
    ? value.slice(0, 8)
    : value;
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
      year: "numeric",
      month: "short",
      day: "numeric",
    },
  );
}

function formatTime(
  value: string,
  language: string,
): string {
  const [hours, minutes] =
    value.split(":");

  const date =
    new Date();

  date.setHours(
    Number(hours),
    Number(minutes),
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

function formatCurrency(
  amount: number,
  language: string,
): string {
  const locale =
    language === "English"
      ? "en-US"
      : "fa-AF";

  const value =
    Math.round(
      Number.isFinite(
        amount,
      )
        ? amount
        : 0,
    ).toLocaleString(
      locale,
    );

  return language === "English"
    ? `AFN ${value}`
    : `${value} افغانی`;
}

const styles =
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor:
        KhedmatPalette.white,
    },

    header: {
      width: "100%",
      maxWidth:
        Layout.contentMaxWidth,
      alignSelf: "center",
      alignItems:
        "flex-start",
      gap: Spacing.md,
      paddingHorizontal:
        Layout.screenPadding,
      paddingTop:
        Spacing.lg,
      paddingBottom:
        Spacing.md,
    },

    backButton: {
      width: 40,
      height: 40,
      flexShrink: 0,
      alignItems:
        "center",
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
      fontSize: 22,
      lineHeight: 28,
    },

    subtitle: {
      ...Typography.captionStyle,
      marginTop: 2,
      color:
        KhedmatPalette.textMuted,
      lineHeight: 17,
    },

    scrollContent: {
      width: "100%",
      maxWidth:
        Layout.contentMaxWidth,
      alignSelf: "center",
      paddingHorizontal:
        Layout.screenPadding,
      paddingBottom: 120,
    },

    statusCard: {
      width: "100%",
      alignItems:
        "flex-start",
      gap: Spacing.sm,
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

    statusIcon: {
      width: 38,
      height: 38,
      flexShrink: 0,
      alignItems:
        "center",
      justifyContent:
        "center",
      borderRadius:
        Radius.md,
      backgroundColor:
        KhedmatPalette.surfaceSoft,
    },

    statusCopy: {
      flex: 1,
      minWidth: 0,
    },

    statusLabel: {
      ...Typography.sectionTitle,
      color:
        KhedmatPalette.navy900,
      fontSize: 16,
      lineHeight: 21,
    },

    statusHint: {
      ...Typography.captionStyle,
      marginTop: 4,
      color:
        KhedmatPalette.textSecondary,
      lineHeight: 18,
    },

    sectionTitle: {
      ...Typography.sectionTitle,
      width: "100%",
      marginTop:
        Spacing.xl,
      marginBottom:
        Spacing.sm,
      color:
        KhedmatPalette.navy900,
      fontSize: 17,
      lineHeight: 23,
    },

    infoCard: {
      width: "100%",
      overflow:
        "hidden",
      borderRadius:
        Radius.lg,
      borderWidth:
        StyleSheet.hairlineWidth,
      borderColor:
        KhedmatPalette.border,
      backgroundColor:
        KhedmatPalette.white,
    },

    infoRow: {
      width: "100%",
      alignItems:
        "flex-start",
      gap: Spacing.md,
      padding:
        Spacing.md,
    },

    infoIcon: {
      width: 38,
      height: 38,
      flexShrink: 0,
      alignItems:
        "center",
      justifyContent:
        "center",
      borderRadius:
        Radius.md,
      backgroundColor:
        KhedmatPalette.surfaceSoft,
    },

    infoCopy: {
      flex: 1,
      minWidth: 0,
    },

    infoLabel: {
      ...Typography.captionStyle,
      color:
        KhedmatPalette.textSecondary,
    },

    infoValue: {
      ...Typography.bodyStyle,
      marginTop: 2,
      color:
        KhedmatPalette.navy900,
      lineHeight: 20,
    },

    divider: {
      height:
        StyleSheet.hairlineWidth,
      marginHorizontal:
        Spacing.md,
      backgroundColor:
        KhedmatPalette.border,
    },

    notesCard: {
      width: "100%",
      minHeight: 88,
      padding:
        Spacing.md,
      borderRadius:
        Radius.lg,
      borderWidth: 1,
      borderColor:
        KhedmatPalette.border,
      backgroundColor:
        KhedmatPalette.white,
    },

    notesText: {
      ...Typography.bodyStyle,
      color:
        KhedmatPalette.textPrimary,
      lineHeight: 21,
    },

    priceRow: {
      width: "100%",
      alignItems: "center",
      justifyContent:
        "space-between",
      gap: Spacing.md,
      padding:
        Spacing.md,
    },

    priceLabel: {
      ...Typography.bodyStyle,
      flex: 1,
      color:
        KhedmatPalette.textSecondary,
    },

    priceValue: {
      ...Typography.label,
      flexShrink: 0,
      color:
        KhedmatPalette.textPrimary,
    },

    priceEmphasized: {
      color:
        KhedmatPalette.navy900,
      fontSize: 16,
    },

    actions: {
      width: "100%",
      gap: Spacing.sm,
      marginTop:
        Spacing.xl,
    },

    readOnlyMessage: {
      width: "100%",
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "center",
      gap: Spacing.sm,
      marginTop:
        Spacing.xl,
      padding:
        Spacing.md,
      borderRadius:
        Radius.lg,
      backgroundColor:
        KhedmatPalette.surfaceSoft,
    },

    readOnlyText: {
      ...Typography.bodyStyle,
      flex: 1,
      color:
        KhedmatPalette.textSecondary,
      lineHeight: 20,
    },

    pressed: {
      opacity: 0.72,
    },
  });
