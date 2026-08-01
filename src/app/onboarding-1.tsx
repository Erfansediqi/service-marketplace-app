import { useRouter } from "expo-router";

import { OnboardingScreen } from "../components/onboarding-screen";
import { useLanguage } from "../context/languagecontext";

export default function OnboardingScreenOne() {
  const router = useRouter();
  const { t } = useLanguage();

  return (
    <OnboardingScreen
      title={t("onboarding1Title")}
      subtitle={t("onboarding1Subtitle")}
      icon="search-outline"
      activePage={0}
      buttonLabel={t("next")}
      onBack={() => router.back()}
      onPress={() =>
        router.push("/onboarding-2")
      }
    />
  );
}