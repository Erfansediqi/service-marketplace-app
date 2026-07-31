import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { GlassButton } from "../components/glass/glass-button";
import { GlassIconButton } from "../components/glass/glass-icon-button";
import { GlassOtpInput } from "../components/glass/glass-otp-input";
import { GlassSurface } from "../components/glass/glass-surface";
import { AppScreen } from "../components/layout/app-screen";
import {
  Colors,
  Radius,
  Spacing,
  Typography,
} from "../constants/theme";

const CODE_LENGTH = 4;
const RESEND_SECONDS = 30;

export default function VerifyCodeScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ phone?: string }>();

  const [code, setCode] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [secondsRemaining, setSecondsRemaining] =
    useState(RESEND_SECONDS);

  const phone =
    typeof params.phone === "string" && params.phone.trim()
      ? params.phone
      : "+93 70 123 4567";

  const validCode = useMemo(
    () => code.length === CODE_LENGTH,
    [code.length],
  );

  useEffect(() => {
    if (secondsRemaining <= 0) {
      return;
    }

    const timer = setTimeout(() => {
      setSecondsRemaining((current) => current - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [secondsRemaining]);

  const handleVerify = () => {
    setSubmitted(true);

    if (!validCode) {
      return;
    }

    router.replace("/explore");
  };

  const handleResend = () => {
    if (secondsRemaining > 0) {
      return;
    }

    setCode("");
    setSubmitted(false);
    setSecondsRemaining(RESEND_SECONDS);

    // Connect the real resend-code API here later.
  };

  return (
    <AppScreen
      keyboardAware
      contentStyle={styles.screenContent}
      footer={
        <View style={styles.footer}>
          <GlassButton
            disabled={!validCode && submitted}
            icon="arrow-forward"
            label="Verify and continue"
            onPress={handleVerify}
          />

          <Pressable
            accessibilityRole="button"
            hitSlop={10}
            onPress={() => router.back()}
          >
            <Text style={styles.changeNumber}>Change phone number</Text>
          </Pressable>
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

      <View style={styles.main}>
        <GlassSurface
          radius={Radius.xxl}
          style={styles.heroIcon}
          contentStyle={styles.heroIconContent}
          variant="prominent"
        >
          <Text style={styles.shield}>✓</Text>
        </GlassSurface>

        <View style={styles.heading}>
          <Text style={styles.eyebrow}>PHONE VERIFICATION</Text>
          <Text style={styles.title}>Enter the code</Text>

          <Text style={styles.subtitle}>
            We sent a {CODE_LENGTH}-digit verification code to{" "}
            <Text style={styles.phone}>{phone}</Text>.
          </Text>
        </View>

        <View style={styles.codeSection}>
          <GlassOtpInput
            autoFocus
            error={
              submitted && !validCode
                ? `Enter the complete ${CODE_LENGTH}-digit code.`
                : undefined
            }
            length={CODE_LENGTH}
            onChange={(value) => {
              setCode(value);

              if (submitted) {
                setSubmitted(false);
              }
            }}
            value={code}
          />

          <View style={styles.resendRow}>
            <Text style={styles.resendPrompt}>
              Didn&apos;t receive the code?
            </Text>

            <Pressable
              accessibilityRole="button"
              disabled={secondsRemaining > 0}
              hitSlop={8}
              onPress={handleResend}
            >
              <Text
                style={[
                  styles.resendAction,
                  secondsRemaining > 0 && styles.resendDisabled,
                ]}
              >
                {secondsRemaining > 0
                  ? `Resend in ${secondsRemaining}s`
                  : "Resend code"}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  screenContent: {
    paddingTop: Spacing.md,
  },
  topBar: {
    minHeight: 44,
    alignItems: "flex-start",
  },
  main: {
    flex: 1,
    justifyContent: "center",
    paddingBottom: Spacing.hero,
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
  shield: {
    color: Colors.primary,
    fontSize: 30,
    lineHeight: 34,
    fontWeight: "700",
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
  phone: {
    color: Colors.textPrimary,
    fontWeight: "600",
  },
  codeSection: {
    marginTop: Spacing.screen,
    gap: Spacing.xxl,
  },
  resendRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: Spacing.xs,
  },
  resendPrompt: {
    ...Typography.captionStyle,
    color: Colors.textTertiary,
  },
  resendAction: {
    ...Typography.captionStyle,
    color: Colors.primary,
    fontWeight: "600",
  },
  resendDisabled: {
    color: Colors.textMuted,
  },
  footer: {
    gap: Spacing.xl,
    alignItems: "center",
  },
  changeNumber: {
    ...Typography.label,
    color: Colors.textSecondary,
  },
});