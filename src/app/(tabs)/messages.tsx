import { Ionicons } from "@expo/vector-icons";
import {
    SafeAreaView,
    StyleSheet,
    Text,
    View,
} from "react-native";

import {
    Colors,
    Spacing,
    Typography,
} from "../../constants/theme";

export default function MessagesScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Ionicons
          name="chatbubble-outline"
          size={38}
          color={Colors.primary}
        />

        <Text style={styles.title}>پیام‌ها</Text>

        <Text style={styles.subtitle}>
          گفتگوهای شما با مشتریان و ارائه‌دهندگان در اینجا نمایش داده می‌شوند.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.md,
    paddingHorizontal: Spacing.xl,
    paddingBottom: 100,
  },
  title: {
    ...Typography.screenTitle,
    color: Colors.textPrimary,
    textAlign: "center",
    writingDirection: "rtl",
  },
  subtitle: {
    ...Typography.bodyStyle,
    color: Colors.textSecondary,
    textAlign: "center",
    writingDirection: "rtl",
  },
});