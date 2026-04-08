import {
  documentDirectory,
  getInfoAsync,
  makeDirectoryAsync,
  downloadAsync,
  deleteAsync,
} from "expo-file-system/legacy";

const IMAGE_DIR = `${documentDirectory}images/`;

async function ensureImageDir(): Promise<void> {
  const dirInfo = await getInfoAsync(IMAGE_DIR);
  if (!dirInfo.exists) {
    await makeDirectoryAsync(IMAGE_DIR, { intermediates: true });
  }
}

export async function cacheImage(
  remoteUrl: string,
  recipeId: string,
): Promise<string> {
  await ensureImageDir();

  const localUri = `${IMAGE_DIR}${recipeId}.jpg`;
  const fileInfo = await getInfoAsync(localUri);

  if (fileInfo.exists) {
    return localUri;
  }

  const downloadResult = await downloadAsync(remoteUrl, localUri);
  return downloadResult.uri;
}

/**
 * Deletes the cached image for a recipe. Safe to call even if no image
 * was cached — silently ignores missing files.
 */
export async function deleteCachedImage(recipeId: string): Promise<void> {
  const localUri = `${IMAGE_DIR}${recipeId}.jpg`;
  try {
    const fileInfo = await getInfoAsync(localUri);
    if (fileInfo.exists) {
      await deleteAsync(localUri, { idempotent: true });
    }
  } catch (error) {
    console.error("[image-cache] deleteCachedImage failed:", error);
  }
}
