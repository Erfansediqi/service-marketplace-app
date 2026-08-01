import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

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

export default function SignupScreen() {
  const router = useRouter();
  const { t, language } = useLanguage();

  const isRtl =
    language === "Dari" ||
    language === "Pashto";

  const usesLocalizedDigits = isRtl;

  const [fullName, setFullName] =
    useState("");

  const [
    phoneNumber,
    setPhoneNumber,
  ] = useState("");

  const [submitted, setSubmitted] =
    useState(false);

  const normalizedPhoneNumber =
    normalizeToEnglishDigits(phoneNumber);

  const digits =
    normalizedPhoneNumber.replace(
      /\D/g,
      "",
    );

  const nameError =
    submitted &&
    fullName.trim().length < 2
      ? t("nameError")
      : undefined;

  const phoneError =
    submitted &&
    digits.length < 7
      ? t("phoneError")
      : undefined;

  const formValid = useMemo(
    () =>
      fullName.trim().length >= 2 &&
      digits.length >= 7,
    [digits.length, fullName],
  );

  const displayedPhoneNumber =
    usesLocalizedDigits
      ? toLocalizedDigits(
          normalizedPhoneNumber,
        )
      : normalizedPhoneNumber;

  const phonePlaceholder =
    usesLocalizedDigits
      ? toLocalizedDigits(
          "701234567",
        )
      : "701234567";

  const countryCode =
    usesLocalizedDigits
      ? toLocalizedDigits("+93")
      : "+93";

  const handlePhoneChange = (
    value: string,
  ) => {
    const normalized =
      normalizeToEnglishDigits(value);

    const numbersOnly =
      normalized.replace(/\D/g, "");

    setPhoneNumber(numbersOnly);
  };

  const handleSendCode = () => {
    setSubmitted(true);

    if (!formValid) {
      return;
    }

    router.push({
      pathname: "/verify-code",
      params: {
        phone: `+93 ${digits}`,
      },
    });
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
        isRtl
          ? styles.countryCodeRtl
          : styles.countryCodeLtr,
      ]}
    >
      <Text
        style={styles.countryCodeText}
      >
        {countryCode}
      </Text>

      <View
        style={
          styles.countryCodeDivider
        }
      />
    </View>
  );

  return (
    <KhedmatScreen
      keyboardAware
      scrollable
      contentStyle={
        styles.screenContent
      }
      footer={
        <View style={styles.footer}>
          <KhedmatButton
            label={t(
              "sendVerificationCode",
            )}
            disabled={
              submitted && !formValid
            }
            onPress={handleSendCode}
          />

          <Text
            style={[
              styles.legalText,
              {
                writingDirection: isRtl
                  ? "rtl"
                  : "ltr",
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
            pressed &&
              styles.backButtonPressed,
          ]}
        >
          <Ionicons
            name={
              isRtl
                ? "chevron-forward"
                : "chevron-back"
            }
            size={24}
            color={
              KhedmatPalette.navy900
            }
          />
        </Pressable>
      </View>

      <View style={styles.hero}>
        <View style={styles.avatar}>
          <Ionicons
            name="person"
            size={44}
            color={
              KhedmatPalette.white
            }
          />
        </View>

        <Text
          style={[
            styles.title,
            {
              writingDirection: isRtl
                ? "rtl"
                : "ltr",
            },
          ]}
        >
          {t("createAccountTitle")}
        </Text>
      </View>

      <KhedmatCard
        style={styles.formCard}
        contentStyle={
          styles.formCardContent
        }
      >
        <View style={styles.form}>
          <KhedmatInput
            autoCapitalize="words"
            autoComplete="name"
            error={nameError}
            isRtl={isRtl}
            label={t("fullNameLabel")}
            leadingContent={
              isRtl
                ? undefined
                : nameIcon
            }
            trailingContent={
              isRtl
                ? nameIcon
                : undefined
            }
            onChangeText={setFullName}
            placeholder={t(
              "fullNamePlaceholder",
            )}
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
            leadingContent={
              isRtl
                ? undefined
                : phoneCodeContent
            }
            trailingContent={
              isRtl
                ? phoneCodeContent
                : undefined
            }
            onChangeText={
              handlePhoneChange
            }
            placeholder={
              phonePlaceholder
            }
            returnKeyType="done"
            textContentType="telephoneNumber"
            value={displayedPhoneNumber}
          />
        </View>
      </KhedmatCard>

      <View
        style={[
          styles.securityNote,
          {
            flexDirection: isRtl
              ? "row-reverse"
              : "row",
          },
        ]}
      >
        <Ionicons
          name="shield-checkmark-outline"
          size={17}
          color={
            KhedmatPalette.blue500
          }
        />

        <Text
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.78}
          style={[
            styles.securityText,
            {
              textAlign: isRtl
                ? "right"
                : "left",
              writingDirection: isRtl
                ? "rtl"
                : "ltr",
            },
          ]}
        >
          {getSecurityMessage(language)}
        </Text>
      </View>
    </KhedmatScreen>
  );
}

function normalizeToEnglishDigits(
  value: string,
): string {
  const persianDigits =
    "۰۱۲۳۴۵۶۷۸۹";

  const arabicDigits =
    "٠١٢٣٤٥٦٧٨٩";

  return value
    .replace(
      /[۰-۹]/g,
      (digit) =>
        String(
          persianDigits.indexOf(
            digit,
          ),
        ),
    )
    .replace(
      /[٠-٩]/g,
      (digit) =>
        String(
          arabicDigits.indexOf(
            digit,
          ),
        ),
    );
}

function toLocalizedDigits(
  value: string,
): string {
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

function getSecurityMessage(
  language: string,
): string {
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
    minHeight:
      Layout.minimumTouchTarget,
    alignItems: "flex-start",
  },

  backButton: {
    width: 44,
    height: 44,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      KhedmatPalette.surface,
    borderWidth: 1,
    borderColor:
      KhedmatPalette.border,
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
    backgroundColor:
      KhedmatPalette.navy900,
    ...Shadows.darkAccent,
  },

  title: {
    ...Typography.screenTitle,
    width: "100%",
    maxWidth:
      Layout.readableTextMaxWidth,
    alignSelf: "center",
    color:
      KhedmatPalette.textPrimary,
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
    color:
      KhedmatPalette.navy700,
  },

  countryCodeDivider: {
    width:
      StyleSheet.hairlineWidth,
    height: 24,
    backgroundColor:
      KhedmatPalette.border,
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
    color:
      KhedmatPalette.textSecondary,
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
    maxWidth:
      Layout.readableTextMaxWidth,
    alignSelf: "center",
    color:
      KhedmatPalette.textMuted,
    lineHeight: 17,
    textAlign: "center",
  },
});