import { Platform, TextStyle, ViewStyle } from "react-native";

const fontFamily = Platform.select({
  ios: "System",
  android: "sans-serif",
  default: "System",
});

const mediumFontFamily = Platform.select({
  ios: "System",
  android: "sans-serif-medium",
  default: "System",
});

export const Colors = {
  // Core backgrounds
  background: "#070A0F",
  backgroundRaised: "#0B1119",
  backgroundSoft: "#101720",

  // Surfaces
  surface: "#111821",
  surfaceElevated: "#161F2B",
  surfacePressed: "#1B2634",

  // Text
  text: "#F5F7FA",
  textPrimary: "#F5F7FA",
  textSecondary: "#A7B0BD",
  textTertiary: "#717D8C",
  textMuted: "#566170",
  textInverse: "#07101B",

  // Brand
  primary: "#4C8DFF",
  primaryDark: "#3978E6",
  primaryPressed: "#3978E6",
  primarySoft: "rgba(76, 141, 255, 0.16)",
  secondary: "#56B7C9",

  // Glass
  glass: "rgba(255, 255, 255, 0.075)",
  glassStrong: "rgba(255, 255, 255, 0.115)",
  glassPressed: "rgba(255, 255, 255, 0.14)",
  glassHighlight: "rgba(255, 255, 255, 0.18)",

  // Lines
  border: "rgba(255, 255, 255, 0.11)",
  borderStrong: "rgba(255, 255, 255, 0.18)",
  separator: "rgba(255, 255, 255, 0.07)",

  // Semantic
  success: "#30B76A",
  warning: "#D99A2B",
  error: "#E15A5A",
  info: "#4C8DFF",

  // Compatibility aliases
  muted: "#717D8C",
  white: "#FFFFFF",
  black: "#000000",
} as const;

export const Gradients = {
  screen: ["#070A0F", "#09111A", "#0A1520"] as const,
  primaryButton: ["#5A98FF", "#3F7FEF"] as const,
  subtleButton: [
    "rgba(255,255,255,0.12)",
    "rgba(255,255,255,0.07)",
  ] as const,
} as const;

export const Spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  section: 32,
  screen: 40,
  hero: 48,
  huge: 64,
} as const;

export const Radius = {
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 28,
  pill: 999,
} as const;

export const Typography = {
  // Compatibility values
  title: 30,
  subtitle: 15,
  body: 16,
  caption: 13,
  button: 16,

  display: {
    fontFamily: mediumFontFamily,
    fontSize: 38,
    lineHeight: 44,
    fontWeight: "700",
    letterSpacing: -1.1,
  } satisfies TextStyle,

  screenTitle: {
    fontFamily: mediumFontFamily,
    fontSize: 30,
    lineHeight: 36,
    fontWeight: "700",
    letterSpacing: -0.7,
  } satisfies TextStyle,

  sectionTitle: {
    fontFamily: mediumFontFamily,
    fontSize: 22,
    lineHeight: 28,
    fontWeight: "700",
    letterSpacing: -0.3,
  } satisfies TextStyle,

  bodyLarge: {
    fontFamily,
    fontSize: 17,
    lineHeight: 25,
    fontWeight: "400",
  } satisfies TextStyle,

  bodyStyle: {
    fontFamily,
    fontSize: 16,
    lineHeight: 23,
    fontWeight: "400",
  } satisfies TextStyle,

  label: {
    fontFamily: mediumFontFamily,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "600",
  } satisfies TextStyle,

  captionStyle: {
    fontFamily,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "500",
  } satisfies TextStyle,
} as const;

export const Fonts = {
  regular: fontFamily,
  medium: mediumFontFamily,
  bold: mediumFontFamily,
} as const;

export const Shadows = {
  small: {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 14,
    elevation: 5,
  } satisfies ViewStyle,

  medium: {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 9,
  } satisfies ViewStyle,

  accent: {
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.22,
    shadowRadius: 22,
    elevation: 8,
  } satisfies ViewStyle,
} as const;

export const Layout = {
  screenPadding: 20,
  contentMaxWidth: 540,
  controlHeight: 56,
  largeControlHeight: 58,
  minimumTouchTarget: 44,
} as const;