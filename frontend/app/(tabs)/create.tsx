// (tabs)/create.tsx
import { StyleSheet, View } from 'react-native';
import React from 'react';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function CreateScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Create</ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
});