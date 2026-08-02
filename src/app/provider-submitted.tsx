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
    /*
     * Temporary local provider identity.
     *
     * Replace this fixed ID with the provider ID returned by the backend
     * after provider registration or approval is connected.
     */
    enterProviderWorkspace(
      "provider-1",
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

              <View
                style={
                  styles.successDecorationTop
                }
              >
                <Ionicons
                  name="sparkles"
                  size={16}
                  color={
                    KhedmatPalette
                      .blue500
                  }
                />
              </View>

              <View
                style={
                  styles.successDecorationBottom
                }
              >
                <Ionicons
                  name="shield-checkmark"
                  size={16}
                  color={
                    KhedmatPalette
                      .white
                  }
                />
              </View>
            </View>

            <View
              style={
                styles.heroCopy
              }
            >
              <Text
                style={[
                  styles.eyebrow,
                  directionStyle(isRtl),
                ]}
              >
                {copy.eyebrow}
              </Text>

              <Text
                style={[
                  styles.title,
                  directionStyle(isRtl),
                ]}
              >
                {copy.title}
              </Text>

              <Text
                style={[
                  styles.subtitle,
                  directionStyle(isRtl),
                ]}
              >
                {copy.subtitle}
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
                  styles.statusLabel,
                  directionStyle(isRtl),
                ]}
              >
                {copy.statusLabel}
              </Text>

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

              <Text
                style={[
                  styles.sectionSubtitle,
                  directionStyle(isRtl),
                ]}
              >
                {
                  copy.nextStepsSubtitle
                }
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
              styles.noticeCard,
              {
                flexDirection: isRtl
                  ? "row-reverse"
                  : "row",
              },
            ]}
          >
            <View
              style={
                styles.noticeIcon
              }
            >
              <Ionicons
                name="notifications-outline"
                size={22}
                color={
                  KhedmatPalette
                    .blue500
                }
              />
            </View>

            <View
              style={[
                styles.noticeCopy,
                {
                  alignItems: isRtl
                    ? "flex-end"
                    : "flex-start",
                },
              ]}
            >
              <Text
                style={[
                  styles.noticeTitle,
                  directionStyle(isRtl),
                ]}
              >
                {copy.noticeTitle}
              </Text>

              <Text
                style={[
                  styles.noticeText,
                  directionStyle(isRtl),
                ]}
              >
                {copy.noticeText}
              </Text>
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

              <Text
                style={[
                  styles.accessText,
                  directionStyle(isRtl),
                ]}
              >
                {copy.workspaceText}
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

            <Text
              style={[
                styles.helperText,
                directionStyle(isRtl),
              ]}
            >
              {copy.helperText}
            </Text>
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
        "ثبت‌نام حرفه‌ای شما تکمیل شد",
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
        "مراحل بعدی",
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
        "رفتن به پنل ارائه‌دهنده",
      customerHome:
        "رفتن به صفحهٔ مشتری",
      helperText:
        "تا زمان پایان بررسی، برخی قابلیت‌های حرفه‌ای ممکن است محدود باشند.",
    };
  }

  if (language === "Pashto") {
    return {
      eyebrow:
        "غوښتنلیک ولېږل شو",
      title:
        "ستاسو مسلکي نوم‌لیکنه بشپړه شوه",
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
        "راتلونکې مرحلې",
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
        "د خدمت وړاندې کوونکي پینل ته لاړ شئ",
      customerHome:
        "د پیرودونکي کورپاڼې ته لاړ شئ",
      helperText:
        "تر ارزونې بشپړېدو پورې ښايي ځینې مسلکي ځانګړنې محدودې وي.",
    };
  }

  return {
    eyebrow:
      "Application submitted",
    title:
      "Your professional registration is complete",
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
      "Open provider panel",
    customerHome:
      "Go to customer home",
    helperText:
      "Some professional features may remain limited until the review is completed.",
  };
}

const styles = StyleSheet.create({
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
    paddingTop: Spacing.xxl,
    paddingBottom: 220,
  },

  hero: {
    width: "100%",
    alignItems: "center",
    gap: Spacing.xxl,
  },

  successIllustration: {
    width: 128,
    height: 128,
    alignItems: "center",
    justifyContent: "center",
  },

  successOuter: {
    width: 118,
    height: 118,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      "#DFF3E8",
  },

  successInner: {
    width: 76,
    height: 76,
    borderRadius: Radius.xxl,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: SUCCESS,
    ...Shadows.medium,
  },

  successDecorationTop: {
    position: "absolute",
    top: 2,
    right: 8,
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

  successDecorationBottom: {
    position: "absolute",
    bottom: 1,
    left: 9,
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
    alignItems: "center",
    gap: Spacing.sm,
  },

  eyebrow: {
    ...Typography.captionStyle,
    width: "100%",
    color: SUCCESS,
    fontFamily: Fonts.medium,
    textAlign: "center",
  },

  title: {
    ...Typography.screenTitle,
    width: "100%",
    maxWidth: 470,
    color:
      KhedmatPalette.textPrimary,
    fontSize: 28,
    lineHeight: 36,
    textAlign: "center",
  },

  subtitle: {
    ...Typography.bodyLarge,
    width: "100%",
    maxWidth: 460,
    color:
      KhedmatPalette.textSecondary,
    lineHeight: 25,
    textAlign: "center",
  },

  statusCard: {
    width: "100%",
    minHeight: 122,
    marginTop: Spacing.section,
    padding: Spacing.lg,
    alignItems: "center",
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: "#E5C875",
    borderRadius: Radius.xl,
    backgroundColor:
      "#FFFDF6",
  },

  statusIcon: {
    width: 50,
    height: 50,
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

  statusLabel: {
    ...Typography.captionStyle,
    width: "100%",
    color: WARNING,
    fontFamily: Fonts.medium,
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
    marginTop: Spacing.section,
    gap: Spacing.lg,
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

  sectionSubtitle: {
    ...Typography.captionStyle,
    width: "100%",
    color:
      KhedmatPalette.textMuted,
    lineHeight: 18,
  },

  steps: {
    width: "100%",
  },

  stepWrapper: {
    width: "100%",
  },

  stepCard: {
    width: "100%",
    minHeight: 108,
    padding: Spacing.lg,
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
    width: 48,
    height: 48,
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

  noticeCard: {
    width: "100%",
    minHeight: 108,
    marginTop: Spacing.section,
    padding: Spacing.lg,
    alignItems: "flex-start",
    gap: Spacing.md,
    borderWidth: 1,
    borderColor:
      KhedmatPalette.blue200,
    borderRadius: Radius.xl,
    backgroundColor:
      "#F4FBFC",
  },

  noticeIcon: {
    width: 46,
    height: 46,
    flexShrink: 0,
    borderRadius: Radius.lg,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      KhedmatPalette.surface,
  },

  noticeCopy: {
    flex: 1,
    gap: 3,
  },

  noticeTitle: {
    ...Typography.label,
    width: "100%",
    color:
      KhedmatPalette.textPrimary,
    fontSize: 15,
  },

  noticeText: {
    ...Typography.captionStyle,
    width: "100%",
    color:
      KhedmatPalette.textSecondary,
    lineHeight: 19,
  },

  accessCard: {
    width: "100%",
    minHeight: 108,
    marginTop: Spacing.md,
    padding: Spacing.lg,
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

  accessText: {
    ...Typography.captionStyle,
    width: "100%",
    color:
      KhedmatPalette.textSecondary,
    lineHeight: 19,
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
      KhedmatPalette.surfaceSoft,
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
