import {
  documentDirectory,
  getInfoAsync,
  makeDirectoryAsync,
  readDirectoryAsync,
  downloadAsync,
  deleteAsync,
} from "expo-file-system/legacy";

const IMAGE_DIR = `${documentDirectory}images/`;
const MAX_CACHE_BYTES = 200 * 1024 * 1024; // 200 MB

async function ensureImageDir(): Promise<void> {
  const dirInfo = await getInfoAsync(IMAGE_DIR);
  if (!dirInfo.exists) {
    await makeDirectoryAsync(IMAGE_DIR, { intermediates: true });
  }
}

/** Returns all cached image file infos sorted oldest-first (by modificationTime). */
async function listCachedFiles(): Promise<
  Array<{ uri: string; size: number; modificationTime: number }>
> {
  const dirInfo = await getInfoAsync(IMAGE_DIR);
  if (!dirInfo.exists) return [];

  const names = await readDirectoryAsync(IMAGE_DIR);
  const infos: Array<{ uri: string; size: number; modificationTime: number }> = [];

  for (const name of names) {
    const uri = `${IMAGE_DIR}${name}`;
    const info = await getInfoAsync(uri, { size: true });
    if (info.exists && !info.isDirectory) {
      infos.push({
        uri,
        size: (info as { size?: number }).size ?? 0,
        modificationTime: (info as { modificationTime?: number }).modificationTime ?? 0,
      });
    }
  }

  infos.sort((a, b) => a.modificationTime - b.modificationTime);
  return infos;
}

/**
 * Enforces the 200 MB cache cap before writing a new file.
 * Evicts the oldest files until there is enough room for `incomingBytes`.
 */
async function evictIfNeeded(incomingBytes: number): Promise<void> {
  const files = await listCachedFiles();
  let totalBytes = files.reduce((sum, f) => sum + f.size, 0);

  for (const file of files) {
    if (totalBytes + incomingBytes <= MAX_CACHE_BYTES) break;
    try {
      await deleteAsync(file.uri, { idempotent: true });
      totalBytes -= file.size;
    } catch {
      // Best-effort eviction
    }
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

  // Fetch size headers to anticipate space needed; fall back to 0 if unknown.
  let incomingBytes = 0;
  try {
    const head = await fetch(remoteUrl, { method: "HEAD" });
    const cl = head.headers.get("content-length");
    if (cl) incomingBytes = parseInt(cl, 10);
  } catch {
    // Ignore — we'll evict conservatively
  }

  await evictIfNeeded(incomingBytes);

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

/**
 * Startup sweep: removes any cached image files whose recipe ID is not in
 * `knownRecipeIds`. Call once at app startup after the recipe store hydrates.
 */
export async function sweepOrphanedImages(
  knownRecipeIds: string[],
): Promise<void> {
  const knownSet = new Set(knownRecipeIds);
  const dirInfo = await getInfoAsync(IMAGE_DIR);
  if (!dirInfo.exists) return;

  let names: string[];
  try {
    names = await readDirectoryAsync(IMAGE_DIR);
  } catch {
    return;
  }

  for (const name of names) {
    const recipeId = name.replace(/\.jpg$/i, "");
    if (!knownSet.has(recipeId)) {
      try {
        await deleteAsync(`${IMAGE_DIR}${name}`, { idempotent: true });
      } catch {
        // Best-effort
      }
    }
  }
}
