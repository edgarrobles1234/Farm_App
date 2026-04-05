import { ScrollView, StyleSheet, TouchableOpacity, TextInput, View } from 'react-native';
import React, { useEffect, useMemo, useState } from 'react';
import { router } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { theme } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { SafeAreaView } from 'react-native-safe-area-context';
import FarmCard from '@/components/ui/farmcard';
import { Ionicons } from '@expo/vector-icons';

import { useCurrentLocation } from '@/hooks/useCurrentLocation';
import { addDistanceAndSort } from '@/lib/location';
import { useAuth } from '@/context/auth-context';
import { useFarms } from '@/hooks/useFarms';
import { RecipeCard } from '@/components/ui/recipes/recipecard';
import { recipes } from '@/lib/recipes';
import { GroceryListCard } from '@/components/ui/grocerylist/GroceryListCard';
import { mockGroceryLists } from '@/mockdata/GroceryList';

import { openDirections } from '@/lib/directions';
import { formatAddress } from '@/lib/address';

import { supabase } from '@/lib/supabase'; // <-- adjust path if different

type ProduceItem = {
  id: string;
  name: string;
  category: string;
  default_sold_by: string;
};

export default function HomeScreen() {
  const { colors } = useTheme();
  const { session } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  const { coords: userCoords, locationText } = useCurrentLocation();
  const { data: farms = [], isLoading: farmsLoading, error: farmsError } = useFarms();

  // In Season Now
  const [currentProduce, setCurrentProduce] = useState<ProduceItem[]>([]);
  const [produceLoading, setProduceLoading] = useState(false);
  const [produceError, setProduceError] = useState<string | null>(null);

  const metadata = session?.user?.user_metadata as
    | { name?: string; full_name?: string; username?: string }
    | undefined;

  const displayName =
    metadata?.name?.trim() ||
    metadata?.full_name?.trim() ||
    metadata?.username?.trim() ||
    session?.user?.email?.split('@')[0] ||
    'there';

  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');

  const farmsWithDistance = addDistanceAndSort(farms, userCoords);

  const mostRecentGroceryList = useMemo(() => {
    const toTime = (dateStr: string) => {
      if (!dateStr) return 0;
      if (dateStr.toLowerCase() === 'today') return Date.now();

      const [m, d, yy] = dateStr.split('/').map(Number);
      if (!m || !d || !yy) return 0;

      const fullYear = yy < 100 ? 2000 + yy : yy;
      return new Date(fullYear, m - 1, d).getTime();
    };

    return [...mockGroceryLists].sort((a, b) => toTime(b.date) - toTime(a.date))[0] ?? null;
  }, []);

  // Load current-month produce from Supabase
  useEffect(() => {
    let cancelled = false;

    const loadCurrentProduce = async () => {
      setProduceLoading(true);
      setProduceError(null);

      const month = new Date().getMonth() + 1; // 1-12

      const { data, error } = await supabase
        .from('produce_item_season_months')
        .select(
          `
          produce_items!inner (
            id,
            name,
            category,
            default_sold_by,
            is_available
          )
        `
        )
        .eq('month', month)
        .eq('produce_items.is_available', true);

      if (cancelled) return;

      if (error) {
        console.log('Produce load error:', error);
        setProduceError('Could not load produce.');
        setCurrentProduce([]);
        setProduceLoading(false);
        return;
      }

      const items =
        (data ?? [])
          .map((row: any) => row.produce_items)
          .filter(Boolean)
          .sort((a: ProduceItem, b: ProduceItem) => a.name.localeCompare(b.name)) ?? [];

      setCurrentProduce(items);
      setProduceLoading(false);
    };

    loadCurrentProduce();

    return () => {
      cancelled = true;
    };
  }, []);

  // Filter produce using the existing search bar
  const filteredProduce = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return currentProduce;

    return currentProduce.filter(
      (p) => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)
    );
  }, [currentProduce, searchQuery]);

  const handleFarmPress = (farmId: number) => {
    router.push(`/farm/${farmId}`);
  };

  const handleDirectionPress = async (farmId: number) => {
  const farm = farms.find((f) => f.id === farmId);
  if (!farm) return;

  const hasRealAddress =
    !!farm.street?.trim() && (!!farm.city?.trim() || !!farm.postal_code?.trim());

  const finalDest = hasRealAddress
    ? formatAddress(farm)
    : `${farm.latitude},${farm.longitude}`;

  try {
    await openDirections(finalDest);
  } catch (e) {
    console.log("Could not open directions", e);
  }
};

  const handleSharePress = (farmId: number) => {
    console.log('Share pressed:', farmId);
    // TODO: Share farm details
  };

  const handleRecipePress = (recipeId: string) => {
    router.push(`/recipe/${recipeId}`);
  };

  const handleEditRecipePress = (recipeId: string) => {
    router.push('/recipe/new');
  };

  const handleProducePress = (produceId: string) => {
    router.push(`/produce/${produceId}`);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <ScrollView style={styles.container}>
        {/* Header */}
        <ThemedView style={styles.header}>
          <TouchableOpacity
            style={[styles.avatar, { backgroundColor: theme.brand.primary }]}
            onPress={() => router.push('/settings')}
          >
            <ThemedText style={styles.aiText}>{initials || 'U'}</ThemedText>
          </TouchableOpacity>
          <ThemedText type="defaultSemiBold" style={[styles.welcome, { color: colors.text.primary }]}>
            {`Welcome ${displayName}!`}
          </ThemedText>
        </ThemedView>

        {/* Search Bar */}
        <View
          style={[
            styles.searchContainer,
            {
              backgroundColor: colors.input.background,
              borderColor: colors.border.light,
              borderWidth: 1,
            },
          ]}
        >
          <Ionicons name="search" size={30} color={colors.text.tertiary} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: colors.input.text }]}
            placeholder="Search produce, farms, recipes..."
            placeholderTextColor={colors.input.placeholder}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Grocery List */}
        <ThemedView style={styles.section}>
          <ThemedText style={[styles.sectionTitle, { color: colors.text.primary }]}>
            Your Grocery List
          </ThemedText>
          {mostRecentGroceryList ? (
            <GroceryListCard list={mostRecentGroceryList} style={styles.homeGroceryCard} />
          ) : (
            <ThemedText style={{ color: colors.text.tertiary }}>No grocery lists yet.</ThemedText>
          )}
        </ThemedView>

        {/* In Season Now */}
        <ThemedView style={styles.section}>
          <ThemedText style={[styles.sectionTitle, { color: colors.text.primary }]}>
            In Season Now
          </ThemedText>

          {produceLoading ? (
            <ThemedText style={{ color: colors.text.tertiary }}>Loading produce…</ThemedText>
          ) : produceError ? (
            <ThemedText style={{ color: colors.text.tertiary }}>{produceError}</ThemedText>
          ) : filteredProduce.length === 0 ? (
            <ThemedText style={{ color: colors.text.tertiary }}>No seasonal produce found.</ThemedText>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.produceScroll}>
              {filteredProduce.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.produceChip,
                    {
                      backgroundColor: colors.input.background,
                      borderColor: colors.border.light,
                    },
                  ]}
                  onPress={() => handleProducePress(item.id)}
                >
                  <ThemedText style={[styles.produceName, { color: colors.text.primary }]}>
                    {item.name}
                  </ThemedText>
                  <ThemedText style={[styles.produceMeta, { color: colors.text.tertiary }]}>
                    {item.category} • {item.default_sold_by}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </ThemedView>

        {/* Close Farms */}
        <ThemedView style={styles.section}>
          <ThemedText style={[styles.sectionTitle, { color: colors.text.primary }]}>
            Close Farms Near You
          </ThemedText>

          <ThemedText style={{ color: colors.text.tertiary, marginTop: 2, marginBottom: 2 }}>
            📍 {locationText}
          </ThemedText>

          {farmsLoading ? (
            <ThemedText style={{ color: colors.text.tertiary }}>Loading farms…</ThemedText>
          ) : farmsError ? (
            <ThemedText style={{ color: colors.text.tertiary }}>Could not load farms.</ThemedText>
          ) : farmsWithDistance.length === 0 ? (
            <ThemedText style={{ color: colors.text.tertiary }}>No farms available yet.</ThemedText>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.farmsScroll}
              contentContainerStyle={styles.farmsScrollContent}
            >
              {farmsWithDistance.map((farm) => (
                <View key={farm.id} style={{ width: 300 }}>
                  <FarmCard
                    name={farm.name}
                    rating={farm.rating}
                    reviews={farm.reviews}
                    distance={farm.distanceMi != null ? `${farm.distanceMi.toFixed(1)} mi` : '…'}
                    products={farm.products}
                    onPress={() => handleFarmPress(farm.id)}
                    onDirectionPress={() => handleDirectionPress(farm.id)}
                    onSharePress={() => handleSharePress(farm.id)}
                  />
                </View>
              ))}
            </ScrollView>
          )}
        </ThemedView>

        {/* Top Recipes */}
        <ThemedView style={[styles.section, { marginBottom: 80 }]}>
          <View style={styles.sectionHeaderRow}>
            <ThemedText style={[styles.sectionTitle, { color: colors.text.primary }]}>
              Top Recipes of the Week
            </ThemedText>
            <TouchableOpacity onPress={() => router.push('/recipe/recipes')} activeOpacity={0.7}>
              <ThemedText style={[styles.sectionLink, { color: theme.brand.primary }]}>
                Browse All
              </ThemedText>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.recipesScroll}>
            {recipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                {...recipe}
                onPress={() => handleRecipePress(recipe.id)}
                onEditPress={() => handleEditRecipePress(recipe.id)}
              />
            ))}
          </ScrollView>
        </ThemedView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: theme.spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.full,
    marginRight: theme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  welcome: {
    flex: 1,
    fontSize: theme.typography.fontSizes.h3,
    fontWeight: theme.typography.fontWeights.semibold,
    fontFamily: theme.typography.fontFamily,
  },
  aiText: {
    color: theme.neutral.white,
    fontSize: theme.typography.fontSizes.h3,
    fontWeight: theme.typography.fontWeights.bold,
    fontFamily: theme.typography.fontFamily,
    textAlign: 'center',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: theme.borderRadius.full,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  searchIcon: {
    marginRight: theme.spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: theme.typography.fontSizes.h4,
    fontFamily: theme.typography.fontFamily,
  },
  section: {
    marginBottom: theme.spacing.lg,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSizes.h3,
    fontWeight: theme.typography.fontWeights.bold,
    fontFamily: theme.typography.fontFamily,
    marginBottom: theme.spacing.sm,
  },
  sectionLink: {
    fontSize: 14,
    fontWeight: theme.typography.fontWeights.semibold,
    fontFamily: theme.typography.fontFamily,
  },

  // Produce
  produceScroll: {
    marginTop: theme.spacing.md,
    marginLeft: -theme.spacing.md,
    paddingLeft: theme.spacing.md,
  },
  produceChip: {
    borderWidth: 1,
    borderRadius: theme.borderRadius.lg,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    marginRight: theme.spacing.sm,
    minWidth: 150,
  },
  produceName: {
    fontSize: theme.typography.fontSizes.h4,
    fontWeight: theme.typography.fontWeights.semibold,
    fontFamily: theme.typography.fontFamily,
  },
  produceMeta: {
    marginTop: 2,
    fontSize: 12,
    fontFamily: theme.typography.fontFamily,
  },

  farmsScroll: {
    marginTop: theme.spacing.sm,
    marginLeft: -theme.spacing.md,
    paddingLeft: theme.spacing.md,
  },
  farmsScrollContent: {
    gap: theme.spacing.md,
    paddingRight: theme.spacing.md,
    paddingVertical: 6,
  },
  homeGroceryCard: {
    marginBottom: 0,
  },
  recipesScroll: {
    marginTop: theme.spacing.md,
    marginLeft: -theme.spacing.md,
    paddingLeft: theme.spacing.md,
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: theme.spacing.md,
    paddingBottom: theme.spacing.lg,
    borderTopWidth: 1,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
