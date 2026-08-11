import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import {
  useCallback,
  useMemo,
  useState,
} from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { KhedmatButton } from "../components/khedmat/khedmat-button";
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
  getProviderAccount,
  updateProviderAccount,
  type ProviderAccountRow,
} from "../repositories/provider-account-repository";

type WeekdayId =
  | "saturday"
  | "sunday"
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday";

type TimePickerType =
  | "start"
  | "end"
  | null;

const WEEKDAYS: WeekdayId[] = [
  "saturday",
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
];

const START_TIMES = [
  "06:00",
  "07:00",
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
] as const;

const END_TIMES = [
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
  "19:00",
  "20:00",
  "21:00",
  "22:00",
] as const;

export default function ProviderAvailabilitySettingsScreen() {
  const router = useRouter();

  const {
    t,
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
    selectedDays,
    setSelectedDays,
  ] = useState<WeekdayId[]>([]);

  const [
    startTime,
    setStartTime,
  ] = useState("08:00");

  const [
    endTime,
    setEndTime,
  ] = useState("17:00");

  const [
    availableToday,
    setAvailableToday,
  ] = useState(false);

  const [
    acceptsUrgentRequests,
    setAcceptsUrgentRequests,
  ] = useState(false);

  const [
    timePicker,
    setTimePicker,
  ] = useState<TimePickerType>(
    null,
  );

  const [
    isLoading,
    setIsLoading,
  ] = useState(true);

  const [
    isSaving,
    setIsSaving,
  ] = useState(false);

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
            setLoadFailed(true);
            setIsLoading(false);
          }

          return;
        }

        setIsLoading(true);
        setLoadFailed(false);

        try {
          const account =
            await getProviderAccount(
              activeProviderId,
            );

          if (!isMounted) {
            return;
          }

          if (!account) {
            setProvider(null);
            setLoadFailed(true);
            return;
          }

          setProvider(account);
          setSelectedDays(
            normalizeWorkingDays(
              account.working_days,
            ),
          );
          setStartTime(
            normalizeTime(
              account.start_time,
              "08:00",
            ),
          );
          setEndTime(
            normalizeTime(
              account.end_time,
              "17:00",
            ),
          );
          setAvailableToday(
            account.available_today,
          );
          setAcceptsUrgentRequests(
            account.accepts_urgent_requests,
          );
        } catch (error) {
          console.error(
            "Failed to load provider availability settings:",
            error,
          );

          if (isMounted) {
            setProvider(null);
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

  const hasChanges =
    useMemo(() => {
      if (!provider) {
        return false;
      }

      return (
        !sameDays(
          selectedDays,
          normalizeWorkingDays(
            provider.working_days,
          ),
        ) ||
        startTime !==
          normalizeTime(
            provider.start_time,
            "08:00",
          ) ||
        endTime !==
          normalizeTime(
            provider.end_time,
            "17:00",
          ) ||
        availableToday !==
          provider.available_today ||
        acceptsUrgentRequests !==
          provider.accepts_urgent_requests
      );
    }, [
      acceptsUrgentRequests,
      availableToday,
      endTime,
      provider,
      selectedDays,
      startTime,
    ]);

  const toggleDay =
    (
      day:
        WeekdayId,
    ): void => {
      setSelectedDays(
        (current) =>
          current.includes(day)
            ? current.filter(
                (item) =>
                  item !== day,
              )
            : [...current, day],
      );
    };

  const handleTimeSelect =
    (
      value: string,
    ): void => {
      if (
        timePicker === "start"
      ) {
        setStartTime(value);
      } else if (
        timePicker === "end"
      ) {
        setEndTime(value);
      }

      setTimePicker(null);
    };

  const handleSave =
    async (): Promise<void> => {
      if (
        !provider ||
        !activeProviderId ||
        isSaving
      ) {
        return;
      }

      if (
        selectedDays.length === 0
      ) {
        Alert.alert(
          t(
            "providerAvailabilitySettingsTitle",
          ),
          t(
            "providerAvailabilityDaysRequired",
          ),
        );

        return;
      }

      if (
        startTime >= endTime
      ) {
        Alert.alert(
          t(
            "providerAvailabilitySettingsTitle",
          ),
          t(
            "providerAvailabilityTimeInvalid",
          ),
        );

        return;
      }

      setIsSaving(true);

      try {
        const updated =
          await updateProviderAccount(
            activeProviderId,
            {
              working_days:
                selectedDays,
              start_time:
                startTime,
              end_time:
                endTime,
              available_today:
                availableToday,
              accepts_urgent_requests:
                acceptsUrgentRequests,
            },
          );

        setProvider(updated);

        Alert.alert(
          t(
            "providerAvailabilitySavedTitle",
          ),
          t(
            "providerAvailabilitySavedMessage",
          ),
          [
            {
              text: t(
                "okAction",
              ),
              onPress: () =>
                router.back(),
            },
          ],
        );
      } catch (error) {
        console.error(
          "Failed to save provider availability settings:",
          error,
        );

        Alert.alert(
          t(
            "providerAvailabilitySaveFailedTitle",
          ),
          t(
            "providerAvailabilitySaveFailedMessage",
          ),
        );
      } finally {
        setIsSaving(false);
      }
    };

  const pickerOptions =
    timePicker === "start"
      ? START_TIMES
      : END_TIMES;

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
            "providerAvailabilitySettingsTitle",
          )}
          subtitle={t(
            "providerAvailabilitySettingsSubtitle",
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
            "providerAvailabilitySettingsTitle",
          )}
          subtitle={t(
            "providerAvailabilitySettingsSubtitle",
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
                "providerAvailabilityLoadFailedTitle",
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
                "providerAvailabilityLoadFailedMessage",
              )}
            </Text>
          </View>
        </KhedmatCard>
      </KhedmatScreen>
    );
  }

  return (
    <>
      <KhedmatScreen
        scrollable
        contentStyle={
          styles.screenContent
        }
        footer={
          <KhedmatButton
            label={
              isSaving
                ? t(
                    "providerAvailabilitySaving",
                  )
                : t(
                    "providerAvailabilitySave",
                  )
            }
            loading={isSaving}
            disabled={
              isSaving ||
              !hasChanges
            }
            onPress={() => {
              void handleSave();
            }}
          />
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
            "providerAvailabilitySettingsTitle",
          )}
          subtitle={t(
            "providerAvailabilitySettingsSubtitle",
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
            "providerAvailabilityWorkingDays",
          )}
        </Text>

        <Text
          style={[
            styles.sectionHint,
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
            "providerAvailabilityWorkingDaysHint",
          )}
        </Text>

        <View
          style={
            styles.daysGrid
          }
        >
          {WEEKDAYS.map(
            (day) => {
              const selected =
                selectedDays.includes(
                  day,
                );

              return (
                <Pressable
                  key={day}
                  accessibilityRole="button"
                  accessibilityState={{
                    selected,
                  }}
                  onPress={() =>
                    toggleDay(day)
                  }
                  style={({
                    pressed,
                  }) => [
                    styles.dayChip,
                    selected &&
                      styles.dayChipSelected,
                    pressed &&
                      styles.pressed,
                  ]}
                >
                  <Text
                    style={[
                      styles.dayChipText,
                      selected &&
                        styles.dayChipTextSelected,
                      {
                        writingDirection:
                          textDirection,
                      },
                    ]}
                  >
                    {t(
                      weekdayKey(
                        day,
                      ),
                    )}
                  </Text>
                </Pressable>
              );
            },
          )}
        </View>

        <Text
          style={[
            styles.sectionTitle,
            styles.hoursTitle,
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
            "providerAvailabilityWorkingHours",
          )}
        </Text>

        <View
          style={[
            styles.timeRow,
            {
              flexDirection:
                rowDirection,
            },
          ]}
        >
          <TimeField
            label={t(
              "providerAvailabilityStartTime",
            )}
            value={startTime}
            isRTL={isRTL}
            textDirection={
              textDirection
            }
            onPress={() =>
              setTimePicker(
                "start",
              )
            }
          />

          <TimeField
            label={t(
              "providerAvailabilityEndTime",
            )}
            value={endTime}
            isRTL={isRTL}
            textDirection={
              textDirection
            }
            onPress={() =>
              setTimePicker(
                "end",
              )
            }
          />
        </View>

        <View
          style={
            styles.toggleList
          }
        >
          <ToggleRow
            title={t(
              "providerAvailabilityAvailableToday",
            )}
            subtitle={
              availableToday
                ? t(
                    "providerAvailabilityAvailableTodayOn",
                  )
                : t(
                    "providerAvailabilityAvailableTodayOff",
                  )
            }
            selected={
              availableToday
            }
            isRTL={isRTL}
            rowDirection={
              rowDirection
            }
            textDirection={
              textDirection
            }
            onPress={() =>
              setAvailableToday(
                (current) =>
                  !current,
              )
            }
          />

          <ToggleRow
            title={t(
              "providerAvailabilityUrgentRequests",
            )}
            subtitle={
              acceptsUrgentRequests
                ? t(
                    "providerAvailabilityUrgentRequestsOn",
                  )
                : t(
                    "providerAvailabilityUrgentRequestsOff",
                  )
            }
            selected={
              acceptsUrgentRequests
            }
            isRTL={isRTL}
            rowDirection={
              rowDirection
            }
            textDirection={
              textDirection
            }
            onPress={() =>
              setAcceptsUrgentRequests(
                (current) =>
                  !current,
              )
            }
          />
        </View>
      </KhedmatScreen>

      <Modal
        visible={
          timePicker !== null
        }
        transparent
        animationType="fade"
        onRequestClose={() =>
          setTimePicker(null)
        }
      >
        <Pressable
          style={
            styles.modalBackdrop
          }
          onPress={() =>
            setTimePicker(null)
          }
        >
          <Pressable
            style={
              styles.modalCard
            }
            onPress={(
              event,
            ) =>
              event.stopPropagation()
            }
          >
            <Text
              style={[
                styles.modalTitle,
                {
                  textAlign: isRTL
                    ? "right"
                    : "left",
                  writingDirection:
                    textDirection,
                },
              ]}
            >
              {timePicker ===
              "start"
                ? t(
                    "providerAvailabilityStartTime",
                  )
                : t(
                    "providerAvailabilityEndTime",
                  )}
            </Text>

            <View
              style={
                styles.timeOptions
              }
            >
              {pickerOptions.map(
                (value) => (
                  <Pressable
                    key={value}
                    onPress={() =>
                      handleTimeSelect(
                        value,
                      )
                    }
                    style={({
                      pressed,
                    }) => [
                      styles.timeOption,
                      value ===
                        (timePicker ===
                        "start"
                          ? startTime
                          : endTime) &&
                        styles.timeOptionSelected,
                      pressed &&
                        styles.pressed,
                    ]}
                  >
                    <Text
                      style={[
                        styles.timeOptionText,
                        value ===
                          (timePicker ===
                          "start"
                            ? startTime
                            : endTime) &&
                          styles.timeOptionTextSelected,
                      ]}
                    >
                      {value}
                    </Text>
                  </Pressable>
                ),
              )}
            </View>

            <KhedmatButton
              label={t(
                "cancelAction",
              )}
              variant="text"
              onPress={() =>
                setTimePicker(
                  null,
                )
              }
            />
          </Pressable>
        </Pressable>
      </Modal>
    </>
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

type TimeFieldProps = {
  label: string;
  value: string;
  isRTL: boolean;
  textDirection:
    | "ltr"
    | "rtl";
  onPress: () => void;
};

function TimeField({
  label,
  value,
  isRTL,
  textDirection,
  onPress,
}: TimeFieldProps) {
  return (
    <View
      style={
        styles.timeField
      }
    >
      <Text
        style={[
          styles.timeLabel,
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

      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        style={({ pressed }) => [
          styles.timeButton,
          pressed &&
            styles.pressed,
        ]}
      >
        <Text
          style={
            styles.timeValue
          }
        >
          {value}
        </Text>

        <Ionicons
          name="time-outline"
          size={20}
          color={
            KhedmatPalette.blue500
          }
        />
      </Pressable>
    </View>
  );
}

type ToggleRowProps = {
  title: string;
  subtitle: string;
  selected: boolean;
  isRTL: boolean;
  rowDirection:
    | "row"
    | "row-reverse";
  textDirection:
    | "ltr"
    | "rtl";
  onPress: () => void;
};

function ToggleRow({
  title,
  subtitle,
  selected,
  isRTL,
  rowDirection,
  textDirection,
  onPress,
}: ToggleRowProps) {
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{
        checked: selected,
      }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.toggleRow,
        {
          flexDirection:
            rowDirection,
        },
        selected &&
          styles.toggleRowSelected,
        pressed &&
          styles.pressed,
      ]}
    >
      <View
        style={
          styles.toggleCopy
        }
      >
        <Text
          style={[
            styles.toggleTitle,
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
            styles.toggleSubtitle,
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

      <View
        style={[
          styles.switchTrack,
          selected &&
            styles.switchTrackSelected,
        ]}
      >
        <View
          style={[
            styles.switchThumb,
            selected &&
              styles.switchThumbSelected,
          ]}
        />
      </View>
    </Pressable>
  );
}

function weekdayKey(
  day: WeekdayId,
):
  | "providerAvailabilitySaturday"
  | "providerAvailabilitySunday"
  | "providerAvailabilityMonday"
  | "providerAvailabilityTuesday"
  | "providerAvailabilityWednesday"
  | "providerAvailabilityThursday"
  | "providerAvailabilityFriday" {
  const keys = {
    saturday:
      "providerAvailabilitySaturday",
    sunday:
      "providerAvailabilitySunday",
    monday:
      "providerAvailabilityMonday",
    tuesday:
      "providerAvailabilityTuesday",
    wednesday:
      "providerAvailabilityWednesday",
    thursday:
      "providerAvailabilityThursday",
    friday:
      "providerAvailabilityFriday",
  } as const;

  return keys[day];
}

function normalizeWorkingDays(
  value: string[] | null | undefined,
): WeekdayId[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return WEEKDAYS.filter(
    (day) =>
      value.includes(day),
  );
}

function normalizeTime(
  value: string | null | undefined,
  fallback: string,
): string {
  const normalized =
    value?.trim();

  if (!normalized) {
    return fallback;
  }

  return normalized.slice(0, 5);
}

function sameDays(
  left: WeekdayId[],
  right: WeekdayId[],
): boolean {
  if (
    left.length !== right.length
  ) {
    return false;
  }

  const leftSet =
    new Set(left);

  return right.every(
    (day) =>
      leftSet.has(day),
  );
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

    sectionTitle: {
      ...Typography.sectionTitle,
      color:
        KhedmatPalette.textPrimary,
      fontSize: 18,
      lineHeight: 24,
    },

    sectionHint: {
      ...Typography.captionStyle,
      marginTop:
        Spacing.xs,
      marginBottom:
        Spacing.md,
      color:
        KhedmatPalette.textSecondary,
      lineHeight: 18,
    },

    daysGrid: {
      width: "100%",
      flexDirection: "row",
      flexWrap: "wrap",
      gap: Spacing.sm,
    },

    dayChip: {
      minHeight: 42,
      paddingHorizontal:
        Spacing.md,
      alignItems: "center",
      justifyContent:
        "center",
      borderRadius:
        Radius.pill,
      borderWidth: 1,
      borderColor:
        KhedmatPalette.blue200,
      backgroundColor:
        KhedmatPalette.white,
    },

    dayChipSelected: {
      borderColor:
        KhedmatPalette.navy900,
      backgroundColor:
        KhedmatPalette.navy900,
    },

    dayChipText: {
      ...Typography.captionStyle,
      color:
        KhedmatPalette.textPrimary,
      fontSize: 13,
    },

    dayChipTextSelected: {
      color:
        KhedmatPalette.white,
    },

    hoursTitle: {
      marginTop:
        Spacing.xl,
      marginBottom:
        Spacing.md,
    },

    timeRow: {
      width: "100%",
      gap: Spacing.md,
    },

    timeField: {
      flex: 1,
      minWidth: 0,
      gap: Spacing.xs,
    },

    timeLabel: {
      ...Typography.label,
      color:
        KhedmatPalette.textPrimary,
      fontSize: 14,
    },

    timeButton: {
      minHeight: 52,
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "space-between",
      gap: Spacing.sm,
      paddingHorizontal:
        Spacing.md,
      borderRadius:
        Radius.md,
      borderWidth: 1,
      borderColor:
        KhedmatPalette.blue200,
      backgroundColor:
        KhedmatPalette.white,
    },

    timeValue: {
      ...Typography.bodyStyle,
      color:
        KhedmatPalette.textPrimary,
      fontSize: 16,
    },

    toggleList: {
      width: "100%",
      gap: Spacing.sm,
      marginTop:
        Spacing.xl,
    },

    toggleRow: {
      width: "100%",
      minHeight: 78,
      alignItems: "center",
      gap: Spacing.md,
      paddingHorizontal:
        Spacing.md,
      paddingVertical:
        Spacing.md,
      borderRadius:
        Radius.lg,
      borderWidth: 1,
      borderColor:
        KhedmatPalette.blue200,
      backgroundColor:
        KhedmatPalette.white,
    },

    toggleRowSelected: {
      borderColor:
        KhedmatPalette.blue500,
      backgroundColor:
        KhedmatPalette.blue050,
    },

    toggleCopy: {
      flex: 1,
      minWidth: 0,
    },

    toggleTitle: {
      ...Typography.label,
      color:
        KhedmatPalette.textPrimary,
      fontSize: 15,
    },

    toggleSubtitle: {
      ...Typography.captionStyle,
      marginTop: 3,
      color:
        KhedmatPalette.textSecondary,
      lineHeight: 18,
    },

    switchTrack: {
      width: 46,
      height: 28,
      flexShrink: 0,
      borderRadius:
        Radius.pill,
      justifyContent:
        "center",
      paddingHorizontal: 3,
      backgroundColor:
        KhedmatPalette.border,
    },

    switchTrackSelected: {
      backgroundColor:
        KhedmatPalette.blue500,
    },

    switchThumb: {
      width: 22,
      height: 22,
      borderRadius:
        Radius.pill,
      backgroundColor:
        KhedmatPalette.white,
    },

    switchThumbSelected: {
      alignSelf:
        "flex-end",
    },

    modalBackdrop: {
      flex: 1,
      justifyContent:
        "center",
      padding:
        Spacing.xl,
      backgroundColor:
        "rgba(10, 31, 52, 0.35)",
    },

    modalCard: {
      width: "100%",
      maxWidth: 420,
      alignSelf: "center",
      padding:
        Spacing.lg,
      borderRadius:
        Radius.xl,
      backgroundColor:
        KhedmatPalette.white,
    },

    modalTitle: {
      ...Typography.sectionTitle,
      color:
        KhedmatPalette.textPrimary,
      marginBottom:
        Spacing.md,
    },

    timeOptions: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: Spacing.sm,
      marginBottom:
        Spacing.md,
    },

    timeOption: {
      minWidth: 72,
      minHeight: 42,
      alignItems: "center",
      justifyContent:
        "center",
      paddingHorizontal:
        Spacing.sm,
      borderRadius:
        Radius.md,
      borderWidth: 1,
      borderColor:
        KhedmatPalette.blue200,
      backgroundColor:
        KhedmatPalette.white,
    },

    timeOptionSelected: {
      borderColor:
        KhedmatPalette.navy900,
      backgroundColor:
        KhedmatPalette.navy900,
    },

    timeOptionText: {
      ...Typography.captionStyle,
      color:
        KhedmatPalette.textPrimary,
      fontSize: 14,
    },

    timeOptionTextSelected: {
      color:
        KhedmatPalette.white,
    },

    pressed: {
      opacity: 0.72,
    },
  });
