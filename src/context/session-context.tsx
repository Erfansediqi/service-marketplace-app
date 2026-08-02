import {
  type PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { StorageService } from "../services/storage";

export type UserRole =
  | "customer"
  | "provider";

type PersistedSession = {
  version: 1;
  role: UserRole;
  activeProviderId: string | null;
};

type SessionContextValue = {
  role: UserRole;
  activeProviderId: string | null;
  isHydrated: boolean;

  setRole: (role: UserRole) => void;
  setActiveProviderId: (
    providerId: string | null,
  ) => void;

  enterCustomerWorkspace: () => void;
  enterProviderWorkspace: (
    providerId: string,
  ) => void;

  resetSession: () => void;
};

const SESSION_STORAGE_KEY =
  "@khedmat_session";

const DEFAULT_SESSION: PersistedSession = {
  version: 1,
  role: "customer",
  activeProviderId: null,
};

const SessionContext =
  createContext<SessionContextValue | null>(
    null,
  );

function isUserRole(
  value: unknown,
): value is UserRole {
  return (
    value === "customer" ||
    value === "provider"
  );
}

function normalizeProviderId(
  value: unknown,
): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalizedValue = value.trim();

  return normalizedValue.length > 0
    ? normalizedValue
    : null;
}

function normalizeStoredSession(
  value: unknown,
): PersistedSession {
  if (
    typeof value !== "object" ||
    value === null
  ) {
    return DEFAULT_SESSION;
  }

  const candidate =
    value as Partial<PersistedSession>;

  if (!isUserRole(candidate.role)) {
    return DEFAULT_SESSION;
  }

  const activeProviderId =
    normalizeProviderId(
      candidate.activeProviderId,
    );

  /*
   * A provider session without a provider identity
   * is not valid. Fall back to the safe customer
   * workspace instead of exposing provider data
   * through an arbitrary default provider.
   */
  if (
    candidate.role === "provider" &&
    !activeProviderId
  ) {
    return DEFAULT_SESSION;
  }

  return {
    version: 1,
    role: candidate.role,
    activeProviderId:
      candidate.role === "provider"
        ? activeProviderId
        : null,
  };
}

export function SessionProvider({
  children,
}: PropsWithChildren) {
  const [role, setRoleState] =
    useState<UserRole>(
      DEFAULT_SESSION.role,
    );

  const [
    activeProviderId,
    setActiveProviderIdState,
  ] = useState<string | null>(
    DEFAULT_SESSION.activeProviderId,
  );

  const [isHydrated, setIsHydrated] =
    useState(false);

  useEffect(() => {
    let isMounted = true;

    const hydrateSession = async () => {
      try {
        const storedSession =
          await StorageService.get<unknown>(
            SESSION_STORAGE_KEY,
          );

        if (!isMounted) {
          return;
        }

        const normalizedSession =
          normalizeStoredSession(
            storedSession,
          );

        setRoleState(
          normalizedSession.role,
        );

        setActiveProviderIdState(
          normalizedSession.activeProviderId,
        );
      } catch (error) {
        console.error(
          "Failed to hydrate the session:",
          error,
        );
      } finally {
        if (isMounted) {
          setIsHydrated(true);
        }
      }
    };

    void hydrateSession();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    const persistSession = async () => {
      const session: PersistedSession = {
        version: 1,
        role,
        activeProviderId:
          role === "provider"
            ? activeProviderId
            : null,
      };

      try {
        await StorageService.save(
          SESSION_STORAGE_KEY,
          session,
        );
      } catch (error) {
        console.error(
          "Failed to persist the session:",
          error,
        );
      }
    };

    void persistSession();
  }, [
    activeProviderId,
    isHydrated,
    role,
  ]);

  const setRole = useCallback(
    (nextRole: UserRole) => {
      setRoleState(nextRole);

      if (nextRole === "customer") {
        setActiveProviderIdState(null);
      }
    },
    [],
  );

  const setActiveProviderId =
    useCallback(
      (
        providerId: string | null,
      ) => {
        setActiveProviderIdState(
          normalizeProviderId(
            providerId,
          ),
        );
      },
      [],
    );

  const enterCustomerWorkspace =
    useCallback(() => {
      setRoleState("customer");
      setActiveProviderIdState(null);
    }, []);

  const enterProviderWorkspace =
    useCallback(
      (providerId: string) => {
        const normalizedProviderId =
          normalizeProviderId(
            providerId,
          );

        if (!normalizedProviderId) {
          console.error(
            "Cannot enter the provider workspace without a valid provider ID.",
          );

          return;
        }

        setRoleState("provider");

        setActiveProviderIdState(
          normalizedProviderId,
        );
      },
      [],
    );

  const resetSession =
    useCallback(() => {
      setRoleState(
        DEFAULT_SESSION.role,
      );

      setActiveProviderIdState(
        DEFAULT_SESSION.activeProviderId,
      );
    }, []);

  const value =
    useMemo<SessionContextValue>(
      () => ({
        role,
        activeProviderId,
        isHydrated,
        setRole,
        setActiveProviderId,
        enterCustomerWorkspace,
        enterProviderWorkspace,
        resetSession,
      }),
      [
        activeProviderId,
        enterCustomerWorkspace,
        enterProviderWorkspace,
        isHydrated,
        resetSession,
        role,
        setActiveProviderId,
        setRole,
      ],
    );

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession(): SessionContextValue {
  const context =
    useContext(SessionContext);

  if (!context) {
    throw new Error(
      "useSession must be used inside SessionProvider.",
    );
  }

  return context;
}