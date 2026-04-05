import type { FarmWithCoords } from '@/lib/location';

export type MockFarmProfile = {
  heroLabel: string;
  title: string;
  tagline: string;
  produce: string[];
  rating: number;
  reviews: number;
  reviewHeadline: string;
  reviewBody: string;
  visitNote: string;
  locationNote: string;
  addressOverride?: string;
  produceListings: {
    id: string;
    name: string;
    price: string;
    unit: string;
    note: string;
    color: string;
    icon: 'leaf-outline' | 'nutrition-outline' | 'flower-outline' | 'sunny-outline';
  }[];
  reviewEntries: {
    id: string;
    author: string;
    rating: number;
    title: string;
    body: string;
    date: string;
  }[];
};

const mockFarmProfiles: Record<number, MockFarmProfile> = {
  1: {
    heroLabel: 'Organic orchard',
    title: 'Golden Hour Farm',
    tagline: 'Known for fruit-forward harvests, small-batch greens, and a relaxed weekend market setup.',
    produce: ['Blueberries', 'Strawberries', 'Bananas', 'Lettuce', 'Fresh Herbs'],
    rating: 4.8,
    reviews: 128,
    reviewHeadline: 'Families love the fruit quality and easy pickup experience.',
    reviewBody: 'Visitors mention ripe produce, friendly staff, and a farmstand that feels easy to browse in person.',
    visitNote: 'This farm does not sell directly in the app. Use the listing to discover what is available, then visit the farmstand in person.',
    locationNote: 'Best for a weekend stop. Check directions and head to the farm directly to shop what is fresh that day.',
    addressOverride: '241 Harvest Lane, Ojai, CA 93023',
    produceListings: [
      { id: '1-a', name: 'Blueberries', price: '$6.50', unit: 'per pint', note: 'Sweet peak-season berries picked same morning.', color: '#DCE7FF', icon: 'nutrition-outline' },
      { id: '1-b', name: 'Strawberries', price: '$5.00', unit: 'per basket', note: 'Soft, fragrant, and best for fresh eating.', color: '#FFD9E1', icon: 'flower-outline' },
      { id: '1-c', name: 'Herb Mix', price: '$4.25', unit: 'per bunch', note: 'Mint, basil, and parsley bundles for quick meals.', color: '#E0F1D8', icon: 'leaf-outline' },
    ],
    reviewEntries: [
      { id: '1-r1', author: 'Maya R.', rating: 5, title: 'Worth the drive', body: 'The berries were excellent and the farmstand staff helped me find the ripest fruit right away.', date: 'Mar 18' },
      { id: '1-r2', author: 'Jordan L.', rating: 4.5, title: 'Great weekend stop', body: 'Very fresh produce and an easy pickup flow. I just wish I had come earlier for the herb bundles.', date: 'Mar 11' },
      { id: '1-r3', author: 'Chris T.', rating: 4.8, title: 'Family-friendly farm visit', body: 'Clean setup, quick checkout in person, and really strong fruit quality.', date: 'Feb 27' },
    ],
  },
  2: {
    heroLabel: 'Coastal grower',
    title: 'Clover Creek Farm',
    tagline: 'A bright local grower with seasonal berries, cucumbers, and market bundles picked for quick meals.',
    produce: ['Strawberries', 'Cucumber', 'Peaches', 'Microgreens', 'Spinach'],
    rating: 4.7,
    reviews: 94,
    reviewHeadline: 'Regulars praise the freshness and the variety each week.',
    reviewBody: 'Reviews center on quality produce, approachable prices, and a farm team that helps customers shop in person.',
    visitNote: 'Discovery only. Users browse here, then drive out to the farm to purchase from the current market table.',
    locationNote: 'Great stop if you are planning a produce run. Inventory is best confirmed on-site.',
    addressOverride: '88 Creekside Road, Ventura, CA 93001',
    produceListings: [
      { id: '2-a', name: 'Cucumbers', price: '$3.75', unit: 'per pound', note: 'Crunchy and cold-kept for salads and snacks.', color: '#E0F1D8', icon: 'leaf-outline' },
      { id: '2-b', name: 'Peaches', price: '$4.90', unit: 'per pound', note: 'Soft-ripe and ideal for same-day eating.', color: '#FFE5C4', icon: 'sunny-outline' },
      { id: '2-c', name: 'Microgreens', price: '$5.25', unit: 'per clamshell', note: 'Peppery mix with strong shelf life for the week.', color: '#E6F6E1', icon: 'flower-outline' },
    ],
    reviewEntries: [
      { id: '2-r1', author: 'Ana P.', rating: 4.7, title: 'Super fresh greens', body: 'Everything looked recently harvested and the microgreens lasted longer than expected.', date: 'Mar 20' },
      { id: '2-r2', author: 'Derek S.', rating: 4.6, title: 'Helpful staff', body: 'They answered questions about what was best that week and helped me plan my produce run.', date: 'Mar 08' },
      { id: '2-r3', author: 'Leah K.', rating: 4.8, title: 'Reliable local stop', body: 'Good variety and very easy to find once you follow directions.', date: 'Feb 26' },
    ],
  },
  3: {
    heroLabel: 'Family farm',
    title: 'Sunbasket Acres',
    tagline: 'A compact family-run farm with ripe avocados, eggs, greens, and a highly rated farm pickup loop.',
    produce: ['Avocados', 'Eggs', 'Tomatoes', 'Basil', 'Arugula'],
    rating: 4.9,
    reviews: 173,
    reviewHeadline: 'The avocado quality and quick pickup are standout favorites.',
    reviewBody: 'Customers call out dependable produce quality, great value, and a calm, welcoming in-person visit.',
    visitNote: 'Produce is purchased at the farm itself. This page is meant to help users decide where to go, not check out online.',
    locationNote: 'Use directions before you leave. The farm pickup area is designed for on-site browsing and collection.',
    addressOverride: '615 Canyon View Drive, Carpinteria, CA 93013',
    produceListings: [
      { id: '3-a', name: 'Avocados', price: '$2.25', unit: 'each', note: 'Ripe range available from same-day to later-in-week.', color: '#E2F0C8', icon: 'leaf-outline' },
      { id: '3-b', name: 'Heirloom Tomatoes', price: '$5.50', unit: 'per pound', note: 'Mixed-color selection with rich flavor and softer texture.', color: '#FFD9D4', icon: 'nutrition-outline' },
      { id: '3-c', name: 'Farm Eggs', price: '$7.00', unit: 'per dozen', note: 'Limited quantity each morning, usually sold fast.', color: '#FFF0C9', icon: 'sunny-outline' },
    ],
    reviewEntries: [
      { id: '3-r1', author: 'Sofia M.', rating: 5, title: 'Best avocados nearby', body: 'I keep coming back for the avocado selection and how easy the pickup area is to navigate.', date: 'Mar 16' },
      { id: '3-r2', author: 'Ryan C.', rating: 4.9, title: 'Excellent tomatoes', body: 'The heirlooms were standout quality and the staff was welcoming on arrival.', date: 'Mar 05' },
      { id: '3-r3', author: 'Noah G.', rating: 4.8, title: 'Calm in-person experience', body: 'Quick stop, well organized, and worth planning a full produce trip around.', date: 'Feb 21' },
    ],
  },
};

export function getMockFarmProfile(farmId: number, farm?: FarmWithCoords | null): MockFarmProfile {
  const base = mockFarmProfiles[farmId];

  if (base) return base;

  return {
    heroLabel: 'Local grower',
    title: farm?.name ?? 'Neighborhood Farm',
    tagline: 'A seasonal farm profile used for early product design and discovery testing.',
    produce: farm?.products
      ?.split(/,|•|\n/)
      .map((item) => item.trim())
      .filter(Boolean) ?? ['Tomatoes', 'Greens', 'Herbs'],
    rating: farm?.rating ?? 4.6,
    reviews: farm?.reviews ?? 52,
    reviewHeadline: 'Customers report a strong in-person shopping experience.',
    reviewBody: 'This is placeholder review content for now while the real farm detail system is being built.',
    visitNote: 'This farm page is mock content for now. Users still visit the farm in person to buy produce.',
    locationNote: 'Use directions and go to the farm directly to shop available produce.',
    addressOverride: undefined,
    produceListings: [
      { id: 'fallback-a', name: 'Tomatoes', price: '$4.50', unit: 'per pound', note: 'Placeholder listing for current seasonal stock.', color: '#FFD9D4', icon: 'nutrition-outline' },
      { id: 'fallback-b', name: 'Greens', price: '$3.95', unit: 'per bunch', note: 'Mock listing used to preview farm detail cards.', color: '#E0F1D8', icon: 'leaf-outline' },
    ],
    reviewEntries: [
      { id: 'fallback-r1', author: 'Local Shopper', rating: 4.6, title: 'Solid neighborhood option', body: 'Mock review content for now, but useful for validating the review layout and hierarchy.', date: 'Mar 02' },
      { id: 'fallback-r2', author: 'Weekend Visitor', rating: 4.4, title: 'Easy to find', body: 'Placeholder review text showing how longer user feedback will read in the final design.', date: 'Feb 18' },
    ],
  };
}
