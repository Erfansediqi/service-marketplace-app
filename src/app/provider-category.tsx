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
} from "../constants/theme";
import { useLanguage } from "../context/languagecontext";
import {
  ServiceProfession,
  serviceProfessions,
} from "../data/service-professions";

type IconName =
  ComponentProps<typeof Ionicons>["name"];

type LanguageName =
  | "English"
  | "Dari"
  | "Pashto";

type CategoryDisplay = {
  name: string;
  description: string;
  secondaryName?: string;
};

type CategoryCardProps = {
  category: ServiceProfession;
  selected: boolean;
  language: LanguageName;
  isRtl: boolean;
  onPress: () => void;
};

const TOTAL_STEPS = 6;
const CURRENT_STEP = 1;

export default function ProviderCategoryScreen() {
  const router = useRouter();
  const { language } = useLanguage();

  const activeLanguage =
    normalizeLanguage(language);

  const isRtl =
    activeLanguage === "Dari" ||
    activeLanguage === "Pashto";

  const localizedDigits =
    activeLanguage !== "English";

  const copy =
    getCategoryCopy(activeLanguage);

  const [query, setQuery] =
    useState("");

  const [
    selectedCategoryId,
    setSelectedCategoryId,
  ] = useState<string | null>(
    null,
  );

  const normalizedQuery =
    query.trim().toLocaleLowerCase();

  const filteredCategories =
    useMemo(() => {
      if (!normalizedQuery) {
        return serviceProfessions;
      }

      return serviceProfessions.filter(
        (category) => {
          const display =
            getCategoryDisplay(
              category,
              activeLanguage,
            );

          const searchableText = [
            category.nameFa,
            category.nameEn,
            category.descriptionFa,
            display.name,
            display.description,
          ]
            .filter(Boolean)
            .join(" ")
            .toLocaleLowerCase();

          return searchableText.includes(
            normalizedQuery,
          );
        },
      );
    }, [
      activeLanguage,
      normalizedQuery,
    ]);

  const selectedCategory =
    useMemo(
      () =>
        serviceProfessions.find(
          (category) =>
            category.id ===
            selectedCategoryId,
        ) ?? null,
      [selectedCategoryId],
    );

  const handleSelectCategory = (
    category: ServiceProfession,
  ) => {
    setSelectedCategoryId(
      category.id,
    );
  };

  const handleContinue = () => {
    if (!selectedCategory) {
      return;
    }

    router.push({
      pathname:
        "/provider-services",
      params: {
        category:
          selectedCategory.id,
      },
    } as never);
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
          keyboardShouldPersistTaps="handled"
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
                name="grid-outline"
                size={29}
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
                KhedmatPalette
                  .blue500
              }
            />

            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder={
                copy.searchPlaceholder
              }
              placeholderTextColor={
                KhedmatPalette
                  .textMuted
              }
              selectionColor={
                KhedmatPalette
                  .blue500
              }
              returnKeyType="search"
              autoCorrect={false}
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
                style={({ pressed }) => [
                  styles.clearButton,
                  pressed &&
                    styles.pressed,
                ]}
              >
                <Ionicons
                  name="close-circle"
                  size={20}
                  color={
                    KhedmatPalette
                      .textMuted
                  }
                />
              </Pressable>
            ) : null}
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
                styles.resultsCopy,
                {
                  alignItems: isRtl
                    ? "flex-end"
                    : "flex-start",
                },
              ]}
            >
              <Text
                style={[
                  styles.resultsTitle,
                  directionStyle(
                    isRtl,
                  ),
                ]}
              >
                {copy.categoriesTitle}
              </Text>

              <Text
                style={[
                  styles.resultsSubtitle,
                  directionStyle(
                    isRtl,
                  ),
                ]}
              >
                {copy.resultCount(
                  formatDigits(
                    filteredCategories.length.toString(),
                    localizedDigits,
                  ),
                )}
              </Text>
            </View>

            {selectedCategory ? (
              <View
                style={[
                  styles.selectedSummary,
                  {
                    flexDirection: isRtl
                      ? "row-reverse"
                      : "row",
                  },
                ]}
              >
                <Ionicons
                  name="checkmark-circle"
                  size={16}
                  color={
                    KhedmatPalette
                      .blue500
                  }
                />

                <Text
                  numberOfLines={1}
                  style={[
                    styles.selectedSummaryText,
                    directionStyle(
                      isRtl,
                    ),
                  ]}
                >
                  {copy.selected}
                </Text>
              </View>
            ) : null}
          </View>

          <View
            style={styles.categories}
          >
            {filteredCategories.map(
              (category) => (
                <CategoryCard
                  key={category.id}
                  category={category}
                  selected={
                    selectedCategoryId ===
                    category.id
                  }
                  language={
                    activeLanguage
                  }
                  isRtl={isRtl}
                  onPress={() =>
                    handleSelectCategory(
                      category,
                    )
                  }
                />
              ),
            )}

            {filteredCategories.length ===
            0 ? (
              <EmptyCategories
                copy={copy}
                isRtl={isRtl}
                onClear={() =>
                  setQuery("")
                }
              />
            ) : null}
          </View>

          <View
            style={[
              styles.guidanceCard,
              {
                flexDirection: isRtl
                  ? "row-reverse"
                  : "row",
              },
            ]}
          >
            <View
              style={
                styles.guidanceIcon
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
                styles.guidanceCopy,
                {
                  alignItems: isRtl
                    ? "flex-end"
                    : "flex-start",
                },
              ]}
            >
              <Text
                style={[
                  styles.guidanceTitle,
                  directionStyle(
                    isRtl,
                  ),
                ]}
              >
                {copy.guidanceTitle}
              </Text>

              <Text
                style={[
                  styles.guidanceText,
                  directionStyle(
                    isRtl,
                  ),
                ]}
              >
                {copy.guidanceText}
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
                copy.continue
              }
              accessibilityState={{
                disabled:
                  !selectedCategory,
              }}
              disabled={
                !selectedCategory
              }
              onPress={
                handleContinue
              }
              style={({ pressed }) => [
                styles.primaryButton,
                !selectedCategory &&
                  styles.primaryButtonDisabled,
                pressed &&
                  selectedCategory &&
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
                <Text
                  style={[
                    styles.primaryButtonText,
                    directionStyle(
                      isRtl,
                    ),
                  ]}
                >
                  {selectedCategory
                    ? copy.continue
                    : copy.selectCategory}
                </Text>

                {selectedCategory ? (
                  <Ionicons
                    name={
                      isRtl
                        ? "arrow-back"
                        : "arrow-forward"
                    }
                    size={20}
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
                styles.helperText,
                directionStyle(isRtl),
              ]}
            >
              {copy.helperText}
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

function CategoryCard({
  category,
  selected,
  language,
  isRtl,
  onPress,
}: CategoryCardProps) {
  const display =
    getCategoryDisplay(
      category,
      language,
    );

  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityLabel={
        display.name
      }
      accessibilityState={{
        selected,
      }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.categoryCard,
        selected &&
          styles.categoryCardSelected,
        pressed &&
          styles.categoryCardPressed,
      ]}
    >
      <View
        style={[
          styles.categoryContent,
          {
            flexDirection: isRtl
              ? "row-reverse"
              : "row",
          },
        ]}
      >
        <View
          style={[
            styles.categoryIcon,
            selected &&
              styles.categoryIconSelected,
          ]}
        >
          <Ionicons
            name={
              category.icon as IconName
            }
            size={25}
            color={
              selected
                ? KhedmatPalette.white
                : KhedmatPalette
                    .blue500
            }
          />
        </View>

        <View
          style={[
            styles.categoryCopy,
            {
              alignItems: isRtl
                ? "flex-end"
                : "flex-start",
            },
          ]}
        >
          <Text
            style={[
              styles.categoryTitle,
              selected &&
                styles.categoryTitleSelected,
              directionStyle(isRtl),
            ]}
          >
            {display.name}
          </Text>

          <Text
            numberOfLines={3}
            style={[
              styles.categoryDescription,
              directionStyle(isRtl),
            ]}
          >
            {display.description}
          </Text>

          {display.secondaryName ? (
            <Text
              numberOfLines={1}
              style={[
                styles.categorySecondaryName,
                directionStyle(
                  isRtl,
                ),
              ]}
            >
              {
                display.secondaryName
              }
            </Text>
          ) : null}
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

type EmptyCategoriesProps = {
  copy: ReturnType<
    typeof getCategoryCopy
  >;
  isRtl: boolean;
  onClear: () => void;
};

function EmptyCategories({
  copy,
  isRtl,
  onClear,
}: EmptyCategoriesProps) {
  return (
    <View style={styles.emptyState}>
      <View
        style={
          styles.emptyIcon
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
        {copy.emptyTitle}
      </Text>

      <Text
        style={[
          styles.emptySubtitle,
          directionStyle(isRtl),
        ]}
      >
        {copy.emptySubtitle}
      </Text>

      <Pressable
        accessibilityRole="button"
        onPress={onClear}
        style={({ pressed }) => [
          styles.emptyButton,
          pressed &&
            styles.pressed,
        ]}
      >
        <Text
          style={[
            styles.emptyButtonText,
            directionStyle(isRtl),
          ]}
        >
          {copy.clearSearch}
        </Text>
      </Pressable>
    </View>
  );
}

function getCategoryDisplay(
  category: ServiceProfession,
  language: LanguageName,
): CategoryDisplay {
  if (language === "English") {
    return {
      name:
        category.nameEn,
      description:
        category.descriptionFa,
      secondaryName:
        category.nameFa,
    };
  }

  if (language === "Pashto") {
    return {
      name:
        category.nameFa,
      description:
        category.descriptionFa,
      secondaryName:
        category.nameEn,
    };
  }

  return {
    name: category.nameFa,
    description:
      category.descriptionFa,
    secondaryName:
      category.nameEn,
  };
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

function getCategoryCopy(
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

      eyebrow: "نوع فعالیت",

      title:
        "در کدام بخش خدمات ارائه می‌کنید؟",

      subtitle:
        "یک بخش اصلی را انتخاب کنید. در مرحلهٔ بعد، خدمات مشخص مربوط به همان بخش را انتخاب خواهید کرد.",

      searchPlaceholder:
        "جستجوی بخش خدمات",

      clearSearch:
        "پاک کردن جستجو",

      categoriesTitle:
        "بخش‌های خدمات",

      resultCount:
        (value: string) =>
          `${value} بخش موجود`,

      selected: "انتخاب‌شده",

      guidanceTitle:
        "یک بخش اصلی انتخاب کنید",

      guidanceText:
        "بعداً می‌توانید خدمات دقیق و قیمت‌های مربوط به این بخش را تنظیم کنید.",

      continue:
        "ادامه به انتخاب خدمات",

      selectCategory:
        "ابتدا یک بخش را انتخاب کنید",

      helperText:
        "در مرحلهٔ بعد، خدمات مشخص این بخش را انتخاب می‌کنید.",

      emptyTitle:
        "بخشی پیدا نشد",

      emptySubtitle:
        "عبارت دیگری را جستجو کنید یا جستجو را پاک نمایید.",
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
        "د فعالیت ډول",

      title:
        "تاسو په کومه برخه کې خدمتونه وړاندې کوئ؟",

      subtitle:
        "یوه اصلي برخه وټاکئ. په راتلونکې مرحله کې به د همدې برخې مشخص خدمتونه انتخاب کړئ.",

      searchPlaceholder:
        "د خدمتونو برخه ولټوئ",

      clearSearch:
        "لټون پاک کړئ",

      categoriesTitle:
        "د خدمتونو برخې",

      resultCount:
        (value: string) =>
          `${value} برخې شته`,

      selected: "ټاکل شوې",

      guidanceTitle:
        "یوه اصلي برخه وټاکئ",

      guidanceText:
        "وروسته کولی شئ د همدې برخې مشخص خدمتونه او بیې تنظیم کړئ.",

      continue:
        "د خدمتونو ټاکلو ته دوام",

      selectCategory:
        "لومړی یوه برخه وټاکئ",

      helperText:
        "په راتلونکې مرحله کې به د دې برخې مشخص خدمتونه وټاکئ.",

      emptyTitle:
        "کومه برخه ونه موندل شوه",

      emptySubtitle:
        "بل عبارت ولټوئ یا لټون پاک کړئ.",
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
      "Type of work",

    title:
      "Which service category do you work in?",

    subtitle:
      "Choose one primary category. On the next step, you will select the specific services you provide.",

    searchPlaceholder:
      "Search service categories",

    clearSearch:
      "Clear search",

    categoriesTitle:
      "Service categories",

    resultCount:
      (value: string) =>
        `${value} categories available`,

    selected: "Selected",

    guidanceTitle:
      "Choose one primary category",

    guidanceText:
      "You can configure the specific services and prices within this category on the following steps.",

    continue:
      "Continue to services",

    selectCategory:
      "Select a category first",

    helperText:
      "On the next step, you will select the specific services in this category.",

    emptyTitle:
      "No category found",

    emptySubtitle:
      "Try another search phrase or clear the current search.",
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
    paddingBottom: 150,
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
    paddingHorizontal: Spacing.md,
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

  searchBox: {
    width: "100%",
    minHeight:
      Layout.controlHeight,
    marginTop: Spacing.xxl,
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

  clearButton: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
  },

  resultsHeader: {
    width: "100%",
    marginTop: Spacing.xl,
    alignItems: "center",
    justifyContent:
      "space-between",
    gap: Spacing.md,
  },

  resultsCopy: {
    flex: 1,
    gap: 2,
  },

  resultsTitle: {
    ...Typography.sectionTitle,
    width: "100%",
    color:
      KhedmatPalette.textPrimary,
    fontSize: 20,
    lineHeight: 27,
  },

  resultsSubtitle: {
    ...Typography.captionStyle,
    width: "100%",
    color:
      KhedmatPalette.textMuted,
  },

  selectedSummary: {
    maxWidth: 118,
    minHeight: 35,
    paddingHorizontal: Spacing.sm,
    alignItems: "center",
    gap: 5,
    borderRadius: Radius.pill,
    backgroundColor:
      KhedmatPalette.surface,
    borderWidth: 1,
    borderColor:
      KhedmatPalette.blue200,
  },

  selectedSummaryText: {
    ...Typography.captionStyle,
    flexShrink: 1,
    color:
      KhedmatPalette.blue500,
    fontFamily: Fonts.medium,
  },

  categories: {
    width: "100%",
    marginTop: Spacing.md,
    gap: Spacing.md,
  },

  categoryCard: {
    width: "100%",
    minHeight: 118,
    borderWidth: 1,
    borderColor:
      KhedmatPalette.border,
    borderRadius: Radius.xl,
    backgroundColor:
      KhedmatPalette.surface,
    ...Shadows.small,
  },

  categoryCardSelected: {
    borderColor:
      KhedmatPalette.blue500,
    backgroundColor: "#F4FBFC",
  },

  categoryCardPressed: {
    opacity: 0.88,
    transform: [
      {
        scale: 0.993,
      },
    ],
  },

  categoryContent: {
    width: "100%",
    minHeight: 118,
    padding: Spacing.lg,
    alignItems: "center",
    gap: Spacing.md,
  },

  categoryIcon: {
    width: 54,
    height: 54,
    flexShrink: 0,
    borderRadius: Radius.lg,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      KhedmatPalette.surfaceSoft,
  },

  categoryIconSelected: {
    backgroundColor:
      KhedmatPalette.blue500,
  },

  categoryCopy: {
    flex: 1,
    gap: 3,
  },

  categoryTitle: {
    ...Typography.label,
    width: "100%",
    color:
      KhedmatPalette.textPrimary,
    fontSize: 17,
    lineHeight: 23,
  },

  categoryTitleSelected: {
    color:
      KhedmatPalette.navy900,
    fontFamily: Fonts.bold,
  },

  categoryDescription: {
    ...Typography.bodyStyle,
    width: "100%",
    color:
      KhedmatPalette.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },

  categorySecondaryName: {
    ...Typography.captionStyle,
    width: "100%",
    color:
      KhedmatPalette.textMuted,
    fontSize: 11,
  },

  radioOuter: {
    width: 24,
    height: 24,
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
    width: 12,
    height: 12,
    borderRadius: Radius.pill,
    backgroundColor:
      KhedmatPalette.blue500,
  },

  guidanceCard: {
    width: "100%",
    minHeight: 100,
    marginTop: Spacing.xl,
    padding: Spacing.lg,
    alignItems: "flex-start",
    gap: Spacing.md,
    borderWidth: 1,
    borderColor:
      KhedmatPalette.blue200,
    borderRadius: Radius.xl,
    backgroundColor: "#F4FBFC",
  },

  guidanceIcon: {
    width: 44,
    height: 44,
    flexShrink: 0,
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      KhedmatPalette.surface,
  },

  guidanceCopy: {
    flex: 1,
    gap: 3,
  },

  guidanceTitle: {
    ...Typography.label,
    width: "100%",
    color:
      KhedmatPalette.textPrimary,
    fontSize: 15,
  },

  guidanceText: {
    ...Typography.captionStyle,
    width: "100%",
    color:
      KhedmatPalette.textSecondary,
    lineHeight: 19,
  },

  emptyState: {
    minHeight: 300,
    paddingHorizontal: Spacing.xl,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.md,
  },

  emptyIcon: {
    width: 76,
    height: 76,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor:
      KhedmatPalette.border,
    backgroundColor:
      KhedmatPalette.surface,
  },

  emptyTitle: {
    ...Typography.sectionTitle,
    color:
      KhedmatPalette.textPrimary,
    textAlign: "center",
  },

  emptySubtitle: {
    ...Typography.bodyStyle,
    maxWidth: 350,
    color:
      KhedmatPalette.textSecondary,
    textAlign: "center",
  },

  emptyButton: {
    minHeight: 44,
    paddingHorizontal: Spacing.lg,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: Radius.pill,
    backgroundColor:
      KhedmatPalette.navy900,
  },

  emptyButtonText: {
    ...Typography.label,
    color:
      KhedmatPalette.white,
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
    paddingHorizontal: Spacing.lg,
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
    color:
      KhedmatPalette.white,
    fontFamily: Fonts.medium,
    fontSize: 16,
    textAlign: "center",
  },

  helperText: {
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