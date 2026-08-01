import { Ionicons } from "@expo/vector-icons";
import {
    useLocalSearchParams,
    useRouter,
} from "expo-router";
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";

import { GlassButton } from "../components/glass/glass-button";
import { GlassSurface } from "../components/glass/glass-surface";
import {
    Colors,
    Layout,
    Radius,
    Spacing,
    Typography,
} from "../constants/theme";
import { useBooking } from "../context/booking-context";

export default function BookingSuccessScreen() {
  const router = useRouter();

  const params = useLocalSearchParams<{
    bookingId?: string | string[];
  }>();

  const bookingId = Array.isArray(params.bookingId)
    ? params.bookingId[0]
    : params.bookingId ?? "";

  const {
    bookingDraft,
    resetBookingDraft,
  } = useBooking();

  const handleViewBooking = () => {
    resetBookingDraft();

    router.replace("/(tabs)/bookings");
  };

  const handleGoHome = () => {
    resetBookingDraft();

    router.replace("/(tabs)");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.hero}>
          <GlassSurface
            variant="prominent"
            radius={Radius.xxl}
            style={styles.successSurface}
            contentStyle={styles.successContent}
          >
            <View style={styles.successInner}>
              <Ionicons
                name="checkmark"
                size={46}
                color={Colors.white}
              />
            </View>
          </GlassSurface>

          <View style={styles.heroCopy}>
            <Text style={styles.eyebrow}>
              درخواست ارسال شد
            </Text>

            <Text style={styles.title}>
              رزرو شما با موفقیت ثبت شد
            </Text>

            <Text style={styles.subtitle}>
              درخواست برای ارائه‌دهنده ارسال شده است. پس از بررسی و پذیرش،
              نتیجه از طریق اعلان و پیام به شما اطلاع داده می‌شود.
            </Text>
          </View>
        </View>

        <GlassSurface
          variant="regular"
          radius={Radius.xl}
          style={styles.statusCard}
          contentStyle={styles.statusContent}
        >
          <View style={styles.statusIcon}>
            <Ionicons
              name="time-outline"
              size={24}
              color={Colors.warning}
            />
          </View>

          <View style={styles.statusCopy}>
            <Text style={styles.statusLabel}>
              وضعیت رزرو
            </Text>

            <Text style={styles.statusTitle}>
              در انتظار تأیید ارائه‌دهنده
            </Text>

            <Text style={styles.statusSubtitle}>
              ارائه‌دهنده می‌تواند درخواست را بپذیرد، رد کند یا زمان دیگری
              پیشنهاد دهد.
            </Text>
          </View>
        </GlassSurface>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            خلاصهٔ درخواست
          </Text>

          <GlassSurface
            variant="regular"
            radius={Radius.xl}
            style={styles.summaryCard}
            contentStyle={styles.summaryContent}
          >
            <SummaryRow
              icon="person-outline"
              label="ارائه‌دهنده"
              value={
                bookingDraft.providerName ||
                "ارائه‌دهنده"
              }
            />

            <View style={styles.divider} />

            <SummaryRow
              icon="briefcase-outline"
              label="خدمت"
              value={
                bookingDraft.serviceName ||
                "خدمت انتخاب‌شده"
              }
            />

            <View style={styles.divider} />

            <SummaryRow
              icon="calendar-outline"
              label="تاریخ"
              value={formatBookingDate(
                bookingDraft.date,
              )}
            />

            <View style={styles.divider} />

            <SummaryRow
              icon="time-outline"
              label="زمان"
              value={formatTimeForDari(
                bookingDraft.time,
              )}
            />

            <View style={styles.divider} />

            <SummaryRow
              icon="location-outline"
              label={
                bookingDraft.address?.label ||
                "آدرس"
              }
              value={
                bookingDraft.address
                  ?.fullAddress ||
                "آدرس ثبت نشده"
              }
            />
          </GlassSurface>
        </View>

        {bookingId ? (
          <GlassSurface
            variant="regular"
            radius={Radius.xl}
            style={styles.referenceCard}
            contentStyle={styles.referenceContent}
          >
            <View style={styles.referenceIcon}>
              <Ionicons
                name="receipt-outline"
                size={22}
                color={Colors.primary}
              />
            </View>

            <View style={styles.referenceCopy}>
              <Text style={styles.referenceLabel}>
                شمارهٔ پیگیری
              </Text>

              <Text
                numberOfLines={1}
                style={styles.referenceValue}
              >
                {bookingId}
              </Text>
            </View>
          </GlassSurface>
        ) : null}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            مرحلهٔ بعد چه می‌شود؟
          </Text>

          <View style={styles.steps}>
            <ProcessStep
              number="۱"
              icon="notifications-outline"
              title="بررسی درخواست"
              subtitle="ارائه‌دهنده جزئیات، زمان و آدرس درخواست را بررسی می‌کند."
            />

            <View style={styles.connector} />

            <ProcessStep
              number="۲"
              icon="checkmark-circle-outline"
              title="پذیرش یا پیشنهاد زمان"
              subtitle="در صورت پذیرش، رزرو تأیید می‌شود؛ در غیر آن زمان دیگری پیشنهاد خواهد شد."
            />

            <View style={styles.connector} />

            <ProcessStep
              number="۳"
              icon="chatbubble-outline"
              title="فعال‌شدن گفتگو"
              subtitle="پس از تأیید، می‌توانید جزئیات بیشتر را با ارائه‌دهنده هماهنگ کنید."
            />

            <View style={styles.connector} />

            <ProcessStep
              number="۴"
              icon="construct-outline"
              title="انجام خدمت"
              subtitle="ارائه‌دهنده در زمان تأییدشده به محل شما می‌آید و خدمت را انجام می‌دهد."
            />
          </View>
        </View>

        <GlassSurface
          variant="regular"
          radius={Radius.xl}
          style={styles.noticeCard}
          contentStyle={styles.noticeContent}
        >
          <View style={styles.noticeIcon}>
            <Ionicons
              name="information-circle-outline"
              size={23}
              color={Colors.primary}
            />
          </View>

          <View style={styles.noticeCopy}>
            <Text style={styles.noticeTitle}>
              اعلان‌ها را فعال نگه دارید
            </Text>

            <Text style={styles.noticeText}>
              تغییر وضعیت، پیشنهاد زمان جدید و پیام‌های ارائه‌دهنده از طریق
              اعلان برنامه به شما ارسال می‌شوند.
            </Text>
          </View>
        </GlassSurface>
      </ScrollView>

      <View style={styles.footer}>
        <GlassButton
          label="مشاهدهٔ رزرو"
          icon="calendar-outline"
          iconPosition="left"
          onPress={handleViewBooking}
          style={styles.primaryAction}
        />

        <GlassButton
          label="رفتن به خانه"
          icon="home-outline"
          iconPosition="left"
          variant="secondary"
          fullWidth={false}
          onPress={handleGoHome}
          style={styles.secondaryAction}
        />
      </View>
    </SafeAreaView>
  );
}

function SummaryRow({
  icon,
  label,
  value,
}: {
  icon:
    | "person-outline"
    | "briefcase-outline"
    | "calendar-outline"
    | "time-outline"
    | "location-outline";
  label: string;
  value: string;
}) {
  return (
    <View style={styles.summaryRow}>
      <View style={styles.summaryIcon}>
        <Ionicons
          name={icon}
          size={19}
          color={Colors.primary}
        />
      </View>

      <View style={styles.summaryCopy}>
        <Text style={styles.summaryLabel}>
          {label}
        </Text>

        <Text style={styles.summaryValue}>
          {value}
        </Text>
      </View>
    </View>
  );
}

function ProcessStep({
  number,
  icon,
  title,
  subtitle,
}: {
  number: string;
  icon:
    | "notifications-outline"
    | "checkmark-circle-outline"
    | "chatbubble-outline"
    | "construct-outline";
  title: string;
  subtitle: string;
}) {
  return (
    <GlassSurface
      variant="regular"
      radius={Radius.xl}
      style={styles.stepCard}
      contentStyle={styles.stepContent}
    >
      <View style={styles.stepIcon}>
        <Ionicons
          name={icon}
          size={22}
          color={Colors.primary}
        />
      </View>

      <View style={styles.stepCopy}>
        <Text style={styles.stepTitle}>
          {title}
        </Text>

        <Text style={styles.stepSubtitle}>
          {subtitle}
        </Text>
      </View>

      <View style={styles.stepNumber}>
        <Text style={styles.stepNumberText}>
          {number}
        </Text>
      </View>
    </GlassSurface>
  );
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
    paddingTop: Spacing.screen,
    paddingBottom: 150,
  },

  hero: {
    width: "100%",
    alignItems: "center",
    gap: Spacing.xxl,
  },

  successSurface: {
    width: 116,
    height: 116,
    borderColor: "rgba(48, 183, 106, 0.42)",
    backgroundColor: "rgba(48, 183, 106, 0.10)",
  },

  successContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  successInner: {
    width: 72,
    height: 72,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.success,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255, 255, 255, 0.26)",
  },

  heroCopy: {
    width: "100%",
    alignItems: "center",
    gap: Spacing.sm,
  },

  eyebrow: {
    ...Typography.captionStyle,
    color: Colors.success,
    textAlign: "center",
    writingDirection: "rtl",
  },

  title: {
    ...Typography.screenTitle,
    width: "100%",
    maxWidth: 460,
    color: Colors.textPrimary,
    textAlign: "center",
    writingDirection: "rtl",
    fontSize: 29,
    lineHeight: 37,
  },

  subtitle: {
    ...Typography.bodyLarge,
    width: "100%",
    maxWidth: 470,
    color: Colors.textSecondary,
    textAlign: "center",
    writingDirection: "rtl",
    lineHeight: 25,
  },

  statusCard: {
    width: "100%",
    marginTop: Spacing.screen,
    borderColor: "rgba(217, 154, 43, 0.30)",
    backgroundColor: "rgba(217, 154, 43, 0.06)",
  },

  statusContent: {
    minHeight: 112,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: Spacing.md,
    padding: Spacing.lg,
  },

  statusIcon: {
    width: 50,
    height: 50,
    flexShrink: 0,
    borderRadius: Radius.lg,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(217, 154, 43, 0.12)",
  },

  statusCopy: {
    flex: 1,
    alignItems: "flex-end",
    gap: Spacing.xs,
  },

  statusLabel: {
    ...Typography.captionStyle,
    width: "100%",
    color: Colors.warning,
    textAlign: "right",
    writingDirection: "rtl",
  },

  statusTitle: {
    ...Typography.sectionTitle,
    width: "100%",
    color: Colors.textPrimary,
    textAlign: "right",
    writingDirection: "rtl",
    fontSize: 19,
    lineHeight: 25,
  },

  statusSubtitle: {
    ...Typography.captionStyle,
    width: "100%",
    color: Colors.textSecondary,
    textAlign: "right",
    writingDirection: "rtl",
    lineHeight: 19,
  },

  section: {
    width: "100%",
    marginTop: Spacing.section,
    gap: Spacing.lg,
  },

  sectionTitle: {
    ...Typography.sectionTitle,
    width: "100%",
    color: Colors.textPrimary,
    textAlign: "right",
    writingDirection: "rtl",
    fontSize: 21,
    lineHeight: 28,
  },

  summaryCard: {
    width: "100%",
  },

  summaryContent: {
    padding: Spacing.lg,
  },

  summaryRow: {
    width: "100%",
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: Spacing.md,
  },

  summaryIcon: {
    width: 42,
    height: 42,
    flexShrink: 0,
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primarySoft,
  },

  summaryCopy: {
    flex: 1,
    alignItems: "flex-end",
    gap: 2,
  },

  summaryLabel: {
    ...Typography.captionStyle,
    width: "100%",
    color: Colors.textTertiary,
    textAlign: "right",
    writingDirection: "rtl",
  },

  summaryValue: {
    ...Typography.label,
    width: "100%",
    color: Colors.textPrimary,
    textAlign: "right",
    writingDirection: "rtl",
    lineHeight: 22,
  },

  divider: {
    width: "100%",
    height: StyleSheet.hairlineWidth,
    marginVertical: Spacing.md,
    backgroundColor: Colors.separator,
  },

  referenceCard: {
    width: "100%",
    marginTop: Spacing.lg,
  },

  referenceContent: {
    minHeight: 88,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: Spacing.md,
    padding: Spacing.lg,
  },

  referenceIcon: {
    width: 44,
    height: 44,
    flexShrink: 0,
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primarySoft,
  },

  referenceCopy: {
    flex: 1,
    alignItems: "flex-end",
    gap: 3,
  },

  referenceLabel: {
    ...Typography.captionStyle,
    width: "100%",
    color: Colors.textTertiary,
    textAlign: "right",
    writingDirection: "rtl",
  },

  referenceValue: {
    ...Typography.label,
    width: "100%",
    color: Colors.primary,
    textAlign: "right",
  },

  steps: {
    width: "100%",
  },

  stepCard: {
    width: "100%",
  },

  stepContent: {
    minHeight: 106,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: Spacing.md,
    padding: Spacing.lg,
  },

  stepIcon: {
    width: 48,
    height: 48,
    flexShrink: 0,
    borderRadius: Radius.lg,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primarySoft,
  },

  stepCopy: {
    flex: 1,
    alignItems: "flex-end",
    gap: Spacing.xs,
  },

  stepTitle: {
    ...Typography.label,
    width: "100%",
    color: Colors.textPrimary,
    textAlign: "right",
    writingDirection: "rtl",
    fontSize: 17,
    lineHeight: 23,
  },

  stepSubtitle: {
    ...Typography.captionStyle,
    width: "100%",
    color: Colors.textSecondary,
    textAlign: "right",
    writingDirection: "rtl",
    lineHeight: 19,
  },

  stepNumber: {
    width: 30,
    height: 30,
    flexShrink: 0,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.glassStrong,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.borderStrong,
  },

  stepNumberText: {
    ...Typography.captionStyle,
    color: Colors.textPrimary,
    fontWeight: "700",
  },

  connector: {
    width: 2,
    height: Spacing.md,
    alignSelf: "flex-end",
    marginRight: 23,
    backgroundColor: Colors.separator,
  },

  noticeCard: {
    width: "100%",
    marginTop: Spacing.section,
  },

  noticeContent: {
    minHeight: 104,
    flexDirection: "row-reverse",
    alignItems: "flex-start",
    gap: Spacing.md,
    padding: Spacing.lg,
  },

  noticeIcon: {
    width: 46,
    height: 46,
    flexShrink: 0,
    borderRadius: Radius.lg,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primarySoft,
  },

  noticeCopy: {
    flex: 1,
    alignItems: "flex-end",
    gap: Spacing.xs,
  },

  noticeTitle: {
    ...Typography.label,
    width: "100%",
    color: Colors.textPrimary,
    textAlign: "right",
    writingDirection: "rtl",
  },

  noticeText: {
    ...Typography.captionStyle,
    width: "100%",
    color: Colors.textSecondary,
    textAlign: "right",
    writingDirection: "rtl",
    lineHeight: 19,
  },

  footer: {
    position: "absolute",
    right: 0,
    bottom: 0,
    left: 0,
    minHeight: 94,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: Spacing.sm,
    paddingHorizontal: Layout.screenPadding,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
    backgroundColor: "rgba(7, 10, 15, 0.96)",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.border,
  },

  primaryAction: {
    flex: 1,
  },

  secondaryAction: {
    minWidth: 132,
  },
});