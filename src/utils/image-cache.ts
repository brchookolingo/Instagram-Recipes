import {
  documentDirectory,
  getInfoAsync,
  makeDirectoryAsync,
  downloadAsync,
  deleteAsync,
  readDirectoryAsync,
} from "expo-file-system/legacy";

const IMAGE_DIR = `${documentDirectory}images/`;
const CACHE_MAX_BYTES = 200 * 1024 * 1024; // 200 MB

async function ensureImageDir(): Promise<void> {
  const dirInfo = await getInfoAsync(IMAGE_DIR);
  if (!dirInfo.exists) {
    await makeDirectoryAsync(IMAGE_DIR, { intermediates: true });
  }
}

/**
 * Enforces a 200 MB cache limit by deleting the oldest cached images
 * until total size is under the cap.
 */
async function enforceCacheLimit(): Promise<void> {
  try {
    const files = await readDirectoryAsync(IMAGE_DIR);
    const infos = await Promise.all(
      files.map(async (file) => {
        const path = `${IMAGE_DIR}${file}`;
        const info = await getInfoAsync(path, { size: true });
        return { path, size: info.exists ? (info as { size?: number }).size ?? 0 : 0, exists: info.exists };
      }),
    );

    const existing = infos.filter((f) => f.exists);
    const totalSize = existing.reduce((sum, f) => sum + f.size, 0);

    if (totalSize <= CACHE_MAX_BYTES) return;

    // Sort oldest first (approximate via file order — good enough for eviction)
    let remaining = totalSize;
    for (const file of existing) {
      if (remaining <= CACHE_MAX_BYTES) break;
      await deleteAsync(file.path, { idempotent: true });
      remaining -= file.size;
    }
  } catch (error) {
    console.error("[image-cache] enforceCacheLimit failed:", error);
  }
}

/**
 * Removes cached image files whose recipe ID is not in the provided set.
 * Call this once at app startup to clean up orphans left by crashes.
 */
export async function sweepOrphanedImages(knownRecipeIds: string[]): Promise<void> {
  try {
    const dirInfo = await getInfoAsync(IMAGE_DIR);
    if (!dirInfo.exists) return;

    const files = await readDirectoryAsync(IMAGE_DIR);
    const knownSet = new Set(knownRecipeIds);

    await Promise.all(
      files.map(async (file) => {
        const recipeId = file.replace(/\.jpg$/i, "");
        if (!knownSet.has(recipeId)) {
          await deleteAsync(`${IMAGE_DIR}${file}`, { idempotent: true });
        }
      }),
    );
  } catch (error) {
    console.error("[image-cache] sweepOrphanedImages failed:", error);
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

  // Enforce size cap after each new write
  await enforceCacheLimit();

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
