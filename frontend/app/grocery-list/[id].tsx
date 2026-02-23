// app/grocery-list/[id].tsx
import {
  StyleSheet,
  View,
  FlatList,
  TouchableOpacity,
  TextInput,
  Keyboard,
  Platform,
  Alert,
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
import { useAuth } from '@/context/auth-context';
import { createGroceryList } from '@/lib/grocery-lists';

/* =========================
   TYPES
========================= */

type TextStyle = {
  bold?: boolean;
  underline?: boolean;
  italic?: boolean;
};

type ExtendedGroceryItem = GroceryItem & {
  textStyle?: TextStyle;
};

type Category = {
  id: string;
  name: string;
  isCollapsed: boolean;
  items: ExtendedGroceryItem[];
};

const DEFAULT_CATEGORY_LABEL = 'Add Category Name';

/* =========================
   SCREEN
========================= */

export default function GroceryListDetailScreen() {
  const { id } = useLocalSearchParams();
  const { colors } = useTheme();
  const { session } = useAuth();
  const accessToken = session?.access_token ?? null;

  const listId = Array.isArray(id) ? id[0] : id;
  const isNewList = listId === 'new';
  const list = isNewList ? undefined : mockGroceryLists.find((l) => l.id === listId);

  const [items, setItems] = useState<ExtendedGroceryItem[]>(
    list?.items || [
      {
        id: Date.now().toString(),
        name: '',
        checked: false,
        category: DEFAULT_CATEGORY_LABEL,
        isPinned: false,
        textStyle: {},
      },
    ]
  );
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});
  const [categoryNameDrafts, setCategoryNameDrafts] = useState<Record<string, string>>({});
  const [isPinned, setIsPinned] = useState(list?.isPinned || false);
  const [title, setTitle] = useState(list?.title || (isNewList ? 'New Grocery List' : ''));
  const [isSaving, setIsSaving] = useState(false);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [focusedItemId, setFocusedItemId] = useState<string | null>(null);

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
      setIsKeyboardVisible(true);
    });

    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
      setIsKeyboardVisible(false);
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
    const map: Record<string, ExtendedGroceryItem[]> = {};

    items.forEach((item) => {
      const key = item.category?.trim() || DEFAULT_CATEGORY_LABEL;
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
    updates: Partial<ExtendedGroceryItem>
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
    const newItem: ExtendedGroceryItem = {
      id: Date.now().toString(),
      name: '',
      checked: false,
      category: categoryName,
      isPinned: false,
      textStyle: {},
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

  const handleSave = async () => {
    if (!accessToken) {
      Alert.alert('Not signed in', 'Please sign in again and try saving.');
      return;
    }

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      Alert.alert('Title required', 'Please add a title before saving.');
      return;
    }

    const cleanItems = items
      .map((item, index) => ({
        name: item.name.trim(),
        quantity: item.quantity ?? null,
        unit: item.unit ?? null,
        checked: item.checked,
        category:
          item.category?.trim() && item.category.trim() !== DEFAULT_CATEGORY_LABEL
            ? item.category.trim()
            : null,
        isPinned: item.isPinned ?? false,
        sortOrder: index,
      }))
      .filter((item) => item.name.length > 0);

    setIsSaving(true);
    try {
      await createGroceryList(accessToken, {
        title: trimmedTitle,
        isPinned,
        items: cleanItems,
      });
      router.replace('/(tabs)/grocerylist');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to save grocery list.';
      Alert.alert('Save failed', message);
    } finally {
      setIsSaving(false);
    }
  };

  /* =========================
     TOOLBAR ACTIONS
  ========================= */

  const toggleTextStyle = (styleType: 'bold' | 'underline' | 'italic') => {
    if (!focusedItemId) return;

    const item = items.find(i => i.id === focusedItemId);
    if (!item) return;

    const currentStyle = item.textStyle || {};
    
    updateItem(focusedItemId, {
      textStyle: {
        ...currentStyle,
        [styleType]: !currentStyle[styleType],
      },
    });
  };

  // Get current focused item's styles for button highlighting
  const getFocusedItemStyles = () => {
    if (!focusedItemId) return {};
    const item = items.find(i => i.id === focusedItemId);
    return item?.textStyle || {};
  };

  const focusedStyles = getFocusedItemStyles();

  /* =========================
     EMPTY STATE
  ========================= */

  if (!isNewList && !list) {
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
              {isNewList ? (
                <TouchableOpacity
                  onPress={handleSave}
                  disabled={isSaving}
                >
                  <ThemedText style={[styles.saveButton, { color: isSaving ? colors.text.tertiary : theme.brand.primary }]}>
                    {isSaving ? 'Saving...' : 'Save'}
                  </ThemedText>
                </TouchableOpacity>
              ) : (
                <>
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
                </>
              )}
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
            {isNewList ? 'Today' : list?.date}
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
                      <View style={{ flex: 1 }}>
                        <TextInput
                          ref={(ref) => {
                            itemRefs.current[item.id] = ref;
                          }}
                          value={item.name}
                          onChangeText={(text) =>
                            updateItem(item.id, { name: text })
                          }
                          onFocus={() => setFocusedItemId(item.id)}
                          onBlur={() => setFocusedItemId(null)}
                          placeholder="Item name"
                          placeholderTextColor={colors.text.tertiary}
                          multiline={false}
                          style={[
                            styles.itemText,
                            item.checked && styles.itemTextChecked,
                            { color: colors.text.primary },
                            // Apply text styles
                            item.textStyle?.bold && { fontWeight: '700' },
                            item.textStyle?.italic && { fontStyle: 'italic' },
                            item.textStyle?.underline && { textDecorationLine: 'underline' },
                            // Handle combination of underline with line-through
                            item.checked && item.textStyle?.underline && { 
                              textDecorationLine: 'underline line-through' 
                            },
                          ]}
                          onSubmitEditing={() => addNewItem(category.name)}
                          returnKeyType="next"
                          blurOnSubmit={false}
                        />
                      </View>

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

        {/* Custom Toolbar - only shows when keyboard is visible */}
        {isKeyboardVisible && (
          <View
            style={[
              styles.toolbarContainer,
              {
                bottom: keyboardHeight,
                backgroundColor: colors.input.background,
                borderTopColor: colors.border.light,
              },
            ]}
          >
            <TouchableOpacity style={styles.toolbarButton}>
              <ThemedText style={[styles.toolbarText, { color: colors.text.tertiary }]}>Aa</ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.toolbarButton}>
              <Ionicons name="list" size={24} color={colors.text.tertiary} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.toolbarButton,
                focusedStyles.bold && styles.toolbarButtonActive
              ]}
              onPress={() => toggleTextStyle('bold')}
            >
              <ThemedText style={[
                styles.toolbarTextBold, 
                { color: focusedStyles.bold ? theme.brand.primary : colors.text.tertiary }
              ]}>
                B
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[
                styles.toolbarButton,
                focusedStyles.underline && styles.toolbarButtonActive
              ]}
              onPress={() => toggleTextStyle('underline')}
            >
              <ThemedText style={[
                styles.toolbarTextUnderline, 
                { color: focusedStyles.underline ? theme.brand.primary : colors.text.tertiary }
              ]}>
                U
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[
                styles.toolbarButton,
                focusedStyles.italic && styles.toolbarButtonActive
              ]}
              onPress={() => toggleTextStyle('italic')}
            >
              <ThemedText style={[
                styles.toolbarTextItalic, 
                { color: focusedStyles.italic ? theme.brand.primary : colors.text.tertiary }
              ]}>
                I
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity style={styles.toolbarButton}>
              <Ionicons name="image-outline" size={24} color={colors.text.tertiary} />
            </TouchableOpacity>
          </View>
        )}
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
  saveButton: {
    fontSize: theme.typography.fontSizes.h4,
    fontWeight: '700',
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
    alignItems: 'center',
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
  itemTextChecked: {
    textDecorationLine: 'line-through',
    opacity: 0.5,
  },
  listContent: {
    paddingBottom: theme.spacing.xl * 3,
  },
  toolbarContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    borderTopWidth: 1,
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderRadius: 15,
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  toolbarButton: {
    padding: theme.spacing.xs,
  },
  toolbarButtonActive: {
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    borderRadius: 6,
  },
  toolbarText: {
    fontSize: 23,
    fontWeight: '400',
    color: '#000000',
  },
  toolbarTextBold: {
    fontSize: 23,
    fontWeight: '700',
    color: '#000000',
  },
  toolbarTextUnderline: {
    fontSize: 23,
    fontWeight: '600',
    color: '#000000',
    textDecorationLine: 'underline',
  },
  toolbarTextItalic: {
    fontSize: 23,
    fontStyle: 'italic',
    color: '#000000',
  },
});
