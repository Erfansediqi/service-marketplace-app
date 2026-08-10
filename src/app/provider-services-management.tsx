import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
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
    Radius,
    Shadows,
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
  const { language } = useLanguage();
  const {
    provider,
    isLoading: providerIsLoading,
    error: providerError,
  } = useActiveProvider();

  const activeLanguage = normalizeLanguage(language);
  const isRtl = activeLanguage === "Dari" || activeLanguage === "Pashto";
  const copy = getCopy(activeLanguage);

  const [catalog, setCatalog] = useState<ServiceRow[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [prices, setPrices] = useState<PriceByServiceId>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [loadError, setLoadError] = useState<Error | null>(null);

  useEffect(() => {
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
  }, [provider, providerIsLoading]);

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
        Alert.alert(copy.limitTitle, copy.limitBody);
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
      Alert.alert(copy.serviceRequiredTitle, copy.serviceRequiredBody);
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

        Alert.alert(
          copy.invalidPriceTitle,
          copy.invalidPriceBody(getServiceName(service, activeLanguage)),
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

      Alert.alert(copy.savedTitle, copy.savedBody, [
        {
          text: copy.done,
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      console.error("Failed to save provider services:", error);

      Alert.alert(
        copy.saveFailedTitle,
        error instanceof Error ? error.message : copy.saveFailedBody,
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
          <Text style={styles.stateTitle}>{copy.loading}</Text>
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
          <Text style={styles.stateTitle}>{copy.loadFailed}</Text>
          <Text style={styles.stateBody}>
            {error?.message ?? copy.loadFailedBody}
          </Text>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [
              styles.secondaryButton,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.secondaryButtonText}>{copy.back}</Text>
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
            accessibilityLabel={copy.back}
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
              {copy.title}
            </Text>
            <Text style={[styles.headerSubtitle, isRtl && styles.rtlText]}>
              {copy.subtitle}
            </Text>
          </View>

          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.summaryCard}>
            <View>
              <Text style={[styles.summaryLabel, isRtl && styles.rtlText]}>
                {copy.selectedServices}
              </Text>
              <Text style={[styles.summaryValue, isRtl && styles.rtlText]}>
                {selectedCount} / {MAX_SERVICES}
              </Text>
            </View>

            <View style={styles.currencyPill}>
              <Text style={styles.currencyText}>AFN</Text>
            </View>
          </View>

          <Text style={[styles.sectionHint, isRtl && styles.rtlText]}>
            {copy.hint}
          </Text>

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
                        {getServiceName(service, activeLanguage)}
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
                        {copy.estimatedPrice}
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
                        <Text style={styles.afnLabel}>AFN</Text>
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
              {isSaving ? copy.saving : copy.save}
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

function getServiceName(
  service: ServiceRow | undefined,
  language: LanguageName,
): string {
  if (!service) {
    return "Service";
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

function getCopy(language: LanguageName) {
  if (language === "Dari") {
    return {
      title: "خدمات و قیمت‌ها",
      subtitle:
        "خدماتی را که ارائه می‌کنید و قیمت تخمینی هر خدمت را مدیریت کنید.",
      selectedServices: "خدمات انتخاب‌شده",
      hint: "حداقل یک و حداکثر هشت خدمت را انتخاب کنید. قیمت‌ها به افغانی ثبت می‌شوند.",
      estimatedPrice: "قیمت تخمینی",
      save: "ذخیره تغییرات",
      saving: "در حال ذخیره...",
      done: "تمام",
      back: "برگشت",
      loading: "در حال بارگذاری خدمات...",
      loadFailed: "خدمات بارگذاری نشد",
      loadFailedBody: "لطفاً دوباره تلاش کنید.",
      limitTitle: "حد خدمات تکمیل شد",
      limitBody: "می‌توانید حداکثر ۸ خدمت فعال داشته باشید.",
      serviceRequiredTitle: "حداقل یک خدمت لازم است",
      serviceRequiredBody: "برای ادامه حداقل یک خدمت را انتخاب کنید.",
      invalidPriceTitle: "قیمت نامعتبر",
      invalidPriceBody: (serviceName: string) =>
        `برای «${serviceName}» یک قیمت معتبر به افغانی وارد کنید.`,
      savedTitle: "خدمات ذخیره شد",
      savedBody: "خدمات و قیمت‌های شما با موفقیت به‌روزرسانی شد.",
      saveFailedTitle: "ذخیره انجام نشد",
      saveFailedBody: "خدمات شما ذخیره نشد. لطفاً دوباره تلاش کنید.",
    };
  }

  if (language === "Pashto") {
    return {
      title: "خدمتونه او بیې",
      subtitle: "خپل فعال خدمتونه او د هر خدمت اټکلي بیه تنظیم کړئ.",
      selectedServices: "ټاکل شوي خدمتونه",
      hint: "لږ تر لږه یو او تر اتو پورې خدمتونه وټاکئ. بیې په افغانۍ ثبتېږي.",
      estimatedPrice: "اټکلي بیه",
      save: "بدلونونه خوندي کړئ",
      saving: "خوندي کېږي...",
      done: "بشپړ",
      back: "شاته",
      loading: "خدمتونه بارېږي...",
      loadFailed: "خدمتونه بار نه شول",
      loadFailedBody: "مهرباني وکړئ بیا هڅه وکړئ.",
      limitTitle: "د خدمتونو حد پوره شو",
      limitBody: "تاسو تر اتو پورې فعال خدمتونه لرلی شئ.",
      serviceRequiredTitle: "لږ تر لږه یو خدمت اړین دی",
      serviceRequiredBody: "د دوام لپاره لږ تر لږه یو خدمت وټاکئ.",
      invalidPriceTitle: "ناسمه بیه",
      invalidPriceBody: (serviceName: string) =>
        `د «${serviceName}» لپاره په افغانۍ سمه بیه ولیکئ.`,
      savedTitle: "خدمتونه خوندي شول",
      savedBody: "ستاسو خدمتونه او بیې په بریالیتوب سره تازه شول.",
      saveFailedTitle: "خوندي کول ناکام شول",
      saveFailedBody: "ستاسو خدمتونه خوندي نه شول. مهرباني وکړئ بیا هڅه وکړئ.",
    };
  }

  return {
    title: "Services & Prices",
    subtitle:
      "Manage the services you offer and the estimated price for each one.",
    selectedServices: "Selected services",
    hint: "Choose between 1 and 8 active services. Prices are stored in AFN.",
    estimatedPrice: "Estimated price",
    save: "Save changes",
    saving: "Saving...",
    done: "Done",
    back: "Back",
    loading: "Loading services...",
    loadFailed: "Could not load services",
    loadFailedBody: "Please try again.",
    limitTitle: "Service limit reached",
    limitBody: "You can have a maximum of 8 active services.",
    serviceRequiredTitle: "At least one service is required",
    serviceRequiredBody: "Select at least one service before saving.",
    invalidPriceTitle: "Invalid price",
    invalidPriceBody: (serviceName: string) =>
      `Enter a valid AFN price for ${serviceName}.`,
    savedTitle: "Services saved",
    savedBody: "Your services and prices were updated successfully.",
    saveFailedTitle: "Could not save services",
    saveFailedBody: "Your services were not saved. Please try again.",
  };
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    backgroundColor: KhedmatPalette.blue050,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: KhedmatPalette.border,
    backgroundColor: KhedmatPalette.white,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: KhedmatPalette.surfaceSoft,
  },
  headerCopy: {
    flex: 1,
    paddingHorizontal: Spacing.md,
  },
  headerSpacer: {
    width: 44,
  },
  headerTitle: {
    fontFamily: Fonts.bold,
    fontSize: 20,
    lineHeight: 26,
    color: KhedmatPalette.textPrimary,
    textAlign: "center",
  },
  headerSubtitle: {
    marginTop: 2,
    fontFamily: Fonts.regular,
    fontSize: 12,
    lineHeight: 17,
    color: KhedmatPalette.textMuted,
    textAlign: "center",
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.section,
  },
  summaryCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    backgroundColor: KhedmatPalette.white,
    borderWidth: 1,
    borderColor: KhedmatPalette.border,
    ...Shadows.small,
  },
  summaryLabel: {
    fontFamily: Fonts.medium,
    fontSize: 13,
    color: KhedmatPalette.textSecondary,
  },
  summaryValue: {
    marginTop: 4,
    fontFamily: Fonts.bold,
    fontSize: 23,
    color: KhedmatPalette.navy900,
  },
  currencyPill: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.pill,
    backgroundColor: KhedmatPalette.successSoft,
  },
  currencyText: {
    fontFamily: Fonts.bold,
    fontSize: 12,
    color: KhedmatPalette.success,
  },
  sectionHint: {
    marginTop: Spacing.md,
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.xs,
    fontFamily: Fonts.regular,
    fontSize: 13,
    lineHeight: 19,
    color: KhedmatPalette.textSecondary,
  },
  serviceList: {
    gap: Spacing.md,
  },
  serviceCard: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: KhedmatPalette.border,
    backgroundColor: KhedmatPalette.white,
    overflow: "hidden",
  },
  serviceCardSelected: {
    borderColor: KhedmatPalette.blue500,
  },
  serviceCardDisabled: {
    opacity: 0.55,
  },
  serviceHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.md,
    padding: Spacing.lg,
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
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: KhedmatPalette.border,
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
    borderColor: KhedmatPalette.border,
    backgroundColor: KhedmatPalette.surfaceSoft,
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
    borderTopColor: KhedmatPalette.border,
    backgroundColor: KhedmatPalette.white,
  },
  saveButton: {
    minHeight: 52,
    borderRadius: Radius.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    backgroundColor: KhedmatPalette.navy700,
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
