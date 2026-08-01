import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
    StyleSheet,
    Text,
    View,
} from "react-native";

import { GlassButton } from "../components/glass/glass-button";
import { GlassIconButton } from "../components/glass/glass-icon-button";
import { GlassSurface } from "../components/glass/glass-surface";
import { AppScreen } from "../components/layout/app-screen";
import {
    Colors,
    Radius,
    Spacing,
    Typography,
} from "../constants/theme";
import { requestUserLocation } from "../services/location";

export default function LocationPermissionScreen() {
  const router = useRouter();

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
            label="اجازه هنگام استفاده از برنامه"
            icon="location-outline"
            iconPosition="left"
            onPress={handleAllowLocation}
          />

          <GlassButton
            label="وارد کردن دستی آدرس"
            variant="secondary"
            icon="create-outline"
            iconPosition="left"
            onPress={handleManualAddress}
          />
        </View>
      }
    >
      <View style={styles.topBar}>
        <GlassIconButton
          accessibilityLabel="بازگشت"
          icon="chevron-back"
          onPress={() => router.back()}
        />
      </View>

      <View style={styles.content}>
        <GlassSurface
          variant="prominent"
          radius={Radius.xxl}
          style={styles.iconSurface}
          contentStyle={styles.iconContent}
        >
          <Ionicons
            name="location-outline"
            size={42}
            color={Colors.primary}
          />
        </GlassSurface>

        <View style={styles.copy}>
          <Text style={styles.eyebrow}>
            تنظیم حساب
          </Text>

          <Text style={styles.title}>
            اجازهٔ دسترسی به موقعیت
          </Text>

          <Text style={styles.subtitle}>
            برای نمایش خدمات و ارائه‌دهندگان نزدیک شما،
            پیشنهادهای دقیق‌تر و تعیین خودکار آدرس،
            لطفاً اجازهٔ دسترسی به موقعیت مکانی را بدهید.
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
    alignItems: "flex-start",
  },

  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "flex-end",
    paddingBottom: Spacing.hero,
  },

  iconSurface: {
    width: 112,
    height: 112,
    alignSelf: "center",
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
    alignItems: "flex-end",
  },

  eyebrow: {
    ...Typography.captionStyle,
    color: Colors.primary,
    letterSpacing: 1,
    textAlign: "right",
    writingDirection: "rtl",
  },

  title: {
    ...Typography.screenTitle,
    color: Colors.textPrimary,
    textAlign: "right",
    writingDirection: "rtl",
    width: "100%",
  },

  subtitle: {
    ...Typography.bodyLarge,
    color: Colors.textSecondary,
    textAlign: "right",
    writingDirection: "rtl",
    width: "100%",
    maxWidth: 440,
  },

  footer: {
    width: "100%",
    gap: Spacing.md,
  },
});
