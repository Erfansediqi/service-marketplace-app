import {
  type PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ProfileRepository,
  type ProfileRow,
} from "../repositories/profile-repository";
import { AvatarStorage } from "../services/avatar-storage";
import { StorageService } from "../services/storage";
import { useSupabaseAuth } from "./supabase-auth-context";

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
  updateProfile: (updates: Partial<CustomerProfile>) => Promise<void>;
  uploadAvatar: (base64: string) => Promise<void>;
};

const CUSTOMER_PROFILE_STORAGE_KEY = "@khedmat_customer_profile";

const CustomerProfileContext =
  createContext<CustomerProfileContextValue | null>(null);

function normalizeText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeStoredProfile(value: unknown): CustomerProfile | null {
  if (typeof value !== "object" || value === null) {
    return null;
  }

  const stored = value as Record<string, unknown>;

  const fullName = normalizeText(stored.fullName);
  const phoneNumber = normalizeText(stored.phoneNumber);

  if (!fullName || !phoneNumber) {
    return null;
  }

  const avatarUri = normalizeText(stored.avatarUri);

  return {
    fullName,
    phoneNumber,
    email: normalizeText(stored.email),
    avatarUri: avatarUri || null,
  };
}

function mergeRemoteProfile(
  remoteProfile: ProfileRow,
  fallbackProfile: CustomerProfile | null,
): CustomerProfile {
  return {
    fullName:
      normalizeText(remoteProfile.full_name) || fallbackProfile?.fullName || "",
    phoneNumber:
      normalizeText(remoteProfile.phone) || fallbackProfile?.phoneNumber || "",
    email: normalizeText(remoteProfile.email) || fallbackProfile?.email || "",
    avatarUri: remoteProfile.avatar_path
      ? AvatarStorage.getPublicUrl(
          remoteProfile.avatar_path,
          remoteProfile.updated_at,
        )
      : (fallbackProfile?.avatarUri ?? null),
  };
}

async function readLocalProfile(): Promise<CustomerProfile | null> {
  const storedProfile = await StorageService.get<unknown>(
    CUSTOMER_PROFILE_STORAGE_KEY,
  );

  return normalizeStoredProfile(storedProfile);
}

async function writeLocalProfile(profile: CustomerProfile): Promise<void> {
  const persistedProfile: PersistedCustomerProfileV1 = {
    version: 1,
    ...profile,
  };

  await StorageService.save(CUSTOMER_PROFILE_STORAGE_KEY, persistedProfile);
}

export function CustomerProfileProvider({ children }: PropsWithChildren) {
  const { user, isHydrated: authIsHydrated } = useSupabaseAuth();

  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    if (!authIsHydrated) {
      return;
    }

    let isMounted = true;

    const hydrateProfile = async (): Promise<void> => {
      setIsHydrated(false);

      let localProfile: CustomerProfile | null = null;

      try {
        localProfile = await readLocalProfile();

        if (!user) {
          if (isMounted) {
            setProfile(localProfile);
          }

          return;
        }

        const cachedProfile = await ProfileRepository.getCachedProfile(user.id);

        if (cachedProfile && isMounted) {
          setProfile(mergeRemoteProfile(cachedProfile.data, localProfile));
        } else if (isMounted) {
          setProfile(localProfile);
        }

        try {
          const remoteProfile = await ProfileRepository.fetchRemoteProfile(
            user.id,
          );
          const synchronizedProfile = mergeRemoteProfile(
            remoteProfile.data,
            localProfile,
          );

          await writeLocalProfile(synchronizedProfile);

          if (isMounted) {
            setProfile(synchronizedProfile);
          }
        } catch (error) {
          console.warn(
            "Could not refresh the customer profile from Supabase; using cached/local data:",
            error,
          );
        }
      } catch (error) {
        console.error("Failed to hydrate the customer profile:", error);

        if (isMounted) {
          setProfile(localProfile);
        }
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
  }, [authIsHydrated, user?.id]);

  const persistProfile = useCallback(
    async (nextProfile: CustomerProfile): Promise<void> => {
      await writeLocalProfile(nextProfile);
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
        phoneNumber: normalizeText(phoneNumber),
        email: profile?.email ?? "",
        avatarUri: profile?.avatarUri ?? null,
      };

      if (!nextProfile.fullName || !nextProfile.phoneNumber) {
        throw new Error("A customer name and phone number are required.");
      }

      // The Auth trigger creates/updates the remote profile from signup metadata.
      // Keep this local write so the UI remains responsive while auth state hydrates.
      await persistProfile(nextProfile);
    },
    [persistProfile, profile],
  );

  const updateProfile = useCallback(
    async (updates: Partial<CustomerProfile>): Promise<void> => {
      if (!profile) {
        throw new Error(
          "Cannot update a customer profile before signup is complete.",
        );
      }

      const nextProfile: CustomerProfile = {
        fullName: normalizeText(updates.fullName) || profile.fullName,
        phoneNumber: normalizeText(updates.phoneNumber) || profile.phoneNumber,
        email:
          updates.email === undefined
            ? profile.email
            : normalizeText(updates.email),
        avatarUri:
          updates.avatarUri === undefined
            ? profile.avatarUri
            : normalizeText(updates.avatarUri) || null,
      };

      // Preserve the existing local fields (email/avatar) until their dedicated
      // Supabase Auth/Storage flows are implemented.
      await persistProfile(nextProfile);

      if (!user) {
        return;
      }

      const remoteUpdate: {
        full_name?: string;
        phone?: string;
      } = {};

      if (updates.fullName !== undefined) {
        remoteUpdate.full_name = nextProfile.fullName;
      }

      if (updates.phoneNumber !== undefined) {
        remoteUpdate.phone = nextProfile.phoneNumber;
      }

      if (Object.keys(remoteUpdate).length === 0) {
        return;
      }

      const result = await ProfileRepository.updateProfile(
        user.id,
        remoteUpdate,
      );
      const synchronizedProfile = mergeRemoteProfile(
        result.profile.data,
        nextProfile,
      );

      await persistProfile(synchronizedProfile);
    },
    [persistProfile, profile, user],
  );

  const uploadAvatar = useCallback(
    async (base64: string): Promise<void> => {
      if (!profile) {
        throw new Error(
          "Cannot upload a profile photo before signup is complete.",
        );
      }

      if (!user) {
        throw new Error("You must be signed in to upload a profile photo.");
      }

      const uploadedAvatar = await AvatarStorage.uploadAvatar(user.id, base64);
      const result = await ProfileRepository.updateProfile(user.id, {
        avatar_path: uploadedAvatar.path,
      });

      const synchronizedProfile = mergeRemoteProfile(result.profile.data, {
        ...profile,
        avatarUri: uploadedAvatar.publicUrl,
      });

      await persistProfile(synchronizedProfile);
    },
    [persistProfile, profile, user],
  );

  const value = useMemo<CustomerProfileContextValue>(
    () => ({
      profile,
      isHydrated,
      saveSignupProfile,
      updateProfile,
      uploadAvatar,
    }),
    [isHydrated, profile, saveSignupProfile, updateProfile, uploadAvatar],
  );

  return (
    <CustomerProfileContext.Provider value={value}>
      {children}
    </CustomerProfileContext.Provider>
  );
}

export function useCustomerProfile(): CustomerProfileContextValue {
  const context = useContext(CustomerProfileContext);

  if (!context) {
    throw new Error(
      "useCustomerProfile must be used inside CustomerProfileProvider.",
    );
  }

  return context;
}
