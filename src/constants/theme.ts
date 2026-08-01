import {
  Platform,
  TextStyle,
  ViewStyle,
} from "react-native";

const fontFamily =
  "Roboto_400Regular";

const mediumFontFamily =
  "Roboto_500Medium";

const semiBoldFontFamily =
  "Roboto_600SemiBold";

const boldFontFamily =
  "Roboto_700Bold";

export const Colors = {
  // Existing dark theme
  background: "#070A0F",
  backgroundRaised: "#0B1119",
  backgroundSoft: "#101720",

  surface: "#111821",
  surfaceElevated: "#161F2B",
  surfacePressed: "#1B2634",

  text: "#F5F7FA",
  textPrimary: "#F5F7FA",
  textSecondary: "#A7B0BD",
  textTertiary: "#717D8C",
  textMuted: "#566170",
  textInverse: "#07101B",

  primary: "#4C8DFF",
  primaryDark: "#3978E6",
  primaryPressed: "#3978E6",
  primarySoft:
    "rgba(76, 141, 255, 0.16)",
  secondary: "#56B7C9",

  glass:
    "rgba(255, 255, 255, 0.075)",
  glassStrong:
    "rgba(255, 255, 255, 0.115)",
  glassPressed:
    "rgba(255, 255, 255, 0.14)",
  glassHighlight:
    "rgba(255, 255, 255, 0.18)",

  border:
    "rgba(255, 255, 255, 0.11)",
  borderStrong:
    "rgba(255, 255, 255, 0.18)",
  separator:
    "rgba(255, 255, 255, 0.07)",

  success: "#30B76A",
  warning: "#D99A2B",
  error: "#E15A5A",
  info: "#4C8DFF",

  muted: "#717D8C",
  white: "#FFFFFF",
  black: "#000000",
} as const;

export const KhedmatPalette = {
  navy900: "#001B48",
  navy700: "#02457A",
  blue500: "#018ABE",
  blue200: "#97CADB",
  blue050: "#D6E8EE",

  white: "#FFFFFF",

  textPrimary: "#001B48",
  textSecondary: "#315F79",
  textMuted: "#5E7E8F",

  surface: "#FFFFFF",
  surfaceSoft: "#EDF6F8",

  border: "#B9D7E1",
  borderFocused: "#018ABE",

  success: "#1E7A4E",
  successSoft: "#E6F4EC",

  warning: "#9A6500",
  warningSoft: "#FFF4D6",

  error: "#B3261E",
  errorSoft: "#FCE8E6",

  disabled: "#A8BCC5",
} as const;

export const Gradients = {
  screen: [
    "#070A0F",
    "#09111A",
    "#0A1520",
  ] as const,

  primaryButton: [
    "#5A98FF",
    "#3F7FEF",
  ] as const,

  subtleButton: [
    "rgba(255,255,255,0.12)",
    "rgba(255,255,255,0.07)",
  ] as const,

  khedmatPrimary: [
    "#02457A",
    "#001B48",
  ] as const,

  khedmatSecondary: [
    "#018ABE",
    "#02457A",
  ] as const,

  khedmatScreen: [
    "#D6E8EE",
    "#EDF6F8",
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
  section: 28,
  screen: 36,
  hero: 44,
  huge: 56,
} as const;

export const Radius = {
  sm: 10,
  md: 14,
  lg: 18,
  xl: 22,
  xxl: 26,
  pill: 999,
} as const;

export const Typography = {
  title: 26,
  subtitle: 15,
  body:
    Platform.OS === "ios"
      ? 17
      : 16,
  caption: 12,
  button: 16,

  display: {
    fontFamily: boldFontFamily,
    fontSize: 32,
    lineHeight: 39,
    fontWeight: "700",
    letterSpacing: -0.5,
  } satisfies TextStyle,

  screenTitle: {
    fontFamily: boldFontFamily,
    fontSize: 26,
    lineHeight: 33,
    fontWeight: "700",
    letterSpacing: -0.25,
  } satisfies TextStyle,

  sectionTitle: {
    fontFamily: semiBoldFontFamily,
    fontSize: 20,
    lineHeight: 26,
    fontWeight: "600",
    letterSpacing: -0.1,
  } satisfies TextStyle,

  bodyLarge: {
    fontFamily,
    fontSize:
      Platform.OS === "ios"
        ? 17
        : 16,
    lineHeight:
      Platform.OS === "ios"
        ? 25
        : 24,
    fontWeight: "400",
  } satisfies TextStyle,

  bodyStyle: {
    fontFamily,
    fontSize:
      Platform.OS === "ios"
        ? 17
        : 16,
    lineHeight:
      Platform.OS === "ios"
        ? 25
        : 24,
    fontWeight: "400",
  } satisfies TextStyle,

  label: {
    fontFamily: mediumFontFamily,
    fontSize: 15,
    lineHeight: 21,
    fontWeight: "500",
  } satisfies TextStyle,

  captionStyle: {
    fontFamily,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "400",
  } satisfies TextStyle,

  captionSmall: {
    fontFamily,
    fontSize: 10,
    lineHeight: 14,
    fontWeight: "400",
  } satisfies TextStyle,

  buttonLabel: {
    fontFamily: semiBoldFontFamily,
    fontSize: 16,
    lineHeight: 21,
    fontWeight: "600",
  } satisfies TextStyle,
} as const;

export const Fonts = {
  regular: fontFamily,
  medium: mediumFontFamily,
  semibold: semiBoldFontFamily,
  bold: boldFontFamily,
} as const;

export const Shadows = {
  small: {
    shadowColor: "#001B48",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
  } satisfies ViewStyle,

  medium: {
    shadowColor: "#001B48",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.16,
    shadowRadius: 18,
    elevation: 7,
  } satisfies ViewStyle,

  accent: {
    shadowColor:
      KhedmatPalette.blue500,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.2,
    shadowRadius: 18,
    elevation: 7,
  } satisfies ViewStyle,

  darkAccent: {
    shadowColor:
      KhedmatPalette.navy900,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 7,
  } satisfies ViewStyle,
} as const;

export const Layout = {
  screenPadding: 20,
  contentMaxWidth: 540,
  readableTextMaxWidth: 430,
  controlHeight: 54,
  largeControlHeight: 56,
  minimumTouchTarget: 44,
} as const;