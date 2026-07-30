import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function SplashScreen() {
  const router = useRouter();

  const handleNextPress = () => {
    router.push("/language");
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Center Brand Identity */}
      <View style={styles.centerContent}>
        <View style={styles.iconContainer}>
          <Ionicons name="compass-outline" size={36} color="#FFFFFF" />
        </View>
        <Text style={styles.brandTitle}>Khedmat</Text>
        <Text style={styles.brandSubtitle}>Find trusted help, near you</Text>
      </View>

      {/* Bottom Navigation Arrow Key */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={styles.arrowButton}
          onPress={handleNextPress}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-forward" size={24} color="#0066FF" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#6C5CE7",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 40,
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  iconContainer: {
    width: 72,
    height: 72,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  brandTitle: {
    fontSize: 32,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  brandSubtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    fontWeight: "500",
  },
  bottomContainer: {
    width: "100%",
    alignItems: "center",
    paddingBottom: 20,
  },
  arrowButton: {
    width: 56,
    height: 56,
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
});
