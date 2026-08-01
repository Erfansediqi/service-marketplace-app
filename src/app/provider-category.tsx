import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

import { GlassButton } from "../components/glass/glass-button";
import { GlassIconButton } from "../components/glass/glass-icon-button";
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
import {
    ServiceProfession,
    serviceProfessions,
} from "../data/service-professions";

export default function ProviderCategoryScreen() {
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null,
  );

  const filteredCategories = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();

    if (!normalizedQuery) {
      return serviceProfessions;
    }

    return serviceProfessions.filter((category) => {
      const searchableText = [
        category.nameFa,
        category.nameEn,
        category.descriptionFa,
      ]
        .join(" ")
        .toLocaleLowerCase();

      return searchableText.includes(normalizedQuery);
    });
  }, [query]);

  const selectedCategory = useMemo(
    () =>
      serviceProfessions.find(
        (category) => category.id === selectedCategoryId,
      ) ?? null,
    [selectedCategoryId],
  );

  const handleSelectCategory = (category: ServiceProfession) => {
    setSelectedCategoryId(category.id);
  };

  const handleContinue = () => {
    if (!selectedCategory) {
      return;
    }

    router.push({
      pathname: "/provider-services",
      params: {
        category: selectedCategory.id,
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
            disabled={!selectedCategory}
            onPress={handleContinue}
          />

          <Text style={styles.helperText}>
            در مرحلهٔ بعد، خدمات مشخص این بخش را انتخاب می‌کنید.
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

        <Text style={styles.stepText}>مرحله ۱ از ۶</Text>
      </View>

      <View style={styles.header}>
        <GlassSurface
          variant="prominent"
          radius={Radius.xxl}
          style={styles.headerIcon}
          contentStyle={styles.headerIconContent}
        >
          <Ionicons
            name="grid-outline"
            size={32}
            color={Colors.primary}
          />
        </GlassSurface>

        <View style={styles.headerCopy}>
          <Text style={styles.eyebrow}>نوع فعالیت</Text>

          <Text style={styles.title}>
            در کدام بخش خدمات ارائه می‌کنید؟
          </Text>

          <Text style={styles.subtitle}>
            یک بخش اصلی را انتخاب کنید. سپس خدمات دقیق مربوط به آن را مشخص
            خواهید کرد.
          </Text>
        </View>
      </View>

      <GlassSurface
        variant="regular"
        radius={Radius.lg}
        style={styles.searchSurface}
        contentStyle={styles.searchContent}
      >
        <Ionicons
          name="search-outline"
          size={20}
          color={Colors.textTertiary}
        />

        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="جستجوی بخش خدمات..."
          placeholderTextColor={Colors.textMuted}
          selectionColor={Colors.primary}
          returnKeyType="search"
          style={styles.searchInput}
        />

        {query.length > 0 ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="پاک کردن جستجو"
            hitSlop={8}
            onPress={() => setQuery("")}
          >
            <Ionicons
              name="close-circle"
              size={20}
              color={Colors.textTertiary}
            />
          </Pressable>
        ) : null}
      </GlassSurface>

      <View style={styles.categories}>
        {filteredCategories.map((category) => {
          const selected = selectedCategoryId === category.id;

          return (
            <Pressable
              key={category.id}
              accessibilityRole="radio"
              accessibilityLabel={category.nameFa}
              accessibilityState={{ selected }}
              onPress={() => handleSelectCategory(category)}
              style={({ pressed }) => [
                styles.categoryPressable,
                pressed && styles.categoryPressed,
              ]}
            >
              <GlassSurface
                variant={selected ? "prominent" : "regular"}
                radius={Radius.xl}
                style={[
                  styles.categorySurface,
                  selected && styles.selectedCategorySurface,
                  selected && Shadows.small,
                ]}
                contentStyle={styles.categoryContent}
              >
                <View
                  style={[
                    styles.categoryIcon,
                    selected && styles.selectedCategoryIcon,
                  ]}
                >
                  <Ionicons
                    name={category.icon}
                    size={25}
                    color={
                      selected ? Colors.white : Colors.textSecondary
                    }
                  />
                </View>

                <View style={styles.categoryCopy}>
                  <Text
                    style={[
                      styles.categoryTitle,
                      selected && styles.selectedCategoryTitle,
                    ]}
                  >
                    {category.nameFa}
                  </Text>

                  <Text style={styles.categoryDescription}>
                    {category.descriptionFa}
                  </Text>

                  <Text style={styles.categoryEnglishName}>
                    {category.nameEn}
                  </Text>
                </View>

                <View
                  style={[
                    styles.radioOuter,
                    selected && styles.radioOuterSelected,
                  ]}
                >
                  {selected ? <View style={styles.radioInner} /> : null}
                </View>
              </GlassSurface>
            </Pressable>
          );
        })}

        {filteredCategories.length === 0 ? (
          <View style={styles.emptyState}>
            <GlassSurface
              variant="regular"
              radius={Radius.xxl}
              style={styles.emptyIconSurface}
              contentStyle={styles.emptyIconContent}
            >
              <Ionicons
                name="search-outline"
                size={27}
                color={Colors.textTertiary}
              />
            </GlassSurface>

            <Text style={styles.emptyTitle}>
              بخشی پیدا نشد
            </Text>

            <Text style={styles.emptySubtitle}>
              عبارت دیگری را جستجو کنید یا گزینهٔ «سایر خدمات» را انتخاب
              نمایید.
            </Text>
          </View>
        ) : null}
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

  searchSurface: {
    width: "100%",
    marginTop: Spacing.xxl,
  },

  searchContent: {
    minHeight: Layout.controlHeight,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },

  searchInput: {
    flex: 1,
    minHeight: Layout.controlHeight,
    paddingVertical: 0,
    ...Typography.bodyStyle,
    color: Colors.textPrimary,
    textAlign: "right",
    writingDirection: "rtl",
  },

  categories: {
    width: "100%",
    marginTop: Spacing.xl,
    gap: Spacing.md,
  },

  categoryPressable: {
    width: "100%",
    borderRadius: Radius.xl,
  },

  categoryPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.993 }],
  },

  categorySurface: {
    width: "100%",
  },

  selectedCategorySurface: {
    borderColor: "rgba(76, 141, 255, 0.58)",
    backgroundColor: "rgba(76, 141, 255, 0.11)",
  },

  categoryContent: {
    minHeight: 112,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: Spacing.md,
    padding: Spacing.lg,
  },

  categoryIcon: {
    width: 52,
    height: 52,
    flexShrink: 0,
    borderRadius: Radius.lg,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.glass,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
  },

  selectedCategoryIcon: {
    backgroundColor: Colors.primary,
    borderColor: "rgba(255, 255, 255, 0.24)",
  },

  categoryCopy: {
    flex: 1,
    alignItems: "flex-end",
    gap: Spacing.xs,
  },

  categoryTitle: {
    ...Typography.label,
    width: "100%",
    color: Colors.textPrimary,
    textAlign: "right",
    writingDirection: "rtl",
    fontSize: 18,
    lineHeight: 24,
  },

  selectedCategoryTitle: {
    color: "#DCE9FF",
  },

  categoryDescription: {
    ...Typography.bodyStyle,
    width: "100%",
    color: Colors.textSecondary,
    textAlign: "right",
    writingDirection: "rtl",
    lineHeight: 21,
  },

  categoryEnglishName: {
    ...Typography.captionStyle,
    width: "100%",
    color: Colors.textTertiary,
    textAlign: "right",
  },

  radioOuter: {
    width: 24,
    height: 24,
    flexShrink: 0,
    borderRadius: Radius.pill,
    borderWidth: 1.5,
    borderColor: Colors.borderStrong,
    alignItems: "center",
    justifyContent: "center",
  },

  radioOuterSelected: {
    borderColor: Colors.primary,
  },

  radioInner: {
    width: 12,
    height: 12,
    borderRadius: Radius.pill,
    backgroundColor: Colors.primary,
  },

  emptyState: {
    minHeight: 280,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.md,
    paddingHorizontal: Spacing.xl,
  },

  emptyIconSurface: {
    width: 70,
    height: 70,
  },

  emptyIconContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  emptyTitle: {
    ...Typography.sectionTitle,
    color: Colors.textPrimary,
    textAlign: "center",
    writingDirection: "rtl",
  },

  emptySubtitle: {
    ...Typography.bodyStyle,
    maxWidth: 340,
    color: Colors.textSecondary,
    textAlign: "center",
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