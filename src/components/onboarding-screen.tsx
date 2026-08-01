import { Ionicons } from "@expo/vector-icons";
import { ComponentProps } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  KhedmatPalette,
  Layout,
  Radius,
  Shadows,
  Spacing,
  Typography,
} from "../constants/theme";
import { useLanguage } from "../context/languagecontext";
import { KhedmatButton } from "./khedmat/khedmat-button";
import { KhedmatScreen } from "./khedmat/khedmat-screen";

type IconName =
  ComponentProps<typeof Ionicons>["name"];

type OnboardingScreenProps = {
  title: string;
  subtitle: string;
  icon: IconName;
  activePage: 0 | 1 | 2;
  buttonLabel: string;
  onPress: () => void;
  onBack?: () => void;
};

export function OnboardingScreen({
  title,
  subtitle,
  icon,
  activePage,
  buttonLabel,
  onPress,
  onBack,
}: OnboardingScreenProps) {
  const { language } = useLanguage();

  const isRtl =
    language === "Dari" ||
    language === "Pashto";

  return (
    <KhedmatScreen
      contentStyle={styles.screenContent}
      footer={
        <View style={styles.footer}>
          <KhedmatButton
            label={buttonLabel}
            onPress={onPress}
          />
        </View>
      }
    >
      <View style={styles.topBar}>
        {onBack ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Back"
            onPress={onBack}
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
        ) : (
          <View style={styles.backPlaceholder} />
        )}
      </View>

      <View style={styles.content}>
        <View style={styles.iconCircle}>
          <Ionicons
            name={icon}
            size={46}
            color={KhedmatPalette.white}
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
            {title}
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
            {subtitle}
          </Text>
        </View>

        <View
          style={[
            styles.pagination,
            {
              flexDirection: isRtl
                ? "row-reverse"
                : "row",
            },
          ]}
        >
          {[0, 1, 2].map((page) => (
            <View
              key={page}
              style={[
                styles.dot,
                activePage === page &&
                  styles.activeDot,
              ]}
            />
          ))}
        </View>
      </View>
    </KhedmatScreen>
  );
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
    transform: [{ scale: 0.96 }],
  },

  backPlaceholder: {
    width: 44,
    height: 44,
  },

  content: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: Spacing.screen,
  },

  iconCircle: {
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

  pagination: {
    marginTop: Spacing.screen,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
  },

  dot: {
    width: 8,
    height: 8,
    borderRadius: Radius.pill,
    backgroundColor:
      KhedmatPalette.blue200,
  },

  activeDot: {
    width: 28,
    backgroundColor:
      KhedmatPalette.blue500,
  },

  footer: {
    width: "100%",
  },
});