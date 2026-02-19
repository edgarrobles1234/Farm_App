import { ScrollView, StyleSheet, TouchableOpacity, TextInput, View } from 'react-native';
import React, { useMemo, useState } from 'react';
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

// ✅ add these imports
import { openDirections } from '@/lib/directions';
import { formatAddress } from '@/lib/address';

export default function HomeScreen() {
  const { colors } = useTheme();
  const { session } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  const { coords: userCoords, locationText } = useCurrentLocation();
  const { data: farms = [], isLoading: farmsLoading, error: farmsError } = useFarms();

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

  const handleFarmPress = (farmId: number) => {
    console.log('Farm pressed:', farmId);
    // TODO: Navigate to farm detail screen
  };

  // opens Apple Maps (iOS) / Google Maps (Android)
  const handleDirectionPress = async (farmId: number) => {
    const farm = farms.find((f) => f.id === farmId);
    if (!farm) return;

    const destination = formatAddress(farm);
    const finalDest =
      destination.trim().length > 0 ? destination : `${farm.latitude},${farm.longitude}`;

    try {
      await openDirections(finalDest);
    } catch (e) {
      console.log('Could not open directions', e);
    }
  };

  const handleSharePress = (farmId: number) => {
    console.log('Share pressed:', farmId);
    // TODO: Share farm details
  };

  const handleRecipePress = (recipeId: string) => {
    console.log('Recipe pressed:', recipeId);
    // TODO: Navigate to recipe detail screen
  };

  const handleEditRecipePress = (recipeId: string) => {
    console.log('Edit recipe:', recipeId);
    // TODO: Navigate to recipe edit screen
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
            placeholder="Search farms, recipes..."
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
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.farmsScroll}>
              {farmsWithDistance.map((farm) => (
                <FarmCard
                  key={farm.id}
                  name={farm.name}
                  rating={farm.rating}
                  reviews={farm.reviews}
                  distance={farm.distanceMi != null ? `${farm.distanceMi.toFixed(1)} mi` : '…'}
                  products={farm.products}
                  onPress={() => handleFarmPress(farm.id)}
                  onDirectionPress={() => handleDirectionPress(farm.id)}
                  onSharePress={() => handleSharePress(farm.id)}
                />
              ))}
            </ScrollView>
          )}
        </ThemedView>

        {/* Top Recipes */}
        <ThemedView style={[styles.section, { marginBottom: 80 }]}>
          <ThemedText style={[styles.sectionTitle, { color: colors.text.primary }]}>
            Top Recipes of the Week
          </ThemedText>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.recipesScroll}
          >
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
  sectionTitle: {
    fontSize: theme.typography.fontSizes.h3,
    fontWeight: theme.typography.fontWeights.bold,
    fontFamily: theme.typography.fontFamily,
    marginBottom: theme.spacing.sm,
  },
  farmsScroll: {
    marginTop: theme.spacing.md,
    marginLeft: -theme.spacing.md,
    paddingLeft: theme.spacing.md,
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
