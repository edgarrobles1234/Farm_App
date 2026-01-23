// app/grocery-list/[id].tsx
import { StyleSheet, View, FlatList, TouchableOpacity, TextInput } from 'react-native';
import React, { useState } from 'react';
import { useLocalSearchParams, Stack, router } from 'expo-router';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/useTheme';
import { theme } from '@/constants/theme';
import { mockGroceryLists, GroceryItem } from '@/mockdata/GroceryList';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function GroceryListDetailScreen() {
  const { id } = useLocalSearchParams();
  const { colors } = useTheme();
  
  const list = mockGroceryLists.find(l => l.id === id);
  const [items, setItems] = useState(list?.items || []);
  const [isPinned, setIsPinned] = useState(list?.isPinned || false);

  if (!list) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <ThemedView style={styles.container}>
          <ThemedText>List not found</ThemedText>
        </ThemedView>
      </SafeAreaView>
    );
  }

  // Group items by category
  const groupedItems = items.reduce((acc, item) => {
    const category = item.category || 'Uncategorized';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {} as Record<string, GroceryItem[]>);

  const toggleItem = (itemId: string) => {
    setItems(items.map(item => 
      item.id === itemId ? { ...item, checked: !item.checked } : item
    ));
  };

  const toggleItemPin = (itemId: string) => {
    setItems(items.map(item => 
      item.id === itemId ? { ...item, isPinned: !item.isPinned } : item
    ));
  };

  const toggleListPin = () => {
    setIsPinned(!isPinned);
  };

  const deleteList = () => {
    // Handle delete
    router.back();
  };

  return (
    <>
      <Stack.Screen 
        options={{ 
          headerShown: true,
          headerTitle: '',
          headerLeft: () => (
            <View style={styles.headerLeftContainer}>
                <TouchableOpacity onPress={() => router.back()}>
                <Ionicons
                    name="arrow-back"
                    size={28}
                    color={colors.text.primary}
                    style={styles.backButton}
                />
                </TouchableOpacity>
            </View>
            ),
          headerRight: () => (
            <View style={styles.headerRight}>
              <TouchableOpacity onPress={toggleListPin} style={styles.headerButton}>
                <Ionicons 
                  name={isPinned ? "pin" : "pin-outline"} 
                  size={24} 
                  color={isPinned ? theme.brand.red : colors.text.primary} 
                />
              </TouchableOpacity>
              <TouchableOpacity onPress={deleteList} style={styles.headerButton}>
                <Ionicons name="trash-outline" size={24} color={colors.text.primary} />
              </TouchableOpacity>
            </View>
          ),
          headerStyle: {
            backgroundColor: colors.background,
          },
        }} 
      />
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['bottom']}>
        <ThemedView style={styles.container}>
          {/* Date */}
          <ThemedText style={[styles.date, { color: colors.text.secondary }]}>
            {list.date}
          </ThemedText>

          {/* Title */}
          <ThemedText style={styles.title}>{list.title}</ThemedText>

          {/* Items grouped by category */}
          <FlatList
            data={Object.keys(groupedItems)}
            keyExtractor={(category) => category}
            renderItem={({ item: category }) => (
              <View style={styles.categorySection}>
                {/* Category Header */}
                <TouchableOpacity style={styles.categoryHeader}>
                  <ThemedText style={styles.categoryTitle}>{category}</ThemedText>
                  <Ionicons name="chevron-forward" size={20} color={colors.text.secondary} />
                </TouchableOpacity>

                {/* Category Items */}
                {groupedItems[category].map((item) => (
                  <View
                    key={item.id}
                    style={styles.itemRow}
                  >
                    {/* Checkbox */}
                    <TouchableOpacity
                      onPress={() => toggleItem(item.id)}
                      activeOpacity={0.7}
                      style={styles.checkboxTouchable}
                    >
                      <View style={[
                        styles.checkbox,
                        { borderColor: colors.border.default },
                        item.checked && { 
                          backgroundColor: colors.text.primary, 
                          borderColor: colors.text.primary 
                        }
                      ]}>
                        {item.checked && (
                          <Ionicons name="checkmark" size={18} color={colors.background} />
                        )}
                      </View>
                    </TouchableOpacity>

                    {/* Item text */}
                    <TouchableOpacity
                      style={styles.itemTextContainer}
                      onPress={() => toggleItem(item.id)}
                      activeOpacity={0.7}
                    >
                      <ThemedText style={[
                        styles.itemText,
                        item.checked && styles.itemTextChecked
                      ]}>
                        {item.quantity && `${item.quantity} `}
                        {item.name}
                      </ThemedText>
                    </TouchableOpacity>

                    {/* Pin icon for pinned items */}
                    <TouchableOpacity 
                      onPress={() => toggleItemPin(item.id)}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      {item.isPinned && (
                        <Ionicons 
                          name="pin" 
                          size={18} 
                          color={colors.text.primary} 
                          style={styles.pinIcon}
                        />
                      )}
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
          />

          {/* Add item input */}
          <View style={[styles.inputContainer, { backgroundColor: colors.card }]}>
            <TextInput
              style={[styles.input, { color: colors.text.primary }]}
              placeholder="Add item..."
              placeholderTextColor={colors.text.tertiary}
            />
          </View>
        </ThemedView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
    backButton: {
        paddingLeft: 4, 
    },
    headerLeftContainer: {
        justifyContent: 'center',
    },
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  headerRight: {
    flexDirection: 'row',
    gap: 16,
  },
  headerButton: {
    padding: 4,
  },
  date: {
    fontSize: theme.typography.fontSizes.h4,
    textAlign: 'center',
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
  },
  title: {
    marginTop: theme.spacing.md,
    fontSize: theme.typography.fontSizes.h2,
    fontWeight: '700',
    marginBottom: theme.spacing.lg,
  },
  categorySection: {
    marginBottom: theme.spacing.lg,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
  },
  categoryTitle: {
    fontSize: theme.typography.fontSizes.h3,
    fontWeight: '600',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
  },
  checkboxTouchable: {
    marginRight: theme.spacing.md,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemTextContainer: {
    flex: 1,
  },
  itemText: {
    fontSize: theme.typography.fontSizes.h4,
  },
  itemTextChecked: {
    textDecorationLine: 'line-through',
    opacity: 0.5,
  },
  pinIcon: {
    marginLeft: theme.spacing.sm,
  },
  listContent: {
    paddingBottom: theme.spacing.xl,
  },
  inputContainer: {
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  input: {
    fontSize: theme.typography.fontSizes.h4,
    paddingVertical: theme.spacing.md,
  },
});