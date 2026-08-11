import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { KhedmatButton } from "../components/khedmat/khedmat-button";
import { KhedmatCard } from "../components/khedmat/khedmat-card";
import { KhedmatInput } from "../components/khedmat/khedmat-input";
import { KhedmatScreen } from "../components/khedmat/khedmat-screen";
import {
  KhedmatPalette,
  Layout,
  Radius,
  Spacing,
  Typography,
} from "../constants/theme";
import { useLanguage } from "../context/languagecontext";
import { useSession } from "../context/session-context";
import {
  getProviderAccount,
  updateProviderAccount,
  type ProviderAccountRow,
} from "../repositories/provider-account-repository";

export default function ProviderProfessionalProfileScreen() {
  const router = useRouter();

  const {
    t,
    isRTL,
    rowDirection,
    textDirection,
  } = useLanguage();

  const {
    activeProviderId,
  } = useSession();

  const [
    provider,
    setProvider,
  ] = useState<ProviderAccountRow | null>(
    null,
  );

  const [
    businessName,
    setBusinessName,
  ] = useState("");

  const [
    profession,
    setProfession,
  ] = useState("");

  const [
    yearsExperience,
    setYearsExperience,
  ] = useState("");

  const [
    description,
    setDescription,
  ] = useState("");

  const [
    isLoading,
    setIsLoading,
  ] = useState(true);

  const [
    isSaving,
    setIsSaving,
  ] = useState(false);

  const [
    loadFailed,
    setLoadFailed,
  ] = useState(false);

  useFocusEffect(
    useCallback(() => {
    let isMounted = true;

    const loadProvider =
      async (): Promise<void> => {
        if (!activeProviderId) {
          if (isMounted) {
            setProvider(null);
            setLoadFailed(true);
            setIsLoading(false);
          }

          return;
        }

        setIsLoading(true);
        setLoadFailed(false);

        try {
          const account =
            await getProviderAccount(
              activeProviderId,
            );

          if (!isMounted) {
            return;
          }

          if (!account) {
            setProvider(null);
            setLoadFailed(true);
            return;
          }

          setProvider(account);
          setBusinessName(
            account.business_name ?? "",
          );
          setProfession(
            account.profession ?? "",
          );
          setYearsExperience(
            account.years_experience ?? "",
          );
          setDescription(
            account.description ?? "",
          );
        } catch (error) {
          console.error(
            "Failed to load provider professional profile:",
            error,
          );

          if (isMounted) {
            setProvider(null);
            setLoadFailed(true);
          }
        } finally {
          if (isMounted) {
            setIsLoading(false);
          }
        }
      };

    void loadProvider();

    return () => {
      isMounted = false;
    };

    }, [activeProviderId]),
  );

  const normalizedBusinessName =
    businessName.trim();

  const normalizedProfession =
    profession.trim();

  const normalizedExperience =
    yearsExperience.trim();

  const normalizedDescription =
    description.trim();

  const hasChanges = useMemo(() => {
    if (!provider) {
      return false;
    }

    return (
      normalizedBusinessName !==
        (provider.business_name ?? "").trim() ||
      normalizedProfession !==
        (provider.profession ?? "").trim() ||
      normalizedExperience !==
        (provider.years_experience ?? "").trim() ||
      normalizedDescription !==
        (provider.description ?? "").trim()
    );
  }, [
    normalizedBusinessName,
    normalizedDescription,
    normalizedExperience,
    normalizedProfession,
    provider,
  ]);

  const saveProfile =
    async (): Promise<void> => {
      if (
        !provider ||
        !activeProviderId ||
        isSaving
      ) {
        return;
      }

      if (!normalizedBusinessName) {
        Alert.alert(
          t(
            "providerProfessionalProfileTitle",
          ),
          t(
            "providerBusinessNameRequired",
          ),
        );
        return;
      }

      if (!normalizedExperience) {
        Alert.alert(
          t(
            "providerProfessionalProfileTitle",
          ),
          t(
            "providerExperienceRequired",
          ),
        );
        return;
      }

      if (!normalizedDescription) {
        Alert.alert(
          t(
            "providerProfessionalProfileTitle",
          ),
          t(
            "providerIntroductionRequired",
          ),
        );
        return;
      }

      setIsSaving(true);

      try {
        const updated =
          await updateProviderAccount(
            activeProviderId,
            {
              business_name:
                normalizedBusinessName,
              profession:
                normalizedProfession,
              years_experience:
                normalizedExperience,
              description:
                normalizedDescription,
            },
          );

        setProvider(updated);

        Alert.alert(
          t(
            "providerProfessionalProfileSavedTitle",
          ),
          t(
            "providerProfessionalProfileSavedMessage",
          ),
          [
            {
              text: t("okAction"),
              onPress: () =>
                router.back(),
            },
          ],
        );
      } catch (error) {
        console.error(
          "Failed to save provider professional profile:",
          error,
        );

        Alert.alert(
          t(
            "providerProfessionalProfileSaveErrorTitle",
          ),
          t(
            "providerProfessionalProfileSaveErrorMessage",
          ),
        );
      } finally {
        setIsSaving(false);
      }
    };

  return (
    <KhedmatScreen
      scrollable
      keyboardAware
      contentStyle={
        styles.screenContent
      }
      footer={
        !isLoading &&
        !loadFailed &&
        provider ? (
          <KhedmatButton
            label={
              isSaving
                ? t(
                    "providerProfessionalProfileSaving",
                  )
                : t(
                    "providerProfessionalProfileSave",
                  )
            }
            loading={isSaving}
            disabled={
              isSaving ||
              !hasChanges
            }
            onPress={() => {
              void saveProfile();
            }}
          />
        ) : undefined
      }
    >
      <View
        style={[
          styles.header,
          {
            flexDirection:
              rowDirection,
          },
        ]}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={
            t("back")
          }
          onPress={() =>
            router.back()
          }
          style={({ pressed }) => [
            styles.backButton,
            pressed &&
              styles.pressed,
          ]}
        >
          <Ionicons
            name={
              isRTL
                ? "arrow-forward"
                : "arrow-back"
            }
            size={24}
            color={
              KhedmatPalette.navy900
            }
          />
        </Pressable>

        <View
          style={
            styles.headerText
          }
        >
          <Text
            style={[
              styles.title,
              {
                textAlign:
                  isRTL
                    ? "right"
                    : "left",
                writingDirection:
                  textDirection,
              },
            ]}
          >
            {t(
              "providerProfessionalProfileTitle",
            )}
          </Text>

          <Text
            style={[
              styles.subtitle,
              {
                textAlign:
                  isRTL
                    ? "right"
                    : "left",
                writingDirection:
                  textDirection,
              },
            ]}
          >
            {t(
              "providerProfessionalProfileSubtitle",
            )}
          </Text>
        </View>
      </View>

      {isLoading ? (
        <View
          style={
            styles.stateContainer
          }
        >
          <ActivityIndicator
            size="large"
            color={
              KhedmatPalette.blue500
            }
          />

          <Text
            style={[
              styles.stateText,
              {
                writingDirection:
                  textDirection,
              },
            ]}
          >
            {t(
              "providerProfessionalProfileLoading",
            )}
          </Text>
        </View>
      ) : loadFailed ||
        !provider ? (
        <KhedmatCard
          variant="soft"
          style={
            styles.stateCard
          }
        >
          <View
            style={
              styles.stateContainer
            }
          >
            <View
              style={
                styles.stateIcon
              }
            >
              <Ionicons
                name="alert-circle-outline"
                size={28}
                color={
                  KhedmatPalette.warning
                }
              />
            </View>

            <Text
              style={[
                styles.stateTitle,
                {
                  writingDirection:
                    textDirection,
                },
              ]}
            >
              {t(
                "providerProfessionalProfileLoadErrorTitle",
              )}
            </Text>

            <Text
              style={[
                styles.stateText,
                {
                  writingDirection:
                    textDirection,
                },
              ]}
            >
              {t(
                "providerProfessionalProfileLoadErrorMessage",
              )}
            </Text>
          </View>
        </KhedmatCard>
      ) : (
        <KhedmatCard
          style={styles.formCard}
          contentStyle={
            styles.formContent
          }
        >
          <KhedmatInput
            label={t(
              "providerBusinessNameLabel",
            )}
            value={businessName}
            onChangeText={
              setBusinessName
            }
            autoCapitalize="words"
            returnKeyType="next"
            isRtl={isRTL}
            placeholder={t(
              "providerBusinessNamePlaceholder",
            )}
          />

          <KhedmatInput
            label={t(
              "providerProfessionLabel",
            )}
            value={profession}
            onChangeText={
              setProfession
            }
            autoCapitalize="words"
            returnKeyType="next"
            isRtl={isRTL}
          />

          <KhedmatInput
            label={t(
              "providerExperienceLabel",
            )}
            value={
              yearsExperience
            }
            onChangeText={
              setYearsExperience
            }
            isRtl={isRTL}
            placeholder={t(
              "providerExperiencePlaceholder",
            )}
            returnKeyType="next"
          />

          <KhedmatInput
            label={t(
              "providerIntroductionLabel",
            )}
            value={description}
            onChangeText={
              setDescription
            }
            isRtl={isRTL}
            placeholder={t(
              "providerIntroductionPlaceholder",
            )}
            multiline
            textAlignVertical="top"
            numberOfLines={6}
            maxLength={700}
            containerStyle={
              styles.introductionContainer
            }
            style={
              styles.introductionInput
            }
          />
        </KhedmatCard>
      )}
    </KhedmatScreen>
  );
}

const styles =
  StyleSheet.create({
    screenContent: {
      paddingTop:
        Spacing.md,
      paddingBottom:
        Spacing.xxl,
    },

    header: {
      width: "100%",
      maxWidth:
        Layout.contentMaxWidth,
      alignSelf: "center",
      alignItems:
        "flex-start",
      gap: Spacing.md,
      marginBottom:
        Spacing.xl,
    },

    backButton: {
      width: 48,
      height: 48,
      alignItems: "center",
      justifyContent:
        "center",
      borderRadius:
        Radius.pill,
      borderWidth: 1,
      borderColor:
        KhedmatPalette.blue200,
      backgroundColor:
        KhedmatPalette.white,
    },

    headerText: {
      flex: 1,
      paddingTop:
        Spacing.xs,
    },

    title: {
      ...Typography.screenTitle,
      color:
        KhedmatPalette.textPrimary,
    },

    subtitle: {
      ...Typography.bodyStyle,
      marginTop:
        Spacing.xs,
      color:
        KhedmatPalette.textSecondary,
    },

    formCard: {
      width: "100%",
    },

    formContent: {
      gap: Spacing.xl,
    },

    introductionContainer: {
      marginBottom: 0,
    },

    introductionInput: {
      minHeight: 140,
      paddingTop:
        Spacing.md,
    },

    stateCard: {
      marginTop:
        Spacing.sm,
    },

    stateContainer: {
      minHeight: 220,
      alignItems: "center",
      justifyContent:
        "center",
      paddingHorizontal:
        Spacing.xl,
      gap: Spacing.md,
    },

    stateIcon: {
      width: 56,
      height: 56,
      alignItems: "center",
      justifyContent:
        "center",
      borderRadius:
        Radius.pill,
      backgroundColor:
        KhedmatPalette.warningSoft,
    },

    stateTitle: {
      ...Typography.sectionTitle,
      color:
        KhedmatPalette.textPrimary,
      textAlign: "center",
    },

    stateText: {
      ...Typography.bodyStyle,
      color:
        KhedmatPalette.textSecondary,
      textAlign: "center",
    },

    pressed: {
      opacity: 0.72,
    },
  });
