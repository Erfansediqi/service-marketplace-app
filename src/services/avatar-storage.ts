import { supabase } from "../lib/supabase";

const AVATAR_BUCKET = "avatars";

export type UploadedAvatar = {
  path: string;
  publicUrl: string;
};

function normalizeUserId(userId: string): string {
  const normalized = userId.trim();

  if (!normalized) {
    throw new Error("A user ID is required to manage an avatar.");
  }

  return normalized;
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const normalized = base64.replace(/^data:[^;]+;base64,/, "").trim();

  if (!normalized) {
    throw new Error("The selected avatar does not contain image data.");
  }

  const binary = globalThis.atob(normalized);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes.buffer;
}

function buildAvatarPath(userId: string): string {
  const normalizedUserId = normalizeUserId(userId);

  return `${normalizedUserId}/avatar-${Date.now()}.jpg`;
}

function getPublicUrl(path: string, version?: string | number | null): string {
  const normalizedPath = path.trim();

  if (!normalizedPath) {
    return "";
  }

  const { data } = supabase.storage
    .from(AVATAR_BUCKET)
    .getPublicUrl(normalizedPath);

  if (version === undefined || version === null || version === "") {
    return data.publicUrl;
  }

  const separator = data.publicUrl.includes("?") ? "&" : "?";

  return `${data.publicUrl}${separator}v=${encodeURIComponent(String(version))}`;
}

async function uploadAvatar(
  userId: string,
  base64: string,
): Promise<UploadedAvatar> {
  const path = buildAvatarPath(userId);
  const fileBody = base64ToArrayBuffer(base64);

  const { error } = await supabase.storage
    .from(AVATAR_BUCKET)
    .upload(path, fileBody, {
      contentType: "image/jpeg",
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    throw new Error(`Failed to upload profile photo: ${error.message}`);
  }

  return {
    path,
    publicUrl: getPublicUrl(path, Date.now()),
  };
}

async function removeOtherAvatars(
  userId: string,
  keepPath: string,
): Promise<void> {
  const normalizedUserId = normalizeUserId(userId);

  const { data, error } = await supabase.storage
    .from(AVATAR_BUCKET)
    .list(normalizedUserId, {
      limit: 100,
    });

  if (error) {
    console.warn("Could not inspect previous profile photos:", error);
    return;
  }

  const pathsToRemove = (data ?? [])
    .map((file) => `${normalizedUserId}/${file.name}`)
    .filter((path) => path !== keepPath);

  if (pathsToRemove.length === 0) {
    return;
  }

  const { error: removeError } = await supabase.storage
    .from(AVATAR_BUCKET)
    .remove(pathsToRemove);

  if (removeError) {
    console.warn("Could not remove previous profile photos:", removeError);
  }
}

async function removeAvatar(userId: string): Promise<void> {
  const normalizedUserId = normalizeUserId(userId);

  const { data, error } = await supabase.storage
    .from(AVATAR_BUCKET)
    .list(normalizedUserId, {
      limit: 100,
    });

  if (error) {
    throw new Error(`Failed to inspect profile photos: ${error.message}`);
  }

  const paths = (data ?? []).map((file) => `${normalizedUserId}/${file.name}`);

  if (paths.length === 0) {
    return;
  }

  const { error: removeError } = await supabase.storage
    .from(AVATAR_BUCKET)
    .remove(paths);

  if (removeError) {
    throw new Error(`Failed to remove profile photo: ${removeError.message}`);
  }
}

export const AvatarStorage = {
  getPublicUrl,
  uploadAvatar,
  removeOtherAvatars,
  removeAvatar,
};
