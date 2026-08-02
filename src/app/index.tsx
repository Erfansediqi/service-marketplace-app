import { useRouter } from "expo-router";
import LottieView from "lottie-react-native";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  AccessibilityInfo,
  Animated,
  Dimensions,
  Easing,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  View
} from "react-native";

import {
  Fonts,
  Spacing,
  Typography,
} from "../constants/theme";

const SPLASH_BACKGROUND = "#24A8AF";

const SCREEN_HEIGHT =
  Dimensions.get("window").height;

const BRAND_LETTERS =
  "Khedmat".split("");

const LANGUAGE_ROUTE_DELAY = 80;

export default function SplashScreen() {
  const router = useRouter();

  const lottieRef =
    useRef<LottieView>(null);

  const hasNavigatedRef =
    useRef(false);

  const transitionStartedRef =
    useRef(false);

  const animationRef =
    useRef<Animated.CompositeAnimation | null>(
      null,
    );

  const [reduceMotion, setReduceMotion] =
    useState(false);

  const [motionPreferenceLoaded, setMotionPreferenceLoaded] =
    useState(false);

  /*
   * The entire teal splash panel moves upward
   * before Expo Router opens the language page.
   */
  const panelTranslateY = useRef(
    new Animated.Value(0),
  ).current;

  /*
   * Lottie entrance animation.
   */
  const illustrationOpacity = useRef(
    new Animated.Value(0),
  ).current;

  const illustrationScale = useRef(
    new Animated.Value(0.82),
  ).current;

  const illustrationTranslateY = useRef(
    new Animated.Value(18),
  ).current;

  /*
   * Small confirmation pulse after the wrench
   * finishes tightening the nut.
   */
  const pulseOpacity = useRef(
    new Animated.Value(0),
  ).current;

  const pulseScale = useRef(
    new Animated.Value(0.7),
  ).current;

  /*
   * Each title letter reveals independently.
   */
  const letterAnimations = useRef(
    BRAND_LETTERS.map(
      () => new Animated.Value(0),
    ),
  ).current;

  /*
   * Subtitle follows the title.
   */
  const subtitleOpacity = useRef(
    new Animated.Value(0),
  ).current;

  const subtitleTranslateY = useRef(
    new Animated.Value(12),
  ).current;

  /*
   * Navigates only once, even if callbacks fire
   * more than once during fast refresh.
   */
  const navigateToLanguage =
    useCallback(() => {
      if (hasNavigatedRef.current) {
        return;
      }

      hasNavigatedRef.current = true;

      router.replace("/language");
    }, [router]);

  /*
   * Final upward transition.
   */
  const liftSplashPanel =
    useCallback(() => {
      if (transitionStartedRef.current) {
        return;
      }

      transitionStartedRef.current = true;

      Animated.timing(
        panelTranslateY,
        {
          toValue: -SCREEN_HEIGHT,
          duration: reduceMotion
            ? 180
            : 620,
          easing: Easing.inOut(
            Easing.cubic,
          ),
          useNativeDriver: true,
        },
      ).start(({ finished }) => {
        if (!finished) {
          return;
        }

        const navigationTimer =
          setTimeout(
            navigateToLanguage,
            LANGUAGE_ROUTE_DELAY,
          );

        return () =>
          clearTimeout(
            navigationTimer,
          );
      });
    }, [
      navigateToLanguage,
      panelTranslateY,
      reduceMotion,
    ]);

  /*
   * Reveal the brand after the wrench animation
   * completes.
   */
  const revealBrand =
    useCallback(() => {
      if (
        transitionStartedRef.current ||
        hasNavigatedRef.current
      ) {
        return;
      }

      const revealLetters =
        Animated.stagger(
          65,
          letterAnimations.map(
            (animation) =>
              Animated.spring(
                animation,
                {
                  toValue: 1,
                  damping: 13,
                  stiffness: 145,
                  mass: 0.65,
                  useNativeDriver: true,
                },
              ),
          ),
        );

      const brandSequence =
        Animated.sequence([
          /*
           * Brief completion pulse behind
           * the animation.
           */
          Animated.parallel([
            Animated.timing(
              pulseOpacity,
              {
                toValue: 0.24,
                duration: 160,
                easing: Easing.out(
                  Easing.cubic,
                ),
                useNativeDriver: true,
              },
            ),

            Animated.spring(
              pulseScale,
              {
                toValue: 1.25,
                damping: 8,
                stiffness: 150,
                mass: 0.6,
                useNativeDriver: true,
              },
            ),
          ]),

          Animated.parallel([
            Animated.timing(
              pulseOpacity,
              {
                toValue: 0,
                duration: 260,
                easing: Easing.out(
                  Easing.quad,
                ),
                useNativeDriver: true,
              },
            ),

            Animated.timing(
              pulseScale,
              {
                toValue: 1.55,
                duration: 260,
                easing: Easing.out(
                  Easing.quad,
                ),
                useNativeDriver: true,
              },
            ),
          ]),

          /*
           * Khedmat reveals one letter at a time.
           */
          revealLetters,

          /*
           * Subtitle rises gently into place.
           */
          Animated.parallel([
            Animated.timing(
              subtitleOpacity,
              {
                toValue: 1,
                duration: 360,
                easing: Easing.out(
                  Easing.cubic,
                ),
                useNativeDriver: true,
              },
            ),

            Animated.timing(
              subtitleTranslateY,
              {
                toValue: 0,
                duration: 360,
                easing: Easing.out(
                  Easing.cubic,
                ),
                useNativeDriver: true,
              },
            ),
          ]),

          Animated.delay(650),

          /*
           * Lift the teal page and reveal the
           * language screen color underneath.
           */
          Animated.timing(
            panelTranslateY,
            {
              toValue: -SCREEN_HEIGHT,
              duration: 620,
              easing: Easing.inOut(
                Easing.cubic,
              ),
              useNativeDriver: true,
            },
          ),
        ]);

      animationRef.current =
        brandSequence;

      brandSequence.start(
        ({ finished }) => {
          if (!finished) {
            return;
          }

          const navigationTimer =
            setTimeout(
              navigateToLanguage,
              LANGUAGE_ROUTE_DELAY,
            );

          return () =>
            clearTimeout(
              navigationTimer,
            );
        },
      );
    }, [
      letterAnimations,
      navigateToLanguage,
      panelTranslateY,
      pulseOpacity,
      pulseScale,
      subtitleOpacity,
      subtitleTranslateY,
    ]);

  /*
   * Read the user's reduced-motion preference.
   */
  useEffect(() => {
    let mounted = true;

    AccessibilityInfo
      .isReduceMotionEnabled()
      .then((enabled) => {
        if (!mounted) {
          return;
        }

        setReduceMotion(enabled);
        setMotionPreferenceLoaded(true);
      })
      .catch(() => {
        if (mounted) {
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
      mounted = false;
      subscription.remove();
    };
  }, []);

  /*
   * Start either the complete motion experience
   * or the accessibility-friendly alternative.
   */
  useEffect(() => {
    if (!motionPreferenceLoaded) {
      return;
    }

    if (reduceMotion) {
      illustrationOpacity.setValue(1);
      illustrationScale.setValue(1);
      illustrationTranslateY.setValue(0);

      letterAnimations.forEach(
        (animation) => {
          animation.setValue(1);
        },
      );

      subtitleOpacity.setValue(1);
      subtitleTranslateY.setValue(0);

      const timer = setTimeout(
        liftSplashPanel,
        1200,
      );

      return () => {
        clearTimeout(timer);
      };
    }

    const illustrationEntrance =
      Animated.parallel([
        Animated.timing(
          illustrationOpacity,
          {
            toValue: 1,
            duration: 320,
            easing: Easing.out(
              Easing.cubic,
            ),
            useNativeDriver: true,
          },
        ),

        Animated.spring(
          illustrationScale,
          {
            toValue: 1,
            damping: 11,
            stiffness: 125,
            mass: 0.75,
            useNativeDriver: true,
          },
        ),

        Animated.timing(
          illustrationTranslateY,
          {
            toValue: 0,
            duration: 380,
            easing: Easing.out(
              Easing.cubic,
            ),
            useNativeDriver: true,
          },
        ),
      ]);

    animationRef.current =
      illustrationEntrance;

    illustrationEntrance.start(
      ({ finished }) => {
        if (!finished) {
          return;
        }

        /*
         * Play frames 0–23 from the uploaded
         * wrench-and-nut Lottie once.
         */
        lottieRef.current?.play(
          0,
          23,
        );
      },
    );

    return () => {
      animationRef.current?.stop();
      lottieRef.current?.reset();
    };
  }, [
    illustrationOpacity,
    illustrationScale,
    illustrationTranslateY,
    letterAnimations,
    liftSplashPanel,
    motionPreferenceLoaded,
    reduceMotion,
    subtitleOpacity,
    subtitleTranslateY,
  ]);

  return (
    <View style={styles.root}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={
          SPLASH_BACKGROUND
        }
      />

      {/*
       * This matches the redesigned language
       * screen background and is exposed when
       * the teal panel lifts.
       */}
      <View
        style={
          styles.languageRevealBackground
        }
      />

      <Animated.View
        style={[
          styles.splashPanel,
          {
            transform: [
              {
                translateY:
                  panelTranslateY,
              },
            ],
          },
        ]}
      >
        <SafeAreaView
          style={styles.safeArea}
        >
          <View style={styles.container}>
            <View
              style={
                styles.centerContent
              }
            >
              <Animated.View
                style={[
                  styles.animationArea,
                  {
                    opacity:
                      illustrationOpacity,

                    transform: [
                      {
                        translateY:
                          illustrationTranslateY,
                      },
                      {
                        scale:
                          illustrationScale,
                      },
                    ],
                  },
                ]}
              >
                <Animated.View
                  pointerEvents="none"
                  style={[
                    styles.completionPulse,
                    {
                      opacity:
                        pulseOpacity,

                      transform: [
                        {
                          scale:
                            pulseScale,
                        },
                      ],
                    },
                  ]}
                />

                <LottieView
                  ref={lottieRef}
                  source={require(
                    "../../assets/animations/PipeWrench.json"
                  )}
                  autoPlay={false}
                  loop={false}
                  speed={1}
                  resizeMode="contain"
                  onAnimationFinish={
                    revealBrand
                  }
                  style={
                    styles.lottieAnimation
                  }
                />
              </Animated.View>

              <View
                style={styles.brandCopy}
              >
                <View
                  accessibilityRole="header"
                  accessibilityLabel="Khedmat"
                  style={
                    styles.brandLetters
                  }
                >
                  {BRAND_LETTERS.map(
                    (
                      letter,
                      index,
                    ) => {
                      const progress =
                        letterAnimations[
                          index
                        ];

                      const opacity =
                        progress;

                      const translateY =
                        progress.interpolate(
                          {
                            inputRange: [
                              0,
                              1,
                            ],

                            outputRange: [
                              20,
                              0,
                            ],
                          },
                        );

                      const scale =
                        progress.interpolate(
                          {
                            inputRange: [
                              0,
                              1,
                            ],

                            outputRange: [
                              0.84,
                              1,
                            ],
                          },
                        );

                      const rotation =
                        progress.interpolate(
                          {
                            inputRange: [
                              0,
                              1,
                            ],

                            outputRange: [
                              "5deg",
                              "0deg",
                            ],
                          },
                        );

                      return (
                        <Animated.Text
                          key={`${letter}-${index}`}
                          style={[
                            styles.brandLetter,
                            {
                              opacity,

                              transform: [
                                {
                                  translateY,
                                },
                                {
                                  scale,
                                },
                                {
                                  rotate:
                                    rotation,
                                },
                              ],
                            },
                          ]}
                        >
                          {letter}
                        </Animated.Text>
                      );
                    },
                  )}
                </View>

                <Animated.Text
                  style={[
                    styles.brandSubtitle,
                    {
                      opacity:
                        subtitleOpacity,

                      transform: [
                        {
                          translateY:
                            subtitleTranslateY,
                        },
                      ],
                    },
                  ]}
                >
                  Find trusted help, near you
                </Animated.Text>
              </View>
            </View>
          </View>
        </SafeAreaView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#D6E8EE",
  },

  languageRevealBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#D6E8EE",
  },

  splashPanel: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor:
      SPLASH_BACKGROUND,
  },

  safeArea: {
    flex: 1,
    backgroundColor:
      SPLASH_BACKGROUND,
  },

  container: {
    flex: 1,
    paddingHorizontal:
      Spacing.xl,
    backgroundColor:
      SPLASH_BACKGROUND,
  },

  centerContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 12,
  },

  animationArea: {
    width: 220,
    height: 220,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
  },

  completionPulse: {
    position: "absolute",
    width: 150,
    height: 150,
    borderRadius: 999,
    backgroundColor:
      "rgba(255, 255, 255, 0.36)",
  },

  lottieAnimation: {
    width: 220,
    height: 220,
  },

  brandCopy: {
    alignItems: "center",
    justifyContent: "center",
  },

  brandLetters: {
    minHeight: 56,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "center",
  },

  brandLetter: {
    fontFamily: Fonts.bold,
    fontSize: 42,
    lineHeight: 50,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: -0.45,
  },

  brandSubtitle: {
    ...Typography.bodyLarge,
    marginTop: Spacing.xs,
    color: "#FFFFFF",
    textAlign: "center",
    fontFamily: Fonts.medium,
    fontWeight: "500",
  },
});