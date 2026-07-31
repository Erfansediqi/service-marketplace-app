import { Ionicons } from "@expo/vector-icons";
import { ComponentProps } from "react";
import {
    Pressable,
    StyleProp,
    StyleSheet,
    ViewStyle,
} from "react-native";

import {
    Colors,
    Layout,
    Radius,
    Shadows,
} from "../../constants/theme";
import { GlassSurface } from "./glass-surface";

type IconName = ComponentProps<typeof Ionicons>["name"];

type GlassIconButtonProps = {
  icon: IconName;
  onPress: () => void;
  accessibilityLabel: string;
  size?: number;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function GlassIconButton({
  icon,
  onPress,
  accessibilityLabel,
  size = 20,
  disabled = false,
  style,
}: GlassIconButtonProps) {
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      disabled={disabled}
      hitSlop={8}
      onPress={onPress}
      style={({ pressed }) => [
        styles.pressable,
        Shadows.small,
        pressed && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
    >
      <GlassSurface
        radius={Radius.pill}
        contentStyle={styles.content}
        style={styles.surface}
      >
        <Ionicons
          color={Colors.textPrimary}
          name={icon}
          size={size}
        />
      </GlassSurface>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    width: Layout.minimumTouchTarget,
    height: Layout.minimumTouchTarget,
    borderRadius: Radius.pill,
  },
  surface: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: {
    opacity: 0.88,
    transform: [{ scale: 0.97 }],
  },
  disabled: {
    opacity: 0.4,
  },
});