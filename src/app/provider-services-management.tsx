import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
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
  Spacing,
  Typography,
} from "../constants/theme";
import { useLanguage } from "../context/languagecontext";
import { useActiveProvider } from "../hooks/use-active-provider";
import {
  listProviderServices,
  listServices,
  type ProviderServiceRow,
  type ServiceRow,
} from "../repositories/provider-account-repository";
import { saveProviderServiceOffering } from "../services/provider-repository";

type LanguageName = "English" | "Dari" | "Pashto";

type PriceByServiceId = Record<string, string>;

const MAX_SERVICES = 8;

export default function ProviderServicesManagementScreen() {
  const router = useRouter();
  const {
    language,
    t,
    isRTL,
  } = useLanguage();
  const {
    provider,
    isLoading: providerIsLoading,
    error: providerError,
  } = useActiveProvider();

  const activeLanguage =
    normalizeLanguage(language);

  const isRtl = isRTL;

  const [catalog, setCatalog] = useState<ServiceRow[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [prices, setPrices] = useState<PriceByServiceId>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [loadError, setLoadError] = useState<Error | null>(null);

  useFocusEffect(
    useCallback(() => {
      let mounted = true;

      async function load(): Promise<void> {
        if (!provider) {
          if (!providerIsLoading) {
            setIsLoading(false);
          }
          return;
        }

        setIsLoading(true);
        setLoadError(null);

        try {
          const [services, providerServices] = await Promise.all([
            listServices(provider.categoryId),
            listProviderServices(provider.id),
          ]);

          if (!mounted) {
            return;
          }

          const catalogServiceIds = new Set(services.map((item) => item.id));

          const activeRows = providerServices.filter(
            (item) => item.is_active && catalogServiceIds.has(item.service_id),
          );

          setCatalog(services);
          setSelectedIds(activeRows.map((item) => item.service_id));
          setPrices(buildInitialPrices(services, providerServices));
        } catch (error) {
          if (!mounted) {
            return;
          }

          setLoadError(
            error instanceof Error
              ? error
              : new Error("Failed to load provider services."),
          );
        } finally {
          if (mounted) {
            setIsLoading(false);
          }
        }
      }

      void load();

      return () => {
        mounted = false;
      };
    }, [provider, providerIsLoading]),
  );

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  const selectedCount = selectedIds.length;

  const toggleService = (serviceId: string) => {
    if (isSaving) {
      return;
    }

    setSelectedIds((current) => {
      if (current.includes(serviceId)) {
        return current.filter((id) => id !== serviceId);
      }

      if (current.length >= MAX_SERVICES) {
        Alert.alert(
          t("providerServicesLimitTitle"),
          t("providerServicesLimitMessage"),
        );
        return current;
      }

      return [...current, serviceId];
    });
  };

  const updatePrice = (serviceId: string, value: string) => {
    const digitsOnly = normalizePriceDigits(value);

    setPrices((current) => ({
      ...current,
      [serviceId]: digitsOnly,
    }));
  };

  const handleSave = async (): Promise<void> => {
    if (!provider || isSaving) {
      return;
    }

    if (selectedIds.length === 0) {
      Alert.alert(
        t("providerServicesRequiredTitle"),
        t("providerServicesRequiredMessage"),
      );
      return;
    }

    const payload: {
      serviceId: string;
      estimatedPrice: number;
    }[] = [];

    for (const serviceId of selectedIds) {
      const rawPrice = prices[serviceId]?.trim() ?? "";
      const parsedPrice = Number(rawPrice);

      if (
        rawPrice === "" ||
        !Number.isInteger(parsedPrice) ||
        parsedPrice < 0
      ) {
        const service = catalog.find((item) => item.id === serviceId);

        const serviceName =
          getServiceName(
            service,
            activeLanguage,
            t(
              "providerServiceFallbackName",
            ),
          );

        Alert.alert(
          t(
            "providerServicesInvalidPriceTitle",
          ),
          t(
            "providerServicesInvalidPriceMessage",
          ).replace(
            "{service}",
            serviceName,
          ),
        );
        return;
      }

      payload.push({
        serviceId,
        estimatedPrice: parsedPrice,
      });
    }

    setIsSaving(true);

    try {
      await saveProviderServiceOffering(provider.id, payload);

      Alert.alert(
        t(
          "providerServicesSavedTitle",
        ),
        t(
          "providerServicesSavedMessage",
        ),
        [
          {
            text: t(
              "providerServicesDone",
            ),
            onPress: () =>
              router.back(),
          },
        ],
      );
    } catch (error) {
      console.error("Failed to save provider services:", error);

      Alert.alert(
        t(
          "providerServicesSaveFailedTitle",
        ),
        t(
          "providerServicesSaveFailedMessage",
        ),
      );
    } finally {
      setIsSaving(false);
    }
  };

  const error = providerError ?? loadError;

  if (providerIsLoading || isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color={KhedmatPalette.blue500} />
          <Text
            style={[
              styles.stateTitle,
              isRtl &&
                styles.rtlText,
            ]}
          >
            {t(
              "providerServicesLoading",
            )}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!provider || error) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerState}>
          <View style={styles.errorIcon}>
            <Ionicons
              name="alert-circle-outline"
              size={28}
              color={KhedmatPalette.error}
            />
          </View>
          <Text
            style={[
              styles.stateTitle,
              isRtl &&
                styles.rtlText,
            ]}
          >
            {t(
              "providerServicesLoadFailedTitle",
            )}
          </Text>
          <Text
            style={[
              styles.stateBody,
              isRtl &&
                styles.rtlText,
            ]}
          >
            {t(
              "providerServicesLoadFailedMessage",
            )}
          </Text>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [
              styles.secondaryButton,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.secondaryButtonText}>{t("back")}</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t("back")}
            hitSlop={8}
            onPress={() => router.back()}
            style={({ pressed }) => [
              styles.iconButton,
              pressed && styles.pressed,
            ]}
          >
            <Ionicons
              name={isRtl ? "chevron-forward" : "chevron-back"}
              size={24}
              color={KhedmatPalette.navy900}
            />
          </Pressable>

          <View style={styles.headerCopy}>
            <Text style={[styles.headerTitle, isRtl && styles.rtlText]}>
              {t("providerServicesTitle")}
            </Text>

          </View>

          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View
            style={[
              styles.summaryRow,
              isRtl &&
                styles.rowReverse,
            ]}
          >
            <View
              style={
                styles.summaryCopy
              }
            >
              <Text
                style={[
                  styles.summaryLabel,
                  isRtl &&
                    styles.rtlText,
                ]}
              >
                {t(
                  "providerServicesSelected",
                )}
              </Text>

              <Text
                style={[
                  styles.sectionHint,
                  isRtl &&
                    styles.rtlText,
                ]}
              >
                {t(
                  "providerServicesHint",
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
                {formatDigits(
                  selectedCount.toString(),
                  activeLanguage,
                )}
                /
                {formatDigits(
                  MAX_SERVICES.toString(),
                  activeLanguage,
                )}
              </Text>
            </View>
          </View>

          <View style={styles.serviceList}>
            {catalog.map((service) => {
              const selected = selectedSet.has(service.id);
              const disabled = !selected && selectedCount >= MAX_SERVICES;

              return (
                <View
                  key={service.id}
                  style={[
                    styles.serviceCard,
                    selected && styles.serviceCardSelected,
                    disabled && styles.serviceCardDisabled,
                  ]}
                >
                  <Pressable
                    onPress={() => toggleService(service.id)}
                    disabled={isSaving}
                    style={({ pressed }) => [
                      styles.serviceHeader,
                      isRtl && styles.rowReverse,
                      pressed && styles.pressed,
                    ]}
                  >
                    <View
                      style={[
                        styles.checkbox,
                        selected && styles.checkboxSelected,
                      ]}
                    >
                      {selected ? (
                        <Ionicons
                          name="checkmark"
                          size={16}
                          color={KhedmatPalette.white}
                        />
                      ) : null}
                    </View>

                    <View style={styles.serviceCopy}>
                      <Text
                        style={[styles.serviceName, isRtl && styles.rtlText]}
                      >
                        {getServiceName(
                          service,
                          activeLanguage,
                          t(
                            "providerServiceFallbackName",
                          ),
                        )}
                      </Text>

                      {getServiceDescription(service, activeLanguage) ? (
                        <Text
                          style={[
                            styles.serviceDescription,
                            isRtl && styles.rtlText,
                          ]}
                        >
                          {getServiceDescription(service, activeLanguage)}
                        </Text>
                      ) : null}
                    </View>
                  </Pressable>

                  {selected ? (
                    <View style={styles.priceArea}>
                      <Text
                        style={[styles.priceLabel, isRtl && styles.rtlText]}
                      >
                        {t("providerServicesEstimatedPrice")}
                      </Text>

                      <View
                        style={[
                          styles.priceInputShell,
                          isRtl && styles.rowReverse,
                        ]}
                      >
                        <TextInput
                          value={prices[service.id] ?? ""}
                          onChangeText={(value) =>
                            updatePrice(service.id, value)
                          }
                          editable={!isSaving}
                          keyboardType="number-pad"
                          placeholder="0"
                          placeholderTextColor={KhedmatPalette.textMuted}
                          style={[styles.priceInput, isRtl && styles.rtlText]}
                        />
                        <Text
                          style={[
                            styles.afnLabel,
                            isRtl && styles.rtlText,
                          ]}
                        >
                          {t("providerPerformanceCurrency")}
                        </Text>
                      </View>
                    </View>
                  ) : null}
                </View>
              );
            })}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Pressable
            disabled={isSaving || selectedCount === 0}
            onPress={() => void handleSave()}
            style={({ pressed }) => [
              styles.saveButton,
              (isSaving || selectedCount === 0) && styles.saveButtonDisabled,
              pressed && !isSaving && styles.pressed,
            ]}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color={KhedmatPalette.white} />
            ) : (
              <Ionicons
                name="checkmark-circle-outline"
                size={20}
                color={KhedmatPalette.white}
              />
            )}
            <Text style={styles.saveButtonText}>
              {isSaving
                ? t(
                    "providerServicesSaving",
                  )
                : t(
                    "providerServicesSave",
                  )}
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function buildInitialPrices(
  catalog: ServiceRow[],
  providerServices: ProviderServiceRow[],
): PriceByServiceId {
  const existingByServiceId = new Map(
    providerServices.map((item) => [item.service_id, item]),
  );

  return Object.fromEntries(
    catalog.map((service) => [
      service.id,
      existingByServiceId.get(service.id)?.estimated_price.toString() ?? "0",
    ]),
  );
}

function normalizePriceDigits(value: string): string {
  const persianDigits = "۰۱۲۳۴۵۶۷۸۹";
  const arabicDigits = "٠١٢٣٤٥٦٧٨٩";

  return value
    .replace(/[۰-۹]/g, (digit) => String(persianDigits.indexOf(digit)))
    .replace(/[٠-٩]/g, (digit) => String(arabicDigits.indexOf(digit)))
    .replace(/[^0-9]/g, "");
}

function normalizeLanguage(value: unknown): LanguageName {
  if (value === "Dari" || value === "Pashto") {
    return value;
  }

  return "English";
}

function formatDigits(
  value: string,
  language: LanguageName,
): string {
  if (language === "English") {
    return value;
  }

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

  return value.replace(
    /\d/g,
    (digit) =>
      digits[digit] ??
      digit,
  );
}

function getServiceName(
  service: ServiceRow | undefined,
  language: LanguageName,
  fallbackName: string,
): string {
  if (!service) {
    return fallbackName;
  }

  if (language === "Dari") {
    return service.name_dari || service.name_english;
  }

  if (language === "Pashto") {
    return service.name_pashto || service.name_dari || service.name_english;
  }

  return service.name_english;
}

function getServiceDescription(
  service: ServiceRow,
  language: LanguageName,
): string {
  if (language === "Pashto") {
    return service.description_pashto || service.description_dari || "";
  }

  if (language === "Dari") {
    return service.description_dari || "";
  }

  return "";
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    backgroundColor: KhedmatPalette.white,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
    backgroundColor: KhedmatPalette.white,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: KhedmatPalette.white,
  },
  headerCopy: {
    flex: 1,
    paddingHorizontal: Spacing.md,
  },
  headerSpacer: {
    width: 44,
  },
  headerTitle: {
    ...Typography.screenTitle,
    fontSize: 22,
    lineHeight: 28,
    color: KhedmatPalette.textPrimary,
    textAlign: "center",
  },
  headerSubtitle: {
    marginTop: 2,
    ...Typography.captionStyle,
    lineHeight: 18,
    color: KhedmatPalette.textSecondary,
    textAlign: "center",
  },
  scrollContent: {
    width: "100%",
    maxWidth: Layout.contentMaxWidth,
    alignSelf: "center",
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.section,
  },
  summaryRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: Spacing.md,
    marginBottom: Spacing.lg,
    paddingHorizontal: Spacing.xs,
  },
  summaryCopy: {
    flex: 1,
    minWidth: 0,
  },
  summaryLabel: {
    ...Typography.label,
    color: KhedmatPalette.textPrimary,
    fontSize: 14,
  },
  sectionHint: {
    marginTop: 4,
    ...Typography.captionStyle,
    lineHeight: 18,
    color: KhedmatPalette.textSecondary,
  },
  countBadge: {
    minWidth: 44,
    height: 30,
    paddingHorizontal: Spacing.sm,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: KhedmatPalette.blue050,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: KhedmatPalette.blue200,
  },
  countBadgeText: {
    ...Typography.captionStyle,
    fontFamily: Fonts.bold,
    color: KhedmatPalette.blue500,
  },
  serviceList: {
    gap: Spacing.sm,
  },
  serviceCard: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: KhedmatPalette.blue200,
    backgroundColor: KhedmatPalette.white,
    overflow: "hidden",
  },
  serviceCardSelected: {
    borderColor: KhedmatPalette.blue500,
    backgroundColor: KhedmatPalette.blue050,
  },
  serviceCardDisabled: {
    opacity: 0.55,
  },
  serviceHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  checkbox: {
    width: 24,
    height: 24,
    marginTop: 1,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: KhedmatPalette.borderFocused,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: KhedmatPalette.white,
  },
  checkboxSelected: {
    backgroundColor: KhedmatPalette.blue500,
    borderColor: KhedmatPalette.blue500,
  },
  serviceCopy: {
    flex: 1,
  },
  serviceName: {
    fontFamily: Fonts.semibold,
    fontSize: Typography.body,
    lineHeight: 22,
    color: KhedmatPalette.textPrimary,
  },
  serviceDescription: {
    marginTop: 3,
    fontFamily: Fonts.regular,
    fontSize: 13,
    lineHeight: 19,
    color: KhedmatPalette.textMuted,
  },
  priceArea: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: KhedmatPalette.blue200,
  },
  priceLabel: {
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
    fontFamily: Fonts.medium,
    fontSize: 12,
    color: KhedmatPalette.textSecondary,
  },
  priceInputShell: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 48,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: KhedmatPalette.blue200,
    backgroundColor: KhedmatPalette.white,
    paddingHorizontal: Spacing.md,
  },
  priceInput: {
    flex: 1,
    minHeight: 46,
    paddingVertical: 0,
    fontFamily: Fonts.semibold,
    fontSize: 17,
    color: KhedmatPalette.textPrimary,
  },
  afnLabel: {
    fontFamily: Fonts.bold,
    fontSize: 12,
    color: KhedmatPalette.textMuted,
  },
  footer: {
    padding: Spacing.lg,
    paddingTop: Spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: KhedmatPalette.blue200,
    backgroundColor: KhedmatPalette.white,
  },
  saveButton: {
    width: "100%",
    maxWidth: Layout.contentMaxWidth,
    alignSelf: "center",
    minHeight: 52,
    borderRadius: Radius.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    backgroundColor: KhedmatPalette.navy900,
  },
  saveButtonDisabled: {
    backgroundColor: KhedmatPalette.disabled,
  },
  saveButtonText: {
    fontFamily: Fonts.bold,
    fontSize: 16,
    color: KhedmatPalette.white,
  },
  centerState: {
    flex: 1,
    padding: Spacing.xxl,
    alignItems: "center",
    justifyContent: "center",
  },
  errorIcon: {
    width: 56,
    height: 56,
    marginBottom: Spacing.md,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: KhedmatPalette.errorSoft,
  },
  stateTitle: {
    marginTop: Spacing.md,
    fontFamily: Fonts.bold,
    fontSize: 18,
    color: KhedmatPalette.textPrimary,
    textAlign: "center",
  },
  stateBody: {
    marginTop: Spacing.sm,
    fontFamily: Fonts.regular,
    fontSize: 14,
    lineHeight: 21,
    color: KhedmatPalette.textSecondary,
    textAlign: "center",
  },
  secondaryButton: {
    marginTop: Spacing.lg,
    minHeight: 46,
    paddingHorizontal: Spacing.xl,
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: KhedmatPalette.white,
    borderWidth: 1,
    borderColor: KhedmatPalette.border,
  },
  secondaryButtonText: {
    fontFamily: Fonts.semibold,
    fontSize: 15,
    color: KhedmatPalette.navy700,
  },
  pressed: {
    opacity: 0.72,
  },
  rtlText: {
    textAlign: "right",
    writingDirection: "rtl",
  },
  rowReverse: {
    flexDirection: "row-reverse",
  },
});
