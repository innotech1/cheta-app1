// src/theme/colors.ts
// Static fallback — used only in places that can't access ThemeContext
// (e.g. React Navigation screenOptions functions declared at module scope).
// All screens should prefer useColors() from ./ThemeContext for live theming.

export const colors = {
  primary: '#4A1942',
  primaryLight: '#6B2A61',
  accent: '#F2E8D5',
  background: '#FFFFFF',
  backgroundDark: '#1A0F18',
  text: '#1A1A1A',
  textMuted: '#767676',
  border: '#E6E6E6',
  danger: '#E0245E',
  success: '#17BF63',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const radius = {
  sm: 8,
  md: 14,
  full: 999,
};