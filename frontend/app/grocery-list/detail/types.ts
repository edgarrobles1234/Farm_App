import type { GroceryItem } from '@/mockdata/GroceryList';

export type TextStyle = {
  bold?: boolean;
  underline?: boolean;
  italic?: boolean;
};

export type ExtendedGroceryItem = GroceryItem & {
  textStyle?: TextStyle;
};

export type Category = {
  id: string;
  name: string | null;
  isCollapsed: boolean;
  items: ExtendedGroceryItem[];
};
