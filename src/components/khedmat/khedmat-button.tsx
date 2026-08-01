import { Ionicons } from "@expo/vector-icons";
import {
    ComponentProps,
    ReactNode,
} from "react";
import {
    ActivityIndicator,
    Pressable,
    StyleProp,
    StyleSheet,
    Text,
    View,
    ViewStyle,
} from "react-native";

import {
    KhedmatPalette,
    Layout,
    Radius,
    Shadows,
    Spacing,
    Typography,
} from "../../constants/theme";

type IconName =
  ComponentProps<typeof Ionicons>["name"];

type KhedmatButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "text"
  | "destructive";

type KhedmatButtonProps = {
  label: string;
  onPress: () => void;

  variant?: KhedmatButtonVariant;
  icon?: IconName;
  iconPosition?: "left" | "right";

  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;

  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
  trailingContent?: ReactNode;
};

export function KhedmatButton({
  label,
  onPress,
  variant = "primary",
  icon,
  iconPosition = "left",
  disabled = false,
  loading = false,
  fullWidth = true,
  accessibilityLabel,
  style,
  trailingContent,
}: KhedmatButtonProps) {
  const unavailable =
    disabled || loading;

  const colors =
    getButtonColors(
      variant,
      unavailable,
    );

  const iconNode = icon ? (
    <Ionicons
      name={icon}
      size={20}
      color={colors.foreground}
    />
  ) : null;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={
        accessibilityLabel ?? label
      }
      accessibilityState={{
        disabled: unavailable,
        busy: loading,
      }}
      disabled={unavailable}
      onPress={onPress}
      style={({ pressed }) => [
        styles.pressable,
        fullWidth && styles.fullWidth,
        {
          backgroundColor:
            colors.background,
          borderColor: colors.border,
        },
        variant === "primary" &&
          !unavailable &&
          Shadows.darkAccent,
        pressed &&
          !unavailable &&
          styles.pressed,
        unavailable &&
          styles.unavailable,
        style,
      ]}
    >
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator
            size="small"
            color={colors.foreground}
          />
        ) : (
          <>
            {iconPosition === "right"
              ? iconNode
              : null}

            <Text
              style={[
                styles.label,
                {
                  color:
                    colors.foreground,
                },
              ]}
            >
              {label}
            </Text>

            {iconPosition === "left"
              ? iconNode
              : null}

            {trailingContent}
          </>
        )}
      </View>
    </Pressable>
  );
}

function getButtonColors(
  variant: KhedmatButtonVariant,
  disabled: boolean,
) {
  if (disabled) {
    return {
      background:
        KhedmatPalette.disabled,
      foreground:
        KhedmatPalette.surfaceSoft,
      border:
        KhedmatPalette.disabled,
    };
  }

  if (variant === "secondary") {
    return {
      background:
        KhedmatPalette.blue500,
      foreground:
        KhedmatPalette.white,
      border:
        KhedmatPalette.blue500,
    };
  }

  if (variant === "outline") {
    return {
      background:
        KhedmatPalette.surface,
      foreground:
        KhedmatPalette.navy700,
      border:
        KhedmatPalette.blue200,
    };
  }

  if (variant === "text") {
    return {
      background: "transparent",
      foreground:
        KhedmatPalette.blue500,
      border: "transparent",
    };
  }

  if (variant === "destructive") {
    return {
      background:
        KhedmatPalette.error,
      foreground:
        KhedmatPalette.white,
      border:
        KhedmatPalette.error,
    };
  }

  return {
    background:
      KhedmatPalette.navy900,
    foreground:
      KhedmatPalette.white,
    border:
      KhedmatPalette.navy900,
  };
}

const styles = StyleSheet.create({
  pressable: {
    minHeight:
      Layout.largeControlHeight,
    paddingHorizontal: Spacing.lg,
    borderWidth: 1,
    borderRadius: Radius.lg,
    alignItems: "center",
    justifyContent: "center",
  },

  fullWidth: {
    width: "100%",
  },

  content: {
    minHeight:
      Layout.minimumTouchTarget,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
  },

  label: {
    ...Typography.buttonLabel,
    textAlign: "center",
  },

  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.992 }],
  },

  unavailable: {
    shadowOpacity: 0,
    elevation: 0,
  },
});