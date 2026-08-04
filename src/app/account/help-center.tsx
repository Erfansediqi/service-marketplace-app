import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  KhedmatPalette,
  Radius,
  Spacing,
  Typography,
} from "../../constants/theme";

export default function HelpCenterScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons
            name="arrow-back"
            size={24}
            color={KhedmatPalette.textPrimary}
          />
        </Pressable>
        <Text style={styles.title}>Help Center</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={KhedmatPalette.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="How can we help you?"
            placeholderTextColor={KhedmatPalette.textMuted}
          />
        </View>

        <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>

        <View style={styles.faqCard}>
          <Pressable style={styles.faqRow}>
            <Text style={styles.faqTitle}>How do I book a service?</Text>
            <Ionicons
              name="chevron-down"
              size={20}
              color={KhedmatPalette.textMuted}
            />
          </Pressable>
          <View style={styles.divider} />
          <Pressable style={styles.faqRow}>
            <Text style={styles.faqTitle}>How do I cancel my booking?</Text>
            <Ionicons
              name="chevron-down"
              size={20}
              color={KhedmatPalette.textMuted}
            />
          </Pressable>
          <View style={styles.divider} />
          <Pressable style={styles.faqRow}>
            <Text style={styles.faqTitle}>Is there a cancellation fee?</Text>
            <Ionicons
              name="chevron-down"
              size={20}
              color={KhedmatPalette.textMuted}
            />
          </Pressable>
        </View>

        <View style={styles.contactCard}>
          <Text style={styles.contactTitle}>Still need help?</Text>
          <Text style={styles.contactSubtitle}>
            Our support team is available 24/7
          </Text>
          <Pressable
            style={styles.contactButton}
            onPress={() => router.push("/contact-support" as any)}
          >
            <Text style={styles.contactButtonText}>Contact Support</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: KhedmatPalette.blue050 },
  header: { flexDirection: "row", alignItems: "center", padding: Spacing.lg },
  backButton: { marginRight: Spacing.md },
  title: {
    ...Typography.screenTitle,
    color: KhedmatPalette.textPrimary,
    fontSize: 22,
  },
  scrollContent: { padding: Spacing.lg },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: KhedmatPalette.surface,
    borderWidth: 1,
    borderColor: KhedmatPalette.border,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    height: 52,
    marginBottom: Spacing.xl,
  },
  searchInput: {
    flex: 1,
    marginLeft: Spacing.sm,
    ...Typography.bodyStyle,
    color: KhedmatPalette.textPrimary,
  },
  sectionTitle: {
    ...Typography.sectionTitle,
    color: KhedmatPalette.textSecondary,
    marginBottom: Spacing.sm,
  },
  faqCard: {
    backgroundColor: KhedmatPalette.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: KhedmatPalette.border,
    overflow: "hidden",
    marginBottom: Spacing.xl,
  },
  faqRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: Spacing.md,
  },
  faqTitle: { ...Typography.label, color: KhedmatPalette.textPrimary },
  divider: {
    height: 1,
    backgroundColor: KhedmatPalette.border,
    marginLeft: Spacing.md,
  },
  contactCard: {
    backgroundColor: KhedmatPalette.blue500,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    alignItems: "center",
  },
  contactTitle: {
    ...Typography.sectionTitle,
    color: KhedmatPalette.white,
    marginBottom: 4,
  },
  contactSubtitle: {
    ...Typography.bodyStyle,
    color: KhedmatPalette.blue200,
    marginBottom: Spacing.lg,
  },
  contactButton: {
    backgroundColor: KhedmatPalette.white,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: Radius.md,
  },
  contactButtonText: { ...Typography.label, color: KhedmatPalette.blue500 },
});
