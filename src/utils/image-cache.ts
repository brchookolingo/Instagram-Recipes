import {
  documentDirectory,
  getInfoAsync,
  makeDirectoryAsync,
  downloadAsync,
  deleteAsync,
  readDirectoryAsync,
} from "expo-file-system/legacy";
import { redactError } from "./log-redact";

const IMAGE_DIR = `${documentDirectory}images/`;
const CACHE_MAX_BYTES = 200 * 1024 * 1024; // 200 MB
const BATCH_SIZE = 50;

async function ensureImageDir(): Promise<void> {
  const dirInfo = await getInfoAsync(IMAGE_DIR);
  if (!dirInfo.exists) {
    await makeDirectoryAsync(IMAGE_DIR, { intermediates: true });
  }
}

async function runInBatches<T, R>(
  items: T[],
  batchSize: number,
  fn: (item: T) => Promise<R>,
): Promise<PromiseSettledResult<R>[]> {
  const results: PromiseSettledResult<R>[] = [];
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.allSettled(batch.map(fn));
    results.push(...batchResults);
  }
  return results;
}

/**
 * Enforces a 200 MB cache limit by deleting the oldest cached images
 * until total size is under the cap. Resilient to per-file errors.
 */
async function enforceCacheLimit(): Promise<void> {
  try {
    const files = await readDirectoryAsync(IMAGE_DIR);
    const infoResults = await runInBatches(files, BATCH_SIZE, async (file) => {
      const path = `${IMAGE_DIR}${file}`;
      const info = await getInfoAsync(path);
      return {
        path,
        size: info.exists ? (info as { size?: number }).size ?? 0 : 0,
        exists: info.exists,
      };
    });

    const existing = infoResults
      .filter((r): r is PromiseFulfilledResult<{ path: string; size: number; exists: boolean }> => r.status === "fulfilled")
      .map((r) => r.value)
      .filter((f) => f.exists);

    const totalSize = existing.reduce((sum, f) => sum + f.size, 0);
    if (totalSize <= CACHE_MAX_BYTES) return;

    let remaining = totalSize;
    for (const file of existing) {
      if (remaining <= CACHE_MAX_BYTES) break;
      try {
        await deleteAsync(file.path, { idempotent: true });
        remaining -= file.size;
      } catch {
        // Skip single-file failures; keep draining the cache.
      }
    }
  } catch (error) {
    console.error("[image-cache] enforceCacheLimit failed:", redactError(error));
  }
}

/**
 * Removes cached image files whose recipe ID is not in the provided set.
 * Call this once at app startup to clean up orphans left by crashes.
 * Resilient to per-file errors.
 */
export async function sweepOrphanedImages(knownRecipeIds: string[]): Promise<void> {
  try {
    const dirInfo = await getInfoAsync(IMAGE_DIR);
    if (!dirInfo.exists) return;

    const files = await readDirectoryAsync(IMAGE_DIR);
    const knownSet = new Set(knownRecipeIds);

    await runInBatches(files, BATCH_SIZE, async (file) => {
      const recipeId = file.replace(/\.jpg$/i, "");
      if (!knownSet.has(recipeId)) {
        await deleteAsync(`${IMAGE_DIR}${file}`, { idempotent: true });
      }
    });
  } catch (error) {
    console.error("[image-cache] sweepOrphanedImages failed:", redactError(error));
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
    console.error("[image-cache] deleteCachedImage failed:", redactError(error));
  }
}
