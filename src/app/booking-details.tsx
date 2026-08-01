import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ComponentProps, useMemo, useState } from "react";
import {
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";

import { GlassButton } from "../components/glass/glass-button";
import { GlassIconButton } from "../components/glass/glass-icon-button";
import { GlassInput } from "../components/glass/glass-input";
import { GlassSurface } from "../components/glass/glass-surface";
import {
    Colors,
    Layout,
    Radius,
    Shadows,
    Spacing,
    Typography,
} from "../constants/theme";
import {
    BookingAddress,
    useBooking,
} from "../context/booking-context";

type IconName = ComponentProps<typeof Ionicons>["name"];

type AddressOption = BookingAddress & {
  icon: IconName;
  subtitle: string;
};

const savedAddresses: AddressOption[] = [
  {
    id: "home",
    label: "خانه",
    fullAddress: "کابل، ناحیه دهم، سرک سوم، خانه ۲۴",
    subtitle: "آدرس اصلی",
    latitude: 34.5553,
    longitude: 69.2075,
    icon: "home-outline",
  },
  {
    id: "work",
    label: "محل کار",
    fullAddress: "کابل، شهر نو، سرک انصاری، ساختمان ۸",
    subtitle: "آدرس ذخیره‌شده",
    latitude: 34.5326,
    longitude: 69.1717,
    icon: "business-outline",
  },
];

export default function BookingDetailsScreen() {
  const router = useRouter();

  const {
    bookingDraft,
    updateBookingDraft,
  } = useBooking();

  const initialAddressId =
    bookingDraft.address?.id &&
    savedAddresses.some(
      (address) =>
        address.id === bookingDraft.address?.id,
    )
      ? bookingDraft.address.id
      : "";

  const initialManualAddress =
    bookingDraft.address &&
    !initialAddressId
      ? bookingDraft.address.fullAddress
      : "";

  const [selectedAddressId, setSelectedAddressId] =
    useState(initialAddressId);

  const [manualAddressEnabled, setManualAddressEnabled] =
    useState(Boolean(initialManualAddress));

  const [manualAddress, setManualAddress] =
    useState(initialManualAddress);

  const [notes, setNotes] = useState(
    bookingDraft.notes,
  );

  const [contactNotes, setContactNotes] =
    useState("");

  const [submitted, setSubmitted] = useState(false);

  const selectedSavedAddress = useMemo(
    () =>
      savedAddresses.find(
        (address) =>
          address.id === selectedAddressId,
      ) ?? null,
    [selectedAddressId],
  );

  const resolvedAddress = useMemo<BookingAddress | null>(
    () => {
      if (manualAddressEnabled) {
        const normalizedAddress =
          manualAddress.trim();

        if (normalizedAddress.length < 8) {
          return null;
        }

        return {
          label: "آدرس دیگر",
          fullAddress: normalizedAddress,
        };
      }

      if (!selectedSavedAddress) {
        return null;
      }

      return {
        id: selectedSavedAddress.id,
        label: selectedSavedAddress.label,
        fullAddress:
          selectedSavedAddress.fullAddress,
        latitude:
          selectedSavedAddress.latitude,
        longitude:
          selectedSavedAddress.longitude,
      };
    },
    [
      manualAddress,
      manualAddressEnabled,
      selectedSavedAddress,
    ],
  );

  const addressError =
    submitted && !resolvedAddress
      ? manualAddressEnabled
        ? "لطفاً آدرس کامل و معتبر را وارد کنید."
        : "لطفاً یک آدرس را انتخاب کنید."
      : undefined;

  const notesError =
    submitted && notes.trim().length < 10
      ? "لطفاً مشکل یا کار مورد نیاز را با حداقل ۱۰ حرف توضیح دهید."
      : undefined;

  const formIsValid =
    Boolean(resolvedAddress) &&
    notes.trim().length >= 10;

  const selectSavedAddress = (
    addressId: string,
  ) => {
    setSelectedAddressId(addressId);
    setManualAddressEnabled(false);

    if (submitted) {
      setSubmitted(false);
    }
  };

  const enableManualAddress = () => {
    setSelectedAddressId("");
    setManualAddressEnabled(true);

    if (submitted) {
      setSubmitted(false);
    }
  };

  const handleContinue = () => {
    setSubmitted(true);

    if (!formIsValid || !resolvedAddress) {
      return;
    }

    const combinedNotes = [
      notes.trim(),
      contactNotes.trim()
        ? `یادداشت دسترسی و تماس: ${contactNotes.trim()}`
        : "",
    ]
      .filter(Boolean)
      .join("\n\n");

    updateBookingDraft({
      address: resolvedAddress,
      notes: combinedNotes,
    });

    router.push("/booking-summary");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={
          styles.scrollContent
        }
      >
        <View style={styles.topBar}>
          <GlassIconButton
            icon="chevron-back"
            accessibilityLabel="بازگشت"
            onPress={() => router.back()}
          />

          <Text style={styles.stepText}>
            مرحله ۳ از ۴
          </Text>
        </View>

        <View style={styles.header}>
          <Text style={styles.eyebrow}>
            جزئیات خدمت
          </Text>

          <Text style={styles.title}>
            آدرس و توضیحات کار را وارد کنید
          </Text>

          <Text style={styles.subtitle}>
            آدرس انجام خدمت و اطلاعات لازم برای
            آماده‌شدن ارائه‌دهنده را مشخص کنید.
          </Text>
        </View>

        <GlassSurface
          variant="regular"
          radius={Radius.xl}
          style={styles.summaryCard}
          contentStyle={styles.summaryContent}
        >
          <View style={styles.summaryIcon}>
            <Ionicons
              name="calendar-outline"
              size={23}
              color={Colors.primary}
            />
          </View>

          <View style={styles.summaryCopy}>
            <Text style={styles.summaryEyebrow}>
              رزرو فعلی
            </Text>

            <Text style={styles.summaryTitle}>
              {bookingDraft.serviceName ||
                "خدمت انتخاب‌شده"}
            </Text>

            <Text style={styles.summarySubtitle}>
              {formatBookingDate(
                bookingDraft.date,
              )}{" "}
              ·{" "}
              {formatTimeForDari(
                bookingDraft.time,
              )}
            </Text>
          </View>
        </GlassSurface>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              آدرس انجام خدمت
            </Text>

            <Text style={styles.sectionSubtitle}>
              یک آدرس ذخیره‌شده را انتخاب کنید یا
              آدرس دیگری وارد نمایید.
            </Text>
          </View>

          <View style={styles.addresses}>
            {savedAddresses.map((address) => {
              const selected =
                !manualAddressEnabled &&
                selectedAddressId === address.id;

              return (
                <Pressable
                  key={address.id}
                  accessibilityRole="radio"
                  accessibilityLabel={
                    address.label
                  }
                  accessibilityState={{
                    selected,
                  }}
                  onPress={() =>
                    selectSavedAddress(
                      address.id ?? "",
                    )
                  }
                  style={({ pressed }) => [
                    styles.addressPressable,
                    pressed &&
                      styles.cardPressed,
                  ]}
                >
                  <GlassSurface
                    variant={
                      selected
                        ? "prominent"
                        : "regular"
                    }
                    radius={Radius.xl}
                    style={[
                      styles.addressSurface,
                      selected &&
                        styles.selectedAddressSurface,
                      selected && Shadows.small,
                    ]}
                    contentStyle={
                      styles.addressContent
                    }
                  >
                    <View
                      style={[
                        styles.addressIcon,
                        selected &&
                          styles.selectedAddressIcon,
                      ]}
                    >
                      <Ionicons
                        name={address.icon}
                        size={23}
                        color={
                          selected
                            ? Colors.white
                            : Colors.primary
                        }
                      />
                    </View>

                    <View style={styles.addressCopy}>
                      <View
                        style={
                          styles.addressTitleRow
                        }
                      >
                        <Text
                          style={[
                            styles.addressTitle,
                            selected &&
                              styles.selectedAddressTitle,
                          ]}
                        >
                          {address.label}
                        </Text>

                        <Text
                          style={
                            styles.addressSubtitle
                          }
                        >
                          {address.subtitle}
                        </Text>
                      </View>

                      <Text
                        style={
                          styles.fullAddressText
                        }
                      >
                        {address.fullAddress}
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.radioOuter,
                        selected &&
                          styles.radioOuterSelected,
                      ]}
                    >
                      {selected ? (
                        <View
                          style={styles.radioInner}
                        />
                      ) : null}
                    </View>
                  </GlassSurface>
                </Pressable>
              );
            })}

            <Pressable
              accessibilityRole="radio"
              accessibilityLabel="وارد کردن آدرس دیگر"
              accessibilityState={{
                selected: manualAddressEnabled,
              }}
              onPress={enableManualAddress}
              style={({ pressed }) => [
                styles.addressPressable,
                pressed && styles.cardPressed,
              ]}
            >
              <GlassSurface
                variant={
                  manualAddressEnabled
                    ? "prominent"
                    : "regular"
                }
                radius={Radius.xl}
                style={[
                  styles.addressSurface,
                  manualAddressEnabled &&
                    styles.selectedAddressSurface,
                ]}
                contentStyle={
                  styles.addressContent
                }
              >
                <View
                  style={[
                    styles.addressIcon,
                    manualAddressEnabled &&
                      styles.selectedAddressIcon,
                  ]}
                >
                  <Ionicons
                    name="add-outline"
                    size={24}
                    color={
                      manualAddressEnabled
                        ? Colors.white
                        : Colors.primary
                    }
                  />
                </View>

                <View style={styles.addressCopy}>
                  <Text
                    style={[
                      styles.addressTitle,
                      manualAddressEnabled &&
                        styles.selectedAddressTitle,
                    ]}
                  >
                    آدرس دیگر
                  </Text>

                  <Text
                    style={
                      styles.fullAddressText
                    }
                  >
                    آدرس جدید را برای این رزرو وارد
                    کنید.
                  </Text>
                </View>

                <View
                  style={[
                    styles.radioOuter,
                    manualAddressEnabled &&
                      styles.radioOuterSelected,
                  ]}
                >
                  {manualAddressEnabled ? (
                    <View
                      style={styles.radioInner}
                    />
                  ) : null}
                </View>
              </GlassSurface>
            </Pressable>

            {manualAddressEnabled ? (
              <GlassInput
                label="آدرس کامل"
                placeholder="ولایت، شهر یا ولسوالی، ناحیه، سرک و شماره خانه"
                value={manualAddress}
                onChangeText={(value) => {
                  setManualAddress(value);

                  if (submitted) {
                    setSubmitted(false);
                  }
                }}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                style={styles.addressInput}
                error={addressError}
              />
            ) : null}

            {!manualAddressEnabled &&
            addressError ? (
              <Text style={styles.errorText}>
                {addressError}
              </Text>
            ) : null}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              توضیح مشکل یا کار
            </Text>

            <Text style={styles.sectionSubtitle}>
              توضیح روشن به ارائه‌دهنده کمک می‌کند
              ابزار و زمان مناسب را آماده کند.
            </Text>
          </View>

          <GlassInput
            label="شرح درخواست"
            placeholder="مثلاً برق دو اتاق قطع شده و فیوز چند بار خاموش می‌شود..."
            value={notes}
            onChangeText={(value) => {
              setNotes(value);

              if (submitted) {
                setSubmitted(false);
              }
            }}
            multiline
            numberOfLines={7}
            textAlignVertical="top"
            style={styles.notesInput}
            error={notesError}
          />

          <View style={styles.characterRow}>
            <Text
              style={[
                styles.characterCount,
                notes.trim().length >= 10 &&
                  styles.characterCountValid,
              ]}
            >
              {toDariDigits(
                notes.length.toString(),
              )}{" "}
              حرف
            </Text>

            <Text
              style={
                styles.characterRequirement
              }
            >
              حداقل ۱۰ حرف
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              راهنمای دسترسی و تماس
            </Text>

            <Text style={styles.sectionSubtitle}>
              این بخش اختیاری است.
            </Text>
          </View>

          <GlassInput
            label="یادداشت اضافی"
            placeholder="مثلاً قبل از رسیدن تماس بگیرید، زنگ در خراب است یا ورودی از کوچه پشتی است..."
            value={contactNotes}
            onChangeText={setContactNotes}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            style={styles.contactInput}
          />
        </View>

        <GlassSurface
          variant="regular"
          radius={Radius.xl}
          style={styles.photoPlaceholderCard}
          contentStyle={
            styles.photoPlaceholderContent
          }
        >
          <View style={styles.photoIcon}>
            <Ionicons
              name="images-outline"
              size={24}
              color={Colors.textTertiary}
            />
          </View>

          <View style={styles.photoCopy}>
            <Text style={styles.photoTitle}>
              افزودن عکس
            </Text>

            <Text style={styles.photoSubtitle}>
              در نسخهٔ بعد می‌توانید عکس مشکل یا
              محل کار را به درخواست پیوست کنید.
            </Text>
          </View>

          <View style={styles.comingSoonBadge}>
            <Text style={styles.comingSoonText}>
              به‌زودی
            </Text>
          </View>
        </GlassSurface>

        <GlassSurface
          variant="regular"
          radius={Radius.xl}
          style={styles.noticeCard}
          contentStyle={styles.noticeContent}
        >
          <View style={styles.noticeIcon}>
            <Ionicons
              name="shield-checkmark-outline"
              size={22}
              color={Colors.success}
            />
          </View>

          <Text style={styles.noticeText}>
            آدرس دقیق شما فقط پس از پذیرش درخواست
            برای ارائه‌دهنده نمایش داده می‌شود.
          </Text>
        </GlassSurface>
      </ScrollView>

      <View style={styles.footer}>
        <GlassButton
          label="بررسی و تأیید رزرو"
          icon="document-text-outline"
          iconPosition="left"
          onPress={handleContinue}
        />

        <Text style={styles.footerSummary}>
          {resolvedAddress
            ? `${resolvedAddress.label} · ${resolvedAddress.fullAddress}`
            : "برای ادامه آدرس و توضیحات کار را تکمیل کنید."}
        </Text>
      </View>
    </SafeAreaView>
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

  const weekday =
    weekdays[date.getDay()] ?? "";

  const monthLabel =
    months[date.getMonth()] ?? "";

  return `${weekday}، ${toDariDigits(
    day.toString(),
  )} ${monthLabel}`;
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

  summaryCard: {
    width: "100%",
    marginTop: Spacing.xxl,
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
    gap: 2,
  },

  summaryEyebrow: {
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

  section: {
    width: "100%",
    marginTop: Spacing.section,
    gap: Spacing.lg,
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
    fontSize: 21,
    lineHeight: 28,
  },

  sectionSubtitle: {
    ...Typography.captionStyle,
    width: "100%",
    color: Colors.textTertiary,
    textAlign: "right",
    writingDirection: "rtl",
  },

  addresses: {
    width: "100%",
    gap: Spacing.md,
  },

  addressPressable: {
    width: "100%",
    borderRadius: Radius.xl,
  },

  addressSurface: {
    width: "100%",
  },

  selectedAddressSurface: {
    borderColor: "rgba(76, 141, 255, 0.58)",
    backgroundColor: "rgba(76, 141, 255, 0.11)",
  },

  addressContent: {
    minHeight: 104,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: Spacing.md,
    padding: Spacing.lg,
  },

  addressIcon: {
    width: 50,
    height: 50,
    flexShrink: 0,
    borderRadius: Radius.lg,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primarySoft,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(76, 141, 255, 0.22)",
  },

  selectedAddressIcon: {
    backgroundColor: Colors.primary,
    borderColor: "rgba(255, 255, 255, 0.22)",
  },

  addressCopy: {
    flex: 1,
    alignItems: "flex-end",
    gap: Spacing.xs,
  },

  addressTitleRow: {
    width: "100%",
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: Spacing.sm,
  },

  addressTitle: {
    ...Typography.label,
    color: Colors.textPrimary,
    textAlign: "right",
    writingDirection: "rtl",
    fontSize: 17,
  },

  selectedAddressTitle: {
    color: "#DCE9FF",
  },

  addressSubtitle: {
    ...Typography.captionStyle,
    color: Colors.textTertiary,
    textAlign: "right",
    writingDirection: "rtl",
  },

  fullAddressText: {
    ...Typography.captionStyle,
    width: "100%",
    color: Colors.textSecondary,
    textAlign: "right",
    writingDirection: "rtl",
    lineHeight: 19,
  },

  radioOuter: {
    width: 26,
    height: 26,
    flexShrink: 0,
    borderRadius: Radius.pill,
    borderWidth: 1.5,
    borderColor: Colors.borderStrong,
    alignItems: "center",
    justifyContent: "center",
  },

  radioOuterSelected: {
    borderColor: Colors.primary,
  },

  radioInner: {
    width: 14,
    height: 14,
    borderRadius: Radius.pill,
    backgroundColor: Colors.primary,
  },

  addressInput: {
    minHeight: 116,
    paddingTop: Spacing.lg,
    textAlign: "right",
    writingDirection: "rtl",
  },

  notesInput: {
    minHeight: 164,
    paddingTop: Spacing.lg,
    textAlign: "right",
    writingDirection: "rtl",
  },

  contactInput: {
    minHeight: 116,
    paddingTop: Spacing.lg,
    textAlign: "right",
    writingDirection: "rtl",
  },

  characterRow: {
    marginTop: -Spacing.md,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
  },

  characterCount: {
    ...Typography.captionStyle,
    color: Colors.textTertiary,
    textAlign: "right",
    writingDirection: "rtl",
  },

  characterCountValid: {
    color: Colors.success,
  },

  characterRequirement: {
    ...Typography.captionStyle,
    color: Colors.textMuted,
    textAlign: "right",
    writingDirection: "rtl",
  },

  errorText: {
    ...Typography.captionStyle,
    color: Colors.error,
    textAlign: "right",
    writingDirection: "rtl",
  },

  photoPlaceholderCard: {
    width: "100%",
    marginTop: Spacing.section,
    opacity: 0.72,
  },

  photoPlaceholderContent: {
    minHeight: 100,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: Spacing.md,
    padding: Spacing.lg,
  },

  photoIcon: {
    width: 48,
    height: 48,
    flexShrink: 0,
    borderRadius: Radius.lg,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.glass,
  },

  photoCopy: {
    flex: 1,
    alignItems: "flex-end",
    gap: Spacing.xs,
  },

  photoTitle: {
    ...Typography.label,
    width: "100%",
    color: Colors.textPrimary,
    textAlign: "right",
    writingDirection: "rtl",
  },

  photoSubtitle: {
    ...Typography.captionStyle,
    width: "100%",
    color: Colors.textTertiary,
    textAlign: "right",
    writingDirection: "rtl",
    lineHeight: 19,
  },

  comingSoonBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: Radius.pill,
    backgroundColor: Colors.glassStrong,
  },

  comingSoonText: {
    ...Typography.captionStyle,
    color: Colors.textTertiary,
    textAlign: "center",
    writingDirection: "rtl",
    fontSize: 10,
  },

  noticeCard: {
    width: "100%",
    marginTop: Spacing.xl,
    borderColor: "rgba(48, 183, 106, 0.26)",
    backgroundColor: "rgba(48, 183, 106, 0.05)",
  },

  noticeContent: {
    minHeight: 86,
    flexDirection: "row-reverse",
    alignItems: "flex-start",
    gap: Spacing.md,
    padding: Spacing.lg,
  },

  noticeIcon: {
    width: 42,
    height: 42,
    flexShrink: 0,
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(48, 183, 106, 0.12)",
  },

  noticeText: {
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

  cardPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.993 }],
  },
});