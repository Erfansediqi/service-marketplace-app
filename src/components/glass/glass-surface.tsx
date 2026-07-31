import { BlurView } from "expo-blur";
import { PropsWithChildren } from "react";
import {
    StyleProp,
    StyleSheet,
    View,
    ViewStyle,
} from "react-native";

import { Colors, Radius } from "../../constants/theme";

export type GlassSurfaceVariant = "clear" | "regular" | "prominent";

type GlassSurfaceProps = PropsWithChildren<{
  variant?: GlassSurfaceVariant;
  radius?: number;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
}>;

const variantConfig: Record<
  GlassSurfaceVariant,
  {
    intensity: number;
    backgroundColor: string;
    borderColor: string;
  }
> = {
  clear: {
    intensity: 20,
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    borderColor: "rgba(255, 255, 255, 0.11)",
  },
  regular: {
    intensity: 38,
    backgroundColor: Colors.glass,
    borderColor: Colors.border,
  },
  prominent: {
    intensity: 52,
    backgroundColor: Colors.glassStrong,
    borderColor: Colors.borderStrong,
  },
};

export function GlassSurface({
  children,
  variant = "regular",
  radius = Radius.lg,
  style,
  contentStyle,
}: GlassSurfaceProps) {
  const config = variantConfig[variant];

  return (
    <View
      style={[
        styles.container,
        {
          borderRadius: radius,
          backgroundColor: config.backgroundColor,
          borderColor: config.borderColor,
        },
        style,
      ]}
    >
      <BlurView
        intensity={config.intensity}
        tint="dark"
        pointerEvents="none"
        style={StyleSheet.absoluteFill}
      />

      <View pointerEvents="none" style={styles.topHighlight} />

      <View style={[styles.content, contentStyle]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
  },
  content: {
    position: "relative",
    zIndex: 2,
  },
  topHighlight: {
    position: "absolute",
    zIndex: 1,
    top: 0,
    right: 1,
    left: 1,
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.20)",
  },
});