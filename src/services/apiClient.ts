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

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (err) {
    // Network-level failure (server down, wrong URL, adb reverse not set up, etc.)
    throw new ApiError(
      'Could not reach the server. Check that the backend is running and reachable.',
      0
    );
  }

  const isJson = response.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await response.json() : null;

  if (!response.ok) {
    throw new ApiError(data?.message || `Request failed (${response.status})`, response.status);
  }

  return data as T;
}
