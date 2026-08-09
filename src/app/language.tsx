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
  Spacing,
  Typography,
} from "../constants/theme";
import { useLanguage } from "../context/languagecontext";

type LanguageOption = {
  id: "English" | "Dari" | "Pashto";
  label: string;
  nativeLabel: string;
};

const languages: LanguageOption[] = [
  {
    id: "English",
    label: "English",
    nativeLabel: "English",
  },
  {
    id: "Dari",
    label: "Dari",
    nativeLabel: "دری",
  },
  {
    id: "Pashto",
    label: "Pashto",
    nativeLabel: "پښتو",
  },
];

export default function LanguageScreen() {
  const router = useRouter();

  const {
    language,
    setLanguage,
    t,
  } = useLanguage();

  const isRtl =
    language === "Dari" ||
    language === "Pashto";

  const handleContinue = () => {
    router.push("/onboarding-1");
  };

  return (
    <KhedmatScreen
      contentStyle={styles.screenContent}
      footer={
        <View style={styles.footer}>
          <KhedmatButton
            label={t("continue")}
            onPress={handleContinue}
          />
        </View>
      }
    >
      <View style={styles.centerContent}>
        <View style={styles.iconArea}>
          <Ionicons
            name="globe-outline"
            size={54}
            color={KhedmatPalette.navy900}
          />
        </View>

        <View style={styles.header}>
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
            {t("chooseLanguage")}
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
            {t("subtitle")}
          </Text>
        </View>

        <View style={styles.optionsContainer}>
          {languages.map((item) => {
            const selected =
              language === item.id;

            const optionIsRtl =
              item.id === "Dari" ||
              item.id === "Pashto";

            return (
              <Pressable
                key={item.id}
                accessibilityRole="radio"
                accessibilityState={{
                  selected,
                }}
                accessibilityLabel={item.label}
                onPress={() =>
                  setLanguage(item.id)
                }
                style={({ pressed }) => [
                  styles.languageCard,
                  selected &&
                    styles.selectedLanguageCard,
                  pressed &&
                    styles.languageCardPressed,
                ]}
              >
                <View
                  style={[
                    styles.optionContent,
                    {
                      flexDirection:
                        optionIsRtl
                          ? "row-reverse"
                          : "row",
                    },
                  ]}
                >
                  <View style={styles.languageCopy}>
                    <Text
                      style={[
                        styles.languageName,
                        selected &&
                          styles.selectedLanguageName,
                        {
                          textAlign:
                            optionIsRtl
                              ? "right"
                              : "left",
                          writingDirection:
                            optionIsRtl
                              ? "rtl"
                              : "ltr",
                        },
                      ]}
                    >
                      {item.nativeLabel}
                    </Text>

                    {item.label !==
                    item.nativeLabel ? (
                      <Text
                        style={[
                          styles.languageSecondaryLabel,
                          {
                            textAlign:
                              optionIsRtl
                                ? "right"
                                : "left",
                          },
                        ]}
                      >
                        {item.label}
                      </Text>
                    ) : null}
                  </View>

                  <View
                    style={[
                      styles.selectionCircle,
                      selected &&
                        styles.selectionCircleSelected,
                    ]}
                  >
                    {selected ? (
                      <Ionicons
                        name="checkmark"
                        size={15}
                        color={KhedmatPalette.white}
                      />
                    ) : null}
                  </View>
                </View>
              </Pressable>
            );
          })}
        </View>
      </View>
    </KhedmatScreen>
  );
}

const styles = StyleSheet.create({
  screenContent: {
    flex: 1,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xxl,
  },

  centerContent: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: Spacing.screen,
  },

  iconArea: {
    width: 68,
    height: 68,
    marginBottom: Spacing.lg,
    alignItems: "center",
    justifyContent: "center",
  },

  header: {
    width: "100%",
    maxWidth:
      Layout.readableTextMaxWidth,
    alignItems: "center",
    gap: Spacing.xs,
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
  },

  optionsContainer: {
    width: "100%",
    marginTop: Spacing.xxl,
    gap: Spacing.md,
  },

  languageCard: {
    width: "100%",
    minHeight: 72,
    justifyContent: "center",
    paddingHorizontal: Spacing.lg,
    backgroundColor:
      KhedmatPalette.white,
    borderWidth:
      StyleSheet.hairlineWidth,
    borderColor:
      KhedmatPalette.blue200,
    borderRadius: Radius.xl,
    shadowColor:
      KhedmatPalette.navy900,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },

  selectedLanguageCard: {
    borderWidth: 1,
    borderColor:
      KhedmatPalette.blue500,
    backgroundColor:
      KhedmatPalette.white,
    shadowOpacity: 0.08,
    elevation: 3,
  },

  languageCardPressed: {
    opacity: 0.88,
    transform: [
      {
        scale: 0.994,
      },
    ],
  },

  optionContent: {
    width: "100%",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.md,
  },

  languageCopy: {
    flex: 1,
    gap: 2,
  },

  languageName: {
    ...Typography.label,
    width: "100%",
    color:
      KhedmatPalette.textPrimary,
    fontSize: 17,
    lineHeight: 23,
  },

  selectedLanguageName: {
    color:
      KhedmatPalette.navy900,
  },

  languageSecondaryLabel: {
    ...Typography.captionStyle,
    width: "100%",
    color:
      KhedmatPalette.textMuted,
  },

  selectionCircle: {
    width: 28,
    height: 28,
    flexShrink: 0,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
    borderWidth:
      StyleSheet.hairlineWidth,
    borderColor:
      KhedmatPalette.blue200,
    backgroundColor:
      KhedmatPalette.white,
  },

  selectionCircleSelected: {
    borderColor:
      KhedmatPalette.navy900,
    backgroundColor:
      KhedmatPalette.navy900,
  },

  footer: {
    width: "100%",
  },
});
