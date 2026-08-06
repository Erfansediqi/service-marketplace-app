import type { Database } from "../types/database";
import { supabase } from "../lib/supabase";
import { getProfileCacheKey } from "../offline/cache-keys";
import { CacheStorage } from "../offline/cache-storage";
import {
  createCachedRecord,
  type CachedRecord,
} from "../offline/cache-types";
import { hasInternetConnection } from "../offline/network";
import { SyncQueue } from "../offline/sync-queue";
import type { ProfileUpdatePayload } from "../offline/sync-types";

export type ProfileRow =
  Database["public"]["Tables"]["profiles"]["Row"];

export type ProfileUpdate =
  Database["public"]["Tables"]["profiles"]["Update"];

export type ProfileUpdateResult = {
  profile: CachedRecord<ProfileRow>;
  source: "remote" | "local";
};

export class ProfileRepositoryError extends Error {
  readonly causeValue: unknown;

  constructor(
    message: string,
    causeValue?: unknown,
  ) {
    super(message);
    this.name = "ProfileRepositoryError";
    this.causeValue = causeValue;
  }
}

function normalizeUserId(userId: string): string {
  const normalizedUserId = userId.trim();

  if (!normalizedUserId) {
    throw new ProfileRepositoryError(
      "A user ID is required to access a profile.",
    );
  }

  return normalizedUserId;
}

function normalizeUpdate(
  update: ProfileUpdatePayload,
): ProfileUpdatePayload {
  const normalized: ProfileUpdatePayload = {};

  if (update.full_name !== undefined) {
    normalized.full_name = update.full_name;
  }

  if (update.phone !== undefined) {
    normalized.phone = update.phone;
  }

  if (update.avatar_path !== undefined) {
    normalized.avatar_path = update.avatar_path;
  }

  if (update.preferred_language !== undefined) {
    normalized.preferred_language =
      update.preferred_language;
  }

  return normalized;
}

function isTransientNetworkError(
  error: unknown,
): boolean {
  const message =
    error instanceof Error
      ? error.message
      : String(error);

  return /network request failed|failed to fetch|fetch failed|timeout|connection|offline/i.test(
    message,
  );
}

async function saveCachedProfile(
  userId: string,
  profile: CachedRecord<ProfileRow>,
): Promise<void> {
  await CacheStorage.set(
    getProfileCacheKey(userId),
    profile,
  );
}

async function getCachedProfile(
  userId: string,
): Promise<CachedRecord<ProfileRow> | null> {
  const normalizedUserId = normalizeUserId(userId);

  return CacheStorage.get<CachedRecord<ProfileRow>>(
    getProfileCacheKey(normalizedUserId),
  );
}

async function fetchRemoteProfile(
  userId: string,
): Promise<CachedRecord<ProfileRow>> {
  const normalizedUserId = normalizeUserId(userId);

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", normalizedUserId)
    .single();

  if (error) {
    throw new ProfileRepositoryError(
      `Failed to fetch profile: ${error.message}`,
      error,
    );
  }

  const cachedProfile = createCachedRecord(data, {
    serverUpdatedAt: data.updated_at,
    syncState: "synced",
    lastError: null,
  });

  await saveCachedProfile(
    normalizedUserId,
    cachedProfile,
  );

  return cachedProfile;
}

async function updateProfile(
  userId: string,
  update: ProfileUpdatePayload,
): Promise<ProfileUpdateResult> {
  const normalizedUserId = normalizeUserId(userId);
  const normalizedUpdate = normalizeUpdate(update);
  const isOnline = await hasInternetConnection();

  let currentProfile =
    await getCachedProfile(normalizedUserId);

  if (!currentProfile) {
    if (!isOnline) {
      throw new ProfileRepositoryError(
        "The profile is not cached and cannot be updated while offline.",
      );
    }

    currentProfile =
      await fetchRemoteProfile(normalizedUserId);
  }

  if (Object.keys(normalizedUpdate).length === 0) {
    return {
      profile: currentProfile,
      source: "local",
    };
  }

  const optimisticProfile =
    createCachedRecord<ProfileRow>(
      {
        ...currentProfile.data,
        ...normalizedUpdate,
        updated_at: new Date().toISOString(),
      },
      {
        serverUpdatedAt:
          currentProfile.serverUpdatedAt,
        syncState: "pending",
        lastError: null,
      },
    );

  await saveCachedProfile(
    normalizedUserId,
    optimisticProfile,
  );

  if (!isOnline) {
    await SyncQueue.enqueueProfileUpdate(
      normalizedUserId,
      normalizedUpdate,
    );

    return {
      profile: optimisticProfile,
      source: "local",
    };
  }

  const { data, error } = await supabase
    .from("profiles")
    .update(normalizedUpdate)
    .eq("id", normalizedUserId)
    .select("*")
    .single();

  if (error) {
    if (isTransientNetworkError(error)) {
      await SyncQueue.enqueueProfileUpdate(
        normalizedUserId,
        normalizedUpdate,
      );

      const pendingProfile =
        createCachedRecord<ProfileRow>(
          optimisticProfile.data,
          {
            serverUpdatedAt:
              currentProfile.serverUpdatedAt,
            syncState: "pending",
            lastError: error.message,
          },
        );

      await saveCachedProfile(
        normalizedUserId,
        pendingProfile,
      );

      return {
        profile: pendingProfile,
        source: "local",
      };
    }

    const failedProfile =
      createCachedRecord<ProfileRow>(
        optimisticProfile.data,
        {
          serverUpdatedAt:
            currentProfile.serverUpdatedAt,
          syncState: "failed",
          lastError: error.message,
        },
      );

    await saveCachedProfile(
      normalizedUserId,
      failedProfile,
    );

    throw new ProfileRepositoryError(
      `Failed to update profile: ${error.message}`,
      error,
    );
  }

  const synchronizedProfile =
    createCachedRecord(data, {
      serverUpdatedAt: data.updated_at,
      syncState: "synced",
      lastError: null,
    });

  await saveCachedProfile(
    normalizedUserId,
    synchronizedProfile,
  );

  await SyncQueue.clearUserItems(
    normalizedUserId,
  );

  return {
    profile: synchronizedProfile,
    source: "remote",
  };
}

async function removeCachedProfile(
  userId: string,
): Promise<void> {
  const normalizedUserId = normalizeUserId(userId);

  await CacheStorage.remove(
    getProfileCacheKey(normalizedUserId),
  );

  await SyncQueue.clearUserItems(
    normalizedUserId,
  );
}

export const ProfileRepository = {
  getCachedProfile,
  fetchRemoteProfile,
  updateProfile,
  removeCachedProfile,
};
