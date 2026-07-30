import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

export default function VerifyCodeScreen() {
  const router = useRouter();
  const [code, setCode] = useState("");

  const handleVerify = () => {
    router.push("/explore" as any);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.illustrationCircle}>
          <Ionicons name="shield-checkmark-outline" size={40} color="#6C5CE7" />
        </View>

        <Text style={styles.title}>Enter verification code</Text>
        <Text style={styles.subtitle}>
          We've sent a 4-digit code to your phone number.
        </Text>

        <TextInput
          style={styles.input}
          placeholder="1234"
          placeholderTextColor="#CBD5E1"
          keyboardType="number-pad"
          maxLength={4}
          value={code}
          onChangeText={setCode}
        />

        <TouchableOpacity style={styles.button} onPress={handleVerify}>
          <Text style={styles.buttonText}>Verify & Continue</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 24,
    justifyContent: "center",
  },
  content: {
    alignItems: "center",
    width: "100%",
  },
  illustrationCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#EDE9FE",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    marginBottom: 32,
  },
  input: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    borderRadius: 16,
    height: 56,
    fontSize: 24,
    textAlign: "center",
    letterSpacing: 8,
    color: "#0F172A",
    marginBottom: 24,
  },
  button: {
    width: "100%",
    backgroundColor: "#6C5CE7",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});
