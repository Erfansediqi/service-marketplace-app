import { Ionicons } from "@expo/vector-icons";
import {
  useLocalSearchParams,
  useRouter,
} from "expo-router";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import MapView, {
  Region,
} from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";

import { KhedmatButton } from "../components/khedmat/khedmat-button";
import { KhedmatCard } from "../components/khedmat/khedmat-card";
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
  requestUserLocation,
  reverseGeocode,
} from "../services/location";

const DEFAULT_LOCATION = {
  latitude: 34.5553,
  longitude: 69.2075,
};

const DEFAULT_DELTA = {
  latitudeDelta: 0.008,
  longitudeDelta: 0.008,
};

const ADDRESS_REQUEST_DELAY = 550;

type AddressState = {
  title: string;
  details: string;
};

function parseCoordinate(
  value: string | string[] | undefined,
  fallback: number,
): number {
  const rawValue = Array.isArray(value)
    ? value[0]
    : value;

  const parsedValue = Number(rawValue);

  return Number.isFinite(parsedValue)
    ? parsedValue
    : fallback;
}

function joinAddressParts(
  values: Array<
    string | null | undefined
  >,
  isEnglish: boolean,
): string {
  const separator = isEnglish
    ? ", "
    : "، ";

  return values
    .map((value) => value?.trim())
    .filter(
      (
        value,
        index,
        array,
      ): value is string =>
        Boolean(value) &&
        array.indexOf(value) === index,
    )
    .join(separator);
}

export default function ConfirmLocationScreen() {
  const router = useRouter();

  const {
    t,
    language,
  } = useLanguage();

  const isEnglish =
    language === "English";

  const isRtl =
    language === "Dari" ||
    language === "Pashto";

  const params =
    useLocalSearchParams<{
      lat?: string | string[];
      lng?: string | string[];
    }>();

  const mapRef =
    useRef<MapView>(null);

  const geocodeRequestRef =
    useRef(0);

  const initialLatitude = useMemo(
    () =>
      parseCoordinate(
        params.lat,
        DEFAULT_LOCATION.latitude,
      ),
    [params.lat],
  );

  const initialLongitude = useMemo(
    () =>
      parseCoordinate(
        params.lng,
        DEFAULT_LOCATION.longitude,
      ),
    [params.lng],
  );

  const initialRegion =
    useMemo<Region>(
      () => ({
        latitude: initialLatitude,
        longitude: initialLongitude,
        ...DEFAULT_DELTA,
      }),
      [
        initialLatitude,
        initialLongitude,
      ],
    );

  const [
    selectedRegion,
    setSelectedRegion,
  ] = useState<Region>(
    initialRegion,
  );

  const [
    address,
    setAddress,
  ] = useState<AddressState>({
    title: t(
      "defaultAddressTitle",
    ),
    details: t(
      "defaultAddressDetails",
    ),
  });

  const [
    isMapReady,
    setIsMapReady,
  ] = useState(false);

  const [
    isMovingMap,
    setIsMovingMap,
  ] = useState(false);

  const [
    isResolvingAddress,
    setIsResolvingAddress,
  ] = useState(true);

  const [
    isLocatingUser,
    setIsLocatingUser,
  ] = useState(false);

  const [
    addressError,
    setAddressError,
  ] = useState<string | null>(
    null,
  );

  const resolveAddress =
    useCallback(
      async (
        latitude: number,
        longitude: number,
      ) => {
        const requestId =
          geocodeRequestRef.current +
          1;

        geocodeRequestRef.current =
          requestId;

        setIsResolvingAddress(true);
        setAddressError(null);

        try {
          const result =
            await reverseGeocode(
              latitude,
              longitude,
            );

          if (
            requestId !==
            geocodeRequestRef.current
          ) {
            return;
          }

          if (!result) {
            setAddress({
              title: t(
                "fallbackLocationTitle",
              ),
              details: t(
                "fallbackAddressDetails",
              ),
            });

            return;
          }

          const title =
            joinAddressParts(
              [
                result.name,
                result.street,
                result.district,
              ],
              isEnglish,
            ) ||
            t(
              "fallbackLocationTitle",
            );

          const details =
            joinAddressParts(
              [
                result.city,
                result.subregion,
                result.region,
                result.country,
              ],
              isEnglish,
            ) ||
            t(
              "fallbackAddressDetails",
            );

          setAddress({
            title,
            details,
          });
        } catch (error) {
          console.error(
            "Reverse geocoding failed:",
            error,
          );

          if (
            requestId !==
            geocodeRequestRef.current
          ) {
            return;
          }

          setAddressError(
            t(
              "coordinatesUnavailable",
            ),
          );

          setAddress({
            title: t(
              "fallbackLocationTitle",
            ),
            details: t(
              "fallbackAddressDetails",
            ),
          });
        } finally {
          if (
            requestId ===
            geocodeRequestRef.current
          ) {
            setIsResolvingAddress(
              false,
            );
          }
        }
      },
      [isEnglish, t],
    );

  useEffect(() => {
    const timer = setTimeout(
      () => {
        resolveAddress(
          selectedRegion.latitude,
          selectedRegion.longitude,
        );
      },
      ADDRESS_REQUEST_DELAY,
    );

    return () =>
      clearTimeout(timer);
  }, [
    resolveAddress,
    selectedRegion.latitude,
    selectedRegion.longitude,
  ]);

  const handleRegionChange = () => {
    setIsMovingMap(true);
  };

  const handleRegionChangeComplete = (
    region: Region,
  ) => {
    setSelectedRegion(region);
    setIsMovingMap(false);
  };

  const handleRecenter =
    async () => {
      if (isLocatingUser) {
        return;
      }

      setIsLocatingUser(true);
      setAddressError(null);

      try {
        const currentLocation =
          await requestUserLocation();

        if (!currentLocation) {
          Alert.alert(
            getLocationErrorTitle(
              language,
            ),
            getLocationErrorMessage(
              language,
            ),
          );

          return;
        }

        const targetRegion: Region = {
          latitude:
            currentLocation.latitude,
          longitude:
            currentLocation.longitude,
          ...DEFAULT_DELTA,
        };

        setIsMovingMap(true);

        mapRef.current?.animateToRegion(
          targetRegion,
          700,
        );

        /*
         * Keep state synchronized with the
         * exact region shown by the map.
         * onRegionChangeComplete will also
         * confirm this after the animation.
         */
        setSelectedRegion(
          targetRegion,
        );
      } catch (error) {
        console.error(
          "Unable to recenter map:",
          error,
        );

        Alert.alert(
          getLocationErrorTitle(
            language,
          ),
          getLocationErrorMessage(
            language,
          ),
        );
      } finally {
        setIsLocatingUser(false);
      }
    };

  const handleConfirmLocation =
    () => {
      Alert.alert(
        t(
          "confirmLocationHeader",
        ),
        `${address.title}\n${address.details}`,
        [
          {
            text: t("editAction"),
            style: "cancel",
          },
          {
            text: t(
              "confirmAction",
            ),
            onPress: () => {
              router.replace({
                pathname:
                  "/role-selection",
                params: {
                  latitude:
                    selectedRegion.latitude.toString(),
                  longitude:
                    selectedRegion.longitude.toString(),
                  addressTitle:
                    address.title,
                  addressDetails:
                    address.details,
                },
              });
            },
          },
        ],
      );
    };

  const handleManualAddress =
    () => {
      router.push(
        "/manual-address",
      );
    };

  const latitudeText =
    formatCoordinate(
      selectedRegion.latitude,
      isRtl,
    );

  const longitudeText =
    formatCoordinate(
      selectedRegion.longitude,
      isRtl,
    );

  const confirmDisabled =
    !isMapReady ||
    isMovingMap ||
    isResolvingAddress ||
    isLocatingUser;

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={
          StyleSheet.absoluteFill
        }
        initialRegion={
          initialRegion
        }
        showsUserLocation
        showsMyLocationButton={false}
        showsCompass={false}
        toolbarEnabled={false}
        loadingEnabled
        moveOnMarkerPress={false}
        onMapReady={() =>
          setIsMapReady(true)
        }
        onRegionChange={
          handleRegionChange
        }
        onRegionChangeComplete={
          handleRegionChangeComplete
        }
      />

      <SafeAreaView
        pointerEvents="box-none"
        style={styles.safeArea}
      >
        <View
          pointerEvents="box-none"
          style={styles.topControls}
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t(
              "back",
            )}
            onPress={() =>
              router.back()
            }
            style={({ pressed }) => [
              styles.iconButton,
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
                KhedmatPalette.navy900
              }
            />
          </Pressable>

          <View
            style={[
              styles.headerStatus,
              {
                flexDirection: isRtl
                  ? "row-reverse"
                  : "row",
              },
            ]}
          >
            <View
              style={
                styles.statusDot
              }
            />

            <Text
              numberOfLines={1}
              style={[
                styles.headerStatusText,
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
              {t(
                "confirmLocationHeader",
              )}
            </Text>
          </View>
        </View>

        {/*
         * The tip of this pin is positioned at
         * the exact visual center of MapView.
         *
         * selectedRegion is updated from the
         * map's center through
         * onRegionChangeComplete, so the pin and
         * coordinates now represent the same point.
         */}
        <View
          pointerEvents="none"
          style={
            styles.centerPinAnchor
          }
        >
          <View
            style={styles.pinShadow}
          />

          <View
            style={styles.pinBody}
          >
            <Ionicons
              name="location"
              size={30}
              color={
                KhedmatPalette.white
              }
            />
          </View>

          <View
            style={styles.pinTip}
          />
        </View>

        <View style={styles.lowerArea}>
          <View
            style={[
              styles.recenterRow,
              {
                justifyContent: isRtl
                  ? "flex-start"
                  : "flex-end",
              },
            ]}
          >
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t(
                "recenterLabel",
              )}
              disabled={
                isLocatingUser
              }
              onPress={
                handleRecenter
              }
              style={({ pressed }) => [
                styles.recenterButton,
                pressed &&
                  !isLocatingUser &&
                  styles.pressed,
              ]}
            >
              {isLocatingUser ? (
                <ActivityIndicator
                  size="small"
                  color={
                    KhedmatPalette.blue500
                  }
                />
              ) : (
                <Ionicons
                  name="navigate"
                  size={22}
                  color={
                    KhedmatPalette.blue500
                  }
                />
              )}
            </Pressable>
          </View>

          <KhedmatCard
            style={
              styles.bottomCard
            }
            contentStyle={
              styles.bottomCardContent
            }
          >
            <View
              style={[
                styles.addressHeader,
                {
                  flexDirection: isRtl
                    ? "row-reverse"
                    : "row",
                },
              ]}
            >
              <View
                style={
                  styles.addressIcon
                }
              >
                {isResolvingAddress ||
                isMovingMap ? (
                  <ActivityIndicator
                    size="small"
                    color={
                      KhedmatPalette.blue500
                    }
                  />
                ) : (
                  <Ionicons
                    name="location-outline"
                    size={22}
                    color={
                      KhedmatPalette.blue500
                    }
                  />
                )}
              </View>

              <View
                style={
                  styles.addressCopy
                }
              >
                <Text
                  style={[
                    styles.eyebrow,
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
                  {t(
                    "selectedLocationEyebrow",
                  )}
                </Text>

                <Text
                  numberOfLines={2}
                  style={[
                    styles.addressTitle,
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
                  {isMovingMap
                    ? t(
                        "movingMapTitle",
                      )
                    : address.title}
                </Text>

                <Text
                  numberOfLines={2}
                  style={[
                    styles.addressDetails,
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
                  {isMovingMap
                    ? t(
                        "movingMapDetails",
                      )
                    : address.details}
                </Text>
              </View>
            </View>

            {addressError ? (
              <View
                style={[
                  styles.warningRow,
                  {
                    flexDirection:
                      isRtl
                        ? "row-reverse"
                        : "row",
                  },
                ]}
              >
                <Ionicons
                  name="information-circle-outline"
                  size={17}
                  color={
                    KhedmatPalette.warning
                  }
                />

                <Text
                  style={[
                    styles.warningText,
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
                  {addressError}
                </Text>
              </View>
            ) : null}

            <View
              style={[
                styles.coordinates,
                {
                  flexDirection: isRtl
                    ? "row-reverse"
                    : "row",
                },
              ]}
            >
              <View
                style={
                  styles.coordinateItem
                }
              >
                <Text
                  style={[
                    styles.coordinateLabel,
                    {
                      writingDirection:
                        isRtl
                          ? "rtl"
                          : "ltr",
                    },
                  ]}
                >
                  {t(
                    "latitudeLabel",
                  )}
                </Text>

                <Text
                  style={
                    styles.coordinateValue
                  }
                >
                  {latitudeText}
                </Text>
              </View>

              <View
                style={
                  styles.coordinateDivider
                }
              />

              <View
                style={
                  styles.coordinateItem
                }
              >
                <Text
                  style={[
                    styles.coordinateLabel,
                    {
                      writingDirection:
                        isRtl
                          ? "rtl"
                          : "ltr",
                    },
                  ]}
                >
                  {t(
                    "longitudeLabel",
                  )}
                </Text>

                <Text
                  style={
                    styles.coordinateValue
                  }
                >
                  {longitudeText}
                </Text>
              </View>
            </View>

            <View
              style={styles.actions}
            >
              <KhedmatButton
                label={t(
                  "confirmLocationButton",
                )}
                disabled={
                  confirmDisabled
                }
                loading={
                  isResolvingAddress
                }
                onPress={
                  handleConfirmLocation
                }
              />

              <KhedmatButton
                label={t(
                  "manualAddressButton",
                )}
                variant="outline"
                onPress={
                  handleManualAddress
                }
              />
            </View>
          </KhedmatCard>
        </View>
      </SafeAreaView>
    </View>
  );
}

function formatCoordinate(
  value: number,
  useLocalizedDigits: boolean,
): string {
  const formatted =
    value.toFixed(6);

  return useLocalizedDigits
    ? toLocalizedDigits(formatted)
    : formatted;
}

function toLocalizedDigits(
  value: string,
): string {
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

function getLocationErrorTitle(
  language: string,
): string {
  if (language === "Dari") {
    return "موقعیت پیدا نشد";
  }

  if (language === "Pashto") {
    return "موقعیت ونه موندل شو";
  }

  return "Location unavailable";
}

function getLocationErrorMessage(
  language: string,
): string {
  if (language === "Dari") {
    return "لطفاً دسترسی موقعیت را فعال کنید و دوباره تلاش نمایید.";
  }

  if (language === "Pashto") {
    return "مهرباني وکړئ د موقعیت اجازه فعاله کړئ او بیا هڅه وکړئ.";
  }

  return "Enable location access and try again.";
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:
      KhedmatPalette.blue050,
  },

  safeArea: {
    flex: 1,
    justifyContent:
      "space-between",
  },

  topControls: {
    width: "100%",
    paddingHorizontal:
      Layout.screenPadding,
    paddingTop: Spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    justifyContent:
      "space-between",
  },

  iconButton: {
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
    ...Shadows.small,
  },

  headerStatus: {
    minHeight: 44,
    maxWidth: "72%",
    paddingHorizontal:
      Spacing.lg,
    alignItems: "center",
    gap: Spacing.sm,
    borderRadius: Radius.pill,
    backgroundColor:
      KhedmatPalette.surface,
    borderWidth: 1,
    borderColor:
      KhedmatPalette.border,
    ...Shadows.small,
  },

  statusDot: {
    width: 7,
    height: 7,
    flexShrink: 0,
    borderRadius: Radius.pill,
    backgroundColor:
      KhedmatPalette.blue500,
  },

  headerStatusText: {
    ...Typography.label,
    flexShrink: 1,
    color:
      KhedmatPalette.textPrimary,
  },

  /*
   * The container's bottom-center point is
   * exactly at the center of the map.
   *
   * Width: 60
   * Total pin height: 72
   * marginLeft: -30
   * marginTop: -72
   */
  centerPinAnchor: {
    position: "absolute",
    top: "50%",
    left: "50%",
    width: 60,
    height: 72,
    marginLeft: -30,
    marginTop: -72,
    alignItems: "center",
    justifyContent:
      "flex-start",
  },

  pinBody: {
    width: 56,
    height: 56,
    zIndex: 2,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      KhedmatPalette.navy900,
    borderWidth: 4,
    borderColor:
      KhedmatPalette.surface,
    ...Shadows.medium,
  },

  pinTip: {
    width: 16,
    height: 16,
    zIndex: 1,
    marginTop: -9,
    backgroundColor:
      KhedmatPalette.navy900,
    transform: [
      {
        rotate: "45deg",
      },
    ],
  },

  pinShadow: {
    position: "absolute",
    bottom: -4,
    width: 30,
    height: 9,
    borderRadius: Radius.pill,
    backgroundColor:
      "rgba(0, 27, 72, 0.22)",
    transform: [
      {
        scaleX: 1.25,
      },
    ],
  },

  lowerArea: {
    width: "100%",
    paddingHorizontal:
      Layout.screenPadding,
    paddingBottom: Spacing.sm,
    gap: Spacing.sm,
  },

  recenterRow: {
    width: "100%",
    flexDirection: "row",
  },

  recenterButton: {
    width: 48,
    height: 48,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      KhedmatPalette.surface,
    borderWidth: 1,
    borderColor:
      KhedmatPalette.border,
    ...Shadows.small,
  },

  bottomCard: {
    width: "100%",
  },

  bottomCardContent: {
    padding: Spacing.lg,
  },

  addressHeader: {
    width: "100%",
    alignItems: "flex-start",
    gap: Spacing.md,
  },

  addressIcon: {
    width: 44,
    height: 44,
    flexShrink: 0,
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      KhedmatPalette.surfaceSoft,
  },

  addressCopy: {
    flex: 1,
    gap: Spacing.xs,
  },

  eyebrow: {
    ...Typography.captionStyle,
    width: "100%",
    color:
      KhedmatPalette.blue500,
    fontFamily: Fonts.medium,
  },

  addressTitle: {
    ...Typography.sectionTitle,
    width: "100%",
    color:
      KhedmatPalette.textPrimary,
  },

  addressDetails: {
    ...Typography.bodyStyle,
    width: "100%",
    color:
      KhedmatPalette.textSecondary,
    lineHeight: 22,
  },

  warningRow: {
    width: "100%",
    marginTop: Spacing.md,
    padding: Spacing.md,
    alignItems: "center",
    gap: Spacing.sm,
    borderRadius: Radius.md,
    backgroundColor:
      KhedmatPalette.warningSoft,
  },

  warningText: {
    ...Typography.captionStyle,
    flex: 1,
    color:
      KhedmatPalette.textSecondary,
  },

  coordinates: {
    width: "100%",
    marginTop: Spacing.lg,
    paddingVertical: Spacing.md,
    alignItems: "center",
    borderTopWidth:
      StyleSheet.hairlineWidth,
    borderBottomWidth:
      StyleSheet.hairlineWidth,
    borderColor:
      KhedmatPalette.border,
  },

  coordinateItem: {
    flex: 1,
    alignItems: "center",
    gap: Spacing.xs,
  },

  coordinateLabel: {
    ...Typography.captionStyle,
    color:
      KhedmatPalette.textMuted,
    textAlign: "center",
  },

  coordinateValue: {
    fontFamily: Fonts.medium,
    color:
      KhedmatPalette.textPrimary,
    fontSize: 12,
    lineHeight: 17,
    textAlign: "center",
    fontVariant: [
      "tabular-nums",
    ],
  },

  coordinateDivider: {
    width:
      StyleSheet.hairlineWidth,
    height: 32,
    backgroundColor:
      KhedmatPalette.border,
  },

  actions: {
    width: "100%",
    marginTop: Spacing.lg,
    gap: Spacing.md,
  },

  pressed: {
    opacity: 0.78,
    transform: [
      {
        scale: 0.96,
      },
    ],
  },
});