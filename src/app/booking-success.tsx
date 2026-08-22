import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ComponentProps, useMemo } from "react";
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

type IconName = ComponentProps<typeof Ionicons>["name"];

type LanguageName = "English" | "Dari" | "Pashto";

const SUCCESS = "#268A57";
const SUCCESS_SOFT = "#E8F6EE";
const WARNING = "#8A5A00";
const WARNING_SOFT = "#FFF4D6";

export default function BookingSuccessScreen() {
  const router = useRouter();

  const params = useLocalSearchParams<{
    bookingId?: string | string[];
  }>();

  const { bookingDraft, getBookingById, resetBookingDraft } = useBooking();

  const { language } = useLanguage();

  const activeLanguage = normalizeLanguage(language);

  const isRtl = activeLanguage === "Dari" || activeLanguage === "Pashto";

  const copy = getSuccessCopy(activeLanguage);

  const bookingId = getSingleParam(params.bookingId);

  const savedBooking = useMemo(
    () => (bookingId ? getBookingById(bookingId) : undefined),
    [bookingId, getBookingById],
  );

  const providerName =
    savedBooking?.providerName ||
    bookingDraft.providerName ||
    copy.providerFallback;

  const providerProfession =
    savedBooking?.providerProfession ||
    bookingDraft.providerProfession ||
    copy.professionFallback;

  const serviceName =
    savedBooking?.serviceName ||
    bookingDraft.serviceName ||
    copy.serviceFallback;

  const bookingDate = savedBooking?.date || bookingDraft.date;

  const bookingTime = savedBooking?.time || bookingDraft.time;

  const address = savedBooking?.address || bookingDraft.address;

  const total = savedBooking?.total ?? bookingDraft.estimatedPrice ?? 0;

  const createdAt = savedBooking?.createdAt ?? new Date().toISOString();

  const displayReference = formatBookingReference(bookingId);

  const handleViewBooking = () => {
    resetBookingDraft();

    if (!bookingId) {
      router.replace("/(tabs)/bookings");
      return;
    }

    router.replace({
      pathname: "/booking-record-details",
      params: {
        bookingId,
      },
    } as never);
  };

  const handleGoHome = () => {
    resetBookingDraft();

    router.replace("/(tabs)");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.root}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.hero}>
            <View style={styles.successCircle}>
              <Ionicons
                name="checkmark"
                size={34}
                color={KhedmatPalette.white}
              />
            </View>

            <Text style={[styles.title, directionStyle(isRtl)]}>
              {copy.title}
            </Text>

            <Text style={[styles.subtitle, directionStyle(isRtl)]}>
              {copy.subtitle}
            </Text>
          </View>

          <View
            style={[
              styles.statusCard,
              {
                flexDirection: isRtl ? "row-reverse" : "row",
              },
            ]}
          >
            <View style={styles.statusIcon}>
              <Ionicons
                name="time-outline"
                size={20}
                color={KhedmatPalette.blue500}
              />
            </View>

            <View
              style={[
                styles.statusCopy,
                {
                  alignItems: isRtl ? "flex-end" : "flex-start",
                },
              ]}
            >
              <Text style={[styles.statusTitle, directionStyle(isRtl)]}>
                {copy.statusTitle}
              </Text>

              <Text style={[styles.statusSubtitle, directionStyle(isRtl)]}>
                {copy.statusSubtitle}
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, directionStyle(isRtl)]}>
              {copy.summaryTitle}
            </Text>

            <View style={styles.summaryCard}>
              <SummaryRow
                icon="person-outline"
                label={copy.provider}
                value={providerName}
                isRtl={isRtl}
              />

              <Divider />

              <SummaryRow
                icon="briefcase-outline"
                label={copy.service}
                value={serviceName}
                isRtl={isRtl}
              />

              <Divider />

              <SummaryRow
                icon="calendar-outline"
                label={copy.schedule}
                value={`${formatBookingDate(bookingDate, activeLanguage)} · ${formatTime(
                  bookingTime,
                  activeLanguage,
                )}`}
                isRtl={isRtl}
              />

              <Divider />

              <SummaryRow
                icon="location-outline"
                label={copy.address}
                value={address?.fullAddress || copy.addressFallback}
                isRtl={isRtl}
                multiline
              />

              <Divider />

              <SummaryRow
                icon="cash-outline"
                label={copy.estimatedTotal}
                value={formatCurrency(total, activeLanguage)}
                isRtl={isRtl}
              />
            </View>
          </View>

          {bookingId ? (
            <View
              style={[
                styles.referenceCard,
                {
                  flexDirection: isRtl ? "row-reverse" : "row",
                },
              ]}
            >
              <Ionicons
                name="receipt-outline"
                size={19}
                color={KhedmatPalette.blue500}
              />

              <View
                style={[
                  styles.referenceCopy,
                  {
                    alignItems: isRtl ? "flex-end" : "flex-start",
                  },
                ]}
              >
                <Text style={[styles.referenceLabel, directionStyle(isRtl)]}>
                  {copy.reference}
                </Text>

                <Text
                  selectable
                  numberOfLines={1}
                  style={[styles.referenceValue, directionStyle(false)]}
                >
                  {displayReference}
                </Text>

                <Text style={[styles.referenceCreated, directionStyle(isRtl)]}>
                  {copy.submittedAt(formatCreatedAt(createdAt, activeLanguage))}
                </Text>
              </View>
            </View>
          ) : null}
        </ScrollView>

        <View style={styles.footer}>
          <View style={styles.footerContent}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={copy.viewBooking}
              onPress={handleViewBooking}
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && styles.primaryButtonPressed,
              ]}
            >
              <View
                style={[
                  styles.buttonContent,
                  {
                    flexDirection: isRtl ? "row-reverse" : "row",
                  },
                ]}
              >
                <Ionicons
                  name="receipt-outline"
                  size={20}
                  color={KhedmatPalette.white}
                />

                <Text style={[styles.primaryButtonText, directionStyle(isRtl)]}>
                  {copy.viewBooking}
                </Text>

                <Ionicons
                  name={isRtl ? "arrow-back" : "arrow-forward"}
                  size={19}
                  color={KhedmatPalette.white}
                />
              </View>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={copy.goHome}
              onPress={handleGoHome}
              style={({ pressed }) => [
                styles.secondaryButton,
                pressed && styles.secondaryButtonPressed,
              ]}
            >
              <View
                style={[
                  styles.buttonContent,
                  {
                    flexDirection: isRtl ? "row-reverse" : "row",
                  },
                ]}
              >
                <Ionicons
                  name="home-outline"
                  size={18}
                  color={KhedmatPalette.navy700}
                />

                <Text
                  style={[styles.secondaryButtonText, directionStyle(isRtl)]}
                >
                  {copy.goHome}
                </Text>
              </View>
            </Pressable>


          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

function SummaryRow({
  icon,
  label,
  value,
  supportingText,
  isRtl,
  multiline = false,
}: {
  icon: IconName;
  label: string;
  value: string;
  supportingText?: string;
  isRtl: boolean;
  multiline?: boolean;
}) {
  return (
    <View
      style={[
        styles.summaryRow,
        {
          flexDirection: isRtl ? "row-reverse" : "row",
          alignItems: multiline ? "flex-start" : "center",
        },
      ]}
    >
      <View style={styles.summaryIcon}>
        <Ionicons name={icon} size={20} color={KhedmatPalette.blue500} />
      </View>

      <View
        style={[
          styles.summaryCopy,
          {
            alignItems: isRtl ? "flex-end" : "flex-start",
          },
        ]}
      >
        <Text style={[styles.summaryLabel, directionStyle(isRtl)]}>
          {label}
        </Text>

        <Text
          style={[
            styles.summaryValue,
            multiline && styles.summaryValueMultiline,
            directionStyle(isRtl),
          ]}
        >
          {value}
        </Text>

        {supportingText ? (
          <Text style={[styles.summarySupporting, directionStyle(isRtl)]}>
            {supportingText}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

function getSingleParam(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

function formatBookingReference(bookingId: string): string {
  if (!bookingId) {
    return "";
  }

  const compact = bookingId
    .replace(/^booking-/, "")
    .replace(/[^a-zA-Z0-9]/g, "")
    .toUpperCase();

  const visible = compact.slice(-12);

  return `KHD-${visible}`;
}

function formatCurrency(amount: number, language: LanguageName): string {
  const formatted = new Intl.NumberFormat("en-US").format(amount);

  if (language === "English") {
    return `${formatted} AFN`;
  }

  const localized = formatDigits(formatted, true);

  return language === "Dari" ? `${localized} افغانی` : `${localized} افغانۍ`;
}

function formatBookingDate(value: string, language: LanguageName): string {
  if (!value) {
    return language === "English"
      ? "Date unavailable"
      : language === "Dari"
        ? "تاریخ در دسترس نیست"
        : "نېټه شتون نه لري";
  }

  const date = parseLocalDate(value);

  if (!date) {
    return value;
  }

  const weekdays = {
    English: [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
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

  const months = {
    English: [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
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

  const day = formatDigits(date.getDate().toString(), language !== "English");

  const year = formatDigits(
    date.getFullYear().toString(),
    language !== "English",
  );

  if (language === "English") {
    return `${weekdays.English[date.getDay()]}, ${months.English[date.getMonth()]} ${day}, ${year}`;
  }

  return `${weekdays[language][date.getDay()]}، ${day} ${months[language][date.getMonth()]} ${year}`;
}

function formatCreatedAt(value: string, language: LanguageName): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const dateText = formatBookingDate(
    [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, "0"),
      String(date.getDate()).padStart(2, "0"),
    ].join("-"),
    language,
  );

  const timeText = formatTime(
    `${String(date.getHours()).padStart(2, "0")}:${String(
      date.getMinutes(),
    ).padStart(2, "0")}`,
    language,
  );

  return `${dateText} · ${timeText}`;
}

function parseLocalDate(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

  if (!match) {
    const parsed = new Date(value);

    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  const date = new Date(
    Number(match[1]),
    Number(match[2]) - 1,
    Number(match[3]),
  );

  return Number.isNaN(date.getTime()) ? null : date;
}

function formatTime(value: string, language: LanguageName): string {
  if (!value) {
    return language === "English"
      ? "Time unavailable"
      : language === "Dari"
        ? "زمان در دسترس نیست"
        : "وخت شتون نه لري";
  }

  const [hourText, minute = "00"] = value.split(":");

  const hour = Number(hourText);

  if (!Number.isFinite(hour)) {
    return value;
  }

  if (language === "English") {
    const period = hour >= 12 ? "PM" : "AM";

    const displayHour = hour % 12 || 12;

    return `${displayHour}:${minute} ${period}`;
  }

  const displayHour = hour % 12 || 12;

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

  return `${formatDigits(`${displayHour}:${minute}`, true)} ${period}`;
}

function normalizeLanguage(language: string): LanguageName {
  if (language === "Dari") {
    return "Dari";
  }

  if (language === "Pashto") {
    return "Pashto";
  }

  return "English";
}

function directionStyle(isRtl: boolean) {
  return {
    textAlign: isRtl ? ("right" as const) : ("left" as const),
    writingDirection: isRtl ? ("rtl" as const) : ("ltr" as const),
  };
}

function formatDigits(value: string, localized: boolean): string {
  if (!localized) {
    return value;
  }

  const digits: Record<string, string> = {
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

  return value.replace(/\d/g, (digit) => digits[digit] ?? digit);
}

function getSuccessCopy(language: LanguageName) {
  if (language === "Dari") {
    return {
      title: "رزرو ارسال شد",
      subtitle:
        "درخواست شما برای ارائه‌دهنده ارسال شد. پس از پاسخ، به شما اطلاع داده می‌شود.",
      statusTitle: "در انتظار پاسخ",
      statusSubtitle:
        "ارائه‌دهنده می‌تواند درخواست را بپذیرد یا رد کند.",
      summaryTitle: "خلاصهٔ رزرو",
      provider: "ارائه‌دهنده",
      providerFallback: "ارائه‌دهنده",
      professionFallback: "متخصص خدمات",
      service: "خدمت",
      serviceFallback: "خدمت انتخاب‌شده",
      schedule: "زمان‌بندی",
      address: "آدرس",
      addressFallback: "آدرس ثبت نشده",
      estimatedTotal: "مبلغ تخمینی",
      reference: "شمارهٔ پیگیری",
      submittedAt: (value: string) => `ثبت‌شده در ${value}`,
      viewBooking: "مشاهدهٔ رزرو",
      goHome: "خانه",
    };
  }

  if (language === "Pashto") {
    return {
      title: "رزرف ولېږل شو",
      subtitle:
        "ستاسو غوښتنه خدمت وړاندې کوونکي ته ولېږل شوه. د ځواب وروسته به خبر درکړل شي.",
      statusTitle: "د ځواب په تمه",
      statusSubtitle:
        "خدمت وړاندې کوونکی غوښتنه منلای یا ردولای شي.",
      summaryTitle: "د رزرف لنډیز",
      provider: "خدمت وړاندې کوونکی",
      providerFallback: "خدمت وړاندې کوونکی",
      professionFallback: "د خدمت متخصص",
      service: "خدمت",
      serviceFallback: "ټاکل شوی خدمت",
      schedule: "وخت",
      address: "پته",
      addressFallback: "پته نه ده ثبت شوې",
      estimatedTotal: "اټکلی مبلغ",
      reference: "د تعقیب شمېره",
      submittedAt: (value: string) => `په ${value} ثبت شوی`,
      viewBooking: "رزرف وګورئ",
      goHome: "کور",
    };
  }

  return {
    title: "Booking sent",
    subtitle:
      "Your request was sent to the provider. We’ll notify you when they respond.",
    statusTitle: "Waiting for response",
    statusSubtitle:
      "The provider can accept or decline your request.",
    summaryTitle: "Booking summary",
    provider: "Provider",
    providerFallback: "Provider",
    professionFallback: "Service professional",
    service: "Service",
    serviceFallback: "Selected service",
    schedule: "Schedule",
    address: "Address",
    addressFallback: "No address recorded",
    estimatedTotal: "Estimated amount",
    reference: "Reference",
    submittedAt: (value: string) => `Submitted ${value}`,
    viewBooking: "View booking",
    goHome: "Home",
  };
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: KhedmatPalette.white,
  },
  root: {
    flex: 1,
  },
  scrollContent: {
    width: "100%",
    maxWidth: Layout.contentMaxWidth,
    alignSelf: "center",
    paddingHorizontal: Layout.screenPadding,
    paddingTop: Spacing.xl,
    paddingBottom: 190,
  },
  hero: {
    width: "100%",
    alignItems: "center",
    gap: Spacing.md,
  },
  successIllustration: {
    width: 132,
    height: 132,
    alignItems: "center",
    justifyContent: "center",
  },
  successHalo: {
    position: "absolute",
    width: 124,
    height: 124,
    borderRadius: Radius.pill,
    backgroundColor: "#DFF3E8",
  },
  successCircle: {
    width: 64,
    height: 64,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: SUCCESS,
  },
  sparkleTop: {
    position: "absolute",
    top: 1,
    right: 8,
    width: 34,
    height: 34,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: KhedmatPalette.blue050,
    backgroundColor: KhedmatPalette.surface,
  },
  sparkleBottom: {
    position: "absolute",
    bottom: 1,
    left: 8,
    width: 34,
    height: 34,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: KhedmatPalette.blue050,
    backgroundColor: KhedmatPalette.blue500,
  },
  heroCopy: {
    width: "100%",
    alignItems: "center",
    gap: Spacing.sm,
  },
  eyebrow: {
    ...Typography.captionStyle,
    width: "100%",
    color: SUCCESS,
    fontFamily: Fonts.medium,
    textAlign: "center",
  },
  title: {
    ...Typography.screenTitle,
    width: "100%",
    maxWidth: 470,
    color: KhedmatPalette.navy900,
    fontSize: 28,
    lineHeight: 35,
    textAlign: "center",
  },
  subtitle: {
    ...Typography.bodyLarge,
    width: "100%",
    maxWidth: 420,
    color: KhedmatPalette.textSecondary,
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
  },
  statusCard: {
    width: "100%",
    minHeight: 82,
    marginTop: Spacing.xl,
    padding: Spacing.md,
    alignItems: "center",
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: KhedmatPalette.border,
    borderRadius: Radius.xl,
    backgroundColor: KhedmatPalette.white,
  },
  statusIcon: {
    width: 40,
    height: 40,
    flexShrink: 0,
    borderRadius: Radius.lg,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: KhedmatPalette.surfaceSoft,
  },
  statusCopy: {
    flex: 1,
    gap: 3,
  },
  statusLabel: {
    ...Typography.captionStyle,
    width: "100%",
    color: WARNING,
    fontFamily: Fonts.medium,
  },
  statusTitle: {
    ...Typography.sectionTitle,
    width: "100%",
    color: KhedmatPalette.textPrimary,
    fontSize: 19,
    lineHeight: 26,
  },
  statusSubtitle: {
    ...Typography.captionStyle,
    width: "100%",
    color: KhedmatPalette.textSecondary,
    lineHeight: 19,
  },
  pendingBadge: {
    maxWidth: 88,
    flexShrink: 0,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: Radius.pill,
    backgroundColor: WARNING_SOFT,
  },
  pendingBadgeText: {
    ...Typography.captionStyle,
    color: WARNING,
    fontFamily: Fonts.medium,
    fontSize: 10,
    textAlign: "center",
  },
  section: {
    width: "100%",
    marginTop: Spacing.xl,
    gap: Spacing.md,
  },
  sectionHeader: {
    width: "100%",
    gap: Spacing.xs,
  },
  sectionTitle: {
    ...Typography.sectionTitle,
    width: "100%",
    color: KhedmatPalette.textPrimary,
    fontSize: 21,
    lineHeight: 28,
  },
  sectionSubtitle: {
    ...Typography.captionStyle,
    width: "100%",
    color: KhedmatPalette.textMuted,
    lineHeight: 19,
  },
  summaryCard: {
    width: "100%",
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: KhedmatPalette.border,
    borderRadius: Radius.xl,
    backgroundColor: KhedmatPalette.surface,
    ...Shadows.small,
  },
  summaryRow: {
    width: "100%",
    gap: Spacing.md,
  },
  summaryIcon: {
    width: 42,
    height: 42,
    flexShrink: 0,
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: KhedmatPalette.surfaceSoft,
  },
  summaryCopy: {
    flex: 1,
    gap: 2,
  },
  summaryLabel: {
    ...Typography.captionStyle,
    width: "100%",
    color: KhedmatPalette.textMuted,
  },
  summaryValue: {
    ...Typography.label,
    width: "100%",
    color: KhedmatPalette.textPrimary,
    fontSize: 15,
    lineHeight: 21,
  },
  summaryValueMultiline: {
    fontFamily: Fonts.regular,
    color: KhedmatPalette.textSecondary,
    fontSize: 14,
    lineHeight: 21,
  },
  summarySupporting: {
    ...Typography.captionStyle,
    width: "100%",
    color: KhedmatPalette.blue500,
    lineHeight: 17,
  },
  divider: {
    width: "100%",
    height: StyleSheet.hairlineWidth,
    marginVertical: Spacing.md,
    backgroundColor: KhedmatPalette.border,
  },
  referenceCard: {
    width: "100%",
    minHeight: 108,
    marginTop: Spacing.md,
    padding: Spacing.lg,
    alignItems: "center",
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: "#A9D9BD",
    borderRadius: Radius.xl,
    backgroundColor: "#F5FCF8",
  },
  referenceIcon: {
    width: 46,
    height: 46,
    flexShrink: 0,
    borderRadius: Radius.lg,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: KhedmatPalette.surface,
  },
  referenceCopy: {
    flex: 1,
    gap: 2,
  },
  referenceLabel: {
    ...Typography.captionStyle,
    width: "100%",
    color: SUCCESS,
    fontFamily: Fonts.medium,
  },
  referenceValue: {
    width: "100%",
    color: KhedmatPalette.navy900,
    fontFamily: Fonts.bold,
    fontSize: 16,
    letterSpacing: 0.5,
  },
  referenceCreated: {
    ...Typography.captionStyle,
    width: "100%",
    color: KhedmatPalette.textMuted,
    lineHeight: 17,
  },
  steps: {
    width: "100%",
  },
  stepWrapper: {
    width: "100%",
  },
  stepCard: {
    width: "100%",
    minHeight: 108,
    padding: Spacing.lg,
    alignItems: "center",
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: KhedmatPalette.border,
    borderRadius: Radius.xl,
    backgroundColor: KhedmatPalette.surface,
    ...Shadows.small,
  },
  stepIcon: {
    width: 48,
    height: 48,
    flexShrink: 0,
    borderRadius: Radius.lg,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: KhedmatPalette.surfaceSoft,
  },
  stepCopy: {
    flex: 1,
    gap: Spacing.xs,
  },
  stepTitle: {
    ...Typography.label,
    width: "100%",
    color: KhedmatPalette.textPrimary,
    fontSize: 17,
    lineHeight: 23,
  },
  stepSubtitle: {
    ...Typography.captionStyle,
    width: "100%",
    color: KhedmatPalette.textSecondary,
    lineHeight: 19,
  },
  stepNumber: {
    width: 32,
    height: 32,
    flexShrink: 0,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: KhedmatPalette.navy900,
  },
  stepNumberText: {
    color: KhedmatPalette.white,
    fontFamily: Fonts.bold,
    fontSize: 12,
  },
  connectorRow: {
    width: "100%",
    height: Spacing.md,
  },
  connectorSide: {
    width: 48,
  },
  connector: {
    width: 2,
    height: "100%",
    marginHorizontal: Spacing.lg,
    backgroundColor: KhedmatPalette.border,
  },
  connectorFill: {
    flex: 1,
  },
  notificationCard: {
    width: "100%",
    minHeight: 108,
    marginTop: Spacing.section,
    padding: Spacing.lg,
    alignItems: "flex-start",
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: KhedmatPalette.blue200,
    borderRadius: Radius.xl,
    backgroundColor: "#F4FBFC",
  },
  notificationIcon: {
    width: 46,
    height: 46,
    flexShrink: 0,
    borderRadius: Radius.lg,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: KhedmatPalette.surface,
  },
  notificationCopy: {
    flex: 1,
    gap: 3,
  },
  notificationTitle: {
    ...Typography.label,
    width: "100%",
    color: KhedmatPalette.textPrimary,
    fontSize: 15,
  },
  notificationText: {
    ...Typography.captionStyle,
    width: "100%",
    color: KhedmatPalette.textSecondary,
    lineHeight: 19,
  },
  paymentCard: {
    width: "100%",
    minHeight: 108,
    marginTop: Spacing.md,
    padding: Spacing.lg,
    alignItems: "flex-start",
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: "#A9D9BD",
    borderRadius: Radius.xl,
    backgroundColor: "#F5FCF8",
  },
  paymentIcon: {
    width: 46,
    height: 46,
    flexShrink: 0,
    borderRadius: Radius.lg,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: SUCCESS_SOFT,
  },
  paymentCopy: {
    flex: 1,
    gap: 3,
  },
  paymentTitle: {
    ...Typography.label,
    width: "100%",
    color: KhedmatPalette.textPrimary,
    fontSize: 15,
  },
  paymentText: {
    ...Typography.captionStyle,
    width: "100%",
    color: KhedmatPalette.textSecondary,
    lineHeight: 19,
  },
  footer: {
    position: "absolute",
    right: 0,
    bottom: 0,
    left: 0,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: KhedmatPalette.border,
    backgroundColor: KhedmatPalette.white,
  },
  footerContent: {
    width: "100%",
    maxWidth: Layout.contentMaxWidth,
    alignSelf: "center",
    paddingHorizontal: Layout.screenPadding,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  primaryButton: {
    width: "100%",
    minHeight: Layout.controlHeight,
    paddingHorizontal: Spacing.lg,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: Radius.lg,
    backgroundColor: KhedmatPalette.navy900,
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
  secondaryButton: {
    width: "100%",
    minHeight: 48,
    paddingHorizontal: Spacing.lg,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: KhedmatPalette.border,
    borderRadius: Radius.lg,
    backgroundColor: KhedmatPalette.surfaceSoft,
  },
  secondaryButtonPressed: {
    opacity: 0.78,
  },
  buttonContent: {
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
  },
  primaryButtonText: {
    ...Typography.label,
    color: KhedmatPalette.white,
    fontFamily: Fonts.medium,
    fontSize: 16,
    textAlign: "center",
  },
  secondaryButtonText: {
    ...Typography.label,
    color: KhedmatPalette.navy700,
    fontFamily: Fonts.medium,
    fontSize: 15,
    textAlign: "center",
  },
  footerHint: {
    ...Typography.captionStyle,
    width: "100%",
    color: KhedmatPalette.textMuted,
    textAlign: "center",
  },
});
