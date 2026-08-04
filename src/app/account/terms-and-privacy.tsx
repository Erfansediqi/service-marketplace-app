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
import { KhedmatPalette, Spacing, Typography } from "../../constants/theme";

export default function TermsPrivacyScreen() {
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
        <Text style={styles.title}>Terms & Privacy</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.lastUpdated}>Last Updated: August 2026</Text>

        <Text style={styles.heading}>1. Terms of Service</Text>
        <Text style={styles.paragraph}>
          By accessing and using the Khedmat application, you agree to comply
          with and be bound by these Terms of Service. If you do not agree with
          any part of these terms, you must not use the application.
        </Text>

        <Text style={styles.heading}>2. Privacy Policy</Text>
        <Text style={styles.paragraph}>
          We value your privacy. The information we collect is used strictly to
          provide you with a better service experience. We do not sell your
          personal data to third parties. For a complete understanding of our
          data practices, please review our full Privacy Policy on our website.
        </Text>

        <Text style={styles.heading}>3. User Responsibilities</Text>
        <Text style={styles.paragraph}>
          Users are responsible for maintaining the confidentiality of their
          account information and for all activities that occur under their
          account. Please report any unauthorized use of your account
          immediately.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: KhedmatPalette.surface },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderColor: KhedmatPalette.border,
  },
  backButton: { marginRight: Spacing.md },
  title: {
    ...Typography.screenTitle,
    color: KhedmatPalette.textPrimary,
    fontSize: 22,
  },
  scrollContent: { padding: Spacing.lg, paddingBottom: Spacing.xxl },
  lastUpdated: {
    ...Typography.captionStyle,
    color: KhedmatPalette.textMuted,
    marginBottom: Spacing.lg,
  },
  heading: {
    ...Typography.label,
    color: KhedmatPalette.textPrimary,
    marginBottom: Spacing.xs,
    marginTop: Spacing.md,
  },
  paragraph: {
    ...Typography.bodyStyle,
    color: KhedmatPalette.textSecondary,
    lineHeight: 24,
    marginBottom: Spacing.md,
  },
});
