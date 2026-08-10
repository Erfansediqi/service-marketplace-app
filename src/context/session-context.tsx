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

/*
 * Versions 1–3 are migrated structurally in normalizeStoredSession().
 * Their historical shapes remain documented by the migration branches
 * below; separate type aliases are unnecessary because persisted storage
 * is intentionally read as unknown before validation.
 */

type PersistedSessionV4 = {
  version: 4;

  /*
   * Runtime workspace restored for the current app
   * session. Logout intentionally resets this to
   * customer/null without erasing the remembered
   * workspace preference below.
   */
  role: UserRole;
  activeProviderId: string | null;

  /*
   * Workspace most recently entered by the user.
   * This survives logout and is used only as a
   * post-login preference.
   */
  lastWorkspaceRole: UserRole;

  /*
   * Provider account most recently opened by the user.
   * This survives logout.
   */
  lastProviderId: string | null;

  /*
   * Provider account explicitly marked as preferred.
   */
  defaultProviderId: string | null;
};

type NormalizedSession = {
  role: UserRole;
  activeProviderId: string | null;
  lastWorkspaceRole: UserRole;
  lastProviderId: string | null;
  defaultProviderId: string | null;
};

type SessionContextValue = {
  role: UserRole;

  /**
   * Provider account active in the current runtime
   * workspace. This is cleared when leaving provider
   * mode or logging out.
   */
  activeProviderId: string | null;

  /**
   * Workspace most recently entered by the user.
   * Preserved across logout for post-login routing.
   */
  lastWorkspaceRole: UserRole;

  /**
   * Provider account most recently opened by the user.
   * Preserved across logout.
   */
  lastProviderId: string | null;

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
  lastWorkspaceRole: "customer",
  lastProviderId: null,
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

  if (value.version === 4) {
    const activeProviderId =
      normalizeProviderId(
        value.activeProviderId,
      );

    const lastWorkspaceRole =
      isUserRole(
        value.lastWorkspaceRole,
      )
        ? value.lastWorkspaceRole
        : role;

    const lastProviderId =
      normalizeProviderId(
        value.lastProviderId,
      );

    const defaultProviderId =
      normalizeProviderId(
        value.defaultProviderId,
      );

    const normalizedRole =
      role === "provider" &&
      !activeProviderId
        ? "customer"
        : role;

    return {
      role: normalizedRole,
      activeProviderId:
        normalizedRole ===
        "provider"
          ? activeProviderId
          : null,
      lastWorkspaceRole:
        lastWorkspaceRole ===
          "provider" &&
        !lastProviderId
          ? "customer"
          : lastWorkspaceRole,
      lastProviderId,
      defaultProviderId,
    };
  }

  if (value.version === 3) {
    const lastProviderId =
      normalizeProviderId(
        value.lastProviderId,
      );

    const defaultProviderId =
      normalizeProviderId(
        value.defaultProviderId,
      );

    const validProviderRole =
      role === "provider" &&
      Boolean(lastProviderId);

    return {
      role: validProviderRole
        ? "provider"
        : "customer",
      activeProviderId:
        validProviderRole
          ? lastProviderId
          : null,
      lastWorkspaceRole:
        validProviderRole
          ? "provider"
          : "customer",
      lastProviderId,
      defaultProviderId,
    };
  }

  /*
   * Version 2 had no explicit default provider.
   * Do not silently turn "last used" into "default".
   */
  if (value.version === 2) {
    const lastProviderId =
      normalizeProviderId(
        value.lastProviderId,
      );

    const validProviderRole =
      role === "provider" &&
      Boolean(lastProviderId);

    return {
      role: validProviderRole
        ? "provider"
        : "customer",
      activeProviderId:
        validProviderRole
          ? lastProviderId
          : null,
      lastWorkspaceRole:
        validProviderRole
          ? "provider"
          : "customer",
      lastProviderId,
      defaultProviderId: null,
    };
  }

  /*
   * Version 1 stored only an active provider ID.
   */
  if (value.version === 1) {
    const lastProviderId =
      normalizeProviderId(
        value.activeProviderId,
      );

    const validProviderRole =
      role === "provider" &&
      Boolean(lastProviderId);

    return {
      role: validProviderRole
        ? "provider"
        : "customer",
      activeProviderId:
        validProviderRole
          ? lastProviderId
          : null,
      lastWorkspaceRole:
        validProviderRole
          ? "provider"
          : "customer",
      lastProviderId,
      defaultProviderId: null,
    };
  }

  /*
   * Tolerate unversioned prototype data.
   */
  const lastProviderId =
    normalizeProviderId(
      value.lastProviderId ??
        value.activeProviderId,
    );

  const defaultProviderId =
    normalizeProviderId(
      value.defaultProviderId,
    );

  const lastWorkspaceRole =
    isUserRole(
      value.lastWorkspaceRole,
    )
      ? value.lastWorkspaceRole
      : role;

  const validProviderRole =
    role === "provider" &&
    Boolean(lastProviderId);

  return {
    role: validProviderRole
      ? "provider"
      : "customer",
    activeProviderId:
      validProviderRole
        ? lastProviderId
        : null,
    lastWorkspaceRole:
      lastWorkspaceRole ===
        "provider" &&
      !lastProviderId
        ? "customer"
        : lastWorkspaceRole,
    lastProviderId,
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
    lastWorkspaceRole,
    setLastWorkspaceRoleState,
  ] = useState<UserRole>(
    DEFAULT_SESSION.lastWorkspaceRole,
  );

  const [
    lastProviderId,
    setLastProviderIdState,
  ] = useState<string | null>(
    DEFAULT_SESSION.lastProviderId,
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

          setLastWorkspaceRoleState(
            normalizedSession.lastWorkspaceRole,
          );

          setLastProviderIdState(
            normalizedSession.lastProviderId,
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

            setLastWorkspaceRoleState(
              DEFAULT_SESSION.lastWorkspaceRole,
            );

            setLastProviderIdState(
              DEFAULT_SESSION.lastProviderId,
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
        const session: PersistedSessionV4 = {
          version: 4,
          role,
          activeProviderId,
          lastWorkspaceRole,
          lastProviderId,
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
    lastProviderId,
    lastWorkspaceRole,
    role,
  ]);

  const setRole = useCallback(
    (
      nextRole: UserRole,
    ): void => {
      if (
        nextRole === "provider"
      ) {
        if (!activeProviderId) {
          console.error(
            "Cannot set provider role without an active provider ID.",
          );

          return;
        }

        setLastWorkspaceRoleState(
          "provider",
        );

        setLastProviderIdState(
          activeProviderId,
        );
      } else {
        setLastWorkspaceRoleState(
          "customer",
        );
      }

      setRoleState(nextRole);
    },
    [activeProviderId],
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
      setRoleState("customer");

      setActiveProviderIdState(
        null,
      );

      setLastWorkspaceRoleState(
        "customer",
      );
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

        setLastProviderIdState(
          normalizedProviderId,
        );

        setLastWorkspaceRoleState(
          "provider",
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
       * Logout ends only the active runtime workspace.
       * The last workspace/provider and explicit default
       * provider preferences intentionally survive.
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
        lastWorkspaceRole,
        lastProviderId,
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
        lastProviderId,
        lastWorkspaceRole,
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
