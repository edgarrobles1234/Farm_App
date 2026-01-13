// (tabs)/search.tsx
import { StyleSheet, View } from 'react-native';
import React from 'react';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function GroceryListScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Grocery List</ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
});