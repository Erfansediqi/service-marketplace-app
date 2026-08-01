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

import { GlassSurface } from "../../components/glass/glass-surface";
import {
  Colors,
  Layout,
  Radius,
  Shadows,
  Spacing,
  Typography,
} from "../../constants/theme";
import {
  ProviderCategoryId,
  ProviderProfile,
  providers,
} from "../../data/providers";

type IconName =
  ComponentProps<typeof Ionicons>["name"];

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

type SearchCategory = {
  id: CategoryFilterId;
  title: string;
  icon: IconName;
};

const categories: SearchCategory[] = [
  {
    id: "all",
    title: "همه",
    icon: "apps-outline",
  },
  {
    id: "electrician",
    title: "برق‌کاری",
    icon: "flash-outline",
  },
  {
    id: "plumber",
    title: "لوله‌کشی",
    icon: "water-outline",
  },
  {
    id: "cleaner",
    title: "نظافت",
    icon: "sparkles-outline",
  },
  {
    id: "construction",
    title: "ساختمان",
    icon: "construct-outline",
  },
  {
    id: "carpenter",
    title: "نجاری",
    icon: "hammer-outline",
  },
  {
    id: "computer-repair",
    title: "تخنیک",
    icon: "laptop-outline",
  },
];

const sortOptions: Array<{
  id: SortOption;
  label: string;
  icon: IconName;
}> = [
  {
    id: "recommended",
    label: "پیشنهادی",
    icon: "sparkles-outline",
  },
  {
    id: "distance",
    label: "نزدیک‌ترین",
    icon: "navigate-outline",
  },
  {
    id: "rating",
    label: "بالاترین امتیاز",
    icon: "star-outline",
  },
  {
    id: "price",
    label: "کمترین قیمت",
    icon: "cash-outline",
  },
];

const initialFilters: FilterState = {
  availableToday: false,
  verifiedOnly: false,
  urgentOnly: false,
  instantBookingOnly: false,
};

export default function SearchScreen() {
  const router = useRouter();

  const params = useLocalSearchParams<{
    category?: string | string[];
  }>();

  const incomingCategory =
    getSingleParam(params.category);

  const [query, setQuery] = useState("");
  const [
    selectedCategoryId,
    setSelectedCategoryId,
  ] = useState<CategoryFilterId>("all");

  const [selectedSort, setSelectedSort] =
    useState<SortOption>("recommended");

  const [filtersVisible, setFiltersVisible] =
    useState(false);

  const [filters, setFilters] =
    useState<FilterState>(initialFilters);

  useEffect(() => {
    if (
      incomingCategory &&
      categories.some(
        (category) =>
          category.id === incomingCategory,
      )
    ) {
      setSelectedCategoryId(
        incomingCategory as CategoryFilterId,
      );
    }
  }, [incomingCategory]);

  const filteredProviders = useMemo(() => {
    const normalizedQuery = query
      .trim()
      .toLocaleLowerCase();

    const results = providers.filter(
      (provider) => {
        if (
          selectedCategoryId !== "all" &&
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
            (service) => service.title,
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
        if (selectedSort === "distance") {
          return (
            first.distanceKm -
            second.distanceKm
          );
        }

        if (selectedSort === "rating") {
          if (
            first.rating !== second.rating
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

        if (selectedSort === "price") {
          return (
            first.minimumPrice -
            second.minimumPrice
          );
        }

        const firstScore =
          getRecommendationScore(first);

        const secondScore =
          getRecommendationScore(second);

        return secondScore - firstScore;
      },
    );
  }, [
    filters,
    query,
    selectedCategoryId,
    selectedSort,
  ]);

  const activeFilterCount =
    Number(filters.availableToday) +
    Number(filters.verifiedOnly) +
    Number(filters.urgentOnly) +
    Number(filters.instantBookingOnly);

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
    setFilters(initialFilters);
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
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={
          styles.scrollContent
        }
      >
        <View style={styles.header}>
          <Text style={styles.eyebrow}>
            بازار خدمات
          </Text>

          <Text style={styles.title}>
            خدمت مورد نیاز خود را پیدا کنید
          </Text>

          <Text style={styles.subtitle}>
            میان ارائه‌دهندگان، مهارت‌ها و خدمات
            نزدیک خود جستجو کنید.
          </Text>
        </View>

        <View style={styles.searchRow}>
          <GlassSurface
            variant="prominent"
            radius={Radius.xl}
            style={[
              styles.searchSurface,
              Shadows.small,
            ]}
            contentStyle={styles.searchContent}
          >
            <Ionicons
              name="search-outline"
              size={21}
              color={Colors.primary}
            />

            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="نام خدمت یا ارائه‌دهنده..."
              placeholderTextColor={
                Colors.textMuted
              }
              selectionColor={Colors.primary}
              returnKeyType="search"
              style={styles.searchInput}
            />

            {query.length > 0 ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="پاک کردن جستجو"
                hitSlop={8}
                onPress={() => setQuery("")}
              >
                <Ionicons
                  name="close-circle"
                  size={20}
                  color={Colors.textTertiary}
                />
              </Pressable>
            ) : null}
          </GlassSurface>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="فیلترها"
            onPress={() =>
              setFiltersVisible(
                (current) => !current,
              )
            }
            style={({ pressed }) => [
              styles.filterPressable,
              pressed && styles.pressed,
            ]}
          >
            <GlassSurface
              variant={
                filtersVisible ||
                activeFilterCount > 0
                  ? "prominent"
                  : "regular"
              }
              radius={Radius.xl}
              style={[
                styles.filterSurface,
                activeFilterCount > 0 &&
                  styles.activeFilterSurface,
              ]}
              contentStyle={
                styles.filterContent
              }
            >
              <Ionicons
                name="options-outline"
                size={21}
                color={
                  activeFilterCount > 0
                    ? Colors.primary
                    : Colors.textSecondary
                }
              />

              {activeFilterCount > 0 ? (
                <View
                  style={styles.filterCount}
                >
                  <Text
                    style={
                      styles.filterCountText
                    }
                  >
                    {toDariDigits(
                      activeFilterCount.toString(),
                    )}
                  </Text>
                </View>
              ) : null}
            </GlassSurface>
          </Pressable>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={
            styles.categoryRow
          }
          style={styles.categoriesScroll}
        >
          {categories.map((category) => {
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
                  styles.categoryPressable,
                  pressed && styles.pressed,
                ]}
              >
                <GlassSurface
                  variant={
                    selected
                      ? "prominent"
                      : "regular"
                  }
                  radius={Radius.pill}
                  style={[
                    styles.categorySurface,
                    selected &&
                      styles.selectedCategorySurface,
                  ]}
                  contentStyle={
                    styles.categoryContent
                  }
                >
                  <Ionicons
                    name={category.icon}
                    size={17}
                    color={
                      selected
                        ? Colors.primary
                        : Colors.textSecondary
                    }
                  />

                  <Text
                    style={[
                      styles.categoryText,
                      selected &&
                        styles.selectedCategoryText,
                    ]}
                  >
                    {category.title}
                  </Text>
                </GlassSurface>
              </Pressable>
            );
          })}
        </ScrollView>

        {filtersVisible ? (
          <GlassSurface
            variant="regular"
            radius={Radius.xl}
            style={styles.filtersPanel}
            contentStyle={
              styles.filtersContent
            }
          >
            <View style={styles.filtersHeader}>
              <Pressable
                accessibilityRole="button"
                onPress={clearFilters}
                style={({ pressed }) => [
                  styles.clearButton,
                  pressed && styles.pressed,
                ]}
              >
                <Text
                  style={
                    styles.clearButtonText
                  }
                >
                  پاک کردن همه
                </Text>
              </Pressable>

              <View
                style={styles.filtersTitleCopy}
              >
                <Text
                  style={styles.filtersTitle}
                >
                  فیلترها
                </Text>

                <Text
                  style={
                    styles.filtersSubtitle
                  }
                >
                  نتایج را دقیق‌تر کنید.
                </Text>
              </View>
            </View>

            <View
              style={styles.filterOptions}
            >
              <FilterToggle
                icon="flash-outline"
                title="امروز آمادهٔ کار"
                subtitle="فقط ارائه‌دهندگان فعال امروز"
                selected={
                  filters.availableToday
                }
                onPress={() =>
                  toggleFilter(
                    "availableToday",
                  )
                }
              />

              <FilterToggle
                icon="shield-checkmark-outline"
                title="حساب تأییدشده"
                subtitle="هویت و معلومات بررسی‌شده"
                selected={
                  filters.verifiedOnly
                }
                onPress={() =>
                  toggleFilter(
                    "verifiedOnly",
                  )
                }
              />

              <FilterToggle
                icon="alert-circle-outline"
                title="پذیرش درخواست فوری"
                subtitle="مناسب برای خدمات فوری"
                selected={
                  filters.urgentOnly
                }
                onPress={() =>
                  toggleFilter("urgentOnly")
                }
              />

              <FilterToggle
                icon="calendar-outline"
                title="رزرو فوری"
                subtitle="بدون انتظار برای هماهنگی اولیه"
                selected={
                  filters.instantBookingOnly
                }
                onPress={() =>
                  toggleFilter(
                    "instantBookingOnly",
                  )
                }
              />
            </View>
          </GlassSurface>
        ) : null}

        <View style={styles.sortSection}>
          <View style={styles.sortHeader}>
            <Text style={styles.sortTitle}>
              مرتب‌سازی
            </Text>

            <Ionicons
              name="swap-vertical-outline"
              size={18}
              color={Colors.primary}
            />
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={
              styles.sortRow
            }
          >
            {sortOptions.map((option) => {
              const selected =
                selectedSort === option.id;

              return (
                <Pressable
                  key={option.id}
                  accessibilityRole="button"
                  accessibilityState={{
                    selected,
                  }}
                  onPress={() =>
                    setSelectedSort(option.id)
                  }
                  style={({ pressed }) => [
                    styles.sortPressable,
                    pressed &&
                      styles.pressed,
                  ]}
                >
                  <View
                    style={[
                      styles.sortOption,
                      selected &&
                        styles.selectedSortOption,
                    ]}
                  >
                    <Ionicons
                      name={option.icon}
                      size={15}
                      color={
                        selected
                          ? Colors.primary
                          : Colors.textTertiary
                      }
                    />

                    <Text
                      style={[
                        styles.sortOptionText,
                        selected &&
                          styles.selectedSortOptionText,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        <View style={styles.resultsHeader}>
          <Text style={styles.resultsCount}>
            {toDariDigits(
              filteredProviders.length.toString(),
            )}{" "}
            نتیجه
          </Text>

          <View
            style={styles.resultsTitleRow}
          >
            <Text style={styles.resultsTitle}>
              ارائه‌دهندگان
            </Text>

            <Ionicons
              name="people-outline"
              size={19}
              color={Colors.primary}
            />
          </View>
        </View>

        <View style={styles.results}>
          {filteredProviders.map(
            (provider) => (
              <ProviderResultCard
                key={provider.id}
                provider={provider}
                onPress={() =>
                  openProvider(provider.id)
                }
              />
            ),
          )}

          {filteredProviders.length ===
          0 ? (
            <EmptyResults
              onClear={clearFilters}
            />
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function FilterToggle({
  icon,
  title,
  subtitle,
  selected,
  onPress,
}: {
  icon: IconName;
  title: string;
  subtitle: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityLabel={title}
      accessibilityState={{
        checked: selected,
      }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.filterTogglePressable,
        pressed && styles.cardPressed,
      ]}
    >
      <GlassSurface
        variant={
          selected ? "prominent" : "regular"
        }
        radius={Radius.lg}
        style={[
          styles.filterToggleSurface,
          selected &&
            styles.selectedFilterToggle,
        ]}
        contentStyle={
          styles.filterToggleContent
        }
      >
        <View
          style={[
            styles.filterToggleIcon,
            selected &&
              styles.selectedFilterToggleIcon,
          ]}
        >
          <Ionicons
            name={icon}
            size={20}
            color={
              selected
                ? Colors.white
                : Colors.textSecondary
            }
          />
        </View>

        <View
          style={styles.filterToggleCopy}
        >
          <Text
            style={styles.filterToggleTitle}
          >
            {title}
          </Text>

          <Text
            style={
              styles.filterToggleSubtitle
            }
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
            ]}
          />
        </View>
      </GlassSurface>
    </Pressable>
  );
}

function ProviderResultCard({
  provider,
  onPress,
}: {
  provider: ProviderProfile;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={provider.name}
      onPress={onPress}
      style={({ pressed }) => [
        styles.providerPressable,
        pressed && styles.cardPressed,
      ]}
    >
      <GlassSurface
        variant="regular"
        radius={Radius.xl}
        style={styles.providerSurface}
        contentStyle={
          styles.providerContent
        }
      >
        <View style={styles.providerHeader}>
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
                  size={11}
                  color={Colors.white}
                />
              </View>
            ) : null}
          </View>

          <View
            style={styles.providerMainCopy}
          >
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
                  size={16}
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

            <View
              style={styles.providerLocationRow}
            >
              <Ionicons
                name="location-outline"
                size={14}
                color={Colors.textTertiary}
              />

              <Text
                numberOfLines={1}
                style={
                  styles.providerLocation
                }
              >
                {provider.locationLabel}
              </Text>

              <Text
                style={styles.distanceText}
              >
                ·{" "}
                {toDariDigits(
                  provider.distanceKm.toFixed(
                    1,
                  ),
                )}{" "}
                کیلومتر
              </Text>
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
              style={styles.availabilityText}
            >
              {provider.availableToday
                ? "آماده"
                : "مصروف"}
            </Text>
          </View>
        </View>

        <View style={styles.badgesRow}>
          {provider.instantBooking ? (
            <ProviderBadge
              icon="calendar-outline"
              label="رزرو فوری"
              color={Colors.primary}
              backgroundColor={
                Colors.primarySoft
              }
            />
          ) : null}

          {provider.acceptsUrgentRequests ? (
            <ProviderBadge
              icon="flash-outline"
              label="خدمت فوری"
              color={Colors.warning}
              backgroundColor="rgba(217, 154, 43, 0.12)"
            />
          ) : null}

          <ProviderBadge
            icon="cash-outline"
            label={`از ${formatCurrency(
              provider.minimumPrice,
            )}`}
            color={Colors.success}
            backgroundColor="rgba(48, 183, 106, 0.11)"
          />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={
            styles.servicesRow
          }
        >
          {provider.services
            .slice(0, 4)
            .map((service) => (
              <View
                key={service.id}
                style={styles.serviceChip}
              >
                <Text
                  style={
                    styles.serviceChipText
                  }
                >
                  {service.title}
                </Text>
              </View>
            ))}
        </ScrollView>

        <View
          style={styles.providerDivider}
        />

        <View style={styles.providerFooter}>
          <View style={styles.providerStats}>
            <View style={styles.statItem}>
              <Text style={styles.statText}>
                {toDariDigits(
                  provider.rating.toFixed(1),
                )}
              </Text>

              <Ionicons
                name="star"
                size={15}
                color={Colors.warning}
              />

              <Text
                style={styles.reviewText}
              >
                (
                {toDariDigits(
                  provider.reviewCount.toString(),
                )}
                )
              </Text>
            </View>

            <View style={styles.statItem}>
              <Ionicons
                name="briefcase-outline"
                size={15}
                color={Colors.textTertiary}
              />

              <Text style={styles.statText}>
                {toDariDigits(
                  provider.completedJobs.toString(),
                )}{" "}
                کار
              </Text>
            </View>

            <View style={styles.statItem}>
              <Ionicons
                name="chatbubble-outline"
                size={15}
                color={Colors.textTertiary}
              />

              <Text style={styles.statText}>
                پاسخ در{" "}
                {toDariDigits(
                  provider.averageResponseMinutes.toString(),
                )}{" "}
                دقیقه
              </Text>
            </View>
          </View>

          <View style={styles.viewProfile}>
            <Ionicons
              name="chevron-back"
              size={16}
              color={Colors.primary}
            />

            <Text
              style={
                styles.viewProfileText
              }
            >
              مشاهده
            </Text>
          </View>
        </View>
      </GlassSurface>
    </Pressable>
  );
}

function ProviderBadge({
  icon,
  label,
  color,
  backgroundColor,
}: {
  icon: IconName;
  label: string;
  color: string;
  backgroundColor: string;
}) {
  return (
    <View
      style={[
        styles.providerBadge,
        { backgroundColor },
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
          { color },
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

function EmptyResults({
  onClear,
}: {
  onClear: () => void;
}) {
  return (
    <View style={styles.emptyState}>
      <GlassSurface
        variant="regular"
        radius={Radius.xxl}
        style={styles.emptyIconSurface}
        contentStyle={
          styles.emptyIconContent
        }
      >
        <Ionicons
          name="search-outline"
          size={32}
          color={Colors.textTertiary}
        />
      </GlassSurface>

      <Text style={styles.emptyTitle}>
        نتیجه‌ای پیدا نشد
      </Text>

      <Text style={styles.emptySubtitle}>
        عبارت جستجو، دسته‌بندی یا فیلترهای
        انتخاب‌شده را تغییر دهید.
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
          style={styles.emptyActionText}
        >
          پاک کردن فیلترها
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
    Math.min(provider.reviewCount, 100) *
      0.2 +
    Math.min(
      provider.completedJobs,
      200,
    ) *
      0.08 +
    provider.responseRate * 0.15 +
    (provider.verified ? 15 : 0) +
    (provider.availableToday ? 12 : 0) +
    (provider.instantBooking ? 8 : 0) -
    provider.distanceKm * 1.5
  );
}

function formatCurrency(
  amount: number,
): string {
  return `${new Intl.NumberFormat(
    "fa-AF",
  ).format(amount)} افغانی`;
}

function getSingleParam(
  value: string | string[] | undefined,
): string {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
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
    paddingTop: Spacing.lg,
    paddingBottom: 130,
  },

  header: {
    width: "100%",
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

  searchRow: {
    width: "100%",
    marginTop: Spacing.xxl,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: Spacing.sm,
  },

  searchSurface: {
    flex: 1,
  },

  searchContent: {
    minHeight: Layout.controlHeight,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },

  searchInput: {
    flex: 1,
    minHeight: Layout.controlHeight,
    paddingVertical: 0,
    ...Typography.bodyStyle,
    color: Colors.textPrimary,
    textAlign: "right",
    writingDirection: "rtl",
  },

  filterPressable: {
    width: Layout.controlHeight,
    height: Layout.controlHeight,
    borderRadius: Radius.xl,
  },

  filterSurface: {
    flex: 1,
  },

  activeFilterSurface: {
    borderColor:
      "rgba(76, 141, 255, 0.48)",
    backgroundColor:
      "rgba(76, 141, 255, 0.10)",
  },

  filterContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  filterCount: {
    position: "absolute",
    top: 6,
    right: 6,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primary,
  },

  filterCountText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: "700",
  },

  categoriesScroll: {
    marginTop: Spacing.lg,
  },

  categoryRow: {
    flexDirection: "row-reverse",
    gap: Spacing.sm,
    paddingHorizontal: 1,
  },

  categoryPressable: {
    borderRadius: Radius.pill,
  },

  categorySurface: {
    minHeight: 42,
  },

  selectedCategorySurface: {
    borderColor:
      "rgba(76, 141, 255, 0.50)",
    backgroundColor:
      Colors.primarySoft,
  },

  categoryContent: {
    minHeight: 42,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 7,
    paddingHorizontal: Spacing.md,
  },

  categoryText: {
    ...Typography.captionStyle,
    color: Colors.textSecondary,
    writingDirection: "rtl",
  },

  selectedCategoryText: {
    color: Colors.textPrimary,
    fontWeight: "600",
  },

  filtersPanel: {
    width: "100%",
    marginTop: Spacing.lg,
  },

  filtersContent: {
    padding: Spacing.lg,
    gap: Spacing.md,
  },

  filtersHeader: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  filtersTitleCopy: {
    alignItems: "flex-end",
    gap: 2,
  },

  filtersTitle: {
    ...Typography.sectionTitle,
    color: Colors.textPrimary,
    textAlign: "right",
    writingDirection: "rtl",
    fontSize: 19,
    lineHeight: 25,
  },

  filtersSubtitle: {
    ...Typography.captionStyle,
    color: Colors.textTertiary,
    textAlign: "right",
    writingDirection: "rtl",
  },

  clearButton: {
    minHeight: 36,
    justifyContent: "center",
  },

  clearButtonText: {
    ...Typography.captionStyle,
    color: Colors.primary,
    writingDirection: "rtl",
  },

  filterOptions: {
    gap: Spacing.sm,
  },

  filterTogglePressable: {
    width: "100%",
    borderRadius: Radius.lg,
  },

  filterToggleSurface: {
    width: "100%",
  },

  selectedFilterToggle: {
    borderColor:
      "rgba(76, 141, 255, 0.42)",
    backgroundColor:
      "rgba(76, 141, 255, 0.08)",
  },

  filterToggleContent: {
    minHeight: 76,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: Spacing.md,
    padding: Spacing.md,
  },

  filterToggleIcon: {
    width: 42,
    height: 42,
    flexShrink: 0,
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.glass,
  },

  selectedFilterToggleIcon: {
    backgroundColor: Colors.primary,
  },

  filterToggleCopy: {
    flex: 1,
    alignItems: "flex-end",
    gap: 2,
  },

  filterToggleTitle: {
    ...Typography.label,
    width: "100%",
    color: Colors.textPrimary,
    textAlign: "right",
    writingDirection: "rtl",
  },

  filterToggleSubtitle: {
    ...Typography.captionStyle,
    width: "100%",
    color: Colors.textTertiary,
    textAlign: "right",
    writingDirection: "rtl",
  },

  switchTrack: {
    width: 44,
    height: 26,
    flexShrink: 0,
    borderRadius: Radius.pill,
    justifyContent: "center",
    paddingHorizontal: 3,
    backgroundColor: Colors.glassStrong,
    borderWidth:
      StyleSheet.hairlineWidth,
    borderColor: Colors.borderStrong,
  },

  switchTrackSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },

  switchThumb: {
    width: 20,
    height: 20,
    borderRadius: Radius.pill,
    backgroundColor: Colors.textTertiary,
  },

  switchThumbSelected: {
    alignSelf: "flex-end",
    backgroundColor: Colors.white,
  },

  sortSection: {
    width: "100%",
    marginTop: Spacing.xl,
    gap: Spacing.sm,
  },

  sortHeader: {
    width: "100%",
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: Spacing.sm,
  },

  sortTitle: {
    ...Typography.label,
    color: Colors.textSecondary,
    textAlign: "right",
    writingDirection: "rtl",
  },

  sortRow: {
    flexDirection: "row-reverse",
    gap: Spacing.sm,
  },

  sortPressable: {
    borderRadius: Radius.pill,
  },

  sortOption: {
    minHeight: 36,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.pill,
    borderWidth:
      StyleSheet.hairlineWidth,
    borderColor: Colors.border,
    backgroundColor: Colors.glass,
  },

  selectedSortOption: {
    borderColor:
      "rgba(76, 141, 255, 0.38)",
    backgroundColor:
      Colors.primarySoft,
  },

  sortOptionText: {
    ...Typography.captionStyle,
    color: Colors.textTertiary,
    writingDirection: "rtl",
  },

  selectedSortOptionText: {
    color: Colors.primary,
    fontWeight: "600",
  },

  resultsHeader: {
    width: "100%",
    marginTop: Spacing.section,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  resultsCount: {
    ...Typography.captionStyle,
    color: Colors.textTertiary,
    writingDirection: "rtl",
  },

  resultsTitleRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: Spacing.sm,
  },

  resultsTitle: {
    ...Typography.sectionTitle,
    color: Colors.textPrimary,
    textAlign: "right",
    writingDirection: "rtl",
    fontSize: 21,
    lineHeight: 28,
  },

  results: {
    width: "100%",
    marginTop: Spacing.lg,
    gap: Spacing.md,
  },

  providerPressable: {
    width: "100%",
    borderRadius: Radius.xl,
  },

  providerSurface: {
    width: "100%",
  },

  providerContent: {
    padding: Spacing.lg,
  },

  providerHeader: {
    width: "100%",
    flexDirection: "row-reverse",
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

  providerMainCopy: {
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

  providerLocationRow: {
    width: "100%",
    marginTop: 2,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 4,
  },

  providerLocation: {
    ...Typography.captionStyle,
    maxWidth: 155,
    color: Colors.textTertiary,
    textAlign: "right",
    writingDirection: "rtl",
  },

  distanceText: {
    ...Typography.captionStyle,
    color: Colors.textMuted,
    writingDirection: "rtl",
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

  badgesRow: {
    width: "100%",
    marginTop: Spacing.md,
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },

  providerBadge: {
    minHeight: 28,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: Spacing.sm,
    borderRadius: Radius.pill,
  },

  providerBadgeText: {
    ...Typography.captionStyle,
    fontSize: 10,
    writingDirection: "rtl",
  },

  servicesRow: {
    marginTop: Spacing.md,
    flexDirection: "row-reverse",
    gap: Spacing.sm,
  },

  serviceChip: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: Radius.pill,
    backgroundColor: Colors.glass,
    borderWidth:
      StyleSheet.hairlineWidth,
    borderColor: Colors.border,
  },

  serviceChipText: {
    ...Typography.captionStyle,
    color: Colors.textSecondary,
    fontSize: 11,
    writingDirection: "rtl",
  },

  providerDivider: {
    width: "100%",
    height:
      StyleSheet.hairlineWidth,
    marginVertical: Spacing.md,
    backgroundColor: Colors.separator,
  },

  providerFooter: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.md,
  },

  providerStats: {
    flex: 1,
    flexDirection: "row-reverse",
    alignItems: "center",
    flexWrap: "wrap",
    gap: Spacing.md,
  },

  statItem: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 4,
  },

  statText: {
    ...Typography.captionStyle,
    color: Colors.textSecondary,
    writingDirection: "rtl",
    fontSize: 11,
  },

  reviewText: {
    ...Typography.captionStyle,
    color: Colors.textTertiary,
    fontSize: 11,
  },

  viewProfile: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },

  viewProfileText: {
    ...Typography.captionStyle,
    color: Colors.primary,
    writingDirection: "rtl",
  },

  emptyState: {
    minHeight: 340,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.md,
    paddingHorizontal: Spacing.xl,
  },

  emptyIconSurface: {
    width: 78,
    height: 78,
  },

  emptyIconContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  emptyTitle: {
    ...Typography.sectionTitle,
    color: Colors.textPrimary,
    textAlign: "center",
    writingDirection: "rtl",
  },

  emptySubtitle: {
    ...Typography.bodyStyle,
    maxWidth: 340,
    color: Colors.textSecondary,
    textAlign: "center",
    writingDirection: "rtl",
  },

  emptyAction: {
    minHeight: 42,
    paddingHorizontal: Spacing.lg,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: Radius.pill,
    backgroundColor:
      Colors.primarySoft,
  },

  emptyActionText: {
    ...Typography.label,
    color: Colors.primary,
    writingDirection: "rtl",
  },

  pressed: {
    opacity: 0.82,
  },

  cardPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.993 }],
  },
});