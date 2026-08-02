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
  View,
} from "react-native";

import {
  Fonts,
  Spacing,
} from "../constants/theme";

const SPLASH_BACKGROUND = "#D6E8EE";

const BRAND_PRIMARY = "#001B48";
const BRAND_SECONDARY = "#02457A";
const BRAND_ACCENT = "#018ABE";
const BRAND_SOFT = "#97CADB";

const SCREEN_HEIGHT =
  Dimensions.get("window").height;

const BRAND_LETTERS =
  "KHEDMAT".split("");

const LANGUAGE_ROUTE_DELAY = 80;

/*
 * The uploaded Lottie composition is positioned
 * approximately 21 px right of the center of its
 * 480 px canvas.
 *
 * At a displayed width of 240 px, the proportional
 * correction is approximately -10.5 px.
 */
const LOTTIE_X_CORRECTION = -10.5;

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

  const [
    motionPreferenceLoaded,
    setMotionPreferenceLoaded,
  ] = useState(false);

  /*
   * Full-screen panel transition.
   */
  const panelTranslateY = useRef(
    new Animated.Value(0),
  ).current;

  /*
   * Wrench illustration entrance.
   */
  const illustrationOpacity = useRef(
    new Animated.Value(0),
  ).current;

  const illustrationScale = useRef(
    new Animated.Value(0.84),
  ).current;

  const illustrationTranslateY = useRef(
    new Animated.Value(18),
  ).current;

  /*
   * Completion pulse.
   */
  const pulseOpacity = useRef(
    new Animated.Value(0),
  ).current;

  const pulseScale = useRef(
    new Animated.Value(0.72),
  ).current;

  /*
   * Animated wordmark letters.
   */
  const letterAnimations = useRef(
    BRAND_LETTERS.map(
      () => new Animated.Value(0),
    ),
  ).current;

  /*
   * Decorative line under the wordmark.
   */
  const dividerScale = useRef(
    new Animated.Value(0),
  ).current;

  const dividerOpacity = useRef(
    new Animated.Value(0),
  ).current;

  /*
   * Subtitle animation.
   */
  const subtitleOpacity = useRef(
    new Animated.Value(0),
  ).current;

  const subtitleTranslateY = useRef(
    new Animated.Value(12),
  ).current;

  const navigateToLanguage =
    useCallback(() => {
      if (hasNavigatedRef.current) {
        return;
      }

      hasNavigatedRef.current = true;

      router.replace("/language");
    }, [router]);

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

        setTimeout(
          navigateToLanguage,
          LANGUAGE_ROUTE_DELAY,
        );
      });
    }, [
      navigateToLanguage,
      panelTranslateY,
      reduceMotion,
    ]);

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
          58,
          letterAnimations.map(
            (animation) =>
              Animated.spring(
                animation,
                {
                  toValue: 1,
                  damping: 13,
                  stiffness: 145,
                  mass: 0.62,
                  useNativeDriver: true,
                },
              ),
          ),
        );

      const brandSequence =
        Animated.sequence([
          /*
           * Pulse after the wrench finishes.
           */
          Animated.parallel([
            Animated.timing(
              pulseOpacity,
              {
                toValue: 0.28,
                duration: 150,
                easing: Easing.out(
                  Easing.cubic,
                ),
                useNativeDriver: true,
              },
            ),

            Animated.spring(
              pulseScale,
              {
                toValue: 1.2,
                damping: 8,
                stiffness: 155,
                mass: 0.58,
                useNativeDriver: true,
              },
            ),
          ]),

          Animated.parallel([
            Animated.timing(
              pulseOpacity,
              {
                toValue: 0,
                duration: 250,
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
                duration: 250,
                easing: Easing.out(
                  Easing.quad,
                ),
                useNativeDriver: true,
              },
            ),
          ]),

          /*
           * Uppercase KHEDMAT reveal.
           */
          revealLetters,

          /*
           * Decorative divider.
           */
          Animated.parallel([
            Animated.timing(
              dividerOpacity,
              {
                toValue: 1,
                duration: 260,
                easing: Easing.out(
                  Easing.cubic,
                ),
                useNativeDriver: true,
              },
            ),

            Animated.spring(
              dividerScale,
              {
                toValue: 1,
                damping: 12,
                stiffness: 135,
                mass: 0.65,
                useNativeDriver: true,
              },
            ),
          ]),

          /*
           * Subtitle reveal.
           */
          Animated.parallel([
            Animated.timing(
              subtitleOpacity,
              {
                toValue: 1,
                duration: 340,
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
                duration: 340,
                easing: Easing.out(
                  Easing.cubic,
                ),
                useNativeDriver: true,
              },
            ),
          ]),

          Animated.delay(650),

          /*
           * Lift the splash page upward.
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

          setTimeout(
            navigateToLanguage,
            LANGUAGE_ROUTE_DELAY,
          );
        },
      );
    }, [
      dividerOpacity,
      dividerScale,
      letterAnimations,
      navigateToLanguage,
      panelTranslateY,
      pulseOpacity,
      pulseScale,
      subtitleOpacity,
      subtitleTranslateY,
    ]);

  /*
   * Read reduced-motion accessibility settings.
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
   * Start the illustration and Lottie animation.
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

      dividerOpacity.setValue(1);
      dividerScale.setValue(1);

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
            duration: 300,
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
            mass: 0.72,
            useNativeDriver: true,
          },
        ),

        Animated.timing(
          illustrationTranslateY,
          {
            toValue: 0,
            duration: 360,
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
         * The uploaded animation uses frames
         * 0 through 23.
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
    dividerOpacity,
    dividerScale,
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
        barStyle="dark-content"
        backgroundColor={
          SPLASH_BACKGROUND
        }
      />

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

                      const translateY =
                        progress.interpolate(
                          {
                            inputRange: [
                              0,
                              1,
                            ],

                            outputRange: [
                              18,
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
                              0.86,
                              1,
                            ],
                          },
                        );

                      return (
                        <Animated.Text
                          key={`${letter}-${index}`}
                          style={[
                            styles.brandLetter,
                            {
                              opacity:
                                progress,

                              transform: [
                                {
                                  translateY,
                                },
                                {
                                  scale,
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

                <Animated.View
                  style={[
                    styles.brandDivider,
                    {
                      opacity:
                        dividerOpacity,

                      transform: [
                        {
                          scaleX:
                            dividerScale,
                        },
                      ],
                    },
                  ]}
                >
                  <View
                    style={
                      styles.dividerLine
                    }
                  />

                  <View
                    style={
                      styles.dividerDiamond
                    }
                  />

                  <View
                    style={
                      styles.dividerLine
                    }
                  />
                </Animated.View>

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
                  FIND TRUSTED HELP, NEAR YOU
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
    backgroundColor:
      SPLASH_BACKGROUND,
  },

  languageRevealBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor:
      SPLASH_BACKGROUND,
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
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 8,
  },

  animationArea: {
    width: 240,
    height: 240,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.lg,
  },

  completionPulse: {
    position: "absolute",
    width: 160,
    height: 160,
    borderRadius: 999,
    backgroundColor:
      "rgba(1, 138, 190, 0.18)",
  },

  /*
   * The negative horizontal translation corrects
   * the off-center artwork inside the source
   * Lottie canvas.
   */
  lottieAnimation: {
    width: 240,
    height: 240,
    transform: [
      {
        translateX:
          LOTTIE_X_CORRECTION,
      },
    ],
  },

  brandCopy: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },

  brandLetters: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "center",
  },

  brandLetter: {
    fontFamily: Fonts.bold,
    fontSize: 39,
    lineHeight: 47,
    fontWeight: "700",
    color: BRAND_PRIMARY,
    letterSpacing: 2.2,
  },

  brandDivider: {
    marginTop: Spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  dividerLine: {
    width: 54,
    height: 2,
    borderRadius: 999,
    backgroundColor:
      BRAND_SOFT,
  },

  dividerDiamond: {
    width: 12,
    height: 12,
    marginHorizontal: 10,
    borderWidth: 2,
    borderColor: BRAND_ACCENT,
    backgroundColor:
      SPLASH_BACKGROUND,
    transform: [
      {
        rotate: "45deg",
      },
    ],
  },

  brandSubtitle: {
    marginTop: Spacing.md,
    fontFamily: Fonts.medium,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "500",
    color: BRAND_SECONDARY,
    letterSpacing: 1.35,
    textAlign: "center",
  },
});