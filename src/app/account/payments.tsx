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
    Radius,
    Spacing,
    Typography,
} from "../../constants/theme";

export default function PaymentsScreen() {
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
        <Text style={styles.title}>Payments</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionTitle}>Payment Methods</Text>

        <View style={styles.card}>
          <View style={styles.iconContainer}>
            <Ionicons
              name="cash-outline"
              size={24}
              color={KhedmatPalette.success}
            />
          </View>
          <View style={styles.cardBody}>
            <Text style={styles.cardTitle}>Cash</Text>
            <Text style={styles.cardSubtitle}>Default Method</Text>
          </View>
          <Ionicons
            name="checkmark-circle"
            size={24}
            color={KhedmatPalette.blue500}
          />
        </View>

        <Pressable style={styles.addButton}>
          <Ionicons name="add" size={20} color={KhedmatPalette.blue500} />
          <Text style={styles.addButtonText}>Add Credit or Debit Card</Text>
        </Pressable>

        <Text style={styles.sectionTitle}>Payment History</Text>
        <View style={styles.historyCard}>
          <View style={styles.historyRow}>
            <View>
              <Text style={styles.historyTitle}>Plumbing Repair</Text>
              <Text style={styles.historyDate}>Aug 2, 2026</Text>
            </View>
            <Text style={styles.historyAmount}>$45.00</Text>
          </View>
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
  sectionTitle: {
    ...Typography.sectionTitle,
    color: KhedmatPalette.textSecondary,
    marginBottom: Spacing.sm,
    marginTop: Spacing.md,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: KhedmatPalette.surface,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: KhedmatPalette.blue500, // Highlighted for default
  },
  iconContainer: { marginRight: Spacing.md },
  cardBody: { flex: 1 },
  cardTitle: { ...Typography.label, color: KhedmatPalette.textPrimary },
  cardSubtitle: {
    ...Typography.captionStyle,
    color: KhedmatPalette.textSecondary,
    marginTop: 2,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.md,
    marginTop: Spacing.sm,
    borderRadius: Radius.lg,
    backgroundColor: KhedmatPalette.white,
    borderWidth: 1,
    borderColor: KhedmatPalette.border,
  },
  addButtonText: {
    ...Typography.label,
    color: KhedmatPalette.blue500,
    marginLeft: Spacing.xs,
  },
  historyCard: {
    backgroundColor: KhedmatPalette.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: KhedmatPalette.border,
    padding: Spacing.md,
  },
  historyRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  historyTitle: { ...Typography.label, color: KhedmatPalette.textPrimary },
  historyDate: {
    ...Typography.captionStyle,
    color: KhedmatPalette.textSecondary,
    marginTop: 2,
  },
  historyAmount: { ...Typography.label, color: KhedmatPalette.textPrimary },
});
