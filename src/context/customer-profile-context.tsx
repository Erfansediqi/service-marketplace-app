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

export type CustomerProfile = {
  fullName: string;
  phoneNumber: string;
  email: string;
  avatarUri: string | null;
};

type PersistedCustomerProfileV1 = CustomerProfile & {
  version: 1;
};

type CustomerProfileContextValue = {
  profile: CustomerProfile | null;
  isHydrated: boolean;
  saveSignupProfile: (input: {
    fullName: string;
    phoneNumber: string;
  }) => Promise<void>;
  updateProfile: (
    updates: Partial<CustomerProfile>,
  ) => Promise<void>;
};

const CUSTOMER_PROFILE_STORAGE_KEY =
  "@khedmat_customer_profile";

const CustomerProfileContext =
  createContext<CustomerProfileContextValue | null>(
    null,
  );

function normalizeText(value: unknown): string {
  return typeof value === "string"
    ? value.trim()
    : "";
}

function normalizeStoredProfile(
  value: unknown,
): CustomerProfile | null {
  if (
    typeof value !== "object" ||
    value === null
  ) {
    return null;
  }

  const stored = value as Record<
    string,
    unknown
  >;

  const fullName = normalizeText(
    stored.fullName,
  );
  const phoneNumber = normalizeText(
    stored.phoneNumber,
  );

  if (!fullName || !phoneNumber) {
    return null;
  }

  const avatarUri = normalizeText(
    stored.avatarUri,
  );

  return {
    fullName,
    phoneNumber,
    email: normalizeText(stored.email),
    avatarUri: avatarUri || null,
  };
}

export function CustomerProfileProvider({
  children,
}: PropsWithChildren) {
  const [profile, setProfile] =
    useState<CustomerProfile | null>(null);
  const [isHydrated, setIsHydrated] =
    useState(false);

  useEffect(() => {
    let isMounted = true;

    const hydrateProfile = async () => {
      try {
        const storedProfile =
          await StorageService.get<unknown>(
            CUSTOMER_PROFILE_STORAGE_KEY,
          );

        if (isMounted) {
          setProfile(
            normalizeStoredProfile(
              storedProfile,
            ),
          );
        }
      } catch (error) {
        console.error(
          "Failed to hydrate the customer profile:",
          error,
        );
      } finally {
        if (isMounted) {
          setIsHydrated(true);
        }
      }
    };

    void hydrateProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  const persistProfile = useCallback(
    async (
      nextProfile: CustomerProfile,
    ): Promise<void> => {
      const persistedProfile: PersistedCustomerProfileV1 =
        {
          version: 1,
          ...nextProfile,
        };

      await StorageService.save(
        CUSTOMER_PROFILE_STORAGE_KEY,
        persistedProfile,
      );

      setProfile(nextProfile);
    },
    [],
  );

  const saveSignupProfile = useCallback(
    async ({
      fullName,
      phoneNumber,
    }: {
      fullName: string;
      phoneNumber: string;
    }): Promise<void> => {
      const nextProfile: CustomerProfile = {
        fullName: normalizeText(fullName),
        phoneNumber:
          normalizeText(phoneNumber),
        email: profile?.email ?? "",
        avatarUri:
          profile?.avatarUri ?? null,
      };

      if (
        !nextProfile.fullName ||
        !nextProfile.phoneNumber
      ) {
        throw new Error(
          "A customer name and phone number are required.",
        );
      }

      await persistProfile(nextProfile);
    },
    [persistProfile, profile],
  );

  const updateProfile = useCallback(
    async (
      updates: Partial<CustomerProfile>,
    ): Promise<void> => {
      if (!profile) {
        throw new Error(
          "Cannot update a customer profile before signup is complete.",
        );
      }

      const nextProfile: CustomerProfile = {
        fullName:
          normalizeText(updates.fullName) ||
          profile.fullName,
        phoneNumber:
          normalizeText(
            updates.phoneNumber,
          ) || profile.phoneNumber,
        email:
          updates.email === undefined
            ? profile.email
            : normalizeText(updates.email),
        avatarUri:
          updates.avatarUri === undefined
            ? profile.avatarUri
            : normalizeText(
                  updates.avatarUri,
                ) || null,
      };

      await persistProfile(nextProfile);
    },
    [persistProfile, profile],
  );

  const value =
    useMemo<CustomerProfileContextValue>(
      () => ({
        profile,
        isHydrated,
        saveSignupProfile,
        updateProfile,
      }),
      [
        isHydrated,
        profile,
        saveSignupProfile,
        updateProfile,
      ],
    );

  return (
    <CustomerProfileContext.Provider
      value={value}
    >
      {children}
    </CustomerProfileContext.Provider>
  );
}

export function useCustomerProfile(): CustomerProfileContextValue {
  const context = useContext(
    CustomerProfileContext,
  );

  if (!context) {
    throw new Error(
      "useCustomerProfile must be used inside CustomerProfileProvider.",
    );
  }

  return context;
}
