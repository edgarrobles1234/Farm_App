import AsyncStorage from '@react-native-async-storage/async-storage';
import type { GroceryItem, GroceryList } from '@/mockdata/GroceryList';

const STORAGE_KEY = '@farm_app/grocery_lists_v1';

type TextStyle = {
  bold?: boolean;
  underline?: boolean;
  italic?: boolean;
};

export type LocalGroceryItem = GroceryItem & {
  category?: string | null;
  textStyle?: TextStyle;
};

export type LocalGroceryList = Omit<GroceryList, 'items'> & {
  items: LocalGroceryItem[];
  updatedAt: number;
};

export type SaveLocalGroceryListInput = {
  id?: string;
  title: string;
  date?: string;
  isPinned?: boolean;
  items: LocalGroceryItem[];
};

const formatDateLabel = (date = new Date()) => {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const year = String(date.getFullYear()).slice(-2);
  return `${month}/${day}/${year}`;
};

const sortLists = (lists: LocalGroceryList[]) =>
  [...lists].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return b.updatedAt - a.updatedAt;
  });

const readAll = async (): Promise<LocalGroceryList[]> => {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as LocalGroceryList[];
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
};

const writeAll = async (lists: LocalGroceryList[]) => {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(lists));
};

export async function getLocalGroceryLists(): Promise<LocalGroceryList[]> {
  const lists = await readAll();
  return sortLists(lists);
}

export async function getLocalGroceryListById(id: string): Promise<LocalGroceryList | null> {
  const lists = await readAll();
  return lists.find((list) => list.id === id) ?? null;
}

export async function saveLocalGroceryList(
  input: SaveLocalGroceryListInput
): Promise<LocalGroceryList> {
  const lists = await readAll();
  const existing = input.id ? lists.find((list) => list.id === input.id) : undefined;
  const id = input.id ?? `${Date.now()}`;
  const now = Date.now();

  const saved: LocalGroceryList = {
    id,
    title: input.title,
    date: input.date ?? existing?.date ?? formatDateLabel(),
    isPinned: input.isPinned ?? false,
    items: input.items,
    itemCount: input.items.length,
    checkedCount: input.items.filter((item) => item.checked).length,
    updatedAt: now,
  };

  const nextLists = existing
    ? lists.map((list) => (list.id === id ? saved : list))
    : [...lists, saved];

  await writeAll(nextLists);
  return saved;
}
