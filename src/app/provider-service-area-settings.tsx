import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import {
  useCallback,
  useMemo,
  useState,
} from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { KhedmatButton } from "../components/khedmat/khedmat-button";
import { KhedmatCard } from "../components/khedmat/khedmat-card";
import { KhedmatScreen } from "../components/khedmat/khedmat-screen";
import {
  KhedmatPalette,
  Layout,
  Radius,
  Spacing,
  Typography,
} from "../constants/theme";
import { useLanguage } from "../context/languagecontext";
import { useSession } from "../context/session-context";
import {
  provinces,
  type District,
  type Province,
} from "../data/afghanistan-addresses";
import {
  getProviderAccount,
  updateProviderAccount,
  type ProviderAccountRow,
} from "../repositories/provider-account-repository";

type ServiceMode =
  | "customer-location"
  | "provider-location"
  | "remote";

type RadiusKm =
  | 5
  | 10
  | 20
  | 30;

type PickerType =
  | "province"
  | "district"
  | null;

const SERVICE_MODES: ServiceMode[] = [
  "customer-location",
  "provider-location",
  "remote",
];

const RADIUS_OPTIONS: RadiusKm[] = [
  5,
  10,
  20,
  30,
];

export default function ProviderServiceAreaSettingsScreen() {
  const router = useRouter();

  const {
    t,
    language,
    isRTL,
    rowDirection,
    textDirection,
  } = useLanguage();

  const {
    activeProviderId,
  } = useSession();

  const [
    provider,
    setProvider,
  ] = useState<ProviderAccountRow | null>(
    null,
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
    serviceModes,
    setServiceModes,
  ] = useState<ServiceMode[]>([]);

  const [
    radiusKm,
    setRadiusKm,
  ] = useState<RadiusKm>(10);

  const [
    pickerType,
    setPickerType,
  ] = useState<PickerType>(
    null,
  );

  const [
    isLoading,
    setIsLoading,
  ] = useState(true);

  const [
    isSaving,
    setIsSaving,
  ] = useState(false);

  const [
    loadFailed,
    setLoadFailed,
  ] = useState(false);

  const isEnglish =
    language === "English";

  const selectedProvince =
    useMemo<Province | null>(
      () =>
        provinces.find(
          (province) =>
            province.id ===
            provinceId,
        ) ?? null,
      [provinceId],
    );

  const selectedDistrict =
    useMemo<District | null>(
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

  useFocusEffect(
    useCallback(() => {
    let isMounted = true;

    const load =
      async (): Promise<void> => {
        if (!activeProviderId) {
          if (isMounted) {
            setProvider(null);
            setLoadFailed(true);
            setIsLoading(false);
          }

          return;
        }

        setIsLoading(true);
        setLoadFailed(false);

        try {
          const account =
            await getProviderAccount(
              activeProviderId,
            );

          if (!isMounted) {
            return;
          }

          if (!account) {
            setProvider(null);
            setLoadFailed(true);
            return;
          }

          setProvider(account);
          setProvinceId(
            account.province_id,
          );
          setDistrictId(
            account.district_id,
          );
          setServiceModes(
            normalizeServiceModes(
              account.service_modes,
            ),
          );
          setRadiusKm(
            normalizeRadius(
              account.service_radius_km,
            ),
          );
        } catch (error) {
          console.error(
            "Failed to load provider service area settings:",
            error,
          );

          if (isMounted) {
            setProvider(null);
            setLoadFailed(true);
          }
        } finally {
          if (isMounted) {
            setIsLoading(false);
          }
        }
      };

    void load();

    return () => {
      isMounted = false;
    };

    }, [activeProviderId]),
  );

  const hasChanges =
    useMemo(() => {
      if (!provider) {
        return false;
      }

      return (
        provinceId !==
          provider.province_id ||
        districtId !==
          provider.district_id ||
        !sameModes(
          serviceModes,
          normalizeServiceModes(
            provider.service_modes,
          ),
        ) ||
        radiusKm !==
          normalizeRadius(
            provider.service_radius_km,
          )
      );
    }, [
      districtId,
      provider,
      provinceId,
      radiusKm,
      serviceModes,
    ]);

  const requiresTravelRadius =
    serviceModes.includes(
      "customer-location",
    );

  const handleProvinceChange =
    (
      nextProvinceId: string,
    ): void => {
      setProvinceId(
        nextProvinceId,
      );
      setDistrictId("");
      setPickerType(null);
    };

  const handleDistrictChange =
    (
      nextDistrictId: string,
    ): void => {
      setDistrictId(
        nextDistrictId,
      );
      setPickerType(null);
    };

  const toggleServiceMode =
    (
      mode:
        ServiceMode,
    ): void => {
      setServiceModes(
        (current) =>
          current.includes(mode)
            ? current.filter(
                (item) =>
                  item !== mode,
              )
            : [
                ...current,
                mode,
              ],
      );
    };

  const handleSave =
    async (): Promise<void> => {
      if (
        !provider ||
        !activeProviderId ||
        isSaving
      ) {
        return;
      }

      if (!provinceId) {
        Alert.alert(
          t(
            "providerServiceAreaSettingsTitle",
          ),
          t(
            "providerServiceAreaProvinceRequired",
          ),
        );
        return;
      }

      if (!districtId) {
        Alert.alert(
          t(
            "providerServiceAreaSettingsTitle",
          ),
          t(
            "providerServiceAreaDistrictRequired",
          ),
        );
        return;
      }

      if (
        serviceModes.length === 0
      ) {
        Alert.alert(
          t(
            "providerServiceAreaSettingsTitle",
          ),
          t(
            "providerServiceAreaModeRequired",
          ),
        );
        return;
      }

      if (
        requiresTravelRadius &&
        !radiusKm
      ) {
        Alert.alert(
          t(
            "providerServiceAreaSettingsTitle",
          ),
          t(
            "providerServiceAreaRadiusRequired",
          ),
        );
        return;
      }

      if (
        !selectedProvince ||
        !selectedDistrict
      ) {
        Alert.alert(
          t(
            "providerServiceAreaSaveFailedTitle",
          ),
          t(
            "providerServiceAreaSaveFailedMessage",
          ),
        );
        return;
      }

      setIsSaving(true);

      try {
        const provinceName =
          selectedProvince.nameFa;

        const districtName =
          selectedDistrict.nameFa;

        const locationLabel =
          [
            districtName,
            provinceName,
          ]
            .filter(Boolean)
            .join("، ");

        const updated =
          await updateProviderAccount(
            activeProviderId,
            {
              province_id:
                selectedProvince.id,
              province_name:
                provinceName,
              district_id:
                selectedDistrict.id,
              district_name:
                districtName,
              location_label:
                locationLabel,
              service_modes:
                serviceModes,
              service_radius_km:
                radiusKm,
            },
          );

        setProvider(updated);

        Alert.alert(
          t(
            "providerServiceAreaSavedTitle",
          ),
          t(
            "providerServiceAreaSavedMessage",
          ),
          [
            {
              text: t(
                "okAction",
              ),
              onPress: () =>
                router.back(),
            },
          ],
        );
      } catch (error) {
        console.error(
          "Failed to save provider service area settings:",
          error,
        );

        Alert.alert(
          t(
            "providerServiceAreaSaveFailedTitle",
          ),
          t(
            "providerServiceAreaSaveFailedMessage",
          ),
        );
      } finally {
        setIsSaving(false);
      }
    };

  if (isLoading) {
    return (
      <KhedmatScreen>
        <Header
          isRTL={isRTL}
          rowDirection={
            rowDirection
          }
          textDirection={
            textDirection
          }
          title={t(
            "providerServiceAreaSettingsTitle",
          )}
          subtitle={t(
            "providerServiceAreaSettingsSubtitle",
          )}
          backLabel={t("back")}
          onBack={() =>
            router.back()
          }
        />

        <View
          style={
            styles.loadingState
          }
        >
          <ActivityIndicator
            size="large"
            color={
              KhedmatPalette.blue500
            }
          />
        </View>
      </KhedmatScreen>
    );
  }

  if (
    loadFailed ||
    !provider
  ) {
    return (
      <KhedmatScreen>
        <Header
          isRTL={isRTL}
          rowDirection={
            rowDirection
          }
          textDirection={
            textDirection
          }
          title={t(
            "providerServiceAreaSettingsTitle",
          )}
          subtitle={t(
            "providerServiceAreaSettingsSubtitle",
          )}
          backLabel={t("back")}
          onBack={() =>
            router.back()
          }
        />

        <KhedmatCard
          variant="soft"
        >
          <View
            style={
              styles.errorState
            }
          >
            <View
              style={
                styles.errorIcon
              }
            >
              <Ionicons
                name="alert-circle-outline"
                size={28}
                color={
                  KhedmatPalette.error
                }
              />
            </View>

            <Text
              style={[
                styles.errorTitle,
                {
                  writingDirection:
                    textDirection,
                },
              ]}
            >
              {t(
                "providerServiceAreaLoadFailedTitle",
              )}
            </Text>

            <Text
              style={[
                styles.errorBody,
                {
                  writingDirection:
                    textDirection,
                },
              ]}
            >
              {t(
                "providerServiceAreaLoadFailedMessage",
              )}
            </Text>
          </View>
        </KhedmatCard>
      </KhedmatScreen>
    );
  }

  return (
    <>
      <KhedmatScreen
        scrollable
        contentStyle={
          styles.screenContent
        }
        footer={
          <KhedmatButton
            label={
              isSaving
                ? t(
                    "providerServiceAreaSaving",
                  )
                : t(
                    "providerServiceAreaSave",
                  )
            }
            loading={isSaving}
            disabled={
              isSaving ||
              !hasChanges
            }
            onPress={() => {
              void handleSave();
            }}
          />
        }
      >
        <Header
          isRTL={isRTL}
          rowDirection={
            rowDirection
          }
          textDirection={
            textDirection
          }
          title={t(
            "providerServiceAreaSettingsTitle",
          )}
          subtitle={t(
            "providerServiceAreaSettingsSubtitle",
          )}
          backLabel={t("back")}
          onBack={() =>
            router.back()
          }
        />

        <Text
          style={[
            styles.sectionTitle,
            {
              textAlign: isRTL
                ? "right"
                : "left",
              writingDirection:
                textDirection,
            },
          ]}
        >
          {t(
            "providerServiceAreaLocationSection",
          )}
        </Text>

        <View
          style={
            styles.locationFields
          }
        >
          <SelectionField
            label={t(
              "providerServiceAreaProvince",
            )}
            value={
              selectedProvince
                ? getLocationName(
                    selectedProvince,
                    isEnglish,
                  )
                : t(
                    "providerServiceAreaSelectProvince",
                  )
            }
            placeholder={
              !selectedProvince
            }
            isRTL={isRTL}
            rowDirection={
              rowDirection
            }
            textDirection={
              textDirection
            }
            onPress={() =>
              setPickerType(
                "province",
              )
            }
          />

          <SelectionField
            label={t(
              "providerServiceAreaDistrict",
            )}
            value={
              selectedDistrict
                ? getDistrictName(
                    selectedDistrict,
                    isEnglish,
                  )
                : t(
                    "providerServiceAreaSelectDistrict",
                  )
            }
            placeholder={
              !selectedDistrict
            }
            disabled={
              !selectedProvince
            }
            isRTL={isRTL}
            rowDirection={
              rowDirection
            }
            textDirection={
              textDirection
            }
            onPress={() =>
              setPickerType(
                "district",
              )
            }
          />
        </View>

        <Text
          style={[
            styles.sectionTitle,
            styles.sectionSpacing,
            {
              textAlign: isRTL
                ? "right"
                : "left",
              writingDirection:
                textDirection,
            },
          ]}
        >
          {t(
            "providerServiceAreaServiceModes",
          )}
        </Text>

        <Text
          style={[
            styles.sectionHint,
            {
              textAlign: isRTL
                ? "right"
                : "left",
              writingDirection:
                textDirection,
            },
          ]}
        >
          {t(
            "providerServiceAreaServiceModesHint",
          )}
        </Text>

        <View
          style={
            styles.modeList
          }
        >
          {SERVICE_MODES.map(
            (mode) => (
              <ServiceModeRow
                key={mode}
                mode={mode}
                selected={
                  serviceModes.includes(
                    mode,
                  )
                }
                title={t(
                  serviceModeTitleKey(
                    mode,
                  ),
                )}
                subtitle={t(
                  serviceModeSubtitleKey(
                    mode,
                  ),
                )}
                isRTL={isRTL}
                rowDirection={
                  rowDirection
                }
                textDirection={
                  textDirection
                }
                onPress={() =>
                  toggleServiceMode(
                    mode,
                  )
                }
              />
            ),
          )}
        </View>

        {requiresTravelRadius ? (
          <>
            <Text
              style={[
                styles.sectionTitle,
                styles.sectionSpacing,
                {
                  textAlign: isRTL
                    ? "right"
                    : "left",
                  writingDirection:
                    textDirection,
                },
              ]}
            >
              {t(
                "providerServiceAreaTravelRadius",
              )}
            </Text>

            <Text
              style={[
                styles.sectionHint,
                {
                  textAlign: isRTL
                    ? "right"
                    : "left",
                  writingDirection:
                    textDirection,
                },
              ]}
            >
              {t(
                "providerServiceAreaTravelRadiusHint",
              )}
            </Text>

            <View
              style={
                styles.radiusGrid
              }
            >
              {RADIUS_OPTIONS.map(
                (radius) => {
                  const selected =
                    radiusKm ===
                    radius;

                  return (
                    <Pressable
                      key={radius}
                      accessibilityRole="button"
                      accessibilityState={{
                        selected,
                      }}
                      onPress={() =>
                        setRadiusKm(
                          radius,
                        )
                      }
                      style={({
                        pressed,
                      }) => [
                        styles.radiusChip,
                        selected &&
                          styles.radiusChipSelected,
                        pressed &&
                          styles.pressed,
                      ]}
                    >
                      <Text
                        style={[
                          styles.radiusChipText,
                          selected &&
                            styles.radiusChipTextSelected,
                          {
                            writingDirection:
                              textDirection,
                          },
                        ]}
                      >
                        {t(
                          radiusKey(
                            radius,
                          ),
                        )}
                      </Text>
                    </Pressable>
                  );
                },
              )}
            </View>
          </>
        ) : null}

        <View
          style={[
            styles.coverageNotice,
            {
              flexDirection:
                rowDirection,
            },
          ]}
        >
          <Ionicons
            name="information-circle-outline"
            size={20}
            color={
              KhedmatPalette.blue500
            }
          />

          <Text
            style={[
              styles.coverageNoticeText,
              {
                textAlign: isRTL
                  ? "right"
                  : "left",
                writingDirection:
                  textDirection,
              },
            ]}
          >
            {t(
              "providerServiceAreaCoverageNote",
            )}
          </Text>
        </View>
      </KhedmatScreen>

      <Modal
        visible={
          pickerType !== null
        }
        transparent
        animationType="fade"
        onRequestClose={() =>
          setPickerType(null)
        }
      >
        <Pressable
          style={
            styles.modalBackdrop
          }
          onPress={() =>
            setPickerType(null)
          }
        >
          <Pressable
            style={
              styles.modalCard
            }
            onPress={(event) =>
              event.stopPropagation()
            }
          >
            <Text
              style={[
                styles.modalTitle,
                {
                  textAlign: isRTL
                    ? "right"
                    : "left",
                  writingDirection:
                    textDirection,
                },
              ]}
            >
              {pickerType ===
              "province"
                ? t(
                    "providerServiceAreaProvince",
                  )
                : t(
                    "providerServiceAreaDistrict",
                  )}
            </Text>

            <View
              style={
                styles.pickerList
              }
            >
              {pickerType ===
              "province"
                ? provinces.map(
                    (province) => {
                      const selected =
                        province.id ===
                        provinceId;

                      return (
                        <Pressable
                          key={
                            province.id
                          }
                          onPress={() =>
                            handleProvinceChange(
                              province.id,
                            )
                          }
                          style={({
                            pressed,
                          }) => [
                            styles.pickerRow,
                            {
                              flexDirection:
                                rowDirection,
                            },
                            selected &&
                              styles.pickerRowSelected,
                            pressed &&
                              styles.pressed,
                          ]}
                        >
                          <Text
                            style={[
                              styles.pickerLabel,
                              selected &&
                                styles.pickerLabelSelected,
                              {
                                textAlign:
                                  isRTL
                                    ? "right"
                                    : "left",
                                writingDirection:
                                  textDirection,
                              },
                            ]}
                          >
                            {getLocationName(
                              province,
                              isEnglish,
                            )}
                          </Text>

                          {selected ? (
                            <Ionicons
                              name="checkmark-circle"
                              size={22}
                              color={
                                KhedmatPalette.blue500
                              }
                            />
                          ) : null}
                        </Pressable>
                      );
                    },
                  )
                : (
                    selectedProvince?.districts ??
                    []
                  ).map(
                    (district) => {
                      const selected =
                        district.id ===
                        districtId;

                      return (
                        <Pressable
                          key={
                            district.id
                          }
                          onPress={() =>
                            handleDistrictChange(
                              district.id,
                            )
                          }
                          style={({
                            pressed,
                          }) => [
                            styles.pickerRow,
                            {
                              flexDirection:
                                rowDirection,
                            },
                            selected &&
                              styles.pickerRowSelected,
                            pressed &&
                              styles.pressed,
                          ]}
                        >
                          <Text
                            style={[
                              styles.pickerLabel,
                              selected &&
                                styles.pickerLabelSelected,
                              {
                                textAlign:
                                  isRTL
                                    ? "right"
                                    : "left",
                                writingDirection:
                                  textDirection,
                              },
                            ]}
                          >
                            {getDistrictName(
                              district,
                              isEnglish,
                            )}
                          </Text>

                          {selected ? (
                            <Ionicons
                              name="checkmark-circle"
                              size={22}
                              color={
                                KhedmatPalette.blue500
                              }
                            />
                          ) : null}
                        </Pressable>
                      );
                    },
                  )}
            </View>

            <KhedmatButton
              label={t(
                "cancelAction",
              )}
              variant="text"
              onPress={() =>
                setPickerType(
                  null,
                )
              }
            />
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

type HeaderProps = {
  isRTL: boolean;
  rowDirection:
    | "row"
    | "row-reverse";
  textDirection:
    | "ltr"
    | "rtl";
  title: string;
  subtitle: string;
  backLabel: string;
  onBack: () => void;
};

function Header({
  isRTL,
  rowDirection,
  textDirection,
  title,
  subtitle,
  backLabel,
  onBack,
}: HeaderProps) {
  return (
    <View
      style={[
        styles.header,
        {
          flexDirection:
            rowDirection,
        },
      ]}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={
          backLabel
        }
        onPress={onBack}
        style={({ pressed }) => [
          styles.backButton,
          pressed &&
            styles.pressed,
        ]}
      >
        <Ionicons
          name={
            isRTL
              ? "chevron-forward"
              : "chevron-back"
          }
          size={22}
          color={
            KhedmatPalette.navy900
          }
        />
      </Pressable>

      <View
        style={
          styles.headerCopy
        }
      >
        <Text
          style={[
            styles.title,
            {
              textAlign: isRTL
                ? "right"
                : "left",
              writingDirection:
                textDirection,
            },
          ]}
        >
          {title}
        </Text>

        <Text
          style={[
            styles.subtitle,
            {
              textAlign: isRTL
                ? "right"
                : "left",
              writingDirection:
                textDirection,
            },
          ]}
        >
          {subtitle}
        </Text>
      </View>
    </View>
  );
}

type SelectionFieldProps = {
  label: string;
  value: string;
  placeholder: boolean;
  disabled?: boolean;
  isRTL: boolean;
  rowDirection:
    | "row"
    | "row-reverse";
  textDirection:
    | "ltr"
    | "rtl";
  onPress: () => void;
};

function SelectionField({
  label,
  value,
  placeholder,
  disabled = false,
  isRTL,
  rowDirection,
  textDirection,
  onPress,
}: SelectionFieldProps) {
  return (
    <View
      style={
        styles.selectionField
      }
    >
      <Text
        style={[
          styles.selectionLabel,
          {
            textAlign: isRTL
              ? "right"
              : "left",
            writingDirection:
              textDirection,
          },
        ]}
      >
        {label}
      </Text>

      <Pressable
        accessibilityRole="button"
        disabled={disabled}
        onPress={onPress}
        style={({ pressed }) => [
          styles.selectionButton,
          {
            flexDirection:
              rowDirection,
          },
          disabled &&
            styles.disabled,
          pressed &&
            !disabled &&
            styles.pressed,
        ]}
      >
        <Text
          style={[
            styles.selectionValue,
            placeholder &&
              styles.selectionPlaceholder,
            {
              textAlign: isRTL
                ? "right"
                : "left",
              writingDirection:
                textDirection,
            },
          ]}
        >
          {value}
        </Text>

        <Ionicons
          name={
            isRTL
              ? "chevron-back"
              : "chevron-forward"
          }
          size={20}
          color={
            KhedmatPalette.textSecondary
          }
        />
      </Pressable>
    </View>
  );
}

type ServiceModeRowProps = {
  mode: ServiceMode;
  selected: boolean;
  title: string;
  subtitle: string;
  isRTL: boolean;
  rowDirection:
    | "row"
    | "row-reverse";
  textDirection:
    | "ltr"
    | "rtl";
  onPress: () => void;
};

function ServiceModeRow({
  mode,
  selected,
  title,
  subtitle,
  isRTL,
  rowDirection,
  textDirection,
  onPress,
}: ServiceModeRowProps) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{
        checked: selected,
      }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.modeRow,
        {
          flexDirection:
            rowDirection,
        },
        selected &&
          styles.modeRowSelected,
        pressed &&
          styles.pressed,
      ]}
    >
      <View
        style={
          styles.modeIcon
        }
      >
        <Ionicons
          name={
            serviceModeIcon(
              mode,
            )
          }
          size={22}
          color={
            selected
              ? KhedmatPalette.blue500
              : KhedmatPalette.textSecondary
          }
        />
      </View>

      <View
        style={
          styles.modeCopy
        }
      >
        <Text
          style={[
            styles.modeTitle,
            {
              textAlign: isRTL
                ? "right"
                : "left",
              writingDirection:
                textDirection,
            },
          ]}
        >
          {title}
        </Text>

        <Text
          style={[
            styles.modeSubtitle,
            {
              textAlign: isRTL
                ? "right"
                : "left",
              writingDirection:
                textDirection,
            },
          ]}
        >
          {subtitle}
        </Text>
      </View>

      <Ionicons
        name={
          selected
            ? "checkmark-circle"
            : "ellipse-outline"
        }
        size={22}
        color={
          selected
            ? KhedmatPalette.blue500
            : KhedmatPalette.border
        }
      />
    </Pressable>
  );
}

function serviceModeTitleKey(
  mode: ServiceMode,
):
  | "providerServiceAreaCustomerLocation"
  | "providerServiceAreaProviderLocation"
  | "providerServiceAreaRemote" {
  if (
    mode ===
    "customer-location"
  ) {
    return "providerServiceAreaCustomerLocation";
  }

  if (
    mode ===
    "provider-location"
  ) {
    return "providerServiceAreaProviderLocation";
  }

  return "providerServiceAreaRemote";
}

function serviceModeSubtitleKey(
  mode: ServiceMode,
):
  | "providerServiceAreaCustomerLocationSubtitle"
  | "providerServiceAreaProviderLocationSubtitle"
  | "providerServiceAreaRemoteSubtitle" {
  if (
    mode ===
    "customer-location"
  ) {
    return "providerServiceAreaCustomerLocationSubtitle";
  }

  if (
    mode ===
    "provider-location"
  ) {
    return "providerServiceAreaProviderLocationSubtitle";
  }

  return "providerServiceAreaRemoteSubtitle";
}

function serviceModeIcon(
  mode: ServiceMode,
):
  | "home-outline"
  | "business-outline"
  | "videocam-outline" {
  if (
    mode ===
    "customer-location"
  ) {
    return "home-outline";
  }

  if (
    mode ===
    "provider-location"
  ) {
    return "business-outline";
  }

  return "videocam-outline";
}

function radiusKey(
  radius: RadiusKm,
):
  | "providerServiceAreaRadius5"
  | "providerServiceAreaRadius10"
  | "providerServiceAreaRadius20"
  | "providerServiceAreaRadius30" {
  if (radius === 5) {
    return "providerServiceAreaRadius5";
  }

  if (radius === 10) {
    return "providerServiceAreaRadius10";
  }

  if (radius === 20) {
    return "providerServiceAreaRadius20";
  }

  return "providerServiceAreaRadius30";
}

function normalizeServiceModes(
  value: string[] | null | undefined,
): ServiceMode[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return SERVICE_MODES.filter(
    (mode) =>
      value.includes(mode),
  );
}

function normalizeRadius(
  value: number,
): RadiusKm {
  if (
    value <= 5
  ) {
    return 5;
  }

  if (
    value <= 10
  ) {
    return 10;
  }

  if (
    value <= 20
  ) {
    return 20;
  }

  return 30;
}

function sameModes(
  left: ServiceMode[],
  right: ServiceMode[],
): boolean {
  if (
    left.length !== right.length
  ) {
    return false;
  }

  const leftSet =
    new Set(left);

  return right.every(
    (mode) =>
      leftSet.has(mode),
  );
}

function getLocationName(
  province: Province,
  english: boolean,
): string {
  return english
    ? province.nameEn
    : province.nameFa;
}

function getDistrictName(
  district: District,
  english: boolean,
): string {
  return english
    ? district.nameEn
    : district.nameFa;
}

const styles =
  StyleSheet.create({
    screenContent: {
      paddingTop:
        Spacing.md,
      paddingBottom:
        Spacing.xxl,
    },

    header: {
      width: "100%",
      maxWidth:
        Layout.contentMaxWidth,
      alignSelf: "center",
      alignItems:
        "flex-start",
      gap: Spacing.md,
      marginBottom:
        Spacing.xl,
    },

    backButton: {
      width: 40,
      height: 40,
      flexShrink: 0,
      alignItems: "center",
      justifyContent:
        "center",
      borderRadius:
        Radius.pill,
      backgroundColor:
        KhedmatPalette.white,
    },

    headerCopy: {
      flex: 1,
      minWidth: 0,
    },

    title: {
      ...Typography.screenTitle,
      color:
        KhedmatPalette.textPrimary,
      fontSize: 22,
      lineHeight: 28,
    },

    subtitle: {
      ...Typography.captionStyle,
      marginTop: 3,
      color:
        KhedmatPalette.textSecondary,
      lineHeight: 18,
    },

    loadingState: {
      flex: 1,
      alignItems: "center",
      justifyContent:
        "center",
    },

    errorState: {
      minHeight: 240,
      alignItems: "center",
      justifyContent:
        "center",
      padding:
        Spacing.xl,
    },

    errorIcon: {
      width: 56,
      height: 56,
      alignItems: "center",
      justifyContent:
        "center",
      borderRadius:
        Radius.pill,
      backgroundColor:
        KhedmatPalette.errorSoft,
      marginBottom:
        Spacing.md,
    },

    errorTitle: {
      ...Typography.sectionTitle,
      color:
        KhedmatPalette.textPrimary,
      textAlign: "center",
    },

    errorBody: {
      ...Typography.bodyStyle,
      marginTop:
        Spacing.xs,
      color:
        KhedmatPalette.textSecondary,
      textAlign: "center",
      lineHeight: 21,
    },

    sectionTitle: {
      ...Typography.sectionTitle,
      color:
        KhedmatPalette.textPrimary,
      fontSize: 18,
      lineHeight: 24,
    },

    sectionSpacing: {
      marginTop:
        Spacing.xl,
    },

    sectionHint: {
      ...Typography.captionStyle,
      marginTop:
        Spacing.xs,
      marginBottom:
        Spacing.md,
      color:
        KhedmatPalette.textSecondary,
      lineHeight: 18,
    },

    locationFields: {
      width: "100%",
      gap: Spacing.md,
      marginTop:
        Spacing.md,
    },

    selectionField: {
      width: "100%",
      gap: Spacing.xs,
    },

    selectionLabel: {
      ...Typography.label,
      color:
        KhedmatPalette.textPrimary,
      fontSize: 14,
    },

    selectionButton: {
      width: "100%",
      minHeight: 54,
      alignItems: "center",
      justifyContent:
        "space-between",
      gap: Spacing.sm,
      paddingHorizontal:
        Spacing.md,
      borderRadius:
        Radius.md,
      borderWidth: 1,
      borderColor:
        KhedmatPalette.blue200,
      backgroundColor:
        KhedmatPalette.white,
    },

    selectionValue: {
      ...Typography.bodyStyle,
      flex: 1,
      color:
        KhedmatPalette.textPrimary,
      fontSize: 15,
    },

    selectionPlaceholder: {
      color:
        KhedmatPalette.textMuted,
    },

    modeList: {
      width: "100%",
      gap: Spacing.sm,
    },

    modeRow: {
      width: "100%",
      minHeight: 82,
      alignItems: "center",
      gap: Spacing.md,
      paddingHorizontal:
        Spacing.md,
      paddingVertical:
        Spacing.md,
      borderRadius:
        Radius.lg,
      borderWidth: 1,
      borderColor:
        KhedmatPalette.blue200,
      backgroundColor:
        KhedmatPalette.white,
    },

    modeRowSelected: {
      borderColor:
        KhedmatPalette.blue500,
      backgroundColor:
        KhedmatPalette.blue050,
    },

    modeIcon: {
      width: 42,
      height: 42,
      flexShrink: 0,
      alignItems: "center",
      justifyContent:
        "center",
      borderRadius:
        Radius.md,
      backgroundColor:
        KhedmatPalette.surfaceSoft,
    },

    modeCopy: {
      flex: 1,
      minWidth: 0,
    },

    modeTitle: {
      ...Typography.label,
      color:
        KhedmatPalette.textPrimary,
      fontSize: 15,
    },

    modeSubtitle: {
      ...Typography.captionStyle,
      marginTop: 3,
      color:
        KhedmatPalette.textSecondary,
      lineHeight: 18,
    },

    radiusGrid: {
      width: "100%",
      flexDirection: "row",
      flexWrap: "wrap",
      gap: Spacing.sm,
    },

    radiusChip: {
      minWidth: 78,
      minHeight: 42,
      alignItems: "center",
      justifyContent:
        "center",
      paddingHorizontal:
        Spacing.md,
      borderRadius:
        Radius.pill,
      borderWidth: 1,
      borderColor:
        KhedmatPalette.blue200,
      backgroundColor:
        KhedmatPalette.white,
    },

    radiusChipSelected: {
      borderColor:
        KhedmatPalette.navy900,
      backgroundColor:
        KhedmatPalette.navy900,
    },

    radiusChipText: {
      ...Typography.captionStyle,
      color:
        KhedmatPalette.textPrimary,
      fontSize: 13,
    },

    radiusChipTextSelected: {
      color:
        KhedmatPalette.white,
    },

    coverageNotice: {
      width: "100%",
      alignItems:
        "flex-start",
      gap: Spacing.sm,
      marginTop:
        Spacing.xl,
      padding:
        Spacing.md,
      borderRadius:
        Radius.md,
      borderWidth:
        StyleSheet.hairlineWidth,
      borderColor:
        KhedmatPalette.blue200,
      backgroundColor:
        KhedmatPalette.blue050,
    },

    coverageNoticeText: {
      ...Typography.captionStyle,
      flex: 1,
      color:
        KhedmatPalette.textSecondary,
      lineHeight: 19,
    },

    modalBackdrop: {
      flex: 1,
      justifyContent:
        "center",
      padding:
        Spacing.xl,
      backgroundColor:
        "rgba(10, 31, 52, 0.35)",
    },

    modalCard: {
      width: "100%",
      maxWidth: 440,
      alignSelf: "center",
      maxHeight: "80%",
      padding:
        Spacing.lg,
      borderRadius:
        Radius.xl,
      backgroundColor:
        KhedmatPalette.white,
    },

    modalTitle: {
      ...Typography.sectionTitle,
      color:
        KhedmatPalette.textPrimary,
      marginBottom:
        Spacing.md,
    },

    pickerList: {
      width: "100%",
      gap: Spacing.xs,
      marginBottom:
        Spacing.md,
    },

    pickerRow: {
      width: "100%",
      minHeight: 50,
      alignItems: "center",
      justifyContent:
        "space-between",
      gap: Spacing.md,
      paddingHorizontal:
        Spacing.md,
      paddingVertical:
        Spacing.sm,
      borderRadius:
        Radius.md,
      backgroundColor:
        KhedmatPalette.white,
    },

    pickerRowSelected: {
      backgroundColor:
        KhedmatPalette.blue050,
    },

    pickerLabel: {
      ...Typography.bodyStyle,
      flex: 1,
      color:
        KhedmatPalette.textPrimary,
      fontSize: 15,
    },

    pickerLabelSelected: {
      color:
        KhedmatPalette.navy900,
    },

    disabled: {
      opacity: 0.45,
    },

    pressed: {
      opacity: 0.72,
    },
  });
