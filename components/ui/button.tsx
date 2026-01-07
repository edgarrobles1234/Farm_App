// ============================================
// components/ui/Button.tsx
// ============================================
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, TouchableOpacityProps } from 'react-native';
import { theme } from '../../constants/theme';

interface ButtonProps extends TouchableOpacityProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'tertiary';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const Button = ({ 
  variant = 'primary', 
  size = 'md',
  children,
  style,
  ...props 
}: ButtonProps) => {
  return (
    <TouchableOpacity
      style={[
        buttonStyles.base,
        buttonStyles[variant],
        buttonStyles[`size_${size}`],
        style,
      ]}
      activeOpacity={0.7}
      {...props}
    >
      <Text style={[
        buttonStyles.text,
        buttonStyles[`text_${variant}`],
      ]}>
        {children}
      </Text>
    </TouchableOpacity>
  );
};

const buttonStyles = StyleSheet.create({
  base: {
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {
    backgroundColor: theme.brand.primary,
  },
  secondary: {
    backgroundColor: theme.brand.secondary,
  },
  tertiary: {
    backgroundColor: theme.brand.tertiary,
  },
  outline: {
    backgroundColor: theme.neutral.white,
    borderWidth: 1,
    borderColor: theme.neutral[300],
  },
  size_sm: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
  },
  size_md: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
  },
  size_lg: {
    paddingVertical: 20,
    paddingHorizontal: theme.spacing.xl,
  },
  text: {
    fontSize: theme.typography.fontSizes.h4, // 16
    fontWeight: theme.typography.fontWeights.semibold,
    fontFamily: theme.typography.fontFamily,
  },
  text_primary: {
    color: theme.neutral.white,
  },
  text_secondary: {
    color: theme.neutral[900],
  },
  text_tertiary: {
    color: theme.neutral.white,
  },
  text_outline: {
    color: theme.neutral[700],
  },
});