import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { GlassButton } from "../components/glass/glass-button";
import { GlassIconButton } from "../components/glass/glass-icon-button";
import { GlassInput } from "../components/glass/glass-input";
import { GlassSurface } from "../components/glass/glass-surface";
import { AppScreen } from "../components/layout/app-screen";
import { Colors, Radius, Spacing, Typography } from "../constants/theme";
import { useLanguage } from "../context/languagecontext";

export default function SignupScreen() {
  const router = useRouter();
  const { t, language } = useLanguage();
  const isRtl = language === "Pashto" || language === "Dari";

  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const digits = phoneNumber.replace(/\D/g, "");

  const nameError =
    submitted && fullName.trim().length < 2 ? t("nameError") : undefined;

  const phoneError =
    submitted && digits.length < 7 ? t("phoneError") : undefined;

  const formValid = useMemo(
    () => fullName.trim().length >= 2 && digits.length >= 7,
    [digits.length, fullName],
  );

  const handleSendCode = () => {
    setSubmitted(true);

    if (!formValid) {
      return;
    }

    router.push({
      pathname: "/verify-code",
      params: {
        phone: `+93 ${phoneNumber.trim()}`,
      },
    });
  };

  return (
    <AppScreen
      keyboardAware
      scrollable
      contentStyle={styles.screenContent}
      footer={
        <View style={styles.footer}>
          <GlassButton
            disabled={!formValid && submitted}
            icon="arrow-forward"
            label={t("sendVerificationCode")}
            onPress={handleSendCode}
          />

          <Text
            style={[
              styles.legalText,
              {
                textAlign: isRtl ? "right" : "left",
                writingDirection: isRtl ? "rtl" : "ltr",
              },
            ]}
          >
            {t("legalTextCombined")}
          </Text>
        </View>
      }
    >
      <View
        style={[
          styles.topBar,
          { alignItems: isRtl ? "flex-start" : "flex-end" },
        ]}
      >
        <GlassIconButton
          accessibilityLabel={t("back")}
          icon="chevron-back"
          onPress={() => router.back()}
        />
      </View>

      <View style={styles.hero}>
        <GlassSurface
          radius={Radius.xxl}
          style={[
            styles.heroIcon,
            { alignSelf: isRtl ? "flex-end" : "flex-start" },
          ]}
          contentStyle={styles.heroIconContent}
          variant="prominent"
        >
          <Text style={styles.heroMark}>خ</Text>
        </GlassSurface>

        <View
          style={[
            styles.heading,
            { alignItems: isRtl ? "flex-end" : "flex-start" },
          ]}
        >
          <Text
            style={[
              styles.eyebrow,
              {
                textAlign: isRtl ? "right" : "left",
                writingDirection: isRtl ? "rtl" : "ltr",
              },
            ]}
          >
            {t("serviceAccount")}
          </Text>

          <Text
            style={[
              styles.title,
              {
                textAlign: isRtl ? "right" : "left",
                writingDirection: isRtl ? "rtl" : "ltr",
              },
            ]}
          >
            {t("createAccountTitle")}
          </Text>

          <Text
            style={[
              styles.subtitle,
              {
                textAlign: isRtl ? "right" : "left",
                writingDirection: isRtl ? "rtl" : "ltr",
              },
            ]}
          >
            {t("createAccountSubtitle")}
          </Text>
        </View>
      </View>

      <View style={styles.form}>
        <GlassInput
          autoCapitalize="words"
          autoComplete="name"
          error={nameError}
          icon="person-outline"
          label={t("fullNameLabel")}
          onChangeText={setFullName}
          placeholder={t("fullNamePlaceholder")}
          returnKeyType="next"
          textContentType="name"
          value={fullName}
        />

        <GlassInput
          autoComplete="tel"
          error={phoneError}
          keyboardType="phone-pad"
          label={t("phoneLabel")}
          leadingContent={
            <View style={styles.countryCode}>
              <Text style={styles.countryCodeText}>+93</Text>
              <View style={styles.countryCodeDivider} />
            </View>
          }
          onChangeText={setPhoneNumber}
          placeholder="701234567"
          returnKeyType="done"
          textContentType="telephoneNumber"
          value={phoneNumber}
        />
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  screenContent: {
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xxl,
  },

  topBar: {
    minHeight: 44,
  },

  hero: {
    marginTop: Spacing.lg,
  },

  heroIcon: {
    width: 72,
    height: 72,
    marginBottom: Spacing.lg,
  },

  heroIconContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  heroMark: {
    color: Colors.textPrimary,
    fontSize: 29,
    lineHeight: 34,
    fontWeight: "700",
  },

  heading: {
    gap: Spacing.xs,
  },

  eyebrow: {
    ...Typography.captionStyle,
    color: Colors.primary,
    letterSpacing: 1,
  },

  title: {
    ...Typography.screenTitle,
    color: Colors.textPrimary,
  },

  subtitle: {
    ...Typography.bodyLarge,
    color: Colors.textSecondary,
    maxWidth: 430,
  },

  form: {
    width: "100%",
    marginTop: Spacing.xl,
    gap: Spacing.lg,
  },

  countryCode: {
    height: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },

  countryCodeText: {
    ...Typography.label,
    color: Colors.textPrimary,
  },

  countryCodeDivider: {
    width: StyleSheet.hairlineWidth,
    height: 24,
    backgroundColor: Colors.borderStrong,
  },

  footer: {
    width: "100%",
    gap: Spacing.md,
    alignItems: "center",
    paddingVertical: Spacing.sm,
  },

  legalText: {
    ...Typography.captionStyle,
    color: Colors.textTertiary,
    textAlign: "center",
    paddingHorizontal: Spacing.md,
  },
});
