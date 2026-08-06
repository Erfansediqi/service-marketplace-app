import { AppState } from "react-native";

import { supabase } from "../lib/supabase";
import { getProfileCacheKey } from "./cache-keys";
import { CacheStorage } from "./cache-storage";
import { createCachedRecord } from "./cache-types";
import {
  hasInternetConnection,
  subscribeToInternetConnection,
} from "./network";
import { SyncQueue } from "./sync-queue";
import type { ProfileUpdateQueueItem, SyncQueueItem } from "./sync-types";

export type SyncRunResult = {
  processed: number;
  succeeded: number;
  failed: number;
  skippedBecauseOffline: boolean;
};

let activeFlush: Promise<SyncRunResult> | null = null;
let engineCleanup: (() => void) | null = null;

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
}

async function processProfileUpdate(
  item: ProfileUpdateQueueItem,
): Promise<void> {
  const { data, error } = await supabase
    .from("profiles")
    .update(item.payload)
    .eq("id", item.userId)
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  const synchronizedProfile = createCachedRecord(data, {
    serverUpdatedAt: data.updated_at,
    syncState: "synced",
    lastError: null,
  });

  await CacheStorage.set(getProfileCacheKey(item.userId), synchronizedProfile);

  await SyncQueue.removeItem(item.id);
}

async function processQueueItem(item: SyncQueueItem): Promise<void> {
  await processProfileUpdate(item);
}

async function runSyncQueue(): Promise<SyncRunResult> {
  const isOnline = await hasInternetConnection();

  if (!isOnline) {
    return {
      processed: 0,
      succeeded: 0,
      failed: 0,
      skippedBecauseOffline: true,
    };
  }

  const queue = await SyncQueue.list();

  const result: SyncRunResult = {
    processed: 0,
    succeeded: 0,
    failed: 0,
    skippedBecauseOffline: false,
  };

  for (const item of queue) {
    result.processed += 1;

    try {
      await processQueueItem(item);
      result.succeeded += 1;
    } catch (error) {
      result.failed += 1;

      await SyncQueue.recordFailedAttempt(item.id, getErrorMessage(error));
    }
  }

  return result;
}

export function flushPendingSync(): Promise<SyncRunResult> {
  if (activeFlush) {
    return activeFlush;
  }

  activeFlush = runSyncQueue().finally(() => {
    activeFlush = null;
  });

  return activeFlush;
}

function requestSync(): void {
  void flushPendingSync().catch((error) => {
    console.warn(
      "Khedmat background synchronization failed:",
      getErrorMessage(error),
    );
  });
}

export function startSyncEngine(): () => void {
  if (engineCleanup) {
    return engineCleanup;
  }

  const unsubscribeFromNetwork = subscribeToInternetConnection((isOnline) => {
    if (isOnline) {
      requestSync();
    }
  });

  const appStateSubscription = AppState.addEventListener("change", (state) => {
    if (state === "active") {
      requestSync();
    }
  });

  let stopped = false;

  const cleanup = () => {
    if (stopped) {
      return;
    }

    stopped = true;
    unsubscribeFromNetwork();
    appStateSubscription.remove();

    if (engineCleanup === cleanup) {
      engineCleanup = null;
    }
  };

  engineCleanup = cleanup;

  requestSync();

  return cleanup;
}

export function stopSyncEngine(): void {
  engineCleanup?.();
}
