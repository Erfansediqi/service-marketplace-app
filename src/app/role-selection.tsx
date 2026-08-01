import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
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
    Radius,
    Shadows,
    Spacing,
    Typography,
} from "../constants/theme";

type UserRole = "customer" | "provider";

type RoleOption = {
  id: UserRole;
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
};

const roleOptions: RoleOption[] = [
  {
    id: "customer",
    title: "دریافت‌کنندهٔ خدمات",
    subtitle:
      "خدمات مورد نیاز خود را پیدا کنید، ارائه‌دهندگان را مقایسه کنید و درخواست خود را ثبت نمایید.",
    icon: "person-outline",
  },
  {
    id: "provider",
    title: "ارائه‌دهندهٔ خدمات",
    subtitle:
      "مهارت‌ها و خدمات خود را معرفی کنید، درخواست‌های مشتریان را دریافت کنید و کار خود را گسترش دهید.",
    icon: "briefcase-outline",
  },
];

export default function RoleSelectionScreen() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);

  const handleContinue = () => {
  if (!selectedRole) {
    return;
  }

  if (selectedRole === "provider") {
    router.replace("/provider-welcome");
    return;
  }

  router.replace("/(tabs)");
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
            disabled={!selectedRole}
            onPress={handleContinue}
          />

          <Text style={styles.helperText}>
            بعداً می‌توانید نوع حساب خود را از تنظیمات تغییر دهید.
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
      </View>

      <View style={styles.header}>
        <GlassSurface
          variant="prominent"
          radius={Radius.xxl}
          style={styles.headerIcon}
          contentStyle={styles.headerIconContent}
        >
          <Ionicons
            name="people-outline"
            size={34}
            color={Colors.primary}
          />
        </GlassSurface>

        <View style={styles.headerCopy}>
          <Text style={styles.eyebrow}>نوع حساب</Text>

          <Text style={styles.title}>
            چگونه می‌خواهید از خدمت استفاده کنید؟
          </Text>

          <Text style={styles.subtitle}>
            گزینه‌ای را انتخاب کنید که با نیاز شما مطابقت دارد.
          </Text>
        </View>
      </View>

      <View style={styles.options}>
        {roleOptions.map((option) => {
          const selected = selectedRole === option.id;

          return (
            <Pressable
              key={option.id}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              accessibilityLabel={option.title}
              onPress={() => setSelectedRole(option.id)}
              style={({ pressed }) => [
                styles.optionPressable,
                pressed && styles.optionPressed,
              ]}
            >
              <GlassSurface
                variant={selected ? "prominent" : "regular"}
                radius={Radius.xl}
                style={[
                  styles.optionSurface,
                  selected && styles.selectedOptionSurface,
                  selected && Shadows.small,
                ]}
                contentStyle={styles.optionContent}
              >
                <View style={styles.optionTopRow}>
                  <View
                    style={[
                      styles.iconContainer,
                      selected && styles.selectedIconContainer,
                    ]}
                  >
                    <Ionicons
                      name={option.icon}
                      size={26}
                      color={
                        selected
                          ? Colors.white
                          : Colors.textSecondary
                      }
                    />
                  </View>

                  <View
                    style={[
                      styles.radioOuter,
                      selected && styles.radioOuterSelected,
                    ]}
                  >
                    {selected ? <View style={styles.radioInner} /> : null}
                  </View>
                </View>

                <View style={styles.optionCopy}>
                  <Text
                    style={[
                      styles.optionTitle,
                      selected && styles.selectedOptionTitle,
                    ]}
                  >
                    {option.title}
                  </Text>

                  <Text style={styles.optionSubtitle}>
                    {option.subtitle}
                  </Text>
                </View>
              </GlassSurface>
            </Pressable>
          );
        })}
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
    minHeight: 44,
    alignItems: "flex-start",
  },

  header: {
    marginTop: Spacing.md,
    alignItems: "flex-end",
    gap: Spacing.lg,
  },

  headerIcon: {
    width: 68,
    height: 68,
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
    maxWidth: 430,
    color: Colors.textSecondary,
    textAlign: "right",
    writingDirection: "rtl",
    lineHeight: 24,
  },

  options: {
    width: "100%",
    marginTop: Spacing.xxl,
    gap: Spacing.md,
  },

  optionPressable: {
    width: "100%",
    borderRadius: Radius.xl,
  },

  optionPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.992 }],
  },

  optionSurface: {
    width: "100%",
  },

  selectedOptionSurface: {
    borderColor: "rgba(76, 141, 255, 0.58)",
    backgroundColor: "rgba(76, 141, 255, 0.11)",
  },

  optionContent: {
    padding: Spacing.lg,
    gap: Spacing.md,
  },

  optionTopRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
  },

  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: Radius.lg,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.glass,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
  },

  selectedIconContainer: {
    backgroundColor: Colors.primary,
    borderColor: "rgba(255, 255, 255, 0.24)",
  },

  radioOuter: {
    width: 24,
    height: 24,
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

  optionCopy: {
    width: "100%",
    alignItems: "flex-end",
    gap: Spacing.sm,
  },

  optionTitle: {
    ...Typography.sectionTitle,
    width: "100%",
    color: Colors.textPrimary,
    textAlign: "right",
    writingDirection: "rtl",
    fontSize: 21,
    lineHeight: 28,
  },

  selectedOptionTitle: {
    color: "#DCE9FF",
  },

  optionSubtitle: {
    ...Typography.bodyStyle,
    width: "100%",
    color: Colors.textSecondary,
    textAlign: "right",
    writingDirection: "rtl",
    lineHeight: 22,
  },

  footer: {
    width: "100%",
    alignItems: "center",
    gap: Spacing.sm,
    paddingTop: Spacing.sm,
  },

  helperText: {
    ...Typography.captionStyle,
    maxWidth: 330,
    color: Colors.textTertiary,
    textAlign: "center",
    writingDirection: "rtl",
    lineHeight: 19,
  },
});