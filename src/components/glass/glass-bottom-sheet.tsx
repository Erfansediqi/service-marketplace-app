import { BlurView } from "expo-blur";
import {
    PropsWithChildren,
    ReactNode,
    useEffect,
    useMemo,
    useRef,
} from "react";
import {
    Animated,
    Dimensions,
    KeyboardAvoidingView,
    Modal,
    PanResponder,
    Platform,
    Pressable,
    ScrollView,
    StyleProp,
    StyleSheet,
    Text,
    View,
    ViewStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
    Colors,
    Radius,
    Shadows,
    Spacing,
    Typography,
} from "../../constants/theme";
import { GlassIconButton } from "./glass-icon-button";
import { GlassSurface } from "./glass-surface";

const SCREEN_HEIGHT = Dimensions.get("window").height;
const DEFAULT_SHEET_HEIGHT = Math.min(SCREEN_HEIGHT * 0.78, 720);
const DISMISS_DISTANCE = 110;
const DISMISS_VELOCITY = 0.9;

type GlassBottomSheetProps = PropsWithChildren<{
  visible: boolean;
  onClose: () => void;

  title?: string;
  subtitle?: string;

  headerContent?: ReactNode;
  footer?: ReactNode;

  height?: number;
  scrollable?: boolean;
  keyboardAware?: boolean;

  closeOnBackdropPress?: boolean;
  showCloseButton?: boolean;
  showHandle?: boolean;

  contentStyle?: StyleProp<ViewStyle>;
  sheetStyle?: StyleProp<ViewStyle>;
}>;

export function GlassBottomSheet({
  visible,
  onClose,

  title,
  subtitle,

  headerContent,
  footer,

  height = DEFAULT_SHEET_HEIGHT,
  scrollable = true,
  keyboardAware = true,

  closeOnBackdropPress = true,
  showCloseButton = true,
  showHandle = true,

  contentStyle,
  sheetStyle,

  children,
}: GlassBottomSheetProps) {
  const translateY = useRef(new Animated.Value(height)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const isClosing = useRef(false);

  const clampedHeight = useMemo(
    () => Math.min(Math.max(height, 280), SCREEN_HEIGHT * 0.94),
    [height],
  );

  const openSheet = () => {
    isClosing.current = false;

    translateY.setValue(clampedHeight);
    backdropOpacity.setValue(0);

    Animated.parallel([
      Animated.spring(translateY, {
        toValue: 0,
        damping: 24,
        stiffness: 230,
        mass: 0.9,
        useNativeDriver: true,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closeSheet = () => {
    if (isClosing.current) {
      return;
    }

    isClosing.current = true;

    Animated.parallel([
      Animated.timing(translateY, {
        toValue: clampedHeight,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) {
        isClosing.current = false;
        onClose();
      }
    });
  };

  useEffect(() => {
    if (visible) {
      openSheet();
    }
  }, [visible, clampedHeight]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gestureState) => {
          const verticalMovement = Math.abs(gestureState.dy);
          const horizontalMovement = Math.abs(gestureState.dx);

          return (
            verticalMovement > 6 &&
            verticalMovement > horizontalMovement &&
            gestureState.dy > 0
          );
        },

        onPanResponderMove: (_, gestureState) => {
          if (gestureState.dy > 0) {
            translateY.setValue(gestureState.dy);

            const progress = Math.min(
              gestureState.dy / clampedHeight,
              1,
            );

            backdropOpacity.setValue(1 - progress * 0.75);
          }
        },

        onPanResponderRelease: (_, gestureState) => {
          const shouldDismiss =
            gestureState.dy > DISMISS_DISTANCE ||
            gestureState.vy > DISMISS_VELOCITY;

          if (shouldDismiss) {
            closeSheet();
            return;
          }

          Animated.parallel([
            Animated.spring(translateY, {
              toValue: 0,
              damping: 22,
              stiffness: 240,
              mass: 0.9,
              useNativeDriver: true,
            }),
            Animated.timing(backdropOpacity, {
              toValue: 1,
              duration: 150,
              useNativeDriver: true,
            }),
          ]).start();
        },

        onPanResponderTerminate: () => {
          Animated.spring(translateY, {
            toValue: 0,
            damping: 22,
            stiffness: 240,
            useNativeDriver: true,
          }).start();

          Animated.timing(backdropOpacity, {
            toValue: 1,
            duration: 150,
            useNativeDriver: true,
          }).start();
        },
      }),
    [backdropOpacity, clampedHeight, translateY],
  );

  const sheetBody = scrollable ? (
    <ScrollView
      contentContainerStyle={[
        styles.scrollContent,
        contentStyle,
      ]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      bounces
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.staticContent, contentStyle]}>
      {children}
    </View>
  );

  const content = (
    <SafeAreaView
      edges={["bottom"]}
      style={styles.safeArea}
    >
      <View
        {...panResponder.panHandlers}
        style={styles.dragArea}
      >
        {showHandle ? <View style={styles.handle} /> : null}
      </View>

      {headerContent ? (
        <View style={styles.customHeader}>
          {headerContent}
        </View>
      ) : title || subtitle || showCloseButton ? (
        <View style={styles.header}>
          <View style={styles.headerCopy}>
            {title ? (
              <Text style={styles.title}>{title}</Text>
            ) : null}

            {subtitle ? (
              <Text style={styles.subtitle}>{subtitle}</Text>
            ) : null}
          </View>

          {showCloseButton ? (
            <GlassIconButton
              icon="close"
              accessibilityLabel="بستن"
              size={19}
              onPress={closeSheet}
            />
          ) : null}
        </View>
      ) : null}

      <View style={styles.body}>{sheetBody}</View>

      {footer ? (
        <View style={styles.footer}>{footer}</View>
      ) : null}
    </SafeAreaView>
  );

  return (
    <Modal
      animationType="none"
      transparent
      visible={visible}
      statusBarTranslucent
      onRequestClose={closeSheet}
    >
      <View style={styles.modalRoot}>
        <Animated.View
          pointerEvents="none"
          style={[
            styles.backdropBlur,
            {
              opacity: backdropOpacity,
            },
          ]}
        >
          <BlurView
            intensity={24}
            tint="dark"
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>

        <Animated.View
          pointerEvents="none"
          style={[
            styles.backdropOverlay,
            {
              opacity: backdropOpacity,
            },
          ]}
        />

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="بستن پنجره"
          disabled={!closeOnBackdropPress}
          onPress={closeOnBackdropPress ? closeSheet : undefined}
          style={StyleSheet.absoluteFill}
        />

        <KeyboardAvoidingView
          pointerEvents="box-none"
          behavior={
            keyboardAware && Platform.OS === "ios"
              ? "padding"
              : undefined
          }
          style={styles.keyboardView}
        >
          <Animated.View
            style={[
              styles.sheetWrapper,
              {
                height: clampedHeight,
                transform: [{ translateY }],
              },
              sheetStyle,
            ]}
          >
            <GlassSurface
              variant="prominent"
              radius={Radius.xxl}
              style={[
                styles.sheet,
                Shadows.medium,
              ]}
              contentStyle={styles.sheetContent}
            >
              {content}
            </GlassSurface>
          </Animated.View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
    justifyContent: "flex-end",
  },

  backdropBlur: {
    ...StyleSheet.absoluteFillObject,
  },

  backdropOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(2, 6, 12, 0.62)",
  },

  keyboardView: {
    flex: 1,
    justifyContent: "flex-end",
  },

  sheetWrapper: {
    width: "100%",
    paddingHorizontal: Spacing.sm,
    paddingBottom: Spacing.sm,
  },

  sheet: {
    flex: 1,
    backgroundColor: "rgba(12, 18, 27, 0.94)",
    borderColor: "rgba(255, 255, 255, 0.16)",
  },

  sheetContent: {
    flex: 1,
  },

  safeArea: {
    flex: 1,
  },

  dragArea: {
    minHeight: 32,
    alignItems: "center",
    justifyContent: "center",
  },

  handle: {
    width: 42,
    height: 4,
    borderRadius: Radius.pill,
    backgroundColor: Colors.borderStrong,
  },

  customHeader: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.lg,
  },

  header: {
    minHeight: 64,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.separator,
  },

  headerCopy: {
    flex: 1,
    alignItems: "flex-end",
    gap: Spacing.xs,
  },

  title: {
    ...Typography.sectionTitle,
    width: "100%",
    color: Colors.textPrimary,
    textAlign: "right",
    writingDirection: "rtl",
  },

  subtitle: {
    ...Typography.captionStyle,
    width: "100%",
    color: Colors.textSecondary,
    textAlign: "right",
    writingDirection: "rtl",
  },

  body: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },

  staticContent: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },

  footer: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.separator,
  },
});