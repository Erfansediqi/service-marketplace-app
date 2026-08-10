import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
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
import { useLanguage } from "../../context/languagecontext";

export default function PaymentsScreen() {
  const router = useRouter();

  const {
    t,
    isRTL,
    rowDirection,
    textDirection,
  } = useLanguage();

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
          {t("paymentsScreenTitle")}
        </Text>

        <View
          style={
            styles.headerSpacer
          }
        />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
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
          {t(
            "paymentMethodsSectionTitle",
          )}
        </Text>

        <View
          style={[
            styles.methodCard,
            {
              flexDirection:
                rowDirection,
            },
          ]}
        >
          <View
            style={
              styles.methodIcon
            }
          >
            <Ionicons
              name="cash-outline"
              size={23}
              color={
                KhedmatPalette.navy900
              }
            />
          </View>

          <View
            style={
              styles.methodCopy
            }
          >
            <Text
              style={[
                styles.methodTitle,
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
                "cashPaymentTitle",
              )}
            </Text>

            <Text
              style={[
                styles.methodSubtitle,
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
                "cashPaymentSubtitle",
              )}
            </Text>
          </View>

          <View
            style={
              styles.statusIcon
            }
          >
            <Ionicons
              name="checkmark"
              size={16}
              color={
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
          {t(
            "onlinePaymentsSectionTitle",
          )}
        </Text>

        <View
          style={[
            styles.onlineCard,
            {
              flexDirection:
                rowDirection,
            },
          ]}
        >
          <View
            style={
              styles.onlineIcon
            }
          >
            <Ionicons
              name="card-outline"
              size={23}
              color={
                KhedmatPalette.blue500
              }
            />
          </View>

          <View
            style={
              styles.onlineCopy
            }
          >
            <Text
              style={[
                styles.onlineTitle,
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
                "onlinePaymentsTitle",
              )}
            </Text>

            <Text
              style={[
                styles.onlineSubtitle,
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
                "onlinePaymentsSubtitle",
              )}
            </Text>
          </View>

          <View
            style={
              styles.comingSoonBadge
            }
          >
            <Text
              style={[
                styles.comingSoonText,
                {
                  writingDirection:
                    textDirection,
                },
              ]}
            >
              {t(
                "comingSoonLabel",
              )}
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.infoNote,
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
              styles.infoNoteText,
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
              "paymentsInfoNote",
            )}
          </Text>
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
      alignItems: "center",
      justifyContent: "center",
      borderRadius:
        Radius.pill,
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

    sectionTitle: {
      ...Typography.sectionTitle,
      color:
        KhedmatPalette.textPrimary,
      fontSize: 17,
      lineHeight: 23,
      marginTop:
        Spacing.lg,
      marginBottom:
        Spacing.sm,
    },

    methodCard: {
      width: "100%",
      minHeight: 86,
      alignItems: "center",
      gap: Spacing.md,
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
      shadowOpacity: 0.05,
      shadowRadius: 7,
      elevation: 1,
    },

    methodIcon: {
      width: 44,
      height: 44,
      flexShrink: 0,
      borderRadius:
        Radius.md,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor:
        KhedmatPalette.blue050,
    },

    methodCopy: {
      flex: 1,
      minWidth: 0,
    },

    methodTitle: {
      ...Typography.label,
      color:
        KhedmatPalette.textPrimary,
      fontSize: 15,
      lineHeight: 20,
    },

    methodSubtitle: {
      ...Typography.captionStyle,
      marginTop: 3,
      color:
        KhedmatPalette.textSecondary,
      lineHeight: 18,
    },

    statusIcon: {
      width: 24,
      height: 24,
      flexShrink: 0,
      borderRadius:
        Radius.pill,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor:
        KhedmatPalette.navy900,
    },

    onlineCard: {
      width: "100%",
      minHeight: 110,
      alignItems:
        "flex-start",
      gap: Spacing.md,
      padding:
        Spacing.md,
      borderRadius:
        Radius.lg,
      borderWidth:
        StyleSheet.hairlineWidth,
      borderColor:
        KhedmatPalette.blue200,
      backgroundColor:
        KhedmatPalette.blue050,
    },

    onlineIcon: {
      width: 44,
      height: 44,
      flexShrink: 0,
      borderRadius:
        Radius.md,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor:
        KhedmatPalette.white,
      borderWidth:
        StyleSheet.hairlineWidth,
      borderColor:
        KhedmatPalette.blue200,
    },

    onlineCopy: {
      flex: 1,
      minWidth: 0,
    },

    onlineTitle: {
      ...Typography.label,
      color:
        KhedmatPalette.textPrimary,
      fontSize: 15,
      lineHeight: 20,
    },

    onlineSubtitle: {
      ...Typography.captionStyle,
      marginTop: 4,
      color:
        KhedmatPalette.textSecondary,
      lineHeight: 18,
    },

    comingSoonBadge: {
      flexShrink: 0,
      paddingHorizontal:
        Spacing.sm,
      paddingVertical:
        Spacing.xs,
      borderRadius:
        Radius.pill,
      backgroundColor:
        KhedmatPalette.white,
      borderWidth:
        StyleSheet.hairlineWidth,
      borderColor:
        KhedmatPalette.blue200,
    },

    comingSoonText: {
      ...Typography.captionStyle,
      color:
        KhedmatPalette.blue500,
      fontSize: 11,
      lineHeight: 15,
    },

    infoNote: {
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
      borderWidth:
        StyleSheet.hairlineWidth,
      borderColor:
        KhedmatPalette.blue200,
      backgroundColor:
        KhedmatPalette.white,
    },

    infoNoteText: {
      ...Typography.captionStyle,
      flex: 1,
      color:
        KhedmatPalette.textSecondary,
      lineHeight: 19,
    },

    pressed: {
      opacity: 0.72,
    },
  });
