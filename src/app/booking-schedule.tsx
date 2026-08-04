import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  ComponentProps,
  useEffect,
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
} from "../constants/theme";
import { useBooking } from "../context/booking-context";
import { useLanguage } from "../context/languagecontext";
import type { ProviderProfile } from "../data/providers";
import { getProviderById } from "../services/provider-repository";

type IconName =
  ComponentProps<typeof Ionicons>["name"];

type LanguageName =
  | "English"
  | "Dari"
  | "Pashto";

type TimePeriod =
  | "morning"
  | "afternoon"
  | "evening";

type DateOption = {
  id: string;
  date: Date;
  weekdayId: string;
  available: boolean;
};

type TimeSlot = {
  id: string;
  period: TimePeriod;
  available: boolean;
  recommended: boolean;
};

type ScheduleCopy = ReturnType<
  typeof getScheduleCopy
>;

const CURRENT_STEP = 2;
const TOTAL_STEPS = 4;
const DATE_WINDOW_DAYS = 10;

const SUCCESS = "#268A57";
const SUCCESS_SOFT = "#E8F6EE";
const WARNING = "#8A5A00";
const WARNING_SOFT = "#FFF4D6";
const ERROR = "#B3261E";

export default function BookingScheduleScreen() {
  const router = useRouter();

  const {
    bookingDraft,
  } = useBooking();

  const { language } =
    useLanguage();

  const activeLanguage =
    normalizeLanguage(language);

  const isRtl =
    activeLanguage === "Dari" ||
    activeLanguage === "Pashto";

  const copy =
    getScheduleCopy(
      activeLanguage,
    );

  const [
    provider,
    setProvider,
  ] = useState<ProviderProfile | null>(
    null,
  );

  const [
    providerIsLoading,
    setProviderIsLoading,
  ] = useState(true);

  const [
    providerLoadError,
    setProviderLoadError,
  ] = useState<Error | null>(
    null,
  );

  useEffect(() => {
    let isMounted = true;

    const loadProvider =
      async (): Promise<void> => {
        const providerId =
          bookingDraft.providerId?.trim();

        if (!providerId) {
          if (isMounted) {
            setProvider(null);
            setProviderLoadError(
              new Error(
                "The booking draft does not contain a provider ID.",
              ),
            );
            setProviderIsLoading(
              false,
            );
          }

          return;
        }

        setProviderIsLoading(true);
        setProviderLoadError(null);

        try {
          const resolvedProvider =
            await getProviderById(
              providerId,
            );

          if (!isMounted) {
            return;
          }

          if (!resolvedProvider) {
            setProvider(null);
            setProviderLoadError(
              new Error(
                `Provider "${providerId}" was not found.`,
              ),
            );

            return;
          }

          setProvider(
            resolvedProvider,
          );
        } catch (error) {
          if (!isMounted) {
            return;
          }

          setProvider(null);
          setProviderLoadError(
            error instanceof Error
              ? error
              : new Error(
                  "Failed to load the provider.",
                ),
          );
        } finally {
          if (isMounted) {
            setProviderIsLoading(
              false,
            );
          }
        }
      };

    void loadProvider();

    return () => {
      isMounted = false;
    };
  }, [bookingDraft.providerId]);

  if (providerIsLoading) {
    return (
      <SafeAreaView
        style={styles.safeArea}
      >
        <View
          style={styles.providerState}
        >
          <Ionicons
            name="calendar-outline"
            size={52}
            color={
              KhedmatPalette.textMuted
            }
          />

          <Text
            style={[
              styles.providerStateTitle,
              directionStyle(isRtl),
            ]}
          >
            {activeLanguage === "Dari"
              ? "برنامه ارائه‌دهنده در حال بارگذاری است..."
              : activeLanguage === "Pashto"
                ? "د خدمت چمتو کوونکي مهالویش بارېږي..."
                : "Loading provider schedule..."}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!provider || providerLoadError) {
    return (
      <SafeAreaView
        style={styles.safeArea}
      >
        <View
          style={styles.providerState}
        >
          <Ionicons
            name="calendar-clear-outline"
            size={52}
            color={
              KhedmatPalette.textMuted
            }
          />

          <Text
            style={[
              styles.providerStateTitle,
              directionStyle(isRtl),
            ]}
          >
            {activeLanguage === "Dari"
              ? "ارائه‌دهنده پیدا نشد"
              : activeLanguage === "Pashto"
                ? "د خدمت چمتو کوونکی ونه موندل شو"
                : "Provider not found"}
          </Text>

          <Text
            style={[
              styles.providerStateBody,
              directionStyle(isRtl),
            ]}
          >
            {activeLanguage === "Dari"
              ? "به صفحه قبلی برگردید و دوباره ارائه‌دهنده را انتخاب کنید."
              : activeLanguage === "Pashto"
                ? "مخکنۍ پاڼې ته ستانه شئ او خدمت چمتو کوونکی بیا وټاکئ."
                : "Go back and select the provider again."}
          </Text>

          <Pressable
            accessibilityRole="button"
            onPress={() =>
              router.back()
            }
            style={({ pressed }) => [
              styles.providerStateButton,
              pressed &&
                styles.pressed,
            ]}
          >
            <Text
              style={
                styles.providerStateButtonText
              }
            >
              {copy.back}
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <BookingScheduleContent
      key={provider.id}
      provider={provider}
    />
  );
}

function BookingScheduleContent({
  provider,
}: {
  provider: ProviderProfile;
}) {
  const router = useRouter();

  const {
    bookingDraft,
    updateBookingDraft,
  } = useBooking();

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
    getScheduleCopy(
      activeLanguage,
    );

  const dateOptions =
    useMemo(
      () =>
        createDateOptions(
          DATE_WINDOW_DAYS,
          provider.workingDays,
        ),
      [provider.workingDays],
    );

  const initialDateId =
    useMemo(() => {
      const savedDate =
        dateOptions.find(
          (option) =>
            option.id ===
              bookingDraft.date &&
            option.available,
        );

      return (
        savedDate?.id ??
        dateOptions.find(
          (option) =>
            option.available,
        )?.id ??
        ""
      );
    }, [
      bookingDraft.date,
      dateOptions,
    ]);

  const [
    selectedDateId,
    setSelectedDateId,
  ] = useState(initialDateId);

  const [
    selectedTimeId,
    setSelectedTimeId,
  ] = useState(
    bookingDraft.date ===
      initialDateId
      ? bookingDraft.time
      : "",
  );

  const selectedDate =
    useMemo(
      () =>
        dateOptions.find(
          (option) =>
            option.id ===
            selectedDateId,
        ) ?? null,
      [
        dateOptions,
        selectedDateId,
      ],
    );

  const timeSlots =
    useMemo(
      () =>
        selectedDate
          ? createTimeSlots(
              provider.startTime,
              provider.endTime,
              selectedDate.id,
            )
          : [],
      [
        provider.endTime,
        provider.startTime,
        selectedDate,
      ],
    );

  const selectedTime =
    useMemo(
      () =>
        timeSlots.find(
          (slot) =>
            slot.id ===
              selectedTimeId &&
            slot.available,
        ) ?? null,
      [
        selectedTimeId,
        timeSlots,
      ],
    );

  const groupedSlots =
    useMemo(
      () => ({
        morning:
          timeSlots.filter(
            (slot) =>
              slot.period ===
              "morning",
          ),
        afternoon:
          timeSlots.filter(
            (slot) =>
              slot.period ===
              "afternoon",
          ),
        evening:
          timeSlots.filter(
            (slot) =>
              slot.period ===
              "evening",
          ),
      }),
      [timeSlots],
    );

  const selectionComplete =
    Boolean(
      selectedDate?.available,
    ) &&
    Boolean(selectedTime);

  const handleDateSelect = (
    dateId: string,
  ) => {
    const nextDate =
      dateOptions.find(
        (option) =>
          option.id === dateId,
      );

    if (!nextDate?.available) {
      return;
    }

    setSelectedDateId(dateId);
    setSelectedTimeId("");
  };

  const handleTimeSelect = (
    timeId: string,
  ) => {
    const slot =
      timeSlots.find(
        (item) =>
          item.id === timeId,
      );

    if (!slot?.available) {
      return;
    }

    setSelectedTimeId(timeId);
  };

  const handleContinue = () => {
    if (
      !selectedDate ||
      !selectedTime ||
      !selectedDate.available
    ) {
      return;
    }

    updateBookingDraft({
      date: selectedDate.id,
      time: selectedTime.id,
    });

    router.push(
      "/booking-details",
    );
  };

  return (
    <SafeAreaView
      style={styles.safeArea}
    >
      <View style={styles.root}>
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
              styles.topBar,
              {
                flexDirection: isRtl
                  ? "row-reverse"
                  : "row",
              },
            ]}
          >
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={
                copy.back
              }
              hitSlop={8}
              onPress={() =>
                router.back()
              }
              style={({ pressed }) => [
                styles.backButton,
                pressed &&
                  styles.pressed,
              ]}
            >
              <Ionicons
                name={
                  isRtl
                    ? "chevron-forward"
                    : "chevron-back"
                }
                size={24}
                color={
                  KhedmatPalette
                    .navy900
                }
              />
            </Pressable>

            <View
              style={
                styles.stepBadge
              }
            >
              <Text
                style={[
                  styles.stepText,
                  directionStyle(
                    isRtl,
                  ),
                ]}
              >
                {copy.step(
                  formatDigits(
                    CURRENT_STEP.toString(),
                    localizedDigits,
                  ),
                  formatDigits(
                    TOTAL_STEPS.toString(),
                    localizedDigits,
                  ),
                )}
              </Text>
            </View>
          </View>

          <View style={styles.header}>
            <View
              style={
                styles.headerIcon
              }
            >
              <Ionicons
                name="calendar-outline"
                size={30}
                color={
                  KhedmatPalette
                    .white
                }
              />
            </View>

            <View
              style={[
                styles.headerCopy,
                {
                  alignItems: isRtl
                    ? "flex-end"
                    : "flex-start",
                },
              ]}
            >
              <Text
                style={[
                  styles.eyebrow,
                  directionStyle(
                    isRtl,
                  ),
                ]}
              >
                {copy.eyebrow}
              </Text>

              <Text
                style={[
                  styles.title,
                  directionStyle(
                    isRtl,
                  ),
                ]}
              >
                {copy.title}
              </Text>

              <Text
                style={[
                  styles.subtitle,
                  directionStyle(
                    isRtl,
                  ),
                ]}
              >
                {copy.subtitle}
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.bookingSummaryCard,
              {
                flexDirection: isRtl
                  ? "row-reverse"
                  : "row",
              },
            ]}
          >
            <View
              style={
                styles.bookingSummaryIcon
              }
            >
              <Ionicons
                name="briefcase-outline"
                size={23}
                color={
                  KhedmatPalette
                    .blue500
                }
              />
            </View>

            <View
              style={[
                styles.bookingSummaryCopy,
                {
                  alignItems: isRtl
                    ? "flex-end"
                    : "flex-start",
                },
              ]}
            >
              <Text
                style={[
                  styles.bookingSummaryEyebrow,
                  directionStyle(
                    isRtl,
                  ),
                ]}
              >
                {copy.yourBooking}
              </Text>

              <Text
                numberOfLines={1}
                style={[
                  styles.bookingSummaryTitle,
                  directionStyle(
                    isRtl,
                  ),
                ]}
              >
                {bookingDraft.serviceName ||
                  copy.selectedServiceFallback}
              </Text>

              <Text
                numberOfLines={2}
                style={[
                  styles.bookingSummarySubtitle,
                  directionStyle(
                    isRtl,
                  ),
                ]}
              >
                {bookingDraft.providerName ||
                  copy.providerFallback}
                {" · "}
                {bookingDraft.providerProfession ||
                  copy.professionFallback}
              </Text>
            </View>

            <View
              style={
                styles.scheduleBadge
              }
            >
              <Ionicons
                name="time-outline"
                size={15}
                color={
                  KhedmatPalette
                    .blue500
                }
              />

              <Text
                style={[
                  styles.scheduleBadgeText,
                  directionStyle(
                    isRtl,
                  ),
                ]}
              >
                {copy.hours(
                  formatTime(
                    provider.startTime,
                    activeLanguage,
                  ),
                  formatTime(
                    provider.endTime,
                    activeLanguage,
                  ),
                )}
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <View
              style={[
                styles.sectionHeader,
                {
                  alignItems: isRtl
                    ? "flex-end"
                    : "flex-start",
                },
              ]}
            >
              <Text
                style={[
                  styles.sectionTitle,
                  directionStyle(
                    isRtl,
                  ),
                ]}
              >
                {copy.selectDay}
              </Text>

              <Text
                style={[
                  styles.sectionSubtitle,
                  directionStyle(
                    isRtl,
                  ),
                ]}
              >
                {copy.selectDaySubtitle}
              </Text>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={
                false
              }
              contentContainerStyle={[
                styles.datesRow,
                {
                  flexDirection: isRtl
                    ? "row-reverse"
                    : "row",
                },
              ]}
            >
              {dateOptions.map(
                (option, index) => (
                  <DateCard
                    key={option.id}
                    option={option}
                    selected={
                      option.id ===
                      selectedDateId
                    }
                    relativeLabel={
                      index === 0
                        ? copy.today
                        : index === 1
                          ? copy.tomorrow
                          : undefined
                    }
                    language={
                      activeLanguage
                    }
                    isRtl={isRtl}
                    unavailableText={
                      copy.closed
                    }
                    onPress={() =>
                      handleDateSelect(
                        option.id,
                      )
                    }
                  />
                ),
              )}
            </ScrollView>
          </View>

          <View style={styles.section}>
            <View
              style={[
                styles.timeSectionHeader,
                {
                  flexDirection: isRtl
                    ? "row-reverse"
                    : "row",
                },
              ]}
            >
              <View
                style={[
                  styles.sectionHeaderCopy,
                  {
                    alignItems: isRtl
                      ? "flex-end"
                      : "flex-start",
                  },
                ]}
              >
                <Text
                  style={[
                    styles.sectionTitle,
                    directionStyle(
                      isRtl,
                    ),
                  ]}
                >
                  {copy.selectTime}
                </Text>

                <Text
                  style={[
                    styles.sectionSubtitle,
                    directionStyle(
                      isRtl,
                    ),
                  ]}
                >
                  {copy.selectTimeSubtitle}
                </Text>
              </View>

              <View
                style={[
                  styles.legend,
                  {
                    flexDirection: isRtl
                      ? "row-reverse"
                      : "row",
                  },
                ]}
              >
                <LegendItem
                  label={copy.available}
                  color={SUCCESS}
                  isRtl={isRtl}
                />

                <LegendItem
                  label={copy.full}
                  color={
                    KhedmatPalette
                      .textMuted
                  }
                  isRtl={isRtl}
                />
              </View>
            </View>

            {timeSlots.length > 0 ? (
              <View
                style={
                  styles.periods
                }
              >
                <TimePeriodSection
                  title={copy.morning}
                  icon="sunny-outline"
                  slots={
                    groupedSlots.morning
                  }
                  selectedTimeId={
                    selectedTimeId
                  }
                  language={
                    activeLanguage
                  }
                  isRtl={isRtl}
                  copy={copy}
                  onSelect={
                    handleTimeSelect
                  }
                />

                <TimePeriodSection
                  title={
                    copy.afternoon
                  }
                  icon="partly-sunny-outline"
                  slots={
                    groupedSlots.afternoon
                  }
                  selectedTimeId={
                    selectedTimeId
                  }
                  language={
                    activeLanguage
                  }
                  isRtl={isRtl}
                  copy={copy}
                  onSelect={
                    handleTimeSelect
                  }
                />

                <TimePeriodSection
                  title={copy.evening}
                  icon="moon-outline"
                  slots={
                    groupedSlots.evening
                  }
                  selectedTimeId={
                    selectedTimeId
                  }
                  language={
                    activeLanguage
                  }
                  isRtl={isRtl}
                  copy={copy}
                  onSelect={
                    handleTimeSelect
                  }
                />
              </View>
            ) : (
              <View
                style={
                  styles.emptySlots
                }
              >
                <View
                  style={
                    styles.emptySlotsIcon
                  }
                >
                  <Ionicons
                    name="calendar-clear-outline"
                    size={30}
                    color={
                      KhedmatPalette
                        .blue500
                    }
                  />
                </View>

                <Text
                  style={[
                    styles.emptySlotsTitle,
                    directionStyle(
                      isRtl,
                    ),
                  ]}
                >
                  {
                    copy.noSlotsTitle
                  }
                </Text>

                <Text
                  style={[
                    styles.emptySlotsText,
                    directionStyle(
                      isRtl,
                    ),
                  ]}
                >
                  {
                    copy.noSlotsText
                  }
                </Text>
              </View>
            )}
          </View>

          {selectedDate &&
          selectedTime ? (
            <View
              style={[
                styles.selectedSummaryCard,
                {
                  flexDirection: isRtl
                    ? "row-reverse"
                    : "row",
                },
              ]}
            >
              <View
                style={
                  styles.selectedSummaryIcon
                }
              >
                <Ionicons
                  name="calendar-outline"
                  size={23}
                  color={
                    KhedmatPalette
                      .white
                  }
                />
              </View>

              <View
                style={[
                  styles.selectedSummaryCopy,
                  {
                    alignItems: isRtl
                      ? "flex-end"
                      : "flex-start",
                  },
                ]}
              >
                <Text
                  style={[
                    styles.selectedSummaryLabel,
                    directionStyle(
                      isRtl,
                    ),
                  ]}
                >
                  {
                    copy.selectedSchedule
                  }
                </Text>

                <Text
                  style={[
                    styles.selectedSummaryTitle,
                    directionStyle(
                      isRtl,
                    ),
                  ]}
                >
                  {formatFullDate(
                    selectedDate.date,
                    activeLanguage,
                  )}
                </Text>

                <Text
                  style={[
                    styles.selectedSummaryTime,
                    directionStyle(
                      isRtl,
                    ),
                  ]}
                >
                  {copy.atTime(
                    formatTime(
                      selectedTime.id,
                      activeLanguage,
                    ),
                  )}
                </Text>
              </View>

              <Ionicons
                name="checkmark-circle"
                size={25}
                color={SUCCESS}
              />
            </View>
          ) : null}

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
              style={
                styles.noticeIcon
              }
            >
              <Ionicons
                name="information-circle-outline"
                size={22}
                color={
                  KhedmatPalette
                    .blue500
                }
              />
            </View>

            <View
              style={[
                styles.noticeCopy,
                {
                  alignItems: isRtl
                    ? "flex-end"
                    : "flex-start",
                },
              ]}
            >
              <Text
                style={[
                  styles.noticeTitle,
                  directionStyle(
                    isRtl,
                  ),
                ]}
              >
                {copy.noticeTitle}
              </Text>

              <Text
                style={[
                  styles.noticeText,
                  directionStyle(
                    isRtl,
                  ),
                ]}
              >
                {copy.noticeText}
              </Text>
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <View
            style={
              styles.footerContent
            }
          >
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={
                copy.continue
              }
              accessibilityState={{
                disabled:
                  !selectionComplete,
              }}
              disabled={
                !selectionComplete
              }
              onPress={
                handleContinue
              }
              style={({ pressed }) => [
                styles.primaryButton,
                !selectionComplete &&
                  styles.primaryButtonDisabled,
                pressed &&
                  selectionComplete &&
                  styles.primaryButtonPressed,
              ]}
            >
              <View
                style={[
                  styles.primaryButtonContent,
                  {
                    flexDirection: isRtl
                      ? "row-reverse"
                      : "row",
                  },
                ]}
              >
                <Ionicons
                  name="document-text-outline"
                  size={20}
                  color={
                    KhedmatPalette
                      .white
                  }
                />

                <Text
                  style={[
                    styles.primaryButtonText,
                    directionStyle(
                      isRtl,
                    ),
                  ]}
                >
                  {copy.continue}
                </Text>

                {selectionComplete ? (
                  <Ionicons
                    name={
                      isRtl
                        ? "arrow-back"
                        : "arrow-forward"
                    }
                    size={19}
                    color={
                      KhedmatPalette
                        .white
                    }
                  />
                ) : null}
              </View>
            </Pressable>

            <Text
              style={[
                styles.footerSummary,
                directionStyle(isRtl),
              ]}
            >
              {selectedDate &&
              selectedTime
                ? copy.footerSelected(
                    formatShortDate(
                      selectedDate.date,
                      activeLanguage,
                    ),
                    formatTime(
                      selectedTime.id,
                      activeLanguage,
                    ),
                  )
                : copy.footerEmpty}
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

function DateCard({
  option,
  selected,
  relativeLabel,
  language,
  isRtl,
  unavailableText,
  onPress,
}: {
  option: DateOption;
  selected: boolean;
  relativeLabel?: string;
  language: LanguageName;
  isRtl: boolean;
  unavailableText: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityLabel={formatFullDate(
        option.date,
        language,
      )}
      accessibilityState={{
        selected,
        disabled:
          !option.available,
      }}
      disabled={!option.available}
      onPress={onPress}
      style={({ pressed }) => [
        styles.dateCard,
        selected &&
          styles.dateCardSelected,
        !option.available &&
          styles.dateCardUnavailable,
        pressed &&
          option.available &&
          styles.cardPressed,
      ]}
    >
      {relativeLabel ? (
        <Text
          style={[
            styles.relativeDateLabel,
            selected &&
              styles.selectedDateText,
            directionStyle(isRtl),
          ]}
        >
          {relativeLabel}
        </Text>
      ) : (
        <View
          style={
            styles.relativeDateSpacer
          }
        />
      )}

      <Text
        style={[
          styles.weekdayLabel,
          selected &&
            styles.selectedDateText,
          !option.available &&
            styles.unavailableDateText,
          directionStyle(isRtl),
        ]}
      >
        {formatWeekday(
          option.date,
          language,
        )}
      </Text>

      <Text
        style={[
          styles.dayNumber,
          selected &&
            styles.selectedDayNumber,
          !option.available &&
            styles.unavailableDateText,
        ]}
      >
        {formatDigits(
          option.date
            .getDate()
            .toString(),
          language !== "English",
        )}
      </Text>

      <Text
        style={[
          styles.monthLabel,
          selected &&
            styles.selectedDateText,
          !option.available &&
            styles.unavailableDateText,
          directionStyle(isRtl),
        ]}
      >
        {formatMonth(
          option.date,
          language,
        )}
      </Text>

      <View
        style={[
          styles.dateSelectionMark,
          selected &&
            styles.dateSelectionMarkSelected,
          !option.available &&
            styles.dateSelectionMarkUnavailable,
        ]}
      >
        {selected ? (
          <Ionicons
            name="checkmark"
            size={13}
            color={
              KhedmatPalette.white
            }
          />
        ) : !option.available ? (
          <Ionicons
            name="close"
            size={12}
            color={
              KhedmatPalette
                .textMuted
            }
          />
        ) : null}
      </View>

      {!option.available ? (
        <Text
          style={[
            styles.closedText,
            directionStyle(isRtl),
          ]}
        >
          {unavailableText}
        </Text>
      ) : null}
    </Pressable>
  );
}

function LegendItem({
  label,
  color,
  isRtl,
}: {
  label: string;
  color: string;
  isRtl: boolean;
}) {
  return (
    <View
      style={[
        styles.legendItem,
        {
          flexDirection: isRtl
            ? "row-reverse"
            : "row",
        },
      ]}
    >
      <View
        style={[
          styles.legendDot,
          {
            backgroundColor: color,
          },
        ]}
      />

      <Text
        style={[
          styles.legendText,
          directionStyle(isRtl),
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

function TimePeriodSection({
  title,
  icon,
  slots,
  selectedTimeId,
  language,
  isRtl,
  copy,
  onSelect,
}: {
  title: string;
  icon: IconName;
  slots: TimeSlot[];
  selectedTimeId: string;
  language: LanguageName;
  isRtl: boolean;
  copy: ScheduleCopy;
  onSelect: (
    timeId: string,
  ) => void;
}) {
  if (slots.length === 0) {
    return null;
  }

  return (
    <View style={styles.timePeriod}>
      <View
        style={[
          styles.timePeriodHeader,
          {
            flexDirection: isRtl
              ? "row-reverse"
              : "row",
          },
        ]}
      >
        <View
          style={[
            styles.timePeriodIcon,
            {
              backgroundColor:
                icon ===
                "moon-outline"
                  ? "#EEF0FA"
                  : WARNING_SOFT,
            },
          ]}
        >
          <Ionicons
            name={icon}
            size={18}
            color={
              icon ===
              "moon-outline"
                ? KhedmatPalette
                    .navy700
                : WARNING
            }
          />
        </View>

        <Text
          style={[
            styles.timePeriodTitle,
            directionStyle(isRtl),
          ]}
        >
          {title}
        </Text>
      </View>

      <View style={styles.timeGrid}>
        {slots.map((slot) => {
          const selected =
            slot.id ===
            selectedTimeId;

          return (
            <Pressable
              key={slot.id}
              accessibilityRole="radio"
              accessibilityLabel={formatTime(
                slot.id,
                language,
              )}
              accessibilityState={{
                selected,
                disabled:
                  !slot.available,
              }}
              disabled={
                !slot.available
              }
              onPress={() =>
                onSelect(slot.id)
              }
              style={({ pressed }) => [
                styles.timeCard,
                selected &&
                  styles.timeCardSelected,
                !slot.available &&
                  styles.timeCardUnavailable,
                pressed &&
                  slot.available &&
                  styles.cardPressed,
              ]}
            >
              {slot.recommended &&
              slot.available ? (
                <View
                  style={
                    styles.recommendedBadge
                  }
                >
                  <Text
                    style={[
                      styles.recommendedText,
                      directionStyle(
                        isRtl,
                      ),
                    ]}
                  >
                    {copy.recommended}
                  </Text>
                </View>
              ) : null}

              <Text
                style={[
                  styles.timeLabel,
                  selected &&
                    styles.timeLabelSelected,
                  !slot.available &&
                    styles.timeLabelUnavailable,
                  directionStyle(
                    isRtl,
                  ),
                ]}
              >
                {formatTime(
                  slot.id,
                  language,
                )}
              </Text>

              <View
                style={[
                  styles.timeStatusDot,
                  {
                    backgroundColor:
                      selected
                        ? KhedmatPalette
                            .white
                        : slot.available
                          ? SUCCESS
                          : KhedmatPalette
                              .textMuted,
                  },
                ]}
              />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function createDateOptions(
  numberOfDays: number,
  workingDays: string[],
): DateOption[] {
  const today =
    startOfDay(new Date());

  return Array.from(
    {
      length: numberOfDays,
    },
    (_, index) => {
      const date =
        new Date(today);

      date.setDate(
        today.getDate() + index,
      );

      const weekdayId =
        getWeekdayId(date);

      return {
        id: formatDateId(date),
        date,
        weekdayId,
        available:
          workingDays.length === 0 ||
          workingDays.includes(
            weekdayId,
          ),
      };
    },
  );
}

function createTimeSlots(
  startTime: string,
  endTime: string,
  dateId: string,
): TimeSlot[] {
  const startHour =
    parseHour(startTime, 8);

  const endHour =
    parseHour(endTime, 17);

  const lastStartHour =
    Math.max(
      startHour,
      endHour - 1,
    );

  const hours =
    Array.from(
      {
        length:
          lastStartHour -
          startHour +
          1,
      },
      (_, index) =>
        startHour + index,
    );

  return hours.map(
    (hour, index) => {
      const id = `${String(
        hour,
      ).padStart(2, "0")}:00`;

      const availabilitySeed =
        hashString(
          `${dateId}-${id}`,
        );

      const available =
        availabilitySeed % 5 !==
        0;

      const period:
        TimePeriod =
        hour < 12
          ? "morning"
          : hour < 17
            ? "afternoon"
            : "evening";

      return {
        id,
        period,
        available,
        recommended:
          available &&
          (index === 1 ||
            index ===
              Math.floor(
                hours.length / 2,
              )),
      };
    },
  );
}

function parseHour(
  value: string,
  fallback: number,
): number {
  const parsed =
    Number(
      value.split(":")[0],
    );

  return Number.isFinite(
    parsed,
  )
    ? parsed
    : fallback;
}

function hashString(
  value: string,
): number {
  return Array.from(value).reduce(
    (hash, character) =>
      (hash * 31 +
        character.charCodeAt(0)) %
      9973,
    7,
  );
}

function startOfDay(
  date: Date,
): Date {
  const result =
    new Date(date);

  result.setHours(
    0,
    0,
    0,
    0,
  );

  return result;
}

function formatDateId(
  date: Date,
): string {
  const year =
    date.getFullYear();

  const month =
    String(
      date.getMonth() + 1,
    ).padStart(2, "0");

  const day =
    String(
      date.getDate(),
    ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getWeekdayId(
  date: Date,
): string {
  const weekdays = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];

  return (
    weekdays[
      date.getDay()
    ] ?? ""
  );
}

function formatWeekday(
  date: Date,
  language: LanguageName,
): string {
  const labels = {
    English: [
      "Sun",
      "Mon",
      "Tue",
      "Wed",
      "Thu",
      "Fri",
      "Sat",
    ],
    Dari: [
      "یک‌شنبه",
      "دوشنبه",
      "سه‌شنبه",
      "چهارشنبه",
      "پنج‌شنبه",
      "جمعه",
      "شنبه",
    ],
    Pashto: [
      "یکشنبه",
      "دوشنبه",
      "سه‌شنبه",
      "چهارشنبه",
      "پنجشنبه",
      "جمعه",
      "شنبه",
    ],
  } as const;

  return (
    labels[language][
      date.getDay()
    ] ?? ""
  );
}

function formatMonth(
  date: Date,
  language: LanguageName,
): string {
  const months = {
    English: [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ],
    Dari: [
      "جنوری",
      "فبروری",
      "مارچ",
      "اپریل",
      "می",
      "جون",
      "جولای",
      "اگست",
      "سپتمبر",
      "اکتوبر",
      "نوامبر",
      "دسمبر",
    ],
    Pashto: [
      "جنوري",
      "فبروري",
      "مارچ",
      "اپرېل",
      "می",
      "جون",
      "جولای",
      "اګست",
      "سپتمبر",
      "اکتوبر",
      "نومبر",
      "دسمبر",
    ],
  } as const;

  return (
    months[language][
      date.getMonth()
    ] ?? ""
  );
}

function formatFullDate(
  date: Date,
  language: LanguageName,
): string {
  const day =
    formatDigits(
      date.getDate().toString(),
      language !== "English",
    );

  const separator =
    language === "English"
      ? ", "
      : "، ";

  return `${formatWeekday(
    date,
    language,
  )}${separator}${day} ${formatMonth(
    date,
    language,
  )}`;
}

function formatShortDate(
  date: Date,
  language: LanguageName,
): string {
  const day =
    formatDigits(
      date.getDate().toString(),
      language !== "English",
    );

  return `${day} ${formatMonth(
    date,
    language,
  )}`;
}

function formatTime(
  value: string,
  language: LanguageName,
): string {
  const [
    hourText,
    minute = "00",
  ] = value.split(":");

  const hour =
    Number(hourText);

  if (
    !Number.isFinite(hour)
  ) {
    return value;
  }

  if (language === "English") {
    const period =
      hour >= 12 ? "PM" : "AM";

    const displayHour =
      hour % 12 || 12;

    return `${displayHour}:${minute} ${period}`;
  }

  const displayHour =
    hour % 12 || 12;

  const period =
    hour < 12
      ? language === "Dari"
        ? "صبح"
        : "سهار"
      : hour === 12
        ? language === "Dari"
          ? "ظهر"
          : "غرمه"
        : hour < 18
          ? language === "Dari"
            ? "بعد از ظهر"
            : "ماسپښین"
          : language === "Dari"
            ? "عصر"
            : "ماښام";

  return `${formatDigits(
    `${displayHour}:${minute}`,
    true,
  )} ${period}`;
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

function getScheduleCopy(
  language: LanguageName,
) {
  if (
    language === "Dari"
  ) {
    return {
      back: "بازگشت",
      step:
        (
          current: string,
          total: string,
        ) =>
          `مرحله ${current} از ${total}`,
      eyebrow:
        "زمان‌بندی رزرو",
      title:
        "تاریخ و زمان مناسب را انتخاب کنید",
      subtitle:
        "روزها و ساعت‌های موجود براساس برنامهٔ کاری ارائه‌دهنده نمایش داده می‌شوند.",
      yourBooking:
        "رزرو شما",
      selectedServiceFallback:
        "خدمت انتخاب‌شده",
      providerFallback:
        "ارائه‌دهنده",
      professionFallback:
        "متخصص خدمات",
      hours:
        (
          start: string,
          end: string,
        ) =>
          `${start} تا ${end}`,
      selectDay:
        "انتخاب روز",
      selectDaySubtitle:
        "یکی از روزهای کاری موجود را انتخاب کنید.",
      today: "امروز",
      tomorrow: "فردا",
      closed: "تعطیل",
      selectTime:
        "انتخاب زمان",
      selectTimeSubtitle:
        "زمان‌های پُر یا خارج از برنامه قابل انتخاب نیستند.",
      available: "موجود",
      full: "پُر",
      morning: "صبح",
      afternoon:
        "بعد از ظهر",
      evening: "عصر",
      recommended:
        "پیشنهادی",
      noSlotsTitle:
        "زمانی برای این روز موجود نیست",
      noSlotsText:
        "روز دیگری را انتخاب کنید یا بعداً دوباره بررسی نمایید.",
      selectedSchedule:
        "زمان انتخاب‌شده",
      atTime:
        (time: string) =>
          `ساعت ${time}`,
      noticeTitle:
        "رزرو پس از تأیید ارائه‌دهنده نهایی می‌شود",
      noticeText:
        "ارسال درخواست به معنی تأیید نهایی نیست. ارائه‌دهنده ابتدا جزئیات و زمان را بررسی می‌کند.",
      continue:
        "ادامه و تکمیل جزئیات",
      footerSelected:
        (
          date: string,
          time: string,
        ) =>
          `${date} · ${time}`,
      footerEmpty:
        "برای ادامه تاریخ و زمان را انتخاب کنید.",
    };
  }

  if (
    language === "Pashto"
  ) {
    return {
      back: "بېرته",
      step:
        (
          current: string,
          total: string,
        ) =>
          `مرحله ${current} له ${total}`,
      eyebrow:
        "د رزرف مهال‌وېش",
      title:
        "مناسبه نېټه او وخت وټاکئ",
      subtitle:
        "شته ورځې او ساعتونه د خدمت وړاندې کوونکي د کاري مهال‌وېش له مخې ښودل کېږي.",
      yourBooking:
        "ستاسو رزرف",
      selectedServiceFallback:
        "ټاکل شوی خدمت",
      providerFallback:
        "خدمت وړاندې کوونکی",
      professionFallback:
        "د خدمت متخصص",
      hours:
        (
          start: string,
          end: string,
        ) =>
          `له ${start} تر ${end}`,
      selectDay:
        "ورځ وټاکئ",
      selectDaySubtitle:
        "له شته کاري ورځو څخه یوه وټاکئ.",
      today: "نن",
      tomorrow: "سبا",
      closed: "تړلی",
      selectTime:
        "وخت وټاکئ",
      selectTimeSubtitle:
        "ډک یا له مهال‌وېش بهر وختونه نه شي ټاکل کېدای.",
      available: "شته",
      full: "ډک",
      morning: "سهار",
      afternoon:
        "ماسپښین",
      evening: "ماښام",
      recommended:
        "سپارښتل شوی",
      noSlotsTitle:
        "د دې ورځې لپاره وخت نشته",
      noSlotsText:
        "بله ورځ وټاکئ یا وروسته بیا وګورئ.",
      selectedSchedule:
        "ټاکل شوی وخت",
      atTime:
        (time: string) =>
          `په ${time}`,
      noticeTitle:
        "رزرف د خدمت وړاندې کوونکي له تایید وروسته وروستی کېږي",
      noticeText:
        "د غوښتنې لېږل وروستی تایید نه دی. خدمت وړاندې کوونکی به لومړی جزئیات او وخت وګوري.",
      continue:
        "دوام او جزئیات بشپړ کړئ",
      footerSelected:
        (
          date: string,
          time: string,
        ) =>
          `${date} · ${time}`,
      footerEmpty:
        "د دوام لپاره نېټه او وخت وټاکئ.",
    };
  }

  return {
    back: "Back",
    step:
      (
        current: string,
        total: string,
      ) =>
        `Step ${current} of ${total}`,
    eyebrow:
      "Booking schedule",
    title:
      "Choose a suitable date and time",
    subtitle:
      "Available days and times are based on the provider’s working schedule.",
    yourBooking:
      "Your booking",
    selectedServiceFallback:
      "Selected service",
    providerFallback:
      "Provider",
    professionFallback:
      "Service professional",
    hours:
      (
        start: string,
        end: string,
      ) =>
        `${start} to ${end}`,
    selectDay:
      "Choose a day",
    selectDaySubtitle:
      "Select one of the provider’s available working days.",
    today: "Today",
    tomorrow: "Tomorrow",
    closed: "Closed",
    selectTime:
      "Choose a time",
    selectTimeSubtitle:
      "Full or out-of-schedule times cannot be selected.",
    available: "Available",
    full: "Full",
    morning: "Morning",
    afternoon:
      "Afternoon",
    evening: "Evening",
    recommended:
      "Recommended",
    noSlotsTitle:
      "No time slots are available",
    noSlotsText:
      "Choose another day or check again later.",
    selectedSchedule:
      "Selected schedule",
    atTime:
      (time: string) =>
        `At ${time}`,
    noticeTitle:
      "The booking is final after provider confirmation",
    noticeText:
      "Submitting the request does not confirm the booking. The provider will review the details and schedule first.",
    continue:
      "Continue to details",
    footerSelected:
      (
        date: string,
        time: string,
      ) =>
        `${date} · ${time}`,
    footerEmpty:
      "Select a date and time to continue.",
  };
}

const styles =
  StyleSheet.create({
    providerState: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      gap: Spacing.md,
      paddingHorizontal:
        Layout.screenPadding,
    },

    providerStateTitle: {
      ...Typography.sectionTitle,
      width: "100%",
      maxWidth:
        Layout.readableTextMaxWidth,
      color:
        KhedmatPalette.textPrimary,
      textAlign: "center",
    },

    providerStateBody: {
      ...Typography.bodyStyle,
      width: "100%",
      maxWidth:
        Layout.readableTextMaxWidth,
      color:
        KhedmatPalette.textMuted,
      textAlign: "center",
    },

    providerStateButton: {
      minHeight:
        Layout.minimumTouchTarget,
      alignItems: "center",
      justifyContent: "center",
      marginTop: Spacing.sm,
      paddingHorizontal:
        Spacing.xl,
      borderRadius: Radius.lg,
      backgroundColor:
        KhedmatPalette.navy900,
    },

    providerStateButtonText: {
      ...Typography.buttonLabel,
      color:
        KhedmatPalette.white,
    },

    safeArea: {
      flex: 1,
      backgroundColor:
        KhedmatPalette.blue050,
    },

    root: {
      flex: 1,
    },

    scrollContent: {
      width: "100%",
      maxWidth:
        Layout.contentMaxWidth,
      alignSelf: "center",
      paddingHorizontal:
        Layout.screenPadding,
      paddingTop: Spacing.md,
      paddingBottom: 164,
    },

    topBar: {
      width: "100%",
      minHeight:
        Layout.minimumTouchTarget,
      alignItems: "center",
      justifyContent:
        "space-between",
    },

    backButton: {
      width: 44,
      height: 44,
      borderRadius: Radius.pill,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor:
        KhedmatPalette.border,
      backgroundColor:
        KhedmatPalette.surface,
    },

    stepBadge: {
      minHeight: 34,
      paddingHorizontal:
        Spacing.md,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: Radius.pill,
      backgroundColor:
        KhedmatPalette.surfaceSoft,
    },

    stepText: {
      ...Typography.captionStyle,
      color:
        KhedmatPalette.blue500,
      fontFamily: Fonts.medium,
    },

    header: {
      width: "100%",
      marginTop: Spacing.xl,
      gap: Spacing.lg,
    },

    headerIcon: {
      width: 64,
      height: 64,
      borderRadius: Radius.xl,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor:
        KhedmatPalette.navy900,
      ...Shadows.small,
    },

    headerCopy: {
      width: "100%",
      gap: Spacing.sm,
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
      maxWidth: 470,
      color:
        KhedmatPalette.textPrimary,
      fontSize: 27,
      lineHeight: 35,
    },

    subtitle: {
      ...Typography.bodyLarge,
      width: "100%",
      maxWidth: 470,
      color:
        KhedmatPalette.textSecondary,
      lineHeight: 25,
    },

    bookingSummaryCard: {
      width: "100%",
      minHeight: 112,
      marginTop: Spacing.xxl,
      padding: Spacing.lg,
      alignItems: "center",
      gap: Spacing.md,
      borderWidth: 1,
      borderColor:
        KhedmatPalette.border,
      borderRadius: Radius.xl,
      backgroundColor:
        KhedmatPalette.surface,
      ...Shadows.small,
    },

    bookingSummaryIcon: {
      width: 48,
      height: 48,
      flexShrink: 0,
      borderRadius: Radius.lg,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor:
        KhedmatPalette.surfaceSoft,
    },

    bookingSummaryCopy: {
      flex: 1,
      gap: 2,
    },

    bookingSummaryEyebrow: {
      ...Typography.captionStyle,
      width: "100%",
      color:
        KhedmatPalette.blue500,
      fontFamily: Fonts.medium,
    },

    bookingSummaryTitle: {
      ...Typography.label,
      width: "100%",
      color:
        KhedmatPalette.textPrimary,
      fontSize: 17,
      lineHeight: 23,
    },

    bookingSummarySubtitle: {
      ...Typography.captionStyle,
      width: "100%",
      color:
        KhedmatPalette.textSecondary,
      lineHeight: 18,
    },

    scheduleBadge: {
      maxWidth: 118,
      flexShrink: 0,
      paddingHorizontal:
        Spacing.sm,
      paddingVertical: 7,
      alignItems: "center",
      justifyContent: "center",
      gap: 4,
      borderRadius: Radius.lg,
      backgroundColor:
        KhedmatPalette.surfaceSoft,
    },

    scheduleBadgeText: {
      ...Typography.captionStyle,
      color:
        KhedmatPalette.blue500,
      textAlign: "center",
      fontSize: 9,
      lineHeight: 13,
    },

    section: {
      width: "100%",
      marginTop:
        Spacing.section,
      gap: Spacing.lg,
    },

    sectionHeader: {
      width: "100%",
      gap: Spacing.xs,
    },

    sectionHeaderCopy: {
      flex: 1,
      gap: Spacing.xs,
    },

    sectionTitle: {
      ...Typography.sectionTitle,
      width: "100%",
      color:
        KhedmatPalette.textPrimary,
      fontSize: 21,
      lineHeight: 28,
    },

    sectionSubtitle: {
      ...Typography.captionStyle,
      width: "100%",
      color:
        KhedmatPalette.textMuted,
      lineHeight: 19,
    },

    datesRow: {
      gap: Spacing.sm,
      paddingHorizontal: 1,
      paddingBottom:
        Spacing.sm,
    },

    dateCard: {
      width: 104,
      minHeight: 154,
      padding: Spacing.md,
      alignItems: "center",
      justifyContent: "center",
      gap: 3,
      borderWidth: 1,
      borderColor:
        KhedmatPalette.border,
      borderRadius: Radius.xl,
      backgroundColor:
        KhedmatPalette.surface,
      ...Shadows.small,
    },

    dateCardSelected: {
      borderColor:
        KhedmatPalette.blue500,
      backgroundColor:
        KhedmatPalette.navy900,
    },

    dateCardUnavailable: {
      opacity: 0.48,
      shadowOpacity: 0,
      elevation: 0,
    },

    relativeDateLabel: {
      ...Typography.captionStyle,
      color:
        KhedmatPalette.blue500,
      fontFamily: Fonts.medium,
      textAlign: "center",
      fontSize: 10,
    },

    relativeDateSpacer: {
      height: 15,
    },

    weekdayLabel: {
      ...Typography.captionStyle,
      color:
        KhedmatPalette.textSecondary,
      textAlign: "center",
    },

    dayNumber: {
      color:
        KhedmatPalette.textPrimary,
      fontFamily: Fonts.bold,
      fontSize: 29,
      lineHeight: 35,
    },

    monthLabel: {
      ...Typography.captionStyle,
      color:
        KhedmatPalette.textMuted,
      textAlign: "center",
    },

    selectedDateText: {
      color:
        "rgba(255,255,255,0.84)",
    },

    selectedDayNumber: {
      color:
        KhedmatPalette.white,
    },

    unavailableDateText: {
      color:
        KhedmatPalette.textMuted,
    },

    dateSelectionMark: {
      width: 23,
      height: 23,
      marginTop: Spacing.xs,
      borderRadius: Radius.pill,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor:
        KhedmatPalette.border,
      backgroundColor:
        KhedmatPalette.surfaceSoft,
    },

    dateSelectionMarkSelected: {
      borderColor:
        KhedmatPalette.blue500,
      backgroundColor:
        KhedmatPalette.blue500,
    },

    dateSelectionMarkUnavailable: {
      backgroundColor:
        KhedmatPalette.surfaceSoft,
    },

    closedText: {
      ...Typography.captionStyle,
      marginTop: 2,
      color:
        KhedmatPalette.textMuted,
      textAlign: "center",
      fontSize: 9,
    },

    timeSectionHeader: {
      width: "100%",
      alignItems: "flex-start",
      justifyContent:
        "space-between",
      gap: Spacing.md,
    },

    legend: {
      flexShrink: 0,
      flexWrap: "wrap",
      alignItems: "center",
      gap: Spacing.sm,
    },

    legendItem: {
      alignItems: "center",
      gap: 4,
    },

    legendDot: {
      width: 7,
      height: 7,
      borderRadius: Radius.pill,
    },

    legendText: {
      ...Typography.captionStyle,
      color:
        KhedmatPalette.textMuted,
      fontSize: 9,
    },

    periods: {
      width: "100%",
      gap: Spacing.xl,
    },

    timePeriod: {
      width: "100%",
      gap: Spacing.md,
    },

    timePeriodHeader: {
      width: "100%",
      alignItems: "center",
      gap: Spacing.sm,
    },

    timePeriodIcon: {
      width: 36,
      height: 36,
      borderRadius: Radius.md,
      alignItems: "center",
      justifyContent: "center",
    },

    timePeriodTitle: {
      ...Typography.label,
      flex: 1,
      color:
        KhedmatPalette.textPrimary,
      fontSize: 16,
    },

    timeGrid: {
      width: "100%",
      flexDirection: "row",
      flexWrap: "wrap",
      gap: Spacing.sm,
    },

    timeCard: {
      width: "31.6%",
      minHeight: 76,
      paddingHorizontal:
        Spacing.sm,
      paddingVertical:
        Spacing.md,
      alignItems: "center",
      justifyContent: "center",
      gap: Spacing.sm,
      borderWidth: 1,
      borderColor:
        KhedmatPalette.border,
      borderRadius: Radius.lg,
      backgroundColor:
        KhedmatPalette.surface,
      ...Shadows.small,
    },

    timeCardSelected: {
      borderColor:
        KhedmatPalette.navy900,
      backgroundColor:
        KhedmatPalette.navy900,
    },

    timeCardUnavailable: {
      opacity: 0.42,
      shadowOpacity: 0,
      elevation: 0,
    },

    recommendedBadge: {
      paddingHorizontal:
        Spacing.sm,
      paddingVertical: 3,
      borderRadius: Radius.pill,
      backgroundColor:
        WARNING_SOFT,
    },

    recommendedText: {
      ...Typography.captionStyle,
      color: WARNING,
      fontFamily: Fonts.medium,
      textAlign: "center",
      fontSize: 8,
    },

    timeLabel: {
      ...Typography.label,
      color:
        KhedmatPalette.textPrimary,
      textAlign: "center",
      fontSize: 13,
      lineHeight: 18,
    },

    timeLabelSelected: {
      color:
        KhedmatPalette.white,
    },

    timeLabelUnavailable: {
      color:
        KhedmatPalette.textMuted,
    },

    timeStatusDot: {
      width: 7,
      height: 7,
      borderRadius: Radius.pill,
    },

    emptySlots: {
      width: "100%",
      minHeight: 220,
      padding: Spacing.xl,
      alignItems: "center",
      justifyContent: "center",
      gap: Spacing.md,
      borderWidth: 1,
      borderColor:
        KhedmatPalette.border,
      borderRadius: Radius.xl,
      backgroundColor:
        KhedmatPalette.surface,
    },

    emptySlotsIcon: {
      width: 66,
      height: 66,
      borderRadius: Radius.pill,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor:
        KhedmatPalette.surfaceSoft,
    },

    emptySlotsTitle: {
      ...Typography.sectionTitle,
      color:
        KhedmatPalette.textPrimary,
      textAlign: "center",
      fontSize: 18,
    },

    emptySlotsText: {
      ...Typography.bodyStyle,
      maxWidth: 340,
      color:
        KhedmatPalette.textSecondary,
      textAlign: "center",
    },

    selectedSummaryCard: {
      width: "100%",
      minHeight: 108,
      marginTop: Spacing.xl,
      padding: Spacing.lg,
      alignItems: "center",
      gap: Spacing.md,
      borderWidth: 1,
      borderColor: "#A9D9BD",
      borderRadius: Radius.xl,
      backgroundColor:
        "#F5FCF8",
    },

    selectedSummaryIcon: {
      width: 48,
      height: 48,
      flexShrink: 0,
      borderRadius: Radius.lg,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: SUCCESS,
    },

    selectedSummaryCopy: {
      flex: 1,
      gap: 3,
    },

    selectedSummaryLabel: {
      ...Typography.captionStyle,
      width: "100%",
      color: SUCCESS,
      fontFamily: Fonts.medium,
    },

    selectedSummaryTitle: {
      ...Typography.label,
      width: "100%",
      color:
        KhedmatPalette.textPrimary,
      fontSize: 16,
      lineHeight: 22,
    },

    selectedSummaryTime: {
      ...Typography.captionStyle,
      width: "100%",
      color:
        KhedmatPalette.textSecondary,
    },

    noticeCard: {
      width: "100%",
      minHeight: 108,
      marginTop: Spacing.md,
      padding: Spacing.lg,
      alignItems: "flex-start",
      gap: Spacing.md,
      borderWidth: 1,
      borderColor:
        KhedmatPalette.blue200,
      borderRadius: Radius.xl,
      backgroundColor:
        "#F4FBFC",
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

    noticeCopy: {
      flex: 1,
      gap: 3,
    },

    noticeTitle: {
      ...Typography.label,
      width: "100%",
      color:
        KhedmatPalette.textPrimary,
      fontSize: 15,
    },

    noticeText: {
      ...Typography.captionStyle,
      width: "100%",
      color:
        KhedmatPalette.textSecondary,
      lineHeight: 19,
    },

    footer: {
      position: "absolute",
      right: 0,
      bottom: 0,
      left: 0,
      borderTopWidth:
        StyleSheet.hairlineWidth,
      borderTopColor:
        KhedmatPalette.border,
      backgroundColor:
        KhedmatPalette.surface,
    },

    footerContent: {
      width: "100%",
      maxWidth:
        Layout.contentMaxWidth,
      alignSelf: "center",
      paddingHorizontal:
        Layout.screenPadding,
      paddingTop: Spacing.md,
      paddingBottom: Spacing.lg,
      gap: Spacing.sm,
    },

    primaryButton: {
      width: "100%",
      minHeight:
        Layout.controlHeight,
      paddingHorizontal:
        Spacing.lg,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: Radius.lg,
      backgroundColor:
        KhedmatPalette.navy900,
      ...Shadows.small,
    },

    primaryButtonDisabled: {
      backgroundColor:
        KhedmatPalette.disabled,
      shadowOpacity: 0,
      elevation: 0,
    },

    primaryButtonPressed: {
      opacity: 0.84,
      transform: [
        {
          scale: 0.99,
        },
      ],
    },

    primaryButtonContent: {
      alignItems: "center",
      justifyContent: "center",
      gap: Spacing.sm,
    },

    primaryButtonText: {
      ...Typography.label,
      color:
        KhedmatPalette.white,
      fontFamily: Fonts.medium,
      fontSize: 16,
      textAlign: "center",
    },

    footerSummary: {
      ...Typography.captionStyle,
      width: "100%",
      color:
        KhedmatPalette.textMuted,
      textAlign: "center",
    },

    pressed: {
      opacity: 0.76,
      transform: [
        {
          scale: 0.97,
        },
      ],
    },

    cardPressed: {
      opacity: 0.88,
      transform: [
        {
          scale: 0.98,
        },
      ],
    },
  });
