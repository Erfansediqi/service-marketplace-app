import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { KhedmatButton } from "../components/khedmat/khedmat-button";
import { KhedmatCard } from "../components/khedmat/khedmat-card";
import { KhedmatScreen } from "../components/khedmat/khedmat-screen";
import {
  Fonts,
  KhedmatPalette,
  Layout,
  Radius,
  Shadows,
  Spacing,
  Typography,
} from "../constants/theme";
import { useCustomerProfile } from "../context/customer-profile-context";
import { useLanguage } from "../context/languagecontext";
import {
  type VerificationChannel,
  useSupabaseAuth,
} from "../context/supabase-auth-context";
import { ProfileRepository } from "../repositories/profile-repository";

const CODE_LENGTH = 6;
const RESEND_SECONDS = 60;

export default function VerifyCodeScreen() {
  const router = useRouter();

  const params = useLocalSearchParams<{
    fullName?: string;
    phone?: string;
    channel?: string;
  }>();

  const { saveSignupProfile } = useCustomerProfile();

  const { verifyPhoneOtp, sendPhoneOtp, isVerifyingOtp, isSendingOtp } =
    useSupabaseAuth();

  const { language } = useLanguage();

  const isRtl = language === "Dari" || language === "Pashto";

  const inputRef = useRef<TextInput>(null);

  const [code, setCode] = useState("");

  const [submitted, setSubmitted] = useState(false);

  const [secondsRemaining, setSecondsRemaining] = useState(RESEND_SECONDS);

  const [verificationChannel, setVerificationChannel] =
    useState<VerificationChannel>(() =>
      normalizeVerificationChannel(params.channel),
    );

  const fullName =
    typeof params.fullName === "string" ? params.fullName.trim() : "";

  const phone = typeof params.phone === "string" ? params.phone.trim() : "";

  const validCode = useMemo(() => code.length === CODE_LENGTH, [code.length]);

  const copy = getVerificationCopy(language);

  useEffect(() => {
    if (secondsRemaining <= 0) {
      return;
    }

    const timer = setTimeout(() => {
      setSecondsRemaining((current) => current - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [secondsRemaining]);

  const handleCodeChange = (value: string): void => {
    const normalized = normalizeToEnglishDigits(value).replace(/\D/g, "");

    const limited = normalized.slice(0, CODE_LENGTH);

    setCode(limited);

    if (submitted) {
      setSubmitted(false);
    }
  };

  const handleVerify = async (): Promise<void> => {
    setSubmitted(true);

    if (!validCode || isVerifyingOtp) {
      return;
    }

    if (!fullName || !phone) {
      Alert.alert(copy.missingSignupTitle, copy.missingSignupMessage);

      return;
    }

    try {
      const authenticatedSession = await verifyPhoneOtp({
        phone,
        token: code,
      });

      await saveSignupProfile({
        fullName,
        phoneNumber: phone,
      });

      try {
        await ProfileRepository.fetchRemoteProfile(
          authenticatedSession.user.id,
        );
      } catch (profileError) {
        console.warn(
          "Authentication succeeded, but the remote profile could not be cached:",
          profileError,
        );
      }

      router.replace("/location-permission");
    } catch (error) {
      console.error("Failed to verify the phone code:", error);

      const message =
        error instanceof Error && error.message
          ? error.message
          : copy.verificationErrorMessage;

      Alert.alert(copy.verificationErrorTitle, message);
    }
  };

  const handleResend = async (
    nextChannel: VerificationChannel,
  ): Promise<void> => {
    if (secondsRemaining > 0 || isSendingOtp) {
      return;
    }

    if (!fullName || !phone) {
      Alert.alert(copy.missingSignupTitle, copy.missingSignupMessage);

      return;
    }

    try {
      await sendPhoneOtp({
        phone,
        fullName,
        preferredLanguage: language,
        channel: nextChannel,
      });

      setVerificationChannel(nextChannel);
      setCode("");
      setSubmitted(false);
      setSecondsRemaining(RESEND_SECONDS);

      inputRef.current?.focus();
    } catch (error) {
      console.error("Failed to resend verification code:", error);

      const fallbackMessage =
        nextChannel === "whatsapp"
          ? copy.whatsappResendError
          : copy.smsResendError;

      const message =
        error instanceof Error && error.message
          ? error.message
          : fallbackMessage;

      Alert.alert(copy.resendErrorTitle, message);
    }
  };

  const formattedPhone = isRtl ? toLocalizedDigits(phone || "—") : phone || "—";

  const formattedSeconds = isRtl
    ? toLocalizedDigits(secondsRemaining.toString())
    : secondsRemaining.toString();

  const displayedCode = isRtl ? toLocalizedDigits(code) : code;

  const activeChannelLabel =
    verificationChannel === "whatsapp" ? copy.whatsapp : copy.sms;

  const alternateChannel: VerificationChannel =
    verificationChannel === "whatsapp" ? "sms" : "whatsapp";

  const alternateChannelLabel =
    alternateChannel === "whatsapp" ? copy.whatsapp : copy.sms;

  return (
    <KhedmatScreen
      keyboardAware
      scrollable
      contentStyle={styles.screenContent}
      footer={
        <View style={styles.footer}>
          <KhedmatButton
            label={copy.verifyButton}
            loading={isVerifyingOtp}
            disabled={isVerifyingOtp || (submitted && !validCode)}
            onPress={handleVerify}
          />

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={copy.changeNumber}
            hitSlop={10}
            onPress={() => router.back()}
            style={({ pressed }) => [
              styles.changeNumberButton,
              pressed && styles.pressed,
            ]}
          >
            <Text
              style={[
                styles.changeNumber,
                {
                  writingDirection: isRtl ? "rtl" : "ltr",
                },
              ]}
            >
              {copy.changeNumber}
            </Text>
          </Pressable>
        </View>
      }
    >
      <View style={styles.topBar}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={copy.back}
          onPress={() => router.back()}
          style={({ pressed }) => [
            styles.backButton,
            pressed && styles.pressed,
          ]}
        >
          <Ionicons
            name={isRtl ? "chevron-forward" : "chevron-back"}
            size={24}
            color={KhedmatPalette.navy900}
          />
        </Pressable>
      </View>

      <View style={styles.main}>
        <View style={styles.iconCircle}>
          <Ionicons
            name={
              verificationChannel === "whatsapp"
                ? "logo-whatsapp"
                : "shield-checkmark"
            }
            size={46}
            color={KhedmatPalette.white}
          />
        </View>

        <View style={styles.heading}>
          <Text
            style={[
              styles.title,
              {
                writingDirection: isRtl ? "rtl" : "ltr",
              },
            ]}
          >
            {copy.title}
          </Text>

          <Text
            style={[
              styles.subtitle,
              {
                writingDirection: isRtl ? "rtl" : "ltr",
              },
            ]}
          >
            {copy.subtitlePrefix}{" "}
            <Text style={styles.channelName}>{activeChannelLabel}</Text>{" "}
            {copy.subtitleMiddle}{" "}
            <Text style={styles.phone}>{formattedPhone}</Text>
            {copy.subtitleSuffix}
          </Text>
        </View>

        <KhedmatCard
          style={styles.codeCard}
          contentStyle={styles.codeCardContent}
        >
          <View
            style={[
              styles.channelBadge,
              {
                flexDirection: isRtl ? "row-reverse" : "row",
              },
            ]}
          >
            <Ionicons
              name={
                verificationChannel === "whatsapp"
                  ? "logo-whatsapp"
                  : "chatbubble-ellipses-outline"
              }
              size={18}
              color={
                verificationChannel === "whatsapp"
                  ? KhedmatPalette.success
                  : KhedmatPalette.blue500
              }
            />

            <Text
              style={[
                styles.channelBadgeText,
                {
                  writingDirection: isRtl ? "rtl" : "ltr",
                },
              ]}
            >
              {copy.sentVia} {activeChannelLabel}
            </Text>
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={copy.codeInputLabel}
            onPress={() => inputRef.current?.focus()}
            style={styles.codeBoxes}
          >
            {Array.from({
              length: CODE_LENGTH,
            }).map((_, index) => {
              const digit = displayedCode[index] ?? "";

              const active =
                code.length === index ||
                (code.length === CODE_LENGTH && index === CODE_LENGTH - 1);

              return (
                <View
                  key={index}
                  style={[
                    styles.codeBox,
                    active && styles.codeBoxActive,
                    submitted && !validCode && styles.codeBoxError,
                  ]}
                >
                  <Text style={styles.codeDigit}>{digit}</Text>
                </View>
              );
            })}
          </Pressable>

          <TextInput
            ref={inputRef}
            value={code}
            autoFocus
            caretHidden
            keyboardType="number-pad"
            maxLength={CODE_LENGTH}
            textContentType="oneTimeCode"
            autoComplete="one-time-code"
            onChangeText={handleCodeChange}
            style={styles.hiddenInput}
          />

          {submitted && !validCode ? (
            <View style={styles.errorRow}>
              <Ionicons
                name="alert-circle-outline"
                size={15}
                color={KhedmatPalette.error}
              />

              <Text
                style={[
                  styles.errorText,
                  {
                    textAlign: isRtl ? "right" : "left",
                    writingDirection: isRtl ? "rtl" : "ltr",
                  },
                ]}
              >
                {copy.codeError}
              </Text>
            </View>
          ) : null}

          <View style={styles.resendSection}>
            <View
              style={[
                styles.resendRow,
                {
                  flexDirection: isRtl ? "row-reverse" : "row",
                },
              ]}
            >
              <Text
                style={[
                  styles.resendPrompt,
                  {
                    writingDirection: isRtl ? "rtl" : "ltr",
                  },
                ]}
              >
                {copy.didNotReceive}
              </Text>

              <Text
                style={[
                  styles.resendCountdown,
                  secondsRemaining === 0 && styles.resendReady,
                  {
                    writingDirection: isRtl ? "rtl" : "ltr",
                  },
                ]}
              >
                {secondsRemaining > 0
                  ? `${copy.resendIn} ${formattedSeconds} ${copy.seconds}`
                  : copy.resendReady}
              </Text>
            </View>

            <View
              style={[
                styles.channelActions,
                {
                  flexDirection: isRtl ? "row-reverse" : "row",
                },
              ]}
            >
              <ChannelAction
                icon={
                  verificationChannel === "whatsapp"
                    ? "logo-whatsapp"
                    : "chatbubble-ellipses-outline"
                }
                label={`${copy.resendVia} ${activeChannelLabel}`}
                disabled={secondsRemaining > 0 || isSendingOtp}
                loading={isSendingOtp}
                onPress={() => void handleResend(verificationChannel)}
              />

              <ChannelAction
                icon={
                  alternateChannel === "whatsapp"
                    ? "logo-whatsapp"
                    : "chatbubble-ellipses-outline"
                }
                label={`${copy.useInstead} ${alternateChannelLabel}`}
                disabled={secondsRemaining > 0 || isSendingOtp}
                loading={false}
                onPress={() => void handleResend(alternateChannel)}
              />
            </View>
          </View>
        </KhedmatCard>
      </View>
    </KhedmatScreen>
  );
}

type ChannelActionProps = {
  icon: "logo-whatsapp" | "chatbubble-ellipses-outline";
  label: string;
  disabled: boolean;
  loading: boolean;
  onPress: () => void;
};

function ChannelAction({
  icon,
  label,
  disabled,
  loading,
  onPress,
}: ChannelActionProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{
        disabled,
        busy: loading,
      }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.channelAction,
        pressed && !disabled && styles.channelActionPressed,
        disabled && styles.channelActionDisabled,
      ]}
    >
      <Ionicons name={icon} size={18} color={KhedmatPalette.blue500} />

      <Text
        numberOfLines={2}
        adjustsFontSizeToFit
        minimumFontScale={0.82}
        style={styles.channelActionText}
      >
        {label}
      </Text>
    </Pressable>
  );
}

type VerificationCopy = {
  back: string;
  title: string;
  subtitlePrefix: string;
  subtitleMiddle: string;
  subtitleSuffix: string;
  sentVia: string;
  whatsapp: string;
  sms: string;
  codeInputLabel: string;
  codeError: string;
  didNotReceive: string;
  resendIn: string;
  seconds: string;
  resendReady: string;
  resendVia: string;
  useInstead: string;
  verifyButton: string;
  changeNumber: string;
  missingSignupTitle: string;
  missingSignupMessage: string;
  verificationErrorTitle: string;
  verificationErrorMessage: string;
  resendErrorTitle: string;
  whatsappResendError: string;
  smsResendError: string;
};

function getVerificationCopy(language: string): VerificationCopy {
  if (language === "Dari") {
    return {
      back: "بازگشت",
      title: "کد تأیید را وارد کنید",
      subtitlePrefix: "یک کد شش رقمی از طریق",
      subtitleMiddle: "به شماره",
      subtitleSuffix: " ارسال شده است.",
      sentVia: "ارسال‌شده از طریق",
      whatsapp: "واتساپ",
      sms: "پیامک",
      codeInputLabel: "ورود کد تأیید",
      codeError: "لطفاً کد شش رقمی را کامل وارد کنید.",
      didNotReceive: "کد را دریافت نکردید؟",
      resendIn: "ارسال دوباره در",
      seconds: "ثانیه",
      resendReady: "اکنون می‌توانید دوباره ارسال کنید",
      resendVia: "ارسال دوباره از طریق",
      useInstead: "استفاده از",
      verifyButton: "تأیید و ادامه",
      changeNumber: "تغییر شماره تلفن",
      missingSignupTitle: "اطلاعات ثبت‌نام موجود نیست",
      missingSignupMessage:
        "لطفاً به صفحه ثبت‌نام برگردید و نام و شماره تلفن خود را دوباره وارد کنید.",
      verificationErrorTitle: "تأیید ناموفق بود",
      verificationErrorMessage: "کد تأیید نادرست یا منقضی شده است.",
      resendErrorTitle: "ارسال دوباره ناموفق بود",
      whatsappResendError:
        "کد واتساپ ارسال نشد. لطفاً دوباره تلاش کنید یا پیامک را انتخاب کنید.",
      smsResendError: "پیامک ارسال نشد. لطفاً دوباره تلاش کنید.",
    };
  }

  if (language === "Pashto") {
    return {
      back: "بېرته",
      title: "د تایید کوډ دننه کړئ",
      subtitlePrefix: "شپږ عددي کوډ د",
      subtitleMiddle: "له لارې دې شمېرې ته لېږل شوی",
      subtitleSuffix: ".",
      sentVia: "د لېږلو لاره",
      whatsapp: "واټساپ",
      sms: "پیغام",
      codeInputLabel: "د تایید کوډ دننه کړئ",
      codeError: "مهرباني وکړئ بشپړ شپږ عددي کوډ دننه کړئ.",
      didNotReceive: "کوډ مو ترلاسه نه کړ؟",
      resendIn: "بیا لېږل په",
      seconds: "ثانیو کې",
      resendReady: "اوس یې بیا لېږلی شئ",
      resendVia: "بیا ولېږئ د",
      useInstead: "پر ځای وکاروئ",
      verifyButton: "تایید او دوام",
      changeNumber: "د تلیفون شمېره بدله کړئ",
      missingSignupTitle: "د نوم‌لیکنې معلومات نشته",
      missingSignupMessage:
        "بېرته نوم‌لیکنې ته لاړ شئ او خپل نوم او د تلیفون شمېره بیا دننه کړئ.",
      verificationErrorTitle: "تایید ناکام شو",
      verificationErrorMessage: "د تایید کوډ ناسم دی یا وخت یې تېر شوی.",
      resendErrorTitle: "کوډ بیا ونه لېږل شو",
      whatsappResendError:
        "د واټساپ کوډ ونه لېږل شو. بیا هڅه وکړئ یا پیغام وټاکئ.",
      smsResendError: "پیغام ونه لېږل شو. مهرباني وکړئ بیا هڅه وکړئ.",
    };
  }

  return {
    back: "Go back",
    title: "Enter the code",
    subtitlePrefix: "We sent a six-digit code via",
    subtitleMiddle: "to",
    subtitleSuffix: ".",
    sentVia: "Sent via",
    whatsapp: "WhatsApp",
    sms: "SMS",
    codeInputLabel: "Enter verification code",
    codeError: "Enter the complete six-digit code.",
    didNotReceive: "Didn’t receive the code?",
    resendIn: "Resend in",
    seconds: "seconds",
    resendReady: "You can resend now",
    resendVia: "Resend via",
    useInstead: "Use instead:",
    verifyButton: "Verify and continue",
    changeNumber: "Change phone number",
    missingSignupTitle: "Signup information missing",
    missingSignupMessage:
      "Return to signup and enter your name and phone number again.",
    verificationErrorTitle: "Verification failed",
    verificationErrorMessage: "The verification code is invalid or expired.",
    resendErrorTitle: "Unable to resend code",
    whatsappResendError:
      "The WhatsApp code could not be sent. Try again or select SMS.",
    smsResendError: "The SMS code could not be sent. Please try again.",
  };
}

function normalizeVerificationChannel(value: unknown): VerificationChannel {
  return value === "sms" ? "sms" : "whatsapp";
}

function normalizeToEnglishDigits(value: string): string {
  const persianDigits = "۰۱۲۳۴۵۶۷۸۹";

  const arabicDigits = "٠١٢٣٤٥٦٧٨٩";

  return value
    .replace(/[۰-۹]/g, (digit) => String(persianDigits.indexOf(digit)))
    .replace(/[٠-٩]/g, (digit) => String(arabicDigits.indexOf(digit)));
}

function toLocalizedDigits(value: string): string {
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

  return value.replace(/\d/g, (digit) => digits[digit] ?? digit);
}

const styles = StyleSheet.create({
  screenContent: {
    flex: 1,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xxl,
  },

  topBar: {
    width: "100%",
    minHeight: Layout.minimumTouchTarget,
    alignItems: "flex-start",
  },

  backButton: {
    width: 44,
    height: 44,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: KhedmatPalette.surface,
    borderWidth: 1,
    borderColor: KhedmatPalette.border,
  },

  main: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: Spacing.screen,
  },

  iconCircle: {
    width: 92,
    height: 92,
    marginBottom: Spacing.xl,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: KhedmatPalette.navy900,
    ...Shadows.darkAccent,
  },

  heading: {
    width: "100%",
    maxWidth: Layout.readableTextMaxWidth,
    alignItems: "center",
    gap: Spacing.sm,
  },

  title: {
    ...Typography.screenTitle,
    width: "100%",
    color: KhedmatPalette.textPrimary,
    textAlign: "center",
  },

  subtitle: {
    ...Typography.bodyStyle,
    width: "100%",
    color: KhedmatPalette.textSecondary,
    textAlign: "center",
    lineHeight: 24,
  },

  channelName: {
    color: KhedmatPalette.blue500,
    fontFamily: Fonts.medium,
  },

  phone: {
    color: KhedmatPalette.navy700,
    fontFamily: Fonts.medium,
  },

  codeCard: {
    marginTop: Spacing.xxl,
  },

  codeCardContent: {
    padding: Spacing.lg,
    gap: Spacing.lg,
  },

  channelBadge: {
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.pill,
    backgroundColor: KhedmatPalette.surfaceSoft,
  },

  channelBadgeText: {
    ...Typography.captionStyle,
    color: KhedmatPalette.textSecondary,
    fontFamily: Fonts.medium,
  },

  codeBoxes: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
  },

  codeBox: {
    width: 43,
    height: 58,
    borderRadius: Radius.lg,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: KhedmatPalette.surface,
    borderWidth: 1,
    borderColor: KhedmatPalette.border,
  },

  codeBoxActive: {
    borderWidth: 2,
    borderColor: KhedmatPalette.blue500,
    backgroundColor: KhedmatPalette.surfaceSoft,
  },

  codeBoxError: {
    borderColor: KhedmatPalette.error,
    backgroundColor: KhedmatPalette.errorSoft,
  },

  codeDigit: {
    fontFamily: Fonts.bold,
    fontSize: 22,
    lineHeight: 28,
    color: KhedmatPalette.textPrimary,
    textAlign: "center",
  },

  hiddenInput: {
    position: "absolute",
    width: 1,
    height: 1,
    opacity: 0,
  },

  errorRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },

  errorText: {
    ...Typography.captionStyle,
    flexShrink: 1,
    color: KhedmatPalette.error,
  },

  resendSection: {
    width: "100%",
    gap: Spacing.md,
  },

  resendRow: {
    width: "100%",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.xs,
  },

  resendPrompt: {
    ...Typography.captionStyle,
    color: KhedmatPalette.textSecondary,
  },

  resendCountdown: {
    ...Typography.captionStyle,
    color: KhedmatPalette.textMuted,
    fontFamily: Fonts.medium,
  },

  resendReady: {
    color: KhedmatPalette.success,
  },

  channelActions: {
    width: "100%",
    gap: Spacing.sm,
  },

  channelAction: {
    flex: 1,
    minHeight: 54,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: KhedmatPalette.blue200,
    backgroundColor: KhedmatPalette.surface,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.xs,
  },

  channelActionPressed: {
    opacity: 0.78,
    transform: [
      {
        scale: 0.98,
      },
    ],
  },

  channelActionDisabled: {
    opacity: 0.45,
  },

  channelActionText: {
    ...Typography.captionStyle,
    color: KhedmatPalette.navy700,
    fontFamily: Fonts.medium,
    textAlign: "center",
    lineHeight: 16,
  },

  footer: {
    width: "100%",
    gap: Spacing.md,
    alignItems: "center",
  },

  changeNumberButton: {
    minHeight: Layout.minimumTouchTarget,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.md,
  },

  changeNumber: {
    ...Typography.label,
    color: KhedmatPalette.navy700,
    textAlign: "center",
  },

  pressed: {
    opacity: 0.75,
  },
});
