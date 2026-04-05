import * as FileSystem from 'expo-file-system';

const IMAGE_DIR = `${FileSystem.documentDirectory}images/`;

async function ensureImageDir(): Promise<void> {
  const dirInfo = await FileSystem.getInfoAsync(IMAGE_DIR);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(IMAGE_DIR, { intermediates: true });
  }
}

export async function cacheImage(
  remoteUrl: string,
  recipeId: string
): Promise<string> {
  await ensureImageDir();

  const localUri = `${IMAGE_DIR}${recipeId}.jpg`;
  const fileInfo = await FileSystem.getInfoAsync(localUri);

  if (fileInfo.exists) {
    return localUri;
  }

  const downloadResult = await FileSystem.downloadAsync(remoteUrl, localUri);
  return downloadResult.uri;
}

export function getCachedImageUri(recipeId: string): string | null {
  // Note: This is a sync hint — the file may not exist.
  // For guaranteed checks, use the async version.
  const localUri = `${IMAGE_DIR}${recipeId}.jpg`;
  return localUri;
}

export async function getCachedImageUriAsync(
  recipeId: string
): Promise<string | null> {
  const localUri = `${IMAGE_DIR}${recipeId}.jpg`;
  const fileInfo = await FileSystem.getInfoAsync(localUri);
  return fileInfo.exists ? localUri : null;
}
