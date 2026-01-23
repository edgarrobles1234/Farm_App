// components/GroceryListCard.tsx
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import React from 'react';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/useTheme';
import { theme } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import type { GroceryList } from '../../../mockdata/GroceryList';

interface GroceryListCardProps {
  list: GroceryList;
}

export function GroceryListCard({ list }: GroceryListCardProps) {
  const { colors } = useTheme();

  const handlePress = () => {
    router.push({ pathname: '/grocery-list/[id]', params: { id: list.id } });
  };

  const handleOptionsPress = () => {
    // Handle options menu
  };

  // Get first 3-4 items for preview
  const previewItems = list.items.slice(0, 4);

  return (
    <View style={styles.container}>
      {/* Grey touchable card with items preview */}
      <TouchableOpacity 
        onPress={handlePress}
        style={[styles.card, { backgroundColor: colors.card }]}
        activeOpacity={0.7}
      >
        {/* Pin icon */}
        {list.isPinned && (
          <Ionicons 
            name="pin" 
            size={20} 
            color={theme.brand.red} 
            style={styles.pinIcon}
          />
        )}

        {/* Items Preview */}
        <View style={styles.itemsPreviewSection}>
          {previewItems.map((item) => (
            <View key={item.id} style={styles.previewItem}>
              {/* Checkbox preview */}
              <View style={[
                styles.previewCheckbox,
                { borderColor: colors.border.strong },
                item.checked && { 
                  backgroundColor: colors.text.primary, 
                  borderColor: colors.text.primary 
                }
              ]}>
                {item.checked && (
                  <Ionicons name="checkmark" size={12} color={colors.background} />
                )}
              </View>

              {/* Item text */}
              <ThemedText 
                style={[
                  styles.previewItemText,
                  { color: colors.text.secondary },
                  item.checked && styles.previewItemTextChecked
                ]}
                numberOfLines={1}
              >
                {item.quantity && `${item.quantity} `}
                {item.name}
              </ThemedText>

              {/* Pin icon for pinned items */}
              {item.isPinned && (
                <Ionicons 
                  name="pin" 
                  size={12} 
                  color={colors.text.tertiary} 
                  style={styles.itemPinIcon}
                />
              )}
            </View>
          ))}

          {/* Show "... and X more" if there are more items */}
          {list.items.length > 4 && (
            <ThemedText style={[styles.moreItems, { color: colors.text.tertiary }]}>
              ... and {list.items.length - 4} more
            </ThemedText>
          )}
        </View>
      </TouchableOpacity>

      {/* Title, Date and Options - Outside the grey card */}
      <View style={styles.footer}>
        <View style={styles.footerText}>
          <ThemedText style={styles.title}>{list.title}</ThemedText>
          <ThemedText style={[styles.date, { color: colors.text.secondary }]}>
            {list.date}
          </ThemedText>
        </View>

        <TouchableOpacity 
          onPress={handleOptionsPress}
          style={styles.optionsButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="ellipsis-horizontal" size={24} color={colors.text.secondary} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.lg,
  },
  card: {
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    minHeight: 160,
    position: 'relative',
  },
  pinIcon: {
    position: 'absolute',
    top: theme.spacing.md,
    right: theme.spacing.md,
  },
  itemsPreviewSection: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  previewItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 2,
  },
  previewCheckbox: {
    width: 16,
    height: 16,
    borderRadius: 4,
    borderWidth: 1.5,
    marginRight: theme.spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewItemText: {
    fontSize: theme.typography.fontSizes.h4,
    flex: 1,
  },
  previewItemTextChecked: {
    textDecorationLine: 'line-through',
    opacity: 0.5,
  },
  itemPinIcon: {
    marginLeft: theme.spacing.xs,
  },
  moreItems: {
    fontSize: theme.typography.fontSizes.body,
    fontStyle: 'italic',
    marginTop: theme.spacing.xs,
    paddingLeft: theme.spacing.lg,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: theme.spacing.sm,
  },
  footerText: {
    flex: 1,
  },
  title: {
    fontSize: theme.typography.fontSizes.h3,
    fontWeight: '600',
    marginBottom: 2,
  },
  date: {
    fontSize: theme.typography.fontSizes.h5,
  },
  optionsButton: {
    padding: theme.spacing.xs,
  },
});