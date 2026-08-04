import {
    useEffect,
    useState,
} from "react";

import { useSession } from "../context/session-context";
import type { ProviderProfile } from "../data/providers";
import { getProviderById } from "../services/provider-repository";

type UseActiveProviderResult = {
  provider: ProviderProfile | null;
  isLoading: boolean;
  error: Error | null;
};

export function useActiveProvider(): UseActiveProviderResult {
  const { activeProviderId } =
    useSession();

  const [provider, setProvider] =
    useState<ProviderProfile | null>(
      null,
    );

  const [isLoading, setIsLoading] =
    useState(true);

  const [error, setError] =
    useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadProvider =
      async (): Promise<void> => {
        if (!activeProviderId) {
          if (isMounted) {
            setProvider(null);
            setError(
              new Error(
                "No active provider session.",
              ),
            );
            setIsLoading(false);
          }

          return;
        }

        setIsLoading(true);
        setError(null);

        try {
          const resolvedProvider =
            await getProviderById(
              activeProviderId,
            );

          if (!isMounted) {
            return;
          }

          if (!resolvedProvider) {
            setProvider(null);
            setError(
              new Error(
                `Provider "${activeProviderId}" was not found.`,
              ),
            );

            return;
          }

          setProvider(
            resolvedProvider,
          );
        } catch (loadError) {
          if (!isMounted) {
            return;
          }

          setProvider(null);

          setError(
            loadError instanceof Error
              ? loadError
              : new Error(
                  "Failed to load active provider.",
                ),
          );
        } finally {
          if (isMounted) {
            setIsLoading(false);
          }
        }
      };

    void loadProvider();

    return () => {
      isMounted = false;
    };
  }, [activeProviderId]);

  return {
    provider,
    isLoading,
    error,
  };
}