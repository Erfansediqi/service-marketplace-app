import {
    useCallback,
    useEffect,
    useState,
} from "react";

import type { ProviderProfile } from "../types/provider";
import { getAllProviders } from "../services/provider-repository";

type UseProvidersResult = {
  providers: ProviderProfile[];
  isLoading: boolean;
  error: Error | null;
  refreshProviders: () => Promise<void>;
};

export function useProviders(): UseProvidersResult {
  const [providers, setProviders] =
    useState<ProviderProfile[]>([]);

  const [isLoading, setIsLoading] =
    useState(true);

  const [error, setError] =
    useState<Error | null>(null);

  const refreshProviders =
    useCallback(async (): Promise<void> => {
      setIsLoading(true);
      setError(null);

      try {
        const resolvedProviders =
          await getAllProviders();

        setProviders(
          resolvedProviders,
        );
      } catch (loadError) {
        setProviders([]);

        setError(
          loadError instanceof Error
            ? loadError
            : new Error(
                "Failed to load providers.",
              ),
        );
      } finally {
        setIsLoading(false);
      }
    }, []);

  useEffect(() => {
    let isMounted = true;

    const loadProviders =
      async (): Promise<void> => {
        setIsLoading(true);
        setError(null);

        try {
          const resolvedProviders =
            await getAllProviders();

          if (!isMounted) {
            return;
          }

          setProviders(
            resolvedProviders,
          );
        } catch (loadError) {
          if (!isMounted) {
            return;
          }

          setProviders([]);

          setError(
            loadError instanceof Error
              ? loadError
              : new Error(
                  "Failed to load providers.",
                ),
          );
        } finally {
          if (isMounted) {
            setIsLoading(false);
          }
        }
      };

    void loadProviders();

    return () => {
      isMounted = false;
    };
  }, []);

  return {
    providers,
    isLoading,
    error,
    refreshProviders,
  };
}