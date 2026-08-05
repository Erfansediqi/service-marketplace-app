import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
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
  KhedmatPalette,
  Radius,
  Spacing,
  Typography,
} from "../../constants/theme";
import { StorageService } from "../../services/storage";

type SupportDraft = {
  subject: string;
  message: string;
};

type LocalSupportRequest = SupportDraft & {
  id: string;
  createdAt: string;
  status: "submitted";
};

const SUPPORT_DRAFT_STORAGE_KEY = "@khedmat_support_draft";
const SUPPORT_REQUESTS_STORAGE_KEY = "@khedmat_support_requests";

export default function ContactSupportScreen() {
  const router = useRouter();
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isDraftHydrated, setIsDraftHydrated] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const hydrateDraft = async (): Promise<void> => {
      try {
        const storedDraft = await StorageService.get<unknown>(
          SUPPORT_DRAFT_STORAGE_KEY,
        );

        if (!isMounted) {
          return;
        }

        const draft = normalizeSupportDraft(storedDraft);

        setSubject(draft.subject);
        setMessage(draft.message);
      } finally {
        if (isMounted) {
          setIsDraftHydrated(true);
        }
      }
    };

    void hydrateDraft();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isDraftHydrated) {
      return;
    }

    const saveTimer = setTimeout(() => {
      const draft: SupportDraft = {
        subject,
        message,
      };

      if (!subject.trim() && !message.trim()) {
        void StorageService.remove(SUPPORT_DRAFT_STORAGE_KEY);
        return;
      }

      void StorageService.save(SUPPORT_DRAFT_STORAGE_KEY, draft);
    }, 250);

    return () => clearTimeout(saveTimer);
  }, [isDraftHydrated, message, subject]);

  const handleSubmit = async (): Promise<void> => {
    const normalizedSubject = subject.trim();
    const normalizedMessage = message.trim();

    if (!normalizedSubject || !normalizedMessage) {
      Alert.alert(
        "Missing Information",
        "Please enter both a subject and a message.",
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const storedRequests = await StorageService.get<unknown>(
        SUPPORT_REQUESTS_STORAGE_KEY,
      );

      const request: LocalSupportRequest = {
        id: createSupportRequestId(),
        subject: normalizedSubject,
        message: normalizedMessage,
        createdAt: new Date().toISOString(),
        status: "submitted",
      };

      await StorageService.save(SUPPORT_REQUESTS_STORAGE_KEY, [
        request,
        ...normalizeSupportRequests(storedRequests),
      ]);

      await StorageService.remove(SUPPORT_DRAFT_STORAGE_KEY);
      setSubject("");
      setMessage("");

      Alert.alert(
        "Request Saved",
        "Your support request has been saved locally. It can be sent to the support backend when that service is connected.",
        [{ text: "OK", onPress: () => router.back() }],
      );
    } catch (error) {
      console.error("Failed to save the support request:", error);

      Alert.alert(
        "Unable to save",
        "Your support request could not be stored on this device. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
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

          <Text style={styles.title}>Contact Support</Text>
        </View>

        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}
        >
          <Text style={styles.description}>
            Describe your issue below. Your draft and submitted request are
            stored on this device until a support backend is connected.
          </Text>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Subject</Text>
            <TextInput
              style={styles.input}
              value={subject}
              onChangeText={setSubject}
              placeholder="e.g., Issue with my recent booking"
              placeholderTextColor={KhedmatPalette.textMuted}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Message</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={message}
              onChangeText={setMessage}
              placeholder="Please provide as much detail as possible..."
              placeholderTextColor={KhedmatPalette.textMuted}
              multiline
              textAlignVertical="top"
            />
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Pressable
            accessibilityRole="button"
            disabled={isSubmitting}
            style={({ pressed }) => [
              styles.submitButton,
              (pressed || isSubmitting) && styles.submitButtonPressed,
            ]}
            onPress={handleSubmit}
          >
            <Text style={styles.submitButtonText}>
              {isSubmitting ? "Saving..." : "Submit Request"}
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function normalizeSupportDraft(value: unknown): SupportDraft {
  if (typeof value !== "object" || value === null) {
    return { subject: "", message: "" };
  }

  const draft = value as Record<string, unknown>;

  return {
    subject: typeof draft.subject === "string" ? draft.subject : "",
    message: typeof draft.message === "string" ? draft.message : "",
  };
}

function normalizeSupportRequests(value: unknown): LocalSupportRequest[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(isLocalSupportRequest);
}

function isLocalSupportRequest(value: unknown): value is LocalSupportRequest {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const request = value as Record<string, unknown>;

  return (
    typeof request.id === "string" &&
    typeof request.subject === "string" &&
    typeof request.message === "string" &&
    typeof request.createdAt === "string" &&
    request.status === "submitted"
  );
}

function createSupportRequestId(): string {
  return `support-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
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
  },
  description: {
    ...Typography.bodyStyle,
    color: KhedmatPalette.textSecondary,
    marginBottom: Spacing.xl,
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
  textArea: {
    height: 150,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
  },
  footer: {
    padding: Spacing.lg,
    backgroundColor: KhedmatPalette.surface,
    borderTopWidth: 1,
    borderColor: KhedmatPalette.border,
  },
  submitButton: {
    backgroundColor: KhedmatPalette.blue500,
    height: 52,
    borderRadius: Radius.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  submitButtonPressed: {
    opacity: 0.7,
  },
  submitButtonText: {
    ...Typography.label,
    color: KhedmatPalette.white,
  },
});
