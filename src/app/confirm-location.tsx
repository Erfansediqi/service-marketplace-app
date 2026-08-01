import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
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
): string {
  return values
    .map((value) => value?.trim())
    .filter(
      (value, index, array): value is string =>
        Boolean(value) && array.indexOf(value) === index,
    )
    .join("، ");
}

export default function ConfirmLocationScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    lat?: string | string[];
    lng?: string | string[];
  }>();

  const mapRef = useRef<MapView>(null);
  const geocodeRequestRef = useRef(0);

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

  const initialRegion = useMemo<Region>(
    () => ({
      latitude: initialLatitude,
      longitude: initialLongitude,
      ...DEFAULT_DELTA,
    }),
    [initialLatitude, initialLongitude],
  );

  const [selectedRegion, setSelectedRegion] =
    useState<Region>(initialRegion);

  const [address, setAddress] = useState<AddressState>({
    title: "در حال یافتن آدرس...",
    details: "لطفاً چند لحظه صبر کنید.",
  });

  const [isResolvingAddress, setIsResolvingAddress] =
    useState(true);

  const [isMapReady, setIsMapReady] = useState(false);
  const [isMovingMap, setIsMovingMap] = useState(false);
  const [addressError, setAddressError] = useState<
    string | null
  >(null);

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
            title: "موقعیت انتخاب‌شده",
            details: "آدرس دقیق این موقعیت پیدا نشد.",
          });

          return;
        }

        const title =
          joinAddressParts([
            result.name,
            result.street,
            result.district,
          ]) || "موقعیت انتخاب‌شده";

        const details =
          joinAddressParts([
            result.city,
            result.subregion,
            result.region,
            result.country,
          ]) || "آدرس دقیق در دسترس نیست.";

        setAddress({
          title,
          details,
        });
      } catch (error) {
        console.error("Reverse geocoding failed:", error);

        if (requestId !== geocodeRequestRef.current) {
          return;
        }

        setAddressError(
          "در حال حاضر دریافت آدرس ممکن نیست.",
        );

        setAddress({
          title: "موقعیت انتخاب‌شده",
          details: "مختصات موقعیت با موفقیت دریافت شد.",
        });
      } finally {
        if (requestId === geocodeRequestRef.current) {
          setIsResolvingAddress(false);
        }
      }
    }, 650);

    return () => clearTimeout(timer);
  }, [
    selectedRegion.latitude,
    selectedRegion.longitude,
  ]);

  const handleRegionChangeComplete = (region: Region) => {
    setSelectedRegion(region);
    setIsMovingMap(false);
  };

  const handleRecenter = () => {
    setIsMovingMap(true);

    mapRef.current?.animateToRegion(
      initialRegion,
      500,
    );

    setSelectedRegion(initialRegion);
  };

  const handleConfirmLocation = () => {
    Alert.alert(
      "تأیید موقعیت",
      `${address.title}\n${address.details}`,
      [
        {
          text: "ویرایش",
          style: "cancel",
        },
        {
          text: "تأیید",
          onPress: () => {
            /*
             * Later, save these values to the authenticated
             * user's profile or onboarding state:
             *
             * selectedRegion.latitude
             * selectedRegion.longitude
             * address.title
             * address.details
             */

            router.replace("/explore");
          },
        },
      ],
    );
  };

  const handleManualAddress = () => {
    Alert.alert(
      "وارد کردن دستی آدرس",
      "صفحهٔ انتخاب ولایت، شهر، ناحیه و آدرس دقیق در مرحلهٔ بعد ساخته می‌شود.",
      [
        {
          text: "باشه",
        },
      ],
    );
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

      <View
        pointerEvents="none"
        style={styles.mapAtmosphere}
      />

      <SafeAreaView
        pointerEvents="box-none"
        style={styles.safeArea}
      >
        <View
          pointerEvents="box-none"
          style={styles.topControls}
        >
          <GlassIconButton
            accessibilityLabel="بازگشت"
            icon="chevron-back"
            onPress={() => router.back()}
          />

          <GlassSurface
            variant="regular"
            radius={Radius.pill}
            style={styles.headerStatus}
            contentStyle={styles.headerStatusContent}
          >
            <View style={styles.statusDot} />

            <Text style={styles.headerStatusText}>
              انتخاب موقعیت
            </Text>
          </GlassSurface>
        </View>

        <View
          pointerEvents="none"
          style={styles.pinContainer}
        >
          <View style={styles.pinShadow} />

          <View style={styles.pinOuter}>
            <View style={styles.pinInner}>
              <Ionicons
                name="location"
                size={28}
                color={Colors.white}
              />
            </View>
          </View>

          <View style={styles.pinStem} />
        </View>

        <View
          pointerEvents="box-none"
          style={styles.recenterContainer}
        >
          <GlassIconButton
            accessibilityLabel="بازگشت به موقعیت فعلی"
            icon="navigate-outline"
            size={22}
            onPress={handleRecenter}
          />
        </View>

        <View style={styles.bottomArea}>
          <GlassSurface
            variant="prominent"
            radius={Radius.xxl}
            style={[styles.bottomSheet, Shadows.medium]}
            contentStyle={styles.bottomSheetContent}
          >
            <View style={styles.sheetHandle} />

            <View style={styles.sheetHeader}>
              <View style={styles.addressIcon}>
                {isResolvingAddress ? (
                  <ActivityIndicator
                    size="small"
                    color={Colors.primary}
                  />
                ) : (
                  <Ionicons
                    name="location-outline"
                    size={22}
                    color={Colors.primary}
                  />
                )}
              </View>

              <View style={styles.addressCopy}>
                <Text style={styles.eyebrow}>
                  موقعیت انتخاب‌شده
                </Text>

                <Text
                  numberOfLines={2}
                  style={styles.addressTitle}
                >
                  {isMovingMap
                    ? "در حال انتخاب موقعیت..."
                    : address.title}
                </Text>

                <Text
                  numberOfLines={2}
                  style={styles.addressDetails}
                >
                  {isMovingMap
                    ? "نشانگر را روی محل مورد نظر قرار دهید."
                    : address.details}
                </Text>
              </View>
            </View>

            {addressError ? (
              <View style={styles.warningRow}>
                <Ionicons
                  name="information-circle-outline"
                  size={17}
                  color={Colors.warning}
                />

                <Text style={styles.warningText}>
                  {addressError}
                </Text>
              </View>
            ) : null}

            <View style={styles.coordinates}>
              <View style={styles.coordinateItem}>
                <Text style={styles.coordinateLabel}>
                  عرض جغرافیایی
                </Text>

                <Text style={styles.coordinateValue}>
                  {selectedRegion.latitude.toFixed(6)}
                </Text>
              </View>

              <View style={styles.coordinateDivider} />

              <View style={styles.coordinateItem}>
                <Text style={styles.coordinateLabel}>
                  طول جغرافیایی
                </Text>

                <Text style={styles.coordinateValue}>
                  {selectedRegion.longitude.toFixed(6)}
                </Text>
              </View>
            </View>

            <View style={styles.actions}>
              <GlassButton
                label="تأیید این موقعیت"
                icon="checkmark"
                iconPosition="left"
                disabled={
                  !isMapReady ||
                  isMovingMap ||
                  isResolvingAddress
                }
                onPress={handleConfirmLocation}
              />

              <GlassButton
                label="وارد کردن دستی آدرس"
                variant="secondary"
                icon="create-outline"
                iconPosition="left"
                onPress={handleManualAddress}
              />
            </View>
          </GlassSurface>
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
    backgroundColor: "rgba(6, 10, 15, 0.10)",
  },

  topControls: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  headerStatus: {
    minHeight: 44,
  },

  headerStatusContent: {
    minHeight: 44,
    paddingHorizontal: Spacing.lg,
    flexDirection: "row-reverse",
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
    writingDirection: "rtl",
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
    backgroundColor: "rgba(255, 255, 255, 0.92)",
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

  recenterContainer: {
    position: "absolute",
    right: Spacing.xl,
    bottom: 370,
  },

  bottomArea: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.sm,
  },

  bottomSheet: {
    width: "100%",
  },

  bottomSheetContent: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xl,
  },

  sheetHandle: {
    width: 42,
    height: 4,
    alignSelf: "center",
    marginBottom: Spacing.xl,
    borderRadius: Radius.pill,
    backgroundColor: Colors.borderStrong,
  },

  sheetHeader: {
    flexDirection: "row-reverse",
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
    alignItems: "flex-end",
    gap: Spacing.xs,
  },

  eyebrow: {
    ...Typography.captionStyle,
    color: Colors.primary,
    textAlign: "right",
    writingDirection: "rtl",
  },

  addressTitle: {
    ...Typography.sectionTitle,
    width: "100%",
    color: Colors.textPrimary,
    textAlign: "right",
    writingDirection: "rtl",
  },

  addressDetails: {
    ...Typography.bodyStyle,
    width: "100%",
    color: Colors.textSecondary,
    textAlign: "right",
    writingDirection: "rtl",
  },

  warningRow: {
    marginTop: Spacing.md,
    padding: Spacing.md,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: Spacing.sm,
    borderRadius: Radius.md,
    backgroundColor: "rgba(217, 154, 43, 0.10)",
  },

  warningText: {
    ...Typography.captionStyle,
    flex: 1,
    color: Colors.textSecondary,
    textAlign: "right",
    writingDirection: "rtl",
  },

  coordinates: {
    marginTop: Spacing.xl,
    paddingVertical: Spacing.md,
    flexDirection: "row-reverse",
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
    textAlign: "center",
    writingDirection: "rtl",
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
    height: 34,
    backgroundColor: Colors.separator,
  },

  actions: {
    marginTop: Spacing.xl,
    gap: Spacing.md,
  },
});