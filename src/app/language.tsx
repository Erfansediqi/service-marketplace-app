import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function LanguageScreen() {
  const router = useRouter();
  const [selectedLanguage, setSelectedLanguage] = useState("English");

  const languages = [
    { id: "English", label: "English" },
    { id: "Dari", label: "دری" },
    { id: "Pashto", label: "پښتو" },
  ];

  const handleContinue = () => {
    router.push("/onboarding-1");
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header Icon & Title */}
        <View style={styles.headerContainer}>
          <Ionicons
            name="globe-outline"
            size={40}
            color="#6C5CE7"
            style={styles.globeIcon}
          />
          <Text style={styles.title}>Choose your language</Text>
          <Text style={styles.subtitle}>
            You can change this later in settings
          </Text>
        </View>

        {/* Language Options Cards */}
        <View style={styles.optionsContainer}>
          {languages.map((lang) => {
            const isSelected = selectedLanguage === lang.id;
            return (
              <TouchableOpacity
                key={lang.id}
                style={[styles.card, isSelected && styles.selectedCard]}
                onPress={() => setSelectedLanguage(lang.id)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.cardText,
                    isSelected && styles.selectedCardText,
                  ]}
                >
                  {lang.label}
                </Text>
                <Ionicons
                  name={
                    isSelected ? "checkmark-circle-outline" : "ellipse-outline"
                  }
                  size={20}
                  color={isSelected ? "#6C5CE7" : "#CBD5E1"}
                />
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Continue Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleContinue}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  content: {
    flex: 1,
    paddingTop: 40,
    alignItems: "center",
  },
  globeIcon: {
    marginBottom: 16,
  },
  headerContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    color: "#64748B",
  },
  optionsContainer: {
    width: "100%",
    gap: 12,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 20,
  },
  selectedCard: {
    borderColor: "#6C5CE7",
    backgroundColor: "#F3F4F6",
  },
  cardText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1E293B",
  },
  selectedCardText: {
    color: "#6C5CE7",
  },
  footer: {
    width: "100%",
    paddingBottom: 10,
  },
  continueButton: {
    backgroundColor: "#6C5CE7",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    shadowColor: "#6C5CE7",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  continueButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});
