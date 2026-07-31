import { useRouter } from 'expo-router';

import { OnboardingScreen } from '@/components/onboarding-screen';

export default function OnboardingScreenOne() {
  const router = useRouter();

  return (
    <OnboardingScreen
      title="Book any service in minutes"
      subtitle="Electricians, plumbers, cleaners and more — all verified and rated by your neighbours."
      icon="sparkles-outline"
      iconColor="#00A97F"
      iconBackground="rgba(209, 250, 229, 0.66)"
      activePage={0}
      buttonLabel="Next"
      onPress={() => router.push('/onboarding-2')}
    />
  );
}