import {
    PropsWithChildren,
} from "react";
import {
    StyleProp,
    StyleSheet,
    View,
    ViewStyle,
} from "react-native";

import {
    KhedmatPalette,
    Radius,
    Shadows,
    Spacing,
} from "../../constants/theme";

type KhedmatCardVariant =
  | "default"
  | "soft"
  | "accent"
  | "dark";

type KhedmatCardProps =
  PropsWithChildren<{
    variant?: KhedmatCardVariant;
    padded?: boolean;
    style?: StyleProp<ViewStyle>;
    contentStyle?: StyleProp<ViewStyle>;
  }>;

export function KhedmatCard({
  children,
  variant = "default",
  padded = true,
  style,
  contentStyle,
}: KhedmatCardProps) {
  const colors =
    getVariantColors(variant);

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor:
            colors.background,
          borderColor: colors.border,
        },
        variant === "default" &&
          Shadows.small,
        style,
      ]}
    >
      <View
        style={[
          padded && styles.content,
          contentStyle,
        ]}
      >
        {children}
      </View>
    </View>
  );
}

function getVariantColors(
  variant: KhedmatCardVariant,
) {
  if (variant === "soft") {
    return {
      background:
        KhedmatPalette.surfaceSoft,
      border:
        KhedmatPalette.border,
    };
  }

  if (variant === "accent") {
    return {
      background:
        KhedmatPalette.blue200,
      border:
        KhedmatPalette.blue500,
    };
  }

  if (variant === "dark") {
    return {
      background:
        KhedmatPalette.navy900,
      border:
        KhedmatPalette.navy900,
    };
  }

  return {
    background:
      KhedmatPalette.surface,
    border:
      KhedmatPalette.border,
  };
}

const styles = StyleSheet.create({
  card: {
    width: "100%",
    overflow: "hidden",
    borderWidth:
      StyleSheet.hairlineWidth,
    borderRadius: Radius.xl,
  },

  content: {
    padding: Spacing.lg,
  },
});