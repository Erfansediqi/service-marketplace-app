import { useRouter } from "expo-router";

import { OnboardingScreen } from "../components/onboarding-screen";

export default function OnboardingScreenOne() {
  const router = useRouter();

  return (
    <OnboardingScreen
      title="هر خدمتی را در چند دقیقه رزرو کنید"
      subtitle="برق‌کار، لوله‌کش، نظافت‌چی و خدمات دیگر — همه بررسی‌شده و دارای امتیاز و نظر واقعی."
      icon="sparkles-outline"
      activePage={0}
      buttonLabel="بعدی"
      onPress={() => router.push("/onboarding-2")}
    />
  );
}