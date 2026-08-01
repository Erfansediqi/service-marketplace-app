import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  PanResponder,
  StyleSheet,
  Text,
  View,
} from "react-native";
import MapView, { Region } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";

import { GlassButton } from "../components/glass/glass-button";
import { GlassIconButton } from "../components/glass/glass-icon-button";
import { GlassSurface } from "../components/glass/glass-surface";
import {
  Colors,
  Radius,
  Shadows,
  Spacing,
  Typography,
} from "../constants/theme";
import { useLanguage } from "../context/languagecontext";
import { reverseGeocode } from "../services/location";

const DEFAULT_LOCATION = {
  latitude: 34.5553,
  longitude: 69.2075,
};

const DEFAULT_DELTA = {
  latitudeDelta: 0.012,
  longitudeDelta: 0.012,
};

type AddressState = {
  title: string;
  details: string;
};

function parseCoordinate(
  value: string | string[] | undefined,
  fallback: number,
): number {
  const rawValue = Array.isArray(value) ? value[0] : value;
  const parsedValue = Number(rawValue);

  return Number.isFinite(parsedValue) ? parsedValue : fallback;
}

function joinAddressParts(
  values: Array<string | null | undefined>,
  isEnglish: boolean,
): string {
  const separator = isEnglish ? ", " : "، ";
  return values
    .map((value) => value?.trim())
    .filter(
      (value, index, array): value is string =>
        Boolean(value) && array.indexOf(value) === index,
    )
    .join(separator);
}

export default function ConfirmLocationScreen() {
  const router = useRouter();
  const { t, language } = useLanguage();
  const isEnglish = language === "English";

  const params = useLocalSearchParams<{
    lat?: string | string[];
    lng?: string | string[];
  }>();

  const mapRef = useRef<MapView>(null);
  const geocodeRequestRef = useRef(0);

  const initialLatitude = useMemo(
    () => parseCoordinate(params.lat, DEFAULT_LOCATION.latitude),
    [params.lat],
  );

  const initialLongitude = useMemo(
    () => parseCoordinate(params.lng, DEFAULT_LOCATION.longitude),
    [params.lng],
  );

  const initialRegion = useMemo<Region>(
    () => ({
      latitude: initialLatitude,
      longitude: initialLongitude,
      ...DEFAULT_DELTA,
    }),
    [initialLatitude, initialLongitude],
  );

  const [selectedRegion, setSelectedRegion] = useState<Region>(initialRegion);

  const [address, setAddress] = useState<AddressState>({
    title: t("defaultAddressTitle"),
    details: t("defaultAddressDetails"),
  });

  const [isResolvingAddress, setIsResolvingAddress] = useState(true);
  const [isMapReady, setIsMapReady] = useState(false);
  const [isMovingMap, setIsMovingMap] = useState(false);
  const [addressError, setAddressError] = useState<string | null>(null);

  // Collapsible Bottom Sheet Animation & Drag Handling
  const sheetTranslateY = useRef(new Animated.Value(0)).current;
  const [isSheetCollapsed, setIsSheetCollapsed] = useState(false);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dy) > 5;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          sheetTranslateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 80 || gestureState.vy > 0.5) {
          // Collapse / Minimize Sheet downwards
          Animated.timing(sheetTranslateY, {
            toValue: 280,
            duration: 250,
            useNativeDriver: true,
          }).start(() => setIsSheetCollapsed(true));
        } else {
          // Snap back to Expanded
          Animated.spring(sheetTranslateY, {
            toValue: 0,
            useNativeDriver: true,
            bounciness: 4,
          }).start(() => setIsSheetCollapsed(false));
        }
      },
    }),
  ).current;

  const toggleSheet = () => {
    if (isSheetCollapsed) {
      Animated.spring(sheetTranslateY, {
        toValue: 0,
        useNativeDriver: true,
        bounciness: 4,
      }).start(() => setIsSheetCollapsed(false));
    } else {
      Animated.timing(sheetTranslateY, {
        toValue: 280,
        duration: 250,
        useNativeDriver: true,
      }).start(() => setIsSheetCollapsed(true));
    }
  };

  useEffect(() => {
    const requestId = geocodeRequestRef.current + 1;
    geocodeRequestRef.current = requestId;

    setIsResolvingAddress(true);
    setAddressError(null);

    const timer = setTimeout(async () => {
      try {
        const result = await reverseGeocode(
          selectedRegion.latitude,
          selectedRegion.longitude,
        );

        if (requestId !== geocodeRequestRef.current) {
          return;
        }

        if (!result) {
          setAddress({
            title: t("fallbackLocationTitle"),
            details: t("fallbackAddressDetails"),
          });

          return;
        }

        const title =
          joinAddressParts(
            [result.name, result.street, result.district],
            isEnglish,
          ) || t("fallbackLocationTitle");

        const details =
          joinAddressParts(
            [result.city, result.subregion, result.region, result.country],
            isEnglish,
          ) || t("fallbackAddressDetails");

        setAddress({
          title,
          details,
        });
      } catch (error) {
        console.error("Reverse geocoding failed:", error);

        if (requestId !== geocodeRequestRef.current) {
          return;
        }

        setAddressError(t("coordinatesUnavailable"));

        setAddress({
          title: t("fallbackLocationTitle"),
          details: t("coordinatesSuccess"),
        });
      } finally {
        if (requestId === geocodeRequestRef.current) {
          setIsResolvingAddress(false);
        }
      }
    }, 650);

    return () => clearTimeout(timer);
  }, [selectedRegion.latitude, selectedRegion.longitude, isEnglish, t]);

  const handleRegionChangeComplete = (region: Region) => {
    setSelectedRegion(region);
    setIsMovingMap(false);
  };

  const handleRecenter = () => {
    setIsMovingMap(true);

    const targetRegion = {
      latitude: initialLatitude,
      longitude: initialLongitude,
      ...DEFAULT_DELTA,
    };

    mapRef.current?.animateToRegion(targetRegion, 600);
    setSelectedRegion(targetRegion);
  };

  const handleConfirmLocation = () => {
    Alert.alert(
      t("confirmLocationHeader"),
      `${address.title}\n${address.details}`,
      [
        {
          text: t("editAction"),
          style: "cancel",
        },
        {
          text: t("confirmAction"),
          onPress: () => {
            router.replace("/role-selection");
          },
        },
      ],
    );
  };

  const handleManualAddress = () => {
    router.push("/manual-address");
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        initialRegion={initialRegion}
        showsUserLocation
        showsMyLocationButton={false}
        showsCompass={false}
        toolbarEnabled={false}
        loadingEnabled
        onMapReady={() => setIsMapReady(true)}
        onRegionChangeStart={() => setIsMovingMap(true)}
        onRegionChangeComplete={handleRegionChangeComplete}
      />

      <View pointerEvents="none" style={styles.mapAtmosphere} />

      <SafeAreaView pointerEvents="box-none" style={styles.safeArea}>
        <View
          pointerEvents="box-none"
          style={[
            styles.topControls,
            { flexDirection: isEnglish ? "row" : "row-reverse" },
          ]}
        >
          <GlassIconButton
            accessibilityLabel={t("back")}
            icon="chevron-back"
            onPress={() => router.back()}
          />

          <GlassSurface
            variant="regular"
            radius={Radius.pill}
            style={styles.headerStatus}
            contentStyle={[
              styles.headerStatusContent,
              { flexDirection: isEnglish ? "row" : "row-reverse" },
            ]}
          >
            <View style={styles.statusDot} />

            <Text
              style={[
                styles.headerStatusText,
                {
                  textAlign: isEnglish ? "left" : "right",
                  writingDirection: isEnglish ? "ltr" : "rtl",
                },
              ]}
            >
              {t("confirmLocationHeader")}
            </Text>
          </GlassSurface>
        </View>

        <View pointerEvents="none" style={styles.pinContainer}>
          <View style={styles.pinShadow} />

          <View style={styles.pinOuter}>
            <View style={styles.pinInner}>
              <Ionicons name="location" size={28} color={Colors.white} />
            </View>
          </View>

          <View style={styles.pinStem} />
        </View>

        <View style={styles.lowerArea}>
          <View
            style={[
              styles.recenterWrapper,
              { alignItems: isEnglish ? "flex-end" : "flex-start" },
            ]}
          >
            <GlassIconButton
              accessibilityLabel={t("recenterLabel")}
              icon="navigate-outline"
              size={22}
              onPress={handleRecenter}
            />
          </View>

          <Animated.View
            style={{
              transform: [{ translateY: sheetTranslateY }],
            }}
          >
            <GlassSurface
              variant="prominent"
              radius={Radius.xxl}
              style={[styles.bottomSheet, Shadows.medium]}
              contentStyle={styles.bottomSheetContent}
            >
              <View {...panResponder.panHandlers} style={styles.handleArea}>
                <View style={styles.sheetHandle} />
              </View>

              <View
                style={[
                  styles.sheetHeader,
                  { flexDirection: isEnglish ? "row" : "row-reverse" },
                ]}
              >
                <View style={styles.addressIcon}>
                  {isResolvingAddress ? (
                    <ActivityIndicator size="small" color={Colors.primary} />
                  ) : (
                    <Ionicons
                      name="location-outline"
                      size={22}
                      color={Colors.primary}
                    />
                  )}
                </View>

                <View
                  style={[
                    styles.addressCopy,
                    { alignItems: isEnglish ? "flex-start" : "flex-end" },
                  ]}
                >
                  <Text
                    style={[
                      styles.eyebrow,
                      {
                        textAlign: isEnglish ? "left" : "right",
                        writingDirection: isEnglish ? "ltr" : "rtl",
                      },
                    ]}
                  >
                    {t("selectedLocationEyebrow")}
                  </Text>

                  <Text
                    numberOfLines={2}
                    style={[
                      styles.addressTitle,
                      {
                        textAlign: isEnglish ? "left" : "right",
                        writingDirection: isEnglish ? "ltr" : "rtl",
                      },
                    ]}
                  >
                    {isMovingMap ? t("movingMapTitle") : address.title}
                  </Text>

                  <Text
                    numberOfLines={2}
                    style={[
                      styles.addressDetails,
                      {
                        textAlign: isEnglish ? "left" : "right",
                        writingDirection: isEnglish ? "ltr" : "rtl",
                      },
                    ]}
                  >
                    {isMovingMap ? t("movingMapDetails") : address.details}
                  </Text>
                </View>
              </View>

              {addressError ? (
                <View
                  style={[
                    styles.warningRow,
                    { flexDirection: isEnglish ? "row" : "row-reverse" },
                  ]}
                >
                  <Ionicons
                    name="information-circle-outline"
                    size={17}
                    color={Colors.warning}
                  />

                  <Text
                    style={[
                      styles.warningText,
                      {
                        textAlign: isEnglish ? "left" : "right",
                        writingDirection: isEnglish ? "ltr" : "rtl",
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
                  { flexDirection: isEnglish ? "row" : "row-reverse" },
                ]}
              >
                <View style={styles.coordinateItem}>
                  <Text
                    style={[
                      styles.coordinateLabel,
                      {
                        textAlign: "center",
                        writingDirection: isEnglish ? "ltr" : "rtl",
                      },
                    ]}
                  >
                    {t("latitudeLabel")}
                  </Text>

                  <Text style={styles.coordinateValue}>
                    {selectedRegion.latitude.toFixed(6)}
                  </Text>
                </View>

                <View style={styles.coordinateDivider} />

                <View style={styles.coordinateItem}>
                  <Text
                    style={[
                      styles.coordinateLabel,
                      {
                        textAlign: "center",
                        writingDirection: isEnglish ? "ltr" : "rtl",
                      },
                    ]}
                  >
                    {t("longitudeLabel")}
                  </Text>

                  <Text style={styles.coordinateValue}>
                    {selectedRegion.longitude.toFixed(6)}
                  </Text>
                </View>
              </View>

              <View style={styles.actions}>
                <GlassButton
                  label={t("confirmLocationButton")}
                  icon="checkmark"
                  iconPosition={isEnglish ? "left" : "right"}
                  disabled={!isMapReady || isMovingMap || isResolvingAddress}
                  onPress={handleConfirmLocation}
                />

                <GlassButton
                  label={t("manualAddressButton")}
                  variant="secondary"
                  icon="create-outline"
                  iconPosition={isEnglish ? "left" : "right"}
                  onPress={handleManualAddress}
                />
              </View>
            </GlassSurface>
          </Animated.View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  safeArea: {
    flex: 1,
    justifyContent: "space-between",
  },

  mapAtmosphere: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(6, 10, 15, 0.08)",
  },

  topControls: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.sm,
    alignItems: "center",
    justifyContent: "space-between",
  },

  headerStatus: {
    minHeight: 44,
  },

  headerStatusContent: {
    minHeight: 44,
    paddingHorizontal: Spacing.lg,
    alignItems: "center",
    gap: Spacing.sm,
  },

  statusDot: {
    width: 7,
    height: 7,
    borderRadius: Radius.pill,
    backgroundColor: Colors.primary,
  },

  headerStatusText: {
    ...Typography.label,
    color: Colors.textPrimary,
  },

  pinContainer: {
    position: "absolute",
    top: "42%",
    left: "50%",
    width: 64,
    height: 82,
    marginLeft: -32,
    marginTop: -62,
    alignItems: "center",
  },

  pinOuter: {
    width: 58,
    height: 58,
    borderRadius: 29,
    padding: 5,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    ...Shadows.medium,
  },

  pinInner: {
    flex: 1,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primary,
  },

  pinStem: {
    width: 4,
    height: 18,
    marginTop: -2,
    borderRadius: Radius.pill,
    backgroundColor: Colors.primary,
  },

  pinShadow: {
    position: "absolute",
    bottom: 2,
    width: 30,
    height: 9,
    borderRadius: Radius.pill,
    backgroundColor: "rgba(0, 0, 0, 0.28)",
    transform: [{ scaleX: 1.25 }],
  },

  lowerArea: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    gap: Spacing.md,
  },

  recenterWrapper: {
    width: "100%",
    paddingHorizontal: Spacing.xs,
  },

  bottomSheet: {
    width: "100%",
    backgroundColor: "rgba(18, 22, 31, 0.94)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
  },

  bottomSheetContent: {
    paddingHorizontal: Spacing.xl,
    paddingTop: 0,
    paddingBottom: Spacing.xl,
  },

  handleArea: {
    paddingVertical: Spacing.sm,
    width: "100%",
    alignItems: "center",
  },

  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: Radius.pill,
    backgroundColor: "rgba(255, 255, 255, 0.25)",
  },

  sheetHeader: {
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
    backgroundColor: Colors.primarySoft,
  },

  addressCopy: {
    flex: 1,
    gap: Spacing.xs,
  },

  eyebrow: {
    ...Typography.captionStyle,
    color: Colors.primary,
  },

  addressTitle: {
    ...Typography.sectionTitle,
    width: "100%",
    color: Colors.textPrimary,
  },

  addressDetails: {
    ...Typography.bodyStyle,
    width: "100%",
    color: Colors.textSecondary,
  },

  warningRow: {
    marginTop: Spacing.md,
    padding: Spacing.md,
    alignItems: "center",
    gap: Spacing.sm,
    borderRadius: Radius.md,
    backgroundColor: "rgba(217, 154, 43, 0.10)",
  },

  warningText: {
    ...Typography.captionStyle,
    flex: 1,
    color: Colors.textSecondary,
  },

  coordinates: {
    marginTop: Spacing.lg,
    paddingVertical: Spacing.sm,
    alignItems: "center",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.separator,
  },

  coordinateItem: {
    flex: 1,
    alignItems: "center",
    gap: Spacing.xs,
  },

  coordinateLabel: {
    ...Typography.captionStyle,
    color: Colors.textTertiary,
  },

  coordinateValue: {
    color: Colors.textPrimary,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "600",
    fontVariant: ["tabular-nums"],
  },

  coordinateDivider: {
    width: StyleSheet.hairlineWidth,
    height: 30,
    backgroundColor: Colors.separator,
  },

  actions: {
    marginTop: Spacing.lg,
    gap: Spacing.md,
  },
});
