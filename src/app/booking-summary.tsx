import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ComponentProps, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useNotifications } from "../context/notification-context";

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

type SummaryCopy = ReturnType<typeof getSummaryCopy>;

const CURRENT_STEP = 4;
const TOTAL_STEPS = 4;
const PLATFORM_FEE = 50;

const SUCCESS = "#268A57";
const SUCCESS_SOFT = "#E8F6EE";
const WARNING = "#8A5A00";
const WARNING_SOFT = "#FFF4D6";
const ERROR = "#B3261E";

export default function BookingSummaryScreen() {
  const router = useRouter();

  const { bookingDraft, bookingReadyForSummary, submitBookingDraft } =
    useBooking();

  const { createProviderBookingNotification } = useNotifications();

  const { language } = useLanguage();

  const activeLanguage = normalizeLanguage(language);

  const isRtl = activeLanguage === "Dari" || activeLanguage === "Pashto";

  const localizedDigits = activeLanguage !== "English";

  const copy = getSummaryCopy(activeLanguage);

  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const submissionLock = useRef(false);

  const servicePrice = bookingDraft.estimatedPrice ?? 0;

  const estimatedTotal = servicePrice + PLATFORM_FEE;

  const formattedDate = useMemo(
    () => formatBookingDate(bookingDraft.date, activeLanguage),
    [activeLanguage, bookingDraft.date],
  );

  const formattedTime = useMemo(
    () => formatTime(bookingDraft.time, activeLanguage),
    [activeLanguage, bookingDraft.time],
  );

  const formattedAddress =
    bookingDraft.address?.fullAddress ?? copy.addressFallback;

  const notes = bookingDraft.notes.trim();

  const canSubmit = bookingReadyForSummary && acceptedTerms && !isSubmitting;

  const handleEditService = () => {
    router.push({
      pathname: "/booking-create",
      params: {
        providerId: bookingDraft.providerId,
      },
    });
  };

  const handleEditSchedule = () => {
    router.push("/booking-schedule");
  };

  const handleEditDetails = () => {
    router.push("/booking-details");
  };

  const handleSubmit = async () => {
    if (submissionLock.current || isSubmitting) {
      return;
    }

    if (!bookingReadyForSummary) {
      Alert.alert(copy.incompleteTitle, copy.incompleteMessage);
      return;
    }

    if (!bookingDraft.address) {
      Alert.alert(copy.addressMissingTitle, copy.addressMissingMessage);
      return;
    }

    if (!acceptedTerms) {
      Alert.alert(copy.consentRequiredTitle, copy.consentRequiredMessage);
      return;
    }

    submissionLock.current = true;
    setIsSubmitting(true);

    try {
      const booking = await submitBookingDraft();

      try {
        await createProviderBookingNotification({
          providerId: booking.providerId,
          bookingId: booking.id,
          customerName: "Customer",
        });
      } catch (notificationError) {
        console.error(
          "Booking was created, but the provider notification failed:",
          notificationError,
        );
      }

      router.replace({
        pathname: "/booking-success",
        params: {
          bookingId: booking.id,
        },
      });
    } catch (error) {
      console.error("Booking submission failed:", error);

      Alert.alert(
        copy.submitFailedTitle,
        error instanceof Error ? error.message : copy.submitFailedMessage,
      );
    } finally {
      setIsSubmitting(false);
      submissionLock.current = false;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.root}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View
            style={[
              styles.topBar,
              {
                flexDirection: isRtl ? "row-reverse" : "row",
              },
            ]}
          >
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={copy.back}
              hitSlop={8}
              onPress={() => router.back()}
              style={({ pressed }) => [
                styles.backButton,
                pressed && styles.pressed,
              ]}
            >
              <Ionicons
                name={isRtl ? "chevron-forward" : "chevron-back"}
                size={24}
                color={KhedmatPalette.navy900}
              />
            </Pressable>

            <View style={styles.stepBadge}>
              <Text style={[styles.stepText, directionStyle(isRtl)]}>
                {copy.step(
                  formatDigits(CURRENT_STEP.toString(), localizedDigits),
                  formatDigits(TOTAL_STEPS.toString(), localizedDigits),
                )}
              </Text>
            </View>
          </View>

          <View style={styles.header}>
            <View style={styles.headerIcon}>
              <Ionicons
                name="receipt-outline"
                size={30}
                color={KhedmatPalette.white}
              />
            </View>

            <View
              style={[
                styles.headerCopy,
                {
                  alignItems: isRtl ? "flex-end" : "flex-start",
                },
              ]}
            >
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
              styles.providerCard,
              {
                flexDirection: isRtl ? "row-reverse" : "row",
              },
            ]}
          >
            <View style={styles.providerAvatar}>
              <Ionicons
                name="person-outline"
                size={25}
                color={KhedmatPalette.white}
              />
            </View>

            <View
              style={[
                styles.providerCopy,
                {
                  alignItems: isRtl ? "flex-end" : "flex-start",
                },
              ]}
            >
              <Text style={[styles.providerEyebrow, directionStyle(isRtl)]}>
                {copy.provider}
              </Text>

              <Text
                numberOfLines={1}
                style={[styles.providerName, directionStyle(isRtl)]}
              >
                {bookingDraft.providerName || copy.providerFallback}
              </Text>

              <Text
                numberOfLines={2}
                style={[styles.providerProfession, directionStyle(isRtl)]}
              >
                {bookingDraft.providerProfession || copy.professionFallback}
              </Text>
            </View>

            <View style={styles.verifiedBadge}>
              <Ionicons
                name="shield-checkmark"
                size={21}
                color={KhedmatPalette.blue500}
              />
            </View>
          </View>

          <SummarySection
            title={copy.serviceTitle}
            editLabel={copy.edit}
            onEdit={handleEditService}
            isRtl={isRtl}
          >
            <SummaryItem
              icon="briefcase-outline"
              label={copy.selectedService}
              value={bookingDraft.serviceName || copy.serviceFallback}
              supportingText={copy.estimatedServicePrice(
                formatCurrency(servicePrice, activeLanguage),
              )}
              isRtl={isRtl}
            />
          </SummarySection>

          <SummarySection
            title={copy.scheduleTitle}
            editLabel={copy.edit}
            onEdit={handleEditSchedule}
            isRtl={isRtl}
          >
            <View style={styles.groupCard}>
              <SummaryDetail
                icon="calendar-outline"
                label={copy.date}
                value={formattedDate}
                isRtl={isRtl}
              />

              <View style={styles.divider} />

              <SummaryDetail
                icon="time-outline"
                label={copy.time}
                value={formattedTime}
                isRtl={isRtl}
              />
            </View>
          </SummarySection>

          <SummarySection
            title={copy.detailsTitle}
            editLabel={copy.edit}
            onEdit={handleEditDetails}
            isRtl={isRtl}
          >
            <View style={styles.groupCard}>
              <SummaryDetail
                icon="location-outline"
                label={copy.address}
                value={formattedAddress}
                isRtl={isRtl}
              />

              <View style={styles.divider} />

              <SummaryDetail
                icon="document-text-outline"
                label={copy.requestDetails}
                value={notes || copy.notesFallback}
                isRtl={isRtl}
                multiline
              />
            </View>
          </SummarySection>

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
                {copy.priceTitle}
              </Text>

              <Text style={[styles.sectionSubtitle, directionStyle(isRtl)]}>
                {copy.priceSubtitle}
              </Text>
            </View>

            <View style={styles.priceCard}>
              <PriceLine
                label={copy.servicePrice}
                value={formatCurrency(servicePrice, activeLanguage)}
                isRtl={isRtl}
              />

              <PriceLine
                label={copy.platformFee}
                value={formatCurrency(PLATFORM_FEE, activeLanguage)}
                supportingText={copy.platformFeeHint}
                isRtl={isRtl}
              />

              <View style={styles.priceDivider} />

              <PriceLine
                label={copy.estimatedTotal}
                value={formatCurrency(estimatedTotal, activeLanguage)}
                isRtl={isRtl}
                emphasized
              />
            </View>
          </View>

          <View
            style={[
              styles.priceNotice,
              {
                flexDirection: isRtl ? "row-reverse" : "row",
              },
            ]}
          >
            <View style={styles.priceNoticeIcon}>
              <Ionicons
                name="information-circle-outline"
                size={22}
                color={WARNING}
              />
            </View>

            <View
              style={[
                styles.priceNoticeCopy,
                {
                  alignItems: isRtl ? "flex-end" : "flex-start",
                },
              ]}
            >
              <Text style={[styles.priceNoticeTitle, directionStyle(isRtl)]}>
                {copy.priceNoticeTitle}
              </Text>

              <Text style={[styles.priceNoticeText, directionStyle(isRtl)]}>
                {copy.priceNoticeText}
              </Text>
            </View>
          </View>

          <Pressable
            accessibilityRole="checkbox"
            accessibilityLabel={copy.consentText}
            accessibilityState={{
              checked: acceptedTerms,
            }}
            onPress={() => setAcceptedTerms((current) => !current)}
            style={({ pressed }) => [
              styles.consentCard,
              acceptedTerms && styles.consentCardSelected,
              pressed && styles.cardPressed,
            ]}
          >
            <View
              style={[
                styles.consentContent,
                {
                  flexDirection: isRtl ? "row-reverse" : "row",
                },
              ]}
            >
              <View
                style={[
                  styles.checkbox,
                  acceptedTerms && styles.checkboxSelected,
                ]}
              >
                {acceptedTerms ? (
                  <Ionicons
                    name="checkmark"
                    size={17}
                    color={KhedmatPalette.white}
                  />
                ) : null}
              </View>

              <View
                style={[
                  styles.consentCopy,
                  {
                    alignItems: isRtl ? "flex-end" : "flex-start",
                  },
                ]}
              >
                <Text style={[styles.consentTitle, directionStyle(isRtl)]}>
                  {copy.consentTitle}
                </Text>

                <Text style={[styles.consentText, directionStyle(isRtl)]}>
                  {copy.consentText}
                </Text>
              </View>
            </View>
          </Pressable>

          <View
            style={[
              styles.statusNotice,
              {
                flexDirection: isRtl ? "row-reverse" : "row",
              },
            ]}
          >
            <View style={styles.statusNoticeIcon}>
              <Ionicons
                name="time-outline"
                size={22}
                color={KhedmatPalette.blue500}
              />
            </View>

            <View
              style={[
                styles.statusNoticeCopy,
                {
                  alignItems: isRtl ? "flex-end" : "flex-start",
                },
              ]}
            >
              <Text style={[styles.statusNoticeTitle, directionStyle(isRtl)]}>
                {copy.pendingTitle}
              </Text>

              <Text style={[styles.statusNoticeText, directionStyle(isRtl)]}>
                {copy.pendingText}
              </Text>
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <View style={styles.footerContent}>
            <View
              style={[
                styles.footerTotalRow,
                {
                  flexDirection: isRtl ? "row-reverse" : "row",
                },
              ]}
            >
              <Text style={[styles.footerTotalLabel, directionStyle(isRtl)]}>
                {copy.estimatedTotal}
              </Text>

              <Text style={[styles.footerTotalValue, directionStyle(isRtl)]}>
                {formatCurrency(estimatedTotal, activeLanguage)}
              </Text>
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={copy.submit}
              accessibilityState={{
                disabled: !canSubmit,
                busy: isSubmitting,
              }}
              disabled={!canSubmit}
              onPress={handleSubmit}
              style={({ pressed }) => [
                styles.primaryButton,
                !canSubmit && styles.primaryButtonDisabled,
                pressed && canSubmit && styles.primaryButtonPressed,
              ]}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color={KhedmatPalette.white} />
              ) : (
                <View
                  style={[
                    styles.primaryButtonContent,
                    {
                      flexDirection: isRtl ? "row-reverse" : "row",
                    },
                  ]}
                >
                  <Ionicons
                    name="paper-plane-outline"
                    size={20}
                    color={KhedmatPalette.white}
                  />

                  <Text
                    style={[styles.primaryButtonText, directionStyle(isRtl)]}
                  >
                    {copy.submit}
                  </Text>
                </View>
              )}
            </Pressable>

            <Text style={[styles.footerHint, directionStyle(isRtl)]}>
              {acceptedTerms ? copy.ready : copy.acceptTermsHint}
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

function SummarySection({
  title,
  editLabel,
  onEdit,
  isRtl,
  children,
}: {
  title: string;
  editLabel: string;
  onEdit: () => void;
  isRtl: boolean;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <View
        style={[
          styles.sectionHeaderRow,
          {
            flexDirection: isRtl ? "row-reverse" : "row",
          },
        ]}
      >
        <Text style={[styles.sectionTitle, directionStyle(isRtl)]}>
          {title}
        </Text>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={editLabel}
          onPress={onEdit}
          style={({ pressed }) => [
            styles.editButton,
            {
              flexDirection: isRtl ? "row-reverse" : "row",
            },
            pressed && styles.pressed,
          ]}
        >
          <Ionicons
            name="create-outline"
            size={15}
            color={KhedmatPalette.blue500}
          />

          <Text style={[styles.editButtonText, directionStyle(isRtl)]}>
            {editLabel}
          </Text>
        </Pressable>
      </View>

      {children}
    </View>
  );
}

function SummaryItem({
  icon,
  label,
  value,
  supportingText,
  isRtl,
}: {
  icon: IconName;
  label: string;
  value: string;
  supportingText: string;
  isRtl: boolean;
}) {
  return (
    <View
      style={[
        styles.summaryItem,
        {
          flexDirection: isRtl ? "row-reverse" : "row",
        },
      ]}
    >
      <View style={styles.summaryItemIcon}>
        <Ionicons name={icon} size={22} color={KhedmatPalette.blue500} />
      </View>

      <View
        style={[
          styles.summaryItemCopy,
          {
            alignItems: isRtl ? "flex-end" : "flex-start",
          },
        ]}
      >
        <Text style={[styles.summaryItemLabel, directionStyle(isRtl)]}>
          {label}
        </Text>

        <Text style={[styles.summaryItemValue, directionStyle(isRtl)]}>
          {value}
        </Text>

        <Text style={[styles.summaryItemSupporting, directionStyle(isRtl)]}>
          {supportingText}
        </Text>
      </View>
    </View>
  );
}

function SummaryDetail({
  icon,
  label,
  value,
  isRtl,
  multiline = false,
}: {
  icon: IconName;
  label: string;
  value: string;
  isRtl: boolean;
  multiline?: boolean;
}) {
  return (
    <View
      style={[
        styles.detailRow,
        {
          flexDirection: isRtl ? "row-reverse" : "row",
          alignItems: multiline ? "flex-start" : "center",
        },
      ]}
    >
      <View style={styles.detailIcon}>
        <Ionicons name={icon} size={20} color={KhedmatPalette.blue500} />
      </View>

      <View
        style={[
          styles.detailCopy,
          {
            alignItems: isRtl ? "flex-end" : "flex-start",
          },
        ]}
      >
        <Text style={[styles.detailLabel, directionStyle(isRtl)]}>{label}</Text>

        <Text
          style={[
            styles.detailValue,
            multiline && styles.detailValueMultiline,
            directionStyle(isRtl),
          ]}
        >
          {value}
        </Text>
      </View>
    </View>
  );
}

function PriceLine({
  label,
  value,
  supportingText,
  isRtl,
  emphasized = false,
}: {
  label: string;
  value: string;
  supportingText?: string;
  isRtl: boolean;
  emphasized?: boolean;
}) {
  return (
    <View
      style={[
        styles.priceLine,
        {
          flexDirection: isRtl ? "row-reverse" : "row",
        },
      ]}
    >
      <View
        style={[
          styles.priceLineCopy,
          {
            alignItems: isRtl ? "flex-end" : "flex-start",
          },
        ]}
      >
        <Text
          style={[
            styles.priceLineLabel,
            emphasized && styles.priceLineLabelEmphasized,
            directionStyle(isRtl),
          ]}
        >
          {label}
        </Text>

        {supportingText ? (
          <Text style={[styles.priceLineSupporting, directionStyle(isRtl)]}>
            {supportingText}
          </Text>
        ) : null}
      </View>

      <Text
        style={[
          styles.priceLineValue,
          emphasized && styles.priceLineValueEmphasized,
          directionStyle(isRtl),
        ]}
      >
        {value}
      </Text>
    </View>
  );
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
      ? "Date not selected"
      : language === "Dari"
        ? "تاریخ انتخاب نشده"
        : "نېټه نه ده ټاکل شوې";
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
      ? "Time not selected"
      : language === "Dari"
        ? "زمان انتخاب نشده"
        : "وخت نه دی ټاکل شوی";
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

function getSummaryCopy(language: LanguageName) {
  if (language === "Dari") {
    return {
      back: "بازگشت",
      step: (current: string, total: string) => `مرحله ${current} از ${total}`,
      eyebrow: "بررسی نهایی",
      title: "جزئیات رزرو را بررسی کنید",
      subtitle:
        "پیش از ارسال درخواست، خدمت، زمان، آدرس و هزینهٔ تخمینی را بررسی نمایید.",
      provider: "ارائه‌دهنده",
      providerFallback: "ارائه‌دهنده",
      professionFallback: "متخصص خدمات",
      serviceTitle: "خدمت",
      selectedService: "خدمت انتخاب‌شده",
      serviceFallback: "خدمت انتخاب نشده",
      estimatedServicePrice: (value: string) => `هزینهٔ ابتدایی: ${value}`,
      scheduleTitle: "تاریخ و زمان",
      date: "تاریخ",
      time: "زمان",
      detailsTitle: "آدرس و جزئیات",
      address: "آدرس",
      addressFallback: "آدرس انتخاب نشده",
      requestDetails: "شرح درخواست",
      notesFallback: "توضیحی ثبت نشده است.",
      edit: "ویرایش",
      priceTitle: "خلاصهٔ هزینه",
      priceSubtitle:
        "مبلغ‌ها تخمینی‌اند و پیش از آغاز کار می‌توانند براساس بررسی ارائه‌دهنده تغییر کنند.",
      servicePrice: "هزینهٔ ابتدایی خدمت",
      platformFee: "هزینهٔ خدمات پلتفرم",
      platformFeeHint: "برای مدیریت رزرو و پشتیبانی",
      estimatedTotal: "مجموع تخمینی",
      priceNoticeTitle: "مبلغ نهایی هنوز قطعی نیست",
      priceNoticeText:
        "هزینهٔ قطعات، مواد، رفت‌وآمد یا کار اضافی پس از بررسی محل مشخص می‌شود. هر تغییر مهم باید پیش از آغاز کار با شما تأیید گردد.",
      consentTitle: "تأیید و ارسال",
      consentText:
        "تأیید می‌کنم که جزئیات رزرو را بررسی کرده‌ام و می‌دانم مبلغ نمایش‌داده‌شده تخمینی است.",
      pendingTitle: "درخواست ابتدا در انتظار پاسخ خواهد بود",
      pendingText:
        "پس از ارسال، ارائه‌دهنده جزئیات و زمان را بررسی می‌کند. رزرو تنها پس از تأیید ارائه‌دهنده نهایی می‌شود.",
      submit: "ارسال درخواست رزرو",
      ready: "درخواست آمادهٔ ارسال است.",
      acceptTermsHint: "برای ارسال، تأیید بالا را انتخاب کنید.",
      incompleteTitle: "اطلاعات ناقص است",
      incompleteMessage:
        "بعضی از اطلاعات رزرو تکمیل نشده‌اند. لطفاً مراحل قبلی را بررسی کنید.",
      addressMissingTitle: "آدرس ناقص است",
      addressMissingMessage: "لطفاً آدرس انجام خدمت را دوباره انتخاب کنید.",
      consentRequiredTitle: "تأیید لازم است",
      consentRequiredMessage: "برای ارسال درخواست، تأیید نهایی را انتخاب کنید.",
      submitFailedTitle: "ارسال ناموفق بود",
      submitFailedMessage:
        "درخواست رزرو در حال حاضر ارسال نشد. لطفاً دوباره تلاش کنید.",
    };
  }

  if (language === "Pashto") {
    return {
      back: "بېرته",
      step: (current: string, total: string) => `مرحله ${current} له ${total}`,
      eyebrow: "وروستۍ ارزونه",
      title: "د رزرف جزئیات وګورئ",
      subtitle: "د غوښتنې له لېږلو مخکې خدمت، وخت، پته او اټکلی لګښت وګورئ.",
      provider: "خدمت وړاندې کوونکی",
      providerFallback: "خدمت وړاندې کوونکی",
      professionFallback: "د خدمت متخصص",
      serviceTitle: "خدمت",
      selectedService: "ټاکل شوی خدمت",
      serviceFallback: "خدمت نه دی ټاکل شوی",
      estimatedServicePrice: (value: string) => `لومړنی لګښت: ${value}`,
      scheduleTitle: "نېټه او وخت",
      date: "نېټه",
      time: "وخت",
      detailsTitle: "پته او جزئیات",
      address: "پته",
      addressFallback: "پته نه ده ټاکل شوې",
      requestDetails: "د غوښتنې تشریح",
      notesFallback: "تشریح نه ده ثبت شوې.",
      edit: "سمول",
      priceTitle: "د لګښت لنډیز",
      priceSubtitle:
        "مبلغونه اټکلي دي او د خدمت وړاندې کوونکي له ارزونې وروسته د کار تر پیل مخکې بدلېدای شي.",
      servicePrice: "د خدمت لومړنی لګښت",
      platformFee: "د پلېټفارم خدمت فیس",
      platformFeeHint: "د رزرف د مدیریت او ملاتړ لپاره",
      estimatedTotal: "اټکلی ټول",
      priceNoticeTitle: "وروستی مبلغ لا قطعي نه دی",
      priceNoticeText:
        "د پرزو، موادو، سفر یا اضافي کار لګښت د ځای له ارزونې وروسته معلومېږي. هر مهم بدلون باید د کار تر پیل مخکې له تاسو سره تایید شي.",
      consentTitle: "تایید او لېږل",
      consentText:
        "تاییدوم چې د رزرف جزئیات مې کتلي او پوهېږم چې ښودل شوی مبلغ اټکلی دی.",
      pendingTitle: "غوښتنه به لومړی د ځواب په تمه وي",
      pendingText:
        "له لېږلو وروسته خدمت وړاندې کوونکی جزئیات او وخت ګوري. رزرف یوازې د هغه له تایید وروسته وروستی کېږي.",
      submit: "د رزرف غوښتنه ولېږئ",
      ready: "غوښتنه لېږلو ته چمتو ده.",
      acceptTermsHint: "د لېږلو لپاره پورته تایید وټاکئ.",
      incompleteTitle: "معلومات بشپړ نه دي",
      incompleteMessage:
        "د رزرف ځینې معلومات نیمګړي دي. مهرباني وکړئ مخکینۍ مرحلې وګورئ.",
      addressMissingTitle: "پته نیمګړې ده",
      addressMissingMessage: "مهرباني وکړئ د خدمت پته بیا وټاکئ.",
      consentRequiredTitle: "تایید اړین دی",
      consentRequiredMessage: "د غوښتنې د لېږلو لپاره وروستی تایید وټاکئ.",
      submitFailedTitle: "لېږل بریالي نه شول",
      submitFailedMessage:
        "اوس مهال د رزرف غوښتنه ونه لېږل شوه. مهرباني وکړئ بیا هڅه وکړئ.",
    };
  }

  return {
    back: "Back",
    step: (current: string, total: string) => `Step ${current} of ${total}`,
    eyebrow: "Final review",
    title: "Review your booking details",
    subtitle:
      "Check the service, schedule, address and estimated cost before submitting the request.",
    provider: "Provider",
    providerFallback: "Provider",
    professionFallback: "Service professional",
    serviceTitle: "Service",
    selectedService: "Selected service",
    serviceFallback: "No service selected",
    estimatedServicePrice: (value: string) => `Starting cost: ${value}`,
    scheduleTitle: "Date and time",
    date: "Date",
    time: "Time",
    detailsTitle: "Address and details",
    address: "Address",
    addressFallback: "No address selected",
    requestDetails: "Request details",
    notesFallback: "No description was provided.",
    edit: "Edit",
    priceTitle: "Price summary",
    priceSubtitle:
      "Amounts are estimates and may change before work begins after the provider assesses the request.",
    servicePrice: "Starting service price",
    platformFee: "Platform service fee",
    platformFeeHint: "For booking management and support",
    estimatedTotal: "Estimated total",
    priceNoticeTitle: "The final amount is not confirmed yet",
    priceNoticeText:
      "Parts, materials, travel or additional work may be added after assessment. Any material change should be confirmed with you before work begins.",
    consentTitle: "Confirm and submit",
    consentText:
      "I have reviewed the booking details and understand that the displayed amount is an estimate.",
    pendingTitle: "The request will initially be pending",
    pendingText:
      "After submission, the provider will review the details and schedule. The booking is final only after provider confirmation.",
    submit: "Submit booking request",
    ready: "The request is ready to submit.",
    acceptTermsHint: "Select the confirmation above to submit.",
    incompleteTitle: "Information is incomplete",
    incompleteMessage:
      "Some booking information is missing. Review the previous steps before submitting.",
    addressMissingTitle: "Address is missing",
    addressMissingMessage: "Select the service address again.",
    consentRequiredTitle: "Confirmation required",
    consentRequiredMessage:
      "Select the final confirmation before submitting the request.",
    submitFailedTitle: "Submission failed",
    submitFailedMessage:
      "The booking request could not be submitted right now. Please try again.",
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
    paddingTop: Spacing.md,
    paddingBottom: 230,
  },
  topBar: {
    width: "100%",
    minHeight: Layout.minimumTouchTarget,
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: KhedmatPalette.border,
    backgroundColor: KhedmatPalette.surface,
  },
  stepBadge: {
    minHeight: 34,
    paddingHorizontal: Spacing.md,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: Radius.pill,
    backgroundColor: KhedmatPalette.surfaceSoft,
  },
  stepText: {
    ...Typography.captionStyle,
    color: KhedmatPalette.blue500,
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
    backgroundColor: KhedmatPalette.navy900,
    ...Shadows.small,
  },
  headerCopy: {
    width: "100%",
    gap: Spacing.sm,
  },
  eyebrow: {
    ...Typography.captionStyle,
    width: "100%",
    color: KhedmatPalette.blue500,
    fontFamily: Fonts.medium,
  },
  title: {
    ...Typography.screenTitle,
    width: "100%",
    maxWidth: 470,
    color: KhedmatPalette.textPrimary,
    fontSize: 27,
    lineHeight: 35,
  },
  subtitle: {
    ...Typography.bodyLarge,
    width: "100%",
    maxWidth: 470,
    color: KhedmatPalette.textSecondary,
    lineHeight: 25,
  },
  providerCard: {
    width: "100%",
    minHeight: 112,
    marginTop: Spacing.xxl,
    padding: Spacing.lg,
    alignItems: "center",
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: KhedmatPalette.border,
    borderRadius: Radius.xl,
    backgroundColor: KhedmatPalette.surface,
    ...Shadows.small,
  },
  providerAvatar: {
    width: 52,
    height: 52,
    flexShrink: 0,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: KhedmatPalette.navy900,
  },
  providerCopy: {
    flex: 1,
    gap: 2,
  },
  providerEyebrow: {
    ...Typography.captionStyle,
    width: "100%",
    color: KhedmatPalette.blue500,
    fontFamily: Fonts.medium,
  },
  providerName: {
    ...Typography.label,
    width: "100%",
    color: KhedmatPalette.textPrimary,
    fontSize: 17,
    lineHeight: 23,
  },
  providerProfession: {
    ...Typography.captionStyle,
    width: "100%",
    color: KhedmatPalette.textSecondary,
    lineHeight: 18,
  },
  verifiedBadge: {
    width: 42,
    height: 42,
    flexShrink: 0,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: KhedmatPalette.surfaceSoft,
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
  sectionHeaderRow: {
    width: "100%",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.md,
  },
  sectionTitle: {
    ...Typography.sectionTitle,
    flex: 1,
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
  editButton: {
    minHeight: 34,
    paddingHorizontal: Spacing.sm,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    borderRadius: Radius.pill,
    backgroundColor: KhedmatPalette.surfaceSoft,
  },
  editButtonText: {
    ...Typography.captionStyle,
    color: KhedmatPalette.blue500,
    fontFamily: Fonts.medium,
  },
  summaryItem: {
    width: "100%",
    minHeight: 112,
    padding: Spacing.lg,
    alignItems: "center",
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: KhedmatPalette.border,
    borderRadius: Radius.xl,
    backgroundColor: KhedmatPalette.surface,
    ...Shadows.small,
  },
  summaryItemIcon: {
    width: 50,
    height: 50,
    flexShrink: 0,
    borderRadius: Radius.lg,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: KhedmatPalette.surfaceSoft,
  },
  summaryItemCopy: {
    flex: 1,
    gap: 3,
  },
  summaryItemLabel: {
    ...Typography.captionStyle,
    width: "100%",
    color: KhedmatPalette.textMuted,
  },
  summaryItemValue: {
    ...Typography.label,
    width: "100%",
    color: KhedmatPalette.textPrimary,
    fontSize: 17,
    lineHeight: 23,
  },
  summaryItemSupporting: {
    ...Typography.captionStyle,
    width: "100%",
    color: KhedmatPalette.blue500,
    fontFamily: Fonts.medium,
  },
  groupCard: {
    width: "100%",
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: KhedmatPalette.border,
    borderRadius: Radius.xl,
    backgroundColor: KhedmatPalette.surface,
    ...Shadows.small,
  },
  detailRow: {
    width: "100%",
    gap: Spacing.md,
  },
  detailIcon: {
    width: 42,
    height: 42,
    flexShrink: 0,
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: KhedmatPalette.surfaceSoft,
  },
  detailCopy: {
    flex: 1,
    gap: 2,
  },
  detailLabel: {
    ...Typography.captionStyle,
    width: "100%",
    color: KhedmatPalette.textMuted,
  },
  detailValue: {
    ...Typography.label,
    width: "100%",
    color: KhedmatPalette.textPrimary,
    fontSize: 15,
    lineHeight: 21,
  },
  detailValueMultiline: {
    fontFamily: Fonts.regular,
    color: KhedmatPalette.textSecondary,
    fontSize: 14,
    lineHeight: 22,
  },
  divider: {
    width: "100%",
    height: StyleSheet.hairlineWidth,
    marginVertical: Spacing.md,
    backgroundColor: KhedmatPalette.border,
  },
  priceCard: {
    width: "100%",
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: KhedmatPalette.border,
    borderRadius: Radius.xl,
    backgroundColor: KhedmatPalette.surface,
    ...Shadows.small,
  },
  priceLine: {
    width: "100%",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  priceLineCopy: {
    flex: 1,
    gap: 2,
  },
  priceLineLabel: {
    ...Typography.bodyStyle,
    width: "100%",
    color: KhedmatPalette.textSecondary,
    fontSize: 14,
  },
  priceLineLabelEmphasized: {
    color: KhedmatPalette.textPrimary,
    fontFamily: Fonts.bold,
    fontSize: 16,
  },
  priceLineSupporting: {
    ...Typography.captionStyle,
    width: "100%",
    color: KhedmatPalette.textMuted,
    lineHeight: 17,
  },
  priceLineValue: {
    ...Typography.label,
    flexShrink: 0,
    color: KhedmatPalette.textPrimary,
    fontSize: 14,
  },
  priceLineValueEmphasized: {
    color: KhedmatPalette.navy900,
    fontFamily: Fonts.bold,
    fontSize: 18,
  },
  priceDivider: {
    width: "100%",
    height: 1,
    marginVertical: Spacing.sm,
    backgroundColor: KhedmatPalette.border,
  },
  priceNotice: {
    width: "100%",
    minHeight: 112,
    marginTop: Spacing.md,
    padding: Spacing.lg,
    alignItems: "flex-start",
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: "#E5C875",
    borderRadius: Radius.xl,
    backgroundColor: "#FFFDF6",
  },
  priceNoticeIcon: {
    width: 44,
    height: 44,
    flexShrink: 0,
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: WARNING_SOFT,
  },
  priceNoticeCopy: {
    flex: 1,
    gap: 3,
  },
  priceNoticeTitle: {
    ...Typography.label,
    width: "100%",
    color: KhedmatPalette.textPrimary,
    fontSize: 15,
  },
  priceNoticeText: {
    ...Typography.captionStyle,
    width: "100%",
    color: KhedmatPalette.textSecondary,
    lineHeight: 19,
  },
  consentCard: {
    width: "100%",
    minHeight: 124,
    marginTop: Spacing.section,
    borderWidth: 1,
    borderColor: KhedmatPalette.border,
    borderRadius: Radius.xl,
    backgroundColor: KhedmatPalette.surface,
    ...Shadows.small,
  },
  consentCardSelected: {
    borderColor: KhedmatPalette.blue500,
    backgroundColor: "#F4FBFC",
  },
  consentContent: {
    width: "100%",
    minHeight: 124,
    padding: Spacing.lg,
    alignItems: "flex-start",
    gap: Spacing.md,
  },
  checkbox: {
    width: 28,
    height: 28,
    flexShrink: 0,
    borderRadius: Radius.sm,
    borderWidth: 1.5,
    borderColor: KhedmatPalette.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: KhedmatPalette.surface,
  },
  checkboxSelected: {
    borderColor: KhedmatPalette.blue500,
    backgroundColor: KhedmatPalette.blue500,
  },
  consentCopy: {
    flex: 1,
    gap: 4,
  },
  consentTitle: {
    ...Typography.label,
    width: "100%",
    color: KhedmatPalette.textPrimary,
    fontSize: 15,
  },
  consentText: {
    ...Typography.bodyStyle,
    width: "100%",
    color: KhedmatPalette.textSecondary,
    fontSize: 14,
    lineHeight: 21,
  },
  statusNotice: {
    width: "100%",
    minHeight: 108,
    marginTop: Spacing.md,
    padding: Spacing.lg,
    alignItems: "flex-start",
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: KhedmatPalette.blue200,
    borderRadius: Radius.xl,
    backgroundColor: "#F4FBFC",
  },
  statusNoticeIcon: {
    width: 44,
    height: 44,
    flexShrink: 0,
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: KhedmatPalette.surface,
  },
  statusNoticeCopy: {
    flex: 1,
    gap: 3,
  },
  statusNoticeTitle: {
    ...Typography.label,
    width: "100%",
    color: KhedmatPalette.textPrimary,
    fontSize: 15,
  },
  statusNoticeText: {
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
  footerTotalRow: {
    width: "100%",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.md,
  },
  footerTotalLabel: {
    ...Typography.captionStyle,
    color: KhedmatPalette.textMuted,
  },
  footerTotalValue: {
    ...Typography.label,
    color: KhedmatPalette.navy900,
    fontFamily: Fonts.bold,
    fontSize: 17,
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
  primaryButtonDisabled: {
    backgroundColor: KhedmatPalette.disabled,
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
    color: KhedmatPalette.white,
    fontFamily: Fonts.medium,
    fontSize: 16,
    textAlign: "center",
  },
  footerHint: {
    ...Typography.captionStyle,
    width: "100%",
    color: KhedmatPalette.textMuted,
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
        scale: 0.993,
      },
    ],
  },
});
