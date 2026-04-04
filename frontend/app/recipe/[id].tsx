import React, { useMemo } from 'react';
import { Image, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Stack, router, useLocalSearchParams } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { theme } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { recipes } from '@/lib/recipes';

export default function RecipeDetailScreen() {
  const { colors } = useTheme();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const insets = useSafeAreaInsets();

  const recipe = useMemo(() => recipes.find((item) => item.id === id), [id]);

  if (!recipe) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['bottom']}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.missingState}>
          <TouchableOpacity
            style={[styles.backButton, { borderColor: colors.border.light, backgroundColor: colors.background }]}
            onPress={() => router.back()}
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-back" size={20} color={colors.text.primary} />
          </TouchableOpacity>
          <ThemedText style={[styles.missingTitle, { color: colors.text.primary }]}>
            Recipe not found
          </ThemedText>
          <ThemedText style={[styles.missingBody, { color: colors.text.secondary }]}>
            That recipe page does not exist yet. Pick another recipe from the browse screen.
          </ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  const descriptionLength = recipe.description?.length ?? 0;
  const descriptionOffset = descriptionLength > 120 ? Math.min((descriptionLength - 120) / 8, 24) : 0;

  const ingredients = recipe.produce.map((item, index) => ({
    id: `${recipe.id}-ingredient-${index}`,
    amount: index === 0 ? '2 cups' : index === 1 ? '1 handful' : 'to taste',
    name: item,
  }));

  const steps = [
    `Wash and prep the ${recipe.produce.join(', ').toLowerCase()} so everything is ready before cooking.`,
    `Build the base of the dish and cook for about ${recipe.duration.toLowerCase()} while adjusting seasoning as needed.`,
    `Finish with a fresh garnish and plate immediately for the best texture and flavor.`,
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['bottom']}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <Image source={{ uri: recipe.imageUrl }} style={styles.heroImage} />
          <View style={styles.heroOverlay} />

          <View style={[styles.heroTopRow, { paddingTop: insets.top + theme.spacing.sm }]}>
            <TouchableOpacity
              style={[
                styles.backButton,
                {
                  backgroundColor: 'rgba(17, 24, 28, 0.45)',
                },
              ]}
              onPress={() => router.back()}
              activeOpacity={0.8}
            >
              <Ionicons name="arrow-back" size={20} color={theme.neutral.white} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.backButton,
                {
                  backgroundColor: theme.brand.primary,
                },
              ]}
              onPress={() => router.push('/recipe/new')}
              activeOpacity={0.85}
            >
              <Ionicons name="create-outline" size={18} color={theme.neutral.white} />
            </TouchableOpacity>
          </View>

          <View style={[styles.heroContent, { paddingTop: insets.top + 72 }]}>
            <View style={styles.tagRow}>
              <View style={styles.heroTag}>
                <ThemedText style={styles.heroTagText}>{recipe.category}</ThemedText>
              </View>
              <View style={[styles.heroTag, styles.heroTagAlt]}>
                <ThemedText style={styles.heroTagText}>{recipe.difficulty}</ThemedText>
              </View>
            </View>

            <ThemedText style={styles.heroTitle}>{recipe.title}</ThemedText>
            <ThemedText style={styles.heroDescription}>{recipe.description}</ThemedText>
          </View>
        </View>

        <View style={[styles.metaRow, { marginTop: -(theme.spacing.lg * 2) + descriptionOffset }]}>
          <View style={[styles.metaCard, { backgroundColor: colors.background, borderColor: colors.border.light }]}>
            <Ionicons name="time-outline" size={18} color={theme.brand.primary} />
            <ThemedText style={[styles.metaValue, { color: colors.text.primary }]}>{recipe.duration}</ThemedText>
            <ThemedText style={[styles.metaLabel, { color: colors.text.secondary }]}>Cook time</ThemedText>
          </View>
          <View style={[styles.metaCard, { backgroundColor: colors.background, borderColor: colors.border.light }]}>
            <Ionicons name="star" size={18} color={theme.brand.red} />
            <ThemedText style={[styles.metaValue, { color: colors.text.primary }]}>{recipe.rating}</ThemedText>
            <ThemedText style={[styles.metaLabel, { color: colors.text.secondary }]}>
              {recipe.ratingsCount.toLocaleString()} ratings
            </ThemedText>
          </View>
        </View>

        <View style={[styles.sectionCard, { backgroundColor: colors.background, borderColor: colors.border.light }]}>
          <ThemedText style={[styles.sectionTitle, { color: colors.text.primary }]}>Ingredients</ThemedText>
          <View style={styles.ingredientList}>
            {ingredients.map((ingredient) => (
              <View key={ingredient.id} style={styles.ingredientRow}>
                <View style={styles.ingredientDot} />
                <View style={styles.ingredientCopy}>
                  <ThemedText style={[styles.ingredientAmount, { color: theme.brand.tertiary }]}>
                    {ingredient.amount}
                  </ThemedText>
                  <ThemedText style={[styles.ingredientName, { color: colors.text.primary }]}>
                    {ingredient.name}
                  </ThemedText>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={[styles.sectionCard, { backgroundColor: colors.background, borderColor: colors.border.light }]}>
          <ThemedText style={[styles.sectionTitle, { color: colors.text.primary }]}>Directions</ThemedText>
          <View style={styles.stepsList}>
            {steps.map((step, index) => (
              <View key={`${recipe.id}-step-${index}`} style={styles.stepRow}>
                <View style={styles.stepBadge}>
                  <ThemedText style={styles.stepBadgeText}>{index + 1}</ThemedText>
                </View>
                <ThemedText style={[styles.stepText, { color: colors.text.secondary }]}>
                  {step}
                </ThemedText>
              </View>
            ))}
          </View>
        </View>

        <View style={[styles.sectionCard, { backgroundColor: '#FFF7E7', borderColor: '#F2D39B' }]}>
          <ThemedText style={[styles.sectionTitle, { color: '#6F4B00' }]}>Market note</ThemedText>
          <ThemedText style={[styles.marketNote, { color: '#7A5A18' }]}>
            This recipe works best when you buy the produce ripe and in season. Start with {recipe.produce[0]}
            {recipe.produce[1] ? ` and ${recipe.produce[1]}` : ''} from your local farm list.
          </ThemedText>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: theme.spacing['4xl'],
  },
  hero: {
    minHeight: 420,
    justifyContent: 'space-between',
  },
  heroImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(17, 24, 28, 0.32)',
  },
  heroTopRow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: theme.spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 2,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: 'transparent',
  },
  heroContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
    gap: theme.spacing.md,
  },
  tagRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  heroTag: {
    backgroundColor: '#F4EEC7',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: theme.borderRadius.full,
  },
  heroTagAlt: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  heroTagText: {
    color: theme.brand.tertiary,
    fontSize: 12,
    fontWeight: theme.typography.fontWeights.bold,
    fontFamily: theme.typography.fontFamily,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  heroTitle: {
    color: theme.neutral.white,
    fontSize: 34,
    lineHeight: 40,
    fontWeight: theme.typography.fontWeights.bold,
    fontFamily: theme.typography.fontFamily,
  },
  heroDescription: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 15,
    lineHeight: 22,
    fontFamily: theme.typography.fontFamily,
    maxWidth: '88%',
  },
  metaRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
  },
  metaCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 22,
    padding: theme.spacing.md,
    ...theme.shadows.sm,
  },
  metaValue: {
    marginTop: theme.spacing.sm,
    fontSize: 20,
    fontWeight: theme.typography.fontWeights.bold,
    fontFamily: theme.typography.fontFamily,
  },
  metaLabel: {
    marginTop: 4,
    fontSize: 13,
    fontFamily: theme.typography.fontFamily,
  },
  sectionCard: {
    marginTop: theme.spacing.lg,
    marginHorizontal: theme.spacing.lg,
    borderWidth: 1,
    borderRadius: 24,
    padding: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSizes.h2,
    fontWeight: theme.typography.fontWeights.bold,
    fontFamily: theme.typography.fontFamily,
  },
  ingredientList: {
    marginTop: theme.spacing.md,
    gap: theme.spacing.md,
  },
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  ingredientDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.brand.primary,
  },
  ingredientCopy: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    flexWrap: 'wrap',
    flex: 1,
  },
  ingredientAmount: {
    fontSize: 14,
    fontWeight: theme.typography.fontWeights.bold,
    fontFamily: theme.typography.fontFamily,
  },
  ingredientName: {
    fontSize: 16,
    fontWeight: theme.typography.fontWeights.medium,
    fontFamily: theme.typography.fontFamily,
  },
  stepsList: {
    marginTop: theme.spacing.md,
    gap: theme.spacing.md,
  },
  stepRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    alignItems: 'flex-start',
  },
  stepBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.brand.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  stepBadgeText: {
    color: theme.neutral.white,
    fontSize: 14,
    fontWeight: theme.typography.fontWeights.bold,
    fontFamily: theme.typography.fontFamily,
  },
  stepText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    fontFamily: theme.typography.fontFamily,
  },
  marketNote: {
    marginTop: theme.spacing.sm,
    fontSize: 15,
    lineHeight: 22,
    fontFamily: theme.typography.fontFamily,
  },
  missingState: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  missingTitle: {
    marginTop: theme.spacing.lg,
    fontSize: 28,
    fontWeight: theme.typography.fontWeights.bold,
    fontFamily: theme.typography.fontFamily,
  },
  missingBody: {
    marginTop: theme.spacing.sm,
    textAlign: 'center',
    fontSize: 15,
    lineHeight: 22,
    fontFamily: theme.typography.fontFamily,
  },
});
