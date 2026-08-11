import { Ionicons } from "@expo/vector-icons";
import {
  useLocalSearchParams,
  useRouter,
} from "expo-router";
import {
  ComponentProps,
  useEffect,
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
import type {
  ProviderProfile,
  ProviderService,
} from "../types/provider";
import { getProviderById } from "../services/provider-repository";

type IconName =
  ComponentProps<typeof Ionicons>["name"];

type LanguageName =
  | "English"
  | "Dari"
  | "Pashto";

type BookingCreateCopy = ReturnType<
  typeof getBookingCreateCopy
>;

const SUCCESS = "#268A57";
const SUCCESS_SOFT = "#E8F6EE";
const WARNING = "#8A5A00";
const WARNING_SOFT = "#FFF4D6";
const ERROR = "#B3261E";
const INFO_SOFT = "#E5F4F8";

const CURRENT_STEP = 1;
const TOTAL_STEPS = 4;

export default function BookingCreateScreen() {
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

  const copy =
    getBookingCreateCopy(
      activeLanguage,
    );

  const providerId =
    getSingleParam(
      params.providerId,
    );

  const [
    provider,
    setProvider,
  ] = useState<ProviderProfile | null>(
    null,
  );

  const [
    providerIsLoading,
    setProviderIsLoading,
  ] = useState(true);

  const [
    providerLoadError,
    setProviderLoadError,
  ] = useState<Error | null>(
    null,
  );

  useEffect(() => {
    let isMounted = true;

    const loadProvider =
      async (): Promise<void> => {
        if (!providerId) {
          if (isMounted) {
            setProvider(null);
            setProviderLoadError(
              new Error(
                "Missing provider ID.",
              ),
            );
            setProviderIsLoading(
              false,
            );
          }

          return;
        }

        setProviderIsLoading(true);
        setProviderLoadError(null);

        try {
          const resolvedProvider =
            await getProviderById(
              providerId,
            );

          if (!isMounted) {
            return;
          }

          if (!resolvedProvider) {
            setProvider(null);
            setProviderLoadError(
              new Error(
                `Provider "${providerId}" was not found.`,
              ),
            );

            return;
          }

          setProvider(
            resolvedProvider,
          );
        } catch (error) {
          if (!isMounted) {
            return;
          }

          setProvider(null);
          setProviderLoadError(
            error instanceof Error
              ? error
              : new Error(
                  "Failed to load provider.",
                ),
          );
        } finally {
          if (isMounted) {
            setProviderIsLoading(
              false,
            );
          }
        }
      };

    void loadProvider();

    return () => {
      isMounted = false;
    };
  }, [providerId]);

  if (providerIsLoading) {
    return (
      <SafeAreaView
        style={styles.safeArea}
      >
        <View
          style={
            styles.providerState
          }
        >
          <Text
            style={[
              styles.providerStateTitle,
              directionStyle(isRtl),
            ]}
          >
            {activeLanguage === "Dari"
              ? "ارائه‌دهنده در حال بارگذاری است..."
              : activeLanguage === "Pashto"
                ? "د خدمت چمتو کوونکی بارېږي..."
                : "Loading provider..."}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!provider || providerLoadError) {
    return (
      <SafeAreaView
        style={styles.safeArea}
      >
        <View
          style={
            styles.providerState
          }
        >
          <Ionicons
            name="person-remove-outline"
            size={52}
            color={
              KhedmatPalette.textMuted
            }
          />

          <Text
            style={[
              styles.providerStateTitle,
              directionStyle(isRtl),
            ]}
          >
            {activeLanguage === "Dari"
              ? "ارائه‌دهنده پیدا نشد"
              : activeLanguage === "Pashto"
                ? "د خدمت چمتو کوونکی ونه موندل شو"
                : "Provider not found"}
          </Text>

          <Text
            style={[
              styles.providerStateBody,
              directionStyle(isRtl),
            ]}
          >
            {activeLanguage === "Dari"
              ? "به صفحه قبلی برگردید و یک ارائه‌دهنده دیگر را انتخاب کنید."
              : activeLanguage === "Pashto"
                ? "مخکنۍ پاڼې ته ستانه شئ او بل خدمت چمتو کوونکی وټاکئ."
                : "Go back and select another provider."}
          </Text>

          <Pressable
            accessibilityRole="button"
            onPress={() =>
              router.back()
            }
            style={({ pressed }) => [
              styles.providerStateButton,
              pressed &&
                styles.pressed,
            ]}
          >
            <Text
              style={
                styles.providerStateButtonText
              }
            >
              {copy.back}
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <BookingCreateContent
      provider={provider}
    />
  );
}

function BookingCreateContent({
  provider,
}: {
  provider: ProviderProfile;
}) {
  const router = useRouter();

  const {
    bookingDraft,
    updateBookingDraft,
  } = useBooking();

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
    getBookingCreateCopy(
      activeLanguage,
    );

  const initialServiceId =
    bookingDraft.providerId ===
    provider.id
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
            service.id ===
            selectedServiceId,
        ) ?? null,
      [
        provider.services,
        selectedServiceId,
      ],
    );

  const handleServiceSelect = (
    serviceId: string,
  ) => {
    setSelectedServiceId(
      serviceId,
    );
  };

  const handleContinue = () => {
    if (!selectedService) {
      return;
    }

    const providerChanged =
      Boolean(
        bookingDraft.providerId,
      ) &&
      bookingDraft.providerId !==
        provider.id;

    const serviceChanged =
      Boolean(
        bookingDraft.serviceId,
      ) &&
      bookingDraft.serviceId !==
        selectedService.id;

    updateBookingDraft({
      providerId: provider.id,
      providerName:
        provider.name,
      providerProfession:
        provider.profession,

      serviceId:
        selectedService.id,
      serviceName:
        selectedService.title,
      estimatedPrice:
        selectedService.estimatedPrice,
      currency:
        provider.currency,

      ...(providerChanged ||
      serviceChanged
        ? {
            date: "",
            time: "",
          }
        : {}),

      ...(providerChanged
        ? {
            address: null,
            notes: "",
          }
        : {}),
    });

    router.push(
      "/booking-schedule",
    );
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
              hitSlop={8}
              onPress={() =>
                router.back()
              }
              style={({ pressed }) => [
                styles.backButton,
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

            <View
              style={
                styles.stepBadge
              }
            >
              <Text
                style={[
                  styles.stepText,
                  directionStyle(
                    isRtl,
                  ),
                ]}
              >
                {copy.step(
                  formatDigits(
                    CURRENT_STEP.toString(),
                    localizedDigits,
                  ),
                  formatDigits(
                    TOTAL_STEPS.toString(),
                    localizedDigits,
                  ),
                )}
              </Text>
            </View>
          </View>

          <View
            style={styles.header}
          >
            <View
              style={
                styles.headerIcon
              }
            >
              <Ionicons
                name="construct-outline"
                size={30}
                color={
                  KhedmatPalette
                    .white
                }
              />
            </View>

            <View
              style={[
                styles.headerCopy,
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
                style={[
                  styles.title,
                  directionStyle(
                    isRtl,
                  ),
                ]}
              >
                {copy.title}
              </Text>

              <Text
                style={[
                  styles.subtitle,
                  directionStyle(
                    isRtl,
                  ),
                ]}
              >
                {copy.subtitle}
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.providerCard,
              {
                flexDirection: isRtl
                  ? "row-reverse"
                  : "row",
              },
            ]}
          >
            <View
              style={
                styles.providerAvatar
              }
            >
              <Text
                style={
                  styles.providerInitials
                }
              >
                {provider.initials}
              </Text>

              {provider.verified ? (
                <View
                  style={
                    styles.verifiedBadge
                  }
                >
                  <Ionicons
                    name="checkmark"
                    size={11}
                    color={
                      KhedmatPalette
                        .white
                    }
                  />
                </View>
              ) : null}
            </View>

            <View
              style={[
                styles.providerCopy,
                {
                  alignItems: isRtl
                    ? "flex-end"
                    : "flex-start",
                },
              ]}
            >
              <View
                style={[
                  styles.providerNameRow,
                  {
                    flexDirection: isRtl
                      ? "row-reverse"
                      : "row",
                  },
                ]}
              >
                <Text
                  numberOfLines={1}
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
                    size={17}
                    color={
                      KhedmatPalette
                        .blue500
                    }
                  />
                ) : null}
              </View>

              <Text
                numberOfLines={1}
                style={[
                  styles.providerProfession,
                  directionStyle(
                    isRtl,
                  ),
                ]}
              >
                {provider.profession}
              </Text>

              <View
                style={[
                  styles.providerMetaRow,
                  {
                    flexDirection: isRtl
                      ? "row-reverse"
                      : "row",
                  },
                ]}
              >
                <View
                  style={[
                    styles.providerMetaItem,
                    {
                      flexDirection: isRtl
                        ? "row-reverse"
                        : "row",
                    },
                  ]}
                >
                  <Ionicons
                    name="star"
                    size={14}
                    color={WARNING}
                  />

                  <Text
                    style={[
                      styles.providerMetaStrong,
                      directionStyle(
                        isRtl,
                      ),
                    ]}
                  >
                    {formatDigits(
                      provider.rating.toFixed(
                        1,
                      ),
                      localizedDigits,
                    )}
                  </Text>

                  <Text
                    style={[
                      styles.providerMetaText,
                      directionStyle(
                        isRtl,
                      ),
                    ]}
                  >
                    {copy.reviews(
                      formatDigits(
                        provider.reviewCount.toString(),
                        localizedDigits,
                      ),
                    )}
                  </Text>
                </View>

                <View
                  style={[
                    styles.providerMetaItem,
                    {
                      flexDirection: isRtl
                        ? "row-reverse"
                        : "row",
                    },
                  ]}
                >
                  <Ionicons
                    name="briefcase-outline"
                    size={14}
                    color={
                      KhedmatPalette
                        .textMuted
                    }
                  />

                  <Text
                    style={[
                      styles.providerMetaText,
                      directionStyle(
                        isRtl,
                      ),
                    ]}
                  >
                    {copy.jobs(
                      formatDigits(
                        provider.completedJobs.toString(),
                        localizedDigits,
                      ),
                    )}
                  </Text>
                </View>
              </View>

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
                  size={14}
                  color={
                    KhedmatPalette
                      .textMuted
                  }
                />

                <Text
                  numberOfLines={1}
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
                  numberOfLines={1}
                  style={[
                    styles.locationText,
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
            </View>

            <View
              style={[
                styles.availabilityBadge,
                provider.availableToday
                  ? styles.availabilityBadgeActive
                  : styles.availabilityBadgeInactive,
              ]}
            >
              <View
                style={[
                  styles.availabilityDot,
                  {
                    backgroundColor:
                      provider.availableToday
                        ? SUCCESS
                        : KhedmatPalette
                            .textMuted,
                  },
                ]}
              />

              <Text
                style={[
                  styles.availabilityText,
                  {
                    color:
                      provider.availableToday
                        ? SUCCESS
                        : KhedmatPalette
                            .textMuted,
                  },
                  directionStyle(
                    isRtl,
                  ),
                ]}
              >
                {provider.availableToday
                  ? copy.available
                  : copy.unavailable}
              </Text>
            </View>
          </View>

          <View
            style={styles.section}
          >
            <View
              style={[
                styles.sectionHeader,
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
                  directionStyle(
                    isRtl,
                  ),
                ]}
              >
                {
                  copy.servicesTitle
                }
              </Text>

              <Text
                style={[
                  styles.sectionSubtitle,
                  directionStyle(
                    isRtl,
                  ),
                ]}
              >
                {
                  copy.servicesSubtitle
                }
              </Text>
            </View>

            <View
              style={styles.services}
            >
              {provider.services.map(
                (service) => {
                  const selected =
                    selectedServiceId ===
                    service.id;

                  return (
                    <ServiceCard
                      key={service.id}
                      service={service}
                      selected={
                        selected
                      }
                      language={
                        activeLanguage
                      }
                      isRtl={isRtl}
                      copy={copy}
                      onPress={() =>
                        handleServiceSelect(
                          service.id,
                        )
                      }
                    />
                  );
                },
              )}

              {provider.services.length ===
              0 ? (
                <View
                  style={
                    styles.emptyServices
                  }
                >
                  <View
                    style={
                      styles.emptyServicesIcon
                    }
                  >
                    <Ionicons
                      name="construct-outline"
                      size={30}
                      color={
                        KhedmatPalette
                          .blue500
                      }
                    />
                  </View>

                  <Text
                    style={[
                      styles.emptyServicesTitle,
                      directionStyle(
                        isRtl,
                      ),
                    ]}
                  >
                    {
                      copy.noServicesTitle
                    }
                  </Text>

                  <Text
                    style={[
                      styles.emptyServicesText,
                      directionStyle(
                        isRtl,
                      ),
                    ]}
                  >
                    {
                      copy.noServicesText
                    }
                  </Text>
                </View>
              ) : null}
            </View>
          </View>

          <View
            style={[
              styles.priceNoticeCard,
              {
                flexDirection: isRtl
                  ? "row-reverse"
                  : "row",
              },
            ]}
          >
            <View
              style={
                styles.priceNoticeIcon
              }
            >
              <Ionicons
                name="information-circle-outline"
                size={22}
                color={
                  KhedmatPalette
                    .blue500
                }
              />
            </View>

            <View
              style={[
                styles.priceNoticeCopy,
                {
                  alignItems: isRtl
                    ? "flex-end"
                    : "flex-start",
                },
              ]}
            >
              <Text
                style={[
                  styles.priceNoticeTitle,
                  directionStyle(
                    isRtl,
                  ),
                ]}
              >
                {
                  copy.priceNoticeTitle
                }
              </Text>

              <Text
                style={[
                  styles.priceNoticeText,
                  directionStyle(
                    isRtl,
                  ),
                ]}
              >
                {
                  copy.priceNoticeText
                }
              </Text>
            </View>
          </View>

          {selectedService ? (
            <View
              style={[
                styles.selectionSummary,
                {
                  flexDirection: isRtl
                    ? "row-reverse"
                    : "row",
                },
              ]}
            >
              <View
                style={
                  styles.selectionSummaryIcon
                }
              >
                <Ionicons
                  name="checkmark"
                  size={20}
                  color={
                    KhedmatPalette
                      .white
                  }
                />
              </View>

              <View
                style={[
                  styles.selectionSummaryCopy,
                  {
                    alignItems: isRtl
                      ? "flex-end"
                      : "flex-start",
                  },
                ]}
              >
                <Text
                  style={[
                    styles.selectionSummaryLabel,
                    directionStyle(
                      isRtl,
                    ),
                  ]}
                >
                  {
                    copy.selectedService
                  }
                </Text>

                <Text
                  style={[
                    styles.selectionSummaryTitle,
                    directionStyle(
                      isRtl,
                    ),
                  ]}
                >
                  {
                    selectedService.title
                  }
                </Text>
              </View>

              <Text
                style={[
                  styles.selectionSummaryPrice,
                  directionStyle(
                    isRtl,
                  ),
                ]}
              >
                {formatPrice(
                  selectedService.estimatedPrice,
                  activeLanguage,
                  copy,
                )}
              </Text>
            </View>
          ) : null}
        </ScrollView>

        <View
          style={styles.footer}
        >
          <View
            style={
              styles.footerContent
            }
          >
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={
                copy.continue
              }
              accessibilityState={{
                disabled:
                  !selectedService,
              }}
              disabled={
                !selectedService
              }
              onPress={
                handleContinue
              }
              style={({ pressed }) => [
                styles.primaryButton,
                !selectedService &&
                  styles.primaryButtonDisabled,
                pressed &&
                  selectedService &&
                  styles.primaryButtonPressed,
              ]}
            >
              <View
                style={[
                  styles.primaryButtonContent,
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
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={
                    0.82
                  }
                  style={[
                    styles.primaryButtonText,
                    directionStyle(
                      isRtl,
                    ),
                  ]}
                >
                  {copy.continue}
                </Text>

                {selectedService ? (
                  <Ionicons
                    name={
                      isRtl
                        ? "arrow-back"
                        : "arrow-forward"
                    }
                    size={19}
                    color={
                      KhedmatPalette
                        .white
                    }
                  />
                ) : null}
              </View>
            </Pressable>

            <Text
              style={[
                styles.footerSummary,
                directionStyle(isRtl),
              ]}
            >
              {selectedService
                ? copy.footerSelected(
                    selectedService.title,
                    formatPrice(
                      selectedService.estimatedPrice,
                      activeLanguage,
                      copy,
                    ),
                  )
                : copy.footerEmpty}
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

type ServiceCardProps = {
  service: ProviderService;
  selected: boolean;
  language: LanguageName;
  isRtl: boolean;
  copy: BookingCreateCopy;
  onPress: () => void;
};

function ServiceCard({
  service,
  selected,
  language,
  isRtl,
  copy,
  onPress,
}: ServiceCardProps) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityLabel={
        service.title
      }
      accessibilityState={{
        selected,
      }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.serviceCard,
        selected &&
          styles.serviceCardSelected,
        pressed &&
          styles.serviceCardPressed,
      ]}
    >
      <View
        style={[
          styles.serviceContent,
          {
            flexDirection: isRtl
              ? "row-reverse"
              : "row",
          },
        ]}
      >
        <View
          style={[
            styles.serviceIcon,
            selected &&
              styles.serviceIconSelected,
          ]}
        >
          <Ionicons
            name={getServiceIcon(
              service.id,
            )}
            size={24}
            color={
              selected
                ? KhedmatPalette
                    .white
                : KhedmatPalette
                    .blue500
            }
          />
        </View>

        <View
          style={[
            styles.serviceCopy,
            {
              alignItems: isRtl
                ? "flex-end"
                : "flex-start",
            },
          ]}
        >
          <Text
            style={[
              styles.serviceTitle,
              selected &&
                styles.serviceTitleSelected,
              directionStyle(isRtl),
            ]}
          >
            {service.title}
          </Text>

          <Text
            numberOfLines={3}
            style={[
              styles.serviceDescription,
              directionStyle(isRtl),
            ]}
          >
            {service.description}
          </Text>

          <View
            style={[
              styles.servicePriceRow,
              {
                flexDirection: isRtl
                  ? "row-reverse"
                  : "row",
              },
            ]}
          >
            <Text
              style={[
                styles.servicePrice,
                directionStyle(isRtl),
              ]}
            >
              {formatPrice(
                service.estimatedPrice,
                language,
                copy,
              )}
            </Text>

            <Text
              style={[
                styles.estimatedLabel,
                directionStyle(isRtl),
              ]}
            >
              {copy.estimated}
            </Text>
          </View>
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
      </View>
    </Pressable>
  );
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
    normalized.includes(
      "lighting",
    )
  ) {
    return "bulb-outline";
  }

  if (
    normalized.includes(
      "generator",
    )
  ) {
    return "battery-charging-outline";
  }

  if (
    normalized.includes(
      "wiring",
    )
  ) {
    return "git-branch-outline";
  }

  if (
    normalized.includes(
      "socket",
    ) ||
    normalized.includes(
      "breaker",
    ) ||
    normalized.includes(
      "electric",
    )
  ) {
    return "flash-outline";
  }

  if (
    normalized.includes(
      "heater",
    )
  ) {
    return "flame-outline";
  }

  if (
    normalized.includes("pipe") ||
    normalized.includes(
      "water",
    ) ||
    normalized.includes(
      "drain",
    )
  ) {
    return "water-outline";
  }

  if (
    normalized.includes(
      "cabinet",
    ) ||
    normalized.includes(
      "door",
    ) ||
    normalized.includes(
      "furniture",
    ) ||
    normalized.includes(
      "carpenter",
    )
  ) {
    return "hammer-outline";
  }

  if (
    normalized.includes(
      "computer",
    ) ||
    normalized.includes(
      "hardware",
    ) ||
    normalized.includes(
      "software",
    ) ||
    normalized.includes(
      "operating-system",
    ) ||
    normalized.includes(
      "virus",
    )
  ) {
    return "laptop-outline";
  }

  if (
    normalized.includes(
      "clean",
    )
  ) {
    return "sparkles-outline";
  }

  if (
    normalized.includes("wall") ||
    normalized.includes(
      "plaster",
    ) ||
    normalized.includes(
      "renovation",
    ) ||
    normalized.includes(
      "construction",
    )
  ) {
    return "construct-outline";
  }

  return "briefcase-outline";
}

function formatPrice(
  value: number,
  language: LanguageName,
  copy: BookingCreateCopy,
): string {
  const formatted =
    new Intl.NumberFormat(
      "en-US",
    ).format(value);

  const localized =
    language === "English"
      ? formatted
      : formatDigits(
          formatted,
          true,
        );

  return copy.price(localized);
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

function getBookingCreateCopy(
  language: LanguageName,
) {
  if (language === "Dari") {
    return {
      back: "بازگشت",
      step:
        (
          current: string,
          total: string,
        ) =>
          `مرحله ${current} از ${total}`,
      eyebrow:
        "ایجاد رزرو",
      title:
        "کدام خدمت را نیاز دارید؟",
      subtitle:
        "یکی از خدمات ارائه‌شده توسط این متخصص را انتخاب کنید.",
      reviews:
        (value: string) =>
          `(${value} نظر)`,
      jobs:
        (value: string) =>
          `${value} کار`,
      distance:
        (value: string) =>
          `${value} کیلومتر`,
      available: "آماده",
      unavailable: "مصروف",
      servicesTitle:
        "خدمات ارائه‌شده",
      servicesSubtitle:
        "یک خدمت را انتخاب کنید. قیمت‌ها تخمینی‌اند و مبلغ نهایی پس از بررسی کار مشخص می‌شود.",
      price:
        (value: string) =>
          `از ${value} افغانی`,
      estimated: "تخمینی",
      priceNoticeTitle:
        "دربارهٔ قیمت",
      priceNoticeText:
        "قیمت نمایش‌داده‌شده هزینهٔ ابتدایی خدمت است. هزینهٔ قطعات، مواد، رفت‌وآمد یا کار اضافی پس از بررسی ارائه‌دهنده مشخص می‌شود.",
      selectedService:
        "خدمت انتخاب‌شده",
      continue:
        "انتخاب تاریخ و زمان",
      footerSelected:
        (
          service: string,
          price: string,
        ) =>
          `${service} — ${price}`,
      footerEmpty:
        "برای ادامه یک خدمت را انتخاب کنید.",
      noServicesTitle:
        "خدمتی برای رزرو موجود نیست",
      noServicesText:
        "این ارائه‌دهنده هنوز خدمات قابل رزرو ثبت نکرده است.",
    };
  }

  if (language === "Pashto") {
    return {
      back: "بېرته",
      step:
        (
          current: string,
          total: string,
        ) =>
          `مرحله ${current} له ${total}`,
      eyebrow:
        "رزرف جوړول",
      title:
        "کوم خدمت ته اړتیا لرئ؟",
      subtitle:
        "د دې خدمت وړاندې کوونکي له خدمتونو څخه یو خدمت وټاکئ.",
      reviews:
        (value: string) =>
          `(${value} نظرونه)`,
      jobs:
        (value: string) =>
          `${value} کارونه`,
      distance:
        (value: string) =>
          `${value} کیلومتره`,
      available: "چمتو",
      unavailable: "بوخت",
      servicesTitle:
        "وړاندې کېدونکي خدمتونه",
      servicesSubtitle:
        "یو خدمت وټاکئ. بیې اټکلي دي او وروستۍ بیه به د کار له ارزونې وروسته وټاکل شي.",
      price:
        (value: string) =>
          `له ${value} افغانیو`,
      estimated: "اټکلي",
      priceNoticeTitle:
        "د بیې په اړه",
      priceNoticeText:
        "ښودل شوې بیه د خدمت لومړنی لګښت دی. د پرزو، موادو، سفر یا اضافي کار لګښت به د خدمت وړاندې کوونکي له ارزونې وروسته وټاکل شي.",
      selectedService:
        "ټاکل شوی خدمت",
      continue:
        "نېټه او وخت وټاکئ",
      footerSelected:
        (
          service: string,
          price: string,
        ) =>
          `${service} — ${price}`,
      footerEmpty:
        "د دوام لپاره یو خدمت وټاکئ.",
      noServicesTitle:
        "د رزرف لپاره خدمت نشته",
      noServicesText:
        "دې خدمت وړاندې کوونکي لا د رزرف وړ خدمتونه نه دي ثبت کړي.",
    };
  }

  return {
    back: "Back",
    step:
      (
        current: string,
        total: string,
      ) =>
        `Step ${current} of ${total}`,
    eyebrow:
      "Create booking",
    title:
      "Which service do you need?",
    subtitle:
      "Choose one of the services offered by this provider.",
    reviews:
      (value: string) =>
        `(${value} reviews)`,
    jobs:
      (value: string) =>
        `${value} jobs`,
    distance:
      (value: string) =>
        `${value} km`,
    available: "Available",
    unavailable: "Busy",
    servicesTitle:
      "Services offered",
    servicesSubtitle:
      "Choose one service. Prices are estimates and the final amount is confirmed after the provider assesses the work.",
    price:
      (value: string) =>
        `From ${value} AFN`,
    estimated: "Estimated",
    priceNoticeTitle:
      "About the price",
    priceNoticeText:
      "The displayed amount is the starting service price. Parts, materials, travel or additional work may be added after the provider assesses the job.",
    selectedService:
      "Selected service",
    continue:
      "Choose date and time",
    footerSelected:
      (
        service: string,
        price: string,
      ) =>
        `${service} — ${price}`,
    footerEmpty:
      "Select a service to continue.",
    noServicesTitle:
      "No bookable services",
    noServicesText:
      "This provider has not added any services that can be booked yet.",
  };
}

const styles = StyleSheet.create({
  providerState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.md,
    paddingHorizontal:
      Layout.screenPadding,
  },

  providerStateTitle: {
    ...Typography.sectionTitle,
    width: "100%",
    maxWidth:
      Layout.readableTextMaxWidth,
    color:
      KhedmatPalette.textPrimary,
    textAlign: "center",
  },

  providerStateBody: {
    ...Typography.bodyStyle,
    width: "100%",
    maxWidth:
      Layout.readableTextMaxWidth,
    color:
      KhedmatPalette.textMuted,
    textAlign: "center",
  },

  providerStateButton: {
    minHeight:
      Layout.minimumTouchTarget,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal:
      Spacing.lg,
    borderRadius: Radius.md,
    backgroundColor:
      KhedmatPalette.navy900,
  },

  providerStateButtonText: {
    ...Typography.buttonLabel,
    color:
      KhedmatPalette.white,
  },

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
    paddingBottom: 164,
  },

  topBar: {
    width: "100%",
    minHeight:
      Layout.minimumTouchTarget,
    alignItems: "center",
    justifyContent:
      "space-between",
  },

  backButton: {
    width: 44,
    height: 44,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor:
      KhedmatPalette.border,
    backgroundColor:
      KhedmatPalette.surface,
  },

  stepBadge: {
    minHeight: 34,
    paddingHorizontal:
      Spacing.md,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: Radius.pill,
    backgroundColor:
      KhedmatPalette.surfaceSoft,
  },

  stepText: {
    ...Typography.captionStyle,
    color:
      KhedmatPalette.blue500,
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
    backgroundColor:
      KhedmatPalette.navy900,
    ...Shadows.small,
  },

  headerCopy: {
    width: "100%",
    gap: Spacing.sm,
  },

  eyebrow: {
    ...Typography.captionStyle,
    width: "100%",
    color:
      KhedmatPalette.blue500,
    fontFamily: Fonts.medium,
  },

  title: {
    ...Typography.screenTitle,
    width: "100%",
    maxWidth: 470,
    color:
      KhedmatPalette.textPrimary,
    fontSize: 27,
    lineHeight: 35,
  },

  subtitle: {
    ...Typography.bodyLarge,
    width: "100%",
    maxWidth: 470,
    color:
      KhedmatPalette.textSecondary,
    lineHeight: 25,
  },

  providerCard: {
    width: "100%",
    minHeight: 142,
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

  providerAvatar: {
    width: 64,
    height: 64,
    flexShrink: 0,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      KhedmatPalette.navy900,
  },

  providerInitials: {
    color:
      KhedmatPalette.white,
    fontFamily: Fonts.bold,
    fontSize: 19,
  },

  verifiedBadge: {
    position: "absolute",
    right: -2,
    bottom: -2,
    width: 22,
    height: 22,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor:
      KhedmatPalette.surface,
    backgroundColor:
      KhedmatPalette.blue500,
  },

  providerCopy: {
    flex: 1,
    gap: 4,
  },

  providerNameRow: {
    width: "100%",
    alignItems: "center",
    gap: 5,
  },

  providerName: {
    ...Typography.sectionTitle,
    flexShrink: 1,
    color:
      KhedmatPalette.textPrimary,
    fontSize: 19,
    lineHeight: 25,
  },

  providerProfession: {
    ...Typography.bodyStyle,
    width: "100%",
    color:
      KhedmatPalette.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },

  providerMetaRow: {
    width: "100%",
    marginTop: 2,
    alignItems: "center",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },

  providerMetaItem: {
    alignItems: "center",
    gap: 4,
  },

  providerMetaStrong: {
    ...Typography.captionStyle,
    color:
      KhedmatPalette.textPrimary,
    fontFamily: Fonts.medium,
  },

  providerMetaText: {
    ...Typography.captionStyle,
    color:
      KhedmatPalette.textMuted,
    fontSize: 10,
  },

  locationRow: {
    width: "100%",
    marginTop: 2,
    alignItems: "center",
    flexWrap: "wrap",
    gap: 4,
  },

  locationText: {
    ...Typography.captionStyle,
    flexShrink: 1,
    color:
      KhedmatPalette.textMuted,
    fontSize: 10,
  },

  locationDivider: {
    color:
      KhedmatPalette.textMuted,
    fontSize: 10,
  },

  availabilityBadge: {
    maxWidth: 94,
    flexShrink: 0,
    minHeight: 32,
    paddingHorizontal:
      Spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    borderRadius: Radius.pill,
  },

  availabilityBadgeActive: {
    backgroundColor:
      SUCCESS_SOFT,
  },

  availabilityBadgeInactive: {
    backgroundColor:
      KhedmatPalette.surfaceSoft,
  },

  availabilityDot: {
    width: 7,
    height: 7,
    borderRadius: Radius.pill,
  },

  availabilityText: {
    ...Typography.captionStyle,
    fontFamily: Fonts.medium,
    fontSize: 10,
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

  sectionTitle: {
    ...Typography.sectionTitle,
    width: "100%",
    color:
      KhedmatPalette.textPrimary,
    fontSize: 21,
    lineHeight: 28,
  },

  sectionSubtitle: {
    ...Typography.captionStyle,
    width: "100%",
    maxWidth: 470,
    color:
      KhedmatPalette.textMuted,
    lineHeight: 19,
  },

  services: {
    width: "100%",
    gap: Spacing.md,
  },

  serviceCard: {
    width: "100%",
    minHeight: 126,
    borderWidth: 1,
    borderColor:
      KhedmatPalette.border,
    borderRadius: Radius.xl,
    backgroundColor:
      KhedmatPalette.surface,
    ...Shadows.small,
  },

  serviceCardSelected: {
    borderColor:
      KhedmatPalette.blue500,
    backgroundColor:
      "#F4FBFC",
  },

  serviceCardPressed: {
    opacity: 0.88,
    transform: [
      {
        scale: 0.993,
      },
    ],
  },

  serviceContent: {
    width: "100%",
    minHeight: 126,
    padding: Spacing.lg,
    alignItems: "center",
    gap: Spacing.md,
  },

  serviceIcon: {
    width: 52,
    height: 52,
    flexShrink: 0,
    borderRadius: Radius.lg,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      KhedmatPalette.surfaceSoft,
  },

  serviceIconSelected: {
    backgroundColor:
      KhedmatPalette.blue500,
  },

  serviceCopy: {
    flex: 1,
    gap: 3,
  },

  serviceTitle: {
    ...Typography.label,
    width: "100%",
    color:
      KhedmatPalette.textPrimary,
    fontSize: 17,
    lineHeight: 23,
  },

  serviceTitleSelected: {
    color:
      KhedmatPalette.navy900,
    fontFamily: Fonts.bold,
  },

  serviceDescription: {
    ...Typography.bodyStyle,
    width: "100%",
    color:
      KhedmatPalette.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },

  servicePriceRow: {
    width: "100%",
    marginTop: 3,
    alignItems: "center",
    gap: Spacing.sm,
  },

  servicePrice: {
    ...Typography.label,
    color:
      KhedmatPalette.blue500,
    fontSize: 14,
  },

  estimatedLabel: {
    ...Typography.captionStyle,
    color:
      KhedmatPalette.textMuted,
    fontSize: 9,
    paddingHorizontal:
      Spacing.sm,
    paddingVertical: 3,
    borderRadius: Radius.pill,
    backgroundColor:
      KhedmatPalette.surfaceSoft,
  },

  radioOuter: {
    width: 25,
    height: 25,
    flexShrink: 0,
    borderRadius: Radius.pill,
    borderWidth: 1.5,
    borderColor:
      KhedmatPalette.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      KhedmatPalette.surface,
  },

  radioOuterSelected: {
    borderColor:
      KhedmatPalette.blue500,
  },

  radioInner: {
    width: 13,
    height: 13,
    borderRadius: Radius.pill,
    backgroundColor:
      KhedmatPalette.blue500,
  },

  priceNoticeCard: {
    width: "100%",
    minHeight: 112,
    marginTop: Spacing.xl,
    padding: Spacing.lg,
    alignItems: "flex-start",
    gap: Spacing.md,
    borderWidth: 1,
    borderColor:
      KhedmatPalette.blue200,
    borderRadius: Radius.xl,
    backgroundColor:
      "#F4FBFC",
  },

  priceNoticeIcon: {
    width: 44,
    height: 44,
    flexShrink: 0,
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      KhedmatPalette.surface,
  },

  priceNoticeCopy: {
    flex: 1,
    gap: 3,
  },

  priceNoticeTitle: {
    ...Typography.label,
    width: "100%",
    color:
      KhedmatPalette.textPrimary,
    fontSize: 15,
  },

  priceNoticeText: {
    ...Typography.captionStyle,
    width: "100%",
    color:
      KhedmatPalette.textSecondary,
    lineHeight: 19,
  },

  selectionSummary: {
    width: "100%",
    minHeight: 94,
    marginTop: Spacing.md,
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

  selectionSummaryIcon: {
    width: 42,
    height: 42,
    flexShrink: 0,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: SUCCESS,
  },

  selectionSummaryCopy: {
    flex: 1,
    gap: 2,
  },

  selectionSummaryLabel: {
    ...Typography.captionStyle,
    width: "100%",
    color: SUCCESS,
    fontFamily: Fonts.medium,
  },

  selectionSummaryTitle: {
    ...Typography.label,
    width: "100%",
    color:
      KhedmatPalette.textPrimary,
    fontSize: 15,
  },

  selectionSummaryPrice: {
    ...Typography.label,
    maxWidth: 120,
    flexShrink: 0,
    color:
      KhedmatPalette.navy900,
    fontSize: 13,
  },

  emptyServices: {
    width: "100%",
    minHeight: 240,
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

  emptyServicesIcon: {
    width: 68,
    height: 68,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      KhedmatPalette.surfaceSoft,
  },

  emptyServicesTitle: {
    ...Typography.sectionTitle,
    color:
      KhedmatPalette.textPrimary,
    textAlign: "center",
    fontSize: 18,
  },

  emptyServicesText: {
    ...Typography.bodyStyle,
    maxWidth: 340,
    color:
      KhedmatPalette.textSecondary,
    textAlign: "center",
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
    gap: Spacing.sm,
  },

  primaryButton: {
    width: "100%",
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

  primaryButtonDisabled: {
    backgroundColor:
      KhedmatPalette.disabled,
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
    flexShrink: 1,
    color:
      KhedmatPalette.white,
    fontFamily: Fonts.medium,
    fontSize: 16,
    textAlign: "center",
  },

  footerSummary: {
    ...Typography.captionStyle,
    width: "100%",
    color:
      KhedmatPalette.textMuted,
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
});
