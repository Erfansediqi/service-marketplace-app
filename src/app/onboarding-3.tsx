import { useRouter } from "expo-router";

import { OnboardingScreen } from "../components/onboarding-screen";
import { useLanguage } from "../context/languagecontext";

export default function OnboardingScreenThree() {
  const router = useRouter();
  const { t } = useLanguage();

  return (
    <OnboardingScreen
      title={t("onboarding3Title")}
      subtitle={t("onboarding3Subtitle")}
      icon="shield-checkmark-outline"
      activePage={2}
      buttonLabel={t("continue")}
      onBack={() => router.back()}
      onPress={() =>
        router.push("/signup")
      }
    />
  );
}