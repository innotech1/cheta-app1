import { useTheme } from './ThemeContext';
import type { colors as ColorType } from './colors';

// Drop-in replacement for `import { colors } from '../theme/colors'`
export function useColors() {
  return useTheme().colors;
}