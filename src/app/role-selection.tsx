import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { KhedmatButton } from "../components/khedmat/khedmat-button";
import { KhedmatCard } from "../components/khedmat/khedmat-card";
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
import { useSession } from "../context/session-context";

type UserRole =
  | "customer"
  | "provider";

type RoleOption = {
  id: UserRole;
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
};

export default function RoleSelectionScreen() {
  const router = useRouter();

  const {
    enterCustomerWorkspace,
  } = useSession();

  const {
    t,
    language,
  } = useLanguage();

  const [
    selectedRole,
    setSelectedRole,
  ] = useState<UserRole | null>(
    null,
  );

  const [
    isContinuing,
    setIsContinuing,
  ] = useState(false);

  const isRtl =
    language === "Dari" ||
    language === "Pashto";

  const roleOptions: RoleOption[] = [
    {
      id: "customer",
      title: t("customerTitle"),
      subtitle:
        getConciseRoleSubtitle(
          language,
          "customer",
        ),
      icon: "person-outline",
    },
    {
      id: "provider",
      title: t("providerTitle"),
      subtitle:
        getConciseRoleSubtitle(
          language,
          "provider",
        ),
      icon: "briefcase-outline",
    },
  ];

  const handleContinue =
    (): void => {
      if (
        !selectedRole ||
        isContinuing
      ) {
        return;
      }

      setIsContinuing(true);

      if (
        selectedRole ===
        "customer"
      ) {
        enterCustomerWorkspace();

        router.replace(
          "/(tabs)",
        );

        return;
      }

      router.push(
        "/provider-account-selection",
      );
    };

  return (
    <KhedmatScreen
      scrollable
      contentStyle={
        styles.screenContent
      }
      footer={
        <View style={styles.footer}>
          <KhedmatButton
            label={t("continue")}
            disabled={
              !selectedRole ||
              isContinuing
            }
            onPress={
              handleContinue
            }
          />

        </View>
      }
    >
      <View style={styles.topBar}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t(
            "back",
          )}
          onPress={() =>
            router.back()
          }
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

      <View style={styles.header}>
        <View
          style={styles.headerIcon}
        >
          <Ionicons
            name="people-outline"
            size={44}
            color={
              KhedmatPalette.white
            }
          />
        </View>

        <View
          style={styles.headerCopy}
        >
          <Text
            style={[
              styles.eyebrow,
              {
                writingDirection:
                  isRtl
                    ? "rtl"
                    : "ltr",
              },
            ]}
          >
            {t("roleEyebrow")}
          </Text>

        </View>
      </View>

      <View style={styles.options}>
        {roleOptions.map(
          (option) => {
            const selected =
              selectedRole ===
              option.id;

            return (
              <Pressable
                key={option.id}
                accessibilityRole="radio"
                accessibilityLabel={
                  option.title
                }
                accessibilityState={{
                  selected,
                }}
                onPress={() =>
                  setSelectedRole(
                    option.id,
                  )
                }
                style={({
                  pressed,
                }) => [
                  styles.optionPressable,
                  pressed &&
                    styles.optionPressed,
                ]}
              >
                <KhedmatCard
                  style={[
                    styles.optionCard,
                    selected &&
                      styles.optionCardSelected,
                  ]}
                  contentStyle={
                    styles.optionCardContent
                  }
                >
                  <View
                    style={[
                      styles.optionTopRow,
                      {
                        flexDirection:
                          isRtl
                            ? "row-reverse"
                            : "row",
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.optionIcon,
                        selected &&
                          styles.optionIconSelected,
                      ]}
                    >
                      <Ionicons
                        name={option.icon}
                        size={28}
                        color={
                          selected
                            ? KhedmatPalette
                                .white
                            : KhedmatPalette
                                .navy700
                        }
                      />
                    </View>

                    <View
                      style={[
                        styles.radioOuter,
                        selected &&
                          styles.radioOuterSelected,
                      ]}
                    >
                      {selected ? (
                        <View
                          style={
                            styles.radioInner
                          }
                        />
                      ) : null}
                    </View>
                  </View>

                  <View
                    style={[
                      styles.optionCopy,
                      {
                        alignItems:
                          isRtl
                            ? "flex-end"
                            : "flex-start",
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.optionTitle,
                        selected &&
                          styles.optionTitleSelected,
                        {
                          textAlign:
                            isRtl
                              ? "right"
                              : "left",

                          writingDirection:
                            isRtl
                              ? "rtl"
                              : "ltr",
                        },
                      ]}
                    >
                      {option.title}
                    </Text>

                    <Text
                      style={[
                        styles.optionSubtitle,
                        {
                          textAlign:
                            isRtl
                              ? "right"
                              : "left",

                          writingDirection:
                            isRtl
                              ? "rtl"
                              : "ltr",
                        },
                      ]}
                    >
                      {
                        option.subtitle
                      }
                    </Text>
                  </View>
                </KhedmatCard>
              </Pressable>
            );
          },
        )}
      </View>
    </KhedmatScreen>
  );
}

function getConciseRoleSubtitle(
  language: string,
  role: UserRole,
): string {
  if (language === "Dari") {
    return role === "customer"
      ? "خدمات مورد نیاز خود را پیدا و رزرو کنید."
      : "خدمات ارائه کنید و درخواست دریافت کنید.";
  }

  if (language === "Pashto") {
    return role === "customer"
      ? "اړین خدمتونه ومومئ او رزرو یې کړئ."
      : "خدمتونه وړاندې کړئ او غوښتنې ترلاسه کړئ.";
  }

  return role === "customer"
    ? "Find and book services."
    : "Offer services and receive requests.";
}

const styles = StyleSheet.create({
  screenContent: {
    paddingTop: Spacing.sm,
    paddingBottom:
      Spacing.xxl,
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

  header: {
    width: "100%",
    marginTop: Spacing.lg,
    alignItems: "center",
    marginBottom: Spacing.lg,
  },

  headerIcon: {
    width: 92,
    height: 92,
    marginBottom: Spacing.xl,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      KhedmatPalette.navy900,
    ...Shadows.darkAccent,
  },

  headerCopy: {
    width: "100%",
    maxWidth:
      Layout.readableTextMaxWidth,
    alignItems: "center",
  },

  eyebrow: {
    ...Typography.captionStyle,
    width: "100%",
    color:
      KhedmatPalette.blue500,
    textAlign: "center",
    fontWeight: "500",
  },



  options: {
    width: "100%",
    marginTop: Spacing.xxl,
    gap: Spacing.md,
  },

  optionPressable: {
    width: "100%",
    borderRadius: Radius.xl,
  },

  optionPressed: {
    opacity: 0.88,
    transform: [
      {
        scale: 0.993,
      },
    ],
  },

  optionCard: {
    width: "100%",
    borderWidth: 1,
    borderColor:
      KhedmatPalette.border,
    backgroundColor:
      KhedmatPalette.surface,
  },

  optionCardSelected: {
    borderWidth: 2,
    borderColor:
      KhedmatPalette.blue500,
    backgroundColor:
      KhedmatPalette.surfaceSoft,
    ...Shadows.small,
  },

  optionCardContent: {
    padding: Spacing.lg,
    gap: Spacing.md,
  },

  optionTopRow: {
    width: "100%",
    alignItems: "center",
    justifyContent:
      "space-between",
  },

  optionIcon: {
    width: 54,
    height: 54,
    borderRadius: Radius.lg,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      KhedmatPalette.surfaceSoft,
    borderWidth: 1,
    borderColor:
      KhedmatPalette.border,
  },

  optionIconSelected: {
    backgroundColor:
      KhedmatPalette.navy900,
    borderColor:
      KhedmatPalette.navy900,
  },

  radioOuter: {
    width: 26,
    height: 26,
    flexShrink: 0,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor:
      KhedmatPalette.border,
    backgroundColor:
      KhedmatPalette.surface,
  },

  radioOuterSelected: {
    borderColor:
      KhedmatPalette.blue500,
    backgroundColor:
      KhedmatPalette.surface,
  },

  radioInner: {
    width: 14,
    height: 14,
    borderRadius: Radius.pill,
    backgroundColor:
      KhedmatPalette.blue500,
  },

  optionCopy: {
    width: "100%",
    gap: Spacing.xs,
  },

  optionTitle: {
    ...Typography.sectionTitle,
    width: "100%",
    color:
      KhedmatPalette.textPrimary,
    fontSize: 19,
    lineHeight: 25,
  },

  optionTitleSelected: {
    color:
      KhedmatPalette.navy900,
  },

  optionSubtitle: {
    ...Typography.bodyStyle,
    width: "100%",
    color:
      KhedmatPalette.textSecondary,
    lineHeight: 22,
  },

  footer: {
    width: "100%",
    alignItems: "center",
    gap: Spacing.sm,
  },

});