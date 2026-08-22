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
  CategoryService,
  getServicesByCategory,
} from "../data/category-services";
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

type ServiceDisplay = {
  name: string;
  description?: string;
  secondaryName?: string;
};

type ServiceCardProps = {
  service: CategoryService;
  selected: boolean;
  limitReached: boolean;
  language: LanguageName;
  isRtl: boolean;
  onPress: () => void;
};

type ServicesCopy = ReturnType<
  typeof getServicesCopy
>;

const MAX_SERVICES = 8;
const CURRENT_STEP = 2;
const TOTAL_STEPS = 6;

export default function ProviderServicesScreen() {
  const router = useRouter();

  const params =
    useLocalSearchParams<{
      category?:
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
    getServicesCopy(
      activeLanguage,
    );

  const categoryId =
    Array.isArray(
      params.category,
    )
      ? params.category[0]
      : params.category ?? "";

  const [
    selectedServiceIds,
    setSelectedServiceIds,
  ] = useState<string[]>([]);

  const category = useMemo(
    () =>
      serviceProfessions.find(
        (item) =>
          item.id === categoryId,
      ) ?? null,
    [categoryId],
  );

  const services = useMemo(
    () =>
      getServicesByCategory(
        categoryId,
      ),
    [categoryId],
  );

  const categoryDisplay =
    getCategoryDisplay(
      category,
      activeLanguage,
      copy,
    );

  const selectedCount =
    selectedServiceIds.length;

  const limitReached =
    selectedCount >=
    MAX_SERVICES;

  const progressPercentage =
    Math.round(
      (selectedCount /
        MAX_SERVICES) *
        100,
    );

  const toggleService = (
    service: CategoryService,
  ) => {
    setSelectedServiceIds(
      (current) => {
        const selected =
          current.includes(
            service.id,
          );

        if (selected) {
          return current.filter(
            (id) =>
              id !== service.id,
          );
        }

        if (
          current.length >=
          MAX_SERVICES
        ) {
          return current;
        }

        return [
          ...current,
          service.id,
        ];
      },
    );
  };

  const clearSelection = () => {
    setSelectedServiceIds([]);
  };

  const handleContinue = () => {
    if (
      selectedServiceIds.length ===
      0
    ) {
      return;
    }

    router.push({
      pathname:
        "/provider-details",

      params: {
        category: categoryId,

        services:
          selectedServiceIds.join(
            ",",
          ),
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

          <View style={styles.header}>
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
          </View>

          <View
            style={
              styles.selectionCard
            }
          >
            <View
              style={[
                styles.selectionTopRow,
                {
                  flexDirection: isRtl
                    ? "row-reverse"
                    : "row",
                },
              ]}
            >
              <View
                style={[
                  styles.selectionIcon,
                  selectedCount > 0 &&
                    styles.selectionIconActive,
                ]}
              >
                <Ionicons
                  name={
                    selectedCount > 0
                      ? "checkmark-done-outline"
                      : "list-outline"
                  }
                  size={22}
                  color={
                    selectedCount > 0
                      ? KhedmatPalette
                          .white
                      : KhedmatPalette
                          .blue500
                  }
                />
              </View>

              <View
                style={[
                  styles.selectionCopy,
                  {
                    alignItems: isRtl
                      ? "flex-end"
                      : "flex-start",
                  },
                ]}
              >
                <Text
                  style={[
                    styles.selectionTitle,
                    directionStyle(
                      isRtl,
                    ),
                  ]}
                >
                  {copy.selectionCount(
                    formatDigits(
                      selectedCount.toString(),
                      localizedDigits,
                    ),

                    formatDigits(
                      MAX_SERVICES.toString(),
                      localizedDigits,
                    ),
                  )}
                </Text>


              </View>

              {selectedCount > 0 ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={
                    copy.clearSelection
                  }
                  onPress={
                    clearSelection
                  }
                  style={({
                    pressed,
                  }) => [
                    styles.clearSelectionButton,
                    pressed &&
                      styles.pressed,
                  ]}
                >
                  <Text
                    style={[
                      styles.clearSelectionText,
                      directionStyle(
                        isRtl,
                      ),
                    ]}
                  >
                    {copy.clear}
                  </Text>
                </Pressable>
              ) : null}
            </View>

            <View
              style={
                styles.progressTrack
              }
            >
              <View
                style={[
                  styles.progressFill,

                  {
                    width: `${progressPercentage}%`,
                  },
                ]}
              />
            </View>

            <View
              style={[
                styles.limitRow,
                {
                  flexDirection: isRtl
                    ? "row-reverse"
                    : "row",
                },
              ]}
            >
              <Text
                style={[
                  styles.limitLabel,
                  directionStyle(
                    isRtl,
                  ),
                ]}
              >
                {
                  copy.minimumSelection
                }
              </Text>

              <Text
                style={[
                  styles.limitValue,
                  directionStyle(
                    isRtl,
                  ),
                ]}
              >
                {copy.maximum(
                  formatDigits(
                    MAX_SERVICES.toString(),
                    localizedDigits,
                  ),
                )}
              </Text>
            </View>
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
                {
                  copy.availableServices
                }
              </Text>


            </View>

            <View
              style={
                styles.resultsIcon
              }
            >
              <Ionicons
                name="construct-outline"
                size={21}
                color={
                  KhedmatPalette
                    .blue500
                }
              />
            </View>
          </View>

          <View style={styles.services}>
            {services.map(
              (service) => {
                const selected =
                  selectedServiceIds.includes(
                    service.id,
                  );

                const disabled =
                  limitReached &&
                  !selected;

                return (
                  <ServiceCard
                    key={service.id}
                    service={service}
                    selected={
                      selected
                    }
                    limitReached={
                      disabled
                    }
                    language={
                      activeLanguage
                    }
                    isRtl={isRtl}
                    onPress={() =>
                      toggleService(
                        service,
                      )
                    }
                  />
                );
              },
            )}

            {services.length === 0 ? (
              <EmptyServices
                copy={copy}
                isRtl={isRtl}
                onBack={() =>
                  router.back()
                }
              />
            ) : null}
          </View>

          {services.length > 0 ? (
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
                  name="bulb-outline"
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
                  {
                    copy.guidanceTitle
                  }
                </Text>

                <Text
                  style={[
                    styles.guidanceText,
                    directionStyle(
                      isRtl,
                    ),
                  ]}
                >
                  {
                    copy.guidanceText
                  }
                </Text>
              </View>
            </View>
          ) : null}
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
                  selectedCount === 0,
              }}
              disabled={
                selectedCount === 0
              }
              onPress={
                handleContinue
              }
              style={({ pressed }) => [
                styles.primaryButton,

                selectedCount === 0 &&
                  styles.primaryButtonDisabled,

                pressed &&
                  selectedCount > 0 &&
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
                  {selectedCount > 0
                    ? copy.continueWithServices(
                        formatDigits(
                          selectedCount.toString(),
                          localizedDigits,
                        ),
                      )
                    : copy.selectAtLeastOne}
                </Text>

                {selectedCount > 0 ? (
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
              {copy.helperText(
                formatDigits(
                  MAX_SERVICES.toString(),
                  localizedDigits,
                ),
              )}
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

function ServiceCard({
  service,
  selected,
  limitReached,
  language,
  isRtl,
  onPress,
}: ServiceCardProps) {
  const display =
    getServiceDisplay(
      service,
      language,
    );

  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityLabel={
        display.name
      }
      accessibilityState={{
        checked: selected,
        disabled: limitReached,
      }}
      disabled={limitReached}
      onPress={onPress}
      style={({ pressed }) => [
        styles.serviceCard,

        selected &&
          styles.serviceCardSelected,

        limitReached &&
          styles.serviceCardDisabled,

        pressed &&
          !limitReached &&
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
            styles.checkbox,

            selected &&
              styles.checkboxSelected,
          ]}
        >
          {selected ? (
            <Ionicons
              name="checkmark"
              size={18}
              color={
                KhedmatPalette.white
              }
            />
          ) : null}
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
            {display.name}
          </Text>

          {display.secondaryName ? (
            <Text
              numberOfLines={1}
              style={[
                styles.serviceSecondaryName,
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

          {display.description ? (
            <Text
              numberOfLines={3}
              style={[
                styles.serviceDescription,
                directionStyle(
                  isRtl,
                ),
              ]}
            >
              {display.description}
            </Text>
          ) : null}
        </View>

        <View
          style={[
            styles.serviceStateIcon,

            selected &&
              styles.serviceStateIconSelected,
          ]}
        >
          <Ionicons
            name={
              selected
                ? "checkmark-circle"
                : "add-circle-outline"
            }
            size={22}
            color={
              selected
                ? KhedmatPalette
                    .blue500
                : KhedmatPalette
                    .textMuted
            }
          />
        </View>
      </View>
    </Pressable>
  );
}

type EmptyServicesProps = {
  copy: ServicesCopy;
  isRtl: boolean;
  onBack: () => void;
};

function EmptyServices({
  copy,
  isRtl,
  onBack,
}: EmptyServicesProps) {
  return (
    <View style={styles.emptyState}>
      <View
        style={
          styles.emptyIcon
        }
      >
        <Ionicons
          name="alert-circle-outline"
          size={32}
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
        accessibilityLabel={
          copy.chooseAnotherCategory
        }
        onPress={onBack}
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
          {
            copy.chooseAnotherCategory
          }
        </Text>
      </Pressable>
    </View>
  );
}

function getCategoryDisplay(
  category:
    | ServiceProfession
    | null,
  language: LanguageName,
  copy: ServicesCopy,
) {
  if (!category) {
    return {
      name: copy.servicesFallback,
    };
  }

  if (language === "English") {
    return {
      name: category.nameEn,
    };
  }

  return {
    name: category.nameFa,
  };
}

function getServiceDisplay(
  service: CategoryService,
  language: LanguageName,
): ServiceDisplay {
  if (language === "English") {
    return {
      name: service.nameEn,

      secondaryName:
        service.nameFa,

      description:
        service.descriptionFa,
    };
  }

  if (language === "Pashto") {
    return {
      name: service.nameFa,

      secondaryName:
        service.nameEn,

      description:
        service.descriptionFa,
    };
  }

  return {
    name: service.nameFa,

    secondaryName:
      service.nameEn,

    description:
      service.descriptionFa,
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

function getServicesCopy(
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

      servicesFallback:
        "خدمات",

      title:
        "کدام خدمات را ارائه می‌کنید؟",

      subtitle:
        "تمام خدماتی را انتخاب کنید که تجربه، ابزار و توانایی انجام آن‌ها را دارید.",

      selectionCount:
        (
          selected: string,
          maximum: string,
        ) =>
          `${selected} از ${maximum} خدمت انتخاب‌شده`,

      selectionGuidance:
        "یک یا چند خدمت را انتخاب کنید.",

      limitReached:
        "به حداکثر تعداد مجاز رسیده‌اید.",

      clear: "پاک کردن",

      clearSelection:
        "پاک کردن انتخاب‌ها",

      minimumSelection:
        "حداقل یک خدمت",

      maximum:
        (value: string) =>
          `حداکثر ${value} خدمت`,

      availableServices:
        "خدمات موجود",

      servicesCount:
        (value: string) =>
          `${value} خدمت در این بخش`,

      guidanceTitle:
        "فقط خدمات واقعی خود را انتخاب کنید",

      guidanceText:
        "انتخاب دقیق خدمات باعث می‌شود درخواست‌های مرتبط‌تری دریافت کنید و مشتریان انتظار روشن‌تری داشته باشند.",

      continue:
        "ادامه",

      continueWithServices:
        (value: string) =>
          `ادامه با ${value} خدمت`,

      selectAtLeastOne:
        "حداقل یک خدمت انتخاب کنید",

      helperText:
        (value: string) =>
          `می‌توانید حداکثر ${value} خدمت انتخاب کنید.`,

      emptyTitle:
        "خدمات این بخش هنوز اضافه نشده‌اند",

      emptySubtitle:
        "به مرحلهٔ قبل بازگردید و یک بخش دیگر را انتخاب کنید.",

      chooseAnotherCategory:
        "انتخاب بخش دیگر",
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

      servicesFallback:
        "خدمتونه",

      title:
        "کوم خدمتونه وړاندې کوئ؟",

      subtitle:
        "ټول هغه خدمتونه وټاکئ چې تجربه، وسایل او د ترسره کولو وړتیا یې لرئ.",

      selectionCount:
        (
          selected: string,
          maximum: string,
        ) =>
          `${selected} له ${maximum} خدمتونو ټاکل شوي`,

      selectionGuidance:
        "یو یا څو خدمتونه وټاکئ.",

      limitReached:
        "تاسو اعظمي مجاز شمېر ته رسېدلي یاست.",

      clear: "پاکول",

      clearSelection:
        "ټاکنې پاکې کړئ",

      minimumSelection:
        "لږ تر لږه یو خدمت",

      maximum:
        (value: string) =>
          `تر ${value} خدمتونو پورې`,

      availableServices:
        "شته خدمتونه",

      servicesCount:
        (value: string) =>
          `په دې برخه کې ${value} خدمتونه`,

      guidanceTitle:
        "یوازې خپل حقیقي خدمتونه وټاکئ",

      guidanceText:
        "د خدمتونو دقیقه ټاکنه له تاسو سره مرسته کوي چې اړوندې غوښتنې ترلاسه کړئ او د پیرودونکو تمې روښانه وي.",

      continue: "دوام",

      continueWithServices:
        (value: string) =>
          `له ${value} خدمتونو سره دوام`,

      selectAtLeastOne:
        "لږ تر لږه یو خدمت وټاکئ",

      helperText:
        (value: string) =>
          `تاسو تر ${value} خدمتونو پورې ټاکلی شئ.`,

      emptyTitle:
        "د دې برخې خدمتونه لا نه دي زیات شوي",

      emptySubtitle:
        "مخکنۍ مرحلې ته لاړ شئ او بله برخه وټاکئ.",

      chooseAnotherCategory:
        "بله برخه وټاکئ",
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

    servicesFallback:
      "Services",

    title:
      "Which services do you provide?",

    subtitle:
      "Select every service you have the experience, tools and ability to complete professionally.",

    selectionCount:
      (
        selected: string,
        maximum: string,
      ) =>
        `${selected} of ${maximum} services selected`,

    selectionGuidance:
      "Select one or more services.",

    limitReached:
      "You have reached the maximum allowed selection.",

    clear: "Clear",

    clearSelection:
      "Clear selection",

    minimumSelection:
      "At least one service",

    maximum:
      (value: string) =>
        `Maximum ${value} services`,

    availableServices:
      "Available services",

    servicesCount:
      (value: string) =>
        `${value} services in this category`,

    guidanceTitle:
      "Choose only services you genuinely provide",

    guidanceText:
      "Accurate service selection helps you receive more relevant requests and gives customers clearer expectations.",

    continue: "Continue",

    continueWithServices:
      (value: string) =>
        `Continue with ${value} services`,

    selectAtLeastOne:
      "Select at least one service",

    helperText:
      (value: string) =>
        `You may select up to ${value} services.`,

    emptyTitle:
      "No services have been added to this category",

    emptySubtitle:
      "Return to the previous step and choose another category.",

    chooseAnotherCategory:
      "Choose another category",
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

    paddingBottom: 154,
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
      KhedmatPalette.white,
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

  title: {
    ...Typography.screenTitle,

    width: "100%",

    maxWidth: 470,

    color:
      KhedmatPalette.textPrimary,

    fontSize: 27,

    lineHeight: 35,
  },

  selectionCard: {
    width: "100%",

    marginTop: Spacing.xxl,

    padding: Spacing.lg,

    borderWidth: 1,

    borderColor:
      KhedmatPalette.blue200,

    borderRadius: Radius.xl,

    backgroundColor: "#F4FBFC",
  },

  selectionTopRow: {
    width: "100%",

    alignItems: "center",

    gap: Spacing.md,
  },

  selectionIcon: {
    width: 46,
    height: 46,

    flexShrink: 0,

    borderRadius: Radius.md,

    alignItems: "center",

    justifyContent: "center",

    backgroundColor:
      KhedmatPalette.surface,
  },

  selectionIconActive: {
    backgroundColor:
      KhedmatPalette.blue500,
  },

  selectionCopy: {
    flex: 1,

    gap: 2,
  },

  selectionTitle: {
    ...Typography.label,

    width: "100%",

    color:
      KhedmatPalette.textPrimary,

    fontSize: 16,

    lineHeight: 22,
  },

  clearSelectionButton: {
    minHeight: 36,

    flexShrink: 0,

    paddingHorizontal:
      Spacing.sm,

    alignItems: "center",

    justifyContent: "center",

    borderRadius: Radius.pill,

    backgroundColor:
      KhedmatPalette.surface,
  },

  clearSelectionText: {
    ...Typography.captionStyle,

    color:
      KhedmatPalette.blue500,

    fontFamily: Fonts.medium,
  },

  progressTrack: {
    width: "100%",

    height: 8,

    marginTop: Spacing.lg,

    overflow: "hidden",

    borderRadius: Radius.pill,

    backgroundColor:
      KhedmatPalette.border,
  },

  progressFill: {
    height: "100%",

    borderRadius: Radius.pill,

    backgroundColor:
      KhedmatPalette.blue500,
  },

  limitRow: {
    width: "100%",

    marginTop: Spacing.sm,

    alignItems: "center",

    justifyContent:
      "space-between",

    gap: Spacing.md,
  },

  limitLabel: {
    ...Typography.captionStyle,

    color:
      KhedmatPalette.textMuted,

    fontSize: 10,
  },

  limitValue: {
    ...Typography.captionStyle,

    color:
      KhedmatPalette.blue500,

    fontFamily: Fonts.medium,

    fontSize: 10,
  },

  resultsHeader: {
    width: "100%",

    marginTop:
      Spacing.section,

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

  resultsIcon: {
    width: 44,
    height: 44,

    flexShrink: 0,

    borderRadius: Radius.lg,

    alignItems: "center",

    justifyContent: "center",

    borderWidth: 1,

    borderColor:
      KhedmatPalette.border,

    backgroundColor:
      KhedmatPalette.surface,
  },

  services: {
    width: "100%",

    marginTop: Spacing.md,

    gap: Spacing.md,
  },

  serviceCard: {
    width: "100%",

    minHeight: 100,

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

    backgroundColor: "#F4FBFC",
  },

  serviceCardDisabled: {
    opacity: 0.42,
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

    minHeight: 100,

    padding: Spacing.lg,

    alignItems: "center",

    gap: Spacing.md,
  },

  checkbox: {
    width: 28,
    height: 28,

    flexShrink: 0,

    borderRadius: Radius.sm,

    borderWidth: 1.5,

    borderColor:
      KhedmatPalette.border,

    alignItems: "center",

    justifyContent: "center",

    backgroundColor:
      KhedmatPalette.surface,
  },

  checkboxSelected: {
    borderColor:
      KhedmatPalette.blue500,

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

  serviceSecondaryName: {
    ...Typography.captionStyle,

    width: "100%",

    color:
      KhedmatPalette.blue500,

    fontSize: 11,

    fontFamily: Fonts.medium,
  },

  serviceDescription: {
    ...Typography.captionStyle,

    width: "100%",

    color:
      KhedmatPalette.textSecondary,

    lineHeight: 18,
  },

  serviceStateIcon: {
    width: 34,
    height: 34,

    flexShrink: 0,

    borderRadius: Radius.pill,

    alignItems: "center",

    justifyContent: "center",

    backgroundColor:
      KhedmatPalette.surfaceSoft,
  },

  serviceStateIconSelected: {
    backgroundColor:
      KhedmatPalette.blue050,
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
    minHeight: 310,

    paddingHorizontal:
      Spacing.xl,

    alignItems: "center",

    justifyContent: "center",

    gap: Spacing.md,
  },

  emptyIcon: {
    width: 78,
    height: 78,

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

    maxWidth: 340,

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

    paddingHorizontal:
      Spacing.lg,

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