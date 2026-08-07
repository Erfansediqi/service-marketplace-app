import { supabase } from "../lib/supabase";

const AVATAR_BUCKET = "avatars";
const AVATAR_FILENAME = "avatar.jpg";

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
  return `${normalizeUserId(userId)}/${AVATAR_FILENAME}`;
}

function getPublicUrl(path: string, version?: string | number | null): string {
  const normalizedPath = path.trim();

  if (!normalizedPath) {
    return "";
  }

  const { data } = supabase.storage
    .from(AVATAR_BUCKET)
    .getPublicUrl(normalizedPath);
  const publicUrl = data.publicUrl;

  if (!version) {
    return publicUrl;
  }

  return `${publicUrl}?v=${encodeURIComponent(String(version))}`;
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
      upsert: true,
    });

  if (error) {
    throw new Error(`Failed to upload profile photo: ${error.message}`);
  }

  return {
    path,
    publicUrl: getPublicUrl(path, Date.now()),
  };
}

async function removeAvatar(userId: string): Promise<void> {
  const path = buildAvatarPath(userId);
  const { error } = await supabase.storage.from(AVATAR_BUCKET).remove([path]);

  if (error) {
    throw new Error(`Failed to remove profile photo: ${error.message}`);
  }
}

export const AvatarStorage = {
  getPublicUrl,
  uploadAvatar,
  removeAvatar,
};
