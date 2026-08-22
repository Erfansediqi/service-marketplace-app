import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { KhedmatScreen } from "../components/khedmat/khedmat-screen";
import { ProviderAccountCard } from "../components/provider-account/provider-account-card";
import { RenameProviderModal } from "../components/provider-account/rename-provider-modal";
import {
  KhedmatPalette,
  Layout,
  Radius,
  Spacing,
  Typography,
} from "../constants/theme";
import { useLanguage } from "../context/languagecontext";
import { useSession } from "../context/session-context";
import { useSupabaseAuth } from "../context/supabase-auth-context";
import {
  getOwnedProviderProfiles,
  renameProvider,
} from "../services/provider-repository";
import type { ProviderProfile } from "../types/provider";

type LanguageName = "English" | "Dari" | "Pashto";

export default function ProviderAccountSelectionScreen() {
  const router = useRouter();

  const { language } = useLanguage();

  const {
    activeProviderId,
    defaultProviderId,
    beginProviderRegistration,
    enterProviderWorkspace,
    setDefaultProviderId,
  } = useSession();

  const { user, isHydrated: authIsHydrated } = useSupabaseAuth();

  const authenticatedUserId = user?.id ?? null;

  const [providers, setProviders] = useState<ProviderProfile[]>([]);

  const [isLoading, setIsLoading] = useState(true);

  const [isOpeningProvider, setIsOpeningProvider] = useState(false);

  const [loadError, setLoadError] = useState<Error | null>(null);

  const [providerBeingRenamed, setProviderBeingRenamed] =
    useState<ProviderProfile | null>(null);

  const [renameValue, setRenameValue] = useState("");

  const [renameError, setRenameError] = useState<string | null>(null);

  const [isRenaming, setIsRenaming] = useState(false);

  const activeLanguage = normalizeLanguage(language);

  const isRtl = activeLanguage === "Dari" || activeLanguage === "Pashto";

  const copy = getAccountSelectionCopy(activeLanguage);

  const sortedProviders = useMemo(
    () =>
      [...providers].sort((first, second) => {
        if (first.id === defaultProviderId && second.id !== defaultProviderId) {
          return -1;
        }

        if (second.id === defaultProviderId && first.id !== defaultProviderId) {
          return 1;
        }

        if (first.id === activeProviderId && second.id !== activeProviderId) {
          return -1;
        }

        if (second.id === activeProviderId && first.id !== activeProviderId) {
          return 1;
        }

        return first.name.localeCompare(second.name);
      }),
    [activeProviderId, defaultProviderId, providers],
  );

  const loadProviders = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setLoadError(null);

    try {
      if (!authIsHydrated) {
        return;
      }

      if (!authenticatedUserId) {
        throw new Error("Sign in is required to load provider accounts.");
      }

      const availableProviders =
        await getOwnedProviderProfiles(authenticatedUserId);

      setProviders(availableProviders);
    } catch (error) {
      console.error("Failed to load provider accounts:", error);

      setProviders([]);

      setLoadError(
        error instanceof Error
          ? error
          : new Error("Failed to load provider accounts."),
      );
    } finally {
      setIsLoading(false);
    }
  }, [authenticatedUserId, authIsHydrated]);

  useFocusEffect(
    useCallback(() => {
      void loadProviders();
    }, [loadProviders]),
  );

  const openProvider = async (providerId: string): Promise<void> => {
    if (isOpeningProvider) {
      return;
    }

    setIsOpeningProvider(true);

    try {
      enterProviderWorkspace(providerId);

      router.replace("/(provider-tabs)");
    } catch (error) {
      console.error("Failed to open provider workspace:", error);

      Alert.alert(copy.openFailedTitle, copy.openFailedMessage);
    } finally {
      setIsOpeningProvider(false);
    }
  };

  const openRenameProvider = (provider: ProviderProfile): void => {
    setProviderBeingRenamed(provider);
    setRenameValue(provider.name);
    setRenameError(null);
  };

  const closeRenameProvider = (): void => {
    if (isRenaming) {
      return;
    }

    setProviderBeingRenamed(null);
    setRenameValue("");
    setRenameError(null);
  };

  const submitProviderRename = async (): Promise<void> => {
    if (!providerBeingRenamed || isRenaming) {
      return;
    }

    const normalizedName = renameValue.trim();

    if (!normalizedName) {
      setRenameError(copy.renameEmptyError);

      return;
    }

    if (normalizedName === providerBeingRenamed.name) {
      closeRenameProvider();

      return;
    }

    setIsRenaming(true);
    setRenameError(null);

    try {
      const updatedProvider = await renameProvider(
        providerBeingRenamed.id,
        normalizedName,
      );

      setProviders((currentProviders) =>
        currentProviders.map((provider) =>
          provider.id === updatedProvider.id ? updatedProvider : provider,
        ),
      );

      setProviderBeingRenamed(null);
      setRenameValue("");
    } catch (error) {
      console.error("Failed to rename provider account:", error);

      setRenameError(copy.renameFailedMessage);
    } finally {
      setIsRenaming(false);
    }
  };

  const setProviderAsDefault = (providerId: string): void => {
    if (providerId === defaultProviderId) {
      return;
    }

    setDefaultProviderId(providerId);
  };

  const createProvider = (): void => {
    beginProviderRegistration();

    router.push("/provider-welcome");
  };

  return (
    <>
      <KhedmatScreen scrollable contentStyle={styles.screenContent}>
        <View
          style={[
            styles.header,
            {
              alignItems: isRtl ? "flex-end" : "flex-start",
            },
          ]}
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={copy.back}
            hitSlop={10}
            onPress={() => router.back()}
            style={({ pressed }) => [
              styles.backButton,
              pressed && styles.pressed,
            ]}
          >
            <Ionicons
              name={isRtl ? "arrow-forward" : "arrow-back"}
              size={22}
              color={KhedmatPalette.navy900}
            />
          </Pressable>

          <View
            style={[
              styles.headingBlock,
              {
                alignItems: isRtl ? "flex-end" : "flex-start",
              },
            ]}
          >
            <Text style={[styles.title, directionStyle(isRtl)]}>
              {copy.title}
            </Text>


          </View>
        </View>

        {isLoading ? (
          <View style={styles.stateContainer}>
            <ActivityIndicator size="large" color={KhedmatPalette.blue500} />

            <Text style={[styles.stateText, directionStyle(isRtl)]}>
              {copy.loading}
            </Text>
          </View>
        ) : loadError ? (
          <View style={styles.stateContainer}>
            <Ionicons
              name="cloud-offline-outline"
              size={48}
              color={KhedmatPalette.textMuted}
            />

            <Text style={[styles.stateTitle, directionStyle(isRtl)]}>
              {copy.errorTitle}
            </Text>

            <Text style={[styles.stateText, directionStyle(isRtl)]}>
              {copy.errorMessage}
            </Text>

            <Pressable
              accessibilityRole="button"
              onPress={() => {
                void loadProviders();
              }}
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.primaryButtonText}>{copy.tryAgain}</Text>
            </Pressable>
          </View>
        ) : providers.length === 0 ? (
          <View style={styles.stateContainer}>
            <View style={styles.emptyIcon}>
              <Ionicons
                name="briefcase-outline"
                size={32}
                color={KhedmatPalette.blue500}
              />
            </View>

            <Text style={[styles.stateTitle, directionStyle(isRtl)]}>
              {copy.emptyTitle}
            </Text>

            <Text style={[styles.stateText, directionStyle(isRtl)]}>
              {copy.emptyMessage}
            </Text>

            <Pressable
              accessibilityRole="button"
              onPress={createProvider}
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && styles.pressed,
              ]}
            >
              <Ionicons
                name="add-circle-outline"
                size={20}
                color={KhedmatPalette.white}
              />

              <Text style={styles.primaryButtonText}>
                {copy.createProvider}
              </Text>
            </Pressable>
          </View>
        ) : (
          <>
            <View style={styles.accountsSection}>
              <Text style={[styles.sectionTitle, directionStyle(isRtl)]}>
                {copy.accountsTitle}
              </Text>

              <View style={styles.accountsList}>
                {sortedProviders.map((provider) => (
                  <ProviderAccountCard
                    key={provider.id}
                    provider={provider}
                    isActive={provider.id === activeProviderId}
                    isDefault={provider.id === defaultProviderId}
                    isRtl={isRtl}
                    activeLabel={copy.lastUsed}
                    defaultLabel={copy.defaultAccount}
                    setDefaultLabel={copy.setAsDefault}
                    openLabel={copy.openAccount}
                    renameLabel={copy.renameAccount}
                    disabled={isOpeningProvider || isRenaming}
                    onPress={() => {
                      void openProvider(provider.id);
                    }}
                    onSetDefault={() => {
                      setProviderAsDefault(provider.id);
                    }}
                    onRename={() => {
                      openRenameProvider(provider);
                    }}
                  />
                ))}
              </View>
            </View>

            <View style={styles.createSection}>
              <Pressable
                accessibilityRole="button"
                disabled={isOpeningProvider}
                onPress={createProvider}
                style={({ pressed }) => [
                  styles.createButton,
                  pressed && styles.pressed,
                  isOpeningProvider && styles.disabled,
                ]}
              >
                <View style={styles.createIcon}>
                  <Ionicons
                    name="add"
                    size={22}
                    color={KhedmatPalette.blue500}
                  />
                </View>

                <View style={styles.createContent}>
                  <Text style={[styles.createTitle, directionStyle(isRtl)]}>
                    {copy.createProvider}
                  </Text>

                  <Text style={[styles.createSubtitle, directionStyle(isRtl)]}>
                    {copy.createProviderSubtitle}
                  </Text>
                </View>

                <Ionicons
                  name={isRtl ? "chevron-back" : "chevron-forward"}
                  size={20}
                  color={KhedmatPalette.textMuted}
                />
              </Pressable>
            </View>
          </>
        )}
      </KhedmatScreen>

      <RenameProviderModal
        visible={providerBeingRenamed !== null}
        isRtl={isRtl}
        value={renameValue}
        error={renameError}
        isSaving={isRenaming}
        title={copy.renameTitle}
        subtitle={copy.renameSubtitle}
        placeholder={copy.renamePlaceholder}
        cancelLabel={copy.cancel}
        saveLabel={copy.save}
        onChangeValue={(value) => {
          setRenameValue(value);

          if (renameError) {
            setRenameError(null);
          }
        }}
        onCancel={closeRenameProvider}
        onSave={() => {
          void submitProviderRename();
        }}
      />
    </>
  );
}

function normalizeLanguage(language: string): LanguageName {
  if (language === "Dari") {
    return "Dari";
  }

  if (language === "Pashto") {
    return "Pashto";
  }

  return "English";
}

function directionStyle(isRtl: boolean) {
  return {
    textAlign: isRtl ? ("right" as const) : ("left" as const),

    writingDirection: isRtl ? ("rtl" as const) : ("ltr" as const),
  };
}

function getAccountSelectionCopy(language: LanguageName) {
  if (language === "Dari") {
    return {
      back: "بازگشت",
      title: "انتخاب حساب ارائه‌دهنده",
      subtitle:
        "حسابی را که می‌خواهید مدیریت کنید انتخاب نمایید یا حساب جدید بسازید.",
      loading: "حساب‌های ارائه‌دهنده در حال بارگذاری است...",
      errorTitle: "بارگذاری حساب‌ها ناموفق بود",
      errorMessage: "لطفاً دوباره تلاش کنید.",
      tryAgain: "تلاش دوباره",
      emptyTitle: "هنوز حساب ارائه‌دهنده ندارید",
      emptyMessage:
        "برای ارائه خدمات، نخستین حساب ارائه‌دهنده خود را ایجاد کنید.",
      accountsTitle: "حساب‌های ارائه‌دهنده",
      lastUsed: "آخرین حساب",
      defaultAccount: "پیش‌فرض",
      setAsDefault: "تنظیم به‌عنوان حساب پیش‌فرض",
      openAccount: "باز کردن حساب",
      renameAccount: "تغییر نام حساب",
      renameTitle: "تغییر نام حساب ارائه‌دهنده",
      renameSubtitle: "یک نام واضح برای تشخیص این حساب وارد کنید.",
      renamePlaceholder: "نام حساب ارائه‌دهنده",
      renameEmptyError: "نام حساب نمی‌تواند خالی باشد.",
      renameFailedMessage: "تغییر نام حساب ناموفق بود. دوباره تلاش کنید.",
      cancel: "لغو",
      save: "ذخیره",
      createProvider: "ایجاد حساب جدید ارائه‌دهنده",
      createProviderSubtitle: "یک مهارت، حرفه یا کسب‌وکار دیگر اضافه کنید.",
      openFailedTitle: "باز کردن حساب ناموفق بود",
      openFailedMessage: "لطفاً دوباره تلاش کنید.",
    };
  }

  if (language === "Pashto") {
    return {
      back: "شاته",
      title: "د خدمت چمتو کوونکي حساب وټاکئ",
      subtitle: "خپل حساب وټاکئ.",
      loading: "د خدمت چمتو کوونکي حسابونه بارېږي...",
      errorTitle: "د حسابونو بارول ناکام شول",
      errorMessage: "مهرباني وکړئ بیا هڅه وکړئ.",
      tryAgain: "بیا هڅه",
      emptyTitle: "تر اوسه د خدمت چمتو کوونکي حساب نشته",
      emptyMessage: "د خدمتونو د وړاندې کولو لپاره خپل لومړی حساب جوړ کړئ.",
      accountsTitle: "د خدمت چمتو کوونکي حسابونه",
      lastUsed: "وروستی حساب",
      defaultAccount: "اصلي",
      setAsDefault: "د اصلي حساب په توګه ټاکل",
      openAccount: "حساب پرانیستل",
      renameAccount: "د حساب نوم بدلول",
      renameTitle: "د خدمت چمتو کوونکي د حساب نوم بدلول",
      renameSubtitle: "د دې حساب د پېژندلو لپاره روښانه نوم ولیکئ.",
      renamePlaceholder: "د خدمت چمتو کوونکي د حساب نوم",
      renameEmptyError: "د حساب نوم تش پاتې کېدای نه شي.",
      renameFailedMessage: "د حساب نوم بدلول ناکام شول. بیا هڅه وکړئ.",
      cancel: "لغوه",
      save: "خوندي کول",
      createProvider: "نوی د خدمت چمتو کوونکي حساب جوړول",
      createProviderSubtitle: "بله وړتیا، مسلک یا کاروبار ورزیات کړئ.",
      openFailedTitle: "حساب پرانیستل ناکام شول",
      openFailedMessage: "مهرباني وکړئ بیا هڅه وکړئ.",
    };
  }

  return {
    back: "Back",
    title: "Provider account",
    subtitle:
      "Select the provider account you want to manage, or create a new one.",
    loading: "Loading provider accounts...",
    errorTitle: "Unable to load accounts",
    errorMessage: "Please try again.",
    tryAgain: "Try again",
    emptyTitle: "No provider accounts yet",
    emptyMessage:
      "Create your first provider account to start offering services.",
    accountsTitle: "Provider accounts",
    lastUsed: "Last used",
    defaultAccount: "Default",
    setAsDefault: "Set as default provider",
    openAccount: "Open account",
    renameAccount: "Rename account",
    renameTitle: "Rename provider account",
    renameSubtitle: "Enter a clear name that helps you identify this account.",
    renamePlaceholder: "Provider account name",
    renameEmptyError: "The account name cannot be empty.",
    renameFailedMessage: "Unable to rename the account. Please try again.",
    cancel: "Cancel",
    save: "Save",
    createProvider: "Create new provider account",
    createProviderSubtitle: "Add another skill, profession, or business.",
    openFailedTitle: "Unable to open account",
    openFailedMessage: "Please try again.",
  };
}

const styles = StyleSheet.create({
  screenContent: {
    width: "100%",
    maxWidth: Layout.contentMaxWidth,
    alignSelf: "center",
    paddingHorizontal: Layout.screenPadding,
    paddingTop: Spacing.lg,
    paddingBottom: 120,
  },

  header: {
    marginBottom: Spacing.xxl,
  },

  backButton: {
    width: Layout.minimumTouchTarget,
    height: Layout.minimumTouchTarget,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.lg,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: KhedmatPalette.border,
    backgroundColor: KhedmatPalette.surface,
  },

  headingBlock: {
    width: "100%",
  },

  title: {
    ...Typography.screenTitle,
    width: "100%",
    color: KhedmatPalette.textPrimary,
  },

  stateContainer: {
    minHeight: 420,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.md,
    paddingHorizontal: Spacing.xl,
  },

  stateTitle: {
    ...Typography.sectionTitle,
    width: "100%",
    color: KhedmatPalette.textPrimary,
    textAlign: "center",
  },

  stateText: {
    ...Typography.bodyStyle,
    width: "100%",
    maxWidth: Layout.readableTextMaxWidth,
    color: KhedmatPalette.textMuted,
    textAlign: "center",
  },

  emptyIcon: {
    width: 72,
    height: 72,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: Radius.pill,
    backgroundColor: KhedmatPalette.surfaceSoft,
  },

  primaryButton: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    marginTop: Spacing.sm,
    paddingHorizontal: Spacing.xl,
    borderRadius: Radius.lg,
    backgroundColor: KhedmatPalette.navy900,
  },

  primaryButtonText: {
    ...Typography.buttonLabel,
    color: KhedmatPalette.white,
  },

  accountsSection: {
    width: "100%",
  },

  sectionTitle: {
    ...Typography.sectionTitle,
    color: KhedmatPalette.textPrimary,
    marginBottom: Spacing.md,
  },

  accountsList: {
    gap: Spacing.md,
  },

  rowReverse: {
    flexDirection: "row-reverse",
  },

  createSection: {
    marginTop: Spacing.lg,
  },

  createButton: {
    minHeight: 84,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: KhedmatPalette.blue500,
    borderRadius: Radius.xl,
    backgroundColor: KhedmatPalette.surface,
  },

  createIcon: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: Radius.pill,
    backgroundColor: KhedmatPalette.surfaceSoft,
  },

  createContent: {
    flex: 1,
  },

  createTitle: {
    ...Typography.label,
    color: KhedmatPalette.navy900,
  },

  createSubtitle: {
    ...Typography.captionStyle,
    marginTop: Spacing.xs,
    color: KhedmatPalette.textMuted,
  },

  pressed: {
    opacity: 0.72,
  },

  disabled: {
    opacity: 0.55,
  },
});
