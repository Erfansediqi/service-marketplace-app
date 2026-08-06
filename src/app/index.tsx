import { useRouter } from "expo-router";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  AccessibilityInfo,
  Animated,
  Easing,
  StatusBar,
  StyleSheet,
  View,
} from "react-native";

import KhedmatOpening from "../../assets/images/khedmat-opening.svg";

const SPLASH_BACKGROUND = "#D6E8EE";

const REVEAL_DURATION = 700;
const REDUCED_MOTION_REVEAL_DURATION = 180;
const HOLD_DURATION = 1150;
const EXIT_DURATION = 420;

export default function SplashScreen() {
  const router = useRouter();

  const hasNavigatedRef =
    useRef(false);

  const animationRef =
    useRef<Animated.CompositeAnimation | null>(
      null,
    );

  const [reduceMotion, setReduceMotion] =
    useState(false);

  const [
    motionPreferenceLoaded,
    setMotionPreferenceLoaded,
  ] = useState(false);

  const artworkOpacity = useRef(
    new Animated.Value(0),
  ).current;

  const artworkScale = useRef(
    new Animated.Value(1.04),
  ).current;

  const screenOpacity = useRef(
    new Animated.Value(1),
  ).current;

  const navigateToLanguage =
    useCallback((): void => {
      if (hasNavigatedRef.current) {
        return;
      }

      hasNavigatedRef.current = true;

      router.replace("/language");
    }, [router]);

  useEffect(() => {
    let isMounted = true;

    AccessibilityInfo
      .isReduceMotionEnabled()
      .then((enabled) => {
        if (!isMounted) {
          return;
        }

        setReduceMotion(enabled);
        setMotionPreferenceLoaded(true);
      })
      .catch(() => {
        if (isMounted) {
          setMotionPreferenceLoaded(true);
        }
      });

    const subscription =
      AccessibilityInfo.addEventListener(
        "reduceMotionChanged",
        (enabled) => {
          setReduceMotion(enabled);
        },
      );

    return () => {
      isMounted = false;
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    if (!motionPreferenceLoaded) {
      return;
    }

    artworkOpacity.setValue(0);
    artworkScale.setValue(
      reduceMotion ? 1 : 1.04,
    );
    screenOpacity.setValue(1);

    const sequence =
      Animated.sequence([
        Animated.parallel([
          Animated.timing(
            artworkOpacity,
            {
              toValue: 1,
              duration: reduceMotion
                ? REDUCED_MOTION_REVEAL_DURATION
                : REVEAL_DURATION,
              easing: Easing.out(
                Easing.cubic,
              ),
              useNativeDriver: true,
            },
          ),

          Animated.timing(
            artworkScale,
            {
              toValue: 1,
              duration: reduceMotion
                ? REDUCED_MOTION_REVEAL_DURATION
                : REVEAL_DURATION,
              easing: Easing.out(
                Easing.cubic,
              ),
              useNativeDriver: true,
            },
          ),
        ]),

        Animated.delay(
          reduceMotion
            ? 700
            : HOLD_DURATION,
        ),

        Animated.timing(
          screenOpacity,
          {
            toValue: 0,
            duration: reduceMotion
              ? 160
              : EXIT_DURATION,
            easing: Easing.inOut(
              Easing.cubic,
            ),
            useNativeDriver: true,
          },
        ),
      ]);

    animationRef.current = sequence;

    sequence.start(({ finished }) => {
      if (finished) {
        navigateToLanguage();
      }
    });

    return () => {
      animationRef.current?.stop();
    };
  }, [
    artworkOpacity,
    artworkScale,
    motionPreferenceLoaded,
    navigateToLanguage,
    reduceMotion,
    screenOpacity,
  ]);

  return (
    <View style={styles.root}>
      <StatusBar
        translucent
        barStyle="dark-content"
        backgroundColor="transparent"
      />

      <Animated.View
        style={[
          styles.splash,
          {
            opacity: screenOpacity,
          },
        ]}
      >
        <Animated.View
          style={[
            styles.artworkContainer,
            {
              opacity:
                artworkOpacity,

              transform: [
                {
                  scale:
                    artworkScale,
                },
              ],
            },
          ]}
        >
          <KhedmatOpening
            width="100%"
            height="100%"
            preserveAspectRatio="xMidYMid slice"
          />
        </Animated.View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor:
      SPLASH_BACKGROUND,
  },

  splash: {
    flex: 1,
    backgroundColor:
      SPLASH_BACKGROUND,
  },

  artworkContainer: {
    ...StyleSheet.absoluteFillObject,
  },
});
