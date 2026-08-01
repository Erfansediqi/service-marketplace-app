import { useRouter } from "expo-router";
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
    Spacing,
    Typography,
} from "../constants/theme";
import { provinces } from "../data/afghanistan-addresses";

export default function ManualAddressScreen() {
  const router = useRouter();

  const [provinceId, setProvinceId] = useState("");
  const [districtId, setDistrictId] = useState("");
  const [neighbourhood, setNeighbourhood] = useState("");
  const [street, setStreet] = useState("");
  const [house, setHouse] = useState("");
  const [details, setDetails] = useState("");
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
        ],
      })),
    [],
  );

  const selectedProvince = useMemo(
    () =>
      provinces.find(
        (province) => province.id === provinceId,
      ),
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
        ],
      })) ?? [],
    [selectedProvince],
  );

  const selectedDistrict = useMemo(
    () =>
      selectedProvince?.districts.find(
        (district) => district.id === districtId,
      ),
    [districtId, selectedProvince],
  );

  const provinceError =
    submitted && !provinceId
      ? "لطفاً ولایت خود را انتخاب کنید."
      : undefined;

  const districtError =
    submitted && !districtId
      ? "لطفاً شهر یا ولسوالی خود را انتخاب کنید."
      : undefined;

  const neighbourhoodError =
    submitted && neighbourhood.trim().length < 2
      ? "لطفاً ناحیه یا محله را وارد کنید."
      : undefined;

  const formIsValid =
    Boolean(provinceId) &&
    Boolean(districtId) &&
    neighbourhood.trim().length >= 2;

  const handleProvinceChange = (
    value: string,
    _option: GlassSelectOption,
  ) => {
    setProvinceId(value);

    // Reset the district because it belongs to the previous province.
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

  const saveAddress = () => {
    setSubmitted(true);

    if (!formIsValid) {
      return;
    }

    const address = {
      provinceId,
      provinceName: selectedProvince?.nameFa ?? "",
      districtId,
      districtName: selectedDistrict?.nameFa ?? "",
      neighbourhood: neighbourhood.trim(),
      street: street.trim(),
      house: house.trim(),
      details: details.trim(),
      source: "manual" as const,
    };

    console.log("Manual address:", address);

    /*
     * Later, save `address` to the authenticated user's profile
     * or onboarding state before navigating to the next screen.
     */

    router.replace("/explore");
  };

  return (
    <AppScreen
      keyboardAware
      scrollable
      contentStyle={styles.content}
      footer={
        <GlassButton
          label="ذخیره آدرس"
          icon="checkmark"
          iconPosition="left"
          onPress={saveAddress}
        />
      }
    >
      <View style={styles.topBar}>
        <GlassIconButton
          icon="chevron-back"
          accessibilityLabel="بازگشت"
          onPress={() => router.back()}
        />
      </View>

      <View style={styles.header}>
        <Text style={styles.eyebrow}>
          آدرس دستی
        </Text>

        <Text style={styles.title}>
          آدرس خود را وارد کنید
        </Text>

        <Text style={styles.subtitle}>
          ولایت و ولسوالی را انتخاب کنید و سپس جزئیات
          آدرس خود را وارد نمایید.
        </Text>
      </View>

      <View style={styles.form}>
        <GlassSelect
          label="ولایت"
          placeholder="انتخاب ولایت"
          title="انتخاب ولایت"
          subtitle="ولایت محل سکونت خود را انتخاب کنید."
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
              ? `شهر یا ولسوالی مورد نظر در ولایت ${selectedProvince.nameFa} را انتخاب کنید.`
              : "ابتدا ولایت خود را انتخاب کنید."
          }
          options={districtOptions}
          value={districtId}
          onChange={handleDistrictChange}
          searchable
          searchPlaceholder="جستجوی شهر یا ولسوالی..."
          emptyMessage="شهر یا ولسوالی پیدا نشد."
          disabled={!provinceId}
          error={districtError}
        />

        <GlassInput
          label="ناحیه / محله"
          placeholder="مثلاً ناحیه پنجم"
          value={neighbourhood}
          onChangeText={(value) => {
            setNeighbourhood(value);

            if (submitted) {
              setSubmitted(false);
            }
          }}
          error={neighbourhoodError}
          autoCapitalize="words"
          returnKeyType="next"
        />

        <GlassInput
          label="کوچه یا سرک"
          placeholder="نام کوچه یا سرک"
          value={street}
          onChangeText={setStreet}
          autoCapitalize="words"
          returnKeyType="next"
        />

        <GlassInput
          label="شماره خانه / آپارتمان"
          placeholder="اختیاری"
          value={house}
          onChangeText={setHouse}
          returnKeyType="next"
        />

        <GlassInput
          label="توضیحات بیشتر"
          placeholder="مثلاً کنار مسجد، روبه‌روی مکتب..."
          value={details}
          onChangeText={setDetails}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          style={styles.notes}
          returnKeyType="done"
        />
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xxl,
  },

  topBar: {
    minHeight: 44,
    alignItems: "flex-start",
  },

  header: {
    marginTop: Spacing.xl,
    gap: Spacing.sm,
    alignItems: "flex-end",
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
  },

  subtitle: {
    ...Typography.bodyLarge,
    width: "100%",
    maxWidth: 440,
    color: Colors.textSecondary,
    textAlign: "right",
    writingDirection: "rtl",
  },

  form: {
    width: "100%",
    marginTop: Spacing.xxl,
    gap: Spacing.xl,
  },

  notes: {
    minHeight: 110,
    paddingTop: Spacing.lg,
    textAlign: "right",
    writingDirection: "rtl",
  },
});