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
    CategoryService,
    getServicesByCategory,
} from "../data/category-services";
import { serviceProfessions } from "../data/service-professions";

const MAX_SERVICES = 8;

export default function ProviderServicesScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    category?: string | string[];
  }>();

  const categoryId = Array.isArray(params.category)
    ? params.category[0]
    : params.category ?? "";

  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);

  const category = useMemo(
    () =>
      serviceProfessions.find(
        (item) => item.id === categoryId,
      ) ?? null,
    [categoryId],
  );

  const services = useMemo(
    () => getServicesByCategory(categoryId),
    [categoryId],
  );

  const toggleService = (service: CategoryService) => {
    setSelectedServiceIds((current) => {
      const selected = current.includes(service.id);

      if (selected) {
        return current.filter((id) => id !== service.id);
      }

      if (current.length >= MAX_SERVICES) {
        return current;
      }

      return [...current, service.id];
    });
  };

  const handleContinue = () => {
    if (selectedServiceIds.length === 0) {
      return;
    }

    router.push({
      pathname: "/provider-details",
      params: {
        category: categoryId,
        services: selectedServiceIds.join(","),
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
            label={`ادامه با ${selectedServiceIds.length} خدمت`}
            icon="arrow-back"
            iconPosition="left"
            disabled={selectedServiceIds.length === 0}
            onPress={handleContinue}
          />

          <Text style={styles.helperText}>
            می‌توانید حداکثر {MAX_SERVICES} خدمت انتخاب کنید.
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
          مرحله ۲ از ۶
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
            name={category?.icon ?? "construct-outline"}
            size={32}
            color={Colors.primary}
          />
        </GlassSurface>

        <View style={styles.headerCopy}>
          <Text style={styles.eyebrow}>
            {category?.nameFa ?? "خدمات"}
          </Text>

          <Text style={styles.title}>
            کدام خدمات را ارائه می‌کنید؟
          </Text>

          <Text style={styles.subtitle}>
            تمام خدماتی را که تجربه و توانایی انجام آن‌ها را دارید انتخاب
            کنید.
          </Text>
        </View>
      </View>

      <View style={styles.selectionSummary}>
        <Text style={styles.selectionCount}>
          {selectedServiceIds.length} انتخاب‌شده
        </Text>

        <Text style={styles.selectionLimit}>
          حداکثر {MAX_SERVICES} مورد
        </Text>
      </View>

      <View style={styles.services}>
        {services.map((service) => {
          const selected = selectedServiceIds.includes(service.id);
          const limitReached =
            selectedServiceIds.length >= MAX_SERVICES && !selected;

          return (
            <Pressable
              key={service.id}
              accessibilityRole="checkbox"
              accessibilityLabel={service.nameFa}
              accessibilityState={{
                checked: selected,
                disabled: limitReached,
              }}
              disabled={limitReached}
              onPress={() => toggleService(service)}
              style={({ pressed }) => [
                styles.servicePressable,
                pressed && styles.servicePressed,
                limitReached && styles.serviceDisabled,
              ]}
            >
              <GlassSurface
                variant={selected ? "prominent" : "regular"}
                radius={Radius.xl}
                style={[
                  styles.serviceSurface,
                  selected && styles.selectedServiceSurface,
                  selected && Shadows.small,
                ]}
                contentStyle={styles.serviceContent}
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
                      size={18}
                      color={Colors.white}
                    />
                  ) : null}
                </View>

                <View style={styles.serviceCopy}>
                  <Text
                    style={[
                      styles.serviceTitle,
                      selected && styles.selectedServiceTitle,
                    ]}
                  >
                    {service.nameFa}
                  </Text>

                  <Text style={styles.serviceEnglish}>
                    {service.nameEn}
                  </Text>

                  {service.descriptionFa ? (
                    <Text style={styles.serviceDescription}>
                      {service.descriptionFa}
                    </Text>
                  ) : null}
                </View>
              </GlassSurface>
            </Pressable>
          );
        })}

        {services.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons
              name="alert-circle-outline"
              size={34}
              color={Colors.textTertiary}
            />

            <Text style={styles.emptyTitle}>
              خدمات این بخش هنوز اضافه نشده‌اند
            </Text>

            <Text style={styles.emptySubtitle}>
              بازگردید و یک بخش دیگر را انتخاب کنید.
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

  selectionSummary: {
    marginTop: Spacing.xxl,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
  },

  selectionCount: {
    ...Typography.label,
    color: Colors.primary,
    textAlign: "right",
    writingDirection: "rtl",
  },

  selectionLimit: {
    ...Typography.captionStyle,
    color: Colors.textTertiary,
    textAlign: "right",
    writingDirection: "rtl",
  },

  services: {
    width: "100%",
    marginTop: Spacing.lg,
    gap: Spacing.md,
  },

  servicePressable: {
    width: "100%",
    borderRadius: Radius.xl,
  },

  servicePressed: {
    opacity: 0.9,
    transform: [{ scale: 0.994 }],
  },

  serviceDisabled: {
    opacity: 0.42,
  },

  serviceSurface: {
    width: "100%",
  },

  selectedServiceSurface: {
    borderColor: "rgba(76, 141, 255, 0.58)",
    backgroundColor: "rgba(76, 141, 255, 0.11)",
  },

  serviceContent: {
    minHeight: 84,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: Spacing.md,
    padding: Spacing.lg,
  },

  checkbox: {
    width: 28,
    height: 28,
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

  serviceCopy: {
    flex: 1,
    alignItems: "flex-end",
    gap: 3,
  },

  serviceTitle: {
    ...Typography.label,
    width: "100%",
    color: Colors.textPrimary,
    textAlign: "right",
    writingDirection: "rtl",
    fontSize: 17,
    lineHeight: 23,
  },

  selectedServiceTitle: {
    color: "#DCE9FF",
  },

  serviceEnglish: {
    ...Typography.captionStyle,
    width: "100%",
    color: Colors.textTertiary,
    textAlign: "right",
  },

  serviceDescription: {
    ...Typography.captionStyle,
    width: "100%",
    color: Colors.textSecondary,
    textAlign: "right",
    writingDirection: "rtl",
  },

  emptyState: {
    minHeight: 260,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.md,
    paddingHorizontal: Spacing.xl,
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