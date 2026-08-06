import type { Database } from "../types/database";

type ProfileUpdate =
  Database["public"]["Tables"]["profiles"]["Update"];

export type ProfileUpdatePayload = Pick<
  ProfileUpdate,
  | "full_name"
  | "phone"
  | "avatar_path"
  | "preferred_language"
>;

export type ProfileUpdateQueueItem = {
  id: string;
  type: "profile.update";
  userId: string;
  payload: ProfileUpdatePayload;
  createdAt: string;
  updatedAt: string;
  attemptCount: number;
  lastError: string | null;
};

export type SyncQueueItem = ProfileUpdateQueueItem;
