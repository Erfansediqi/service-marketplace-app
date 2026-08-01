import { Ionicons } from "@expo/vector-icons";
import {
    useLocalSearchParams,
    useRouter,
} from "expo-router";
import { useMemo, useState } from "react";
import {
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";

import { GlassButton } from "../components/glass/glass-button";
import { GlassIconButton } from "../components/glass/glass-icon-button";
import {
    GlassSelect,
    GlassSelectOption,
} from "../components/glass/glass-select";
import { GlassSurface } from "../components/glass/glass-surface";
import { AppScreen } from "../components/layout/app-screen";
import {
    Colors,
    Layout,
    Radius,
    Shadows,
    Spacing,
    Typography,
} from "../constants/theme";
import { provinces } from "../data/afghanistan-addresses";

type ServiceMode =
  | "customer-location"
  | "provider-location"
  | "remote";

type ServiceModeOption = {
  id: ServiceMode;
  title: string;
  subtitle: string;
  icon:
    | "home-outline"
    | "business-outline"
    | "videocam-outline";
};

const serviceModeOptions: ServiceModeOption[] = [
  {
    id: "customer-location",
    title: "در محل مشتری",
    subtitle:
      "برای انجام خدمت به خانه، دفتر یا محل مشتری می‌روم.",
    icon: "home-outline",
  },
  {
    id: "provider-location",
    title: "در محل کار من",
    subtitle:
      "مشتری برای دریافت خدمت به محل کار من مراجعه می‌کند.",
    icon: "business-outline",
  },
  {
    id: "remote",
    title: "خدمت آنلاین یا از راه دور",
    subtitle:
      "این خدمت بدون حضور فیزیکی و به‌صورت آنلاین انجام می‌شود.",
    icon: "videocam-outline",
  },
];

const radiusOptions: GlassSelectOption[] = [
  {
    id: "5",
    label: "تا ۵ کیلومتر",
    secondaryLabel: "مناسب برای یک محدودهٔ نزدیک",
  },
  {
    id: "10",
    label: "تا ۱۰ کیلومتر",
    secondaryLabel: "پوشش چند ناحیهٔ نزدیک",
  },
  {
    id: "20",
    label: "تا ۲۰ کیلومتر",
    secondaryLabel: "پوشش گسترده‌تر در شهر",
  },
  {
    id: "30",
    label: "تا ۳۰ کیلومتر",
    secondaryLabel: "مناسب برای خدمات سیار",
  },
  {
    id: "district-wide",
    label: "تمام شهر یا ولسوالی",
    secondaryLabel: "بدون محدودیت کیلومتری در ولسوالی",
  },
];

export default function ProviderServiceAreaScreen() {
  const router = useRouter();

  const params = useLocalSearchParams<{
    category?: string | string[];
    services?: string | string[];
    experience?: string | string[];
    businessName?: string | string[];
    description?: string | string[];
  }>();

  const categoryId = getSingleParam(params.category);
  const servicesParam = getSingleParam(params.services);
  const experienceId = getSingleParam(params.experience);
  const businessName = getSingleParam(params.businessName);
  const description = getSingleParam(params.description);

  const [provinceId, setProvinceId] = useState("");
  const [districtId, setDistrictId] = useState("");
  const [radiusId, setRadiusId] = useState("");
  const [selectedModes, setSelectedModes] = useState<ServiceMode[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const provinceOptions = useMemo<GlassSelectOption[]>(
    () =>
      provinces.map((province) => ({
        id: province.id,
        label: province.nameFa,
        secondaryLabel: province.nameEn,
        searchTerms: [
          province.nameFa,
          province.nameEn,
          province.code,
        ],
      })),
    [],
  );

  const selectedProvince = useMemo(
    () =>
      provinces.find(
        (province) => province.id === provinceId,
      ) ?? null,
    [provinceId],
  );

  const districtOptions = useMemo<GlassSelectOption[]>(
    () =>
      selectedProvince?.districts.map((district) => ({
        id: district.id,
        label: district.nameFa,
        secondaryLabel: district.nameEn,
        searchTerms: [
          district.nameFa,
          district.nameEn,
          district.code,
        ],
      })) ?? [],
    [selectedProvince],
  );

  const selectedDistrict = useMemo(
    () =>
      selectedProvince?.districts.find(
        (district) => district.id === districtId,
      ) ?? null,
    [districtId, selectedProvince],
  );

  const requiresTravelRadius =
    selectedModes.includes("customer-location");

  const provinceError =
    submitted && !provinceId
      ? "لطفاً ولایت محل فعالیت خود را انتخاب کنید."
      : undefined;

  const districtError =
    submitted && !districtId
      ? "لطفاً شهر یا ولسوالی محل فعالیت خود را انتخاب کنید."
      : undefined;

  const radiusError =
    submitted && requiresTravelRadius && !radiusId
      ? "لطفاً محدودهٔ رفت‌وآمد خود را انتخاب کنید."
      : undefined;

  const modesError =
    submitted && selectedModes.length === 0
      ? "حداقل یک روش ارائهٔ خدمت را انتخاب کنید."
      : undefined;

  const formIsValid =
    Boolean(provinceId) &&
    Boolean(districtId) &&
    selectedModes.length > 0 &&
    (!requiresTravelRadius || Boolean(radiusId));

  const handleProvinceChange = (
    value: string,
    _option: GlassSelectOption,
  ) => {
    setProvinceId(value);
    setDistrictId("");

    if (submitted) {
      setSubmitted(false);
    }
  };

  const handleDistrictChange = (
    value: string,
    _option: GlassSelectOption,
  ) => {
    setDistrictId(value);

    if (submitted) {
      setSubmitted(false);
    }
  };

  const toggleServiceMode = (mode: ServiceMode) => {
    setSelectedModes((current) => {
      if (current.includes(mode)) {
        return current.filter((item) => item !== mode);
      }

      return [...current, mode];
    });

    if (submitted) {
      setSubmitted(false);
    }
  };

  const handleContinue = () => {
    setSubmitted(true);

    if (!formIsValid) {
      return;
    }

    router.push({
      pathname: "/provider-availability",
      params: {
        category: categoryId,
        services: servicesParam,
        experience: experienceId,
        businessName,
        description,
        province: provinceId,
        provinceName: selectedProvince?.nameFa ?? "",
        district: districtId,
        districtName: selectedDistrict?.nameFa ?? "",
        radius: radiusId,
        serviceModes: selectedModes.join(","),
      },
    } as never);
  };

  return (
    <AppScreen
      scrollable
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
            این اطلاعات برای نمایش درخواست‌های نزدیک و مرتبط استفاده
            می‌شود.
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
          مرحله ۴ از ۶
        </Text>
      </View>

      <View style={styles.header}>
        <GlassSurface
          variant="prominent"
          radius={Radius.xxl}
          style={styles.headerIcon}
          contentStyle={styles.headerIconContent}
        >
          <Ionicons
            name="map-outline"
            size={32}
            color={Colors.primary}
          />
        </GlassSurface>

        <View style={styles.headerCopy}>
          <Text style={styles.eyebrow}>
            محدودهٔ فعالیت
          </Text>

          <Text style={styles.title}>
            در کدام منطقه خدمات ارائه می‌کنید؟
          </Text>

          <Text style={styles.subtitle}>
            محل اصلی فعالیت و روش ارائهٔ خدمات خود را مشخص کنید تا
            درخواست‌های مناسب‌تری دریافت نمایید.
          </Text>
        </View>
      </View>

      <View style={styles.form}>
        <GlassSelect
          label="ولایت محل فعالیت"
          placeholder="انتخاب ولایت"
          title="انتخاب ولایت"
          subtitle="ولایت اصلی فعالیت خود را انتخاب کنید."
          options={provinceOptions}
          value={provinceId}
          onChange={handleProvinceChange}
          searchable
          searchPlaceholder="جستجوی ولایت..."
          emptyMessage="ولایتی پیدا نشد."
          error={provinceError}
        />

        <GlassSelect
          label="شهر / ولسوالی"
          placeholder={
            provinceId
              ? "انتخاب شهر یا ولسوالی"
              : "ابتدا ولایت را انتخاب کنید"
          }
          title="انتخاب شهر یا ولسوالی"
          subtitle={
            selectedProvince
              ? `منطقهٔ فعالیت خود در ولایت ${selectedProvince.nameFa} را انتخاب کنید.`
              : "ابتدا ولایت محل فعالیت را انتخاب کنید."
          }
          options={districtOptions}
          value={districtId}
          onChange={(value) => {
            handleDistrictChange(
              value,
              districtOptions.find(
                (option) => option.id === value,
              ) ?? {
                id: value,
                label: value,
              },
            );
          }}
          searchable
          searchPlaceholder="جستجوی شهر یا ولسوالی..."
          emptyMessage="شهر یا ولسوالی پیدا نشد."
          disabled={!provinceId}
          error={districtError}
        />

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              روش ارائهٔ خدمت
            </Text>

            <Text style={styles.sectionSubtitle}>
              می‌توانید بیش از یک گزینه را انتخاب کنید.
            </Text>
          </View>

          <View style={styles.modeOptions}>
            {serviceModeOptions.map((option) => {
              const selected = selectedModes.includes(option.id);

              return (
                <Pressable
                  key={option.id}
                  accessibilityRole="checkbox"
                  accessibilityLabel={option.title}
                  accessibilityState={{ checked: selected }}
                  onPress={() => toggleServiceMode(option.id)}
                  style={({ pressed }) => [
                    styles.modePressable,
                    pressed && styles.modePressed,
                  ]}
                >
                  <GlassSurface
                    variant={selected ? "prominent" : "regular"}
                    radius={Radius.xl}
                    style={[
                      styles.modeSurface,
                      selected && styles.selectedModeSurface,
                      selected && Shadows.small,
                    ]}
                    contentStyle={styles.modeContent}
                  >
                    <View
                      style={[
                        styles.modeIcon,
                        selected && styles.selectedModeIcon,
                      ]}
                    >
                      <Ionicons
                        name={option.icon}
                        size={24}
                        color={
                          selected
                            ? Colors.white
                            : Colors.textSecondary
                        }
                      />
                    </View>

                    <View style={styles.modeCopy}>
                      <Text
                        style={[
                          styles.modeTitle,
                          selected && styles.selectedModeTitle,
                        ]}
                      >
                        {option.title}
                      </Text>

                      <Text style={styles.modeSubtitle}>
                        {option.subtitle}
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.checkbox,
                        selected && styles.checkboxSelected,
                      ]}
                    >
                      {selected ? (
                        <Ionicons
                          name="checkmark"
                          size={17}
                          color={Colors.white}
                        />
                      ) : null}
                    </View>
                  </GlassSurface>
                </Pressable>
              );
            })}
          </View>

          {modesError ? (
            <Text style={styles.errorText}>
              {modesError}
            </Text>
          ) : null}
        </View>

        {requiresTravelRadius ? (
          <GlassSelect
            label="محدودهٔ رفت‌وآمد"
            placeholder="انتخاب شعاع خدمات"
            title="محدودهٔ رفت‌وآمد"
            subtitle="حداکثر فاصله‌ای را که برای انجام خدمت طی می‌کنید انتخاب نمایید."
            options={radiusOptions}
            value={radiusId}
            onChange={(value) => {
              setRadiusId(value);

              if (submitted) {
                setSubmitted(false);
              }
            }}
            searchable={false}
            error={radiusError}
          />
        ) : null}

        {selectedProvince && selectedDistrict ? (
          <GlassSurface
            variant="regular"
            radius={Radius.xl}
            style={styles.summaryCard}
            contentStyle={styles.summaryContent}
          >
            <View style={styles.summaryIcon}>
              <Ionicons
                name="location-outline"
                size={23}
                color={Colors.primary}
              />
            </View>

            <View style={styles.summaryCopy}>
              <Text style={styles.summaryLabel}>
                محل اصلی فعالیت
              </Text>

              <Text style={styles.summaryTitle}>
                {selectedDistrict.nameFa}،{" "}
                {selectedProvince.nameFa}
              </Text>

              <Text style={styles.summarySubtitle}>
                بعداً می‌توانید مناطق بیشتری را به پروفایل خود اضافه
                کنید.
              </Text>
            </View>
          </GlassSurface>
        ) : null}
      </View>
    </AppScreen>
  );
}

function getSingleParam(
  value: string | string[] | undefined,
): string {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
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
    marginTop: Spacing.xl,
    alignItems: "flex-end",
    gap: Spacing.xl,
  },

  headerIcon: {
    width: 70,
    height: 70,
    alignSelf: "flex-end",
    backgroundColor: "rgba(76, 141, 255, 0.10)",
    borderColor: "rgba(100, 158, 255, 0.28)",
  },

  headerIconContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  headerCopy: {
    width: "100%",
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

  form: {
    width: "100%",
    marginTop: Spacing.xxl,
    gap: Spacing.xxl,
  },

  section: {
    width: "100%",
    gap: Spacing.md,
  },

  sectionHeader: {
    width: "100%",
    alignItems: "flex-end",
    gap: Spacing.xs,
  },

  sectionTitle: {
    ...Typography.sectionTitle,
    width: "100%",
    color: Colors.textPrimary,
    textAlign: "right",
    writingDirection: "rtl",
    fontSize: 20,
    lineHeight: 27,
  },

  sectionSubtitle: {
    ...Typography.captionStyle,
    width: "100%",
    color: Colors.textTertiary,
    textAlign: "right",
    writingDirection: "rtl",
  },

  modeOptions: {
    width: "100%",
    gap: Spacing.md,
  },

  modePressable: {
    width: "100%",
    borderRadius: Radius.xl,
  },

  modePressed: {
    opacity: 0.9,
    transform: [{ scale: 0.993 }],
  },

  modeSurface: {
    width: "100%",
  },

  selectedModeSurface: {
    borderColor: "rgba(76, 141, 255, 0.58)",
    backgroundColor: "rgba(76, 141, 255, 0.11)",
  },

  modeContent: {
    minHeight: 92,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: Spacing.md,
    padding: Spacing.lg,
  },

  modeIcon: {
    width: 48,
    height: 48,
    flexShrink: 0,
    borderRadius: Radius.lg,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.glass,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
  },

  selectedModeIcon: {
    backgroundColor: Colors.primary,
    borderColor: "rgba(255, 255, 255, 0.24)",
  },

  modeCopy: {
    flex: 1,
    alignItems: "flex-end",
    gap: Spacing.xs,
  },

  modeTitle: {
    ...Typography.label,
    width: "100%",
    color: Colors.textPrimary,
    textAlign: "right",
    writingDirection: "rtl",
    fontSize: 17,
    lineHeight: 23,
  },

  selectedModeTitle: {
    color: "#DCE9FF",
  },

  modeSubtitle: {
    ...Typography.captionStyle,
    width: "100%",
    color: Colors.textSecondary,
    textAlign: "right",
    writingDirection: "rtl",
    lineHeight: 19,
  },

  checkbox: {
    width: 27,
    height: 27,
    flexShrink: 0,
    borderRadius: Radius.sm,
    borderWidth: 1.5,
    borderColor: Colors.borderStrong,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.glass,
  },

  checkboxSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary,
  },

  errorText: {
    ...Typography.captionStyle,
    color: Colors.error,
    textAlign: "right",
    writingDirection: "rtl",
  },

  summaryCard: {
    width: "100%",
  },

  summaryContent: {
    minHeight: 96,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: Spacing.md,
    padding: Spacing.lg,
  },

  summaryIcon: {
    width: 48,
    height: 48,
    flexShrink: 0,
    borderRadius: Radius.lg,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primarySoft,
  },

  summaryCopy: {
    flex: 1,
    alignItems: "flex-end",
    gap: Spacing.xs,
  },

  summaryLabel: {
    ...Typography.captionStyle,
    width: "100%",
    color: Colors.primary,
    textAlign: "right",
    writingDirection: "rtl",
  },

  summaryTitle: {
    ...Typography.label,
    width: "100%",
    color: Colors.textPrimary,
    textAlign: "right",
    writingDirection: "rtl",
    fontSize: 17,
    lineHeight: 23,
  },

  summarySubtitle: {
    ...Typography.captionStyle,
    width: "100%",
    color: Colors.textTertiary,
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
    maxWidth: 350,
    color: Colors.textTertiary,
    textAlign: "center",
    writingDirection: "rtl",
  },
});