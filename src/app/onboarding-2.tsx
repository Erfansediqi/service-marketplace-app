import { useRouter } from 'expo-router';

import { OnboardingScreen } from '@/components/onboarding-screen';

export default function OnboardingScreenTwo() {
  const router = useRouter();

  return (
    <OnboardingScreen
      title="Every provider is verified"
      subtitle="ID checks, ratings and real reviews so you know who's coming to your door."
      icon="shield-checkmark-outline"
      iconColor="#EF4444"
      iconBackground="rgba(254, 226, 226, 0.72)"
      activePage={1}
      buttonLabel="Next"
      onPress={() => router.push('/onboarding-3')}
    />
  );
}