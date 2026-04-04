import React, { useDeferredValue, useMemo, useState } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Stack, router } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { theme } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { recipes } from '@/lib/recipes';

const heroRecipeId = '4';

export default function RecipesScreen() {
  const { colors } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const deferredSearchQuery = useDeferredValue(searchQuery);

  const categories = useMemo(() => {
    const nextCategories = Array.from(new Set(recipes.map((recipe) => recipe.category)));
    return ['All', ...nextCategories];
  }, []);

  const heroRecipe = recipes.find((recipe) => recipe.id === heroRecipeId) ?? recipes[0];

  const filteredRecipes = useMemo(() => {
    const query = deferredSearchQuery.trim().toLowerCase();

    return recipes.filter((recipe) => {
      const matchesCategory = activeCategory === 'All' || recipe.category === activeCategory;
      const matchesQuery =
        !query ||
        recipe.title.toLowerCase().includes(query) ||
        recipe.description.toLowerCase().includes(query) ||
        recipe.produce.some((item) => item.toLowerCase().includes(query));

      return matchesCategory && matchesQuery;
    });
  }, [activeCategory, deferredSearchQuery]);

  const editorPicks = filteredRecipes.slice(0, 3);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={[styles.iconButton, { borderColor: colors.border.light, backgroundColor: colors.background }]}
            onPress={() => router.back()}
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-back" size={22} color={colors.text.primary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.iconButton, styles.addButton, { backgroundColor: theme.brand.primary }]}
            onPress={() => router.push('/recipe/new')}
            activeOpacity={0.85}
          >
            <Ionicons name="add" size={20} color={theme.neutral.white} />
            <ThemedText style={styles.addButtonText}>Create</ThemedText>
          </TouchableOpacity>
        </View>

        <View style={styles.heroCopy}>
          <ThemedText style={[styles.eyebrow, { color: theme.brand.tertiary }]}>
            Seasonal kitchen
          </ThemedText>
          <ThemedText style={[styles.heroTitle, { color: colors.text.primary }]}>
            Recipes built around what is fresh right now.
          </ThemedText>
          <ThemedText style={[styles.heroSubtitle, { color: colors.text.secondary }]}>
            Discover simple meals, save your next market haul, and jump into a new recipe in a few taps.
          </ThemedText>
        </View>

        <View
          style={[
            styles.searchBar,
            {
              backgroundColor: colors.input.background,
              borderColor: colors.border.light,
            },
          ]}
        >
          <Ionicons name="search" size={20} color={colors.text.tertiary} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search by recipe or produce"
            placeholderTextColor={colors.input.placeholder}
            style={[styles.searchInput, { color: colors.input.text }]}
          />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {categories.map((category) => {
            const isActive = category === activeCategory;

            return (
              <TouchableOpacity
                key={category}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: isActive ? theme.brand.primary : colors.background,
                    borderColor: isActive ? theme.brand.primary : colors.border.default,
                  },
                ]}
                onPress={() => setActiveCategory(category)}
                activeOpacity={0.8}
              >
                <ThemedText
                  style={[
                    styles.filterChipText,
                    { color: isActive ? theme.neutral.white : colors.text.secondary },
                  ]}
                >
                  {category}
                </ThemedText>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View
          style={[
            styles.featuredCard,
            {
              backgroundColor: colors.card,
              borderColor: colors.border.light,
            },
          ]}
        >
          <Image source={{ uri: heroRecipe.imageUrl }} style={styles.featuredImage} />
          <View style={styles.featuredOverlay} />
          <View style={styles.featuredContent}>
            <View style={styles.featuredMetaRow}>
              <View style={styles.metaPill}>
                <Ionicons name="leaf-outline" size={14} color={theme.brand.tertiary} />
                <ThemedText style={styles.metaPillText}>{"Editor's pick"}</ThemedText>
              </View>
              <View style={[styles.ratingPill, { backgroundColor: 'rgba(17, 24, 28, 0.52)' }]}>
                <Ionicons name="star" size={13} color={theme.brand.primary} />
                <ThemedText style={styles.ratingPillText}>{heroRecipe.rating}</ThemedText>
              </View>
            </View>

            <ThemedText style={styles.featuredTitle}>{heroRecipe.title}</ThemedText>
            <ThemedText style={styles.featuredDescription}>{heroRecipe.description}</ThemedText>

            <View style={styles.featuredFooter}>
              <View>
                <ThemedText style={styles.featuredFooterLabel}>Best with</ThemedText>
                <ThemedText style={styles.featuredFooterValue}>
                  {heroRecipe.produce.join(' • ')}
                </ThemedText>
              </View>

              <TouchableOpacity
                style={styles.featuredAction}
                onPress={() => router.push(`/recipe/${heroRecipe.id}`)}
                activeOpacity={0.85}
              >
                <ThemedText style={styles.featuredActionText}>Cook this vibe</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: colors.background, borderColor: colors.border.light }]}>
            <ThemedText style={[styles.statValue, { color: colors.text.primary }]}>
              {filteredRecipes.length}
            </ThemedText>
            <ThemedText style={[styles.statLabel, { color: colors.text.secondary }]}>
              recipes to explore
            </ThemedText>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.background, borderColor: colors.border.light }]}>
            <ThemedText style={[styles.statValue, { color: colors.text.primary }]}>15-40</ThemedText>
            <ThemedText style={[styles.statLabel, { color: colors.text.secondary }]}>
              min average cook time
            </ThemedText>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <View>
            <ThemedText style={[styles.sectionTitle, { color: colors.text.primary }]}>
              Quick picks
            </ThemedText>
            <ThemedText style={[styles.sectionSubtitle, { color: colors.text.secondary }]}>
              Fast options for your next grocery run.
            </ThemedText>
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.quickPicksRow}
        >
          {editorPicks.map((recipe) => (
            <TouchableOpacity
              key={recipe.id}
              style={[
                styles.quickPickCard,
                {
                  backgroundColor: colors.background,
                  borderColor: colors.border.light,
                },
              ]}
              activeOpacity={0.86}
              onPress={() => router.push(`/recipe/${recipe.id}`)}
            >
              <Image source={{ uri: recipe.imageUrl }} style={styles.quickPickImage} />
              <ThemedText style={[styles.quickPickCategory, { color: theme.brand.primary }]}>
                {recipe.category}
              </ThemedText>
              <ThemedText style={[styles.quickPickTitle, { color: colors.text.primary }]}>
                {recipe.title}
              </ThemedText>
              <ThemedText style={[styles.quickPickMeta, { color: colors.text.secondary }]}>
                {recipe.duration} • {recipe.difficulty}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.sectionHeader}>
          <View>
            <ThemedText style={[styles.sectionTitle, { color: colors.text.primary }]}>
              Browse all recipes
            </ThemedText>
            <ThemedText style={[styles.sectionSubtitle, { color: colors.text.secondary }]}>
              Filtered for {activeCategory.toLowerCase()} and your current search.
            </ThemedText>
          </View>
        </View>

        <View style={styles.recipeGrid}>
          {filteredRecipes.length === 0 ? (
            <View
              style={[
                styles.emptyState,
                {
                  backgroundColor: colors.background,
                  borderColor: colors.border.light,
                },
              ]}
            >
              <Ionicons name="search-outline" size={26} color={colors.text.tertiary} />
              <ThemedText style={[styles.emptyStateTitle, { color: colors.text.primary }]}>
                No recipes match that filter yet.
              </ThemedText>
              <ThemedText style={[styles.emptyStateBody, { color: colors.text.secondary }]}>
                Try another produce search or switch back to all categories.
              </ThemedText>
            </View>
          ) : (
            filteredRecipes.map((recipe) => (
              <TouchableOpacity
                key={recipe.id}
                style={[
                  styles.recipeTile,
                  {
                    backgroundColor: colors.background,
                    borderColor: colors.border.light,
                  },
                ]}
                activeOpacity={0.88}
                onPress={() => router.push(`/recipe/${recipe.id}`)}
              >
                <Image source={{ uri: recipe.imageUrl }} style={styles.recipeTileImage} />
                <View style={styles.recipeTileBody}>
                  <View style={styles.recipeTileTopRow}>
                    <ThemedText style={[styles.recipeTileCategory, { color: theme.brand.tertiary }]}>
                      {recipe.category}
                    </ThemedText>
                    <View style={styles.recipeTileRating}>
                      <Ionicons name="star" size={12} color={theme.brand.red} />
                      <ThemedText style={[styles.recipeTileRatingText, { color: colors.text.secondary }]}>
                        {recipe.rating}
                      </ThemedText>
                    </View>
                  </View>
                  <ThemedText style={[styles.recipeTileTitle, { color: colors.text.primary }]}>
                    {recipe.title}
                  </ThemedText>
                  <ThemedText
                    style={[styles.recipeTileDescription, { color: colors.text.secondary }]}
                    numberOfLines={2}
                  >
                    {recipe.description}
                  </ThemedText>
                  <View style={styles.recipeTileFooter}>
                    <ThemedText style={[styles.recipeTileMeta, { color: colors.text.secondary }]}>
                      {recipe.duration}
                    </ThemedText>
                    <ThemedText style={[styles.recipeTileMeta, { color: colors.text.secondary }]}>
                      {recipe.difficulty}
                    </ThemedText>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing['4xl'],
    gap: theme.spacing.lg,
  },
  header: {
    marginTop: theme.spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconButton: {
    height: 44,
    minWidth: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.md,
    flexDirection: 'row',
    gap: theme.spacing.xs,
  },
  addButton: {
    borderWidth: 0,
  },
  addButtonText: {
    color: theme.neutral.white,
    fontWeight: theme.typography.fontWeights.semibold,
    fontFamily: theme.typography.fontFamily,
  },
  heroCopy: {
    gap: theme.spacing.sm,
  },
  eyebrow: {
    fontSize: 13,
    fontWeight: theme.typography.fontWeights.bold,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    fontFamily: theme.typography.fontFamily,
  },
  heroTitle: {
    fontSize: 34,
    lineHeight: 40,
    fontWeight: theme.typography.fontWeights.bold,
    fontFamily: theme.typography.fontFamily,
  },
  heroSubtitle: {
    fontSize: theme.typography.fontSizes.h4,
    lineHeight: 24,
    fontFamily: theme.typography.fontFamily,
  },
  searchBar: {
    borderWidth: 1,
    borderRadius: theme.borderRadius.full,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: theme.typography.fontSizes.h4,
    fontFamily: theme.typography.fontFamily,
  },
  filterRow: {
    gap: theme.spacing.sm,
  },
  filterChip: {
    borderWidth: 1,
    borderRadius: theme.borderRadius.full,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: theme.typography.fontWeights.semibold,
    fontFamily: theme.typography.fontFamily,
  },
  featuredCard: {
    minHeight: 380,
    borderRadius: 28,
    borderWidth: 1,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  featuredImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  featuredOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(17, 24, 28, 0.34)',
  },
  featuredContent: {
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  featuredMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: theme.borderRadius.full,
    backgroundColor: '#F4EEC7',
  },
  metaPillText: {
    color: theme.brand.tertiary,
    fontSize: 12,
    fontWeight: theme.typography.fontWeights.bold,
    fontFamily: theme.typography.fontFamily,
  },
  ratingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: theme.borderRadius.full,
  },
  ratingPillText: {
    color: theme.neutral.white,
    fontSize: 12,
    fontWeight: theme.typography.fontWeights.semibold,
    fontFamily: theme.typography.fontFamily,
  },
  featuredTitle: {
    color: theme.neutral.white,
    fontSize: 30,
    lineHeight: 34,
    fontWeight: theme.typography.fontWeights.bold,
    fontFamily: theme.typography.fontFamily,
  },
  featuredDescription: {
    color: 'rgba(255, 255, 255, 0.88)',
    fontSize: 15,
    lineHeight: 22,
    fontFamily: theme.typography.fontFamily,
    maxWidth: '88%',
  },
  featuredFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    gap: theme.spacing.md,
  },
  featuredFooterLabel: {
    color: 'rgba(255, 255, 255, 0.74)',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: theme.typography.fontWeights.semibold,
    fontFamily: theme.typography.fontFamily,
  },
  featuredFooterValue: {
    color: theme.neutral.white,
    fontSize: 14,
    marginTop: 4,
    fontWeight: theme.typography.fontWeights.semibold,
    fontFamily: theme.typography.fontFamily,
  },
  featuredAction: {
    backgroundColor: theme.brand.primary,
    borderRadius: theme.borderRadius.full,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 12,
  },
  featuredActionText: {
    color: theme.neutral.white,
    fontSize: 14,
    fontWeight: theme.typography.fontWeights.bold,
    fontFamily: theme.typography.fontFamily,
  },
  statsRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  statCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.md,
  },
  statValue: {
    fontSize: 28,
    fontWeight: theme.typography.fontWeights.bold,
    fontFamily: theme.typography.fontFamily,
  },
  statLabel: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 18,
    fontFamily: theme.typography.fontFamily,
  },
  sectionHeader: {
    gap: 4,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSizes.h2,
    fontWeight: theme.typography.fontWeights.bold,
    fontFamily: theme.typography.fontFamily,
  },
  sectionSubtitle: {
    fontSize: 14,
    fontFamily: theme.typography.fontFamily,
  },
  quickPicksRow: {
    gap: theme.spacing.md,
    paddingRight: theme.spacing.xs,
  },
  quickPickCard: {
    width: 220,
    borderRadius: 24,
    borderWidth: 1,
    overflow: 'hidden',
    paddingBottom: theme.spacing.md,
  },
  quickPickImage: {
    width: '100%',
    height: 150,
    marginBottom: theme.spacing.md,
  },
  quickPickCategory: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: theme.typography.fontWeights.bold,
    fontFamily: theme.typography.fontFamily,
    paddingHorizontal: theme.spacing.md,
  },
  quickPickTitle: {
    fontSize: 18,
    lineHeight: 22,
    fontWeight: theme.typography.fontWeights.bold,
    fontFamily: theme.typography.fontFamily,
    paddingHorizontal: theme.spacing.md,
    marginTop: 6,
  },
  quickPickMeta: {
    fontSize: 13,
    fontFamily: theme.typography.fontFamily,
    paddingHorizontal: theme.spacing.md,
    marginTop: 6,
  },
  recipeGrid: {
    gap: theme.spacing.md,
  },
  recipeTile: {
    borderWidth: 1,
    borderRadius: 24,
    overflow: 'hidden',
  },
  emptyState: {
    borderWidth: 1,
    borderRadius: 24,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.xl,
    alignItems: 'center',
  },
  emptyStateTitle: {
    marginTop: theme.spacing.sm,
    fontSize: 18,
    fontWeight: theme.typography.fontWeights.bold,
    fontFamily: theme.typography.fontFamily,
  },
  emptyStateBody: {
    marginTop: 6,
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
    fontFamily: theme.typography.fontFamily,
  },
  recipeTileImage: {
    width: '100%',
    height: 180,
  },
  recipeTileBody: {
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  recipeTileTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recipeTileCategory: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: theme.typography.fontWeights.bold,
    fontFamily: theme.typography.fontFamily,
  },
  recipeTileRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  recipeTileRatingText: {
    fontSize: 13,
    fontWeight: theme.typography.fontWeights.semibold,
    fontFamily: theme.typography.fontFamily,
  },
  recipeTileTitle: {
    fontSize: 20,
    lineHeight: 24,
    fontWeight: theme.typography.fontWeights.bold,
    fontFamily: theme.typography.fontFamily,
  },
  recipeTileDescription: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: theme.typography.fontFamily,
  },
  recipeTileFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
  },
  recipeTileMeta: {
    fontSize: 13,
    fontWeight: theme.typography.fontWeights.semibold,
    fontFamily: theme.typography.fontFamily,
  },
});
