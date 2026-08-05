import { Ionicons } from "@expo/vector-icons";
import {
  useLocalSearchParams,
  useRouter,
} from "expo-router";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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

const CODE_LENGTH = 4;
const RESEND_SECONDS = 30;

export default function VerifyCodeScreen() {
  const router = useRouter();

  const params =
    useLocalSearchParams<{
      fullName?: string;
      phone?: string;
    }>();

  const { saveSignupProfile } =
    useCustomerProfile();

  const {
    language,
  } = useLanguage();

  const isRtl =
    language === "Dari" ||
    language === "Pashto";

  const inputRef =
    useRef<TextInput>(null);

  const [code, setCode] =
    useState("");

  const [
    submitted,
    setSubmitted,
  ] = useState(false);

  const [
    secondsRemaining,
    setSecondsRemaining,
  ] = useState(RESEND_SECONDS);

  const fullName =
    typeof params.fullName === "string"
      ? params.fullName.trim()
      : "";

  const phone =
    typeof params.phone === "string"
      ? params.phone.trim()
      : "";

  const validCode = useMemo(
    () => code.length === CODE_LENGTH,
    [code.length],
  );

  const copy =
    getVerificationCopy(language);

  useEffect(() => {
    if (secondsRemaining <= 0) {
      return;
    }

    const timer = setTimeout(() => {
      setSecondsRemaining(
        (current) => current - 1,
      );
    }, 1000);

    return () =>
      clearTimeout(timer);
  }, [secondsRemaining]);

  const handleCodeChange = (
    value: string,
  ) => {
    const normalized =
      normalizeToEnglishDigits(
        value,
      ).replace(/\D/g, "");

    const limited =
      normalized.slice(
        0,
        CODE_LENGTH,
      );

    setCode(limited);

    if (submitted) {
      setSubmitted(false);
    }
  };

  const handleVerify = async (): Promise<void> => {
    setSubmitted(true);

    if (!validCode) {
      return;
    }

    if (!fullName || !phone) {
      Alert.alert(
        "Signup information missing",
        "Please return to signup and enter your name and phone number again.",
      );
      return;
    }

    try {
      await saveSignupProfile({
        fullName,
        phoneNumber: phone,
      });

      router.replace(
        "/location-permission",
      );
    } catch (error) {
      console.error(
        "Failed to save the customer profile:",
        error,
      );

      Alert.alert(
        "Unable to create account",
        "Your profile could not be saved on this device. Please try again.",
      );
    }
  };

  const handleResend = () => {
    if (secondsRemaining > 0) {
      return;
    }

    setCode("");
    setSubmitted(false);
    setSecondsRemaining(
      RESEND_SECONDS,
    );

    inputRef.current?.focus();

    // Connect the real resend-code API here later.
  };

  const formattedPhone =
    isRtl
      ? toLocalizedDigits(phone || "—")
      : phone || "—";

  const formattedSeconds =
    isRtl
      ? toLocalizedDigits(
          secondsRemaining.toString(),
        )
      : secondsRemaining.toString();

  const displayedCode =
    isRtl
      ? toLocalizedDigits(code)
      : code;

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
            label={copy.verifyButton}
            disabled={
              submitted && !validCode
            }
            onPress={handleVerify}
          />

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              copy.changeNumber
            }
            hitSlop={10}
            onPress={() =>
              router.back()
            }
            style={({ pressed }) => [
              styles.changeNumberButton,
              pressed &&
                styles.pressed,
            ]}
          >
            <Text
              style={[
                styles.changeNumber,
                {
                  writingDirection:
                    isRtl
                      ? "rtl"
                      : "ltr",
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
          accessibilityLabel={
            copy.back
          }
          onPress={() =>
            router.back()
          }
          style={({ pressed }) => [
            styles.backButton,
            pressed &&
              styles.pressed,
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

      <View style={styles.main}>
        <View
          style={styles.iconCircle}
        >
          <Ionicons
            name="shield-checkmark"
            size={46}
            color={
              KhedmatPalette.white
            }
          />
        </View>

        <View style={styles.heading}>
          <Text
            style={[
              styles.title,
              {
                writingDirection:
                  isRtl
                    ? "rtl"
                    : "ltr",
              },
            ]}
          >
            {copy.title}
          </Text>

          <Text
            style={[
              styles.subtitle,
              {
                writingDirection:
                  isRtl
                    ? "rtl"
                    : "ltr",
              },
            ]}
          >
            {copy.subtitlePrefix}{" "}
            <Text
              style={styles.phone}
            >
              {formattedPhone}
            </Text>
            {copy.subtitleSuffix}
          </Text>
        </View>

        <KhedmatCard
          style={styles.codeCard}
          contentStyle={
            styles.codeCardContent
          }
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              copy.codeInputLabel
            }
            onPress={() =>
              inputRef.current?.focus()
            }
            style={styles.codeBoxes}
          >
            {Array.from({
              length: CODE_LENGTH,
            }).map((_, index) => {
              const digit =
                displayedCode[index] ??
                "";

              const active =
                code.length === index ||
                (code.length ===
                  CODE_LENGTH &&
                  index ===
                    CODE_LENGTH - 1);

              return (
                <View
                  key={index}
                  style={[
                    styles.codeBox,
                    active &&
                      styles.codeBoxActive,
                    submitted &&
                      !validCode &&
                      styles.codeBoxError,
                  ]}
                >
                  <Text
                    style={styles.codeDigit}
                  >
                    {digit}
                  </Text>
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
            onChangeText={
              handleCodeChange
            }
            style={styles.hiddenInput}
          />

          {submitted &&
          !validCode ? (
            <View
              style={styles.errorRow}
            >
              <Ionicons
                name="alert-circle-outline"
                size={15}
                color={
                  KhedmatPalette.error
                }
              />

              <Text
                style={[
                  styles.errorText,
                  {
                    textAlign: isRtl
                      ? "right"
                      : "left",
                    writingDirection:
                      isRtl
                        ? "rtl"
                        : "ltr",
                  },
                ]}
              >
                {copy.codeError}
              </Text>
            </View>
          ) : null}

          <View
            style={[
              styles.resendRow,
              {
                flexDirection: isRtl
                  ? "row-reverse"
                  : "row",
              },
            ]}
          >
            <Text
              style={[
                styles.resendPrompt,
                {
                  writingDirection:
                    isRtl
                      ? "rtl"
                      : "ltr",
                },
              ]}
            >
              {copy.didNotReceive}
            </Text>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={
                copy.resendCode
              }
              disabled={
                secondsRemaining > 0
              }
              hitSlop={8}
              onPress={handleResend}
              style={({ pressed }) => [
                pressed &&
                  secondsRemaining ===
                    0 &&
                  styles.pressed,
              ]}
            >
              <Text
                style={[
                  styles.resendAction,
                  secondsRemaining > 0 &&
                    styles.resendDisabled,
                  {
                    writingDirection:
                      isRtl
                        ? "rtl"
                        : "ltr",
                  },
                ]}
              >
                {secondsRemaining > 0
                  ? `${copy.resendIn} ${formattedSeconds} ${copy.seconds}`
                  : copy.resendCode}
              </Text>
            </Pressable>
          </View>
        </KhedmatCard>
      </View>
    </KhedmatScreen>
  );
}

type VerificationCopy = {
  back: string;
  title: string;
  subtitlePrefix: string;
  subtitleSuffix: string;
  codeInputLabel: string;
  codeError: string;
  didNotReceive: string;
  resendIn: string;
  seconds: string;
  resendCode: string;
  verifyButton: string;
  changeNumber: string;
};

function getVerificationCopy(
  language: string,
): VerificationCopy {
  if (language === "Dari") {
    return {
      back: "بازگشت",
      title: "کد تأیید را وارد کنید",
      subtitlePrefix:
        "یک کد چهار رقمی به شماره",
      subtitleSuffix:
        " ارسال شده است.",
      codeInputLabel:
        "ورود کد تأیید",
      codeError:
        "لطفاً کد چهار رقمی را کامل وارد کنید.",
      didNotReceive:
        "کد را دریافت نکردید؟",
      resendIn:
        "ارسال دوباره تا",
      seconds: "ثانیه",
      resendCode:
        "ارسال دوباره کد",
      verifyButton:
        "تأیید و ادامه",
      changeNumber:
        "تغییر شماره تلفن",
    };
  }

  if (language === "Pashto") {
    return {
      back: "بېرته",
      title:
        "د تایید کوډ دننه کړئ",
      subtitlePrefix:
        "څلور عددي کوډ دې شمېرې ته لېږل شوی",
      subtitleSuffix: ".",
      codeInputLabel:
        "د تایید کوډ دننه کړئ",
      codeError:
        "مهرباني وکړئ بشپړ څلور عددي کوډ دننه کړئ.",
      didNotReceive:
        "کوډ مو ترلاسه نه کړ؟",
      resendIn:
        "بیا لېږل په",
      seconds: "ثانیو کې",
      resendCode:
        "کوډ بیا ولېږئ",
      verifyButton:
        "تایید او دوام",
      changeNumber:
        "د تلیفون شمېره بدله کړئ",
    };
  }

  return {
    back: "Go back",
    title: "Enter the code",
    subtitlePrefix:
      "We sent a four-digit verification code to",
    subtitleSuffix: ".",
    codeInputLabel:
      "Enter verification code",
    codeError:
      "Enter the complete four-digit code.",
    didNotReceive:
      "Didn’t receive the code?",
    resendIn: "Resend in",
    seconds: "seconds",
    resendCode: "Resend code",
    verifyButton:
      "Verify and continue",
    changeNumber:
      "Change phone number",
  };
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

const styles = StyleSheet.create({
  screenContent: {
    flex: 1,
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
    backgroundColor:
      KhedmatPalette.navy900,
    ...Shadows.darkAccent,
  },

  heading: {
    width: "100%",
    maxWidth:
      Layout.readableTextMaxWidth,
    alignItems: "center",
    gap: Spacing.sm,
  },

  title: {
    ...Typography.screenTitle,
    width: "100%",
    color:
      KhedmatPalette.textPrimary,
    textAlign: "center",
  },

  subtitle: {
    ...Typography.bodyStyle,
    width: "100%",
    color:
      KhedmatPalette.textSecondary,
    textAlign: "center",
    lineHeight: 24,
  },

  phone: {
    color:
      KhedmatPalette.navy700,
    fontFamily:
      Fonts.medium,
  },

  codeCard: {
    marginTop: Spacing.xxl,
  },

  codeCardContent: {
    padding: Spacing.lg,
    gap: Spacing.lg,
  },

  codeBoxes: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.md,
  },

  codeBox: {
    width: 58,
    height: 64,
    borderRadius: Radius.lg,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      KhedmatPalette.surface,
    borderWidth: 1,
    borderColor:
      KhedmatPalette.border,
  },

  codeBoxActive: {
    borderWidth: 2,
    borderColor:
      KhedmatPalette.blue500,
    backgroundColor:
      KhedmatPalette.surfaceSoft,
  },

  codeBoxError: {
    borderColor:
      KhedmatPalette.error,
    backgroundColor:
      KhedmatPalette.errorSoft,
  },

  codeDigit: {
    fontFamily: Fonts.bold,
    fontSize: 25,
    lineHeight: 31,
    color:
      KhedmatPalette.textPrimary,
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
    color:
      KhedmatPalette.error,
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
    color:
      KhedmatPalette.textSecondary,
  },

  resendAction: {
    ...Typography.captionStyle,
    color:
      KhedmatPalette.blue500,
    fontFamily: Fonts.medium,
  },

  resendDisabled: {
    color:
      KhedmatPalette.textMuted,
  },

  footer: {
    width: "100%",
    gap: Spacing.md,
    alignItems: "center",
  },

  changeNumberButton: {
    minHeight:
      Layout.minimumTouchTarget,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.md,
  },

  changeNumber: {
    ...Typography.label,
    color:
      KhedmatPalette.navy700,
    textAlign: "center",
  },

  pressed: {
    opacity: 0.75,
  },
});