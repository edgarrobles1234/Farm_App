// (tabs)/create.tsx
import { StyleSheet } from 'react-native';
import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/useTheme';

export default function CreateScreen() {
  const { colors } = useTheme();
  const { type } = useLocalSearchParams<{ type?: string }>();
  const selectedType =
    type === 'recipe'
      ? 'Recipe'
      : type === 'grocery'
        ? 'Grocery List'
        : 'Choose what you want to create';

  return (
    <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
      <ThemedText type="title" style={{ color: colors.text.primary }}>
        Create
      </ThemedText>
      <ThemedText style={[styles.subtitle, { color: colors.text.secondary }]}>
        {selectedType}
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  subtitle: {
    marginTop: 8,
  },
});
