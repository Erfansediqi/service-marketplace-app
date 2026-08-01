import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

import { GlassButton } from "../components/glass/glass-button";
import { GlassIconButton } from "../components/glass/glass-icon-button";
import { GlassSurface } from "../components/glass/glass-surface";
import { AppScreen } from "../components/layout/app-screen";
import { Colors, Radius, Spacing, Typography } from "../constants/theme";
import { useLanguage } from "../context/languagecontext";
import { requestUserLocation } from "../services/location";

export default function LocationPermissionScreen() {
  const router = useRouter();
  const { t, language } = useLanguage();

  // Check if English is selected so we only apply left-alignment/LTR for English
  const isEnglish = language === "English";

  const handleAllowLocation = async () => {
    const location = await requestUserLocation();

    if (!location) {
      return;
    }

    console.log("User location:", location);

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
    <AppScreen
      contentStyle={styles.screenContent}
      footer={
        <View style={styles.footer}>
          <GlassButton
            label={t("allowLocation")}
            icon="location-outline"
            iconPosition={isEnglish ? "left" : "right"}
            onPress={handleAllowLocation}
          />

          <GlassButton
            label={t("manualAddress")}
            variant="secondary"
            icon="create-outline"
            iconPosition={isEnglish ? "left" : "right"}
            onPress={handleManualAddress}
          />
        </View>
      }
    >
      <View
        style={[
          styles.topBar,
          { alignItems: isEnglish ? "flex-start" : "flex-end" },
        ]}
      >
        <GlassIconButton
          accessibilityLabel={t("backLabel")}
          icon="chevron-back"
          onPress={() => router.back()}
        />
      </View>

      <View
        style={[
          styles.content,
          { alignItems: isEnglish ? "flex-start" : "flex-end" },
        ]}
      >
        <GlassSurface
          variant="prominent"
          radius={Radius.xxl}
          style={[
            styles.iconSurface,
            { alignSelf: isEnglish ? "flex-start" : "flex-end" },
          ]}
          contentStyle={styles.iconContent}
        >
          <Ionicons name="location-outline" size={42} color={Colors.primary} />
        </GlassSurface>

        <View
          style={[
            styles.copy,
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
            {t("locationEyebrow")}
          </Text>

          <Text
            style={[
              styles.title,
              {
                textAlign: isEnglish ? "left" : "right",
                writingDirection: isEnglish ? "ltr" : "rtl",
              },
            ]}
          >
            {t("locationTitle")}
          </Text>

          <Text
            style={[
              styles.subtitle,
              {
                textAlign: isEnglish ? "left" : "right",
                writingDirection: isEnglish ? "ltr" : "rtl",
              },
            ]}
          >
            {t("locationSubtitle")}
          </Text>
        </View>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  screenContent: {
    paddingTop: Spacing.md,
  },

  topBar: {
    minHeight: 44,
  },

  content: {
    flex: 1,
    justifyContent: "center",
    paddingBottom: Spacing.hero,
  },

  iconSurface: {
    width: 112,
    height: 112,
    marginBottom: Spacing.screen,
    backgroundColor: "rgba(76,141,255,0.10)",
    borderColor: "rgba(100,158,255,0.28)",
  },

  iconContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  copy: {
    width: "100%",
    gap: Spacing.md,
  },

  eyebrow: {
    ...Typography.captionStyle,
    color: Colors.primary,
    letterSpacing: 1,
  },

  title: {
    ...Typography.screenTitle,
    color: Colors.textPrimary,
    width: "100%",
  },

  subtitle: {
    ...Typography.bodyLarge,
    color: Colors.textSecondary,
    width: "100%",
    maxWidth: 440,
  },

  footer: {
    width: "100%",
    gap: Spacing.md,
  },
});
