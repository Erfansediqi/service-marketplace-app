import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
} from "react-native";

import { GlassButton } from "../components/glass/glass-button";
import { GlassIconButton } from "../components/glass/glass-icon-button";
import { GlassInput } from "../components/glass/glass-input";
import { GlassSurface } from "../components/glass/glass-surface";
import { AppScreen } from "../components/layout/app-screen";
import {
  Colors,
  Radius,
  Spacing,
  Typography,
} from "../constants/theme";

export default function SignupScreen() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const digits = phoneNumber.replace(/\D/g, "");

  const nameError =
    submitted && fullName.trim().length < 2
      ? "لطفاً نام و نام خانوادگی خود را وارد کنید."
      : undefined;

  const phoneError =
    submitted && digits.length < 7
      ? "لطفاً یک شماره تلفن معتبر وارد کنید."
      : undefined;

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
            label="ارسال کد تأیید"
            onPress={handleSendCode}
          />

          <Text style={styles.legalText}>
            با ادامه، شما{" "}
            <Text style={styles.legalLink}>شرایط استفاده</Text>
            {" "}و{" "}
            <Text style={styles.legalLink}>
              سیاست حفظ حریم خصوصی
            </Text>
            {" "}ما را می‌پذیرید.
          </Text>
        </View>
      }
    >
      <View style={styles.topBar}>
        <GlassIconButton
          accessibilityLabel="بازگشت"
          icon="chevron-back"
          onPress={() => router.back()}
        />
      </View>

      <View style={styles.hero}>
        <GlassSurface
          radius={Radius.xxl}
          style={styles.heroIcon}
          contentStyle={styles.heroIconContent}
          variant="prominent"
        >
          <Text style={styles.heroMark}>خ</Text>
        </GlassSurface>

        <View style={styles.heading}>
          <Text style={styles.eyebrow}>حساب خدمت</Text>

          <Text style={styles.title}>
            حساب کاربری خود را بسازید
          </Text>

          <Text style={styles.subtitle}>
            فقط با وارد کردن نام و شماره تلفن، شروع کنید.
          </Text>
        </View>
      </View>

      <View style={styles.form}>
        <GlassInput
          autoCapitalize="words"
          autoComplete="name"
          error={nameError}
          icon="person-outline"
          label="نام و نام خانوادگی"
          onChangeText={setFullName}
          placeholder="احمد ظاهر"
          returnKeyType="next"
          textContentType="name"
          value={fullName}
        />

        <GlassInput
          autoComplete="tel"
          error={phoneError}
          keyboardType="phone-pad"
          label="شماره تلفن"
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
    alignItems: "flex-start",
  },

  hero: {
    marginTop: Spacing.xxl,
  },

  heroIcon: {
    width: 72,
    height: 72,
    marginBottom: Spacing.xxl,
    alignSelf: "flex-end",
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
    gap: Spacing.sm,
    alignItems: "flex-end",
  },

  eyebrow: {
    ...Typography.captionStyle,
    color: Colors.primary,
    letterSpacing: 1,
    textAlign: "right",
    writingDirection: "rtl",
  },

  title: {
    ...Typography.screenTitle,
    color: Colors.textPrimary,
    textAlign: "right",
    writingDirection: "rtl",
  },

  subtitle: {
    ...Typography.bodyLarge,
    color: Colors.textSecondary,
    maxWidth: 430,
    textAlign: "right",
    writingDirection: "rtl",
  },

  form: {
    width: "100%",
    marginTop: Spacing.screen,
    gap: Spacing.xxl,
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
    gap: Spacing.lg,
    alignItems: "center",
  },

  legalText: {
    ...Typography.captionStyle,
    color: Colors.textTertiary,
    textAlign: "center",
    writingDirection: "rtl",
    maxWidth: 330,
  },

  legalLink: {
    color: Colors.textSecondary,
    fontWeight: "600",
  },
});