export async function uploadMedia(
  uri: string,
  type: 'image' | 'video',
  fileName?: string
): Promise<UploadedMedia> {
  const token = getAuthToken();
  const formData = new FormData();

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

  // Single-slash join
  const base = API_BASE_URL.replace(/\/+$/, '');
  const url = `${base}/media/upload`;

  console.log('[Cheta] Uploading to:', url);

  let response: Response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
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