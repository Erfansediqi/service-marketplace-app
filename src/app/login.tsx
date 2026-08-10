import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
    Alert,
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
import { useSupabaseAuth } from "../context/supabase-auth-context";

type SupportedCountry =
  | "afghanistan"
  | "india";

const COUNTRY_CONFIG = {
  afghanistan: {
    dialCode: "+93",
    dialDigits: "93",
    nationalLength: 9,
  },
  india: {
    dialCode: "+91",
    dialDigits: "91",
    nationalLength: 10,
  },
} as const;

export default function LoginScreen() {
  const router = useRouter();

  const {
    t,
    language,
    isRTL,
    rowDirection,
    textDirection,
  } = useLanguage();

  const {
    sendPhoneLoginOtp,
    isSendingOtp,
  } = useSupabaseAuth();

  const [phoneNumber, setPhoneNumber] =
    useState("");

  const [
    selectedCountry,
    setSelectedCountry,
  ] =
    useState<SupportedCountry>(
      "afghanistan",
    );

  const [
    submitted,
    setSubmitted,
  ] = useState(false);

  const selectedCountryConfig =
    COUNTRY_CONFIG[selectedCountry];

  const normalizedPhoneNumber =
    normalizeToEnglishDigits(
      phoneNumber,
    );

  const digits =
    normalizedPhoneNumber.replace(
      /\D/g,
      "",
    );

  const nationalDigits =
    normalizeNationalNumber(
      digits,
      selectedCountry,
    );

  const usesLocalizedDigits =
    isRTL;

  const displayDigits = (
    value: string,
  ): string =>
    usesLocalizedDigits
      ? toLocalizedDigits(value)
      : value;

  const displayedPhoneNumber =
    displayDigits(
      normalizedPhoneNumber,
    );

  const phonePlaceholder =
    selectedCountry ===
    "afghanistan"
      ? t(
          "loginPhonePlaceholderAfghanistan",
        )
      : t(
          "loginPhonePlaceholderIndia",
        );

  const countryCode =
    displayDigits(
      selectedCountryConfig.dialCode,
    );

  const phoneValid =
    nationalDigits.length ===
    selectedCountryConfig.nationalLength;

  const phoneError = useMemo(
    () =>
      submitted &&
      !phoneValid
        ? getPhoneErrorMessage(
            language,
            selectedCountryConfig.nationalLength,
          )
        : undefined,
    [
      language,
      phoneValid,
      selectedCountryConfig.nationalLength,
      submitted,
    ],
  );

  const handleCountryChange = (
    country: SupportedCountry,
  ): void => {
    if (
      country ===
      selectedCountry
    ) {
      return;
    }

    setSelectedCountry(country);
    setPhoneNumber("");
    setSubmitted(false);
  };

  const handlePhoneChange = (
    value: string,
  ): void => {
    const normalized =
      normalizeToEnglishDigits(
        value,
      );

    const nationalNumber =
      normalizeNationalNumber(
        normalized,
        selectedCountry,
      );

    setPhoneNumber(
      nationalNumber,
    );

    if (submitted) {
      setSubmitted(false);
    }
  };

  const handleContinue =
    async (): Promise<void> => {
      setSubmitted(true);

      if (
        !phoneValid ||
        isSendingOtp
      ) {
        return;
      }

      const phone =
        `${selectedCountryConfig.dialCode}${nationalDigits}`;

      try {
        await sendPhoneLoginOtp({
          phone,
          channel: "sms",
        });

        router.push({
          pathname:
            "/verify-code",
          params: {
            phone,
            channel:
              "sms",
            mode:
              "login",
          },
        });
      } catch (error) {
        console.error(
          "Failed to send login verification code:",
          error,
        );

        const rawMessage =
          error instanceof Error &&
          error.message
            ? error.message
            : "";

        const message =
          isAccountNotFoundError(
            rawMessage,
          )
            ? t(
                "loginAccountNotFound",
              )
            : rawMessage ||
              t(
                "loginOtpError",
              );

        Alert.alert(
          t("loginErrorTitle"),
          message,
        );
      }
    };

  const phoneCodeContent = (
    <View
      style={[
        styles.countryCode,
        {
          flexDirection:
            rowDirection,
        },
      ]}
    >
      <Text
        style={[
          styles.countryCodeText,
          {
            writingDirection:
              textDirection,
          },
        ]}
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
        <View
          style={styles.footer}
        >
          <KhedmatButton
            label={
              isSendingOtp
                ? t(
                    "loginSendingCode",
                  )
                : t(
                    "loginContinue",
                  )
            }
            icon="arrow-forward-outline"
            loading={
              isSendingOtp
            }
            disabled={
              isSendingOtp ||
              (submitted &&
                !phoneValid)
            }
            onPress={
              handleContinue
            }
          />

          <View
            style={[
              styles.signupPrompt,
              {
                flexDirection:
                  rowDirection,
              },
            ]}
          >
            <Text
              style={[
                styles.signupPromptText,
                {
                  writingDirection:
                    textDirection,
                },
              ]}
            >
              {t(
                "loginNoAccount",
              )}
            </Text>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t(
                "loginCreateAccount",
              )}
              onPress={() =>
                router.push(
                  "/signup",
                )
              }
              style={({
                pressed,
              }) => [
                styles.signupLink,
                pressed &&
                  styles.pressed,
              ]}
            >
              <Text
                style={[
                  styles.signupLinkText,
                  {
                    writingDirection:
                      textDirection,
                  },
                ]}
              >
                {t(
                  "loginCreateAccount",
                )}
              </Text>
            </Pressable>
          </View>
        </View>
      }
    >
      <View
        style={styles.hero}
      >
        <View
          style={
            styles.avatar
          }
        >
          <Ionicons
            name="person"
            size={42}
            color={
              KhedmatPalette.white
            }
          />
        </View>

        <Text
          style={[
            styles.title,
            {
              writingDirection:
                textDirection,
            },
          ]}
        >
          {t("loginTitle")}
        </Text>

        <Text
          style={[
            styles.subtitle,
            {
              writingDirection:
                textDirection,
            },
          ]}
        >
          {t("loginSubtitle")}
        </Text>
      </View>

      <KhedmatCard
        style={styles.formCard}
        contentStyle={
          styles.formCardContent
        }
      >
        <View
          style={styles.form}
        >
          <View
            accessibilityRole="radiogroup"
            style={[
              styles.countrySelector,
              {
                flexDirection:
                  rowDirection,
              },
            ]}
          >
            <CountryOptionButton
              label={`افغانستان ${displayDigits(
                COUNTRY_CONFIG
                  .afghanistan
                  .dialCode,
              )}`}
              selected={
                selectedCountry ===
                "afghanistan"
              }
              disabled={
                isSendingOtp
              }
              onPress={() =>
                handleCountryChange(
                  "afghanistan",
                )
              }
            />

            <CountryOptionButton
              label={`هند ${displayDigits(
                COUNTRY_CONFIG.india
                  .dialCode,
              )}`}
              selected={
                selectedCountry ===
                "india"
              }
              disabled={
                isSendingOtp
              }
              onPress={() =>
                handleCountryChange(
                  "india",
                )
              }
            />
          </View>

          <KhedmatInput
            autoComplete="tel"
            error={phoneError}
            isRtl={isRTL}
            keyboardType="phone-pad"
            label={t(
              "loginPhoneLabel",
            )}
            leadingContent={
              isRTL
                ? undefined
                : phoneCodeContent
            }
            trailingContent={
              isRTL
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
            value={
              displayedPhoneNumber
            }
          />
        </View>
      </KhedmatCard>
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
      accessibilityLabel={
        label
      }
      accessibilityState={{
        selected,
        disabled,
      }}
      disabled={disabled}
      onPress={onPress}
      style={({
        pressed,
      }) => [
        styles.countryOption,
        selected &&
          styles.countryOptionSelected,
        pressed &&
          !disabled &&
          styles.countryOptionPressed,
        disabled &&
          styles.countryOptionDisabled,
      ]}
    >
      <Text
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.8}
        style={[
          styles.countryOptionText,
          selected &&
            styles.countryOptionTextSelected,
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
  const config =
    COUNTRY_CONFIG[country];

  let normalized =
    normalizeToEnglishDigits(
      value,
    ).replace(/\D/g, "");

  if (
    normalized.startsWith(
      config.dialDigits,
    ) &&
    normalized.length >
      config.nationalLength
  ) {
    normalized =
      normalized.slice(
        config.dialDigits.length,
      );
  }

  normalized =
    normalized.replace(
      /^0+/,
      "",
    );

  return normalized.slice(
    0,
    config.nationalLength,
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
      digits[digit] ??
      digit,
  );
}

function getPhoneErrorMessage(
  language: string,
  nationalLength: number,
): string {
  const localizedLength =
    language === "Dari" ||
    language === "Pashto"
      ? toLocalizedDigits(
          String(
            nationalLength,
          ),
        )
      : String(
          nationalLength,
        );

  if (
    language === "Dari"
  ) {
    return `یک شماره تماس معتبر ${localizedLength} رقمی وارد کنید.`;
  }

  if (
    language === "Pashto"
  ) {
    return `یو معتبر ${localizedLength} عددي تلیفون شمېره دننه کړئ.`;
  }

  return `Enter a valid ${localizedLength}-digit phone number.`;
}

function isAccountNotFoundError(
  message: string,
): boolean {
  const normalized =
    message.toLowerCase();

  return (
    normalized.includes(
      "signups not allowed",
    ) ||
    normalized.includes(
      "user not found",
    ) ||
    normalized.includes(
      "does not exist",
    )
  );
}

const styles =
  StyleSheet.create({
    screenContent: {
      paddingTop:
        Spacing.lg,
      paddingBottom:
        Spacing.xxl,
    },

    hero: {
      width: "100%",
      maxWidth:
        Layout.contentMaxWidth,
      alignSelf: "center",
      alignItems: "center",
      paddingTop:
        Spacing.xl,
      paddingBottom:
        Spacing.xl,
    },

    avatar: {
      width: 82,
      height: 82,
      alignItems: "center",
      justifyContent:
        "center",
      borderRadius:
        Radius.pill,
      backgroundColor:
        KhedmatPalette.navy900,
      ...Shadows.medium,
    },

    title: {
      ...Typography.screenTitle,
      marginTop:
        Spacing.lg,
      color:
        KhedmatPalette.textPrimary,
      fontSize: 28,
      lineHeight: 34,
      textAlign: "center",
    },

    subtitle: {
      ...Typography.bodyStyle,
      maxWidth: 320,
      marginTop:
        Spacing.xs,
      color:
        KhedmatPalette.textSecondary,
      lineHeight: 21,
      textAlign: "center",
    },

    formCard: {
      width: "100%",
      maxWidth:
        Layout.contentMaxWidth,
      alignSelf: "center",
    },

    formCardContent: {
      padding:
        Spacing.lg,
    },

    form: {
      gap: Spacing.lg,
    },

    countrySelector: {
      width: "100%",
      gap: Spacing.sm,
    },

    countryOption: {
      flex: 1,
      minHeight: 44,
      alignItems: "center",
      justifyContent:
        "center",
      paddingHorizontal:
        Spacing.sm,
      borderRadius:
        Radius.md,
      borderWidth: 1,
      borderColor:
        KhedmatPalette.border,
      backgroundColor:
        KhedmatPalette.white,
    },

    countryOptionSelected: {
      borderColor:
        KhedmatPalette.blue500,
      backgroundColor:
        KhedmatPalette.blue050,
    },

    countryOptionPressed: {
      opacity: 0.78,
    },

    countryOptionDisabled: {
      opacity: 0.55,
    },

    countryOptionText: {
      ...Typography.captionStyle,
      color:
        KhedmatPalette.textSecondary,
      fontSize: 13,
      lineHeight: 18,
      textAlign: "center",
    },

    countryOptionTextSelected: {
      color:
        KhedmatPalette.navy900,
    },

    countryCode: {
      alignItems: "center",
      gap: Spacing.sm,
    },

    countryCodeText: {
      ...Typography.label,
      color:
        KhedmatPalette.textPrimary,
    },

    countryCodeDivider: {
      width: 1,
      height: 22,
      backgroundColor:
        KhedmatPalette.border,
    },

    footer: {
      width: "100%",
      maxWidth:
        Layout.contentMaxWidth,
      alignSelf: "center",
      gap: Spacing.md,
    },

    signupPrompt: {
      alignItems: "center",
      justifyContent:
        "center",
      flexWrap: "wrap",
      gap: Spacing.xs,
      paddingHorizontal:
        Spacing.sm,
    },

    signupPromptText: {
      ...Typography.bodyStyle,
      color:
        KhedmatPalette.textSecondary,
      fontSize: 14,
    },

    signupLink: {
      paddingVertical:
        Spacing.xs,
      paddingHorizontal:
        Spacing.xs,
    },

    signupLinkText: {
      ...Typography.label,
      color:
        KhedmatPalette.blue500,
      fontSize: 14,
    },

    pressed: {
      opacity: 0.7,
    },
  });
