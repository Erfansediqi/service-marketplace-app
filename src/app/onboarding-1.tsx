import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
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

export default function OnboardingScreenOne() {
  const router = useRouter();

  const handleNext = () => {
    router.push('/onboarding-2');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.illustrationContainer}>
          <View style={styles.illustrationCircle}>
            <Ionicons
              name="sparkles-outline"
              size={48}
              color={Colors.secondary}
            />
          </View>
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.title}>Book any service in minutes</Text>

          <Text style={styles.subtitle}>
            Electricians, plumbers, cleaners and more — all verified and rated
            by your neighbours.
          </Text>
        </View>

        <View style={styles.paginationContainer}>
          <View style={[styles.dot, styles.activeDot]} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.nextButton}
          onPress={handleNext}
          activeOpacity={0.8}
        >
          <Text style={styles.nextButtonText}>Next</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xl,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  illustrationContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  illustrationCircle: {
    width: 180,
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 90,
    backgroundColor: '#E6F4EA',
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
    paddingHorizontal: Spacing.sm,
  },
  title: {
    marginBottom: 10,
    color: Colors.text,
    fontSize: Typography.title,
    fontWeight: '800',
    textAlign: 'center',
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: Typography.subtitle,
    lineHeight: 20,
    textAlign: 'center',
  },
  paginationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: Radius.pill,
    backgroundColor: Colors.border,
  },
  activeDot: {
    width: 24,
    backgroundColor: Colors.primary,
  },
  footer: {
    width: '100%',
    paddingBottom: 10,
  },
  nextButton: {
    alignItems: 'center',
    borderRadius: Radius.lg,
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    shadowColor: Colors.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  nextButtonText: {
    color: Colors.white,
    fontSize: Typography.button,
    fontWeight: '700',
  },
});