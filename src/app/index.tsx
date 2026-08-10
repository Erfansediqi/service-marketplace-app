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
import { useSession } from "../context/session-context";
import { useSupabaseAuth } from "../context/supabase-auth-context";
import {
  hasCompletedOnboarding,
  markOnboardingCompleted,
} from "../services/onboarding-state";
import { resolvePostLoginWorkspace } from "../services/post-login-workspace-resolver";

const SPLASH_BACKGROUND = "#D6E8EE";

const REVEAL_DURATION = 700;
const REDUCED_MOTION_REVEAL_DURATION = 180;
const HOLD_DURATION = 1150;
const EXIT_DURATION = 420;

export default function SplashScreen() {
  const router = useRouter();

  const {
    user,
    isHydrated: authIsHydrated,
  } = useSupabaseAuth();

  const {
    defaultProviderId,
    lastWorkspaceRole,
    lastProviderId,
    enterCustomerWorkspace,
    enterProviderWorkspace,
    isHydrated: sessionIsHydrated,
  } = useSession();

  const [
    onboardingCompleted,
    setOnboardingCompleted,
  ] = useState<boolean | null>(
    null,
  );

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

  const [
    splashAnimationFinished,
    setSplashAnimationFinished,
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

  useEffect(() => {
    let isMounted = true;

    void hasCompletedOnboarding()
      .then((completed) => {
        if (isMounted) {
          setOnboardingCompleted(
            completed,
          );
        }
      })
      .catch((error) => {
        console.error(
          "Failed to read onboarding state:",
          error,
        );

        if (isMounted) {
          setOnboardingCompleted(
            false,
          );
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const navigateAfterSplash =
    useCallback(async (): Promise<void> => {
      if (
        hasNavigatedRef.current ||
        !authIsHydrated ||
        !sessionIsHydrated ||
        onboardingCompleted === null
      ) {
        return;
      }

      hasNavigatedRef.current = true;

      if (!user) {
        router.replace(
          onboardingCompleted
            ? "/login"
            : "/language",
        );

        return;
      }

      if (!onboardingCompleted) {
        try {
          await markOnboardingCompleted();

          setOnboardingCompleted(
            true,
          );
        } catch (error) {
          console.warn(
            "Authenticated user could not be migrated to completed onboarding state:",
            error,
          );
        }
      }

      const workspace =
        await resolvePostLoginWorkspace({
          userId: user.id,
          lastWorkspaceRole,
          lastProviderId,
          defaultProviderId,
        });

      if (
        workspace.role ===
        "provider"
      ) {
        enterProviderWorkspace(
          workspace.providerId,
        );

        router.replace(
          "/(provider-tabs)",
        );

        return;
      }

      enterCustomerWorkspace();

      router.replace(
        "/(tabs)",
      );
    }, [
      authIsHydrated,
      defaultProviderId,
      enterCustomerWorkspace,
      enterProviderWorkspace,
      lastProviderId,
      lastWorkspaceRole,
      onboardingCompleted,
      router,
      sessionIsHydrated,
      user,
    ]);

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
        setSplashAnimationFinished(
          true,
        );
      }
    });

    return () => {
      animationRef.current?.stop();
    };
  }, [
    artworkOpacity,
    artworkScale,
    motionPreferenceLoaded,
    navigateAfterSplash,
    reduceMotion,
    screenOpacity,
  ]);

  useEffect(() => {
    if (
      !splashAnimationFinished
    ) {
      return;
    }

    void navigateAfterSplash();
  }, [
    navigateAfterSplash,
    splashAnimationFinished,
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
