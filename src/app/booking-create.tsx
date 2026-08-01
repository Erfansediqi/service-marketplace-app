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
    Shadows,
    Spacing,
    Typography,
} from "../constants/theme";
import { useBooking } from "../context/booking-context";
import {
    getProviderById,
    ProviderService,
} from "../data/providers";

type IconName =
  ComponentProps<typeof Ionicons>["name"];

export default function BookingCreateScreen() {
  const router = useRouter();

  const {
    bookingDraft,
    updateBookingDraft,
  } = useBooking();

  const params = useLocalSearchParams<{
    providerId?: string | string[];
  }>();

  const providerId = getSingleParam(
    params.providerId,
  );

  const provider = useMemo(() => {
    return (
      getProviderById(providerId) ??
      getProviderById("provider-1")!
    );
  }, [providerId]);

  const initialServiceId =
    bookingDraft.providerId === provider.id
      ? bookingDraft.serviceId
      : "";

  const [
    selectedServiceId,
    setSelectedServiceId,
  ] = useState<string | null>(
    initialServiceId || null,
  );

  const selectedService =
    useMemo<ProviderService | null>(
      () =>
        provider.services.find(
          (service) =>
            service.id === selectedServiceId,
        ) ?? null,
      [
        provider.services,
        selectedServiceId,
      ],
    );

  const handleServiceSelect = (
    serviceId: string,
  ) => {
    setSelectedServiceId(serviceId);
  };

  const handleContinue = () => {
    if (!selectedService) {
      return;
    }

    const providerChanged =
      bookingDraft.providerId &&
      bookingDraft.providerId !== provider.id;

    updateBookingDraft({
      providerId: provider.id,
      providerName: provider.name,
      providerProfession:
        provider.profession,

      serviceId: selectedService.id,
      serviceName: selectedService.title,
      estimatedPrice:
        selectedService.estimatedPrice,
      currency: provider.currency,

      ...(providerChanged
        ? {
            date: "",
            time: "",
            address: null,
            notes: "",
          }
        : {}),
    });

    router.push("/booking-schedule");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        showsVerticalScrollIndicator={false}
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
            مرحله ۱ از ۴
          </Text>
        </View>

        <View style={styles.header}>
          <Text style={styles.eyebrow}>
            ایجاد رزرو
          </Text>

          <Text style={styles.title}>
            کدام خدمت را می‌خواهید؟
          </Text>

          <Text style={styles.subtitle}>
            یکی از خدمات ارائه‌شده توسط این
            متخصص را انتخاب کنید.
          </Text>
        </View>

        <GlassSurface
          variant="regular"
          radius={Radius.xl}
          style={styles.providerCard}
          contentStyle={
            styles.providerContent
          }
        >
          <View
            style={styles.providerAvatar}
          >
            <Text
              style={styles.providerInitials}
            >
              {provider.initials}
            </Text>

            {provider.verified ? (
              <View
                style={styles.verifiedBadge}
              >
                <Ionicons
                  name="checkmark"
                  size={10}
                  color={Colors.white}
                />
              </View>
            ) : null}
          </View>

          <View style={styles.providerCopy}>
            <View
              style={styles.providerNameRow}
            >
              <Text
                style={styles.providerName}
              >
                {provider.name}
              </Text>

              {provider.verified ? (
                <Ionicons
                  name="shield-checkmark"
                  size={17}
                  color={Colors.primary}
                />
              ) : null}
            </View>

            <Text
              style={
                styles.providerProfession
              }
            >
              {provider.profession}
            </Text>

            <View style={styles.ratingRow}>
              <Text
                style={styles.ratingText}
              >
                {toDariDigits(
                  provider.rating.toFixed(1),
                )}
              </Text>

              <Ionicons
                name="star"
                size={14}
                color={Colors.warning}
              />

              <Text
                style={styles.reviewText}
              >
                (
                {toDariDigits(
                  provider.reviewCount.toString(),
                )}{" "}
                نظر)
              </Text>
            </View>

            <View
              style={
                styles.providerMetaRow
              }
            >
              <View
                style={
                  styles.providerMetaItem
                }
              >
                <Ionicons
                  name="location-outline"
                  size={14}
                  color={Colors.textTertiary}
                />

                <Text
                  numberOfLines={1}
                  style={
                    styles.providerMetaText
                  }
                >
                  {provider.locationLabel}
                </Text>
              </View>

              <View
                style={
                  styles.providerMetaItem
                }
              >
                <Ionicons
                  name="briefcase-outline"
                  size={14}
                  color={Colors.textTertiary}
                />

                <Text
                  style={
                    styles.providerMetaText
                  }
                >
                  {toDariDigits(
                    provider.completedJobs.toString(),
                  )}{" "}
                  کار
                </Text>
              </View>
            </View>
          </View>

          <View
            style={[
              styles.availabilityBadge,
              !provider.availableToday &&
                styles.unavailableBadge,
            ]}
          >
            <View
              style={[
                styles.availabilityDot,
                !provider.availableToday &&
                  styles.unavailableDot,
              ]}
            />

            <Text
              style={
                styles.availabilityText
              }
            >
              {provider.availableToday
                ? "آماده"
                : "مصروف"}
            </Text>
          </View>
        </GlassSurface>

        <View style={styles.section}>
          <View
            style={styles.sectionHeader}
          >
            <Text
              style={styles.sectionTitle}
            >
              خدمات
            </Text>

            <Text
              style={
                styles.sectionSubtitle
              }
            >
              قیمت‌ها تخمینی‌اند و مبلغ نهایی
              پس از بررسی کار مشخص می‌شود.
            </Text>
          </View>

          <View style={styles.services}>
            {provider.services.map(
              (service) => {
                const selected =
                  selectedServiceId ===
                  service.id;

                return (
                  <Pressable
                    key={service.id}
                    accessibilityRole="radio"
                    accessibilityLabel={
                      service.title
                    }
                    accessibilityState={{
                      selected,
                    }}
                    onPress={() =>
                      handleServiceSelect(
                        service.id,
                      )
                    }
                    style={({ pressed }) => [
                      styles.servicePressable,
                      pressed &&
                        styles.servicePressed,
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
                        styles.serviceSurface,
                        selected &&
                          styles.selectedServiceSurface,
                        selected &&
                          Shadows.small,
                      ]}
                      contentStyle={
                        styles.serviceContent
                      }
                    >
                      <View
                        style={[
                          styles.serviceIcon,
                          selected &&
                            styles.selectedServiceIcon,
                        ]}
                      >
                        <Ionicons
                          name={getServiceIcon(
                            service.id,
                          )}
                          size={24}
                          color={
                            selected
                              ? Colors.white
                              : Colors.primary
                          }
                        />
                      </View>

                      <View
                        style={
                          styles.serviceCopy
                        }
                      >
                        <Text
                          style={[
                            styles.serviceTitle,
                            selected &&
                              styles.selectedServiceTitle,
                          ]}
                        >
                          {service.title}
                        </Text>

                        <Text
                          style={
                            styles.serviceSubtitle
                          }
                        >
                          {service.description}
                        </Text>

                        <Text
                          style={
                            styles.servicePrice
                          }
                        >
                          {formatPrice(
                            service.estimatedPrice,
                          )}
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
                            style={
                              styles.radioInner
                            }
                          />
                        ) : null}
                      </View>
                    </GlassSurface>
                  </Pressable>
                );
              },
            )}
          </View>
        </View>

        <GlassSurface
          variant="regular"
          radius={Radius.xl}
          style={styles.priceNoticeCard}
          contentStyle={
            styles.priceNoticeContent
          }
        >
          <View style={styles.priceNoticeIcon}>
            <Ionicons
              name="information-circle-outline"
              size={22}
              color={Colors.primary}
            />
          </View>

          <Text style={styles.priceNoticeText}>
            قیمت نمایش‌داده‌شده هزینهٔ ابتدایی
            خدمت است. هزینهٔ قطعات، مواد و کار
            اضافی پس از بررسی ارائه‌دهنده مشخص
            می‌شود.
          </Text>
        </GlassSurface>
      </ScrollView>

      <View style={styles.footer}>
        <GlassButton
          label="انتخاب تاریخ و زمان"
          icon="calendar-outline"
          iconPosition="left"
          disabled={!selectedService}
          onPress={handleContinue}
        />

        {selectedService ? (
          <Text style={styles.footerSummary}>
            {selectedService.title} —{" "}
            {formatPrice(
              selectedService.estimatedPrice,
            )}
          </Text>
        ) : (
          <Text style={styles.footerSummary}>
            برای ادامه یک خدمت را انتخاب کنید.
          </Text>
        )}
      </View>
    </SafeAreaView>
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

function getServiceIcon(
  serviceId: string,
): IconName {
  if (
    serviceId.includes("wiring") ||
    serviceId.includes("socket") ||
    serviceId.includes("lighting") ||
    serviceId.includes("breaker") ||
    serviceId.includes("generator")
  ) {
    if (serviceId.includes("lighting")) {
      return "bulb-outline";
    }

    if (serviceId.includes("generator")) {
      return "battery-charging-outline";
    }

    if (serviceId.includes("wiring")) {
      return "git-branch-outline";
    }

    return "flash-outline";
  }

  if (
    serviceId.includes("pipe") ||
    serviceId.includes("water") ||
    serviceId.includes("drain") ||
    serviceId.includes("heater")
  ) {
    if (
      serviceId.includes("heater")
    ) {
      return "flame-outline";
    }

    return "water-outline";
  }

  if (
    serviceId.includes("cabinet") ||
    serviceId.includes("door") ||
    serviceId.includes("furniture")
  ) {
    return "hammer-outline";
  }

  if (
    serviceId.includes("computer") ||
    serviceId.includes("hardware") ||
    serviceId.includes("software") ||
    serviceId.includes("operating-system") ||
    serviceId.includes("virus")
  ) {
    return "laptop-outline";
  }

  if (
    serviceId.includes("clean")
  ) {
    return "sparkles-outline";
  }

  if (
    serviceId.includes("wall") ||
    serviceId.includes("plaster") ||
    serviceId.includes("renovation")
  ) {
    return "construct-outline";
  }

  return "briefcase-outline";
}

function formatPrice(
  value: number,
): string {
  return `از ${new Intl.NumberFormat(
    "fa-AF",
  ).format(value)} افغانی`;
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
    paddingHorizontal:
      Layout.screenPadding,
    paddingTop: Spacing.md,
    paddingBottom: 170,
  },

  topBar: {
    minHeight:
      Layout.minimumTouchTarget,
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
    minHeight: 112,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: Spacing.md,
    padding: Spacing.lg,
  },

  providerAvatar: {
    width: 58,
    height: 58,
    flexShrink: 0,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      Colors.primarySoft,
    borderWidth:
      StyleSheet.hairlineWidth,
    borderColor:
      "rgba(76, 141, 255, 0.28)",
  },

  providerInitials: {
    color: Colors.primary,
    fontSize: 18,
    fontWeight: "700",
  },

  verifiedBadge: {
    position: "absolute",
    right: -2,
    bottom: -2,
    width: 20,
    height: 20,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primary,
    borderWidth: 2,
    borderColor:
      Colors.backgroundRaised,
  },

  providerCopy: {
    flex: 1,
    alignItems: "flex-end",
    gap: 3,
  },

  providerNameRow: {
    width: "100%",
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 5,
  },

  providerName: {
    ...Typography.sectionTitle,
    color: Colors.textPrimary,
    textAlign: "right",
    writingDirection: "rtl",
    fontSize: 19,
    lineHeight: 25,
  },

  providerProfession: {
    ...Typography.bodyStyle,
    width: "100%",
    color: Colors.textSecondary,
    textAlign: "right",
    writingDirection: "rtl",
  },

  ratingRow: {
    width: "100%",
    marginTop: 2,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 4,
  },

  ratingText: {
    ...Typography.captionStyle,
    color: Colors.textSecondary,
  },

  reviewText: {
    ...Typography.captionStyle,
    color: Colors.textTertiary,
    writingDirection: "rtl",
  },

  providerMetaRow: {
    width: "100%",
    marginTop: Spacing.xs,
    flexDirection: "row-reverse",
    alignItems: "center",
    flexWrap: "wrap",
    gap: Spacing.md,
  },

  providerMetaItem: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 4,
  },

  providerMetaText: {
    ...Typography.captionStyle,
    maxWidth: 150,
    color: Colors.textTertiary,
    textAlign: "right",
    writingDirection: "rtl",
    fontSize: 11,
  },

  availabilityBadge: {
    minHeight: 28,
    flexShrink: 0,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: Spacing.sm,
    borderRadius: Radius.pill,
    backgroundColor:
      "rgba(48, 183, 106, 0.10)",
  },

  unavailableBadge: {
    backgroundColor: Colors.glass,
  },

  availabilityDot: {
    width: 6,
    height: 6,
    borderRadius: Radius.pill,
    backgroundColor: Colors.success,
  },

  unavailableDot: {
    backgroundColor:
      Colors.textTertiary,
  },

  availabilityText: {
    ...Typography.captionStyle,
    color: Colors.textSecondary,
    fontSize: 11,
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

  services: {
    width: "100%",
    gap: Spacing.md,
  },

  servicePressable: {
    width: "100%",
    borderRadius: Radius.xl,
  },

  servicePressed: {
    opacity: 0.9,
    transform: [{ scale: 0.993 }],
  },

  serviceSurface: {
    width: "100%",
  },

  selectedServiceSurface: {
    borderColor:
      "rgba(76, 141, 255, 0.58)",
    backgroundColor:
      "rgba(76, 141, 255, 0.11)",
  },

  serviceContent: {
    minHeight: 114,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: Spacing.md,
    padding: Spacing.lg,
  },

  serviceIcon: {
    width: 52,
    height: 52,
    flexShrink: 0,
    borderRadius: Radius.lg,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      Colors.primarySoft,
    borderWidth:
      StyleSheet.hairlineWidth,
    borderColor:
      "rgba(76, 141, 255, 0.22)",
  },

  selectedServiceIcon: {
    backgroundColor: Colors.primary,
    borderColor:
      "rgba(255, 255, 255, 0.22)",
  },

  serviceCopy: {
    flex: 1,
    alignItems: "flex-end",
    gap: 4,
  },

  serviceTitle: {
    ...Typography.label,
    width: "100%",
    color: Colors.textPrimary,
    textAlign: "right",
    writingDirection: "rtl",
    fontSize: 17,
    lineHeight: 23,
  },

  selectedServiceTitle: {
    color: "#DCE9FF",
  },

  serviceSubtitle: {
    ...Typography.captionStyle,
    width: "100%",
    color: Colors.textSecondary,
    textAlign: "right",
    writingDirection: "rtl",
    lineHeight: 19,
  },

  servicePrice: {
    ...Typography.captionStyle,
    width: "100%",
    color: Colors.primary,
    textAlign: "right",
    writingDirection: "rtl",
    fontWeight: "600",
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

  priceNoticeCard: {
    width: "100%",
    marginTop: Spacing.xl,
  },

  priceNoticeContent: {
    minHeight: 88,
    flexDirection: "row-reverse",
    alignItems: "flex-start",
    gap: Spacing.md,
    padding: Spacing.lg,
  },

  priceNoticeIcon: {
    width: 42,
    height: 42,
    flexShrink: 0,
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      Colors.primarySoft,
  },

  priceNoticeText: {
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
    minHeight: 104,
    paddingHorizontal:
      Layout.screenPadding,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
    gap: Spacing.sm,
    backgroundColor:
      "rgba(7, 10, 15, 0.96)",
    borderTopWidth:
      StyleSheet.hairlineWidth,
    borderTopColor: Colors.border,
  },

  footerSummary: {
    ...Typography.captionStyle,
    width: "100%",
    color: Colors.textTertiary,
    textAlign: "center",
    writingDirection: "rtl",
  },
});