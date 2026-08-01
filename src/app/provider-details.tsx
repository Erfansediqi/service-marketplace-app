import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
    StyleSheet,
    Text,
    View,
} from "react-native";

import { GlassButton } from "../components/glass/glass-button";
import { GlassIconButton } from "../components/glass/glass-icon-button";
import { GlassInput } from "../components/glass/glass-input";
import {
    GlassSelect,
    GlassSelectOption,
} from "../components/glass/glass-select";
import { AppScreen } from "../components/layout/app-screen";
import {
    Colors,
    Layout,
    Spacing,
    Typography,
} from "../constants/theme";
import { serviceProfessions } from "../data/service-professions";

const experienceOptions: GlassSelectOption[] = [
  {
    id: "less-than-1",
    label: "کمتر از یک سال",
    secondaryLabel: "Less than 1 year",
  },
  {
    id: "1-2",
    label: "۱ تا ۲ سال",
    secondaryLabel: "1–2 years",
  },
  {
    id: "3-5",
    label: "۳ تا ۵ سال",
    secondaryLabel: "3–5 years",
  },
  {
    id: "6-10",
    label: "۶ تا ۱۰ سال",
    secondaryLabel: "6–10 years",
  },
  {
    id: "more-than-10",
    label: "بیشتر از ۱۰ سال",
    secondaryLabel: "More than 10 years",
  },
];

export default function ProviderDetailsScreen() {
  const router = useRouter();

  const params = useLocalSearchParams<{
    category?: string | string[];
    services?: string | string[];
  }>();

  const categoryId = Array.isArray(params.category)
    ? params.category[0]
    : params.category ?? "";

  const servicesParam = Array.isArray(params.services)
    ? params.services[0]
    : params.services ?? "";

  const selectedServiceIds = useMemo(
    () =>
      servicesParam
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean),
    [servicesParam],
  );

  const category = useMemo(
    () =>
      serviceProfessions.find(
        (item) => item.id === categoryId,
      ) ?? null,
    [categoryId],
  );

  const [businessName, setBusinessName] = useState("");
  const [experienceId, setExperienceId] = useState("");
  const [description, setDescription] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const experienceError =
    submitted && !experienceId
      ? "لطفاً میزان تجربهٔ کاری خود را انتخاب کنید."
      : undefined;

  const descriptionError =
    submitted && description.trim().length < 30
      ? "لطفاً حداقل ۳۰ حرف دربارهٔ تجربه و مهارت خود بنویسید."
      : undefined;

  const formIsValid =
    Boolean(experienceId) &&
    description.trim().length >= 30;

  const handleContinue = () => {
    setSubmitted(true);

    if (!formIsValid) {
      return;
    }

    router.push({
      pathname: "/provider-service-area",
      params: {
        category: categoryId,
        services: selectedServiceIds.join(","),
        experience: experienceId,
        businessName: businessName.trim(),
        description: description.trim(),
      },
    } as never);
  };

  return (
    <AppScreen
      scrollable
      keyboardAware
      contentStyle={styles.screenContent}
      footer={
        <View style={styles.footer}>
          <GlassButton
            label="ادامه"
            icon="arrow-back"
            iconPosition="left"
            onPress={handleContinue}
          />

          <Text style={styles.helperText}>
            اطلاعات دقیق‌تر باعث افزایش اعتماد مشتریان می‌شود.
          </Text>
        </View>
      }
    >
      <View style={styles.topBar}>
        <GlassIconButton
          icon="chevron-back"
          accessibilityLabel="بازگشت"
          onPress={() => router.back()}
        />

        <Text style={styles.stepText}>
          مرحله ۳ از ۶
        </Text>
      </View>

      <View style={styles.header}>
        <Text style={styles.eyebrow}>
          {category?.nameFa ?? "پروفایل حرفه‌ای"}
        </Text>

        <Text style={styles.title}>
          دربارهٔ تجربهٔ کاری خود بنویسید
        </Text>

        <Text style={styles.subtitle}>
          این اطلاعات در پروفایل شما نمایش داده می‌شود و به مشتریان کمک
          می‌کند ارائه‌دهندهٔ مناسب را انتخاب کنند.
        </Text>
      </View>

      <View style={styles.summary}>
        <Text style={styles.summaryText}>
          {selectedServiceIds.length} خدمت انتخاب‌شده
        </Text>
      </View>

      <View style={styles.form}>
        <GlassInput
          label="نام کسب‌وکار یا عنوان کاری"
          placeholder="مثلاً خدمات برق احمد"
          value={businessName}
          onChangeText={setBusinessName}
          autoCapitalize="words"
          returnKeyType="next"
        />

        <GlassSelect
          label="تجربهٔ کاری"
          placeholder="انتخاب میزان تجربه"
          title="میزان تجربهٔ کاری"
          subtitle="مدت فعالیت حرفه‌ای خود را انتخاب کنید."
          options={experienceOptions}
          value={experienceId}
          onChange={(value) => {
            setExperienceId(value);

            if (submitted) {
              setSubmitted(false);
            }
          }}
          searchable={false}
          error={experienceError}
        />

        <GlassInput
          label="معرفی حرفه‌ای"
          placeholder="مهارت‌ها، تجربه‌ها و نوع کارهایی را که انجام می‌دهید توضیح دهید..."
          value={description}
          onChangeText={(value) => {
            setDescription(value);

            if (submitted) {
              setSubmitted(false);
            }
          }}
          multiline
          numberOfLines={7}
          textAlignVertical="top"
          style={styles.descriptionInput}
          error={descriptionError}
        />

        <View style={styles.characterRow}>
          <Text
            style={[
              styles.characterCount,
              description.length >= 30 &&
                styles.characterCountValid,
            ]}
          >
            {description.length} حرف
          </Text>

          <Text style={styles.characterRequirement}>
            حداقل ۳۰ حرف
          </Text>
        </View>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  screenContent: {
    paddingTop: Spacing.md,
    paddingBottom: Spacing.screen,
  },

  topBar: {
    minHeight: Layout.minimumTouchTarget,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  stepText: {
    ...Typography.captionStyle,
    color: Colors.textTertiary,
    textAlign: "right",
    writingDirection: "rtl",
  },

  header: {
    width: "100%",
    marginTop: Spacing.xl,
    alignItems: "flex-end",
    gap: Spacing.sm,
  },

  eyebrow: {
    ...Typography.captionStyle,
    width: "100%",
    color: Colors.primary,
    textAlign: "right",
    writingDirection: "rtl",
  },

  title: {
    ...Typography.screenTitle,
    width: "100%",
    color: Colors.textPrimary,
    textAlign: "right",
    writingDirection: "rtl",
    fontSize: 28,
    lineHeight: 35,
  },

  subtitle: {
    ...Typography.bodyLarge,
    width: "100%",
    maxWidth: 450,
    color: Colors.textSecondary,
    textAlign: "right",
    writingDirection: "rtl",
    lineHeight: 24,
  },

  summary: {
    alignSelf: "flex-end",
    marginTop: Spacing.xl,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 999,
    backgroundColor: Colors.primarySoft,
  },

  summaryText: {
    ...Typography.captionStyle,
    color: Colors.primary,
    textAlign: "right",
    writingDirection: "rtl",
  },

  form: {
    width: "100%",
    marginTop: Spacing.xxl,
    gap: Spacing.xl,
  },

  descriptionInput: {
    minHeight: 160,
    paddingTop: Spacing.lg,
    textAlign: "right",
    writingDirection: "rtl",
  },

  characterRow: {
    marginTop: -Spacing.md,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
  },

  characterCount: {
    ...Typography.captionStyle,
    color: Colors.textTertiary,
    textAlign: "right",
    writingDirection: "rtl",
  },

  characterCountValid: {
    color: Colors.success,
  },

  characterRequirement: {
    ...Typography.captionStyle,
    color: Colors.textMuted,
    textAlign: "right",
    writingDirection: "rtl",
  },

  footer: {
    width: "100%",
    alignItems: "center",
    gap: Spacing.sm,
  },

  helperText: {
    ...Typography.captionStyle,
    maxWidth: 340,
    color: Colors.textTertiary,
    textAlign: "center",
    writingDirection: "rtl",
  },
});