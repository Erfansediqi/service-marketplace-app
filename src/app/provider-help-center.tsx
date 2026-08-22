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

import { KhedmatButton } from "../components/khedmat/khedmat-button";
import {
  KhedmatPalette,
  Layout,
  Radius,
  Spacing,
  Typography,
} from "../constants/theme";
import { useLanguage } from "../context/languagecontext";

type ProviderHelpFaq = {
  id: string;
  question: string;
  answer: string;
  keywords: string[];
};

export default function ProviderHelpCenterScreen() {
  const router = useRouter();

  const {
    t,
    isRTL,
    rowDirection,
    textDirection,
  } = useLanguage();

  const [
    searchQuery,
    setSearchQuery,
  ] = useState("");

  const [
    expandedFaqId,
    setExpandedFaqId,
  ] = useState<string | null>(
    null,
  );

  const faqs =
    useMemo<ProviderHelpFaq[]>(
      () => [
        {
          id: "requests",
          question: t(
            "providerHelpRequestsQuestion",
          ),
          answer: t(
            "providerHelpRequestsAnswer",
          ),
          keywords: [
            "request",
            "booking",
            "confirm",
            "start",
            "complete",
          ],
        },
        {
          id: "availability",
          question: t(
            "providerHelpAvailabilityQuestion",
          ),
          answer: t(
            "providerHelpAvailabilityAnswer",
          ),
          keywords: [
            "schedule",
            "availability",
            "hours",
            "days",
            "urgent",
          ],
        },
        {
          id: "service-area",
          question: t(
            "providerHelpServiceAreaQuestion",
          ),
          answer: t(
            "providerHelpServiceAreaAnswer",
          ),
          keywords: [
            "location",
            "province",
            "district",
            "radius",
            "travel",
          ],
        },
        {
          id: "earnings",
          question: t(
            "providerHelpEarningsQuestion",
          ),
          answer: t(
            "providerHelpEarningsAnswer",
          ),
          keywords: [
            "earnings",
            "payment",
            "paid",
            "unpaid",
            "refund",
          ],
        },
        {
          id: "verification",
          question: t(
            "providerHelpVerificationQuestion",
          ),
          answer: t(
            "providerHelpVerificationAnswer",
          ),
          keywords: [
            "verification",
            "identity",
            "document",
            "rejected",
            "pending",
          ],
        },
        {
          id: "profile",
          question: t(
            "providerHelpProfileQuestion",
          ),
          answer: t(
            "providerHelpProfileAnswer",
          ),
          keywords: [
            "profile",
            "services",
            "prices",
            "portfolio",
            "customer",
          ],
        },
      ],
      [t],
    );

  const filteredFaqs =
    useMemo(() => {
      const normalized =
        searchQuery
          .trim()
          .toLowerCase();

      if (!normalized) {
        return faqs;
      }

      return faqs.filter(
        (faq) =>
          [
            faq.question,
            faq.answer,
            ...faq.keywords,
          ]
            .join(" ")
            .toLowerCase()
            .includes(
              normalized,
            ),
      );
    }, [
      faqs,
      searchQuery,
    ]);

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
          accessibilityLabel={t(
            "back",
          )}
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

        <View
          style={
            styles.headerCopy
          }
        >
          <Text
            style={[
              styles.title,
              {
                textAlign: isRTL
                  ? "right"
                  : "left",
                writingDirection:
                  textDirection,
              },
            ]}
          >
            {t(
              "providerHelpCenterTitle",
            )}
          </Text>

        </View>
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
            value={searchQuery}
            onChangeText={
              setSearchQuery
            }
            style={[
              styles.searchInput,
              {
                textAlign: isRTL
                  ? "right"
                  : "left",
                writingDirection:
                  textDirection,
              },
            ]}
            placeholder={t(
              "providerHelpSearchPlaceholder",
            )}
            placeholderTextColor={
              KhedmatPalette.textMuted
            }
            returnKeyType="search"
          />

          {searchQuery ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t(
                "clearSearch",
              )}
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
              textAlign: isRTL
                ? "right"
                : "left",
              writingDirection:
                textDirection,
            },
          ]}
        >
          {t(
            "providerHelpFaqTitle",
          )}
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
                          styles.pressed,
                      ]}
                    >
                      <View
                        style={
                          styles.faqCopy
                        }
                      >
                        <Text
                          style={[
                            styles.faqQuestion,
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

                        {expanded ? (
                          <Text
                            style={[
                              styles.faqAnswer,
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
                        ) : null}
                      </View>

                      <Ionicons
                        name={
                          expanded
                            ? "chevron-up"
                            : "chevron-down"
                        }
                        size={19}
                        color={
                          KhedmatPalette.textMuted
                        }
                      />
                    </Pressable>
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
            <View
              style={
                styles.emptyIcon
              }
            >
              <Ionicons
                name="search-outline"
                size={28}
                color={
                  KhedmatPalette.blue500
                }
              />
            </View>

            <Text
              style={[
                styles.emptyTitle,
                {
                  writingDirection:
                    textDirection,
                },
              ]}
            >
              {t(
                "providerHelpNoResultsTitle",
              )}
            </Text>

            <Text
              style={[
                styles.emptyBody,
                {
                  writingDirection:
                    textDirection,
                },
              ]}
            >
              {t(
                "providerHelpNoResultsMessage",
              )}
            </Text>
          </View>
        )}

        <View
          style={
            styles.contactCard
          }
        >
          <View
            style={
              styles.contactIcon
            }
          >
            <Ionicons
              name="headset-outline"
              size={25}
              color={
                KhedmatPalette.blue500
              }
            />
          </View>

          <Text
            style={[
              styles.contactTitle,
              {
                writingDirection:
                  textDirection,
              },
            ]}
          >
            {t(
              "providerHelpContactTitle",
            )}
          </Text>

          <Text
            style={[
              styles.contactMessage,
              {
                writingDirection:
                  textDirection,
              },
            ]}
          >
            {t(
              "providerHelpContactMessage",
            )}
          </Text>

          <KhedmatButton
            label={t(
              "providerHelpContactAction",
            )}
            icon="chatbubble-ellipses-outline"
            onPress={() =>
              router.push(
                "/account/contact-support",
              )
            }
            style={
              styles.contactButton
            }
          />
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
      alignItems:
        "flex-start",
      gap: Spacing.md,
      paddingHorizontal:
        Layout.screenPadding,
      paddingTop:
        Spacing.lg,
      paddingBottom:
        Spacing.md,
    },

    backButton: {
      width: 40,
      height: 40,
      flexShrink: 0,
      alignItems:
        "center",
      justifyContent:
        "center",
      borderRadius:
        Radius.pill,
      backgroundColor:
        KhedmatPalette.white,
    },

    headerCopy: {
      flex: 1,
      minWidth: 0,
    },

    title: {
      ...Typography.screenTitle,
      color:
        KhedmatPalette.navy900,
      fontSize: 22,
      lineHeight: 28,
    },

    scrollContent: {
      width: "100%",
      maxWidth:
        Layout.contentMaxWidth,
      alignSelf: "center",
      paddingHorizontal:
        Layout.screenPadding,
      paddingBottom: 120,
    },

    searchContainer: {
      width: "100%",
      minHeight: 48,
      alignItems: "center",
      gap: Spacing.sm,
      paddingHorizontal:
        Spacing.md,
      borderRadius:
        Radius.lg,
      borderWidth: 1,
      borderColor:
        KhedmatPalette.border,
      backgroundColor:
        KhedmatPalette.white,
    },

    searchInput: {
      flex: 1,
      minHeight: 46,
      ...Typography.bodyStyle,
      color:
        KhedmatPalette.textPrimary,
      fontSize: 15,
    },

    sectionTitle: {
      ...Typography.sectionTitle,
      width: "100%",
      marginTop:
        Spacing.xl,
      marginBottom:
        Spacing.sm,
      color:
        KhedmatPalette.navy900,
      fontSize: 18,
      lineHeight: 24,
    },

    faqCard: {
      width: "100%",
      overflow: "hidden",
      borderRadius:
        Radius.lg,
      borderWidth:
        StyleSheet.hairlineWidth,
      borderColor:
        KhedmatPalette.border,
      backgroundColor:
        KhedmatPalette.white,
    },

    divider: {
      height:
        StyleSheet.hairlineWidth,
      backgroundColor:
        KhedmatPalette.border,
    },

    faqRow: {
      width: "100%",
      alignItems:
        "flex-start",
      gap: Spacing.sm,
      padding:
        Spacing.md,
    },

    faqCopy: {
      flex: 1,
      minWidth: 0,
    },

    faqQuestion: {
      ...Typography.label,
      color:
        KhedmatPalette.textPrimary,
      fontSize: 15,
      lineHeight: 20,
    },

    faqAnswer: {
      ...Typography.bodyStyle,
      marginTop:
        Spacing.sm,
      color:
        KhedmatPalette.textSecondary,
      lineHeight: 21,
    },

    emptyState: {
      minHeight: 220,
      alignItems:
        "center",
      justifyContent:
        "center",
      padding:
        Spacing.xl,
      borderRadius:
        Radius.lg,
      borderWidth:
        StyleSheet.hairlineWidth,
      borderColor:
        KhedmatPalette.border,
      backgroundColor:
        KhedmatPalette.white,
    },

    emptyIcon: {
      width: 56,
      height: 56,
      alignItems:
        "center",
      justifyContent:
        "center",
      borderRadius:
        Radius.pill,
      backgroundColor:
        KhedmatPalette.surfaceSoft,
      marginBottom:
        Spacing.md,
    },

    emptyTitle: {
      ...Typography.sectionTitle,
      color:
        KhedmatPalette.textPrimary,
      textAlign: "center",
    },

    emptyBody: {
      ...Typography.bodyStyle,
      marginTop:
        Spacing.xs,
      color:
        KhedmatPalette.textSecondary,
      textAlign: "center",
      lineHeight: 21,
    },

    contactCard: {
      width: "100%",
      alignItems: "center",
      marginTop:
        Spacing.xl,
      padding:
        Spacing.lg,
      borderRadius:
        Radius.xl,
      borderWidth: 1,
      borderColor:
        KhedmatPalette.border,
      backgroundColor:
        KhedmatPalette.white,
    },

    contactIcon: {
      width: 44,
      height: 44,
      alignItems:
        "center",
      justifyContent:
        "center",
      borderRadius:
        Radius.pill,
      backgroundColor:
        KhedmatPalette.white,
      marginBottom:
        Spacing.md,
    },

    contactTitle: {
      ...Typography.sectionTitle,
      color:
        KhedmatPalette.textPrimary,
      textAlign: "center",
      fontSize: 18,
      lineHeight: 24,
    },

    contactMessage: {
      ...Typography.bodyStyle,
      maxWidth: 340,
      marginTop:
        Spacing.xs,
      color:
        KhedmatPalette.textSecondary,
      textAlign: "center",
      lineHeight: 21,
    },

    contactButton: {
      marginTop:
        Spacing.lg,
    },

    pressed: {
      opacity: 0.72,
    },
  });
