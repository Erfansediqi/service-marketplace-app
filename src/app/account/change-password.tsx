import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import {
  Fonts,
  KhedmatPalette,
  Layout,
  Radius,
  Spacing,
  Typography,
} from "../../constants/theme";
import { useLanguage } from "../../context/languagecontext";
import { useSupabaseAuth } from "../../context/supabase-auth-context";

const MINIMUM_PASSWORD_LENGTH =
  8;

export default function ChangePasswordScreen() {
  const router = useRouter();

  const {
    t,
    isRTL,
    rowDirection,
    textDirection,
  } = useLanguage();

  const {
    updatePassword,
    isUpdatingPassword,
    user,
  } = useSupabaseAuth();

  const [
    password,
    setPassword,
  ] = useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");

  const [
    passwordVisible,
    setPasswordVisible,
  ] = useState(false);

  const [
    confirmVisible,
    setConfirmVisible,
  ] = useState(false);

  const passwordLongEnough =
    password.length >=
    MINIMUM_PASSWORD_LENGTH;

  const passwordsMatch =
    password.length > 0 &&
    password ===
      confirmPassword;

  const canSubmit =
    Boolean(user) &&
    passwordLongEnough &&
    passwordsMatch &&
    !isUpdatingPassword;

  const accountIdentifier =
    useMemo(
      () =>
        user?.email ||
        user?.phone ||
        "",
      [
        user?.email,
        user?.phone,
      ],
    );

  const handleSave =
    async (): Promise<void> => {
      if (
        !passwordLongEnough
      ) {
        Alert.alert(
          t("passwordTooShortTitle"),
          t("passwordTooShortMessage"),
        );

        return;
      }

      if (!passwordsMatch) {
        Alert.alert(
          t("passwordsDoNotMatchTitle"),
          t("passwordsDoNotMatchMessage"),
        );

        return;
      }

      try {
        await updatePassword(
          password,
        );

        Alert.alert(
          t("passwordUpdatedTitle"),
          t("passwordUpdatedMessage"),
          [
            {
              text: t("doneAction"),
              onPress: () =>
                router.back(),
            },
          ],
        );
      } catch (error) {
        console.error(
          "Failed to update password:",
          error,
        );

        const message =
          getPasswordUpdateErrorMessage(
            error,
            {
              reauthRequired:
                t(
                  "passwordReauthRequired",
                ),
              weakPassword:
                t(
                  "weakPasswordMessage",
                ),
              genericUpdateError:
                t(
                  "passwordUpdateGenericError",
                ),
            },
          );

        Alert.alert(
          t("unableToUpdatePasswordTitle"),
          message,
        );
      }
    };

  return (
    <SafeAreaView
      style={styles.safeArea}
    >
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={
          Platform.OS === "ios"
            ? "padding"
            : undefined
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
            accessibilityLabel={t("back")}
            onPress={() =>
              router.back()
            }
            style={({
              pressed,
            }) => [
              styles.backButton,
              pressed &&
                styles.pressed,
            ]}
          >
            <Ionicons
              name={
                isRTL
                  ? "chevron-forward"
                  : "chevron-back"
              }
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
            {t("changePasswordTitle")}
          </Text>

          <View
            style={
              styles.headerSpacer
            }
          />
        </View>

        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={
            false
          }
          contentContainerStyle={
            styles.scrollContent
          }
        >
          <View
            style={
              styles.heroIcon
            }
          >
            <Ionicons
              name="lock-closed-outline"
              size={30}
              color={
                KhedmatPalette.navy900
              }
            />
          </View>

          <Text
            style={[
              styles.heading,
              {
                writingDirection:
                  textDirection,
              },
            ]}
          >
            {t("secureAccountTitle")}
          </Text>

          <Text
            style={[
              styles.description,
              {
                writingDirection:
                  textDirection,
              },
            ]}
          >
            {t("secureAccountSubtitle")}
          </Text>

          {accountIdentifier ? (
            <View
              style={[
                styles.accountHint,
                {
                  flexDirection:
                    rowDirection,
                },
              ]}
            >
              <Ionicons
                name="person-circle-outline"
                size={18}
                color={
                  KhedmatPalette.blue500
                }
              />

              <Text
                numberOfLines={1}
                style={
                  styles.accountHintText
                }
              >
                {accountIdentifier}
              </Text>
            </View>
          ) : null}

          <View
            style={
              styles.form
            }
          >
            <PasswordField
              label={t("newPasswordLabel")}
              value={password}
              visible={
                passwordVisible
              }
              placeholder={t("newPasswordPlaceholder")}
              onChangeText={
                setPassword
              }
              onToggleVisibility={() =>
                setPasswordVisible(
                  (current) =>
                    !current,
                )
              }
              showLabel={t("showPassword")}
              hideLabel={t("hidePassword")}
              isRTL={isRTL}
              rowDirection={rowDirection}
              textDirection={textDirection}
            />

            <Text
              style={[
                styles.requirement,
                {
                  textAlign:
                    isRTL
                      ? "right"
                      : "left",
                  writingDirection:
                    textDirection,
                },
                password.length > 0 &&
                  passwordLongEnough &&
                  styles.requirementMet,
              ]}
            >
              {t("passwordMinimumRequirement")}
            </Text>

            <PasswordField
              label={t("confirmPasswordLabel")}
              value={
                confirmPassword
              }
              visible={
                confirmVisible
              }
              placeholder={t("confirmPasswordPlaceholder")}
              onChangeText={
                setConfirmPassword
              }
              onToggleVisibility={() =>
                setConfirmVisible(
                  (current) =>
                    !current,
                )
              }
              showLabel={t("showPassword")}
              hideLabel={t("hidePassword")}
              isRTL={isRTL}
              rowDirection={rowDirection}
              textDirection={textDirection}
            />

            {confirmPassword.length >
              0 &&
            !passwordsMatch ? (
              <Text
                style={[
                  styles.errorText,
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
                {t("passwordsDoNotMatch")}
              </Text>
            ) : null}
          </View>

          <View
            style={[
              styles.securityNote,
              {
                flexDirection:
                  rowDirection,
              },
            ]}
          >
            <Ionicons
              name="shield-checkmark-outline"
              size={20}
              color={
                KhedmatPalette.blue500
              }
            />

            <Text
              style={[
                styles.securityNoteText,
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
              {t("passwordSecurityNote")}
            </Text>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t("savePassword")}
            disabled={!canSubmit}
            onPress={() => {
              void handleSave();
            }}
            style={({
              pressed,
            }) => [
              styles.saveButton,
              !canSubmit &&
                styles.saveButtonDisabled,
              pressed &&
                canSubmit &&
                styles.saveButtonPressed,
            ]}
          >
            <Text
              style={
                styles.saveButtonText
              }
            >
              {isUpdatingPassword
                ? t("savingPassword")
                : t("savePassword")}
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

type PasswordFieldProps = {
  label: string;
  value: string;
  visible: boolean;
  placeholder: string;
  onChangeText: (
    value: string,
  ) => void;
  onToggleVisibility: () => void;
  showLabel: string;
  hideLabel: string;
  isRTL: boolean;
  rowDirection: "row" | "row-reverse";
  textDirection: "ltr" | "rtl";
};

function PasswordField({
  label,
  value,
  visible,
  placeholder,
  onChangeText,
  onToggleVisibility,
  showLabel,
  hideLabel,
  isRTL,
  rowDirection,
  textDirection,
}: PasswordFieldProps) {
  return (
    <View
      style={
        styles.fieldGroup
      }
    >
      <Text
        style={[
          styles.label,
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
        {label}
      </Text>

      <View
        style={[
          styles.inputContainer,
          {
            flexDirection:
              rowDirection,
          },
        ]}
      >
        <TextInput
          value={value}
          onChangeText={
            onChangeText
          }
          secureTextEntry={
            !visible
          }
          autoCapitalize="none"
          autoCorrect={false}
          textContentType="newPassword"
          autoComplete="new-password"
          placeholder={
            placeholder
          }
          placeholderTextColor={
            KhedmatPalette.textMuted
          }
          style={[
            styles.input,
            {
              textAlign:
                isRTL
                  ? "right"
                  : "left",
              writingDirection:
                textDirection,
            },
          ]}
        />

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={
            visible
              ? hideLabel
              : showLabel
          }
          hitSlop={8}
          onPress={
            onToggleVisibility
          }
          style={styles.eyeButton}
        >
          <Ionicons
            name={
              visible
                ? "eye-off-outline"
                : "eye-outline"
            }
            size={20}
            color={
              KhedmatPalette.textSecondary
            }
          />
        </Pressable>
      </View>
    </View>
  );
}

type PasswordUpdateErrorCopy = {
  reauthRequired: string;
  weakPassword: string;
  genericUpdateError: string;
};

function getPasswordUpdateErrorMessage(
  error: unknown,
  copy: PasswordUpdateErrorCopy,
): string {
  const rawMessage =
    error instanceof Error
      ? error.message
      : "";

  const normalized =
    rawMessage.toLowerCase();

  if (
    normalized.includes(
      "reauth",
    ) ||
    normalized.includes(
      "nonce",
    )
  ) {
    return copy.reauthRequired;
  }

  if (
    normalized.includes(
      "password",
    ) &&
    normalized.includes(
      "weak",
    )
  ) {
    return copy.weakPassword;
  }

  return (
    rawMessage ||
    copy.genericUpdateError
  );
}

const styles =
  StyleSheet.create({
    flex: {
      flex: 1,
    },

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
      borderWidth:
        StyleSheet.hairlineWidth,
      borderColor:
        KhedmatPalette.blue200,
      backgroundColor:
        KhedmatPalette.white,
    },

    title: {
      ...Typography.screenTitle,
      flex: 1,
      color:
        KhedmatPalette.textPrimary,
      textAlign: "center",
      fontSize: 20,
      lineHeight: 26,
    },

    headerSpacer: {
      width: 42,
      height: 42,
    },

    scrollContent: {
      width: "100%",
      maxWidth:
        Layout.contentMaxWidth,
      alignSelf: "center",
      flexGrow: 1,
      paddingHorizontal:
        Layout.screenPadding,
      paddingTop:
        Spacing.xl,
      paddingBottom:
        Spacing.xxl,
    },

    heroIcon: {
      width: 72,
      height: 72,
      alignSelf: "center",
      borderRadius:
        Radius.pill,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor:
        KhedmatPalette.blue050,
      borderWidth:
        StyleSheet.hairlineWidth,
      borderColor:
        KhedmatPalette.blue200,
    },

    heading: {
      ...Typography.screenTitle,
      marginTop:
        Spacing.lg,
      color:
        KhedmatPalette.textPrimary,
      textAlign: "center",
      fontSize: 22,
      lineHeight: 28,
    },

    description: {
      ...Typography.bodyStyle,
      width: "100%",
      maxWidth: 360,
      alignSelf: "center",
      marginTop:
        Spacing.xs,
      color:
        KhedmatPalette.textSecondary,
      textAlign: "center",
      lineHeight: 22,
    },

    accountHint: {
      alignSelf: "center",
      maxWidth: "100%",
      alignItems: "center",
      gap: Spacing.xs,
      marginTop:
        Spacing.md,
      paddingHorizontal:
        Spacing.md,
      paddingVertical:
        Spacing.xs,
      borderRadius:
        Radius.pill,
      backgroundColor:
        KhedmatPalette.blue050,
    },

    accountHintText: {
      ...Typography.captionStyle,
      flexShrink: 1,
      color:
        KhedmatPalette.textSecondary,
    },

    form: {
      width: "100%",
      marginTop:
        Spacing.xl,
      gap: Spacing.sm,
    },

    fieldGroup: {
      width: "100%",
    },

    label: {
      ...Typography.label,
      color:
        KhedmatPalette.textPrimary,
      marginBottom:
        Spacing.xs,
    },

    inputContainer: {
      width: "100%",
      minHeight: 54,
      alignItems: "center",
      borderRadius:
        Radius.md,
      borderWidth:
        StyleSheet.hairlineWidth,
      borderColor:
        KhedmatPalette.blue200,
      backgroundColor:
        KhedmatPalette.white,
      shadowColor:
        KhedmatPalette.navy900,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.04,
      shadowRadius: 6,
      elevation: 1,
    },

    input: {
      ...Typography.bodyStyle,
      flex: 1,
      minHeight: 54,
      paddingHorizontal:
        Spacing.md,
      color:
        KhedmatPalette.textPrimary,
    },

    eyeButton: {
      width: 46,
      height: 52,
      alignItems: "center",
      justifyContent: "center",
    },

    requirement: {
      ...Typography.captionStyle,
      color:
        KhedmatPalette.textMuted,
      marginBottom:
        Spacing.md,
    },

    requirementMet: {
      color:
        KhedmatPalette.blue500,
    },

    errorText: {
      ...Typography.captionStyle,
      color:
        KhedmatPalette.error,
      marginTop:
        -Spacing.xs,
    },

    securityNote: {
      width: "100%",
      marginTop:
        Spacing.xl,
      alignItems:
        "flex-start",
      gap: Spacing.sm,
      padding:
        Spacing.md,
      borderRadius:
        Radius.md,
      backgroundColor:
        KhedmatPalette.blue050,
      borderWidth:
        StyleSheet.hairlineWidth,
      borderColor:
        KhedmatPalette.blue200,
    },

    securityNoteText: {
      ...Typography.captionStyle,
      flex: 1,
      color:
        KhedmatPalette.textSecondary,
      lineHeight: 19,
    },

    footer: {
      width: "100%",
      paddingHorizontal:
        Layout.screenPadding,
      paddingVertical:
        Spacing.md,
      backgroundColor:
        KhedmatPalette.white,
      borderTopWidth:
        StyleSheet.hairlineWidth,
      borderTopColor:
        KhedmatPalette.blue200,
    },

    saveButton: {
      width: "100%",
      maxWidth:
        Layout.contentMaxWidth,
      alignSelf: "center",
      height: 54,
      borderRadius:
        Radius.lg,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor:
        KhedmatPalette.navy900,
      shadowColor:
        KhedmatPalette.navy900,
      shadowOffset: {
        width: 0,
        height: 3,
      },
      shadowOpacity: 0.12,
      shadowRadius: 8,
      elevation: 2,
    },

    saveButtonDisabled: {
      backgroundColor:
        KhedmatPalette.blue200,
      shadowOpacity: 0,
      elevation: 0,
    },

    saveButtonPressed: {
      opacity: 0.84,
      transform: [
        {
          scale: 0.995,
        },
      ],
    },

    saveButtonText: {
      ...Typography.label,
      color:
        KhedmatPalette.white,
      fontFamily:
        Fonts.bold,
      fontSize: 15,
      lineHeight: 20,
    },

    pressed: {
      opacity: 0.72,
    },
  });
