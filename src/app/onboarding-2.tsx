import { useRouter } from "expo-router";
import { OnboardingScreen } from "../components/onboarding-screen";
import { useLanguage } from "../context/languagecontext";

export default function OnboardingScreenTwo() {
  const router = useRouter();
  const { t } = useLanguage();

  return (
    <OnboardingScreen
      title={t("onboarding2Title")}
      subtitle={t("onboarding2Subtitle")}
      icon="construct-outline"
      activePage={1}
      buttonLabel={t("next")}
      onPress={() => router.push("/onboarding-3")}
    />
  );
}
