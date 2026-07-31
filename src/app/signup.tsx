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
      ? "Enter your full name."
      : undefined;

  const phoneError =
    submitted && digits.length < 7
      ? "Enter a valid phone number."
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
            label="Send verification code"
            onPress={handleSendCode}
          />

          <Text style={styles.legalText}>
            By continuing, you agree to our{" "}
            <Text style={styles.legalLink}>Terms</Text> and{" "}
            <Text style={styles.legalLink}>Privacy Policy</Text>.
          </Text>
        </View>
      }
    >
      <View style={styles.topBar}>
        <GlassIconButton
          accessibilityLabel="Go back"
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
          <Text style={styles.heroMark}>K</Text>
        </GlassSurface>

        <View style={styles.heading}>
          <Text style={styles.eyebrow}>YOUR KHEDMAT ACCOUNT</Text>
          <Text style={styles.title}>Create your account</Text>
          <Text style={styles.subtitle}>
            Enter your name and phone number. We will send a short verification
            code to confirm your account.
          </Text>
        </View>
      </View>

      <View style={styles.form}>
        <GlassInput
          autoCapitalize="words"
          autoComplete="name"
          error={nameError}
          icon="person-outline"
          label="Full name"
          onChangeText={setFullName}
          placeholder="Ahmad Zahir"
          returnKeyType="next"
          textContentType="name"
          value={fullName}
        />

        <GlassInput
          autoComplete="tel"
          error={phoneError}
          keyboardType="phone-pad"
          label="Phone number"
          leadingContent={
            <View style={styles.countryCode}>
              <Text style={styles.countryCodeText}>+93</Text>
              <View style={styles.countryCodeDivider} />
            </View>
          }
          onChangeText={setPhoneNumber}
          placeholder="70 123 4567"
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
    letterSpacing: -1,
  },
  heading: {
    gap: Spacing.sm,
  },
  eyebrow: {
    ...Typography.captionStyle,
    color: Colors.primary,
    letterSpacing: 1.25,
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
    maxWidth: 330,
  },
  legalLink: {
    color: Colors.textSecondary,
    fontWeight: "600",
  },
});