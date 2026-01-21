import React from 'react';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useTheme } from '@/hooks/useTheme';
import { BorderRadius, Spacing } from '@/constants/theme';
import { theme } from '@/constants/theme';

interface FarmCardProps {
  name: string;
  rating: number;
  reviews: number;
  distance: string;
  products: string;
  imageUrl?: string;
  onPress?: () => void;
  onDirectionPress?: () => void;
  onSharePress?: () => void;
  onFavoritePress?: () => void;
  isFavorite?: boolean;
}

export default function FarmCard({
  name,
  rating,
  reviews,
  distance,
  products,
  imageUrl,
  onPress,
  onDirectionPress,
  onSharePress,
  onFavoritePress,
  isFavorite = false,
}: FarmCardProps) {
  const { colors, isDark } = useTheme();

  return (
    <View style={styles.shadowWrapper}>
      <TouchableOpacity
        style={[styles.farmCard, { backgroundColor: colors.card }]}
        onPress={onPress}
        activeOpacity={0.85}
      >
        {/* Image */}
        <ThemedView
          style={[
            styles.farmImage,
            {
              backgroundColor: isDark
                ? colors.border.default
                : colors.border.light,
            },
          ]}
        >
          {imageUrl && (
            <Image source={{ uri: imageUrl }} style={styles.farmImageContent} />
          )}
        </ThemedView>

        {/* Info */}
        <ThemedView style={styles.farmInfo}>
          <ThemedView style={styles.farmHeader}>
            <ThemedText type="defaultSemiBold" style={styles.farmName}>
              {name}
            </ThemedText>

            <TouchableOpacity onPress={onFavoritePress}>
              <IconSymbol
                name={isFavorite ? 'heart.fill' : 'heart'}
                size={18}
                color={
                  isFavorite
                    ? colors.text.primary
                    : colors.icon.default
                }
              />
            </TouchableOpacity>
          </ThemedView>

          <ThemedView style={styles.farmRating}>
            <IconSymbol name="star.fill" size={14} color="#FFD700" />
            <ThemedText
              style={[styles.ratingText, { color: colors.text.secondary }]}
            >
              {rating} ({reviews})
            </ThemedText>
            <ThemedText
              style={[styles.distanceText, { color: colors.text.tertiary }]}
            >
              📍 {distance}
            </ThemedText>
          </ThemedView>

          <ThemedText
            style={[styles.farmProducts, { color: colors.text.tertiary }]}
          >
            {products}
          </ThemedText>

          <ThemedView style={styles.farmActions}>
            <TouchableOpacity
              style={[
                styles.actionButton,
                { borderColor: colors.border.default },
              ]}
              onPress={onDirectionPress}
            >
              <IconSymbol
                name="location.fill"
                size={14}
                color={colors.icon.default}
              />
              <ThemedText
                style={[
                  styles.actionText,
                  { color: colors.text.secondary },
                ]}
              >
                Direction
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.actionButton,
                { borderColor: colors.border.default },
              ]}
              onPress={onSharePress}
            >
              <IconSymbol
                name="square.and.arrow.up"
                size={14}
                color={colors.icon.default}
              />
              <ThemedText
                style={[
                  styles.actionText,
                  { color: colors.text.secondary },
                ]}
              >
                Share
              </ThemedText>
            </TouchableOpacity>
          </ThemedView>
        </ThemedView>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  shadowWrapper: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 }, 
    shadowRadius: 4,                      
    shadowOpacity: 0.25,                  
    elevation: 4,                          
    borderRadius: BorderRadius.lg,
    marginRight: Spacing.md,
    marginBottom: 6,                       
  },

  farmCard: {
    width: 300,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden', // OK here (keeps image corners rounded)
  },

  farmImage: {
    height: 120,
    width: '100%',
  },

  farmImageContent: {
    height: '100%',
    width: '100%',
  },

  farmInfo: {
    padding: Spacing.md,
  },

  farmHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },

  farmName: {
    flex: 1,
    fontSize: theme.typography.fontSizes.h4,
  },

  farmRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },

  ratingText: {
    fontSize: 12,
    marginLeft: Spacing.xs,
  },

  distanceText: {
    fontSize: 12,
    marginLeft: Spacing.sm,
  },

  farmProducts: {
    fontSize: 11,
    marginBottom: Spacing.sm,
  },

  farmActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },

  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    gap: Spacing.xs,
  },

  actionText: {
    fontSize: 11,
  },
});
