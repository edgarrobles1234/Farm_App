// hooks/useTheme.ts
import { useColorScheme } from 'react-native';
import { theme } from '@/constants/theme';

export const useTheme = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  return {
    colors: isDark ? theme.dark : theme.light,
    isDark,
    theme, // Full theme object with spacing, typography, etc.
  };
};