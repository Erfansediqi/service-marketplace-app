import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
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
import { useCustomerProfile } from "../../context/customer-profile-context";

export default function PersonalInformationScreen() {
  const router = useRouter();
  const { profile, updateProfile, uploadAvatar } = useCustomerProfile();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [pendingAvatarBase64, setPendingAvatarBase64] = useState<string | null>(
    null,
  );
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const name = splitFullName(profile?.fullName ?? "");

    setFirstName(name.firstName);
    setLastName(name.lastName);
    setEmail(profile?.email ?? "");
    setImageUri(profile?.avatarUri ?? null);
  }, [profile]);

  const fullName = useMemo(
    () => [firstName.trim(), lastName.trim()].filter(Boolean).join(" "),
    [firstName, lastName],
  );

  const initials = useMemo(() => getInitials(fullName), [fullName]);

  const pickImage = async (): Promise<void> => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
        base64: true,
      });

      if (result.canceled) {
        return;
      }

      const asset = result.assets[0];

      if (!asset) {
        return;
      }

      if (!asset.base64) {
        throw new Error("The selected photo could not be prepared for upload.");
      }

      setPendingAvatarBase64(asset.base64);
      setImageUri(`data:image/jpeg;base64,${asset.base64}`);
    } catch (error) {
      console.error("Failed to select a profile photo:", error);

      Alert.alert(
        "Photo unavailable",
        "The selected photo could not be loaded. Please try another image.",
      );
    }
  };

  const saveProfile = async (): Promise<void> => {
    if (fullName.length < 2) {
      Alert.alert("Name required", "Please enter your full name.");
      return;
    }

    const normalizedEmail = email.trim();

    if (normalizedEmail && !isValidEmail(normalizedEmail)) {
      Alert.alert("Invalid email", "Please enter a valid email address.");
      return;
    }

    setIsSaving(true);

    try {
      await updateProfile({
        fullName,
        email: normalizedEmail,
      });

      if (pendingAvatarBase64) {
        await uploadAvatar(pendingAvatarBase64);
        setPendingAvatarBase64(null);
      }

      Alert.alert("Saved", "Your profile information has been updated.", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      console.error("Failed to save profile data:", error);

      Alert.alert(
        "Unable to save",
        "Your changes or profile photo could not be saved. Please check your connection and try again.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Back"
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons
              name="arrow-back"
              size={24}
              color={KhedmatPalette.textPrimary}
            />
          </Pressable>

          <Text style={styles.title}>Personal Information</Text>
        </View>

        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              {imageUri ? (
                <Image source={{ uri: imageUri }} style={styles.avatarImage} />
              ) : (
                <Text style={styles.avatarText}>{initials}</Text>
              )}
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Change profile photo"
              onPress={pickImage}
            >
              <Text style={styles.changePhotoText}>Change Photo</Text>
            </Pressable>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>First Name</Text>
            <TextInput
              style={styles.input}
              value={firstName}
              onChangeText={setFirstName}
              autoCapitalize="words"
              autoComplete="given-name"
              textContentType="givenName"
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
              autoCapitalize="words"
              autoComplete="family-name"
              textContentType="familyName"
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
              autoComplete="email"
              textContentType="emailAddress"
              placeholder="Enter email address"
              placeholderTextColor={KhedmatPalette.textMuted}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              style={[styles.input, styles.disabledInput]}
              value={profile?.phoneNumber || "—"}
              editable={false}
            />
            <Text style={styles.helperText}>
              Phone number is linked to the verified account and cannot be
              changed here.
            </Text>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Pressable
            accessibilityRole="button"
            disabled={isSaving}
            style={({ pressed }) => [
              styles.saveButton,
              (pressed || isSaving) && styles.saveButtonPressed,
            ]}
            onPress={saveProfile}
          >
            <Text style={styles.saveButtonText}>
              {isSaving ? "Saving..." : "Save Changes"}
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function splitFullName(fullName: string): {
  firstName: string;
  lastName: string;
} {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  const [firstName = "", ...lastNameParts] = parts;

  return {
    firstName,
    lastName: lastNameParts.join(" "),
  };
}

function getInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return "K";
  }

  return parts
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    backgroundColor: KhedmatPalette.blue050,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  backButton: {
    marginRight: Spacing.md,
    padding: Spacing.xs,
  },
  title: {
    ...Typography.screenTitle,
    color: KhedmatPalette.textPrimary,
    fontSize: 22,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  avatarContainer: {
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
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
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  avatarText: {
    color: KhedmatPalette.white,
    fontSize: 30,
    fontFamily: Fonts.bold,
  },
  changePhotoText: {
    color: KhedmatPalette.blue500,
    ...Typography.label,
    padding: Spacing.xs,
  },
  formGroup: {
    marginBottom: Spacing.lg,
  },
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
  saveButtonPressed: {
    opacity: 0.7,
  },
  saveButtonText: {
    ...Typography.label,
    color: KhedmatPalette.white,
  },
});
