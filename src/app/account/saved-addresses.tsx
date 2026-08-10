import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  KhedmatPalette,
  Layout,
  Radius,
  Spacing,
  Typography,
} from "../../constants/theme";
import {
  type CustomerAddress,
  type CustomerAddressLabel,
  useCustomerAddresses,
} from "../../context/customer-address-context";
import { useLanguage } from "../../context/languagecontext";

type LanguageName =
  | "English"
  | "Dari"
  | "Pashto";

type IconName =
  keyof typeof Ionicons.glyphMap;

export default function SavedAddressesScreen() {
  const router = useRouter();

  const {
    language,
    t,
  } = useLanguage();

  const {
    addresses,
    deleteAddress,
  } = useCustomerAddresses();

  const activeLanguage =
    normalizeLanguage(
      language,
    );

  const isRtl =
    activeLanguage === "Dari" ||
    activeLanguage === "Pashto";

  const openCreateAddress =
    (): void => {
      router.push({
        pathname:
          "/manual-address",
        params: {
          mode: "create",
          returnTo:
            "saved-addresses",
        },
      });
    };

  const openEditAddress =
    (
      addressId: string,
    ): void => {
      router.push({
        pathname:
          "/manual-address",
        params: {
          mode: "edit",
          addressId,
          returnTo:
            "saved-addresses",
        },
      });
    };

  const confirmDeleteAddress =
    (
      address: CustomerAddress,
    ): void => {
      const addressLabel =
        getAddressLabel(
          address,
          activeLanguage,
          t(
            "homeAddressLabel",
          ),
          t(
            "workAddressLabel",
          ),
          t(
            "otherAddressLabel",
          ),
        );

      Alert.alert(
        t("deleteAddressTitle"),
        t(
          "deleteAddressConfirmation",
        ).replace(
          "{label}",
          addressLabel,
        ),
        [
          {
            text: t("cancelAction"),
            style: "cancel",
          },
          {
            text: t("deleteAddress"),
            style:
              "destructive",
            onPress: () => {
              void deleteAddress(
                address.id,
              ).catch(
                (error) => {
                  console.error(
                    "Failed to delete saved address:",
                    error,
                  );

                  Alert.alert(
                    t("deleteAddressErrorTitle"),
                    t("deleteAddressErrorMessage"),
                  );
                },
              );
            },
          },
        ],
      );
    };

  return (
    <SafeAreaView
      style={styles.safeArea}
    >
      <View
        style={[
          styles.header,
          {
            flexDirection:
              isRtl
                ? "row-reverse"
                : "row",
          },
        ]}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={
            t("back")
          }
          onPress={() =>
            router.back()
          }
          style={({
            pressed,
          }) => [
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
            size={22}
            color={
              KhedmatPalette.navy900
            }
          />
        </Pressable>

        <Text
          style={[
            styles.title,
            directionStyle(
              isRtl,
            ),
          ]}
        >
          {t("savedAddressesTitle")}
        </Text>

        <View
          style={
            styles.headerSpacer
          }
        />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={
          styles.scrollContent
        }
      >
        {addresses.length >
        0 ? (
          <View
            style={
              styles.addressList
            }
          >
            {addresses.map(
              (address) => (
                <AddressCard
                  key={
                    address.id
                  }
                  address={
                    address
                  }
                  language={
                    activeLanguage
                  }
                  homeLabel={
                    t(
                      "homeAddressLabel",
                    )
                  }
                  workLabel={
                    t(
                      "workAddressLabel",
                    )
                  }
                  otherLabel={
                    t(
                      "otherAddressLabel",
                    )
                  }
                  isRtl={
                    isRtl
                  }
                  editLabel={
                    t("editAddress")
                  }
                  deleteLabel={
                    t("deleteAddress")
                  }
                  onEdit={() =>
                    openEditAddress(
                      address.id,
                    )
                  }
                  onDelete={() =>
                    confirmDeleteAddress(
                      address,
                    )
                  }
                />
              ),
            )}
          </View>
        ) : (
          <View
            style={
              styles.emptyState
            }
          >
            <View
              style={
                styles.emptyIcon
              }
            >
              <Ionicons
                name="location-outline"
                size={30}
                color={
                  KhedmatPalette.blue500
                }
              />
            </View>

            <Text
              style={[
                styles.emptyTitle,
                directionStyle(
                  isRtl,
                ),
              ]}
            >
              {t("noSavedAddressesTitle")}
            </Text>

            <Text
              style={[
                styles.emptySubtitle,
                directionStyle(
                  isRtl,
                ),
              ]}
            >
              {
                t("noSavedAddressesSubtitle")
              }
            </Text>
          </View>
        )}

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={
            t("addNewAddress")
          }
          onPress={
            openCreateAddress
          }
          style={({
            pressed,
          }) => [
            styles.addButton,
            {
              flexDirection:
                isRtl
                  ? "row-reverse"
                  : "row",
            },
            pressed &&
              styles.pressed,
          ]}
        >
          <Ionicons
            name="add"
            size={20}
            color={
              KhedmatPalette.blue500
            }
          />

          <Text
            style={[
              styles.addButtonText,
              directionStyle(
                isRtl,
              ),
            ]}
          >
            {t("addNewAddress")}
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

type AddressCardProps = {
  address: CustomerAddress;
  language: LanguageName;
  homeLabel: string;
  workLabel: string;
  otherLabel: string;
  isRtl: boolean;
  editLabel: string;
  deleteLabel: string;
  onEdit: () => void;
  onDelete: () => void;
};

function AddressCard({
  address,
  language,
  homeLabel,
  workLabel,
  otherLabel,
  isRtl,
  editLabel,
  deleteLabel,
  onEdit,
  onDelete,
}: AddressCardProps) {
  const icon =
    getAddressIcon(
      address.label,
    );

  const label =
    getAddressLabel(
      address,
      language,
      homeLabel,
      workLabel,
      otherLabel,
    );

  return (
    <View
      style={[
        styles.card,
        {
          flexDirection:
            isRtl
              ? "row-reverse"
              : "row",
        },
      ]}
    >
      <View
        style={
          styles.iconContainer
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
          styles.cardBody
        }
      >
        <Text
          numberOfLines={1}
          style={[
            styles.cardTitle,
            directionStyle(
              isRtl,
            ),
          ]}
        >
          {label}
        </Text>

        <Text
          numberOfLines={3}
          style={[
            styles.cardSubtitle,
            directionStyle(
              isRtl,
            ),
          ]}
        >
          {address.fullAddress}
        </Text>
      </View>

      <View
        style={
          styles.actions
        }
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={
            editLabel
          }
          hitSlop={8}
          onPress={onEdit}
          style={({
            pressed,
          }) => [
            styles.actionIcon,
            pressed &&
              styles.pressed,
          ]}
        >
          <Ionicons
            name="create-outline"
            size={19}
            color={
              KhedmatPalette.textSecondary
            }
          />
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={
            deleteLabel
          }
          hitSlop={8}
          onPress={onDelete}
          style={({
            pressed,
          }) => [
            styles.actionIcon,
            pressed &&
              styles.pressed,
          ]}
        >
          <Ionicons
            name="trash-outline"
            size={18}
            color={
              KhedmatPalette.textMuted
            }
          />
        </Pressable>
      </View>
    </View>
  );
}

function getAddressIcon(
  label: CustomerAddressLabel,
): IconName {
  if (label === "home") {
    return "home-outline";
  }

  if (label === "work") {
    return "briefcase-outline";
  }

  return "location-outline";
}

function getAddressLabel(
  address: CustomerAddress,
  language: LanguageName,
  homeLabel: string,
  workLabel: string,
  otherLabel: string,
): string {
  void language;

  if (
    address.label === "other" &&
    address.customLabel
  ) {
    return address.customLabel;
  }

  if (
    address.label === "home"
  ) {
    return homeLabel;
  }

  if (
    address.label === "work"
  ) {
    return workLabel;
  }

  return otherLabel;
}

function normalizeLanguage(
  language: string,
): LanguageName {
  if (
    language === "Dari"
  ) {
    return "Dari";
  }

  if (
    language === "Pashto"
  ) {
    return "Pashto";
  }

  return "English";
}

function directionStyle(
  isRtl: boolean,
) {
  return {
    textAlign:
      isRtl
        ? ("right" as const)
        : ("left" as const),

    writingDirection:
      isRtl
        ? ("rtl" as const)
        : ("ltr" as const),
  };
}

const styles =
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor:
        KhedmatPalette.white,
    },

    header: {
      width: "100%",
      maxWidth:
        Layout.contentMaxWidth,
      alignSelf: "center",
      minHeight: 64,
      alignItems: "center",
      paddingHorizontal:
        Layout.screenPadding,
      paddingVertical:
        Spacing.sm,
    },

    backButton: {
      width: 42,
      height: 42,
      flexShrink: 0,
      borderRadius:
        Radius.pill,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor:
        KhedmatPalette.white,
      borderWidth:
        StyleSheet.hairlineWidth,
      borderColor:
        KhedmatPalette.blue200,
    },

    title: {
      ...Typography.screenTitle,
      flex: 1,
      color:
        KhedmatPalette.textPrimary,
      fontSize: 22,
      lineHeight: 28,
      textAlign: "center",
    },

    headerSpacer: {
      width: 42,
      height: 42,
      flexShrink: 0,
    },

    scrollContent: {
      width: "100%",
      maxWidth:
        Layout.contentMaxWidth,
      alignSelf: "center",
      flexGrow: 1,
      paddingHorizontal:
        Layout.screenPadding,
      paddingTop: Spacing.md,
      paddingBottom:
        Spacing.xxl,
    },

    addressList: {
      width: "100%",
      gap: Spacing.sm,
    },

    card: {
      width: "100%",
      minHeight: 96,
      alignItems: "center",
      padding:
        Spacing.md,
      borderRadius:
        Radius.lg,
      backgroundColor:
        KhedmatPalette.white,
      borderWidth:
        StyleSheet.hairlineWidth,
      borderColor:
        KhedmatPalette.blue200,
      shadowColor:
        KhedmatPalette.navy900,
      shadowOffset: {
        width: 0,
        height: 3,
      },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
    },

    iconContainer: {
      width: 42,
      height: 42,
      flexShrink: 0,
      borderRadius:
        Radius.md,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor:
        KhedmatPalette.blue050,
      marginHorizontal:
        Spacing.sm,
    },

    cardBody: {
      flex: 1,
      minWidth: 0,
      paddingVertical: 2,
    },

    cardTitle: {
      ...Typography.label,
      width: "100%",
      color:
        KhedmatPalette.textPrimary,
      fontSize: 15,
      lineHeight: 20,
    },

    cardSubtitle: {
      ...Typography.captionStyle,
      width: "100%",
      marginTop: 3,
      color:
        KhedmatPalette.textSecondary,
      lineHeight: 18,
    },

    actions: {
      flexShrink: 0,
      alignItems: "center",
      justifyContent: "center",
      gap: 2,
    },

    actionIcon: {
      width: 34,
      height: 34,
      alignItems: "center",
      justifyContent: "center",
      borderRadius:
        Radius.pill,
    },

    addButton: {
      width: "100%",
      minHeight: 54,
      marginTop:
        Spacing.lg,
      paddingHorizontal:
        Spacing.md,
      alignItems: "center",
      justifyContent: "center",
      gap: Spacing.xs,
      borderWidth:
        StyleSheet.hairlineWidth,
      borderStyle: "dashed",
      borderColor:
        KhedmatPalette.blue500,
      borderRadius:
        Radius.lg,
      backgroundColor:
        KhedmatPalette.white,
    },

    addButtonText: {
      ...Typography.label,
      color:
        KhedmatPalette.blue500,
      fontSize: 14,
      lineHeight: 19,
    },

    emptyState: {
      width: "100%",
      flex: 1,
      minHeight: 260,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal:
        Spacing.xl,
    },

    emptyIcon: {
      width: 64,
      height: 64,
      marginBottom:
        Spacing.md,
      borderRadius:
        Radius.pill,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor:
        KhedmatPalette.blue050,
      borderWidth:
        StyleSheet.hairlineWidth,
      borderColor:
        KhedmatPalette.blue200,
    },

    emptyTitle: {
      ...Typography.sectionTitle,
      width: "100%",
      color:
        KhedmatPalette.textPrimary,
      textAlign: "center",
      fontSize: 18,
      lineHeight: 24,
    },

    emptySubtitle: {
      ...Typography.bodyStyle,
      width: "100%",
      maxWidth: 320,
      marginTop:
        Spacing.xs,
      color:
        KhedmatPalette.textSecondary,
      textAlign: "center",
      lineHeight: 22,
    },

    pressed: {
      opacity: 0.75,
    },
  });
