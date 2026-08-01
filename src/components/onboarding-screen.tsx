import { Ionicons } from "@expo/vector-icons";
import { ComponentProps } from "react";
import { StyleSheet, Text, View } from "react-native";

import { Colors, Radius, Spacing, Typography } from "../constants/theme";
import { useLanguage } from "../context/languagecontext";
import { GlassButton } from "./glass/glass-button";
import { GlassSurface } from "./glass/glass-surface";
import { AppScreen } from "./layout/app-screen";

type IconName = ComponentProps<typeof Ionicons>["name"];

type OnboardingScreenProps = {
  title: string;
  subtitle: string;
  icon: IconName;
  activePage: 0 | 1 | 2;
  buttonLabel: string;
  onPress: () => void;
};

export function OnboardingScreen({
  title,
  subtitle,
  icon,
  activePage,
  buttonLabel,
  onPress,
}: OnboardingScreenProps) {
  const { language } = useLanguage();
  const isEnglish = language === "English";

  return (
    <AppScreen
      contentStyle={styles.screenContent}
      footer={
        <View style={styles.footer}>
          <GlassButton
            label={buttonLabel}
            icon={isEnglish ? "arrow-forward" : "arrow-back"}
            iconPosition={isEnglish ? "right" : "left"}
            onPress={onPress}
          />
        </View>
      }
    >
      <View
        style={[
          styles.content,
          { alignItems: isEnglish ? "flex-start" : "flex-end" },
        ]}
      >
        <GlassSurface
          variant="prominent"
          radius={Radius.xxl}
          style={styles.iconSurface}
          contentStyle={styles.iconContent}
        >
          <Ionicons name={icon} size={38} color={Colors.primary} />
        </GlassSurface>

        <View
          style={[
            styles.copy,
            { alignItems: isEnglish ? "flex-start" : "flex-end" },
          ]}
        >
          <Text
            style={[
              styles.title,
              {
                textAlign: isEnglish ? "left" : "right",
                writingDirection: isEnglish ? "ltr" : "rtl",
              },
            ]}
          >
            {title}
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
            {subtitle}
          </Text>
        </View>

        <GlassSurface
          variant="regular"
          radius={Radius.pill}
          style={styles.paginationSurface}
          contentStyle={[
            styles.pagination,
            { flexDirection: isEnglish ? "row" : "row-reverse" },
          ]}
        >
          {[0, 1, 2].map((page) => (
            <View
              key={page}
              style={[styles.dot, activePage === page && styles.activeDot]}
            />
          ))}
        </GlassSurface>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  screenContent: {
    justifyContent: "center",
  },

  content: {
    flex: 1,
    justifyContent: "center",
    paddingBottom: Spacing.section,
  },

  iconSurface: {
    width: 104,
    height: 104,
    alignSelf: "center",
    marginBottom: Spacing.screen,
    backgroundColor: "rgba(76, 141, 255, 0.10)",
    borderColor: "rgba(100, 158, 255, 0.28)",
  },

  iconContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  copy: {
    width: "100%",
    gap: Spacing.lg,
  },

  title: {
    ...Typography.screenTitle,
    width: "100%",
    color: Colors.textPrimary,
  },

  subtitle: {
    ...Typography.bodyLarge,
    width: "100%",
    maxWidth: 430,
    color: Colors.textSecondary,
  },

  paginationSurface: {
    alignSelf: "center",
    marginTop: Spacing.screen,
  },

  pagination: {
    alignItems: "center",
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
  },

  dot: {
    width: 7,
    height: 7,
    borderRadius: Radius.pill,
    backgroundColor: Colors.textMuted,
  },

  activeDot: {
    width: 28,
    backgroundColor: Colors.primary,
  },

  footer: {
    width: "100%",
  },
});
