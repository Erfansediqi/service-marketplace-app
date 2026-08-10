import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  KhedmatPalette,
  Layout,
  Radius,
  Spacing,
  Typography,
} from "../../constants/theme";
import { useLanguage } from "../../context/languagecontext";

type PolicySectionProps = {
  number: string;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  body: string;
  isRTL: boolean;
  rowDirection: "row" | "row-reverse";
  textDirection: "ltr" | "rtl";
};

export default function TermsPrivacyScreen() {
  const router = useRouter();

  const {
    t,
    isRTL,
    rowDirection,
    textDirection,
  } = useLanguage();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View
        style={[
          styles.header,
          { flexDirection: rowDirection },
        ]}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t("back")}
          onPress={() => router.back()}
          style={({ pressed }) => [
            styles.backButton,
            pressed && styles.pressed,
          ]}
        >
          <Ionicons
            name={
              isRTL
                ? "chevron-forward"
                : "chevron-back"
            }
            size={22}
            color={KhedmatPalette.navy900}
          />
        </Pressable>

        <Text
          style={[
            styles.title,
            { writingDirection: textDirection },
          ]}
        >
          {t("termsPrivacyScreenTitle")}
        </Text>

        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Text
          style={[
            styles.lastUpdated,
            {
              textAlign: isRTL ? "right" : "left",
              writingDirection: textDirection,
            },
          ]}
        >
          {t("lastUpdatedAugust2026")}
        </Text>

        <View
          style={[
            styles.heroCard,
            { flexDirection: rowDirection },
          ]}
        >
          <View style={styles.heroIcon}>
            <Ionicons
              name="shield-checkmark-outline"
              size={27}
              color={KhedmatPalette.navy900}
            />
          </View>

          <View style={styles.heroCopy}>
            <Text
              style={[
                styles.heroTitle,
                {
                  textAlign: isRTL ? "right" : "left",
                  writingDirection: textDirection,
                },
              ]}
            >
              {t("privacyMattersTitle")}
            </Text>

            <Text
              style={[
                styles.heroSubtitle,
                {
                  textAlign: isRTL ? "right" : "left",
                  writingDirection: textDirection,
                },
              ]}
            >
              {t("privacyMattersSubtitle")}
            </Text>
          </View>
        </View>

        <View style={styles.sectionList}>
          <PolicySection
            number="01"
            icon="document-text-outline"
            title={t("termsOfUseSectionTitle")}
            body={t("termsOfUseSectionBody")}
            isRTL={isRTL}
            rowDirection={rowDirection}
            textDirection={textDirection}
          />

          <PolicySection
            number="02"
            icon="lock-closed-outline"
            title={t("privacyDataSectionTitle")}
            body={t("privacyDataSectionBody")}
            isRTL={isRTL}
            rowDirection={rowDirection}
            textDirection={textDirection}
          />

          <PolicySection
            number="03"
            icon="key-outline"
            title={t("accountSecuritySectionTitle")}
            body={t("accountSecuritySectionBody")}
            isRTL={isRTL}
            rowDirection={rowDirection}
            textDirection={textDirection}
          />

          <PolicySection
            number="04"
            icon="briefcase-outline"
            title={t("serviceInformationSectionTitle")}
            body={t("serviceInformationSectionBody")}
            isRTL={isRTL}
            rowDirection={rowDirection}
            textDirection={textDirection}
          />

          <PolicySection
            number="05"
            icon="headset-outline"
            title={t("contactSupportPolicySectionTitle")}
            body={t("contactSupportPolicySectionBody")}
            isRTL={isRTL}
            rowDirection={rowDirection}
            textDirection={textDirection}
          />
        </View>

        <View
          style={[
            styles.updateNote,
            { flexDirection: rowDirection },
          ]}
        >
          <Ionicons
            name="information-circle-outline"
            size={19}
            color={KhedmatPalette.blue500}
          />

          <Text
            style={[
              styles.updateNoteText,
              {
                textAlign: isRTL ? "right" : "left",
                writingDirection: textDirection,
              },
            ]}
          >
            {t("policyUpdateNotice")}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function PolicySection({
  number,
  icon,
  title,
  body,
  isRTL,
  rowDirection,
  textDirection,
}: PolicySectionProps) {
  return (
    <View
      style={[
        styles.policyCard,
        { flexDirection: rowDirection },
      ]}
    >
      <View style={styles.policyIcon}>
        <Ionicons
          name={icon}
          size={22}
          color={KhedmatPalette.blue500}
        />
      </View>

      <View style={styles.policyCopy}>
        <View
          style={[
            styles.policyHeadingRow,
            { flexDirection: rowDirection },
          ]}
        >
          <Text
            style={[
              styles.policyNumber,
              { writingDirection: textDirection },
            ]}
          >
            {number}
          </Text>

          <Text
            style={[
              styles.policyTitle,
              {
                textAlign: isRTL ? "right" : "left",
                writingDirection: textDirection,
              },
            ]}
          >
            {title}
          </Text>
        </View>

        <Text
          style={[
            styles.policyBody,
            {
              textAlign: isRTL ? "right" : "left",
              writingDirection: textDirection,
            },
          ]}
        >
          {body}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: KhedmatPalette.white,
  },

  header: {
    width: "100%",
    maxWidth: Layout.contentMaxWidth,
    alignSelf: "center",
    minHeight: 64,
    alignItems: "center",
    paddingHorizontal: Layout.screenPadding,
    paddingVertical: Spacing.sm,
  },

  backButton: {
    width: 42,
    height: 42,
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: Radius.pill,
    backgroundColor: KhedmatPalette.white,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: KhedmatPalette.blue200,
  },

  title: {
    ...Typography.screenTitle,
    flex: 1,
    color: KhedmatPalette.textPrimary,
    fontSize: 22,
    lineHeight: 28,
    textAlign: "center",
  },

  headerSpacer: {
    width: 42,
    height: 42,
  },

  scrollContent: {
    width: "100%",
    maxWidth: Layout.contentMaxWidth,
    alignSelf: "center",
    paddingHorizontal: Layout.screenPadding,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xxl,
  },

  lastUpdated: {
    ...Typography.captionStyle,
    color: KhedmatPalette.textMuted,
    lineHeight: 18,
    marginBottom: Spacing.md,
  },

  heroCard: {
    width: "100%",
    alignItems: "flex-start",
    gap: Spacing.md,
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: KhedmatPalette.blue200,
    backgroundColor: KhedmatPalette.blue050,
  },

  heroIcon: {
    width: 52,
    height: 52,
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: Radius.md,
    backgroundColor: KhedmatPalette.white,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: KhedmatPalette.blue200,
  },

  heroCopy: {
    flex: 1,
    minWidth: 0,
  },

  heroTitle: {
    ...Typography.sectionTitle,
    color: KhedmatPalette.textPrimary,
    fontSize: 18,
    lineHeight: 24,
  },

  heroSubtitle: {
    ...Typography.bodyStyle,
    marginTop: Spacing.xs,
    color: KhedmatPalette.textSecondary,
    lineHeight: 22,
  },

  sectionList: {
    width: "100%",
    marginTop: Spacing.lg,
    gap: Spacing.sm,
  },

  policyCard: {
    width: "100%",
    alignItems: "flex-start",
    gap: Spacing.md,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: KhedmatPalette.blue200,
    backgroundColor: KhedmatPalette.white,
    shadowColor: KhedmatPalette.navy900,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },

  policyIcon: {
    width: 42,
    height: 42,
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: Radius.md,
    backgroundColor: KhedmatPalette.blue050,
  },

  policyCopy: {
    flex: 1,
    minWidth: 0,
  },

  policyHeadingRow: {
    width: "100%",
    alignItems: "center",
    gap: Spacing.sm,
  },

  policyNumber: {
    ...Typography.captionStyle,
    flexShrink: 0,
    color: KhedmatPalette.blue500,
    fontSize: 11,
    lineHeight: 15,
  },

  policyTitle: {
    ...Typography.label,
    flex: 1,
    color: KhedmatPalette.textPrimary,
    fontSize: 15,
    lineHeight: 20,
  },

  policyBody: {
    ...Typography.bodyStyle,
    marginTop: Spacing.xs,
    color: KhedmatPalette.textSecondary,
    lineHeight: 22,
  },

  updateNote: {
    width: "100%",
    marginTop: Spacing.xl,
    alignItems: "flex-start",
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: KhedmatPalette.blue200,
    backgroundColor: KhedmatPalette.blue050,
  },

  updateNoteText: {
    ...Typography.captionStyle,
    flex: 1,
    color: KhedmatPalette.textSecondary,
    lineHeight: 19,
  },

  pressed: {
    opacity: 0.72,
  },
});
