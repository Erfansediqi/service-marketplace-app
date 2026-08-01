import { Ionicons } from "@expo/vector-icons";
import {
    useLocalSearchParams,
    useRouter,
} from "expo-router";
import { useMemo, useState } from "react";
import {
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";

import { GlassButton } from "../components/glass/glass-button";
import { GlassIconButton } from "../components/glass/glass-icon-button";
import {
    GlassSelect,
    GlassSelectOption,
} from "../components/glass/glass-select";
import { GlassSurface } from "../components/glass/glass-surface";
import { AppScreen } from "../components/layout/app-screen";
import {
    Colors,
    Layout,
    Radius,
    Shadows,
    Spacing,
    Typography,
} from "../constants/theme";

type WeekdayId =
  | "saturday"
  | "sunday"
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday";

type WeekdayOption = {
  id: WeekdayId;
  shortLabel: string;
  fullLabel: string;
};

const weekdays: WeekdayOption[] = [
  {
    id: "saturday",
    shortLabel: "ش",
    fullLabel: "شنبه",
  },
  {
    id: "sunday",
    shortLabel: "ی",
    fullLabel: "یک‌شنبه",
  },
  {
    id: "monday",
    shortLabel: "د",
    fullLabel: "دوشنبه",
  },
  {
    id: "tuesday",
    shortLabel: "س",
    fullLabel: "سه‌شنبه",
  },
  {
    id: "wednesday",
    shortLabel: "چ",
    fullLabel: "چهارشنبه",
  },
  {
    id: "thursday",
    shortLabel: "پ",
    fullLabel: "پنج‌شنبه",
  },
  {
    id: "friday",
    shortLabel: "ج",
    fullLabel: "جمعه",
  },
];

const startTimeOptions: GlassSelectOption[] = [
  { id: "06:00", label: "۶:۰۰ صبح" },
  { id: "07:00", label: "۷:۰۰ صبح" },
  { id: "08:00", label: "۸:۰۰ صبح" },
  { id: "09:00", label: "۹:۰۰ صبح" },
  { id: "10:00", label: "۱۰:۰۰ صبح" },
  { id: "11:00", label: "۱۱:۰۰ صبح" },
  { id: "12:00", label: "۱۲:۰۰ ظهر" },
  { id: "13:00", label: "۱:۰۰ بعد از ظهر" },
  { id: "14:00", label: "۲:۰۰ بعد از ظهر" },
  { id: "15:00", label: "۳:۰۰ بعد از ظهر" },
  { id: "16:00", label: "۴:۰۰ بعد از ظهر" },
  { id: "17:00", label: "۵:۰۰ بعد از ظهر" },
];

const endTimeOptions: GlassSelectOption[] = [
  { id: "12:00", label: "۱۲:۰۰ ظهر" },
  { id: "13:00", label: "۱:۰۰ بعد از ظهر" },
  { id: "14:00", label: "۲:۰۰ بعد از ظهر" },
  { id: "15:00", label: "۳:۰۰ بعد از ظهر" },
  { id: "16:00", label: "۴:۰۰ بعد از ظهر" },
  { id: "17:00", label: "۵:۰۰ بعد از ظهر" },
  { id: "18:00", label: "۶:۰۰ عصر" },
  { id: "19:00", label: "۷:۰۰ عصر" },
  { id: "20:00", label: "۸:۰۰ شب" },
  { id: "21:00", label: "۹:۰۰ شب" },
  { id: "22:00", label: "۱۰:۰۰ شب" },
];

export default function ProviderAvailabilityScreen() {
  const router = useRouter();

  const params = useLocalSearchParams<{
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

  const categoryId = getSingleParam(params.category);
  const servicesParam = getSingleParam(params.services);
  const experienceId = getSingleParam(params.experience);
  const businessName = getSingleParam(params.businessName);
  const description = getSingleParam(params.description);
  const provinceId = getSingleParam(params.province);
  const provinceName = getSingleParam(params.provinceName);
  const districtId = getSingleParam(params.district);
  const districtName = getSingleParam(params.districtName);
  const radiusId = getSingleParam(params.radius);
  const serviceModes = getSingleParam(params.serviceModes);

  const [selectedDays, setSelectedDays] = useState<WeekdayId[]>([
    "saturday",
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
  ]);

  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("17:00");
  const [acceptsUrgentRequests, setAcceptsUrgentRequests] =
    useState(false);
  const [availableToday, setAvailableToday] = useState(true);
  const [submitted, setSubmitted] = useState(false);

  const selectedDayLabels = useMemo(
    () =>
      weekdays
        .filter((day) => selectedDays.includes(day.id))
        .map((day) => day.fullLabel),
    [selectedDays],
  );

  const daysError =
    submitted && selectedDays.length === 0
      ? "حداقل یک روز کاری را انتخاب کنید."
      : undefined;

  const timeError =
    submitted && startTime >= endTime
      ? "زمان پایان باید بعد از زمان شروع باشد."
      : undefined;

  const formIsValid =
    selectedDays.length > 0 &&
    Boolean(startTime) &&
    Boolean(endTime) &&
    startTime < endTime;

  const toggleDay = (dayId: WeekdayId) => {
    setSelectedDays((current) => {
      if (current.includes(dayId)) {
        return current.filter((id) => id !== dayId);
      }

      return [...current, dayId];
    });

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
      pathname: "/provider-verification",
      params: {
        category: categoryId,
        services: servicesParam,
        experience: experienceId,
        businessName,
        description,
        province: provinceId,
        provinceName,
        district: districtId,
        districtName,
        radius: radiusId,
        serviceModes,
        workingDays: selectedDays.join(","),
        startTime,
        endTime,
        urgentRequests: acceptsUrgentRequests ? "true" : "false",
        availableToday: availableToday ? "true" : "false",
      },
    } as never);
  };

  return (
    <AppScreen
      scrollable
      contentStyle={styles.screenContent}
      footer={
        <View style={styles.footer}>
          <GlassButton
            label="ادامه"
            icon="arrow-back"
            iconPosition="left"
            onPress={handleContinue}
          />

          <Text style={styles.helperText}>
            بعداً می‌توانید برنامهٔ کاری خود را از تنظیمات تغییر دهید.
          </Text>
        </View>
      }
    >
      <View style={styles.topBar}>
        <GlassIconButton
          icon="chevron-back"
          accessibilityLabel="بازگشت"
          onPress={() => router.back()}
        />

        <Text style={styles.stepText}>
          مرحله ۵ از ۶
        </Text>
      </View>

      <View style={styles.header}>
        <GlassSurface
          variant="prominent"
          radius={Radius.xxl}
          style={styles.headerIcon}
          contentStyle={styles.headerIconContent}
        >
          <Ionicons
            name="calendar-outline"
            size={32}
            color={Colors.primary}
          />
        </GlassSurface>

        <View style={styles.headerCopy}>
          <Text style={styles.eyebrow}>
            برنامهٔ کاری
          </Text>

          <Text style={styles.title}>
            چه زمان‌هایی آمادهٔ کار هستید؟
          </Text>

          <Text style={styles.subtitle}>
            روزها و ساعت‌های معمول فعالیت خود را مشخص کنید تا مشتریان
            بتوانند درخواست‌های مناسب‌تری برای شما ارسال کنند.
          </Text>
        </View>
      </View>

      <View style={styles.form}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              روزهای کاری
            </Text>

            <Text style={styles.sectionSubtitle}>
              تمام روزهایی را که معمولاً کار می‌کنید انتخاب نمایید.
            </Text>
          </View>

          <View style={styles.daysGrid}>
            {weekdays.map((day) => {
              const selected = selectedDays.includes(day.id);

              return (
                <Pressable
                  key={day.id}
                  accessibilityRole="checkbox"
                  accessibilityLabel={day.fullLabel}
                  accessibilityState={{ checked: selected }}
                  onPress={() => toggleDay(day.id)}
                  style={({ pressed }) => [
                    styles.dayPressable,
                    pressed && styles.dayPressed,
                  ]}
                >
                  <GlassSurface
                    variant={selected ? "prominent" : "regular"}
                    radius={Radius.lg}
                    style={[
                      styles.daySurface,
                      selected && styles.selectedDaySurface,
                      selected && Shadows.small,
                    ]}
                    contentStyle={styles.dayContent}
                  >
                    <Text
                      style={[
                        styles.dayShortLabel,
                        selected && styles.selectedDayShortLabel,
                      ]}
                    >
                      {day.shortLabel}
                    </Text>

                    <Text
                      numberOfLines={1}
                      style={[
                        styles.dayFullLabel,
                        selected && styles.selectedDayFullLabel,
                      ]}
                    >
                      {day.fullLabel}
                    </Text>

                    <View
                      style={[
                        styles.dayCheck,
                        selected && styles.dayCheckSelected,
                      ]}
                    >
                      {selected ? (
                        <Ionicons
                          name="checkmark"
                          size={13}
                          color={Colors.white}
                        />
                      ) : null}
                    </View>
                  </GlassSurface>
                </Pressable>
              );
            })}
          </View>

          {daysError ? (
            <Text style={styles.errorText}>
              {daysError}
            </Text>
          ) : null}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              ساعت کاری معمول
            </Text>

            <Text style={styles.sectionSubtitle}>
              این زمان برای تمام روزهای انتخاب‌شده استفاده می‌شود.
            </Text>
          </View>

          <View style={styles.timeRow}>
            <GlassSelect
              label="زمان شروع"
              placeholder="انتخاب زمان"
              title="زمان شروع کار"
              subtitle="ساعتی را که معمولاً کار را آغاز می‌کنید انتخاب نمایید."
              options={startTimeOptions}
              value={startTime}
              onChange={(value) => {
                setStartTime(value);

                if (submitted) {
                  setSubmitted(false);
                }
              }}
              searchable={false}
              containerStyle={styles.timeField}
            />

            <GlassSelect
              label="زمان پایان"
              placeholder="انتخاب زمان"
              title="زمان پایان کار"
              subtitle="ساعتی را که معمولاً کار را پایان می‌دهید انتخاب نمایید."
              options={endTimeOptions}
              value={endTime}
              onChange={(value) => {
                setEndTime(value);

                if (submitted) {
                  setSubmitted(false);
                }
              }}
              searchable={false}
              containerStyle={styles.timeField}
              error={timeError}
            />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              تنظیمات دسترسی
            </Text>

            <Text style={styles.sectionSubtitle}>
              وضعیت فعلی و نوع درخواست‌هایی را که می‌پذیرید مشخص کنید.
            </Text>
          </View>

          <AvailabilityToggleCard
            icon="flash-outline"
            title="پذیرش درخواست فوری"
            subtitle="مشتریان می‌توانند برای خدمات فوری با شما تماس بگیرند."
            selected={acceptsUrgentRequests}
            onPress={() =>
              setAcceptsUrgentRequests((current) => !current)
            }
          />

          <AvailabilityToggleCard
            icon="checkmark-circle-outline"
            title="امروز آمادهٔ کار هستم"
            subtitle="پروفایل شما برای درخواست‌های امروز فعال نمایش داده می‌شود."
            selected={availableToday}
            onPress={() =>
              setAvailableToday((current) => !current)
            }
          />
        </View>

        <GlassSurface
          variant="regular"
          radius={Radius.xl}
          style={styles.summaryCard}
          contentStyle={styles.summaryContent}
        >
          <View style={styles.summaryIcon}>
            <Ionicons
              name="time-outline"
              size={23}
              color={Colors.primary}
            />
          </View>

          <View style={styles.summaryCopy}>
            <Text style={styles.summaryLabel}>
              خلاصهٔ برنامه
            </Text>

            <Text style={styles.summaryTitle}>
              {selectedDayLabels.length > 0
                ? selectedDayLabels.join("، ")
                : "هیچ روزی انتخاب نشده است"}
            </Text>

            <Text style={styles.summarySubtitle}>
              از {formatTimeForDari(startTime)} تا{" "}
              {formatTimeForDari(endTime)}
            </Text>
          </View>
        </GlassSurface>
      </View>
    </AppScreen>
  );
}

type AvailabilityToggleCardProps = {
  icon:
    | "flash-outline"
    | "checkmark-circle-outline";
  title: string;
  subtitle: string;
  selected: boolean;
  onPress: () => void;
};

function AvailabilityToggleCard({
  icon,
  title,
  subtitle,
  selected,
  onPress,
}: AvailabilityToggleCardProps) {
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityLabel={title}
      accessibilityState={{ checked: selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.togglePressable,
        pressed && styles.togglePressed,
      ]}
    >
      <GlassSurface
        variant={selected ? "prominent" : "regular"}
        radius={Radius.xl}
        style={[
          styles.toggleSurface,
          selected && styles.selectedToggleSurface,
        ]}
        contentStyle={styles.toggleContent}
      >
        <View
          style={[
            styles.toggleIcon,
            selected && styles.selectedToggleIcon,
          ]}
        >
          <Ionicons
            name={icon}
            size={23}
            color={
              selected
                ? Colors.white
                : Colors.textSecondary
            }
          />
        </View>

        <View style={styles.toggleCopy}>
          <Text
            style={[
              styles.toggleTitle,
              selected && styles.selectedToggleTitle,
            ]}
          >
            {title}
          </Text>

          <Text style={styles.toggleSubtitle}>
            {subtitle}
          </Text>
        </View>

        <View
          style={[
            styles.switchTrack,
            selected && styles.switchTrackSelected,
          ]}
        >
          <View
            style={[
              styles.switchThumb,
              selected && styles.switchThumbSelected,
            ]}
          />
        </View>
      </GlassSurface>
    </Pressable>
  );
}

function getSingleParam(
  value: string | string[] | undefined,
): string {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
}

function formatTimeForDari(value: string): string {
  const option = [...startTimeOptions, ...endTimeOptions].find(
    (item) => item.id === value,
  );

  return option?.label ?? value;
}

const styles = StyleSheet.create({
  screenContent: {
    paddingTop: Spacing.md,
    paddingBottom: Spacing.screen,
  },

  topBar: {
    minHeight: Layout.minimumTouchTarget,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  stepText: {
    ...Typography.captionStyle,
    color: Colors.textTertiary,
    textAlign: "right",
    writingDirection: "rtl",
  },

  header: {
    marginTop: Spacing.xl,
    alignItems: "flex-end",
    gap: Spacing.xl,
  },

  headerIcon: {
    width: 70,
    height: 70,
    alignSelf: "flex-end",
    backgroundColor: "rgba(76, 141, 255, 0.10)",
    borderColor: "rgba(100, 158, 255, 0.28)",
  },

  headerIconContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  headerCopy: {
    width: "100%",
    alignItems: "flex-end",
    gap: Spacing.sm,
  },

  eyebrow: {
    ...Typography.captionStyle,
    width: "100%",
    color: Colors.primary,
    textAlign: "right",
    writingDirection: "rtl",
  },

  title: {
    ...Typography.screenTitle,
    width: "100%",
    color: Colors.textPrimary,
    textAlign: "right",
    writingDirection: "rtl",
    fontSize: 28,
    lineHeight: 35,
  },

  subtitle: {
    ...Typography.bodyLarge,
    width: "100%",
    maxWidth: 450,
    color: Colors.textSecondary,
    textAlign: "right",
    writingDirection: "rtl",
    lineHeight: 24,
  },

  form: {
    width: "100%",
    marginTop: Spacing.xxl,
    gap: Spacing.xxl,
  },

  section: {
    width: "100%",
    gap: Spacing.md,
  },

  sectionHeader: {
    width: "100%",
    alignItems: "flex-end",
    gap: Spacing.xs,
  },

  sectionTitle: {
    ...Typography.sectionTitle,
    width: "100%",
    color: Colors.textPrimary,
    textAlign: "right",
    writingDirection: "rtl",
    fontSize: 20,
    lineHeight: 27,
  },

  sectionSubtitle: {
    ...Typography.captionStyle,
    width: "100%",
    color: Colors.textTertiary,
    textAlign: "right",
    writingDirection: "rtl",
  },

  daysGrid: {
    width: "100%",
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },

  dayPressable: {
    width: "31.5%",
    minWidth: 96,
    borderRadius: Radius.lg,
  },

  dayPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.985 }],
  },

  daySurface: {
    width: "100%",
  },

  selectedDaySurface: {
    borderColor: "rgba(76, 141, 255, 0.58)",
    backgroundColor: "rgba(76, 141, 255, 0.11)",
  },

  dayContent: {
    minHeight: 98,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    padding: Spacing.md,
  },

  dayShortLabel: {
    color: Colors.textPrimary,
    fontSize: 22,
    lineHeight: 28,
    fontWeight: "700",
    textAlign: "center",
    writingDirection: "rtl",
  },

  selectedDayShortLabel: {
    color: "#DCE9FF",
  },

  dayFullLabel: {
    ...Typography.captionStyle,
    color: Colors.textSecondary,
    textAlign: "center",
    writingDirection: "rtl",
  },

  selectedDayFullLabel: {
    color: Colors.textPrimary,
  },

  dayCheck: {
    position: "absolute",
    top: 8,
    left: 8,
    width: 20,
    height: 20,
    borderRadius: Radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.borderStrong,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.glass,
  },

  dayCheckSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary,
  },

  timeRow: {
    width: "100%",
    flexDirection: "row-reverse",
    alignItems: "flex-start",
    gap: Spacing.md,
  },

  timeField: {
    flex: 1,
  },

  errorText: {
    ...Typography.captionStyle,
    color: Colors.error,
    textAlign: "right",
    writingDirection: "rtl",
  },

  togglePressable: {
    width: "100%",
    borderRadius: Radius.xl,
  },

  togglePressed: {
    opacity: 0.9,
    transform: [{ scale: 0.993 }],
  },

  toggleSurface: {
    width: "100%",
  },

  selectedToggleSurface: {
    borderColor: "rgba(76, 141, 255, 0.50)",
    backgroundColor: "rgba(76, 141, 255, 0.09)",
  },

  toggleContent: {
    minHeight: 92,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: Spacing.md,
    padding: Spacing.lg,
  },

  toggleIcon: {
    width: 48,
    height: 48,
    flexShrink: 0,
    borderRadius: Radius.lg,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.glass,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
  },

  selectedToggleIcon: {
    backgroundColor: Colors.primary,
    borderColor: "rgba(255, 255, 255, 0.24)",
  },

  toggleCopy: {
    flex: 1,
    alignItems: "flex-end",
    gap: Spacing.xs,
  },

  toggleTitle: {
    ...Typography.label,
    width: "100%",
    color: Colors.textPrimary,
    textAlign: "right",
    writingDirection: "rtl",
    fontSize: 17,
    lineHeight: 23,
  },

  selectedToggleTitle: {
    color: "#DCE9FF",
  },

  toggleSubtitle: {
    ...Typography.captionStyle,
    width: "100%",
    color: Colors.textSecondary,
    textAlign: "right",
    writingDirection: "rtl",
    lineHeight: 19,
  },

  switchTrack: {
    width: 48,
    height: 28,
    flexShrink: 0,
    borderRadius: Radius.pill,
    justifyContent: "center",
    paddingHorizontal: 3,
    backgroundColor: Colors.glassStrong,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.borderStrong,
  },

  switchTrackSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },

  switchThumb: {
    width: 22,
    height: 22,
    borderRadius: Radius.pill,
    backgroundColor: Colors.textTertiary,
    transform: [{ translateX: 0 }],
  },

  switchThumbSelected: {
    alignSelf: "flex-end",
    backgroundColor: Colors.white,
  },

  summaryCard: {
    width: "100%",
  },

  summaryContent: {
    minHeight: 100,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: Spacing.md,
    padding: Spacing.lg,
  },

  summaryIcon: {
    width: 48,
    height: 48,
    flexShrink: 0,
    borderRadius: Radius.lg,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primarySoft,
  },

  summaryCopy: {
    flex: 1,
    alignItems: "flex-end",
    gap: Spacing.xs,
  },

  summaryLabel: {
    ...Typography.captionStyle,
    width: "100%",
    color: Colors.primary,
    textAlign: "right",
    writingDirection: "rtl",
  },

  summaryTitle: {
    ...Typography.label,
    width: "100%",
    color: Colors.textPrimary,
    textAlign: "right",
    writingDirection: "rtl",
    fontSize: 16,
    lineHeight: 23,
  },

  summarySubtitle: {
    ...Typography.captionStyle,
    width: "100%",
    color: Colors.textTertiary,
    textAlign: "right",
    writingDirection: "rtl",
  },

  footer: {
    width: "100%",
    alignItems: "center",
    gap: Spacing.sm,
  },

  helperText: {
    ...Typography.captionStyle,
    maxWidth: 350,
    color: Colors.textTertiary,
    textAlign: "center",
    writingDirection: "rtl",
  },
});