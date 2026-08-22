import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ComponentProps, useMemo } from "react";
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  Share,
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
import { useLanguage } from "../context/languagecontext";
import { useProviderById } from "../hooks/use-provider-by-id";
import { useProviders } from "../hooks/use-providers";
import type { ProviderProfile, ProviderReview } from "../types/provider";

type IconName = ComponentProps<typeof Ionicons>["name"];

type LanguageName = "English" | "Dari" | "Pashto";

const SUCCESS = "#268A57";
const SUCCESS_SOFT = "#E8F6EE";
const WARNING = "#8A5A00";
const WARNING_SOFT = "#FFF4D6";
const ERROR = "#B3261E";
const ERROR_SOFT = "#FCE8E6";
const INFO_SOFT = "#E5F4F8";

export default function ProviderProfileScreen() {
  const router = useRouter();

  const params = useLocalSearchParams<{
    providerId?: string | string[];
  }>();

  const { language, t } = useLanguage();

  const activeLanguage = normalizeLanguage(language);

  const isRtl = activeLanguage === "Dari" || activeLanguage === "Pashto";

  const providerId = getSingleParam(params.providerId);

  /*
   * Load the selected provider directly through getProviderById().
   *
   * UUID provider accounts now resolve from Supabase first, while legacy
   * local/mock provider IDs continue to work through the repository fallback.
   * The broader provider list is still used only for "related providers".
   */
  const { provider, isLoading, error, refreshProvider } =
    useProviderById(providerId);

  const { providers } = useProviders();

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.providerState}>
          <Ionicons
            name="person-circle-outline"
            size={54}
            color={KhedmatPalette.textMuted}
          />

          <Text style={[styles.providerStateTitle, directionStyle(isRtl)]}>
            {t("publicProviderProfileLoading")}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!provider || error) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.providerState}>
          <Ionicons
            name="person-remove-outline"
            size={54}
            color={KhedmatPalette.textMuted}
          />

          <Text style={[styles.providerStateTitle, directionStyle(isRtl)]}>
            {t("publicProviderProfileNotFoundTitle")}
          </Text>

          <Text style={[styles.providerStateBody, directionStyle(isRtl)]}>
            {t("publicProviderProfileNotFoundMessage")}
          </Text>

          {error ? (
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                void refreshProvider();
              }}
              style={({ pressed }) => [
                styles.retryButton,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.retryButtonText}>
                {t("publicProviderProfileTryAgain")}
              </Text>
            </Pressable>
          ) : null}

          <Pressable
            accessibilityRole="button"
            onPress={() => router.back()}
            style={({ pressed }) => [
              styles.backStateButton,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.backStateButtonText}>{t("publicProviderProfileBack")}</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return <ProviderProfileContent provider={provider} providers={providers} />;
}

function ProviderProfileContent({
  provider,
  providers,
}: {
  provider: ProviderProfile;
  providers: ProviderProfile[];
}) {
  const router = useRouter();

  const { language, t } = useLanguage();

  const activeLanguage = normalizeLanguage(language);

  const isRtl = activeLanguage === "Dari" || activeLanguage === "Pashto";

  const localizedDigits = activeLanguage !== "English";

  const localizedProfession = getLocalizedCategoryTitle(
    provider.categoryId,
    activeLanguage,
  );

  const relatedProviders = useMemo(
    () =>
      providers
        .filter(
          (item) =>
            item.id !== provider.id && item.categoryId === provider.categoryId,
        )
        .sort((first, second) => second.rating - first.rating)
        .slice(0, 3),
    [provider.categoryId, provider.id, providers],
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

  const handleShare = async () => {
    try {
      await Share.share({
        message: formatPublicProviderShare(
          t("publicProviderProfileShareTemplate"),
          provider.name,
          localizedProfession,
        ),
      });
    } catch (error) {
      console.error("Provider profile sharing failed:", error);
    }
  };

  const openRelatedProvider = (nextProviderId: string) => {
    router.push({
      pathname: "/provider-profile",
      params: {
        providerId: nextProviderId,
      },
    });
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
              accessibilityLabel={t("publicProviderProfileBack")}
              onPress={() => router.back()}
              style={({ pressed }) => [
                styles.iconButton,
                pressed && styles.pressed,
              ]}
            >
              <Ionicons
                name={isRtl ? "chevron-forward" : "chevron-back"}
                size={24}
                color={KhedmatPalette.navy900}
              />
            </Pressable>

            <Text style={[styles.topBarTitle, directionStyle(isRtl)]}>
              {t("publicProviderProfilePageTitle")}
            </Text>

            <View
              style={[
                styles.topActions,
                {
                  flexDirection: isRtl ? "row-reverse" : "row",
                },
              ]}
            >
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t("publicProviderProfileShare")}
                onPress={handleShare}
                style={({ pressed }) => [
                  styles.iconButton,
                  pressed && styles.pressed,
                ]}
              >
                <Ionicons
                  name="share-social-outline"
                  size={20}
                  color={KhedmatPalette.navy700}
                />
              </Pressable>

            </View>
          </View>

          <View style={styles.hero}>
            <View style={styles.avatarWrapper}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{provider.initials}</Text>
              </View>

              {provider.verified ? (
                <View style={styles.verifiedBadge}>
                  <Ionicons
                    name="checkmark"
                    size={14}
                    color={KhedmatPalette.white}
                  />
                </View>
              ) : null}
            </View>

            <View style={styles.heroCopy}>
              <View
                style={[
                  styles.nameRow,
                  {
                    flexDirection: isRtl ? "row-reverse" : "row",
                  },
                ]}
              >
                <Text style={[styles.providerName, directionStyle(isRtl)]}>
                  {provider.name}
                </Text>

                {provider.verified ? (
                  <Ionicons
                    name="shield-checkmark"
                    size={19}
                    color={KhedmatPalette.blue500}
                  />
                ) : null}
              </View>

              <Text style={[styles.profession, directionStyle(isRtl)]}>
                {localizedProfession}
              </Text>

              <View
                style={[
                  styles.locationRow,
                  {
                    flexDirection: isRtl ? "row-reverse" : "row",
                  },
                ]}
              >
                <Ionicons
                  name="location-outline"
                  size={16}
                  color={KhedmatPalette.textMuted}
                />

                <Text style={[styles.locationText, directionStyle(isRtl)]}>
                  {provider.locationLabel}
                </Text>

                <Text style={styles.locationDivider}>•</Text>

                <Text style={[styles.distanceText, directionStyle(isRtl)]}>
                  {formatPublicProviderSuffix(formatDigits(
                      provider.distanceKm.toFixed(1),
                      localizedDigits,
                    ), t("publicProviderProfileDistanceSuffix"))}
                </Text>
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
                  icon={
                    provider.availableToday
                      ? "checkmark-circle"
                      : "time-outline"
                  }
                  text={
                    provider.availableToday
                      ? t("publicProviderProfileAvailableToday")
                      : t("publicProviderProfileUnavailableToday")
                  }
                  tone={provider.availableToday ? "success" : "muted"}
                  isRtl={isRtl}
                />

                {provider.acceptsUrgentRequests ? (
                  <StatusBadge
                    icon="flash"
                    text={t("publicProviderProfileUrgentRequests")}
                    tone="warning"
                    isRtl={isRtl}
                  />
                ) : null}

                {provider.instantBooking ? (
                  <StatusBadge
                    icon="calendar-outline"
                    text={t("publicProviderProfileInstantBooking")}
                    tone="info"
                    isRtl={isRtl}
                  />
                ) : null}
              </View>
            </View>
          </View>

          <View style={styles.statsGrid}>
            <StatCard
              icon="star"
              value={formatDigits(provider.rating.toFixed(1), localizedDigits)}
              label={formatPublicProviderSuffix(formatDigits(provider.reviewCount.toString(), localizedDigits), t("publicProviderProfileReviewsSuffix"))}
              iconColor={WARNING}
              isRtl={isRtl}
            />

            <StatCard
              icon="briefcase-outline"
              value={formatDigits(
                provider.completedJobs.toString(),
                localizedDigits,
              )}
              label={t("publicProviderProfileCompletedJobs")}
              isRtl={isRtl}
            />

            <StatCard
              icon="ribbon-outline"
              value={
                activeLanguage === "English"
                  ? provider.yearsExperience
                  : formatDigits(provider.yearsExperience, true)
              }
              label={t("publicProviderProfileWorkExperience")}
              isRtl={isRtl}
            />
          </View>

          <View style={styles.responseCard}>
            <ResponseMetric
              value={`${formatDigits(
                provider.responseRate.toString(),
                localizedDigits,
              )}%`}
              label={t("publicProviderProfileResponseRate")}
              isRtl={isRtl}
            />

            <View style={styles.metricDivider} />

            <ResponseMetric
              value={formatPublicProviderSuffix(formatDigits(
                  provider.averageResponseMinutes.toString(),
                  localizedDigits,
                ), t("publicProviderProfileMinutesSuffix"))}
              label={t("publicProviderProfileResponseTime")}
              isRtl={isRtl}
            />

            <View style={styles.metricDivider} />

            <ResponseMetric
              value={formatPublicProviderPrefix(t("publicProviderProfileFromPrefix"), formatCurrency(provider.minimumPrice, activeLanguage),
              )}
              label={t("publicProviderProfileStartingPrice")}
              isRtl={isRtl}
            />
          </View>

          <ProfileSection title={t("publicProviderProfileServicesTitle")} isRtl={isRtl}>
            <View style={styles.servicesGrid}>
              {provider.services.map((service) => (
                <View key={service.id} style={styles.serviceCard}>
                  <View style={styles.serviceIcon}>
                    <Ionicons
                      name={getServiceIcon(service.id)}
                      size={22}
                      color={KhedmatPalette.blue500}
                    />
                  </View>

                  <Text style={[styles.serviceTitle, directionStyle(isRtl)]}>
                    {service.title}
                  </Text>

                  <Text style={[styles.servicePrice, directionStyle(isRtl)]}>
                    {formatPublicProviderPrefix(t("publicProviderProfileFromPrefix"), formatCurrency(service.estimatedPrice, activeLanguage),
                    )}
                  </Text>
                </View>
              ))}
            </View>
          </ProfileSection>

          <ProfileSection title={t("publicProviderProfileAboutTitle")} isRtl={isRtl}>
            <View style={styles.descriptionCard}>
              <Text style={[styles.descriptionText, directionStyle(isRtl)]}>
                {provider.description}
              </Text>
            </View>
          </ProfileSection>

          <ProfileSection title={t("publicProviderProfileScheduleTitle")} isRtl={isRtl}>
            <View style={styles.detailsCard}>
              <ProfileDetail
                icon="navigate-outline"
                label={t("publicProviderProfileServiceRadius")}
                value={formatPublicProviderRadius(
                  t("publicProviderProfileRadiusPrefix"),
                  formatDigits(
                    provider.serviceRadiusKm.toString(),
                    localizedDigits,
                  ),
                  t("publicProviderProfileRadiusSuffix"),
                )}
                isRtl={isRtl}
              />

              <View style={styles.detailDivider} />

              <ProfileDetail
                icon="calendar-outline"
                label={t("publicProviderProfileWorkingDays")}
                value={formatWorkingDays(provider.workingDays, activeLanguage)}
                isRtl={isRtl}
              />

              <View style={styles.detailDivider} />

              <ProfileDetail
                icon="time-outline"
                label={t("publicProviderProfileWorkingHours")}
                value={formatPublicProviderTimeRange(
                  formatTime(
                    provider.startTime,
                    activeLanguage,
                  ),
                  formatTime(
                    provider.endTime,
                    activeLanguage,
                  ),
                  t("publicProviderProfileTimeConnector"),
                )}
                isRtl={isRtl}
              />
            </View>
          </ProfileSection>

          <ProfileSection
            title={t("publicProviderProfilePortfolioTitle")}
            isRtl={isRtl}
          >
            {provider.portfolio.length > 0 ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.portfolioRow}
                style={{
                  direction: isRtl ? "rtl" : "ltr",
                }}
              >
                {provider.portfolio.map((item) => (
                  <View key={item.id} style={styles.portfolioCard}>
                    <View style={styles.portfolioImage}>
                      <Ionicons
                        name="image-outline"
                        size={34}
                        color={KhedmatPalette.blue500}
                      />
                    </View>

                    <Text
                      numberOfLines={2}
                      style={[styles.portfolioText, directionStyle(isRtl)]}
                    >
                      {item.title}
                    </Text>
                  </View>
                ))}
              </ScrollView>
            ) : (
              <EmptySection
                icon="images-outline"
                title={t("publicProviderProfileNoPortfolioTitle")}
                text={t("publicProviderProfileNoPortfolioText")}
                isRtl={isRtl}
              />
            )}
          </ProfileSection>

          <ProfileSection
            title={t("publicProviderProfileReviewsTitle")}
            isRtl={isRtl}
          >
            {provider.reviews.length > 0 ? (
              <View style={styles.reviewsList}>
                {provider.reviews.map((review) => (
                  <ReviewCard
                    key={review.id}
                    review={review}
                    language={activeLanguage}
                    isRtl={isRtl}
                  />
                ))}
              </View>
            ) : (
              <EmptySection
                icon="chatbubble-ellipses-outline"
                title={t("publicProviderProfileNoReviewsTitle")}
                text={t("publicProviderProfileNoReviewsText")}
                isRtl={isRtl}
              />
            )}
          </ProfileSection>

          {relatedProviders.length > 0 ? (
            <ProfileSection title={t("publicProviderProfileRelatedTitle")} isRtl={isRtl}>
              <View style={styles.relatedList}>
                {relatedProviders.map((relatedProvider) => (
                  <Pressable
                    key={relatedProvider.id}
                    accessibilityRole="button"
                    accessibilityLabel={relatedProvider.name}
                    onPress={() => openRelatedProvider(relatedProvider.id)}
                    style={({ pressed }) => [
                      styles.relatedCard,
                      {
                        flexDirection: isRtl ? "row-reverse" : "row",
                      },
                      pressed && styles.cardPressed,
                    ]}
                  >
                    <View style={styles.relatedAvatar}>
                      <Text style={styles.relatedInitials}>
                        {relatedProvider.initials}
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.relatedCopy,
                        {
                          alignItems: isRtl ? "flex-end" : "flex-start",
                        },
                      ]}
                    >
                      <Text style={[styles.relatedName, directionStyle(isRtl)]}>
                        {relatedProvider.name}
                      </Text>

                      <Text
                        style={[
                          styles.relatedProfession,
                          directionStyle(isRtl),
                        ]}
                      >
                        {relatedProvider.profession}
                      </Text>

                      <View
                        style={[
                          styles.relatedMeta,
                          {
                            flexDirection: isRtl ? "row-reverse" : "row",
                          },
                        ]}
                      >
                        <Ionicons name="star" size={13} color={WARNING} />

                        <Text style={styles.relatedMetaText}>
                          {formatDigits(
                            relatedProvider.rating.toFixed(1),
                            localizedDigits,
                          )}
                        </Text>

                        <Text style={styles.relatedMetaText}>
                          • {relatedProvider.locationLabel}
                        </Text>
                      </View>
                    </View>

                    <Ionicons
                      name={isRtl ? "chevron-back" : "chevron-forward"}
                      size={18}
                      color={KhedmatPalette.textMuted}
                    />
                  </Pressable>
                ))}
              </View>
            </ProfileSection>
          ) : null}

          <View
            style={[
              styles.safetyCard,
              {
                flexDirection: isRtl ? "row-reverse" : "row",
                borderColor: provider.verified ? "#A9D9BD" : "#E5C875",
                backgroundColor: provider.verified ? "#F5FCF8" : "#FFFDF6",
              },
            ]}
          >
            <View
              style={[
                styles.safetyIcon,
                {
                  backgroundColor: provider.verified
                    ? SUCCESS_SOFT
                    : WARNING_SOFT,
                },
              ]}
            >
              <Ionicons
                name={
                  provider.verified
                    ? "shield-checkmark-outline"
                    : "alert-circle-outline"
                }
                size={24}
                color={provider.verified ? SUCCESS : WARNING}
              />
            </View>

            <View
              style={[
                styles.safetyCopy,
                {
                  alignItems: isRtl ? "flex-end" : "flex-start",
                },
              ]}
            >
              <Text style={[styles.safetyTitle, directionStyle(isRtl)]}>
                {provider.verified ? t("publicProviderProfileVerifiedTitle") : t("publicProviderProfileUnverifiedTitle")}
              </Text>

              <Text style={[styles.safetyText, directionStyle(isRtl)]}>
                {provider.verified ? t("publicProviderProfileVerifiedText") : t("publicProviderProfileUnverifiedText")}
              </Text>
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <View style={styles.footerContent}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t("publicProviderProfileBook")}
              onPress={handleBook}
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
                  name="calendar-outline"
                  size={20}
                  color={KhedmatPalette.white}
                />

                <Text style={[styles.primaryButtonText, directionStyle(isRtl)]}>
                  {t("publicProviderProfileBook")}
                </Text>
              </View>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t("publicProviderProfileMessage")}
              onPress={handleMessage}
              style={({ pressed }) => [
                styles.messageButton,
                pressed && styles.messageButtonPressed,
              ]}
            >
              <Ionicons
                name="chatbubble-outline"
                size={21}
                color={KhedmatPalette.navy700}
              />

              <Text style={[styles.messageButtonText, directionStyle(isRtl)]}>
                {t("publicProviderProfileMessage")}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

function StatusBadge({
  icon,
  text,
  tone,
  isRtl,
}: {
  icon: IconName;
  text: string;
  tone: "success" | "warning" | "info" | "muted";
  isRtl: boolean;
}) {
  const toneStyle = getStatusTone(tone);

  return (
    <View
      style={[
        styles.statusBadge,
        {
          flexDirection: isRtl ? "row-reverse" : "row",
          backgroundColor: toneStyle.backgroundColor,
        },
      ]}
    >
      <Ionicons name={icon} size={13} color={toneStyle.color} />

      <Text
        style={[
          styles.statusBadgeText,
          {
            color: toneStyle.color,
          },
          directionStyle(isRtl),
        ]}
      >
        {text}
      </Text>
    </View>
  );
}

function StatCard({
  icon,
  value,
  label,
  iconColor = KhedmatPalette.blue500,
  isRtl,
}: {
  icon: IconName;
  value: string;
  label: string;
  iconColor?: string;
  isRtl: boolean;
}) {
  return (
    <View style={styles.statCard}>
      <Ionicons name={icon} size={21} color={iconColor} />

      <Text numberOfLines={1} style={styles.statValue}>
        {value}
      </Text>

      <Text numberOfLines={2} style={[styles.statLabel, directionStyle(isRtl)]}>
        {label}
      </Text>
    </View>
  );
}

function ResponseMetric({
  value,
  label,
  isRtl,
}: {
  value: string;
  label: string;
  isRtl: boolean;
}) {
  return (
    <View style={styles.responseMetric}>
      <Text
        numberOfLines={2}
        adjustsFontSizeToFit
        minimumFontScale={0.75}
        style={[styles.responseValue, directionStyle(isRtl)]}
      >
        {value}
      </Text>

      <Text style={[styles.responseLabel, directionStyle(isRtl)]}>{label}</Text>
    </View>
  );
}

function ProfileSection({
  title,
  actionLabel,
  onAction,
  isRtl,
  children,
}: {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
  isRtl: boolean;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <View
        style={[
          styles.sectionHeader,
          {
            flexDirection: isRtl ? "row-reverse" : "row",
          },
        ]}
      >
        <Text style={[styles.sectionTitle, directionStyle(isRtl)]}>
          {title}
        </Text>

        {actionLabel && onAction ? (
          <Pressable
            accessibilityRole="button"
            onPress={onAction}
            style={({ pressed }) => [
              styles.sectionAction,
              {
                flexDirection: isRtl ? "row-reverse" : "row",
              },
              pressed && styles.pressed,
            ]}
          >
            <Text style={[styles.sectionActionText, directionStyle(isRtl)]}>
              {actionLabel}
            </Text>

            <Ionicons
              name={isRtl ? "chevron-back" : "chevron-forward"}
              size={15}
              color={KhedmatPalette.blue500}
            />
          </Pressable>
        ) : null}
      </View>

      {children}
    </View>
  );
}

function ProfileDetail({
  icon,
  label,
  value,
  isRtl,
}: {
  icon: IconName;
  label: string;
  value: string;
  isRtl: boolean;
}) {
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

        <Text style={[styles.detailValue, directionStyle(isRtl)]}>{value}</Text>
      </View>
    </View>
  );
}

function ReviewCard({
  review,
  language,
  isRtl,
}: {
  review: ProviderReview;
  language: LanguageName;
  isRtl: boolean;
}) {
  return (
    <View style={styles.reviewCard}>
      <View
        style={[
          styles.reviewHeader,
          {
            flexDirection: isRtl ? "row-reverse" : "row",
          },
        ]}
      >
        <View style={styles.reviewAvatar}>
          <Text style={styles.reviewInitials}>{review.customerInitials}</Text>
        </View>

        <View
          style={[
            styles.reviewCopy,
            {
              alignItems: isRtl ? "flex-end" : "flex-start",
            },
          ]}
        >
          <Text style={[styles.reviewName, directionStyle(isRtl)]}>
            {review.customerName}
          </Text>

          <View
            style={[
              styles.reviewMeta,
              {
                flexDirection: isRtl ? "row-reverse" : "row",
              },
            ]}
          >
            <View style={styles.stars}>
              {Array.from({
                length: 5,
              }).map((_, index) => (
                <Ionicons
                  key={index}
                  name={index < review.rating ? "star" : "star-outline"}
                  size={13}
                  color={WARNING}
                />
              ))}
            </View>

            <Text style={styles.reviewDate}>
              {formatReviewDate(review.createdAt, language)}
            </Text>
          </View>
        </View>
      </View>

      <Text style={[styles.reviewComment, directionStyle(isRtl)]}>
        {review.comment}
      </Text>
    </View>
  );
}

function EmptySection({
  icon,
  title,
  text,
  isRtl,
}: {
  icon: IconName;
  title: string;
  text: string;
  isRtl: boolean;
}) {
  return (
    <View style={styles.emptyCard}>
      <View style={styles.emptyIcon}>
        <Ionicons name={icon} size={30} color={KhedmatPalette.blue500} />
      </View>

      <Text style={[styles.emptyTitle, directionStyle(isRtl)]}>{title}</Text>

      <Text style={[styles.emptyText, directionStyle(isRtl)]}>{text}</Text>
    </View>
  );
}

function getStatusTone(tone: "success" | "warning" | "info" | "muted") {
  if (tone === "success") {
    return {
      color: SUCCESS,
      backgroundColor: SUCCESS_SOFT,
    };
  }

  if (tone === "warning") {
    return {
      color: WARNING,
      backgroundColor: WARNING_SOFT,
    };
  }

  if (tone === "info") {
    return {
      color: KhedmatPalette.blue500,
      backgroundColor: INFO_SOFT,
    };
  }

  return {
    color: KhedmatPalette.textMuted,
    backgroundColor: KhedmatPalette.surfaceSoft,
  };
}

function getLocalizedCategoryTitle(
  categoryId: ProviderProfile["categoryId"],
  language: LanguageName,
): string {
  const titles: Record<
    ProviderProfile["categoryId"],
    Record<LanguageName, string>
  > = {
    electrician: {
      English: "Electrician",
      Dari: "برق‌کار",
      Pashto: "برېښناکار",
    },
    plumber: {
      English: "Plumber",
      Dari: "لوله‌کش",
      Pashto: "نلدوان",
    },
    carpenter: {
      English: "Carpenter",
      Dari: "نجار",
      Pashto: "ترکاڼ",
    },
    construction: {
      English: "Construction",
      Dari: "ساختمان",
      Pashto: "ساختماني کار",
    },
    painter: {
      English: "Painter",
      Dari: "رنگ‌مال",
      Pashto: "رنګمال",
    },
    cleaner: {
      English: "Cleaner",
      Dari: "نظافت‌چی",
      Pashto: "پاک‌کار",
    },
    "ac-technician": {
      English: "AC technician",
      Dari: "تخنیکر کولر",
      Pashto: "د اې سي تخنیکر",
    },
    driver: {
      English: "Driver",
      Dari: "راننده",
      Pashto: "موټر چلوونکی",
    },
    "phone-repair": {
      English: "Phone repair",
      Dari: "ترمیم موبایل",
      Pashto: "د موبایل ترمیم",
    },
    "computer-repair": {
      English: "Computer repair",
      Dari: "ترمیم کمپیوتر",
      Pashto: "د کمپیوټر ترمیم",
    },
    tailor: {
      English: "Tailor",
      Dari: "خیاط",
      Pashto: "خیاط",
    },
    barber: {
      English: "Barber",
      Dari: "آرایشگر",
      Pashto: "سلماني",
    },
    tutor: {
      English: "Tutor",
      Dari: "معلم خصوصی",
      Pashto: "خصوصي ښوونکی",
    },
    photographer: {
      English: "Photographer",
      Dari: "عکاس",
      Pashto: "عکاس",
    },
    other: {
      English: "Service provider",
      Dari: "ارائه‌دهندهٔ خدمات",
      Pashto: "خدمت وړاندې کوونکی",
    },
  };

  return titles[categoryId][language];
}

function getSingleParam(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

function getServiceIcon(serviceId: string): IconName {
  const normalized = serviceId.toLowerCase();

  if (normalized.includes("wiring")) {
    return "git-branch-outline";
  }

  if (normalized.includes("lighting")) {
    return "bulb-outline";
  }

  if (normalized.includes("generator")) {
    return "battery-charging-outline";
  }

  if (normalized.includes("socket") || normalized.includes("breaker")) {
    return "flash-outline";
  }

  if (normalized.includes("heater")) {
    return "flame-outline";
  }

  if (
    normalized.includes("pipe") ||
    normalized.includes("water") ||
    normalized.includes("drain")
  ) {
    return "water-outline";
  }

  if (
    normalized.includes("cabinet") ||
    normalized.includes("door") ||
    normalized.includes("furniture")
  ) {
    return "hammer-outline";
  }

  if (normalized.includes("clean")) {
    return "sparkles-outline";
  }

  if (
    normalized.includes("hardware") ||
    normalized.includes("operating-system") ||
    normalized.includes("virus")
  ) {
    return "laptop-outline";
  }

  return "construct-outline";
}

function formatWorkingDays(days: string[], language: LanguageName): string {
  const labels = {
    English: {
      saturday: "Saturday",
      sunday: "Sunday",
      monday: "Monday",
      tuesday: "Tuesday",
      wednesday: "Wednesday",
      thursday: "Thursday",
      friday: "Friday",
    },
    Dari: {
      saturday: "شنبه",
      sunday: "یک‌شنبه",
      monday: "دوشنبه",
      tuesday: "سه‌شنبه",
      wednesday: "چهارشنبه",
      thursday: "پنج‌شنبه",
      friday: "جمعه",
    },
    Pashto: {
      saturday: "شنبه",
      sunday: "یکشنبه",
      monday: "دوشنبه",
      tuesday: "سه‌شنبه",
      wednesday: "چهارشنبه",
      thursday: "پنجشنبه",
      friday: "جمعه",
    },
  } as const;

  return days
    .map(
      (day) =>
        labels[language][day as keyof (typeof labels)[LanguageName]] ?? day,
    )
    .join(language === "English" ? ", " : "، ");
}

function formatTime(value: string, language: LanguageName): string {
  if (!value) {
    return language === "English"
      ? "Not specified"
      : language === "Dari"
        ? "نامشخص"
        : "نه دی ټاکل شوی";
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
            ? "شب"
            : "ماښام";

  return `${formatDigits(`${displayHour}:${minute}`, true)} ${period}`;
}

function formatCurrency(amount: number, language: LanguageName): string {
  const formatted = new Intl.NumberFormat("en-US").format(amount);

  if (language === "English") {
    return `${formatted} AFN`;
  }

  return language === "Dari"
    ? `${formatDigits(formatted, true)} افغانی`
    : `${formatDigits(formatted, true)} افغانۍ`;
}

function formatReviewDate(value: string, language: LanguageName): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  try {
    return new Intl.DateTimeFormat(language === "English" ? "en-US" : "fa-AF", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  } catch {
    return date.toLocaleDateString();
  }
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

function formatPublicProviderShare(
  template: string,
  name: string,
  profession: string,
): string {
  return template
    .replace("{name}", name)
    .replace("{profession}", profession);
}

function formatPublicProviderSuffix(
  value: string,
  suffix: string,
): string {
  return `${value} ${suffix}`;
}

function formatPublicProviderPrefix(
  prefix: string,
  value: string,
): string {
  return `${prefix} ${value}`;
}

function formatPublicProviderRadius(
  prefix: string,
  value: string,
  suffix: string,
): string {
  return `${prefix} ${value} ${suffix}`;
}

function formatPublicProviderTimeRange(
  start: string,
  end: string,
  connector: string,
): string {
  return `${start} ${connector} ${end}`;
}

const styles = StyleSheet.create({
  providerState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.md,
    paddingHorizontal: Layout.screenPadding,
  },

  providerStateTitle: {
    ...Typography.sectionTitle,
    width: "100%",
    maxWidth: Layout.readableTextMaxWidth,
    color: KhedmatPalette.textPrimary,
    textAlign: "center",
  },

  providerStateBody: {
    ...Typography.bodyStyle,
    width: "100%",
    maxWidth: Layout.readableTextMaxWidth,
    color: KhedmatPalette.textMuted,
    textAlign: "center",
  },

  retryButton: {
    minHeight: Layout.minimumTouchTarget,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.md,
    backgroundColor: KhedmatPalette.navy900,
  },

  retryButtonText: {
    ...Typography.buttonLabel,
    color: KhedmatPalette.white,
  },

  backStateButton: {
    minHeight: Layout.minimumTouchTarget,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: KhedmatPalette.border,
    backgroundColor: KhedmatPalette.surface,
  },

  backStateButtonText: {
    ...Typography.label,
    color: KhedmatPalette.navy700,
  },

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
    paddingTop: Spacing.md,
    paddingBottom: 138,
  },

  topBar: {
    width: "100%",
    minHeight: 48,
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.sm,
  },

  topBarTitle: {
    ...Typography.label,
    flex: 1,
    color: KhedmatPalette.textPrimary,
    textAlign: "center",
    fontSize: 16,
  },

  topActions: {
    alignItems: "center",
    gap: Spacing.sm,
  },

  iconButton: {
    width: 44,
    height: 44,
    flexShrink: 0,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: KhedmatPalette.border,
    backgroundColor: KhedmatPalette.surface,
  },


  hero: {
    width: "100%",
    marginTop: Spacing.xl,
    alignItems: "center",
    gap: Spacing.lg,
  },

  avatarWrapper: {
    width: 108,
    height: 108,
  },

  avatar: {
    width: 108,
    height: 108,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: KhedmatPalette.navy900,
    ...Shadows.medium,
  },

  avatarText: {
    color: KhedmatPalette.white,
    fontFamily: Fonts.bold,
    fontSize: 34,
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
    backgroundColor: KhedmatPalette.blue500,
    borderWidth: 3,
    borderColor: KhedmatPalette.blue050,
  },

  heroCopy: {
    width: "100%",
    alignItems: "center",
    gap: Spacing.xs,
  },

  nameRow: {
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
  },

  providerName: {
    ...Typography.screenTitle,
    flexShrink: 1,
    color: KhedmatPalette.textPrimary,
    textAlign: "center",
    fontSize: 28,
    lineHeight: 35,
  },

  profession: {
    ...Typography.bodyLarge,
    width: "100%",
    color: KhedmatPalette.textSecondary,
    textAlign: "center",
  },

  locationRow: {
    marginTop: Spacing.xs,
    alignItems: "center",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: 4,
  },

  locationText: {
    ...Typography.captionStyle,
    color: KhedmatPalette.textMuted,
    textAlign: "center",
  },

  locationDivider: {
    color: KhedmatPalette.textMuted,
  },

  distanceText: {
    ...Typography.captionStyle,
    color: KhedmatPalette.textMuted,
    textAlign: "center",
  },

  badgesRow: {
    marginTop: Spacing.sm,
    alignItems: "center",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },

  statusBadge: {
    minHeight: 30,
    paddingHorizontal: Spacing.sm,
    alignItems: "center",
    gap: 5,
    borderRadius: Radius.pill,
  },

  statusBadgeText: {
    ...Typography.captionStyle,
    fontFamily: Fonts.medium,
    fontSize: 10,
  },

  statsGrid: {
    width: "100%",
    marginTop: Spacing.xxl,
    flexDirection: "row",
    gap: Spacing.sm,
  },

  statCard: {
    flex: 1,
    minHeight: 118,
    padding: Spacing.md,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.xs,
    borderWidth: 1,
    borderColor: KhedmatPalette.border,
    borderRadius: Radius.xl,
    backgroundColor: KhedmatPalette.surface,
    ...Shadows.small,
  },

  statValue: {
    color: KhedmatPalette.textPrimary,
    fontFamily: Fonts.bold,
    fontSize: 20,
    lineHeight: 26,
    textAlign: "center",
  },

  statLabel: {
    ...Typography.captionStyle,
    color: KhedmatPalette.textMuted,
    textAlign: "center",
    fontSize: 10,
    lineHeight: 15,
  },

  responseCard: {
    width: "100%",
    minHeight: 104,
    marginTop: Spacing.md,
    paddingVertical: Spacing.lg,
    flexDirection: "row",
    alignItems: "stretch",
    borderWidth: 1,
    borderColor: KhedmatPalette.border,
    borderRadius: Radius.xl,
    backgroundColor: KhedmatPalette.surface,
    ...Shadows.small,
  },

  responseMetric: {
    flex: 1,
    paddingHorizontal: Spacing.sm,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },

  responseValue: {
    color: KhedmatPalette.navy900,
    fontFamily: Fonts.bold,
    fontSize: 15,
    lineHeight: 20,
    textAlign: "center",
  },

  responseLabel: {
    ...Typography.captionStyle,
    color: KhedmatPalette.textMuted,
    textAlign: "center",
    fontSize: 9,
  },

  metricDivider: {
    width: StyleSheet.hairlineWidth,
    backgroundColor: KhedmatPalette.border,
  },

  section: {
    width: "100%",
    marginTop: Spacing.section,
    gap: Spacing.md,
  },

  sectionHeader: {
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

  sectionAction: {
    alignItems: "center",
    gap: 3,
  },

  sectionActionText: {
    ...Typography.captionStyle,
    color: KhedmatPalette.blue500,
    fontFamily: Fonts.medium,
  },

  servicesGrid: {
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },

  serviceCard: {
    width: "48.7%",
    minHeight: 144,
    padding: Spacing.md,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: KhedmatPalette.border,
    borderRadius: Radius.xl,
    backgroundColor: KhedmatPalette.surface,
    ...Shadows.small,
  },

  serviceIcon: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: KhedmatPalette.surfaceSoft,
  },

  serviceTitle: {
    ...Typography.label,
    width: "100%",
    color: KhedmatPalette.textPrimary,
    textAlign: "center",
    fontSize: 14,
    lineHeight: 20,
  },

  servicePrice: {
    ...Typography.captionStyle,
    width: "100%",
    color: KhedmatPalette.blue500,
    fontFamily: Fonts.medium,
    textAlign: "center",
    lineHeight: 17,
  },

  descriptionCard: {
    width: "100%",
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: KhedmatPalette.border,
    borderRadius: Radius.xl,
    backgroundColor: KhedmatPalette.surface,
    ...Shadows.small,
  },

  descriptionText: {
    ...Typography.bodyLarge,
    width: "100%",
    color: KhedmatPalette.textSecondary,
    lineHeight: 26,
  },

  detailsCard: {
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
    fontSize: 14,
    lineHeight: 20,
  },

  detailDivider: {
    width: "100%",
    height: StyleSheet.hairlineWidth,
    marginVertical: Spacing.md,
    backgroundColor: KhedmatPalette.border,
  },

  portfolioRow: {
    gap: Spacing.md,
    paddingHorizontal: 1,
    paddingBottom: Spacing.sm,
  },

  portfolioCard: {
    width: 176,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: KhedmatPalette.border,
    borderRadius: Radius.xl,
    backgroundColor: KhedmatPalette.surface,
    ...Shadows.small,
  },

  portfolioImage: {
    width: "100%",
    height: 118,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: KhedmatPalette.surfaceSoft,
  },

  portfolioText: {
    ...Typography.label,
    minHeight: 58,
    padding: Spacing.md,
    color: KhedmatPalette.textPrimary,
    fontSize: 14,
    lineHeight: 19,
  },

  reviewsList: {
    width: "100%",
    gap: Spacing.md,
  },

  reviewCard: {
    width: "100%",
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: KhedmatPalette.border,
    borderRadius: Radius.xl,
    backgroundColor: KhedmatPalette.surface,
    ...Shadows.small,
  },

  reviewHeader: {
    width: "100%",
    alignItems: "center",
    gap: Spacing.md,
  },

  reviewAvatar: {
    width: 44,
    height: 44,
    flexShrink: 0,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: KhedmatPalette.navy900,
  },

  reviewInitials: {
    color: KhedmatPalette.white,
    fontFamily: Fonts.bold,
    fontSize: 13,
  },

  reviewCopy: {
    flex: 1,
    gap: 3,
  },

  reviewName: {
    ...Typography.label,
    width: "100%",
    color: KhedmatPalette.textPrimary,
    fontSize: 15,
  },

  reviewMeta: {
    alignItems: "center",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },

  stars: {
    flexDirection: "row",
    gap: 2,
  },

  reviewDate: {
    ...Typography.captionStyle,
    color: KhedmatPalette.textMuted,
    fontSize: 10,
  },

  reviewComment: {
    ...Typography.bodyStyle,
    width: "100%",
    marginTop: Spacing.md,
    color: KhedmatPalette.textSecondary,
    lineHeight: 22,
  },

  emptyCard: {
    width: "100%",
    minHeight: 220,
    padding: Spacing.xl,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: KhedmatPalette.border,
    borderRadius: Radius.xl,
    backgroundColor: KhedmatPalette.surface,
  },

  emptyIcon: {
    width: 68,
    height: 68,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: KhedmatPalette.surfaceSoft,
  },

  emptyTitle: {
    ...Typography.sectionTitle,
    maxWidth: 340,
    color: KhedmatPalette.textPrimary,
    textAlign: "center",
    fontSize: 18,
  },

  emptyText: {
    ...Typography.bodyStyle,
    maxWidth: 350,
    color: KhedmatPalette.textSecondary,
    textAlign: "center",
  },

  relatedList: {
    width: "100%",
    gap: Spacing.md,
  },

  relatedCard: {
    width: "100%",
    minHeight: 92,
    padding: Spacing.md,
    alignItems: "center",
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: KhedmatPalette.border,
    borderRadius: Radius.xl,
    backgroundColor: KhedmatPalette.surface,
    ...Shadows.small,
  },

  relatedAvatar: {
    width: 50,
    height: 50,
    flexShrink: 0,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: KhedmatPalette.navy900,
  },

  relatedInitials: {
    color: KhedmatPalette.white,
    fontFamily: Fonts.bold,
    fontSize: 14,
  },

  relatedCopy: {
    flex: 1,
    gap: 2,
  },

  relatedName: {
    ...Typography.label,
    width: "100%",
    color: KhedmatPalette.textPrimary,
    fontSize: 15,
  },

  relatedProfession: {
    ...Typography.captionStyle,
    width: "100%",
    color: KhedmatPalette.textSecondary,
  },

  relatedMeta: {
    marginTop: 2,
    alignItems: "center",
    flexWrap: "wrap",
    gap: 4,
  },

  relatedMetaText: {
    ...Typography.captionStyle,
    color: KhedmatPalette.textMuted,
    fontSize: 10,
  },

  safetyCard: {
    width: "100%",
    minHeight: 112,
    marginTop: Spacing.section,
    padding: Spacing.lg,
    alignItems: "flex-start",
    gap: Spacing.md,
    borderWidth: 1,
    borderRadius: Radius.xl,
  },

  safetyIcon: {
    width: 48,
    height: 48,
    flexShrink: 0,
    borderRadius: Radius.lg,
    alignItems: "center",
    justifyContent: "center",
  },

  safetyCopy: {
    flex: 1,
    gap: 3,
  },

  safetyTitle: {
    ...Typography.label,
    width: "100%",
    color: KhedmatPalette.textPrimary,
    fontSize: 15,
  },

  safetyText: {
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
    flexDirection: "row",
    gap: Spacing.sm,
  },

  primaryButton: {
    flex: 1,
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
  },

  messageButton: {
    minWidth: 104,
    minHeight: Layout.controlHeight,
    paddingHorizontal: Spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: KhedmatPalette.border,
    borderRadius: Radius.lg,
    backgroundColor: KhedmatPalette.surfaceSoft,
  },

  messageButtonPressed: {
    opacity: 0.78,
  },

  messageButtonText: {
    ...Typography.label,
    color: KhedmatPalette.navy700,
    fontFamily: Fonts.medium,
    fontSize: 14,
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
