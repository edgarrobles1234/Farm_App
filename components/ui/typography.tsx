import React from 'react';
import { StyleSheet, Text, TextProps } from 'react-native';
import { NeutralColors, Typography as TypographyScale } from '../../constants/theme';

interface CustomTextProps extends TextProps {
  color?: string;
  className?: string;
}

export const Typography = {
  H1: ({ children, style, color, className, ...props }: CustomTextProps) => (
    <Text
      className={className}
      style={[typographyStyles.h1, color && { color }, style]}
      {...props}
    >
      {children}
    </Text>
  ),

  H2: ({ children, style, color, className, ...props }: CustomTextProps) => (
    <Text
      className={className}
      style={[typographyStyles.h2, color && { color }, style]}
      {...props}
    >
      {children}
    </Text>
  ),

  H3: ({ children, style, color, className, ...props }: CustomTextProps) => (
    <Text
      className={className}
      style={[typographyStyles.h3, color && { color }, style]}
      {...props}
    >
      {children}
    </Text>
  ),

  H4: ({ children, style, color, className, ...props }: CustomTextProps) => (
    <Text
      className={className}
      style={[typographyStyles.h4, color && { color }, style]}
      {...props}
    >
      {children}
    </Text>
  ),

  H5: ({ children, style, color, className, ...props }: CustomTextProps) => (
    <Text
      className={className}
      style={[typographyStyles.h5, color && { color }, style]}
      {...props}
    >
      {children}
    </Text>
  ),

  Body: ({ children, style, color, className, ...props }: CustomTextProps) => (
    <Text
      className={className}
      style={[typographyStyles.body, color && { color }, style]}
      {...props}
    >
      {children}
    </Text>
  ),

  BodyLarge: ({ children, style, color, className, ...props }: CustomTextProps) => (
    <Text
      className={className}
      style={[typographyStyles.bodyLarge, color && { color }, style]}
      {...props}
    >
      {children}
    </Text>
  ),

  BodySmall: ({ children, style, color, className, ...props }: CustomTextProps) => (
    <Text
      className={className}
      style={[typographyStyles.bodySmall, color && { color }, style]}
      {...props}
    >
      {children}
    </Text>
  ),

  Secondary: ({ children, style, color, className, ...props }: CustomTextProps) => (
    <Text
      className={className}
      style={[typographyStyles.secondary, color && { color }, style]}
      {...props}
    >
      {children}
    </Text>
  ),

  Caption: ({ children, style, color, className, ...props }: CustomTextProps) => (
    <Text
      className={className}
      style={[typographyStyles.caption, color && { color }, style]}
      {...props}
    >
      {children}
    </Text>
  ),
};

const typographyStyles = StyleSheet.create({
  h1: {
    fontSize: TypographyScale.fontSizes.h1,
    fontWeight: TypographyScale.fontWeights.semibold,
    color: NeutralColors[900],
    fontFamily: TypographyScale.fontFamily,
    lineHeight: TypographyScale.fontSizes.h1 * TypographyScale.lineHeights.auto,
  },
  h2: {
    fontSize: TypographyScale.fontSizes.h2,
    fontWeight: TypographyScale.fontWeights.semibold,
    color: NeutralColors[900],
    fontFamily: TypographyScale.fontFamily,
    lineHeight: TypographyScale.fontSizes.h2 * TypographyScale.lineHeights.auto,
  },
  h3: {
    fontSize: TypographyScale.fontSizes.h3,
    fontWeight: TypographyScale.fontWeights.semibold,
    color: NeutralColors[900],
    fontFamily: TypographyScale.fontFamily,
    lineHeight: TypographyScale.fontSizes.h3 * TypographyScale.lineHeights.auto,
  },
  h4: {
    fontSize: TypographyScale.fontSizes.h4,
    fontWeight: TypographyScale.fontWeights.semibold,
    color: NeutralColors[900],
    fontFamily: TypographyScale.fontFamily,
    lineHeight: TypographyScale.fontSizes.h4 * TypographyScale.lineHeights.auto,
  },
  h5: {
    fontSize: TypographyScale.fontSizes.h5,
    fontWeight: TypographyScale.fontWeights.semibold,
    color: NeutralColors[900],
    fontFamily: TypographyScale.fontFamily,
    lineHeight: TypographyScale.fontSizes.h5 * TypographyScale.lineHeights.auto,
  },
  body: {
    fontSize: TypographyScale.fontSizes.body,
    fontWeight: TypographyScale.fontWeights.regular,
    color: NeutralColors[700],
    fontFamily: TypographyScale.fontFamily,
    lineHeight: TypographyScale.fontSizes.body * TypographyScale.lineHeights.auto,
  },
  bodyLarge: {
    fontSize: TypographyScale.fontSizes.h4,
    fontWeight: TypographyScale.fontWeights.regular,
    color: NeutralColors[700],
    fontFamily: TypographyScale.fontFamily,
    lineHeight: TypographyScale.fontSizes.h4 * TypographyScale.lineHeights.auto,
  },
  bodySmall: {
    fontSize: TypographyScale.fontSizes.body,
    fontWeight: TypographyScale.fontWeights.regular,
    color: NeutralColors[700],
    fontFamily: TypographyScale.fontFamily,
    lineHeight: TypographyScale.fontSizes.body * TypographyScale.lineHeights.auto,
  },
  secondary: {
    fontSize: TypographyScale.fontSizes.secondary,
    fontWeight: TypographyScale.fontWeights.regular,
    color: NeutralColors[500],
    fontFamily: TypographyScale.fontFamily,
    lineHeight: TypographyScale.fontSizes.secondary * TypographyScale.lineHeights.auto,
  },
  caption: {
    fontSize: TypographyScale.fontSizes.secondary,
    fontWeight: TypographyScale.fontWeights.regular,
    color: NeutralColors[500],
    fontFamily: TypographyScale.fontFamily,
    lineHeight: TypographyScale.fontSizes.secondary * TypographyScale.lineHeights.auto,
  },
});
