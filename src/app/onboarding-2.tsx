import { useRouter } from "expo-router";

import { OnboardingScreen } from "../components/onboarding-screen";

export default function OnboardingScreenTwo() {
  const router = useRouter();

  return (
    <OnboardingScreen
      title="تمام ارائه‌دهندگان خدمات تأیید شده‌اند"
      subtitle="بررسی هویت، امتیازها و نظرهای واقعی تا بدانید چه کسی به خانه‌تان می‌آید."
      icon="shield-checkmark-outline"
      activePage={1}
      buttonLabel="بعدی"
      onPress={() => router.push("/onboarding-3")}
    />
  );
}