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
import {
  ProviderCategoryId,
  ProviderProfile,
  providers,
} from "../../data/providers";

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
  icon: IconName;
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
    icon: "sparkles-outline",
  },
  {
    id: "distance",
    label: {
      English: "Nearest",
      Dari: "نزدیک‌ترین",
      Pashto: "تر ټولو نږدې",
    },
    icon: "navigate-outline",
  },
  {
    id: "rating",
    label: {
      English: "Top rated",
      Dari: "بالاترین امتیاز",
      Pashto: "لوړ امتیاز",
    },
    icon: "star-outline",
  },
  {
    id: "price",
    label: {
      English: "Lowest price",
      Dari: "کمترین قیمت",
      Pashto: "ټیټه بیه",
    },
    icon: "cash-outline",
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

  const activeLanguage =
    normalizeLanguage(language);

  const isRtl =
    activeLanguage === "Dari" ||
    activeLanguage === "Pashto";

  const copy =
    getSearchCopy(activeLanguage);

  const params =
    useLocalSearchParams<{
      category?: string | string[];
    }>();

  const incomingCategory =
    getSingleParam(params.category);

  const [query, setQuery] =
    useState("");

  const [
    selectedCategoryId,
    setSelectedCategoryId,
  ] = useState<CategoryFilterId>(
    "all",
  );

  const [
    selectedSort,
    setSelectedSort,
  ] = useState<SortOption>(
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
              !provider.acceptsUrgentRequests
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

            const searchableText = [
              provider.name,
              provider.profession,
              provider.description,
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
            selectedSort === "rating"
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
            selectedSort === "price"
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
      filters,
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
    setSelectedSort("recommended");
    setFilters(INITIAL_FILTERS);
  };

  const openProvider = (
    providerId: string,
  ) => {
    router.push({
      pathname: "/provider-profile",
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
      >
        <View style={styles.header}>
          <Text
            style={[
              styles.eyebrow,
              directionStyle(isRtl),
            ]}
          >
            {copy.eyebrow}
          </Text>

          <Text
            style={[
              styles.title,
              directionStyle(isRtl),
            ]}
          >
            {copy.title}
          </Text>

          <Text
            style={[
              styles.subtitle,
              directionStyle(isRtl),
            ]}
          >
            {copy.subtitle}
          </Text>
        </View>

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
                (current) => !current,
              )
            }
            style={({ pressed }) => [
              styles.filterButton,
              (filtersVisible ||
                activeFilterCount >
                  0) &&
                styles.filterButtonActive,
              pressed && styles.pressed,
            ]}
          >
            <Ionicons
              name="options-outline"
              size={21}
              color={
                activeFilterCount > 0
                  ? KhedmatPalette.white
                  : KhedmatPalette
                      .navy700
              }
            />

            {activeFilterCount > 0 ? (
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
                  style={({ pressed }) => [
                    styles.categoryChip,
                    selected &&
                      styles.categoryChipSelected,
                    pressed &&
                      styles.pressed,
                  ]}
                >
                  <Ionicons
                    name={category.icon}
                    size={17}
                    color={
                      selected
                        ? KhedmatPalette
                            .white
                        : KhedmatPalette
                            .navy700
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
            style={styles.filtersPanel}
          >
            <View
              style={[
                styles.filtersHeader,
                {
                  flexDirection: isRtl
                    ? "row-reverse"
                    : "row",
                },
              ]}
            >
              <View
                style={[
                  styles.filtersTitleCopy,
                  {
                    alignItems: isRtl
                      ? "flex-end"
                      : "flex-start",
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

                <Text
                  style={[
                    styles.filtersSubtitle,
                    directionStyle(
                      isRtl,
                    ),
                  ]}
                >
                  {copy.filtersSubtitle}
                </Text>
              </View>

              <Pressable
                accessibilityRole="button"
                onPress={clearFilters}
                style={({ pressed }) => [
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
                subtitle={
                  copy.availableTodaySubtitle
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
                title={copy.verified}
                subtitle={
                  copy.verifiedSubtitle
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
                title={copy.urgent}
                subtitle={
                  copy.urgentSubtitle
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
                subtitle={
                  copy.instantBookingSubtitle
                }
                selected={
                  filters.instantBookingOnly
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

        <View
          style={styles.sortSection}
        >
          <View
            style={[
              styles.sortHeader,
              {
                flexDirection: isRtl
                  ? "row-reverse"
                  : "row",
              },
            ]}
          >
            <Ionicons
              name="swap-vertical-outline"
              size={18}
              color={
                KhedmatPalette.blue500
              }
            />

            <Text
              style={[
                styles.sortTitle,
                directionStyle(isRtl),
              ]}
            >
              {copy.sort}
            </Text>
          </View>

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
                    style={({ pressed }) => [
                      styles.sortOption,
                      selected &&
                        styles.sortOptionSelected,
                      pressed &&
                        styles.pressed,
                    ]}
                  >
                    <Ionicons
                      name={option.icon}
                      size={15}
                      color={
                        selected
                          ? KhedmatPalette
                              .white
                          : KhedmatPalette
                              .textMuted
                      }
                    />

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
        </View>

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
          <View
            style={[
              styles.resultsTitleRow,
              {
                flexDirection: isRtl
                  ? "row-reverse"
                  : "row",
              },
            ]}
          >
            <Ionicons
              name="people-outline"
              size={20}
              color={
                KhedmatPalette.blue500
              }
            />

            <Text
              style={[
                styles.resultsTitle,
                directionStyle(isRtl),
              ]}
            >
              {copy.providers}
            </Text>
          </View>

          <Text
            style={[
              styles.resultsCount,
              directionStyle(isRtl),
            ]}
          >
            {formatDigits(
              filteredProviders.length.toString(),
              activeLanguage !==
                "English",
            )}{" "}
            {copy.results}
          </Text>
        </View>

        <View style={styles.results}>
          {filteredProviders.map(
            (provider) => (
              <ProviderResultCard
                key={provider.id}
                provider={provider}
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
              onClear={clearFilters}
            />
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

type FilterToggleProps = {
  icon: IconName;
  title: string;
  subtitle: string;
  selected: boolean;
  isRtl: boolean;
  onPress: () => void;
};

function FilterToggle({
  icon,
  title,
  subtitle,
  selected,
  isRtl,
  onPress,
}: FilterToggleProps) {
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityLabel={title}
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
          size={20}
          color={
            selected
              ? KhedmatPalette.white
              : KhedmatPalette.navy700
          }
        />
      </View>

      <View
        style={[
          styles.filterToggleCopy,
          {
            alignItems: isRtl
              ? "flex-end"
              : "flex-start",
          },
        ]}
      >
        <Text
          style={[
            styles.filterToggleTitle,
            directionStyle(isRtl),
          ]}
        >
          {title}
        </Text>

        <Text
          style={[
            styles.filterToggleSubtitle,
            directionStyle(isRtl),
          ]}
        >
          {subtitle}
        </Text>
      </View>

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
                size={11}
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
                directionStyle(isRtl),
              ]}
            >
              {provider.name}
            </Text>

            {provider.verified ? (
              <Ionicons
                name="shield-checkmark"
                size={16}
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
            {provider.profession}
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
                directionStyle(isRtl),
              ]}
            >
              {provider.locationLabel}
            </Text>

            <Text
              style={[
                styles.distanceText,
                directionStyle(isRtl),
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
          styles.badgesRow,
          {
            flexDirection: isRtl
              ? "row-reverse"
              : "row",
          },
        ]}
      >
        {provider.instantBooking ? (
          <ProviderBadge
            icon="calendar-outline"
            label={
              copy.instantBookingBadge
            }
            color={
              KhedmatPalette.blue500
            }
            backgroundColor={
              KhedmatPalette.surfaceSoft
            }
            isRtl={isRtl}
          />
        ) : null}

        {provider.acceptsUrgentRequests ? (
          <ProviderBadge
            icon="flash-outline"
            label={copy.urgentBadge}
            color="#9A6500"
            backgroundColor="#FFF4D6"
            isRtl={isRtl}
          />
        ) : null}

        <ProviderBadge
          icon="cash-outline"
          label={`${copy.from} ${formatCurrency(
            provider.minimumPrice,
            language,
          )}`}
          color={
            KhedmatPalette.success
          }
          backgroundColor={
            KhedmatPalette.successSoft
          }
          isRtl={isRtl}
        />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={
          false
        }
        contentContainerStyle={
          styles.servicesRow
        }
        style={{
          direction: isRtl
            ? "rtl"
            : "ltr",
        }}
      >
        {provider.services
          .slice(0, 4)
          .map((service) => (
            <View
              key={service.id}
              style={
                styles.serviceChip
              }
            >
              <Text
                style={[
                  styles.serviceChipText,
                  directionStyle(
                    isRtl,
                  ),
                ]}
              >
                {service.title}
              </Text>
            </View>
          ))}
      </ScrollView>

      <View
        style={styles.providerDivider}
      />

      <View
        style={[
          styles.providerFooter,
          {
            flexDirection: isRtl
              ? "row-reverse"
              : "row",
          },
        ]}
      >
        <View
          style={[
            styles.providerStats,
            {
              flexDirection: isRtl
                ? "row-reverse"
                : "row",
            },
          ]}
        >
          <View
            style={[
              styles.statItem,
              {
                flexDirection: isRtl
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
              style={styles.statText}
            >
              {formatDigits(
                provider.rating.toFixed(
                  1,
                ),
                localizedDigits,
              )}
            </Text>

            <Text
              style={
                styles.reviewText
              }
            >
              (
              {formatDigits(
                provider.reviewCount.toString(),
                localizedDigits,
              )}
              )
            </Text>
          </View>

          <View
            style={[
              styles.statItem,
              {
                flexDirection: isRtl
                  ? "row-reverse"
                  : "row",
              },
            ]}
          >
            <Ionicons
              name="briefcase-outline"
              size={15}
              color={
                KhedmatPalette.textMuted
              }
            />

            <Text
              style={[
                styles.statText,
                directionStyle(isRtl),
              ]}
            >
              {formatDigits(
                provider.completedJobs.toString(),
                localizedDigits,
              )}{" "}
              {copy.jobs}
            </Text>
          </View>
        </View>

        <Text
          style={[
            styles.viewProfileText,
            directionStyle(isRtl),
          ]}
        >
          {copy.viewProfile}
        </Text>
      </View>
    </Pressable>
  );
}

type ProviderBadgeProps = {
  icon: IconName;
  label: string;
  color: string;
  backgroundColor: string;
  isRtl: boolean;
};

function ProviderBadge({
  icon,
  label,
  color,
  backgroundColor,
  isRtl,
}: ProviderBadgeProps) {
  return (
    <View
      style={[
        styles.providerBadge,
        {
          backgroundColor,
          flexDirection: isRtl
            ? "row-reverse"
            : "row",
        },
      ]}
    >
      <Ionicons
        name={icon}
        size={13}
        color={color}
      />

      <Text
        style={[
          styles.providerBadgeText,
          {
            color,
          },
          directionStyle(isRtl),
        ]}
      >
        {label}
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
    <View style={styles.emptyState}>
      <View
        style={
          styles.emptyIconContainer
        }
      >
        <Ionicons
          name="search-outline"
          size={34}
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
          pressed && styles.pressed,
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
    provider.responseRate * 0.15 +
    (provider.verified ? 15 : 0) +
    (provider.availableToday
      ? 12
      : 0) +
    (provider.instantBooking
      ? 8
      : 0) -
    provider.distanceKm * 1.5
  );
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
  value: string | string[] | undefined,
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
      digits[digit] ?? digit,
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

  if (language === "English") {
    return `${formatted} AFN`;
  }

  const localized =
    formatDigits(formatted, true);

  return language === "Dari"
    ? `${localized} افغانی`
    : `${localized} افغانۍ`;
}

function getSearchCopy(
  language: LanguageName,
) {
  if (language === "Dari") {
    return {
      eyebrow: "بازار خدمات",
      title:
        "خدمت مورد نیاز خود را پیدا کنید",
      subtitle:
        "میان ارائه‌دهندگان، مهارت‌ها و خدمات نزدیک خود جستجو کنید.",
      searchPlaceholder:
        "نام خدمت یا ارائه‌دهنده",
      clearSearch:
        "پاک کردن جستجو",
      filters: "فیلترها",
      filtersSubtitle:
        "نتایج را دقیق‌تر کنید.",
      clearAll: "پاک کردن همه",
      availableToday:
        "امروز آمادهٔ کار",
      availableTodaySubtitle:
        "فقط ارائه‌دهندگان فعال امروز",
      verified:
        "حساب تأییدشده",
      verifiedSubtitle:
        "هویت و معلومات بررسی‌شده",
      urgent:
        "پذیرش درخواست فوری",
      urgentSubtitle:
        "مناسب برای خدمات فوری",
      instantBooking:
        "رزرو فوری",
      instantBookingSubtitle:
        "بدون انتظار برای هماهنگی اولیه",
      sort: "مرتب‌سازی",
      providers: "ارائه‌دهندگان",
      results: "نتیجه",
      available: "آماده",
      busy: "مصروف",
      kilometres: "کیلومتر",
      instantBookingBadge:
        "رزرو فوری",
      urgentBadge: "خدمت فوری",
      from: "از",
      jobs: "کار",
      viewProfile: "مشاهده",
      noResults:
        "نتیجه‌ای پیدا نشد",
      noResultsSubtitle:
        "عبارت جستجو، دسته‌بندی یا فیلترهای انتخاب‌شده را تغییر دهید.",
      clearFilters:
        "پاک کردن فیلترها",
    };
  }

  if (language === "Pashto") {
    return {
      eyebrow: "د خدمتونو بازار",
      title:
        "خپل اړین خدمت پیدا کړئ",
      subtitle:
        "نږدې خدمت وړاندې کوونکي، مهارتونه او خدمتونه ولټوئ.",
      searchPlaceholder:
        "خدمت یا خدمت وړاندې کوونکی",
      clearSearch:
        "لټون پاک کړئ",
      filters: "فلټرونه",
      filtersSubtitle:
        "پایلې لا دقیقې کړئ.",
      clearAll: "ټول پاک کړئ",
      availableToday:
        "نن چمتو دی",
      availableTodaySubtitle:
        "یوازې نن فعال کسان",
      verified: "تایید شوی حساب",
      verifiedSubtitle:
        "هویت او معلومات تایید شوي",
      urgent:
        "بیړني کارونه مني",
      urgentSubtitle:
        "د بیړنیو خدمتونو لپاره",
      instantBooking:
        "سمدستي رزرف",
      instantBookingSubtitle:
        "له لومړني انتظار پرته",
      sort: "ترتیب",
      providers:
        "خدمت وړاندې کوونکي",
      results: "پایلې",
      available: "چمتو",
      busy: "بوخت",
      kilometres: "کیلومتر",
      instantBookingBadge:
        "سمدستي رزرف",
      urgentBadge: "بیړنی خدمت",
      from: "له",
      jobs: "کارونه",
      viewProfile: "وګورئ",
      noResults:
        "کومه پایله ونه موندل شوه",
      noResultsSubtitle:
        "د لټون عبارت، کټګوري یا فلټرونه بدل کړئ.",
      clearFilters:
        "فلټرونه پاک کړئ",
    };
  }

  return {
    eyebrow: "Service marketplace",
    title:
      "Find the service you need",
    subtitle:
      "Search providers, skills and services near you.",
    searchPlaceholder:
      "Service or provider name",
    clearSearch: "Clear search",
    filters: "Filters",
    filtersSubtitle:
      "Make the results more precise.",
    clearAll: "Clear all",
    availableToday:
      "Available today",
    availableTodaySubtitle:
      "Only providers active today",
    verified:
      "Verified account",
    verifiedSubtitle:
      "Identity and information checked",
    urgent:
      "Accepts urgent requests",
    urgentSubtitle:
      "Suitable for urgent services",
    instantBooking:
      "Instant booking",
    instantBookingSubtitle:
      "Book without initial coordination",
    sort: "Sort by",
    providers: "Providers",
    results: "results",
    available: "Available",
    busy: "Busy",
    kilometres: "km",
    instantBookingBadge:
      "Instant booking",
    urgentBadge: "Urgent service",
    from: "From",
    jobs: "jobs",
    viewProfile: "View",
    noResults: "No results found",
    noResultsSubtitle:
      "Change your search, category or selected filters.",
    clearFilters: "Clear filters",
  };
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor:
      KhedmatPalette.blue050,
  },

  scrollContent: {
    width: "100%",
    maxWidth:
      Layout.contentMaxWidth,
    alignSelf: "center",
    paddingHorizontal:
      Layout.screenPadding,
    paddingTop: Spacing.lg,
    paddingBottom: 130,
  },

  header: {
    width: "100%",
    gap: Spacing.xs,
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
    color:
      KhedmatPalette.textPrimary,
    fontSize: 27,
    lineHeight: 34,
  },

  subtitle: {
    ...Typography.bodyStyle,
    width: "100%",
    maxWidth:
      Layout.readableTextMaxWidth,
    color:
      KhedmatPalette.textSecondary,
  },

  searchRow: {
    width: "100%",
    marginTop: Spacing.xxl,
    alignItems: "center",
    gap: Spacing.sm,
  },

  searchBox: {
    flex: 1,
    minHeight:
      Layout.controlHeight,
    paddingHorizontal: Spacing.lg,
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

  searchInput: {
    flex: 1,
    minHeight:
      Layout.controlHeight,
    paddingVertical: 0,
    fontFamily: Fonts.regular,
    fontSize: Typography.body,
    color:
      KhedmatPalette.textPrimary,
  },

  filterButton: {
    width:
      Layout.controlHeight,
    height:
      Layout.controlHeight,
    borderRadius: Radius.xl,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor:
      KhedmatPalette.border,
    backgroundColor:
      KhedmatPalette.surface,
  },

  filterButtonActive: {
    borderColor:
      KhedmatPalette.blue500,
    backgroundColor:
      KhedmatPalette.blue500,
  },

  filterCount: {
    position: "absolute",
    top: 5,
    right: 5,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      KhedmatPalette.navy900,
    borderWidth: 1.5,
    borderColor:
      KhedmatPalette.white,
  },

  filterCountText: {
    fontFamily: Fonts.bold,
    color:
      KhedmatPalette.white,
    fontSize: 10,
  },

  categoryRow: {
    marginTop: Spacing.lg,
    gap: Spacing.sm,
    paddingHorizontal: 1,
  },

  categoryChip: {
    minHeight: 42,
    paddingHorizontal: Spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor:
      KhedmatPalette.border,
    backgroundColor:
      KhedmatPalette.surface,
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
    fontFamily: Fonts.medium,
  },

  filtersPanel: {
    width: "100%",
    marginTop: Spacing.lg,
    padding: Spacing.lg,
    gap: Spacing.md,
    borderWidth: 1,
    borderColor:
      KhedmatPalette.border,
    borderRadius: Radius.xl,
    backgroundColor:
      KhedmatPalette.surface,
    ...Shadows.small,
  },

  filtersHeader: {
    width: "100%",
    alignItems: "center",
    justifyContent:
      "space-between",
    gap: Spacing.md,
  },

  filtersTitleCopy: {
    flex: 1,
    gap: 2,
  },

  filtersTitle: {
    ...Typography.sectionTitle,
    width: "100%",
    color:
      KhedmatPalette.textPrimary,
    fontSize: 19,
    lineHeight: 25,
  },

  filtersSubtitle: {
    ...Typography.captionStyle,
    width: "100%",
    color:
      KhedmatPalette.textMuted,
  },

  clearButton: {
    minHeight: 36,
    justifyContent: "center",
  },

  clearButtonText: {
    ...Typography.captionStyle,
    color:
      KhedmatPalette.blue500,
    fontFamily: Fonts.medium,
  },

  filterOptions: {
    gap: Spacing.sm,
  },

  filterToggle: {
    width: "100%",
    minHeight: 74,
    padding: Spacing.md,
    alignItems: "center",
    gap: Spacing.md,
    borderWidth: 1,
    borderColor:
      KhedmatPalette.border,
    borderRadius: Radius.lg,
    backgroundColor:
      KhedmatPalette.surfaceSoft,
  },

  filterToggleSelected: {
    borderColor:
      KhedmatPalette.blue500,
    backgroundColor:
      "#E5F4F8",
  },

  filterToggleIcon: {
    width: 42,
    height: 42,
    flexShrink: 0,
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      KhedmatPalette.surface,
  },

  filterToggleIconSelected: {
    backgroundColor:
      KhedmatPalette.blue500,
  },

  filterToggleCopy: {
    flex: 1,
    gap: 2,
  },

  filterToggleTitle: {
    ...Typography.label,
    width: "100%",
    color:
      KhedmatPalette.textPrimary,
  },

  filterToggleSubtitle: {
    ...Typography.captionStyle,
    width: "100%",
    color:
      KhedmatPalette.textMuted,
  },

  switchTrack: {
    width: 44,
    height: 26,
    flexShrink: 0,
    borderRadius: Radius.pill,
    justifyContent: "center",
    paddingHorizontal: 3,
    backgroundColor:
      KhedmatPalette.border,
  },

  switchTrackSelected: {
    backgroundColor:
      KhedmatPalette.blue500,
  },

  switchThumb: {
    width: 20,
    height: 20,
    borderRadius: Radius.pill,
    backgroundColor:
      KhedmatPalette.white,
  },

  switchThumbSelected: {
    backgroundColor:
      KhedmatPalette.white,
  },

  sortSection: {
    width: "100%",
    marginTop: Spacing.xl,
    gap: Spacing.sm,
  },

  sortHeader: {
    width: "100%",
    alignItems: "center",
    gap: Spacing.sm,
  },

  sortTitle: {
    ...Typography.label,
    color:
      KhedmatPalette.textSecondary,
  },

  sortRow: {
    gap: Spacing.sm,
  },

  sortOption: {
    minHeight: 38,
    paddingHorizontal: Spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor:
      KhedmatPalette.border,
    backgroundColor:
      KhedmatPalette.surface,
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
    fontFamily: Fonts.medium,
  },

  resultsHeader: {
    width: "100%",
    marginTop: Spacing.section,
    alignItems: "center",
    justifyContent:
      "space-between",
  },

  resultsTitleRow: {
    alignItems: "center",
    gap: Spacing.sm,
  },

  resultsTitle: {
    ...Typography.sectionTitle,
    color:
      KhedmatPalette.textPrimary,
    fontSize: 21,
    lineHeight: 28,
  },

  resultsCount: {
    ...Typography.captionStyle,
    color:
      KhedmatPalette.textMuted,
  },

  results: {
    width: "100%",
    marginTop: Spacing.lg,
    gap: Spacing.md,
  },

  providerCard: {
    width: "100%",
    padding: Spacing.lg,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor:
      KhedmatPalette.border,
    backgroundColor:
      KhedmatPalette.surface,
    ...Shadows.small,
  },

  providerHeader: {
    width: "100%",
    alignItems: "flex-start",
    gap: Spacing.md,
  },

  providerAvatar: {
    width: 58,
    height: 58,
    flexShrink: 0,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      KhedmatPalette.navy900,
  },

  providerInitials: {
    fontFamily: Fonts.bold,
    color:
      KhedmatPalette.white,
    fontSize: 18,
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
    backgroundColor:
      KhedmatPalette.blue500,
    borderWidth: 2,
    borderColor:
      KhedmatPalette.surface,
  },

  providerMainCopy: {
    flex: 1,
    gap: 3,
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

  providerLocationRow: {
    width: "100%",
    marginTop: 2,
    alignItems: "center",
    gap: 4,
  },

  providerLocation: {
    ...Typography.captionStyle,
    maxWidth: 150,
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
    paddingHorizontal: Spacing.sm,
    borderRadius: Radius.pill,
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
    borderRadius: Radius.pill,
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

  badgesRow: {
    width: "100%",
    marginTop: Spacing.md,
    flexWrap: "wrap",
    gap: Spacing.sm,
  },

  providerBadge: {
    minHeight: 28,
    alignItems: "center",
    gap: 5,
    paddingHorizontal: Spacing.sm,
    borderRadius: Radius.pill,
  },

  providerBadgeText: {
    ...Typography.captionStyle,
    fontSize: 10,
  },

  servicesRow: {
    marginTop: Spacing.md,
    gap: Spacing.sm,
  },

  serviceChip: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor:
      KhedmatPalette.border,
    backgroundColor:
      KhedmatPalette.surfaceSoft,
  },

  serviceChipText: {
    ...Typography.captionStyle,
    color:
      KhedmatPalette.textSecondary,
    fontSize: 11,
  },

  providerDivider: {
    width: "100%",
    height:
      StyleSheet.hairlineWidth,
    marginVertical: Spacing.md,
    backgroundColor:
      KhedmatPalette.border,
  },

  providerFooter: {
    width: "100%",
    alignItems: "center",
    justifyContent:
      "space-between",
    gap: Spacing.md,
  },

  providerStats: {
    flex: 1,
    alignItems: "center",
    flexWrap: "wrap",
    gap: Spacing.md,
  },

  statItem: {
    alignItems: "center",
    gap: 4,
  },

  statText: {
    ...Typography.captionStyle,
    color:
      KhedmatPalette.textSecondary,
    fontSize: 11,
  },

  reviewText: {
    ...Typography.captionStyle,
    color:
      KhedmatPalette.textMuted,
    fontSize: 11,
  },

  viewProfileText: {
    ...Typography.captionStyle,
    color:
      KhedmatPalette.blue500,
    fontFamily: Fonts.medium,
  },

  emptyState: {
    minHeight: 340,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.md,
    paddingHorizontal: Spacing.xl,
  },

  emptyIconContainer: {
    width: 82,
    height: 82,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      KhedmatPalette.surface,
    borderWidth: 1,
    borderColor:
      KhedmatPalette.border,
  },

  emptyTitle: {
    ...Typography.sectionTitle,
    color:
      KhedmatPalette.textPrimary,
    textAlign: "center",
  },

  emptySubtitle: {
    ...Typography.bodyStyle,
    maxWidth: 340,
    color:
      KhedmatPalette.textSecondary,
    textAlign: "center",
  },

  emptyAction: {
    minHeight: 44,
    paddingHorizontal: Spacing.lg,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: Radius.pill,
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