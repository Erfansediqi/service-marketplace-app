import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  ComponentProps,
  useMemo,
  useState,
} from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import {
  Fonts,
  KhedmatPalette,
  Layout,
  Radius,
  Shadows,
  Spacing,
  Typography,
} from "../constants/theme";
import {
  BookingAddress,
  useBooking,
} from "../context/booking-context";
import {
  type CustomerAddress,
  useCustomerAddresses,
} from "../context/customer-address-context";
import { useLanguage } from "../context/languagecontext";

type IconName =
  ComponentProps<typeof Ionicons>["name"];

type LanguageName =
  | "English"
  | "Dari"
  | "Pashto";

type AddressOption = BookingAddress & {
  icon: IconName;
  subtitleKey:
    | "primaryAddress"
    | "savedAddress";
};

type DetailsCopy = ReturnType<
  typeof getDetailsCopy
>;

const CURRENT_STEP = 3;
const TOTAL_STEPS = 4;
const MINIMUM_ADDRESS_LENGTH = 8;
const MINIMUM_NOTES_LENGTH = 10;
const MAXIMUM_NOTES_LENGTH = 700;
const MAXIMUM_ACCESS_NOTES_LENGTH = 300;

const SUCCESS = "#268A57";
const SUCCESS_SOFT = "#E8F6EE";
const ERROR = "#B3261E";
const ERROR_SOFT = "#FCE8E6";

export default function BookingDetailsScreen() {
  const router = useRouter();

  const {
    bookingDraft,
    updateBookingDraft,
  } = useBooking();

  const {
    addresses: customerAddresses,
  } = useCustomerAddresses();

  const { language } =
    useLanguage();

  const activeLanguage =
    normalizeLanguage(language);

  const isRtl =
    activeLanguage === "Dari" ||
    activeLanguage === "Pashto";

  const localizedDigits =
    activeLanguage !== "English";

  const copy =
    getDetailsCopy(
      activeLanguage,
    );

  const savedAddressOptions =
    useMemo<AddressOption[]>(
      () =>
        customerAddresses.map(
          (address) =>
            toBookingAddressOption(
              address,
              activeLanguage,
            ),
        ),
      [
        activeLanguage,
        customerAddresses,
      ],
    );

  const initialAddressId =
    bookingDraft.address?.id &&
    savedAddressOptions.some(
      (address) =>
        address.id ===
        bookingDraft.address?.id,
    )
      ? bookingDraft.address.id
      : "";

  const initialManualAddress =
    bookingDraft.address &&
    !initialAddressId
      ? bookingDraft.address
          .fullAddress
      : "";

  const [
    selectedAddressId,
    setSelectedAddressId,
  ] = useState(
    initialAddressId,
  );

  const [
    manualAddressEnabled,
    setManualAddressEnabled,
  ] = useState(
    Boolean(
      initialManualAddress,
    ),
  );

  const [
    manualAddress,
    setManualAddress,
  ] = useState(
    initialManualAddress,
  );

  const [notes, setNotes] =
    useState(
      extractPrimaryNotes(
        bookingDraft.notes,
      ),
    );

  const [
    accessNotes,
    setAccessNotes,
  ] = useState(
    extractAccessNotes(
      bookingDraft.notes,
    ),
  );

  const [
    submitted,
    setSubmitted,
  ] = useState(false);

  const selectedSavedAddress =
    useMemo(
      () =>
        savedAddressOptions.find(
          (address) =>
            address.id ===
            selectedAddressId,
        ) ?? null,
      [
        savedAddressOptions,
        selectedAddressId,
      ],
    );

  const resolvedAddress =
    useMemo<BookingAddress | null>(
      () => {
        if (
          manualAddressEnabled
        ) {
          const normalized =
            manualAddress.trim();

          if (
            normalized.length <
            MINIMUM_ADDRESS_LENGTH
          ) {
            return null;
          }

          return {
            label:
              copy.otherAddress,
            fullAddress:
              normalized,
          };
        }

        if (
          !selectedSavedAddress
        ) {
          return null;
        }

        return {
          id:
            selectedSavedAddress.id,
          label:
            selectedSavedAddress.label,
          fullAddress:
            selectedSavedAddress.fullAddress,
          latitude:
            selectedSavedAddress.latitude,
          longitude:
            selectedSavedAddress.longitude,
        };
      },
      [
        copy.otherAddress,
        manualAddress,
        manualAddressEnabled,
        selectedSavedAddress,
      ],
    );

  const addressError =
    submitted &&
    !resolvedAddress
      ? manualAddressEnabled
        ? copy.manualAddressError(
            formatDigits(
              MINIMUM_ADDRESS_LENGTH.toString(),
              localizedDigits,
            ),
          )
        : copy.addressSelectionError
      : undefined;

  const notesError =
    submitted &&
    notes.trim().length <
      MINIMUM_NOTES_LENGTH
      ? copy.notesError(
          formatDigits(
            MINIMUM_NOTES_LENGTH.toString(),
            localizedDigits,
          ),
        )
      : undefined;

  const formIsValid =
    Boolean(resolvedAddress) &&
    notes.trim().length >=
      MINIMUM_NOTES_LENGTH;

  const notesProgress =
    Math.min(
      100,
      Math.round(
        (notes.trim().length /
          MINIMUM_NOTES_LENGTH) *
          100,
      ),
    );

  const selectSavedAddress = (
    addressId: string,
  ) => {
    setSelectedAddressId(
      addressId,
    );
    setManualAddressEnabled(
      false,
    );

    if (submitted) {
      setSubmitted(false);
    }
  };

  const enableManualAddress =
    () => {
      setSelectedAddressId("");
      setManualAddressEnabled(
        true,
      );

      if (submitted) {
        setSubmitted(false);
      }
    };

  const handleManualAddressChange =
    (value: string) => {
      setManualAddress(value);

      if (submitted) {
        setSubmitted(false);
      }
    };

  const handleNotesChange = (
    value: string,
  ) => {
    setNotes(value);

    if (submitted) {
      setSubmitted(false);
    }
  };

  const handleContinue = () => {
    setSubmitted(true);

    if (
      !formIsValid ||
      !resolvedAddress
    ) {
      return;
    }

    const combinedNotes = [
      notes.trim(),
      accessNotes.trim()
        ? `${copy.accessNotePrefix}: ${accessNotes.trim()}`
        : "",
    ]
      .filter(Boolean)
      .join("\n\n");

    updateBookingDraft({
      address:
        resolvedAddress,
      notes: combinedNotes,
    });

    router.push(
      "/booking-summary",
    );
  };

  return (
    <SafeAreaView
      style={styles.safeArea}
    >
      <KeyboardAvoidingView
        style={styles.root}
        behavior={
          Platform.OS === "ios"
            ? "padding"
            : undefined
        }
      >
        <ScrollView
          showsVerticalScrollIndicator={
            false
          }
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={
            styles.scrollContent
          }
        >
          <View
            style={[
              styles.topBar,
              {
                flexDirection: isRtl
                  ? "row-reverse"
                  : "row",
              },
            ]}
          >
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={
                copy.back
              }
              hitSlop={8}
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
                  KhedmatPalette
                    .navy900
                }
              />
            </Pressable>

            <View
              style={
                styles.stepBadge
              }
            >
              <Text
                style={[
                  styles.stepText,
                  directionStyle(
                    isRtl,
                  ),
                ]}
              >
                {copy.step(
                  formatDigits(
                    CURRENT_STEP.toString(),
                    localizedDigits,
                  ),
                  formatDigits(
                    TOTAL_STEPS.toString(),
                    localizedDigits,
                  ),
                )}
              </Text>
            </View>
          </View>

          <View
            style={styles.header}
          >
            <Text
              style={[
                styles.title,
                directionStyle(
                  isRtl,
                ),
              ]}
            >
              {copy.title}
            </Text>
          </View>

          <View
            style={[
              styles.bookingSummaryCard,
              {
                flexDirection: isRtl
                  ? "row-reverse"
                  : "row",
              },
            ]}
          >
            <View
              style={
                styles.bookingSummaryIcon
              }
            >
              <Ionicons
                name="calendar-outline"
                size={23}
                color={
                  KhedmatPalette
                    .blue500
                }
              />
            </View>

            <View
              style={[
                styles.bookingSummaryCopy,
                {
                  alignItems: isRtl
                    ? "flex-end"
                    : "flex-start",
                },
              ]}
            >
              <Text
                numberOfLines={1}
                style={[
                  styles.bookingSummaryTitle,
                  directionStyle(
                    isRtl,
                  ),
                ]}
              >
                {bookingDraft.serviceName ||
                  copy.serviceFallback}
              </Text>

              <Text
                numberOfLines={2}
                style={[
                  styles.bookingSummarySubtitle,
                  directionStyle(
                    isRtl,
                  ),
                ]}
              >
                {formatBookingDate(
                  bookingDraft.date,
                  activeLanguage,
                )}
                {" · "}
                {formatTime(
                  bookingDraft.time,
                  activeLanguage,
                )}
              </Text>
            </View>

            <View
              style={
                styles.providerBadge
              }
            >
              <Ionicons
                name="person-outline"
                size={15}
                color={
                  KhedmatPalette
                    .blue500
                }
              />

              <Text
                numberOfLines={2}
                style={[
                  styles.providerBadgeText,
                  directionStyle(
                    isRtl,
                  ),
                ]}
              >
                {bookingDraft.providerName ||
                  copy.providerFallback}
              </Text>
            </View>
          </View>

          <View
            style={styles.section}
          >
            <Text
              style={[
                styles.sectionTitle,
                directionStyle(
                  isRtl,
                ),
              ]}
            >
              {copy.addressTitle}
            </Text>

            <View
              style={styles.addresses}
            >
              {savedAddressOptions.map(
                (address) => {
                  const selected =
                    !manualAddressEnabled &&
                    selectedAddressId ===
                      address.id;

                  return (
                    <AddressCard
                      key={address.id}
                      address={address}
                      selected={
                        selected
                      }
                      subtitle={
                        copy[
                          address.subtitleKey
                        ]
                      }
                      isRtl={isRtl}
                      onPress={() =>
                        selectSavedAddress(
                          address.id ??
                            "",
                        )
                      }
                    />
                  );
                },
              )}

              {savedAddressOptions.length ===
              0 ? (
                <View
                  style={
                    styles.savedAddressEmpty
                  }
                >
                  <Ionicons
                    name="location-outline"
                    size={20}
                    color={
                      KhedmatPalette.textMuted
                    }
                  />

                  <Text
                    style={[
                      styles.savedAddressEmptyText,
                      directionStyle(
                        isRtl,
                      ),
                    ]}
                  >
                    {
                      copy.noSavedAddresses
                    }
                  </Text>
                </View>
              ) : null}

              <Pressable
                accessibilityRole="radio"
                accessibilityLabel={
                  copy.otherAddress
                }
                accessibilityState={{
                  selected:
                    manualAddressEnabled,
                }}
                onPress={
                  enableManualAddress
                }
                style={({ pressed }) => [
                  styles.addressCard,
                  manualAddressEnabled &&
                    styles.addressCardSelected,
                  pressed &&
                    styles.cardPressed,
                ]}
              >
                <View
                  style={[
                    styles.addressCardContent,
                    {
                      flexDirection: isRtl
                        ? "row-reverse"
                        : "row",
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.addressIcon,
                      manualAddressEnabled &&
                        styles.addressIconSelected,
                    ]}
                  >
                    <Ionicons
                      name="add-outline"
                      size={23}
                      color={
                        manualAddressEnabled
                          ? KhedmatPalette
                              .white
                          : KhedmatPalette
                              .blue500
                      }
                    />
                  </View>

                  <View
                    style={[
                      styles.addressCopy,
                      {
                        alignItems: isRtl
                          ? "flex-end"
                          : "flex-start",
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.addressTitleText,
                        manualAddressEnabled &&
                          styles.addressTitleSelected,
                        directionStyle(
                          isRtl,
                        ),
                      ]}
                    >
                      {copy.otherAddress}
                    </Text>

                    <Text
                      style={[
                        styles.fullAddressText,
                        directionStyle(
                          isRtl,
                        ),
                      ]}
                    >
                      {copy.otherAddressSubtitle}
                    </Text>
                  </View>

                  <Radio
                    selected={
                      manualAddressEnabled
                    }
                  />
                </View>
              </Pressable>

              {manualAddressEnabled ? (
                <View
                  style={styles.field}
                >
                  <Text
                    style={[
                      styles.fieldLabel,
                      directionStyle(
                        isRtl,
                      ),
                    ]}
                  >
                    {
                      copy.completeAddress
                    }
                  </Text>

                  <View
                    style={[
                      styles.inputShell,
                      addressError &&
                        styles.inputShellError,
                    ]}
                  >
                    <TextInput
                      value={
                        manualAddress
                      }
                      onChangeText={
                        handleManualAddressChange
                      }
                      placeholder={
                        copy.addressPlaceholder
                      }
                      placeholderTextColor={
                        KhedmatPalette
                          .textMuted
                      }
                      selectionColor={
                        KhedmatPalette
                          .blue500
                      }
                      multiline
                      numberOfLines={4}
                      maxLength={220}
                      textAlignVertical="top"
                      style={[
                        styles.multilineInput,
                        styles.addressInput,
                        directionStyle(
                          isRtl,
                        ),
                      ]}
                    />
                  </View>

                  {addressError ? (
                    <ErrorText
                      text={
                        addressError
                      }
                      isRtl={isRtl}
                    />
                  ) : (
                    <Text
                      style={[
                        styles.fieldHint,
                        directionStyle(
                          isRtl,
                        ),
                      ]}
                    >
                      {
                        copy.addressHint
                      }
                    </Text>
                  )}
                </View>
              ) : addressError ? (
                <ErrorText
                  text={addressError}
                  isRtl={isRtl}
                />
              ) : null}
            </View>
          </View>

          <View
            style={styles.section}
          >
            <Text
              style={[
                styles.sectionTitle,
                directionStyle(
                  isRtl,
                ),
              ]}
            >
              {copy.problemTitle}
            </Text>

            <View
              style={[
                styles.inputShell,
                styles.largeInputShell,
                notesError &&
                  styles.inputShellError,
              ]}
            >
              <TextInput
                value={notes}
                onChangeText={
                  handleNotesChange
                }
                placeholder={
                  copy.notesPlaceholder
                }
                placeholderTextColor={
                  KhedmatPalette
                    .textMuted
                }
                selectionColor={
                  KhedmatPalette
                    .blue500
                }
                multiline
                numberOfLines={7}
                maxLength={
                  MAXIMUM_NOTES_LENGTH
                }
                textAlignVertical="top"
                style={[
                  styles.multilineInput,
                  styles.notesInput,
                  directionStyle(
                    isRtl,
                  ),
                ]}
              />

            </View>

            {notesError ? (
              <ErrorText
                text={notesError}
                isRtl={isRtl}
              />
            ) : null}
          </View>

          <View
            style={styles.section}
          >
            <Text
              style={[
                styles.sectionTitle,
                directionStyle(
                  isRtl,
                ),
              ]}
            >
              {copy.accessTitle}
            </Text>

            <View
              style={[
                styles.inputShell,
                styles.mediumInputShell,
              ]}
            >
              <TextInput
                value={
                  accessNotes
                }
                onChangeText={
                  setAccessNotes
                }
                placeholder={
                  copy.accessPlaceholder
                }
                placeholderTextColor={
                  KhedmatPalette
                    .textMuted
                }
                selectionColor={
                  KhedmatPalette
                    .blue500
                }
                multiline
                numberOfLines={4}
                maxLength={
                  MAXIMUM_ACCESS_NOTES_LENGTH
                }
                textAlignVertical="top"
                style={[
                  styles.multilineInput,
                  styles.accessInput,
                  directionStyle(
                    isRtl,
                  ),
                ]}
              />
            </View>
          </View>

        </ScrollView>

        <View style={styles.footer}>
          <View
            style={
              styles.footerContent
            }
          >
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={
                copy.continue
              }
              onPress={
                handleContinue
              }
              style={({ pressed }) => [
                styles.primaryButton,
                pressed &&
                  styles.primaryButtonPressed,
              ]}
            >
              <View
                style={[
                  styles.primaryButtonContent,
                  {
                    flexDirection: isRtl
                      ? "row-reverse"
                      : "row",
                  },
                ]}
              >
                <Ionicons
                  name="receipt-outline"
                  size={20}
                  color={
                    KhedmatPalette
                      .white
                  }
                />

                <Text
                  style={[
                    styles.primaryButtonText,
                    directionStyle(
                      isRtl,
                    ),
                  ]}
                >
                  {copy.continue}
                </Text>

                <Ionicons
                  name={
                    isRtl
                      ? "arrow-back"
                      : "arrow-forward"
                  }
                  size={19}
                  color={
                    KhedmatPalette
                      .white
                  }
                />
              </View>
            </Pressable>


          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function toBookingAddressOption(
  address: CustomerAddress,
  language: LanguageName,
): AddressOption {
  return {
    id: address.id,
    label:
      getSavedAddressLabel(
        address,
        language,
      ),
    fullAddress:
      address.fullAddress,
    latitude:
      address.latitude ??
      undefined,
    longitude:
      address.longitude ??
      undefined,
    icon:
      address.label === "home"
        ? "home-outline"
        : address.label === "work"
          ? "business-outline"
          : "location-outline",
    subtitleKey:
      address.label === "home"
        ? "primaryAddress"
        : "savedAddress",
  };
}

function getSavedAddressLabel(
  address: CustomerAddress,
  language: LanguageName,
): string {
  if (
    address.label === "other" &&
    address.customLabel
  ) {
    return address.customLabel;
  }

  if (language === "Dari") {
    if (address.label === "home") {
      return "خانه";
    }

    if (address.label === "work") {
      return "محل کار";
    }

    return "آدرس";
  }

  if (language === "Pashto") {
    if (address.label === "home") {
      return "کور";
    }

    if (address.label === "work") {
      return "کار";
    }

    return "پته";
  }

  if (address.label === "home") {
    return "Home";
  }

  if (address.label === "work") {
    return "Work";
  }

  return "Saved address";
}

function AddressCard({
  address,
  selected,
  subtitle,
  isRtl,
  onPress,
}: {
  address: AddressOption;
  selected: boolean;
  subtitle: string;
  isRtl: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityLabel={
        address.label
      }
      accessibilityState={{
        selected,
      }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.addressCard,
        selected &&
          styles.addressCardSelected,
        pressed &&
          styles.cardPressed,
      ]}
    >
      <View
        style={[
          styles.addressCardContent,
          {
            flexDirection: isRtl
              ? "row-reverse"
              : "row",
          },
        ]}
      >
        <View
          style={[
            styles.addressIcon,
            selected &&
              styles.addressIconSelected,
          ]}
        >
          <Ionicons
            name={address.icon}
            size={23}
            color={
              selected
                ? KhedmatPalette
                    .white
                : KhedmatPalette
                    .blue500
            }
          />
        </View>

        <View
          style={[
            styles.addressCopy,
            {
              alignItems: isRtl
                ? "flex-end"
                : "flex-start",
            },
          ]}
        >
          <View
            style={[
              styles.addressTitleRow,
              {
                flexDirection: isRtl
                  ? "row-reverse"
                  : "row",
              },
            ]}
          >
            <Text
              style={[
                styles.addressTitleText,
                selected &&
                  styles.addressTitleSelected,
                directionStyle(
                  isRtl,
                ),
              ]}
            >
              {address.label}
            </Text>

            <Text
              style={[
                styles.addressSubtitleText,
                directionStyle(
                  isRtl,
                ),
              ]}
            >
              {subtitle}
            </Text>
          </View>

          <Text
            style={[
              styles.fullAddressText,
              directionStyle(isRtl),
            ]}
          >
            {address.fullAddress}
          </Text>
        </View>

        <Radio
          selected={selected}
        />
      </View>
    </Pressable>
  );
}

function Radio({
  selected,
}: {
  selected: boolean;
}) {
  return (
    <View
      style={[
        styles.radioOuter,
        selected &&
          styles.radioOuterSelected,
      ]}
    >
      {selected ? (
        <View
          style={styles.radioInner}
        />
      ) : null}
    </View>
  );
}

function ErrorText({
  text,
  isRtl,
}: {
  text: string;
  isRtl: boolean;
}) {
  return (
    <View
      style={[
        styles.errorRow,
        {
          flexDirection: isRtl
            ? "row-reverse"
            : "row",
        },
      ]}
    >
      <Ionicons
        name="alert-circle-outline"
        size={15}
        color={ERROR}
      />

      <Text
        style={[
          styles.errorText,
          directionStyle(isRtl),
        ]}
      >
        {text}
      </Text>
    </View>
  );
}

function extractPrimaryNotes(
  value: string,
): string {
  if (!value) {
    return "";
  }

  return (
    value
      .split("\n\n")[0]
      ?.trim() ?? ""
  );
}

function extractAccessNotes(
  value: string,
): string {
  if (!value) {
    return "";
  }

  const parts =
    value.split("\n\n");

  if (parts.length < 2) {
    return "";
  }

  return parts
    .slice(1)
    .join("\n\n")
    .replace(
      /^[^:：]+[:：]\s*/,
      "",
    )
    .trim();
}

function formatBookingDate(
  value: string,
  language: LanguageName,
): string {
  if (!value) {
    return language === "English"
      ? "Date not selected"
      : language === "Dari"
        ? "تاریخ انتخاب نشده"
        : "نېټه نه ده ټاکل شوې";
  }

  const date =
    parseLocalDate(value);

  if (!date) {
    return value;
  }

  const weekdays = {
    English: [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ],
    Dari: [
      "یک‌شنبه",
      "دوشنبه",
      "سه‌شنبه",
      "چهارشنبه",
      "پنج‌شنبه",
      "جمعه",
      "شنبه",
    ],
    Pashto: [
      "یکشنبه",
      "دوشنبه",
      "سه‌شنبه",
      "چهارشنبه",
      "پنجشنبه",
      "جمعه",
      "شنبه",
    ],
  } as const;

  const months = {
    English: [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ],
    Dari: [
      "جنوری",
      "فبروری",
      "مارچ",
      "اپریل",
      "می",
      "جون",
      "جولای",
      "اگست",
      "سپتمبر",
      "اکتوبر",
      "نوامبر",
      "دسمبر",
    ],
    Pashto: [
      "جنوري",
      "فبروري",
      "مارچ",
      "اپرېل",
      "می",
      "جون",
      "جولای",
      "اګست",
      "سپتمبر",
      "اکتوبر",
      "نومبر",
      "دسمبر",
    ],
  } as const;

  const day =
    formatDigits(
      date.getDate().toString(),
      language !== "English",
    );

  const year =
    formatDigits(
      date.getFullYear().toString(),
      language !== "English",
    );

  if (
    language === "English"
  ) {
    return `${weekdays.English[date.getDay()]}, ${months.English[date.getMonth()]} ${day}, ${year}`;
  }

  return `${weekdays[language][date.getDay()]}، ${day} ${months[language][date.getMonth()]} ${year}`;
}

function parseLocalDate(
  value: string,
): Date | null {
  const match =
    /^(\d{4})-(\d{2})-(\d{2})$/.exec(
      value,
    );

  if (!match) {
    const parsed =
      new Date(value);

    return Number.isNaN(
      parsed.getTime(),
    )
      ? null
      : parsed;
  }

  const year =
    Number(match[1]);

  const month =
    Number(match[2]) - 1;

  const day =
    Number(match[3]);

  const date =
    new Date(
      year,
      month,
      day,
    );

  return Number.isNaN(
    date.getTime(),
  )
    ? null
    : date;
}

function formatTime(
  value: string,
  language: LanguageName,
): string {
  if (!value) {
    return language === "English"
      ? "Time not selected"
      : language === "Dari"
        ? "زمان انتخاب نشده"
        : "وخت نه دی ټاکل شوی";
  }

  const [
    hourText,
    minute = "00",
  ] = value.split(":");

  const hour =
    Number(hourText);

  if (
    !Number.isFinite(hour)
  ) {
    return value;
  }

  if (
    language === "English"
  ) {
    const period =
      hour >= 12 ? "PM" : "AM";

    const displayHour =
      hour % 12 || 12;

    return `${displayHour}:${minute} ${period}`;
  }

  const displayHour =
    hour % 12 || 12;

  const period =
    hour < 12
      ? language === "Dari"
        ? "صبح"
        : "سهار"
      : hour === 12
        ? language === "Dari"
          ? "ظهر"
          : "غرمه"
        : hour < 18
          ? language === "Dari"
            ? "بعد از ظهر"
            : "ماسپښین"
          : language === "Dari"
            ? "عصر"
            : "ماښام";

  return `${formatDigits(
    `${displayHour}:${minute}`,
    true,
  )} ${period}`;
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
    textAlign: isRtl
      ? ("right" as const)
      : ("left" as const),
    writingDirection: isRtl
      ? ("rtl" as const)
      : ("ltr" as const),
  };
}

function formatDigits(
  value: string,
  localized: boolean,
): string {
  if (!localized) {
    return value;
  }

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

function getDetailsCopy(
  language: LanguageName,
) {
  if (
    language === "Dari"
  ) {
    return {
      back: "بازگشت",
      step:
        (
          current: string,
          total: string,
        ) =>
          `مرحله ${current} از ${total}`,
      eyebrow:
        "جزئیات خدمت",
      title:
        "آدرس و توضیحات کار را وارد کنید",
      subtitle:
        "محل انجام خدمت و معلومات لازم برای آماده‌شدن ارائه‌دهنده را مشخص کنید.",
      currentBooking:
        "رزرو فعلی",
      serviceFallback:
        "خدمت انتخاب‌شده",
      providerFallback:
        "ارائه‌دهنده",
      addressTitle:
        "آدرس انجام خدمت",
      addressSubtitle:
        "یک آدرس ذخیره‌شده را انتخاب کنید یا آدرس دیگری وارد نمایید.",
      required: "ضروری",
      optional: "اختیاری",
      primaryAddress:
        "آدرس اصلی",
      savedAddress:
        "آدرس ذخیره‌شده",
      noSavedAddresses:
        "هنوز آدرس ذخیره‌شده‌ای ندارید. می‌توانید آدرس این رزرو را در پایین وارد کنید.",
      otherAddress:
        "آدرس دیگر",
      otherAddressSubtitle:
        "آدرس جدید را فقط برای این رزرو وارد کنید.",
      completeAddress:
        "آدرس کامل",
      addressPlaceholder:
        "ولایت، شهر یا ولسوالی، ناحیه، سرک، کوچه و شمارهٔ خانه",
      addressHint:
        "آدرس را به‌گونه‌ای بنویسید که ارائه‌دهنده بتواند محل را بدون ابهام پیدا کند.",
      addressSelectionError:
        "لطفاً یک آدرس را انتخاب کنید.",
      manualAddressError:
        (value: string) =>
          `لطفاً آدرس کامل و معتبر با حداقل ${value} حرف وارد کنید.`,
      problemTitle:
        "توضیح مشکل یا کار",
      problemSubtitle:
        "توضیح روشن به ارائه‌دهنده کمک می‌کند ابزار، زمان و مواد مناسب را آماده کند.",
      requestDescription:
        "شرح درخواست",
      notesPlaceholder:
        "مثلاً برق دو اتاق قطع شده و فیوز چند بار خاموش می‌شود. مشکل از امروز صبح آغاز شده است...",
      notesError:
        (value: string) =>
          `لطفاً مشکل یا کار مورد نیاز را با حداقل ${value} حرف توضیح دهید.`,
      characterCount:
        (
          current: string,
          maximum: string,
        ) =>
          `${current} از ${maximum} حرف`,
      minimumCharacters:
        (value: string) =>
          `حداقل ${value} حرف`,
      accessTitle:
        "یادداشت دسترسی (اختیاری)",
      accessSubtitle:
        "معلوماتی را اضافه کنید که پیدا کردن محل یا تماس پیش از رسیدن را آسان‌تر می‌کند.",
      extraNote:
        "یادداشت اضافی",
      accessPlaceholder:
        "مثلاً قبل از رسیدن تماس بگیرید، زنگ در خراب است یا ورودی از کوچهٔ پشتی است...",
      accessHint:
        (
          current: string,
          maximum: string,
        ) =>
          `${current} از ${maximum} حرف`,
      accessNotePrefix:
        "یادداشت دسترسی و تماس",
      photosTitle:
        "افزودن عکس",
      photosSubtitle:
        "در نسخهٔ بعد می‌توانید عکس مشکل یا محل کار را به درخواست پیوست کنید.",
      comingSoon:
        "به‌زودی",
      privacyTitle:
        "آدرس فقط برای انجام این خدمت استفاده می‌شود",
      privacyText:
        "جزئیات دقیق محل در مرحلهٔ مناسب و فقط برای ارائه‌دهندهٔ مرتبط قابل مشاهده خواهد بود.",
      continue:
        "بررسی خلاصهٔ رزرو",
      ready:
        "آدرس و شرح درخواست آماده است.",
      completeRequired:
        "برای ادامه آدرس و شرح درخواست را تکمیل کنید.",
    };
  }

  if (
    language === "Pashto"
  ) {
    return {
      back: "بېرته",
      step:
        (
          current: string,
          total: string,
        ) =>
          `مرحله ${current} له ${total}`,
      eyebrow:
        "د خدمت جزئیات",
      title:
        "پته او د کار جزئیات ولیکئ",
      subtitle:
        "د خدمت ځای او هغه معلومات مشخص کړئ چې خدمت وړاندې کوونکی ورته د چمتووالي لپاره اړتیا لري.",
      currentBooking:
        "اوسنی رزرف",
      serviceFallback:
        "ټاکل شوی خدمت",
      providerFallback:
        "خدمت وړاندې کوونکی",
      addressTitle:
        "د خدمت پته",
      addressSubtitle:
        "یوه خوندي شوې پته وټاکئ یا نوې پته ولیکئ.",
      required: "اړین",
      optional: "اختیاري",
      primaryAddress:
        "اصلي پته",
      savedAddress:
        "خوندي شوې پته",
      noSavedAddresses:
        "تر اوسه خوندي شوې پته نه لرئ. د دې رزرف پته لاندې ولیکئ.",
      otherAddress:
        "بله پته",
      otherAddressSubtitle:
        "یوازې د دې رزرف لپاره نوې پته ولیکئ.",
      completeAddress:
        "بشپړه پته",
      addressPlaceholder:
        "ولایت، ښار یا ولسوالۍ، ناحیه، سړک، کوڅه او د کور شمېره",
      addressHint:
        "پته داسې ولیکئ چې خدمت وړاندې کوونکی ځای بې له ابهامه پیدا کړي.",
      addressSelectionError:
        "مهرباني وکړئ یوه پته وټاکئ.",
      manualAddressError:
        (value: string) =>
          `مهرباني وکړئ لږ تر لږه ${value} تورو یوه بشپړه او معتبره پته ولیکئ.`,
      problemTitle:
        "د ستونزې یا کار تشریح",
      problemSubtitle:
        "روښانه تشریح خدمت وړاندې کوونکي سره د مناسبو وسایلو، وخت او موادو په چمتو کولو کې مرسته کوي.",
      requestDescription:
        "د غوښتنې تشریح",
      notesPlaceholder:
        "د بېلګې په توګه: د دوو خونو برېښنا پرې شوې او فیوز څو ځله بندېږي. ستونزه نن سهار پیل شوې...",
      notesError:
        (value: string) =>
          `مهرباني وکړئ ستونزه یا اړین کار لږ تر لږه په ${value} تورو تشریح کړئ.`,
      characterCount:
        (
          current: string,
          maximum: string,
        ) =>
          `${current} له ${maximum} تورو`,
      minimumCharacters:
        (value: string) =>
          `لږ تر لږه ${value} توري`,
      accessTitle:
        "د لاسرسي او اړیکې لارښوونې",
      accessSubtitle:
        "هغه معلومات ورزیات کړئ چې د ځای موندل یا تر رسېدو مخکې اړیکه اسانه کوي.",
      extraNote:
        "اضافي یادښت",
      accessPlaceholder:
        "د بېلګې په توګه: تر رسېدو مخکې زنګ ووهئ، د دروازې زنګ خراب دی یا ننوتل له شا کوڅې دي...",
      accessHint:
        (
          current: string,
          maximum: string,
        ) =>
          `${current} له ${maximum} تورو`,
      accessNotePrefix:
        "د لاسرسي او اړیکې یادښت",
      photosTitle:
        "عکسونه ورزیات کړئ",
      photosSubtitle:
        "په راتلونکې نسخه کې به د ستونزې یا کار ځای عکسونه غوښتنې ته نښلولای شئ.",
      comingSoon:
        "ژر",
      privacyTitle:
        "پته یوازې د دې خدمت لپاره کارول کېږي",
      privacyText:
        "د ځای دقیق جزئیات به په مناسب پړاو کې یوازې اړوند خدمت وړاندې کوونکي ته ښکاره شي.",
      continue:
        "دوام",
      ready:
        "پته او د غوښتنې تشریح چمتو ده.",
      completeRequired:
        "د دوام لپاره پته او د غوښتنې تشریح بشپړه کړئ.",
    };
  }

  return {
    back: "Back",
    step:
      (
        current: string,
        total: string,
      ) =>
        `Step ${current} of ${total}`,
    eyebrow:
      "Service details",
    title:
      "Add the address and job details",
    subtitle:
      "Specify where the service will take place and what the provider should know before arriving.",
    currentBooking:
      "Current booking",
    serviceFallback:
      "Selected service",
    providerFallback:
      "Provider",
    addressTitle:
      "Service address",
    addressSubtitle:
      "Choose a saved address or enter another address for this booking.",
    required: "Required",
    optional: "Optional",
    primaryAddress:
      "Primary address",
    savedAddress:
      "Saved address",
    noSavedAddresses:
      "You do not have a saved address yet. You can enter an address for this booking below.",
    otherAddress:
      "Another address",
    otherAddressSubtitle:
      "Enter a new address for this booking only.",
    completeAddress:
      "Complete address",
    addressPlaceholder:
      "Province, city or district, area, street, alley and house number",
    addressHint:
      "Write the address clearly enough for the provider to find the location without ambiguity.",
    addressSelectionError:
      "Please select an address.",
    manualAddressError:
      (value: string) =>
        `Enter a complete and valid address using at least ${value} characters.`,
    problemTitle:
      "Describe the job",
    problemSubtitle:
      "A clear description helps the provider prepare the right tools, time and materials.",
    requestDescription:
      "Request description",
    notesPlaceholder:
      "For example: Electricity is out in two rooms and the breaker keeps switching off. The problem started this morning...",
    notesError:
      (value: string) =>
        `Describe the required work using at least ${value} characters.`,
    characterCount:
      (
        current: string,
        maximum: string,
      ) =>
        `${current} of ${maximum} characters`,
    minimumCharacters:
      (value: string) =>
        `Minimum ${value} characters`,
    accessTitle:
      "Access note (optional)",
    accessSubtitle:
      "Add details that make the location easier to find or explain how the provider should contact you before arrival.",
    extraNote:
      "Additional note",
    accessPlaceholder:
      "For example: Call before arriving, the doorbell is broken, or use the rear alley entrance...",
    accessHint:
      (
        current: string,
        maximum: string,
      ) =>
        `${current} of ${maximum} characters`,
    accessNotePrefix:
      "Access and contact note",
    photosTitle:
      "Add photos",
    photosSubtitle:
      "A future version will let you attach photos of the problem or work location.",
    comingSoon:
      "Coming soon",
    privacyTitle:
      "The address is used only to fulfil this service",
    privacyText:
      "Exact location details will be visible only to the relevant provider at the appropriate stage.",
    continue:
      "Continue",
    ready:
      "The address and request description are ready.",
    completeRequired:
      "Complete the address and request description to continue.",
  };
}

const styles =
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor:
        KhedmatPalette.white,
    },
    root: {
      flex: 1,
    },
    scrollContent: {
      width: "100%",
      maxWidth:
        Layout.contentMaxWidth,
      alignSelf: "center",
      paddingHorizontal:
        Layout.screenPadding,
      paddingTop: Spacing.md,
      paddingBottom: 120,
    },
    topBar: {
      width: "100%",
      minHeight:
        Layout.minimumTouchTarget,
      alignItems: "center",
      justifyContent:
        "space-between",
    },
    backButton: {
      width: 44,
      height: 44,
      borderRadius: Radius.pill,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor:
        KhedmatPalette.border,
      backgroundColor:
        KhedmatPalette.surface,
    },
    stepBadge: {
      minHeight: 34,
      paddingHorizontal:
        Spacing.md,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: Radius.pill,
      backgroundColor:
        KhedmatPalette.surfaceSoft,
    },
    stepText: {
      ...Typography.captionStyle,
      color:
        KhedmatPalette.blue500,
      fontFamily: Fonts.medium,
    },
    header: {
      width: "100%",
      marginTop: Spacing.lg,
    },
    headerIcon: {
      width: 64,
      height: 64,
      borderRadius: Radius.xl,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor:
        KhedmatPalette.navy900,
      ...Shadows.small,
    },
    headerCopy: {
      width: "100%",
      gap: Spacing.sm,
    },
    eyebrow: {
      ...Typography.captionStyle,
      width: "100%",
      color:
        KhedmatPalette.blue500,
      fontFamily: Fonts.medium,
    },
    title: {
      ...Typography.screenTitle,
      width: "100%",
      maxWidth: 470,
      color:
        KhedmatPalette.textPrimary,
      fontSize: 28,
      lineHeight: 35,
    },
    subtitle: {
      ...Typography.bodyLarge,
      width: "100%",
      maxWidth: 470,
      color:
        KhedmatPalette.textSecondary,
      lineHeight: 25,
    },
    bookingSummaryCard: {
      width: "100%",
      minHeight: 84,
      marginTop: Spacing.lg,
      padding: Spacing.md,
      alignItems: "center",
      gap: Spacing.md,
      borderWidth: 1,
      borderColor:
        KhedmatPalette.border,
      borderRadius: Radius.xl,
      backgroundColor:
        KhedmatPalette.surface,
      ...Shadows.small,
    },
    bookingSummaryIcon: {
      width: 40,
      height: 40,
      flexShrink: 0,
      borderRadius: Radius.lg,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor:
        KhedmatPalette.surfaceSoft,
    },
    bookingSummaryCopy: {
      flex: 1,
      gap: 2,
    },
    bookingSummaryEyebrow: {
      ...Typography.captionStyle,
      width: "100%",
      color:
        KhedmatPalette.blue500,
      fontFamily: Fonts.medium,
    },
    bookingSummaryTitle: {
      ...Typography.label,
      width: "100%",
      color:
        KhedmatPalette.textPrimary,
      fontSize: 17,
      lineHeight: 23,
    },
    bookingSummarySubtitle: {
      ...Typography.captionStyle,
      width: "100%",
      color:
        KhedmatPalette.textSecondary,
      lineHeight: 18,
    },
    providerBadge: {
      maxWidth: 112,
      flexShrink: 0,
      paddingHorizontal:
        Spacing.sm,
      paddingVertical: 7,
      alignItems: "center",
      justifyContent: "center",
      gap: 4,
      borderRadius: Radius.lg,
      backgroundColor:
        KhedmatPalette.surfaceSoft,
    },
    providerBadgeText: {
      ...Typography.captionStyle,
      color:
        KhedmatPalette.blue500,
      textAlign: "center",
      fontSize: 9,
      lineHeight: 13,
    },
    section: {
      width: "100%",
      marginTop:
        Spacing.xl,
      gap: Spacing.md,
    },
    sectionHeader: {
      width: "100%",
      gap: Spacing.xs,
    },
    sectionTitleRow: {
      width: "100%",
      alignItems: "center",
      justifyContent:
        "space-between",
      gap: Spacing.md,
    },
    sectionTitle: {
      ...Typography.sectionTitle,
      flex: 1,
      color:
        KhedmatPalette.textPrimary,
      fontSize: 18,
      lineHeight: 24,
    },
    sectionSubtitle: {
      ...Typography.captionStyle,
      width: "100%",
      color:
        KhedmatPalette.textMuted,
      lineHeight: 19,
    },
    requiredLabel: {
      ...Typography.captionStyle,
      color:
        KhedmatPalette.blue500,
      fontFamily: Fonts.medium,
      fontSize: 10,
    },
    optionalLabel: {
      ...Typography.captionStyle,
      color:
        KhedmatPalette.textMuted,
      fontSize: 10,
    },
    addresses: {
      width: "100%",
      gap: Spacing.md,
    },
    savedAddressEmpty: {
      width: "100%",
      minHeight: 58,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: Spacing.sm,
      paddingHorizontal:
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

    savedAddressEmptyText: {
      ...Typography.captionStyle,
      flex: 1,
      color:
        KhedmatPalette.textSecondary,
      lineHeight: 18,
    },

    addressCard: {
      width: "100%",
      minHeight: 82,
      borderWidth: 1,
      borderColor:
        KhedmatPalette.border,
      borderRadius: Radius.xl,
      backgroundColor:
        KhedmatPalette.surface,
      ...Shadows.small,
    },
    addressCardSelected: {
      borderColor:
        KhedmatPalette.blue500,
      backgroundColor:
        "#F4FBFC",
    },
    addressCardContent: {
      width: "100%",
      minHeight: 82,
      padding: Spacing.md,
      alignItems: "center",
      gap: Spacing.md,
    },
    addressIcon: {
      width: 42,
      height: 42,
      flexShrink: 0,
      borderRadius: Radius.lg,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor:
        KhedmatPalette.surfaceSoft,
    },
    addressIconSelected: {
      backgroundColor:
        KhedmatPalette.blue500,
    },
    addressCopy: {
      flex: 1,
      gap: 4,
    },
    addressTitleRow: {
      width: "100%",
      alignItems: "center",
      flexWrap: "wrap",
      gap: Spacing.sm,
    },
    addressTitleText: {
      ...Typography.label,
      flexShrink: 1,
      color:
        KhedmatPalette.textPrimary,
      fontSize: 16,
    },
    addressTitleSelected: {
      color:
        KhedmatPalette.navy900,
      fontFamily: Fonts.bold,
    },
    addressSubtitleText: {
      ...Typography.captionStyle,
      color:
        KhedmatPalette.blue500,
      fontFamily: Fonts.medium,
      fontSize: 9,
      paddingHorizontal:
        Spacing.sm,
      paddingVertical: 3,
      borderRadius: Radius.pill,
      backgroundColor:
        KhedmatPalette.surfaceSoft,
    },
    fullAddressText: {
      ...Typography.bodyStyle,
      width: "100%",
      color:
        KhedmatPalette.textSecondary,
      fontSize: 14,
      lineHeight: 20,
    },
    radioOuter: {
      width: 25,
      height: 25,
      flexShrink: 0,
      borderRadius: Radius.pill,
      borderWidth: 1.5,
      borderColor:
        KhedmatPalette.border,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor:
        KhedmatPalette.surface,
    },
    radioOuterSelected: {
      borderColor:
        KhedmatPalette.blue500,
    },
    radioInner: {
      width: 13,
      height: 13,
      borderRadius: Radius.pill,
      backgroundColor:
        KhedmatPalette.blue500,
    },
    field: {
      width: "100%",
      gap: Spacing.sm,
    },
    fieldLabel: {
      ...Typography.label,
      width: "100%",
      color:
        KhedmatPalette.textPrimary,
      fontSize: 15,
    },
    fieldHint: {
      ...Typography.captionStyle,
      width: "100%",
      color:
        KhedmatPalette.textMuted,
      lineHeight: 18,
    },
    inputShell: {
      width: "100%",
      padding: Spacing.md,
      borderWidth: 1,
      borderColor:
        KhedmatPalette.border,
      borderRadius: Radius.xl,
      backgroundColor:
        KhedmatPalette.surface,
      ...Shadows.small,
    },
    inputShellError: {
      borderColor: ERROR,
      backgroundColor:
        "#FFF9F8",
    },
    largeInputShell: {
      minHeight: 170,
    },
    mediumInputShell: {
      minHeight: 122,
    },
    inputHeader: {
      width: "100%",
      alignItems: "center",
      gap: Spacing.sm,
    },
    inputHeaderIcon: {
      width: 36,
      height: 36,
      flexShrink: 0,
      borderRadius: Radius.md,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor:
        KhedmatPalette.surfaceSoft,
    },
    inputHeaderText: {
      ...Typography.captionStyle,
      flex: 1,
      color:
        KhedmatPalette.textSecondary,
      lineHeight: 18,
    },
    multilineInput: {
      width: "100%",
      paddingHorizontal: 2,
      paddingTop: Spacing.sm,
      paddingBottom:
        Spacing.sm,
      color:
        KhedmatPalette.textPrimary,
      fontFamily: Fonts.regular,
      fontSize:
        Typography.body,
      lineHeight: 23,
    },
    addressInput: {
      minHeight: 104,
    },
    notesInput: {
      minHeight: 118,
    },
    accessInput: {
      minHeight: 82,
    },
    progressTrack: {
      width: "100%",
      height: 5,
      overflow: "hidden",
      borderRadius: Radius.pill,
      backgroundColor:
        KhedmatPalette.border,
    },
    progressFill: {
      height: "100%",
      borderRadius: Radius.pill,
      backgroundColor:
        KhedmatPalette.blue500,
    },
    progressFillValid: {
      backgroundColor:
        SUCCESS,
    },
    characterRow: {
      width: "100%",
      alignItems: "center",
      justifyContent:
        "space-between",
      gap: Spacing.md,
    },
    characterCount: {
      ...Typography.captionStyle,
      color:
        KhedmatPalette.textMuted,
    },
    characterCountValid: {
      color: SUCCESS,
      fontFamily: Fonts.medium,
    },
    characterRequirement: {
      ...Typography.captionStyle,
      color:
        KhedmatPalette.textMuted,
    },
    errorRow: {
      width: "100%",
      alignItems: "center",
      gap: 5,
    },
    errorText: {
      ...Typography.captionStyle,
      flex: 1,
      color: ERROR,
      lineHeight: 18,
    },
    photoCard: {
      width: "100%",
      minHeight: 108,
      marginTop:
        Spacing.section,
      padding: Spacing.lg,
      alignItems: "center",
      gap: Spacing.md,
      borderWidth: 1,
      borderColor:
        KhedmatPalette.border,
      borderRadius: Radius.xl,
      backgroundColor:
        KhedmatPalette.surface,
    },
    photoIcon: {
      width: 48,
      height: 48,
      flexShrink: 0,
      borderRadius: Radius.lg,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor:
        KhedmatPalette.surfaceSoft,
    },
    photoCopy: {
      flex: 1,
      gap: 3,
    },
    photoTitle: {
      ...Typography.label,
      width: "100%",
      color:
        KhedmatPalette.textPrimary,
      fontSize: 15,
    },
    photoSubtitle: {
      ...Typography.captionStyle,
      width: "100%",
      color:
        KhedmatPalette.textSecondary,
      lineHeight: 19,
    },
    comingSoonBadge: {
      flexShrink: 0,
      paddingHorizontal:
        Spacing.sm,
      paddingVertical: 5,
      borderRadius: Radius.pill,
      backgroundColor:
        KhedmatPalette.surfaceSoft,
    },
    comingSoonText: {
      ...Typography.captionStyle,
      color:
        KhedmatPalette.textMuted,
      fontFamily: Fonts.medium,
      fontSize: 9,
    },
    privacyCard: {
      width: "100%",
      minHeight: 108,
      marginTop: Spacing.md,
      padding: Spacing.lg,
      alignItems: "flex-start",
      gap: Spacing.md,
      borderWidth: 1,
      borderColor:
        "#A9D9BD",
      borderRadius: Radius.xl,
      backgroundColor:
        "#F5FCF8",
    },
    privacyIcon: {
      width: 46,
      height: 46,
      flexShrink: 0,
      borderRadius: Radius.lg,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor:
        SUCCESS_SOFT,
    },
    privacyCopy: {
      flex: 1,
      gap: 3,
    },
    privacyTitle: {
      ...Typography.label,
      width: "100%",
      color:
        KhedmatPalette.textPrimary,
      fontSize: 15,
    },
    privacyText: {
      ...Typography.captionStyle,
      width: "100%",
      color:
        KhedmatPalette.textSecondary,
      lineHeight: 19,
    },
    footer: {
      position: "absolute",
      right: 0,
      bottom: 0,
      left: 0,
      borderTopWidth:
        StyleSheet.hairlineWidth,
      borderTopColor:
        KhedmatPalette.border,
      backgroundColor:
        KhedmatPalette.white,
    },
    footerContent: {
      width: "100%",
      maxWidth:
        Layout.contentMaxWidth,
      alignSelf: "center",
      paddingHorizontal:
        Layout.screenPadding,
      paddingTop: Spacing.md,
      paddingBottom: Spacing.lg,
      gap: Spacing.sm,
    },
    primaryButton: {
      width: "100%",
      minHeight:
        Layout.controlHeight,
      paddingHorizontal:
        Spacing.lg,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: Radius.lg,
      backgroundColor:
        KhedmatPalette.navy900,
      ...Shadows.small,
    },
    primaryButtonPressed: {
      opacity: 0.84,
      transform: [
        {
          scale: 0.99,
        },
      ],
    },
    primaryButtonContent: {
      alignItems: "center",
      justifyContent: "center",
      gap: Spacing.sm,
    },
    primaryButtonText: {
      ...Typography.label,
      color:
        KhedmatPalette.white,
      fontFamily: Fonts.medium,
      fontSize: 16,
      textAlign: "center",
    },
    footerHint: {
      ...Typography.captionStyle,
      width: "100%",
      color:
        KhedmatPalette.textMuted,
      textAlign: "center",
    },
    pressed: {
      opacity: 0.76,
      transform: [
        {
          scale: 0.97,
        },
      ],
    },
    cardPressed: {
      opacity: 0.88,
      transform: [
        {
          scale: 0.993,
        },
      ],
    },
  });
