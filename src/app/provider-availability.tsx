import { Ionicons } from "@expo/vector-icons";
import {
  useLocalSearchParams,
  useRouter,
} from "expo-router";
import {
  ComponentProps,
  useMemo,
  useState,
} from "react";
import {
  Modal,
  Platform,
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
import { useLanguage } from "../context/languagecontext";

type IconName =
  ComponentProps<typeof Ionicons>["name"];

type LanguageName =
  | "English"
  | "Dari"
  | "Pashto";

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

type AvailabilityCopy = ReturnType<
  typeof getAvailabilityCopy
>;

const CURRENT_STEP = 5;
const TOTAL_STEPS = 6;
const ERROR = "#B3261E";
const SUCCESS = "#268A57";
const SUCCESS_SOFT = "#E8F6EE";

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

export default function ProviderAvailabilityScreen() {
  const router = useRouter();

  const params =
    useLocalSearchParams<{
      category?: string | string[];
      services?: string | string[];
      experience?: string | string[];
      businessName?: string | string[];
      description?: string | string[];
      province?: string | string[];
      provinceName?: string | string[];
      district?: string | string[];
      districtName?: string | string[];
      radius?: string | string[];
      serviceModes?: string | string[];
    }>();

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
    getAvailabilityCopy(
      activeLanguage,
    );

  const categoryId =
    getSingleParam(
      params.category,
    );

  const servicesParam =
    getSingleParam(
      params.services,
    );

  const experienceId =
    getSingleParam(
      params.experience,
    );

  const businessName =
    getSingleParam(
      params.businessName,
    );

  const description =
    getSingleParam(
      params.description,
    );

  const provinceId =
    getSingleParam(
      params.province,
    );

  const provinceName =
    getSingleParam(
      params.provinceName,
    );

  const districtId =
    getSingleParam(
      params.district,
    );

  const districtName =
    getSingleParam(
      params.districtName,
    );

  const radiusId =
    getSingleParam(
      params.radius,
    );

  const serviceModes =
    getSingleParam(
      params.serviceModes,
    );

  const [
    selectedDays,
    setSelectedDays,
  ] = useState<WeekdayId[]>([
    "saturday",
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
  ]);

  const [
    startTime,
    setStartTime,
  ] = useState("08:00");

  const [
    endTime,
    setEndTime,
  ] = useState("17:00");

  const [
    acceptsUrgentRequests,
    setAcceptsUrgentRequests,
  ] = useState(false);

  const [
    availableToday,
    setAvailableToday,
  ] = useState(true);

  const [
    submitted,
    setSubmitted,
  ] = useState(false);

  const [
    timePicker,
    setTimePicker,
  ] = useState<TimePickerType>(
    null,
  );

  const selectedDayLabels =
    useMemo(
      () =>
        WEEKDAYS.filter(
          (day) =>
            selectedDays.includes(
              day,
            ),
        ).map((day) =>
          copy.weekdayFull(day),
        ),
      [copy, selectedDays],
    );

  const daysError =
    submitted &&
    selectedDays.length === 0
      ? copy.daysError
      : undefined;

  const timeError =
    submitted &&
    startTime >= endTime
      ? copy.timeError
      : undefined;

  const formIsValid =
    selectedDays.length > 0 &&
    Boolean(startTime) &&
    Boolean(endTime) &&
    startTime < endTime;

  const toggleDay = (
    dayId: WeekdayId,
  ) => {
    setSelectedDays(
      (current) =>
        current.includes(dayId)
          ? current.filter(
              (id) =>
                id !== dayId,
            )
          : [...current, dayId],
    );

    if (submitted) {
      setSubmitted(false);
    }
  };

  const handleTimeSelect = (
    value: string,
  ) => {
    if (timePicker === "start") {
      setStartTime(value);
    }

    if (timePicker === "end") {
      setEndTime(value);
    }

    setTimePicker(null);

    if (submitted) {
      setSubmitted(false);
    }
  };

  const handleContinue = () => {
    setSubmitted(true);

    if (!formIsValid) {
      return;
    }

    router.push({
      pathname:
        "/provider-verification",
      params: {
        category: categoryId,
        services:
          servicesParam,
        experience:
          experienceId,
        businessName,
        description,
        province: provinceId,
        provinceName,
        district: districtId,
        districtName,
        radius: radiusId,
        serviceModes,
        workingDays:
          selectedDays.join(","),
        startTime,
        endTime,
        urgentRequests:
          acceptsUrgentRequests
            ? "true"
            : "false",
        availableToday:
          availableToday
            ? "true"
            : "false",
      },
    } as never);
  };

  const pickerOptions =
    timePicker === "start"
      ? START_TIMES
      : END_TIMES;

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
                size={31}
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
            style={
              styles.form
            }
          >
            <View
              style={styles.section}
            >
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
                <View
                  style={[
                    styles.sectionTitleRow,
                    {
                      flexDirection: isRtl
                        ? "row-reverse"
                        : "row",
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
                    {copy.workingDays}
                  </Text>

                  <Text
                    style={[
                      styles.requiredLabel,
                      directionStyle(
                        isRtl,
                      ),
                    ]}
                  >
                    {copy.required}
                  </Text>
                </View>

                <Text
                  style={[
                    styles.sectionSubtitle,
                    directionStyle(
                      isRtl,
                    ),
                  ]}
                >
                  {
                    copy.workingDaysSubtitle
                  }
                </Text>
              </View>

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
                        accessibilityRole="checkbox"
                        accessibilityLabel={copy.weekdayFull(
                          day,
                        )}
                        accessibilityState={{
                          checked:
                            selected,
                        }}
                        onPress={() =>
                          toggleDay(day)
                        }
                        style={({ pressed }) => [
                          styles.dayCard,
                          selected &&
                            styles.dayCardSelected,
                          pressed &&
                            styles.dayCardPressed,
                        ]}
                      >
                        <Text
                          style={[
                            styles.dayShort,
                            selected &&
                              styles.dayShortSelected,
                          ]}
                        >
                          {copy.weekdayShort(
                            day,
                          )}
                        </Text>

                        <Text
                          numberOfLines={1}
                          adjustsFontSizeToFit
                          minimumFontScale={
                            0.75
                          }
                          style={[
                            styles.dayFull,
                            selected &&
                              styles.dayFullSelected,
                            directionStyle(
                              isRtl,
                            ),
                          ]}
                        >
                          {copy.weekdayFull(
                            day,
                          )}
                        </Text>

                        <View
                          style={[
                            styles.dayCheck,
                            selected &&
                              styles.dayCheckSelected,
                          ]}
                        >
                          {selected ? (
                            <Ionicons
                              name="checkmark"
                              size={13}
                              color={
                                KhedmatPalette
                                  .white
                              }
                            />
                          ) : null}
                        </View>
                      </Pressable>
                    );
                  },
                )}
              </View>

              {daysError ? (
                <ErrorText
                  text={daysError}
                  isRtl={isRtl}
                />
              ) : null}
            </View>

            <View
              style={styles.section}
            >
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
                <View
                  style={[
                    styles.sectionTitleRow,
                    {
                      flexDirection: isRtl
                        ? "row-reverse"
                        : "row",
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
                    {copy.workingHours}
                  </Text>

                  <Text
                    style={[
                      styles.requiredLabel,
                      directionStyle(
                        isRtl,
                      ),
                    ]}
                  >
                    {copy.required}
                  </Text>
                </View>

                <Text
                  style={[
                    styles.sectionSubtitle,
                    directionStyle(
                      isRtl,
                    ),
                  ]}
                >
                  {
                    copy.workingHoursSubtitle
                  }
                </Text>
              </View>

              <View
                style={
                  styles.timeFields
                }
              >
                <TimeField
                  label={
                    copy.startTime
                  }
                  value={formatTime(
                    startTime,
                    activeLanguage,
                  )}
                  icon="play-outline"
                  isRtl={isRtl}
                  onPress={() =>
                    setTimePicker(
                      "start",
                    )
                  }
                />

                <View
                  style={
                    styles.timeConnector
                  }
                >
                  <View
                    style={
                      styles.timeConnectorLine
                    }
                  />

                  <Ionicons
                    name={
                      isRtl
                        ? "arrow-back"
                        : "arrow-forward"
                    }
                    size={18}
                    color={
                      KhedmatPalette
                        .blue500
                    }
                  />

                  <View
                    style={
                      styles.timeConnectorLine
                    }
                  />
                </View>

                <TimeField
                  label={
                    copy.endTime
                  }
                  value={formatTime(
                    endTime,
                    activeLanguage,
                  )}
                  icon="stop-outline"
                  isRtl={isRtl}
                  error={timeError}
                  onPress={() =>
                    setTimePicker(
                      "end",
                    )
                  }
                />
              </View>

              {timeError ? (
                <ErrorText
                  text={timeError}
                  isRtl={isRtl}
                />
              ) : null}
            </View>

            <View
              style={styles.section}
            >
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
                  {
                    copy.availabilitySettings
                  }
                </Text>

                <Text
                  style={[
                    styles.sectionSubtitle,
                    directionStyle(
                      isRtl,
                    ),
                  ]}
                >
                  {
                    copy.availabilitySettingsSubtitle
                  }
                </Text>
              </View>

              <AvailabilityToggleCard
                icon="flash-outline"
                title={
                  copy.urgentRequests
                }
                subtitle={
                  copy.urgentRequestsSubtitle
                }
                selected={
                  acceptsUrgentRequests
                }
                isRtl={isRtl}
                onPress={() =>
                  setAcceptsUrgentRequests(
                    (current) =>
                      !current,
                  )
                }
              />

              <AvailabilityToggleCard
                icon="checkmark-circle-outline"
                title={
                  copy.availableToday
                }
                subtitle={
                  copy.availableTodaySubtitle
                }
                selected={
                  availableToday
                }
                isRtl={isRtl}
                onPress={() =>
                  setAvailableToday(
                    (current) =>
                      !current,
                  )
                }
              />
            </View>

            <View
              style={[
                styles.summaryCard,
                {
                  flexDirection: isRtl
                    ? "row-reverse"
                    : "row",
                },
              ]}
            >
              <View
                style={
                  styles.summaryIcon
                }
              >
                <Ionicons
                  name="time-outline"
                  size={23}
                  color={
                    KhedmatPalette
                      .blue500
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
                    directionStyle(
                      isRtl,
                    ),
                  ]}
                >
                  {copy.summary}
                </Text>

                <Text
                  style={[
                    styles.summaryTitle,
                    directionStyle(
                      isRtl,
                    ),
                  ]}
                >
                  {selectedDayLabels.length >
                  0
                    ? selectedDayLabels.join(
                        activeLanguage ===
                          "English"
                          ? ", "
                          : "، ",
                      )
                    : copy.noDaysSelected}
                </Text>

                <Text
                  style={[
                    styles.summarySubtitle,
                    directionStyle(
                      isRtl,
                    ),
                  ]}
                >
                  {copy.timeRange(
                    formatTime(
                      startTime,
                      activeLanguage,
                    ),
                    formatTime(
                      endTime,
                      activeLanguage,
                    ),
                  )}
                </Text>
              </View>
            </View>
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

        <View
          style={styles.footer}
        >
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
              onPress={
                handleContinue
              }
              style={({ pressed }) => [
                styles.primaryButton,
                pressed &&
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

                <Ionicons
                  name={
                    isRtl
                      ? "arrow-back"
                      : "arrow-forward"
                  }
                  size={20}
                  color={
                    KhedmatPalette
                      .white
                  }
                />
              </View>
            </Pressable>

            <Text
              style={[
                styles.helperText,
                directionStyle(isRtl),
              ]}
            >
              {copy.helperText}
            </Text>
          </View>
        </View>
      </View>

      {timePicker ? (
        <TimePickerModal
          visible
          title={
            timePicker === "start"
              ? copy.startTimePickerTitle
              : copy.endTimePickerTitle
          }
          subtitle={
            timePicker === "start"
              ? copy.startTimePickerSubtitle
              : copy.endTimePickerSubtitle
          }
          options={[
            ...pickerOptions,
          ]}
          selectedValue={
            timePicker === "start"
              ? startTime
              : endTime
          }
          language={
            activeLanguage
          }
          isRtl={isRtl}
          copy={copy}
          onSelect={
            handleTimeSelect
          }
          onClose={() =>
            setTimePicker(null)
          }
        />
      ) : null}
    </SafeAreaView>
  );
}

type TimeFieldProps = {
  label: string;
  value: string;
  icon: IconName;
  isRtl: boolean;
  error?: string;
  onPress: () => void;
};

function TimeField({
  label,
  value,
  icon,
  isRtl,
  error,
  onPress,
}: TimeFieldProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [
        styles.timeField,
        error &&
          styles.controlError,
        pressed &&
          styles.controlPressed,
      ]}
    >
      <View
        style={[
          styles.timeFieldContent,
          {
            flexDirection: isRtl
              ? "row-reverse"
              : "row",
          },
        ]}
      >
        <View
          style={
            styles.timeFieldIcon
          }
        >
          <Ionicons
            name={icon}
            size={20}
            color={
              KhedmatPalette
                .blue500
            }
          />
        </View>

        <View
          style={[
            styles.timeFieldCopy,
            {
              alignItems: isRtl
                ? "flex-end"
                : "flex-start",
            },
          ]}
        >
          <Text
            style={[
              styles.timeFieldLabel,
              directionStyle(isRtl),
            ]}
          >
            {label}
          </Text>

          <Text
            style={[
              styles.timeFieldValue,
              directionStyle(isRtl),
            ]}
          >
            {value}
          </Text>
        </View>

        <Ionicons
          name="chevron-down"
          size={18}
          color={
            KhedmatPalette
              .textMuted
          }
        />
      </View>
    </Pressable>
  );
}

type AvailabilityToggleCardProps = {
  icon: IconName;
  title: string;
  subtitle: string;
  selected: boolean;
  isRtl: boolean;
  onPress: () => void;
};

function AvailabilityToggleCard({
  icon,
  title,
  subtitle,
  selected,
  isRtl,
  onPress,
}: AvailabilityToggleCardProps) {
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityLabel={title}
      accessibilityState={{
        checked: selected,
      }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.toggleCard,
        selected &&
          styles.toggleCardSelected,
        pressed &&
          styles.toggleCardPressed,
      ]}
    >
      <View
        style={[
          styles.toggleContent,
          {
            flexDirection: isRtl
              ? "row-reverse"
              : "row",
          },
        ]}
      >
        <View
          style={[
            styles.toggleIcon,
            selected &&
              styles.toggleIconSelected,
          ]}
        >
          <Ionicons
            name={icon}
            size={23}
            color={
              selected
                ? KhedmatPalette
                    .white
                : KhedmatPalette
                    .blue500
            }
          />
        </View>

        <View
          style={[
            styles.toggleCopy,
            {
              alignItems: isRtl
                ? "flex-end"
                : "flex-start",
            },
          ]}
        >
          <Text
            style={[
              styles.toggleTitle,
              selected &&
                styles.toggleTitleSelected,
              directionStyle(isRtl),
            ]}
          >
            {title}
          </Text>

          <Text
            style={[
              styles.toggleSubtitle,
              directionStyle(isRtl),
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
              selected && {
                alignSelf: isRtl
                  ? "flex-start"
                  : "flex-end",
              },
            ]}
          />
        </View>
      </View>
    </Pressable>
  );
}

type ErrorTextProps = {
  text: string;
  isRtl: boolean;
};

function ErrorText({
  text,
  isRtl,
}: ErrorTextProps) {
  return (
    <View
      style={[
        styles.errorRow,
        {
          flexDirection: isRtl
            ? "row-reverse"
            : "row",
        },
      ]}
    >
      <Ionicons
        name="alert-circle-outline"
        size={15}
        color={ERROR}
      />

      <Text
        style={[
          styles.errorText,
          directionStyle(isRtl),
        ]}
      >
        {text}
      </Text>
    </View>
  );
}

type TimePickerModalProps = {
  visible: boolean;
  title: string;
  subtitle: string;
  options: string[];
  selectedValue: string;
  language: LanguageName;
  isRtl: boolean;
  copy: AvailabilityCopy;
  onSelect: (
    value: string,
  ) => void;
  onClose: () => void;
};

function TimePickerModal({
  visible,
  title,
  subtitle,
  options,
  selectedValue,
  language,
  isRtl,
  copy,
  onSelect,
  onClose,
}: TimePickerModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <Pressable
        style={styles.modalBackdrop}
        onPress={onClose}
      >
        <Pressable
          style={styles.modalSheet}
          onPress={(event) =>
            event.stopPropagation()
          }
        >
          <View
            style={[
              styles.modalHeader,
              {
                flexDirection: isRtl
                  ? "row-reverse"
                  : "row",
              },
            ]}
          >
            <View
              style={[
                styles.modalHeaderCopy,
                {
                  alignItems: isRtl
                    ? "flex-end"
                    : "flex-start",
                },
              ]}
            >
              <Text
                style={[
                  styles.modalTitle,
                  directionStyle(isRtl),
                ]}
              >
                {title}
              </Text>

              <Text
                style={[
                  styles.modalSubtitle,
                  directionStyle(isRtl),
                ]}
              >
                {subtitle}
              </Text>
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={
                copy.close
              }
              onPress={onClose}
              style={({ pressed }) => [
                styles.modalCloseButton,
                pressed &&
                  styles.pressed,
              ]}
            >
              <Ionicons
                name="close"
                size={22}
                color={
                  KhedmatPalette
                    .navy900
                }
              />
            </Pressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={
              false
            }
            style={
              styles.timeOptionsScroll
            }
            contentContainerStyle={
              styles.timeOptions
            }
          >
            {options.map(
              (option) => {
                const selected =
                  option ===
                  selectedValue;

                return (
                  <Pressable
                    key={option}
                    accessibilityRole="radio"
                    accessibilityState={{
                      selected,
                    }}
                    accessibilityLabel={formatTime(
                      option,
                      language,
                    )}
                    onPress={() =>
                      onSelect(option)
                    }
                    style={({ pressed }) => [
                      styles.timeOption,
                      selected &&
                        styles.timeOptionSelected,
                      pressed &&
                        styles.controlPressed,
                    ]}
                  >
                    <View
                      style={[
                        styles.timeOptionContent,
                        {
                          flexDirection: isRtl
                            ? "row-reverse"
                            : "row",
                        },
                      ]}
                    >
                      <View
                        style={[
                          styles.timeOptionIcon,
                          selected &&
                            styles.timeOptionIconSelected,
                        ]}
                      >
                        <Ionicons
                          name="time-outline"
                          size={19}
                          color={
                            selected
                              ? KhedmatPalette
                                  .white
                              : KhedmatPalette
                                  .blue500
                          }
                        />
                      </View>

                      <Text
                        style={[
                          styles.timeOptionText,
                          selected &&
                            styles.timeOptionTextSelected,
                          directionStyle(
                            isRtl,
                          ),
                        ]}
                      >
                        {formatTime(
                          option,
                          language,
                        )}
                      </Text>

                      <View
                        style={[
                          styles.radioOuter,
                          selected &&
                            styles.radioOuterSelected,
                        ]}
                      >
                        {selected ? (
                          <View
                            style={
                              styles.radioInner
                            }
                          />
                        ) : null}
                      </View>
                    </View>
                  </Pressable>
                );
              },
            )}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function getSingleParam(
  value:
    | string
    | string[]
    | undefined,
): string {
  return Array.isArray(value)
    ? value[0] ?? ""
    : value ?? "";
}

function formatTime(
  value: string,
  language: LanguageName,
): string {
  const [
    hourRaw,
    minuteRaw,
  ] = value.split(":");

  const hour =
    Number(hourRaw);

  const minute =
    Number(minuteRaw);

  if (
    !Number.isFinite(hour) ||
    !Number.isFinite(minute)
  ) {
    return value;
  }

  if (language === "English") {
    const period =
      hour >= 12 ? "PM" : "AM";

    const displayHour =
      hour % 12 || 12;

    return `${displayHour}:${String(
      minute,
    ).padStart(2, "0")} ${period}`;
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
            ? "شب"
            : "ماښام";

  return `${formatDigits(
    `${displayHour}:${String(
      minute,
    ).padStart(2, "0")}`,
    true,
  )} ${period}`;
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

function getAvailabilityCopy(
  language: LanguageName,
) {
  const weekdayNames = {
    English: {
      saturday: ["Sat", "Saturday"],
      sunday: ["Sun", "Sunday"],
      monday: ["Mon", "Monday"],
      tuesday: ["Tue", "Tuesday"],
      wednesday: ["Wed", "Wednesday"],
      thursday: ["Thu", "Thursday"],
      friday: ["Fri", "Friday"],
    },
    Dari: {
      saturday: ["ش", "شنبه"],
      sunday: ["ی", "یک‌شنبه"],
      monday: ["د", "دوشنبه"],
      tuesday: ["س", "سه‌شنبه"],
      wednesday: ["چ", "چهارشنبه"],
      thursday: ["پ", "پنج‌شنبه"],
      friday: ["ج", "جمعه"],
    },
    Pashto: {
      saturday: ["ش", "شنبه"],
      sunday: ["ی", "یکشنبه"],
      monday: ["د", "دوشنبه"],
      tuesday: ["س", "سه‌شنبه"],
      wednesday: ["چ", "چهارشنبه"],
      thursday: ["پ", "پنجشنبه"],
      friday: ["ج", "جمعه"],
    },
  } as const;

  if (language === "Dari") {
    return {
      back: "بازگشت",
      step:
        (
          current: string,
          total: string,
        ) =>
          `مرحله ${current} از ${total}`,
      eyebrow:
        "برنامهٔ کاری",
      title:
        "چه زمان‌هایی آمادهٔ کار هستید؟",
      subtitle:
        "روزها و ساعت‌های معمول فعالیت خود را مشخص کنید تا مشتریان بتوانند درخواست‌های مناسب‌تری برای شما ارسال کنند.",
      required: "ضروری",
      workingDays:
        "روزهای کاری",
      workingDaysSubtitle:
        "تمام روزهایی را که معمولاً کار می‌کنید انتخاب نمایید.",
      weekdayShort:
        (day: WeekdayId) =>
          weekdayNames.Dari[day][0],
      weekdayFull:
        (day: WeekdayId) =>
          weekdayNames.Dari[day][1],
      daysError:
        "حداقل یک روز کاری را انتخاب کنید.",
      workingHours:
        "ساعت کاری معمول",
      workingHoursSubtitle:
        "این زمان برای تمام روزهای انتخاب‌شده استفاده می‌شود.",
      startTime:
        "زمان شروع",
      endTime:
        "زمان پایان",
      startTimePickerTitle:
        "زمان شروع کار",
      startTimePickerSubtitle:
        "ساعتی را که معمولاً کار را آغاز می‌کنید انتخاب نمایید.",
      endTimePickerTitle:
        "زمان پایان کار",
      endTimePickerSubtitle:
        "ساعتی را که معمولاً کار را پایان می‌دهید انتخاب نمایید.",
      timeError:
        "زمان پایان باید بعد از زمان شروع باشد.",
      availabilitySettings:
        "تنظیمات دسترسی",
      availabilitySettingsSubtitle:
        "وضعیت فعلی و نوع درخواست‌هایی را که می‌پذیرید مشخص کنید.",
      urgentRequests:
        "پذیرش درخواست فوری",
      urgentRequestsSubtitle:
        "مشتریان می‌توانند برای خدمات فوری به شما درخواست بفرستند.",
      availableToday:
        "امروز آمادهٔ کار هستم",
      availableTodaySubtitle:
        "پروفایل شما برای درخواست‌های امروز فعال نمایش داده می‌شود.",
      summary:
        "خلاصهٔ برنامه",
      noDaysSelected:
        "هیچ روزی انتخاب نشده است",
      timeRange:
        (
          start: string,
          end: string,
        ) =>
          `از ${start} تا ${end}`,
      noticeTitle:
        "برنامهٔ واقعی خود را ثبت کنید",
      noticeText:
        "ساعت‌های دقیق از رزروهای هم‌زمان جلوگیری می‌کند. بعداً می‌توانید روزها و ساعت‌ها را در تنظیمات تغییر دهید.",
      continue:
        "ادامه به تأیید هویت",
      helperText:
        "بعداً می‌توانید برنامهٔ کاری خود را از تنظیمات تغییر دهید.",
      close: "بستن",
    };
  }

  if (language === "Pashto") {
    return {
      back: "بېرته",
      step:
        (
          current: string,
          total: string,
        ) =>
          `مرحله ${current} له ${total}`,
      eyebrow:
        "کاري مهال‌وېش",
      title:
        "په کومو وختونو کې کار ته چمتو یاست؟",
      subtitle:
        "خپلې عادي کاري ورځې او ساعتونه وټاکئ، څو پیرودونکي مناسبې غوښتنې درولېږي.",
      required: "اړین",
      workingDays:
        "کاري ورځې",
      workingDaysSubtitle:
        "ټولې هغه ورځې وټاکئ چې معمولاً کار کوئ.",
      weekdayShort:
        (day: WeekdayId) =>
          weekdayNames.Pashto[day][0],
      weekdayFull:
        (day: WeekdayId) =>
          weekdayNames.Pashto[day][1],
      daysError:
        "لږ تر لږه یوه کاري ورځ وټاکئ.",
      workingHours:
        "عادي کاري ساعتونه",
      workingHoursSubtitle:
        "دا وخت به د ټولو ټاکل شوو ورځو لپاره وکارول شي.",
      startTime:
        "د پیل وخت",
      endTime:
        "د پای وخت",
      startTimePickerTitle:
        "د کار د پیل وخت",
      startTimePickerSubtitle:
        "هغه ساعت وټاکئ چې معمولاً کار پیلوئ.",
      endTimePickerTitle:
        "د کار د پای وخت",
      endTimePickerSubtitle:
        "هغه ساعت وټاکئ چې معمولاً کار پای ته رسوئ.",
      timeError:
        "د پای وخت باید د پیل له وخت وروسته وي.",
      availabilitySettings:
        "د شتون تنظیمات",
      availabilitySettingsSubtitle:
        "خپل اوسنی حالت او د منلو وړ غوښتنې وټاکئ.",
      urgentRequests:
        "بیړنۍ غوښتنې منل",
      urgentRequestsSubtitle:
        "پیرودونکي کولی شي د بیړنیو خدمتونو غوښتنې درولېږي.",
      availableToday:
        "نن کار ته چمتو یم",
      availableTodaySubtitle:
        "ستاسو پروفایل به د نن ورځې غوښتنو لپاره فعال ښکاره شي.",
      summary:
        "د مهال‌وېش لنډیز",
      noDaysSelected:
        "هیڅ ورځ نه ده ټاکل شوې",
      timeRange:
        (
          start: string,
          end: string,
        ) =>
          `له ${start} تر ${end}`,
      noticeTitle:
        "خپل حقیقي مهال‌وېش ثبت کړئ",
      noticeText:
        "دقیق ساعتونه د هم‌مهاله رزرفونو مخه نیسي. وروسته ورځې او ساعتونه په تنظیماتو کې بدلولی شئ.",
      continue:
        "د هویت تایید ته دوام",
      helperText:
        "وروسته خپل کاري مهال‌وېش په تنظیماتو کې بدلولی شئ.",
      close: "تړل",
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
      "Work schedule",
    title:
      "When are you available to work?",
    subtitle:
      "Set your normal working days and hours so customers can send requests that match your availability.",
    required: "Required",
    workingDays:
      "Working days",
    workingDaysSubtitle:
      "Select every day you normally work.",
    weekdayShort:
      (day: WeekdayId) =>
        weekdayNames.English[day][0],
    weekdayFull:
      (day: WeekdayId) =>
        weekdayNames.English[day][1],
    daysError:
      "Select at least one working day.",
    workingHours:
      "Normal working hours",
    workingHoursSubtitle:
      "These hours apply to every selected day.",
    startTime:
      "Start time",
    endTime:
      "End time",
    startTimePickerTitle:
      "Work start time",
    startTimePickerSubtitle:
      "Choose the time you normally begin working.",
    endTimePickerTitle:
      "Work end time",
    endTimePickerSubtitle:
      "Choose the time you normally finish working.",
    timeError:
      "The end time must be later than the start time.",
    availabilitySettings:
      "Availability settings",
    availabilitySettingsSubtitle:
      "Set your current status and the request types you accept.",
    urgentRequests:
      "Accept urgent requests",
    urgentRequestsSubtitle:
      "Customers can send you requests for urgent services.",
    availableToday:
      "I am available today",
    availableTodaySubtitle:
      "Your profile will appear active for requests scheduled today.",
    summary:
      "Schedule summary",
    noDaysSelected:
      "No days selected",
    timeRange:
      (
        start: string,
        end: string,
      ) =>
        `${start} to ${end}`,
    noticeTitle:
      "Set a realistic schedule",
    noticeText:
      "Accurate hours prevent overlapping bookings. You can change your working days and hours later in settings.",
    continue:
      "Continue to verification",
    helperText:
      "You can change your work schedule later in settings.",
    close: "Close",
  };
}

const styles = StyleSheet.create({
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
    paddingBottom: 158,
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
  form: {
    width: "100%",
    marginTop: Spacing.section,
    gap: Spacing.section,
  },
  section: {
    width: "100%",
    gap: Spacing.md,
  },
  sectionHeader: {
    width: "100%",
    gap: Spacing.xs,
  },
  sectionTitleRow: {
    width: "100%",
    alignItems: "center",
    justifyContent:
      "space-between",
    gap: Spacing.md,
  },
  sectionTitle: {
    ...Typography.sectionTitle,
    flex: 1,
    color:
      KhedmatPalette.textPrimary,
    fontSize: 20,
    lineHeight: 27,
  },
  sectionSubtitle: {
    ...Typography.captionStyle,
    width: "100%",
    color:
      KhedmatPalette.textMuted,
    lineHeight: 18,
  },
  requiredLabel: {
    ...Typography.captionStyle,
    color:
      KhedmatPalette.blue500,
    fontFamily: Fonts.medium,
    fontSize: 10,
  },
  daysGrid: {
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  dayCard: {
    width: "31.6%",
    minHeight: 104,
    padding: Spacing.sm,
    alignItems: "center",
    justifyContent:
      "space-between",
    borderWidth: 1,
    borderColor:
      KhedmatPalette.border,
    borderRadius: Radius.lg,
    backgroundColor:
      KhedmatPalette.surface,
    ...Shadows.small,
  },
  dayCardSelected: {
    borderColor:
      KhedmatPalette.blue500,
    backgroundColor:
      KhedmatPalette.navy900,
  },
  dayCardPressed: {
    opacity: 0.86,
    transform: [
      {
        scale: 0.98,
      },
    ],
  },
  dayShort: {
    fontFamily: Fonts.bold,
    color:
      KhedmatPalette.blue500,
    fontSize: 21,
    lineHeight: 26,
  },
  dayShortSelected: {
    color:
      KhedmatPalette.white,
  },
  dayFull: {
    ...Typography.captionStyle,
    width: "100%",
    color:
      KhedmatPalette.textSecondary,
    textAlign: "center",
    fontSize: 10,
  },
  dayFullSelected: {
    color:
      "rgba(255,255,255,0.82)",
  },
  dayCheck: {
    width: 22,
    height: 22,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor:
      KhedmatPalette.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      KhedmatPalette.surfaceSoft,
  },
  dayCheckSelected: {
    borderColor:
      KhedmatPalette.blue500,
    backgroundColor:
      KhedmatPalette.blue500,
  },
  timeFields: {
    width: "100%",
    gap: Spacing.sm,
  },
  timeField: {
    width: "100%",
    minHeight: 72,
    paddingHorizontal:
      Spacing.md,
    justifyContent: "center",
    borderWidth: 1,
    borderColor:
      KhedmatPalette.border,
    borderRadius: Radius.lg,
    backgroundColor:
      KhedmatPalette.surface,
    ...Shadows.small,
  },
  timeFieldContent: {
    width: "100%",
    alignItems: "center",
    gap: Spacing.md,
  },
  timeFieldIcon: {
    width: 40,
    height: 40,
    flexShrink: 0,
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      KhedmatPalette.surfaceSoft,
  },
  timeFieldCopy: {
    flex: 1,
    gap: 2,
  },
  timeFieldLabel: {
    ...Typography.captionStyle,
    width: "100%",
    color:
      KhedmatPalette.textMuted,
    fontSize: 10,
  },
  timeFieldValue: {
    ...Typography.label,
    width: "100%",
    color:
      KhedmatPalette.textPrimary,
    fontSize: 16,
  },
  timeConnector: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  timeConnectorLine: {
    flex: 1,
    height:
      StyleSheet.hairlineWidth,
    backgroundColor:
      KhedmatPalette.border,
  },
  controlError: {
    borderColor: ERROR,
    backgroundColor:
      "#FFF9F8",
  },
  controlPressed: {
    opacity: 0.86,
  },
  errorRow: {
    width: "100%",
    alignItems: "center",
    gap: 5,
  },
  errorText: {
    ...Typography.captionStyle,
    flex: 1,
    color: ERROR,
    lineHeight: 18,
  },
  toggleCard: {
    width: "100%",
    minHeight: 104,
    borderWidth: 1,
    borderColor:
      KhedmatPalette.border,
    borderRadius: Radius.xl,
    backgroundColor:
      KhedmatPalette.surface,
    ...Shadows.small,
  },
  toggleCardSelected: {
    borderColor:
      KhedmatPalette.blue500,
    backgroundColor: "#F4FBFC",
  },
  toggleCardPressed: {
    opacity: 0.88,
    transform: [
      {
        scale: 0.993,
      },
    ],
  },
  toggleContent: {
    width: "100%",
    minHeight: 104,
    padding: Spacing.lg,
    alignItems: "center",
    gap: Spacing.md,
  },
  toggleIcon: {
    width: 48,
    height: 48,
    flexShrink: 0,
    borderRadius: Radius.lg,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      KhedmatPalette.surfaceSoft,
  },
  toggleIconSelected: {
    backgroundColor:
      KhedmatPalette.blue500,
  },
  toggleCopy: {
    flex: 1,
    gap: 3,
  },
  toggleTitle: {
    ...Typography.label,
    width: "100%",
    color:
      KhedmatPalette.textPrimary,
    fontSize: 16,
  },
  toggleTitleSelected: {
    color:
      KhedmatPalette.navy900,
    fontFamily: Fonts.bold,
  },
  toggleSubtitle: {
    ...Typography.captionStyle,
    width: "100%",
    color:
      KhedmatPalette.textSecondary,
    lineHeight: 18,
  },
  switchTrack: {
    width: 48,
    height: 29,
    flexShrink: 0,
    paddingHorizontal: 3,
    borderRadius: Radius.pill,
    justifyContent: "center",
    backgroundColor:
      KhedmatPalette.border,
  },
  switchTrackSelected: {
    backgroundColor:
      KhedmatPalette.blue500,
  },
  switchThumb: {
    width: 23,
    height: 23,
    borderRadius: Radius.pill,
    backgroundColor:
      KhedmatPalette.white,
    ...Shadows.small,
  },
  summaryCard: {
    width: "100%",
    minHeight: 112,
    padding: Spacing.lg,
    alignItems: "center",
    gap: Spacing.md,
    borderWidth: 1,
    borderColor:
      KhedmatPalette.blue200,
    borderRadius: Radius.xl,
    backgroundColor: "#F4FBFC",
  },
  summaryIcon: {
    width: 48,
    height: 48,
    flexShrink: 0,
    borderRadius: Radius.lg,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      KhedmatPalette.surface,
  },
  summaryCopy: {
    flex: 1,
    gap: Spacing.xs,
  },
  summaryLabel: {
    ...Typography.captionStyle,
    width: "100%",
    color:
      KhedmatPalette.blue500,
    fontFamily: Fonts.medium,
  },
  summaryTitle: {
    ...Typography.label,
    width: "100%",
    color:
      KhedmatPalette.textPrimary,
    fontSize: 16,
    lineHeight: 22,
  },
  summarySubtitle: {
    ...Typography.captionStyle,
    width: "100%",
    color:
      KhedmatPalette.textSecondary,
  },
  noticeCard: {
    width: "100%",
    minHeight: 108,
    marginTop: Spacing.section,
    padding: Spacing.lg,
    alignItems: "flex-start",
    gap: Spacing.md,
    borderWidth: 1,
    borderColor:
      KhedmatPalette.blue200,
    borderRadius: Radius.xl,
    backgroundColor: "#F4FBFC",
  },
  noticeIcon: {
    width: 46,
    height: 46,
    flexShrink: 0,
    borderRadius: Radius.lg,
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
  },
  helperText: {
    ...Typography.captionStyle,
    width: "100%",
    color:
      KhedmatPalette.textMuted,
    textAlign: "center",
  },
  modalBackdrop: {
    flex: 1,
    paddingHorizontal:
      Layout.screenPadding,
    justifyContent: "flex-end",
    backgroundColor:
      "rgba(0, 27, 72, 0.38)",
  },
  modalSheet: {
    width: "100%",
    maxWidth:
      Layout.contentMaxWidth,
    maxHeight: "82%",
    alignSelf: "center",
    marginBottom:
      Platform.OS === "ios"
        ? Spacing.lg
        : Spacing.md,
    padding: Spacing.lg,
    borderRadius: Radius.xxl,
    backgroundColor:
      KhedmatPalette.surface,
    ...Shadows.medium,
  },
  modalHeader: {
    width: "100%",
    alignItems: "flex-start",
    justifyContent:
      "space-between",
    gap: Spacing.md,
  },
  modalHeaderCopy: {
    flex: 1,
    gap: 3,
  },
  modalTitle: {
    ...Typography.sectionTitle,
    width: "100%",
    color:
      KhedmatPalette.textPrimary,
    fontSize: 21,
  },
  modalSubtitle: {
    ...Typography.captionStyle,
    width: "100%",
    color:
      KhedmatPalette.textSecondary,
    lineHeight: 18,
  },
  modalCloseButton: {
    width: 40,
    height: 40,
    flexShrink: 0,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      KhedmatPalette.surfaceSoft,
  },
  timeOptionsScroll: {
    marginTop: Spacing.lg,
  },
  timeOptions: {
    gap: Spacing.sm,
    paddingBottom: Spacing.sm,
  },
  timeOption: {
    width: "100%",
    minHeight: 62,
    borderWidth: 1,
    borderColor:
      KhedmatPalette.border,
    borderRadius: Radius.lg,
    backgroundColor:
      KhedmatPalette.surface,
  },
  timeOptionSelected: {
    borderColor:
      KhedmatPalette.blue500,
    backgroundColor: "#F4FBFC",
  },
  timeOptionContent: {
    width: "100%",
    minHeight: 62,
    paddingHorizontal:
      Spacing.md,
    alignItems: "center",
    gap: Spacing.md,
  },
  timeOptionIcon: {
    width: 38,
    height: 38,
    flexShrink: 0,
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      KhedmatPalette.surfaceSoft,
  },
  timeOptionIconSelected: {
    backgroundColor:
      KhedmatPalette.blue500,
  },
  timeOptionText: {
    ...Typography.label,
    flex: 1,
    color:
      KhedmatPalette.textPrimary,
    fontSize: 15,
  },
  timeOptionTextSelected: {
    color:
      KhedmatPalette.navy900,
    fontFamily: Fonts.bold,
  },
  radioOuter: {
    width: 24,
    height: 24,
    flexShrink: 0,
    borderRadius: Radius.pill,
    borderWidth: 1.5,
    borderColor:
      KhedmatPalette.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      KhedmatPalette.surface,
  },
  radioOuterSelected: {
    borderColor:
      KhedmatPalette.blue500,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: Radius.pill,
    backgroundColor:
      KhedmatPalette.blue500,
  },
  pressed: {
    opacity: 0.76,
    transform: [
      {
        scale: 0.97,
      },
    ],
  },
});
