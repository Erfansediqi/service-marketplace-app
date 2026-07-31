import { useRouter } from "expo-router";

import { OnboardingScreen } from "../components/onboarding-screen";

export default function OnboardingScreenThree() {
  const router = useRouter();

  return (
    <OnboardingScreen
      title="در وقت و انرژی صرفه‌جویی کنید"
      subtitle="رزروهای خود را مدیریت کنید، با متخصصان گفتگو کنید و کارهایتان را آسان‌تر انجام دهید."
      icon="time-outline"
      activePage={2}
      buttonLabel="شروع"
      onPress={() => router.push("/signup")}
    />
  );
}