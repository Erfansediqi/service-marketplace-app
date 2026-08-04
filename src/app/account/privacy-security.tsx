import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    View,
} from "react-native";
import {
    KhedmatPalette,
    Radius,
    Spacing,
    Typography,
} from "../../constants/theme";

export default function PrivacySecurityScreen() {
  const router = useRouter();
  const [biometrics, setBiometrics] = useState(false);
  const [location, setLocation] = useState(true);

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
        <Text style={styles.title}>Privacy & Security</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionTitle}>Security</Text>
        <View style={styles.cardGroup}>
          <Pressable style={styles.row}>
            <Text style={styles.rowTitle}>Change Password</Text>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={KhedmatPalette.textMuted}
            />
          </Pressable>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={styles.rowTitle}>Biometric Login</Text>
            <Switch
              value={biometrics}
              onValueChange={setBiometrics}
              trackColor={{
                false: KhedmatPalette.border,
                true: KhedmatPalette.blue500,
              }}
            />
          </View>
        </View>

        <Text style={styles.sectionTitle}>Data & Privacy</Text>
        <View style={styles.cardGroup}>
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowTitle}>Location Services</Text>
              <Text style={styles.rowSubtitle}>
                Allow app to use your location for better service
              </Text>
            </View>
            <Switch
              value={location}
              onValueChange={setLocation}
              trackColor={{
                false: KhedmatPalette.border,
                true: KhedmatPalette.blue500,
              }}
            />
          </View>
          <View style={styles.divider} />
          <Pressable style={styles.row}>
            <Text style={[styles.rowTitle, { color: KhedmatPalette.error }]}>
              Delete Account
            </Text>
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
  sectionTitle: {
    ...Typography.sectionTitle,
    color: KhedmatPalette.textSecondary,
    marginBottom: Spacing.sm,
    marginTop: Spacing.md,
  },
  cardGroup: {
    backgroundColor: KhedmatPalette.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: KhedmatPalette.border,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.md,
  },
  divider: {
    height: 1,
    backgroundColor: KhedmatPalette.border,
    marginLeft: Spacing.md,
  },
  rowTitle: { ...Typography.label, color: KhedmatPalette.textPrimary },
  rowSubtitle: {
    ...Typography.captionStyle,
    color: KhedmatPalette.textSecondary,
    marginTop: 2,
    marginRight: Spacing.md,
  },
});
