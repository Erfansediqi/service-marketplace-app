import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
    StyleSheet,
    Text,
    View,
} from "react-native";

import { GlassButton } from "../components/glass/glass-button";
import { GlassIconButton } from "../components/glass/glass-icon-button";
import { GlassSurface } from "../components/glass/glass-surface";
import { AppScreen } from "../components/layout/app-screen";
import {
    Colors,
    Radius,
    Spacing,
    Typography,
} from "../constants/theme";

const benefits = [
  {
    icon: "people-outline" as const,
    title: "دسترسی به مشتریان نزدیک",
    subtitle:
      "درخواست‌های مرتبط با مهارت و محل فعالیت خود را دریافت کنید.",
  },
  {
    icon: "calendar-outline" as const,
    title: "مدیریت سادهٔ کارها",
    subtitle:
      "درخواست‌ها، زمان‌بندی و وضعیت خدمات خود را از یک محل مدیریت کنید.",
  },
  {
    icon: "star-outline" as const,
    title: "ساخت اعتبار حرفه‌ای",
    subtitle:
      "با تکمیل خدمات و دریافت نظرهای مثبت، اعتماد مشتریان را افزایش دهید.",
  },
];

export default function ProviderWelcomeScreen() {
  const router = useRouter();

  const handleContinue = () => {
    router.push("/provider-category");
  };

  return (
    <AppScreen
      scrollable
      contentStyle={styles.screenContent}
      footer={
        <View style={styles.footer}>
          <GlassButton
            label="شروع ثبت‌نام حرفه‌ای"
            icon="arrow-back"
            iconPosition="left"
            onPress={handleContinue}
          />

          <Text style={styles.helperText}>
            تکمیل این مراحل تنها چند دقیقه زمان می‌گیرد.
          </Text>
        </View>
      }
    >
      <View style={styles.topBar}>
        <GlassIconButton
          icon="chevron-back"
          accessibilityLabel="بازگشت"
          onPress={() => router.back()}
        />
      </View>

      <View style={styles.hero}>
        <GlassSurface
          variant="prominent"
          radius={Radius.xxl}
          style={styles.heroIcon}
          contentStyle={styles.heroIconContent}
        >
          <Ionicons
            name="briefcase-outline"
            size={36}
            color={Colors.primary}
          />
        </GlassSurface>

        <View style={styles.heroCopy}>
          <Text style={styles.eyebrow}>
            ثبت‌نام ارائه‌دهنده
          </Text>

          <Text style={styles.title}>
            مهارت خود را به یک فرصت کاری تبدیل کنید
          </Text>

          <Text style={styles.subtitle}>
            پروفایل حرفه‌ای خود را بسازید، خدمات‌تان را معرفی کنید و با
            مشتریان نزدیک خود ارتباط بگیرید.
          </Text>
        </View>
      </View>

      <View style={styles.benefits}>
        {benefits.map((benefit) => (
          <GlassSurface
            key={benefit.title}
            variant="regular"
            radius={Radius.xl}
            style={styles.benefitCard}
            contentStyle={styles.benefitContent}
          >
            <View style={styles.benefitIcon}>
              <Ionicons
                name={benefit.icon}
                size={23}
                color={Colors.primary}
              />
            </View>

            <View style={styles.benefitCopy}>
              <Text style={styles.benefitTitle}>
                {benefit.title}
              </Text>

              <Text style={styles.benefitSubtitle}>
                {benefit.subtitle}
              </Text>
            </View>
          </GlassSurface>
        ))}
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  screenContent: {
    paddingTop: Spacing.md,
    paddingBottom: Spacing.screen,
  },

  topBar: {
    minHeight: 44,
    alignItems: "flex-start",
  },

  hero: {
    marginTop: Spacing.xl,
    gap: Spacing.xxl,
    alignItems: "flex-end",
  },

  heroIcon: {
    width: 76,
    height: 76,
    alignSelf: "flex-end",
    backgroundColor: "rgba(76, 141, 255, 0.10)",
    borderColor: "rgba(100, 158, 255, 0.28)",
  },

  heroIconContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  heroCopy: {
    width: "100%",
    gap: Spacing.sm,
    alignItems: "flex-end",
  },

  eyebrow: {
    ...Typography.captionStyle,
    width: "100%",
    color: Colors.primary,
    textAlign: "right",
    writingDirection: "rtl",
  },

  title: {
    ...Typography.screenTitle,
    width: "100%",
    color: Colors.textPrimary,
    textAlign: "right",
    writingDirection: "rtl",
    fontSize: 29,
    lineHeight: 37,
  },

  subtitle: {
    ...Typography.bodyLarge,
    width: "100%",
    maxWidth: 440,
    color: Colors.textSecondary,
    textAlign: "right",
    writingDirection: "rtl",
    lineHeight: 25,
  },

  benefits: {
    width: "100%",
    marginTop: Spacing.screen,
    gap: Spacing.md,
  },

  benefitCard: {
    width: "100%",
  },

  benefitContent: {
    minHeight: 104,
    padding: Spacing.lg,
    flexDirection: "row-reverse",
    alignItems: "flex-start",
    gap: Spacing.md,
  },

  benefitIcon: {
    width: 48,
    height: 48,
    flexShrink: 0,
    borderRadius: Radius.lg,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primarySoft,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(76, 141, 255, 0.24)",
  },

  benefitCopy: {
    flex: 1,
    alignItems: "flex-end",
    gap: Spacing.xs,
  },

  benefitTitle: {
    ...Typography.label,
    width: "100%",
    color: Colors.textPrimary,
    textAlign: "right",
    writingDirection: "rtl",
    fontSize: 17,
    lineHeight: 23,
  },

  benefitSubtitle: {
    ...Typography.bodyStyle,
    width: "100%",
    color: Colors.textSecondary,
    textAlign: "right",
    writingDirection: "rtl",
    lineHeight: 22,
  },

  footer: {
    width: "100%",
    alignItems: "center",
    gap: Spacing.sm,
  },

  helperText: {
    ...Typography.captionStyle,
    maxWidth: 330,
    color: Colors.textTertiary,
    textAlign: "center",
    writingDirection: "rtl",
  },
});