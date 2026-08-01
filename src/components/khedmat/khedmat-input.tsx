import { Ionicons } from "@expo/vector-icons";
import {
    ComponentProps,
    ReactNode,
    useState,
} from "react";
import {
    Pressable,
    StyleProp,
    StyleSheet,
    Text,
    TextInput,
    TextInputProps,
    View,
    ViewStyle,
} from "react-native";

import {
    Fonts,
    KhedmatPalette,
    Layout,
    Radius,
    Spacing,
    Typography,
} from "../../constants/theme";

type IconName =
  ComponentProps<typeof Ionicons>["name"];

type KhedmatInputProps =
  TextInputProps & {
    label: string;
    error?: string;
    helperText?: string;

    icon?: IconName;
    leadingContent?: ReactNode;
    trailingContent?: ReactNode;

    isRtl?: boolean;
    containerStyle?: StyleProp<ViewStyle>;
  };

export function KhedmatInput({
  label,
  error,
  helperText,
  icon,
  leadingContent,
  trailingContent,
  isRtl = false,
  containerStyle,
  secureTextEntry,
  ...inputProps
}: KhedmatInputProps) {
  const [focused, setFocused] =
    useState(false);

  const [
    passwordVisible,
    setPasswordVisible,
  ] = useState(false);

  const isPassword =
    Boolean(secureTextEntry);

  return (
    <View
      style={[
        styles.container,
        containerStyle,
      ]}
    >
      <Text
        style={[
          styles.label,
          {
            textAlign: isRtl
              ? "right"
              : "left",
            writingDirection: isRtl
              ? "rtl"
              : "ltr",
          },
        ]}
      >
        {label}
      </Text>

      <View
        style={[
          styles.inputShell,
          focused &&
            styles.inputShellFocused,
          error &&
            styles.inputShellError,
        ]}
      >
        {icon ? (
          <Ionicons
            name={icon}
            size={20}
            color={
              focused
                ? KhedmatPalette.blue500
                : KhedmatPalette.textMuted
            }
          />
        ) : null}

        {leadingContent}

        <TextInput
          {...inputProps}
          secureTextEntry={
            isPassword &&
            !passwordVisible
          }
          onFocus={(event) => {
            setFocused(true);
            inputProps.onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            inputProps.onBlur?.(event);
          }}
          placeholderTextColor={
            KhedmatPalette.textMuted
          }
          selectionColor={
            KhedmatPalette.blue500
          }
          style={[
            styles.input,
            {
              textAlign: isRtl
                ? "right"
                : "left",
              writingDirection: isRtl
                ? "rtl"
                : "ltr",
            },
            inputProps.style,
          ]}
        />

        {trailingContent}

        {isPassword ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              passwordVisible
                ? "Hide password"
                : "Show password"
            }
            hitSlop={8}
            onPress={() =>
              setPasswordVisible(
                (current) => !current,
              )
            }
          >
            <Ionicons
              name={
                passwordVisible
                  ? "eye-off-outline"
                  : "eye-outline"
              }
              size={20}
              color={
                KhedmatPalette.textMuted
              }
            />
          </Pressable>
        ) : null}
      </View>

      {error ? (
        <View style={styles.messageRow}>
          <Ionicons
            name="alert-circle-outline"
            size={15}
            color={KhedmatPalette.error}
          />

          <Text
            style={[
              styles.errorText,
              {
                textAlign: isRtl
                  ? "right"
                  : "left",
                writingDirection: isRtl
                  ? "rtl"
                  : "ltr",
              },
            ]}
          >
            {error}
          </Text>
        </View>
      ) : helperText ? (
        <Text
          style={[
            styles.helperText,
            {
              textAlign: isRtl
                ? "right"
                : "left",
              writingDirection: isRtl
                ? "rtl"
                : "ltr",
            },
          ]}
        >
          {helperText}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    gap: 7,
  },

  label: {
    ...Typography.label,
    width: "100%",
    color:
      KhedmatPalette.textPrimary,
  },

  inputShell: {
    width: "100%",
    minHeight: Layout.controlHeight,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
    backgroundColor:
      KhedmatPalette.surface,
    borderWidth: 1,
    borderColor:
      KhedmatPalette.border,
    borderRadius: Radius.lg,
  },

  inputShellFocused: {
    borderWidth: 1.5,
    borderColor:
      KhedmatPalette.borderFocused,
  },

  inputShellError: {
    borderColor:
      KhedmatPalette.error,
    backgroundColor:
      KhedmatPalette.errorSoft,
  },

  input: {
    flex: 1,
    minHeight: Layout.controlHeight,
    paddingVertical: 0,
    fontFamily: Fonts.regular,
    fontSize: Typography.body,
    color:
      KhedmatPalette.textPrimary,
  },

  messageRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  errorText: {
    ...Typography.captionStyle,
    flex: 1,
    color: KhedmatPalette.error,
  },

  helperText: {
    ...Typography.captionStyle,
    width: "100%",
    color:
      KhedmatPalette.textMuted,
  },
});