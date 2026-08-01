import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  ComponentProps,
  useMemo,
  useState,
} from "react";
import {
  FlatList,
  Modal,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { KhedmatButton } from "../components/khedmat/khedmat-button";
import { KhedmatCard } from "../components/khedmat/khedmat-card";
import { KhedmatInput } from "../components/khedmat/khedmat-input";
import { KhedmatScreen } from "../components/khedmat/khedmat-screen";
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
import { provinces } from "../data/afghanistan-addresses";

type IconName =
  ComponentProps<typeof Ionicons>["name"];

type SelectOption = {
  id: string;
  label: string;
  secondaryLabel?: string;
  searchTerms?: string[];
};

type SelectFieldProps = {
  label: string;
  placeholder: string;
  title: string;
  searchPlaceholder: string;
  emptyMessage: string;
  options: SelectOption[];
  value: string;
  onChange: (
    value: string,
    option: SelectOption,
  ) => void;
  isRtl: boolean;
  icon: IconName;
  disabled?: boolean;
  error?: string;
};

export default function ManualAddressScreen() {
  const router = useRouter();
  const { t, language } = useLanguage();

  const isEnglish =
    language === "English";

  const isRtl =
    language === "Dari" ||
    language === "Pashto";

  const [provinceId, setProvinceId] =
    useState("");

  const [districtId, setDistrictId] =
    useState("");

  const [
    neighbourhood,
    setNeighbourhood,
  ] = useState("");

  const [street, setStreet] =
    useState("");

  const [house, setHouse] =
    useState("");

  const [details, setDetails] =
    useState("");

  const [submitted, setSubmitted] =
    useState(false);

  const provinceOptions =
    useMemo<SelectOption[]>(
      () =>
        provinces.map((province) => ({
          id: province.id,
          label: isEnglish
            ? province.nameEn
            : province.nameFa,
          secondaryLabel: isEnglish
            ? province.nameFa
            : province.nameEn,
          searchTerms: [
            province.nameFa,
            province.nameEn,
          ],
        })),
      [isEnglish],
    );

  const selectedProvince = useMemo(
    () =>
      provinces.find(
        (province) =>
          province.id === provinceId,
      ),
    [provinceId],
  );

  const districtOptions =
    useMemo<SelectOption[]>(
      () =>
        selectedProvince?.districts.map(
          (district) => ({
            id: district.id,
            label: isEnglish
              ? district.nameEn
              : district.nameFa,
            secondaryLabel: isEnglish
              ? district.nameFa
              : district.nameEn,
            searchTerms: [
              district.nameFa,
              district.nameEn,
            ],
          }),
        ) ?? [],
      [isEnglish, selectedProvince],
    );

  const selectedDistrict = useMemo(
    () =>
      selectedProvince?.districts.find(
        (district) =>
          district.id === districtId,
      ),
    [districtId, selectedProvince],
  );

  const provinceError =
    submitted && !provinceId
      ? t("provinceErrorText")
      : undefined;

  const districtError =
    submitted && !districtId
      ? t("districtErrorText")
      : undefined;

  const neighbourhoodError =
    submitted &&
    neighbourhood.trim().length < 2
      ? t("neighbourhoodErrorText")
      : undefined;

  const formIsValid =
    Boolean(provinceId) &&
    Boolean(districtId) &&
    neighbourhood.trim().length >= 2;

  const handleProvinceChange = (
    value: string,
    _option: SelectOption,
  ) => {
    setProvinceId(value);
    setDistrictId("");

    if (submitted) {
      setSubmitted(false);
    }
  };

  const handleDistrictChange = (
    value: string,
    _option: SelectOption,
  ) => {
    setDistrictId(value);

    if (submitted) {
      setSubmitted(false);
    }
  };

  const saveAddress = () => {
    setSubmitted(true);

    if (!formIsValid) {
      return;
    }

    const address = {
      provinceId,

      provinceName: selectedProvince
        ? isEnglish
          ? selectedProvince.nameEn
          : selectedProvince.nameFa
        : "",

      districtId,

      districtName: selectedDistrict
        ? isEnglish
          ? selectedDistrict.nameEn
          : selectedDistrict.nameFa
        : "",

      neighbourhood:
        neighbourhood.trim(),

      street: street.trim(),
      house: house.trim(),
      details: details.trim(),

      source: "manual" as const,
    };

    console.log(
      "Manual address:",
      address,
    );

    router.replace(
      "/role-selection",
    );
  };

  return (
    <KhedmatScreen
      keyboardAware
      scrollable
      contentStyle={styles.content}
      footer={
        <View style={styles.footer}>
          <KhedmatButton
            label={t(
              "saveAddressButton",
            )}
            disabled={
              submitted && !formIsValid
            }
            onPress={saveAddress}
          />
        </View>
      }
    >
      <View style={styles.topBar}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t(
            "backLabel",
          )}
          onPress={() => router.back()}
          style={({ pressed }) => [
            styles.backButton,
            pressed &&
              styles.backButtonPressed,
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
              KhedmatPalette.navy900
            }
          />
        </Pressable>
      </View>

      <View style={styles.hero}>
        <View style={styles.iconCircle}>
          <Ionicons
            name="location-outline"
            size={42}
            color={
              KhedmatPalette.white
            }
          />
        </View>

        <Text
          style={[
            styles.title,
            {
              writingDirection: isRtl
                ? "rtl"
                : "ltr",
            },
          ]}
        >
          {t("manualTitle")}
        </Text>

        <Text
          style={[
            styles.subtitle,
            {
              writingDirection: isRtl
                ? "rtl"
                : "ltr",
            },
          ]}
        >
          {t("manualSubtitle")}
        </Text>
      </View>

      <KhedmatCard
        style={styles.formCard}
        contentStyle={
          styles.formCardContent
        }
      >
        <View style={styles.form}>
          <SelectField
            label={t("provinceLabel")}
            placeholder={t(
              "provincePlaceholder",
            )}
            title={t("provinceTitle")}
            searchPlaceholder={t(
              "provinceSearch",
            )}
            emptyMessage={t(
              "provinceEmpty",
            )}
            options={provinceOptions}
            value={provinceId}
            onChange={
              handleProvinceChange
            }
            icon="map-outline"
            isRtl={isRtl}
            error={provinceError}
          />

          <SelectField
            label={t("districtLabel")}
            placeholder={
              provinceId
                ? t(
                    "districtPlaceholder",
                  )
                : t(
                    "districtPlaceholderDisabled",
                  )
            }
            title={t("districtTitle")}
            searchPlaceholder={t(
              "districtSearch",
            )}
            emptyMessage={t(
              "districtEmpty",
            )}
            options={districtOptions}
            value={districtId}
            onChange={
              handleDistrictChange
            }
            icon="navigate-outline"
            isRtl={isRtl}
            disabled={!provinceId}
            error={districtError}
          />

          <KhedmatInput
            label={t(
              "neighbourhoodLabel",
            )}
            placeholder={t(
              "neighbourhoodPlaceholder",
            )}
            value={neighbourhood}
            onChangeText={(value) => {
              setNeighbourhood(value);

              if (submitted) {
                setSubmitted(false);
              }
            }}
            error={neighbourhoodError}
            icon="business-outline"
            isRtl={isRtl}
            autoCapitalize="words"
            returnKeyType="next"
          />

          <KhedmatInput
            label={t("streetLabel")}
            placeholder={t(
              "streetPlaceholder",
            )}
            value={street}
            onChangeText={setStreet}
            icon="trail-sign-outline"
            isRtl={isRtl}
            autoCapitalize="words"
            returnKeyType="next"
          />

          <KhedmatInput
            label={t("houseLabel")}
            placeholder={t(
              "housePlaceholder",
            )}
            value={house}
            onChangeText={setHouse}
            icon="home-outline"
            isRtl={isRtl}
            returnKeyType="next"
          />

          <KhedmatInput
            label={t("detailsLabel")}
            placeholder={t(
              "detailsPlaceholder",
            )}
            value={details}
            onChangeText={setDetails}
            icon="create-outline"
            isRtl={isRtl}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            inputMode="text"
            returnKeyType="done"
            style={styles.notesInput}
          />
        </View>
      </KhedmatCard>

      <View
        style={[
          styles.locationNote,
          {
            flexDirection: isRtl
              ? "row-reverse"
              : "row",
          },
        ]}
      >
        <Ionicons
          name="information-circle-outline"
          size={17}
          color={
            KhedmatPalette.blue500
          }
        />

        <Text
          style={[
            styles.locationNoteText,
            {
              textAlign: isRtl
                ? "right"
                : "left",
              writingDirection: isRtl
                ? "rtl"
                : "ltr",
            },
          ]}
        >
          {getAddressNote(language)}
        </Text>
      </View>
    </KhedmatScreen>
  );
}

function SelectField({
  label,
  placeholder,
  title,
  searchPlaceholder,
  emptyMessage,
  options,
  value,
  onChange,
  isRtl,
  icon,
  disabled = false,
  error,
}: SelectFieldProps) {
  const [open, setOpen] =
    useState(false);

  const [query, setQuery] =
    useState("");

  const selectedOption =
    options.find(
      (option) =>
        option.id === value,
    );

  const normalizedQuery =
    query.trim().toLowerCase();

  const filteredOptions =
    useMemo(() => {
      if (!normalizedQuery) {
        return options;
      }

      return options.filter(
        (option) => {
          const searchableText = [
            option.label,
            option.secondaryLabel,
            ...(option.searchTerms ?? []),
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

          return searchableText.includes(
            normalizedQuery,
          );
        },
      );
    }, [
      normalizedQuery,
      options,
    ]);

  const closeModal = () => {
    setOpen(false);
    setQuery("");
  };

  const selectOption = (
    option: SelectOption,
  ) => {
    onChange(option.id, option);
    closeModal();
  };

  return (
    <View style={styles.selectContainer}>
      <Text
        style={[
          styles.fieldLabel,
          {
            textAlign: isRtl
              ? "right"
              : "left",
            writingDirection: isRtl
              ? "rtl"
              : "ltr",
          },
        ]}
      >
        {label}
      </Text>

      <Pressable
        accessibilityRole="button"
        accessibilityState={{
          disabled,
          expanded: open,
        }}
        disabled={disabled}
        onPress={() => setOpen(true)}
        style={({ pressed }) => [
          styles.selectButton,
          disabled &&
            styles.selectButtonDisabled,
          error &&
            styles.selectButtonError,
          pressed &&
            !disabled &&
            styles.selectButtonPressed,
        ]}
      >
        <View
          style={[
            styles.selectButtonContent,
            {
              flexDirection: isRtl
                ? "row-reverse"
                : "row",
            },
          ]}
        >
          <Ionicons
            name={icon}
            size={20}
            color={
              disabled
                ? KhedmatPalette.disabled
                : KhedmatPalette.blue500
            }
          />

          <Text
            numberOfLines={1}
            style={[
              styles.selectValue,
              !selectedOption &&
                styles.selectPlaceholder,
              {
                textAlign: isRtl
                  ? "right"
                  : "left",
                writingDirection: isRtl
                  ? "rtl"
                  : "ltr",
              },
            ]}
          >
            {selectedOption?.label ??
              placeholder}
          </Text>

          <Ionicons
            name="chevron-down"
            size={19}
            color={
              disabled
                ? KhedmatPalette.disabled
                : KhedmatPalette.textMuted
            }
          />
        </View>
      </Pressable>

      {error ? (
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
            color={
              KhedmatPalette.error
            }
          />

          <Text
            style={[
              styles.errorText,
              {
                textAlign: isRtl
                  ? "right"
                  : "left",
                writingDirection: isRtl
                  ? "rtl"
                  : "ltr",
              },
            ]}
          >
            {error}
          </Text>
        </View>
      ) : null}

      <Modal
        visible={open}
        transparent
        animationType="slide"
        onRequestClose={closeModal}
      >
        <SafeAreaView
          style={styles.modalOverlay}
        >
          <Pressable
            style={styles.modalBackdrop}
            onPress={closeModal}
          />

          <View
            style={styles.modalSheet}
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
              <Text
                style={[
                  styles.modalTitle,
                  {
                    textAlign: isRtl
                      ? "right"
                      : "left",
                    writingDirection:
                      isRtl
                        ? "rtl"
                        : "ltr",
                  },
                ]}
              >
                {title}
              </Text>

              <Pressable
                accessibilityRole="button"
                onPress={closeModal}
                style={({ pressed }) => [
                  styles.closeButton,
                  pressed &&
                    styles.closeButtonPressed,
                ]}
              >
                <Ionicons
                  name="close"
                  size={22}
                  color={
                    KhedmatPalette.navy900
                  }
                />
              </Pressable>
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
                size={20}
                color={
                  KhedmatPalette.textMuted
                }
              />

              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder={
                  searchPlaceholder
                }
                placeholderTextColor={
                  KhedmatPalette.textMuted
                }
                selectionColor={
                  KhedmatPalette.blue500
                }
                autoFocus
                style={[
                  styles.searchInput,
                  {
                    textAlign: isRtl
                      ? "right"
                      : "left",
                    writingDirection:
                      isRtl
                        ? "rtl"
                        : "ltr",
                  },
                ]}
              />

              {query.length > 0 ? (
                <Pressable
                  hitSlop={8}
                  onPress={() =>
                    setQuery("")
                  }
                >
                  <Ionicons
                    name="close-circle"
                    size={19}
                    color={
                      KhedmatPalette.textMuted
                    }
                  />
                </Pressable>
              ) : null}
            </View>

            <FlatList
              data={filteredOptions}
              keyExtractor={(item) =>
                item.id
              }
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={
                false
              }
              contentContainerStyle={
                styles.optionsList
              }
              ListEmptyComponent={
                <View
                  style={
                    styles.emptyState
                  }
                >
                  <Ionicons
                    name="search-outline"
                    size={30}
                    color={
                      KhedmatPalette.textMuted
                    }
                  />

                  <Text
                    style={[
                      styles.emptyText,
                      {
                        writingDirection:
                          isRtl
                            ? "rtl"
                            : "ltr",
                      },
                    ]}
                  >
                    {emptyMessage}
                  </Text>
                </View>
              }
              renderItem={({ item }) => {
                const selected =
                  item.id === value;

                return (
                  <Pressable
                    onPress={() =>
                      selectOption(item)
                    }
                    style={({ pressed }) => [
                      styles.optionRow,
                      {
                        flexDirection: isRtl
                          ? "row-reverse"
                          : "row",
                      },
                      selected &&
                        styles.optionRowSelected,
                      pressed &&
                        styles.optionRowPressed,
                    ]}
                  >
                    <View
                      style={
                        styles.optionCopy
                      }
                    >
                      <Text
                        style={[
                          styles.optionLabel,
                          {
                            textAlign: isRtl
                              ? "right"
                              : "left",
                            writingDirection:
                              isRtl
                                ? "rtl"
                                : "ltr",
                          },
                        ]}
                      >
                        {item.label}
                      </Text>

                      {item.secondaryLabel ? (
                        <Text
                          style={[
                            styles.optionSecondary,
                            {
                              textAlign: isRtl
                                ? "right"
                                : "left",
                            },
                          ]}
                        >
                          {
                            item.secondaryLabel
                          }
                        </Text>
                      ) : null}
                    </View>

                    <View
                      style={[
                        styles.radioCircle,
                        selected &&
                          styles.radioCircleSelected,
                      ]}
                    >
                      {selected ? (
                        <Ionicons
                          name="checkmark"
                          size={14}
                          color={
                            KhedmatPalette.white
                          }
                        />
                      ) : null}
                    </View>
                  </Pressable>
                );
              }}
            />
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  );
}

function getAddressNote(
  language: string,
): string {
  if (language === "Dari") {
    return "جزئیات دقیق آدرس به ارائه‌دهنده کمک می‌کند محل شما را سریع‌تر پیدا کند.";
  }

  if (language === "Pashto") {
    return "د پتې دقیق معلومات له خدمت وړاندې کوونکي سره مرسته کوي چې ستاسو ځای ژر پیدا کړي.";
  }

  return "A precise address helps the provider find your location more quickly.";
}

const styles = StyleSheet.create({
  content: {
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xxl,
  },

  topBar: {
    width: "100%",
    minHeight:
      Layout.minimumTouchTarget,
    alignItems: "flex-start",
  },

  backButton: {
    width: 44,
    height: 44,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      KhedmatPalette.surface,
    borderWidth: 1,
    borderColor:
      KhedmatPalette.border,
  },

  backButtonPressed: {
    opacity: 0.78,
    transform: [{ scale: 0.96 }],
  },

  hero: {
    width: "100%",
    marginTop: Spacing.lg,
    alignItems: "center",
  },

  iconCircle: {
    width: 88,
    height: 88,
    marginBottom: Spacing.xl,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      KhedmatPalette.navy900,
    ...Shadows.darkAccent,
  },

  title: {
    ...Typography.screenTitle,
    width: "100%",
    maxWidth:
      Layout.readableTextMaxWidth,
    color:
      KhedmatPalette.textPrimary,
    textAlign: "center",
  },

  subtitle: {
    ...Typography.bodyStyle,
    width: "100%",
    maxWidth:
      Layout.readableTextMaxWidth,
    marginTop: Spacing.sm,
    color:
      KhedmatPalette.textSecondary,
    textAlign: "center",
    lineHeight: 24,
  },

  formCard: {
    marginTop: Spacing.xxl,
  },

  formCardContent: {
    padding: Spacing.lg,
  },

  form: {
    width: "100%",
    gap: Spacing.lg,
  },

  footer: {
    width: "100%",
  },

  notesInput: {
    minHeight: 112,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
  },

  locationNote: {
    width: "100%",
    marginTop: Spacing.lg,
    alignItems: "center",
    gap: Spacing.sm,
  },

  locationNoteText: {
    ...Typography.captionStyle,
    flex: 1,
    color:
      KhedmatPalette.textSecondary,
    lineHeight: 18,
  },

  selectContainer: {
    width: "100%",
    gap: 7,
  },

  fieldLabel: {
    ...Typography.label,
    width: "100%",
    color:
      KhedmatPalette.textPrimary,
  },

  selectButton: {
    width: "100%",
    minHeight:
      Layout.controlHeight,
    justifyContent: "center",
    paddingHorizontal: Spacing.lg,
    borderWidth: 1,
    borderColor:
      KhedmatPalette.border,
    borderRadius: Radius.lg,
    backgroundColor:
      KhedmatPalette.surface,
  },

  selectButtonDisabled: {
    backgroundColor:
      KhedmatPalette.surfaceSoft,
    opacity: 0.65,
  },

  selectButtonError: {
    borderColor:
      KhedmatPalette.error,
    backgroundColor:
      KhedmatPalette.errorSoft,
  },

  selectButtonPressed: {
    opacity: 0.85,
  },

  selectButtonContent: {
    width: "100%",
    alignItems: "center",
    gap: Spacing.md,
  },

  selectValue: {
    ...Typography.bodyStyle,
    flex: 1,
    color:
      KhedmatPalette.textPrimary,
  },

  selectPlaceholder: {
    color:
      KhedmatPalette.textMuted,
  },

  errorRow: {
    width: "100%",
    alignItems: "center",
    gap: 5,
  },

  errorText: {
    ...Typography.captionStyle,
    flex: 1,
    color:
      KhedmatPalette.error,
  },

  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor:
      "rgba(0, 27, 72, 0.32)",
  },

  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },

  modalSheet: {
    maxHeight: "78%",
    paddingHorizontal:
      Layout.screenPadding,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xxl,
    borderTopLeftRadius:
      Radius.xxl,
    borderTopRightRadius:
      Radius.xxl,
    backgroundColor:
      KhedmatPalette.blue050,
    ...Shadows.medium,
  },

  modalHeader: {
    width: "100%",
    alignItems: "center",
    justifyContent:
      "space-between",
    gap: Spacing.md,
  },

  modalTitle: {
    ...Typography.sectionTitle,
    flex: 1,
    color:
      KhedmatPalette.textPrimary,
  },

  closeButton: {
    width: 40,
    height: 40,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      KhedmatPalette.surface,
    borderWidth: 1,
    borderColor:
      KhedmatPalette.border,
  },

  closeButtonPressed: {
    opacity: 0.72,
  },

  searchBox: {
    width: "100%",
    minHeight: 52,
    marginTop: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    alignItems: "center",
    gap: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor:
      KhedmatPalette.border,
    backgroundColor:
      KhedmatPalette.surface,
  },

  searchInput: {
    flex: 1,
    minHeight: 52,
    paddingVertical: 0,
    fontFamily: Fonts.regular,
    fontSize: Typography.body,
    color:
      KhedmatPalette.textPrimary,
  },

  optionsList: {
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xxl,
    gap: Spacing.sm,
  },

  optionRow: {
    width: "100%",
    minHeight: 68,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    alignItems: "center",
    gap: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor:
      KhedmatPalette.border,
    backgroundColor:
      KhedmatPalette.surface,
  },

  optionRowSelected: {
    borderColor:
      KhedmatPalette.blue500,
    backgroundColor:
      KhedmatPalette.surfaceSoft,
  },

  optionRowPressed: {
    opacity: 0.82,
  },

  optionCopy: {
    flex: 1,
    gap: 2,
  },

  optionLabel: {
    ...Typography.label,
    width: "100%",
    color:
      KhedmatPalette.textPrimary,
  },

  optionSecondary: {
    ...Typography.captionStyle,
    width: "100%",
    color:
      KhedmatPalette.textMuted,
  },

  radioCircle: {
    width: 26,
    height: 26,
    flexShrink: 0,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor:
      KhedmatPalette.border,
    backgroundColor:
      KhedmatPalette.surface,
  },

  radioCircleSelected: {
    borderColor:
      KhedmatPalette.blue500,
    backgroundColor:
      KhedmatPalette.blue500,
  },

  emptyState: {
    minHeight: 180,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.md,
  },

  emptyText: {
    ...Typography.bodyStyle,
    color:
      KhedmatPalette.textSecondary,
    textAlign: "center",
  },
});