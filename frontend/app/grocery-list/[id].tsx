// app/grocery-list/[id].tsx
import {
  StyleSheet,
  View,
  TouchableOpacity,
  TextInput,
  Platform,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
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
import {
  getLocalGroceryListById,
  saveLocalGroceryList,
  type LocalGroceryItem,
} from '@/lib/local-grocery-lists';

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
  name: string | null; // null = flat/uncategorized (no checkbox, no header)
  isCollapsed: boolean;
  items: ExtendedGroceryItem[];
};

const UNCATEGORIZED_KEY = '__uncategorized__';
const DEFAULT_SUBCATEGORY_NAME = 'Category 1';
const NEW_CATEGORY_PREFIX = '__newcat_';

/* =========================
   SCREEN
========================= */

export default function GroceryListDetailScreen() {
  const { id } = useLocalSearchParams();
  const { colors } = useTheme();

  const listId = Array.isArray(id) ? id[0] : id;
  const isNewList = listId === 'new';
  const mockList = isNewList ? undefined : mockGroceryLists.find((l) => l.id === listId);

  const [isLoadingList, setIsLoadingList] = useState(!isNewList);
  const [listNotFound, setListNotFound] = useState(false);
  const [displayDate, setDisplayDate] = useState(isNewList ? 'Today' : mockList?.date ?? '');
  const [items, setItems] = useState<ExtendedGroceryItem[]>([
    {
      id: Date.now().toString(),
      name: '',
      checked: false,
      category: DEFAULT_SUBCATEGORY_NAME,
      isPinned: false,
      textStyle: {},
    },
  ]);

  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});
  const [categoryNameDrafts, setCategoryNameDrafts] = useState<Record<string, string>>({});
  const [isPinned, setIsPinned] = useState(mockList?.isPinned || false);
  const [title, setTitle] = useState(mockList?.title);
  const [isSaving, setIsSaving] = useState(false);

  const itemRefs = useRef<Record<string, TextInput | null>>({});
  const categoryInputRefs = useRef<Record<string, TextInput | null>>({});
  const scrollRef = useRef<ScrollView | null>(null);

  const createEmptyItem = (category: string | null = DEFAULT_SUBCATEGORY_NAME): ExtendedGroceryItem => ({
    id: Date.now().toString(),
    name: '',
    checked: false,
    category,
    isPinned: false,
    textStyle: {},
  });

  const scrollToBottom = (delay = 120) => {
    setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, delay);
  };

  useEffect(() => {
    const loadList = async () => {
      if (isNewList) {
        setIsLoadingList(false);
        return;
      }

      if (!listId || typeof listId !== 'string') {
        setListNotFound(true);
        setIsLoadingList(false);
        return;
      }

      try {
        const localList = await getLocalGroceryListById(listId);
        const sourceList = localList ?? mockList;

        if (!sourceList) {
          setListNotFound(true);
          return;
        }

        setItems(
          sourceList.items.length > 0
            ? sourceList.items.map((item) => ({
                ...item,
                category: item.category ?? null,
              }))
            : [createEmptyItem()]
        );
        setTitle(sourceList.title);
        setIsPinned(Boolean(sourceList.isPinned));
        setDisplayDate(sourceList.date || '');
      } finally {
        setIsLoadingList(false);
      }
    };

    loadList();
  }, [isNewList, listId, mockList]);

  /* =========================
     DERIVED CATEGORIES
  ========================= */

  const categories = useMemo<Category[]>(() => {
    const uncategorized: ExtendedGroceryItem[] = [];
    const map: Record<string, ExtendedGroceryItem[]> = {};
    const categoryOrder: string[] = [];

    items.forEach((item) => {
      if (!item.category) {
        uncategorized.push(item);
      } else {
        const key = item.category.trim();
        if (!map[key]) {
          map[key] = [];
          categoryOrder.push(key);
        }
        map[key].push(item);
      }
    });

    const result: Category[] = [];

    if (uncategorized.length > 0) {
      result.push({
        id: UNCATEGORIZED_KEY,
        name: null,
        isCollapsed: false,
        items: uncategorized,
      });
    }

    categoryOrder.forEach((name) => {
      result.push({
        id: name,
        name,
        isCollapsed: Boolean(collapsedCategories[name]),
        items: map[name],
      });
    });

    return result;
  }, [items, collapsedCategories]);

  /* =========================
     ACTIONS
  ========================= */

  const updateItem = (itemId: string, updates: Partial<ExtendedGroceryItem>) => {
    setItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, ...updates } : item))
    );
  };

  const toggleItem = (itemId: string) => {
    updateItem(itemId, { checked: !items.find((i) => i.id === itemId)?.checked });
  };

  const toggleItemPin = (itemId: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, isPinned: !item.isPinned } : item
      )
    );
  };

  const toggleCategory = (id: string) => {
    setCollapsedCategories((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const addNewItem = (categoryName: string | null) => {
    const newItem = createEmptyItem(categoryName);
    setItems((prev) => [...prev, newItem]);
    setTimeout(() => {
      itemRefs.current[newItem.id]?.focus();
      scrollToBottom(0);
    }, 100);
  };

  const removeItem = (itemId: string) => {
    let focusTargetId: string | null = null;

    setItems((prev) => {
      if (prev.length <= 1) {
        return prev;
      }

      const removeIndex = prev.findIndex((item) => item.id === itemId);
      if (removeIndex === -1) {
        return prev;
      }

      const next = prev.filter((item) => item.id !== itemId);
      const fallbackIndex = Math.max(0, removeIndex - 1);
      focusTargetId = next[fallbackIndex]?.id ?? next[0]?.id ?? null;
      return next;
    });

    setTimeout(() => {
      if (focusTargetId) {
        itemRefs.current[focusTargetId]?.focus();
      }
    }, 50);
  };

  /** Add a brand-new named category section */
  const addNewCategory = () => {
    const newCategoryKey = `${NEW_CATEGORY_PREFIX}${Date.now()}`;
    const newItem: ExtendedGroceryItem = createEmptyItem(newCategoryKey);
    newItem.id = (Date.now() + 1).toString();

    setItems((prev) => [...prev, newItem]);

    setTimeout(() => {
      setCategoryNameDrafts((prev) => ({ ...prev, [newCategoryKey]: '' }));
      categoryInputRefs.current[newCategoryKey]?.focus();
      scrollToBottom(0);
    }, 150);
  };

  const renameCategory = (oldName: string, newName: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.category === oldName ? { ...item, category: newName } : item
      )
    );
    // Update refs key
    if (categoryInputRefs.current[oldName]) {
      categoryInputRefs.current[newName] = categoryInputRefs.current[oldName];
      delete categoryInputRefs.current[oldName];
    }
  };

  const deleteCategory = (categoryName: string) => {
    const namedCategories = categories.filter((category) => category.name !== null);
    if (namedCategories.length <= 1) {
      Alert.alert('Cannot delete', 'Keep at least one subcategory in this list.');
      return;
    }

    Alert.alert(
      'Delete subcategory?',
      `Delete "${categoryName}" and all its items?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setItems((prev) => prev.filter((item) => item.category !== categoryName));
            setCategoryNameDrafts((prev) => {
              const next = { ...prev };
              delete next[categoryName];
              return next;
            });
            setCollapsedCategories((prev) => {
              const next = { ...prev };
              delete next[categoryName];
              return next;
            });
          },
        },
      ]
    );
  };

  const toggleListPin = () => setIsPinned(!isPinned);
  const deleteList = () => router.back();

  const handleSave = async () => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      Alert.alert('Title required', 'Please add a title before saving.');
      return;
    }

    const cleanItems: LocalGroceryItem[] = items
      .map((item, index) => ({
        id: item.id || `${Date.now()}-${index}`,
        name: item.name.trim(),
        quantity: item.quantity ?? null,
        unit: item.unit ?? null,
        checked: item.checked,
        category:
          item.category && !item.category.startsWith(NEW_CATEGORY_PREFIX)
            ? item.category.trim()
            : null,
        isPinned: item.isPinned ?? false,
        sortOrder: index,
        textStyle: item.textStyle ?? {},
      }))
      .filter((item) => item.name.length > 0);

    setIsSaving(true);
    try {
      await saveLocalGroceryList({
        id: isNewList ? undefined : listId,
        title: trimmedTitle,
        date: displayDate || undefined,
        isPinned,
        items: cleanItems,
      });
      router.replace('/(tabs)/grocerylist');
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unable to save grocery list locally.';
      Alert.alert('Save failed', message);
    } finally {
      setIsSaving(false);
    }
  };

  const displayCategoryName = (key: string) =>
    key.startsWith(NEW_CATEGORY_PREFIX) ? '' : key;

  /* =========================
     EMPTY STATE
  ========================= */

  if (isLoadingList) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <ThemedView style={styles.container} />
      </SafeAreaView>
    );
  }

  if (!isNewList && listNotFound) {
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
              <Ionicons name="arrow-back" size={28} color={colors.text.primary} />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <View style={styles.headerRight}>
              {isNewList ? (
                <TouchableOpacity onPress={handleSave} disabled={isSaving}>
                  <ThemedText
                    style={[
                      styles.saveButton,
                      { color: isSaving ? colors.text.tertiary : theme.brand.primary },
                    ]}
                  >
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
                    <Ionicons name="trash-outline" size={24} color={colors.text.primary} />
                  </TouchableOpacity>
                </>
              )}
            </View>
          ),
          headerStyle: { backgroundColor: colors.background },
        }}
      />

      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['bottom']}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 12 : 0}
        >
        <ThemedView style={styles.container}>
          {/* Date */}
          <ThemedText style={[styles.date, { color: colors.text.secondary }]}>
            {isNewList ? 'Today' : displayDate}
          </ThemedText>

          {/* Title */}
          <TextInput
            style={[styles.title, { color: colors.text.primary }]}
            value={title}
            onChangeText={setTitle}
            placeholder="Title..."
            placeholderTextColor={colors.text.tertiary}
          />

          {/* Content */}
          <ScrollView
            ref={scrollRef}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            keyboardShouldPersistTaps="handled"
          >
            {categories.map((category) => (
              <View key={category.id} style={styles.categorySection}>

                {/* ── Named category header ── */}
                {category.name !== null && (
                  <View style={styles.categoryHeader}>
                    <TextInput
                      ref={(ref) => {
                        if (category.name)
                          categoryInputRefs.current[category.name] = ref;
                      }}
                      value={
                        categoryNameDrafts[category.name] ??
                        displayCategoryName(category.name)
                      }
                      onChangeText={(text) =>
                        setCategoryNameDrafts((prev) => ({
                          ...prev,
                          [category.name!]: text,
                        }))
                      }
                      onEndEditing={() => {
                        const draft = categoryNameDrafts[category.name!];
                        const trimmed = draft?.trim();
                        const fallback = `Category ${
                          categories.filter((c) => c.name !== null).length
                        }`;
                        const finalName = trimmed || fallback;

                        if (finalName !== category.name) {
                          renameCategory(category.name!, finalName);
                        }

                        setCategoryNameDrafts((prev) => {
                          const next = { ...prev };
                          delete next[category.name!];
                          return next;
                        });

                        const firstItem = category.items[0];
                        if (firstItem) {
                          setTimeout(
                            () => itemRefs.current[firstItem.id]?.focus(),
                            100
                          );
                        }
                      }}
                      style={[styles.categoryTitle, { color: colors.text.primary }]}
                      placeholder="Category name..."
                      placeholderTextColor={colors.text.tertiary}
                      returnKeyType="done"
                    />
                    <View style={styles.categoryHeaderActions}>
                      <TouchableOpacity
                        onPress={() => deleteCategory(category.name!)}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <Ionicons name="trash-outline" size={18} color={colors.text.tertiary} />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => toggleCategory(category.id)}>
                        <Ionicons
                          name={category.isCollapsed ? 'chevron-forward' : 'chevron-down'}
                          size={20}
                          color={colors.text.secondary}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

                {/* ── Items ── */}
                {!category.isCollapsed &&
                  category.items.map((item) => {
                    const inCategory = category.name !== null;
                    return (
                      <View key={item.id} style={styles.itemRow}>

                        {/* Checkbox (category items) or bullet dot (flat items) */}
                        {inCategory ? (
                          <TouchableOpacity
                            onPress={() => toggleItem(item.id)}
                            style={[
                              styles.checkbox,
                              { borderColor: colors.border.default },
                              item.checked && {
                                backgroundColor: theme.brand.primary,
                                borderColor: theme.brand.primary,
                              },
                            ]}
                          >
                            {item.checked && (
                              <Ionicons name="checkmark" size={18} color={colors.background} />
                            )}
                          </TouchableOpacity>
                        ) : (
                          <View style={[styles.bulletDot, { backgroundColor: colors.text.tertiary }]} />
                        )}

                        <View style={{ flex: 1 }}>
                          <TextInput
                            ref={(ref) => {
                              itemRefs.current[item.id] = ref;
                            }}
                            value={item.name}
                            onChangeText={(text) => updateItem(item.id, { name: text })}
                            placeholder="Item name"
                            placeholderTextColor={colors.text.tertiary}
                            multiline={false}
                            style={[
                              styles.itemText,
                              item.checked && styles.itemTextChecked,
                              { color: colors.text.primary },
                              item.textStyle?.bold && { fontWeight: '700' },
                              item.textStyle?.italic && { fontStyle: 'italic' },
                              item.textStyle?.underline && { textDecorationLine: 'underline' },
                              item.checked && item.textStyle?.underline && {
                                textDecorationLine: 'underline line-through',
                              },
                            ]}
                            onSubmitEditing={() => addNewItem(item.category ?? null)}
                            onKeyPress={(e) => {
                              if (
                                e.nativeEvent.key === 'Backspace' &&
                                item.name.length === 0
                              ) {
                                removeItem(item.id);
                              }
                            }}
                            returnKeyType="next"
                            blurOnSubmit={false}
                          />
                        </View>

                        <TouchableOpacity onPress={() => toggleItemPin(item.id)}>
                          {item.isPinned && (
                            <Ionicons name="pin" size={18} color={colors.text.primary} />
                          )}
                        </TouchableOpacity>
                      </View>
                    );
                  })}

                {/* ── Ghost row: add subcategory ── */}
                {category.name !== null && !category.isCollapsed && (
                  <View>
                    {/* Tap to create a brand new subcategory below */}
                    <View style={[styles.itemRow, { opacity: 0.3 }]}>
                      <View style={[styles.subcatGhostIcon, { borderColor: colors.border.default }]}>
                        <Ionicons name="list-outline" size={13} color={colors.text.tertiary} />
                      </View>
                      <TextInput
                        placeholder="Add subcategory..."
                        placeholderTextColor={colors.text.tertiary}
                        style={[styles.itemText, { color: colors.text.primary, fontSize: theme.typography.fontSizes.h4 - 1 }]}
                        onFocus={() => addNewCategory()}
                        blurOnSubmit={false}
                      />
                    </View>
                  </View>
                )}
              </View>
            ))}
          </ScrollView>
        </ThemedView>
        </KeyboardAvoidingView>
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
  categoryHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    marginLeft: theme.spacing.sm,
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
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: theme.spacing.md,
    marginLeft: 9,
    opacity: 0.4,
  },
  // Ghost icon for the "Add subcategory..." row — pill shape, slightly smaller than checkbox
  subcatGhostIcon: {
    width: 24,
    height: 24,
    borderRadius: 8,
    borderWidth: 1.5,
    borderStyle: 'dashed',
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
});
