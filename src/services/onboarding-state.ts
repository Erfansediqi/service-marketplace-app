import { StorageService } from "./storage";

const ONBOARDING_COMPLETED_STORAGE_KEY =
  "@khedmat_onboarding_completed";

export async function hasCompletedOnboarding(): Promise<boolean> {
  const storedValue =
    await StorageService.get<unknown>(
      ONBOARDING_COMPLETED_STORAGE_KEY,
    );

  return storedValue === true;
}

export async function markOnboardingCompleted(): Promise<void> {
  await StorageService.save(
    ONBOARDING_COMPLETED_STORAGE_KEY,
    true,
  );
}
