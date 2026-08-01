import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ComponentProps, useMemo, useState } from "react";
import {
    Alert,
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";

import { GlassButton } from "../components/glass/glass-button";
import { GlassIconButton } from "../components/glass/glass-icon-button";
import { GlassSurface } from "../components/glass/glass-surface";
import {
    Colors,
    Layout,
    Radius,
    Spacing,
    Typography,
} from "../constants/theme";
import { useBooking } from "../context/booking-context";

type IconName = ComponentProps<typeof Ionicons>["name"];

const PLATFORM_FEE = 50;

export default function BookingSummaryScreen() {
  const router = useRouter();

  const {
  bookingDraft,
  bookingReadyForSummary,
  addBooking,
} = useBooking();

  const [acceptedTerms, setAcceptedTerms] =
    useState(false);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const servicePrice =
    bookingDraft.estimatedPrice ?? 0;

  const estimatedTotal =
    servicePrice + PLATFORM_FEE;

  const formattedDate = useMemo(
    () => formatBookingDate(bookingDraft.date),
    [bookingDraft.date],
  );

  const formattedTime = useMemo(
    () => formatTimeForDari(bookingDraft.time),
    [bookingDraft.time],
  );

  const canSubmit =
    bookingReadyForSummary &&
    acceptedTerms &&
    !isSubmitting;

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
  if (!bookingReadyForSummary) {
    Alert.alert(
      "اطلاعات ناقص است",
      "بعضی از اطلاعات رزرو تکمیل نشده‌اند. لطفاً مراحل قبلی را بررسی کنید.",
    );
    return;
  }

  if (!bookingDraft.address) {
    Alert.alert(
      "آدرس ناقص است",
      "لطفاً آدرس انجام خدمت را دوباره انتخاب کنید.",
    );
    return;
  }

  if (!acceptedTerms) {
    Alert.alert(
      "تأیید لازم است",
      "برای ارسال درخواست، شرایط رزرو را تأیید کنید.",
    );
    return;
  }

  setIsSubmitting(true);

  try {
    const booking = {
      id: `booking-${Date.now()}`,
      customerId: "current-user",
      providerId: bookingDraft.providerId,
      providerName: bookingDraft.providerName,
      providerProfession: bookingDraft.providerProfession,
      serviceId: bookingDraft.serviceId,
      serviceName: bookingDraft.serviceName,
      date: bookingDraft.date,
      time: bookingDraft.time,
      address: bookingDraft.address,
      notes: bookingDraft.notes,
      servicePrice,
      platformFee: PLATFORM_FEE,
      total: estimatedTotal,
      currency: bookingDraft.currency,
      status: "pending" as const,
      paymentStatus: "unpaid" as const,
      createdAt: new Date().toISOString(),
    };

    addBooking(booking);

    router.replace({
      pathname: "/booking-success",
      params: {
        bookingId: booking.id,
      },
    });
  } finally {
    setIsSubmitting(false);
  }
};

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.topBar}>
          <GlassIconButton
            icon="chevron-back"
            accessibilityLabel="بازگشت"
            onPress={() => router.back()}
          />

          <Text style={styles.stepText}>
            مرحله ۴ از ۴
          </Text>
        </View>

        <View style={styles.header}>
          <Text style={styles.eyebrow}>
            بررسی نهایی
          </Text>

          <Text style={styles.title}>
            جزئیات رزرو را بررسی کنید
          </Text>

          <Text style={styles.subtitle}>
            پیش از ارسال درخواست، خدمت، زمان، آدرس و هزینهٔ تخمینی را بررسی نمایید.
          </Text>
        </View>

        <GlassSurface
          variant="prominent"
          radius={Radius.xl}
          style={styles.providerCard}
          contentStyle={styles.providerContent}
        >
          <View style={styles.providerAvatar}>
            <Ionicons
              name="person-outline"
              size={25}
              color={Colors.primary}
            />
          </View>

          <View style={styles.providerCopy}>
            <Text style={styles.providerEyebrow}>
              ارائه‌دهنده
            </Text>

            <Text style={styles.providerName}>
              {bookingDraft.providerName ||
                "ارائه‌دهنده"}
            </Text>

            <Text style={styles.providerProfession}>
              {bookingDraft.providerProfession ||
                "متخصص خدمات"}
            </Text>
          </View>

          <View style={styles.verifiedBadge}>
            <Ionicons
              name="shield-checkmark"
              size={20}
              color={Colors.primary}
            />
          </View>
        </GlassSurface>

        <View style={styles.section}>
          <SectionHeader
            title="خدمت"
            onEdit={handleEditService}
          />

          <SummaryCard
            icon="briefcase-outline"
            title={
              bookingDraft.serviceName ||
              "خدمت انتخاب‌نشده"
            }
            subtitle={`هزینهٔ تخمینی: ${formatCurrency(
              servicePrice,
            )}`}
          />
        </View>

        <View style={styles.section}>
          <SectionHeader
            title="تاریخ و زمان"
            onEdit={handleEditSchedule}
          />

          <GlassSurface
            variant="regular"
            radius={Radius.xl}
            style={styles.detailsCard}
            contentStyle={styles.detailsContent}
          >
            <SummaryDetail
              icon="calendar-outline"
              label="تاریخ"
              value={formattedDate}
            />

            <View style={styles.divider} />

            <SummaryDetail
              icon="time-outline"
              label="زمان"
              value={formattedTime}
            />
          </GlassSurface>
        </View>

        <View style={styles.section}>
          <SectionHeader
            title="آدرس و توضیحات"
            onEdit={handleEditDetails}
          />

          <GlassSurface
            variant="regular"
            radius={Radius.xl}
            style={styles.detailsCard}
            contentStyle={styles.detailsContent}
          >
            <SummaryDetail
              icon="location-outline"
              label={
                bookingDraft.address?.label ||
                "آدرس"
              }
              value={
                bookingDraft.address
                  ?.fullAddress ||
                "آدرس انتخاب نشده است"
              }
            />

            <View style={styles.divider} />

            <View style={styles.notesBlock}>
              <View style={styles.notesHeader}>
                <Text style={styles.notesLabel}>
                  توضیحات درخواست
                </Text>

                <Ionicons
                  name="document-text-outline"
                  size={18}
                  color={Colors.textTertiary}
                />
              </View>

              <Text style={styles.notesText}>
                {bookingDraft.notes ||
                  "توضیحی وارد نشده است."}
              </Text>
            </View>
          </GlassSurface>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            خلاصهٔ هزینه
          </Text>

          <GlassSurface
            variant="regular"
            radius={Radius.xl}
            style={styles.priceCard}
            contentStyle={styles.priceContent}
          >
            <PriceRow
              label="هزینهٔ تخمینی خدمت"
              value={formatCurrency(servicePrice)}
            />

            <PriceRow
              label="هزینهٔ استفاده از پلتفرم"
              value={formatCurrency(PLATFORM_FEE)}
            />

            <View style={styles.priceDivider} />

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>
                مجموع تخمینی
              </Text>

              <Text style={styles.totalValue}>
                {formatCurrency(estimatedTotal)}
              </Text>
            </View>

            <Text style={styles.priceNotice}>
              مبلغ نهایی ممکن است پس از بررسی وضعیت کار توسط ارائه‌دهنده تغییر کند.
            </Text>
          </GlassSurface>
        </View>

        <GlassSurface
          variant="regular"
          radius={Radius.xl}
          style={styles.paymentNoticeCard}
          contentStyle={styles.paymentNoticeContent}
        >
          <View style={styles.paymentNoticeIcon}>
            <Ionicons
              name="cash-outline"
              size={23}
              color={Colors.warning}
            />
          </View>

          <View style={styles.paymentNoticeCopy}>
            <Text style={styles.paymentNoticeTitle}>
              پرداخت در محل
            </Text>

            <Text style={styles.paymentNoticeText}>
              در نسخهٔ فعلی، پرداخت پس از انجام خدمت و مستقیماً به ارائه‌دهنده انجام می‌شود.
            </Text>
          </View>
        </GlassSurface>

        <Pressable
          accessibilityRole="checkbox"
          accessibilityState={{
            checked: acceptedTerms,
          }}
          onPress={() =>
            setAcceptedTerms(
              (current) => !current,
            )
          }
          style={({ pressed }) => [
            styles.termsPressable,
            pressed && styles.pressed,
          ]}
        >
          <GlassSurface
            variant={
              acceptedTerms
                ? "prominent"
                : "regular"
            }
            radius={Radius.xl}
            style={[
              styles.termsCard,
              acceptedTerms &&
                styles.acceptedTermsCard,
            ]}
            contentStyle={styles.termsContent}
          >
            <View
              style={[
                styles.checkbox,
                acceptedTerms &&
                  styles.checkboxSelected,
              ]}
            >
              {acceptedTerms ? (
                <Ionicons
                  name="checkmark"
                  size={17}
                  color={Colors.white}
                />
              ) : null}
            </View>

            <Text style={styles.termsText}>
              تأیید می‌کنم که جزئیات رزرو درست است و شرایط لغو، تغییر زمان و پرداخت را می‌پذیرم.
            </Text>
          </GlassSurface>
        </Pressable>

        <GlassSurface
          variant="regular"
          radius={Radius.xl}
          style={styles.securityCard}
          contentStyle={styles.securityContent}
        >
          <View style={styles.securityIcon}>
            <Ionicons
              name="shield-checkmark-outline"
              size={23}
              color={Colors.success}
            />
          </View>

          <Text style={styles.securityText}>
            آدرس دقیق و شماره تماس شما فقط پس از پذیرش درخواست برای ارائه‌دهنده نمایش داده می‌شود.
          </Text>
        </GlassSurface>
      </ScrollView>

      <View style={styles.footer}>
        <GlassButton
          label="ارسال درخواست رزرو"
          icon="checkmark-circle-outline"
          iconPosition="left"
          loading={isSubmitting}
          disabled={!canSubmit}
          onPress={handleSubmit}
        />

        <Text style={styles.footerSummary}>
          مجموع تخمینی:{" "}
          {formatCurrency(estimatedTotal)}
        </Text>
      </View>
    </SafeAreaView>
  );
}

function SectionHeader({
  title,
  onEdit,
}: {
  title: string;
  onEdit: () => void;
}) {
  return (
    <View style={styles.sectionHeader}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`ویرایش ${title}`}
        onPress={onEdit}
        style={({ pressed }) => [
          styles.editButton,
          pressed && styles.pressed,
        ]}
      >
        <Ionicons
          name="create-outline"
          size={15}
          color={Colors.primary}
        />

        <Text style={styles.editText}>
          ویرایش
        </Text>
      </Pressable>

      <Text style={styles.sectionTitle}>
        {title}
      </Text>
    </View>
  );
}

function SummaryCard({
  icon,
  title,
  subtitle,
}: {
  icon: IconName;
  title: string;
  subtitle: string;
}) {
  return (
    <GlassSurface
      variant="regular"
      radius={Radius.xl}
      style={styles.summaryCard}
      contentStyle={styles.summaryContent}
    >
      <View style={styles.summaryIcon}>
        <Ionicons
          name={icon}
          size={23}
          color={Colors.primary}
        />
      </View>

      <View style={styles.summaryCopy}>
        <Text style={styles.summaryTitle}>
          {title}
        </Text>

        <Text style={styles.summarySubtitle}>
          {subtitle}
        </Text>
      </View>
    </GlassSurface>
  );
}

function SummaryDetail({
  icon,
  label,
  value,
}: {
  icon: IconName;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.detailRow}>
      <View style={styles.detailIcon}>
        <Ionicons
          name={icon}
          size={19}
          color={Colors.primary}
        />
      </View>

      <View style={styles.detailCopy}>
        <Text style={styles.detailLabel}>
          {label}
        </Text>

        <Text style={styles.detailValue}>
          {value}
        </Text>
      </View>
    </View>
  );
}

function PriceRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <View style={styles.priceRow}>
      <Text style={styles.priceValue}>
        {value}
      </Text>

      <Text style={styles.priceLabel}>
        {label}
      </Text>
    </View>
  );
}

function formatCurrency(
  amount: number,
): string {
  const formatted = new Intl.NumberFormat(
    "fa-AF",
  ).format(amount);

  return `${formatted} افغانی`;
}

function formatBookingDate(
  value: string,
): string {
  if (!value) {
    return "تاریخ انتخاب نشده";
  }

  const [year, month, day] = value
    .split("-")
    .map(Number);

  if (!year || !month || !day) {
    return value;
  }

  const date = new Date(
    year,
    month - 1,
    day,
  );

  const weekdays = [
    "یک‌شنبه",
    "دوشنبه",
    "سه‌شنبه",
    "چهارشنبه",
    "پنج‌شنبه",
    "جمعه",
    "شنبه",
  ];

  const months = [
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
  ];

  return `${weekdays[date.getDay()] ?? ""}، ${toDariDigits(
    day.toString(),
  )} ${months[date.getMonth()] ?? ""}`;
}

function formatTimeForDari(
  value: string,
): string {
  const labels: Record<string, string> = {
    "08:00": "۸:۰۰ صبح",
    "09:00": "۹:۰۰ صبح",
    "10:00": "۱۰:۰۰ صبح",
    "11:00": "۱۱:۰۰ صبح",
    "12:00": "۱۲:۰۰ ظهر",
    "13:00": "۱:۰۰ بعد از ظهر",
    "14:00": "۲:۰۰ بعد از ظهر",
    "15:00": "۳:۰۰ بعد از ظهر",
    "16:00": "۴:۰۰ بعد از ظهر",
    "17:00": "۵:۰۰ بعد از ظهر",
    "18:00": "۶:۰۰ عصر",
  };

  return labels[value] ?? value;
}

function toDariDigits(
  value: string,
): string {
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

  return value.replace(
    /\d/g,
    (digit) => digits[digit] ?? digit,
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  scrollContent: {
    width: "100%",
    maxWidth: Layout.contentMaxWidth,
    alignSelf: "center",
    paddingHorizontal: Layout.screenPadding,
    paddingTop: Spacing.md,
    paddingBottom: 160,
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
    width: "100%",
    marginTop: Spacing.xl,
    alignItems: "flex-end",
    gap: Spacing.xs,
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
    ...Typography.bodyStyle,
    width: "100%",
    color: Colors.textSecondary,
    textAlign: "right",
    writingDirection: "rtl",
  },

  providerCard: {
    width: "100%",
    marginTop: Spacing.xxl,
  },

  providerContent: {
    minHeight: 106,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: Spacing.md,
    padding: Spacing.lg,
  },

  providerAvatar: {
    width: 54,
    height: 54,
    flexShrink: 0,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primarySoft,
  },

  providerCopy: {
    flex: 1,
    alignItems: "flex-end",
    gap: 2,
  },

  providerEyebrow: {
    ...Typography.captionStyle,
    width: "100%",
    color: Colors.primary,
    textAlign: "right",
    writingDirection: "rtl",
  },

  providerName: {
    ...Typography.sectionTitle,
    width: "100%",
    color: Colors.textPrimary,
    textAlign: "right",
    writingDirection: "rtl",
    fontSize: 19,
    lineHeight: 25,
  },

  providerProfession: {
    ...Typography.captionStyle,
    width: "100%",
    color: Colors.textSecondary,
    textAlign: "right",
    writingDirection: "rtl",
  },

  verifiedBadge: {
    width: 40,
    height: 40,
    flexShrink: 0,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primarySoft,
  },

  section: {
    width: "100%",
    marginTop: Spacing.section,
    gap: Spacing.md,
  },

  sectionHeader: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  sectionTitle: {
    ...Typography.sectionTitle,
    color: Colors.textPrimary,
    textAlign: "right",
    writingDirection: "rtl",
    fontSize: 21,
    lineHeight: 28,
  },

  editButton: {
    minHeight: 36,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 5,
  },

  editText: {
    ...Typography.captionStyle,
    color: Colors.primary,
    writingDirection: "rtl",
  },

  summaryCard: {
    width: "100%",
  },

  summaryContent: {
    minHeight: 96,
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
    gap: 3,
  },

  summaryTitle: {
    ...Typography.label,
    width: "100%",
    color: Colors.textPrimary,
    textAlign: "right",
    writingDirection: "rtl",
    fontSize: 17,
    lineHeight: 23,
  },

  summarySubtitle: {
    ...Typography.captionStyle,
    width: "100%",
    color: Colors.textSecondary,
    textAlign: "right",
    writingDirection: "rtl",
  },

  detailsCard: {
    width: "100%",
  },

  detailsContent: {
    padding: Spacing.lg,
  },

  detailRow: {
    width: "100%",
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: Spacing.md,
  },

  detailIcon: {
    width: 42,
    height: 42,
    flexShrink: 0,
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primarySoft,
  },

  detailCopy: {
    flex: 1,
    alignItems: "flex-end",
    gap: 2,
  },

  detailLabel: {
    ...Typography.captionStyle,
    width: "100%",
    color: Colors.textTertiary,
    textAlign: "right",
    writingDirection: "rtl",
  },

  detailValue: {
    ...Typography.label,
    width: "100%",
    color: Colors.textPrimary,
    textAlign: "right",
    writingDirection: "rtl",
  },

  divider: {
    width: "100%",
    height: StyleSheet.hairlineWidth,
    marginVertical: Spacing.md,
    backgroundColor: Colors.separator,
  },

  notesBlock: {
    width: "100%",
    alignItems: "flex-end",
    gap: Spacing.sm,
  },

  notesHeader: {
    width: "100%",
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: Spacing.sm,
  },

  notesLabel: {
    ...Typography.captionStyle,
    color: Colors.textTertiary,
    textAlign: "right",
    writingDirection: "rtl",
  },

  notesText: {
    ...Typography.bodyStyle,
    width: "100%",
    color: Colors.textSecondary,
    textAlign: "right",
    writingDirection: "rtl",
    lineHeight: 24,
  },

  priceCard: {
    width: "100%",
  },

  priceContent: {
    padding: Spacing.lg,
    gap: Spacing.md,
  },

  priceRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.md,
  },

  priceLabel: {
    ...Typography.bodyStyle,
    color: Colors.textSecondary,
    textAlign: "right",
    writingDirection: "rtl",
  },

  priceValue: {
    ...Typography.label,
    color: Colors.textPrimary,
    textAlign: "left",
    writingDirection: "rtl",
  },

  priceDivider: {
    width: "100%",
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.separator,
  },

  totalRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.md,
  },

  totalLabel: {
    ...Typography.sectionTitle,
    color: Colors.textPrimary,
    textAlign: "right",
    writingDirection: "rtl",
    fontSize: 18,
  },

  totalValue: {
    ...Typography.sectionTitle,
    color: Colors.primary,
    textAlign: "left",
    writingDirection: "rtl",
    fontSize: 19,
  },

  priceNotice: {
    ...Typography.captionStyle,
    width: "100%",
    color: Colors.textTertiary,
    textAlign: "right",
    writingDirection: "rtl",
    lineHeight: 19,
  },

  paymentNoticeCard: {
    width: "100%",
    marginTop: Spacing.section,
    borderColor: "rgba(217, 154, 43, 0.28)",
    backgroundColor: "rgba(217, 154, 43, 0.06)",
  },

  paymentNoticeContent: {
    minHeight: 96,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: Spacing.md,
    padding: Spacing.lg,
  },

  paymentNoticeIcon: {
    width: 46,
    height: 46,
    flexShrink: 0,
    borderRadius: Radius.lg,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(217, 154, 43, 0.12)",
  },

  paymentNoticeCopy: {
    flex: 1,
    alignItems: "flex-end",
    gap: Spacing.xs,
  },

  paymentNoticeTitle: {
    ...Typography.label,
    width: "100%",
    color: Colors.textPrimary,
    textAlign: "right",
    writingDirection: "rtl",
  },

  paymentNoticeText: {
    ...Typography.captionStyle,
    width: "100%",
    color: Colors.textSecondary,
    textAlign: "right",
    writingDirection: "rtl",
    lineHeight: 19,
  },

  termsPressable: {
    width: "100%",
    marginTop: Spacing.section,
    borderRadius: Radius.xl,
  },

  termsCard: {
    width: "100%",
  },

  acceptedTermsCard: {
    borderColor: "rgba(76, 141, 255, 0.52)",
    backgroundColor: "rgba(76, 141, 255, 0.08)",
  },

  termsContent: {
    minHeight: 100,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: Spacing.md,
    padding: Spacing.lg,
  },

  checkbox: {
    width: 28,
    height: 28,
    flexShrink: 0,
    borderRadius: Radius.sm,
    borderWidth: 1.5,
    borderColor: Colors.borderStrong,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.glass,
  },

  checkboxSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary,
  },

  termsText: {
    ...Typography.bodyStyle,
    flex: 1,
    color: Colors.textSecondary,
    textAlign: "right",
    writingDirection: "rtl",
    lineHeight: 23,
  },

  securityCard: {
    width: "100%",
    marginTop: Spacing.lg,
    borderColor: "rgba(48, 183, 106, 0.26)",
    backgroundColor: "rgba(48, 183, 106, 0.05)",
  },

  securityContent: {
    minHeight: 88,
    flexDirection: "row-reverse",
    alignItems: "flex-start",
    gap: Spacing.md,
    padding: Spacing.lg,
  },

  securityIcon: {
    width: 42,
    height: 42,
    flexShrink: 0,
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(48, 183, 106, 0.12)",
  },

  securityText: {
    ...Typography.captionStyle,
    flex: 1,
    color: Colors.textSecondary,
    textAlign: "right",
    writingDirection: "rtl",
    lineHeight: 20,
  },

  footer: {
    position: "absolute",
    right: 0,
    bottom: 0,
    left: 0,
    minHeight: 108,
    paddingHorizontal: Layout.screenPadding,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
    gap: Spacing.sm,
    backgroundColor: "rgba(7, 10, 15, 0.96)",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.border,
  },

  footerSummary: {
    ...Typography.captionStyle,
    width: "100%",
    color: Colors.textTertiary,
    textAlign: "center",
    writingDirection: "rtl",
  },

  pressed: {
    opacity: 0.82,
  },
});