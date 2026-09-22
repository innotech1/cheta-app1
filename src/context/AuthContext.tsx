import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import * as authService from '../services/authService';
import { setAuthToken } from '../services/apiClient';
import { connectSocket, disconnectSocket } from '../services/socket';
import { ApiUser } from '../services/types';

const TOKEN_KEY = 'cheta_auth_token';

type AuthContextValue = {
  user: ApiUser | null;
  isLoading: boolean;
  error: string | null;
  login: (identifier: string, password: string) => Promise<void>;
  signup: (input: {
    displayName: string;
    username: string;
    identifier: string;
    password: string;
  }) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<ApiUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // On app boot, check for a saved token and try to restore the session.
  useEffect(() => {
    (async () => {
      try {
        const token = await SecureStore.getItemAsync(TOKEN_KEY);
        if (token) {
          setAuthToken(token);
          const { user: me } = await authService.getMe();
          setUser(me);
          connectSocket(token);
        }
      } catch {
        // Saved token is invalid/expired — clear it and fall back to signed-out
        await SecureStore.deleteItemAsync(TOKEN_KEY);
        setAuthToken(null);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const login = async (identifier: string, password: string) => {
    setError(null);
    try {
      const { token, user: loggedInUser } = await authService.login({ identifier, password });
      await SecureStore.setItemAsync(TOKEN_KEY, token);
      setAuthToken(token);
      setUser(loggedInUser);
      connectSocket(token);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
      throw err;
    }
  };

  const signup = async (input: {
    displayName: string;
    username: string;
    identifier: string;
    password: string;
  }) => {
    setError(null);
    try {
      const { token, user: newUser } = await authService.signup(input);
      await SecureStore.setItemAsync(TOKEN_KEY, token);
      setAuthToken(token);
      setUser(newUser);
      connectSocket(token);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed');
      throw err;
    }
  };

  const signOut = async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    setAuthToken(null);
    setUser(null);
    disconnectSocket();
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, error, login, signup, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
