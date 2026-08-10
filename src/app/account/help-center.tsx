import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  useMemo,
  useState,
} from "react";
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { useLanguage } from "../../context/languagecontext";

import {
  KhedmatPalette,
  Layout,
  Radius,
  Spacing,
  Typography,
} from "../../constants/theme";

type HelpFaq = {
  id: string;
  question: string;
  answer: string;
  keywords: string[];
};

export default function HelpCenterScreen() {
  const router = useRouter();

  const {
    t,
    isRTL,
    rowDirection,
    textDirection,
  } = useLanguage();

  const faqs =
    useMemo<HelpFaq[]>(
      () => [
        {
          id: "book-service",
          question:
            t("faqBookServiceQuestion"),
          answer:
            t("faqBookServiceAnswer"),
          keywords: [
            "book",
            "booking",
            "service",
            "provider",
            "schedule",
          ],
        },
        {
          id: "saved-address",
          question:
            t("faqSavedAddressesQuestion"),
          answer:
            t("faqSavedAddressesAnswer"),
          keywords: [
            "address",
            "home",
            "work",
            "booking",
          ],
        },
        {
          id: "cancel-booking",
          question:
            t("faqCancelBookingQuestion"),
          answer:
            t("faqCancelBookingAnswer"),
          keywords: [
            "cancel",
            "booking",
            "request",
          ],
        },
        {
          id: "cancellation-fee",
          question:
            t("faqCancellationFeeQuestion"),
          answer:
            t("faqCancellationFeeAnswer"),
          keywords: [
            "fee",
            "cancel",
            "payment",
          ],
        },
        {
          id: "change-account-info",
          question:
            t("faqAccountInfoQuestion"),
          answer:
            t("faqAccountInfoAnswer"),
          keywords: [
            "profile",
            "name",
            "email",
            "photo",
            "phone",
          ],
        },
        {
          id: "password",
          question:
            t("faqPasswordQuestion"),
          answer:
            t("faqPasswordAnswer"),
          keywords: [
            "password",
            "security",
            "login",
          ],
        },
        {
          id: "biometrics",
          question:
            t("faqBiometricQuestion"),
          answer:
            t("faqBiometricAnswer"),
          keywords: [
            "biometric",
            "face id",
            "touch id",
            "fingerprint",
            "security",
          ],
        },
        {
          id: "support",
          question:
            t("faqSupportQuestion"),
          answer:
            t("faqSupportAnswer"),
          keywords: [
            "support",
            "whatsapp",
            "email",
            "help",
          ],
        },
      ],
      [t],
    );

  const [
    searchQuery,
    setSearchQuery,
  ] = useState("");

  const [
    expandedFaqId,
    setExpandedFaqId,
  ] = useState<
    string | null
  >(null);

  const filteredFaqs =
    useMemo(() => {
      const normalizedQuery =
        searchQuery
          .trim()
          .toLowerCase();

      if (!normalizedQuery) {
        return faqs;
      }

      return faqs.filter(
        (faq) => {
          const searchable = [
            faq.question,
            faq.answer,
            ...faq.keywords,
          ]
            .join(" ")
            .toLowerCase();

          return searchable.includes(
            normalizedQuery,
          );
        },
      );
    }, [faqs, searchQuery]);

  const toggleFaq =
    (
      faqId: string,
    ): void => {
      setExpandedFaqId(
        (current) =>
          current === faqId
            ? null
            : faqId,
      );
    };

  return (
    <SafeAreaView
      style={styles.safeArea}
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
          {t("helpCenterTitle")}
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
          style={[
            styles.searchContainer,
            {
              flexDirection:
                rowDirection,
            },
          ]}
        >
          <Ionicons
            name="search-outline"
            size={21}
            color={
              KhedmatPalette.textMuted
            }
          />

          <TextInput
            value={
              searchQuery
            }
            onChangeText={
              setSearchQuery
            }
            style={[
              styles.searchInput,
              {
                textAlign:
                  isRTL
                    ? "right"
                    : "left",
                writingDirection:
                  textDirection,
              },
            ]}
            placeholder={t("helpSearchPlaceholder")}
            placeholderTextColor={
              KhedmatPalette.textMuted
            }
            returnKeyType="search"
          />

          {searchQuery ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t("clearSearch")}
              hitSlop={8}
              onPress={() =>
                setSearchQuery(
                  "",
                )
              }
            >
              <Ionicons
                name="close-circle"
                size={19}
                color={
                  KhedmatPalette.textMuted
                }
              />
            </Pressable>
          ) : null}
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
          {t("frequentlyAskedQuestions")}
        </Text>

        {filteredFaqs.length >
        0 ? (
          <View
            style={
              styles.faqCard
            }
          >
            {filteredFaqs.map(
              (
                faq,
                index,
              ) => {
                const expanded =
                  expandedFaqId ===
                  faq.id;

                return (
                  <View
                    key={
                      faq.id
                    }
                  >
                    {index > 0 ? (
                      <View
                        style={
                          styles.divider
                        }
                      />
                    ) : null}

                    <Pressable
                      accessibilityRole="button"
                      accessibilityState={{
                        expanded,
                      }}
                      onPress={() =>
                        toggleFaq(
                          faq.id,
                        )
                      }
                      style={({
                        pressed,
                      }) => [
                        styles.faqRow,
                        {
                          flexDirection:
                            rowDirection,
                        },
                        pressed &&
                          styles.faqRowPressed,
                      ]}
                    >
                      <Text
                        style={[
                          styles.faqTitle,
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
                        {
                          faq.question
                        }
                      </Text>

                      <Ionicons
                        name={
                          expanded
                            ? "chevron-up"
                            : "chevron-down"
                        }
                        size={20}
                        color={
                          KhedmatPalette.textMuted
                        }
                      />
                    </Pressable>

                    {expanded ? (
                      <View
                        style={
                          styles.answerWrap
                        }
                      >
                        <Text
                          style={[
                            styles.answerText,
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
                          {
                            faq.answer
                          }
                        </Text>
                      </View>
                    ) : null}
                  </View>
                );
              },
            )}
          </View>
        ) : (
          <View
            style={
              styles.emptyState
            }
          >
            <Ionicons
              name="search-outline"
              size={26}
              color={
                KhedmatPalette.blue500
              }
            />

            <Text
              style={[
                styles.emptyTitle,
                {
                  writingDirection:
                    textDirection,
                },
              ]}
            >
              {t("noMatchingHelpTopics")}
            </Text>

            <Text
              style={[
                styles.emptySubtitle,
                {
                  writingDirection:
                    textDirection,
                },
              ]}
            >
              {t("noMatchingHelpTopicsSubtitle")}
            </Text>
          </View>
        )}

        <View
          style={
            styles.contactCard
          }
        >
          <Text
            style={[
              styles.contactTitle,
              {
                writingDirection:
                  textDirection,
              },
            ]}
          >
            {t("stillNeedHelp")}
          </Text>

          <Text
            style={[
              styles.contactSubtitle,
              {
                writingDirection:
                  textDirection,
              },
            ]}
          >
            {t("contactThroughWhatsappEmail")}
          </Text>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t("contactSupport")}
            onPress={() =>
              router.push(
                "/contact-support" as any,
              )
            }
            style={({
              pressed,
            }) => [
              styles.contactButton,
              {
                flexDirection:
                  rowDirection,
              },
              pressed &&
                styles.contactButtonPressed,
            ]}
          >
            <Text
              style={
                styles.contactButtonText
              }
            >
              {t("contactSupport")}
            </Text>

            <Ionicons
              name={
                isRTL
                  ? "chevron-back"
                  : "chevron-forward"
              }
              size={17}
              color={
                KhedmatPalette.white
              }
            />
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
      fontSize: 22,
      lineHeight: 28,
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

    searchContainer: {
      width: "100%",
      height: 54,
      alignItems: "center",
      gap: Spacing.sm,
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

    searchInput: {
      ...Typography.bodyStyle,
      flex: 1,
      color:
        KhedmatPalette.textPrimary,
    },

    sectionTitle: {
      ...Typography.sectionTitle,
      color:
        KhedmatPalette.textPrimary,
      fontSize: 18,
      lineHeight: 24,
      marginTop:
        Spacing.xl,
      marginBottom:
        Spacing.sm,
    },

    faqCard: {
      width: "100%",
      borderRadius:
        Radius.lg,
      overflow: "hidden",
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
        height: 3,
      },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
    },

    faqRow: {
      width: "100%",
      minHeight: 62,
      alignItems: "center",
      justifyContent:
        "space-between",
      gap: Spacing.md,
      paddingHorizontal:
        Spacing.md,
      paddingVertical:
        Spacing.sm,
    },

    faqRowPressed: {
      backgroundColor:
        KhedmatPalette.blue050,
    },

    faqTitle: {
      ...Typography.label,
      flex: 1,
      minWidth: 0,
      color:
        KhedmatPalette.textPrimary,
      fontSize: 14,
      lineHeight: 19,
    },

    answerWrap: {
      paddingHorizontal:
        Spacing.md,
      paddingBottom:
        Spacing.md,
    },

    answerText: {
      ...Typography.bodyStyle,
      color:
        KhedmatPalette.textSecondary,
      lineHeight: 21,
    },

    divider: {
      height:
        StyleSheet.hairlineWidth,
      marginHorizontal:
        Spacing.md,
      backgroundColor:
        KhedmatPalette.blue200,
    },

    emptyState: {
      width: "100%",
      minHeight: 160,
      alignItems: "center",
      justifyContent: "center",
      padding:
        Spacing.xl,
      borderRadius:
        Radius.lg,
      borderWidth:
        StyleSheet.hairlineWidth,
      borderColor:
        KhedmatPalette.blue200,
      backgroundColor:
        KhedmatPalette.blue050,
    },

    emptyTitle: {
      ...Typography.label,
      color:
        KhedmatPalette.textPrimary,
      marginTop:
        Spacing.sm,
    },

    emptySubtitle: {
      ...Typography.captionStyle,
      marginTop: 3,
      color:
        KhedmatPalette.textSecondary,
      textAlign: "center",
      lineHeight: 18,
    },

    contactCard: {
      width: "100%",
      marginTop:
        Spacing.xl,
      alignItems: "center",
      paddingHorizontal:
        Spacing.lg,
      paddingVertical:
        Spacing.lg,
      borderRadius:
        Radius.lg,
      borderWidth:
        StyleSheet.hairlineWidth,
      borderColor:
        KhedmatPalette.blue200,
      backgroundColor:
        KhedmatPalette.blue050,
    },

    contactTitle: {
      ...Typography.sectionTitle,
      width: "100%",
      color:
        KhedmatPalette.textPrimary,
      fontSize: 17,
      lineHeight: 22,
      textAlign: "center",
    },

    contactSubtitle: {
      ...Typography.captionStyle,
      width: "100%",
      maxWidth: 300,
      color:
        KhedmatPalette.textSecondary,
      marginTop: 4,
      lineHeight: 18,
      textAlign: "center",
    },

    contactButton: {
      width: "100%",
      minHeight: 48,
      marginTop:
        Spacing.lg,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: Spacing.xs,
      borderRadius:
        Radius.md,
      backgroundColor:
        KhedmatPalette.navy900,
    },

    contactButtonPressed: {
      opacity: 0.84,
    },

    contactButtonText: {
      ...Typography.label,
      color:
        KhedmatPalette.white,
      fontSize: 14,
      lineHeight: 19,
    },

    pressed: {
      opacity: 0.72,
    },
  });
