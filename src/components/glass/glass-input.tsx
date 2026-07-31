import { Ionicons } from "@expo/vector-icons";
import { ComponentProps, ReactNode, useState } from "react";
import {
    StyleProp,
    StyleSheet,
    Text,
    TextInput,
    TextInputProps,
    View,
    ViewStyle,
} from "react-native";

import {
    Colors,
    Layout,
    Radius,
    Spacing,
    Typography,
} from "../../constants/theme";
import { GlassSurface } from "./glass-surface";

type IconName = ComponentProps<typeof Ionicons>["name"];

type GlassInputProps = TextInputProps & {
  label: string;
  icon?: IconName;
  error?: string;
  leadingContent?: ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
};

export function GlassInput({
  label,
  icon,
  error,
  leadingContent,
  containerStyle,
  onFocus,
  onBlur,
  ...inputProps
}: GlassInputProps) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={[styles.container, containerStyle]}>
      <Text
        style={[
          styles.label,
          focused && styles.focusedLabel,
          error && styles.errorLabel,
        ]}
      >
        {label}
      </Text>

      <GlassSurface
        radius={Radius.lg}
        style={[
          styles.surface,
          focused && styles.focusedSurface,
          error && styles.errorSurface,
        ]}
        contentStyle={styles.inputRow}
      >
        {leadingContent}

        {icon ? (
          <Ionicons
            color={focused ? Colors.primary : Colors.textTertiary}
            name={icon}
            size={20}
          />
        ) : null}

        <TextInput
          {...inputProps}
          onBlur={(event) => {
            setFocused(false);
            onBlur?.(event);
          }}
          onFocus={(event) => {
            setFocused(true);
            onFocus?.(event);
          }}
          placeholderTextColor={Colors.textMuted}
          selectionColor={Colors.primary}
          style={[styles.input, inputProps.style]}
        />
      </GlassSurface>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    gap: Spacing.sm,
  },
  label: {
    ...Typography.label,
    color: Colors.textSecondary,
    paddingLeft: 2,
  },
  focusedLabel: {
    color: Colors.textPrimary,
  },
  errorLabel: {
    color: Colors.error,
  },
  surface: {
    minHeight: Layout.controlHeight,
  },
  focusedSurface: {
    borderColor: "rgba(76, 141, 255, 0.72)",
    backgroundColor: "rgba(76, 141, 255, 0.08)",
  },
  errorSurface: {
    borderColor: "rgba(225, 90, 90, 0.72)",
  },
  inputRow: {
    minHeight: Layout.controlHeight,
    paddingHorizontal: Spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  input: {
    flex: 1,
    minHeight: Layout.controlHeight,
    paddingVertical: 0,
    ...Typography.bodyStyle,
    color: Colors.textPrimary,
  },
  errorText: {
    ...Typography.captionStyle,
    color: Colors.error,
    paddingLeft: 2,
  },
});