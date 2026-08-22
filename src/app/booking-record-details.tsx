import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import {
  ComponentProps,
  type ReactNode,
  useCallback,
  useMemo,
  useState,
} from "react";
import {
  Alert,
  Pressable,
  RefreshControl,
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
import {
  BookingStatus,
  PaymentStatus,
  useBooking,
} from "../context/booking-context";
import { useLanguage } from "../context/languagecontext";

type IconName = ComponentProps<typeof Ionicons>["name"];

type LanguageName = "English" | "Dari" | "Pashto";

type DetailsCopy = ReturnType<typeof getDetailsCopy>;

export default function BookingDetailsScreen() {
  const router = useRouter();

  const params = useLocalSearchParams<{
    bookingId?: string | string[];
  }>();

  const { bookings, isRefreshing, refreshBookings, updateBookingStatus } =
    useBooking();

  const { language } = useLanguage();

  const activeLanguage = normalizeLanguage(language);

  const isRtl = activeLanguage === "Dari" || activeLanguage === "Pashto";

  const copy = getDetailsCopy(activeLanguage);

  const [isCancelling, setIsCancelling] = useState(false);

  const bookingId = getSingleParam(params.bookingId);

  const booking = useMemo(
    () => bookings.find((item) => item.id === bookingId) ?? null,
    [bookingId, bookings],
  );

  /*
   * Booking status is server-authoritative. Refresh when this screen gains
   * focus so a provider-side Accept / Reject / Start / Complete action is
   * visible here immediately.
   */
  useFocusEffect(
    useCallback(() => {
      if (!bookingId) {
        return;
      }

      void refreshBookings().catch((error) => {
        console.warn("Could not refresh booking details:", error);
      });
    }, [bookingId, refreshBookings]),
  );

  const cancelBooking = (): void => {
    if (!booking || isCancelling) {
      return;
    }

    Alert.alert(copy.cancelTitle, copy.cancelMessage, [
      {
        text: copy.keepBooking,
        style: "cancel",
      },
      {
        text: copy.confirmCancel,
        style: "destructive",
        onPress: () => {
          setIsCancelling(true);

          void updateBookingStatus(booking.id, "cancelled")
            .then(() => refreshBookings())
            .catch((error) => {
              Alert.alert(
                copy.cancelFailedTitle,
                error instanceof Error
                  ? error.message
                  : copy.cancelFailedMessage,
              );
            })
            .finally(() => {
              setIsCancelling(false);
            });
        },
      },
    ]);
  };

  const openProvider = (): void => {
    if (!booking) {
      return;
    }

    router.push({
      pathname: "/provider-profile",
      params: {
        providerId: booking.providerId,
      },
    });
  };

  const openMessages = (): void => {
    if (!booking) {
      return;
    }

    router.push({
      pathname: "/(tabs)/messages",
      params: {
        providerId: booking.providerId,
        providerName: booking.providerName,
        bookingId: booking.id,
      },
    });
  };

  const repeatBooking = (): void => {
    if (!booking) {
      return;
    }

    router.push({
      pathname: "/booking-create",
      params: {
        providerId: booking.providerId,
        serviceId: booking.serviceId,
      },
    });
  };

  if (!bookingId) {
    return (
      <BookingUnavailable
        title={copy.missingTitle}
        message={copy.missingMessage}
        actionLabel={copy.backToBookings}
        isRtl={isRtl}
        onPress={() => router.replace("/(tabs)/bookings")}
      />
    );
  }

  if (!booking) {
    return (
      <BookingUnavailable
        title={copy.notFoundTitle}
        message={isRefreshing ? copy.loadingMessage : copy.notFoundMessage}
        actionLabel={copy.backToBookings}
        isRtl={isRtl}
        onPress={() => router.replace("/(tabs)/bookings")}
      />
    );
  }

  const status = getStatusConfig(booking.status, activeLanguage);

  const payment = getPaymentConfig(booking.paymentStatus, activeLanguage);

  const canMessage =
    booking.status === "confirmed" || booking.status === "in-progress";

  const canRepeat = booking.status === "completed";

  const canCancel =
    booking.status === "pending" || booking.status === "confirmed";

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => {
              void refreshBookings().catch((error) => {
                console.warn("Could not refresh booking details:", error);
              });
            }}
            tintColor={KhedmatPalette.blue500}
          />
        }
      >
        <View
          style={[
            styles.topBar,
            {
              flexDirection:
                isRtl
                  ? "row-reverse"
                  : "row",
            },
          ]}
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={copy.back}
            onPress={() => router.back()}
            style={({ pressed }) => [
              styles.iconButton,
              pressed && styles.pressed,
            ]}
          >
            <Ionicons
              name={
                isRtl
                  ? "arrow-forward"
                  : "arrow-back"
              }
              size={22}
              color={KhedmatPalette.navy900}
            />
          </Pressable>

          <Text
            style={[
              styles.title,
              directionStyle(isRtl),
            ]}
          >
            {copy.title}
          </Text>

          <View style={styles.iconButtonSpacer} />
        </View>

        <View style={styles.heroCard}>
          <View
            style={[
              styles.heroHeader,
              {
                flexDirection: isRtl ? "row-reverse" : "row",
              },
            ]}
          >
            <View style={styles.serviceIcon}>
              <Ionicons
                name={getServiceIcon(booking.serviceId)}
                size={28}
                color={KhedmatPalette.blue500}
              />
            </View>

            <View
              style={[
                styles.heroCopy,
                {
                  alignItems: isRtl ? "flex-end" : "flex-start",
                },
              ]}
            >
              <Text style={[styles.serviceName, directionStyle(isRtl)]}>
                {booking.serviceName}
              </Text>

              <Text style={[styles.reference, directionStyle(isRtl)]}>
                {copy.reference} {formatBookingReference(booking.id)}
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.badgesRow,
              {
                flexDirection: isRtl ? "row-reverse" : "row",
              },
            ]}
          >
            <StatusBadge
              icon={status.icon}
              label={status.label}
              color={status.color}
              backgroundColor={status.backgroundColor}
              isRtl={isRtl}
            />

            <StatusBadge
              icon={payment.icon}
              label={payment.label}
              color={payment.color}
              backgroundColor={payment.backgroundColor}
              isRtl={isRtl}
            />
          </View>
        </View>

        <Section title={copy.providerSection} isRtl={isRtl}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={copy.viewProvider}
            onPress={openProvider}
            style={({ pressed }) => [
              styles.providerCard,
              {
                flexDirection: isRtl ? "row-reverse" : "row",
              },
              pressed && styles.pressed,
            ]}
          >
            <View style={styles.providerAvatar}>
              <Text style={styles.providerInitials}>
                {getInitials(booking.providerName)}
              </Text>

              <View style={styles.verifiedBadge}>
                <Ionicons
                  name="checkmark"
                  size={10}
                  color={KhedmatPalette.white}
                />
              </View>
            </View>

            <View
              style={[
                styles.providerCopy,
                {
                  alignItems: isRtl ? "flex-end" : "flex-start",
                },
              ]}
            >
              <Text
                numberOfLines={1}
                style={[styles.providerName, directionStyle(isRtl)]}
              >
                {booking.providerName}
              </Text>

              <Text
                numberOfLines={1}
                style={[styles.providerProfession, directionStyle(isRtl)]}
              >
                {booking.providerProfession}
              </Text>
            </View>

            <Ionicons
              name={isRtl ? "chevron-back" : "chevron-forward"}
              size={20}
              color={KhedmatPalette.textMuted}
            />
          </Pressable>
        </Section>

        <Section title={copy.scheduleSection} isRtl={isRtl}>
          <View style={styles.card}>
            <DetailRow
              icon="calendar-outline"
              label={copy.date}
              value={formatBookingDate(booking.date, activeLanguage)}
              isRtl={isRtl}
            />

            <Divider />

            <DetailRow
              icon="time-outline"
              label={copy.time}
              value={formatBookingTime(booking.time, activeLanguage)}
              isRtl={isRtl}
            />

            <Divider />

            <DetailRow
              icon="location-outline"
              label={booking.address.label || copy.address}
              value={booking.address.fullAddress}
              isRtl={isRtl}
            />
          </View>
        </Section>

        <Section title={copy.priceSection} isRtl={isRtl}>
          <View style={styles.card}>
            <PriceRow
              label={copy.servicePrice}
              amount={booking.servicePrice}
              language={activeLanguage}
              isRtl={isRtl}
            />

            <Divider />

            <PriceRow
              label={copy.platformFee}
              amount={booking.platformFee}
              language={activeLanguage}
              isRtl={isRtl}
            />

            <View style={styles.totalDivider} />

            <PriceRow
              label={copy.total}
              amount={booking.total}
              language={activeLanguage}
              isRtl={isRtl}
              emphasized
            />
          </View>
        </Section>

        {booking.notes.trim() ? (
          <Section
            title={copy.notesSection}
            isRtl={isRtl}
          >
            <View style={styles.notesCard}>
              <Ionicons
                name="document-text-outline"
                size={18}
                color={KhedmatPalette.blue500}
              />

              <Text
                style={[
                  styles.notesText,
                  directionStyle(isRtl),
                ]}
              >
                {booking.notes.trim()}
              </Text>
            </View>
          </Section>
        ) : null}

        <View style={styles.actions}>
          {canMessage ? (
            <PrimaryAction
              icon="chatbubble-outline"
              label={copy.messageProvider}
              onPress={openMessages}
            />
          ) : null}

          {canRepeat ? (
            <PrimaryAction
              icon="refresh-outline"
              label={copy.bookAgain}
              onPress={repeatBooking}
            />
          ) : null}

          {canCancel ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={copy.cancelBooking}
              disabled={isCancelling}
              onPress={cancelBooking}
              style={({ pressed }) => [
                styles.cancelAction,
                (pressed || isCancelling) && styles.pressed,
              ]}
            >
              <Ionicons
                name="close-circle-outline"
                size={19}
                color={KhedmatPalette.error}
              />

              <Text style={styles.cancelActionText}>
                {isCancelling ? copy.cancelling : copy.cancelBooking}
              </Text>
            </Pressable>
          ) : null}

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={copy.backToBookings}
            onPress={() => router.replace("/(tabs)/bookings")}
            style={({ pressed }) => [
              styles.secondaryAction,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.secondaryActionText}>
              {copy.backToBookings}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

type StatusBadgeProps = {
  icon: IconName;
  label: string;
  color: string;
  backgroundColor: string;
  isRtl: boolean;
};

function StatusBadge({
  icon,
  label,
  color,
  backgroundColor,
  isRtl,
}: StatusBadgeProps) {
  return (
    <View
      style={[
        styles.statusBadge,
        {
          backgroundColor,
          flexDirection: isRtl ? "row-reverse" : "row",
        },
      ]}
    >
      <Ionicons name={icon} size={14} color={color} />

      <Text
        style={[
          styles.statusBadgeText,
          {
            color,
          },
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

type SectionProps = {
  title: string;
  isRtl: boolean;
  children: ReactNode;
};

function Section({ title, isRtl, children }: SectionProps) {
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, directionStyle(isRtl)]}>{title}</Text>

      {children}
    </View>
  );
}

type DetailRowProps = {
  icon: IconName;
  label: string;
  value: string;
  isRtl: boolean;
};

function DetailRow({ icon, label, value, isRtl }: DetailRowProps) {
  return (
    <View
      style={[
        styles.detailRow,
        {
          flexDirection: isRtl ? "row-reverse" : "row",
        },
      ]}
    >
      <View style={styles.detailIcon}>
        <Ionicons name={icon} size={19} color={KhedmatPalette.blue500} />
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

        <Text style={[styles.detailValue, directionStyle(isRtl)]}>{value}</Text>
      </View>
    </View>
  );
}

type PriceRowProps = {
  label: string;
  amount: number;
  language: LanguageName;
  isRtl: boolean;
  emphasized?: boolean;
};

function PriceRow({
  label,
  amount,
  language,
  isRtl,
  emphasized = false,
}: PriceRowProps) {
  return (
    <View
      style={[
        styles.priceRow,
        {
          flexDirection: isRtl ? "row-reverse" : "row",
        },
      ]}
    >
      <Text
        style={[
          emphasized ? styles.totalLabel : styles.priceLabel,
          directionStyle(isRtl),
        ]}
      >
        {label}
      </Text>

      <Text
        style={[
          emphasized ? styles.totalAmount : styles.priceAmount,
          directionStyle(isRtl),
        ]}
      >
        {formatCurrency(amount, language)}
      </Text>
    </View>
  );
}

type PrimaryActionProps = {
  icon: IconName;
  label: string;
  onPress: () => void;
};

function PrimaryAction({ icon, label, onPress }: PrimaryActionProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [styles.primaryAction, pressed && styles.pressed]}
    >
      <Ionicons name={icon} size={19} color={KhedmatPalette.white} />

      <Text style={styles.primaryActionText}>{label}</Text>
    </Pressable>
  );
}

type BookingUnavailableProps = {
  title: string;
  message: string;
  actionLabel: string;
  isRtl: boolean;
  onPress: () => void;
};

function BookingUnavailable({
  title,
  message,
  actionLabel,
  isRtl,
  onPress,
}: BookingUnavailableProps) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.unavailableRoot}>
        <View style={styles.unavailableIcon}>
          <Ionicons
            name="calendar-clear-outline"
            size={34}
            color={KhedmatPalette.blue500}
          />
        </View>

        <Text style={[styles.unavailableTitle, directionStyle(isRtl)]}>
          {title}
        </Text>

        <Text style={[styles.unavailableMessage, directionStyle(isRtl)]}>
          {message}
        </Text>

        <PrimaryAction
          icon="arrow-back-outline"
          label={actionLabel}
          onPress={onPress}
        />
      </View>
    </SafeAreaView>
  );
}

function getStatusConfig(
  status: BookingStatus,
  language: LanguageName,
): {
  label: string;
  icon: IconName;
  color: string;
  backgroundColor: string;
} {
  const labels = getStatusLabels(language);

  if (status === "confirmed") {
    return {
      label: labels.confirmed,
      icon: "checkmark-circle-outline",
      color: KhedmatPalette.blue500,
      backgroundColor: "#E1F2F7",
    };
  }

  if (status === "in-progress") {
    return {
      label: labels.inProgress,
      icon: "construct-outline",
      color: KhedmatPalette.navy700,
      backgroundColor: KhedmatPalette.blue050,
    };
  }

  if (status === "completed") {
    return {
      label: labels.completed,
      icon: "checkmark-done-outline",
      color: KhedmatPalette.success,
      backgroundColor: KhedmatPalette.successSoft,
    };
  }

  if (status === "cancelled") {
    return {
      label: labels.cancelled,
      icon: "close-circle-outline",
      color: KhedmatPalette.error,
      backgroundColor: KhedmatPalette.errorSoft,
    };
  }

  return {
    label: labels.pending,
    icon: "time-outline",
    color: KhedmatPalette.warning,
    backgroundColor: KhedmatPalette.warningSoft,
  };
}

function getPaymentConfig(
  status: PaymentStatus,
  language: LanguageName,
): {
  label: string;
  icon: IconName;
  color: string;
  backgroundColor: string;
} {
  const labels = getPaymentLabels(language);

  if (status === "paid") {
    return {
      label: labels.paid,
      icon: "card-outline",
      color: KhedmatPalette.success,
      backgroundColor: KhedmatPalette.successSoft,
    };
  }

  if (status === "refunded") {
    return {
      label: labels.refunded,
      icon: "return-down-back-outline",
      color: KhedmatPalette.navy700,
      backgroundColor: KhedmatPalette.blue050,
    };
  }

  return {
    label: labels.unpaid,
    icon: "wallet-outline",
    color: KhedmatPalette.warning,
    backgroundColor: KhedmatPalette.warningSoft,
  };
}

function getStatusLabels(language: LanguageName) {
  if (language === "English") {
    return {
      pending: "Pending",
      confirmed: "Confirmed",
      inProgress: "In progress",
      completed: "Completed",
      cancelled: "Cancelled",
    };
  }

  if (language === "Pashto") {
    return {
      pending: "په تمه",
      confirmed: "تایید شوی",
      inProgress: "د ترسره کېدو په حال کې",
      completed: "بشپړ شوی",
      cancelled: "لغوه شوی",
    };
  }

  return {
    pending: "در انتظار",
    confirmed: "تأییدشده",
    inProgress: "در حال انجام",
    completed: "تکمیل‌شده",
    cancelled: "لغوشده",
  };
}

function getPaymentLabels(language: LanguageName) {
  if (language === "English") {
    return {
      unpaid: "Unpaid",
      paid: "Paid",
      refunded: "Refunded",
    };
  }

  if (language === "Pashto") {
    return {
      unpaid: "ناورکړل شوی",
      paid: "ورکړل شوی",
      refunded: "بېرته ورکړل شوی",
    };
  }

  return {
    unpaid: "پرداخت‌نشده",
    paid: "پرداخت‌شده",
    refunded: "بازپرداخت‌شده",
  };
}

function getDetailsCopy(language: LanguageName) {
  if (language === "Dari") {
    return {
      eyebrow: "رزرو شما",
      title: "جزئیات",
      reference: "شماره",
      providerSection: "ارائه‌دهنده",
      scheduleSection: "زمان و آدرس",
      priceSection: "هزینه",
      notesSection: "یادداشت",
      date: "تاریخ",
      time: "زمان",
      address: "آدرس",
      servicePrice: "هزینهٔ خدمت",
      platformFee: "هزینهٔ پلتفرم",
      total: "مجموع",
      noNotes: "یادداشتی برای این رزرو ثبت نشده است.",
      viewProvider: "مشاهدهٔ ارائه‌دهنده",
      messageProvider: "پیام به ارائه‌دهنده",
      bookAgain: "رزرو دوباره",
      cancelBooking: "لغو رزرو",
      cancelling: "در حال لغو...",
      cancelTitle: "لغو رزرو؟",
      cancelMessage: "آیا مطمئن هستید که می‌خواهید این رزرو را لغو کنید؟",
      keepBooking: "حفظ رزرو",
      confirmCancel: "لغو رزرو",
      cancelFailedTitle: "لغو رزرو انجام نشد",
      cancelFailedMessage: "لطفاً دوباره تلاش کنید.",
      backToBookings: "بازگشت به رزروها",
      back: "بازگشت",
      missingTitle: "رزرو مشخص نیست",
      missingMessage: "شمارهٔ رزرو برای نمایش این صفحه موجود نیست.",
      notFoundTitle: "رزرو پیدا نشد",
      notFoundMessage: "این رزرو در فهرست رزروهای شما پیدا نشد.",
      loadingMessage: "در حال دریافت آخرین جزئیات رزرو...",
    };
  }

  if (language === "Pashto") {
    return {
      eyebrow: "ستاسو رزرف",
      title: "جزیات",
      reference: "شمېره",
      providerSection: "خدمت وړاندې کوونکی",
      scheduleSection: "وخت او پته",
      priceSection: "لګښت",
      notesSection: "یادښت",
      date: "نېټه",
      time: "وخت",
      address: "پته",
      servicePrice: "د خدمت بیه",
      platformFee: "د پلېټفارم فیس",
      total: "ټول",
      noNotes: "د دې رزرف لپاره کوم یادښت نشته.",
      viewProvider: "خدمت وړاندې کوونکی وګورئ",
      messageProvider: "خدمت وړاندې کوونکي ته پیغام",
      bookAgain: "بیا رزرف",
      cancelBooking: "رزرف لغوه کول",
      cancelling: "لغوه کېږي...",
      cancelTitle: "رزرف لغوه کړئ؟",
      cancelMessage: "ایا ډاډه یاست چې غواړئ دا رزرف لغوه کړئ؟",
      keepBooking: "رزرف وساتئ",
      confirmCancel: "لغوه کول",
      cancelFailedTitle: "رزرف لغوه نه شو",
      cancelFailedMessage: "مهرباني وکړئ بیا هڅه وکړئ.",
      backToBookings: "رزرفونو ته ستنېدل",
      back: "شاته",
      missingTitle: "رزرف نه دی ټاکل شوی",
      missingMessage: "د دې پاڼې لپاره د رزرف شمېره نشته.",
      notFoundTitle: "رزرف ونه موندل شو",
      notFoundMessage: "دا رزرف ستاسو په رزرفونو کې ونه موندل شو.",
      loadingMessage: "د رزرف وروستي جزیات رااخیستل کېږي...",
    };
  }

  return {
    eyebrow: "Your booking",
    title: "Details",
    reference: "Reference",
    providerSection: "Provider",
    scheduleSection: "Schedule & address",
    priceSection: "Price",
    notesSection: "Notes",
    date: "Date",
    time: "Time",
    address: "Address",
    servicePrice: "Service price",
    platformFee: "Platform fee",
    total: "Total",
    noNotes: "No notes were added to this booking.",
    viewProvider: "View provider",
    messageProvider: "Message provider",
    bookAgain: "Book again",
    cancelBooking: "Cancel booking",
    cancelling: "Cancelling...",
    cancelTitle: "Cancel booking?",
    cancelMessage:
      "Are you sure you want to cancel this booking? This action cannot be undone.",
    keepBooking: "Keep booking",
    confirmCancel: "Cancel booking",
    cancelFailedTitle: "Unable to cancel booking",
    cancelFailedMessage: "Please try again.",
    backToBookings: "Back to bookings",
    back: "Back",
    missingTitle: "Booking not specified",
    missingMessage: "A booking reference is required to display this page.",
    notFoundTitle: "Booking not found",
    notFoundMessage: "This booking could not be found in your bookings.",
    loadingMessage: "Loading the latest booking details...",
  };
}

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function getServiceIcon(serviceId: string): IconName {
  const normalized = serviceId.toLowerCase();

  if (
    normalized.includes("electric") ||
    normalized.includes("wiring") ||
    normalized.includes("socket")
  ) {
    return "flash-outline";
  }

  if (
    normalized.includes("plumb") ||
    normalized.includes("pipe") ||
    normalized.includes("water")
  ) {
    return "water-outline";
  }

  if (normalized.includes("clean")) {
    return "sparkles-outline";
  }

  if (
    normalized.includes("computer") ||
    normalized.includes("phone") ||
    normalized.includes("software")
  ) {
    return "laptop-outline";
  }

  if (
    normalized.includes("carpenter") ||
    normalized.includes("cabinet") ||
    normalized.includes("wood")
  ) {
    return "hammer-outline";
  }

  return "construct-outline";
}

function formatBookingReference(bookingId: string): string {
  const compact = bookingId.replace(/-/g, "").toUpperCase();

  if (compact.length <= 8) {
    return compact;
  }

  return compact.slice(0, 8);
}

function formatBookingDate(value: string, language: LanguageName): string {
  if (!value) {
    return "—";
  }

  const [year, month, day] = value.split("-").map(Number);

  if (!year || !month || !day) {
    return language === "English" ? value : formatDigits(value, true);
  }

  const date = new Date(year, month - 1, day);

  const locale = language === "English" ? "en-US" : "fa-AF";

  try {
    const formatted = new Intl.DateTimeFormat(locale, {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date);

    return language === "English" ? formatted : formatDigits(formatted, true);
  } catch {
    const fallback = `${day}/${month}/${year}`;

    return language === "English" ? fallback : formatDigits(fallback, true);
  }
}

function formatBookingTime(value: string, language: LanguageName): string {
  if (!value) {
    return "—";
  }

  const [hoursRaw, minutesRaw] = value.split(":");

  const hours = Number(hoursRaw);

  const minutes = Number(minutesRaw);

  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) {
    return language === "English" ? value : formatDigits(value, true);
  }

  const date = new Date();

  date.setHours(hours, minutes, 0, 0);

  try {
    const formatted = new Intl.DateTimeFormat(
      language === "English" ? "en-US" : "fa-AF",
      {
        hour: "numeric",
        minute: "2-digit",
      },
    ).format(date);

    return language === "English" ? formatted : formatDigits(formatted, true);
  } catch {
    const fallback = `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}`;

    return language === "English" ? fallback : formatDigits(fallback, true);
  }
}

function formatCurrency(amount: number, language: LanguageName): string {
  const formatted = new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(Math.round(amount));

  const localized =
    language === "English" ? formatted : formatDigits(formatted, true);

  return `${localized} AFN`;
}

function formatDigits(value: string, localized: boolean): string {
  if (!localized) {
    return value;
  }

  const digits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];

  return value.replace(/\d/g, (digit) => digits[Number(digit)]);
}

function getSingleParam(value: string | string[] | undefined): string {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
}

function normalizeLanguage(language: string | undefined): LanguageName {
  if (language === "Dari" || language === "Pashto") {
    return language;
  }

  return "English";
}

function directionStyle(isRtl: boolean) {
  return {
    textAlign: isRtl ? ("right" as const) : ("left" as const),
    writingDirection: isRtl ? ("rtl" as const) : ("ltr" as const),
  };
}

function Divider() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: KhedmatPalette.surfaceSoft,
  },

  scrollContent: {
    width: "100%",
    maxWidth: Layout.contentMaxWidth,
    alignSelf: "center",
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.huge,
  },

  topBar: {
    width: "100%",
    alignItems: "center",
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },

  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: KhedmatPalette.white,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: KhedmatPalette.border,
  },

  iconButtonSpacer: {
    width: 44,
    height: 44,
  },

  topBarCopy: {
    flex: 1,
    minWidth: 0,
  },

  eyebrow: {
    ...Typography.captionStyle,
    color: KhedmatPalette.blue500,
    fontFamily: Fonts.medium,
  },

  title: {
    ...Typography.screenTitle,
    marginTop: 2,
    color: KhedmatPalette.navy900,
  },

  heroCard: {
    padding: Spacing.lg,
    borderRadius: Radius.xl,
    backgroundColor: KhedmatPalette.white,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: KhedmatPalette.blue200,
    ...Shadows.small,
  },

  heroHeader: {
    alignItems: "center",
    gap: Spacing.md,
  },

  serviceIcon: {
    width: 54,
    height: 54,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: KhedmatPalette.blue050,
  },

  heroCopy: {
    flex: 1,
    minWidth: 0,
  },

  serviceName: {
    ...Typography.sectionTitle,
    color: KhedmatPalette.navy900,
    fontFamily: Fonts.bold,
  },

  reference: {
    ...Typography.captionStyle,
    marginTop: Spacing.xs,
    color: KhedmatPalette.textMuted,
  },

  badgesRow: {
    marginTop: Spacing.lg,
    flexWrap: "wrap",
    gap: Spacing.sm,
  },

  statusBadge: {
    alignItems: "center",
    gap: 5,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 7,
    borderRadius: Radius.pill,
  },

  statusBadgeText: {
    ...Typography.captionStyle,
    fontFamily: Fonts.medium,
  },

  section: {
    marginTop: Spacing.xl,
  },

  sectionTitle: {
    ...Typography.label,
    marginBottom: Spacing.sm,
    color: KhedmatPalette.navy900,
    fontFamily: Fonts.bold,
  },

  card: {
    borderRadius: Radius.lg,
    backgroundColor: KhedmatPalette.white,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: KhedmatPalette.border,
    overflow: "hidden",
  },

  providerCard: {
    alignItems: "center",
    gap: Spacing.md,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    backgroundColor: KhedmatPalette.white,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: KhedmatPalette.border,
  },

  providerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: KhedmatPalette.blue050,
    borderWidth: 1,
    borderColor: KhedmatPalette.blue200,
  },

  providerInitials: {
    color: KhedmatPalette.navy700,
    fontFamily: Fonts.bold,
    fontSize: 15,
  },

  verifiedBadge: {
    position: "absolute",
    right: -2,
    bottom: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: KhedmatPalette.blue500,
    borderWidth: 2,
    borderColor: KhedmatPalette.white,
  },

  providerCopy: {
    flex: 1,
    minWidth: 0,
  },

  providerName: {
    ...Typography.label,
    color: KhedmatPalette.navy900,
    fontFamily: Fonts.bold,
  },

  providerProfession: {
    ...Typography.captionStyle,
    marginTop: 2,
    color: KhedmatPalette.textSecondary,
  },

  detailRow: {
    alignItems: "flex-start",
    gap: Spacing.md,
    padding: Spacing.md,
  },

  detailIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: KhedmatPalette.blue050,
  },

  detailCopy: {
    flex: 1,
    minWidth: 0,
  },

  detailLabel: {
    ...Typography.captionStyle,
    color: KhedmatPalette.textMuted,
  },

  detailValue: {
    ...Typography.label,
    marginTop: 2,
    color: KhedmatPalette.navy900,
    fontFamily: Fonts.medium,
  },

  divider: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: Spacing.md,
    backgroundColor: KhedmatPalette.border,
  },

  priceRow: {
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },

  priceLabel: {
    ...Typography.bodyStyle,
    flex: 1,
    color: KhedmatPalette.textSecondary,
  },

  priceAmount: {
    ...Typography.label,
    color: KhedmatPalette.navy900,
    fontFamily: Fonts.medium,
  },

  totalDivider: {
    height: 1,
    marginHorizontal: Spacing.md,
    backgroundColor: KhedmatPalette.blue200,
  },

  totalLabel: {
    ...Typography.label,
    flex: 1,
    color: KhedmatPalette.navy900,
    fontFamily: Fonts.bold,
  },

  totalAmount: {
    ...Typography.sectionTitle,
    color: KhedmatPalette.success,
    fontFamily: Fonts.bold,
  },

  notesCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    backgroundColor: KhedmatPalette.white,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: KhedmatPalette.border,
  },

  notesText: {
    ...Typography.bodyStyle,
    flex: 1,
    color: KhedmatPalette.textSecondary,
  },

  actions: {
    marginTop: Spacing.xl,
    gap: Spacing.sm,
  },

  primaryAction: {
    minHeight: 52,
    borderRadius: Radius.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    backgroundColor: KhedmatPalette.navy700,
  },

  primaryActionText: {
    ...Typography.buttonLabel,
    color: KhedmatPalette.white,
    fontFamily: Fonts.bold,
  },

  cancelAction: {
    minHeight: 50,
    borderRadius: Radius.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    backgroundColor: KhedmatPalette.errorSoft,
    borderWidth: 1,
    borderColor: KhedmatPalette.error,
  },

  cancelActionText: {
    ...Typography.buttonLabel,
    color: KhedmatPalette.error,
    fontFamily: Fonts.bold,
  },

  secondaryAction: {
    minHeight: 50,
    borderRadius: Radius.lg,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.lg,
    backgroundColor: KhedmatPalette.white,
    borderWidth: 1,
    borderColor: KhedmatPalette.blue200,
  },

  secondaryActionText: {
    ...Typography.buttonLabel,
    color: KhedmatPalette.navy700,
    fontFamily: Fonts.medium,
  },

  unavailableRoot: {
    flex: 1,
    width: "100%",
    maxWidth: Layout.contentMaxWidth,
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.xl,
  },

  unavailableIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: KhedmatPalette.blue050,
    marginBottom: Spacing.lg,
  },

  unavailableTitle: {
    ...Typography.sectionTitle,
    color: KhedmatPalette.navy900,
    fontFamily: Fonts.bold,
    textAlign: "center",
  },

  unavailableMessage: {
    ...Typography.bodyStyle,
    marginTop: Spacing.sm,
    marginBottom: Spacing.xl,
    color: KhedmatPalette.textSecondary,
    textAlign: "center",
  },

  pressed: {
    opacity: 0.74,
  },
});
