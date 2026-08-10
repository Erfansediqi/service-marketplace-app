import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";

import {
  KhedmatPalette,
  Layout,
  Radius,
  Spacing,
  Typography,
} from "../../constants/theme";
import { useBiometricSecurity } from "../../context/biometric-security-context";
import { useLanguage } from "../../context/languagecontext";

export default function PrivacySecurityScreen() {
  const router = useRouter();

  const {
    t,
    isRTL,
    rowDirection,
    textDirection,
  } = useLanguage();

  const {
    biometricsEnabled,
    isBiometricAvailable,
    isChangingBiometricSetting,
    enableBiometrics,
    disableBiometrics,
  } = useBiometricSecurity();

  // Existing location UI state is intentionally preserved for now.
  const [location, setLocation] = useState(true);

  const handleBiometricToggle =
    async (
      nextValue: boolean,
    ): Promise<void> => {
      if (
        isChangingBiometricSetting
      ) {
        return;
      }

      try {
        if (nextValue) {
          await enableBiometrics();
        } else {
          await disableBiometrics();
        }
      } catch (error) {
        console.error(
          "Failed to update biometric login setting:",
          error,
        );

        Alert.alert(
          t("biometricUpdateErrorTitle"),
          t("biometricUpdateErrorMessage"),
        );
      }
    };

  return (
    <SafeAreaView style={styles.safeArea}>
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
          accessibilityLabel={t("back")}
          onPress={() => router.back()}
          style={({ pressed }) => [
            styles.backButton,
            pressed &&
              styles.pressed,
          ]}
        >
          <Ionicons
            name={isRTL ? "chevron-forward" : "chevron-back"}
            size={22}
            color={
              KhedmatPalette.navy900
            }
          />
        </Pressable>

        <Text
          style={[
            styles.title,
            {
              writingDirection:
                textDirection,
            },
          ]}
        >
          {t("privacySecurityTitle")}
        </Text>

        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          styles.scrollContent
        }
      >
        <Text
          style={[
            styles.sectionTitle,
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
          {t("securitySectionTitle")}
        </Text>

        <View style={styles.cardGroup}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t("setOrChangePassword")}
            onPress={() =>
              router.push(
                "/account/change-password",
              )
            }
            style={({ pressed }) => [
              styles.row,
              {
                flexDirection:
                  rowDirection,
              },
              pressed &&
                styles.rowPressed,
            ]}
          >
            <View
              style={[
                styles.rowLead,
                {
                  flexDirection:
                    rowDirection,
                },
              ]}
            >
              <View style={styles.rowIcon}>
                <Ionicons
                  name="key-outline"
                  size={21}
                  color={
                    KhedmatPalette.blue500
                  }
                />
              </View>

              <View style={styles.rowCopy}>
                <Text
                  style={[
                    styles.rowTitle,
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
                  {t("setOrChangePassword")}
                </Text>

                <Text
                  style={[
                    styles.rowSubtitle,
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
                  {t("updatePasswordSubtitle")}
                </Text>
              </View>
            </View>

            <Ionicons
              name={isRTL ? "chevron-back" : "chevron-forward"}
              size={20}
              color={
                KhedmatPalette.textMuted
              }
            />
          </Pressable>

          <View style={styles.divider} />

          <View
            style={[
              styles.row,
              {
                flexDirection:
                  rowDirection,
              },
            ]}
          >
            <View
              style={[
                styles.rowLead,
                {
                  flexDirection:
                    rowDirection,
                },
              ]}
            >
              <View style={styles.rowIcon}>
                <Ionicons
                  name="finger-print-outline"
                  size={22}
                  color={
                    KhedmatPalette.blue500
                  }
                />
              </View>

              <View style={styles.rowCopy}>
                <Text
                  style={[
                    styles.rowTitle,
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
                  {t("biometricLogin")}
                </Text>

                <Text
                  style={[
                    styles.rowSubtitle,
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
                  {isBiometricAvailable
                    ? t("biometricLoginAvailableSubtitle")
                    : t("biometricLoginUnavailableSubtitle")}
                </Text>
              </View>
            </View>

            <Switch
              value={
                biometricsEnabled
              }
              disabled={
                isChangingBiometricSetting
              }
              onValueChange={(
                nextValue,
              ) => {
                void handleBiometricToggle(
                  nextValue,
                );
              }}
              trackColor={{
                false:
                  KhedmatPalette.blue200,
                true:
                  KhedmatPalette.blue500,
              }}
              thumbColor={
                KhedmatPalette.white
              }
            />
          </View>
        </View>

        <Text
          style={[
            styles.sectionTitle,
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
          {t("dataPrivacySectionTitle")}
        </Text>

        <View style={styles.cardGroup}>
          <View
            style={[
              styles.row,
              {
                flexDirection:
                  rowDirection,
              },
            ]}
          >
            <View
              style={[
                styles.rowLead,
                {
                  flexDirection:
                    rowDirection,
                },
              ]}
            >
              <View style={styles.rowIcon}>
                <Ionicons
                  name="location-outline"
                  size={21}
                  color={
                    KhedmatPalette.blue500
                  }
                />
              </View>

              <View style={styles.rowCopy}>
                <Text
                  style={[
                    styles.rowTitle,
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
                  {t("locationServices")}
                </Text>

                <Text
                  style={[
                    styles.rowSubtitle,
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
                  {t("locationServicesSubtitle")}
                </Text>
              </View>
            </View>

            <Switch
              value={location}
              onValueChange={setLocation}
              trackColor={{
                false:
                  KhedmatPalette.blue200,
                true:
                  KhedmatPalette.blue500,
              }}
              thumbColor={
                KhedmatPalette.white
              }
            />
          </View>

          <View style={styles.divider} />

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t("deleteAccount")}
            style={({ pressed }) => [
              styles.row,
              {
                flexDirection:
                  rowDirection,
              },
              pressed &&
                styles.rowPressed,
            ]}
          >
            <View
              style={[
                styles.rowLead,
                {
                  flexDirection:
                    rowDirection,
                },
              ]}
            >
              <View
                style={[
                  styles.rowIcon,
                  styles.destructiveIcon,
                ]}
              >
                <Ionicons
                  name="trash-outline"
                  size={20}
                  color={
                    KhedmatPalette.error
                  }
                />
              </View>

              <View style={styles.rowCopy}>
                <Text
                  style={[
                    styles.rowTitle,
                    styles.destructiveText,
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
                  {t("deleteAccount")}
                </Text>

                <Text
                  style={[
                    styles.rowSubtitle,
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
                  {t("deleteAccountSubtitle")}
                </Text>
              </View>
            </View>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles =
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor:
        KhedmatPalette.white,
    },

    header: {
      width: "100%",
      maxWidth:
        Layout.contentMaxWidth,
      alignSelf: "center",
      minHeight: 64,
      alignItems: "center",
      paddingHorizontal:
        Layout.screenPadding,
      paddingVertical:
        Spacing.sm,
    },

    backButton: {
      width: 42,
      height: 42,
      flexShrink: 0,
      borderRadius:
        Radius.pill,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor:
        KhedmatPalette.white,
      borderWidth:
        StyleSheet.hairlineWidth,
      borderColor:
        KhedmatPalette.blue200,
    },

    title: {
      ...Typography.screenTitle,
      flex: 1,
      color:
        KhedmatPalette.textPrimary,
      fontSize: 22,
      lineHeight: 28,
      textAlign: "center",
    },

    headerSpacer: {
      width: 42,
      height: 42,
      flexShrink: 0,
    },

    scrollContent: {
      width: "100%",
      maxWidth:
        Layout.contentMaxWidth,
      alignSelf: "center",
      paddingHorizontal:
        Layout.screenPadding,
      paddingTop: Spacing.md,
      paddingBottom:
        Spacing.xxl,
    },

    sectionTitle: {
      ...Typography.sectionTitle,
      color:
        KhedmatPalette.textPrimary,
      fontSize: 18,
      lineHeight: 24,
      marginBottom:
        Spacing.sm,
      marginTop:
        Spacing.lg,
    },

    cardGroup: {
      width: "100%",
      borderRadius:
        Radius.lg,
      backgroundColor:
        KhedmatPalette.white,
      borderWidth:
        StyleSheet.hairlineWidth,
      borderColor:
        KhedmatPalette.blue200,
      overflow: "hidden",
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

    row: {
      width: "100%",
      minHeight: 82,
      alignItems: "center",
      justifyContent:
        "space-between",
      gap: Spacing.md,
      paddingHorizontal:
        Spacing.md,
      paddingVertical:
        Spacing.sm,
    },

    rowLead: {
      flex: 1,
      minWidth: 0,
      alignItems: "center",
      gap: Spacing.md,
    },

    rowIcon: {
      width: 42,
      height: 42,
      flexShrink: 0,
      borderRadius:
        Radius.md,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor:
        KhedmatPalette.blue050,
    },

    destructiveIcon: {
      backgroundColor:
        "#FFF3F2",
    },

    rowCopy: {
      flex: 1,
      minWidth: 0,
    },

    rowTitle: {
      ...Typography.label,
      color:
        KhedmatPalette.textPrimary,
      fontSize: 15,
      lineHeight: 20,
    },

    rowSubtitle: {
      ...Typography.captionStyle,
      color:
        KhedmatPalette.textSecondary,
      marginTop: 3,
      lineHeight: 18,
    },

    destructiveText: {
      color:
        KhedmatPalette.error,
    },

    divider: {
      height:
        StyleSheet.hairlineWidth,
      marginHorizontal:
        Spacing.md + 42 + Spacing.md,
      backgroundColor:
        KhedmatPalette.blue200,
    },

    rowPressed: {
      backgroundColor:
        KhedmatPalette.blue050,
    },

    pressed: {
      opacity: 0.72,
    },
  });
