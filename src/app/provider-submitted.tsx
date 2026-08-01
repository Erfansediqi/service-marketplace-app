import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  StyleSheet,
  Text,
  View,
} from "react-native";

import { GlassButton } from "../components/glass/glass-button";
import { GlassSurface } from "../components/glass/glass-surface";
import { AppScreen } from "../components/layout/app-screen";
import {
  Colors,
  Radius,
  Spacing,
  Typography,
} from "../constants/theme";
import { useSession } from "../context/session-context";

const reviewSteps = [
  {
    icon: "document-text-outline" as const,
    title: "بررسی اطلاعات",
    subtitle:
      "جزئیات حرفه‌ای، خدمات و محدودهٔ فعالیت شما بررسی می‌شود.",
  },
  {
    icon: "shield-checkmark-outline" as const,
    title: "تأیید هویت",
    subtitle:
      "تصویر چهره و اسناد هویتی شما به‌صورت محرمانه بررسی خواهد شد.",
  },
  {
    icon: "notifications-outline" as const,
    title: "اعلام نتیجه",
    subtitle:
      "پس از پایان بررسی، نتیجه از طریق اعلان برنامه به شما اطلاع داده می‌شود.",
  },
];

export default function ProviderSubmittedScreen() {
  const router = useRouter();

  const {
    enterProviderWorkspace,
  } = useSession();

  const handleContinue = () => {
    /*
     * Temporary local provider identity.
     *
     * Later, the backend will return the real provider ID
     * after registration or approval.
     */
    enterProviderWorkspace("provider-1");

    router.replace("/(provider-tabs)");
  };

  return (
    <AppScreen
      scrollable
      contentStyle={styles.screenContent}
      footer={
        <View style={styles.footer}>
          <GlassButton
            label="رفتن به پنل ارائه‌دهنده"
            icon="grid-outline"
            iconPosition="left"
            onPress={handleContinue}
          />

          <Text style={styles.helperText}>
            وضعیت بررسی حساب شما در پنل ارائه‌دهنده
            نمایش داده خواهد شد.
          </Text>
        </View>
      }
    >
      <View style={styles.hero}>
        <GlassSurface
          variant="prominent"
          radius={Radius.xxl}
          style={styles.successSurface}
          contentStyle={styles.successContent}
        >
          <View style={styles.successInner}>
            <Ionicons
              name="checkmark"
              size={44}
              color={Colors.white}
            />
          </View>
        </GlassSurface>

        <View style={styles.heroCopy}>
          <Text style={styles.eyebrow}>
            درخواست ارسال شد
          </Text>

          <Text style={styles.title}>
            ثبت‌نام حرفه‌ای شما با موفقیت تکمیل شد
          </Text>

          <Text style={styles.subtitle}>
            درخواست شما برای بررسی ارسال شده است.
            پس از تأیید، حساب ارائه‌دهندهٔ شما به‌صورت
            کامل فعال خواهد شد.
          </Text>
        </View>
      </View>

      <GlassSurface
        variant="regular"
        radius={Radius.xl}
        style={styles.statusCard}
        contentStyle={styles.statusContent}
      >
        <View style={styles.statusIcon}>
          <Ionicons
            name="time-outline"
            size={24}
            color={Colors.warning}
          />
        </View>

        <View style={styles.statusCopy}>
          <Text style={styles.statusLabel}>
            وضعیت درخواست
          </Text>

          <Text style={styles.statusTitle}>
            در انتظار بررسی
          </Text>

          <Text style={styles.statusSubtitle}>
            بررسی معمولاً بین ۱ تا ۳ روز کاری زمان
            می‌گیرد.
          </Text>
        </View>
      </GlassSurface>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            مراحل بعدی
          </Text>

          <Text style={styles.sectionSubtitle}>
            درخواست شما از این مراحل عبور خواهد کرد.
          </Text>
        </View>

        <View style={styles.steps}>
          {reviewSteps.map((step, index) => (
            <View
              key={step.title}
              style={styles.stepWrapper}
            >
              <GlassSurface
                variant="regular"
                radius={Radius.xl}
                style={styles.stepCard}
                contentStyle={styles.stepContent}
              >
                <View style={styles.stepIcon}>
                  <Ionicons
                    name={step.icon}
                    size={22}
                    color={Colors.primary}
                  />
                </View>

                <View style={styles.stepCopy}>
                  <Text style={styles.stepTitle}>
                    {step.title}
                  </Text>

                  <Text style={styles.stepSubtitle}>
                    {step.subtitle}
                  </Text>
                </View>

                <View style={styles.stepNumber}>
                  <Text
                    style={styles.stepNumberText}
                  >
                    {toDariDigits(
                      (index + 1).toString(),
                    )}
                  </Text>
                </View>
              </GlassSurface>

              {index <
              reviewSteps.length - 1 ? (
                <View style={styles.connector} />
              ) : null}
            </View>
          ))}
        </View>
      </View>

      <GlassSurface
        variant="regular"
        radius={Radius.xl}
        style={styles.noticeCard}
        contentStyle={styles.noticeContent}
      >
        <View style={styles.noticeIcon}>
          <Ionicons
            name="information-circle-outline"
            size={23}
            color={Colors.primary}
          />
        </View>

        <View style={styles.noticeCopy}>
          <Text style={styles.noticeTitle}>
            معلومات مهم
          </Text>

          <Text style={styles.noticeText}>
            لطفاً اعلان‌های برنامه را فعال نگه دارید.
            اگر معلومات بیشتری لازم باشد، از طریق
            برنامه با شما تماس گرفته می‌شود.
          </Text>
        </View>
      </GlassSurface>
    </AppScreen>
  );
}

function toDariDigits(
  value: string,
): string {
  const digits: Record<string, string> = {
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
    (digit) => digits[digit] ?? digit,
  );
}

const styles = StyleSheet.create({
  screenContent: {
    paddingTop: Spacing.screen,
    paddingBottom: Spacing.screen,
  },

  hero: {
    width: "100%",
    alignItems: "center",
    gap: Spacing.xxl,
  },

  successSurface: {
    width: 112,
    height: 112,
    borderColor:
      "rgba(48, 183, 106, 0.44)",
    backgroundColor:
      "rgba(48, 183, 106, 0.10)",
  },

  successContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  successInner: {
    width: 68,
    height: 68,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.success,
    borderWidth:
      StyleSheet.hairlineWidth,
    borderColor:
      "rgba(255, 255, 255, 0.26)",
  },

  heroCopy: {
    width: "100%",
    alignItems: "center",
    gap: Spacing.sm,
  },

  eyebrow: {
    ...Typography.captionStyle,
    color: Colors.success,
    textAlign: "center",
    writingDirection: "rtl",
  },

  title: {
    ...Typography.screenTitle,
    width: "100%",
    maxWidth: 460,
    color: Colors.textPrimary,
    textAlign: "center",
    writingDirection: "rtl",
    fontSize: 29,
    lineHeight: 37,
  },

  subtitle: {
    ...Typography.bodyLarge,
    width: "100%",
    maxWidth: 460,
    color: Colors.textSecondary,
    textAlign: "center",
    writingDirection: "rtl",
    lineHeight: 24,
  },

  statusCard: {
    width: "100%",
    marginTop: Spacing.screen,
    borderColor:
      "rgba(217, 154, 43, 0.30)",
    backgroundColor:
      "rgba(217, 154, 43, 0.06)",
  },

  statusContent: {
    minHeight: 110,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: Spacing.md,
    padding: Spacing.lg,
  },

  statusIcon: {
    width: 50,
    height: 50,
    flexShrink: 0,
    borderRadius: Radius.lg,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      "rgba(217, 154, 43, 0.12)",
  },

  statusCopy: {
    flex: 1,
    alignItems: "flex-end",
    gap: Spacing.xs,
  },

  statusLabel: {
    ...Typography.captionStyle,
    width: "100%",
    color: Colors.warning,
    textAlign: "right",
    writingDirection: "rtl",
  },

  statusTitle: {
    ...Typography.sectionTitle,
    width: "100%",
    color: Colors.textPrimary,
    textAlign: "right",
    writingDirection: "rtl",
    fontSize: 20,
    lineHeight: 27,
  },

  statusSubtitle: {
    ...Typography.captionStyle,
    width: "100%",
    color: Colors.textSecondary,
    textAlign: "right",
    writingDirection: "rtl",
    lineHeight: 19,
  },

  section: {
    width: "100%",
    marginTop: Spacing.screen,
    gap: Spacing.lg,
  },

  sectionHeader: {
    width: "100%",
    alignItems: "flex-end",
    gap: Spacing.xs,
  },

  sectionTitle: {
    ...Typography.sectionTitle,
    width: "100%",
    color: Colors.textPrimary,
    textAlign: "right",
    writingDirection: "rtl",
    fontSize: 21,
    lineHeight: 28,
  },

  sectionSubtitle: {
    ...Typography.captionStyle,
    width: "100%",
    color: Colors.textTertiary,
    textAlign: "right",
    writingDirection: "rtl",
  },

  steps: {
    width: "100%",
  },

  stepWrapper: {
    width: "100%",
  },

  stepCard: {
    width: "100%",
  },

  stepContent: {
    minHeight: 104,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: Spacing.md,
    padding: Spacing.lg,
  },

  stepIcon: {
    width: 48,
    height: 48,
    flexShrink: 0,
    borderRadius: Radius.lg,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      Colors.primarySoft,
    borderWidth:
      StyleSheet.hairlineWidth,
    borderColor:
      "rgba(76, 141, 255, 0.22)",
  },

  stepCopy: {
    flex: 1,
    alignItems: "flex-end",
    gap: Spacing.xs,
  },

  stepTitle: {
    ...Typography.label,
    width: "100%",
    color: Colors.textPrimary,
    textAlign: "right",
    writingDirection: "rtl",
    fontSize: 17,
    lineHeight: 23,
  },

  stepSubtitle: {
    ...Typography.captionStyle,
    width: "100%",
    color: Colors.textSecondary,
    textAlign: "right",
    writingDirection: "rtl",
    lineHeight: 19,
  },

  stepNumber: {
    width: 30,
    height: 30,
    flexShrink: 0,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      Colors.glassStrong,
    borderWidth:
      StyleSheet.hairlineWidth,
    borderColor: Colors.borderStrong,
  },

  stepNumberText: {
    ...Typography.captionStyle,
    color: Colors.textPrimary,
    fontWeight: "700",
  },

  connector: {
    width: 2,
    height: Spacing.md,
    alignSelf: "flex-end",
    marginRight: 23,
    backgroundColor: Colors.separator,
  },

  noticeCard: {
    width: "100%",
    marginTop: Spacing.screen,
  },

  noticeContent: {
    minHeight: 104,
    flexDirection: "row-reverse",
    alignItems: "flex-start",
    gap: Spacing.md,
    padding: Spacing.lg,
  },

  noticeIcon: {
    width: 46,
    height: 46,
    flexShrink: 0,
    borderRadius: Radius.lg,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      Colors.primarySoft,
  },

  noticeCopy: {
    flex: 1,
    alignItems: "flex-end",
    gap: Spacing.xs,
  },

  noticeTitle: {
    ...Typography.label,
    width: "100%",
    color: Colors.textPrimary,
    textAlign: "right",
    writingDirection: "rtl",
  },

  noticeText: {
    ...Typography.captionStyle,
    width: "100%",
    color: Colors.textSecondary,
    textAlign: "right",
    writingDirection: "rtl",
    lineHeight: 19,
  },

  footer: {
    width: "100%",
    alignItems: "center",
    gap: Spacing.sm,
  },

  helperText: {
    ...Typography.captionStyle,
    maxWidth: 360,
    color: Colors.textTertiary,
    textAlign: "center",
    writingDirection: "rtl",
    lineHeight: 19,
  },
});