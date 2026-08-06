import { CACHE_KEYS } from "./cache-keys";
import { CacheStorage } from "./cache-storage";
import type {
  ProfileUpdatePayload,
  ProfileUpdateQueueItem,
  SyncQueueItem,
} from "./sync-types";

function createQueueItemId(): string {
  return [
    "sync",
    Date.now().toString(36),
    Math.random().toString(36).slice(2, 10),
  ].join("-");
}

async function readQueue(): Promise<SyncQueueItem[]> {
  return (
    (await CacheStorage.get<SyncQueueItem[]>(
      CACHE_KEYS.syncQueue,
    )) ?? []
  );
}

async function writeQueue(
  queue: SyncQueueItem[],
): Promise<void> {
  await CacheStorage.set(
    CACHE_KEYS.syncQueue,
    queue,
  );
}

async function enqueueProfileUpdate(
  userId: string,
  payload: ProfileUpdatePayload,
): Promise<ProfileUpdateQueueItem> {
  const normalizedUserId = userId.trim();

  if (!normalizedUserId) {
    throw new Error(
      "A user ID is required to queue a profile update.",
    );
  }

  const queue = await readQueue();
  const now = new Date().toISOString();

  const existingIndex = queue.findIndex(
    (item) =>
      item.type === "profile.update" &&
      item.userId === normalizedUserId,
  );

  if (existingIndex >= 0) {
    const existingItem = queue[
      existingIndex
    ] as ProfileUpdateQueueItem;

    const updatedItem: ProfileUpdateQueueItem = {
      ...existingItem,
      payload: {
        ...existingItem.payload,
        ...payload,
      },
      updatedAt: now,
      lastError: null,
    };

    queue[existingIndex] = updatedItem;
    await writeQueue(queue);

    return updatedItem;
  }

  const newItem: ProfileUpdateQueueItem = {
    id: createQueueItemId(),
    type: "profile.update",
    userId: normalizedUserId,
    payload,
    createdAt: now,
    updatedAt: now,
    attemptCount: 0,
    lastError: null,
  };

  queue.push(newItem);
  await writeQueue(queue);

  return newItem;
}

async function removeItem(
  itemId: string,
): Promise<void> {
  const queue = await readQueue();

  await writeQueue(
    queue.filter((item) => item.id !== itemId),
  );
}

async function recordFailedAttempt(
  itemId: string,
  errorMessage: string,
): Promise<void> {
  const queue = await readQueue();
  const itemIndex = queue.findIndex(
    (item) => item.id === itemId,
  );

  if (itemIndex < 0) {
    return;
  }

  queue[itemIndex] = {
    ...queue[itemIndex],
    attemptCount:
      queue[itemIndex].attemptCount + 1,
    lastError: errorMessage,
    updatedAt: new Date().toISOString(),
  };

  await writeQueue(queue);
}

async function clearUserItems(
  userId: string,
): Promise<void> {
  const normalizedUserId = userId.trim();
  const queue = await readQueue();

  await writeQueue(
    queue.filter(
      (item) => item.userId !== normalizedUserId,
    ),
  );
}

export const SyncQueue = {
  list: readQueue,
  enqueueProfileUpdate,
  removeItem,
  recordFailedAttempt,
  clearUserItems,
};
