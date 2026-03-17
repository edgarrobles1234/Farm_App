import {
  DEFAULT_SUBCATEGORY_NAME,
  NEW_CATEGORY_PREFIX,
  UNCATEGORIZED_KEY,
} from './constants';
import type { Category, ExtendedGroceryItem } from './types';

export const createEmptyItem = (
  category: string | null = DEFAULT_SUBCATEGORY_NAME
): ExtendedGroceryItem => ({
  id: Date.now().toString(),
  name: '',
  checked: false,
  category,
  isPinned: false,
  textStyle: {},
});

export const buildCategories = (
  items: ExtendedGroceryItem[],
  collapsedCategories: Record<string, boolean>
): Category[] => {
  const uncategorized: ExtendedGroceryItem[] = [];
  const map: Record<string, ExtendedGroceryItem[]> = {};
  const categoryOrder: string[] = [];

  items.forEach((item) => {
    if (!item.category) {
      uncategorized.push(item);
      return;
    }

    const key = item.category.trim();
    if (!map[key]) {
      map[key] = [];
      categoryOrder.push(key);
    }
    map[key].push(item);
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
};

export const createDraftCategoryKey = () => `${NEW_CATEGORY_PREFIX}${Date.now()}`;

export const displayCategoryName = (key: string) =>
  key.startsWith(NEW_CATEGORY_PREFIX) ? '' : key;

export const isPersistedCategory = (category: string | null | undefined) =>
  Boolean(category && !category.startsWith(NEW_CATEGORY_PREFIX));
