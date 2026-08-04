import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
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
  useWindowDimensions,
} from "react-native";

import {
  Fonts,
  KhedmatPalette,
  Layout,
  Radius,
  Shadows,
  Spacing,
  Typography,
} from "../../constants/theme";
import {
  BookingRecord,
  useBooking,
} from "../../context/booking-context";
import { useLanguage } from "../../context/languagecontext";
import { useActiveProvider } from "../../hooks/use-active-provider";

type IconName =
  ComponentProps<typeof Ionicons>["name"];

type LanguageName =
  | "English"
  | "Dari"
  | "Pashto";

type ProviderRoute =
  | "/(provider-tabs)/requests"
  | "/(provider-tabs)/calendar"
  | "/(provider-tabs)/messages"
  | "/(provider-tabs)/profile";

type DashboardActionId =
  | "requests"
  | "calendar"
  | "messages"
  | "profile";

type DashboardAction = {
  id: DashboardActionId;
  title: string;
  subtitle: string;
  icon: IconName;
  route: ProviderRoute;
};

type DashboardCopy = ReturnType<
  typeof getDashboardCopy
>;

const SUCCESS = "#268A57";
const SUCCESS_SOFT = "#E8F6EE";

const WARNING = "#9A6500";
const WARNING_SOFT = "#FFF4D6";

const ERROR = "#B3261E";
const ERROR_SOFT = "#FCE8E6";

const INFO_SOFT = "#E5F4F8";

export default function ProviderDashboardScreen() {
  const router = useRouter();

  const { width } =
    useWindowDimensions();

  const { bookings } =
    useBooking();

  const { language } =
    useLanguage();

  const activeLanguage =
    normalizeLanguage(language);

  const isRtl =
    activeLanguage === "Dari" ||
    activeLanguage === "Pashto";

  const copy =
    getDashboardCopy(
      activeLanguage,
    );

  const {
    provider,
    isLoading: providerIsLoading,
    error: providerError,
  } = useActiveProvider();

  const providerId =
    provider?.id ?? "";

  const [
    availableNow,
    setAvailableNow,
  ] = useState(true);

  const providerBookings =
    useMemo(
      () =>
        bookings.filter(
          (booking) =>
            booking.providerId ===
            providerId,
        ),
      [bookings, providerId],
    );

  const pendingBookings =
    useMemo(
      () =>
        providerBookings.filter(
          (booking) =>
            booking.status ===
            "pending",
        ),
      [providerBookings],
    );

  const activeBookings =
    useMemo(
      () =>
        providerBookings.filter(
          (booking) =>
            booking.status ===
              "confirmed" ||
            booking.status ===
              "in-progress",
        ),
      [providerBookings],
    );

  const completedBookings =
    useMemo(
      () =>
        providerBookings.filter(
          (booking) =>
            booking.status ===
            "completed",
        ),
      [providerBookings],
    );

  const todayBookings =
    useMemo(() => {
      const todayId =
        formatDateId(new Date());

      return providerBookings
        .filter(
          (booking) =>
            booking.date ===
              todayId &&
            booking.status !==
              "cancelled",
        )
        .sort((first, second) =>
          first.time.localeCompare(
            second.time,
          ),
        );
    }, [providerBookings]);

  const upcomingBookings =
    useMemo(
      () =>
        providerBookings
          .filter(
            (booking) =>
              booking.status ===
                "confirmed" ||
              booking.status ===
                "pending",
          )
          .sort(
            (
              first,
              second,
            ) =>
              `${first.date}-${first.time}`.localeCompare(
                `${second.date}-${second.time}`,
              ),
          )
          .slice(0, 3),
      [providerBookings],
    );

  const completedRevenue =
    useMemo(
      () =>
        completedBookings.reduce(
          (total, booking) =>
            total +
            booking.servicePrice,
          0,
        ),
      [completedBookings],
    );

  const todayRevenue =
    useMemo(
      () =>
        todayBookings
          .filter(
            (booking) =>
              booking.status ===
              "completed",
          )
          .reduce(
            (total, booking) =>
              total +
              booking.servicePrice,
            0,
          ),
      [todayBookings],
    );

  const actions =
    useMemo<DashboardAction[]>(
      () => [
        {
          id: "requests",
          title:
            copy.quickRequests,
          subtitle:
            copy.quickRequestsSubtitle,
          icon:
            "briefcase-outline",
          route:
            "/(provider-tabs)/requests",
        },
        {
          id: "calendar",
          title:
            copy.quickCalendar,
          subtitle:
            copy.quickCalendarSubtitle,
          icon:
            "calendar-outline",
          route:
            "/(provider-tabs)/calendar",
        },
        {
          id: "messages",
          title:
            copy.quickMessages,
          subtitle:
            copy.quickMessagesSubtitle,
          icon:
            "chatbubble-outline",
          route:
            "/(provider-tabs)/messages",
        },
        {
          id: "profile",
          title:
            copy.quickProfile,
          subtitle:
            copy.quickProfileSubtitle,
          icon:
            "person-outline",
          route:
            "/(provider-tabs)/profile",
        },
      ],
      [copy],
    );

  const compactLayout =
    width < 370;

  const localizedDigits =
    activeLanguage !== "English";

  const openRoute = (
    route: ProviderRoute,
  ) => {
    router.push(route);
  };

  const getActionBadge = (
    actionId: DashboardActionId,
  ) => {
    if (
      actionId === "requests"
    ) {
      return pendingBookings.length;
    }

    if (
      actionId === "messages"
    ) {
      return activeBookings.length;
    }

    return 0;
  };

  if (
    providerIsLoading
  ) {
    return (
      <SafeAreaView
        style={styles.safeArea}
      >
        <View
          style={
            styles.stateContainer
          }
        >
          <Text
            style={[
              styles.stateTitle,
              {
                textAlign: isRtl
                  ? "right"
                  : "left",
              },
            ]}
          >
            {activeLanguage ===
            "Dari"
              ? "در حال بارگذاری پروفایل..."
              : activeLanguage ===
                  "Pashto"
                ? "پروفایل پورته کېږي..."
                : "Loading provider profile..."}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (
    !provider ||
    providerError
  ) {
    return (
      <SafeAreaView
        style={styles.safeArea}
      >
        <View
          style={
            styles.stateContainer
          }
        >
          <Ionicons
            name="alert-circle-outline"
            size={34}
            color={
              KhedmatPalette.error
            }
          />

          <Text
            style={[
              styles.stateTitle,
              {
                textAlign: isRtl
                  ? "right"
                  : "left",
              },
            ]}
          >
            {activeLanguage ===
            "Dari"
              ? "پروفایل ارائه‌دهنده پیدا نشد"
              : activeLanguage ===
                  "Pashto"
                ? "د خدمت چمتو کوونکي پروفایل ونه موندل شو"
                : "Provider profile not found"}
          </Text>

          <Text
            style={[
              styles.stateBody,
              {
                textAlign: isRtl
                  ? "right"
                  : "left",
              },
            ]}
          >
            {activeLanguage ===
            "Dari"
              ? "لطفاً دوباره وارد فضای کاری ارائه‌دهنده شوید."
              : activeLanguage ===
                  "Pashto"
                ? "مهرباني وکړئ د خدمت چمتو کوونکي کاري ځای ته بیا ننوځئ."
                : "Please enter the provider workspace again."}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={styles.safeArea}
    >
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
          <View
            style={[
              styles.identity,
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
                copy.openProfile
              }
              onPress={() =>
                openRoute(
                  "/(provider-tabs)/profile",
                )
              }
              style={({ pressed }) => [
                styles.providerAvatar,
                pressed &&
                  styles.pressed,
              ]}
            >
              <Text
                style={
                  styles.providerInitials
                }
              >
                {getInitials(
                  provider.name,
                )}
              </Text>

              {provider.verified ? (
                <View
                  style={
                    styles.verifiedBadge
                  }
                >
                  <Ionicons
                    name="checkmark"
                    size={10}
                    color={
                      KhedmatPalette.white
                    }
                  />
                </View>
              ) : null}
            </Pressable>

            <View
              style={[
                styles.identityCopy,
                {
                  alignItems: isRtl
                    ? "flex-end"
                    : "flex-start",
                },
              ]}
            >
              <Text
                style={[
                  styles.eyebrow,
                  directionStyle(
                    isRtl,
                  ),
                ]}
              >
                {copy.eyebrow}
              </Text>

              <Text
                numberOfLines={1}
                style={[
                  styles.greeting,
                  directionStyle(
                    isRtl,
                  ),
                ]}
              >
                {copy.greeting},{" "}
                {provider.name}
              </Text>
            </View>
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              copy.notifications
            }
            onPress={() => {
              console.log(
                "Open provider notifications",
              );
            }}
            style={({ pressed }) => [
              styles.notificationButton,
              pressed &&
                styles.pressed,
            ]}
          >
            <Ionicons
              name="notifications-outline"
              size={22}
              color={
                KhedmatPalette
                  .navy900
              }
            />

            {pendingBookings.length >
            0 ? (
              <View
                style={
                  styles.notificationBadge
                }
              >
                <Text
                  style={
                    styles.notificationBadgeText
                  }
                >
                  {formatDigits(
                    pendingBookings.length.toString(),
                    localizedDigits,
                  )}
                </Text>
              </View>
            ) : null}
          </Pressable>
        </View>

        <View style={styles.hero}>
          <Text
            style={[
              styles.heroTitle,
              directionStyle(isRtl),
            ]}
          >
            {copy.heroTitle}
          </Text>

          <Text
            style={[
              styles.heroSubtitle,
              directionStyle(isRtl),
            ]}
          >
            {copy.heroSubtitle}
          </Text>
        </View>

        <View
          style={[
            styles.availabilityCard,
            {
              flexDirection: isRtl
                ? "row-reverse"
                : "row",
            },
          ]}
        >
          <View
            style={[
              styles.availabilityIcon,
              availableNow
                ? styles.availabilityIconActive
                : styles.availabilityIconInactive,
            ]}
          >
            <Ionicons
              name={
                availableNow
                  ? "radio-outline"
                  : "pause-outline"
              }
              size={23}
              color={
                availableNow
                  ? KhedmatPalette.white
                  : KhedmatPalette
                      .textMuted
              }
            />
          </View>

          <View
            style={[
              styles.availabilityCopy,
              {
                alignItems: isRtl
                  ? "flex-end"
                  : "flex-start",
              },
            ]}
          >
            <Text
              style={[
                styles.availabilityLabel,
                directionStyle(
                  isRtl,
                ),
              ]}
            >
              {copy.currentStatus}
            </Text>

            <Text
              style={[
                styles.availabilityTitle,
                directionStyle(
                  isRtl,
                ),
              ]}
            >
              {availableNow
                ? copy.availableTitle
                : copy.unavailableTitle}
            </Text>

            <Text
              style={[
                styles.availabilitySubtitle,
                directionStyle(
                  isRtl,
                ),
              ]}
            >
              {availableNow
                ? copy.availableSubtitle
                : copy.unavailableSubtitle}
            </Text>
          </View>

          <Pressable
            accessibilityRole="switch"
            accessibilityLabel={
              copy.availabilityControl
            }
            accessibilityState={{
              checked:
                availableNow,
            }}
            onPress={() =>
              setAvailableNow(
                (current) =>
                  !current,
              )
            }
            style={({ pressed }) => [
              styles.switchPressable,
              pressed &&
                styles.pressed,
            ]}
          >
            <View
              style={[
                styles.switchTrack,
                availableNow &&
                  styles.switchTrackActive,
              ]}
            >
              <View
                style={[
                  styles.switchThumb,
                  availableNow && {
                    alignSelf: isRtl
                      ? "flex-start"
                      : "flex-end",
                  },
                ]}
              />
            </View>
          </Pressable>
        </View>

        <View
          style={
            styles.metricsGrid
          }
        >
          <MetricCard
            icon="cash-outline"
            label={copy.todayRevenue}
            value={formatCurrency(
              todayRevenue,
              activeLanguage,
            )}
            iconColor={SUCCESS}
            iconBackground={
              SUCCESS_SOFT
            }
            compact={compactLayout}
            isRtl={isRtl}
          />

          <MetricCard
            icon="briefcase-outline"
            label={copy.todayJobs}
            value={formatDigits(
              todayBookings.length.toString(),
              localizedDigits,
            )}
            iconColor={
              KhedmatPalette.blue500
            }
            iconBackground={
              INFO_SOFT
            }
            compact={compactLayout}
            isRtl={isRtl}
          />

          <MetricCard
            icon="time-outline"
            label={copy.newRequests}
            value={formatDigits(
              pendingBookings.length.toString(),
              localizedDigits,
            )}
            iconColor={WARNING}
            iconBackground={
              WARNING_SOFT
            }
            compact={compactLayout}
            isRtl={isRtl}
          />

          <MetricCard
            icon="checkmark-circle-outline"
            label={copy.completedJobs}
            value={formatDigits(
              completedBookings.length.toString(),
              localizedDigits,
            )}
            iconColor={
              KhedmatPalette.navy700
            }
            iconBackground={
              KhedmatPalette.blue050
            }
            compact={compactLayout}
            isRtl={isRtl}
          />
        </View>

        <View style={styles.section}>
          <SectionHeader
            title={copy.newRequestsTitle}
            subtitle={
              pendingBookings.length >
              0
                ? copy.newRequestsCount(
                    formatDigits(
                      pendingBookings.length.toString(),
                      localizedDigits,
                    ),
                  )
                : copy.noNewRequestsSubtitle
            }
            actionLabel={
              pendingBookings.length >
              0
                ? copy.viewAll
                : undefined
            }
            isRtl={isRtl}
            onPress={() =>
              openRoute(
                "/(provider-tabs)/requests",
              )
            }
          />

          {pendingBookings.length >
          0 ? (
            <View
              style={
                styles.requestList
              }
            >
              {pendingBookings
                .slice(0, 2)
                .map((booking) => (
                  <NewRequestCard
                    key={booking.id}
                    booking={booking}
                    language={
                      activeLanguage
                    }
                    isRtl={isRtl}
                    copy={copy}
                    onPress={() =>
                      openRoute(
                        "/(provider-tabs)/requests",
                      )
                    }
                  />
                ))}
            </View>
          ) : (
            <View
              style={[
                styles.emptyRequestCard,
                {
                  flexDirection:
                    isRtl
                      ? "row-reverse"
                      : "row",
                },
              ]}
            >
              <View
                style={
                  styles.emptyRequestIcon
                }
              >
                <Ionicons
                  name="checkmark-done-outline"
                  size={24}
                  color={SUCCESS}
                />
              </View>

              <View
                style={[
                  styles.emptyRequestCopy,
                  {
                    alignItems:
                      isRtl
                        ? "flex-end"
                        : "flex-start",
                  },
                ]}
              >
                <Text
                  style={[
                    styles.emptyRequestTitle,
                    directionStyle(
                      isRtl,
                    ),
                  ]}
                >
                  {
                    copy.noNewRequestsTitle
                  }
                </Text>

                <Text
                  style={[
                    styles.emptyRequestSubtitle,
                    directionStyle(
                      isRtl,
                    ),
                  ]}
                >
                  {
                    copy.noNewRequestsSubtitle
                  }
                </Text>
              </View>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <SectionHeader
            title={copy.quickAccess}
            subtitle={
              copy.quickAccessSubtitle
            }
            isRtl={isRtl}
          />

          <View
            style={
              styles.quickActionsGrid
            }
          >
            {actions.map(
              (action) => (
                <QuickActionCard
                  key={action.id}
                  action={action}
                  badgeCount={getActionBadge(
                    action.id,
                  )}
                  localizedDigits={
                    localizedDigits
                  }
                  isRtl={isRtl}
                  compact={
                    compactLayout
                  }
                  onPress={() =>
                    openRoute(
                      action.route,
                    )
                  }
                />
              ),
            )}
          </View>
        </View>

        <View style={styles.section}>
          <SectionHeader
            title={copy.upcomingTitle}
            subtitle={
              copy.upcomingSubtitle
            }
            actionLabel={
              copy.calendar
            }
            isRtl={isRtl}
            onPress={() =>
              openRoute(
                "/(provider-tabs)/calendar",
              )
            }
          />

          <View
            style={
              styles.upcomingList
            }
          >
            {upcomingBookings.length >
            0 ? (
              upcomingBookings.map(
                (booking) => (
                  <UpcomingJobCard
                    key={booking.id}
                    booking={booking}
                    language={
                      activeLanguage
                    }
                    isRtl={isRtl}
                    copy={copy}
                  />
                ),
              )
            ) : (
              <EmptyUpcoming
                copy={copy}
                isRtl={isRtl}
              />
            )}
          </View>
        </View>

        <View style={styles.section}>
          <SectionHeader
            title={copy.performance}
            subtitle={
              copy.performanceSubtitle
            }
            isRtl={isRtl}
          />

          <View
            style={
              styles.performanceCard
            }
          >
            <PerformanceRow
              icon="star-outline"
              label={
                copy.customerRating
              }
              value={copy.ratingValue(
                formatDigits(
                  provider.rating.toFixed(
                    1,
                  ),
                  localizedDigits,
                ),
              )}
              isRtl={isRtl}
            />

            <View
              style={
                styles.performanceDivider
              }
            />

            <PerformanceRow
              icon="chatbubble-ellipses-outline"
              label={
                copy.averageResponse
              }
              value={copy.minutesValue(
                formatDigits(
                  provider.averageResponseMinutes.toString(),
                  localizedDigits,
                ),
              )}
              isRtl={isRtl}
            />

            <View
              style={
                styles.performanceDivider
              }
            />

            <PerformanceRow
              icon="stats-chart-outline"
              label={
                copy.responseRate
              }
              value={`${formatDigits(
                provider.responseRate.toString(),
                localizedDigits,
              )}%`}
              isRtl={isRtl}
            />

            <View
              style={
                styles.performanceDivider
              }
            />

            <PerformanceRow
              icon="wallet-outline"
              label={
                copy.totalRevenue
              }
              value={formatCurrency(
                completedRevenue,
                activeLanguage,
              )}
              isRtl={isRtl}
            />
          </View>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={
            copy.improveProfile
          }
          onPress={() =>
            openRoute(
              "/(provider-tabs)/profile",
            )
          }
          style={({ pressed }) => [
            styles.tipCard,
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
            style={styles.tipIcon}
          >
            <Ionicons
              name="bulb-outline"
              size={23}
              color={WARNING}
            />
          </View>

          <View
            style={[
              styles.tipCopy,
              {
                alignItems: isRtl
                  ? "flex-end"
                  : "flex-start",
              },
            ]}
          >
            <Text
              style={[
                styles.tipTitle,
                directionStyle(isRtl),
              ]}
            >
              {copy.tipTitle}
            </Text>

            <Text
              style={[
                styles.tipSubtitle,
                directionStyle(isRtl),
              ]}
            >
              {copy.tipSubtitle}
            </Text>
          </View>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

type MetricCardProps = {
  icon: IconName;
  label: string;
  value: string;
  iconColor: string;
  iconBackground: string;
  compact: boolean;
  isRtl: boolean;
};

function MetricCard({
  icon,
  label,
  value,
  iconColor,
  iconBackground,
  compact,
  isRtl,
}: MetricCardProps) {
  return (
    <View
      style={[
        styles.metricCard,
        compact &&
          styles.metricCardCompact,
      ]}
    >
      <View
        style={[
          styles.metricIcon,
          {
            backgroundColor:
              iconBackground,
          },
        ]}
      >
        <Ionicons
          name={icon}
          size={21}
          color={iconColor}
        />
      </View>

      <Text
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.75}
        style={[
          styles.metricValue,
          directionStyle(isRtl),
        ]}
      >
        {value}
      </Text>

      <Text
        numberOfLines={2}
        style={[
          styles.metricLabel,
          directionStyle(isRtl),
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

type SectionHeaderProps = {
  title: string;
  subtitle: string;
  actionLabel?: string;
  isRtl: boolean;
  onPress?: () => void;
};

function SectionHeader({
  title,
  subtitle,
  actionLabel,
  isRtl,
  onPress,
}: SectionHeaderProps) {
  return (
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
      <View
        style={[
          styles.sectionHeaderCopy,
          {
            alignItems: isRtl
              ? "flex-end"
              : "flex-start",
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

        <Text
          style={[
            styles.sectionSubtitle,
            directionStyle(isRtl),
          ]}
        >
          {subtitle}
        </Text>
      </View>

      {actionLabel &&
      onPress ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={
            actionLabel
          }
          onPress={onPress}
          style={({ pressed }) => [
            styles.sectionAction,
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
        </Pressable>
      ) : null}
    </View>
  );
}

type NewRequestCardProps = {
  booking: BookingRecord;
  language: LanguageName;
  isRtl: boolean;
  copy: DashboardCopy;
  onPress: () => void;
};

function NewRequestCard({
  booking,
  language,
  isRtl,
  copy,
  onPress,
}: NewRequestCardProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={
        booking.serviceName
      }
      onPress={onPress}
      style={({ pressed }) => [
        styles.requestCard,
        pressed &&
          styles.cardPressed,
      ]}
    >
      <View
        style={[
          styles.requestTopRow,
          {
            flexDirection: isRtl
              ? "row-reverse"
              : "row",
          },
        ]}
      >
        <View
          style={
            styles.requestIcon
          }
        >
          <Ionicons
            name={getServiceIcon(
              booking.serviceId,
            )}
            size={23}
            color={
              KhedmatPalette.blue500
            }
          />
        </View>

        <View
          style={[
            styles.requestCopy,
            {
              alignItems: isRtl
                ? "flex-end"
                : "flex-start",
            },
          ]}
        >
          <Text
            style={[
              styles.requestEyebrow,
              directionStyle(isRtl),
            ]}
          >
            {copy.freshRequest}
          </Text>

          <Text
            numberOfLines={2}
            style={[
              styles.requestTitle,
              directionStyle(isRtl),
            ]}
          >
            {booking.serviceName}
          </Text>
        </View>

        <View
          style={[
            styles.requestPrice,
            {
              alignItems: isRtl
                ? "flex-start"
                : "flex-end",
            },
          ]}
        >
          <Text
            style={[
              styles.requestPriceLabel,
              directionStyle(isRtl),
            ]}
          >
            {copy.estimated}
          </Text>

          <Text
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.75}
            style={[
              styles.requestPriceValue,
              directionStyle(isRtl),
            ]}
          >
            {formatCurrency(
              booking.servicePrice,
              language,
            )}
          </Text>
        </View>
      </View>

      <View
        style={[
          styles.requestMetaRow,
          {
            flexDirection: isRtl
              ? "row-reverse"
              : "row",
          },
        ]}
      >
        <RequestMeta
          icon="calendar-outline"
          value={formatShortDate(
            booking.date,
            language,
          )}
          isRtl={isRtl}
        />

        <RequestMeta
          icon="time-outline"
          value={formatTime(
            booking.time,
            language,
          )}
          isRtl={isRtl}
        />
      </View>

      <View
        style={[
          styles.requestAddressRow,
          {
            flexDirection: isRtl
              ? "row-reverse"
              : "row",
          },
        ]}
      >
        <Ionicons
          name="location-outline"
          size={15}
          color={
            KhedmatPalette.textMuted
          }
        />

        <Text
          numberOfLines={2}
          style={[
            styles.requestAddress,
            directionStyle(isRtl),
          ]}
        >
          {
            booking.address
              .fullAddress
          }
        </Text>
      </View>
    </Pressable>
  );
}

type RequestMetaProps = {
  icon: IconName;
  value: string;
  isRtl: boolean;
};

function RequestMeta({
  icon,
  value,
  isRtl,
}: RequestMetaProps) {
  return (
    <View
      style={[
        styles.requestMeta,
        {
          flexDirection: isRtl
            ? "row-reverse"
            : "row",
        },
      ]}
    >
      <Ionicons
        name={icon}
        size={14}
        color={
          KhedmatPalette.textMuted
        }
      />

      <Text
        style={[
          styles.requestMetaText,
          directionStyle(isRtl),
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

type QuickActionCardProps = {
  action: DashboardAction;
  badgeCount: number;
  localizedDigits: boolean;
  isRtl: boolean;
  compact: boolean;
  onPress: () => void;
};

function QuickActionCard({
  action,
  badgeCount,
  localizedDigits,
  isRtl,
  compact,
  onPress,
}: QuickActionCardProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={
        action.title
      }
      onPress={onPress}
      style={({ pressed }) => [
        styles.quickActionCard,
        compact &&
          styles.quickActionCardCompact,
        pressed &&
          styles.cardPressed,
      ]}
    >
      <View
        style={
          styles.quickActionIcon
        }
      >
        <Ionicons
          name={action.icon}
          size={23}
          color={
            KhedmatPalette.blue500
          }
        />

        {badgeCount > 0 ? (
          <View
            style={
              styles.quickActionBadge
            }
          >
            <Text
              style={
                styles.quickActionBadgeText
              }
            >
              {formatDigits(
                badgeCount.toString(),
                localizedDigits,
              )}
            </Text>
          </View>
        ) : null}
      </View>

      <Text
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.82}
        style={[
          styles.quickActionTitle,
          directionStyle(isRtl),
        ]}
      >
        {action.title}
      </Text>

      <Text
        numberOfLines={2}
        style={[
          styles.quickActionSubtitle,
          directionStyle(isRtl),
        ]}
      >
        {action.subtitle}
      </Text>
    </Pressable>
  );
}

type UpcomingJobCardProps = {
  booking: BookingRecord;
  language: LanguageName;
  isRtl: boolean;
  copy: DashboardCopy;
};

function UpcomingJobCard({
  booking,
  language,
  isRtl,
  copy,
}: UpcomingJobCardProps) {
  const confirmed =
    booking.status ===
    "confirmed";

  const statusLabel =
    confirmed
      ? copy.confirmed
      : copy.pending;

  return (
    <View
      style={[
        styles.upcomingCard,
        {
          flexDirection: isRtl
            ? "row-reverse"
            : "row",
        },
      ]}
    >
      <View
        style={
          styles.upcomingDate
        }
      >
        <Text
          style={
            styles.upcomingDay
          }
        >
          {getDayNumber(
            booking.date,
            language,
          )}
        </Text>

        <Text
          style={
            styles.upcomingMonth
          }
        >
          {getMonthLabel(
            booking.date,
            language,
          )}
        </Text>
      </View>

      <View
        style={[
          styles.upcomingCopy,
          {
            alignItems: isRtl
              ? "flex-end"
              : "flex-start",
          },
        ]}
      >
        <Text
          numberOfLines={1}
          style={[
            styles.upcomingTitle,
            directionStyle(isRtl),
          ]}
        >
          {booking.serviceName}
        </Text>

        <Text
          numberOfLines={1}
          style={[
            styles.upcomingCustomer,
            directionStyle(isRtl),
          ]}
        >
          {copy.customer} ·{" "}
          {booking.address.label}
        </Text>

        <View
          style={[
            styles.upcomingMeta,
            {
              flexDirection: isRtl
                ? "row-reverse"
                : "row",
            },
          ]}
        >
          <Ionicons
            name="time-outline"
            size={14}
            color={
              KhedmatPalette
                .textMuted
            }
          />

          <Text
            style={[
              styles.upcomingMetaText,
              directionStyle(
                isRtl,
              ),
            ]}
          >
            {formatTime(
              booking.time,
              language,
            )}
          </Text>
        </View>
      </View>

      <View
        style={[
          styles.upcomingStatus,
          {
            backgroundColor:
              confirmed
                ? SUCCESS_SOFT
                : WARNING_SOFT,
          },
        ]}
      >
        <Text
          style={[
            styles.upcomingStatusText,
            {
              color: confirmed
                ? SUCCESS
                : WARNING,
            },
            directionStyle(isRtl),
          ]}
        >
          {statusLabel}
        </Text>
      </View>
    </View>
  );
}

type EmptyUpcomingProps = {
  copy: DashboardCopy;
  isRtl: boolean;
};

function EmptyUpcoming({
  copy,
  isRtl,
}: EmptyUpcomingProps) {
  return (
    <View
      style={
        styles.emptyUpcomingCard
      }
    >
      <View
        style={
          styles.emptyUpcomingIcon
        }
      >
        <Ionicons
          name="calendar-clear-outline"
          size={29}
          color={
            KhedmatPalette.blue500
          }
        />
      </View>

      <Text
        style={[
          styles.emptyUpcomingTitle,
          directionStyle(isRtl),
        ]}
      >
        {copy.noUpcomingTitle}
      </Text>

      <Text
        style={[
          styles.emptyUpcomingSubtitle,
          directionStyle(isRtl),
        ]}
      >
        {copy.noUpcomingSubtitle}
      </Text>
    </View>
  );
}

type PerformanceRowProps = {
  icon: IconName;
  label: string;
  value: string;
  isRtl: boolean;
};

function PerformanceRow({
  icon,
  label,
  value,
  isRtl,
}: PerformanceRowProps) {
  return (
    <View
      style={[
        styles.performanceRow,
        {
          flexDirection: isRtl
            ? "row-reverse"
            : "row",
        },
      ]}
    >
      <View
        style={
          styles.performanceIcon
        }
      >
        <Ionicons
          name={icon}
          size={19}
          color={
            KhedmatPalette.blue500
          }
        />
      </View>

      <View
        style={[
          styles.performanceCopy,
          {
            flexDirection: isRtl
              ? "row-reverse"
              : "row",
          },
        ]}
      >
        <Text
          style={[
            styles.performanceLabel,
            directionStyle(isRtl),
          ]}
        >
          {label}
        </Text>

        <Text
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.75}
          style={[
            styles.performanceValue,
            directionStyle(isRtl),
          ]}
        >
          {value}
        </Text>
      </View>
    </View>
  );
}

function getServiceIcon(
  serviceId: string,
): IconName {
  const normalized =
    serviceId.toLowerCase();

  if (
    normalized.includes(
      "wiring",
    ) ||
    normalized.includes(
      "socket",
    ) ||
    normalized.includes(
      "lighting",
    ) ||
    normalized.includes(
      "breaker",
    ) ||
    normalized.includes(
      "generator",
    ) ||
    normalized.includes(
      "electric",
    )
  ) {
    return "flash-outline";
  }

  if (
    normalized.includes("pipe") ||
    normalized.includes(
      "drain",
    ) ||
    normalized.includes(
      "water",
    ) ||
    normalized.includes(
      "heater",
    ) ||
    normalized.includes(
      "plumb",
    )
  ) {
    return "water-outline";
  }

  if (
    normalized.includes("clean")
  ) {
    return "sparkles-outline";
  }

  if (
    normalized.includes(
      "computer",
    ) ||
    normalized.includes(
      "hardware",
    ) ||
    normalized.includes(
      "virus",
    ) ||
    normalized.includes(
      "phone",
    )
  ) {
    return "laptop-outline";
  }

  if (
    normalized.includes(
      "cabinet",
    ) ||
    normalized.includes("door") ||
    normalized.includes(
      "furniture",
    ) ||
    normalized.includes("wood")
  ) {
    return "hammer-outline";
  }

  return "construct-outline";
}

function formatDateId(
  date: Date,
): string {
  const year =
    date.getFullYear();

  const month = String(
    date.getMonth() + 1,
  ).padStart(2, "0");

  const day = String(
    date.getDate(),
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getInitials(
  name: string,
): string {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) {
    return "P";
  }

  return parts
    .map((part) =>
      part.charAt(0),
    )
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function getBookingDate(
  value: string,
): Date | null {
  const [
    year,
    month,
    day,
  ] = value
    .split("-")
    .map(Number);

  if (
    !year ||
    !month ||
    !day
  ) {
    return null;
  }

  return new Date(
    year,
    month - 1,
    day,
  );
}

function formatShortDate(
  value: string,
  language: LanguageName,
): string {
  const date =
    getBookingDate(value);

  if (!date) {
    return language ===
      "English"
      ? value
      : formatDigits(
          value,
          true,
        );
  }

  try {
    const formatted =
      new Intl.DateTimeFormat(
        language === "English"
          ? "en-US"
          : "fa-AF",
        {
          weekday: "short",
          day: "numeric",
          month: "short",
        },
      ).format(date);

    return language ===
      "English"
      ? formatted
      : formatDigits(
          formatted,
          true,
        );
  } catch {
    return language ===
      "English"
      ? value
      : formatDigits(
          value,
          true,
        );
  }
}

function getDayNumber(
  value: string,
  language: LanguageName,
): string {
  const date =
    getBookingDate(value);

  const day = date
    ? date
        .getDate()
        .toString()
    : value.split("-")[2] ??
      "";

  return language ===
    "English"
    ? day
    : formatDigits(day, true);
}

function getMonthLabel(
  value: string,
  language: LanguageName,
): string {
  const date =
    getBookingDate(value);

  if (!date) {
    return "";
  }

  try {
    return new Intl.DateTimeFormat(
      language === "English"
        ? "en-US"
        : "fa-AF",
      {
        month: "short",
      },
    ).format(date);
  } catch {
    return "";
  }
}

function formatTime(
  value: string,
  language: LanguageName,
): string {
  if (!value) {
    return "";
  }

  const [
    hoursRaw,
    minutesRaw,
  ] = value.split(":");

  const hours =
    Number(hoursRaw);

  const minutes =
    Number(minutesRaw);

  if (
    !Number.isFinite(hours) ||
    !Number.isFinite(minutes)
  ) {
    return language ===
      "English"
      ? value
      : formatDigits(
          value,
          true,
        );
  }

  const date = new Date();

  date.setHours(
    hours,
    minutes,
    0,
    0,
  );

  try {
    const formatted =
      new Intl.DateTimeFormat(
        language === "English"
          ? "en-US"
          : "fa-AF",
        {
          hour: "numeric",
          minute: "2-digit",
        },
      ).format(date);

    return language ===
      "English"
      ? formatted
      : formatDigits(
          formatted,
          true,
        );
  } catch {
    return language ===
      "English"
      ? value
      : formatDigits(
          value,
          true,
        );
  }
}

function formatCurrency(
  amount: number,
  language: LanguageName,
): string {
  const formatted =
    new Intl.NumberFormat(
      "en-US",
    ).format(amount);

  if (
    language === "English"
  ) {
    return `${formatted} AFN`;
  }

  const localized =
    formatDigits(
      formatted,
      true,
    );

  return language === "Dari"
    ? `${localized} افغانی`
    : `${localized} افغانۍ`;
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

function normalizeLanguage(
  language: string,
): LanguageName {
  if (
    language === "Dari"
  ) {
    return "Dari";
  }

  if (
    language === "Pashto"
  ) {
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

function getDashboardCopy(
  language: LanguageName,
) {
  if (
    language === "Dari"
  ) {
    return {
      eyebrow:
        "پنل ارائه‌دهنده",
      greeting: "سلام",

      heroTitle:
        "امروز کارهای خود را مدیریت کنید",

      heroSubtitle:
        "درخواست‌های تازه، برنامهٔ کاری و عملکرد حرفه‌ای خود را در یک‌جا ببینید.",

      notifications: "اعلان‌ها",
      openProfile:
        "باز کردن پروفایل",

      currentStatus:
        "وضعیت فعلی",

      availableTitle:
        "آمادهٔ دریافت کار",

      unavailableTitle:
        "موقتاً در دسترس نیستید",

      availableSubtitle:
        "مشتریان می‌توانند شما را در نتایج فعال ببینند.",

      unavailableSubtitle:
        "تا فعال‌سازی دوباره، درخواست جدید دریافت نمی‌کنید.",

      availabilityControl:
        "وضعیت آمادگی",

      todayRevenue:
        "درآمد امروز",

      todayJobs:
        "کارهای امروز",

      newRequests:
        "درخواست جدید",

      completedJobs:
        "کار تکمیل‌شده",

      newRequestsTitle:
        "درخواست‌های جدید",

      newRequestsCount:
        (count: string) =>
          `${count} درخواست منتظر پاسخ شما است.`,

      noNewRequestsTitle:
        "درخواست تازه‌ای ندارید",

      noNewRequestsSubtitle:
        "درخواست‌های تازهٔ مشتریان در این بخش نمایش داده می‌شوند.",

      viewAll:
        "مشاهده همه",

      freshRequest:
        "درخواست تازه",

      estimated: "تخمینی",

      quickAccess:
        "دسترسی سریع",

      quickAccessSubtitle:
        "ابزارهای اصلی مدیریت کار",

      quickRequests:
        "درخواست‌ها",

      quickRequestsSubtitle:
        "بررسی کارهای تازه",

      quickCalendar:
        "تقویم کاری",

      quickCalendarSubtitle:
        "مدیریت برنامه",

      quickMessages:
        "پیام‌ها",

      quickMessagesSubtitle:
        "گفتگو با مشتریان",

      quickProfile:
        "پروفایل حرفه‌ای",

      quickProfileSubtitle:
        "خدمات و معلومات",

      upcomingTitle:
        "برنامهٔ آینده",

      upcomingSubtitle:
        "درخواست‌ها و کارهای نزدیک",

      calendar: "تقویم",

      confirmed:
        "تأییدشده",

      pending: "در انتظار",

      customer: "مشتری",

      noUpcomingTitle:
        "برنامه‌ای ثبت نشده است",

      noUpcomingSubtitle:
        "درخواست‌های پذیرفته‌شده و آینده در این بخش نمایش داده می‌شوند.",

      performance:
        "عملکرد شما",

      performanceSubtitle:
        "خلاصهٔ فعالیت حساب حرفه‌ای",

      customerRating:
        "امتیاز مشتریان",

      averageResponse:
        "میانگین زمان پاسخ",

      responseRate:
        "نرخ پاسخ‌گویی",

      totalRevenue:
        "مجموع درآمد ثبت‌شده",

      ratingValue:
        (value: string) =>
          `${value} از ۵`,

      minutesValue:
        (value: string) =>
          `${value} دقیقه`,

      tipTitle:
        "پروفایل کامل، درخواست بیشتر",

      tipSubtitle:
        "افزودن نمونه‌کار، توضیحات دقیق و قیمت روشن می‌تواند اعتماد مشتریان را افزایش دهد.",

      improveProfile:
        "تکمیل پروفایل حرفه‌ای",
    };
  }

  if (
    language === "Pashto"
  ) {
    return {
      eyebrow:
        "د خدمت وړاندې کوونکي پینل",
      greeting: "سلام",

      heroTitle:
        "د نن ورځې کارونه مدیریت کړئ",

      heroSubtitle:
        "نوې غوښتنې، کاري مهال‌وېش او خپل مسلکي فعالیت په یوه ځای کې وګورئ.",

      notifications:
        "خبرتیاوې",

      openProfile:
        "پروفایل پرانیستل",

      currentStatus:
        "اوسنی حالت",

      availableTitle:
        "د کار ترلاسه کولو ته چمتو",

      unavailableTitle:
        "اوس مهال شتون نه لرئ",

      availableSubtitle:
        "پیرودونکي کولی شي تاسو په فعالو پایلو کې وګوري.",

      unavailableSubtitle:
        "تر بیا فعالولو پورې به نوې غوښتنې ترلاسه نه کړئ.",

      availabilityControl:
        "د چمتووالي حالت",

      todayRevenue:
        "د نن ورځې عاید",

      todayJobs:
        "د نن ورځې کارونه",

      newRequests:
        "نوې غوښتنې",

      completedJobs:
        "بشپړ شوي کارونه",

      newRequestsTitle:
        "نوې غوښتنې",

      newRequestsCount:
        (count: string) =>
          `${count} غوښتنې ستاسو ځواب ته په تمه دي.`,

      noNewRequestsTitle:
        "نوې غوښتنه نشته",

      noNewRequestsSubtitle:
        "د پیرودونکو نوې غوښتنې به دلته ښکاره شي.",

      viewAll:
        "ټول وګورئ",

      freshRequest:
        "نوې غوښتنه",

      estimated: "اټکلي",

      quickAccess:
        "چټک لاسرسی",

      quickAccessSubtitle:
        "د کار د مدیریت اصلي وسایل",

      quickRequests:
        "غوښتنې",

      quickRequestsSubtitle:
        "نوې دندې وګورئ",

      quickCalendar:
        "کاري کلیز",

      quickCalendarSubtitle:
        "مهال‌وېش مدیریت کړئ",

      quickMessages:
        "پیغامونه",

      quickMessagesSubtitle:
        "له پیرودونکو سره خبرې",

      quickProfile:
        "مسلکي پروفایل",

      quickProfileSubtitle:
        "خدمتونه او معلومات",

      upcomingTitle:
        "راتلونکی مهال‌وېش",

      upcomingSubtitle:
        "نږدې غوښتنې او کارونه",

      calendar: "کلیز",

      confirmed:
        "تایید شوی",

      pending: "په تمه",

      customer: "پیرودونکی",

      noUpcomingTitle:
        "راتلونکی کار نشته",

      noUpcomingSubtitle:
        "منل شوې او راتلونکې غوښتنې به دلته ښکاره شي.",

      performance:
        "ستاسو فعالیت",

      performanceSubtitle:
        "د مسلکي حساب لنډیز",

      customerRating:
        "د پیرودونکو امتیاز",

      averageResponse:
        "د ځواب منځنی وخت",

      responseRate:
        "د ځواب کچه",

      totalRevenue:
        "ثبت شوی ټول عاید",

      ratingValue:
        (value: string) =>
          `${value} له ۵ څخه`,

      minutesValue:
        (value: string) =>
          `${value} دقیقې`,

      tipTitle:
        "بشپړ پروفایل، ډېرې غوښتنې",

      tipSubtitle:
        "نمونې، روښانه توضیحات او څرګندې بیې د پیرودونکو باور زیاتوي.",

      improveProfile:
        "مسلکي پروفایل بشپړول",
    };
  }

  return {
    eyebrow:
      "Provider workspace",
    greeting: "Hello",

    heroTitle:
      "Manage today’s work",

    heroSubtitle:
      "Review new requests, your schedule and professional performance in one place.",

    notifications:
      "Notifications",

    openProfile:
      "Open profile",

    currentStatus:
      "Current status",

    availableTitle:
      "Available for work",

    unavailableTitle:
      "Temporarily unavailable",

    availableSubtitle:
      "Customers can find you in active provider results.",

    unavailableSubtitle:
      "You will not receive new requests until you become available again.",

    availabilityControl:
      "Availability status",

    todayRevenue:
      "Today’s revenue",

    todayJobs:
      "Today’s jobs",

    newRequests:
      "New requests",

    completedJobs:
      "Completed jobs",

    newRequestsTitle:
      "New requests",

    newRequestsCount:
      (count: string) =>
        `${count} requests are waiting for your response.`,

    noNewRequestsTitle:
      "No new requests",

    noNewRequestsSubtitle:
      "New customer requests will appear in this section.",

    viewAll: "View all",

    freshRequest:
      "New request",

    estimated: "Estimated",

    quickAccess:
      "Quick access",

    quickAccessSubtitle:
      "Your main work-management tools",

    quickRequests:
      "Requests",

    quickRequestsSubtitle:
      "Review new jobs",

    quickCalendar:
      "Work calendar",

    quickCalendarSubtitle:
      "Manage your schedule",

    quickMessages:
      "Messages",

    quickMessagesSubtitle:
      "Chat with customers",

    quickProfile:
      "Professional profile",

    quickProfileSubtitle:
      "Services and information",

    upcomingTitle:
      "Upcoming schedule",

    upcomingSubtitle:
      "Your nearest requests and jobs",

    calendar: "Calendar",

    confirmed: "Confirmed",

    pending: "Pending",

    customer: "Customer",

    noUpcomingTitle:
      "No upcoming work",

    noUpcomingSubtitle:
      "Accepted and upcoming requests will appear here.",

    performance:
      "Your performance",

    performanceSubtitle:
      "Professional-account activity summary",

    customerRating:
      "Customer rating",

    averageResponse:
      "Average response time",

    responseRate:
      "Response rate",

    totalRevenue:
      "Recorded revenue",

    ratingValue:
      (value: string) =>
        `${value} out of 5`,

    minutesValue:
      (value: string) =>
        `${value} min`,

    tipTitle:
      "Complete profiles receive more requests",

    tipSubtitle:
      "Work samples, clear descriptions and transparent pricing can improve customer trust.",

    improveProfile:
      "Improve professional profile",
  };
}

const styles =
  StyleSheet.create({
    safeArea: {
      flex: 1,

      backgroundColor:
        KhedmatPalette.blue050,
    },

    stateContainer: {
      flex: 1,

      width: "100%",

      maxWidth:
        Layout.contentMaxWidth,

      alignSelf: "center",

      justifyContent: "center",

      alignItems: "center",

      gap: Spacing.md,

      paddingHorizontal:
        Layout.screenPadding,
    },

    stateTitle: {
      ...Typography.sectionTitle,

      width: "100%",

      color:
        KhedmatPalette.textPrimary,
    },

    stateBody: {
      ...Typography.bodyStyle,

      width: "100%",

      color:
        KhedmatPalette.textSecondary,
    },

    scrollContent: {
      width: "100%",

      maxWidth:
        Layout.contentMaxWidth,

      alignSelf: "center",

      paddingHorizontal:
        Layout.screenPadding,

      paddingTop: Spacing.md,

      paddingBottom: 130,
    },

    topBar: {
      width: "100%",

      minHeight: 52,

      alignItems: "center",

      justifyContent:
        "space-between",

      gap: Spacing.md,
    },

    identity: {
      flex: 1,

      alignItems: "center",

      gap: Spacing.md,
    },

    providerAvatar: {
      width: 50,
      height: 50,

      flexShrink: 0,

      borderRadius: Radius.pill,

      alignItems: "center",

      justifyContent: "center",

      backgroundColor:
        KhedmatPalette.navy900,

      ...Shadows.small,
    },

    providerInitials: {
      fontFamily: Fonts.bold,

      color:
        KhedmatPalette.white,

      fontSize: 16,
    },

    verifiedBadge: {
      position: "absolute",

      right: -2,
      bottom: -2,

      width: 19,
      height: 19,

      borderRadius: Radius.pill,

      alignItems: "center",

      justifyContent: "center",

      backgroundColor:
        KhedmatPalette.blue500,

      borderWidth: 2,

      borderColor:
        KhedmatPalette.blue050,
    },

    identityCopy: {
      flex: 1,

      gap: 1,
    },

    eyebrow: {
      ...Typography.captionStyle,

      width: "100%",

      color:
        KhedmatPalette.blue500,

      fontFamily: Fonts.medium,
    },

    greeting: {
      ...Typography.label,

      width: "100%",

      color:
        KhedmatPalette
          .textPrimary,

      fontSize: 16,

      lineHeight: 22,
    },

    notificationButton: {
      width: 46,
      height: 46,

      flexShrink: 0,

      borderRadius: Radius.pill,

      alignItems: "center",

      justifyContent: "center",

      backgroundColor:
        KhedmatPalette.surface,

      borderWidth: 1,

      borderColor:
        KhedmatPalette.border,
    },

    notificationBadge: {
      position: "absolute",

      top: -2,
      right: -2,

      minWidth: 20,
      height: 20,

      paddingHorizontal: 5,

      borderRadius: Radius.pill,

      alignItems: "center",

      justifyContent: "center",

      backgroundColor: ERROR,

      borderWidth: 2,

      borderColor:
        KhedmatPalette.blue050,
    },

    notificationBadgeText: {
      fontFamily: Fonts.bold,

      color:
        KhedmatPalette.white,

      fontSize: 10,
    },

    hero: {
      width: "100%",

      marginTop: Spacing.xl,

      gap: Spacing.xs,
    },

    heroTitle: {
      ...Typography.screenTitle,

      width: "100%",

      maxWidth: 460,

      color:
        KhedmatPalette
          .textPrimary,

      fontSize: 27,

      lineHeight: 34,
    },

    heroSubtitle: {
      ...Typography.bodyStyle,

      width: "100%",

      maxWidth:
        Layout.readableTextMaxWidth,

      color:
        KhedmatPalette
          .textSecondary,
    },

    availabilityCard: {
      width: "100%",

      minHeight: 116,

      marginTop: Spacing.xxl,

      padding: Spacing.lg,

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

    availabilityIcon: {
      width: 50,
      height: 50,

      flexShrink: 0,

      borderRadius: Radius.lg,

      alignItems: "center",

      justifyContent: "center",
    },

    availabilityIconActive: {
      backgroundColor: SUCCESS,
    },

    availabilityIconInactive: {
      backgroundColor:
        KhedmatPalette
          .surfaceSoft,
    },

    availabilityCopy: {
      flex: 1,

      gap: 2,
    },

    availabilityLabel: {
      ...Typography.captionStyle,

      width: "100%",

      color:
        KhedmatPalette.textMuted,
    },

    availabilityTitle: {
      ...Typography.label,

      width: "100%",

      color:
        KhedmatPalette
          .textPrimary,

      fontSize: 17,

      lineHeight: 23,
    },

    availabilitySubtitle: {
      ...Typography.captionStyle,

      width: "100%",

      color:
        KhedmatPalette
          .textSecondary,

      lineHeight: 18,
    },

    switchPressable: {
      flexShrink: 0,
    },

    switchTrack: {
      width: 48,
      height: 29,

      paddingHorizontal: 3,

      justifyContent: "center",

      borderRadius: Radius.pill,

      backgroundColor:
        KhedmatPalette.border,
    },

    switchTrackActive: {
      backgroundColor:
        KhedmatPalette.blue500,
    },

    switchThumb: {
      width: 23,
      height: 23,

      borderRadius: Radius.pill,

      backgroundColor:
        KhedmatPalette.white,

      ...Shadows.small,
    },

    metricsGrid: {
      width: "100%",

      marginTop: Spacing.lg,

      flexDirection: "row",

      flexWrap: "wrap",

      justifyContent:
        "space-between",

      rowGap: Spacing.sm,
    },

    metricCard: {
      width: "48.7%",

      minHeight: 138,

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

    metricCardCompact: {
      minHeight: 130,

      paddingHorizontal:
        Spacing.sm,
    },

    metricIcon: {
      width: 42,
      height: 42,

      borderRadius: Radius.md,

      alignItems: "center",

      justifyContent: "center",
    },

    metricValue: {
      ...Typography.sectionTitle,

      width: "100%",

      color:
        KhedmatPalette
          .textPrimary,

      textAlign: "center",

      fontSize: 18,

      lineHeight: 24,
    },

    metricLabel: {
      ...Typography.captionStyle,

      width: "100%",

      color:
        KhedmatPalette.textMuted,

      textAlign: "center",

      lineHeight: 17,
    },

    section: {
      width: "100%",

      marginTop:
        Spacing.section,

      gap: Spacing.lg,
    },

    sectionHeader: {
      width: "100%",

      alignItems: "flex-start",

      justifyContent:
        "space-between",

      gap: Spacing.md,
    },

    sectionHeaderCopy: {
      flex: 1,

      gap: 2,
    },

    sectionTitle: {
      ...Typography.sectionTitle,

      width: "100%",

      color:
        KhedmatPalette
          .textPrimary,

      fontSize: 21,

      lineHeight: 28,
    },

    sectionSubtitle: {
      ...Typography.captionStyle,

      width: "100%",

      color:
        KhedmatPalette.textMuted,
    },

    sectionAction: {
      minHeight: 36,

      justifyContent: "center",
    },

    sectionActionText: {
      ...Typography.captionStyle,

      color:
        KhedmatPalette.blue500,

      fontFamily: Fonts.medium,
    },

    requestList: {
      width: "100%",

      gap: Spacing.md,
    },

    requestCard: {
      width: "100%",

      padding: Spacing.lg,

      borderWidth: 1,

      borderColor: "#E5C875",

      borderRadius: Radius.xl,

      backgroundColor:
        "#FFFDF6",

      ...Shadows.small,
    },

    requestTopRow: {
      width: "100%",

      alignItems: "flex-start",

      gap: Spacing.md,
    },

    requestIcon: {
      width: 50,
      height: 50,

      flexShrink: 0,

      borderRadius: Radius.lg,

      alignItems: "center",

      justifyContent: "center",

      backgroundColor:
        KhedmatPalette
          .surfaceSoft,
    },

    requestCopy: {
      flex: 1,

      gap: 3,
    },

    requestEyebrow: {
      ...Typography.captionStyle,

      width: "100%",

      color: WARNING,

      fontFamily: Fonts.medium,
    },

    requestTitle: {
      ...Typography.label,

      width: "100%",

      color:
        KhedmatPalette
          .textPrimary,

      fontSize: 17,

      lineHeight: 23,
    },

    requestPrice: {
      maxWidth: 105,

      flexShrink: 0,

      gap: 2,
    },

    requestPriceLabel: {
      ...Typography.captionStyle,

      color:
        KhedmatPalette.textMuted,

      fontSize: 10,
    },

    requestPriceValue: {
      ...Typography.label,

      color: SUCCESS,

      fontSize: 13,
    },

    requestMetaRow: {
      width: "100%",

      marginTop: Spacing.md,

      flexWrap: "wrap",

      gap: Spacing.md,
    },

    requestMeta: {
      alignItems: "center",

      gap: 5,
    },

    requestMetaText: {
      ...Typography.captionStyle,

      color:
        KhedmatPalette.textMuted,

      fontSize: 11,
    },

    requestAddressRow: {
      width: "100%",

      marginTop: Spacing.sm,

      alignItems: "flex-start",

      gap: 6,
    },

    requestAddress: {
      ...Typography.captionStyle,

      flex: 1,

      color:
        KhedmatPalette
          .textSecondary,

      lineHeight: 18,
    },

    emptyRequestCard: {
      width: "100%",

      minHeight: 100,

      padding: Spacing.lg,

      alignItems: "center",

      gap: Spacing.md,

      borderWidth: 1,

      borderColor:
        "#A9D9BD",

      borderRadius: Radius.xl,

      backgroundColor:
        "#F5FCF8",
    },

    emptyRequestIcon: {
      width: 48,
      height: 48,

      flexShrink: 0,

      borderRadius: Radius.lg,

      alignItems: "center",

      justifyContent: "center",

      backgroundColor:
        SUCCESS_SOFT,
    },

    emptyRequestCopy: {
      flex: 1,

      gap: 3,
    },

    emptyRequestTitle: {
      ...Typography.label,

      width: "100%",

      color:
        KhedmatPalette
          .textPrimary,
    },

    emptyRequestSubtitle: {
      ...Typography.captionStyle,

      width: "100%",

      color:
        KhedmatPalette
          .textSecondary,
    },

    quickActionsGrid: {
      width: "100%",

      flexDirection: "row",

      flexWrap: "wrap",

      justifyContent:
        "space-between",

      rowGap: Spacing.sm,
    },

    quickActionCard: {
      width: "48.7%",

      minHeight: 142,

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

    quickActionCardCompact: {
      minHeight: 136,

      paddingHorizontal:
        Spacing.sm,
    },

    quickActionIcon: {
      width: 48,
      height: 48,

      borderRadius: Radius.lg,

      alignItems: "center",

      justifyContent: "center",

      backgroundColor:
        KhedmatPalette
          .surfaceSoft,
    },

    quickActionBadge: {
      position: "absolute",

      top: -6,
      right: -6,

      minWidth: 21,
      height: 21,

      paddingHorizontal: 5,

      borderRadius: Radius.pill,

      alignItems: "center",

      justifyContent: "center",

      backgroundColor: ERROR,

      borderWidth: 2,

      borderColor:
        KhedmatPalette.surface,
    },

    quickActionBadgeText: {
      fontFamily: Fonts.bold,

      color:
        KhedmatPalette.white,

      fontSize: 9,
    },

    quickActionTitle: {
      ...Typography.label,

      width: "100%",

      color:
        KhedmatPalette
          .textPrimary,

      textAlign: "center",

      fontSize: 15,
    },

    quickActionSubtitle: {
      ...Typography.captionStyle,

      width: "100%",

      color:
        KhedmatPalette.textMuted,

      textAlign: "center",

      lineHeight: 17,
    },

    upcomingList: {
      width: "100%",

      gap: Spacing.md,
    },

    upcomingCard: {
      width: "100%",

      minHeight: 108,

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

    upcomingDate: {
      width: 54,
      height: 62,

      flexShrink: 0,

      borderRadius: Radius.lg,

      alignItems: "center",

      justifyContent: "center",

      backgroundColor:
        KhedmatPalette
          .surfaceSoft,
    },

    upcomingDay: {
      fontFamily: Fonts.bold,

      color:
        KhedmatPalette.blue500,

      fontSize: 20,

      lineHeight: 24,
    },

    upcomingMonth: {
      ...Typography.captionStyle,

      color:
        KhedmatPalette
          .textSecondary,

      fontSize: 10,
    },

    upcomingCopy: {
      flex: 1,

      gap: 3,
    },

    upcomingTitle: {
      ...Typography.label,

      width: "100%",

      color:
        KhedmatPalette
          .textPrimary,

      fontSize: 16,
    },

    upcomingCustomer: {
      ...Typography.captionStyle,

      width: "100%",

      color:
        KhedmatPalette
          .textSecondary,
    },

    upcomingMeta: {
      width: "100%",

      alignItems: "center",

      gap: 5,
    },

    upcomingMetaText: {
      ...Typography.captionStyle,

      color:
        KhedmatPalette.textMuted,
    },

    upcomingStatus: {
      flexShrink: 0,

      paddingHorizontal:
        Spacing.sm,

      paddingVertical: 6,

      borderRadius: Radius.pill,
    },

    upcomingStatusText: {
      ...Typography.captionStyle,

      fontFamily: Fonts.medium,

      fontSize: 10,
    },

    emptyUpcomingCard: {
      width: "100%",

      minHeight: 230,

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

    emptyUpcomingIcon: {
      width: 70,
      height: 70,

      borderRadius: Radius.pill,

      alignItems: "center",

      justifyContent: "center",

      backgroundColor:
        KhedmatPalette
          .surfaceSoft,
    },

    emptyUpcomingTitle: {
      ...Typography.sectionTitle,

      color:
        KhedmatPalette
          .textPrimary,

      textAlign: "center",

      fontSize: 18,
    },

    emptyUpcomingSubtitle: {
      ...Typography.bodyStyle,

      maxWidth: 340,

      color:
        KhedmatPalette
          .textSecondary,

      textAlign: "center",
    },

    performanceCard: {
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

    performanceRow: {
      width: "100%",

      alignItems: "center",

      gap: Spacing.md,
    },

    performanceIcon: {
      width: 42,
      height: 42,

      flexShrink: 0,

      borderRadius: Radius.md,

      alignItems: "center",

      justifyContent: "center",

      backgroundColor:
        KhedmatPalette
          .surfaceSoft,
    },

    performanceCopy: {
      flex: 1,

      alignItems: "center",

      justifyContent:
        "space-between",

      gap: Spacing.md,
    },

    performanceLabel: {
      ...Typography.captionStyle,

      flex: 1,

      color:
        KhedmatPalette.textMuted,
    },

    performanceValue: {
      ...Typography.label,

      maxWidth: "52%",

      color:
        KhedmatPalette
          .textPrimary,
    },

    performanceDivider: {
      width: "100%",

      height:
        StyleSheet.hairlineWidth,

      marginVertical:
        Spacing.md,

      backgroundColor:
        KhedmatPalette.border,
    },

    tipCard: {
      width: "100%",

      minHeight: 108,

      marginTop:
        Spacing.section,

      padding: Spacing.lg,

      alignItems: "center",

      gap: Spacing.md,

      borderWidth: 1,

      borderColor:
        "#E5C875",

      borderRadius: Radius.xl,

      backgroundColor:
        "#FFFDF6",
    },

    tipIcon: {
      width: 48,
      height: 48,

      flexShrink: 0,

      borderRadius: Radius.lg,

      alignItems: "center",

      justifyContent: "center",

      backgroundColor:
        WARNING_SOFT,
    },

    tipCopy: {
      flex: 1,

      gap: 3,
    },

    tipTitle: {
      ...Typography.label,

      width: "100%",

      color:
        KhedmatPalette
          .textPrimary,
    },

    tipSubtitle: {
      ...Typography.captionStyle,

      width: "100%",

      color:
        KhedmatPalette
          .textSecondary,

      lineHeight: 19,
    },

    pressed: {
      opacity: 0.78,
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