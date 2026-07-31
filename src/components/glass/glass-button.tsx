import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { ComponentProps } from "react";
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
    Colors,
    Gradients,
    Layout,
    Radius,
    Shadows,
    Typography,
} from "../../constants/theme";
import { GlassSurface } from "./glass-surface";

type IconName = ComponentProps<typeof Ionicons>["name"];
type ButtonVariant = "primary" | "secondary" | "quiet" | "destructive";

type GlassButtonProps = {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  icon?: IconName;
  iconPosition?: "left" | "right";
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function GlassButton({
  label,
  onPress,
  variant = "primary",
  icon,
  iconPosition = "right",
  loading = false,
  disabled = false,
  fullWidth = true,
  style,
}: GlassButtonProps) {
  const unavailable = disabled || loading;
  const isPrimary = variant === "primary";

  const foregroundColor =
    variant === "destructive" ? Colors.error : Colors.textPrimary;

  const buttonContent = (
    <View style={styles.content}>
      {loading ? (
        <ActivityIndicator color={Colors.white} />
      ) : (
        <>
          {icon && iconPosition === "left" ? (
            <Ionicons color={foregroundColor} name={icon} size={19} />
          ) : null}

          <Text style={[styles.label, { color: foregroundColor }]}>
            {label}
          </Text>

          {icon && iconPosition === "right" ? (
            <Ionicons color={foregroundColor} name={icon} size={19} />
          ) : null}
        </>
      )}
    </View>
  );

  return (
    <Pressable
      accessibilityRole="button"
      disabled={unavailable}
      onPress={onPress}
      style={({ pressed }) => [
        styles.pressable,
        fullWidth && styles.fullWidth,
        isPrimary ? Shadows.accent : Shadows.small,
        pressed && styles.pressed,
        unavailable && styles.disabled,
        style,
      ]}
    >
      {isPrimary ? (
        <LinearGradient
          colors={Gradients.primaryButton}
          end={{ x: 1, y: 1 }}
          start={{ x: 0, y: 0 }}
          style={styles.primarySurface}
        >
          <View pointerEvents="none" style={styles.primaryHighlight} />
          {buttonContent}
        </LinearGradient>
      ) : (
        <GlassSurface
          variant={variant === "secondary" ? "prominent" : "regular"}
          radius={Radius.lg}
          style={styles.secondarySurface}
        >
          {buttonContent}
        </GlassSurface>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    minHeight: Layout.largeControlHeight,
    borderRadius: Radius.lg,
  },
  fullWidth: {
    width: "100%",
  },
  primarySurface: {
    minHeight: Layout.largeControlHeight,
    overflow: "hidden",
    justifyContent: "center",
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255, 255, 255, 0.24)",
  },
  primaryHighlight: {
    position: "absolute",
    top: 0,
    right: 1,
    left: 1,
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.42)",
  },
  secondarySurface: {
    minHeight: Layout.largeControlHeight,
  },
  content: {
    minHeight: Layout.largeControlHeight,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
  },
  label: {
    ...Typography.label,
    fontSize: 16,
  },
  pressed: {
    opacity: 0.91,
    transform: [{ scale: 0.985 }],
  },
  disabled: {
    opacity: 0.42,
    shadowOpacity: 0,
    elevation: 0,
  },
});