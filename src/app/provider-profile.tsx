import { Ionicons } from "@expo/vector-icons";
import {
    useLocalSearchParams,
    useRouter,
} from "expo-router";
import {
    ComponentProps,
    useMemo,
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
import {
    getProviderById,
    ProviderProfile,
    ProviderReview,
    providers,
} from "../data/providers";

type IconName =
  ComponentProps<typeof Ionicons>["name"];

export default function ProviderProfileScreen() {
  const router = useRouter();

  const params = useLocalSearchParams<{
    providerId?: string | string[];
  }>();

  const providerId = getSingleParam(
    params.providerId,
  );

  const provider = useMemo<ProviderProfile>(
    () =>
      getProviderById(providerId) ??
      getProviderById("provider-1")!,
    [providerId],
  );

  const relatedProviders = useMemo(
    () =>
      providers
        .filter(
          (item) =>
            item.id !== provider.id &&
            item.categoryId ===
              provider.categoryId,
        )
        .sort(
          (first, second) =>
            second.rating - first.rating,
        )
        .slice(0, 3),
    [provider.categoryId, provider.id],
  );

  const handleBook = () => {
    router.push({
      pathname: "/booking-create",
      params: {
        providerId: provider.id,
      },
    });
  };

  const handleMessage = () => {
    router.push({
      pathname: "/(tabs)/messages",
      params: {
        providerId: provider.id,
      },
    } as never);
  };

  const openRelatedProvider = (
    providerIdToOpen: string,
  ) => {
    router.push({
      pathname: "/provider-profile",
      params: {
        providerId: providerIdToOpen,
      },
    });
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

          <View style={styles.topBarActions}>
            <GlassIconButton
              icon="share-social-outline"
              accessibilityLabel="اشتراک‌گذاری پروفایل"
              onPress={() => {
                console.log(
                  "Share provider:",
                  provider.id,
                );
              }}
            />

            <GlassIconButton
              icon="heart-outline"
              accessibilityLabel="ذخیره ارائه‌دهنده"
              onPress={() => {
                console.log(
                  "Save provider:",
                  provider.id,
                );
              }}
            />
          </View>
        </View>

        <View style={styles.hero}>
          <View style={styles.avatarWrapper}>
            <GlassSurface
              variant="prominent"
              radius={Radius.pill}
              style={[
                styles.avatarSurface,
                Shadows.medium,
              ]}
              contentStyle={
                styles.avatarContent
              }
            >
              <Text
                style={styles.avatarInitials}
              >
                {provider.initials}
              </Text>
            </GlassSurface>

            {provider.verified ? (
              <View
                style={styles.verifiedBadge}
              >
                <Ionicons
                  name="checkmark"
                  size={15}
                  color={Colors.white}
                />
              </View>
            ) : null}
          </View>

          <View style={styles.heroCopy}>
            <View style={styles.nameRow}>
              <Text style={styles.providerName}>
                {provider.name}
              </Text>

              {provider.verified ? (
                <Ionicons
                  name="shield-checkmark"
                  size={19}
                  color={Colors.primary}
                />
              ) : null}
            </View>

            <Text style={styles.profession}>
              {provider.profession}
            </Text>

            <View style={styles.locationRow}>
              <Ionicons
                name="location-outline"
                size={16}
                color={Colors.textTertiary}
              />

              <Text style={styles.locationText}>
                {provider.locationLabel}
              </Text>

              <Text style={styles.distanceText}>
                •{" "}
                {toDariDigits(
                  provider.distanceKm.toFixed(1),
                )}{" "}
                کیلومتر
              </Text>
            </View>

            <View
              style={styles.availabilityRow}
            >
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
                    ? "امروز آمادهٔ کار"
                    : "امروز در دسترس نیست"}
                </Text>
              </View>

              {provider.acceptsUrgentRequests ? (
                <View style={styles.urgentBadge}>
                  <Ionicons
                    name="flash"
                    size={13}
                    color={Colors.warning}
                  />

                  <Text style={styles.urgentText}>
                    درخواست فوری
                  </Text>
                </View>
              ) : null}

              {provider.instantBooking ? (
                <View
                  style={
                    styles.availabilityBadge
                  }
                >
                  <Ionicons
                    name="calendar-outline"
                    size={13}
                    color={Colors.success}
                  />

                  <Text
                    style={
                      styles.availabilityText
                    }
                  >
                    رزرو فوری
                  </Text>
                </View>
              ) : null}
            </View>
          </View>
        </View>

        <View style={styles.statsGrid}>
          <StatCard
            icon="star"
            value={toDariDigits(
              provider.rating.toFixed(1),
            )}
            label={`${toDariDigits(
              provider.reviewCount.toString(),
            )} نظر`}
            iconColor={Colors.warning}
          />

          <StatCard
            icon="briefcase-outline"
            value={toDariDigits(
              provider.completedJobs.toString(),
            )}
            label="کار تکمیل‌شده"
          />

          <StatCard
            icon="ribbon-outline"
            value={provider.yearsExperience}
            label="تجربهٔ کاری"
          />
        </View>

        <GlassSurface
          variant="regular"
          radius={Radius.xl}
          style={styles.responseStatsCard}
          contentStyle={
            styles.responseStatsContent
          }
        >
          <View style={styles.responseStat}>
            <Text
              style={
                styles.responseStatValue
              }
            >
              {toDariDigits(
                provider.responseRate.toString(),
              )}
              ٪
            </Text>

            <Text
              style={
                styles.responseStatLabel
              }
            >
              نرخ پاسخ
            </Text>
          </View>

          <View
            style={
              styles.responseStatDivider
            }
          />

          <View style={styles.responseStat}>
            <Text
              style={
                styles.responseStatValue
              }
            >
              {toDariDigits(
                provider.averageResponseMinutes.toString(),
              )}{" "}
              دقیقه
            </Text>

            <Text
              style={
                styles.responseStatLabel
              }
            >
              زمان پاسخ
            </Text>
          </View>

          <View
            style={
              styles.responseStatDivider
            }
          />

          <View style={styles.responseStat}>
            <Text
              style={
                styles.responseStatValue
              }
            >
              از{" "}
              {formatCurrency(
                provider.minimumPrice,
              )}
            </Text>

            <Text
              style={
                styles.responseStatLabel
              }
            >
              قیمت ابتدایی
            </Text>
          </View>
        </GlassSurface>

        <View style={styles.section}>
          <SectionHeader
            title="خدمات ارائه‌شده"
          />

          <View style={styles.servicesGrid}>
            {provider.services.map(
              (service) => (
                <GlassSurface
                  key={service.id}
                  variant="regular"
                  radius={Radius.lg}
                  style={styles.serviceCard}
                  contentStyle={
                    styles.serviceContent
                  }
                >
                  <View
                    style={styles.serviceIcon}
                  >
                    <Ionicons
                      name={getServiceIcon(
                        service.id,
                      )}
                      size={21}
                      color={Colors.primary}
                    />
                  </View>

                  <Text
                    style={styles.serviceTitle}
                  >
                    {service.title}
                  </Text>

                  <Text
                    style={styles.servicePrice}
                  >
                    از{" "}
                    {formatCurrency(
                      service.estimatedPrice,
                    )}
                  </Text>
                </GlassSurface>
              ),
            )}
          </View>
        </View>

        <View style={styles.section}>
          <SectionHeader
            title="دربارهٔ ارائه‌دهنده"
          />

          <GlassSurface
            variant="regular"
            radius={Radius.xl}
            style={styles.descriptionCard}
            contentStyle={
              styles.descriptionContent
            }
          >
            <Text
              style={styles.descriptionText}
            >
              {provider.description}
            </Text>
          </GlassSurface>
        </View>

        <View style={styles.section}>
          <SectionHeader
            title="محدوده و برنامهٔ کاری"
          />

          <GlassSurface
            variant="regular"
            radius={Radius.xl}
            style={styles.detailsCard}
            contentStyle={
              styles.detailsContent
            }
          >
            <ProfileDetail
              icon="navigate-outline"
              label="محدودهٔ خدمات"
              value={`تا ${toDariDigits(
                provider.serviceRadiusKm.toString(),
              )} کیلومتر`}
            />

            <View
              style={styles.detailDivider}
            />

            <ProfileDetail
              icon="calendar-outline"
              label="روزهای کاری"
              value={formatWorkingDays(
                provider.workingDays,
              )}
            />

            <View
              style={styles.detailDivider}
            />

            <ProfileDetail
              icon="time-outline"
              label="ساعت کاری"
              value={`${formatTimeForDari(
                provider.startTime,
              )} تا ${formatTimeForDari(
                provider.endTime,
              )}`}
            />
          </GlassSurface>
        </View>

        <View style={styles.section}>
          <SectionHeader
            title="نمونه‌کارها"
            actionLabel={
              provider.portfolio.length > 0
                ? "مشاهده همه"
                : undefined
            }
            onPress={
              provider.portfolio.length > 0
                ? () => {
                    console.log(
                      "Open portfolio:",
                      provider.id,
                    );
                  }
                : undefined
            }
          />

          {provider.portfolio.length > 0 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={
                false
              }
              contentContainerStyle={
                styles.portfolioRow
              }
            >
              {provider.portfolio.map(
                (item) => (
                  <GlassSurface
                    key={item.id}
                    variant="regular"
                    radius={Radius.xl}
                    style={
                      styles.portfolioCard
                    }
                    contentStyle={
                      styles.portfolioContent
                    }
                  >
                    <Ionicons
                      name="image-outline"
                      size={32}
                      color={
                        Colors.textTertiary
                      }
                    />

                    <Text
                      style={
                        styles.portfolioText
                      }
                    >
                      {item.title}
                    </Text>
                  </GlassSurface>
                ),
              )}
            </ScrollView>
          ) : (
            <EmptySection
              icon="images-outline"
              title="هنوز نمونه‌کاری ثبت نشده است"
              text="نمونه‌کارهای این ارائه‌دهنده پس از افزودن در این بخش نمایش داده می‌شوند."
            />
          )}
        </View>

        <View style={styles.section}>
          <SectionHeader
            title="نظرهای مشتریان"
            actionLabel={
              provider.reviewCount > 0
                ? `همهٔ ${toDariDigits(
                    provider.reviewCount.toString(),
                  )} نظر`
                : undefined
            }
            onPress={
              provider.reviewCount > 0
                ? () => {
                    console.log(
                      "Open all reviews:",
                      provider.id,
                    );
                  }
                : undefined
            }
          />

          {provider.reviews.length > 0 ? (
            <View
              style={styles.reviewsList}
            >
              {provider.reviews.map(
                (review) => (
                  <ReviewCard
                    key={review.id}
                    review={review}
                  />
                ),
              )}
            </View>
          ) : (
            <EmptySection
              icon="chatbubble-ellipses-outline"
              title="هنوز نظری ثبت نشده است"
              text="نظرهای مشتریان پس از تکمیل خدمات در این بخش نمایش داده می‌شوند."
            />
          )}
        </View>

        {relatedProviders.length > 0 ? (
          <View style={styles.section}>
            <SectionHeader
              title="ارائه‌دهندگان مشابه"
            />

            <View style={styles.relatedList}>
              {relatedProviders.map(
                (relatedProvider) => (
                  <Pressable
                    key={relatedProvider.id}
                    accessibilityRole="button"
                    accessibilityLabel={
                      relatedProvider.name
                    }
                    onPress={() =>
                      openRelatedProvider(
                        relatedProvider.id,
                      )
                    }
                    style={({ pressed }) => [
                      styles.relatedPressable,
                      pressed &&
                        styles.pressed,
                    ]}
                  >
                    <GlassSurface
                      variant="regular"
                      radius={Radius.xl}
                      style={
                        styles.relatedCard
                      }
                      contentStyle={
                        styles.relatedContent
                      }
                    >
                      <View
                        style={
                          styles.relatedAvatar
                        }
                      >
                        <Text
                          style={
                            styles.relatedInitials
                          }
                        >
                          {
                            relatedProvider.initials
                          }
                        </Text>
                      </View>

                      <View
                        style={
                          styles.relatedCopy
                        }
                      >
                        <Text
                          style={
                            styles.relatedName
                          }
                        >
                          {relatedProvider.name}
                        </Text>

                        <Text
                          style={
                            styles.relatedProfession
                          }
                        >
                          {
                            relatedProvider.profession
                          }
                        </Text>

                        <View
                          style={
                            styles.relatedMeta
                          }
                        >
                          <Ionicons
                            name="star"
                            size={13}
                            color={
                              Colors.warning
                            }
                          />

                          <Text
                            style={
                              styles.relatedMetaText
                            }
                          >
                            {toDariDigits(
                              relatedProvider.rating.toFixed(
                                1,
                              ),
                            )}
                          </Text>

                          <Text
                            style={
                              styles.relatedMetaText
                            }
                          >
                            ·{" "}
                            {relatedProvider.locationLabel}
                          </Text>
                        </View>
                      </View>

                      <Ionicons
                        name="chevron-back"
                        size={18}
                        color={
                          Colors.textTertiary
                        }
                      />
                    </GlassSurface>
                  </Pressable>
                ),
              )}
            </View>
          </View>
        ) : null}

        <GlassSurface
          variant="regular"
          radius={Radius.xl}
          style={[
            styles.safetyCard,
            !provider.verified &&
              styles.unverifiedSafetyCard,
          ]}
          contentStyle={
            styles.safetyContent
          }
        >
          <View style={styles.safetyIcon}>
            <Ionicons
              name={
                provider.verified
                  ? "shield-checkmark-outline"
                  : "alert-circle-outline"
              }
              size={24}
              color={
                provider.verified
                  ? Colors.success
                  : Colors.warning
              }
            />
          </View>

          <View style={styles.safetyCopy}>
            <Text style={styles.safetyTitle}>
              {provider.verified
                ? "ارائه‌دهندهٔ تأییدشده"
                : "حساب هنوز تأیید نشده است"}
            </Text>

            <Text
              style={styles.safetySubtitle}
            >
              {provider.verified
                ? "هویت و معلومات حرفه‌ای این ارائه‌دهنده توسط خدمت بررسی شده است."
                : "پیش از رزرو، جزئیات حساب، نظرها و شرایط خدمت را با دقت بررسی کنید."}
            </Text>
          </View>
        </GlassSurface>
      </ScrollView>

      <View style={styles.footer}>
        <GlassButton
          label="رزرو خدمت"
          icon="calendar-outline"
          iconPosition="left"
          onPress={handleBook}
          style={styles.primaryAction}
        />

        <GlassButton
          label="پیام"
          icon="chatbubble-outline"
          iconPosition="left"
          variant="secondary"
          fullWidth={false}
          onPress={handleMessage}
          style={styles.messageAction}
        />
      </View>
    </SafeAreaView>
  );
}

function StatCard({
  icon,
  value,
  label,
  iconColor = Colors.primary,
}: {
  icon: IconName;
  value: string;
  label: string;
  iconColor?: string;
}) {
  return (
    <GlassSurface
      variant="regular"
      radius={Radius.xl}
      style={styles.statCard}
      contentStyle={styles.statContent}
    >
      <Ionicons
        name={icon}
        size={20}
        color={iconColor}
      />

      <Text
        numberOfLines={1}
        style={styles.statValue}
      >
        {value}
      </Text>

      <Text
        numberOfLines={2}
        style={styles.statLabel}
      >
        {label}
      </Text>
    </GlassSurface>
  );
}

function SectionHeader({
  title,
  actionLabel,
  onPress,
}: {
  title: string;
  actionLabel?: string;
  onPress?: () => void;
}) {
  return (
    <View style={styles.sectionHeader}>
      {actionLabel && onPress ? (
        <Pressable
          accessibilityRole="button"
          onPress={onPress}
          style={({ pressed }) => [
            styles.sectionAction,
            pressed && styles.pressed,
          ]}
        >
          <Ionicons
            name="chevron-back"
            size={16}
            color={Colors.primary}
          />

          <Text
            style={
              styles.sectionActionText
            }
          >
            {actionLabel}
          </Text>
        </Pressable>
      ) : (
        <View />
      )}

      <Text style={styles.sectionTitle}>
        {title}
      </Text>
    </View>
  );
}

function ProfileDetail({
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

function ReviewCard({
  review,
}: {
  review: ProviderReview;
}) {
  return (
    <GlassSurface
      variant="regular"
      radius={Radius.xl}
      style={styles.reviewCard}
      contentStyle={styles.reviewContent}
    >
      <View style={styles.reviewHeader}>
        <View style={styles.reviewAvatar}>
          <Text
            style={styles.reviewInitials}
          >
            {review.customerInitials}
          </Text>
        </View>

        <View style={styles.reviewCopy}>
          <Text style={styles.reviewName}>
            {review.customerName}
          </Text>

          <View style={styles.reviewMeta}>
            <View style={styles.stars}>
              {Array.from({
                length: 5,
              }).map((_, index) => (
                <Ionicons
                  key={index}
                  name={
                    index < review.rating
                      ? "star"
                      : "star-outline"
                  }
                  size={13}
                  color={Colors.warning}
                />
              ))}
            </View>

            <Text
              style={styles.reviewDate}
            >
              {formatReviewDate(
                review.createdAt,
              )}
            </Text>
          </View>
        </View>
      </View>

      <Text style={styles.reviewComment}>
        {review.comment}
      </Text>
    </GlassSurface>
  );
}

function EmptySection({
  icon,
  title,
  text,
}: {
  icon: IconName;
  title: string;
  text: string;
}) {
  return (
    <GlassSurface
      variant="regular"
      radius={Radius.xl}
      style={styles.emptySectionCard}
      contentStyle={
        styles.emptySectionContent
      }
    >
      <Ionicons
        name={icon}
        size={30}
        color={Colors.textTertiary}
      />

      <Text
        style={styles.emptySectionTitle}
      >
        {title}
      </Text>

      <Text
        style={styles.emptySectionText}
      >
        {text}
      </Text>
    </GlassSurface>
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
    serviceId.includes("wiring")
  ) {
    return "git-branch-outline";
  }

  if (
    serviceId.includes("lighting")
  ) {
    return "bulb-outline";
  }

  if (
    serviceId.includes("generator")
  ) {
    return "battery-charging-outline";
  }

  if (
    serviceId.includes("socket") ||
    serviceId.includes("breaker")
  ) {
    return "flash-outline";
  }

  if (
    serviceId.includes("heater")
  ) {
    return "flame-outline";
  }

  if (
    serviceId.includes("pipe") ||
    serviceId.includes("water") ||
    serviceId.includes("drain")
  ) {
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
    serviceId.includes("clean")
  ) {
    return "sparkles-outline";
  }

  if (
    serviceId.includes("hardware") ||
    serviceId.includes("operating-system") ||
    serviceId.includes("virus")
  ) {
    return "laptop-outline";
  }

  return "construct-outline";
}

function formatWorkingDays(
  days: string[],
): string {
  const labels: Record<string, string> = {
    saturday: "شنبه",
    sunday: "یک‌شنبه",
    monday: "دوشنبه",
    tuesday: "سه‌شنبه",
    wednesday: "چهارشنبه",
    thursday: "پنج‌شنبه",
    friday: "جمعه",
  };

  return days
    .map((day) => labels[day] ?? day)
    .join("، ");
}

function formatTimeForDari(
  value: string,
): string {
  if (!value) {
    return "نامشخص";
  }

  const [hourText, minute = "00"] =
    value.split(":");

  const hour = Number(hourText);

  if (!Number.isFinite(hour)) {
    return value;
  }

  if (hour === 12) {
    return `${toDariDigits(
      `12:${minute}`,
    )} ظهر`;
  }

  if (hour > 12) {
    return `${toDariDigits(
      `${hour - 12}:${minute}`,
    )} بعد از ظهر`;
  }

  return `${toDariDigits(
    `${hour}:${minute}`,
  )} صبح`;
}

function formatCurrency(
  amount: number,
): string {
  return `${new Intl.NumberFormat(
    "fa-AF",
  ).format(amount)} افغانی`;
}

function formatReviewDate(
  value: string,
): string {
  const date = new Date(value);

  if (
    Number.isNaN(date.getTime())
  ) {
    return value;
  }

  return new Intl.DateTimeFormat(
    "fa-AF",
    {
      year: "numeric",
      month: "short",
      day: "numeric",
    },
  ).format(date);
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
    (digit) =>
      digits[digit] ?? digit,
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
    paddingBottom: 150,
  },

  topBar: {
    minHeight: Layout.minimumTouchTarget,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  topBarActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },

  hero: {
    width: "100%",
    marginTop: Spacing.xl,
    alignItems: "center",
    gap: Spacing.lg,
  },

  avatarWrapper: {
    width: 104,
    height: 104,
  },

  avatarSurface: {
    width: 104,
    height: 104,
    borderColor: "rgba(76, 141, 255, 0.34)",
    backgroundColor: Colors.primarySoft,
  },

  avatarContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  avatarInitials: {
    color: Colors.primary,
    fontSize: 34,
    fontWeight: "700",
  },

  verifiedBadge: {
    position: "absolute",
    right: 2,
    bottom: 2,
    width: 32,
    height: 32,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primary,
    borderWidth: 3,
    borderColor: Colors.background,
  },

  heroCopy: {
    width: "100%",
    alignItems: "center",
    gap: Spacing.xs,
  },

  nameRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
  },

  providerName: {
    ...Typography.screenTitle,
    color: Colors.textPrimary,
    textAlign: "center",
    writingDirection: "rtl",
    fontSize: 28,
    lineHeight: 35,
  },

  profession: {
    ...Typography.bodyLarge,
    color: Colors.textSecondary,
    textAlign: "center",
    writingDirection: "rtl",
  },

  locationRow: {
    marginTop: Spacing.xs,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },

  locationText: {
    ...Typography.captionStyle,
    color: Colors.textTertiary,
    textAlign: "center",
    writingDirection: "rtl",
  },

  distanceText: {
    ...Typography.captionStyle,
    color: Colors.textMuted,
    textAlign: "center",
    writingDirection: "rtl",
  },

  availabilityRow: {
    marginTop: Spacing.sm,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },

  availabilityBadge: {
    minHeight: 30,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.pill,
    backgroundColor: "rgba(48, 183, 106, 0.11)",
  },

  unavailableBadge: {
    backgroundColor: Colors.glass,
  },

  availabilityDot: {
    width: 7,
    height: 7,
    borderRadius: Radius.pill,
    backgroundColor: Colors.success,
  },

  unavailableDot: {
    backgroundColor: Colors.textTertiary,
  },

  availabilityText: {
    ...Typography.captionStyle,
    color: Colors.textSecondary,
    textAlign: "center",
    writingDirection: "rtl",
  },

  urgentBadge: {
    minHeight: 30,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.pill,
    backgroundColor: "rgba(217, 154, 43, 0.10)",
  },

  urgentText: {
    ...Typography.captionStyle,
    color: Colors.warning,
    writingDirection: "rtl",
  },

  statsGrid: {
    width: "100%",
    marginTop: Spacing.section,
    flexDirection: "row-reverse",
    alignItems: "stretch",
    gap: Spacing.sm,
  },

  statCard: {
    flex: 1,
  },

  statContent: {
    minHeight: 112,
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    padding: Spacing.sm,
  },

  statValue: {
    ...Typography.sectionTitle,
    width: "100%",
    color: Colors.textPrimary,
    textAlign: "center",
    writingDirection: "rtl",
    fontSize: 17,
    lineHeight: 23,
  },

  statLabel: {
    ...Typography.captionStyle,
    width: "100%",
    minHeight: 36,
    color: Colors.textTertiary,
    textAlign: "center",
    writingDirection: "rtl",
    fontSize: 11,
  },

  section: {
    width: "100%",
    marginTop: Spacing.section,
    gap: Spacing.lg,
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

  sectionAction: {
    minHeight: 36,
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },

  sectionActionText: {
    ...Typography.captionStyle,
    color: Colors.primary,
    writingDirection: "rtl",
  },

  servicesGrid: {
    width: "100%",
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: Spacing.sm,
  },

  serviceCard: {
    width: "48.5%",
  },

  serviceContent: {
    minHeight: 96,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    padding: Spacing.md,
  },

  serviceIcon: {
    width: 42,
    height: 42,
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primarySoft,
  },

  serviceTitle: {
    ...Typography.captionStyle,
    width: "100%",
    color: Colors.textPrimary,
    textAlign: "center",
    writingDirection: "rtl",
    lineHeight: 19,
  },

  descriptionCard: {
    width: "100%",
  },

  descriptionContent: {
    padding: Spacing.lg,
  },

  descriptionText: {
    ...Typography.bodyStyle,
    width: "100%",
    color: Colors.textSecondary,
    textAlign: "right",
    writingDirection: "rtl",
    lineHeight: 25,
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

  detailDivider: {
    width: "100%",
    height: StyleSheet.hairlineWidth,
    marginVertical: Spacing.md,
    backgroundColor: Colors.separator,
  },

  portfolioRow: {
    flexDirection: "row-reverse",
    gap: Spacing.md,
    paddingHorizontal: 1,
  },

  portfolioCard: {
    width: 180,
    height: 128,
  },

  portfolioContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
  },

  portfolioText: {
    ...Typography.captionStyle,
    color: Colors.textTertiary,
    textAlign: "center",
    writingDirection: "rtl",
  },

  reviewsList: {
    width: "100%",
    gap: Spacing.md,
  },

  reviewCard: {
    width: "100%",
  },

  reviewContent: {
    padding: Spacing.lg,
    gap: Spacing.md,
  },

  reviewHeader: {
    width: "100%",
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: Spacing.md,
  },

  reviewAvatar: {
    width: 46,
    height: 46,
    flexShrink: 0,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.glassStrong,
  },

  reviewInitials: {
    color: Colors.textPrimary,
    fontSize: 15,
    fontWeight: "700",
  },

  reviewCopy: {
    flex: 1,
    alignItems: "flex-end",
    gap: 3,
  },

  reviewName: {
    ...Typography.label,
    width: "100%",
    color: Colors.textPrimary,
    textAlign: "right",
    writingDirection: "rtl",
  },

  reviewMeta: {
    width: "100%",
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
  },

  stars: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },

  reviewDate: {
    ...Typography.captionStyle,
    color: Colors.textTertiary,
    writingDirection: "rtl",
  },

  reviewComment: {
    ...Typography.bodyStyle,
    width: "100%",
    color: Colors.textSecondary,
    textAlign: "right",
    writingDirection: "rtl",
    lineHeight: 23,
  },

  safetyCard: {
    width: "100%",
    marginTop: Spacing.section,
    borderColor: "rgba(48, 183, 106, 0.28)",
    backgroundColor: "rgba(48, 183, 106, 0.06)",
  },

  safetyContent: {
    minHeight: 104,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: Spacing.md,
    padding: Spacing.lg,
  },

  safetyIcon: {
    width: 48,
    height: 48,
    flexShrink: 0,
    borderRadius: Radius.lg,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(48, 183, 106, 0.12)",
  },

  safetyCopy: {
    flex: 1,
    alignItems: "flex-end",
    gap: Spacing.xs,
  },

  safetyTitle: {
    ...Typography.label,
    width: "100%",
    color: Colors.textPrimary,
    textAlign: "right",
    writingDirection: "rtl",
  },

  safetySubtitle: {
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
    minHeight: 92,
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

  messageAction: {
    minWidth: 112,
  },

  pressed: {
    opacity: 0.82,
  },

  responseStatsCard: {
    width: "100%",
    marginTop: Spacing.lg,
  },

  responseStatsContent: {
    minHeight: 82,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-around",
    padding: Spacing.md,
  },

  responseStat: {
    flex: 1,
    alignItems: "center",
    gap: 3,
  },

  responseStatValue: {
    ...Typography.label,
    color: Colors.textPrimary,
    textAlign: "center",
    writingDirection: "rtl",
  },

  responseStatLabel: {
    ...Typography.captionStyle,
    color: Colors.textTertiary,
    textAlign: "center",
    writingDirection: "rtl",
    fontSize: 11,
  },

  responseStatDivider: {
    width: StyleSheet.hairlineWidth,
    height: 38,
    backgroundColor: Colors.separator,
  },

  servicePrice: {
    ...Typography.captionStyle,
    color: Colors.primary,
    textAlign: "center",
    writingDirection: "rtl",
    fontWeight: "600",
  },

  emptySectionCard: {
    width: "100%",
  },

  emptySectionContent: {
    minHeight: 118,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    padding: Spacing.lg,
  },

  emptySectionTitle: {
    ...Typography.label,
    color: Colors.textPrimary,
    textAlign: "center",
    writingDirection: "rtl",
  },

  emptySectionText: {
    ...Typography.captionStyle,
    color: Colors.textTertiary,
    textAlign: "center",
    writingDirection: "rtl",
    lineHeight: 19,
  },

  relatedList: {
    width: "100%",
    gap: Spacing.md,
  },

  relatedPressable: {
    width: "100%",
    borderRadius: Radius.xl,
  },

  relatedCard: {
    width: "100%",
  },

  relatedContent: {
    minHeight: 92,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: Spacing.md,
    padding: Spacing.md,
  },

  relatedAvatar: {
    width: 50,
    height: 50,
    flexShrink: 0,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primarySoft,
  },

  relatedInitials: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: "700",
  },

  relatedCopy: {
    flex: 1,
    alignItems: "flex-end",
    gap: 2,
  },

  relatedName: {
    ...Typography.label,
    width: "100%",
    color: Colors.textPrimary,
    textAlign: "right",
    writingDirection: "rtl",
  },

  relatedProfession: {
    ...Typography.captionStyle,
    width: "100%",
    color: Colors.textSecondary,
    textAlign: "right",
    writingDirection: "rtl",
  },

  relatedMeta: {
    width: "100%",
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 4,
  },

  relatedMetaText: {
    ...Typography.captionStyle,
    color: Colors.textTertiary,
    writingDirection: "rtl",
    fontSize: 11,
  },

  unverifiedSafetyCard: {
    borderColor: "rgba(217, 154, 43, 0.28)",
    backgroundColor: "rgba(217, 154, 43, 0.06)",
  },

});
