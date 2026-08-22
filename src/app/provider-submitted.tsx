import { Ionicons } from "@expo/vector-icons";
import {
  useLocalSearchParams,
  useRouter,
} from "expo-router";
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
import { useSession } from "../context/session-context";

type IconName =
  ComponentProps<typeof Ionicons>["name"];

type LanguageName =
  | "English"
  | "Dari"
  | "Pashto";

type ReviewStepId =
  | "application"
  | "identity"
  | "result";

type ReviewStep = {
  id: ReviewStepId;
  icon: IconName;
};

type SubmittedCopy = ReturnType<
  typeof getSubmittedCopy
>;

const SUCCESS = "#268A57";
const SUCCESS_SOFT = "#E8F6EE";
const WARNING = "#8A5A00";
const WARNING_SOFT = "#FFF4D6";

const REVIEW_STEPS: ReviewStep[] = [
  {
    id: "application",
    icon: "document-text-outline",
  },
  {
    id: "identity",
    icon: "shield-checkmark-outline",
  },
  {
    id: "result",
    icon: "notifications-outline",
  },
];

export default function ProviderSubmittedScreen() {
  const router = useRouter();
  const params =
  useLocalSearchParams<{
    providerId?: string;
  }>();

  const {
    enterProviderWorkspace,
  } = useSession();

  const { language } =
    useLanguage();

  const activeLanguage =
    normalizeLanguage(language);

  const isRtl =
    activeLanguage === "Dari" ||
    activeLanguage === "Pashto";

  const localizedDigits =
    activeLanguage !== "English";

  const copy =
    getSubmittedCopy(
      activeLanguage,
    );

  const handleContinue = () => {
  if (!params.providerId) {
    console.error(
      "Missing providerId.",
    );

    return;
  }

  enterProviderWorkspace(
    params.providerId,
  );

  router.replace(
    "/(provider-tabs)",
  );
};

  const handleCustomerHome = () => {
    router.replace("/(tabs)");
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
          <View style={styles.hero}>
            <View
              style={
                styles.successIllustration
              }
            >
              <View
                style={
                  styles.successOuter
                }
              >
                <View
                  style={
                    styles.successInner
                  }
                >
                  <Ionicons
                    name="checkmark"
                    size={42}
                    color={
                      KhedmatPalette
                        .white
                    }
                  />
                </View>
              </View>




            </View>

            <View
              style={
                styles.heroCopy
              }
            >


              <Text
                style={[
                  styles.title,
                  directionStyle(isRtl),
                ]}
              >
                {copy.title}
              </Text>


            </View>
          </View>

          <View
            style={[
              styles.statusCard,
              {
                flexDirection: isRtl
                  ? "row-reverse"
                  : "row",
              },
            ]}
          >
            <View
              style={
                styles.statusIcon
              }
            >
              <Ionicons
                name="time-outline"
                size={24}
                color={WARNING}
              />
            </View>

            <View
              style={[
                styles.statusCopy,
                {
                  alignItems: isRtl
                    ? "flex-end"
                    : "flex-start",
                },
              ]}
            >


              <Text
                style={[
                  styles.statusTitle,
                  directionStyle(isRtl),
                ]}
              >
                {copy.statusTitle}
              </Text>

              <Text
                style={[
                  styles.statusSubtitle,
                  directionStyle(isRtl),
                ]}
              >
                {copy.statusSubtitle}
              </Text>
            </View>

            <View
              style={
                styles.statusBadge
              }
            >
              <Text
                style={[
                  styles.statusBadgeText,
                  directionStyle(isRtl),
                ]}
              >
                {copy.pending}
              </Text>
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
                  directionStyle(isRtl),
                ]}
              >
                {copy.nextStepsTitle}
              </Text>


            </View>

            <View
              style={styles.steps}
            >
              {REVIEW_STEPS.map(
                (step, index) => (
                  <ReviewStepCard
                    key={step.id}
                    step={step}
                    index={index}
                    isLast={
                      index ===
                      REVIEW_STEPS.length -
                        1
                    }
                    copy={copy}
                    isRtl={isRtl}
                    localizedDigits={
                      localizedDigits
                    }
                  />
                ),
              )}
            </View>
          </View>

          <View
            style={[
              styles.accessCard,
              {
                flexDirection: isRtl
                  ? "row-reverse"
                  : "row",
              },
            ]}
          >
            <View
              style={
                styles.accessIcon
              }
            >
              <Ionicons
                name="grid-outline"
                size={22}
                color={
                  KhedmatPalette
                    .blue500
                }
              />
            </View>

            <View
              style={[
                styles.accessCopy,
                {
                  alignItems: isRtl
                    ? "flex-end"
                    : "flex-start",
                },
              ]}
            >
              <Text
                style={[
                  styles.accessTitle,
                  directionStyle(isRtl),
                ]}
              >
                {copy.workspaceTitle}
              </Text>


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
                copy.openProviderPanel
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
                <Ionicons
                  name="grid-outline"
                  size={20}
                  color={
                    KhedmatPalette
                      .white
                  }
                />

                <Text
                  style={[
                    styles.primaryButtonText,
                    directionStyle(
                      isRtl,
                    ),
                  ]}
                >
                  {
                    copy.openProviderPanel
                  }
                </Text>
              </View>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={
                copy.customerHome
              }
              onPress={
                handleCustomerHome
              }
              style={({ pressed }) => [
                styles.secondaryButton,
                pressed &&
                  styles.secondaryButtonPressed,
              ]}
            >
              <View
                style={[
                  styles.secondaryButtonContent,
                  {
                    flexDirection: isRtl
                      ? "row-reverse"
                      : "row",
                  },
                ]}
              >
                <Ionicons
                  name="home-outline"
                  size={18}
                  color={
                    KhedmatPalette
                      .navy700
                  }
                />

                <Text
                  style={[
                    styles.secondaryButtonText,
                    directionStyle(
                      isRtl,
                    ),
                  ]}
                >
                  {copy.customerHome}
                </Text>
              </View>
            </Pressable>


          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

type ReviewStepCardProps = {
  step: ReviewStep;
  index: number;
  isLast: boolean;
  copy: SubmittedCopy;
  isRtl: boolean;
  localizedDigits: boolean;
};

function ReviewStepCard({
  step,
  index,
  isLast,
  copy,
  isRtl,
  localizedDigits,
}: ReviewStepCardProps) {
  return (
    <View
      style={styles.stepWrapper}
    >
      <View
        style={[
          styles.stepCard,
          {
            flexDirection: isRtl
              ? "row-reverse"
              : "row",
          },
        ]}
      >
        <View
          style={
            styles.stepIcon
          }
        >
          <Ionicons
            name={step.icon}
            size={22}
            color={
              KhedmatPalette
                .blue500
            }
          />
        </View>

        <View
          style={[
            styles.stepCopy,
            {
              alignItems: isRtl
                ? "flex-end"
                : "flex-start",
            },
          ]}
        >
          <Text
            style={[
              styles.stepTitle,
              directionStyle(isRtl),
            ]}
          >
            {copy.stepTitle(
              step.id,
            )}
          </Text>

          <Text
            style={[
              styles.stepSubtitle,
              directionStyle(isRtl),
            ]}
          >
            {copy.stepSubtitle(
              step.id,
            )}
          </Text>
        </View>

        <View
          style={
            styles.stepNumber
          }
        >
          <Text
            style={
              styles.stepNumberText
            }
          >
            {formatDigits(
              (index + 1).toString(),
              localizedDigits,
            )}
          </Text>
        </View>
      </View>

      {!isLast ? (
        <View
          style={[
            styles.connectorRow,
            {
              flexDirection: isRtl
                ? "row-reverse"
                : "row",
            },
          ]}
        >
          <View
            style={
              styles.connectorSpacer
            }
          />

          <View
            style={
              styles.connector
            }
          />

          <View
            style={
              styles.connectorContentSpacer
            }
          />
        </View>
      ) : null}
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

function getSubmittedCopy(
  language: LanguageName,
) {
  if (language === "Dari") {
    return {
      eyebrow:
        "درخواست ارسال شد",
      title:
        "درخواست شما ارسال شد",
      subtitle:
        "درخواست شما برای بررسی ارسال شده است. پس از تأیید، حساب ارائه‌دهندهٔ شما به‌صورت کامل فعال خواهد شد.",
      statusLabel:
        "وضعیت درخواست",
      statusTitle:
        "در انتظار بررسی",
      statusSubtitle:
        "بررسی معمولاً بین ۱ تا ۳ روز کاری زمان می‌گیرد.",
      pending:
        "در انتظار",
      nextStepsTitle:
        "بعد چه می‌شود؟",
      nextStepsSubtitle:
        "درخواست شما از مراحل زیر عبور خواهد کرد.",
      stepTitle:
        (id: ReviewStepId) =>
          ({
            application:
              "بررسی معلومات",
            identity:
              "تأیید هویت",
            result:
              "اعلام نتیجه",
          })[id],
      stepSubtitle:
        (id: ReviewStepId) =>
          ({
            application:
              "جزئیات حرفه‌ای، خدمات، برنامه و محدودهٔ فعالیت شما بررسی می‌شود.",
            identity:
              "عکس چهره و اسناد هویتی شما به‌صورت محرمانه بررسی خواهد شد.",
            result:
              "پس از پایان بررسی، نتیجه از طریق اعلان برنامه به شما اطلاع داده می‌شود.",
          })[id],
      noticeTitle:
        "اعلان‌های برنامه را فعال نگه دارید",
      noticeText:
        "اگر برای تکمیل بررسی معلومات بیشتری لازم باشد، از طریق برنامه با شما تماس گرفته می‌شود.",
      workspaceTitle:
        "پنل ارائه‌دهنده آماده است",
      workspaceText:
        "می‌توانید وارد پنل شوید و وضعیت بررسی، برنامهٔ کاری و تنظیمات پروفایل خود را مشاهده کنید.",
      openProviderPanel:
        "پنل ارائه‌دهنده",
      customerHome:
        "صفحهٔ مشتری",
      helperText:
        "تا زمان پایان بررسی، برخی قابلیت‌های حرفه‌ای ممکن است محدود باشند.",
    };
  }

  if (language === "Pashto") {
    return {
      eyebrow:
        "غوښتنلیک ولېږل شو",
      title:
        "ستاسو غوښتنلیک ولېږل شو",
      subtitle:
        "ستاسو غوښتنلیک د ارزونې لپاره لېږل شوی. له تایید وروسته به ستاسو د خدمت وړاندې کوونکي حساب بشپړ فعال شي.",
      statusLabel:
        "د غوښتنلیک حالت",
      statusTitle:
        "د ارزونې په تمه",
      statusSubtitle:
        "ارزونه معمولاً له ۱ تر ۳ کاري ورځو وخت نیسي.",
      pending:
        "په تمه",
      nextStepsTitle:
        "وروسته څه کېږي؟",
      nextStepsSubtitle:
        "ستاسو غوښتنلیک به له لاندې مرحلو تېر شي.",
      stepTitle:
        (id: ReviewStepId) =>
          ({
            application:
              "د معلوماتو ارزونه",
            identity:
              "د هویت تایید",
            result:
              "د پایلې خبرتیا",
          })[id],
      stepSubtitle:
        (id: ReviewStepId) =>
          ({
            application:
              "ستاسو مسلکي معلومات، خدمتونه، مهال‌وېش او کاري ساحه کتل کېږي.",
            identity:
              "ستاسو د مخ عکس او د هویت اسناد به په محرم ډول وکتل شي.",
            result:
              "له ارزونې وروسته به پایله د اپلېکېشن د خبرتیا له لارې درته واستول شي.",
          })[id],
      noticeTitle:
        "د اپلېکېشن خبرتیاوې فعالې وساتئ",
      noticeText:
        "که د ارزونې لپاره نورو معلوماتو ته اړتیا وي، له تاسو سره به د اپلېکېشن له لارې اړیکه ونیول شي.",
      workspaceTitle:
        "د خدمت وړاندې کوونکي پینل چمتو دی",
      workspaceText:
        "تاسو کولی شئ پینل ته ننوځئ او د ارزونې حالت، کاري مهال‌وېش او د پروفایل تنظیمات وګورئ.",
      openProviderPanel:
        "د خدمت وړاندې کوونکي پینل",
      customerHome:
        "د پیرودونکي کورپاڼه",
      helperText:
        "تر ارزونې بشپړېدو پورې ښايي ځینې مسلکي ځانګړنې محدودې وي.",
    };
  }

  return {
    eyebrow:
      "Application submitted",
    title:
      "Application submitted",
    subtitle:
      "Your application has been submitted for review. Your provider account will become fully active after approval.",
    statusLabel:
      "Application status",
    statusTitle:
      "Pending review",
    statusSubtitle:
      "Review normally takes between 1 and 3 working days.",
    pending:
      "Pending",
    nextStepsTitle:
      "What happens next",
    nextStepsSubtitle:
      "Your application will move through the following review stages.",
    stepTitle:
      (id: ReviewStepId) =>
        ({
          application:
            "Application review",
          identity:
            "Identity verification",
          result:
            "Result notification",
        })[id],
    stepSubtitle:
      (id: ReviewStepId) =>
        ({
          application:
            "Your professional details, services, schedule and work area will be reviewed.",
          identity:
            "Your face photo and identity documents will be reviewed confidentially.",
          result:
            "You will receive the result through an in-app notification after review.",
        })[id],
    noticeTitle:
      "Keep app notifications enabled",
    noticeText:
      "If additional information is needed to complete the review, you will be contacted through the app.",
    workspaceTitle:
      "Your provider workspace is ready",
    workspaceText:
      "You can open the provider panel to view review status, manage your schedule and update profile settings.",
    openProviderPanel:
      "Provider panel",
    customerHome:
      "Customer home",
    helperText:
      "Some professional features may remain limited until the review is completed.",
  };
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor:
      KhedmatPalette.white,
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
    paddingTop: Spacing.xl,
    paddingBottom: 220,
  },

  hero: {
    width: "100%",
    alignItems: "center",
    gap: Spacing.lg,
  },

  successIllustration: {
    width: 96,
    height: 96,
    alignItems: "center",
    justifyContent: "center",
  },

  successOuter: {
    width: 90,
    height: 90,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      "#DFF3E8",
  },

  successInner: {
    width: 62,
    height: 62,
    borderRadius: Radius.xxl,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: SUCCESS,
    ...Shadows.medium,
  },

  heroCopy: {
    width: "100%",
    alignItems: "center",
    gap: Spacing.sm,
  },

  title: {
    ...Typography.screenTitle,
    width: "100%",
    maxWidth: 470,
    color:
      KhedmatPalette.navy900,
    fontSize: 28,
    lineHeight: 36,
    textAlign: "center",
  },

  statusCard: {
    width: "100%",
    minHeight: 96,
    marginTop: Spacing.xl,
    padding: Spacing.md,
    alignItems: "center",
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: "#E5C875",
    borderRadius: Radius.xl,
    backgroundColor:
      "#FFFDF6",
  },

  statusIcon: {
    width: 42,
    height: 42,
    flexShrink: 0,
    borderRadius: Radius.lg,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      WARNING_SOFT,
  },

  statusCopy: {
    flex: 1,
    gap: 3,
  },

  statusTitle: {
    ...Typography.sectionTitle,
    width: "100%",
    color:
      KhedmatPalette.textPrimary,
    fontSize: 20,
    lineHeight: 27,
  },

  statusSubtitle: {
    ...Typography.captionStyle,
    width: "100%",
    color:
      KhedmatPalette.textSecondary,
    lineHeight: 19,
  },

  statusBadge: {
    maxWidth: 96,
    flexShrink: 0,
    paddingHorizontal:
      Spacing.sm,
    paddingVertical: 6,
    borderRadius: Radius.pill,
    backgroundColor:
      WARNING_SOFT,
  },

  statusBadgeText: {
    ...Typography.captionStyle,
    color: WARNING,
    fontFamily: Fonts.medium,
    fontSize: 10,
    textAlign: "center",
  },

  section: {
    width: "100%",
    marginTop: Spacing.xl,
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
      KhedmatPalette.navy900,
    fontSize: 19,
    lineHeight: 28,
  },

  steps: {
    width: "100%",
  },

  stepWrapper: {
    width: "100%",
  },

  stepCard: {
    width: "100%",
    minHeight: 82,
    padding: Spacing.md,
    alignItems: "center",
    gap: Spacing.md,
    borderWidth: 1,
    borderColor:
      KhedmatPalette.border,
    borderRadius: Radius.xl,
    backgroundColor:
      KhedmatPalette.surface,
    ...Shadows.small,
  },

  stepIcon: {
    width: 40,
    height: 40,
    flexShrink: 0,
    borderRadius: Radius.lg,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      KhedmatPalette.surfaceSoft,
  },

  stepCopy: {
    flex: 1,
    gap: Spacing.xs,
  },

  stepTitle: {
    ...Typography.label,
    width: "100%",
    color:
      KhedmatPalette.textPrimary,
    fontSize: 17,
    lineHeight: 23,
  },

  stepSubtitle: {
    ...Typography.captionStyle,
    width: "100%",
    color:
      KhedmatPalette.textSecondary,
    lineHeight: 19,
  },

  stepNumber: {
    width: 32,
    height: 32,
    flexShrink: 0,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      KhedmatPalette.navy900,
  },

  stepNumberText: {
    color:
      KhedmatPalette.white,
    fontFamily: Fonts.bold,
    fontSize: 12,
  },

  connectorRow: {
    width: "100%",
    height: Spacing.md,
  },

  connectorSpacer: {
    width: 48,
  },

  connector: {
    width: 2,
    height: "100%",
    marginHorizontal:
      Spacing.lg,
    backgroundColor:
      KhedmatPalette.border,
  },

  connectorContentSpacer: {
    flex: 1,
  },

  accessCard: {
    width: "100%",
    minHeight: 72,
    marginTop: Spacing.lg,
    padding: Spacing.md,
    alignItems: "flex-start",
    gap: Spacing.md,
    borderWidth: 1,
    borderColor:
      KhedmatPalette.border,
    borderRadius: Radius.xl,
    backgroundColor:
      KhedmatPalette.white,
  },

  accessIcon: {
    width: 46,
    height: 46,
    flexShrink: 0,
    borderRadius: Radius.lg,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      KhedmatPalette.surfaceSoft,
  },

  accessCopy: {
    flex: 1,
    gap: 3,
  },

  accessTitle: {
    ...Typography.label,
    width: "100%",
    color:
      KhedmatPalette.textPrimary,
    fontSize: 15,
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
      KhedmatPalette.white,
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
    textAlign: "center",
  },

  secondaryButton: {
    width: "100%",
    minHeight: 48,
    paddingHorizontal:
      Spacing.lg,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor:
      KhedmatPalette.border,
    borderRadius: Radius.lg,
    backgroundColor:
      KhedmatPalette.white,
  },

  secondaryButtonPressed: {
    opacity: 0.78,
  },

  secondaryButtonContent: {
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
  },

  secondaryButtonText: {
    ...Typography.label,
    color:
      KhedmatPalette.navy700,
    fontFamily: Fonts.medium,
    fontSize: 15,
    textAlign: "center",
  },

  helperText: {
    ...Typography.captionStyle,
    width: "100%",
    color:
      KhedmatPalette.textMuted,
    textAlign: "center",
  },
});
