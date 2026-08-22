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
import { provinces } from "../data/afghanistan-addresses";

type IconName =
  ComponentProps<typeof Ionicons>["name"];

type LanguageName =
  | "English"
  | "Dari"
  | "Pashto";

type ServiceMode =
  | "customer-location"
  | "provider-location"
  | "remote";

type ServiceModeOption = {
  id: ServiceMode;
  icon: IconName;
};

type RadiusId =
  | "5"
  | "10"
  | "20"
  | "30"
  | "district-wide";

type RadiusOption = {
  id: RadiusId;
  icon: IconName;
};

type PickerOption = {
  id: string;
  title: string;
  subtitle?: string;
  searchTerms?: string[];
};

type PickerType =
  | "province"
  | "district"
  | "radius"
  | null;

type ServiceAreaCopy = ReturnType<
  typeof getServiceAreaCopy
>;

const CURRENT_STEP = 4;
const TOTAL_STEPS = 6;

const ERROR = "#B3261E";
const INFO_SOFT = "#E5F4F8";

const SERVICE_MODES: ServiceModeOption[] = [
  {
    id: "customer-location",
    icon: "home-outline",
  },
  {
    id: "provider-location",
    icon: "business-outline",
  },
  {
    id: "remote",
    icon: "videocam-outline",
  },
];

const RADIUS_OPTIONS: RadiusOption[] = [
  {
    id: "5",
    icon: "walk-outline",
  },
  {
    id: "10",
    icon: "bicycle-outline",
  },
  {
    id: "20",
    icon: "car-outline",
  },
  {
    id: "30",
    icon: "navigate-outline",
  },
  {
    id: "district-wide",
    icon: "map-outline",
  },
];

export default function ProviderServiceAreaScreen() {
  const router = useRouter();

  const params =
    useLocalSearchParams<{
      category?: string | string[];
      services?: string | string[];
      experience?: string | string[];
      businessName?: string | string[];
      description?: string | string[];
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
    getServiceAreaCopy(
      activeLanguage,
    );

  const categoryId =
    getSingleParam(
      params.category,
    );

  const servicesParam =
    getSingleParam(
      params.services,
    );

  const experienceId =
    getSingleParam(
      params.experience,
    );

  const businessName =
    getSingleParam(
      params.businessName,
    );

  const description =
    getSingleParam(
      params.description,
    );

  const [
    provinceId,
    setProvinceId,
  ] = useState("");

  const [
    districtId,
    setDistrictId,
  ] = useState("");

  const [
    radiusId,
    setRadiusId,
  ] = useState<RadiusId | "">(
    "",
  );

  const [
    selectedModes,
    setSelectedModes,
  ] = useState<ServiceMode[]>([]);

  const [
    submitted,
    setSubmitted,
  ] = useState(false);

  const [
    pickerType,
    setPickerType,
  ] = useState<PickerType>(
    null,
  );

  const provinceOptions =
    useMemo<PickerOption[]>(
      () =>
        provinces.map(
          (province) => ({
            id: province.id,
            title:
              activeLanguage ===
              "English"
                ? province.nameEn
                : province.nameFa,
            subtitle:
              activeLanguage ===
              "English"
                ? province.nameFa
                : province.nameEn,
            searchTerms: [
              province.nameFa,
              province.nameEn,
              province.code,
            ],
          }),
        ),
      [activeLanguage],
    );

  const selectedProvince =
    useMemo(
      () =>
        provinces.find(
          (province) =>
            province.id ===
            provinceId,
        ) ?? null,
      [provinceId],
    );

  const districtOptions =
    useMemo<PickerOption[]>(
      () =>
        selectedProvince?.districts.map(
          (district) => ({
            id: district.id,
            title:
              activeLanguage ===
              "English"
                ? district.nameEn
                : district.nameFa,
            subtitle:
              activeLanguage ===
              "English"
                ? district.nameFa
                : district.nameEn,
            searchTerms: [
              district.nameFa,
              district.nameEn,
              district.code,
            ],
          }),
        ) ?? [],
      [
        activeLanguage,
        selectedProvince,
      ],
    );

  const selectedDistrict =
    useMemo(
      () =>
        selectedProvince?.districts.find(
          (district) =>
            district.id ===
            districtId,
        ) ?? null,
      [
        districtId,
        selectedProvince,
      ],
    );

  const selectedRadius =
    useMemo(
      () =>
        RADIUS_OPTIONS.find(
          (option) =>
            option.id ===
            radiusId,
        ) ?? null,
      [radiusId],
    );

  const requiresTravelRadius =
    selectedModes.includes(
      "customer-location",
    );

  const provinceError =
    submitted && !provinceId
      ? copy.provinceError
      : undefined;

  const districtError =
    submitted && !districtId
      ? copy.districtError
      : undefined;

  const radiusError =
    submitted &&
    requiresTravelRadius &&
    !radiusId
      ? copy.radiusError
      : undefined;

  const modesError =
    submitted &&
    selectedModes.length === 0
      ? copy.modesError
      : undefined;

  const formIsValid =
    Boolean(provinceId) &&
    Boolean(districtId) &&
    selectedModes.length > 0 &&
    (!requiresTravelRadius ||
      Boolean(radiusId));

  const handleProvinceChange = (
    value: string,
  ) => {
    setProvinceId(value);
    setDistrictId("");

    if (submitted) {
      setSubmitted(false);
    }
  };

  const handleDistrictChange = (
    value: string,
  ) => {
    setDistrictId(value);

    if (submitted) {
      setSubmitted(false);
    }
  };

  const handleRadiusChange = (
    value: string,
  ) => {
    setRadiusId(
      value as RadiusId,
    );

    if (submitted) {
      setSubmitted(false);
    }
  };

  const toggleServiceMode = (
    mode: ServiceMode,
  ) => {
    setSelectedModes(
      (current) =>
        current.includes(mode)
          ? current.filter(
              (item) =>
                item !== mode,
            )
          : [...current, mode],
    );

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
        "/provider-availability",
      params: {
        category: categoryId,
        services:
          servicesParam,
        experience:
          experienceId,
        businessName,
        description,
        province: provinceId,
        provinceName:
          selectedProvince?.nameFa ??
          "",
        district: districtId,
        districtName:
          selectedDistrict?.nameFa ??
          "",
        radius: radiusId,
        serviceModes:
          selectedModes.join(","),
      },
    } as never);
  };

  const activePicker =
    getPickerConfiguration({
      pickerType,
      copy,
      provinceOptions,
      districtOptions,
      radiusOptions:
        RADIUS_OPTIONS.map(
          (option) => ({
            id: option.id,
            title:
              copy.radiusTitle(
                option.id,
              ),
            subtitle:
              copy.radiusSubtitle(
                option.id,
              ),
          }),
        ),
      selectedProvinceName:
        selectedProvince
          ? getLocationName(
              selectedProvince.nameFa,
              selectedProvince.nameEn,
              activeLanguage,
            )
          : "",
      selectedValue:
        pickerType ===
        "province"
          ? provinceId
          : pickerType ===
              "district"
            ? districtId
            : radiusId,
      onSelect:
        pickerType ===
        "province"
          ? handleProvinceChange
          : pickerType ===
              "district"
            ? handleDistrictChange
            : handleRadiusChange,
    });

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

          <View style={styles.form}>
            <SelectionField
              label={
                copy.provinceLabel
              }
              placeholder={
                copy.provincePlaceholder
              }
              value={
                selectedProvince
                  ? getLocationName(
                      selectedProvince.nameFa,
                      selectedProvince.nameEn,
                      activeLanguage,
                    )
                  : ""
              }
              icon="map-outline"
              error={provinceError}
              isRtl={isRtl}
              requiredLabel={
                copy.required
              }
              onPress={() =>
                setPickerType(
                  "province",
                )
              }
            />

            <SelectionField
              label={
                copy.districtLabel
              }
              placeholder={
                provinceId
                  ? copy.districtPlaceholder
                  : copy.selectProvinceFirst
              }
              value={
                selectedDistrict
                  ? getLocationName(
                      selectedDistrict.nameFa,
                      selectedDistrict.nameEn,
                      activeLanguage,
                    )
                  : ""
              }
              icon="location-outline"
              error={districtError}
              isRtl={isRtl}
              requiredLabel={
                copy.required
              }
              disabled={!provinceId}
              onPress={() =>
                setPickerType(
                  "district",
                )
              }
            />

            <View style={styles.section}>
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
                <View
                  style={[
                    styles.sectionTitleRow,
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
                      directionStyle(
                        isRtl,
                      ),
                    ]}
                  >
                    {
                      copy.serviceModeTitle
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


              </View>

              <View
                style={
                  styles.modeOptions
                }
              >
                {SERVICE_MODES.map(
                  (option) => {
                    const selected =
                      selectedModes.includes(
                        option.id,
                      );

                    return (
                      <ServiceModeCard
                        key={option.id}
                        option={option}
                        title={copy.modeTitle(
                          option.id,
                        )}
                        subtitle={copy.modeSubtitle(
                          option.id,
                        )}
                        selected={
                          selected
                        }
                        isRtl={isRtl}
                        onPress={() =>
                          toggleServiceMode(
                            option.id,
                          )
                        }
                      />
                    );
                  },
                )}
              </View>

              {modesError ? (
                <ErrorText
                  text={modesError}
                  isRtl={isRtl}
                />
              ) : null}
            </View>

            {requiresTravelRadius ? (
              <SelectionField
                label={
                  copy.radiusLabel
                }
                placeholder={
                  copy.radiusPlaceholder
                }
                value={
                  selectedRadius
                    ? copy.radiusTitle(
                        selectedRadius.id,
                      )
                    : ""
                }
                secondaryValue={
                  selectedRadius
                    ? copy.radiusSubtitle(
                        selectedRadius.id,
                      )
                    : undefined
                }
                icon={
                  selectedRadius?.icon ??
                  "navigate-outline"
                }
                error={radiusError}
                isRtl={isRtl}
                requiredLabel={
                  copy.required
                }
                onPress={() =>
                  setPickerType(
                    "radius",
                  )
                }
              />
            ) : null}

            {selectedProvince &&
            selectedDistrict ? (
              <View
                style={[
                  styles.summaryCard,
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
                    name="location-outline"
                    size={23}
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
                      styles.summaryLabel,
                      directionStyle(
                        isRtl,
                      ),
                    ]}
                  >
                    {
                      copy.primaryServiceLocation
                    }
                  </Text>

                  <Text
                    style={[
                      styles.summaryTitle,
                      directionStyle(
                        isRtl,
                      ),
                    ]}
                  >
                    {copy.locationSummary(
                      getLocationName(
                        selectedDistrict.nameFa,
                        selectedDistrict.nameEn,
                        activeLanguage,
                      ),
                      getLocationName(
                        selectedProvince.nameFa,
                        selectedProvince.nameEn,
                        activeLanguage,
                      ),
                    )}
                  </Text>


                </View>
              </View>
            ) : null}
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
                    KhedmatPalette
                      .white
                  }
                />
              </View>
            </Pressable>


          </View>
        </View>
      </View>

      {activePicker ? (
        <OptionPickerModal
          visible
          title={
            activePicker.title
          }
          subtitle={
            activePicker.subtitle
          }
          searchPlaceholder={
            activePicker.searchPlaceholder
          }
          emptyMessage={
            activePicker.emptyMessage
          }
          searchable={
            activePicker.searchable
          }
          options={
            activePicker.options
          }
          selectedValue={
            activePicker.selectedValue
          }
          isRtl={isRtl}
          copy={copy}
          onSelect={(value) => {
            activePicker.onSelect(
              value,
            );
            setPickerType(null);
          }}
          onClose={() =>
            setPickerType(null)
          }
        />
      ) : null}
    </SafeAreaView>
  );
}

type SelectionFieldProps = {
  label: string;
  placeholder: string;
  value: string;
  secondaryValue?: string;
  icon: IconName;
  error?: string;
  isRtl: boolean;
  requiredLabel: string;
  disabled?: boolean;
  onPress: () => void;
};

function SelectionField({
  label,
  placeholder,
  value,
  secondaryValue,
  icon,
  error,
  isRtl,
  requiredLabel,
  disabled = false,
  onPress,
}: SelectionFieldProps) {
  return (
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
            directionStyle(isRtl),
          ]}
        >
          {label}
        </Text>

        <Text
          style={[
            styles.requiredLabel,
            directionStyle(isRtl),
          ]}
        >
          {requiredLabel}
        </Text>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{
          disabled,
        }}
        disabled={disabled}
        onPress={onPress}
        style={({ pressed }) => [
          styles.selectControl,
          error &&
            styles.controlError,
          disabled &&
            styles.selectControlDisabled,
          pressed &&
            !disabled &&
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
              styles.selectIcon,
              value &&
                styles.selectIconSelected,
            ]}
          >
            <Ionicons
              name={icon}
              size={20}
              color={
                value
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
              numberOfLines={1}
              style={[
                styles.selectValue,
                !value &&
                  styles.selectPlaceholder,
                directionStyle(isRtl),
              ]}
            >
              {value || placeholder}
            </Text>

            {secondaryValue ? (
              <Text
                numberOfLines={1}
                style={[
                  styles.selectSecondaryValue,
                  directionStyle(
                    isRtl,
                  ),
                ]}
              >
                {secondaryValue}
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

      {error ? (
        <ErrorText
          text={error}
          isRtl={isRtl}
        />
      ) : null}
    </View>
  );
}

type ServiceModeCardProps = {
  option: ServiceModeOption;
  title: string;
  subtitle: string;
  selected: boolean;
  isRtl: boolean;
  onPress: () => void;
};

function ServiceModeCard({
  option,
  title,
  subtitle,
  selected,
  isRtl,
  onPress,
}: ServiceModeCardProps) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityLabel={title}
      accessibilityState={{
        checked: selected,
      }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.modeCard,
        selected &&
          styles.modeCardSelected,
        pressed &&
          styles.modeCardPressed,
      ]}
    >
      <View
        style={[
          styles.modeContent,
          {
            flexDirection: isRtl
              ? "row-reverse"
              : "row",
          },
        ]}
      >
        <View
          style={[
            styles.modeIcon,
            selected &&
              styles.modeIconSelected,
          ]}
        >
          <Ionicons
            name={option.icon}
            size={24}
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
            styles.modeCopy,
            {
              alignItems: isRtl
                ? "flex-end"
                : "flex-start",
            },
          ]}
        >
          <Text
            style={[
              styles.modeTitle,
              selected &&
                styles.modeTitleSelected,
              directionStyle(isRtl),
            ]}
          >
            {title}
          </Text>

          <Text
            style={[
              styles.modeSubtitle,
              directionStyle(isRtl),
            ]}
          >
            {subtitle}
          </Text>
        </View>

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
              size={17}
              color={
                KhedmatPalette.white
              }
            />
          ) : null}
        </View>
      </View>
    </Pressable>
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

type OptionPickerModalProps = {
  visible: boolean;
  title: string;
  subtitle: string;
  searchPlaceholder: string;
  emptyMessage: string;
  searchable: boolean;
  options: PickerOption[];
  selectedValue: string;
  isRtl: boolean;
  copy: ServiceAreaCopy;
  onSelect: (
    value: string,
  ) => void;
  onClose: () => void;
};

function OptionPickerModal({
  visible,
  title,
  subtitle,
  searchPlaceholder,
  emptyMessage,
  searchable,
  options,
  selectedValue,
  isRtl,
  copy,
  onSelect,
  onClose,
}: OptionPickerModalProps) {
  const [query, setQuery] =
    useState("");

  const normalizedQuery =
    query
      .trim()
      .toLocaleLowerCase();

  const filteredOptions =
    normalizedQuery
      ? options.filter(
          (option) =>
            [
              option.title,
              option.subtitle,
              ...(option.searchTerms ??
                []),
            ]
              .filter(Boolean)
              .join(" ")
              .toLocaleLowerCase()
              .includes(
                normalizedQuery,
              ),
        )
      : options;

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
                {title}
              </Text>

              <Text
                style={[
                  styles.modalSubtitle,
                  directionStyle(isRtl),
                ]}
              >
                {subtitle}
              </Text>
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={
                copy.close
              }
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

          {searchable ? (
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
                  KhedmatPalette
                    .blue500
                }
              />

              <TextInput
                value={query}
                onChangeText={
                  setQuery
                }
                placeholder={
                  searchPlaceholder
                }
                placeholderTextColor={
                  KhedmatPalette
                    .textMuted
                }
                selectionColor={
                  KhedmatPalette
                    .blue500
                }
                autoCorrect={false}
                style={[
                  styles.searchInput,
                  directionStyle(
                    isRtl,
                  ),
                ]}
              />
            </View>
          ) : null}

          <ScrollView
            showsVerticalScrollIndicator={
              false
            }
            keyboardShouldPersistTaps="handled"
            style={
              styles.optionsScroll
            }
            contentContainerStyle={
              styles.optionsContent
            }
          >
            {filteredOptions.map(
              (option) => {
                const selected =
                  option.id ===
                  selectedValue;

                return (
                  <Pressable
                    key={option.id}
                    accessibilityRole="radio"
                    accessibilityState={{
                      selected,
                    }}
                    accessibilityLabel={
                      option.title
                    }
                    onPress={() =>
                      onSelect(
                        option.id,
                      )
                    }
                    style={({ pressed }) => [
                      styles.optionRow,
                      selected &&
                        styles.optionRowSelected,
                      pressed &&
                        styles.controlPressed,
                    ]}
                  >
                    <View
                      style={[
                        styles.optionContent,
                        {
                          flexDirection: isRtl
                            ? "row-reverse"
                            : "row",
                        },
                      ]}
                    >
                      <View
                        style={[
                          styles.optionIcon,
                          selected &&
                            styles.optionIconSelected,
                        ]}
                      >
                        <Ionicons
                          name={
                            selected
                              ? "checkmark"
                              : "location-outline"
                          }
                          size={19}
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
                          styles.optionCopy,
                          {
                            alignItems: isRtl
                              ? "flex-end"
                              : "flex-start",
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.optionTitle,
                            selected &&
                              styles.optionTitleSelected,
                            directionStyle(
                              isRtl,
                            ),
                          ]}
                        >
                          {
                            option.title
                          }
                        </Text>

                        {option.subtitle ? (
                          <Text
                            style={[
                              styles.optionSubtitle,
                              directionStyle(
                                isRtl,
                              ),
                            ]}
                          >
                            {
                              option.subtitle
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
              },
            )}

            {filteredOptions.length ===
            0 ? (
              <View
                style={
                  styles.emptyOptions
                }
              >
                <Ionicons
                  name="search-outline"
                  size={30}
                  color={
                    KhedmatPalette
                      .blue500
                  }
                />

                <Text
                  style={[
                    styles.emptyOptionsText,
                    directionStyle(
                      isRtl,
                    ),
                  ]}
                >
                  {emptyMessage}
                </Text>
              </View>
            ) : null}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function getPickerConfiguration({
  pickerType,
  copy,
  provinceOptions,
  districtOptions,
  radiusOptions,
  selectedProvinceName,
  selectedValue,
  onSelect,
}: {
  pickerType: PickerType;
  copy: ServiceAreaCopy;
  provinceOptions: PickerOption[];
  districtOptions: PickerOption[];
  radiusOptions: PickerOption[];
  selectedProvinceName: string;
  selectedValue: string;
  onSelect: (
    value: string,
  ) => void;
}) {
  if (pickerType === "province") {
    return {
      title:
        copy.provincePickerTitle,
      subtitle:
        copy.provincePickerSubtitle,
      searchPlaceholder:
        copy.provinceSearchPlaceholder,
      emptyMessage:
        copy.provinceEmpty,
      searchable: true,
      options: provinceOptions,
      selectedValue,
      onSelect,
    };
  }

  if (pickerType === "district") {
    return {
      title:
        copy.districtPickerTitle,
      subtitle:
        copy.districtPickerSubtitle(
          selectedProvinceName,
        ),
      searchPlaceholder:
        copy.districtSearchPlaceholder,
      emptyMessage:
        copy.districtEmpty,
      searchable: true,
      options: districtOptions,
      selectedValue,
      onSelect,
    };
  }

  if (pickerType === "radius") {
    return {
      title:
        copy.radiusPickerTitle,
      subtitle:
        copy.radiusPickerSubtitle,
      searchPlaceholder: "",
      emptyMessage: "",
      searchable: false,
      options: radiusOptions,
      selectedValue,
      onSelect,
    };
  }

  return null;
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

function getLocationName(
  nameFa: string,
  nameEn: string,
  language: LanguageName,
): string {
  return language === "English"
    ? nameEn
    : nameFa;
}

function getSecondaryLocationName(
  nameFa: string,
  nameEn: string,
  language: LanguageName,
): string {
  return language === "English"
    ? nameFa
    : nameEn;
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

function getServiceAreaCopy(
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
        "محدودهٔ فعالیت",
      title:
        "در کدام منطقه خدمات ارائه می‌کنید؟",
      subtitle:
        "محل اصلی فعالیت و روش ارائهٔ خدمات خود را مشخص کنید تا درخواست‌های مناسب‌تری دریافت نمایید.",
      required: "ضروری",
      provinceLabel:
        "ولایت محل فعالیت",
      provincePlaceholder:
        "انتخاب ولایت",
      provincePickerTitle:
        "انتخاب ولایت",
      provincePickerSubtitle:
        "ولایت اصلی فعالیت خود را انتخاب کنید.",
      provinceSearchPlaceholder:
        "جستجوی ولایت...",
      provinceEmpty:
        "ولایتی پیدا نشد.",
      provinceError:
        "لطفاً ولایت محل فعالیت خود را انتخاب کنید.",
      districtLabel:
        "شهر یا ولسوالی",
      districtPlaceholder:
        "انتخاب شهر یا ولسوالی",
      selectProvinceFirst:
        "ابتدا ولایت را انتخاب کنید",
      districtPickerTitle:
        "انتخاب شهر یا ولسوالی",
      districtPickerSubtitle:
        (province: string) =>
          province
            ? `منطقهٔ فعالیت خود در ولایت ${province} را انتخاب کنید.`
            : "ابتدا ولایت محل فعالیت را انتخاب کنید.",
      districtSearchPlaceholder:
        "جستجوی شهر یا ولسوالی...",
      districtEmpty:
        "شهر یا ولسوالی پیدا نشد.",
      districtError:
        "لطفاً شهر یا ولسوالی محل فعالیت خود را انتخاب کنید.",
      serviceModeTitle:
        "روش ارائهٔ خدمت",
      serviceModeSubtitle:
        "می‌توانید بیش از یک گزینه را انتخاب کنید.",
      modeTitle:
        (mode: ServiceMode) =>
          ({
            "customer-location":
              "در محل مشتری",
            "provider-location":
              "در محل کار من",
            remote:
              "خدمت آنلاین یا از راه دور",
          })[mode],
      modeSubtitle:
        (mode: ServiceMode) =>
          ({
            "customer-location":
              "برای انجام خدمت به خانه، دفتر یا محل مشتری می‌روم.",
            "provider-location":
              "مشتری برای دریافت خدمت به محل کار من مراجعه می‌کند.",
            remote:
              "این خدمت بدون حضور فیزیکی و به‌صورت آنلاین انجام می‌شود.",
          })[mode],
      modesError:
        "حداقل یک روش ارائهٔ خدمت را انتخاب کنید.",
      radiusLabel:
        "محدودهٔ رفت‌وآمد",
      radiusPlaceholder:
        "انتخاب شعاع خدمات",
      radiusPickerTitle:
        "محدودهٔ رفت‌وآمد",
      radiusPickerSubtitle:
        "حداکثر فاصله‌ای را که برای انجام خدمت طی می‌کنید انتخاب نمایید.",
      radiusError:
        "لطفاً محدودهٔ رفت‌وآمد خود را انتخاب کنید.",
      radiusTitle:
        (id: string) =>
          ({
            "5": "تا ۵ کیلومتر",
            "10": "تا ۱۰ کیلومتر",
            "20": "تا ۲۰ کیلومتر",
            "30": "تا ۳۰ کیلومتر",
            "district-wide":
              "تمام شهر یا ولسوالی",
          })[id] ?? id,
      radiusSubtitle:
        (id: string) =>
          ({
            "5": "مناسب برای یک محدودهٔ نزدیک",
            "10":
              "پوشش چند ناحیهٔ نزدیک",
            "20":
              "پوشش گسترده‌تر در شهر",
            "30":
              "مناسب برای خدمات سیار",
            "district-wide":
              "بدون محدودیت کیلومتری در ولسوالی",
          })[id] ?? "",
      primaryServiceLocation:
        "محل اصلی فعالیت",
      locationSummary:
        (
          district: string,
          province: string,
        ) =>
          `${district}، ${province}`,
      summarySubtitle:
        "بعداً می‌توانید مناطق بیشتری را به پروفایل خود اضافه کنید.",
      noticeTitle:
        "محدودهٔ واقعی خود را ثبت کنید",
      noticeText:
        "انتخاب دقیق منطقه و شعاع رفت‌وآمد باعث می‌شود درخواست‌هایی دریافت کنید که واقعاً امکان انجام آن‌ها را دارید.",
      continue:
        "ادامه به برنامهٔ کاری",
      helperText:
        "این معلومات برای نمایش درخواست‌های نزدیک و مرتبط استفاده می‌شود.",
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
      eyebrow:
        "د فعالیت ساحه",
      title:
        "تاسو په کومه سیمه کې خدمتونه وړاندې کوئ؟",
      subtitle:
        "خپله اصلي کاري سیمه او د خدمت وړاندې کولو طریقه وټاکئ، څو مناسبې غوښتنې ترلاسه کړئ.",
      required: "اړین",
      provinceLabel:
        "د فعالیت ولایت",
      provincePlaceholder:
        "ولایت وټاکئ",
      provincePickerTitle:
        "ولایت وټاکئ",
      provincePickerSubtitle:
        "خپل اصلي کاري ولایت وټاکئ.",
      provinceSearchPlaceholder:
        "ولایت ولټوئ...",
      provinceEmpty:
        "کوم ولایت ونه موندل شو.",
      provinceError:
        "مهرباني وکړئ خپل کاري ولایت وټاکئ.",
      districtLabel:
        "ښار یا ولسوالۍ",
      districtPlaceholder:
        "ښار یا ولسوالۍ وټاکئ",
      selectProvinceFirst:
        "لومړی ولایت وټاکئ",
      districtPickerTitle:
        "ښار یا ولسوالۍ وټاکئ",
      districtPickerSubtitle:
        (province: string) =>
          province
            ? `په ${province} ولایت کې خپله کاري سیمه وټاکئ.`
            : "لومړی خپل کاري ولایت وټاکئ.",
      districtSearchPlaceholder:
        "ښار یا ولسوالۍ ولټوئ...",
      districtEmpty:
        "ښار یا ولسوالۍ ونه موندل شوه.",
      districtError:
        "مهرباني وکړئ خپل کاري ښار یا ولسوالۍ وټاکئ.",
      serviceModeTitle:
        "د خدمت وړاندې کولو طریقه",
      serviceModeSubtitle:
        "تاسو کولی شئ له یوې څخه ډېرې لارې وټاکئ.",
      modeTitle:
        (mode: ServiceMode) =>
          ({
            "customer-location":
              "د پیرودونکي په ځای کې",
            "provider-location":
              "زما د کار په ځای کې",
            remote:
              "آنلاین یا له لیرې خدمت",
          })[mode],
      modeSubtitle:
        (mode: ServiceMode) =>
          ({
            "customer-location":
              "زه د خدمت لپاره د پیرودونکي کور، دفتر یا ځای ته ځم.",
            "provider-location":
              "پیرودونکی د خدمت لپاره زما کاري ځای ته راځي.",
            remote:
              "دا خدمت له فزیکي حضور پرته آنلاین ترسره کېږي.",
          })[mode],
      modesError:
        "لږ تر لږه د خدمت یوه طریقه وټاکئ.",
      radiusLabel:
        "د تګ راتګ ساحه",
      radiusPlaceholder:
        "د خدمت شعاع وټاکئ",
      radiusPickerTitle:
        "د تګ راتګ ساحه",
      radiusPickerSubtitle:
        "هغه اعظمي واټن وټاکئ چې د خدمت لپاره یې سفر کولی شئ.",
      radiusError:
        "مهرباني وکړئ د تګ راتګ ساحه وټاکئ.",
      radiusTitle:
        (id: string) =>
          ({
            "5": "تر ۵ کیلومتره",
            "10": "تر ۱۰ کیلومتره",
            "20": "تر ۲۰ کیلومتره",
            "30": "تر ۳۰ کیلومتره",
            "district-wide":
              "ټول ښار یا ولسوالۍ",
          })[id] ?? id,
      radiusSubtitle:
        (id: string) =>
          ({
            "5":
              "د نږدې سیمې لپاره مناسب",
            "10":
              "څو نږدې سیمې پوښي",
            "20":
              "په ښار کې پراخه پوښښ",
            "30":
              "د ګرځنده خدمتونو لپاره مناسب",
            "district-wide":
              "په ولسوالۍ کې بې کیلومتري محدودیت",
          })[id] ?? "",
      primaryServiceLocation:
        "اصلي کاري ځای",
      locationSummary:
        (
          district: string,
          province: string,
        ) =>
          `${district}، ${province}`,
      summarySubtitle:
        "وروسته کولی شئ نورې سیمې هم خپل پروفایل ته ورزیاتې کړئ.",
      noticeTitle:
        "خپله حقیقي کاري ساحه ثبت کړئ",
      noticeText:
        "دقیقې سیمې او د سفر شعاع ټاکل تاسو ته هغه غوښتنې ښيي چې عملي کول یې رښتیا ممکن وي.",
      continue:
        "کاري مهال‌وېش ته دوام",
      helperText:
        "دا معلومات د نږدې او اړوندو غوښتنو د ښودلو لپاره کارول کېږي.",
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
    eyebrow: "Service area",
    title:
      "Where do you provide services?",
    subtitle:
      "Set your primary work location and service methods so you receive more relevant customer requests.",
    required: "Required",
    provinceLabel:
      "Primary province",
    provincePlaceholder:
      "Select a province",
    provincePickerTitle:
      "Select a province",
    provincePickerSubtitle:
      "Choose the main province where you work.",
    provinceSearchPlaceholder:
      "Search provinces...",
    provinceEmpty:
      "No province found.",
    provinceError:
      "Please select your primary work province.",
    districtLabel:
      "City or district",
    districtPlaceholder:
      "Select a city or district",
    selectProvinceFirst:
      "Select a province first",
    districtPickerTitle:
      "Select a city or district",
    districtPickerSubtitle:
      (province: string) =>
        province
          ? `Choose your work area in ${province}.`
          : "Select your primary province first.",
    districtSearchPlaceholder:
      "Search cities or districts...",
    districtEmpty:
      "No city or district found.",
    districtError:
      "Please select your primary city or district.",
    serviceModeTitle:
      "How you provide services",
    serviceModeSubtitle:
      "You may select more than one option.",
    modeTitle:
      (mode: ServiceMode) =>
        ({
          "customer-location":
            "At the customer’s location",
          "provider-location":
            "At my workplace",
          remote:
            "Online or remote service",
        })[mode],
    modeSubtitle:
      (mode: ServiceMode) =>
        ({
          "customer-location":
            "I travel to the customer’s home, office or other location.",
          "provider-location":
            "The customer visits my workplace to receive the service.",
          remote:
            "The service is completed online without physical attendance.",
        })[mode],
    modesError:
      "Select at least one service method.",
    radiusLabel:
      "Travel radius",
    radiusPlaceholder:
      "Select your service radius",
    radiusPickerTitle:
      "Travel radius",
    radiusPickerSubtitle:
      "Choose the maximum distance you can travel to complete a service.",
    radiusError:
      "Please select your travel radius.",
    radiusTitle:
      (id: string) =>
        ({
          "5": "Up to 5 km",
          "10": "Up to 10 km",
          "20": "Up to 20 km",
          "30": "Up to 30 km",
          "district-wide":
            "Entire city or district",
        })[id] ?? id,
    radiusSubtitle:
      (id: string) =>
        ({
          "5":
            "Suitable for a nearby area",
          "10":
            "Covers several nearby areas",
          "20":
            "Wider coverage across the city",
          "30":
            "Suitable for mobile services",
          "district-wide":
            "No kilometre restriction within the district",
        })[id] ?? "",
    primaryServiceLocation:
      "Primary service location",
    locationSummary:
      (
        district: string,
        province: string,
      ) =>
        `${district}, ${province}`,
    summarySubtitle:
      "You can add more service areas to your profile later.",
    noticeTitle:
      "Set a realistic service area",
    noticeText:
      "Accurate location and travel-radius settings help you receive requests you can genuinely complete.",
    continue:
      "Continue",
    helperText:
      "This information is used to show nearby and relevant requests.",
    close: "Close",
  };
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor:
      KhedmatPalette.white,
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
    marginTop: Spacing.lg,
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
      KhedmatPalette.navy900,
    fontSize: 28,
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
  form: {
    width: "100%",
    marginTop: Spacing.xl,
    gap: Spacing.xl,
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
  requiredLabel: {
    ...Typography.captionStyle,
    color:
      KhedmatPalette.blue500,
    fontFamily: Fonts.medium,
    fontSize: 10,
  },
  selectControl: {
    width: "100%",
    minHeight: 68,
    paddingHorizontal:
      Spacing.md,
    justifyContent: "center",
    borderWidth: 1,
    borderColor:
      KhedmatPalette.border,
    borderRadius: Radius.lg,
    backgroundColor:
      KhedmatPalette.surface,
    ...Shadows.small,
  },
  selectControlDisabled: {
    opacity: 0.5,
    shadowOpacity: 0,
    elevation: 0,
  },
  selectContent: {
    width: "100%",
    alignItems: "center",
    gap: Spacing.md,
  },
  selectIcon: {
    width: 40,
    height: 40,
    flexShrink: 0,
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      KhedmatPalette.surfaceSoft,
  },
  selectIconSelected: {
    backgroundColor:
      KhedmatPalette.blue500,
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
  controlError: {
    borderColor: ERROR,
    backgroundColor:
      "#FFF9F8",
  },
  controlPressed: {
    opacity: 0.86,
  },
  section: {
    width: "100%",
    gap: Spacing.md,
  },
  sectionHeader: {
    width: "100%",
    gap: Spacing.xs,
  },
  sectionTitleRow: {
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
    fontSize: 20,
    lineHeight: 27,
  },
  sectionSubtitle: {
    ...Typography.captionStyle,
    width: "100%",
    color:
      KhedmatPalette.textMuted,
    lineHeight: 18,
  },
  modeOptions: {
    width: "100%",
    gap: Spacing.md,
  },
  modeCard: {
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
  modeCardSelected: {
    borderColor:
      KhedmatPalette.blue500,
    backgroundColor: "#F4FBFC",
  },
  modeCardPressed: {
    opacity: 0.88,
    transform: [
      {
        scale: 0.993,
      },
    ],
  },
  modeContent: {
    width: "100%",
    minHeight: 100,
    padding: Spacing.md,
    alignItems: "center",
    gap: Spacing.md,
  },
  modeIcon: {
    width: 50,
    height: 50,
    flexShrink: 0,
    borderRadius: Radius.lg,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      KhedmatPalette.surfaceSoft,
  },
  modeIconSelected: {
    backgroundColor:
      KhedmatPalette.blue500,
  },
  modeCopy: {
    flex: 1,
    gap: Spacing.xs,
  },
  modeTitle: {
    ...Typography.label,
    width: "100%",
    color:
      KhedmatPalette.textPrimary,
    fontSize: 17,
    lineHeight: 23,
  },
  modeTitleSelected: {
    color:
      KhedmatPalette.navy900,
    fontFamily: Fonts.bold,
  },
  modeSubtitle: {
    ...Typography.captionStyle,
    width: "100%",
    color:
      KhedmatPalette.textSecondary,
    lineHeight: 19,
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
  summaryCard: {
    width: "100%",
    minHeight: 106,
    padding: Spacing.lg,
    alignItems: "center",
    gap: Spacing.md,
    borderWidth: 1,
    borderColor:
      KhedmatPalette.blue200,
    borderRadius: Radius.xl,
    backgroundColor: "#F4FBFC",
  },
  summaryIcon: {
    width: 48,
    height: 48,
    flexShrink: 0,
    borderRadius: Radius.lg,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      KhedmatPalette.surface,
  },
  summaryCopy: {
    flex: 1,
    gap: Spacing.xs,
  },
  summaryLabel: {
    ...Typography.captionStyle,
    width: "100%",
    color:
      KhedmatPalette.blue500,
    fontFamily: Fonts.medium,
  },
  summaryTitle: {
    ...Typography.label,
    width: "100%",
    color:
      KhedmatPalette.textPrimary,
    fontSize: 17,
    lineHeight: 23,
  },
  summarySubtitle: {
    ...Typography.captionStyle,
    width: "100%",
    color:
      KhedmatPalette.textMuted,
    lineHeight: 18,
  },
  noticeCard: {
    width: "100%",
    minHeight: 108,
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
  noticeIcon: {
    width: 40,
    height: 40,
    flexShrink: 0,
    borderRadius: Radius.lg,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      KhedmatPalette.surface,
  },
  noticeCopy: {
    flex: 1,
    gap: 3,
  },
  noticeTitle: {
    ...Typography.label,
    width: "100%",
    color:
      KhedmatPalette.textPrimary,
    fontSize: 15,
  },
  noticeText: {
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
      KhedmatPalette.white,
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
  helperText: {
    ...Typography.captionStyle,
    width: "100%",
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
    maxHeight: "82%",
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
    lineHeight: 18,
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
  searchBox: {
    width: "100%",
    minHeight: 52,
    marginTop: Spacing.lg,
    paddingHorizontal:
      Spacing.md,
    alignItems: "center",
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor:
      KhedmatPalette.border,
    borderRadius: Radius.lg,
    backgroundColor:
      KhedmatPalette.surfaceSoft,
  },
  searchInput: {
    flex: 1,
    minHeight: 52,
    paddingVertical: 0,
    color:
      KhedmatPalette.textPrimary,
    fontFamily: Fonts.regular,
    fontSize: 15,
  },
  optionsScroll: {
    marginTop: Spacing.lg,
  },
  optionsContent: {
    gap: Spacing.sm,
    paddingBottom: Spacing.sm,
  },
  optionRow: {
    width: "100%",
    minHeight: 66,
    borderWidth: 1,
    borderColor:
      KhedmatPalette.border,
    borderRadius: Radius.lg,
    backgroundColor:
      KhedmatPalette.surface,
  },
  optionRowSelected: {
    borderColor:
      KhedmatPalette.blue500,
    backgroundColor: "#F4FBFC",
  },
  optionContent: {
    width: "100%",
    minHeight: 66,
    paddingHorizontal:
      Spacing.md,
    paddingVertical:
      Spacing.sm,
    alignItems: "center",
    gap: Spacing.md,
  },
  optionIcon: {
    width: 40,
    height: 40,
    flexShrink: 0,
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      KhedmatPalette.surfaceSoft,
  },
  optionIconSelected: {
    backgroundColor:
      KhedmatPalette.blue500,
  },
  optionCopy: {
    flex: 1,
    gap: 2,
  },
  optionTitle: {
    ...Typography.label,
    width: "100%",
    color:
      KhedmatPalette.textPrimary,
    fontSize: 15,
  },
  optionTitleSelected: {
    color:
      KhedmatPalette.navy900,
    fontFamily: Fonts.bold,
  },
  optionSubtitle: {
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
  emptyOptions: {
    minHeight: 180,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.md,
  },
  emptyOptionsText: {
    ...Typography.bodyStyle,
    color:
      KhedmatPalette.textSecondary,
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
