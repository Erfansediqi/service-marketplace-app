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
import { useSupabaseAuth } from "../context/supabase-auth-context";

type SupportedCountry = "afghanistan" | "india";

const COUNTRY_CONFIG = {
  afghanistan: {
    dialCode: "+93",
    dialDigits: "93",
    nationalLength: 9,
    placeholder: "701234567",
  },
  india: {
    dialCode: "+91",
    dialDigits: "91",
    nationalLength: 10,
    placeholder: "9876543210",
  },
} as const;

export default function SignupScreen() {
  const router = useRouter();

  const { t, language } = useLanguage();

  const { sendPhoneOtp, isSendingOtp } = useSupabaseAuth();

  const isRtl = language === "Dari" || language === "Pashto";

  const usesLocalizedDigits = isRtl;

  const [fullName, setFullName] = useState("");

  const [phoneNumber, setPhoneNumber] = useState("");

  const [selectedCountry, setSelectedCountry] =
    useState<SupportedCountry>("afghanistan");

  const [submitted, setSubmitted] = useState(false);

  const selectedCountryConfig = COUNTRY_CONFIG[selectedCountry];

  const normalizedPhoneNumber = normalizeToEnglishDigits(phoneNumber);

  const digits = normalizedPhoneNumber.replace(/\D/g, "");

  const nationalDigits = normalizeNationalNumber(digits, selectedCountry);

  const verificationCopy = getSmsVerificationCopy(language);

  const countryCopy = getCountryCopy(language);

  const nameError =
    submitted && fullName.trim().length < 2 ? t("nameError") : undefined;

  const phoneError =
    submitted && nationalDigits.length !== selectedCountryConfig.nationalLength
      ? getPhoneErrorMessage(language, selectedCountryConfig.nationalLength)
      : undefined;

  const formValid = useMemo(
    () =>
      fullName.trim().length >= 2 &&
      nationalDigits.length === selectedCountryConfig.nationalLength,
    [fullName, nationalDigits.length, selectedCountryConfig.nationalLength],
  );

  const displayDigits = (value: string): string =>
    usesLocalizedDigits ? toLocalizedDigits(value) : value;

  const displayedPhoneNumber = displayDigits(normalizedPhoneNumber);

  const phonePlaceholder = displayDigits(selectedCountryConfig.placeholder);

  const countryCode = displayDigits(selectedCountryConfig.dialCode);

  const handleCountryChange = (country: SupportedCountry): void => {
    if (country === selectedCountry) {
      return;
    }

    setSelectedCountry(country);
    setPhoneNumber("");
    setSubmitted(false);
  };

  const handlePhoneChange = (value: string): void => {
    const normalized = normalizeToEnglishDigits(value);

    const nationalNumber = normalizeNationalNumber(normalized, selectedCountry);

    setPhoneNumber(nationalNumber);

    if (submitted) {
      setSubmitted(false);
    }
  };

  const handleSendCode = async (): Promise<void> => {
    setSubmitted(true);

    if (!formValid || isSendingOtp) {
      return;
    }

    const phone = `${selectedCountryConfig.dialCode}${nationalDigits}`;

    try {
      await sendPhoneOtp({
        phone,
        fullName: fullName.trim(),
        preferredLanguage: language,
        channel: "sms",
      });

      router.push({
        pathname: "/verify-code",
        params: {
          fullName: fullName.trim(),
          phone,
          channel: "sms",
        },
      });
    } catch (error) {
      console.error("Failed to send verification code:", error);

      const errorMessage =
        error instanceof Error && error.message
          ? error.message
          : verificationCopy.smsError;

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
            label={verificationCopy.sendSms}
            icon="chatbubble-ellipses-outline"
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

          <View
            accessibilityRole="radiogroup"
            style={[
              styles.countrySelector,
              {
                flexDirection: isRtl ? "row-reverse" : "row",
              },
            ]}
          >
            <CountryOptionButton
              label={`${countryCopy.afghanistan} ${displayDigits(
                COUNTRY_CONFIG.afghanistan.dialCode,
              )}`}
              selected={selectedCountry === "afghanistan"}
              disabled={isSendingOtp}
              onPress={() => handleCountryChange("afghanistan")}
            />

            <CountryOptionButton
              label={`${countryCopy.india} ${displayDigits(
                COUNTRY_CONFIG.india.dialCode,
              )}`}
              selected={selectedCountry === "india"}
              disabled={isSendingOtp}
              onPress={() => handleCountryChange("india")}
            />
          </View>

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
            <View
              style={[
                styles.smsHeader,
                {
                  flexDirection: isRtl ? "row-reverse" : "row",
                },
              ]}
            >
              <Ionicons
                name="chatbubble-ellipses-outline"
                size={20}
                color={KhedmatPalette.blue500}
              />

              <Text
                style={[
                  styles.verificationLabel,
                  {
                    textAlign: isRtl ? "right" : "left",
                    writingDirection: isRtl ? "rtl" : "ltr",
                  },
                ]}
              >
                {verificationCopy.smsOnlyTitle}
              </Text>
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
              {verificationCopy.smsHint}
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

type CountryOptionButtonProps = {
  label: string;
  selected: boolean;
  disabled: boolean;
  onPress: () => void;
};

function CountryOptionButton({
  label,
  selected,
  disabled,
  onPress,
}: CountryOptionButtonProps) {
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
        styles.countryOption,
        selected && styles.countryOptionSelected,
        pressed && !disabled && styles.countryOptionPressed,
        disabled && styles.countryOptionDisabled,
      ]}
    >
      <Text
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.8}
        style={[
          styles.countryOptionText,
          selected && styles.countryOptionTextSelected,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function normalizeNationalNumber(
  value: string,
  country: SupportedCountry,
): string {
  const config = COUNTRY_CONFIG[country];

  let normalized = normalizeToEnglishDigits(value).replace(/\D/g, "");

  if (
    normalized.startsWith(config.dialDigits) &&
    normalized.length > config.nationalLength
  ) {
    normalized = normalized.slice(config.dialDigits.length);
  }

  normalized = normalized.replace(/^0+/, "");

  return normalized.slice(0, config.nationalLength);
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

function getCountryCopy(language: string) {
  if (language === "Dari" || language === "Pashto") {
    return {
      afghanistan: "افغانستان",
      india: "هند",
    };
  }

  return {
    afghanistan: "Afghanistan",
    india: "India",
  };
}

function getPhoneErrorMessage(
  language: string,
  nationalLength: number,
): string {
  const localizedLength =
    language === "Dari" || language === "Pashto"
      ? toLocalizedDigits(String(nationalLength))
      : String(nationalLength);

  if (language === "Dari") {
    return `یک شماره تماس معتبر ${localizedLength} رقمی وارد کنید.`;
  }

  if (language === "Pashto") {
    return `یو معتبر ${localizedLength} عددي تلیفون شمېره دننه کړئ.`;
  }

  return `Enter a valid ${localizedLength}-digit phone number.`;
}

function getSmsVerificationCopy(language: string) {
  if (language === "Dari") {
    return {
      smsOnlyTitle: "تأیید از طریق پیامک",
      sendSms: "ارسال کد از طریق پیامک",
      smsHint: "کد شش رقمی از طریق پیامک به این شماره فرستاده می‌شود.",
      errorTitle: "ارسال کد ناموفق بود",
      smsError: "پیامک ارسال نشد. لطفاً دوباره تلاش کنید.",
    };
  }

  if (language === "Pashto") {
    return {
      smsOnlyTitle: "د پیغام له لارې تایید",
      sendSms: "کوډ د پیغام له لارې ولېږئ",
      smsHint: "شپږ عددي کوډ به دې شمېرې ته د پیغام له لارې ولېږل شي.",
      errorTitle: "کوډ ونه لېږل شو",
      smsError: "پیغام ونه لېږل شو. مهرباني وکړئ بیا هڅه وکړئ.",
    };
  }

  return {
    smsOnlyTitle: "Verification by SMS",
    sendSms: "Send code via SMS",
    smsHint: "A six-digit code will be sent to this number by SMS.",
    errorTitle: "Unable to send code",
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

  countrySelector: {
    width: "100%",
    gap: Spacing.sm,
  },

  countryOption: {
    flex: 1,
    minHeight: 46,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.sm,
    borderWidth: 1,
    borderColor: KhedmatPalette.border,
    borderRadius: Radius.md,
    backgroundColor: KhedmatPalette.surfaceSoft,
  },

  countryOptionSelected: {
    borderColor: KhedmatPalette.blue500,
    borderWidth: 2,
    backgroundColor: KhedmatPalette.surface,
  },

  countryOptionPressed: {
    opacity: 0.8,
    transform: [
      {
        scale: 0.98,
      },
    ],
  },

  countryOptionDisabled: {
    opacity: 0.55,
  },

  countryOptionText: {
    ...Typography.captionStyle,
    color: KhedmatPalette.textSecondary,
    textAlign: "center",
    fontWeight: "600",
  },

  countryOptionTextSelected: {
    color: KhedmatPalette.navy700,
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
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: KhedmatPalette.border,
    borderRadius: Radius.md,
    backgroundColor: KhedmatPalette.surfaceSoft,
  },

  smsHeader: {
    width: "100%",
    alignItems: "center",
    gap: Spacing.sm,
  },

  verificationLabel: {
    ...Typography.label,
    flex: 1,
    color: KhedmatPalette.textPrimary,
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
