import { API_BASE_URL } from '../config/api';
import { getAuthToken } from './apiClient';
import { ApiError } from './apiClient';

export type UploadedMedia = { url: string; mediaType: 'image' | 'video' };

/**
 * Uploads a picked image/video (given its local file:// URI, from
 * expo-image-picker) to the backend and returns the hosted URL + type.
 * Uses a raw fetch with FormData rather than apiRequest, since that wrapper
 * always sends JSON — file uploads need multipart/form-data instead.
 */
export async function uploadMedia(
  uri: string,
  type: 'image' | 'video',
  fileName?: string
): Promise<UploadedMedia> {
  const token = getAuthToken();
  const formData = new FormData();

  // React Native's fetch accepts this special { uri, name, type } shape for
  // file fields — it is NOT a real Blob, but RN's FormData polyfill knows
  // how to turn it into one.
  const inferredExt = uri.split('.').pop()?.toLowerCase() || (type === 'video' ? 'mp4' : 'jpg');
  const mimeType =
    type === 'video'
      ? inferredExt === 'mov'
        ? 'video/quicktime'
        : 'video/mp4'
      : inferredExt === 'png'
      ? 'image/png'
      : 'image/jpeg';

  formData.append('file', {
    uri,
    name: fileName || `upload.${inferredExt}`,
    type: mimeType,
  } as unknown as Blob);

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/media/upload`, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        // Deliberately NOT setting Content-Type — fetch sets the correct
        // multipart/form-data boundary automatically when the body is a
        // FormData instance. Setting it manually breaks the boundary.
      },
      body: formData,
    });
  } catch {
    throw new ApiError('Could not reach the server to upload the file.', 0);
  }

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new ApiError(data?.message || `Upload failed (${response.status})`, response.status);
  }

  return data as UploadedMedia;
}
