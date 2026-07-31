import { LinearGradient } from "expo-linear-gradient";
import { PropsWithChildren, ReactNode } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleProp,
    StyleSheet,
    View,
    ViewStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
    Gradients,
    Layout,
    Spacing,
} from "../../constants/theme";

type AppScreenProps = PropsWithChildren<{
  scrollable?: boolean;
  keyboardAware?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
  footer?: ReactNode;
}>;

export function AppScreen({
  children,
  scrollable = false,
  keyboardAware = false,
  contentStyle,
  footer,
}: AppScreenProps) {
  const content = scrollable ? (
    <ScrollView
      contentContainerStyle={[styles.scrollContent, contentStyle]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.content, contentStyle]}>{children}</View>
  );

  const body = (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.maxWidthContainer}>
        {content}
        {footer ? <View style={styles.footer}>{footer}</View> : null}
      </View>
    </SafeAreaView>
  );

  return (
    <LinearGradient colors={Gradients.screen} style={styles.container}>
      <View pointerEvents="none" style={styles.ambientLightTop} />
      <View pointerEvents="none" style={styles.ambientLightBottom} />

      {keyboardAware ? (
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardView}
        >
          {body}
        </KeyboardAvoidingView>
      ) : (
        body
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: "hidden",
  },
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  maxWidthContainer: {
    flex: 1,
    width: "100%",
    maxWidth: Layout.contentMaxWidth,
    alignSelf: "center",
  },
  content: {
    flex: 1,
    paddingHorizontal: Layout.screenPadding,
    paddingVertical: Spacing.xxl,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Layout.screenPadding,
    paddingVertical: Spacing.xxl,
  },
  footer: {
    paddingHorizontal: Layout.screenPadding,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  ambientLightTop: {
    position: "absolute",
    width: 340,
    height: 340,
    borderRadius: 170,
    top: -170,
    right: -120,
    backgroundColor: "rgba(67, 132, 255, 0.10)",
  },
  ambientLightBottom: {
    position: "absolute",
    width: 300,
    height: 300,
    borderRadius: 150,
    bottom: -200,
    left: -170,
    backgroundColor: "rgba(67, 183, 204, 0.045)",
  },
});