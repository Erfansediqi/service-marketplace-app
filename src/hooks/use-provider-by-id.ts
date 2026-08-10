import { useCallback, useEffect, useState } from "react";

import type { ProviderProfile } from "../data/providers";
import { getProviderById } from "../services/provider-repository";

type UseProviderByIdResult = {
  provider: ProviderProfile | null;
  isLoading: boolean;
  error: Error | null;
  refreshProvider: () => Promise<void>;
};

export function useProviderById(
  providerId: string | null | undefined,
): UseProviderByIdResult {
  const normalizedProviderId = providerId?.trim() ?? "";

  const [provider, setProvider] = useState<ProviderProfile | null>(null);

  const [isLoading, setIsLoading] = useState(true);

  const [error, setError] = useState<Error | null>(null);

  const refreshProvider = useCallback(async (): Promise<void> => {
    if (!normalizedProviderId) {
      setProvider(null);
      setError(new Error("Provider ID is required."));
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const resolvedProvider = await getProviderById(normalizedProviderId);

      if (!resolvedProvider) {
        setProvider(null);
        setError(
          new Error(`Provider "${normalizedProviderId}" was not found.`),
        );
        return;
      }

      setProvider(resolvedProvider);
    } catch (loadError) {
      setProvider(null);

      setError(
        loadError instanceof Error
          ? loadError
          : new Error("Failed to load provider profile."),
      );
    } finally {
      setIsLoading(false);
    }
  }, [normalizedProviderId]);

  useEffect(() => {
    void refreshProvider();
  }, [refreshProvider]);

  return {
    provider,
    isLoading,
    error,
    refreshProvider,
  };
}
