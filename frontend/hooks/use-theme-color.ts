// hooks/use-theme-color.ts
import { useTheme } from '@/hooks/useTheme';

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof ReturnType<typeof useTheme>['colors']
) {
  const { colors, isDark } = useTheme();
  const colorFromProps = isDark ? props.dark : props.light;

  if (colorFromProps) {
    return colorFromProps;
  } else {
    // Return the color from theme
    return colors[colorName];
  }
}