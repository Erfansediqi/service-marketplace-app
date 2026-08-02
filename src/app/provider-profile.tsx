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
import {
  getProviderById,
  ProviderProfile,
  ProviderReview,
  providers,
} from "../data/providers";

type IconName =
  ComponentProps<typeof Ionicons>["name"];

type LanguageName =
  | "English"
  | "Dari"
  | "Pashto";

type ProfileCopy = ReturnType<
  typeof getProfileCopy
>;

const SUCCESS = "#268A57";
const SUCCESS_SOFT = "#E8F6EE";
const WARNING = "#8A5A00";
const WARNING_SOFT = "#FFF4D6";
const ERROR = "#B3261E";
const ERROR_SOFT = "#FCE8E6";
const INFO_SOFT = "#E5F4F8";

export default function ProviderProfileScreen() {
  const router = useRouter();

  const params =
    useLocalSearchParams<{
      providerId?:
        | string
        | string[];
    }>();

  const { language } =
    useLanguage();

  const activeLanguage =
    normalizeLanguage(language);

  const isRtl =
    activeLanguage === "Dari" ||
    activeLanguage === "Pashto";

  const localizedDigits =
    activeLanguage !== "English";

  const copy =
    getProfileCopy(
      activeLanguage,
    );

  const providerId =
    getSingleParam(
      params.providerId,
    );

  const provider =
    useMemo<ProviderProfile>(
      () =>
        getProviderById(
          providerId,
        ) ??
        getProviderById(
          "provider-1",
        )!,
      [providerId],
    );

  const relatedProviders =
    useMemo(
      () =>
        providers
          .filter(
            (item) =>
              item.id !==
                provider.id &&
              item.categoryId ===
                provider.categoryId,
          )
          .sort(
            (
              first,
              second,
            ) =>
              second.rating -
              first.rating,
          )
          .slice(0, 3),
      [
        provider.categoryId,
        provider.id,
      ],
    );

  const [saved, setSaved] =
    useState(false);

  const handleBook = () => {
    router.push({
      pathname:
        "/booking-create",
      params: {
        providerId:
          provider.id,
      },
    });
  };

  const handleMessage = () => {
    router.push({
      pathname:
        "/(tabs)/messages",
      params: {
        providerId:
          provider.id,
      },
    } as never);
  };

  const handleShare =
    async () => {
      try {
        await Share.share({
          message:
            copy.shareMessage(
              provider.name,
              provider.profession,
            ),
        });
      } catch (error) {
        console.error(
          "Provider profile sharing failed:",
          error,
        );
      }
    };

  const openRelatedProvider = (
    nextProviderId: string,
  ) => {
    router.push({
      pathname:
        "/provider-profile",
      params: {
        providerId:
          nextProviderId,
      },
    });
  };

  return (
    <SafeAreaView
      style={styles.safeArea}
    >
      <View style={styles.root}>
        <ScrollView
          showsVerticalScrollIndicator={
            false
          }
          contentContainerStyle={
            styles.scrollContent
          }
        >
          <View
            style={[
              styles.topBar,
              {
                flexDirection: isRtl
                  ? "row-reverse"
                  : "row",
              },
            ]}
          >
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={
                copy.back
              }
              onPress={() =>
                router.back()
              }
              style={({ pressed }) => [
                styles.iconButton,
                pressed &&
                  styles.pressed,
              ]}
            >
              <Ionicons
                name={
                  isRtl
                    ? "chevron-forward"
                    : "chevron-back"
                }
                size={24}
                color={
                  KhedmatPalette
                    .navy900
                }
              />
            </Pressable>

            <Text
              style={[
                styles.topBarTitle,
                directionStyle(isRtl),
              ]}
            >
              {copy.pageTitle}
            </Text>

            <View
              style={[
                styles.topActions,
                {
                  flexDirection: isRtl
                    ? "row-reverse"
                    : "row",
                },
              ]}
            >
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={
                  copy.share
                }
                onPress={handleShare}
                style={({ pressed }) => [
                  styles.iconButton,
                  pressed &&
                    styles.pressed,
                ]}
              >
                <Ionicons
                  name="share-social-outline"
                  size={20}
                  color={
                    KhedmatPalette
                      .navy700
                  }
                />
              </Pressable>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel={
                  saved
                    ? copy.removeSaved
                    : copy.save
                }
                accessibilityState={{
                  selected: saved,
                }}
                onPress={() =>
                  setSaved(
                    (current) =>
                      !current,
                  )
                }
                style={({ pressed }) => [
                  styles.iconButton,
                  saved &&
                    styles.savedButton,
                  pressed &&
                    styles.pressed,
                ]}
              >
                <Ionicons
                  name={
                    saved
                      ? "heart"
                      : "heart-outline"
                  }
                  size={21}
                  color={
                    saved
                      ? ERROR
                      : KhedmatPalette
                          .navy700
                  }
                />
              </Pressable>
            </View>
          </View>

          <View style={styles.hero}>
            <View
              style={
                styles.avatarWrapper
              }
            >
              <View
                style={styles.avatar}
              >
                <Text
                  style={
                    styles.avatarText
                  }
                >
                  {provider.initials}
                </Text>
              </View>

              {provider.verified ? (
                <View
                  style={
                    styles.verifiedBadge
                  }
                >
                  <Ionicons
                    name="checkmark"
                    size={14}
                    color={
                      KhedmatPalette
                        .white
                    }
                  />
                </View>
              ) : null}
            </View>

            <View
              style={
                styles.heroCopy
              }
            >
              <View
                style={[
                  styles.nameRow,
                  {
                    flexDirection: isRtl
                      ? "row-reverse"
                      : "row",
                  },
                ]}
              >
                <Text
                  style={[
                    styles.providerName,
                    directionStyle(
                      isRtl,
                    ),
                  ]}
                >
                  {provider.name}
                </Text>

                {provider.verified ? (
                  <Ionicons
                    name="shield-checkmark"
                    size={19}
                    color={
                      KhedmatPalette
                        .blue500
                    }
                  />
                ) : null}
              </View>

              <Text
                style={[
                  styles.profession,
                  directionStyle(isRtl),
                ]}
              >
                {provider.profession}
              </Text>

              <View
                style={[
                  styles.locationRow,
                  {
                    flexDirection: isRtl
                      ? "row-reverse"
                      : "row",
                  },
                ]}
              >
                <Ionicons
                  name="location-outline"
                  size={16}
                  color={
                    KhedmatPalette
                      .textMuted
                  }
                />

                <Text
                  style={[
                    styles.locationText,
                    directionStyle(
                      isRtl,
                    ),
                  ]}
                >
                  {
                    provider.locationLabel
                  }
                </Text>

                <Text
                  style={
                    styles.locationDivider
                  }
                >
                  •
                </Text>

                <Text
                  style={[
                    styles.distanceText,
                    directionStyle(
                      isRtl,
                    ),
                  ]}
                >
                  {copy.distance(
                    formatDigits(
                      provider.distanceKm.toFixed(
                        1,
                      ),
                      localizedDigits,
                    ),
                  )}
                </Text>
              </View>

              <View
                style={[
                  styles.badgesRow,
                  {
                    flexDirection: isRtl
                      ? "row-reverse"
                      : "row",
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
                      ? copy.availableToday
                      : copy.unavailableToday
                  }
                  tone={
                    provider.availableToday
                      ? "success"
                      : "muted"
                  }
                  isRtl={isRtl}
                />

                {provider.acceptsUrgentRequests ? (
                  <StatusBadge
                    icon="flash"
                    text={
                      copy.urgentRequests
                    }
                    tone="warning"
                    isRtl={isRtl}
                  />
                ) : null}

                {provider.instantBooking ? (
                  <StatusBadge
                    icon="calendar-outline"
                    text={
                      copy.instantBooking
                    }
                    tone="info"
                    isRtl={isRtl}
                  />
                ) : null}
              </View>
            </View>
          </View>

          <View
            style={styles.statsGrid}
          >
            <StatCard
              icon="star"
              value={formatDigits(
                provider.rating.toFixed(
                  1,
                ),
                localizedDigits,
              )}
              label={copy.reviews(
                formatDigits(
                  provider.reviewCount.toString(),
                  localizedDigits,
                ),
              )}
              iconColor={WARNING}
              isRtl={isRtl}
            />

            <StatCard
              icon="briefcase-outline"
              value={formatDigits(
                provider.completedJobs.toString(),
                localizedDigits,
              )}
              label={
                copy.completedJobs
              }
              isRtl={isRtl}
            />

            <StatCard
              icon="ribbon-outline"
              value={
                activeLanguage ===
                "English"
                  ? provider.yearsExperience
                  : formatDigits(
                      provider.yearsExperience,
                      true,
                    )
              }
              label={
                copy.workExperience
              }
              isRtl={isRtl}
            />
          </View>

          <View
            style={
              styles.responseCard
            }
          >
            <ResponseMetric
              value={`${formatDigits(
                provider.responseRate.toString(),
                localizedDigits,
              )}%`}
              label={
                copy.responseRate
              }
              isRtl={isRtl}
            />

            <View
              style={
                styles.metricDivider
              }
            />

            <ResponseMetric
              value={copy.minutes(
                formatDigits(
                  provider.averageResponseMinutes.toString(),
                  localizedDigits,
                ),
              )}
              label={
                copy.responseTime
              }
              isRtl={isRtl}
            />

            <View
              style={
                styles.metricDivider
              }
            />

            <ResponseMetric
              value={copy.fromPrice(
                formatCurrency(
                  provider.minimumPrice,
                  activeLanguage,
                ),
              )}
              label={
                copy.startingPrice
              }
              isRtl={isRtl}
            />
          </View>

          <ProfileSection
            title={
              copy.servicesTitle
            }
            isRtl={isRtl}
          >
            <View
              style={
                styles.servicesGrid
              }
            >
              {provider.services.map(
                (service) => (
                  <View
                    key={service.id}
                    style={
                      styles.serviceCard
                    }
                  >
                    <View
                      style={
                        styles.serviceIcon
                      }
                    >
                      <Ionicons
                        name={getServiceIcon(
                          service.id,
                        )}
                        size={22}
                        color={
                          KhedmatPalette
                            .blue500
                        }
                      />
                    </View>

                    <Text
                      style={[
                        styles.serviceTitle,
                        directionStyle(
                          isRtl,
                        ),
                      ]}
                    >
                      {service.title}
                    </Text>

                    <Text
                      style={[
                        styles.servicePrice,
                        directionStyle(
                          isRtl,
                        ),
                      ]}
                    >
                      {copy.fromPrice(
                        formatCurrency(
                          service.estimatedPrice,
                          activeLanguage,
                        ),
                      )}
                    </Text>
                  </View>
                ),
              )}
            </View>
          </ProfileSection>

          <ProfileSection
            title={copy.aboutTitle}
            isRtl={isRtl}
          >
            <View
              style={
                styles.descriptionCard
              }
            >
              <Text
                style={[
                  styles.descriptionText,
                  directionStyle(isRtl),
                ]}
              >
                {
                  provider.description
                }
              </Text>
            </View>
          </ProfileSection>

          <ProfileSection
            title={
              copy.scheduleTitle
            }
            isRtl={isRtl}
          >
            <View
              style={
                styles.detailsCard
              }
            >
              <ProfileDetail
                icon="navigate-outline"
                label={
                  copy.serviceRadius
                }
                value={copy.radiusValue(
                  formatDigits(
                    provider.serviceRadiusKm.toString(),
                    localizedDigits,
                  ),
                )}
                isRtl={isRtl}
              />

              <View
                style={
                  styles.detailDivider
                }
              />

              <ProfileDetail
                icon="calendar-outline"
                label={
                  copy.workingDays
                }
                value={formatWorkingDays(
                  provider.workingDays,
                  activeLanguage,
                )}
                isRtl={isRtl}
              />

              <View
                style={
                  styles.detailDivider
                }
              />

              <ProfileDetail
                icon="time-outline"
                label={
                  copy.workingHours
                }
                value={copy.timeRange(
                  formatTime(
                    provider.startTime,
                    activeLanguage,
                  ),
                  formatTime(
                    provider.endTime,
                    activeLanguage,
                  ),
                )}
                isRtl={isRtl}
              />
            </View>
          </ProfileSection>

          <ProfileSection
            title={
              copy.portfolioTitle
            }
            actionLabel={
              provider.portfolio.length >
              0
                ? copy.viewAll
                : undefined
            }
            onAction={
              provider.portfolio.length >
              0
                ? () =>
                    console.log(
                      "Open portfolio:",
                      provider.id,
                    )
                : undefined
            }
            isRtl={isRtl}
          >
            {provider.portfolio.length >
            0 ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={
                  false
                }
                contentContainerStyle={
                  styles.portfolioRow
                }
                style={{
                  direction: isRtl
                    ? "rtl"
                    : "ltr",
                }}
              >
                {provider.portfolio.map(
                  (item) => (
                    <View
                      key={item.id}
                      style={
                        styles.portfolioCard
                      }
                    >
                      <View
                        style={
                          styles.portfolioImage
                        }
                      >
                        <Ionicons
                          name="image-outline"
                          size={34}
                          color={
                            KhedmatPalette
                              .blue500
                          }
                        />
                      </View>

                      <Text
                        numberOfLines={2}
                        style={[
                          styles.portfolioText,
                          directionStyle(
                            isRtl,
                          ),
                        ]}
                      >
                        {item.title}
                      </Text>
                    </View>
                  ),
                )}
              </ScrollView>
            ) : (
              <EmptySection
                icon="images-outline"
                title={
                  copy.noPortfolioTitle
                }
                text={
                  copy.noPortfolioText
                }
                isRtl={isRtl}
              />
            )}
          </ProfileSection>

          <ProfileSection
            title={
              copy.reviewsTitle
            }
            actionLabel={
              provider.reviewCount > 0
                ? copy.allReviews(
                    formatDigits(
                      provider.reviewCount.toString(),
                      localizedDigits,
                    ),
                  )
                : undefined
            }
            onAction={
              provider.reviewCount > 0
                ? () =>
                    console.log(
                      "Open reviews:",
                      provider.id,
                    )
                : undefined
            }
            isRtl={isRtl}
          >
            {provider.reviews.length >
            0 ? (
              <View
                style={
                  styles.reviewsList
                }
              >
                {provider.reviews.map(
                  (review) => (
                    <ReviewCard
                      key={review.id}
                      review={review}
                      language={
                        activeLanguage
                      }
                      isRtl={isRtl}
                    />
                  ),
                )}
              </View>
            ) : (
              <EmptySection
                icon="chatbubble-ellipses-outline"
                title={
                  copy.noReviewsTitle
                }
                text={
                  copy.noReviewsText
                }
                isRtl={isRtl}
              />
            )}
          </ProfileSection>

          {relatedProviders.length >
          0 ? (
            <ProfileSection
              title={
                copy.relatedTitle
              }
              isRtl={isRtl}
            >
              <View
                style={
                  styles.relatedList
                }
              >
                {relatedProviders.map(
                  (
                    relatedProvider,
                  ) => (
                    <Pressable
                      key={
                        relatedProvider.id
                      }
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
                        styles.relatedCard,
                        {
                          flexDirection: isRtl
                            ? "row-reverse"
                            : "row",
                        },
                        pressed &&
                          styles.cardPressed,
                      ]}
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
                        style={[
                          styles.relatedCopy,
                          {
                            alignItems: isRtl
                              ? "flex-end"
                              : "flex-start",
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.relatedName,
                            directionStyle(
                              isRtl,
                            ),
                          ]}
                        >
                          {
                            relatedProvider.name
                          }
                        </Text>

                        <Text
                          style={[
                            styles.relatedProfession,
                            directionStyle(
                              isRtl,
                            ),
                          ]}
                        >
                          {
                            relatedProvider.profession
                          }
                        </Text>

                        <View
                          style={[
                            styles.relatedMeta,
                            {
                              flexDirection: isRtl
                                ? "row-reverse"
                                : "row",
                            },
                          ]}
                        >
                          <Ionicons
                            name="star"
                            size={13}
                            color={
                              WARNING
                            }
                          />

                          <Text
                            style={
                              styles.relatedMetaText
                            }
                          >
                            {formatDigits(
                              relatedProvider.rating.toFixed(
                                1,
                              ),
                              localizedDigits,
                            )}
                          </Text>

                          <Text
                            style={
                              styles.relatedMetaText
                            }
                          >
                            •{" "}
                            {
                              relatedProvider.locationLabel
                            }
                          </Text>
                        </View>
                      </View>

                      <Ionicons
                        name={
                          isRtl
                            ? "chevron-back"
                            : "chevron-forward"
                        }
                        size={18}
                        color={
                          KhedmatPalette
                            .textMuted
                        }
                      />
                    </Pressable>
                  ),
                )}
              </View>
            </ProfileSection>
          ) : null}

          <View
            style={[
              styles.safetyCard,
              {
                flexDirection: isRtl
                  ? "row-reverse"
                  : "row",
                borderColor:
                  provider.verified
                    ? "#A9D9BD"
                    : "#E5C875",
                backgroundColor:
                  provider.verified
                    ? "#F5FCF8"
                    : "#FFFDF6",
              },
            ]}
          >
            <View
              style={[
                styles.safetyIcon,
                {
                  backgroundColor:
                    provider.verified
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
                color={
                  provider.verified
                    ? SUCCESS
                    : WARNING
                }
              />
            </View>

            <View
              style={[
                styles.safetyCopy,
                {
                  alignItems: isRtl
                    ? "flex-end"
                    : "flex-start",
                },
              ]}
            >
              <Text
                style={[
                  styles.safetyTitle,
                  directionStyle(isRtl),
                ]}
              >
                {provider.verified
                  ? copy.verifiedTitle
                  : copy.unverifiedTitle}
              </Text>

              <Text
                style={[
                  styles.safetyText,
                  directionStyle(isRtl),
                ]}
              >
                {provider.verified
                  ? copy.verifiedText
                  : copy.unverifiedText}
              </Text>
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <View
            style={
              styles.footerContent
            }
          >
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={
                copy.book
              }
              onPress={handleBook}
              style={({ pressed }) => [
                styles.primaryButton,
                pressed &&
                  styles.primaryButtonPressed,
              ]}
            >
              <View
                style={[
                  styles.buttonContent,
                  {
                    flexDirection: isRtl
                      ? "row-reverse"
                      : "row",
                  },
                ]}
              >
                <Ionicons
                  name="calendar-outline"
                  size={20}
                  color={
                    KhedmatPalette
                      .white
                  }
                />

                <Text
                  style={[
                    styles.primaryButtonText,
                    directionStyle(isRtl),
                  ]}
                >
                  {copy.book}
                </Text>
              </View>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={
                copy.message
              }
              onPress={handleMessage}
              style={({ pressed }) => [
                styles.messageButton,
                pressed &&
                  styles.messageButtonPressed,
              ]}
            >
              <Ionicons
                name="chatbubble-outline"
                size={21}
                color={
                  KhedmatPalette
                    .navy700
                }
              />

              <Text
                style={[
                  styles.messageButtonText,
                  directionStyle(isRtl),
                ]}
              >
                {copy.message}
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
  tone:
    | "success"
    | "warning"
    | "info"
    | "muted";
  isRtl: boolean;
}) {
  const toneStyle =
    getStatusTone(tone);

  return (
    <View
      style={[
        styles.statusBadge,
        {
          flexDirection: isRtl
            ? "row-reverse"
            : "row",
          backgroundColor:
            toneStyle.backgroundColor,
        },
      ]}
    >
      <Ionicons
        name={icon}
        size={13}
        color={toneStyle.color}
      />

      <Text
        style={[
          styles.statusBadgeText,
          {
            color:
              toneStyle.color,
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
    <View
      style={styles.statCard}
    >
      <Ionicons
        name={icon}
        size={21}
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
        style={[
          styles.statLabel,
          directionStyle(isRtl),
        ]}
      >
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
    <View
      style={
        styles.responseMetric
      }
    >
      <Text
        numberOfLines={2}
        adjustsFontSizeToFit
        minimumFontScale={0.75}
        style={[
          styles.responseValue,
          directionStyle(isRtl),
        ]}
      >
        {value}
      </Text>

      <Text
        style={[
          styles.responseLabel,
          directionStyle(isRtl),
        ]}
      >
        {label}
      </Text>
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
            flexDirection: isRtl
              ? "row-reverse"
              : "row",
          },
        ]}
      >
        <Text
          style={[
            styles.sectionTitle,
            directionStyle(isRtl),
          ]}
        >
          {title}
        </Text>

        {actionLabel &&
        onAction ? (
          <Pressable
            accessibilityRole="button"
            onPress={onAction}
            style={({ pressed }) => [
              styles.sectionAction,
              {
                flexDirection: isRtl
                  ? "row-reverse"
                  : "row",
              },
              pressed &&
                styles.pressed,
            ]}
          >
            <Text
              style={[
                styles.sectionActionText,
                directionStyle(isRtl),
              ]}
            >
              {actionLabel}
            </Text>

            <Ionicons
              name={
                isRtl
                  ? "chevron-back"
                  : "chevron-forward"
              }
              size={15}
              color={
                KhedmatPalette
                  .blue500
              }
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
          flexDirection: isRtl
            ? "row-reverse"
            : "row",
        },
      ]}
    >
      <View
        style={
          styles.detailIcon
        }
      >
        <Ionicons
          name={icon}
          size={20}
          color={
            KhedmatPalette
              .blue500
          }
        />
      </View>

      <View
        style={[
          styles.detailCopy,
          {
            alignItems: isRtl
              ? "flex-end"
              : "flex-start",
          },
        ]}
      >
        <Text
          style={[
            styles.detailLabel,
            directionStyle(isRtl),
          ]}
        >
          {label}
        </Text>

        <Text
          style={[
            styles.detailValue,
            directionStyle(isRtl),
          ]}
        >
          {value}
        </Text>
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
    <View
      style={
        styles.reviewCard
      }
    >
      <View
        style={[
          styles.reviewHeader,
          {
            flexDirection: isRtl
              ? "row-reverse"
              : "row",
          },
        ]}
      >
        <View
          style={
            styles.reviewAvatar
          }
        >
          <Text
            style={
              styles.reviewInitials
            }
          >
            {
              review.customerInitials
            }
          </Text>
        </View>

        <View
          style={[
            styles.reviewCopy,
            {
              alignItems: isRtl
                ? "flex-end"
                : "flex-start",
            },
          ]}
        >
          <Text
            style={[
              styles.reviewName,
              directionStyle(isRtl),
            ]}
          >
            {
              review.customerName
            }
          </Text>

          <View
            style={[
              styles.reviewMeta,
              {
                flexDirection: isRtl
                  ? "row-reverse"
                  : "row",
              },
            ]}
          >
            <View
              style={
                styles.stars
              }
            >
              {Array.from({
                length: 5,
              }).map(
                (_, index) => (
                  <Ionicons
                    key={index}
                    name={
                      index <
                      review.rating
                        ? "star"
                        : "star-outline"
                    }
                    size={13}
                    color={WARNING}
                  />
                ),
              )}
            </View>

            <Text
              style={
                styles.reviewDate
              }
            >
              {formatReviewDate(
                review.createdAt,
                language,
              )}
            </Text>
          </View>
        </View>
      </View>

      <Text
        style={[
          styles.reviewComment,
          directionStyle(isRtl),
        ]}
      >
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
    <View
      style={
        styles.emptyCard
      }
    >
      <View
        style={
          styles.emptyIcon
        }
      >
        <Ionicons
          name={icon}
          size={30}
          color={
            KhedmatPalette
              .blue500
          }
        />
      </View>

      <Text
        style={[
          styles.emptyTitle,
          directionStyle(isRtl),
        ]}
      >
        {title}
      </Text>

      <Text
        style={[
          styles.emptyText,
          directionStyle(isRtl),
        ]}
      >
        {text}
      </Text>
    </View>
  );
}

function getStatusTone(
  tone:
    | "success"
    | "warning"
    | "info"
    | "muted",
) {
  if (tone === "success") {
    return {
      color: SUCCESS,
      backgroundColor:
        SUCCESS_SOFT,
    };
  }

  if (tone === "warning") {
    return {
      color: WARNING,
      backgroundColor:
        WARNING_SOFT,
    };
  }

  if (tone === "info") {
    return {
      color:
        KhedmatPalette.blue500,
      backgroundColor:
        INFO_SOFT,
    };
  }

  return {
    color:
      KhedmatPalette.textMuted,
    backgroundColor:
      KhedmatPalette.surfaceSoft,
  };
}

function getSingleParam(
  value:
    | string
    | string[]
    | undefined,
): string {
  return Array.isArray(value)
    ? value[0] ?? ""
    : value ?? "";
}

function getServiceIcon(
  serviceId: string,
): IconName {
  const normalized =
    serviceId.toLowerCase();

  if (
    normalized.includes("wiring")
  ) {
    return "git-branch-outline";
  }

  if (
    normalized.includes("lighting")
  ) {
    return "bulb-outline";
  }

  if (
    normalized.includes("generator")
  ) {
    return "battery-charging-outline";
  }

  if (
    normalized.includes("socket") ||
    normalized.includes("breaker")
  ) {
    return "flash-outline";
  }

  if (
    normalized.includes("heater")
  ) {
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

  if (
    normalized.includes("clean")
  ) {
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

function formatWorkingDays(
  days: string[],
  language: LanguageName,
): string {
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
        labels[language][
          day as keyof (typeof labels)[LanguageName]
        ] ?? day,
    )
    .join(
      language === "English"
        ? ", "
        : "، ",
    );
}

function formatTime(
  value: string,
  language: LanguageName,
): string {
  if (!value) {
    return language === "English"
      ? "Not specified"
      : language === "Dari"
        ? "نامشخص"
        : "نه دی ټاکل شوی";
  }

  const [
    hourText,
    minute = "00",
  ] = value.split(":");

  const hour =
    Number(hourText);

  if (
    !Number.isFinite(hour)
  ) {
    return value;
  }

  if (language === "English") {
    const period =
      hour >= 12 ? "PM" : "AM";

    const displayHour =
      hour % 12 || 12;

    return `${displayHour}:${minute} ${period}`;
  }

  const displayHour =
    hour % 12 || 12;

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

  return `${formatDigits(
    `${displayHour}:${minute}`,
    true,
  )} ${period}`;
}

function formatCurrency(
  amount: number,
  language: LanguageName,
): string {
  const formatted =
    new Intl.NumberFormat(
      "en-US",
    ).format(amount);

  if (language === "English") {
    return `${formatted} AFN`;
  }

  return language === "Dari"
    ? `${formatDigits(
        formatted,
        true,
      )} افغانی`
    : `${formatDigits(
        formatted,
        true,
      )} افغانۍ`;
}

function formatReviewDate(
  value: string,
  language: LanguageName,
): string {
  const date = new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return value;
  }

  try {
    return new Intl.DateTimeFormat(
      language === "English"
        ? "en-US"
        : "fa-AF",
      {
        year: "numeric",
        month: "short",
        day: "numeric",
      },
    ).format(date);
  } catch {
    return date.toLocaleDateString();
  }
}

function normalizeLanguage(
  language: string,
): LanguageName {
  if (language === "Dari") {
    return "Dari";
  }

  if (language === "Pashto") {
    return "Pashto";
  }

  return "English";
}

function directionStyle(
  isRtl: boolean,
) {
  return {
    textAlign: isRtl
      ? ("right" as const)
      : ("left" as const),
    writingDirection: isRtl
      ? ("rtl" as const)
      : ("ltr" as const),
  };
}

function formatDigits(
  value: string,
  localized: boolean,
): string {
  if (!localized) {
    return value;
  }

  const digits: Record<
    string,
    string
  > = {
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

function getProfileCopy(
  language: LanguageName,
) {
  if (language === "Dari") {
    return {
      back: "بازگشت",
      pageTitle:
        "پروفایل ارائه‌دهنده",
      share:
        "اشتراک‌گذاری پروفایل",
      save:
        "ذخیره ارائه‌دهنده",
      removeSaved:
        "حذف از ذخیره‌شده‌ها",
      shareMessage:
        (
          name: string,
          profession: string,
        ) =>
          `${name} — ${profession} در خدمت`,
      distance:
        (value: string) =>
          `${value} کیلومتر`,
      availableToday:
        "امروز آمادهٔ کار",
      unavailableToday:
        "امروز در دسترس نیست",
      urgentRequests:
        "درخواست فوری",
      instantBooking:
        "رزرو فوری",
      reviews:
        (value: string) =>
          `${value} نظر`,
      completedJobs:
        "کار تکمیل‌شده",
      workExperience:
        "تجربهٔ کاری",
      responseRate:
        "نرخ پاسخ",
      responseTime:
        "زمان پاسخ",
      startingPrice:
        "قیمت ابتدایی",
      minutes:
        (value: string) =>
          `${value} دقیقه`,
      fromPrice:
        (value: string) =>
          `از ${value}`,
      servicesTitle:
        "خدمات ارائه‌شده",
      aboutTitle:
        "دربارهٔ ارائه‌دهنده",
      scheduleTitle:
        "محدوده و برنامهٔ کاری",
      serviceRadius:
        "محدودهٔ خدمات",
      radiusValue:
        (value: string) =>
          `تا ${value} کیلومتر`,
      workingDays:
        "روزهای کاری",
      workingHours:
        "ساعت کاری",
      timeRange:
        (
          start: string,
          end: string,
        ) =>
          `${start} تا ${end}`,
      portfolioTitle:
        "نمونه‌کارها",
      viewAll:
        "مشاهده همه",
      noPortfolioTitle:
        "هنوز نمونه‌کاری ثبت نشده است",
      noPortfolioText:
        "نمونه‌کارهای این ارائه‌دهنده پس از افزودن در این بخش نمایش داده می‌شوند.",
      reviewsTitle:
        "نظرهای مشتریان",
      allReviews:
        (value: string) =>
          `همهٔ ${value} نظر`,
      noReviewsTitle:
        "هنوز نظری ثبت نشده است",
      noReviewsText:
        "نظرهای مشتریان پس از تکمیل خدمات در این بخش نمایش داده می‌شوند.",
      relatedTitle:
        "ارائه‌دهندگان مشابه",
      verifiedTitle:
        "ارائه‌دهندهٔ تأییدشده",
      verifiedText:
        "هویت و معلومات حرفه‌ای این ارائه‌دهنده توسط خدمت بررسی شده است.",
      unverifiedTitle:
        "حساب هنوز تأیید نشده است",
      unverifiedText:
        "پیش از رزرو، جزئیات حساب، نظرها و شرایط خدمت را با دقت بررسی کنید.",
      book: "رزرو خدمت",
      message: "پیام",
    };
  }

  if (language === "Pashto") {
    return {
      back: "بېرته",
      pageTitle:
        "د خدمت وړاندې کوونکي پروفایل",
      share:
        "پروفایل شریک کړئ",
      save:
        "خدمت وړاندې کوونکی خوندي کړئ",
      removeSaved:
        "له خوندي شوو لرې کړئ",
      shareMessage:
        (
          name: string,
          profession: string,
        ) =>
          `${name} — ${profession} په خدمت کې`,
      distance:
        (value: string) =>
          `${value} کیلومتره`,
      availableToday:
        "نن کار ته چمتو دی",
      unavailableToday:
        "نن شتون نه لري",
      urgentRequests:
        "بیړنۍ غوښتنې",
      instantBooking:
        "فوري رزرف",
      reviews:
        (value: string) =>
          `${value} نظرونه`,
      completedJobs:
        "بشپړ شوي کارونه",
      workExperience:
        "کاري تجربه",
      responseRate:
        "د ځواب کچه",
      responseTime:
        "د ځواب وخت",
      startingPrice:
        "پیل بیه",
      minutes:
        (value: string) =>
          `${value} دقیقې`,
      fromPrice:
        (value: string) =>
          `له ${value}`,
      servicesTitle:
        "وړاندې کېدونکي خدمتونه",
      aboutTitle:
        "د خدمت وړاندې کوونکي په اړه",
      scheduleTitle:
        "د خدمت ساحه او مهال‌وېش",
      serviceRadius:
        "د خدمت ساحه",
      radiusValue:
        (value: string) =>
          `تر ${value} کیلومتره`,
      workingDays:
        "کاري ورځې",
      workingHours:
        "کاري ساعتونه",
      timeRange:
        (
          start: string,
          end: string,
        ) =>
          `له ${start} تر ${end}`,
      portfolioTitle:
        "د کار نمونې",
      viewAll:
        "ټول وګورئ",
      noPortfolioTitle:
        "لا د کار نمونه نشته",
      noPortfolioText:
        "د دې خدمت وړاندې کوونکي د کار نمونې به له زیاتېدو وروسته دلته ښکاره شي.",
      reviewsTitle:
        "د پیرودونکو نظرونه",
      allReviews:
        (value: string) =>
          `ټول ${value} نظرونه`,
      noReviewsTitle:
        "لا کوم نظر نشته",
      noReviewsText:
        "د خدمت تر بشپړېدو وروسته د پیرودونکو نظرونه دلته ښکاره کېږي.",
      relatedTitle:
        "ورته خدمت وړاندې کوونکي",
      verifiedTitle:
        "تایید شوی خدمت وړاندې کوونکی",
      verifiedText:
        "د دې خدمت وړاندې کوونکي هویت او مسلکي معلومات د خدمت له خوا کتل شوي.",
      unverifiedTitle:
        "حساب لا تایید شوی نه دی",
      unverifiedText:
        "تر رزرف مخکې د حساب جزئیات، نظرونه او د خدمت شرایط په دقت وګورئ.",
      book:
        "خدمت رزرف کړئ",
      message: "پیغام",
    };
  }

  return {
    back: "Back",
    pageTitle:
      "Provider profile",
    share:
      "Share provider profile",
    save: "Save provider",
    removeSaved:
      "Remove from saved providers",
    shareMessage:
      (
        name: string,
        profession: string,
      ) =>
        `${name} — ${profession} on Khedmat`,
    distance:
      (value: string) =>
        `${value} km away`,
    availableToday:
      "Available today",
    unavailableToday:
      "Unavailable today",
    urgentRequests:
      "Urgent requests",
    instantBooking:
      "Instant booking",
    reviews:
      (value: string) =>
        `${value} reviews`,
    completedJobs:
      "Completed jobs",
    workExperience:
      "Work experience",
    responseRate:
      "Response rate",
    responseTime:
      "Response time",
    startingPrice:
      "Starting price",
    minutes:
      (value: string) =>
        `${value} min`,
    fromPrice:
      (value: string) =>
        `From ${value}`,
    servicesTitle:
      "Services offered",
    aboutTitle:
      "About the provider",
    scheduleTitle:
      "Service area and schedule",
    serviceRadius:
      "Service radius",
    radiusValue:
      (value: string) =>
        `Up to ${value} km`,
    workingDays:
      "Working days",
    workingHours:
      "Working hours",
    timeRange:
      (
        start: string,
        end: string,
      ) =>
        `${start} to ${end}`,
    portfolioTitle:
      "Portfolio",
    viewAll: "View all",
    noPortfolioTitle:
      "No portfolio items yet",
    noPortfolioText:
      "This provider’s work samples will appear here after they are added.",
    reviewsTitle:
      "Customer reviews",
    allReviews:
      (value: string) =>
        `All ${value} reviews`,
    noReviewsTitle:
      "No reviews yet",
    noReviewsText:
      "Customer reviews will appear here after completed services.",
    relatedTitle:
      "Similar providers",
    verifiedTitle:
      "Verified provider",
    verifiedText:
      "This provider’s identity and professional information have been reviewed by Khedmat.",
    unverifiedTitle:
      "Account not yet verified",
    unverifiedText:
      "Review the account details, customer reviews and service terms carefully before booking.",
    book: "Book service",
    message: "Message",
  };
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor:
      KhedmatPalette.blue050,
  },

  root: {
    flex: 1,
  },

  scrollContent: {
    width: "100%",
    maxWidth:
      Layout.contentMaxWidth,
    alignSelf: "center",
    paddingHorizontal:
      Layout.screenPadding,
    paddingTop: Spacing.md,
    paddingBottom: 138,
  },

  topBar: {
    width: "100%",
    minHeight: 48,
    alignItems: "center",
    justifyContent:
      "space-between",
    gap: Spacing.sm,
  },

  topBarTitle: {
    ...Typography.label,
    flex: 1,
    color:
      KhedmatPalette.textPrimary,
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
    borderColor:
      KhedmatPalette.border,
    backgroundColor:
      KhedmatPalette.surface,
  },

  savedButton: {
    borderColor: "#E7B1AD",
    backgroundColor:
      ERROR_SOFT,
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
    backgroundColor:
      KhedmatPalette.navy900,
    ...Shadows.medium,
  },

  avatarText: {
    color:
      KhedmatPalette.white,
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
    backgroundColor:
      KhedmatPalette.blue500,
    borderWidth: 3,
    borderColor:
      KhedmatPalette.blue050,
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
    color:
      KhedmatPalette.textPrimary,
    textAlign: "center",
    fontSize: 28,
    lineHeight: 35,
  },

  profession: {
    ...Typography.bodyLarge,
    width: "100%",
    color:
      KhedmatPalette.textSecondary,
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
    color:
      KhedmatPalette.textMuted,
    textAlign: "center",
  },

  locationDivider: {
    color:
      KhedmatPalette.textMuted,
  },

  distanceText: {
    ...Typography.captionStyle,
    color:
      KhedmatPalette.textMuted,
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
    paddingHorizontal:
      Spacing.sm,
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
    borderColor:
      KhedmatPalette.border,
    borderRadius: Radius.xl,
    backgroundColor:
      KhedmatPalette.surface,
    ...Shadows.small,
  },

  statValue: {
    color:
      KhedmatPalette.textPrimary,
    fontFamily: Fonts.bold,
    fontSize: 20,
    lineHeight: 26,
    textAlign: "center",
  },

  statLabel: {
    ...Typography.captionStyle,
    color:
      KhedmatPalette.textMuted,
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
    borderColor:
      KhedmatPalette.border,
    borderRadius: Radius.xl,
    backgroundColor:
      KhedmatPalette.surface,
    ...Shadows.small,
  },

  responseMetric: {
    flex: 1,
    paddingHorizontal:
      Spacing.sm,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },

  responseValue: {
    color:
      KhedmatPalette.navy900,
    fontFamily: Fonts.bold,
    fontSize: 15,
    lineHeight: 20,
    textAlign: "center",
  },

  responseLabel: {
    ...Typography.captionStyle,
    color:
      KhedmatPalette.textMuted,
    textAlign: "center",
    fontSize: 9,
  },

  metricDivider: {
    width:
      StyleSheet.hairlineWidth,
    backgroundColor:
      KhedmatPalette.border,
  },

  section: {
    width: "100%",
    marginTop: Spacing.section,
    gap: Spacing.md,
  },

  sectionHeader: {
    width: "100%",
    alignItems: "center",
    justifyContent:
      "space-between",
    gap: Spacing.md,
  },

  sectionTitle: {
    ...Typography.sectionTitle,
    flex: 1,
    color:
      KhedmatPalette.textPrimary,
    fontSize: 21,
    lineHeight: 28,
  },

  sectionAction: {
    alignItems: "center",
    gap: 3,
  },

  sectionActionText: {
    ...Typography.captionStyle,
    color:
      KhedmatPalette.blue500,
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
    borderColor:
      KhedmatPalette.border,
    borderRadius: Radius.xl,
    backgroundColor:
      KhedmatPalette.surface,
    ...Shadows.small,
  },

  serviceIcon: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      KhedmatPalette.surfaceSoft,
  },

  serviceTitle: {
    ...Typography.label,
    width: "100%",
    color:
      KhedmatPalette.textPrimary,
    textAlign: "center",
    fontSize: 14,
    lineHeight: 20,
  },

  servicePrice: {
    ...Typography.captionStyle,
    width: "100%",
    color:
      KhedmatPalette.blue500,
    fontFamily: Fonts.medium,
    textAlign: "center",
    lineHeight: 17,
  },

  descriptionCard: {
    width: "100%",
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor:
      KhedmatPalette.border,
    borderRadius: Radius.xl,
    backgroundColor:
      KhedmatPalette.surface,
    ...Shadows.small,
  },

  descriptionText: {
    ...Typography.bodyLarge,
    width: "100%",
    color:
      KhedmatPalette.textSecondary,
    lineHeight: 26,
  },

  detailsCard: {
    width: "100%",
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor:
      KhedmatPalette.border,
    borderRadius: Radius.xl,
    backgroundColor:
      KhedmatPalette.surface,
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
    backgroundColor:
      KhedmatPalette.surfaceSoft,
  },

  detailCopy: {
    flex: 1,
    gap: 2,
  },

  detailLabel: {
    ...Typography.captionStyle,
    width: "100%",
    color:
      KhedmatPalette.textMuted,
  },

  detailValue: {
    ...Typography.label,
    width: "100%",
    color:
      KhedmatPalette.textPrimary,
    fontSize: 14,
    lineHeight: 20,
  },

  detailDivider: {
    width: "100%",
    height:
      StyleSheet.hairlineWidth,
    marginVertical: Spacing.md,
    backgroundColor:
      KhedmatPalette.border,
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
    borderColor:
      KhedmatPalette.border,
    borderRadius: Radius.xl,
    backgroundColor:
      KhedmatPalette.surface,
    ...Shadows.small,
  },

  portfolioImage: {
    width: "100%",
    height: 118,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      KhedmatPalette.surfaceSoft,
  },

  portfolioText: {
    ...Typography.label,
    minHeight: 58,
    padding: Spacing.md,
    color:
      KhedmatPalette.textPrimary,
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
    borderColor:
      KhedmatPalette.border,
    borderRadius: Radius.xl,
    backgroundColor:
      KhedmatPalette.surface,
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
    backgroundColor:
      KhedmatPalette.navy900,
  },

  reviewInitials: {
    color:
      KhedmatPalette.white,
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
    color:
      KhedmatPalette.textPrimary,
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
    color:
      KhedmatPalette.textMuted,
    fontSize: 10,
  },

  reviewComment: {
    ...Typography.bodyStyle,
    width: "100%",
    marginTop: Spacing.md,
    color:
      KhedmatPalette.textSecondary,
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
    borderColor:
      KhedmatPalette.border,
    borderRadius: Radius.xl,
    backgroundColor:
      KhedmatPalette.surface,
  },

  emptyIcon: {
    width: 68,
    height: 68,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      KhedmatPalette.surfaceSoft,
  },

  emptyTitle: {
    ...Typography.sectionTitle,
    maxWidth: 340,
    color:
      KhedmatPalette.textPrimary,
    textAlign: "center",
    fontSize: 18,
  },

  emptyText: {
    ...Typography.bodyStyle,
    maxWidth: 350,
    color:
      KhedmatPalette.textSecondary,
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
    borderColor:
      KhedmatPalette.border,
    borderRadius: Radius.xl,
    backgroundColor:
      KhedmatPalette.surface,
    ...Shadows.small,
  },

  relatedAvatar: {
    width: 50,
    height: 50,
    flexShrink: 0,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      KhedmatPalette.navy900,
  },

  relatedInitials: {
    color:
      KhedmatPalette.white,
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
    color:
      KhedmatPalette.textPrimary,
    fontSize: 15,
  },

  relatedProfession: {
    ...Typography.captionStyle,
    width: "100%",
    color:
      KhedmatPalette.textSecondary,
  },

  relatedMeta: {
    marginTop: 2,
    alignItems: "center",
    flexWrap: "wrap",
    gap: 4,
  },

  relatedMetaText: {
    ...Typography.captionStyle,
    color:
      KhedmatPalette.textMuted,
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
    color:
      KhedmatPalette.textPrimary,
    fontSize: 15,
  },

  safetyText: {
    ...Typography.captionStyle,
    width: "100%",
    color:
      KhedmatPalette.textSecondary,
    lineHeight: 19,
  },

  footer: {
    position: "absolute",
    right: 0,
    bottom: 0,
    left: 0,
    borderTopWidth:
      StyleSheet.hairlineWidth,
    borderTopColor:
      KhedmatPalette.border,
    backgroundColor:
      KhedmatPalette.surface,
  },

  footerContent: {
    width: "100%",
    maxWidth:
      Layout.contentMaxWidth,
    alignSelf: "center",
    paddingHorizontal:
      Layout.screenPadding,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
    flexDirection: "row",
    gap: Spacing.sm,
  },

  primaryButton: {
    flex: 1,
    minHeight:
      Layout.controlHeight,
    paddingHorizontal:
      Spacing.lg,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: Radius.lg,
    backgroundColor:
      KhedmatPalette.navy900,
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
    color:
      KhedmatPalette.white,
    fontFamily: Fonts.medium,
    fontSize: 16,
  },

  messageButton: {
    minWidth: 104,
    minHeight:
      Layout.controlHeight,
    paddingHorizontal:
      Spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor:
      KhedmatPalette.border,
    borderRadius: Radius.lg,
    backgroundColor:
      KhedmatPalette.surfaceSoft,
  },

  messageButtonPressed: {
    opacity: 0.78,
  },

  messageButtonText: {
    ...Typography.label,
    color:
      KhedmatPalette.navy700,
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
