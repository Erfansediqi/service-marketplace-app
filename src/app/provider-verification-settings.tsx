import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { KhedmatCard } from "../components/khedmat/khedmat-card";
import { KhedmatScreen } from "../components/khedmat/khedmat-screen";
import {
  KhedmatPalette,
  Layout,
  Radius,
  Spacing,
  Typography,
} from "../constants/theme";
import { useLanguage } from "../context/languagecontext";
import { useSession } from "../context/session-context";
import {
  getProviderAccount,
  type ProviderAccountRow,
  type ProviderVerificationStatus,
} from "../repositories/provider-account-repository";
import {
  ProviderVerificationRepository,
  type ProviderVerificationSubmissionRow,
} from "../repositories/provider-verification-repository";

type VerificationStatusView = {
  label: string;
  message: string;
  icon:
    | "checkmark-circle-outline"
    | "time-outline"
    | "alert-circle-outline"
    | "shield-outline";
  tone:
    | "verified"
    | "pending"
    | "warning"
    | "neutral";
};

export default function ProviderVerificationSettingsScreen() {
  const router = useRouter();

  const {
    t,
    isRTL,
    rowDirection,
    textDirection,
  } = useLanguage();

  const {
    activeProviderId,
  } = useSession();

  const [
    provider,
    setProvider,
  ] = useState<ProviderAccountRow | null>(
    null,
  );

  const [
    submission,
    setSubmission,
  ] = useState<ProviderVerificationSubmissionRow | null>(
    null,
  );

  const [
    isLoading,
    setIsLoading,
  ] = useState(true);

  const [
    loadFailed,
    setLoadFailed,
  ] = useState(false);

  useFocusEffect(
    useCallback(() => {
    let isMounted = true;

    const load =
      async (): Promise<void> => {
        if (!activeProviderId) {
          if (isMounted) {
            setProvider(null);
            setSubmission(null);
            setLoadFailed(true);
            setIsLoading(false);
          }

          return;
        }

        setIsLoading(true);
        setLoadFailed(false);

        try {
          const [
            providerAccount,
            verificationSubmission,
          ] = await Promise.all([
            getProviderAccount(
              activeProviderId,
            ),
            ProviderVerificationRepository.getForProvider(
              activeProviderId,
            ),
          ]);

          if (!isMounted) {
            return;
          }

          setProvider(
            providerAccount,
          );
          setSubmission(
            verificationSubmission,
          );

          if (!providerAccount) {
            setLoadFailed(true);
          }
        } catch (error) {
          console.error(
            "Failed to load provider verification settings:",
            error,
          );

          if (isMounted) {
            setProvider(null);
            setSubmission(null);
            setLoadFailed(true);
          }
        } finally {
          if (isMounted) {
            setIsLoading(false);
          }
        }
      };

    void load();

    return () => {
      isMounted = false;
    };

    }, [activeProviderId]),
  );

  const statusView =
    useMemo<VerificationStatusView>(() => {
      return getStatusView(
        provider?.verification_status ??
          "draft",
        t,
      );
    }, [
      provider?.verification_status,
      t,
    ]);

  if (isLoading) {
    return (
      <KhedmatScreen>
        <Header
          isRTL={isRTL}
          rowDirection={
            rowDirection
          }
          textDirection={
            textDirection
          }
          title={t(
            "providerVerificationSettingsTitle",
          )}
          subtitle={t(
            "providerVerificationSettingsSubtitle",
          )}
          backLabel={t("back")}
          onBack={() =>
            router.back()
          }
        />

        <View
          style={
            styles.loadingState
          }
        >
          <ActivityIndicator
            size="large"
            color={
              KhedmatPalette.blue500
            }
          />
        </View>
      </KhedmatScreen>
    );
  }

  if (
    loadFailed ||
    !provider
  ) {
    return (
      <KhedmatScreen>
        <Header
          isRTL={isRTL}
          rowDirection={
            rowDirection
          }
          textDirection={
            textDirection
          }
          title={t(
            "providerVerificationSettingsTitle",
          )}
          subtitle={t(
            "providerVerificationSettingsSubtitle",
          )}
          backLabel={t("back")}
          onBack={() =>
            router.back()
          }
        />

        <KhedmatCard
          variant="soft"
        >
          <View
            style={
              styles.errorState
            }
          >
            <View
              style={
                styles.errorIcon
              }
            >
              <Ionicons
                name="alert-circle-outline"
                size={28}
                color={
                  KhedmatPalette.error
                }
              />
            </View>

            <Text
              style={[
                styles.errorTitle,
                {
                  writingDirection:
                    textDirection,
                },
              ]}
            >
              {t(
                "providerVerificationLoadFailedTitle",
              )}
            </Text>

            <Text
              style={[
                styles.errorBody,
                {
                  writingDirection:
                    textDirection,
                },
              ]}
            >
              {t(
                "providerVerificationLoadFailedMessage",
              )}
            </Text>
          </View>
        </KhedmatCard>
      </KhedmatScreen>
    );
  }

  return (
    <KhedmatScreen
      scrollable
      contentStyle={
        styles.screenContent
      }
    >
      <Header
        isRTL={isRTL}
        rowDirection={rowDirection}
        textDirection={
          textDirection
        }
        title={t(
          "providerVerificationSettingsTitle",
        )}
        subtitle={t(
          "providerVerificationSettingsSubtitle",
        )}
        backLabel={t("back")}
        onBack={() =>
          router.back()
        }
      />

      <KhedmatCard
        style={
          styles.statusCard
        }
        contentStyle={
          styles.statusContent
        }
      >
        <View
          style={[
            styles.statusTopRow,
            {
              flexDirection:
                rowDirection,
            },
          ]}
        >
          <View
            style={[
              styles.statusIcon,
              getStatusIconStyle(
                statusView.tone,
              ),
            ]}
          >
            <Ionicons
              name={
                statusView.icon
              }
              size={24}
              color={getStatusColor(
                statusView.tone,
              )}
            />
          </View>

          <View
            style={
              styles.statusCopy
            }
          >
            <Text
              style={[
                styles.statusLabel,
                {
                  textAlign: isRTL
                    ? "right"
                    : "left",
                  writingDirection:
                    textDirection,
                },
              ]}
            >
              {t(
                "providerVerificationStatusLabel",
              )}
            </Text>

            <Text
              style={[
                styles.statusTitle,
                {
                  textAlign: isRTL
                    ? "right"
                    : "left",
                  writingDirection:
                    textDirection,
                },
              ]}
            >
              {
                statusView.label
              }
            </Text>
          </View>
        </View>

        <Text
          style={[
            styles.statusMessage,
            {
              textAlign: isRTL
                ? "right"
                : "left",
              writingDirection:
                textDirection,
            },
          ]}
        >
          {
            statusView.message
          }
        </Text>
      </KhedmatCard>

      <Text
        style={[
          styles.sectionTitle,
          {
            textAlign: isRTL
              ? "right"
              : "left",
            writingDirection:
              textDirection,
          },
        ]}
      >
        {t(
          "providerVerificationIdentitySection",
        )}
      </Text>

      <View
        style={
          styles.infoList
        }
      >
        <VerificationInfoRow
          icon="card-outline"
          title={t(
            "providerVerificationIdentityNumber",
          )}
          value={
            submission
              ? maskIdentityNumber(
                  submission.identity_number,
                )
              : t(
                  "providerVerificationStatusUnverified",
                )
          }
          isRTL={isRTL}
          rowDirection={
            rowDirection
          }
          textDirection={
            textDirection
          }
        />

        <VerificationInfoRow
          icon="person-circle-outline"
          title={t(
            "providerVerificationFacePhoto",
          )}
          value={
            submission?.profile_photo_path
              ? t(
                  "providerVerificationFacePhotoSubmitted",
                )
              : t(
                  "providerVerificationStatusUnverified",
                )
          }
          isRTL={isRTL}
          rowDirection={
            rowDirection
          }
          textDirection={
            textDirection
          }
        />

        <VerificationInfoRow
          icon="document-text-outline"
          title={t(
            "providerVerificationIdentityFront",
          )}
          value={
            submission?.identity_front_path
              ? t(
                  "providerVerificationIdentityFrontSubmitted",
                )
              : t(
                  "providerVerificationStatusUnverified",
                )
          }
          isRTL={isRTL}
          rowDirection={
            rowDirection
          }
          textDirection={
            textDirection
          }
        />

        <VerificationInfoRow
          icon="copy-outline"
          title={t(
            "providerVerificationIdentityBack",
          )}
          value={
            submission?.identity_back_path
              ? t(
                  "providerVerificationIdentityBackSubmitted",
                )
              : t(
                  "providerVerificationOptional",
                )
          }
          isRTL={isRTL}
          rowDirection={
            rowDirection
          }
          textDirection={
            textDirection
          }
        />
      </View>

      <View
        style={[
          styles.privateNotice,
          {
            flexDirection:
              rowDirection,
          },
        ]}
      >
        <Ionicons
          name="lock-closed-outline"
          size={20}
          color={
            KhedmatPalette.blue500
          }
        />

        <Text
          style={[
            styles.privateNoticeText,
            {
              textAlign: isRTL
                ? "right"
                : "left",
              writingDirection:
                textDirection,
            },
          ]}
        >
          {t(
            "providerVerificationPrivateNote",
          )}
        </Text>
      </View>
    </KhedmatScreen>
  );
}

type HeaderProps = {
  isRTL: boolean;
  rowDirection:
    | "row"
    | "row-reverse";
  textDirection:
    | "ltr"
    | "rtl";
  title: string;
  subtitle: string;
  backLabel: string;
  onBack: () => void;
};

function Header({
  isRTL,
  rowDirection,
  textDirection,
  title,
  subtitle,
  backLabel,
  onBack,
}: HeaderProps) {
  return (
    <View
      style={[
        styles.header,
        {
          flexDirection:
            rowDirection,
        },
      ]}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={
          backLabel
        }
        onPress={onBack}
        style={({ pressed }) => [
          styles.backButton,
          pressed &&
            styles.pressed,
        ]}
      >
        <Ionicons
          name={
            isRTL
              ? "chevron-forward"
              : "chevron-back"
          }
          size={22}
          color={
            KhedmatPalette.navy900
          }
        />
      </Pressable>

      <View
        style={
          styles.headerCopy
        }
      >
        <Text
          style={[
            styles.title,
            {
              textAlign: isRTL
                ? "right"
                : "left",
              writingDirection:
                textDirection,
            },
          ]}
        >
          {title}
        </Text>

        <Text
          style={[
            styles.subtitle,
            {
              textAlign: isRTL
                ? "right"
                : "left",
              writingDirection:
                textDirection,
            },
          ]}
        >
          {subtitle}
        </Text>
      </View>
    </View>
  );
}

type VerificationInfoRowProps = {
  icon:
    | "card-outline"
    | "person-circle-outline"
    | "document-text-outline"
    | "copy-outline";
  title: string;
  value: string;
  isRTL: boolean;
  rowDirection:
    | "row"
    | "row-reverse";
  textDirection:
    | "ltr"
    | "rtl";
};

function VerificationInfoRow({
  icon,
  title,
  value,
  isRTL,
  rowDirection,
  textDirection,
}: VerificationInfoRowProps) {
  return (
    <View
      style={[
        styles.infoRow,
        {
          flexDirection:
            rowDirection,
        },
      ]}
    >
      <View
        style={
          styles.infoIcon
        }
      >
        <Ionicons
          name={icon}
          size={21}
          color={
            KhedmatPalette.blue500
          }
        />
      </View>

      <View
        style={
          styles.infoCopy
        }
      >
        <Text
          style={[
            styles.infoTitle,
            {
              textAlign: isRTL
                ? "right"
                : "left",
              writingDirection:
                textDirection,
            },
          ]}
        >
          {title}
        </Text>

        <Text
          style={[
            styles.infoValue,
            {
              textAlign: isRTL
                ? "right"
                : "left",
              writingDirection:
                textDirection,
            },
          ]}
        >
          {value}
        </Text>
      </View>
    </View>
  );
}

function getStatusView(
  status: ProviderVerificationStatus,
  t: (
    key:
      | "providerVerificationStatusVerified"
      | "providerVerificationStatusPending"
      | "providerVerificationStatusRejected"
      | "providerVerificationStatusUnverified"
      | "providerVerificationVerifiedMessage"
      | "providerVerificationPendingMessage"
      | "providerVerificationRejectedMessage"
      | "providerVerificationUnverifiedMessage"
  ) => string,
): VerificationStatusView {
  if (status === "verified") {
    return {
      label: t(
        "providerVerificationStatusVerified",
      ),
      message: t(
        "providerVerificationVerifiedMessage",
      ),
      icon:
        "checkmark-circle-outline",
      tone: "verified",
    };
  }

  if (status === "pending") {
    return {
      label: t(
        "providerVerificationStatusPending",
      ),
      message: t(
        "providerVerificationPendingMessage",
      ),
      icon: "time-outline",
      tone: "pending",
    };
  }

  if (
    status === "rejected" ||
    status === "suspended"
  ) {
    return {
      label: t(
        "providerVerificationStatusRejected",
      ),
      message: t(
        "providerVerificationRejectedMessage",
      ),
      icon:
        "alert-circle-outline",
      tone: "warning",
    };
  }

  return {
    label: t(
      "providerVerificationStatusUnverified",
    ),
    message: t(
      "providerVerificationUnverifiedMessage",
    ),
    icon:
      "shield-outline",
    tone: "neutral",
  };
}

function getStatusColor(
  tone: VerificationStatusView["tone"],
): string {
  if (tone === "verified") {
    return KhedmatPalette.success;
  }

  if (tone === "pending") {
    return KhedmatPalette.blue500;
  }

  if (tone === "warning") {
    return KhedmatPalette.warning;
  }

  return KhedmatPalette.textSecondary;
}

function getStatusIconStyle(
  tone: VerificationStatusView["tone"],
) {
  if (tone === "verified") {
    return styles.statusIconVerified;
  }

  if (tone === "pending") {
    return styles.statusIconPending;
  }

  if (tone === "warning") {
    return styles.statusIconWarning;
  }

  return styles.statusIconNeutral;
}

function maskIdentityNumber(
  value: string,
): string {
  const normalized =
    value.trim();

  if (normalized.length <= 4) {
    return "••••";
  }

  return `${"•".repeat(
    Math.min(
      normalized.length - 4,
      8,
    ),
  )}${normalized.slice(-4)}`;
}

const styles =
  StyleSheet.create({
    screenContent: {
      paddingTop:
        Spacing.md,
      paddingBottom:
        Spacing.xxl,
    },

    header: {
      width: "100%",
      maxWidth:
        Layout.contentMaxWidth,
      alignSelf: "center",
      alignItems:
        "flex-start",
      gap: Spacing.md,
      marginBottom:
        Spacing.xl,
    },

    backButton: {
      width: 40,
      height: 40,
      flexShrink: 0,
      alignItems: "center",
      justifyContent:
        "center",
      borderRadius:
        Radius.pill,
      backgroundColor:
        KhedmatPalette.white,
    },

    headerCopy: {
      flex: 1,
      minWidth: 0,
    },

    title: {
      ...Typography.screenTitle,
      color:
        KhedmatPalette.textPrimary,
      fontSize: 22,
      lineHeight: 28,
    },

    subtitle: {
      ...Typography.captionStyle,
      marginTop: 3,
      color:
        KhedmatPalette.textSecondary,
      lineHeight: 18,
    },

    loadingState: {
      flex: 1,
      alignItems: "center",
      justifyContent:
        "center",
    },

    errorState: {
      minHeight: 240,
      alignItems: "center",
      justifyContent:
        "center",
      padding:
        Spacing.xl,
    },

    errorIcon: {
      width: 56,
      height: 56,
      alignItems: "center",
      justifyContent:
        "center",
      borderRadius:
        Radius.pill,
      backgroundColor:
        KhedmatPalette.errorSoft,
      marginBottom:
        Spacing.md,
    },

    errorTitle: {
      ...Typography.sectionTitle,
      color:
        KhedmatPalette.textPrimary,
      textAlign: "center",
    },

    errorBody: {
      ...Typography.bodyStyle,
      marginTop:
        Spacing.xs,
      color:
        KhedmatPalette.textSecondary,
      textAlign: "center",
      lineHeight: 21,
    },

    statusCard: {
      width: "100%",
    },

    statusContent: {
      gap: Spacing.md,
    },

    statusTopRow: {
      width: "100%",
      alignItems: "center",
      gap: Spacing.md,
    },

    statusIcon: {
      width: 48,
      height: 48,
      flexShrink: 0,
      alignItems: "center",
      justifyContent:
        "center",
      borderRadius:
        Radius.pill,
    },

    statusIconVerified: {
      backgroundColor:
        KhedmatPalette.successSoft,
    },

    statusIconPending: {
      backgroundColor:
        KhedmatPalette.blue050,
    },

    statusIconWarning: {
      backgroundColor:
        KhedmatPalette.warningSoft,
    },

    statusIconNeutral: {
      backgroundColor:
        KhedmatPalette.surfaceSoft,
    },

    statusCopy: {
      flex: 1,
      minWidth: 0,
    },

    statusLabel: {
      ...Typography.captionStyle,
      color:
        KhedmatPalette.textSecondary,
    },

    statusTitle: {
      ...Typography.sectionTitle,
      marginTop: 2,
      color:
        KhedmatPalette.textPrimary,
      fontSize: 18,
      lineHeight: 24,
    },

    statusMessage: {
      ...Typography.bodyStyle,
      color:
        KhedmatPalette.textSecondary,
      lineHeight: 21,
    },

    sectionTitle: {
      ...Typography.sectionTitle,
      width: "100%",
      marginTop:
        Spacing.xl,
      marginBottom:
        Spacing.sm,
      color:
        KhedmatPalette.textPrimary,
      fontSize: 18,
      lineHeight: 24,
    },

    infoList: {
      width: "100%",
      gap: Spacing.sm,
    },

    infoRow: {
      width: "100%",
      minHeight: 72,
      alignItems: "center",
      gap: Spacing.md,
      paddingHorizontal:
        Spacing.md,
      paddingVertical:
        Spacing.md,
      borderRadius:
        Radius.lg,
      borderWidth:
        StyleSheet.hairlineWidth,
      borderColor:
        KhedmatPalette.blue200,
      backgroundColor:
        KhedmatPalette.white,
    },

    infoIcon: {
      width: 40,
      height: 40,
      flexShrink: 0,
      alignItems: "center",
      justifyContent:
        "center",
      borderRadius:
        Radius.md,
      backgroundColor:
        KhedmatPalette.blue050,
    },

    infoCopy: {
      flex: 1,
      minWidth: 0,
    },

    infoTitle: {
      ...Typography.label,
      color:
        KhedmatPalette.textPrimary,
      fontSize: 14,
      lineHeight: 19,
    },

    infoValue: {
      ...Typography.captionStyle,
      marginTop: 3,
      color:
        KhedmatPalette.textSecondary,
      lineHeight: 18,
    },

    privateNotice: {
      width: "100%",
      alignItems:
        "flex-start",
      gap: Spacing.sm,
      marginTop:
        Spacing.lg,
      padding:
        Spacing.md,
      borderRadius:
        Radius.md,
      borderWidth:
        StyleSheet.hairlineWidth,
      borderColor:
        KhedmatPalette.blue200,
      backgroundColor:
        KhedmatPalette.blue050,
    },

    privateNoticeText: {
      ...Typography.captionStyle,
      flex: 1,
      color:
        KhedmatPalette.textSecondary,
      lineHeight: 19,
    },

    pressed: {
      opacity: 0.72,
    },
  });
