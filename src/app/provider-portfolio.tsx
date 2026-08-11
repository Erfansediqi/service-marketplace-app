import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
    Alert,
    Image,
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
    Spacing,
    Typography,
} from "../constants/theme";
import { useLanguage } from "../context/languagecontext";
import { useSession } from "../context/session-context";

const MAX_PORTFOLIO_ITEMS = 8;

type PortfolioDraft = {
  title: string;
  imageUri: string | null;
};

const EMPTY_DRAFT: PortfolioDraft = {
  title: "",
  imageUri: null,
};

export default function ProviderPortfolioScreen() {
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
    isEditing,
    setIsEditing,
  ] = useState(false);

  const [
    draft,
    setDraft,
  ] = useState<PortfolioDraft>(
    EMPTY_DRAFT,
  );

  /*
   * Backend persistence is intentionally not faked.
   * Once provider_portfolio_items + storage are added,
   * this screen can replace this zero count with the
   * repository-backed item list.
   */
  const persistedItemCount = 0;

  const resetDraft = (): void => {
    setDraft(EMPTY_DRAFT);
    setIsEditing(false);
  };

  const startDraft = (): void => {
    if (
      persistedItemCount >=
      MAX_PORTFOLIO_ITEMS
    ) {
      Alert.alert(
        t(
          "providerPortfolioLimitTitle",
        ),
        t(
          "providerPortfolioLimitMessage",
        ),
      );

      return;
    }

    setDraft(EMPTY_DRAFT);
    setIsEditing(true);
  };

  const choosePhoto =
    async (): Promise<void> => {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          t(
            "providerPortfolioPermissionTitle",
          ),
          t(
            "providerPortfolioPermissionMessage",
          ),
        );

        return;
      }

      const result =
        await ImagePicker.launchImageLibraryAsync(
          {
            mediaTypes: ["images"],
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.85,
          },
        );

      const asset =
        result.assets?.[0];

      if (
        result.canceled ||
        !asset?.uri
      ) {
        return;
      }

      setDraft((current) => ({
        ...current,
        imageUri: asset.uri,
      }));
    };

  const handleSave =
    (): void => {
      const normalizedTitle =
        draft.title.trim();

      if (!normalizedTitle) {
        Alert.alert(
          t(
            "providerPortfolioTitle",
          ),
          t(
            "providerPortfolioTitleRequired",
          ),
        );

        return;
      }

      if (!draft.imageUri) {
        Alert.alert(
          t(
            "providerPortfolioTitle",
          ),
          t(
            "providerPortfolioPhotoRequired",
          ),
        );

        return;
      }

      /*
       * Do not create local-only portfolio records here.
       * A work sample must not appear saved unless its
       * metadata and image are durably stored.
       */
      Alert.alert(
        t(
          "providerPortfolioUnavailableTitle",
        ),
        t(
          "providerPortfolioUnavailableMessage",
        ),
      );
    };

  if (!activeProviderId) {
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
            "providerPortfolioTitle",
          )}
          subtitle={t(
            "providerPortfolioSubtitle",
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
              styles.centerState
            }
          >
            <Ionicons
              name="briefcase-outline"
              size={30}
              color={
                KhedmatPalette.blue500
              }
            />

            <Text
              style={[
                styles.stateTitle,
                {
                  writingDirection:
                    textDirection,
                },
              ]}
            >
              {t(
                "providerPortfolioUnavailableTitle",
              )}
            </Text>

            <Text
              style={[
                styles.stateBody,
                {
                  writingDirection:
                    textDirection,
                },
              ]}
            >
              {t(
                "providerPortfolioUnavailableMessage",
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
      keyboardAware
      contentStyle={
        styles.screenContent
      }
      footer={
        isEditing ? (
          <View
            style={
              styles.footerActions
            }
          >
            <KhedmatButton
              label={t(
                "providerPortfolioCancel",
              )}
              variant="outline"
              onPress={resetDraft}
            />

            <KhedmatButton
              label={t(
                "providerPortfolioSave",
              )}
              onPress={handleSave}
            />
          </View>
        ) : undefined
      }
    >
      <Header
        isRTL={isRTL}
        rowDirection={rowDirection}
        textDirection={
          textDirection
        }
        title={t(
          "providerPortfolioTitle",
        )}
        subtitle={t(
          "providerPortfolioSubtitle",
        )}
        backLabel={t("back")}
        onBack={() =>
          router.back()
        }
      />

      {isEditing ? (
        <KhedmatCard
          style={
            styles.editorCard
          }
          contentStyle={
            styles.editorContent
          }
        >
          <KhedmatInput
            label={t(
              "providerPortfolioWorkTitle",
            )}
            value={draft.title}
            onChangeText={(title) =>
              setDraft(
                (current) => ({
                  ...current,
                  title,
                }),
              )
            }
            placeholder={t(
              "providerPortfolioWorkTitlePlaceholder",
            )}
            autoCapitalize="sentences"
            returnKeyType="done"
            isRtl={isRTL}
            maxLength={80}
          />

          <View
            style={
              styles.photoSection
            }
          >
            <Text
              style={[
                styles.fieldLabel,
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
                "providerPortfolioPhoto",
              )}
            </Text>

            {draft.imageUri ? (
              <View
                style={
                  styles.photoPreviewShell
                }
              >
                <Image
                  source={{
                    uri:
                      draft.imageUri,
                  }}
                  style={
                    styles.photoPreview
                  }
                  resizeMode="cover"
                />

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={t(
                    "providerPortfolioChangePhoto",
                  )}
                  onPress={() => {
                    void choosePhoto();
                  }}
                  style={({
                    pressed,
                  }) => [
                    styles.changePhotoButton,
                    pressed &&
                      styles.pressed,
                  ]}
                >
                  <Ionicons
                    name="camera-outline"
                    size={18}
                    color={
                      KhedmatPalette.navy900
                    }
                  />

                  <Text
                    style={[
                      styles.changePhotoText,
                      {
                        writingDirection:
                          textDirection,
                      },
                    ]}
                  >
                    {t(
                      "providerPortfolioChangePhoto",
                    )}
                  </Text>
                </Pressable>
              </View>
            ) : (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t(
                  "providerPortfolioChoosePhoto",
                )}
                onPress={() => {
                  void choosePhoto();
                }}
                style={({
                  pressed,
                }) => [
                  styles.photoPicker,
                  pressed &&
                    styles.pressed,
                ]}
              >
                <View
                  style={
                    styles.photoPickerIcon
                  }
                >
                  <Ionicons
                    name="images-outline"
                    size={28}
                    color={
                      KhedmatPalette.blue500
                    }
                  />
                </View>

                <Text
                  style={[
                    styles.photoPickerTitle,
                    {
                      writingDirection:
                        textDirection,
                    },
                  ]}
                >
                  {t(
                    "providerPortfolioChoosePhoto",
                  )}
                </Text>
              </Pressable>
            )}
          </View>
        </KhedmatCard>
      ) : (
        <>
          <View
            style={[
              styles.actionRow,
              {
                flexDirection:
                  rowDirection,
              },
            ]}
          >
            <View
              style={
                styles.actionCopy
              }
            >
              <Text
                style={[
                  styles.actionTitle,
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
                  "providerPortfolioEmptyTitle",
                )}
              </Text>

              <Text
                style={[
                  styles.actionSubtitle,
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
                  "providerPortfolioEmptyMessage",
                )}
              </Text>
            </View>

            <View
              style={
                styles.countBadge
              }
            >
              <Text
                style={
                  styles.countBadgeText
                }
              >
                {persistedItemCount}/
                {MAX_PORTFOLIO_ITEMS}
              </Text>
            </View>
          </View>

          <KhedmatCard
            style={
              styles.emptyCard
            }
            contentStyle={
              styles.emptyContent
            }
          >
            <View
              style={
                styles.emptyIcon
              }
            >
              <Ionicons
                name="images-outline"
                size={32}
                color={
                  KhedmatPalette.blue500
                }
              />
            </View>

            <Text
              style={[
                styles.emptyTitle,
                {
                  writingDirection:
                    textDirection,
                },
              ]}
            >
              {t(
                "providerPortfolioEmptyTitle",
              )}
            </Text>

            <Text
              style={[
                styles.emptyMessage,
                {
                  writingDirection:
                    textDirection,
                },
              ]}
            >
              {t(
                "providerPortfolioEmptyMessage",
              )}
            </Text>

            <KhedmatButton
              label={t(
                "providerPortfolioAddWork",
              )}
              icon="add-outline"
              onPress={startDraft}
              style={
                styles.addButton
              }
            />
          </KhedmatCard>

          <View
            style={[
              styles.backendNotice,
              {
                flexDirection:
                  rowDirection,
              },
            ]}
          >
            <Ionicons
              name="information-circle-outline"
              size={20}
              color={
                KhedmatPalette.blue500
              }
            />

            <Text
              style={[
                styles.backendNoticeText,
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
                "providerPortfolioUnavailableMessage",
              )}
            </Text>
          </View>
        </>
      )}
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

    actionRow: {
      width: "100%",
      alignItems:
        "flex-start",
      justifyContent:
        "space-between",
      gap: Spacing.md,
      marginBottom:
        Spacing.md,
    },

    actionCopy: {
      flex: 1,
      minWidth: 0,
    },

    actionTitle: {
      ...Typography.label,
      color:
        KhedmatPalette.textPrimary,
      fontSize: 15,
    },

    actionSubtitle: {
      ...Typography.captionStyle,
      marginTop: 4,
      color:
        KhedmatPalette.textSecondary,
      lineHeight: 18,
    },

    countBadge: {
      minWidth: 44,
      height: 30,
      paddingHorizontal:
        Spacing.sm,
      borderRadius:
        Radius.pill,
      alignItems: "center",
      justifyContent:
        "center",
      borderWidth:
        StyleSheet.hairlineWidth,
      borderColor:
        KhedmatPalette.blue200,
      backgroundColor:
        KhedmatPalette.blue050,
    },

    countBadgeText: {
      ...Typography.captionStyle,
      color:
        KhedmatPalette.blue500,
    },

    emptyCard: {
      width: "100%",
    },

    emptyContent: {
      alignItems: "center",
      paddingVertical:
        Spacing.xxl,
      paddingHorizontal:
        Spacing.xl,
    },

    emptyIcon: {
      width: 64,
      height: 64,
      alignItems: "center",
      justifyContent:
        "center",
      borderRadius:
        Radius.pill,
      backgroundColor:
        KhedmatPalette.blue050,
      marginBottom:
        Spacing.md,
    },

    emptyTitle: {
      ...Typography.sectionTitle,
      color:
        KhedmatPalette.textPrimary,
      textAlign: "center",
    },

    emptyMessage: {
      ...Typography.bodyStyle,
      maxWidth: 320,
      marginTop:
        Spacing.xs,
      color:
        KhedmatPalette.textSecondary,
      textAlign: "center",
      lineHeight: 21,
    },

    addButton: {
      marginTop:
        Spacing.xl,
    },

    backendNotice: {
      width: "100%",
      alignItems:
        "flex-start",
      gap: Spacing.sm,
      marginTop:
        Spacing.md,
      padding:
        Spacing.md,
      borderRadius:
        Radius.md,
      borderWidth:
        StyleSheet.hairlineWidth,
      borderColor:
        KhedmatPalette.blue200,
      backgroundColor:
        KhedmatPalette.white,
    },

    backendNoticeText: {
      ...Typography.captionStyle,
      flex: 1,
      color:
        KhedmatPalette.textSecondary,
      lineHeight: 18,
    },

    editorCard: {
      width: "100%",
    },

    editorContent: {
      gap: Spacing.xl,
    },

    photoSection: {
      width: "100%",
      gap: Spacing.sm,
    },

    fieldLabel: {
      ...Typography.label,
      width: "100%",
      color:
        KhedmatPalette.textPrimary,
    },

    photoPicker: {
      width: "100%",
      minHeight: 180,
      alignItems: "center",
      justifyContent:
        "center",
      gap: Spacing.sm,
      padding:
        Spacing.xl,
      borderRadius:
        Radius.lg,
      borderWidth: 1,
      borderStyle: "dashed",
      borderColor:
        KhedmatPalette.blue200,
      backgroundColor:
        KhedmatPalette.white,
    },

    photoPickerIcon: {
      width: 56,
      height: 56,
      alignItems: "center",
      justifyContent:
        "center",
      borderRadius:
        Radius.pill,
      backgroundColor:
        KhedmatPalette.blue050,
    },

    photoPickerTitle: {
      ...Typography.label,
      color:
        KhedmatPalette.blue500,
      textAlign: "center",
    },

    photoPreviewShell: {
      width: "100%",
      overflow: "hidden",
      borderRadius:
        Radius.lg,
      borderWidth:
        StyleSheet.hairlineWidth,
      borderColor:
        KhedmatPalette.blue200,
      backgroundColor:
        KhedmatPalette.white,
    },

    photoPreview: {
      width: "100%",
      aspectRatio: 4 / 3,
      backgroundColor:
        KhedmatPalette.blue050,
    },

    changePhotoButton: {
      minHeight: 48,
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "center",
      gap: Spacing.sm,
      paddingHorizontal:
        Spacing.md,
      backgroundColor:
        KhedmatPalette.white,
    },

    changePhotoText: {
      ...Typography.label,
      color:
        KhedmatPalette.navy900,
    },

    footerActions: {
      width: "100%",
      gap: Spacing.sm,
    },

    centerState: {
      minHeight: 240,
      alignItems: "center",
      justifyContent:
        "center",
      gap: Spacing.md,
      padding:
        Spacing.xl,
    },

    stateTitle: {
      ...Typography.sectionTitle,
      color:
        KhedmatPalette.textPrimary,
      textAlign: "center",
    },

    stateBody: {
      ...Typography.bodyStyle,
      color:
        KhedmatPalette.textSecondary,
      textAlign: "center",
      lineHeight: 21,
    },

    pressed: {
      opacity: 0.72,
    },
  });
