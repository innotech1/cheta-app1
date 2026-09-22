import { apiRequest } from './apiClient';
import { ApiUser } from './types';

export function signup(input: {
  displayName: string;
  username: string;
  identifier: string;
  password: string;
}) {
  return apiRequest<{ token: string; user: ApiUser }>('/auth/signup', {
    method: 'POST',
    body: input,
  });
}

export function login(input: { identifier: string; password: string }) {
  return apiRequest<{ token: string; user: ApiUser }>('/auth/login', {
    method: 'POST',
    body: input,
  });
}

export function getMe() {
  return apiRequest<{ user: ApiUser }>('/auth/me');
}
