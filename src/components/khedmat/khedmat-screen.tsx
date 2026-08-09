import {
  PropsWithChildren,
  ReactNode,
} from "react";
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";

import {
  KhedmatPalette,
  Layout,
  Spacing,
} from "../../constants/theme";

type KhedmatScreenProps = PropsWithChildren<{
  footer?: ReactNode;
  scrollable?: boolean;
  keyboardAware?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
}>;

export function KhedmatScreen({
  children,
  footer,
  scrollable = false,
  keyboardAware = false,
  contentStyle,
}: KhedmatScreenProps) {
  const screenContent = scrollable ? (
    <ScrollView
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={[
        styles.scrollContent,
        contentStyle,
      ]}
    >
      {children}
    </ScrollView>
  ) : (
    <View
      style={[
        styles.staticContent,
        contentStyle,
      ]}
    >
      {children}
    </View>
  );

  const screen = (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        {screenContent}

        {footer ? (
          <View style={styles.footer}>
            <View style={styles.footerInner}>
              {footer}
            </View>
          </View>
        ) : null}
      </View>
    </SafeAreaView>
  );

  if (!keyboardAware) {
    return screen;
  }

  return (
    <KeyboardAvoidingView
      style={styles.keyboardView}
      behavior={
        Platform.OS === "ios"
          ? "padding"
          : undefined
      }
      keyboardVerticalOffset={0}
    >
      {screen}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
    backgroundColor:
      KhedmatPalette.white,
  },

  safeArea: {
    flex: 1,
    backgroundColor:
      KhedmatPalette.white,
  },

  screen: {
    flex: 1,
    backgroundColor:
      KhedmatPalette.white,
  },

  staticContent: {
    flex: 1,
    width: "100%",
    maxWidth: Layout.contentMaxWidth,
    alignSelf: "center",
    paddingHorizontal:
      Layout.screenPadding,
    paddingTop: Spacing.md,
  },

  scrollContent: {
    width: "100%",
    maxWidth: Layout.contentMaxWidth,
    alignSelf: "center",
    flexGrow: 1,
    paddingHorizontal:
      Layout.screenPadding,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xxl,
  },

  footer: {
    width: "100%",
    paddingHorizontal:
      Layout.screenPadding,
    paddingTop: Spacing.md,
    paddingBottom:
      Platform.OS === "ios"
        ? Spacing.md
        : Spacing.lg,
    backgroundColor:
      KhedmatPalette.white,
    borderTopWidth:
      StyleSheet.hairlineWidth,
    borderTopColor:
      KhedmatPalette.blue200,
  },

  footerInner: {
    width: "100%",
    maxWidth: Layout.contentMaxWidth,
    alignSelf: "center",
  },
});
