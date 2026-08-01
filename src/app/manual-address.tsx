import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { GlassButton } from "../components/glass/glass-button";
import { GlassIconButton } from "../components/glass/glass-icon-button";
import { GlassInput } from "../components/glass/glass-input";
import {
  GlassSelect,
  GlassSelectOption,
} from "../components/glass/glass-select";
import { AppScreen } from "../components/layout/app-screen";
import { Colors, Spacing, Typography } from "../constants/theme";
import { useLanguage } from "../context/languagecontext";
import { provinces } from "../data/afghanistan-addresses";

export default function ManualAddressScreen() {
  const router = useRouter();
  const { t, language } = useLanguage();
  const isEnglish = language === "English";

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
        label: isEnglish ? province.nameEn : province.nameFa,
        secondaryLabel: isEnglish ? province.nameFa : province.nameEn,
        searchTerms: [province.nameFa, province.nameEn],
      })),
    [isEnglish],
  );

  const selectedProvince = useMemo(
    () => provinces.find((province) => province.id === provinceId),
    [provinceId],
  );

  const districtOptions = useMemo<GlassSelectOption[]>(
    () =>
      selectedProvince?.districts.map((district) => ({
        id: district.id,
        label: isEnglish ? district.nameEn : district.nameFa,
        secondaryLabel: isEnglish ? district.nameFa : district.nameEn,
        searchTerms: [district.nameFa, district.nameEn],
      })) ?? [],
    [selectedProvince, isEnglish],
  );

  const selectedDistrict = useMemo(
    () =>
      selectedProvince?.districts.find(
        (district) => district.id === districtId,
      ),
    [districtId, selectedProvince],
  );

  const provinceError =
    submitted && !provinceId ? t("provinceErrorText") : undefined;

  const districtError =
    submitted && !districtId ? t("districtErrorText") : undefined;

  const neighbourhoodError =
    submitted && neighbourhood.trim().length < 2
      ? t("neighbourhoodErrorText")
      : undefined;

  const formIsValid =
    Boolean(provinceId) &&
    Boolean(districtId) &&
    neighbourhood.trim().length >= 2;

  const handleProvinceChange = (value: string, _option: GlassSelectOption) => {
    setProvinceId(value);
    setDistrictId("");

    if (submitted) {
      setSubmitted(false);
    }
  };

  const handleDistrictChange = (value: string, _option: GlassSelectOption) => {
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
      provinceName: selectedProvince
        ? isEnglish
          ? selectedProvince.nameEn
          : selectedProvince.nameFa
        : "",
      districtId,
      districtName: selectedDistrict
        ? isEnglish
          ? selectedDistrict.nameEn
          : selectedDistrict.nameFa
        : "",
      neighbourhood: neighbourhood.trim(),
      street: street.trim(),
      house: house.trim(),
      details: details.trim(),
      source: "manual" as const,
    };

    console.log("Manual address:", address);

    router.replace("/role-selection");
  };

  return (
    <AppScreen
      keyboardAware
      scrollable
      contentStyle={styles.content}
      footer={
        <GlassButton
          label={t("saveAddressButton")}
          icon="checkmark"
          iconPosition={isEnglish ? "left" : "right"}
          onPress={saveAddress}
        />
      }
    >
      <View
        style={[
          styles.topBar,
          { alignItems: isEnglish ? "flex-start" : "flex-end" },
        ]}
      >
        <GlassIconButton
          icon="chevron-back"
          accessibilityLabel={t("backLabel")}
          onPress={() => router.back()}
        />
      </View>

      <View
        style={[
          styles.header,
          { alignItems: isEnglish ? "flex-start" : "flex-end" },
        ]}
      >
        <Text
          style={[
            styles.eyebrow,
            {
              textAlign: isEnglish ? "left" : "right",
              writingDirection: isEnglish ? "ltr" : "rtl",
            },
          ]}
        >
          {t("manualEyebrow")}
        </Text>

        <Text
          style={[
            styles.title,
            {
              textAlign: isEnglish ? "left" : "right",
              writingDirection: isEnglish ? "ltr" : "rtl",
            },
          ]}
        >
          {t("manualTitle")}
        </Text>

        <Text
          style={[
            styles.subtitle,
            {
              textAlign: isEnglish ? "left" : "right",
              writingDirection: isEnglish ? "ltr" : "rtl",
            },
          ]}
        >
          {t("manualSubtitle")}
        </Text>
      </View>

      <View style={styles.form}>
        <GlassSelect
          label={t("provinceLabel")}
          placeholder={t("provincePlaceholder")}
          title={t("provinceTitle")}
          subtitle={t("provinceSubtitle")}
          options={provinceOptions}
          value={provinceId}
          onChange={handleProvinceChange}
          searchable
          searchPlaceholder={t("provinceSearch")}
          emptyMessage={t("provinceEmpty")}
          error={provinceError}
        />

        <GlassSelect
          label={t("districtLabel")}
          placeholder={
            provinceId
              ? t("districtPlaceholder")
              : t("districtPlaceholderDisabled")
          }
          title={t("districtTitle")}
          subtitle={
            selectedProvince
              ? `${t("districtSubtitle")}`
              : t("provincePlaceholder")
          }
          options={districtOptions}
          value={districtId}
          onChange={handleDistrictChange}
          searchable
          searchPlaceholder={t("districtSearch")}
          emptyMessage={t("districtEmpty")}
          disabled={!provinceId}
          error={districtError}
        />

        <GlassInput
          label={t("neighbourhoodLabel")}
          placeholder={t("neighbourhoodPlaceholder")}
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
          style={{
            textAlign: isEnglish ? "left" : "right",
            writingDirection: isEnglish ? "ltr" : "rtl",
          }}
        />

        <GlassInput
          label={t("streetLabel")}
          placeholder={t("streetPlaceholder")}
          value={street}
          onChangeText={setStreet}
          autoCapitalize="words"
          returnKeyType="next"
          style={{
            textAlign: isEnglish ? "left" : "right",
            writingDirection: isEnglish ? "ltr" : "rtl",
          }}
        />

        <GlassInput
          label={t("houseLabel")}
          placeholder={t("housePlaceholder")}
          value={house}
          onChangeText={setHouse}
          returnKeyType="next"
          style={{
            textAlign: isEnglish ? "left" : "right",
            writingDirection: isEnglish ? "ltr" : "rtl",
          }}
        />

        <GlassInput
          label={t("detailsLabel")}
          placeholder={t("detailsPlaceholder")}
          value={details}
          onChangeText={setDetails}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          style={[
            styles.notes,
            {
              textAlign: isEnglish ? "left" : "right",
              writingDirection: isEnglish ? "ltr" : "rtl",
            },
          ]}
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
  },

  header: {
    marginTop: Spacing.xl,
    gap: Spacing.sm,
  },

  eyebrow: {
    ...Typography.captionStyle,
    width: "100%",
    color: Colors.primary,
  },

  title: {
    ...Typography.screenTitle,
    width: "100%",
    color: Colors.textPrimary,
  },

  subtitle: {
    ...Typography.bodyLarge,
    width: "100%",
    maxWidth: 440,
    color: Colors.textSecondary,
  },

  form: {
    width: "100%",
    marginTop: Spacing.xxl,
    gap: Spacing.xl,
  },

  notes: {
    minHeight: 110,
    paddingTop: Spacing.lg,
  },
});
