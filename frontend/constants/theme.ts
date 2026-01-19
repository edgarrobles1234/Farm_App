import { Platform } from 'react-native';

// Your brand colors (these stay the same in both themes)
export const BrandColors = {
  red: '#E14242',
  primary: '#FE9801',
  light: '#F4EEC7',
  secondary: '#CCDA46',
  tertiary: '#697C37',
  darkerOrange: '#FF6F00',
};

// Neutral colors (for UI elements)
export const NeutralColors = {
  50: '#F9FAFB',
  100: '#F3F4F6',
  200: '#E5E7EB',
  300: '#D1D5DB',
  400: '#9CA3AF',
  500: '#6B7280',
  600: '#4B5563',
  700: '#374151',
  800: '#1F2937',
  900: '#111827',
  white: '#FFFFFF',
  black: '#000000',
};

// Semantic colors (same in both themes)
export const SemanticColors = {
  success: BrandColors.tertiary,
  error: BrandColors.red,
  warning: BrandColors.primary,
  info: BrandColors.secondary,
};

// Light theme colors
const lightTheme = {
  background: NeutralColors.white,
  surface: NeutralColors.white,
  card: NeutralColors.white,
  text: {
    primary: '#11181C',
    secondary: NeutralColors[600],
    tertiary: NeutralColors[500],
    disabled: NeutralColors[400],
  },
  border: {
    light: NeutralColors[200],
    default: NeutralColors[300],
    strong: NeutralColors[400],
  },
  icon: {
    default: '#687076',
    active: BrandColors.primary,
  },
  input: {
    background: NeutralColors.white,
    border: NeutralColors[300],
    placeholder: NeutralColors[400],
    text: '#11181C',
  },
};

// Dark theme colors
const darkTheme = {
  background: '#151718',
  surface: NeutralColors[900],
  card: NeutralColors[800],
  text: {
    primary: '#ECEDEE',
    secondary: NeutralColors[300],
    tertiary: NeutralColors[400],
    disabled: NeutralColors[600],
  },
  border: {
    light: NeutralColors[800],
    default: NeutralColors[700],
    strong: NeutralColors[600],
  },
  icon: {
    default: '#9BA1A6',
    active: BrandColors.primary,
  },
  input: {
    background: NeutralColors[800],
    border: NeutralColors[700],
    placeholder: NeutralColors[500],
    text: '#ECEDEE',
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

// Typography scale
export const Typography = {
  fontSizes: {
    h1: 38,
    h2: 23,
    h3: 20,
    h4: 16,
    h5: 14,
    body: 10,
    secondary: 6,
  },
  fontWeights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
  lineHeights: {
    auto: 1.5,
  },
  fontFamily: 'Open Sans',
};

// Spacing scale
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
  '4xl': 96,
};

// Border radius
export const BorderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 24,
  full: 9999,
};

// Shadows
export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 10,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
};

// Main theme object
export const theme = {
  light: lightTheme,
  dark: darkTheme,
  brand: BrandColors,
  neutral: NeutralColors,
  semantic: SemanticColors,
  fonts: Fonts,
  typography: Typography,
  spacing: Spacing,
  borderRadius: BorderRadius,
  shadows: Shadows,
};

export type Theme = typeof theme;
export type ThemeColors = typeof lightTheme;
