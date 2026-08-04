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

type PersistedSessionV1 = {
  version: 1;
  role: UserRole;
  activeProviderId: string | null;
};

type PersistedSessionV2 = {
  version: 2;
  role: UserRole;

  /*
   * Version 2 preserved the most recently opened
   * provider while the customer workspace was active.
   */
  lastProviderId: string | null;
};

type PersistedSessionV3 = {
  version: 3;
  role: UserRole;

  /*
   * The provider workspace most recently opened.
   */
  lastProviderId: string | null;

  /*
   * The provider account explicitly selected as the
   * preferred/default account.
   */
  defaultProviderId: string | null;
};

type NormalizedSession = {
  role: UserRole;
  activeProviderId: string | null;
  defaultProviderId: string | null;
};

type SessionContextValue = {
  role: UserRole;

  /**
   * The most recently opened local provider account.
   *
   * This may remain populated while the customer
   * workspace is active so the UI can show "Last used".
   */
  activeProviderId: string | null;

  /**
   * The provider account explicitly selected as the
   * preferred/default account.
   */
  defaultProviderId: string | null;

  isHydrated: boolean;

  setRole: (
    role: UserRole,
  ) => void;

  setActiveProviderId: (
    providerId: string | null,
  ) => void;

  setDefaultProviderId: (
    providerId: string | null,
  ) => void;

  enterCustomerWorkspace:
    () => void;

  enterProviderWorkspace: (
    providerId: string,
  ) => void;

  /**
   * Clears only the active provider association so
   * another provider account can be registered.
   * Existing provider accounts, bookings, and the
   * default-provider preference remain stored.
   */
  beginProviderRegistration:
    () => void;

  /**
   * Ends the current workspace session.
   *
   * Saved provider profiles and the explicit default
   * provider preference remain stored on the device.
   */
  resetSession: () => void;
};

const SESSION_STORAGE_KEY =
  "@khedmat_session";

const DEFAULT_SESSION: NormalizedSession = {
  role: "customer",
  activeProviderId: null,
  defaultProviderId: null,
};

const SessionContext =
  createContext<SessionContextValue | null>(
    null,
  );

function isObject(
  value: unknown,
): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null
  );
}

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

  const normalizedValue =
    value.trim();

  return normalizedValue.length > 0
    ? normalizedValue
    : null;
}

function normalizeStoredSession(
  value: unknown,
): NormalizedSession {
  if (!isObject(value)) {
    return DEFAULT_SESSION;
  }

  const role = isUserRole(
    value.role,
  )
    ? value.role
    : DEFAULT_SESSION.role;

  if (value.version === 3) {
    const activeProviderId =
      normalizeProviderId(
        value.lastProviderId,
      );

    const defaultProviderId =
      normalizeProviderId(
        value.defaultProviderId,
      );

    /*
     * A provider workspace cannot be active without a
     * valid provider ID. Fall back to customer mode
     * while preserving the default preference.
     */
    if (
      role === "provider" &&
      !activeProviderId
    ) {
      return {
        role: "customer",
        activeProviderId: null,
        defaultProviderId,
      };
    }

    return {
      role,
      activeProviderId,
      defaultProviderId,
    };
  }

  /*
   * Version 2 had no explicit default provider.
   * Do not silently turn "last used" into "default".
   */
  if (value.version === 2) {
    const activeProviderId =
      normalizeProviderId(
        value.lastProviderId,
      );

    if (
      role === "provider" &&
      !activeProviderId
    ) {
      return {
        role: "customer",
        activeProviderId: null,
        defaultProviderId: null,
      };
    }

    return {
      role,
      activeProviderId,
      defaultProviderId: null,
    };
  }

  /*
   * Version 1 stored only an active provider ID.
   */
  if (value.version === 1) {
    const activeProviderId =
      normalizeProviderId(
        value.activeProviderId,
      );

    if (
      role === "provider" &&
      !activeProviderId
    ) {
      return {
        role: "customer",
        activeProviderId: null,
        defaultProviderId: null,
      };
    }

    return {
      role,
      activeProviderId,
      defaultProviderId: null,
    };
  }

  /*
   * Tolerate unversioned prototype data.
   */
  const activeProviderId =
    normalizeProviderId(
      value.lastProviderId ??
        value.activeProviderId,
    );

  const defaultProviderId =
    normalizeProviderId(
      value.defaultProviderId,
    );

  if (
    role === "provider" &&
    !activeProviderId
  ) {
    return {
      role: "customer",
      activeProviderId: null,
      defaultProviderId,
    };
  }

  return {
    role,
    activeProviderId,
    defaultProviderId,
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

  const [
    defaultProviderId,
    setDefaultProviderIdState,
  ] = useState<string | null>(
    DEFAULT_SESSION.defaultProviderId,
  );

  const [isHydrated, setIsHydrated] =
    useState(false);

  useEffect(() => {
    let isMounted = true;

    const hydrateSession =
      async (): Promise<void> => {
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

          setDefaultProviderIdState(
            normalizedSession.defaultProviderId,
          );
        } catch (error) {
          console.error(
            "Failed to hydrate the session:",
            error,
          );

          if (isMounted) {
            setRoleState(
              DEFAULT_SESSION.role,
            );

            setActiveProviderIdState(
              DEFAULT_SESSION.activeProviderId,
            );

            setDefaultProviderIdState(
              DEFAULT_SESSION.defaultProviderId,
            );
          }
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

    const persistSession =
      async (): Promise<void> => {
        const session: PersistedSessionV3 = {
          version: 3,
          role,
          lastProviderId:
            activeProviderId,
          defaultProviderId,
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
    defaultProviderId,
    isHydrated,
    role,
  ]);

  const setRole = useCallback(
    (
      nextRole: UserRole,
    ): void => {
      setRoleState(nextRole);
    },
    [],
  );

  const setActiveProviderId =
    useCallback(
      (
        providerId:
          | string
          | null,
      ): void => {
        setActiveProviderIdState(
          normalizeProviderId(
            providerId,
          ),
        );
      },
      [],
    );

  const setDefaultProviderId =
    useCallback(
      (
        providerId:
          | string
          | null,
      ): void => {
        setDefaultProviderIdState(
          normalizeProviderId(
            providerId,
          ),
        );
      },
      [],
    );

  const enterCustomerWorkspace =
    useCallback((): void => {
      /*
       * Keep the last-used and default provider IDs.
       */
      setRoleState("customer");
    }, []);

  const enterProviderWorkspace =
    useCallback(
      (
        providerId: string,
      ): void => {
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

        setActiveProviderIdState(
          normalizedProviderId,
        );

        setRoleState("provider");
      },
      [],
    );

  const beginProviderRegistration =
    useCallback((): void => {
      /*
       * Preserve all saved provider profiles and the
       * explicit default-provider preference.
       */
      setRoleState("customer");
      setActiveProviderIdState(null);
    }, []);

  const resetSession =
    useCallback((): void => {
      /*
       * Logout ends the active workspace session but
       * keeps the default provider preference.
       */
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
        defaultProviderId,
        isHydrated,
        setRole,
        setActiveProviderId,
        setDefaultProviderId,
        enterCustomerWorkspace,
        enterProviderWorkspace,
        beginProviderRegistration,
        resetSession,
      }),
      [
        activeProviderId,
        beginProviderRegistration,
        defaultProviderId,
        enterCustomerWorkspace,
        enterProviderWorkspace,
        isHydrated,
        resetSession,
        role,
        setActiveProviderId,
        setDefaultProviderId,
        setRole,
      ],
    );

  return (
    <SessionContext.Provider
      value={value}
    >
      {children}
    </SessionContext.Provider>
  );
}

export function useSession(): SessionContextValue {
  const context =
    useContext(
      SessionContext,
    );

  if (!context) {
    throw new Error(
      "useSession must be used inside SessionProvider.",
    );
  }

  return context;
}
