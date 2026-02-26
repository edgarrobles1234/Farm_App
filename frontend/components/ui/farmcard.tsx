import React from "react";
import { Image, StyleSheet, TouchableOpacity, View } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useTheme } from "@/hooks/useTheme";
import { BorderRadius, Spacing } from "@/constants/theme";
import { theme } from "@/constants/theme";

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

const PRODUCTS_LINES = 2;
const PRODUCTS_LINE_HEIGHT = 14; // tweak if you want tighter/looser

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

  const safeProducts = products?.trim().length ? products : " "; // keeps reserved height even if empty

  return (
    <View style={styles.shadowWrapper}>
      <TouchableOpacity
        style={[styles.farmCard, { backgroundColor: colors.card }]}
        onPress={onPress}
        activeOpacity={0.85}
      >
        {/* Image (fixed height, so all cards start the same) */}
        <ThemedView
          style={[
            styles.farmImage,
            { backgroundColor: isDark ? colors.border.default : colors.border.light },
          ]}
        >
          {imageUrl ? (
            <Image source={{ uri: imageUrl }} style={styles.farmImageContent} />
          ) : null}
        </ThemedView>

        {/* Info */}
        <ThemedView style={styles.farmInfo}>
          {/* Header (clamped to 1 line) */}
          <ThemedView style={styles.farmHeader}>
            <ThemedText
              type="defaultSemiBold"
              style={styles.farmName}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {name}
            </ThemedText>

            <TouchableOpacity onPress={onFavoritePress} hitSlop={8}>
              <IconSymbol
                name={isFavorite ? "heart.fill" : "heart"}
                size={18}
                color={isFavorite ? colors.text.primary : colors.icon.default}
              />
            </TouchableOpacity>
          </ThemedView>

          {/* Rating row (distance clamped too) */}
          <ThemedView style={styles.farmRating}>
            <IconSymbol name="star.fill" size={14} color="#FFD700" />
            <ThemedText style={[styles.ratingText, { color: colors.text.secondary }]}>
              {rating} ({reviews})
            </ThemedText>

            <ThemedText
              style={[styles.distanceText, { color: colors.text.tertiary }]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              📍 {distance}
            </ThemedText>
          </ThemedView>

          {/* Products: reserve exactly 2 lines worth of height */}
          <View style={styles.productsBlock}>
            <ThemedText
              style={[styles.farmProducts, { color: colors.text.tertiary }]}
              numberOfLines={PRODUCTS_LINES}
              ellipsizeMode="tail"
            >
              {safeProducts}
            </ThemedText>
          </View>

          {/* Actions (fixed-ish height buttons) */}
          <ThemedView style={styles.farmActions}>
            <TouchableOpacity
              style={[styles.actionButton, { borderColor: colors.border.default }]}
              onPress={onDirectionPress}
            >
              <IconSymbol name="location.fill" size={14} color={colors.icon.default} />
              <ThemedText style={[styles.actionText, { color: colors.text.secondary }]}>
                Direction
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, { borderColor: colors.border.default }]}
              onPress={onSharePress}
            >
              <IconSymbol name="square.and.arrow.up" size={14} color={colors.icon.default} />
              <ThemedText style={[styles.actionText, { color: colors.text.secondary }]}>
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 4,
    shadowOpacity: 0.25,
    elevation: 4,
    borderRadius: BorderRadius.lg,
  },

  farmCard: {
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
  },

  farmImage: {
    height: 110,
    width: "100%",
  },

  farmImageContent: {
    height: "100%",
    width: "100%",
  },

  farmInfo: {
    padding: Spacing.md,
  },

  farmHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.xs,
  },

  farmName: {
    flex: 1,
    marginRight: Spacing.sm,
    fontSize: theme.typography.fontSizes.h4,
  },

  farmRating: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.xs,
  },

  ratingText: {
    fontSize: 12,
    marginLeft: Spacing.xs,
  },

  distanceText: {
    fontSize: 12,
    marginLeft: Spacing.sm,
    flexShrink: 1,
  },

  // ✅ This is what equalizes the card heights
  productsBlock: {
    minHeight: PRODUCTS_LINES * PRODUCTS_LINE_HEIGHT,
    marginBottom: Spacing.sm,
  },

  farmProducts: {
    fontSize: 11,
    lineHeight: PRODUCTS_LINE_HEIGHT,
  },

  farmActions: {
    flexDirection: "row",
    gap: Spacing.sm,
  },

  actionButton: {
    flex: 1,
    height: 32, // ✅ consistent button height
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    gap: Spacing.xs,
  },

  actionText: {
    fontSize: 11,
  },
});