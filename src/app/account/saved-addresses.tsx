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

export default function SavedAddressesScreen() {
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
        <Text style={styles.title}>Saved Addresses</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <View style={styles.iconContainer}>
            <Ionicons name="home" size={20} color={KhedmatPalette.blue500} />
          </View>
          <View style={styles.cardBody}>
            <Text style={styles.cardTitle}>Home</Text>
            <Text style={styles.cardSubtitle}>
              Street 15, Wazir Akbar Khan, Kabul
            </Text>
          </View>
          <Pressable style={styles.actionIcon}>
            <Ionicons
              name="create-outline"
              size={20}
              color={KhedmatPalette.textSecondary}
            />
          </Pressable>
        </View>

        <View style={styles.card}>
          <View style={styles.iconContainer}>
            <Ionicons
              name="briefcase"
              size={20}
              color={KhedmatPalette.blue500}
            />
          </View>
          <View style={styles.cardBody}>
            <Text style={styles.cardTitle}>Work</Text>
            <Text style={styles.cardSubtitle}>
              Shahr-e Naw, Commercial District, Kabul
            </Text>
          </View>
          <Pressable style={styles.actionIcon}>
            <Ionicons
              name="create-outline"
              size={20}
              color={KhedmatPalette.textSecondary}
            />
          </Pressable>
        </View>

        <Pressable style={styles.addButton}>
          <Ionicons name="add" size={20} color={KhedmatPalette.blue500} />
          <Text style={styles.addButtonText}>Add New Address</Text>
        </Pressable>
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
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: KhedmatPalette.surface,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: KhedmatPalette.border,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    backgroundColor: KhedmatPalette.surfaceSoft,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  cardBody: { flex: 1 },
  cardTitle: { ...Typography.label, color: KhedmatPalette.textPrimary },
  cardSubtitle: {
    ...Typography.captionStyle,
    color: KhedmatPalette.textSecondary,
    marginTop: 2,
  },
  actionIcon: { padding: Spacing.xs },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.md,
    marginTop: Spacing.sm,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: KhedmatPalette.blue500,
    borderRadius: Radius.lg,
    backgroundColor: KhedmatPalette.white,
  },
  addButtonText: {
    ...Typography.label,
    color: KhedmatPalette.blue500,
    marginLeft: Spacing.xs,
  },
});
