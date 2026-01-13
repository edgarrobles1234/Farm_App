// ============================================
// components/ui/Input.tsx
// ============================================
import React from 'react';
import { View, TextInput, Text, StyleSheet, TextInputProps } from 'react-native';
import { theme } from '../../constants/theme';

interface InputProps extends TextInputProps {
  error?: string;
  label?: string;
}

export const Input = ({ error, label, style, ...props }: InputProps) => (
  <View>
    {label && (
      <Text style={inputStyles.label}>{label}</Text>
    )}
    <TextInput
      style={[
        inputStyles.base,
        error && inputStyles.error,
        style,
      ]}
      placeholderTextColor={theme.neutral[400]}
      {...props}
    />
    {error && (
      <Text style={inputStyles.errorText}>{error}</Text>
    )}
  </View>
);

const inputStyles = StyleSheet.create({
  label: {
    fontSize: theme.typography.fontSizes.h5, // 14
    fontWeight: theme.typography.fontWeights.medium,
    fontFamily: theme.typography.fontFamily,
    color: theme.neutral[700],
    marginBottom: theme.spacing.xs,
  },
  base: {
    backgroundColor: theme.neutral.white,
    borderWidth: 1,
    borderColor: theme.neutral[200],
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    fontSize: theme.typography.fontSizes.h4, // 16
    fontFamily: theme.typography.fontFamily,
    color: theme.neutral[900],
  },
  error: {
    borderColor: theme.brand.red,
  },
  errorText: {
    fontSize: theme.typography.fontSizes.body, // 10
    fontFamily: theme.typography.fontFamily,
    color: theme.brand.red,
    marginTop: theme.spacing.xs,
  },
});