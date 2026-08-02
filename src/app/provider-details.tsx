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
  KeyboardAvoidingView,
  Modal,
  Platform,
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
import { serviceProfessions } from "../data/service-professions";

type IconName =
  ComponentProps<typeof Ionicons>["name"];

type LanguageName =
  | "English"
  | "Dari"
  | "Pashto";

type ExperienceId =
  | "less-than-1"
  | "1-2"
  | "3-5"
  | "6-10"
  | "more-than-10";

type ExperienceOption = {
  id: ExperienceId;
  icon: IconName;
  English: string;
  Dari: string;
  Pashto: string;
  secondaryEnglish: string;
};

type DetailsCopy = ReturnType<
  typeof getDetailsCopy
>;

const CURRENT_STEP = 3;
const TOTAL_STEPS = 6;
const MINIMUM_DESCRIPTION_LENGTH = 30;
const MAXIMUM_DESCRIPTION_LENGTH = 700;

const SUCCESS = "#268A57";
const SUCCESS_SOFT = "#E8F6EE";
const ERROR = "#B3261E";
const ERROR_SOFT = "#FCE8E6";
const INFO_SOFT = "#E5F4F8";

const EXPERIENCE_OPTIONS: ExperienceOption[] =
  [
    {
      id: "less-than-1",
      icon: "leaf-outline",
      English: "Less than 1 year",
      Dari: "کمتر از یک سال",
      Pashto: "له یو کال څخه کم",
      secondaryEnglish:
        "New professional experience",
    },
    {
      id: "1-2",
      icon: "time-outline",
      English: "1–2 years",
      Dari: "۱ تا ۲ سال",
      Pashto: "۱ تر ۲ کلونو",
      secondaryEnglish:
        "Early professional experience",
    },
    {
      id: "3-5",
      icon: "briefcase-outline",
      English: "3–5 years",
      Dari: "۳ تا ۵ سال",
      Pashto: "۳ تر ۵ کلونو",
      secondaryEnglish:
        "Established professional experience",
    },
    {
      id: "6-10",
      icon: "ribbon-outline",
      English: "6–10 years",
      Dari: "۶ تا ۱۰ سال",
      Pashto: "۶ تر ۱۰ کلونو",
      secondaryEnglish:
        "Advanced professional experience",
    },
    {
      id: "more-than-10",
      icon: "trophy-outline",
      English: "More than 10 years",
      Dari: "بیشتر از ۱۰ سال",
      Pashto: "له ۱۰ کلونو څخه ډېر",
      secondaryEnglish:
        "Highly experienced professional",
    },
  ];

export default function ProviderDetailsScreen() {
  const router = useRouter();

  const params =
    useLocalSearchParams<{
      category?: string | string[];
      services?: string | string[];
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
    getDetailsCopy(
      activeLanguage,
    );

  const categoryId =
    Array.isArray(params.category)
      ? params.category[0]
      : params.category ?? "";

  const servicesParam =
    Array.isArray(params.services)
      ? params.services[0]
      : params.services ?? "";

  const selectedServiceIds =
    useMemo(
      () =>
        servicesParam
          .split(",")
          .map((value) =>
            value.trim(),
          )
          .filter(Boolean),
      [servicesParam],
    );

  const category = useMemo(
    () =>
      serviceProfessions.find(
        (item) =>
          item.id === categoryId,
      ) ?? null,
    [categoryId],
  );

  const [
    businessName,
    setBusinessName,
  ] = useState("");

  const [
    experienceId,
    setExperienceId,
  ] = useState<ExperienceId | "">(
    "",
  );

  const [
    description,
    setDescription,
  ] = useState("");

  const [
    submitted,
    setSubmitted,
  ] = useState(false);

  const [
    experienceModalVisible,
    setExperienceModalVisible,
  ] = useState(false);

  const selectedExperience =
    EXPERIENCE_OPTIONS.find(
      (option) =>
        option.id ===
        experienceId,
    ) ?? null;

  const trimmedDescription =
    description.trim();

  const experienceError =
    submitted && !experienceId
      ? copy.experienceError
      : undefined;

  const descriptionError =
    submitted &&
    trimmedDescription.length <
      MINIMUM_DESCRIPTION_LENGTH
      ? copy.descriptionError(
          formatDigits(
            MINIMUM_DESCRIPTION_LENGTH.toString(),
            localizedDigits,
          ),
        )
      : undefined;

  const formIsValid =
    Boolean(experienceId) &&
    trimmedDescription.length >=
      MINIMUM_DESCRIPTION_LENGTH;

  const descriptionProgress =
    Math.min(
      100,
      Math.round(
        (trimmedDescription.length /
          MINIMUM_DESCRIPTION_LENGTH) *
          100,
      ),
    );

  const handleExperienceChange = (
    value: ExperienceId,
  ) => {
    setExperienceId(value);
    setExperienceModalVisible(
      false,
    );

    if (submitted) {
      setSubmitted(false);
    }
  };

  const handleDescriptionChange = (
    value: string,
  ) => {
    setDescription(value);

    if (submitted) {
      setSubmitted(false);
    }
  };

  const handleContinue = () => {
    setSubmitted(true);

    if (!formIsValid) {
      return;
    }

    router.push({
      pathname:
        "/provider-service-area",

      params: {
        category: categoryId,

        services:
          selectedServiceIds.join(
            ",",
          ),

        experience:
          experienceId,

        businessName:
          businessName.trim(),

        description:
          trimmedDescription,
      },
    } as never);
  };

  return (
    <SafeAreaView
      style={styles.safeArea}
    >
      <KeyboardAvoidingView
        style={styles.root}
        behavior={
          Platform.OS === "ios"
            ? "padding"
            : undefined
        }
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
            <View
              style={
                styles.headerIcon
              }
            >
              <Ionicons
                name="person-circle-outline"
                size={31}
                color={
                  KhedmatPalette.white
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
                {getCategoryName(
                  category?.nameFa,
                  category?.nameEn,
                  activeLanguage,
                  copy.profileFallback,
                )}
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
            style={
              styles.summaryCard
            }
          >
            <View
              style={[
                styles.summaryRow,
                {
                  flexDirection: isRtl
                    ? "row-reverse"
                    : "row",
                },
              ]}
            >
              <View
                style={
                  styles.summaryIcon
                }
              >
                <Ionicons
                  name="checkmark-done-outline"
                  size={22}
                  color={
                    KhedmatPalette
                      .blue500
                  }
                />
              </View>

              <View
                style={[
                  styles.summaryCopy,
                  {
                    alignItems: isRtl
                      ? "flex-end"
                      : "flex-start",
                  },
                ]}
              >
                <Text
                  style={[
                    styles.summaryTitle,
                    directionStyle(
                      isRtl,
                    ),
                  ]}
                >
                  {copy.selectedServices(
                    formatDigits(
                      selectedServiceIds.length.toString(),
                      localizedDigits,
                    ),
                  )}
                </Text>

                <Text
                  style={[
                    styles.summarySubtitle,
                    directionStyle(
                      isRtl,
                    ),
                  ]}
                >
                  {
                    copy.selectedServicesSubtitle
                  }
                </Text>
              </View>

              <View
                style={
                  styles.summaryCount
                }
              >
                <Text
                  style={
                    styles.summaryCountText
                  }
                >
                  {formatDigits(
                    selectedServiceIds.length.toString(),
                    localizedDigits,
                  )}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.form}>
            <View style={styles.field}>
              <View
                style={[
                  styles.fieldLabelRow,
                  {
                    flexDirection: isRtl
                      ? "row-reverse"
                      : "row",
                  },
                ]}
              >
                <Text
                  style={[
                    styles.fieldLabel,
                    directionStyle(
                      isRtl,
                    ),
                  ]}
                >
                  {copy.businessName}
                </Text>

                <Text
                  style={[
                    styles.optionalLabel,
                    directionStyle(
                      isRtl,
                    ),
                  ]}
                >
                  {copy.optional}
                </Text>
              </View>

              <View
                style={[
                  styles.textInputContainer,
                  {
                    flexDirection: isRtl
                      ? "row-reverse"
                      : "row",
                  },
                ]}
              >
                <View
                  style={
                    styles.inputIcon
                  }
                >
                  <Ionicons
                    name="storefront-outline"
                    size={20}
                    color={
                      KhedmatPalette
                        .blue500
                    }
                  />
                </View>

                <TextInput
                  value={businessName}
                  onChangeText={
                    setBusinessName
                  }
                  placeholder={
                    copy.businessNamePlaceholder
                  }
                  placeholderTextColor={
                    KhedmatPalette
                      .textMuted
                  }
                  selectionColor={
                    KhedmatPalette
                      .blue500
                  }
                  autoCapitalize="words"
                  returnKeyType="next"
                  maxLength={80}
                  style={[
                    styles.textInput,
                    directionStyle(
                      isRtl,
                    ),
                  ]}
                />
              </View>

              <Text
                style={[
                  styles.fieldHint,
                  directionStyle(
                    isRtl,
                  ),
                ]}
              >
                {copy.businessNameHint}
              </Text>
            </View>

            <View style={styles.field}>
              <View
                style={[
                  styles.fieldLabelRow,
                  {
                    flexDirection: isRtl
                      ? "row-reverse"
                      : "row",
                  },
                ]}
              >
                <Text
                  style={[
                    styles.fieldLabel,
                    directionStyle(
                      isRtl,
                    ),
                  ]}
                >
                  {copy.experience}
                </Text>

                <Text
                  style={[
                    styles.requiredLabel,
                    directionStyle(
                      isRtl,
                    ),
                  ]}
                >
                  {copy.required}
                </Text>
              </View>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel={
                  copy.experience
                }
                accessibilityState={{
                  expanded:
                    experienceModalVisible,
                }}
                onPress={() =>
                  setExperienceModalVisible(
                    true,
                  )
                }
                style={({ pressed }) => [
                  styles.selectControl,

                  experienceError &&
                    styles.controlError,

                  pressed &&
                    styles.controlPressed,
                ]}
              >
                <View
                  style={[
                    styles.selectContent,
                    {
                      flexDirection: isRtl
                        ? "row-reverse"
                        : "row",
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.inputIcon,

                      selectedExperience &&
                        styles.inputIconSelected,
                    ]}
                  >
                    <Ionicons
                      name={
                        selectedExperience?.icon ??
                        "ribbon-outline"
                      }
                      size={20}
                      color={
                        selectedExperience
                          ? KhedmatPalette
                              .white
                          : KhedmatPalette
                              .blue500
                      }
                    />
                  </View>

                  <View
                    style={[
                      styles.selectCopy,
                      {
                        alignItems: isRtl
                          ? "flex-end"
                          : "flex-start",
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.selectValue,

                        !selectedExperience &&
                          styles.selectPlaceholder,

                        directionStyle(
                          isRtl,
                        ),
                      ]}
                    >
                      {selectedExperience
                        ? getExperienceLabel(
                            selectedExperience,
                            activeLanguage,
                          )
                        : copy.experiencePlaceholder}
                    </Text>

                    {selectedExperience ? (
                      <Text
                        style={[
                          styles.selectSecondaryValue,
                          directionStyle(
                            isRtl,
                          ),
                        ]}
                      >
                        {
                          selectedExperience.secondaryEnglish
                        }
                      </Text>
                    ) : null}
                  </View>

                  <Ionicons
                    name="chevron-down"
                    size={19}
                    color={
                      KhedmatPalette
                        .textMuted
                    }
                  />
                </View>
              </Pressable>

              {experienceError ? (
                <ErrorText
                  text={experienceError}
                  isRtl={isRtl}
                />
              ) : (
                <Text
                  style={[
                    styles.fieldHint,
                    directionStyle(
                      isRtl,
                    ),
                  ]}
                >
                  {copy.experienceHint}
                </Text>
              )}
            </View>

            <View style={styles.field}>
              <View
                style={[
                  styles.fieldLabelRow,
                  {
                    flexDirection: isRtl
                      ? "row-reverse"
                      : "row",
                  },
                ]}
              >
                <Text
                  style={[
                    styles.fieldLabel,
                    directionStyle(
                      isRtl,
                    ),
                  ]}
                >
                  {
                    copy.professionalIntroduction
                  }
                </Text>

                <Text
                  style={[
                    styles.requiredLabel,
                    directionStyle(
                      isRtl,
                    ),
                  ]}
                >
                  {copy.required}
                </Text>
              </View>

              <View
                style={[
                  styles.descriptionContainer,

                  descriptionError &&
                    styles.controlError,
                ]}
              >
                <View
                  style={[
                    styles.descriptionTopRow,
                    {
                      flexDirection: isRtl
                        ? "row-reverse"
                        : "row",
                    },
                  ]}
                >
                  <View
                    style={
                      styles.descriptionIcon
                    }
                  >
                    <Ionicons
                      name="document-text-outline"
                      size={20}
                      color={
                        KhedmatPalette
                          .blue500
                      }
                    />
                  </View>

                  <Text
                    style={[
                      styles.descriptionPrompt,
                      directionStyle(
                        isRtl,
                      ),
                    ]}
                  >
                    {copy.descriptionPrompt}
                  </Text>
                </View>

                <TextInput
                  value={description}
                  onChangeText={
                    handleDescriptionChange
                  }
                  placeholder={
                    copy.descriptionPlaceholder
                  }
                  placeholderTextColor={
                    KhedmatPalette
                      .textMuted
                  }
                  selectionColor={
                    KhedmatPalette
                      .blue500
                  }
                  multiline
                  numberOfLines={7}
                  maxLength={
                    MAXIMUM_DESCRIPTION_LENGTH
                  }
                  textAlignVertical="top"
                  style={[
                    styles.descriptionInput,
                    directionStyle(
                      isRtl,
                    ),
                  ]}
                />

                <View
                  style={
                    styles.descriptionProgressTrack
                  }
                >
                  <View
                    style={[
                      styles.descriptionProgressFill,

                      {
                        width: `${descriptionProgress}%`,
                      },

                      trimmedDescription.length >=
                        MINIMUM_DESCRIPTION_LENGTH &&
                        styles.descriptionProgressValid,
                    ]}
                  />
                </View>
              </View>

              <View
                style={[
                  styles.characterRow,
                  {
                    flexDirection: isRtl
                      ? "row-reverse"
                      : "row",
                  },
                ]}
              >
                <Text
                  style={[
                    styles.characterCount,

                    trimmedDescription.length >=
                      MINIMUM_DESCRIPTION_LENGTH &&
                      styles.characterCountValid,

                    directionStyle(
                      isRtl,
                    ),
                  ]}
                >
                  {copy.characterCount(
                    formatDigits(
                      description.length.toString(),
                      localizedDigits,
                    ),

                    formatDigits(
                      MAXIMUM_DESCRIPTION_LENGTH.toString(),
                      localizedDigits,
                    ),
                  )}
                </Text>

                <Text
                  style={[
                    styles.characterRequirement,
                    directionStyle(
                      isRtl,
                    ),
                  ]}
                >
                  {copy.minimumCharacters(
                    formatDigits(
                      MINIMUM_DESCRIPTION_LENGTH.toString(),
                      localizedDigits,
                    ),
                  )}
                </Text>
              </View>

              {descriptionError ? (
                <ErrorText
                  text={descriptionError}
                  isRtl={isRtl}
                />
              ) : null}
            </View>
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
              onPress={
                handleContinue
              }
              style={({ pressed }) => [
                styles.primaryButton,

                pressed &&
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
                  {copy.continue}
                </Text>

                <Ionicons
                  name={
                    isRtl
                      ? "arrow-back"
                      : "arrow-forward"
                  }
                  size={20}
                  color={
                    KhedmatPalette.white
                  }
                />
              </View>
            </Pressable>

            <View
              style={[
                styles.footerHintRow,
                {
                  flexDirection: isRtl
                    ? "row-reverse"
                    : "row",
                },
              ]}
            >
              <Ionicons
                name="shield-checkmark-outline"
                size={14}
                color={
                  KhedmatPalette
                    .textMuted
                }
              />

              <Text
                style={[
                  styles.helperText,
                  directionStyle(
                    isRtl,
                  ),
                ]}
              >
                {copy.helperText}
              </Text>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>

      <ExperienceModal
        visible={
          experienceModalVisible
        }
        selectedId={experienceId}
        language={activeLanguage}
        isRtl={isRtl}
        copy={copy}
        onSelect={
          handleExperienceChange
        }
        onClose={() =>
          setExperienceModalVisible(
            false,
          )
        }
      />
    </SafeAreaView>
  );
}

type ExperienceModalProps = {
  visible: boolean;
  selectedId: ExperienceId | "";
  language: LanguageName;
  isRtl: boolean;
  copy: DetailsCopy;
  onSelect: (
    value: ExperienceId,
  ) => void;
  onClose: () => void;
};

function ExperienceModal({
  visible,
  selectedId,
  language,
  isRtl,
  copy,
  onSelect,
  onClose,
}: ExperienceModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <Pressable
        style={styles.modalBackdrop}
        onPress={onClose}
      >
        <Pressable
          style={styles.modalSheet}
          onPress={(event) =>
            event.stopPropagation()
          }
        >
          <View
            style={[
              styles.modalHeader,
              {
                flexDirection: isRtl
                  ? "row-reverse"
                  : "row",
              },
            ]}
          >
            <View
              style={[
                styles.modalHeaderCopy,
                {
                  alignItems: isRtl
                    ? "flex-end"
                    : "flex-start",
                },
              ]}
            >
              <Text
                style={[
                  styles.modalTitle,
                  directionStyle(isRtl),
                ]}
              >
                {copy.experienceModalTitle}
              </Text>

              <Text
                style={[
                  styles.modalSubtitle,
                  directionStyle(isRtl),
                ]}
              >
                {
                  copy.experienceModalSubtitle
                }
              </Text>
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={
                copy.close
              }
              hitSlop={8}
              onPress={onClose}
              style={({ pressed }) => [
                styles.modalCloseButton,
                pressed &&
                  styles.pressed,
              ]}
            >
              <Ionicons
                name="close"
                size={22}
                color={
                  KhedmatPalette
                    .navy900
                }
              />
            </Pressable>
          </View>

          <View
            style={
              styles.experienceOptions
            }
          >
            {EXPERIENCE_OPTIONS.map(
              (option) => {
                const selected =
                  selectedId ===
                  option.id;

                return (
                  <Pressable
                    key={option.id}
                    accessibilityRole="radio"
                    accessibilityState={{
                      selected,
                    }}
                    accessibilityLabel={getExperienceLabel(
                      option,
                      language,
                    )}
                    onPress={() =>
                      onSelect(
                        option.id,
                      )
                    }
                    style={({ pressed }) => [
                      styles.experienceOption,

                      selected &&
                        styles.experienceOptionSelected,

                      pressed &&
                        styles.controlPressed,
                    ]}
                  >
                    <View
                      style={[
                        styles.experienceOptionContent,
                        {
                          flexDirection: isRtl
                            ? "row-reverse"
                            : "row",
                        },
                      ]}
                    >
                      <View
                        style={[
                          styles.experienceIcon,

                          selected &&
                            styles.experienceIconSelected,
                        ]}
                      >
                        <Ionicons
                          name={
                            option.icon
                          }
                          size={21}
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
                          styles.experienceCopy,
                          {
                            alignItems: isRtl
                              ? "flex-end"
                              : "flex-start",
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.experienceTitle,

                            selected &&
                              styles.experienceTitleSelected,

                            directionStyle(
                              isRtl,
                            ),
                          ]}
                        >
                          {getExperienceLabel(
                            option,
                            language,
                          )}
                        </Text>

                        <Text
                          style={[
                            styles.experienceSubtitle,
                            directionStyle(
                              isRtl,
                            ),
                          ]}
                        >
                          {
                            option.secondaryEnglish
                          }
                        </Text>
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
              },
            )}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

type ErrorTextProps = {
  text: string;
  isRtl: boolean;
};

function ErrorText({
  text,
  isRtl,
}: ErrorTextProps) {
  return (
    <View
      style={[
        styles.errorRow,
        {
          flexDirection: isRtl
            ? "row-reverse"
            : "row",
        },
      ]}
    >
      <Ionicons
        name="alert-circle-outline"
        size={15}
        color={ERROR}
      />

      <Text
        style={[
          styles.errorText,
          directionStyle(isRtl),
        ]}
      >
        {text}
      </Text>
    </View>
  );
}

function getExperienceLabel(
  option: ExperienceOption,
  language: LanguageName,
): string {
  return option[language];
}

function getCategoryName(
  nameFa: string | undefined,
  nameEn: string | undefined,
  language: LanguageName,
  fallback: string,
): string {
  if (language === "English") {
    return nameEn || fallback;
  }

  return nameFa || fallback;
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

function getDetailsCopy(
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

      profileFallback:
        "پروفایل حرفه‌ای",

      title:
        "تجربه و مهارت خود را معرفی کنید",

      subtitle:
        "این معلومات در پروفایل عمومی شما نمایش داده می‌شود و به مشتریان کمک می‌کند با اطمینان بیشتری شما را انتخاب کنند.",

      selectedServices:
        (value: string) =>
          `${value} خدمت انتخاب‌شده`,

      selectedServicesSubtitle:
        "این خدمات در پروفایل حرفه‌ای شما نمایش داده می‌شوند.",

      businessName:
        "نام کسب‌وکار یا عنوان کاری",

      optional: "اختیاری",

      businessNamePlaceholder:
        "مثلاً خدمات برق احمد",

      businessNameHint:
        "می‌توانید نام تجاری یا عنوانی را وارد کنید که مشتریان شما را با آن می‌شناسند.",

      experience:
        "تجربهٔ کاری",

      required: "ضروری",

      experiencePlaceholder:
        "میزان تجربه را انتخاب کنید",

      experienceHint:
        "مدت فعالیت حرفه‌ای خود را انتخاب کنید.",

      experienceError:
        "لطفاً میزان تجربهٔ کاری خود را انتخاب کنید.",

      experienceModalTitle:
        "میزان تجربهٔ کاری",

      experienceModalSubtitle:
        "مدت فعالیت حرفه‌ای خود را انتخاب کنید.",

      professionalIntroduction:
        "معرفی حرفه‌ای",

      descriptionPrompt:
        "دربارهٔ مهارت، تجربه و نوع کار خود بنویسید.",

      descriptionPlaceholder:
        "برای مثال: بیش از پنج سال در نصب و ترمیم سیستم‌های برق خانه فعالیت دارم. در سیم‌کشی، نصب روشنایی و رفع عیب تجربه دارم...",

      descriptionError:
        (value: string) =>
          `لطفاً حداقل ${value} حرف دربارهٔ تجربه و مهارت خود بنویسید.`,

      characterCount:
        (
          current: string,
          maximum: string,
        ) =>
          `${current} از ${maximum} حرف`,

      minimumCharacters:
        (value: string) =>
          `حداقل ${value} حرف`,

      guidanceTitle:
        "یک معرفی روشن و دقیق بنویسید",

      guidanceText:
        "مهارت‌های اصلی، سال‌های تجربه، نوع پروژه‌هایی که انجام داده‌اید و ویژگی‌های کار خود را توضیح دهید. از درج شماره تماس در این بخش خودداری کنید.",

      continue:
        "ادامه به محدودهٔ خدمت",

      helperText:
        "معلومات دقیق‌تر باعث افزایش اعتماد مشتریان می‌شود.",

      close: "بستن",
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

      profileFallback:
        "مسلکي پروفایل",

      title:
        "خپله تجربه او مهارتونه معرفي کړئ",

      subtitle:
        "دا معلومات به ستاسو په عامه پروفایل کې ښکاره شي او له پیرودونکو سره مرسته کوي چې په ډاډ سره تاسو وټاکي.",

      selectedServices:
        (value: string) =>
          `${value} خدمتونه ټاکل شوي`,

      selectedServicesSubtitle:
        "دا خدمتونه به ستاسو په مسلکي پروفایل کې ښکاره شي.",

      businessName:
        "د کاروبار نوم یا کاري عنوان",

      optional: "اختیاري",

      businessNamePlaceholder:
        "لکه د احمد برېښنايي خدمتونه",

      businessNameHint:
        "هغه سوداګریز نوم یا کاري عنوان ولیکئ چې پیرودونکي مو پرې پېژني.",

      experience:
        "کاري تجربه",

      required: "اړین",

      experiencePlaceholder:
        "د تجربې موده وټاکئ",

      experienceHint:
        "د خپل مسلکي فعالیت موده وټاکئ.",

      experienceError:
        "مهرباني وکړئ خپله کاري تجربه وټاکئ.",

      experienceModalTitle:
        "د کاري تجربې موده",

      experienceModalSubtitle:
        "د خپل مسلکي فعالیت موده وټاکئ.",

      professionalIntroduction:
        "مسلکي پېژندنه",

      descriptionPrompt:
        "د خپلو مهارتونو، تجربې او کار په اړه ولیکئ.",

      descriptionPlaceholder:
        "د بېلګې په توګه: زه له پنځو کلونو ډېر د کورونو د برېښنايي سیستمونو په نصب او ترمیم کې تجربه لرم...",

      descriptionError:
        (value: string) =>
          `مهرباني وکړئ د خپلې تجربې او مهارتونو په اړه لږ تر لږه ${value} توري ولیکئ.`,

      characterCount:
        (
          current: string,
          maximum: string,
        ) =>
          `${current} له ${maximum} تورو`,

      minimumCharacters:
        (value: string) =>
          `لږ تر لږه ${value} توري`,

      guidanceTitle:
        "روښانه او دقیق مسلکي معلومات ولیکئ",

      guidanceText:
        "خپل اصلي مهارتونه، د تجربې موده، ترسره شوې پروژې او د کار ځانګړتیاوې بیان کړئ. په دې برخه کې د ټیلیفون شمېره مه لیکئ.",

      continue:
        "د خدمت ساحې ته دوام",

      helperText:
        "دقیق معلومات د پیرودونکو باور زیاتوي.",

      close: "تړل",
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

    profileFallback:
      "Professional profile",

    title:
      "Present your experience and skills",

    subtitle:
      "This information appears on your public profile and helps customers choose you with greater confidence.",

    selectedServices:
      (value: string) =>
        `${value} services selected`,

    selectedServicesSubtitle:
      "These services will appear on your professional profile.",

    businessName:
      "Business name or work title",

    optional: "Optional",

    businessNamePlaceholder:
      "For example, Ahmad Electrical Services",

    businessNameHint:
      "Enter a business name or professional title customers can recognize.",

    experience:
      "Work experience",

    required: "Required",

    experiencePlaceholder:
      "Select your experience level",

    experienceHint:
      "Choose how long you have worked professionally.",

    experienceError:
      "Please select your level of professional experience.",

    experienceModalTitle:
      "Work experience",

    experienceModalSubtitle:
      "Choose how long you have worked professionally.",

    professionalIntroduction:
      "Professional introduction",

    descriptionPrompt:
      "Describe your skills, experience and the work you perform.",

    descriptionPlaceholder:
      "For example: I have more than five years of experience installing and repairing residential electrical systems. I specialize in wiring, lighting installation and fault diagnosis...",

    descriptionError:
      (value: string) =>
        `Please write at least ${value} characters about your skills and experience.`,

    characterCount:
      (
        current: string,
        maximum: string,
      ) =>
        `${current} of ${maximum} characters`,

    minimumCharacters:
      (value: string) =>
        `Minimum ${value} characters`,

    guidanceTitle:
      "Write a clear professional introduction",

    guidanceText:
      "Describe your core skills, years of experience, completed project types and work standards. Do not include your phone number in this section.",

    continue:
      "Continue to service area",

    helperText:
      "Accurate information helps customers trust your profile.",

    close: "Close",
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
    paddingBottom: 158,
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

  summaryCard: {
    width: "100%",
    marginTop: Spacing.xxl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor:
      KhedmatPalette.blue200,
    borderRadius: Radius.xl,
    backgroundColor: "#F4FBFC",
  },

  summaryRow: {
    width: "100%",
    alignItems: "center",
    gap: Spacing.md,
  },

  summaryIcon: {
    width: 46,
    height: 46,
    flexShrink: 0,
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      KhedmatPalette.surface,
  },

  summaryCopy: {
    flex: 1,
    gap: 2,
  },

  summaryTitle: {
    ...Typography.label,
    width: "100%",
    color:
      KhedmatPalette.textPrimary,
    fontSize: 16,
  },

  summarySubtitle: {
    ...Typography.captionStyle,
    width: "100%",
    color:
      KhedmatPalette.textSecondary,
    lineHeight: 18,
  },

  summaryCount: {
    minWidth: 42,
    height: 42,
    flexShrink: 0,
    paddingHorizontal: 8,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      KhedmatPalette.navy900,
  },

  summaryCountText: {
    color:
      KhedmatPalette.white,
    fontFamily: Fonts.bold,
    fontSize: 15,
  },

  form: {
    width: "100%",
    marginTop: Spacing.section,
    gap: Spacing.xxl,
  },

  field: {
    width: "100%",
    gap: Spacing.sm,
  },

  fieldLabelRow: {
    width: "100%",
    alignItems: "center",
    justifyContent:
      "space-between",
    gap: Spacing.md,
  },

  fieldLabel: {
    ...Typography.label,
    flex: 1,
    color:
      KhedmatPalette.textPrimary,
    fontSize: 15,
  },

  optionalLabel: {
    ...Typography.captionStyle,
    color:
      KhedmatPalette.textMuted,
    fontSize: 10,
  },

  requiredLabel: {
    ...Typography.captionStyle,
    color:
      KhedmatPalette.blue500,
    fontFamily: Fonts.medium,
    fontSize: 10,
  },

  textInputContainer: {
    width: "100%",
    minHeight:
      Layout.controlHeight,
    paddingHorizontal:
      Spacing.md,
    alignItems: "center",
    gap: Spacing.md,
    borderWidth: 1,
    borderColor:
      KhedmatPalette.border,
    borderRadius: Radius.lg,
    backgroundColor:
      KhedmatPalette.surface,
  },

  textInput: {
    flex: 1,
    minHeight:
      Layout.controlHeight,
    paddingVertical: 0,
    color:
      KhedmatPalette.textPrimary,
    fontFamily: Fonts.regular,
    fontSize: Typography.body,
  },

  inputIcon: {
    width: 38,
    height: 38,
    flexShrink: 0,
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      KhedmatPalette.surfaceSoft,
  },

  inputIconSelected: {
    backgroundColor:
      KhedmatPalette.blue500,
  },

  fieldHint: {
    ...Typography.captionStyle,
    width: "100%",
    color:
      KhedmatPalette.textMuted,
    lineHeight: 18,
  },

  selectControl: {
    width: "100%",
    minHeight: 66,
    paddingHorizontal:
      Spacing.md,
    justifyContent: "center",
    borderWidth: 1,
    borderColor:
      KhedmatPalette.border,
    borderRadius: Radius.lg,
    backgroundColor:
      KhedmatPalette.surface,
  },

  selectContent: {
    width: "100%",
    alignItems: "center",
    gap: Spacing.md,
  },

  selectCopy: {
    flex: 1,
    gap: 2,
  },

  selectValue: {
    ...Typography.label,
    width: "100%",
    color:
      KhedmatPalette.textPrimary,
    fontSize: 15,
  },

  selectPlaceholder: {
    color:
      KhedmatPalette.textMuted,
    fontFamily: Fonts.regular,
  },

  selectSecondaryValue: {
    ...Typography.captionStyle,
    width: "100%",
    color:
      KhedmatPalette.textMuted,
    fontSize: 10,
  },

  descriptionContainer: {
    width: "100%",
    minHeight: 225,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor:
      KhedmatPalette.border,
    borderRadius: Radius.xl,
    backgroundColor:
      KhedmatPalette.surface,
  },

  descriptionTopRow: {
    width: "100%",
    alignItems: "center",
    gap: Spacing.sm,
  },

  descriptionIcon: {
    width: 36,
    height: 36,
    flexShrink: 0,
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      KhedmatPalette.surfaceSoft,
  },

  descriptionPrompt: {
    ...Typography.captionStyle,
    flex: 1,
    color:
      KhedmatPalette.textSecondary,
    lineHeight: 18,
  },

  descriptionInput: {
    width: "100%",
    minHeight: 145,
    marginTop: Spacing.sm,
    paddingHorizontal: 2,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.sm,
    color:
      KhedmatPalette.textPrimary,
    fontFamily: Fonts.regular,
    fontSize: Typography.body,
    lineHeight: 23,
  },

  descriptionProgressTrack: {
    width: "100%",
    height: 5,
    overflow: "hidden",
    borderRadius: Radius.pill,
    backgroundColor:
      KhedmatPalette.border,
  },

  descriptionProgressFill: {
    height: "100%",
    borderRadius: Radius.pill,
    backgroundColor:
      KhedmatPalette.blue500,
  },

  descriptionProgressValid: {
    backgroundColor: SUCCESS,
  },

  characterRow: {
    width: "100%",
    alignItems: "center",
    justifyContent:
      "space-between",
    gap: Spacing.md,
  },

  characterCount: {
    ...Typography.captionStyle,
    color:
      KhedmatPalette.textMuted,
  },

  characterCountValid: {
    color: SUCCESS,
    fontFamily: Fonts.medium,
  },

  characterRequirement: {
    ...Typography.captionStyle,
    color:
      KhedmatPalette.textMuted,
  },

  controlError: {
    borderColor: ERROR,
    backgroundColor:
      "#FFF9F8",
  },

  controlPressed: {
    opacity: 0.86,
  },

  errorRow: {
    width: "100%",
    alignItems: "center",
    gap: 5,
  },

  errorText: {
    ...Typography.captionStyle,
    flex: 1,
    color: ERROR,
    lineHeight: 18,
  },

  guidanceCard: {
    width: "100%",
    minHeight: 110,
    marginTop: Spacing.section,
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
  },

  footerHintRow: {
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },

  helperText: {
    ...Typography.captionStyle,
    flexShrink: 1,
    color:
      KhedmatPalette.textMuted,
    textAlign: "center",
  },

  modalBackdrop: {
    flex: 1,
    paddingHorizontal:
      Layout.screenPadding,
    justifyContent: "flex-end",
    backgroundColor:
      "rgba(0, 27, 72, 0.38)",
  },

  modalSheet: {
    width: "100%",
    maxWidth:
      Layout.contentMaxWidth,
    alignSelf: "center",
    marginBottom:
      Platform.OS === "ios"
        ? Spacing.lg
        : Spacing.md,
    padding: Spacing.lg,
    borderRadius: Radius.xxl,
    backgroundColor:
      KhedmatPalette.surface,
    ...Shadows.medium,
  },

  modalHeader: {
    width: "100%",
    alignItems: "flex-start",
    justifyContent:
      "space-between",
    gap: Spacing.md,
  },

  modalHeaderCopy: {
    flex: 1,
    gap: 3,
  },

  modalTitle: {
    ...Typography.sectionTitle,
    width: "100%",
    color:
      KhedmatPalette.textPrimary,
    fontSize: 21,
  },

  modalSubtitle: {
    ...Typography.captionStyle,
    width: "100%",
    color:
      KhedmatPalette.textSecondary,
  },

  modalCloseButton: {
    width: 40,
    height: 40,
    flexShrink: 0,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      KhedmatPalette.surfaceSoft,
  },

  experienceOptions: {
    width: "100%",
    marginTop: Spacing.lg,
    gap: Spacing.sm,
  },

  experienceOption: {
    width: "100%",
    minHeight: 68,
    borderWidth: 1,
    borderColor:
      KhedmatPalette.border,
    borderRadius: Radius.lg,
    backgroundColor:
      KhedmatPalette.surface,
  },

  experienceOptionSelected: {
    borderColor:
      KhedmatPalette.blue500,
    backgroundColor: "#F4FBFC",
  },

  experienceOptionContent: {
    width: "100%",
    minHeight: 68,
    paddingHorizontal:
      Spacing.md,
    paddingVertical:
      Spacing.sm,
    alignItems: "center",
    gap: Spacing.md,
  },

  experienceIcon: {
    width: 42,
    height: 42,
    flexShrink: 0,
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      KhedmatPalette.surfaceSoft,
  },

  experienceIconSelected: {
    backgroundColor:
      KhedmatPalette.blue500,
  },

  experienceCopy: {
    flex: 1,
    gap: 2,
  },

  experienceTitle: {
    ...Typography.label,
    width: "100%",
    color:
      KhedmatPalette.textPrimary,
    fontSize: 15,
  },

  experienceTitleSelected: {
    color:
      KhedmatPalette.navy900,
    fontFamily: Fonts.bold,
  },

  experienceSubtitle: {
    ...Typography.captionStyle,
    width: "100%",
    color:
      KhedmatPalette.textMuted,
    fontSize: 10,
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

  pressed: {
    opacity: 0.76,
    transform: [
      {
        scale: 0.97,
      },
    ],
  },
});