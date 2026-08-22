import { Ionicons } from "@expo/vector-icons";
import {
  useFocusEffect,
  useLocalSearchParams,
  useRouter,
} from "expo-router";
import {
  ComponentProps,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Pressable,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
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
} from "../../constants/theme";
import { useLanguage } from "../../context/languagecontext";
import { useProviders } from "../../hooks/use-providers";
import type {
  ProviderCategoryId,
  ProviderProfile,
} from "../../types/provider";

type IconName =
  ComponentProps<typeof Ionicons>["name"];

type LanguageName =
  | "English"
  | "Dari"
  | "Pashto";

type CategoryFilterId =
  | "all"
  | ProviderCategoryId;

type SortOption =
  | "recommended"
  | "distance"
  | "rating"
  | "price";

type FilterState = {
  availableToday: boolean;
  verifiedOnly: boolean;
  urgentOnly: boolean;
  instantBookingOnly: boolean;
};

type LocalizedText = {
  English: string;
  Dari: string;
  Pashto: string;
};

type SearchCategory = {
  id: CategoryFilterId;
  title: LocalizedText;
  icon: IconName;
};

type SortDefinition = {
  id: SortOption;
  label: LocalizedText;
};

const CATEGORIES: SearchCategory[] = [
  {
    id: "all",
    title: {
      English: "All",
      Dari: "همه",
      Pashto: "ټول",
    },
    icon: "apps-outline",
  },
  {
    id: "electrician",
    title: {
      English: "Electrician",
      Dari: "برق‌کاری",
      Pashto: "برېښناکار",
    },
    icon: "flash-outline",
  },
  {
    id: "plumber",
    title: {
      English: "Plumber",
      Dari: "لوله‌کشی",
      Pashto: "نلدوان",
    },
    icon: "water-outline",
  },
  {
    id: "cleaner",
    title: {
      English: "Cleaning",
      Dari: "نظافت",
      Pashto: "پاک‌کاري",
    },
    icon: "sparkles-outline",
  },
  {
    id: "construction",
    title: {
      English: "Construction",
      Dari: "ساختمان",
      Pashto: "ساختماني کار",
    },
    icon: "construct-outline",
  },
  {
    id: "carpenter",
    title: {
      English: "Carpenter",
      Dari: "نجاری",
      Pashto: "ترکاڼ",
    },
    icon: "hammer-outline",
  },
  {
    id: "computer-repair",
    title: {
      English: "Tech repair",
      Dari: "تخنیک",
      Pashto: "تخنیکي ترمیم",
    },
    icon: "laptop-outline",
  },
];

const SORT_OPTIONS: SortDefinition[] = [
  {
    id: "recommended",
    label: {
      English: "Recommended",
      Dari: "پیشنهادی",
      Pashto: "سپارښتل شوي",
    },
  },
  {
    id: "distance",
    label: {
      English: "Nearest",
      Dari: "نزدیک‌ترین",
      Pashto: "تر ټولو نږدې",
    },
  },
  {
    id: "rating",
    label: {
      English: "Top rated",
      Dari: "بالاترین امتیاز",
      Pashto: "لوړ امتیاز",
    },
  },
  {
    id: "price",
    label: {
      English: "Lowest price",
      Dari: "کمترین قیمت",
      Pashto: "ټیټه بیه",
    },
  },
];

const INITIAL_FILTERS: FilterState = {
  availableToday: false,
  verifiedOnly: false,
  urgentOnly: false,
  instantBookingOnly: false,
};

export default function SearchScreen() {
  const router = useRouter();
  const { language } = useLanguage();

  const {
    providers,
    isLoading: providersAreLoading,
    error: providersError,
    refreshProviders,
  } = useProviders();

  const activeLanguage =
    normalizeLanguage(language);

  const isRtl =
    activeLanguage === "Dari" ||
    activeLanguage === "Pashto";

  const copy =
    getSearchCopy(activeLanguage);

  const params =
    useLocalSearchParams<{
      category?:
        | string
        | string[];
    }>();

  const incomingCategory =
    getSingleParam(params.category);

  const [query, setQuery] =
    useState("");

  const [
    selectedCategoryId,
    setSelectedCategoryId,
  ] =
    useState<CategoryFilterId>(
      "all",
    );

  const [
    selectedSort,
    setSelectedSort,
  ] =
    useState<SortOption>(
      "recommended",
    );

  const [
    filtersVisible,
    setFiltersVisible,
  ] = useState(false);

  const [filters, setFilters] =
    useState<FilterState>(
      INITIAL_FILTERS,
    );

  useEffect(() => {
    if (
      incomingCategory &&
      CATEGORIES.some(
        (category) =>
          category.id ===
          incomingCategory,
      )
    ) {
      setSelectedCategoryId(
        incomingCategory as CategoryFilterId,
      );
    }
  }, [incomingCategory]);

  useFocusEffect(
    useCallback(() => {
      void refreshProviders().catch(
        (error) => {
          console.warn(
            "Could not refresh customer marketplace providers:",
            error,
          );
        },
      );
    }, [refreshProviders]),
  );

  const localizedCategories =
    useMemo(
      () =>
        CATEGORIES.map(
          (category) => ({
            ...category,
            localizedTitle:
              category.title[
                activeLanguage
              ],
          }),
        ),
      [activeLanguage],
    );

  const localizedSortOptions =
    useMemo(
      () =>
        SORT_OPTIONS.map(
          (option) => ({
            ...option,
            localizedLabel:
              option.label[
                activeLanguage
              ],
          }),
        ),
      [activeLanguage],
    );

  const filteredProviders =
    useMemo(() => {
      const normalizedQuery =
        query
          .trim()
          .toLocaleLowerCase();

      const results =
        providers.filter(
          (provider) => {
            if (
              selectedCategoryId !==
                "all" &&
              provider.categoryId !==
                selectedCategoryId
            ) {
              return false;
            }

            if (
              filters.availableToday &&
              !provider.availableToday
            ) {
              return false;
            }

            if (
              filters.verifiedOnly &&
              !provider.verified
            ) {
              return false;
            }

            if (
              filters.urgentOnly &&
              !provider
                .acceptsUrgentRequests
            ) {
              return false;
            }

            if (
              filters.instantBookingOnly &&
              !provider.instantBooking
            ) {
              return false;
            }

            if (!normalizedQuery) {
              return true;
            }

            const categoryTitle =
              getLocalizedCategoryTitle(
                provider.categoryId,
                activeLanguage,
              );

            const searchableText = [
              provider.name,
              categoryTitle,
              provider.provinceName,
              provider.districtName,
              provider.locationLabel,
              ...provider.services.map(
                (service) =>
                  service.title,
              ),
              ...provider.services.map(
                (service) =>
                  service.description,
              ),
            ]
              .join(" ")
              .toLocaleLowerCase();

            return searchableText.includes(
              normalizedQuery,
            );
          },
        );

      return [...results].sort(
        (first, second) => {
          if (
            selectedSort ===
            "distance"
          ) {
            return (
              first.distanceKm -
              second.distanceKm
            );
          }

          if (
            selectedSort ===
            "rating"
          ) {
            if (
              first.rating !==
              second.rating
            ) {
              return (
                second.rating -
                first.rating
              );
            }

            return (
              second.reviewCount -
              first.reviewCount
            );
          }

          if (
            selectedSort ===
            "price"
          ) {
            return (
              first.minimumPrice -
              second.minimumPrice
            );
          }

          return (
            getRecommendationScore(
              second,
            ) -
            getRecommendationScore(
              first,
            )
          );
        },
      );
    }, [
      activeLanguage,
      filters,
      providers,
      query,
      selectedCategoryId,
      selectedSort,
    ]);

  const activeFilterCount =
    Number(
      filters.availableToday,
    ) +
    Number(filters.verifiedOnly) +
    Number(filters.urgentOnly) +
    Number(
      filters.instantBookingOnly,
    );

  const toggleFilter = (
    key: keyof FilterState,
  ) => {
    setFilters((current) => ({
      ...current,
      [key]: !current[key],
    }));
  };

  const clearFilters = () => {
    setQuery("");
    setSelectedCategoryId("all");
    setSelectedSort(
      "recommended",
    );
    setFilters(INITIAL_FILTERS);
  };

  const openProvider = (
    providerId: string,
  ) => {
    router.push({
      pathname:
        "/provider-profile",
      params: {
        providerId,
      },
    });
  };

  return (
    <SafeAreaView
      style={styles.safeArea}
    >
      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={
          styles.scrollContent
        }
        refreshControl={
          <RefreshControl
            refreshing={
              providersAreLoading
            }
            onRefresh={() => {
              void refreshProviders().catch(
                (error) => {
                  console.warn(
                    "Could not refresh customer marketplace providers:",
                    error,
                  );
                },
              );
            }}
            tintColor={
              KhedmatPalette.blue500
            }
          />
        }
      >
        <Text
          style={[
            styles.title,
            directionStyle(isRtl),
          ]}
        >
          {copy.title}
        </Text>

        <View
          style={[
            styles.searchRow,
            {
              flexDirection: isRtl
                ? "row-reverse"
                : "row",
            },
          ]}
        >
          <View
            style={[
              styles.searchBox,
              {
                flexDirection: isRtl
                  ? "row-reverse"
                  : "row",
              },
            ]}
          >
            <Ionicons
              name="search-outline"
              size={21}
              color={
                KhedmatPalette.blue500
              }
            />

            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder={
                copy.searchPlaceholder
              }
              placeholderTextColor={
                KhedmatPalette.textMuted
              }
              selectionColor={
                KhedmatPalette.blue500
              }
              returnKeyType="search"
              style={[
                styles.searchInput,
                directionStyle(isRtl),
              ]}
            />

            {query.length > 0 ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={
                  copy.clearSearch
                }
                hitSlop={8}
                onPress={() =>
                  setQuery("")
                }
              >
                <Ionicons
                  name="close-circle"
                  size={20}
                  color={
                    KhedmatPalette.textMuted
                  }
                />
              </Pressable>
            ) : null}
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              copy.filters
            }
            onPress={() =>
              setFiltersVisible(
                (current) =>
                  !current,
              )
            }
            style={({ pressed }) => [
              styles.filterButton,
              (filtersVisible ||
                activeFilterCount >
                  0) &&
                styles.filterButtonActive,
              pressed &&
                styles.pressed,
            ]}
          >
            <Ionicons
              name="options-outline"
              size={21}
              color={
                filtersVisible ||
                activeFilterCount > 0
                  ? KhedmatPalette.white
                  : KhedmatPalette.navy700
              }
            />

            {activeFilterCount >
            0 ? (
              <View
                style={
                  styles.filterCount
                }
              >
                <Text
                  style={
                    styles.filterCountText
                  }
                >
                  {formatDigits(
                    activeFilterCount.toString(),
                    activeLanguage !==
                      "English",
                  )}
                </Text>
              </View>
            ) : null}
          </Pressable>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={
            false
          }
          contentContainerStyle={
            styles.categoryRow
          }
          style={{
            direction: isRtl
              ? "rtl"
              : "ltr",
          }}
        >
          {localizedCategories.map(
            (category) => {
              const selected =
                category.id ===
                selectedCategoryId;

              return (
                <Pressable
                  key={category.id}
                  accessibilityRole="button"
                  accessibilityState={{
                    selected,
                  }}
                  onPress={() =>
                    setSelectedCategoryId(
                      category.id,
                    )
                  }
                  style={({
                    pressed,
                  }) => [
                    styles.categoryChip,
                    selected &&
                      styles.categoryChipSelected,
                    pressed &&
                      styles.pressed,
                  ]}
                >
                  <Ionicons
                    name={
                      category.icon
                    }
                    size={16}
                    color={
                      selected
                        ? KhedmatPalette.white
                        : KhedmatPalette.navy700
                    }
                  />

                  <Text
                    style={[
                      styles.categoryText,
                      selected &&
                        styles.categoryTextSelected,
                      directionStyle(
                        isRtl,
                      ),
                    ]}
                  >
                    {
                      category.localizedTitle
                    }
                  </Text>
                </Pressable>
              );
            },
          )}
        </ScrollView>

        {filtersVisible ? (
          <View
            style={
              styles.filtersPanel
            }
          >
            <View
              style={[
                styles.filtersHeader,
                {
                  flexDirection:
                    isRtl
                      ? "row-reverse"
                      : "row",
                },
              ]}
            >
              <Text
                style={[
                  styles.filtersTitle,
                  directionStyle(
                    isRtl,
                  ),
                ]}
              >
                {copy.filters}
              </Text>

              <Pressable
                accessibilityRole="button"
                onPress={
                  clearFilters
                }
                style={({
                  pressed,
                }) => [
                  styles.clearButton,
                  pressed &&
                    styles.pressed,
                ]}
              >
                <Text
                  style={[
                    styles.clearButtonText,
                    directionStyle(
                      isRtl,
                    ),
                  ]}
                >
                  {copy.clearAll}
                </Text>
              </Pressable>
            </View>

            <View
              style={
                styles.filterOptions
              }
            >
              <FilterToggle
                icon="flash-outline"
                title={
                  copy.availableToday
                }
                selected={
                  filters.availableToday
                }
                isRtl={isRtl}
                onPress={() =>
                  toggleFilter(
                    "availableToday",
                  )
                }
              />

              <FilterToggle
                icon="shield-checkmark-outline"
                title={
                  copy.verified
                }
                selected={
                  filters.verifiedOnly
                }
                isRtl={isRtl}
                onPress={() =>
                  toggleFilter(
                    "verifiedOnly",
                  )
                }
              />

              <FilterToggle
                icon="alert-circle-outline"
                title={
                  copy.urgent
                }
                selected={
                  filters.urgentOnly
                }
                isRtl={isRtl}
                onPress={() =>
                  toggleFilter(
                    "urgentOnly",
                  )
                }
              />

              <FilterToggle
                icon="calendar-outline"
                title={
                  copy.instantBooking
                }
                selected={
                  filters
                    .instantBookingOnly
                }
                isRtl={isRtl}
                onPress={() =>
                  toggleFilter(
                    "instantBookingOnly",
                  )
                }
              />
            </View>
          </View>
        ) : null}

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={
            false
          }
          contentContainerStyle={
            styles.sortRow
          }
          style={{
            direction: isRtl
              ? "rtl"
              : "ltr",
          }}
        >
          {localizedSortOptions.map(
            (option) => {
              const selected =
                selectedSort ===
                option.id;

              return (
                <Pressable
                  key={option.id}
                  accessibilityRole="button"
                  accessibilityState={{
                    selected,
                  }}
                  onPress={() =>
                    setSelectedSort(
                      option.id,
                    )
                  }
                  style={({
                    pressed,
                  }) => [
                    styles.sortOption,
                    selected &&
                      styles.sortOptionSelected,
                    pressed &&
                      styles.pressed,
                  ]}
                >
                  <Text
                    style={[
                      styles.sortOptionText,
                      selected &&
                        styles.sortOptionTextSelected,
                      directionStyle(
                        isRtl,
                      ),
                    ]}
                  >
                    {
                      option.localizedLabel
                    }
                  </Text>
                </Pressable>
              );
            },
          )}
        </ScrollView>

        <View
          style={[
            styles.resultsHeader,
            {
              flexDirection: isRtl
                ? "row-reverse"
                : "row",
            },
          ]}
        >
          <Text
            style={[
              styles.resultsTitle,
              directionStyle(isRtl),
            ]}
          >
            {getResultsLabel(
              filteredProviders.length,
              activeLanguage,
            )}
          </Text>
        </View>

        <View
          style={styles.results}
        >
          {providersAreLoading ? (
            <ProviderState
              icon="people-outline"
              title={
                copy.loadingProviders
              }
              isRtl={isRtl}
            />
          ) : providersError ? (
            <View
              style={
                styles.providerState
              }
            >
              <Ionicons
                name="cloud-offline-outline"
                size={40}
                color={
                  KhedmatPalette.textMuted
                }
              />

              <Text
                style={[
                  styles.providerStateTitle,
                  directionStyle(
                    isRtl,
                  ),
                ]}
              >
                {
                  copy.loadFailed
                }
              </Text>

              <Pressable
                accessibilityRole="button"
                onPress={() => {
                  void refreshProviders();
                }}
                style={({
                  pressed,
                }) => [
                  styles.retryButton,
                  pressed &&
                    styles.pressed,
                ]}
              >
                <Text
                  style={
                    styles.retryButtonText
                  }
                >
                  {copy.tryAgain}
                </Text>
              </Pressable>
            </View>
          ) : (
            <>
              {filteredProviders.map(
                (provider) => (
                  <ProviderResultCard
                    key={
                      provider.id
                    }
                    provider={
                      provider
                    }
                    language={
                      activeLanguage
                    }
                    isRtl={isRtl}
                    copy={copy}
                    onPress={() =>
                      openProvider(
                        provider.id,
                      )
                    }
                  />
                ),
              )}

              {filteredProviders.length ===
              0 ? (
                <EmptyResults
                  copy={copy}
                  isRtl={isRtl}
                  onClear={
                    clearFilters
                  }
                />
              ) : null}
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

type FilterToggleProps = {
  icon: IconName;
  title: string;
  selected: boolean;
  isRtl: boolean;
  onPress: () => void;
};

function FilterToggle({
  icon,
  title,
  selected,
  isRtl,
  onPress,
}: FilterToggleProps) {
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityLabel={
        title
      }
      accessibilityState={{
        checked: selected,
      }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.filterToggle,
        selected &&
          styles.filterToggleSelected,
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
        style={[
          styles.filterToggleIcon,
          selected &&
            styles.filterToggleIconSelected,
        ]}
      >
        <Ionicons
          name={icon}
          size={18}
          color={
            selected
              ? KhedmatPalette.white
              : KhedmatPalette.navy700
          }
        />
      </View>

      <Text
        style={[
          styles.filterToggleTitle,
          directionStyle(isRtl),
        ]}
      >
        {title}
      </Text>

      <View
        style={[
          styles.switchTrack,
          selected &&
            styles.switchTrackSelected,
        ]}
      >
        <View
          style={[
            styles.switchThumb,
            selected &&
              styles.switchThumbSelected,
            selected && {
              alignSelf: isRtl
                ? "flex-start"
                : "flex-end",
            },
          ]}
        />
      </View>
    </Pressable>
  );
}

type ProviderCardProps = {
  provider: ProviderProfile;
  language: LanguageName;
  isRtl: boolean;
  copy: ReturnType<
    typeof getSearchCopy
  >;
  onPress: () => void;
};

function ProviderResultCard({
  provider,
  language,
  isRtl,
  copy,
  onPress,
}: ProviderCardProps) {
  const localizedDigits =
    language !== "English";

  const profession =
    getLocalizedCategoryTitle(
      provider.categoryId,
      language,
    );

  const showRating =
    provider.reviewCount > 0;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={
        provider.name
      }
      onPress={onPress}
      style={({ pressed }) => [
        styles.providerCard,
        pressed &&
          styles.cardPressed,
      ]}
    >
      <View
        style={[
          styles.providerHeader,
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
                size={10}
                color={
                  KhedmatPalette.white
                }
              />
            </View>
          ) : null}
        </View>

        <View
          style={[
            styles.providerMainCopy,
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
                size={15}
                color={
                  KhedmatPalette.blue500
                }
              />
            ) : null}
          </View>

          <Text
            numberOfLines={1}
            style={[
              styles.providerProfession,
              directionStyle(isRtl),
            ]}
          >
            {profession}
          </Text>

          <View
            style={[
              styles.providerLocationRow,
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
                KhedmatPalette.textMuted
              }
            />

            <Text
              numberOfLines={1}
              style={[
                styles.providerLocation,
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
              style={[
                styles.distanceText,
                directionStyle(
                  isRtl,
                ),
              ]}
            >
              ·{" "}
              {formatDigits(
                provider.distanceKm.toFixed(
                  1,
                ),
                localizedDigits,
              )}{" "}
              {copy.kilometres}
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.availabilityBadge,
            !provider.availableToday &&
              styles.unavailableBadge,
            {
              flexDirection: isRtl
                ? "row-reverse"
                : "row",
            },
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
            style={[
              styles.availabilityText,
              directionStyle(isRtl),
            ]}
          >
            {provider.availableToday
              ? copy.available
              : copy.busy}
          </Text>
        </View>
      </View>

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
            styles.priceBlock,
            {
              alignItems: isRtl
                ? "flex-end"
                : "flex-start",
            },
          ]}
        >
          <Text
            style={[
              styles.priceLabel,
              directionStyle(isRtl),
            ]}
          >
            {copy.from}
          </Text>

          <Text
            style={[
              styles.priceValue,
              directionStyle(isRtl),
            ]}
          >
            {formatCurrency(
              provider.minimumPrice,
              language,
            )}
          </Text>
        </View>

        <View
          style={[
            styles.cardActions,
            {
              flexDirection: isRtl
                ? "row-reverse"
                : "row",
            },
          ]}
        >
          {showRating ? (
            <View
              style={[
                styles.ratingRow,
                {
                  flexDirection:
                    isRtl
                      ? "row-reverse"
                      : "row",
                },
              ]}
            >
              <Ionicons
                name="star"
                size={15}
                color="#D99A2B"
              />

              <Text
                style={
                  styles.ratingText
                }
              >
                {formatDigits(
                  provider.rating.toFixed(
                    1,
                  ),
                  localizedDigits,
                )}
              </Text>
            </View>
          ) : null}

          <View
            style={[
              styles.viewProfileRow,
              {
                flexDirection: isRtl
                  ? "row-reverse"
                  : "row",
              },
            ]}
          >
            <Text
              style={[
                styles.viewProfileText,
                directionStyle(
                  isRtl,
                ),
              ]}
            >
              {copy.viewProfile}
            </Text>

            <Ionicons
              name={
                isRtl
                  ? "chevron-back"
                  : "chevron-forward"
              }
              size={15}
              color={
                KhedmatPalette.blue500
              }
            />
          </View>
        </View>
      </View>
    </Pressable>
  );
}

type ProviderStateProps = {
  icon: IconName;
  title: string;
  isRtl: boolean;
};

function ProviderState({
  icon,
  title,
  isRtl,
}: ProviderStateProps) {
  return (
    <View
      style={
        styles.providerState
      }
    >
      <Ionicons
        name={icon}
        size={40}
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
        {title}
      </Text>
    </View>
  );
}

type EmptyResultsProps = {
  copy: ReturnType<
    typeof getSearchCopy
  >;
  isRtl: boolean;
  onClear: () => void;
};

function EmptyResults({
  copy,
  isRtl,
  onClear,
}: EmptyResultsProps) {
  return (
    <View
      style={styles.emptyState}
    >
      <View
        style={
          styles.emptyIconContainer
        }
      >
        <Ionicons
          name="search-outline"
          size={30}
          color={
            KhedmatPalette.blue500
          }
        />
      </View>

      <Text
        style={[
          styles.emptyTitle,
          directionStyle(isRtl),
        ]}
      >
        {copy.noResults}
      </Text>

      <Text
        style={[
          styles.emptySubtitle,
          directionStyle(isRtl),
        ]}
      >
        {copy.noResultsSubtitle}
      </Text>

      <Pressable
        accessibilityRole="button"
        onPress={onClear}
        style={({ pressed }) => [
          styles.emptyAction,
          pressed &&
            styles.pressed,
        ]}
      >
        <Text
          style={[
            styles.emptyActionText,
            directionStyle(isRtl),
          ]}
        >
          {copy.clearFilters}
        </Text>
      </Pressable>
    </View>
  );
}

function getRecommendationScore(
  provider: ProviderProfile,
): number {
  return (
    provider.rating * 20 +
    Math.min(
      provider.reviewCount,
      100,
    ) *
      0.2 +
    Math.min(
      provider.completedJobs,
      200,
    ) *
      0.08 +
    provider.responseRate *
      0.15 +
    (provider.verified
      ? 15
      : 0) +
    (provider.availableToday
      ? 12
      : 0) +
    (provider.instantBooking
      ? 8
      : 0) -
    provider.distanceKm * 1.5
  );
}

function getLocalizedCategoryTitle(
  categoryId: ProviderCategoryId,
  language: LanguageName,
): string {
  const category =
    CATEGORIES.find(
      (item) =>
        item.id === categoryId,
    );

  if (category) {
    return category.title[
      language
    ];
  }

  if (language === "Dari") {
    return "ارائه‌دهندهٔ خدمات";
  }

  if (language === "Pashto") {
    return "خدمت وړاندې کوونکی";
  }

  return "Service provider";
}

function getResultsLabel(
  count: number,
  language: LanguageName,
): string {
  const localizedCount =
    formatDigits(
      count.toString(),
      language !== "English",
    );

  if (language === "Dari") {
    return `${localizedCount} ارائه‌دهنده`;
  }

  if (language === "Pashto") {
    return `${localizedCount} خدمت وړاندې کوونکي`;
  }

  return count === 1
    ? "1 provider"
    : `${count} providers`;
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

function getSingleParam(
  value:
    | string
    | string[]
    | undefined,
): string {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
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
      digits[digit] ??
      digit,
  );
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

function getSearchCopy(
  language: LanguageName,
) {
  if (language === "Dari") {
    return {
      title: "جستجو",
      searchPlaceholder:
        "خدمت یا ارائه‌دهنده",
      clearSearch:
        "پاک کردن جستجو",
      filters: "فیلترها",
      clearAll:
        "پاک کردن همه",
      availableToday:
        "امروز آمادهٔ کار",
      verified:
        "تأییدشده",
      urgent:
        "درخواست فوری",
      instantBooking:
        "رزرو فوری",
      available: "آماده",
      busy: "مصروف",
      kilometres:
        "کیلومتر",
      from: "از",
      viewProfile:
        "مشاهده",
      noResults:
        "نتیجه‌ای پیدا نشد",
      noResultsSubtitle:
        "جستجو یا فیلترها را تغییر دهید.",
      clearFilters:
        "پاک کردن فیلترها",
      loadingProviders:
        "در حال بارگذاری...",
      loadFailed:
        "بارگذاری ارائه‌دهندگان ناموفق بود",
      tryAgain:
        "تلاش دوباره",
    };
  }

  if (
    language === "Pashto"
  ) {
    return {
      title: "لټون",
      searchPlaceholder:
        "خدمت یا خدمت وړاندې کوونکی",
      clearSearch:
        "لټون پاک کړئ",
      filters: "فلټرونه",
      clearAll:
        "ټول پاک کړئ",
      availableToday:
        "نن چمتو دی",
      verified:
        "تایید شوی",
      urgent:
        "بیړنی خدمت",
      instantBooking:
        "سمدستي رزرف",
      available: "چمتو",
      busy: "بوخت",
      kilometres:
        "کیلومتر",
      from: "له",
      viewProfile:
        "وګورئ",
      noResults:
        "کومه پایله ونه موندل شوه",
      noResultsSubtitle:
        "لټون یا فلټرونه بدل کړئ.",
      clearFilters:
        "فلټرونه پاک کړئ",
      loadingProviders:
        "په بارولو کې...",
      loadFailed:
        "د خدمت وړاندې کوونکو بارول ناکام شول",
      tryAgain:
        "بیا هڅه",
    };
  }

  return {
    title: "Search",
    searchPlaceholder:
      "Service or provider",
    clearSearch:
      "Clear search",
    filters: "Filters",
    clearAll: "Clear all",
    availableToday:
      "Available today",
    verified: "Verified",
    urgent: "Urgent service",
    instantBooking:
      "Instant booking",
    available: "Available",
    busy: "Busy",
    kilometres: "km",
    from: "From",
    viewProfile:
      "View provider",
    noResults:
      "No results found",
    noResultsSubtitle:
      "Try a different search or filter.",
    clearFilters:
      "Clear filters",
    loadingProviders:
      "Loading providers...",
    loadFailed:
      "Unable to load providers",
    tryAgain: "Try again",
  };
}

const styles =
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor:
        KhedmatPalette.white,
    },

    scrollContent: {
      width: "100%",
      maxWidth:
        Layout.contentMaxWidth,
      alignSelf: "center",
      paddingHorizontal:
        Layout.screenPadding,
      paddingTop:
        Spacing.lg,
      paddingBottom: 130,
    },

    title: {
      ...Typography.screenTitle,
      width: "100%",
      color:
        KhedmatPalette.navy900,
      fontSize: 28,
      lineHeight: 35,
    },

    searchRow: {
      width: "100%",
      marginTop:
        Spacing.lg,
      alignItems: "center",
      gap: Spacing.sm,
    },

    searchBox: {
      flex: 1,
      minHeight:
        Layout.controlHeight,
      paddingHorizontal:
        Spacing.lg,
      alignItems: "center",
      gap: Spacing.md,
      borderWidth: 1,
      borderColor:
        KhedmatPalette.border,
      borderRadius:
        Radius.xl,
      backgroundColor:
        KhedmatPalette.white,
      ...Shadows.small,
    },

    searchInput: {
      flex: 1,
      minHeight:
        Layout.controlHeight,
      paddingVertical: 0,
      fontFamily:
        Fonts.regular,
      fontSize:
        Typography.body,
      color:
        KhedmatPalette.textPrimary,
    },

    filterButton: {
      width:
        Layout.controlHeight,
      height:
        Layout.controlHeight,
      borderRadius:
        Radius.xl,
      alignItems: "center",
      justifyContent:
        "center",
      borderWidth: 1,
      borderColor:
        KhedmatPalette.border,
      backgroundColor:
        KhedmatPalette.white,
    },

    filterButtonActive: {
      borderColor:
        KhedmatPalette.navy900,
      backgroundColor:
        KhedmatPalette.navy900,
    },

    filterCount: {
      position: "absolute",
      top: 5,
      right: 5,
      minWidth: 18,
      height: 18,
      paddingHorizontal: 4,
      borderRadius:
        Radius.pill,
      alignItems: "center",
      justifyContent:
        "center",
      backgroundColor:
        KhedmatPalette.blue500,
      borderWidth: 1.5,
      borderColor:
        KhedmatPalette.white,
    },

    filterCountText: {
      fontFamily:
        Fonts.bold,
      color:
        KhedmatPalette.white,
      fontSize: 10,
    },

    categoryRow: {
      marginTop:
        Spacing.md,
      gap: Spacing.sm,
      paddingHorizontal: 1,
    },

    categoryChip: {
      minHeight: 40,
      paddingHorizontal:
        Spacing.md,
      flexDirection: "row",
      alignItems: "center",
      gap: 7,
      borderRadius:
        Radius.pill,
      borderWidth: 1,
      borderColor:
        KhedmatPalette.border,
      backgroundColor:
        KhedmatPalette.white,
    },

    categoryChipSelected: {
      borderColor:
        KhedmatPalette.navy900,
      backgroundColor:
        KhedmatPalette.navy900,
    },

    categoryText: {
      ...Typography.captionStyle,
      color:
        KhedmatPalette.textSecondary,
    },

    categoryTextSelected: {
      color:
        KhedmatPalette.white,
      fontFamily:
        Fonts.medium,
    },

    filtersPanel: {
      width: "100%",
      marginTop:
        Spacing.md,
      padding:
        Spacing.md,
      gap: Spacing.md,
      borderWidth: 1,
      borderColor:
        KhedmatPalette.border,
      borderRadius:
        Radius.xl,
      backgroundColor:
        KhedmatPalette.surfaceSoft,
    },

    filtersHeader: {
      width: "100%",
      alignItems: "center",
      justifyContent:
        "space-between",
      gap: Spacing.md,
    },

    filtersTitle: {
      ...Typography.sectionTitle,
      flex: 1,
      color:
        KhedmatPalette.navy900,
      fontSize: 18,
      lineHeight: 24,
    },

    clearButton: {
      minHeight: 36,
      justifyContent:
        "center",
    },

    clearButtonText: {
      ...Typography.captionStyle,
      color:
        KhedmatPalette.blue500,
      fontFamily:
        Fonts.medium,
    },

    filterOptions: {
      gap: Spacing.sm,
    },

    filterToggle: {
      width: "100%",
      minHeight: 58,
      paddingHorizontal:
        Spacing.md,
      alignItems: "center",
      gap: Spacing.md,
      borderWidth: 1,
      borderColor:
        KhedmatPalette.border,
      borderRadius:
        Radius.lg,
      backgroundColor:
        KhedmatPalette.white,
    },

    filterToggleSelected: {
      borderColor:
        KhedmatPalette.blue500,
    },

    filterToggleIcon: {
      width: 36,
      height: 36,
      flexShrink: 0,
      borderRadius:
        Radius.md,
      alignItems: "center",
      justifyContent:
        "center",
      backgroundColor:
        KhedmatPalette.surfaceSoft,
    },

    filterToggleIconSelected: {
      backgroundColor:
        KhedmatPalette.blue500,
    },

    filterToggleTitle: {
      ...Typography.label,
      flex: 1,
      color:
        KhedmatPalette.textPrimary,
    },

    switchTrack: {
      width: 42,
      height: 24,
      flexShrink: 0,
      borderRadius:
        Radius.pill,
      justifyContent:
        "center",
      paddingHorizontal: 3,
      backgroundColor:
        KhedmatPalette.border,
    },

    switchTrackSelected: {
      backgroundColor:
        KhedmatPalette.blue500,
    },

    switchThumb: {
      width: 18,
      height: 18,
      borderRadius:
        Radius.pill,
      backgroundColor:
        KhedmatPalette.white,
    },

    switchThumbSelected: {
      backgroundColor:
        KhedmatPalette.white,
    },

    sortRow: {
      marginTop:
        Spacing.lg,
      gap: Spacing.sm,
      paddingHorizontal: 1,
    },

    sortOption: {
      minHeight: 36,
      paddingHorizontal:
        Spacing.md,
      alignItems: "center",
      justifyContent:
        "center",
      borderRadius:
        Radius.pill,
      borderWidth: 1,
      borderColor:
        KhedmatPalette.border,
      backgroundColor:
        KhedmatPalette.white,
    },

    sortOptionSelected: {
      borderColor:
        KhedmatPalette.blue500,
      backgroundColor:
        KhedmatPalette.blue500,
    },

    sortOptionText: {
      ...Typography.captionStyle,
      color:
        KhedmatPalette.textMuted,
    },

    sortOptionTextSelected: {
      color:
        KhedmatPalette.white,
      fontFamily:
        Fonts.medium,
    },

    resultsHeader: {
      width: "100%",
      marginTop:
        Spacing.xl,
      alignItems: "center",
    },

    resultsTitle: {
      ...Typography.label,
      color:
        KhedmatPalette.textSecondary,
      fontFamily:
        Fonts.medium,
    },

    results: {
      width: "100%",
      marginTop:
        Spacing.md,
      gap: Spacing.md,
    },

    providerCard: {
      width: "100%",
      padding:
        Spacing.lg,
      borderRadius:
        Radius.xl,
      borderWidth: 1,
      borderColor:
        KhedmatPalette.border,
      backgroundColor:
        KhedmatPalette.white,
      ...Shadows.small,
    },

    providerHeader: {
      width: "100%",
      alignItems:
        "flex-start",
      gap: Spacing.md,
    },

    providerAvatar: {
      width: 56,
      height: 56,
      flexShrink: 0,
      borderRadius:
        Radius.pill,
      alignItems: "center",
      justifyContent:
        "center",
      backgroundColor:
        KhedmatPalette.navy900,
    },

    providerInitials: {
      fontFamily:
        Fonts.bold,
      color:
        KhedmatPalette.white,
      fontSize: 17,
    },

    verifiedBadge: {
      position: "absolute",
      right: -2,
      bottom: -2,
      width: 19,
      height: 19,
      borderRadius:
        Radius.pill,
      alignItems: "center",
      justifyContent:
        "center",
      backgroundColor:
        KhedmatPalette.blue500,
      borderWidth: 2,
      borderColor:
        KhedmatPalette.white,
    },

    providerMainCopy: {
      flex: 1,
      gap: 2,
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
        KhedmatPalette.navy900,
      fontSize: 18,
      lineHeight: 24,
    },

    providerProfession: {
      ...Typography.bodyStyle,
      width: "100%",
      color:
        KhedmatPalette.textSecondary,
      fontSize: 14,
      lineHeight: 20,
    },

    providerLocationRow: {
      width: "100%",
      marginTop: 2,
      alignItems: "center",
      gap: 4,
    },

    providerLocation: {
      ...Typography.captionStyle,
      maxWidth: 145,
      color:
        KhedmatPalette.textMuted,
    },

    distanceText: {
      ...Typography.captionStyle,
      color:
        KhedmatPalette.textMuted,
    },

    availabilityBadge: {
      minHeight: 28,
      flexShrink: 0,
      alignItems: "center",
      gap: 5,
      paddingHorizontal:
        Spacing.sm,
      borderRadius:
        Radius.pill,
      backgroundColor:
        KhedmatPalette.successSoft,
    },

    unavailableBadge: {
      backgroundColor:
        KhedmatPalette.surfaceSoft,
    },

    availabilityDot: {
      width: 6,
      height: 6,
      borderRadius:
        Radius.pill,
      backgroundColor:
        KhedmatPalette.success,
    },

    unavailableDot: {
      backgroundColor:
        KhedmatPalette.textMuted,
    },

    availabilityText: {
      ...Typography.captionStyle,
      color:
        KhedmatPalette.textSecondary,
      fontSize: 11,
    },

    providerMetaRow: {
      width: "100%",
      marginTop:
        Spacing.lg,
      paddingTop:
        Spacing.md,
      borderTopWidth:
        StyleSheet.hairlineWidth,
      borderTopColor:
        KhedmatPalette.border,
      alignItems: "center",
      justifyContent:
        "space-between",
      gap: Spacing.md,
    },

    priceBlock: {
      flexShrink: 0,
      gap: 1,
    },

    priceLabel: {
      ...Typography.captionStyle,
      color:
        KhedmatPalette.textMuted,
      fontSize: 10,
    },

    priceValue: {
      ...Typography.label,
      color:
        KhedmatPalette.navy900,
      fontFamily:
        Fonts.bold,
      fontSize: 14,
    },

    cardActions: {
      flex: 1,
      alignItems: "center",
      justifyContent:
        "flex-end",
      gap: Spacing.md,
    },

    ratingRow: {
      alignItems: "center",
      gap: 4,
    },

    ratingText: {
      ...Typography.captionStyle,
      color:
        KhedmatPalette.textSecondary,
      fontFamily:
        Fonts.medium,
    },

    viewProfileRow: {
      alignItems: "center",
      gap: 3,
    },

    viewProfileText: {
      ...Typography.captionStyle,
      color:
        KhedmatPalette.blue500,
      fontFamily:
        Fonts.medium,
    },

    providerState: {
      minHeight: 260,
      alignItems: "center",
      justifyContent:
        "center",
      gap: Spacing.md,
      paddingHorizontal:
        Spacing.xl,
    },

    providerStateTitle: {
      ...Typography.label,
      width: "100%",
      maxWidth:
        Layout.readableTextMaxWidth,
      color:
        KhedmatPalette.textSecondary,
      textAlign: "center",
    },

    retryButton: {
      minHeight:
        Layout.minimumTouchTarget,
      alignItems: "center",
      justifyContent:
        "center",
      paddingHorizontal:
        Spacing.lg,
      borderRadius:
        Radius.md,
      backgroundColor:
        KhedmatPalette.navy900,
    },

    retryButtonText: {
      ...Typography.buttonLabel,
      color:
        KhedmatPalette.white,
    },

    emptyState: {
      minHeight: 300,
      alignItems: "center",
      justifyContent:
        "center",
      gap: Spacing.md,
      paddingHorizontal:
        Spacing.xl,
    },

    emptyIconContainer: {
      width: 72,
      height: 72,
      borderRadius:
        Radius.pill,
      alignItems: "center",
      justifyContent:
        "center",
      backgroundColor:
        KhedmatPalette.surfaceSoft,
    },

    emptyTitle: {
      ...Typography.sectionTitle,
      color:
        KhedmatPalette.navy900,
      textAlign: "center",
    },

    emptySubtitle: {
      ...Typography.bodyStyle,
      maxWidth: 320,
      color:
        KhedmatPalette.textSecondary,
      textAlign: "center",
    },

    emptyAction: {
      minHeight: 44,
      paddingHorizontal:
        Spacing.lg,
      alignItems: "center",
      justifyContent:
        "center",
      borderRadius:
        Radius.pill,
      backgroundColor:
        KhedmatPalette.navy900,
    },

    emptyActionText: {
      ...Typography.label,
      color:
        KhedmatPalette.white,
    },

    pressed: {
      opacity: 0.78,
    },

    cardPressed: {
      opacity: 0.88,
      transform: [
        {
          scale: 0.992,
        },
      ],
    },
  });
