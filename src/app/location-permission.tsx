import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { KhedmatButton } from "../components/khedmat/khedmat-button";
import { KhedmatScreen } from "../components/khedmat/khedmat-screen";
import {
  KhedmatPalette,
  Layout,
  Radius,
  Shadows,
  Spacing,
  Typography,
} from "../constants/theme";
import { useLanguage } from "../context/languagecontext";
import { requestUserLocation } from "../services/location";

export default function LocationPermissionScreen() {
  const router = useRouter();

  const {
    t,
    language,
  } = useLanguage();

  const isRtl =
    language === "Dari" ||
    language === "Pashto";

  const handleAllowLocation = async () => {
    const location =
      await requestUserLocation();

    if (!location) {
      return;
    }

    console.log(
      "User location:",
      location,
    );

    router.push({
      pathname: "/confirm-location",
      params: {
        lat: location.latitude.toString(),
        lng: location.longitude.toString(),
      },
    });
  };

  const handleManualAddress = () => {
    router.push("/manual-address");
  };

  return (
    <KhedmatScreen
      contentStyle={
        styles.screenContent
      }
      footer={
        <View style={styles.footer}>
          <KhedmatButton
            label={t("allowLocation")}
            onPress={
              handleAllowLocation
            }
          />

          <KhedmatButton
            label={t("manualAddress")}
            variant="outline"
            onPress={
              handleManualAddress
            }
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

      <View style={styles.centerContent}>
        <View style={styles.locationIcon}>
          <Ionicons
            name="location"
            size={52}
            color={
              KhedmatPalette.white
            }
          />
        </View>

        <View style={styles.copy}>
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
            {t("locationTitle")}
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
            {t("locationSubtitle")}
          </Text>
        </View>

        <View
          style={[
            styles.privacyNote,
            {
              flexDirection: isRtl
                ? "row-reverse"
                : "row",
            },
          ]}
        >
          <Ionicons
            name="shield-checkmark-outline"
            size={17}
            color={
              KhedmatPalette.blue500
            }
          />

          <Text
            numberOfLines={2}
            style={[
              styles.privacyText,
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
            {getPrivacyMessage(
              language,
            )}
          </Text>
        </View>
      </View>
    </KhedmatScreen>
  );
}

function getPrivacyMessage(
  language: string,
): string {
  if (language === "Dari") {
    return "موقعیت شما فقط برای نمایش خدمات نزدیک و پیدا کردن آدرس استفاده می‌شود.";
  }

  if (language === "Pashto") {
    return "ستاسو موقعیت یوازې د نږدې خدمتونو د ښودلو او د پته موندلو لپاره کارول کېږي.";
  }

  return "Your location is used only to show nearby services and help providers find your address.";
}

const styles = StyleSheet.create({
  screenContent: {
    flex: 1,
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
    transform: [
      {
        scale: 0.96,
      },
    ],
  },

  centerContent: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: Spacing.screen,
  },

  locationIcon: {
    width: 112,
    height: 112,
    marginBottom: Spacing.xxl,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      KhedmatPalette.navy900,
    ...Shadows.darkAccent,
  },

  copy: {
    width: "100%",
    maxWidth:
      Layout.readableTextMaxWidth,
    alignItems: "center",
    gap: Spacing.md,
  },

  title: {
    ...Typography.screenTitle,
    width: "100%",
    color:
      KhedmatPalette.textPrimary,
    textAlign: "center",
  },

  subtitle: {
    ...Typography.bodyStyle,
    width: "100%",
    color:
      KhedmatPalette.textSecondary,
    textAlign: "center",
    lineHeight: 24,
  },

  privacyNote: {
    width: "100%",
    maxWidth:
      Layout.readableTextMaxWidth,
    marginTop: Spacing.xxl,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
  },

  privacyText: {
    ...Typography.captionStyle,
    flexShrink: 1,
    color:
      KhedmatPalette.textSecondary,
    lineHeight: 18,
  },

  footer: {
    width: "100%",
    gap: Spacing.md,
  },
});