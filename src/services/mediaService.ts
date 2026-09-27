import { File } from 'expo-file-system';
import { API_BASE_URL } from '../config/api';
import { getAuthToken, ApiError } from './apiClient';

export type UploadedMedia = { url: string; mediaType: 'image' | 'video' };

/**
 * Uploads a picked image/video (given its local file:// URI, from
 * expo-image-picker) to the backend and returns the hosted URL + type.
 *
 * IMPORTANT: Expo SDK 57 replaced the global `fetch` with its own
 * implementation (expo/fetch), whose FormData encoder only accepts a
 * string, a real Blob, or an object exposing bytes() as a form part — it
 * throws "Unsupported FormDataPart implementation" for React Native's
 * classic { uri, name, type } shape, which used to work in older SDKs.
 * expo-file-system's `File` class is Blob-compatible (has bytes()), so
 * wrapping the picked URI in one is the fix.
 */
export async function uploadMedia(
  uri: string,
  type: 'image' | 'video',
  fileName?: string
): Promise<UploadedMedia> {
  const token = getAuthToken();
  const inferredExt = uri.split('.').pop()?.toLowerCase() || (type === 'video' ? 'mp4' : 'jpg');
  const name = fileName || `upload.${inferredExt}`;

  const file = new File(uri);
  const formData = new FormData();
  formData.append('file', file, name);

  const base = API_BASE_URL.replace(/\/+$/, '');
  const url = `${base}/media/upload`;

  // Visible via `adb logcat *:S ReactNativeJS:V` on a standalone build,
  // since there's no Metro terminal anymore. Safe to remove once uploads
  // are confirmed working reliably.
  console.log('[Cheta] Uploading to:', url);

  let response: Response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        // Deliberately NOT setting Content-Type — fetch sets the correct
        // multipart/form-data boundary automatically when the body is a
        // FormData instance. Setting it manually breaks the boundary.
      },
      body: formData,
    });
    console.log('[Cheta] Upload status:', response.status);
  } catch (err) {
    console.log('[Cheta] Upload fetch threw:', err);
    throw new ApiError('Could not reach the server to upload the file.', 0);
  }

  const data = await response.json().catch(() => null);
  console.log('[Cheta] Upload response:', JSON.stringify(data));
  if (!response.ok) {
    throw new ApiError(data?.message || `Upload failed (${response.status})`, response.status);
  }

  return data as UploadedMedia;
}
