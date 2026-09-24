import { API_BASE_URL } from '../config/api';

// Set by AuthContext whenever the token changes (after login/signup/boot/logout),
// so every request can attach it without each call needing to know about auth.
let currentToken: string | null = null;
export function setAuthToken(token: string | null) {
  currentToken = token;
}
export function getAuthToken() {
  return currentToken;
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
};

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body } = options;

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (currentToken) {
    headers.Authorization = `Bearer ${currentToken}`;
  }

  // Strip trailing slashes from base and leading slashes from path,
  // then join with a single slash. Prevents URLs like ".../api//auth/login".
  const base = API_BASE_URL.replace(/\/+$/, '');
  const cleanPath = path.replace(/^\/+/, '');
  const fullUrl = `${base}/${cleanPath}`;

  console.log('[Cheta] Requesting:', method, fullUrl);
  if (body !== undefined) {
    console.log('[Cheta] Body:', JSON.stringify(body));
  }

  let response: Response;
  try {
    response = await fetch(fullUrl, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    console.log('[Cheta] Response status:', response.status);
  } catch (err) {
    console.log('[Cheta] Fetch threw:', err);
    throw new ApiError(
      'Could not reach the server. Check that the backend is running and reachable.',
      0
    );
  }

  const isJson = response.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await response.json() : null;
  console.log('[Cheta] Response body:', JSON.stringify(data));

  if (!response.ok) {
    throw new ApiError(data?.message || `Request failed (${response.status})`, response.status);
  }

  return data as T;
}