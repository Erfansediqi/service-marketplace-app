import { Ionicons } from "@expo/vector-icons";
import { ComponentProps, useMemo, useState } from "react";
import {
    FlatList,
    Pressable,
    StyleProp,
    StyleSheet,
    Text,
    TextInput,
    View,
    ViewStyle,
} from "react-native";

import {
    Colors,
    Layout,
    Radius,
    Spacing,
    Typography
} from "../../constants/theme";
import { GlassBottomSheet } from "./glass-bottom-sheet";
import { GlassSurface } from "./glass-surface";

type IconName = ComponentProps<typeof Ionicons>["name"];

export type GlassSelectOption = {
  id: string;
  label: string;
  secondaryLabel?: string;
  searchTerms?: string[];
  disabled?: boolean;
};

type GlassSelectProps = {
  label: string;
  placeholder: string;
  options: GlassSelectOption[];
  value?: string;
  onChange: (value: string, option: GlassSelectOption) => void;

  title?: string;
  subtitle?: string;
  icon?: IconName;

  searchable?: boolean;
  searchPlaceholder?: string;
  emptyMessage?: string;

  disabled?: boolean;
  error?: string;

  containerStyle?: StyleProp<ViewStyle>;
};

export function GlassSelect({
  label,
  placeholder,
  options,
  value,
  onChange,

  title = label,
  subtitle,
  icon = "chevron-down",

  searchable = true,
  searchPlaceholder = "جستجو...",
  emptyMessage = "نتیجه‌ای پیدا نشد.",

  disabled = false,
  error,

  containerStyle,
}: GlassSelectProps) {
  const [visible, setVisible] = useState(false);
  const [query, setQuery] = useState("");

  const selectedOption = useMemo(
    () => options.find((option) => option.id === value),
    [options, value],
  );

  const filteredOptions = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();

    if (!normalizedQuery) {
      return options;
    }

    return options.filter((option) => {
      const searchableText = [
        option.label,
        option.secondaryLabel,
        ...(option.searchTerms ?? []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLocaleLowerCase();

      return searchableText.includes(normalizedQuery);
    });
  }, [options, query]);

  const openSheet = () => {
    if (disabled) {
      return;
    }

    setQuery("");
    setVisible(true);
  };

  const closeSheet = () => {
    setVisible(false);
    setQuery("");
  };

  const handleSelect = (option: GlassSelectOption) => {
    if (option.disabled) {
      return;
    }

    onChange(option.id, option);
    closeSheet();
  };

  const renderOption = ({ item }: { item: GlassSelectOption }) => {
    const selected = item.id === value;

    return (
      <Pressable
        accessibilityRole="button"
        accessibilityState={{
          selected,
          disabled: item.disabled,
        }}
        disabled={item.disabled}
        onPress={() => handleSelect(item)}
        style={({ pressed }) => [
          styles.optionPressable,
          pressed && !item.disabled && styles.optionPressed,
          item.disabled && styles.optionDisabled,
        ]}
      >
        <GlassSurface
          variant={selected ? "prominent" : "regular"}
          radius={Radius.lg}
          style={[
            styles.optionSurface,
            selected && styles.selectedOptionSurface,
          ]}
          contentStyle={styles.optionContent}
        >
          <View style={styles.optionText}>
            <Text
              numberOfLines={1}
              style={[
                styles.optionLabel,
                selected && styles.selectedOptionLabel,
              ]}
            >
              {item.label}
            </Text>

            {item.secondaryLabel ? (
              <Text
                numberOfLines={1}
                style={styles.optionSecondaryLabel}
              >
                {item.secondaryLabel}
              </Text>
            ) : null}
          </View>

          <View
            style={[
              styles.selectionIndicator,
              selected && styles.selectionIndicatorSelected,
            ]}
          >
            {selected ? (
              <Ionicons
                name="checkmark"
                size={18}
                color={Colors.white}
              />
            ) : null}
          </View>
        </GlassSurface>
      </Pressable>
    );
  };

  return (
    <>
      <View style={[styles.container, containerStyle]}>
        <Text
          style={[
            styles.label,
            error && styles.errorLabel,
          ]}
        >
          {label}
        </Text>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={label}
          accessibilityHint={`انتخاب ${label}`}
          accessibilityState={{ disabled }}
          disabled={disabled}
          onPress={openSheet}
          style={({ pressed }) => [
            styles.fieldPressable,
            pressed && !disabled && styles.fieldPressed,
            disabled && styles.disabled,
          ]}
        >
          <GlassSurface
            variant="regular"
            radius={Radius.lg}
            style={[
              styles.fieldSurface,
              error && styles.errorSurface,
            ]}
            contentStyle={styles.fieldContent}
          >
            <View style={styles.fieldText}>
              <Text
                numberOfLines={1}
                style={[
                  styles.valueText,
                  !selectedOption && styles.placeholderText,
                ]}
              >
                {selectedOption?.label ?? placeholder}
              </Text>

              {selectedOption?.secondaryLabel ? (
                <Text
                  numberOfLines={1}
                  style={styles.selectedSecondaryText}
                >
                  {selectedOption.secondaryLabel}
                </Text>
              ) : null}
            </View>

            <View style={styles.fieldIcon}>
              <Ionicons
                name={icon}
                size={20}
                color={Colors.textSecondary}
              />
            </View>
          </GlassSurface>
        </Pressable>

        {error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : null}
      </View>

      <GlassBottomSheet
        visible={visible}
        onClose={closeSheet}
        title={title}
        subtitle={subtitle}
        scrollable={false}
        keyboardAware
      >
        <View style={styles.sheetContent}>
          {searchable ? (
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
                autoFocus
                value={query}
                onChangeText={setQuery}
                placeholder={searchPlaceholder}
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
          ) : null}

          <FlatList
            data={filteredOptions}
            keyExtractor={(item) => item.id}
            renderItem={renderOption}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[
              styles.listContent,
              filteredOptions.length === 0 &&
                styles.emptyListContent,
            ]}
            ItemSeparatorComponent={() => (
              <View style={styles.separator} />
            )}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <GlassSurface
                  variant="regular"
                  radius={Radius.xxl}
                  style={styles.emptyIconSurface}
                  contentStyle={styles.emptyIconContent}
                >
                  <Ionicons
                    name="search-outline"
                    size={26}
                    color={Colors.textTertiary}
                  />
                </GlassSurface>

                <Text style={styles.emptyTitle}>
                  {emptyMessage}
                </Text>

                <Text style={styles.emptySubtitle}>
                  عبارت دیگری را امتحان کنید.
                </Text>
              </View>
            }
          />
        </View>
      </GlassBottomSheet>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    gap: Spacing.sm,
  },

  label: {
    ...Typography.label,
    color: Colors.textSecondary,
    textAlign: "right",
    writingDirection: "rtl",
    paddingRight: 2,
  },

  errorLabel: {
    color: Colors.error,
  },

  fieldPressable: {
    width: "100%",
    minHeight: Layout.controlHeight,
    borderRadius: Radius.lg,
  },

  fieldSurface: {
    minHeight: Layout.controlHeight,
  },

  fieldContent: {
    minHeight: Layout.controlHeight,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },

  fieldText: {
    flex: 1,
    alignItems: "flex-end",
    gap: 2,
  },

  valueText: {
    ...Typography.bodyStyle,
    width: "100%",
    color: Colors.textPrimary,
    textAlign: "right",
    writingDirection: "rtl",
  },

  placeholderText: {
    color: Colors.textMuted,
  },

  selectedSecondaryText: {
    ...Typography.captionStyle,
    width: "100%",
    color: Colors.textTertiary,
    textAlign: "right",
    writingDirection: "rtl",
  },

  fieldIcon: {
    width: 30,
    height: 30,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.glass,
  },

  fieldPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.995 }],
  },

  disabled: {
    opacity: 0.45,
  },

  errorSurface: {
    borderColor: "rgba(225, 90, 90, 0.72)",
  },

  errorText: {
    ...Typography.captionStyle,
    color: Colors.error,
    textAlign: "right",
    writingDirection: "rtl",
    paddingRight: 2,
  },

  sheetContent: {
    flex: 1,
    gap: Spacing.lg,
  },

  searchSurface: {
    width: "100%",
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

  listContent: {
    paddingBottom: Spacing.xxl,
  },

  emptyListContent: {
    flexGrow: 1,
    justifyContent: "center",
  },

  optionPressable: {
    width: "100%",
    borderRadius: Radius.lg,
  },

  optionSurface: {
    width: "100%",
  },

  selectedOptionSurface: {
    borderColor: "rgba(76, 141, 255, 0.55)",
    backgroundColor: "rgba(76, 141, 255, 0.10)",
  },

  optionContent: {
    minHeight: 62,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },

  optionText: {
    flex: 1,
    alignItems: "flex-end",
    gap: 3,
  },

  optionLabel: {
    ...Typography.bodyStyle,
    width: "100%",
    color: Colors.textPrimary,
    textAlign: "right",
    writingDirection: "rtl",
  },

  selectedOptionLabel: {
    color: "#DCE9FF",
    fontWeight: "600",
  },

  optionSecondaryLabel: {
    ...Typography.captionStyle,
    width: "100%",
    color: Colors.textTertiary,
    textAlign: "right",
    writingDirection: "rtl",
  },

  selectionIndicator: {
    width: 28,
    height: 28,
    borderRadius: Radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.borderStrong,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.glass,
  },

  selectionIndicatorSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary,
  },

  optionPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.992 }],
  },

  optionDisabled: {
    opacity: 0.4,
  },

  separator: {
    height: Spacing.sm,
  },

  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.md,
    paddingHorizontal: Spacing.xl,
  },

  emptyIconSurface: {
    width: 68,
    height: 68,
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
    color: Colors.textSecondary,
    textAlign: "center",
    writingDirection: "rtl",
  },
});