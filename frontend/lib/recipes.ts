export type Recipe = {
  id: string;
  title: string;
  rating: number;
  ratingsCount: number;
  duration: string;
  imageUrl?: string;
  category: string;
  difficulty: 'Easy' | 'Medium' | 'Advanced';
  description: string;
  produce: string[];
};

export const recipes: Recipe[] = [
  {
    id: '1',
    title: 'Banana Blueberry',
    rating: 4.7,
    ratingsCount: 3000,
    duration: '30 mins',
    imageUrl: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=1200&auto=format&fit=crop',
    category: 'Breakfast',
    difficulty: 'Easy',
    description: 'A bright breakfast bowl layered with berries, yogurt, and crunchy toppings.',
    produce: ['Banana', 'Blueberry'],
  },
  {
    id: '2',
    title: 'Strawberry Smoothie Bowl',
    rating: 4.8,
    ratingsCount: 2500,
    duration: '15 mins',
    imageUrl: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?q=80&w=1200&auto=format&fit=crop',
    category: 'Smoothies',
    difficulty: 'Easy',
    description: 'Cold, creamy, and fast to make with peak-season strawberries and seeds.',
    produce: ['Strawberry', 'Banana'],
  },
  {
    id: '3',
    title: 'Avocado Toast with Egg',
    rating: 4.6,
    ratingsCount: 1900,
    duration: '20 mins',
    imageUrl: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?q=80&w=1200&auto=format&fit=crop',
    category: 'Lunch',
    difficulty: 'Easy',
    description: 'Crisp toast, creamy avocado, and a jammy egg finished with herbs.',
    produce: ['Avocado', 'Microgreens'],
  },
  {
    id: '4',
    title: 'Roasted Tomato Pasta',
    rating: 4.9,
    ratingsCount: 4100,
    duration: '40 mins',
    imageUrl: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?q=80&w=1200&auto=format&fit=crop',
    category: 'Dinner',
    difficulty: 'Medium',
    description: 'Slow-roasted tomatoes and garlic folded into a silky weeknight pasta sauce.',
    produce: ['Tomato', 'Garlic', 'Basil'],
  },
  {
    id: '5',
    title: 'Summer Peach Salad',
    rating: 4.5,
    ratingsCount: 1600,
    duration: '12 mins',
    imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=1200&auto=format&fit=crop',
    category: 'Salads',
    difficulty: 'Easy',
    description: 'Peppery greens, ripe peaches, soft cheese, and a sharp honey vinaigrette.',
    produce: ['Peach', 'Arugula', 'Cucumber'],
  },
  {
    id: '6',
    title: 'Herbed Vegetable Skillet',
    rating: 4.7,
    ratingsCount: 2200,
    duration: '25 mins',
    imageUrl: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?q=80&w=1200&auto=format&fit=crop',
    category: 'Dinner',
    difficulty: 'Medium',
    description: 'A one-pan vegetable skillet built for farmers market produce and quick serving.',
    produce: ['Zucchini', 'Corn', 'Bell Pepper'],
  },
];
