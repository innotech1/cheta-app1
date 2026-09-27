import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeMode = 'light' | 'dark' | 'system';

type ThemeColors = {
  primary: string;
  primaryLight: string;
  accent: string;
  background: string;
  backgroundDark: string;
  text: string;
  textMuted: string;
  border: string;
  danger: string;
  success: string;
};

const lightColors: ThemeColors = {
  primary: '#4A1942',
  primaryLight: '#6B2A61',
  accent: '#F2E8D5',
  background: '#FFFFFF',
  backgroundDark: '#F5F5F5',
  text: '#1A1A1A',
  textMuted: '#767676',
  border: '#E6E6E6',
  danger: '#E0245E',
  success: '#17BF63',
};

const darkColors: ThemeColors = {
  primary: '#B794D4',       // lighter purple for readability on dark bg
  primaryLight: '#D4B5E8',
  accent: '#F2E8D5',
  background: '#0D0A0C',    // near-black
  backgroundDark: '#1A0F18',
  text: '#F5F5F5',
  textMuted: '#9E9E9E',
  border: '#2A2A2A',
  danger: '#FF4C7A',
  success: '#3DD68C',
};

type ThemeContextValue = {
  mode: ThemeMode;
  scheme: 'light' | 'dark';
  colors: ThemeColors;
  setMode: (mode: ThemeMode) => void;
  toggle: () => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const STORAGE_KEY = 'cheta_theme_mode';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme() ?? 'light';
  const [mode, setModeState] = useState<ThemeMode>('system');
  const [hydrated, setHydrated] = useState(false);

  // Load saved preference on boot
  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved === 'light' || saved === 'dark' || saved === 'system') {
          setModeState(saved);
        }
      } finally {
        setHydrated(true);
      }
    })();
  }, []);

  const setMode = (next: ThemeMode) => {
    setModeState(next);
    AsyncStorage.setItem(STORAGE_KEY, next).catch(() => {});
  };

  const scheme: 'light' | 'dark' =
    mode === 'system' ? (systemScheme === 'dark' ? 'dark' : 'light') : mode;

  const colors = scheme === 'dark' ? darkColors : lightColors;

  const toggle = () => setMode(scheme === 'dark' ? 'light' : 'dark');

  return (
    <ThemeContext.Provider value={{ mode, scheme, colors, setMode, toggle }}>
      {hydrated ? children : null}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider');
  return ctx;
}