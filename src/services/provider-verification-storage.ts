import { supabase } from "../lib/supabase";

const BUCKET = "provider-verification";
const MAX_FILE_BYTES = 8 * 1024 * 1024;

export type ProviderVerificationImageKind =
  | "profile-photo"
  | "identity-front"
  | "identity-back";

export type UploadedVerificationImage = {
  path: string;
  kind: ProviderVerificationImageKind;
  contentType: string;
  sizeBytes: number;
};

export type UploadVerificationImagesInput = {
  ownerUserId: string;
  providerId: string;
  profilePhotoUri: string;
  identityFrontUri: string;
  identityBackUri?: string | null;
};

export type UploadedVerificationImages = {
  profilePhoto: UploadedVerificationImage;
  identityFront: UploadedVerificationImage;
  identityBack: UploadedVerificationImage | null;
};

function required(value: string, label: string): string {
  const normalized = value.trim();

  if (!normalized) {
    throw new Error(`${label} is required.`);
  }

  return normalized;
}

function fileExtensionFromUri(uri: string): string {
  const withoutQuery = uri.split("?")[0] ?? uri;
  const match = withoutQuery.match(/\.([a-zA-Z0-9]+)$/);
  const extension = match?.[1]?.toLowerCase();

  if (
    extension === "jpg" ||
    extension === "jpeg" ||
    extension === "png" ||
    extension === "webp" ||
    extension === "heic" ||
    extension === "heif"
  ) {
    return extension;
  }

  return "jpg";
}

function contentTypeForExtension(extension: string): string {
  switch (extension) {
    case "png":
      return "image/png";
    case "webp":
      return "image/webp";
    case "heic":
      return "image/heic";
    case "heif":
      return "image/heif";
    case "jpeg":
    case "jpg":
    default:
      return "image/jpeg";
  }
}

function safeKindFileName(
  kind: ProviderVerificationImageKind,
  extension: string,
): string {
  return `${kind}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 10)}.${extension}`;
}

function buildPath(
  ownerUserId: string,
  providerId: string,
  kind: ProviderVerificationImageKind,
  extension: string,
): string {
  return [
    required(ownerUserId, "Owner user ID"),
    required(providerId, "Provider ID"),
    safeKindFileName(kind, extension),
  ].join("/");
}

async function uriToArrayBuffer(uri: string): Promise<ArrayBuffer> {
  const normalizedUri = required(uri, "Image URI");

  const response = await fetch(normalizedUri);

  if (!response.ok) {
    throw new Error(`Could not read the selected image (${response.status}).`);
  }

  return response.arrayBuffer();
}

async function uploadImage(
  ownerUserId: string,
  providerId: string,
  kind: ProviderVerificationImageKind,
  uri: string,
): Promise<UploadedVerificationImage> {
  const extension = fileExtensionFromUri(uri);
  const contentType = contentTypeForExtension(extension);
  const path = buildPath(ownerUserId, providerId, kind, extension);

  const data = await uriToArrayBuffer(uri);

  if (data.byteLength === 0) {
    throw new Error("The selected image is empty.");
  }

  if (data.byteLength > MAX_FILE_BYTES) {
    throw new Error(
      "The selected image is larger than the 8 MB verification-file limit.",
    );
  }

  const { error } = await supabase.storage.from(BUCKET).upload(path, data, {
    contentType,
    cacheControl: "0",
    upsert: false,
  });

  if (error) {
    throw new Error(`Failed to upload ${kind}: ${error.message}`);
  }

  return {
    path,
    kind,
    contentType,
    sizeBytes: data.byteLength,
  };
}

async function removeFiles(paths: string[]): Promise<void> {
  const uniquePaths = [
    ...new Set(paths.map((path) => path.trim()).filter(Boolean)),
  ];

  if (uniquePaths.length === 0) {
    return;
  }

  const { error } = await supabase.storage.from(BUCKET).remove(uniquePaths);

  if (error) {
    throw new Error(`Failed to remove verification files: ${error.message}`);
  }
}

async function uploadVerificationImages(
  input: UploadVerificationImagesInput,
): Promise<UploadedVerificationImages> {
  const uploadedPaths: string[] = [];

  try {
    const profilePhoto = await uploadImage(
      input.ownerUserId,
      input.providerId,
      "profile-photo",
      input.profilePhotoUri,
    );
    uploadedPaths.push(profilePhoto.path);

    const identityFront = await uploadImage(
      input.ownerUserId,
      input.providerId,
      "identity-front",
      input.identityFrontUri,
    );
    uploadedPaths.push(identityFront.path);

    let identityBack: UploadedVerificationImage | null = null;

    if (input.identityBackUri?.trim()) {
      identityBack = await uploadImage(
        input.ownerUserId,
        input.providerId,
        "identity-back",
        input.identityBackUri,
      );
      uploadedPaths.push(identityBack.path);
    }

    return {
      profilePhoto,
      identityFront,
      identityBack,
    };
  } catch (error) {
    if (uploadedPaths.length > 0) {
      try {
        await removeFiles(uploadedPaths);
      } catch (cleanupError) {
        console.warn(
          "Could not clean up partially uploaded verification files:",
          cleanupError,
        );
      }
    }

    throw error;
  }
}

async function createSignedUrl(
  path: string,
  expiresInSeconds = 300,
): Promise<string> {
  const normalizedPath = required(path, "Verification file path");

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(normalizedPath, expiresInSeconds);

  if (error) {
    throw new Error(`Failed to create verification-file URL: ${error.message}`);
  }

  return data.signedUrl;
}

export const ProviderVerificationStorage = {
  uploadImage,
  uploadVerificationImages,
  removeFiles,
  createSignedUrl,
};
