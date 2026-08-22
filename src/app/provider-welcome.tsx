import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ComponentProps } from "react";
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  Fonts,
  KhedmatPalette,
  Layout,
  Radius,
  Shadows,
  Spacing,
  Typography,
} from "../constants/theme";
import { useLanguage } from "../context/languagecontext";

type IconName =
  ComponentProps<typeof Ionicons>["name"];

type LanguageName =
  | "English"
  | "Dari"
  | "Pashto";

type LocalizedText = {
  English: string;
  Dari: string;
  Pashto: string;
};

type BenefitDefinition = {
  id: string;
  icon: IconName;
  title: LocalizedText;
  subtitle: LocalizedText;
};

const BENEFITS: BenefitDefinition[] = [
  {
    id: "nearby-customers",
    icon: "people-outline",

    title: {
      English:
        "Reach nearby customers",
      Dari:
        "دسترسی به مشتریان نزدیک",
      Pashto:
        "نږدې پیرودونکو ته لاسرسی",
    },

      subtitle: {
      English:
        "Manage requests, schedules and service progress from one place.",
      Dari:
        "درخواست‌ها، زمان‌بندی و وضعیت خدمات خود را از یک محل مدیریت کنید.",
      Pashto:
        "غوښتنې، مهال‌وېش او د خدمتونو حالت له یوه ځایه مدیریت کړئ.",
    },
  },
  {
    id: "professional-trust",
    icon: "star-outline",

    title: {
      English:
        "Build professional trust",
      Dari:
        "ساخت اعتبار حرفه‌ای",
      Pashto:
        "مسلکي اعتبار جوړ کړئ",
    },

    subtitle: {
      English:
        "Complete services successfully and earn positive customer reviews.",
      Dari:
        "با تکمیل خدمات و دریافت نظرهای مثبت، اعتماد مشتریان را افزایش دهید.",
      Pashto:
        "خدمتونه په بریالیتوب بشپړ کړئ او د پیرودونکو مثبتې ارزونې ترلاسه کړئ.",
    },
  },
];

export default function ProviderWelcomeScreen() {
  const router = useRouter();

  const { language } =
    useLanguage();

  const activeLanguage =
    normalizeLanguage(language);

  const isRtl =
    activeLanguage === "Dari" ||
    activeLanguage === "Pashto";

  const copy =
    getProviderWelcomeCopy(
      activeLanguage,
    );

  const handleContinue = () => {
    router.push(
      "/provider-category",
    );
  };

  return (
    <SafeAreaView
      style={styles.safeArea}
    >
      <View style={styles.root}>
        <ScrollView
          showsVerticalScrollIndicator={
            false
          }
          contentContainerStyle={
            styles.scrollContent
          }
        >
          <View
            style={[
              styles.topBar,
              {
                flexDirection: isRtl
                  ? "row-reverse"
                  : "row",
              },
            ]}
          >
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={
                copy.back
              }
              hitSlop={8}
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
                  isRtl
                    ? "chevron-forward"
                    : "chevron-back"
                }
                size={24}
                color={
                  KhedmatPalette
                    .navy900
                }
              />
            </Pressable>

            <View
              style={
                styles.stepIndicator
              }
            >
              <Text
                style={[
                  styles.stepText,
                  directionStyle(
                    isRtl,
                  ),
                ]}
              >
                {copy.introduction}
              </Text>
            </View>
          </View>

          <View
            style={styles.hero}
          >
            <View
              style={
                styles.heroIllustration
              }
            >
              <View
                style={
                  styles.heroIconOuter
                }
              >
                <View
                  style={
                    styles.heroIconInner
                  }
                >
                  <Ionicons
                    name="briefcase-outline"
                    size={38}
                    color={
                      KhedmatPalette
                        .white
                    }
                  />
                </View>
              </View>

              <View
                style={
                  styles.heroDecorationTop
                }
              >
                <Ionicons
                  name="star"
                  size={15}
                  color={
                    KhedmatPalette
                      .blue500
                  }
                />
              </View>

              <View
                style={
                  styles.heroDecorationBottom
                }
              >
                <Ionicons
                  name="checkmark"
                  size={16}
                  color={
                    KhedmatPalette
                      .white
                  }
                />
              </View>
            </View>

            <View
              style={[
                styles.heroCopy,
                {
                  alignItems: isRtl
                    ? "flex-end"
                    : "flex-start",
                },
              ]}
            >


              <Text
                style={[
                  styles.title,
                  directionStyle(
                    isRtl,
                  ),
                ]}
              >
                {copy.title}
              </Text>


            </View>
          </View>

          <View
            style={styles.infoCard}
          >
            <View
              style={[
                styles.infoCardContent,
                {
                  flexDirection: isRtl
                    ? "row-reverse"
                    : "row",
                },
              ]}
            >
              <View
                style={
                  styles.infoIcon
                }
              >
                <Ionicons
                  name="information-circle-outline"
                  size={22}
                  color={
                    KhedmatPalette
                      .blue500
                  }
                />
              </View>

              <View
                style={[
                  styles.infoCopy,
                  {
                    alignItems: isRtl
                      ? "flex-end"
                      : "flex-start",
                  },
                ]}
              >
                <Text
                  style={[
                    styles.infoTitle,
                    directionStyle(
                      isRtl,
                    ),
                  ]}
                >
                  {
                    copy.registrationTitle
                  }
                </Text>

              </View>
            </View>
          </View>

          <View
            style={styles.section}
          >
            <View
              style={[
                styles.sectionHeader,
                {
                  alignItems: isRtl
                    ? "flex-end"
                    : "flex-start",
                },
              ]}
            >
              <Text
                style={[
                  styles.sectionTitle,
                  directionStyle(
                    isRtl,
                  ),
                ]}
              >
                {copy.benefitsTitle}
              </Text>


            </View>

            <View
              style={styles.benefits}
            >
              {BENEFITS.map(
                (
                  benefit,
                  index,
                ) => (
                  <BenefitCard
                    key={benefit.id}
                    number={index + 1}
                    icon={benefit.icon}
                    title={
                      benefit.title[
                        activeLanguage
                      ]
                    }
                    subtitle={
                      benefit.subtitle[
                        activeLanguage
                      ]
                    }
                    isRtl={isRtl}
                    localizedDigits={
                      activeLanguage !==
                      "English"
                    }
                  />
                ),
              )}
            </View>
          </View>
        </ScrollView>

        <View
          style={styles.footer}
        >
          <View
            style={
              styles.footerContent
            }
          >
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={
                copy.continue
              }
              onPress={
                handleContinue
              }
              style={({ pressed }) => [
                styles.primaryButton,
                pressed &&
                  styles.primaryButtonPressed,
              ]}
            >
              <View
                style={[
                  styles.primaryButtonContent,
                  {
                    flexDirection: isRtl
                      ? "row-reverse"
                      : "row",
                  },
                ]}
              >
                <Text
                  style={[
                    styles.primaryButtonText,
                    directionStyle(
                      isRtl,
                    ),
                  ]}
                >
                  {copy.continue}
                </Text>

                <Ionicons
                  name={
                    isRtl
                      ? "arrow-back"
                      : "arrow-forward"
                  }
                  size={20}
                  color={
                    KhedmatPalette
                      .white
                  }
                />
              </View>
            </Pressable>

            <View
              style={[
                styles.helperRow,
                {
                  flexDirection: isRtl
                    ? "row-reverse"
                    : "row",
                },
              ]}
            >
              <Ionicons
                name="time-outline"
                size={15}
                color={
                  KhedmatPalette
                    .textMuted
                }
              />

              <Text
                style={[
                  styles.helperText,
                  directionStyle(
                    isRtl,
                  ),
                ]}
              >
                {copy.helperText}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

type BenefitCardProps = {
  number: number;
  icon: IconName;
  title: string;
  subtitle: string;
  isRtl: boolean;
  localizedDigits: boolean;
};

function BenefitCard({
  number,
  icon,
  title,
  subtitle,
  isRtl,
  localizedDigits,
}: BenefitCardProps) {
  return (
    <View
      style={[
        styles.benefitCard,
        {
          flexDirection: isRtl
            ? "row-reverse"
            : "row",
        },
      ]}
    >
      <View
        style={
          styles.benefitIcon
        }
      >
        <Ionicons
          name={icon}
          size={24}
          color={
            KhedmatPalette.blue500
          }
        />

        <View
          style={
            styles.benefitNumber
          }
        >
          <Text
            style={
              styles.benefitNumberText
            }
          >
            {formatDigits(
              number.toString(),
              localizedDigits,
            )}
          </Text>
        </View>
      </View>

      <View
        style={[
          styles.benefitCopy,
          {
            alignItems: isRtl
              ? "flex-end"
              : "flex-start",
          },
        ]}
      >
        <Text
          style={[
            styles.benefitTitle,
            directionStyle(isRtl),
          ]}
        >
          {title}
        </Text>

        <Text
          style={[
            styles.benefitSubtitle,
            directionStyle(isRtl),
          ]}
        >
          {subtitle}
        </Text>
      </View>
    </View>
  );
}

function normalizeLanguage(
  language: string,
): LanguageName {
  if (language === "Dari") {
    return "Dari";
  }

  if (language === "Pashto") {
    return "Pashto";
  }

  return "English";
}

function directionStyle(
  isRtl: boolean,
) {
  return {
    textAlign: isRtl
      ? ("right" as const)
      : ("left" as const),

    writingDirection: isRtl
      ? ("rtl" as const)
      : ("ltr" as const),
  };
}

function formatDigits(
  value: string,
  localized: boolean,
): string {
  if (!localized) {
    return value;
  }

  const digits: Record<
    string,
    string
  > = {
    "0": "۰",
    "1": "۱",
    "2": "۲",
    "3": "۳",
    "4": "۴",
    "5": "۵",
    "6": "۶",
    "7": "۷",
    "8": "۸",
    "9": "۹",
  };

  return value.replace(
    /\d/g,
    (digit) =>
      digits[digit] ?? digit,
  );
}

function getProviderWelcomeCopy(
  language: LanguageName,
) {
  if (language === "Dari") {
    return {
      back: "بازگشت",
      introduction: "معرفی",

      eyebrow:
        "ثبت‌نام ارائه‌دهنده",

      title:
        "مهارت خود را به یک فرصت کاری تبدیل کنید",

      subtitle:
        "پروفایل حرفه‌ای خود را بسازید، خدمات‌تان را معرفی کنید و با مشتریان نزدیک خود ارتباط بگیرید.",

      registrationTitle:
        "ثبت‌نام مرحله‌به‌مرحله",

      registrationSubtitle:
        "در مراحل بعدی، نوع خدمت، تجربه، محدودهٔ کاری، برنامه و اسناد خود را ثبت می‌کنید.",

      benefitsTitle:
        "چرا در خدمت فعالیت کنید؟",

      benefitsSubtitle:
        "ابزارهای لازم برای دریافت و مدیریت درخواست‌های کاری در اختیار شما قرار می‌گیرد.",

      continue:
        "شروع ثبت‌نام حرفه‌ای",

      helperText:
        "تکمیل این مراحل تنها چند دقیقه زمان می‌گیرد.",
    };
  }

  if (language === "Pashto") {
    return {
      back: "بېرته",
      introduction: "پېژندنه",

      eyebrow:
        "د خدمت وړاندې کوونکي نوم‌لیکنه",

      title:
        "خپل مهارت په کاري فرصت بدل کړئ",

      subtitle:
        "خپل مسلکي پروفایل جوړ کړئ، خدمتونه معرفي کړئ او له نږدې پیرودونکو سره اړیکه ونیسئ.",

      registrationTitle:
        "مرحله‌وار نوم‌لیکنه",

      registrationSubtitle:
        "په راتلونکو مرحلو کې به خپل خدمتونه، تجربه، کاري ساحه، مهال‌وېش او اسناد ثبت کړئ.",

      benefitsTitle:
        "ولې په خدمت کې کار وکړئ؟",

      benefitsSubtitle:
        "د کاري غوښتنو د ترلاسه کولو او مدیریت لپاره اړین وسایل درکول کېږي.",

      continue:
        "مسلکي نوم‌لیکنه پیل کړئ",

      helperText:
        "د دې مرحلو بشپړول یوازې څو دقیقې وخت نیسي.",
    };
  }

  return {
    back: "Back",
    introduction: "Introduction",

    eyebrow:
      "Provider registration",

    title:
      "Turn your skills into work opportunities",

    subtitle:
      "Build your professional profile, present your services and connect with nearby customers.",

    registrationTitle:
      "Simple step-by-step registration",

    registrationSubtitle:
      "Next, you will add your services, experience, work area, schedule and verification documents.",

    benefitsTitle:
      "Why work through Khedmat?",

    benefitsSubtitle:
      "You receive the tools needed to find, organize and manage customer requests.",

    continue:
      "Start professional registration",

    helperText:
      "Completing these steps only takes a few minutes.",
  };
}

const styles =
  StyleSheet.create({
    safeArea: {
      flex: 1,

      backgroundColor:
        KhedmatPalette.blue050,
    },

    root: {
      flex: 1,
    },

    scrollContent: {
      width: "100%",

      maxWidth:
        Layout.contentMaxWidth,

      alignSelf: "center",

      paddingHorizontal:
        Layout.screenPadding,

      paddingTop: Spacing.md,

      paddingBottom: 150,
    },

    topBar: {
      width: "100%",

      minHeight: 48,

      alignItems: "center",

      justifyContent:
        "space-between",
    },

    backButton: {
      width: 44,
      height: 44,

      borderRadius: Radius.pill,

      alignItems: "center",

      justifyContent: "center",

      borderWidth: 1,

      borderColor:
        KhedmatPalette.border,

      backgroundColor:
        KhedmatPalette.surface,
    },

    stepIndicator: {
      minHeight: 34,

      paddingHorizontal:
        Spacing.md,

      alignItems: "center",

      justifyContent: "center",

      borderRadius: Radius.pill,

      backgroundColor:
        KhedmatPalette.surfaceSoft,
    },

    stepText: {
      ...Typography.captionStyle,

      color:
        KhedmatPalette.blue500,

      fontFamily: Fonts.medium,
    },

    hero: {
      width: "100%",

      marginTop: Spacing.xl,

      alignItems: "center",

      gap: Spacing.xl,
    },

    heroIllustration: {
      width: 122,
      height: 122,

      alignItems: "center",

      justifyContent: "center",
    },

    heroIconOuter: {
      width: 112,
      height: 112,

      borderRadius: Radius.pill,

      alignItems: "center",

      justifyContent: "center",

      backgroundColor:
        KhedmatPalette.blue200,
    },

    heroIconInner: {
      width: 78,
      height: 78,

      borderRadius: Radius.xxl,

      alignItems: "center",

      justifyContent: "center",

      backgroundColor:
        KhedmatPalette.navy900,

      ...Shadows.medium,
    },

    heroDecorationTop: {
      position: "absolute",

      top: 2,
      right: 7,

      width: 34,
      height: 34,

      borderRadius: Radius.pill,

      alignItems: "center",

      justifyContent: "center",

      borderWidth: 2,

      borderColor:
        KhedmatPalette.blue050,

      backgroundColor:
        KhedmatPalette.surface,
    },

    heroDecorationBottom: {
      position: "absolute",

      bottom: 1,
      left: 8,

      width: 34,
      height: 34,

      borderRadius: Radius.pill,

      alignItems: "center",

      justifyContent: "center",

      borderWidth: 2,

      borderColor:
        KhedmatPalette.blue050,

      backgroundColor:
        KhedmatPalette.blue500,
    },

    heroCopy: {
      width: "100%",

      gap: Spacing.sm,
    },

      title: {
      ...Typography.screenTitle,

      width: "100%",

      maxWidth: 460,

      color:
        KhedmatPalette.textPrimary,

      fontSize: 27,

      lineHeight: 35,
    },

    subtitle: {
      ...Typography.bodyLarge,

      width: "100%",

      maxWidth: 460,

      color:
        KhedmatPalette.textSecondary,

      lineHeight: 25,
    },

    infoCard: {
      width: "100%",

      marginTop: Spacing.lg,

      padding: Spacing.md,

      borderWidth: 1,

      borderColor:
        KhedmatPalette.blue200,

      borderRadius: Radius.xl,

      backgroundColor:
        "#F4FBFC",
    },

    infoCardContent: {
      width: "100%",

      alignItems: "flex-start",

      gap: Spacing.md,
    },

    infoIcon: {
      width: 44,
      height: 44,

      flexShrink: 0,

      borderRadius: Radius.md,

      alignItems: "center",

      justifyContent: "center",

      backgroundColor:
        KhedmatPalette.surface,
    },

    infoCopy: {
      flex: 1,

      gap: Spacing.xs,
    },

    infoTitle: {
      ...Typography.label,

      width: "100%",

      color:
        KhedmatPalette.textPrimary,

      fontSize: 16,
    },

      section: {
      width: "100%",

      marginTop:
        Spacing.xl,

      gap: Spacing.md,
    },

    sectionHeader: {
      width: "100%",

      gap: Spacing.xs,
    },

    sectionTitle: {
      ...Typography.sectionTitle,

      width: "100%",

      color:
        KhedmatPalette.textPrimary,

      fontSize: 21,

      lineHeight: 28,
    },

      benefits: {
      width: "100%",

      gap: Spacing.md,
    },

    benefitCard: {
      width: "100%",

      minHeight: 90,

      padding: Spacing.md,

      alignItems: "flex-start",

      gap: Spacing.md,

      borderWidth: 1,

      borderColor:
        KhedmatPalette.border,

      borderRadius: Radius.xl,

      backgroundColor:
        KhedmatPalette.surface,

      ...Shadows.small,
    },

    benefitIcon: {
      width: 52,
      height: 52,

      flexShrink: 0,

      borderRadius: Radius.lg,

      alignItems: "center",

      justifyContent: "center",

      backgroundColor:
        KhedmatPalette.surfaceSoft,
    },

    benefitNumber: {
      position: "absolute",

      top: -6,
      right: -6,

      width: 21,
      height: 21,

      borderRadius: Radius.pill,

      alignItems: "center",

      justifyContent: "center",

      borderWidth: 2,

      borderColor:
        KhedmatPalette.surface,

      backgroundColor:
        KhedmatPalette.blue500,
    },

    benefitNumberText: {
      color:
        KhedmatPalette.white,

      fontFamily: Fonts.bold,

      fontSize: 9,
    },

    benefitCopy: {
      flex: 1,

      gap: Spacing.xs,
    },

    benefitTitle: {
      ...Typography.label,

      width: "100%",

      color:
        KhedmatPalette.textPrimary,

      fontSize: 17,

      lineHeight: 23,
    },

    benefitSubtitle: {
      ...Typography.bodyStyle,

      width: "100%",

      color:
        KhedmatPalette.textSecondary,

      fontSize: 15,

      lineHeight: 22,
    },

    footer: {
      position: "absolute",

      right: 0,
      bottom: 0,
      left: 0,

      borderTopWidth:
        StyleSheet.hairlineWidth,

      borderTopColor:
        KhedmatPalette.border,

      backgroundColor:
        KhedmatPalette.surface,
    },

    footerContent: {
      width: "100%",

      maxWidth:
        Layout.contentMaxWidth,

      alignSelf: "center",

      paddingHorizontal:
        Layout.screenPadding,

      paddingTop: Spacing.md,

      paddingBottom: Spacing.lg,

      gap: Spacing.sm,
    },

    primaryButton: {
      width: "100%",

      minHeight:
        Layout.controlHeight,

      paddingHorizontal:
        Spacing.lg,

      alignItems: "center",

      justifyContent: "center",

      borderRadius: Radius.lg,

      backgroundColor:
        KhedmatPalette.navy900,

      ...Shadows.small,
    },

    primaryButtonPressed: {
      opacity: 0.84,

      transform: [
        {
          scale: 0.99,
        },
      ],
    },

    primaryButtonContent: {
      alignItems: "center",

      justifyContent: "center",

      gap: Spacing.sm,
    },

    primaryButtonText: {
      ...Typography.label,

      color:
        KhedmatPalette.white,

      fontFamily: Fonts.medium,

      fontSize: 16,
    },

    helperRow: {
      alignItems: "center",

      justifyContent: "center",

      gap: 5,
    },

    helperText: {
      ...Typography.captionStyle,

      flexShrink: 1,

      color:
        KhedmatPalette.textMuted,

      textAlign: "center",
    },

    pressed: {
      opacity: 0.76,

      transform: [
        {
          scale: 0.97,
        },
      ],
    },
  });
