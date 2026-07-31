import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { ComponentProps } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  Colors,
  Radius,
  Spacing,
  Typography,
} from '@/constants/theme';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

type OnboardingScreenProps = {
  title: string;
  subtitle: string;
  icon: IoniconName;
  iconColor: string;
  iconBackground: string;
  activePage: 0 | 1 | 2;
  buttonLabel: string;
  onPress: () => void;
};

export function OnboardingScreen({
  title,
  subtitle,
  icon,
  iconColor,
  iconBackground,
  activePage,
  buttonLabel,
  onPress,
}: OnboardingScreenProps) {
  return (
    <LinearGradient
      colors={['#EEF2FF', '#F8FAFC', '#ECFDF5']}
      locations={[0, 0.52, 1]}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.safeArea}>
        <View pointerEvents="none" style={styles.backgroundDecoration}>
          <View style={[styles.orb, styles.purpleOrb]} />
          <View style={[styles.orb, styles.greenOrb]} />
          <View style={[styles.orb, styles.orangeOrb]} />
        </View>

        <View style={styles.container}>
          <View style={styles.content}>
            <BlurView intensity={55} tint="light" style={styles.glassCard}>
              <View
                style={[
                  styles.illustrationCircle,
                  { backgroundColor: iconBackground },
                ]}
              >
                <View style={styles.iconGlow}>
                  <Ionicons name={icon} size={54} color={iconColor} />
                </View>
              </View>

              <View style={styles.textContainer}>
                <Text style={styles.title}>{title}</Text>
                <Text style={styles.subtitle}>{subtitle}</Text>
              </View>

              <View style={styles.paginationGlass}>
                {[0, 1, 2].map((page) => (
                  <View
                    key={page}
                    style={[
                      styles.dot,
                      activePage === page && styles.activeDot,
                    ]}
                  />
                ))}
              </View>
            </BlurView>
          </View>

          <View style={styles.footer}>
            <TouchableOpacity
              activeOpacity={0.86}
              onPress={onPress}
              style={styles.buttonOuter}
            >
              <LinearGradient
                colors={['#7C6CF2', '#5B4BD8']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.button}
              >
                <Text style={styles.buttonText}>{buttonLabel}</Text>

                <View style={styles.buttonIcon}>
                  <Ionicons
                    name="arrow-forward"
                    size={18}
                    color={Colors.white}
                  />
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  backgroundDecoration: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  orb: {
    position: 'absolute',
    borderRadius: Radius.pill,
    opacity: 0.42,
  },
  purpleOrb: {
    width: 260,
    height: 260,
    top: -70,
    right: -90,
    backgroundColor: '#C4B5FD',
  },
  greenOrb: {
    width: 220,
    height: 220,
    bottom: 80,
    left: -100,
    backgroundColor: '#A7F3D0',
  },
  orangeOrb: {
    width: 150,
    height: 150,
    top: '38%',
    right: -75,
    backgroundColor: '#FDE68A',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  glassCard: {
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.34)',
    paddingHorizontal: Spacing.lg,
    paddingVertical: 44,
    shadowColor: '#64748B',
    shadowOffset: {
      width: 0,
      height: 18,
    },
    shadowOpacity: 0.16,
    shadowRadius: 28,
    elevation: 8,
  },
  illustrationCircle: {
    width: 176,
    height: 176,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.82)',
    borderRadius: 88,
    marginBottom: 38,
  },
  iconGlow: {
    width: 92,
    height: 92,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 46,
    backgroundColor: 'rgba(255, 255, 255, 0.54)',
  },
  textContainer: {
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
  },
  title: {
    color: Colors.text,
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.6,
    lineHeight: 34,
    textAlign: 'center',
  },
  subtitle: {
    maxWidth: 310,
    marginTop: Spacing.md,
    color: Colors.textSecondary,
    fontSize: Typography.body,
    lineHeight: 24,
    textAlign: 'center',
  },
  paginationGlass: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: 34,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.74)',
    borderRadius: Radius.pill,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: Radius.pill,
    backgroundColor: 'rgba(100, 116, 139, 0.25)',
  },
  activeDot: {
    width: 28,
    backgroundColor: Colors.primary,
  },
  footer: {
    paddingTop: Spacing.lg,
  },
  buttonOuter: {
    borderRadius: Radius.xl,
    shadowColor: Colors.primary,
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.34,
    shadowRadius: 18,
    elevation: 8,
  },
  button: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.48)',
    borderRadius: Radius.xl,
    paddingHorizontal: Spacing.lg,
  },
  buttonText: {
    color: Colors.white,
    fontSize: Typography.button,
    fontWeight: '700',
  },
  buttonIcon: {
    position: 'absolute',
    right: 18,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
  },
});