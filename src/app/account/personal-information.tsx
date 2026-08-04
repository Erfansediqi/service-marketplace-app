import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import {
    Fonts,
    KhedmatPalette,
    Radius,
    Spacing,
    Typography,
} from "../../constants/theme";

// We define a unique key to save and retrieve the data
const PROFILE_STORAGE_KEY = "@user_profile_data";

export default function PersonalInformationScreen() {
  const router = useRouter();

  // Set default values, but these will be overwritten if saved data exists
  const [firstName, setFirstName] = useState("Ahmad");
  const [lastName, setLastName] = useState("Zahir");
  const [email, setEmail] = useState("ahmad.zahir@example.com");
  const [imageUri, setImageUri] = useState<string | null>(null);

  // Load saved data when the screen mounts
  useEffect(() => {
    const loadData = async () => {
      try {
        const jsonValue = await AsyncStorage.getItem(PROFILE_STORAGE_KEY);
        if (jsonValue !== null) {
          const savedData = JSON.parse(jsonValue);
          setFirstName(savedData.firstName);
          setLastName(savedData.lastName);
          setEmail(savedData.email);
          setImageUri(savedData.imageUri);
        }
      } catch (error) {
        console.error("Failed to load profile data:", error);
      }
    };

    loadData();
  }, []);

  // Function to open the image gallery
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  // Function to save data locally and navigate back
  const saveProfile = async () => {
    try {
      const profileData = {
        firstName,
        lastName,
        email,
        imageUri,
      };

      await AsyncStorage.setItem(
        PROFILE_STORAGE_KEY,
        JSON.stringify(profileData),
      );

      // Optional: Show a quick success alert before navigating away
      Alert.alert("Success", "Your profile information has been saved.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error) {
      console.error("Failed to save profile data:", error);
      Alert.alert("Error", "Could not save your changes. Please try again.");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons
              name="arrow-back"
              size={24}
              color={KhedmatPalette.textPrimary}
            />
          </Pressable>
          <Text style={styles.title}>Personal Information</Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              {imageUri ? (
                <Image source={{ uri: imageUri }} style={styles.avatarImage} />
              ) : (
                <Text style={styles.avatarText}>{firstName.charAt(0)}</Text>
              )}
            </View>
            <Pressable onPress={pickImage}>
              <Text style={styles.changePhotoText}>Change Photo</Text>
            </Pressable>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>First Name</Text>
            <TextInput
              style={styles.input}
              value={firstName}
              onChangeText={setFirstName}
              placeholder="Enter first name"
              placeholderTextColor={KhedmatPalette.textMuted}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Last Name</Text>
            <TextInput
              style={styles.input}
              value={lastName}
              onChangeText={setLastName}
              placeholder="Enter last name"
              placeholderTextColor={KhedmatPalette.textMuted}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder="Enter email address"
              placeholderTextColor={KhedmatPalette.textMuted}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              style={[styles.input, styles.disabledInput]}
              value="+93 70 123 4567"
              editable={false}
            />
            <Text style={styles.helperText}>
              Phone number cannot be changed.
            </Text>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Pressable style={styles.saveButton} onPress={saveProfile}>
            <Text style={styles.saveButtonText}>Save Changes</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: KhedmatPalette.blue050 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  backButton: { marginRight: Spacing.md, padding: Spacing.xs },
  title: {
    ...Typography.screenTitle,
    color: KhedmatPalette.textPrimary,
    fontSize: 22,
  },
  scrollContent: { padding: Spacing.lg, paddingBottom: Spacing.xxl },
  avatarContainer: { alignItems: "center", marginBottom: Spacing.xl },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: Radius.pill,
    backgroundColor: KhedmatPalette.navy900,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.sm,
    overflow: "hidden",
  },
  avatarImage: { width: "100%", height: "100%" },
  avatarText: {
    color: KhedmatPalette.white,
    fontSize: 32,
    fontFamily: Fonts.bold,
  },
  changePhotoText: {
    color: KhedmatPalette.blue500,
    ...Typography.label,
    padding: Spacing.xs,
  },
  formGroup: { marginBottom: Spacing.lg },
  label: {
    ...Typography.label,
    color: KhedmatPalette.textPrimary,
    marginBottom: Spacing.xs,
  },
  input: {
    backgroundColor: KhedmatPalette.surface,
    borderWidth: 1,
    borderColor: KhedmatPalette.border,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    height: 52,
    ...Typography.bodyStyle,
    color: KhedmatPalette.textPrimary,
  },
  disabledInput: {
    backgroundColor: KhedmatPalette.surfaceSoft,
    color: KhedmatPalette.textSecondary,
  },
  helperText: {
    ...Typography.captionStyle,
    color: KhedmatPalette.textMuted,
    marginTop: 4,
  },
  footer: {
    padding: Spacing.lg,
    backgroundColor: KhedmatPalette.surface,
    borderTopWidth: 1,
    borderColor: KhedmatPalette.border,
  },
  saveButton: {
    backgroundColor: KhedmatPalette.blue500,
    height: 52,
    borderRadius: Radius.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  saveButtonText: { ...Typography.label, color: KhedmatPalette.white },
});
