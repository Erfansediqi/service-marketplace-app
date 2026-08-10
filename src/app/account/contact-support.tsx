import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Linking,
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
  KhedmatPalette,
  Layout,
  Radius,
  Spacing,
  Typography,
} from "../../constants/theme";
import { useLanguage } from "../../context/languagecontext";
import { StorageService } from "../../services/storage";

type SupportDraft = {
  subject: string;
  message: string;
};

const SUPPORT_DRAFT_STORAGE_KEY =
  "@khedmat_support_draft";

const WHATSAPP_SUPPORT_GROUP_URL =
  "https://chat.whatsapp.com/GjCrZ073OCqArYPsyA4r02?s=cl&p=i&ilr=0";

const SUPPORT_EMAILS = [
  "Erfansediqi2@gmail.com",
  "khalidvali2@gmail.com",
];

export default function ContactSupportScreen() {
  const router = useRouter();
  const {
    t,
    isRTL,
    rowDirection,
    textDirection,
  } = useLanguage();

  const [subject, setSubject] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [
    isDraftHydrated,
    setIsDraftHydrated,
  ] = useState(false);

  const [
    openingChannel,
    setOpeningChannel,
  ] = useState<
    "whatsapp" | "email" | null
  >(null);

  useEffect(() => {
    let isMounted = true;

    const hydrateDraft =
      async (): Promise<void> => {
        try {
          const storedDraft =
            await StorageService.get<unknown>(
              SUPPORT_DRAFT_STORAGE_KEY,
            );

          if (!isMounted) {
            return;
          }

          const draft =
            normalizeSupportDraft(
              storedDraft,
            );

          setSubject(
            draft.subject,
          );

          setMessage(
            draft.message,
          );
        } finally {
          if (isMounted) {
            setIsDraftHydrated(
              true,
            );
          }
        }
      };

    void hydrateDraft();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isDraftHydrated) {
      return;
    }

    const saveTimer =
      setTimeout(() => {
        const draft: SupportDraft = {
          subject,
          message,
        };

        if (
          !subject.trim() &&
          !message.trim()
        ) {
          void StorageService.remove(
            SUPPORT_DRAFT_STORAGE_KEY,
          );

          return;
        }

        void StorageService.save(
          SUPPORT_DRAFT_STORAGE_KEY,
          draft,
        );
      }, 250);

    return () =>
      clearTimeout(
        saveTimer,
      );
  }, [
    isDraftHydrated,
    message,
    subject,
  ]);

  const validateMessage =
    (): {
      subject: string;
      message: string;
    } | null => {
      const normalizedSubject =
        subject.trim();

      const normalizedMessage =
        message.trim();

      if (
        !normalizedSubject ||
        !normalizedMessage
      ) {
        Alert.alert(
          t("missingInformationTitle"),
          t("missingInformationMessage"),
        );

        return null;
      }

      return {
        subject:
          normalizedSubject,
        message:
          normalizedMessage,
      };
    };

  const openWhatsAppSupport =
    async (): Promise<void> => {
      if (openingChannel) {
        return;
      }

      const draft =
        validateMessage();

      if (!draft) {
        return;
      }

      setOpeningChannel(
        "whatsapp",
      );

      try {
        const canOpen =
          await Linking.canOpenURL(
            WHATSAPP_SUPPORT_GROUP_URL,
          );

        if (!canOpen) {
          throw new Error(
            "WhatsApp support group could not be opened.",
          );
        }

        await Linking.openURL(
          WHATSAPP_SUPPORT_GROUP_URL,
        );
      } catch (error) {
        console.error(
          "Failed to open WhatsApp support group:",
          error,
        );

        Alert.alert(
          t("unableOpenWhatsappTitle"),
          t("unableOpenWhatsappMessage"),
        );
      } finally {
        setOpeningChannel(
          null,
        );
      }
    };

  const openEmailSupport =
    async (): Promise<void> => {
      if (openingChannel) {
        return;
      }

      const draft =
        validateMessage();

      if (!draft) {
        return;
      }

      setOpeningChannel(
        "email",
      );

      try {
        await openEmail(
          SUPPORT_EMAILS,
          draft.subject,
          draft.message,
        );
      } catch (error) {
        console.error(
          "Failed to open email support:",
          error,
        );

        Alert.alert(
          t("unableOpenEmailTitle"),
          t("unableOpenEmailMessage"),
        );
      } finally {
        setOpeningChannel(
          null,
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
            : "height"
        }
      >
        <View
          style={[styles.header, { flexDirection: rowDirection }]}
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
            {t("contactSupportTitle")}
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
              styles.formGroup
            }
          >
            <Text
              style={[
                styles.label,
                {
                  textAlign:
                    isRTL ? "right" : "left",
                  writingDirection:
                    textDirection,
                },
              ]}
            >
              {t("supportSubjectLabel")}
            </Text>

            <TextInput
              style={[
                styles.input,
                {
                  textAlign:
                    isRTL ? "right" : "left",
                  writingDirection:
                    textDirection,
                },
              ]}
              value={subject}
              onChangeText={
                setSubject
              }
              placeholder={t("supportSubjectPlaceholder")}
              placeholderTextColor={
                KhedmatPalette.textMuted
              }
            />
          </View>

          <View
            style={
              styles.formGroup
            }
          >
            <Text
              style={[
                styles.label,
                {
                  textAlign:
                    isRTL ? "right" : "left",
                  writingDirection:
                    textDirection,
                },
              ]}
            >
              {t("supportMessageLabel")}
            </Text>

            <TextInput
              style={[
                styles.input,
                styles.textArea,
                {
                  textAlign:
                    isRTL ? "right" : "left",
                  writingDirection:
                    textDirection,
                },
              ]}
              value={message}
              onChangeText={
                setMessage
              }
              placeholder={t("supportMessagePlaceholder")}
              placeholderTextColor={
                KhedmatPalette.textMuted
              }
              multiline
              textAlignVertical="top"
            />
          </View>

          <Text
            style={[
              styles.sectionTitle,
              {
                textAlign:
                  isRTL ? "right" : "left",
                writingDirection:
                  textDirection,
              },
            ]}
          >
            {t("contactKhedmat")}
          </Text>

          <View
            style={
              styles.contactGrid
            }
          >
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t("whatsapp")}
              disabled={
                Boolean(
                  openingChannel,
                )
              }
              onPress={() => {
                void openWhatsAppSupport();
              }}
              style={({
                pressed,
              }) => [
                styles.contactCard,
                pressed &&
                  !openingChannel &&
                  styles.contactCardPressed,
                openingChannel ===
                  "whatsapp" &&
                  styles.contactCardDisabled,
              ]}
            >
              <View
                style={
                  styles.contactIcon
                }
              >
                <Ionicons
                  name="logo-whatsapp"
                  size={24}
                  color={
                    KhedmatPalette.navy900
                  }
                />
              </View>

              <Text
                style={[
                  styles.contactLabel,
                  {
                    writingDirection:
                      textDirection,
                  },
                ]}
              >
                {t("whatsapp")}
              </Text>

            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t("email")}
              disabled={
                Boolean(
                  openingChannel,
                )
              }
              onPress={() => {
                void openEmailSupport();
              }}
              style={({
                pressed,
              }) => [
                styles.contactCard,
                pressed &&
                  !openingChannel &&
                  styles.contactCardPressed,
                openingChannel ===
                  "email" &&
                  styles.contactCardDisabled,
              ]}
            >
              <View
                style={
                  styles.contactIcon
                }
              >
                <Ionicons
                  name="mail-outline"
                  size={23}
                  color={
                    KhedmatPalette.navy900
                  }
                />
              </View>

              <Text
                style={[
                  styles.contactLabel,
                  {
                    writingDirection:
                      textDirection,
                  },
                ]}
              >
                {t("email")}
              </Text>

            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

async function openEmail(
  emails: string[],
  subject: string,
  message: string,
): Promise<void> {
  const recipients =
    emails.join(",");

  const url =
    `mailto:${recipients}?subject=${encodeURIComponent(
      subject,
    )}&body=${encodeURIComponent(
      message,
    )}`;

  const canOpen =
    await Linking.canOpenURL(
      url,
    );

  if (!canOpen) {
    throw new Error(
      "No email application is available.",
    );
  }

  await Linking.openURL(
    url,
  );
}

function normalizeSupportDraft(
  value: unknown,
): SupportDraft {
  if (
    typeof value !==
      "object" ||
    value === null
  ) {
    return {
      subject: "",
      message: "",
    };
  }

  const draft =
    value as Record<
      string,
      unknown
    >;

  return {
    subject:
      typeof draft.subject ===
      "string"
        ? draft.subject
        : "",

    message:
      typeof draft.message ===
      "string"
        ? draft.message
        : "",
  };
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
      flexDirection: "row",
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
    },

    scrollContent: {
      width: "100%",
      maxWidth:
        Layout.contentMaxWidth,
      alignSelf: "center",
      paddingHorizontal:
        Layout.screenPadding,
      paddingTop:
        Spacing.md,
      paddingBottom:
        Spacing.xxl,
    },

    description: {
      ...Typography.bodyStyle,
      color:
        KhedmatPalette.textSecondary,
      lineHeight: 22,
      marginBottom:
        Spacing.xl,
    },

    formGroup: {
      marginBottom:
        Spacing.lg,
    },

    label: {
      ...Typography.label,
      color:
        KhedmatPalette.textPrimary,
      marginBottom:
        Spacing.xs,
    },

    input: {
      minHeight: 54,
      paddingHorizontal:
        Spacing.md,
      borderRadius:
        Radius.md,
      borderWidth:
        StyleSheet.hairlineWidth,
      borderColor:
        KhedmatPalette.blue200,
      backgroundColor:
        KhedmatPalette.white,
      ...Typography.bodyStyle,
      color:
        KhedmatPalette.textPrimary,
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

    textArea: {
      minHeight: 150,
      paddingTop:
        Spacing.md,
      paddingBottom:
        Spacing.md,
    },


    sectionTitle: {
  ...Typography.label,
  color:
    KhedmatPalette.textPrimary,
  fontSize: 16,
  lineHeight: 21,
  marginTop:
    Spacing.xl,
  marginBottom:
    Spacing.sm,
},

    contactGrid: {
      width: "100%",
      flexDirection: "row",
      flexWrap: "wrap",
      gap: Spacing.sm,
    },

    contactCard: {
      width: "48%",
      minHeight: 104,
      flexGrow: 1,
      alignItems: "center",
      justifyContent: "center",
      padding:
        Spacing.md,
      borderRadius:
        Radius.lg,
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

    contactIcon: {
      width: 38,
      height: 38,
      borderRadius:
        Radius.md,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor:
        KhedmatPalette.blue050,
      marginBottom:
        Spacing.sm,
    },

    contactLabel: {
      ...Typography.label,
      width: "100%",
      color:
        KhedmatPalette.textPrimary,
      fontSize: 15,
      lineHeight: 20,
      textAlign: "center",
    },


    contactCardPressed: {
      backgroundColor:
        KhedmatPalette.blue050,
    },

    contactCardDisabled: {
      opacity: 0.62,
    },

    pressed: {
      opacity: 0.72,
    },
  });
