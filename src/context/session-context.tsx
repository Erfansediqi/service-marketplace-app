import {
    PropsWithChildren,
    createContext,
    useContext,
    useMemo,
    useState,
} from "react";

export type UserRole =
  | "customer"
  | "provider";

type SessionContextValue = {
  role: UserRole;
  activeProviderId: string | null;

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

const SessionContext =
  createContext<SessionContextValue | null>(
    null,
  );

export function SessionProvider({
  children,
}: PropsWithChildren) {
  const [role, setRole] =
    useState<UserRole>("customer");

  const [
    activeProviderId,
    setActiveProviderId,
  ] = useState<string | null>(null);

  const enterCustomerWorkspace = () => {
    setRole("customer");
    setActiveProviderId(null);
  };

  const enterProviderWorkspace = (
    providerId: string,
  ) => {
    setRole("provider");
    setActiveProviderId(providerId);
  };

  const resetSession = () => {
    setRole("customer");
    setActiveProviderId(null);
  };

  const value =
    useMemo<SessionContextValue>(
      () => ({
        role,
        activeProviderId,
        setRole,
        setActiveProviderId,
        enterCustomerWorkspace,
        enterProviderWorkspace,
        resetSession,
      }),
      [role, activeProviderId],
    );

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);

  if (!context) {
    throw new Error(
      "useSession must be used inside SessionProvider.",
    );
  }

  return context;
}