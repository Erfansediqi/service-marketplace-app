import { useRouter } from 'expo-router';

import { OnboardingScreen } from '@/components/onboarding-screen';

export default function OnboardingScreenThree() {
  const router = useRouter();

  return (
    <OnboardingScreen
      title="Save time & effort"
      subtitle="Manage bookings, chat with professionals, and get your tasks done effortlessly while you relax."
      icon="time-outline"
      iconColor="#D97706"
      iconBackground="rgba(254, 243, 199, 0.74)"
      activePage={2}
      buttonLabel="Get Started"
      onPress={() => router.push('/signup')}
    />
  );
}