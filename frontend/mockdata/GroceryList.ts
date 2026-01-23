// data/mockGroceryLists.ts
export interface GroceryItem {
  id: string;
  name: string;
  quantity?: number;
  unit?: string;
  checked: boolean;
  category?: string;
  isPinned?: boolean;
}

export interface GroceryList {
  id: string;
  title: string;
  date: string;
  isPinned?: boolean;
  items: GroceryItem[];
  itemCount: number;
  checkedCount: number;
}

export const mockGroceryLists: GroceryList[] = [
  {
    id: '1',
    title: 'My Grocery list',
    date: 'Today',
    isPinned: true,
    itemCount: 12,
    checkedCount: 3,
    items: [
      { id: '1-1', name: 'Milk', quantity: 2, unit: 'gallons', checked: false, category: 'Dairy' },
      { id: '1-2', name: 'Bread', quantity: 1, unit: 'loaf', checked: true, category: 'Bakery' },
      { id: '1-3', name: 'Eggs', quantity: 12, unit: 'count', checked: false, category: 'Dairy' },
      // Add more items...
    ]
  },
  {
    id: '2',
    title: 'For Home',
    date: '1/21/26',
    isPinned: false,
    itemCount: 8,
    checkedCount: 0,
    items: [
      { id: '2-1', name: 'Paper Towels', quantity: 3, unit: 'rolls', checked: false, category: 'Household' },
      { id: '2-2', name: 'Dish Soap', quantity: 1, unit: 'bottle', checked: false, category: 'Household' },
      // Add more items...
    ]
  },
  {
    id: '3',
    title: 'For the party',
    date: '1/2/26',
    isPinned: false,
    itemCount: 15,
    checkedCount: 5,
    items: [
      { id: '3-1', name: 'Chips', quantity: 5, unit: 'bags', checked: false, category: 'Snacks' },
      { id: '3-2', name: 'Soda', quantity: 2, unit: 'liters', checked: true, category: 'Beverages' },
      // Add more items...
    ]
  },
  {
    id: '4',
    title: 'For the party',
    date: '1/2/26',
    isPinned: false,
    itemCount: 10,
    checkedCount: 2,
    items: []
  },
  {
    id: '5',
    title: 'Date Night!!',
    date: '1/2/26',
    isPinned: false,
    itemCount: 6,
    checkedCount: 0,
    items: []
  }
];