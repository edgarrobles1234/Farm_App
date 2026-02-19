export type Recipe = {
  id: string;
  title: string;
  rating: number;
  ratingsCount: number;
  duration: string;
  imageUrl?: string;
};

export const recipes: Recipe[] = [
  {
    id: '1',
    title: 'Banana Blueberry',
    rating: 4.7,
    ratingsCount: 3000,
    duration: '30 mins',
    imageUrl: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=1200&auto=format&fit=crop',
  },
  {
    id: '2',
    title: 'Strawberry Smoothie Bowl',
    rating: 4.8,
    ratingsCount: 2500,
    duration: '15 mins',
    imageUrl: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?q=80&w=1200&auto=format&fit=crop',
  },
  {
    id: '3',
    title: 'Avocado Toast with Egg',
    rating: 4.6,
    ratingsCount: 1900,
    duration: '20 mins',
    imageUrl: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?q=80&w=1200&auto=format&fit=crop',
  },
];
