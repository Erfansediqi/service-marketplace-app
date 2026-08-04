import { Ionicons } from "@expo/vector-icons";
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

import {
    Fonts,
    KhedmatPalette,
    Layout,
    Radius,
    Shadows,
    Spacing,
    Typography,
} from "../../constants/theme";

type RenameProviderModalProps = {
  visible: boolean;
  isRtl: boolean;
  value: string;
  error: string | null;
  isSaving: boolean;

  title: string;
  subtitle: string;
  placeholder: string;
  cancelLabel: string;
  saveLabel: string;

  onChangeValue: (
    value: string,
  ) => void;

  onCancel: () => void;

  onSave: () => void;
};

export function RenameProviderModal({
  visible,
  isRtl,
  value,
  error,
  isSaving,
  title,
  subtitle,
  placeholder,
  cancelLabel,
  saveLabel,
  onChangeValue,
  onCancel,
  onSave,
}: RenameProviderModalProps) {
  return (
    <Modal
      animationType="fade"
      transparent
      visible={visible}
      onRequestClose={onCancel}
    >
      <KeyboardAvoidingView
        behavior={
          Platform.OS === "ios"
            ? "padding"
            : undefined
        }
        style={styles.backdrop}
      >
        <Pressable
          style={
            StyleSheet.absoluteFill
          }
          onPress={onCancel}
        />

        <View style={styles.dialog}>
          <View
            style={[
              styles.header,
              isRtl &&
                styles.rowReverse,
            ]}
          >
            <View
              style={styles.icon}
            >
              <Ionicons
                name="create-outline"
                size={22}
                color={
                  KhedmatPalette.blue500
                }
              />
            </View>

            <View
              style={
                styles.heading
              }
            >
              <Text
                style={[
                  styles.title,
                  directionStyle(
                    isRtl,
                  ),
                ]}
              >
                {title}
              </Text>

              <Text
                style={[
                  styles.subtitle,
                  directionStyle(
                    isRtl,
                  ),
                ]}
              >
                {subtitle}
              </Text>
            </View>
          </View>

          <TextInput
            autoCapitalize="words"
            autoCorrect={false}
            editable={!isSaving}
            maxLength={80}
            onChangeText={
              onChangeValue
            }
            onSubmitEditing={
              onSave
            }
            placeholder={
              placeholder
            }
            placeholderTextColor={
              KhedmatPalette.textMuted
            }
            returnKeyType="done"
            selectTextOnFocus
            style={[
              styles.input,
              directionStyle(
                isRtl,
              ),
              error &&
                styles.inputError,
            ]}
            value={value}
          />

          {error ? (
            <Text
              style={[
                styles.error,
                directionStyle(
                  isRtl,
                ),
              ]}
            >
              {error}
            </Text>
          ) : null}

          <View
            style={[
              styles.actions,
              isRtl &&
                styles.rowReverse,
            ]}
          >
            <Pressable
              accessibilityRole="button"
              disabled={isSaving}
              onPress={onCancel}
              style={({ pressed }) => [
                styles.cancelButton,
                pressed &&
                  styles.pressed,
                isSaving &&
                  styles.disabled,
              ]}
            >
              <Text
                style={
                  styles.cancelText
                }
              >
                {cancelLabel}
              </Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              disabled={
                isSaving ||
                value.trim()
                  .length === 0
              }
              onPress={onSave}
              style={({ pressed }) => [
                styles.saveButton,
                pressed &&
                  styles.pressed,
                (isSaving ||
                  value.trim()
                    .length === 0) &&
                  styles.disabled,
              ]}
            >
              {isSaving ? (
                <ActivityIndicator
                  size="small"
                  color={
                    KhedmatPalette.white
                  }
                />
              ) : (
                <Text
                  style={
                    styles.saveText
                  }
                >
                  {saveLabel}
                </Text>
              )}
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function directionStyle(
  isRtl: boolean,
) {
  return {
    textAlign: isRtl
      ? ("right" as const)
      : ("left" as const),

    writingDirection: isRtl
      ? ("rtl" as const)
      : ("ltr" as const),
  };
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal:
      Layout.screenPadding,
    backgroundColor:
      "rgba(0, 27, 72, 0.45)",
  },

  dialog: {
    width: "100%",
    maxWidth: 440,
    padding: Spacing.xl,
    borderRadius: Radius.xl,
    backgroundColor:
      KhedmatPalette.surface,
    ...Shadows.medium,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },

  rowReverse: {
    flexDirection: "row-reverse",
  },

  icon: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: Radius.pill,
    backgroundColor:
      KhedmatPalette.surfaceSoft,
  },

  heading: {
    flex: 1,
  },

  title: {
    ...Typography.sectionTitle,
    width: "100%",
    color:
      KhedmatPalette.textPrimary,
  },

  subtitle: {
    ...Typography.captionStyle,
    width: "100%",
    marginTop: Spacing.xs,
    color:
      KhedmatPalette.textMuted,
  },

  input: {
    minHeight: 52,
    marginTop: Spacing.xl,
    paddingHorizontal: Spacing.lg,
    borderWidth: 1,
    borderColor:
      KhedmatPalette.border,
    borderRadius: Radius.lg,
    backgroundColor:
      KhedmatPalette.surface,
    color:
      KhedmatPalette.textPrimary,
    fontFamily: Fonts.medium,
    fontSize: 16,
  },

  inputError: {
    borderColor:
      KhedmatPalette.error,
  },

  error: {
    ...Typography.captionStyle,
    width: "100%",
    marginTop: Spacing.sm,
    color:
      KhedmatPalette.error,
  },

  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: Spacing.md,
    marginTop: Spacing.xl,
  },

  cancelButton: {
    minHeight:
      Layout.minimumTouchTarget,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.lg,
    borderWidth: 1,
    borderColor:
      KhedmatPalette.border,
    borderRadius: Radius.lg,
    backgroundColor:
      KhedmatPalette.surface,
  },

  cancelText: {
    ...Typography.buttonLabel,
    color:
      KhedmatPalette.textSecondary,
  },

  saveButton: {
    minWidth: 104,
    minHeight:
      Layout.minimumTouchTarget,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.lg,
    backgroundColor:
      KhedmatPalette.navy900,
  },

  saveText: {
    ...Typography.buttonLabel,
    color:
      KhedmatPalette.white,
  },

  pressed: {
    opacity: 0.72,
  },

  disabled: {
    opacity: 0.55,
  },
});