import {
  documentDirectory,
  getInfoAsync,
  makeDirectoryAsync,
  downloadAsync,
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

export function getCachedImageUri(recipeId: string): string | null {
  const localUri = `${IMAGE_DIR}${recipeId}.jpg`;
  return localUri;
}

export async function getCachedImageUriAsync(
  recipeId: string,
): Promise<string | null> {
  const localUri = `${IMAGE_DIR}${recipeId}.jpg`;
  const fileInfo = await getInfoAsync(localUri);
  return fileInfo.exists ? localUri : null;
}
