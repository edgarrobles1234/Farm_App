// app/grocery-list/[id].tsx
import {
  StyleSheet,
  View,
  FlatList,
  TouchableOpacity,
  TextInput,
  Keyboard,
  Platform,
} from 'react-native';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLocalSearchParams, Stack, router } from 'expo-router';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/useTheme';
import { theme } from '@/constants/theme';
import { mockGroceryLists, GroceryItem } from '@/mockdata/GroceryList';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RichEditor, RichToolbar, actions } from 'react-native-pell-rich-editor';

/* =========================
   TYPES
========================= */

type Category = {
  id: string;
  name: string;
  isCollapsed: boolean;
  items: GroceryItem[];
};

/* =========================
   SCREEN
========================= */

export default function GroceryListDetailScreen() {
  const { id } = useLocalSearchParams();
  const { colors } = useTheme();

  const list = mockGroceryLists.find((l) => l.id === id);

  const [items, setItems] = useState<GroceryItem[]>(list?.items || []);
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});
  const [categoryNameDrafts, setCategoryNameDrafts] = useState<Record<string, string>>({});
  const [isPinned, setIsPinned] = useState(list?.isPinned || false);
  const [title, setTitle] = useState(list?.title || '');

  const richText = useRef<RichEditor>(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const itemRefs = useRef<Record<string, TextInput | null>>({});

  /* =========================
     KEYBOARD HANDLING
  ========================= */

  useEffect(() => {
    const showEvent =
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent =
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, (e) => {
      setKeyboardHeight(e.endCoordinates.height);
    });

    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  /* =========================
     DERIVED CATEGORIES
  ========================= */

  const categories = useMemo<Category[]>(() => {
    const map: Record<string, GroceryItem[]> = {};

    items.forEach((item) => {
      const key = item.category || 'Uncategorized';
      if (!map[key]) map[key] = [];
      map[key].push(item);
    });

    return Object.entries(map).map(([name, items]) => ({
      id: name,
      name,
      isCollapsed: Boolean(collapsedCategories[name]),
      items,
    }));
  }, [items, collapsedCategories]);

  /* =========================
     ACTIONS
  ========================= */

  const updateItem = (
    itemId: string,
    updates: Partial<GroceryItem>
  ) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, ...updates } : item
      )
    );
  };

  const toggleItem = (itemId: string) => {
    updateItem(itemId, { checked: !items.find(i => i.id === itemId)?.checked });
  };

  const toggleItemPin = (itemId: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, isPinned: !item.isPinned } : item
      )
    );
  };

  const toggleCategory = (id: string) => {
    setCollapsedCategories((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const addNewItem = (categoryName: string) => {
  const newItem: GroceryItem = {
        id: Date.now().toString(),
        name: '',
        checked: false,
        category: categoryName,
        isPinned: false,
    };
    
    setItems([...items, newItem]);

    // Focus the new item after state updates
    setTimeout(() => {
        itemRefs.current[newItem.id]?.focus();
    }, 100);
    };

  // IMPORTANT: propagate category rename to items
  const renameCategory = (oldName: string, newName: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.category === oldName
          ? { ...item, category: newName }
          : item
      )
    );
  };

  const toggleListPin = () => {
    setIsPinned(!isPinned);
  };

  const deleteList = () => {
    router.back();
  };

  /* =========================
     EMPTY STATE
  ========================= */

  if (!list) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <ThemedView style={styles.container}>
          <ThemedText>List not found</ThemedText>
        </ThemedView>
      </SafeAreaView>
    );
  }

  /* =========================
     RENDER
  ========================= */

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: '',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons
                name="arrow-back"
                size={28}
                color={colors.text.primary}
              />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <View style={styles.headerRight}>
              <TouchableOpacity onPress={toggleListPin}>
                <Ionicons
                  name={isPinned ? 'pin' : 'pin-outline'}
                  size={24}
                  color={isPinned ? theme.brand.red : colors.text.primary}
                />
              </TouchableOpacity>

              <TouchableOpacity onPress={deleteList}>
                <Ionicons
                  name="trash-outline"
                  size={24}
                  color={colors.text.primary}
                />
              </TouchableOpacity>
            </View>
          ),
          headerStyle: {
            backgroundColor: colors.background,
          },
        }}
      />

      <SafeAreaView
        style={{ flex: 1, backgroundColor: colors.background }}
        edges={['bottom']}
      >
        <ThemedView style={styles.container}>
          {/* Date */}
          <ThemedText style={[styles.date, { color: colors.text.secondary }]}>
            {list.date}
          </ThemedText>

          {/* Title */}
          <TextInput
            style={[styles.title, { color: colors.text.primary }]}
            value={title}
            onChangeText={setTitle}
            placeholder="Title..."
            placeholderTextColor={colors.text.tertiary}
          />

          {/* Categories */}
          <FlatList
            data={categories}
            keyExtractor={(category) => category.id}
            renderItem={({ item: category }) => (
              <View style={styles.categorySection}>
                {/* Category Header */}
                <View style={styles.categoryHeader}>
                  <TextInput
                    value={categoryNameDrafts[category.name] ?? category.name}
                    onChangeText={(text) =>
                      setCategoryNameDrafts((prev) => ({
                        ...prev,
                        [category.name]: text,
                      }))
                    }
                    onEndEditing={() => {
                      const draft = categoryNameDrafts[category.name];
                      if (draft && draft.trim() && draft.trim() !== category.name) {
                        renameCategory(category.name, draft.trim());
                      }
                      setCategoryNameDrafts((prev) => {
                        const next = { ...prev };
                        delete next[category.name];
                        return next;
                      });
                    }}
                    style={[
                      styles.categoryTitle,
                      { color: colors.text.primary },
                    ]}
                    placeholder="Category"
                    placeholderTextColor={colors.text.tertiary}
                  />

                  <TouchableOpacity
                    onPress={() => toggleCategory(category.id)}
                  >
                    <Ionicons
                      name={
                        category.isCollapsed
                          ? 'chevron-forward'
                          : 'chevron-down'
                      }
                      size={20}
                      color={colors.text.secondary}
                    />
                  </TouchableOpacity>
                </View>

                {/* Items */}
                {!category.isCollapsed &&
                  category.items.map((item) => (
                    <View key={item.id} style={styles.itemRow}>
                      {/* Checkbox */}
                      <TouchableOpacity
                        onPress={() => toggleItem(item.id)}
                        style={[
                            styles.checkbox,
                            { borderColor: colors.border.default },
                            item.checked && { 
                            backgroundColor: theme.brand.primary,
                            borderColor: theme.brand.primary
                            }
                        ]}
                        >
                        {item.checked && (
                            <Ionicons
                            name="checkmark"
                            size={18}
                            color={colors.background}
                            />
                        )}
                        </TouchableOpacity>

                      {/* Editable Item */}
                      <TextInput
                        ref={(ref) => {
                          itemRefs.current[item.id] = ref;
                        }}
                        value={item.name}
                        onChangeText={(text) =>
                            updateItem(item.id, { name: text })
                        }
                        placeholder="Item name"
                        placeholderTextColor={colors.text.tertiary}
                        style={[
                            styles.itemText,
                            item.checked && styles.itemTextChecked,
                            { color: colors.text.primary },
                        ]}
                        onSubmitEditing={() => addNewItem(category.name)}
                        returnKeyType="done"
                        multiline={false}
                        blurOnSubmit={false}
                        />

                      {/* Pin */}
                      <TouchableOpacity
                        onPress={() => toggleItemPin(item.id)}
                      >
                        {item.isPinned && (
                          <Ionicons
                            name="pin"
                            size={18}
                            color={colors.text.primary}
                          />
                        )}
                      </TouchableOpacity>
                    </View>
                  ))}
              </View>
            )}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        </ThemedView>

        {/* Toolbar (kept for future notes usage) */}
        <View
          style={[
            styles.toolbarContainer,
            {
              bottom: keyboardHeight,
              backgroundColor: colors.card,
              borderTopColor: colors.border.default,
            },
          ]}
        >
          <RichToolbar
            editor={richText}
            actions={[
              actions.setBold,
              actions.setItalic,
              actions.insertBulletsList,
              actions.insertOrderedList,
              actions.undo,
              actions.redo,
            ]}
            iconTint={colors.text.primary}
            selectedIconTint={theme.brand.red}
          />
        </View>
      </SafeAreaView>
    </>
  );
}

/* =========================
   STYLES
========================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  headerRight: {
    flexDirection: 'row',
    gap: 16,
  },
  date: {
    fontSize: theme.typography.fontSizes.h4,
    textAlign: 'center',
    marginVertical: theme.spacing.sm,
  },
  title: {
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
  },
  categoryTitle: {
    fontSize: theme.typography.fontSizes.h3,
    fontWeight: '600',
    flex: 1,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: theme.spacing.sm,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  itemText: {
    fontSize: theme.typography.fontSizes.h4,
  },
  itemNotes: {
    fontSize: theme.typography.fontSizes.h5,
    marginTop: 4,
  },
  itemTextChecked: {
    textDecorationLine: 'line-through',
    opacity: 0.5,
  },
  listContent: {
    paddingBottom: theme.spacing.xl * 2.5,
  },
  toolbarContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    borderTopWidth: 1,
    padding: theme.spacing.sm,
  },
});
