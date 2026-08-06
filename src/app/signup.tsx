import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";

import { KhedmatButton } from "../components/khedmat/khedmat-button";
import { KhedmatCard } from "../components/khedmat/khedmat-card";
import { KhedmatInput } from "../components/khedmat/khedmat-input";
import { KhedmatScreen } from "../components/khedmat/khedmat-screen";
import {
  KhedmatPalette,
  Layout,
  Radius,
  Shadows,
  Spacing,
  Typography,
} from "../constants/theme";
import { useLanguage } from "../context/languagecontext";
import {
  type VerificationChannel,
  useSupabaseAuth,
} from "../context/supabase-auth-context";

export default function SignupScreen() {
  const router = useRouter();

  const { t, language } = useLanguage();

  const { sendPhoneOtp, isSendingOtp } = useSupabaseAuth();

  const isRtl = language === "Dari" || language === "Pashto";

  const usesLocalizedDigits = isRtl;

  const [fullName, setFullName] = useState("");

  const [phoneNumber, setPhoneNumber] = useState("");

  const [verificationChannel, setVerificationChannel] =
    useState<VerificationChannel>("whatsapp");

  const [submitted, setSubmitted] = useState(false);

  const normalizedPhoneNumber = normalizeToEnglishDigits(phoneNumber);

  const digits = normalizedPhoneNumber.replace(/\D/g, "");

  const nationalDigits = normalizeAfghanNationalNumber(digits);

  const verificationCopy = getVerificationMethodCopy(language);

  const nameError =
    submitted && fullName.trim().length < 2 ? t("nameError") : undefined;

  const phoneError =
    submitted && nationalDigits.length !== 9 ? t("phoneError") : undefined;

  const formValid = useMemo(
    () => fullName.trim().length >= 2 && nationalDigits.length === 9,
    [fullName, nationalDigits.length],
  );

  const displayedPhoneNumber = usesLocalizedDigits
    ? toLocalizedDigits(normalizedPhoneNumber)
    : normalizedPhoneNumber;

  const phonePlaceholder = usesLocalizedDigits
    ? toLocalizedDigits("701234567")
    : "701234567";

  const countryCode = usesLocalizedDigits ? toLocalizedDigits("+93") : "+93";

  const handlePhoneChange = (value: string): void => {
    const normalized = normalizeToEnglishDigits(value);

    const numbersOnly = normalized.replace(/\D/g, "");

    setPhoneNumber(numbersOnly);

    if (submitted) {
      setSubmitted(false);
    }
  };

  const handleSendCode = async (): Promise<void> => {
    setSubmitted(true);

    if (!formValid || isSendingOtp) {
      return;
    }

    const phone = `+93${nationalDigits}`;

    try {
      await sendPhoneOtp({
        phone,
        fullName: fullName.trim(),
        preferredLanguage: language,
        channel: verificationChannel,
      });

      router.push({
        pathname: "/verify-code",
        params: {
          fullName: fullName.trim(),
          phone,
          channel: verificationChannel,
        },
      });
    } catch (error) {
      console.error("Failed to send verification code:", error);

      const fallbackMessage =
        verificationChannel === "whatsapp"
          ? verificationCopy.whatsappError
          : verificationCopy.smsError;

      const errorMessage =
        error instanceof Error && error.message
          ? error.message
          : fallbackMessage;

      Alert.alert(verificationCopy.errorTitle, errorMessage);
    }
  };

  const nameIcon = (
    <Ionicons
      name="person-outline"
      size={21}
      color={KhedmatPalette.textMuted}
    />
  );

  const phoneCodeContent = (
    <View
      style={[
        styles.countryCode,
        isRtl ? styles.countryCodeRtl : styles.countryCodeLtr,
      ]}
    >
      <Text style={styles.countryCodeText}>{countryCode}</Text>

      <View style={styles.countryCodeDivider} />
    </View>
  );

  return (
    <KhedmatScreen
      keyboardAware
      scrollable
      contentStyle={styles.screenContent}
      footer={
        <View style={styles.footer}>
          <KhedmatButton
            label={
              verificationChannel === "whatsapp"
                ? verificationCopy.sendWhatsApp
                : verificationCopy.sendSms
            }
            icon={
              verificationChannel === "whatsapp"
                ? "logo-whatsapp"
                : "chatbubble-ellipses-outline"
            }
            loading={isSendingOtp}
            disabled={isSendingOtp || (submitted && !formValid)}
            onPress={handleSendCode}
          />

          <Text
            style={[
              styles.legalText,
              {
                writingDirection: isRtl ? "rtl" : "ltr",
              },
            ]}
          >
            {t("legalTextCombined")}
          </Text>
        </View>
      }
    >
      <View style={styles.topBar}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t("back")}
          onPress={() => router.back()}
          style={({ pressed }) => [
            styles.backButton,
            pressed && styles.backButtonPressed,
          ]}
        >
          <Ionicons
            name={isRtl ? "chevron-forward" : "chevron-back"}
            size={24}
            color={KhedmatPalette.navy900}
          />
        </Pressable>
      </View>

      <View style={styles.hero}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={44} color={KhedmatPalette.white} />
        </View>

        <Text
          style={[
            styles.title,
            {
              writingDirection: isRtl ? "rtl" : "ltr",
            },
          ]}
        >
          {t("createAccountTitle")}
        </Text>
      </View>

      <KhedmatCard
        style={styles.formCard}
        contentStyle={styles.formCardContent}
      >
        <View style={styles.form}>
          <KhedmatInput
            autoCapitalize="words"
            autoComplete="name"
            error={nameError}
            isRtl={isRtl}
            label={t("fullNameLabel")}
            leadingContent={isRtl ? undefined : nameIcon}
            trailingContent={isRtl ? nameIcon : undefined}
            onChangeText={setFullName}
            placeholder={t("fullNamePlaceholder")}
            returnKeyType="next"
            textContentType="name"
            value={fullName}
          />

          <KhedmatInput
            autoComplete="tel"
            error={phoneError}
            isRtl={isRtl}
            keyboardType="phone-pad"
            label={t("phoneLabel")}
            leadingContent={isRtl ? undefined : phoneCodeContent}
            trailingContent={isRtl ? phoneCodeContent : undefined}
            onChangeText={handlePhoneChange}
            placeholder={phonePlaceholder}
            returnKeyType="done"
            textContentType="telephoneNumber"
            value={displayedPhoneNumber}
          />

          <View style={styles.verificationSection}>
            <Text
              style={[
                styles.verificationLabel,
                {
                  textAlign: isRtl ? "right" : "left",
                  writingDirection: isRtl ? "rtl" : "ltr",
                },
              ]}
            >
              {verificationCopy.title}
            </Text>

            <View
              style={[
                styles.verificationOptions,
                {
                  flexDirection: isRtl ? "row-reverse" : "row",
                },
              ]}
            >
              <VerificationMethodButton
                channel="whatsapp"
                icon="logo-whatsapp"
                label={verificationCopy.whatsapp}
                selected={verificationChannel === "whatsapp"}
                disabled={isSendingOtp}
                onPress={() => setVerificationChannel("whatsapp")}
              />

              <VerificationMethodButton
                channel="sms"
                icon="chatbubble-ellipses-outline"
                label={verificationCopy.sms}
                selected={verificationChannel === "sms"}
                disabled={isSendingOtp}
                onPress={() => setVerificationChannel("sms")}
              />
            </View>

            <Text
              style={[
                styles.verificationHint,
                {
                  textAlign: isRtl ? "right" : "left",
                  writingDirection: isRtl ? "rtl" : "ltr",
                },
              ]}
            >
              {verificationChannel === "whatsapp"
                ? verificationCopy.whatsappHint
                : verificationCopy.smsHint}
            </Text>
          </View>
        </View>
      </KhedmatCard>

      <View
        style={[
          styles.securityNote,
          {
            flexDirection: isRtl ? "row-reverse" : "row",
          },
        ]}
      >
        <Ionicons
          name="shield-checkmark-outline"
          size={17}
          color={KhedmatPalette.blue500}
        />

        <Text
          numberOfLines={2}
          adjustsFontSizeToFit
          minimumFontScale={0.78}
          style={[
            styles.securityText,
            {
              textAlign: isRtl ? "right" : "left",
              writingDirection: isRtl ? "rtl" : "ltr",
            },
          ]}
        >
          {getSecurityMessage(language)}
        </Text>
      </View>
    </KhedmatScreen>
  );
}

type VerificationMethodButtonProps = {
  channel: VerificationChannel;
  icon: "logo-whatsapp" | "chatbubble-ellipses-outline";
  label: string;
  selected: boolean;
  disabled: boolean;
  onPress: () => void;
};

function VerificationMethodButton({
  channel,
  icon,
  label,
  selected,
  disabled,
  onPress,
}: VerificationMethodButtonProps) {
  const selectedIconColor =
    channel === "whatsapp" ? KhedmatPalette.success : KhedmatPalette.blue500;

  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityLabel={label}
      accessibilityState={{
        selected,
        disabled,
      }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.verificationOption,
        selected && styles.verificationOptionSelected,
        pressed && !disabled && styles.verificationOptionPressed,
        disabled && styles.verificationOptionDisabled,
      ]}
    >
      <Ionicons
        name={icon}
        size={24}
        color={selected ? selectedIconColor : KhedmatPalette.textMuted}
      />

      <Text
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.8}
        style={[
          styles.verificationOptionText,
          selected && styles.verificationOptionTextSelected,
        ]}
      >
        {label}
      </Text>

      <View
        style={[
          styles.selectionIndicator,
          selected && styles.selectionIndicatorSelected,
        ]}
      >
        {selected ? <View style={styles.selectionIndicatorDot} /> : null}
      </View>
    </Pressable>
  );
}

function normalizeAfghanNationalNumber(value: string): string {
  let normalized = value.replace(/^0+/, "");

  if (normalized.startsWith("93") && normalized.length > 9) {
    normalized = normalized.slice(2).replace(/^0+/, "");
  }

  return normalized;
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

function getVerificationMethodCopy(language: string) {
  if (language === "Dari") {
    return {
      title: "کد تأیید را چگونه دریافت می‌کنید؟",
      whatsapp: "واتساپ",
      sms: "پیامک",
      sendWhatsApp: "ارسال کد از طریق واتساپ",
      sendSms: "ارسال کد از طریق پیامک",
      whatsappHint: "کد شش رقمی به حساب واتساپ این شماره فرستاده می‌شود.",
      smsHint: "کد شش رقمی از طریق پیامک به این شماره فرستاده می‌شود.",
      errorTitle: "ارسال کد ناموفق بود",
      whatsappError:
        "کد واتساپ ارسال نشد. لطفاً دوباره تلاش کنید یا پیامک را انتخاب کنید.",
      smsError: "پیامک ارسال نشد. لطفاً دوباره تلاش کنید.",
    };
  }

  if (language === "Pashto") {
    return {
      title: "د تایید کوډ څنګه ترلاسه کول غواړئ؟",
      whatsapp: "واټساپ",
      sms: "پیغام",
      sendWhatsApp: "کوډ د واټساپ له لارې ولېږئ",
      sendSms: "کوډ د پیغام له لارې ولېږئ",
      whatsappHint: "شپږ عددي کوډ به د دې شمېرې واټساپ ته ولېږل شي.",
      smsHint: "شپږ عددي کوډ به دې شمېرې ته د پیغام له لارې ولېږل شي.",
      errorTitle: "کوډ ونه لېږل شو",
      whatsappError: "د واټساپ کوډ ونه لېږل شو. بیا هڅه وکړئ یا پیغام وټاکئ.",
      smsError: "پیغام ونه لېږل شو. مهرباني وکړئ بیا هڅه وکړئ.",
    };
  }

  return {
    title: "How would you like to receive the verification code?",
    whatsapp: "WhatsApp",
    sms: "SMS",
    sendWhatsApp: "Send code via WhatsApp",
    sendSms: "Send code via SMS",
    whatsappHint: "A six-digit code will be sent to WhatsApp on this number.",
    smsHint: "A six-digit code will be sent to this number by SMS.",
    errorTitle: "Unable to send code",
    whatsappError:
      "The WhatsApp code could not be sent. Try again or select SMS.",
    smsError: "The SMS code could not be sent. Please try again.",
  };
}

function getSecurityMessage(language: string): string {
  if (language === "Dari") {
    return "شماره تماس شما فقط برای تأیید حساب و هماهنگی خدمات استفاده می‌شود.";
  }

  if (language === "Pashto") {
    return "ستاسو د تلیفون شمېره یوازې د حساب د تایید او خدمتونو د همغږۍ لپاره کارول کېږي.";
  }

  return "Your phone number is used only for account verification and service coordination.";
}

const styles = StyleSheet.create({
  screenContent: {
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

  backButtonPressed: {
    opacity: 0.78,
    transform: [
      {
        scale: 0.96,
      },
    ],
  },

  hero: {
    width: "100%",
    marginTop: Spacing.lg,
    alignItems: "center",
  },

  avatar: {
    width: 92,
    height: 92,
    marginBottom: Spacing.xl,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: KhedmatPalette.navy900,
    ...Shadows.darkAccent,
  },

  title: {
    ...Typography.screenTitle,
    width: "100%",
    maxWidth: Layout.readableTextMaxWidth,
    alignSelf: "center",
    color: KhedmatPalette.textPrimary,
    textAlign: "center",
  },

  formCard: {
    marginTop: Spacing.xxl,
  },

  formCardContent: {
    padding: Spacing.lg,
  },

  form: {
    width: "100%",
    gap: Spacing.lg,
  },

  countryCode: {
    height: "100%",
    alignItems: "center",
    gap: Spacing.md,
  },

  countryCodeRtl: {
    flexDirection: "row-reverse",
  },

  countryCodeLtr: {
    flexDirection: "row",
  },

  countryCodeText: {
    ...Typography.label,
    color: KhedmatPalette.navy700,
  },

  countryCodeDivider: {
    width: StyleSheet.hairlineWidth,
    height: 24,
    backgroundColor: KhedmatPalette.border,
  },

  verificationSection: {
    width: "100%",
    gap: Spacing.sm,
  },

  verificationLabel: {
    ...Typography.label,
    width: "100%",
    color: KhedmatPalette.textPrimary,
  },

  verificationOptions: {
    width: "100%",
    gap: Spacing.sm,
  },

  verificationOption: {
    flex: 1,
    minHeight: 62,
    paddingHorizontal: Spacing.sm,
    borderWidth: 1,
    borderColor: KhedmatPalette.border,
    borderRadius: Radius.md,
    backgroundColor: KhedmatPalette.surfaceSoft,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.xs,
    position: "relative",
  },

  verificationOptionSelected: {
    borderColor: KhedmatPalette.blue500,
    borderWidth: 2,
    backgroundColor: KhedmatPalette.surface,
  },

  verificationOptionPressed: {
    opacity: 0.8,
    transform: [
      {
        scale: 0.98,
      },
    ],
  },

  verificationOptionDisabled: {
    opacity: 0.55,
  },

  verificationOptionText: {
    ...Typography.captionStyle,
    color: KhedmatPalette.textSecondary,
    textAlign: "center",
    fontWeight: "600",
  },

  verificationOptionTextSelected: {
    color: KhedmatPalette.navy700,
  },

  selectionIndicator: {
    position: "absolute",
    top: 7,
    right: 7,
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: KhedmatPalette.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: KhedmatPalette.surface,
  },

  selectionIndicatorSelected: {
    borderColor: KhedmatPalette.blue500,
  },

  selectionIndicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: KhedmatPalette.blue500,
  },

  verificationHint: {
    ...Typography.captionStyle,
    width: "100%",
    color: KhedmatPalette.textMuted,
    lineHeight: 18,
  },

  securityNote: {
    width: "100%",
    marginTop: Spacing.lg,
    alignItems: "center",
    gap: Spacing.sm,
    paddingHorizontal: 2,
  },

  securityText: {
    ...Typography.captionStyle,
    flex: 1,
    color: KhedmatPalette.textSecondary,
    lineHeight: 18,
  },

  footer: {
    width: "100%",
    gap: Spacing.sm,
    alignItems: "center",
  },

  legalText: {
    ...Typography.captionStyle,
    width: "100%",
    maxWidth: Layout.readableTextMaxWidth,
    alignSelf: "center",
    color: KhedmatPalette.textMuted,
    lineHeight: 17,
    textAlign: "center",
  },
});
