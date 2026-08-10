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

type ProcessStepId = "review" | "response" | "conversation" | "service";

type SuccessCopy = ReturnType<typeof getSuccessCopy>;

const SUCCESS = "#268A57";
const SUCCESS_SOFT = "#E8F6EE";
const WARNING = "#8A5A00";
const WARNING_SOFT = "#FFF4D6";

const PROCESS_STEPS: {
  id: ProcessStepId;
  icon: IconName;
}[] = [
  {
    id: "review",
    icon: "document-text-outline",
  },
  {
    id: "response",
    icon: "checkmark-circle-outline",
  },
  {
    id: "conversation",
    icon: "chatbubble-outline",
  },
  {
    id: "service",
    icon: "construct-outline",
  },
];

export default function BookingSuccessScreen() {
  const router = useRouter();

  const params = useLocalSearchParams<{
    bookingId?: string | string[];
  }>();

  const { bookingDraft, getBookingById, resetBookingDraft } = useBooking();

  const { language } = useLanguage();

  const activeLanguage = normalizeLanguage(language);

  const isRtl = activeLanguage === "Dari" || activeLanguage === "Pashto";

  const localizedDigits = activeLanguage !== "English";

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
            <View style={styles.successIllustration}>
              <View style={styles.successHalo} />

              <View style={styles.successCircle}>
                <Ionicons
                  name="checkmark"
                  size={44}
                  color={KhedmatPalette.white}
                />
              </View>

              <View style={styles.sparkleTop}>
                <Ionicons
                  name="sparkles"
                  size={17}
                  color={KhedmatPalette.blue500}
                />
              </View>

              <View style={styles.sparkleBottom}>
                <Ionicons
                  name="paper-plane"
                  size={15}
                  color={KhedmatPalette.white}
                />
              </View>
            </View>

            <View style={styles.heroCopy}>
              <Text style={[styles.eyebrow, directionStyle(isRtl)]}>
                {copy.eyebrow}
              </Text>

              <Text style={[styles.title, directionStyle(isRtl)]}>
                {copy.title}
              </Text>

              <Text style={[styles.subtitle, directionStyle(isRtl)]}>
                {copy.subtitle}
              </Text>
            </View>
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
              <Ionicons name="time-outline" size={24} color={WARNING} />
            </View>

            <View
              style={[
                styles.statusCopy,
                {
                  alignItems: isRtl ? "flex-end" : "flex-start",
                },
              ]}
            >
              <Text style={[styles.statusLabel, directionStyle(isRtl)]}>
                {copy.statusLabel}
              </Text>

              <Text style={[styles.statusTitle, directionStyle(isRtl)]}>
                {copy.statusTitle}
              </Text>

              <Text style={[styles.statusSubtitle, directionStyle(isRtl)]}>
                {copy.statusSubtitle}
              </Text>
            </View>

            <View style={styles.pendingBadge}>
              <Text style={[styles.pendingBadgeText, directionStyle(isRtl)]}>
                {copy.pending}
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
                supportingText={providerProfession}
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
                label={copy.date}
                value={formatBookingDate(bookingDate, activeLanguage)}
                isRtl={isRtl}
              />

              <Divider />

              <SummaryRow
                icon="time-outline"
                label={copy.time}
                value={formatTime(bookingTime, activeLanguage)}
                isRtl={isRtl}
              />

              <Divider />

              <SummaryRow
                icon="location-outline"
                label={address?.label || copy.address}
                value={address?.fullAddress || copy.addressFallback}
                isRtl={isRtl}
                multiline
              />

              <Divider />

              <SummaryRow
                icon="cash-outline"
                label={copy.estimatedTotal}
                value={formatCurrency(total, activeLanguage)}
                supportingText={copy.estimatedTotalHint}
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
              <View style={styles.referenceIcon}>
                <Ionicons
                  name="receipt-outline"
                  size={22}
                  color={KhedmatPalette.blue500}
                />
              </View>

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

              <Ionicons name="checkmark-circle" size={25} color={SUCCESS} />
            </View>
          ) : null}

          <View style={styles.section}>
            <View
              style={[
                styles.sectionHeader,
                {
                  alignItems: isRtl ? "flex-end" : "flex-start",
                },
              ]}
            >
              <Text style={[styles.sectionTitle, directionStyle(isRtl)]}>
                {copy.nextTitle}
              </Text>

              <Text style={[styles.sectionSubtitle, directionStyle(isRtl)]}>
                {copy.nextSubtitle}
              </Text>
            </View>

            <View style={styles.steps}>
              {PROCESS_STEPS.map((step, index) => (
                <ProcessStep
                  key={step.id}
                  stepId={step.id}
                  icon={step.icon}
                  number={formatDigits((index + 1).toString(), localizedDigits)}
                  isLast={index === PROCESS_STEPS.length - 1}
                  copy={copy}
                  isRtl={isRtl}
                />
              ))}
            </View>
          </View>

          <View
            style={[
              styles.notificationCard,
              {
                flexDirection: isRtl ? "row-reverse" : "row",
              },
            ]}
          >
            <View style={styles.notificationIcon}>
              <Ionicons
                name="notifications-outline"
                size={22}
                color={KhedmatPalette.blue500}
              />
            </View>

            <View
              style={[
                styles.notificationCopy,
                {
                  alignItems: isRtl ? "flex-end" : "flex-start",
                },
              ]}
            >
              <Text style={[styles.notificationTitle, directionStyle(isRtl)]}>
                {copy.notificationsTitle}
              </Text>

              <Text style={[styles.notificationText, directionStyle(isRtl)]}>
                {copy.notificationsText}
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.paymentCard,
              {
                flexDirection: isRtl ? "row-reverse" : "row",
              },
            ]}
          >
            <View style={styles.paymentIcon}>
              <Ionicons name="wallet-outline" size={22} color={SUCCESS} />
            </View>

            <View
              style={[
                styles.paymentCopy,
                {
                  alignItems: isRtl ? "flex-end" : "flex-start",
                },
              ]}
            >
              <Text style={[styles.paymentTitle, directionStyle(isRtl)]}>
                {copy.paymentTitle}
              </Text>

              <Text style={[styles.paymentText, directionStyle(isRtl)]}>
                {copy.paymentText}
              </Text>
            </View>
          </View>
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

            <Text style={[styles.footerHint, directionStyle(isRtl)]}>
              {copy.footerHint}
            </Text>
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

function ProcessStep({
  stepId,
  icon,
  number,
  isLast,
  copy,
  isRtl,
}: {
  stepId: ProcessStepId;
  icon: IconName;
  number: string;
  isLast: boolean;
  copy: SuccessCopy;
  isRtl: boolean;
}) {
  return (
    <View style={styles.stepWrapper}>
      <View
        style={[
          styles.stepCard,
          {
            flexDirection: isRtl ? "row-reverse" : "row",
          },
        ]}
      >
        <View style={styles.stepIcon}>
          <Ionicons name={icon} size={22} color={KhedmatPalette.blue500} />
        </View>

        <View
          style={[
            styles.stepCopy,
            {
              alignItems: isRtl ? "flex-end" : "flex-start",
            },
          ]}
        >
          <Text style={[styles.stepTitle, directionStyle(isRtl)]}>
            {copy.stepTitle(stepId)}
          </Text>

          <Text style={[styles.stepSubtitle, directionStyle(isRtl)]}>
            {copy.stepSubtitle(stepId)}
          </Text>
        </View>

        <View style={styles.stepNumber}>
          <Text style={styles.stepNumberText}>{number}</Text>
        </View>
      </View>

      {!isLast ? (
        <View
          style={[
            styles.connectorRow,
            {
              flexDirection: isRtl ? "row-reverse" : "row",
            },
          ]}
        >
          <View style={styles.connectorSide} />

          <View style={styles.connector} />

          <View style={styles.connectorFill} />
        </View>
      ) : null}
    </View>
  );
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
      eyebrow: "درخواست ارسال شد",
      title: "رزرو شما با موفقیت ثبت شد",
      subtitle:
        "درخواست برای ارائه‌دهنده ارسال شده است. پس از بررسی، نتیجه از طریق اعلان و پیام به شما اطلاع داده می‌شود.",
      statusLabel: "وضعیت رزرو",
      statusTitle: "در انتظار پاسخ ارائه‌دهنده",
      statusSubtitle:
        "ارائه‌دهنده می‌تواند درخواست را بپذیرد، رد کند یا زمان دیگری پیشنهاد دهد.",
      pending: "در انتظار",
      summaryTitle: "خلاصهٔ درخواست",
      provider: "ارائه‌دهنده",
      providerFallback: "ارائه‌دهنده",
      professionFallback: "متخصص خدمات",
      service: "خدمت",
      serviceFallback: "خدمت انتخاب‌شده",
      date: "تاریخ",
      time: "زمان",
      address: "آدرس",
      addressFallback: "آدرس ثبت نشده",
      estimatedTotal: "مجموع تخمینی",
      estimatedTotalHint: "مبلغ نهایی پس از بررسی کار تأیید می‌شود.",
      reference: "شمارهٔ پیگیری",
      submittedAt: (value: string) => `ثبت‌شده در ${value}`,
      nextTitle: "مرحلهٔ بعد چه می‌شود؟",
      nextSubtitle: "درخواست شما از مراحل زیر عبور خواهد کرد.",
      stepTitle: (id: ProcessStepId) =>
        ({
          review: "بررسی درخواست",
          response: "پاسخ ارائه‌دهنده",
          conversation: "هماهنگی جزئیات",
          service: "انجام خدمت",
        })[id],
      stepSubtitle: (id: ProcessStepId) =>
        ({
          review: "ارائه‌دهنده جزئیات، زمان و آدرس درخواست را بررسی می‌کند.",
          response:
            "درخواست پذیرفته یا رد می‌شود و ممکن است زمان دیگری پیشنهاد گردد.",
          conversation:
            "پس از پذیرش می‌توانید جزئیات بیشتر را از طریق پیام هماهنگ کنید.",
          service:
            "ارائه‌دهنده در زمان تأییدشده برای انجام خدمت مراجعه می‌کند.",
        })[id],
      notificationsTitle: "اعلان‌های برنامه را فعال نگه دارید",
      notificationsText:
        "پاسخ ارائه‌دهنده و هر تغییر در زمان یا وضعیت رزرو از طریق اعلان برنامه نمایش داده می‌شود.",
      paymentTitle: "هنوز پرداختی انجام نشده است",
      paymentText:
        "این درخواست با وضعیت پرداخت‌نشده ثبت شده است. مبلغ و روش پرداخت پس از تأیید خدمت مشخص خواهد شد.",
      viewBooking: "مشاهدهٔ رزرو",
      goHome: "بازگشت به خانه",
      footerHint: "می‌توانید وضعیت این درخواست را در بخش رزروها دنبال کنید.",
    };
  }

  if (language === "Pashto") {
    return {
      eyebrow: "غوښتنه ولېږل شوه",
      title: "ستاسو رزرف په بریالیتوب ثبت شو",
      subtitle:
        "غوښتنه خدمت وړاندې کوونکي ته لېږل شوې. له ارزونې وروسته به پایله د خبرتیا او پیغام له لارې درته وښودل شي.",
      statusLabel: "د رزرف حالت",
      statusTitle: "د خدمت وړاندې کوونکي د ځواب په تمه",
      statusSubtitle:
        "خدمت وړاندې کوونکی غوښتنه منلای، ردولای یا بل وخت وړاندیز کولای شي.",
      pending: "په تمه",
      summaryTitle: "د غوښتنې لنډیز",
      provider: "خدمت وړاندې کوونکی",
      providerFallback: "خدمت وړاندې کوونکی",
      professionFallback: "د خدمت متخصص",
      service: "خدمت",
      serviceFallback: "ټاکل شوی خدمت",
      date: "نېټه",
      time: "وخت",
      address: "پته",
      addressFallback: "پته نه ده ثبت شوې",
      estimatedTotal: "اټکلی ټول",
      estimatedTotalHint: "وروستی مبلغ د کار له ارزونې وروسته تاییدېږي.",
      reference: "د تعقیب شمېره",
      submittedAt: (value: string) => `په ${value} ثبت شوی`,
      nextTitle: "وروسته څه کېږي؟",
      nextSubtitle: "ستاسو غوښتنه به له لاندې مرحلو تېرېږي.",
      stepTitle: (id: ProcessStepId) =>
        ({
          review: "د غوښتنې ارزونه",
          response: "د خدمت وړاندې کوونکي ځواب",
          conversation: "د جزئیاتو همغږي",
          service: "د خدمت ترسره کول",
        })[id],
      stepSubtitle: (id: ProcessStepId) =>
        ({
          review: "خدمت وړاندې کوونکی د غوښتنې جزئیات، وخت او پته ګوري.",
          response: "غوښتنه منل یا رد کېږي او ښايي بل وخت وړاندیز شي.",
          conversation:
            "له منلو وروسته نور جزئیات د پیغام له لارې همغږي کولی شئ.",
          service: "خدمت وړاندې کوونکی په تایید شوي وخت کې د خدمت لپاره راځي.",
        })[id],
      notificationsTitle: "د اپلېکېشن خبرتیاوې فعالې وساتئ",
      notificationsText:
        "د خدمت وړاندې کوونکي ځواب او د رزرف د وخت یا حالت هر بدلون به د اپلېکېشن له لارې درته وښودل شي.",
      paymentTitle: "تر اوسه تادیه نه ده شوې",
      paymentText:
        "دا غوښتنه د نه تادیه شوي حالت سره ثبت شوې. مبلغ او د تادیې طریقه به د خدمت له تایید وروسته مشخص شي.",
      viewBooking: "رزرف وګورئ",
      goHome: "کورپاڼې ته لاړ شئ",
      footerHint: "د دې غوښتنې حالت د رزرفونو په برخه کې تعقیبولی شئ.",
    };
  }

  return {
    eyebrow: "Request submitted",
    title: "Your booking was created successfully",
    subtitle:
      "The request has been sent to the provider. You will receive the result through notifications and messages after review.",
    statusLabel: "Booking status",
    statusTitle: "Waiting for provider response",
    statusSubtitle: "The provider may accept, decline or propose another time.",
    pending: "Pending",
    summaryTitle: "Request summary",
    provider: "Provider",
    providerFallback: "Provider",
    professionFallback: "Service professional",
    service: "Service",
    serviceFallback: "Selected service",
    date: "Date",
    time: "Time",
    address: "Address",
    addressFallback: "No address recorded",
    estimatedTotal: "Estimated total",
    estimatedTotalHint:
      "The final amount is confirmed after the work is assessed.",
    reference: "Tracking reference",
    submittedAt: (value: string) => `Submitted ${value}`,
    nextTitle: "What happens next?",
    nextSubtitle: "Your request will move through the following stages.",
    stepTitle: (id: ProcessStepId) =>
      ({
        review: "Request review",
        response: "Provider response",
        conversation: "Coordinate details",
        service: "Service delivery",
      })[id],
    stepSubtitle: (id: ProcessStepId) =>
      ({
        review:
          "The provider reviews the request details, schedule and address.",
        response:
          "The request may be accepted, declined or returned with another proposed time.",
        conversation:
          "After acceptance, you can coordinate additional details through messages.",
        service:
          "The provider arrives at the confirmed time to complete the service.",
      })[id],
    notificationsTitle: "Keep app notifications enabled",
    notificationsText:
      "The provider response and any change to the booking time or status will appear through app notifications.",
    paymentTitle: "No payment has been made yet",
    paymentText:
      "This request was created with an unpaid status. The amount and payment method will be confirmed after the service is accepted.",
    viewBooking: "View booking",
    goHome: "Return home",
    footerHint: "You can follow this request from the Bookings section.",
  };
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: KhedmatPalette.blue050,
  },
  root: {
    flex: 1,
  },
  scrollContent: {
    width: "100%",
    maxWidth: Layout.contentMaxWidth,
    alignSelf: "center",
    paddingHorizontal: Layout.screenPadding,
    paddingTop: Spacing.xxl,
    paddingBottom: 230,
  },
  hero: {
    width: "100%",
    alignItems: "center",
    gap: Spacing.xxl,
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
    width: 78,
    height: 78,
    borderRadius: Radius.xxl,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: SUCCESS,
    ...Shadows.medium,
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
    color: KhedmatPalette.textPrimary,
    fontSize: 28,
    lineHeight: 36,
    textAlign: "center",
  },
  subtitle: {
    ...Typography.bodyLarge,
    width: "100%",
    maxWidth: 460,
    color: KhedmatPalette.textSecondary,
    lineHeight: 25,
    textAlign: "center",
  },
  statusCard: {
    width: "100%",
    minHeight: 126,
    marginTop: Spacing.section,
    padding: Spacing.lg,
    alignItems: "center",
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: "#E5C875",
    borderRadius: Radius.xl,
    backgroundColor: "#FFFDF6",
  },
  statusIcon: {
    width: 50,
    height: 50,
    flexShrink: 0,
    borderRadius: Radius.lg,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: WARNING_SOFT,
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
    marginTop: Spacing.section,
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
    backgroundColor: KhedmatPalette.surface,
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
