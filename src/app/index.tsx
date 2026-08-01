import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  KhedmatPalette,
  Radius,
  Shadows,
  Spacing,
  Typography,
} from "../constants/theme";

export default function SplashScreen() {
  const router = useRouter();

  const handleNextPress = () => {
    router.push("/language");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.centerContent}>
          <View style={styles.logo}>
            <Ionicons
              name="construct-outline"
              size={42}
              color={KhedmatPalette.white}
            />
          </View>

          <Text style={styles.brandTitle}>
            Khedmat
          </Text>

          <Text style={styles.brandSubtitle}>
            Find trusted help, near you
          </Text>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Continue"
          onPress={handleNextPress}
          style={({ pressed }) => [
            styles.continueButton,
            pressed && styles.continueButtonPressed,
          ]}
        >
          <Ionicons
            name="arrow-forward"
            size={24}
            color={KhedmatPalette.navy900}
          />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: KhedmatPalette.navy900,
  },

  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.screen,
    paddingBottom: Spacing.xxl,
    backgroundColor: KhedmatPalette.navy900,
  },

  centerContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  logo: {
    width: 88,
    height: 88,
    marginBottom: Spacing.xl,
    borderRadius: Radius.xxl,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: KhedmatPalette.navy700,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.22)",
  },

  brandTitle: {
    ...Typography.display,
    color: KhedmatPalette.white,
    textAlign: "center",
  },

  brandSubtitle: {
    ...Typography.bodyStyle,
    marginTop: Spacing.xs,
    color: KhedmatPalette.blue200,
    textAlign: "center",
  },

  continueButton: {
    width: 56,
    height: 56,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: KhedmatPalette.white,
    ...Shadows.medium,
  },

  continueButtonPressed: {
    opacity: 0.86,
    transform: [{ scale: 0.96 }],
  },
});